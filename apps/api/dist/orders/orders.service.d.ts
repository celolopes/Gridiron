import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private readonly prisma;
    private readonly events;
    constructor(prisma: PrismaService, events: EventsService);
    createOrder(tenantId: string, userId: string, data: CreateOrderDto): Promise<any>;
    listAdminOrders(tenantId: string): Promise<any>;
    updateOrderLink(tenantId: string, orderId: string, paymentLinkManualUrl: string): Promise<any>;
    markAsPaid(tenantId: string, orderId: string): Promise<any>;
}
