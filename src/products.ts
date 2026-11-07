import { LOW_STOCK_THRESHOLD, recordLowStockAlert } from "./alerts.ts";
import type { Product } from "./types.ts";

const catalog: Product[] = [
  { id: "p-1", name: "The Pragmatic Programmer", priceCents: 3999, stock: 12, category: "books" },
  { id: "p-2", name: "Refactoring", priceCents: 4499, stock: 4, category: "books" },
  { id: "p-3", name: "Tetris Effect", priceCents: 2999, stock: 30, category: "games" },
  { id: "p-4", name: "Kind of Blue (vinyl)", priceCents: 2499, stock: 0, category: "music" },
];

export function listProducts(category?: Product["category"]): Product[] {
  return category ? catalog.filter((p) => p.category === category) : [...catalog];
}

export function findProduct(id: string): Product | undefined {
  return catalog.find((p) => p.id === id);
}

/** Takes `qty` units out of stock. Returns false, changing nothing, when there are not enough. */
export function reserveStock(id: string, qty: number): boolean {
  const product = findProduct(id);
  if (!product || product.stock < qty) return false;
  const before = product.stock;
  product.stock -= qty;
  if (before >= LOW_STOCK_THRESHOLD && product.stock < LOW_STOCK_THRESHOLD) {
    recordLowStockAlert(product, product.stock);
  }
  return true;
}
