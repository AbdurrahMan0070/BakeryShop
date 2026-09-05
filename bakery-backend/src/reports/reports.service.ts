import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, endOfDay, format, eachDayOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getReport(from: string, to: string, groupBy: 'day' | 'week' = 'day') {
    const fromDate = startOfDay(new Date(from));
    const toDate = endOfDay(new Date(to));

    const sales = await this.prisma.sale.findMany({
      where: { createdAt: { gte: fromDate, lte: toDate } },
      include: {
        items: { include: { product: { select: { purchasePrice: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalSales = sales.reduce((acc, s) => acc + Number(s.total), 0);
    const totalBills = sales.length;
    const totalProfit = sales.reduce((acc, s) => {
      const profit = s.items.reduce((a, i) => {
        const revenue = Number(i.unitPrice) * i.quantity;
        const cost = Number(i.product.purchasePrice) * i.quantity;
        return a + (revenue - cost);
      }, 0);
      return acc + profit;
    }, 0);

    // Best selling products
    const productMap = new Map<number, { productName: string; quantity: number; revenue: number }>();
    for (const sale of sales) {
      for (const item of sale.items) {
        const existing = productMap.get(item.productId) ?? {
          productName: (item as any).product?.name ?? String(item.productId),
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += Number(item.subtotal);
        productMap.set(item.productId, existing);
      }
    }

    // We need product names — do a fresh query
    const allItems = await this.prisma.saleItem.findMany({
      where: { sale: { createdAt: { gte: fromDate, lte: toDate } } },
      include: { product: { select: { id: true, name: true } } },
    });

    const productAgg = new Map<number, { productName: string; quantity: number; revenue: number }>();
    for (const item of allItems) {
      const existing = productAgg.get(item.productId) ?? {
        productName: item.product.name,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.subtotal);
      productAgg.set(item.productId, existing);
    }

    const bestSelling = Array.from(productAgg.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Sales chart data
    let salesData: { label: string; sales: number; profit: number }[] = [];

    if (groupBy === 'day') {
      const days = eachDayOfInterval({ start: fromDate, end: toDate });
      for (const day of days) {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        const daySales = sales.filter(
          (s) => new Date(s.createdAt) >= dayStart && new Date(s.createdAt) <= dayEnd,
        );
        const dayTotal = daySales.reduce((a, s) => a + Number(s.total), 0);
        const dayProfit = daySales.reduce((acc, s) => {
          return acc + s.items.reduce((a, i) => {
            return a + (Number(i.unitPrice) - Number(i.product.purchasePrice)) * i.quantity;
          }, 0);
        }, 0);
        salesData.push({ label: format(day, 'dd MMM'), sales: dayTotal, profit: dayProfit });
      }
    } else {
      const weeks = eachWeekOfInterval({ start: fromDate, end: toDate });
      for (const week of weeks) {
        const wStart = startOfWeek(week);
        const wEnd = endOfWeek(week);
        const weekSales = sales.filter(
          (s) => new Date(s.createdAt) >= wStart && new Date(s.createdAt) <= wEnd,
        );
        const weekTotal = weekSales.reduce((a, s) => a + Number(s.total), 0);
        const weekProfit = weekSales.reduce((acc, s) => {
          return acc + s.items.reduce((a, i) => {
            return a + (Number(i.unitPrice) - Number(i.product.purchasePrice)) * i.quantity;
          }, 0);
        }, 0);
        salesData.push({
          label: `${format(wStart, 'dd MMM')} - ${format(wEnd, 'dd MMM')}`,
          sales: weekTotal,
          profit: weekProfit,
        });
      }
    }

    return { totalSales, totalProfit, totalBills, bestSelling, salesData };
  }
}
