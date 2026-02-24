import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SimpleRateLimitGuard } from '../common/guards/rate-limit.guard';

@Controller('events')
export class GlobalEventsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @UseGuards(SimpleRateLimitGuard)
  async trackEvent(@Body() body: any) {
    // Basic tracking implementation for Phase 1
    // We don't necessarily need tenantId here if we track by sessionId/productId
    // but the Event model REQUIRES tenantId.

    let tenantId = body.tenantId;

    if (!tenantId && body.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: body.productId },
        select: { tenantId: true },
      });
      tenantId = product?.tenantId;
    }

    if (!tenantId) {
      return { success: false, message: 'TenantId could not be determined' };
    }

    const event = await this.prisma.event.create({
      data: {
        tenantId,
        eventType: body.type || body.eventType,
        metadata: {
          sessionId: body.sessionId,
          productId: body.productId,
          variantId: body.variantId,
        },
      },
    });

    console.log(
      `[Event Tracked] type=${event.eventType} sessionId=${body.sessionId} tenantId=${tenantId}`,
    );
    return event;
  }
}
