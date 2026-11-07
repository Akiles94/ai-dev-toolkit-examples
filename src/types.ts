export interface Product {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  category: "books" | "games" | "music";
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  createdAt: string;
}

export interface CartTotals {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}

export type OrderStatus = "paid" | "shipped" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  /** Unit price at checkout time; later catalog changes do not affect the order. */
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
}

export interface StatusChange {
  status: OrderStatus;
  at: string;
}

export interface Order extends CartTotals {
  id: string;
  cartId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentId: string;
  refundId?: string;
  history: StatusChange[];
  createdAt: string;
}
