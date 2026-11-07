import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { FakePaymentGateway } from "../src/payments.ts";
import { findProduct } from "../src/products.ts";
import { createShopServer } from "../src/server.ts";

const gateway = new FakePaymentGateway();
const server = createShopServer(gateway);
let baseUrl = "";

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
});

async function call(method: string, path: string, body?: unknown) {
  const res = await fetch(baseUrl + path, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: (await res.json()) as any };
}

async function cartWith(...items: [string, number][]): Promise<string> {
  const { body: cart } = await call("POST", "/carts");
  for (const [productId, qty] of items) {
    const res = await call("POST", `/carts/${cart.id}/items`, { productId, qty });
    assert.equal(res.status, 200);
  }
  return cart.id;
}

async function checkout(cardToken = "tok_visa", ...items: [string, number][]) {
  const cartId = await cartWith(...(items.length ? items : [["p-3", 1] as [string, number]]));
  return call("POST", `/carts/${cartId}/checkout`, { cardToken });
}

test("POST /carts/:id/checkout answers 201 with the order and empties the cart", async () => {
  const cartId = await cartWith(["p-1", 1], ["p-3", 1]);
  const res = await call("POST", `/carts/${cartId}/checkout`, { cardToken: "tok_visa" });
  assert.equal(res.status, 201);
  assert.equal(res.body.status, "paid");
  assert.equal(res.body.totalCents, 6998);
  assert.equal(res.body.total, "$69.98");
  assert.match(res.body.paymentId, /^pay-/);
  assert.equal(res.body.history.length, 1);

  const cart = await call("GET", `/carts/${cartId}`);
  assert.deepEqual(cart.body.items, []);
});

test("checkout needs a card token", async () => {
  const cartId = await cartWith(["p-3", 1]);
  for (const body of [{}, { cardToken: "" }, { cardToken: 42 }]) {
    const res = await call("POST", `/carts/${cartId}/checkout`, body);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: "INVALID_PAYMENT" });
  }
});

test("checkout of an unknown cart is 404 and of an empty cart is 400", async () => {
  const missing = await call("POST", "/carts/cart-nope/checkout", { cardToken: "tok_visa" });
  assert.equal(missing.status, 404);
  const { body: cart } = await call("POST", "/carts");
  const res = await call("POST", `/carts/${cart.id}/checkout`, { cardToken: "tok_visa" });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: "CART_EMPTY" });
});

test("checkout answers 409 OUT_OF_STOCK with the product ids", async () => {
  const cartId = await cartWith(["p-2", 1], ["p-3", 1]);
  const p2 = findProduct("p-2")!;
  const stock = p2.stock;
  p2.stock = 0;
  try {
    const res = await call("POST", `/carts/${cartId}/checkout`, { cardToken: "tok_visa" });
    assert.equal(res.status, 409);
    assert.deepEqual(res.body, { error: "OUT_OF_STOCK", productIds: ["p-2"] });
  } finally {
    p2.stock = stock;
  }
});

test("a declined card answers 402 PAYMENT_DECLINED", async () => {
  const stock = findProduct("p-3")!.stock;
  const res = await checkout("tok_declined");
  assert.equal(res.status, 402);
  assert.equal(res.body.error, "PAYMENT_DECLINED");
  assert.equal(findProduct("p-3")!.stock, stock);
});

test("GET /orders/:id returns the order or 404", async () => {
  const { body: order } = await checkout();
  const res = await call("GET", `/orders/${order.id}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.id, order.id);
  assert.deepEqual(await call("GET", "/orders/order-nope"), {
    status: 404,
    body: { error: "ORDER_NOT_FOUND" },
  });
});

test("GET /orders filters by status and rejects unknown statuses", async () => {
  const { body: paid } = await checkout();
  const { body: shipped } = await checkout();
  await call("POST", `/orders/${shipped.id}/ship`);

  const paidList = await call("GET", "/orders?status=paid");
  assert.equal(paidList.status, 200);
  const paidIds = paidList.body.map((o: { id: string }) => o.id);
  assert.ok(paidIds.includes(paid.id) && !paidIds.includes(shipped.id));

  const all = await call("GET", "/orders");
  assert.ok(all.body.length >= 2);

  assert.deepEqual(await call("GET", "/orders?status=lost"), {
    status: 400,
    body: { error: "UNKNOWN_STATUS" },
  });
});

test("POST /orders/:id/ship ships paid orders only", async () => {
  const { body: order } = await checkout();
  const shipped = await call("POST", `/orders/${order.id}/ship`);
  assert.equal(shipped.status, 200);
  assert.equal(shipped.body.status, "shipped");

  const again = await call("POST", `/orders/${order.id}/ship`);
  assert.equal(again.status, 409);
  assert.deepEqual(again.body, { error: "ORDER_NOT_PAID", status: "shipped" });
  assert.equal((await call("POST", "/orders/order-nope/ship")).status, 404);
});

test("POST /orders/:id/cancel refunds and returns the stock", async () => {
  const stock = findProduct("p-3")!.stock;
  const { body: order } = await checkout("tok_visa", ["p-3", 2]);
  assert.equal(findProduct("p-3")!.stock, stock - 2);

  const res = await call("POST", `/orders/${order.id}/cancel`);
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "cancelled");
  assert.ok(gateway.find(order.paymentId)?.refundId);
  assert.equal(findProduct("p-3")!.stock, stock);
  assert.deepEqual(
    res.body.history.map((h: { status: string }) => h.status),
    ["paid", "cancelled"],
  );
});

test("a shipped order cannot be cancelled", async () => {
  const { body: order } = await checkout();
  await call("POST", `/orders/${order.id}/ship`);
  const res = await call("POST", `/orders/${order.id}/cancel`);
  assert.equal(res.status, 409);
  assert.equal(res.body.error, "ORDER_NOT_PAID");
});

test("unknown order routes are 404", async () => {
  assert.equal((await call("POST", "/orders/x/refund")).status, 404);
  assert.equal((await call("DELETE", "/orders")).status, 404);
});
