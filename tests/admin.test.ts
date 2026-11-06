import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, afterEach, before, beforeEach, test } from "node:test";
import { resetAlerts } from "../src/alerts.ts";
import { findProduct, reserveStock } from "../src/products.ts";
import { server } from "../src/server.ts";

let baseUrl = "";
const originalStock = new Map<string, number>();

function setStock(id: string, stock: number): void {
  const product = findProduct(id)!;
  if (!originalStock.has(id)) originalStock.set(id, product.stock);
  product.stock = stock;
}

async function get(path: string): Promise<{ status: number; body: any }> {
  const res = await fetch(`${baseUrl}${path}`);
  return { status: res.status, body: await res.json() };
}

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());
beforeEach(resetAlerts);
afterEach(() => {
  for (const [id, stock] of originalStock) findProduct(id)!.stock = stock;
  originalStock.clear();
});

test("R7: GET /admin/low-stock without credentials returns name, stock, threshold, outOfStock", async () => {
  const { status, body } = await get("/admin/low-stock");
  assert.equal(status, 200);
  assert.equal(body.threshold, 5);
  assert.deepEqual(body.products, [
    { id: "p-4", name: "Kind of Blue (vinyl)", stock: 0, threshold: 5, outOfStock: true },
    { id: "p-2", name: "Refactoring", stock: 4, threshold: 5, outOfStock: false },
  ]);
});

test("R8: the endpoint keeps that order (0, Alpha 3, Zeta 3)", async () => {
  setStock("p-1", 3); // The Pragmatic Programmer
  setStock("p-3", 3); // Tetris Effect
  const { body } = await get("/admin/low-stock");
  assert.deepEqual(
    body.products.map((p: { name: string; stock: number }) => [p.name, p.stock]),
    [
      ["Kind of Blue (vinyl)", 0],
      ["Tetris Effect", 3],
      ["The Pragmatic Programmer", 3],
      ["Refactoring", 4],
    ],
  );
});

test("R7: an empty low-stock list is 200 with no products, not an error", async () => {
  setStock("p-2", 10);
  setStock("p-4", 10);
  const { status, body } = await get("/admin/low-stock");
  assert.equal(status, 200);
  assert.deepEqual(body, { threshold: 5, products: [] });
});

test("R9: GET /admin/alerts returns them newest first, and [] when none", async () => {
  assert.deepEqual(await get("/admin/alerts"), { status: 200, body: [] });

  setStock("p-2", 6);
  setStock("p-1", 6);
  reserveStock("p-2", 2); // Refactoring first
  reserveStock("p-1", 2); // Pragmatic Programmer later
  const { status, body } = await get("/admin/alerts");
  assert.equal(status, 200);
  assert.deepEqual(
    body.map((a: { productName: string; stock: number }) => [a.productName, a.stock]),
    [
      ["The Pragmatic Programmer", 4],
      ["Refactoring", 4],
    ],
  );
  assert.ok(!Number.isNaN(Date.parse(body[0].at)));
});
