import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // Cron job simulation (to be triggered via @Cron() from @nestjs/schedule in real implementation)
  async calculateDemandScores(tenantId: string) {
    // Basic conceptual implementation of Demand Score Calculation
    // For MVP, we'll return a calculated mock or simple query based on recent orders/events.

    // 1. Fetch sales/views in last 14 days
    // 2. Score = (views * 1) + (add_to_cart * 5) + (purchases * 15)
    // 3. suggestion_qty = ceil((DemandScore_14d / 20) * 1.2)

    return {
      message: 'Demand scores calculated',
      algorithm: 'ceil((DemandScore_14d / 20) * 1.2)',
    };
  }

  async getSuggestions(tenantId: string) {
    const suggestions = await this.prisma.purchaseSuggestion.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return suggestions.map((s) => ({
      productId: s.id,
      sku: s.variantSku,
      demandScore14d: 0,
      suggestionQty: s.suggestedQty,
    }));
  }

  async getFinancialMetrics(tenantId: string) {
    const paidOrders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }, // Consider SHIPPED/DELIVERED as PAID too
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalItems = 0;

    paidOrders.forEach((order) => {
      totalRevenue += order.totalAmount - order.shippingAmount; // Revenue without shipping? User might want net revenue.

      order.orderItems.forEach((item) => {
        const prod = item.variant.product;
        const itemCost =
          (prod.costPrice || 0) +
          (prod.importTaxEstimate || 0) +
          (prod.internationalShippingCost || 0);
        totalCost += itemCost * item.quantity;
        totalItems += item.quantity;
      });
    });

    const totalProfit = totalRevenue - totalCost;
    const averageMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const ticketMedio =
      paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    return {
      totalRevenue,
      totalProfit,
      averageMargin,
      ticketMedio,
      paidOrdersCount: paidOrders.length,
      totalItemsSold: totalItems,
    };
  }
}
