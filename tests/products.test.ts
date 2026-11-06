import assert from "node:assert/strict";
import { test } from "node:test";
import { listProducts, reserveStock } from "../src/products.ts";

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
