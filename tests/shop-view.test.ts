import assert from "node:assert/strict";
import { test } from "node:test";
import { formatCents as serverFormatCents } from "../src/utils.ts";
import {
  canAdd,
  cartPanelView,
  filterByCategory,
  formatCents,
  messageAfter,
  stockLabel,
} from "../public/shop-view.js";

const products = [
  { id: "p-1", name: "The Pragmatic Programmer", priceCents: 3999, stock: 12, category: "books" },
  { id: "p-2", name: "Refactoring", priceCents: 4499, stock: 4, category: "books" },
  { id: "p-3", name: "Tetris Effect", priceCents: 2999, stock: 30, category: "games" },
  { id: "p-4", name: "Kind of Blue (vinyl)", priceCents: 2499, stock: 0, category: "music" },
];

function cart(items: { productId: string; qty: number }[], subtotalCents: number, shippingCents: number) {
  const totalCents = subtotalCents + shippingCents;
  return { id: "cart-1", items, subtotalCents, shippingCents, totalCents, total: formatCents(totalCents) };
}

test("R1: a price shows in dollars, as the server formats it", () => {
  assert.equal(formatCents(3999), "$39.99");
  for (const cents of [0, 5, 499, 2999, 5000, 9997, 123456]) {
    assert.equal(formatCents(cents), serverFormatCents(cents));
  }
});

test("R2: the filter starts on all, books shows 2, all shows 4 again", () => {
  assert.equal(filterByCategory(products, "all").length, 4);
  assert.deepEqual(
    filterByCategory(products, "books").map((p) => p.name),
    ["The Pragmatic Programmer", "Refactoring"],
  );
  assert.equal(filterByCategory(products, "games").length, 1);
  assert.equal(filterByCategory(products, "music").length, 1);
  assert.equal(filterByCategory(products, "all").length, 4);
});

test("R2: a category with only out-of-stock products still lists its cards", () => {
  const music = filterByCategory(products, "music");
  assert.equal(music.length, 1);
  assert.equal(stockLabel(music[0].stock), "Out of stock");
});

test("R3: 30 in stock says '30 in stock', 4 says 'Only 4 left', 5 says '5 in stock'", () => {
  assert.equal(stockLabel(30), "30 in stock");
  assert.equal(stockLabel(4), "Only 4 left");
  assert.equal(stockLabel(1), "Only 1 left");
  assert.equal(stockLabel(5), "5 in stock");
});

test("R4: 0 in stock says 'Out of stock' and cannot be added", () => {
  assert.equal(stockLabel(0), "Out of stock");
  assert.equal(canAdd(products[3]), false);
  assert.equal(canAdd(products[1]), true);
});

test("R7: the cart panel lists name, quantity and line price, then the amounts", () => {
  const view = cartPanelView(
    cart([{ productId: "p-1", qty: 1 }, { productId: "p-3", qty: 2 }], 9997, 0),
    products,
  );
  assert.deepEqual(view.lines, [
    { productId: "p-1", name: "The Pragmatic Programmer", qty: 1, linePrice: "$39.99" },
    { productId: "p-3", name: "Tetris Effect", qty: 2, linePrice: "$59.98" },
  ]);
  assert.equal(view.subtotal, "$99.97");
  assert.equal(view.shipping, "$0.00");
  assert.equal(view.total, "$99.97");
});

test("R8: $29.99 pays $4.99 shipping; $74.98, exactly $50.00 and an empty cart pay none", () => {
  const small = cartPanelView(cart([{ productId: "p-3", qty: 1 }], 2999, 499), products);
  assert.deepEqual([small.subtotal, small.shipping, small.total], ["$29.99", "$4.99", "$34.98"]);

  const big = cartPanelView(
    cart([{ productId: "p-2", qty: 1 }, { productId: "p-3", qty: 1 }], 7498, 0),
    products,
  );
  assert.deepEqual([big.subtotal, big.shipping, big.total], ["$74.98", "$0.00", "$74.98"]);

  const exact = cartPanelView(cart([], 5000, 0), products);
  assert.equal(exact.shipping, "$0.00");

  const empty = cartPanelView(cart([], 0, 0), products);
  assert.deepEqual(empty.lines, []);
  assert.deepEqual([empty.subtotal, empty.shipping, empty.total], ["$0.00", "$0.00", "$0.00"]);
});

test("R9: after removing a line the panel shows $39.99, $4.99 and $44.98", () => {
  const view = cartPanelView(cart([{ productId: "p-1", qty: 1 }], 3999, 499), products);
  assert.equal(view.lines.length, 1);
  assert.deepEqual([view.subtotal, view.shipping, view.total], ["$39.99", "$4.99", "$44.98"]);
});

test("R12: the panel amounts are the cart response's, not recomputed", () => {
  // Deliberately not the sum of the lines: the page must show what the server said.
  const response = { ...cart([{ productId: "p-3", qty: 1 }], 1234, 567), totalCents: 8888 };
  const view = cartPanelView(response, products);
  assert.deepEqual([view.subtotal, view.shipping, view.total], ["$12.34", "$5.67", "$88.88"]);
});

test("R7: a cart line whose product is not in the catalogue does not break the panel", () => {
  const view = cartPanelView(cart([{ productId: "p-99", qty: 2 }], 0, 0), products);
  assert.equal(view.lines.length, 1);
  assert.equal(view.lines[0].name, "p-99");
  assert.equal(view.lines[0].qty, 2);
});

test("R1: messageAfter clears «No more in stock» when the filter changes (walk 02 step 14)", () => {
  assert.equal(messageAfter("filter-changed", "No more in stock"), "");
});

test("R2: messageAfter clears the message on a successful add and on a remove", () => {
  assert.equal(messageAfter("added", "No more in stock"), "");
  assert.equal(messageAfter("removed", "No more in stock"), "");
});

test("R2: messageAfter keeps the message for an event that does not clear it", () => {
  assert.equal(messageAfter("hovered", "No more in stock"), "No more in stock");
});
