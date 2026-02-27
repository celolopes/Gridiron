"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateDemandScores(tenantId) {
        return {
            message: 'Demand scores calculated',
            algorithm: 'ceil((DemandScore_14d / 20) * 1.2)',
        };
    }
    async resolveTenantId(idOrSlug) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(idOrSlug)) {
            return idOrSlug;
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: idOrSlug },
        });
        if (!tenant) {
            throw new Error(`Tenant with slug or ID ${idOrSlug} not found`);
        }
        return tenant.id;
    }
    async getSuggestions(idOrSlug) {
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
    async getFinancialMetrics(idOrSlug) {
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
        const awaitingPaymentCount = await this.prisma.order.count({
            where: {
                tenantId,
                status: { in: ['REQUESTED_PAYMENT', 'LINK_SENT'] },
            },
        });
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
        const currentYear = new Date().getFullYear();
        const revenueByMonth = new Array(12).fill(0);
        paidOrders.forEach((order) => {
            const orderRev = order.totalAmount - order.shippingAmount;
            totalRevenue += orderRev;
            if (order.createdAt.getFullYear() === currentYear) {
                revenueByMonth[order.createdAt.getMonth()] += orderRev;
            }
            order.orderItems.forEach((item) => {
                const prod = item.variant.product;
                const itemCost = (prod.costPrice || 0) +
                    (prod.importTaxEstimate || 0) +
                    (prod.internationalShippingCost || 0);
                totalCost += itemCost * item.quantity;
                totalItems += item.quantity;
            });
        });
        const totalProfit = totalRevenue - totalCost;
        const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        const ticketMedio = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
        return {
            totalRevenue,
            totalProfit,
            averageMargin,
            ticketMedio,
            paidOrdersCount: paidOrders.length,
            awaitingPaymentCount,
            ordersTodayCount,
            totalItemsSold: totalItems,
            revenueByMonth,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map