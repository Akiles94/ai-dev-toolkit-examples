import assert from "node:assert/strict";
import { test } from "node:test";
import { addItem, applyCode, createCart, totals } from "../src/cart.ts";
import { findCode } from "../src/discounts.ts";

test("finds codes case-insensitively", () => {
  const code = findCode("welcome10");
  assert.equal(typeof code === "string" ? code : code.code, "WELCOME10");
});

test("rejects unknown and expired codes", () => {
  assert.equal(findCode("NOPE"), "UNKNOWN_CODE");
  assert.equal(findCode("SUMMER25", new Date("2026-10-01")), "EXPIRED_CODE");
});

test("takes a percentage off the subtotal", () => {
  const cart = createCart();
  addItem(cart.id, "p-1", 1);
  applyCode(cart.id, "WELCOME10");
  assert.equal(totals(cart).discountCents, 400);
});

test("a second code replaces the first", () => {
  const cart = createCart();
  addItem(cart.id, "p-3", 1);
  applyCode(cart.id, "WELCOME10");
  applyCode(cart.id, "FIVEOFF");
  assert.equal(totals(cart).discountCents, 500);
});
