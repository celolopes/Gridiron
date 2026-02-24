import { EventsService, EventType } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    trackEvent(tenantId: string, body: {
        userId?: string;
        eventType: EventType;
        productId?: string;
        variantId?: string;
    }): Promise<any>;
}
