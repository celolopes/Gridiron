import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { TenantsService } from '../tenants/tenants.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private readonly prisma;
    private readonly events;
    private readonly tenantsService;
    constructor(prisma: PrismaService, events: EventsService, tenantsService: TenantsService);
    createOrder(tenantId: string, userId: string | null, data: CreateOrderDto): Promise<any>;
    listAdminOrders(tenantId: string): Promise<any>;
    forwardToSupplier(tenantId: string, orderId: string): Promise<any>;
    updateOrderLink(tenantId: string, orderId: string, paymentLinkManualUrl: string): Promise<any>;
    markAsPaid(tenantId: string, orderId: string): Promise<any>;
}
