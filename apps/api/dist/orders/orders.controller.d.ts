import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(tenantId: string, body: {
        userId: string;
        items: {
            variantId: string;
            quantity: number;
        }[];
        paymentMethodPreference: string;
    }): Promise<any>;
    listAdminOrders(tenantId: string): Promise<any>;
    setPaymentLink(tenantId: string, orderId: string, url: string): Promise<any>;
    markAsPaid(tenantId: string, orderId: string): Promise<any>;
}
