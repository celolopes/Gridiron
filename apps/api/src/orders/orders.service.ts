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

  async createOrder(tenantId: string, userId: string, data: CreateOrderDto) {
    try {
      const totalAmount = 0; // Simplified for MVP/Smoke test

      // Logic would go here to calculate totalAmount from items...

      const order = await this.prisma.order.create({
        // ... (data same as original)
        data: {
          tenantId,
          userId,
          customerEmail: 'customer@example.com',
          customerName: 'Customer Name',
          status: OrderStatus.REQUESTED_PAYMENT,
          totalAmount,
          paymentMethodPreference: data.paymentMethodPreference,
          orderItems: {
            create: data.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: 0, // Simplified
              fulfillmentType: FulfillmentType.ON_DEMAND,
            })),
          },
        },
        include: { orderItems: true },
      });

      console.log(
        `[Order Created] orderId=${order.id} tenantId=${tenantId} status=${order.status}`,
      );
      return order;
    } catch (error) {
      throw error;
    }
  }

  async listAdminOrders(tenantId: string) {
    return this.prisma.order.findMany({
      where: { tenantId },
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
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
      console.log(
        `[Order Updated] orderId=${order.id} tenantId=${tenantId} transition=REQUESTED_PAYMENT->LINK_SENT`,
      );
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
      console.log(
        `[Order Updated] orderId=${order.id} tenantId=${tenantId} transition=->PAID`,
      );

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
