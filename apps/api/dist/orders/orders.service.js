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
const tenants_service_1 = require("../tenants/tenants.service");
const email_service_1 = require("../email/email.service");
const database_1 = require("@gridiron/database");
let OrdersService = class OrdersService {
    prisma;
    events;
    tenantsService;
    email;
    constructor(prisma, events, tenantsService, email) {
        this.prisma = prisma;
        this.events = events;
        this.tenantsService = tenantsService;
        this.email = email;
    }
    async createOrder(tenantId, userId, data) {
        try {
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
            });
            if (!tenant)
                throw new common_1.NotFoundException('Tenant not found');
            const canOrder = await this.tenantsService.canCreateOrder(tenantId);
            if (!canOrder) {
                const limits = await this.tenantsService.getPlanLimits(tenantId);
                throw new common_1.ForbiddenException(`Limite de pedidos mensais atingido (${limits.maxOrdersPerMonth}). Faça upgrade do seu plano para receber mais pedidos.`);
            }
            const variants = await this.prisma.variant.findMany({
                where: {
                    id: { in: data.items.map((i) => i.variantId) },
                },
                include: { product: true },
            });
            let subtotal = 0;
            const orderItemsData = data.items.map((item) => {
                const variant = variants.find((v) => v.id === item.variantId);
                if (!variant)
                    throw new common_1.BadRequestException(`Variant ${item.variantId} not found`);
                const price = variant.product.price;
                subtotal += price * item.quantity;
                return {
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: price,
                    fulfillmentType: variant.product.fulfillmentType,
                };
            });
            let shippingAmount = tenant.shippingFlatRate;
            let shippingType = 'FIXED';
            if (tenant.freeShippingAbove !== null &&
                subtotal >= tenant.freeShippingAbove) {
                shippingAmount = 0;
                shippingType = 'FREE_OVER_AMOUNT';
            }
            const totalAmount = subtotal + shippingAmount;
            const order = await this.prisma.order.create({
                data: {
                    tenantId,
                    userId,
                    customerEmail: data.customerEmail,
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    addressStreet: data.addressStreet,
                    addressNumber: data.addressNumber,
                    addressCity: data.addressCity,
                    addressState: data.addressState,
                    addressZipCode: data.addressZipCode,
                    status: database_1.OrderStatus.REQUESTED_PAYMENT,
                    totalAmount,
                    shippingAmount,
                    shippingType,
                    paymentMethodPreference: data.paymentMethodPreference,
                    orderItems: {
                        create: orderItemsData,
                    },
                },
                include: {
                    orderItems: { include: { variant: { include: { product: true } } } },
                },
            });
            setTimeout(() => {
                const fakePixPayload = `00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865405${order.totalAmount.toFixed(2)}5802BR5913${tenantId.substring(0, 8)}6008BRASILIA62070503***63041234`;
                this.email
                    .sendEmail(order.customerEmail, `Seu Pedido #${order.id.slice(0, 8)} - Pagamento Pendente`, `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2>Olá, ${order.customerName}!</h2>
            <p>Seu pedido na loja <strong>${tenant.name}</strong> foi recebido com sucesso e estamos aguardando o pagamento do PIX para processar seus itens.</p>
            <p><strong>Valor Total:</strong> R$ ${order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p>Copie o código PIX abaixo para pagar no aplicativo do seu banco:</p>
            <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0; font-family: monospace; word-break: break-all;">
              ${fakePixPayload}
            </div>
            <p>Se tiver qualquer dúvida, responda este e-mail.</p>
          </div>`)
                    .catch((e) => console.error('[Email Error]', e));
            }, 0);
            return order;
        }
        catch (error) {
            console.error('[CreateOrder Error]', error);
            throw error;
        }
    }
    async listAdminOrders(tenantId) {
        return this.prisma.order.findMany({
            where: { tenantId },
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
            orderBy: { createdAt: 'desc' },
        });
    }
    async forwardToSupplier(tenantId, orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId, tenantId },
            include: { orderItems: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== database_1.OrderStatus.PAID &&
            order.status !== database_1.OrderStatus.PROCESSING) {
            throw new common_1.BadRequestException('Order must be PAID or PROCESSING to forward to supplier');
        }
        return this.prisma.order.update({
            where: { id: orderId },
            data: { status: database_1.OrderStatus.FORWARD_TO_SUPPLIER },
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
        events_service_1.EventsService,
        tenants_service_1.TenantsService,
        email_service_1.EmailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map