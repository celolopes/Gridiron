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
    async getSuggestions(tenantId) {
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
    async getFinancialMetrics(tenantId) {
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
        let totalRevenue = 0;
        let totalCost = 0;
        let totalItems = 0;
        paidOrders.forEach((order) => {
            totalRevenue += order.totalAmount - order.shippingAmount;
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
            totalItemsSold: totalItems,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map