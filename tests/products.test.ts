import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { listAlerts, resetAlerts } from "../src/alerts.ts";
import { findProduct, listProducts, reserveStock } from "../src/products.ts";

const originalStock = new Map<string, number>();

function setStock(id: string, stock: number): void {
  const product = findProduct(id)!;
  if (!originalStock.has(id)) originalStock.set(id, product.stock);
  product.stock = stock;
}

const alertSummaries = () => listAlerts().map((a) => [a.productName, a.stock]);

beforeEach(resetAlerts);
afterEach(() => {
  for (const [id, stock] of originalStock) findProduct(id)!.stock = stock;
  originalStock.clear();
});

test("filters by category", () => {
  assert.deepEqual(
    listProducts("games").map((p) => p.id),
    ["p-3"],
  );
});

test("reserves stock only when there is enough", () => {
  setStock("p-3", 30);
  assert.equal(reserveStock("p-4", 1), false);
  assert.equal(reserveStock("p-3", 2), true);
});

test("R3: taking 6 to 4 records one alert; taking 30 to 4 in one decrease records one alert", () => {
  setStock("p-1", 6);
  assert.equal(reserveStock("p-1", 2), true);
  assert.deepEqual(alertSummaries(), [["The Pragmatic Programmer", 4]]);

  resetAlerts();
  setStock("p-3", 30);
  assert.equal(reserveStock("p-3", 26), true);
  assert.deepEqual(alertSummaries(), [["Tetris Effect", 4]]);
});

test("R3: dropping from exactly 5 to 4 records an alert; staying at 5 does not", () => {
  setStock("p-1", 6);
  reserveStock("p-1", 1);
  assert.equal(listAlerts().length, 0);
  reserveStock("p-1", 1);
  assert.equal(listAlerts().length, 1);
});

test("R4: further decreases while low, including reaching 0, record no new alert", () => {
  setStock("p-1", 6);
  reserveStock("p-1", 2); // 4: the one alert
  reserveStock("p-1", 1);
  reserveStock("p-1", 3); // 0
  assert.equal(findProduct("p-1")?.stock, 0);
  assert.equal(listAlerts().length, 1);
});

test("R4: a product already low at startup gets no alert when it decreases", () => {
  reserveStock("p-2", 1); // Refactoring 4 -> 3
  assert.equal(listAlerts().length, 0);
  setStock("p-2", 4);
});

test("R5: after restock to 10 (and to exactly 5) a new drop records a second alert", () => {
  for (const restockTo of [10, 5]) {
    resetAlerts();
    setStock("p-2", 6);
    reserveStock("p-2", 2); // 6 -> 4: first alert
    findProduct("p-2")!.stock = restockTo; // restock
    reserveStock("p-2", restockTo - 4); // back to 4: second alert
    assert.equal(listAlerts().length, 2);
  }
});

test("R6: not enough stock or unknown product changes nothing and records no alert", () => {
  setStock("p-3", 30);
  assert.equal(reserveStock("p-3", 40), false);
  assert.equal(findProduct("p-3")?.stock, 30);
  assert.equal(reserveStock("nope", 1), false);
  assert.deepEqual(listAlerts(), []);
});
