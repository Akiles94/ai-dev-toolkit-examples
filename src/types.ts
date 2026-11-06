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
  discountCode?: string;
}

export interface CartTotals {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
}
