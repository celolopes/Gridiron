import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('events')
export class GlobalEventsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
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

    return this.prisma.event.create({
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
  }
}
