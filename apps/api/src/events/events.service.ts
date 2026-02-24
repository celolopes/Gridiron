import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum EventType {
  PRODUCT_VIEW = 'PRODUCT_VIEW',
  ADD_TO_CART = 'ADD_TO_CART',
  WISHLIST = 'WISHLIST',
  BEGIN_CHECKOUT = 'BEGIN_CHECKOUT',
  PURCHASE = 'PURCHASE',
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(
    tenantId: string,
    data: {
      userId?: string;
      eventType: string;
      productId?: string;
      variantId?: string;
      metadata?: any;
    },
  ) {
    console.log(`[Event Tracking] ${tenantId}: ${data.eventType}`, data);
    return await this.prisma.event.create({
      data: {
        tenantId,
        userId: data.userId,
        eventType: data.eventType,
        metadata: data.metadata || {},
      },
    });
  }
}
