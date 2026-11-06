import assert from "node:assert/strict";
import { test } from "node:test";
import { addItem, clearCart, createCart, removeItem, totals } from "../src/cart.ts";

test("adds items and merges the same product", () => {
  const cart = createCart();
  addItem(cart.id, "p-3", 1);
  addItem(cart.id, "p-3", 2);
  assert.deepEqual(cart.items, [{ productId: "p-3", qty: 3 }]);
});

test("refuses more units than in stock, counting what is already in the cart", () => {
  const cart = createCart();
  assert.notEqual(addItem(cart.id, "p-2", 3), "OUT_OF_STOCK");
  assert.equal(addItem(cart.id, "p-2", 2), "OUT_OF_STOCK");
});

test("charges shipping under $50 and not from $50", () => {
  const cart = createCart();
  addItem(cart.id, "p-3", 1);
  assert.deepEqual(totals(cart), { subtotalCents: 2999, shippingCents: 499, totalCents: 3498 });
  addItem(cart.id, "p-1", 1);
  assert.equal(totals(cart).shippingCents, 0);
});

test("an empty cart costs nothing", () => {
  assert.equal(totals(createCart()).totalCents, 0);
});

test("removes an item", () => {
  const cart = createCart();
  addItem(cart.id, "p-1", 1);
  removeItem(cart.id, "p-1");
  assert.deepEqual(cart.items, []);
});

test("clears a cart", () => {
  const cart = createCart();
  addItem(cart.id, "p-1", 1);
  addItem(cart.id, "p-3", 2);
  assert.deepEqual(clearCart(cart.id)?.items, []);
  assert.equal(clearCart("cart-nope"), undefined);
});
