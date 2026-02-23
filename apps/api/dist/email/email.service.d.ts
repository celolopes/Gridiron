export declare class EmailService {
    private readonly logger;
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
    sendOrderRequestedPayment(userEmail: string, orderId: string): Promise<void>;
    sendOrderPaymentLink(userEmail: string, orderId: string, paymentLink: string): Promise<void>;
    sendOrderPaid(userEmail: string, orderId: string): Promise<void>;
}
