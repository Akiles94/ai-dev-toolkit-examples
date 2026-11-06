import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { lowStockProducts } from "../src/low-stock.ts";
import { findProduct } from "../src/products.ts";

const originalStock = new Map<string, number>();

function setStock(id: string, stock: number): void {
  const product = findProduct(id)!;
  if (!originalStock.has(id)) originalStock.set(id, product.stock);
  product.stock = stock;
}

afterEach(() => {
  for (const [id, stock] of originalStock) findProduct(id)!.stock = stock;
  originalStock.clear();
});

test("R1: lists only products strictly below 5 (4 listed; 5, 12, 30 not)", () => {
  assert.deepEqual(
    lowStockProducts().map((e) => [e.name, e.stock, e.threshold]),
    [
      ["Kind of Blue (vinyl)", 0, 5],
      ["Refactoring", 4, 5],
    ],
  );
  setStock("p-2", 5);
  assert.equal(lowStockProducts().some((e) => e.name === "Refactoring"), false);
});

test("R1: an empty list when nothing is low", () => {
  setStock("p-2", 10);
  setStock("p-4", 10);
  assert.deepEqual(lowStockProducts(), []);
});

test("R2: a product with stock 0 is listed and marked out of stock", () => {
  const entries = lowStockProducts();
  assert.equal(entries.find((e) => e.name === "Kind of Blue (vinyl)")?.outOfStock, true);
  assert.equal(entries.find((e) => e.name === "Refactoring")?.outOfStock, false);
});

test("R8: orders by lowest stock, ties by name (0, Alpha 3, Zeta 3)", () => {
  setStock("p-1", 3); // The Pragmatic Programmer
  setStock("p-3", 3); // Tetris Effect
  setStock("p-2", 5); // Refactoring leaves the list
  assert.deepEqual(
    lowStockProducts().map((e) => [e.name, e.stock]),
    [
      ["Kind of Blue (vinyl)", 0],
      ["Tetris Effect", 3],
      ["The Pragmatic Programmer", 3],
    ],
  );
});

test("R10: a restocked product no longer appears", () => {
  assert.ok(lowStockProducts().some((e) => e.name === "Refactoring"));
  setStock("p-2", 10);
  assert.equal(lowStockProducts().some((e) => e.name === "Refactoring"), false);
});
