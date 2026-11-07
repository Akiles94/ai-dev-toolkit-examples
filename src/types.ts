export interface Product {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  category: "books" | "games" | "music";
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  stock: number;
  at: string;
}

export interface LowStockEntry {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  outOfStock: boolean;
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
