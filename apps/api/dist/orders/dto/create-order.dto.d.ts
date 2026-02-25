declare class OrderItemDto {
    variantId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressCity?: string;
    addressState?: string;
    addressZipCode?: string;
    items: OrderItemDto[];
    paymentMethodPreference: string;
}
export {};
