import { LOW_STOCK_THRESHOLD } from "./alerts.ts";
import { listProducts } from "./products.ts";
import type { LowStockEntry } from "./types.ts";

export function lowStockProducts(): LowStockEntry[] {
  return listProducts()
    .filter((p) => p.stock < LOW_STOCK_THRESHOLD) // strictly below: 5 is not low (R1); 0 is (R2)
    .map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      threshold: LOW_STOCK_THRESHOLD,
      outOfStock: p.stock === 0,
    }))
    .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));
}
