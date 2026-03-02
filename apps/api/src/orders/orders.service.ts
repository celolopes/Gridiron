import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { TenantsService } from '../tenants/tenants.service';
import { EmailService } from '../email/email.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, FulfillmentType } from '@gridiron/database';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly tenantsService: TenantsService,
    private readonly email: EmailService,
  ) {}

  async createOrder(
    tenantId: string,
    userId: string | null,
    data: CreateOrderDto,
  ) {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) throw new NotFoundException('Tenant not found');

      // Enforce plan limits
      const canOrder = await this.tenantsService.canCreateOrder(tenantId);
      if (!canOrder) {
        const limits = await this.tenantsService.getPlanLimits(tenantId);
        throw new ForbiddenException(
          `Limite de pedidos mensais atingido (${limits.maxOrdersPerMonth}). Faça upgrade do seu plano para receber mais pedidos.`,
        );
      }

      // Fetch all variants with their products
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
          throw new BadRequestException(`Variant ${item.variantId} not found`);

        const price = variant.product.price;
        subtotal += price * item.quantity;

        return {
          variantId: item.variantId,
          quantity: item.quantity,
          price: price,
          fulfillmentType: variant.product.fulfillmentType,
        };
      });

      // Shipping logic
      let shippingAmount = tenant.shippingFlatRate;
      let shippingType: any = 'FIXED';

      if (
        tenant.freeShippingAbove !== null &&
        subtotal >= tenant.freeShippingAbove
      ) {
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
          status: OrderStatus.REQUESTED_PAYMENT,
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

      // Fire and forget email notification
      setTimeout(() => {
        const fakePixPayload = `00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865405${order.totalAmount.toFixed(2)}5802BR5913${tenantId.substring(0, 8)}6008BRASILIA62070503***63041234`;
        this.email
          .sendEmail(
            order.customerEmail,
            `Seu Pedido #${order.id.slice(0, 8)} - Pagamento Pendente`,
            `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2>Olá, ${order.customerName}!</h2>
            <p>Seu pedido na loja <strong>${tenant.name}</strong> foi recebido com sucesso e estamos aguardando o pagamento do PIX para processar seus itens.</p>
            <p><strong>Valor Total:</strong> R$ ${order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p>Copie o código PIX abaixo para pagar no aplicativo do seu banco:</p>
            <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0; font-family: monospace; word-break: break-all;">
              ${fakePixPayload}
            </div>
            <p>Se tiver qualquer dúvida, responda este e-mail.</p>
          </div>`,
          )
          .catch((e) => console.error('[Email Error]', e));
      }, 0);

      return order;
    } catch (error) {
      console.error('[CreateOrder Error]', error);
      throw error;
    }
  }

  async listAdminOrders(tenantId: string) {
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

  async forwardToSupplier(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, tenantId },
      include: { orderItems: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new BadRequestException(
        'Order must be PAID or PROCESSING to forward to supplier',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.FORWARD_TO_SUPPLIER },
    });
  }

  async updateOrderLink(
    tenantId: string,
    orderId: string,
    paymentLinkManualUrl: string,
  ) {
    try {
      const order = await this.prisma.order.update({
        where: { id: orderId, tenantId },
        data: {
          paymentLinkManualUrl,
          status: OrderStatus.LINK_SENT,
        },
      });
      return order;
    } catch (error) {
      throw error;
    }
  }

  async markAsPaid(tenantId: string, orderId: string) {
    try {
      const order = await this.prisma.order.update({
        where: { id: orderId, tenantId },
        data: {
          status: OrderStatus.PAID,
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
    } catch (error) {
      throw error;
    }
  }
}
