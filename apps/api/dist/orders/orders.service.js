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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_service_1 = require("../events/events.service");
const database_1 = require("@gridiron/database");
let OrdersService = class OrdersService {
    prisma;
    events;
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    async createOrder(tenantId, userId, data) {
        try {
            const totalAmount = 0;
            const order = await this.prisma.order.create({
                data: {
                    tenantId,
                    userId,
                    customerEmail: 'customer@example.com',
                    customerName: 'Customer Name',
                    status: database_1.OrderStatus.REQUESTED_PAYMENT,
                    totalAmount,
                    paymentMethodPreference: data.paymentMethodPreference,
                    orderItems: {
                        create: data.items.map((item) => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            price: 0,
                            fulfillmentType: database_1.FulfillmentType.ON_DEMAND,
                        })),
                    },
                },
                include: { orderItems: true },
            });
            console.log(`[Order Created] orderId=${order.id} tenantId=${tenantId} status=${order.status}`);
            return order;
        }
        catch (error) {
            throw error;
        }
    }
    async listAdminOrders(tenantId) {
        return this.prisma.order.findMany({
            where: { tenantId },
            include: { orderItems: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateOrderLink(tenantId, orderId, paymentLinkManualUrl) {
        try {
            const order = await this.prisma.order.update({
                where: { id: orderId, tenantId },
                data: {
                    paymentLinkManualUrl,
                    status: database_1.OrderStatus.LINK_SENT,
                },
            });
            console.log(`[Order Updated] orderId=${order.id} tenantId=${tenantId} transition=REQUESTED_PAYMENT->LINK_SENT`);
            return order;
        }
        catch (error) {
            throw error;
        }
    }
    async markAsPaid(tenantId, orderId) {
        try {
            const order = await this.prisma.order.update({
                where: { id: orderId, tenantId },
                data: {
                    status: database_1.OrderStatus.PAID,
                    paidAt: new Date(),
                },
            });
            console.log(`[Order Updated] orderId=${order.id} tenantId=${tenantId} transition=->PAID`);
            await this.events.trackEvent(tenantId, {
                userId: order.userId,
                eventType: 'PURCHASE',
                metadata: {
                    orderId: order.id,
                    totalAmount: order.totalAmount,
                },
            });
            return order;
        }
        catch (error) {
            throw error;
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map