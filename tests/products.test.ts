import assert from "node:assert/strict";
import { test } from "node:test";
import { findProduct, listProducts, releaseStock, reserveStock } from "../src/products.ts";

test("filters by category", () => {
  assert.deepEqual(
    listProducts("games").map((p) => p.id),
    ["p-3"],
  );
});

test("reserves stock only when there is enough", () => {
  assert.equal(reserveStock("p-4", 1), false);
  assert.equal(reserveStock("p-3", 2), true);
});

test("releasing stock puts the units back", () => {
  const before = findProduct("p-1")!.stock;
  reserveStock("p-1", 3);
  releaseStock("p-1", 3);
  assert.equal(findProduct("p-1")!.stock, before);
});
