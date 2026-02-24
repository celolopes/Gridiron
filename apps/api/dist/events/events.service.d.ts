import { PrismaService } from '../prisma/prisma.service';
export declare enum EventType {
    PRODUCT_VIEW = "PRODUCT_VIEW",
    ADD_TO_CART = "ADD_TO_CART",
    WISHLIST = "WISHLIST",
    BEGIN_CHECKOUT = "BEGIN_CHECKOUT",
    PURCHASE = "PURCHASE"
}
export declare class EventsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    trackEvent(tenantId: string, data: {
        userId?: string;
        eventType: string;
        productId?: string;
        variantId?: string;
        metadata?: any;
    }): Promise<any>;
}
