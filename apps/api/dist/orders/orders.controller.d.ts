import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(tenantId: string, body: CreateOrderDto): Promise<any>;
    listAdminOrders(tenantId: string): Promise<any>;
    setPaymentLink(tenantId: string, orderId: string, url: string): Promise<any>;
    markAsPaid(tenantId: string, orderId: string): Promise<any>;
    forwardToSupplier(tenantId: string, orderId: string): Promise<any>;
}
