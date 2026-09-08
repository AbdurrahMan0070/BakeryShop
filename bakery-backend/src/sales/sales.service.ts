import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SettingsService } from '../settings/settings.service';
import * as PDFDocumentLib from 'pdfkit';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PDFDocument = (PDFDocumentLib as any).default ?? PDFDocumentLib;
import { createWriteStream, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async create(dto: CreateSaleDto) {
    const saleItems: {
      productId: number;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    let total = 0;

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        );
      }

      const unitPrice = Number(product.sellingPrice);
      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      saleItems.push({ productId: item.productId, quantity: item.quantity, unitPrice, subtotal });
    }

    const sale = await this.prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          total,
          paymentMethod: dto.paymentMethod,
          customerPhone: dto.customerPhone ?? null,
          items: { create: saleItems },
        },
        include: {
          items: { include: { product: { include: { category: true } } } },
        },
      });

      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    try {
      const pdfUrl = await this.generateReceipt(sale);
      await this.prisma.sale.update({ where: { id: sale.id }, data: { pdfUrl } });
      return { ...sale, pdfUrl };
    } catch (_err) {
      return sale;
    }
  }

  async findAll(page = 1, limit = 20, from?: string, to?: string) {
    const skip = (page - 1) * limit;
    const where = {
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        include: { items: { include: { product: { include: { category: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { items: { include: { product: { include: { category: true } } } } },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  // ── PDF Receipt Generation ──────────────────────────────────────────────────

  async generateReceiptBuffer(sale: any): Promise<Buffer> {
    let storeName = 'Arzoo Bakery';
    let storeAddress = '';
    let storePhone = '';
    let receiptFooter = 'Thank you for visiting!';

    try {
      const settings = await this.prisma.settings.findFirst();
      if (settings) {
        storeName = settings.storeName || storeName;
        storeAddress = settings.storeAddress || '';
        storePhone = settings.phone || '';
        receiptFooter = settings.receiptFooter || receiptFooter;
      }
    } catch (_) {
      // use defaults
    }

    return new Promise<Buffer>((resolve, reject) => {
      const pageWidth = 227;
      const margin = 14;
      const CW = pageWidth - margin * 2;

      const itemsCount = sale.items?.length || 1;
      const pageHeight = Math.max(450, 280 + itemsCount * 26);

      const doc = new PDFDocument({
        size: [pageWidth, pageHeight],
        margin,
        autoFirstPage: true,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: Error) => reject(err));

      const accent = '#b45309'; // amber-700
      const dark   = '#111827'; // gray-900
      const muted  = '#6b7280'; // gray-500
      const light  = '#e5e7eb'; // gray-200

      const x = margin;

      const hr = (color = light, w = 0.5) => {
        doc.moveTo(x, doc.y).lineTo(x + CW, doc.y).strokeColor(color).lineWidth(w).stroke();
      };

      // Store Header
      doc.fontSize(15).font('Helvetica-Bold').fillColor(accent)
        .text(storeName, x, margin, { width: CW, align: 'center' });

      if (storeAddress) {
        doc.fontSize(7).font('Helvetica').fillColor(muted)
          .text(storeAddress, x, doc.y + 2, { width: CW, align: 'center' });
      }
      if (storePhone) {
        doc.fontSize(7).font('Helvetica').fillColor(muted)
          .text('Ph: ' + storePhone, x, doc.y + 1, { width: CW, align: 'center' });
      }

      doc.moveDown(0.4);
      hr('#9ca3af', 0.5);
      doc.y += 6;

      // Bill Meta
      const billNo = '#' + String(sale.id).padStart(4, '0');
      const saleDate = new Date(sale.createdAt || Date.now()).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

      const startMetaY = doc.y;
      doc.fontSize(8).font('Helvetica').fillColor(dark);
      doc.text('Bill No: ' + billNo, x, startMetaY, { width: CW * 0.48 });
      doc.text('Payment: ' + (sale.paymentMethod || 'CASH').toUpperCase(), x, doc.y, { width: CW * 0.48 });
      if (sale.customerPhone) {
        doc.text('Customer: ' + sale.customerPhone, x, doc.y, { width: CW * 0.48 });
      }
      const leftBottomY = doc.y;

      doc.text('Date: ' + saleDate, x + CW * 0.4, startMetaY, { width: CW * 0.6, align: 'right' });
      const rightBottomY = doc.y;

      // Ensure doc.y is strictly below both columns
      doc.y = Math.max(leftBottomY, rightBottomY) + 6;
      hr();
      doc.y += 6;

      // Column Positions
      const cItem  = x;
      const cQty   = x + Math.round(CW * 0.43);
      const cRate  = x + Math.round(CW * 0.55);
      const cAmt   = x + Math.round(CW * 0.77);
      const wItem  = Math.round(CW * 0.41);
      const wQty   = Math.round(CW * 0.10);
      const wRate  = Math.round(CW * 0.20);
      const wAmt   = Math.round(CW * 0.23);

      const hY = doc.y;
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(muted);
      doc.text('ITEM',   cItem, hY, { width: wItem });
      doc.text('QTY',    cQty,  hY, { width: wQty,  align: 'center' });
      doc.text('RATE',   cRate, hY, { width: wRate, align: 'right' });
      doc.text('AMT',    cAmt,  hY, { width: wAmt,  align: 'right' });

      doc.y = hY + 11;
      hr();
      doc.y += 5;

      doc.font('Helvetica').fillColor(dark);

      for (const item of (sale.items || [])) {
        const rY = doc.y;
        const itemName = item.product?.name || 'Bakery Item';

        doc.fontSize(8).text(itemName, cItem, rY, { width: wItem - 2, lineGap: 1 });
        const rowH = Math.max(doc.y - rY, 12);
        const mY = rY + (rowH - 9) / 2;

        doc.text(String(item.quantity), cQty, mY, { width: wQty, align: 'center' });
        doc.text('Rs.' + Number(item.unitPrice).toFixed(2), cRate, mY, { width: wRate, align: 'right' });
        doc.text('Rs.' + Number(item.subtotal).toFixed(2), cAmt, mY, { width: wAmt, align: 'right' });

        doc.y = rY + rowH + 2;
        doc.moveTo(x, doc.y).lineTo(x + CW, doc.y)
          .strokeColor('#f3f4f6').lineWidth(0.4).stroke();
        doc.y += 4;
      }

      doc.y += 4;
      hr(dark, 0.8);
      doc.y += 6;

      const tY = doc.y;
      doc.fontSize(11).font('Helvetica-Bold').fillColor(dark)
        .text('TOTAL', x, tY, { width: CW * 0.4 });
      doc.fillColor(accent)
        .text('Rs.' + Number(sale.total).toFixed(2), x, tY, { width: CW, align: 'right' });

      doc.y = tY + 14;
      const itemCount = (sale.items || []).reduce((s: number, i: any) => s + i.quantity, 0);
      doc.fontSize(7.5).font('Helvetica').fillColor(muted)
        .text('Items: ' + itemCount, x, doc.y, { width: CW, align: 'right' });

      doc.y += 12;
      hr('#e5e7eb', 0.5);
      doc.y += 8;

      doc.fontSize(7.5).font('Helvetica').fillColor(muted)
        .text(receiptFooter, x, doc.y, { width: CW, align: 'center' });

      doc.end();
    });
  }

  private async generateReceipt(sale: any): Promise<string> {
    try {
      const buffer = await this.generateReceiptBuffer(sale);
      const receiptsDir = process.env.VERCEL
        ? '/tmp/uploads/receipts'
        : join(process.cwd(), 'uploads', 'receipts');
      mkdirSync(receiptsDir, { recursive: true });

      const filename = `receipt-${sale.id}-${Date.now()}.pdf`;
      const filepath = join(receiptsDir, filename);
      writeFileSync(filepath, buffer);
      return `/uploads/receipts/${filename}`;
    } catch (_err) {
      return `/sales/${sale.id}/receipt`;
    }
  }
}
