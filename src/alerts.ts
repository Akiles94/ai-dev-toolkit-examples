import type { LowStockAlert, Product } from "./types.ts";
import { now } from "./utils.ts";

export const LOW_STOCK_THRESHOLD = 5;

const alerts: LowStockAlert[] = [];

export function recordLowStockAlert(product: Pick<Product, "id" | "name">, stock: number): void {
  alerts.push({ productId: product.id, productName: product.name, stock, at: now() });
}

export function listAlerts(): LowStockAlert[] {
  return [...alerts].reverse();
}

/** Test helper: empties the log. */
export function resetAlerts(): void {
  alerts.length = 0;
}
