import { Controller, Post, Param, Body } from '@nestjs/common';
import { EventsService, EventType } from './events.service';

@Controller('tenants/:tenantId/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async trackEvent(
    @Param('tenantId') tenantId: string,
    @Body()
    body: {
      userId?: string;
      eventType: EventType;
      productId?: string;
      variantId?: string;
    },
  ) {
    return this.eventsService.trackEvent(tenantId, body);
  }
}
