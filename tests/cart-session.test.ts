import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { cartPanelView } from "../public/shop-view.js";
import { addToCart, openCart, removeFromCart } from "../public/cart-session.js";
import { server } from "../src/server.ts";

const CART_KEY = "shop.cartId";

let base = "";

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
});

// The page's environment, with the browser's pieces replaced: relative URLs go to the test
// server, and storage is a Map instead of localStorage.
function browser(stored?: string) {
  const values = new Map<string, string>();
  if (stored) values.set(CART_KEY, stored);
  return {
    storage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => void values.set(key, value),
    },
    fetch: (path: string, init?: RequestInit) => fetch(`${base}${path}`, init),
  };
}

test("R11: with no kept cart, the page starts a new empty cart and keeps it", async () => {
  const env = browser();
  const cart = await openCart(env);
  assert.deepEqual(cart.items, []);
  assert.equal(cart.totalCents, 0);
  assert.equal(env.storage.getItem(CART_KEY), cart.id);
});

test("R5: adding puts 1 unit in the cart, and adding again raises the same line to 2", async () => {
  const env = browser();
  const { id } = await openCart(env);
  const first = await addToCart(env, id, "p-3");
  assert.deepEqual(first.items, [{ productId: "p-3", qty: 1 }]);
  const second = await addToCart(env, id, "p-3");
  assert.deepEqual(second.items, [{ productId: "p-3", qty: 2 }]);
});

test("R6: at the stock limit the answer is 'No more in stock' and the cart keeps Refactoring × 4", async () => {
  const env = browser();
  const { id } = await openCart(env);
  for (let i = 0; i < 4; i++) await addToCart(env, id, "p-2");
  const refused = await addToCart(env, id, "p-2");
  assert.deepEqual(refused, { error: "No more in stock" });
  const again = await openCart(env);
  assert.deepEqual(again.items, [{ productId: "p-2", qty: 4 }]);
});

test("R8: Refactoring then Tetris Effect reaches $74.98 with free shipping", async () => {
  const env = browser();
  const { id } = await openCart(env);
  await addToCart(env, id, "p-2");
  const cart = await addToCart(env, id, "p-3");
  assert.equal(cart.subtotalCents, 7498);
  assert.equal(cart.shippingCents, 0);
  assert.equal(cart.totalCents, 7498);
});

test("R9: removing a line takes the whole line out, and the panel shows $39.99, $4.99, $44.98", async () => {
  const env = browser();
  const { id } = await openCart(env);
  await addToCart(env, id, "p-1");
  await addToCart(env, id, "p-3");
  await addToCart(env, id, "p-3");
  const cart = await removeFromCart(env, id, "p-3");
  assert.deepEqual(cart.items, [{ productId: "p-1", qty: 1 }]);

  const products = await (await env.fetch("/products")).json();
  const view = cartPanelView(cart, products);
  assert.deepEqual([view.subtotal, view.shipping, view.total], ["$39.99", "$4.99", "$44.98"]);
});

test("R9: removing the last line leaves an empty cart, not an error", async () => {
  const env = browser();
  const { id } = await openCart(env);
  await addToCart(env, id, "p-3");
  const cart = await removeFromCart(env, id, "p-3");
  assert.deepEqual(cart.items, []);
  assert.equal(cart.totalCents, 0);
});

test("R10: opening the page again with the same storage shows the same cart and lines", async () => {
  const env = browser();
  const { id } = await openCart(env);
  await addToCart(env, id, "p-3");
  await addToCart(env, id, "p-3");

  const reloaded = await openCart(env);
  assert.equal(reloaded.id, id);
  assert.deepEqual(reloaded.items, [{ productId: "p-3", qty: 2 }]);
});

test("R11: a kept cart the shop does not know gives a new empty cart, with no error", async () => {
  const env = browser("cart-from-before-the-restart");
  const cart = await openCart(env);
  assert.notEqual(cart.id, "cart-from-before-the-restart");
  assert.deepEqual(cart.items, []);
  assert.equal(env.storage.getItem(CART_KEY), cart.id);
});

test("R11: adding to a cart the shop forgot recovers with a new cart holding the item", async () => {
  const env = browser("cart-from-before-the-restart");
  const cart = await addToCart(env, "cart-from-before-the-restart", "p-3");
  assert.notEqual(cart.id, "cart-from-before-the-restart");
  assert.deepEqual(cart.items, [{ productId: "p-3", qty: 1 }]);
  assert.equal(env.storage.getItem(CART_KEY), cart.id);
});

test("R11: removing from a cart the shop forgot recovers with a new empty cart", async () => {
  const env = browser("cart-from-before-the-restart");
  const cart = await removeFromCart(env, "cart-from-before-the-restart", "p-3");
  assert.notEqual(cart.id, "cart-from-before-the-restart");
  assert.deepEqual(cart.items, []);
  assert.equal(env.storage.getItem(CART_KEY), cart.id);
});

test("R12: the cart's amounts are the ones GET /carts/:id returns", async () => {
  const env = browser();
  const { id } = await openCart(env);
  const added = await addToCart(env, id, "p-3");
  const fromServer = await (await env.fetch(`/carts/${id}`)).json();
  assert.deepEqual(added, fromServer);
});
