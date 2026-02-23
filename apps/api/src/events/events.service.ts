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
      eventType: EventType;
      productId?: string;
      variantId?: string;
    },
  ) {
    console.log(`[Event Tracking] ${tenantId}: ${data.eventType}`, data);
    // For MVP, we aren't storing raw events, just using them to trigger analytics
    // In Phase 1, we focus on the core flow.
    return { success: true };
  }
}
