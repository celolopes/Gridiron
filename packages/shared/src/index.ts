export const APP_NAME = "Gridiron";
export const VERSION = "0.0.1";

export enum OrderStatus {
  REQUESTED_PAYMENT = "REQUESTED_PAYMENT",
  LINK_SENT = "LINK_SENT",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
}

export enum FulfillmentType {
  STOCK = "STOCK",
  DROPSHIP = "DROPSHIP",
  ON_DEMAND = "ON_DEMAND",
}

export * from "./apiClient";
