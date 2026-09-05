import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // Today's sales and profit
    const todaySales = await this.prisma.sale.aggregate({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
      _sum: { total: true },
      _count: { id: true },
    });

    // Today's profit = sum(subtotal) - sum(purchasePrice * quantity) for today's items
    const todayItems = await this.prisma.saleItem.findMany({
      where: { sale: { createdAt: { gte: todayStart, lte: todayEnd } } },
      include: { product: { select: { purchasePrice: true } } },
    });

    const todayProfit = todayItems.reduce((acc, item) => {
      const revenue = Number(item.unitPrice) * item.quantity;
      const cost = Number(item.product.purchasePrice) * item.quantity;
      return acc + (revenue - cost);
    }, 0);

    // Product stats
    const totalProducts = await this.prisma.product.count();
    const lowStockCount = await this.prisma.product.count({
      where: { stock: { lte: 5 } },
    });

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringCount = await this.prisma.product.count({
      where: {
        expiryDate: { gte: new Date(), lte: sevenDaysFromNow },
      },
    });

    // Last 7 days chart data
    const dailySalesData: { date: string; sales: number; profit: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = startOfDay(subDays(new Date(), i));
      const dayEnd = endOfDay(subDays(new Date(), i));

      const daySales = await this.prisma.sale.aggregate({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
        _sum: { total: true },
      });

      const dayItems = await this.prisma.saleItem.findMany({
        where: { sale: { createdAt: { gte: dayStart, lte: dayEnd } } },
        include: { product: { select: { purchasePrice: true } } },
      });

      const dayProfit = dayItems.reduce((acc, item) => {
        const revenue = Number(item.unitPrice) * item.quantity;
        const cost = Number(item.product.purchasePrice) * item.quantity;
        return acc + (revenue - cost);
      }, 0);

      dailySalesData.push({
        date: format(dayStart, 'dd MMM'),
        sales: Number(daySales._sum.total ?? 0),
        profit: dayProfit,
      });
    }

    return {
      todaySales: Number(todaySales._sum.total ?? 0),
      todayProfit,
      todayBills: todaySales._count.id,
      totalProducts,
      lowStockCount,
      expiringCount,
      dailySalesData,
    };
  }
}
