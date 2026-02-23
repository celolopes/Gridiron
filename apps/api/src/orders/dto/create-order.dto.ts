export class CreateOrderDto {
  items: {
    variantId: string;
    quantity: number;
  }[];
  paymentMethodPreference: string;
}
