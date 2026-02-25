import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, FulfillmentType } from '@gridiron/database';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
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
