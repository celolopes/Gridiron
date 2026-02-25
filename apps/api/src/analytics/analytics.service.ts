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

  async resolveTenantId(idOrSlug: string): Promise<string> {
    // If it's a UUID, return it
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(idOrSlug)) {
      return idOrSlug;
    }

    // Otherwise, assume it's a slug and find the tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: idOrSlug },
    });

    if (!tenant) {
      throw new Error(`Tenant with slug or ID ${idOrSlug} not found`);
    }

    return tenant.id;
  }

  async getSuggestions(idOrSlug: string) {
    const tenantId = await this.resolveTenantId(idOrSlug);
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

  async getFinancialMetrics(idOrSlug: string) {
    const tenantId = await this.resolveTenantId(idOrSlug);
    const paidOrders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
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

    // Get "Awaiting Payment" count too
    const awaitingPaymentCount = await this.prisma.order.count({
      where: {
        tenantId,
        status: { in: ['REQUESTED_PAYMENT', 'LINK_SENT'] },
      },
    });

    // Get today's orders count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersTodayCount = await this.prisma.order.count({
      where: {
        tenantId,
        createdAt: { gte: today },
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalItems = 0;

    paidOrders.forEach((order) => {
      totalRevenue += order.totalAmount - order.shippingAmount;

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
      awaitingPaymentCount,
      ordersTodayCount,
      totalItemsSold: totalItems,
    };
  }
}
