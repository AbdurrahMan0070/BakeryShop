import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications() {
    const notifications: {
      id: number;
      type: 'LOW_STOCK' | 'EXPIRING';
      productId: number;
      productName: string;
      stock?: number;
      expiryDate?: string;
    }[] = [];

    // Low stock products (stock <= 5)
    const lowStockProducts = await this.prisma.product.findMany({
      where: { stock: { lte: 5 } },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: 'asc' },
    });

    lowStockProducts.forEach((p, idx) => {
      notifications.push({
        id: idx + 1,
        type: 'LOW_STOCK',
        productId: p.id,
        productName: p.name,
        stock: p.stock,
      });
    });

    // Products expiring within 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringProducts = await this.prisma.product.findMany({
      where: {
        expiryDate: { gte: new Date(), lte: sevenDaysFromNow },
      },
      select: { id: true, name: true, expiryDate: true },
      orderBy: { expiryDate: 'asc' },
    });

    expiringProducts.forEach((p, idx) => {
      notifications.push({
        id: lowStockProducts.length + idx + 1,
        type: 'EXPIRING',
        productId: p.id,
        productName: p.name,
        expiryDate: p.expiryDate?.toISOString(),
      });
    });

    return notifications;
  }
}
