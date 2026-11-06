import assert from "node:assert/strict";
import { test } from "node:test";
import { addItem, createCart, getCart } from "../src/cart.ts";
import { cancelOrder, checkout, getOrder, listOrders, shipOrder } from "../src/orders.ts";
import {
  FakePaymentGateway,
  type ChargeRequest,
  type ChargeResult,
  type PaymentGateway,
  type RefundResult,
} from "../src/payments.ts";
import { findProduct } from "../src/products.ts";
import type { Order } from "../src/types.ts";

const stockOf = (id: string) => findProduct(id)?.stock;

function cartWith(...items: [productId: string, qty: number][]): string {
  const cart = createCart();
  for (const [productId, qty] of items) {
    const result = addItem(cart.id, productId, qty);
    assert.notEqual(typeof result, "string", `could not add ${productId}`);
  }
  return cart.id;
}

async function paidOrder(gateway: PaymentGateway, ...items: [string, number][]): Promise<Order> {
  const result = await checkout(cartWith(...items), "tok_visa", gateway);
  assert.ok("order" in result, `checkout failed: ${JSON.stringify(result)}`);
  return result.order;
}

/** Gateway whose charges and refunds stay pending until the test resolves them. */
class PendingGateway implements PaymentGateway {
  charges: ((result: ChargeResult) => void)[] = [];
  refunds: ((result: RefundResult) => void)[] = [];

  charge(_request: ChargeRequest): Promise<ChargeResult> {
    return new Promise((resolve) => this.charges.push(resolve));
  }

  refund(_paymentId: string): Promise<RefundResult> {
    return new Promise((resolve) => this.refunds.push(resolve));
  }
}

test("checkout creates a paid order with the prices and totals at checkout time", async () => {
  const gateway = new FakePaymentGateway();
  const cartId = cartWith(["p-3", 2], ["p-1", 1]);
  const result = await checkout(cartId, "tok_visa", gateway);
  assert.ok("order" in result);
  const { order } = result;

  assert.equal(order.status, "paid");
  assert.equal(order.cartId, cartId);
  assert.deepEqual(order.items, [
    { productId: "p-3", name: "Tetris Effect", unitPriceCents: 2999, qty: 2, lineTotalCents: 5998 },
    {
      productId: "p-1",
      name: "The Pragmatic Programmer",
      unitPriceCents: 3999,
      qty: 1,
      lineTotalCents: 3999,
    },
  ]);
  assert.equal(order.subtotalCents, 9997);
  assert.equal(order.shippingCents, 0);
  assert.equal(order.totalCents, 9997);
  assert.equal(gateway.find(order.paymentId)?.amountCents, 9997);
  assert.deepEqual(
    order.history.map((h) => h.status),
    ["paid"],
  );
  assert.equal(getOrder(order.id), order);
});

test("checkout charges shipping on small orders", async () => {
  const order = await paidOrder(new FakePaymentGateway(), ["p-3", 1]);
  assert.equal(order.shippingCents, 499);
  assert.equal(order.totalCents, 2999 + 499);
});

test("checkout reserves the stock and empties the cart", async () => {
  const before = stockOf("p-3")!;
  const cartId = cartWith(["p-3", 3]);
  await checkout(cartId, "tok_visa", new FakePaymentGateway());
  assert.equal(stockOf("p-3"), before - 3);
  assert.deepEqual(getCart(cartId)?.items, []);
});

test("the order keeps its price when the catalog price changes later", async () => {
  const order = await paidOrder(new FakePaymentGateway(), ["p-1", 1]);
  const product = findProduct("p-1")!;
  const original = product.priceCents;
  product.priceCents = 1;
  try {
    assert.equal(getOrder(order.id)?.items[0].unitPriceCents, original);
  } finally {
    product.priceCents = original;
  }
});

test("checkout reserves nothing when any item lacks stock", async () => {
  const cartId = cartWith(["p-3", 1], ["p-2", 2]);
  // Someone else buys the remaining copies of p-2 after this cart was filled.
  const p2 = findProduct("p-2")!;
  const p2Stock = p2.stock;
  p2.stock = 1;
  const p3Before = stockOf("p-3");
  try {
    const result = await checkout(cartId, "tok_visa", new FakePaymentGateway());
    assert.deepEqual(result, { error: "OUT_OF_STOCK", productIds: ["p-2"] });
    assert.equal(stockOf("p-3"), p3Before);
    assert.equal(stockOf("p-2"), 1);
    assert.equal(getCart(cartId)?.items.length, 2);
  } finally {
    p2.stock = p2Stock;
  }
});

test("a declined payment releases the stock and keeps the cart", async () => {
  const before = stockOf("p-3");
  const cartId = cartWith(["p-3", 2]);
  const ordersBefore = listOrders().length;
  const result = await checkout(cartId, "tok_declined_card", new FakePaymentGateway());
  assert.deepEqual(result, { error: "PAYMENT_DECLINED", reason: "CARD_DECLINED" });
  assert.equal(stockOf("p-3"), before);
  assert.deepEqual(getCart(cartId)?.items, [{ productId: "p-3", qty: 2 }]);
  assert.equal(listOrders().length, ordersBefore);
});

test("a gateway error releases the stock before it propagates", async () => {
  const before = stockOf("p-3");
  const broken: PaymentGateway = {
    charge: async () => {
      throw new Error("gateway down");
    },
    refund: async () => ({ ok: false, reason: "UNUSED" }),
  };
  await assert.rejects(checkout(cartWith(["p-3", 1]), "tok_visa", broken), /gateway down/);
  assert.equal(stockOf("p-3"), before);
});

test("checkout rejects unknown and empty carts", async () => {
  const gateway = new FakePaymentGateway();
  assert.deepEqual(await checkout("cart-nope", "tok_visa", gateway), { error: "CART_NOT_FOUND" });
  assert.deepEqual(await checkout(createCart().id, "tok_visa", gateway), { error: "CART_EMPTY" });
});

test("the same cart cannot be checked out twice at once", async () => {
  const gateway = new PendingGateway();
  const cartId = cartWith(["p-3", 1]);
  const first = checkout(cartId, "tok_visa", gateway);
  assert.deepEqual(await checkout(cartId, "tok_visa", gateway), {
    error: "CHECKOUT_IN_PROGRESS",
  });
  gateway.charges[0]({ ok: true, paymentId: "pay-pending" });
  const result = await first;
  assert.ok("order" in result);
  assert.equal(gateway.charges.length, 1);
});

test("ships a paid order and records the change", async () => {
  const order = await paidOrder(new FakePaymentGateway(), ["p-3", 1]);
  const result = shipOrder(order.id);
  assert.ok("order" in result);
  assert.equal(result.order.status, "shipped");
  assert.deepEqual(
    result.order.history.map((h) => h.status),
    ["paid", "shipped"],
  );
  assert.ok(result.order.history.every((h) => !Number.isNaN(Date.parse(h.at))));
});

test("only paid orders can be shipped", async () => {
  const gateway = new FakePaymentGateway();
  const order = await paidOrder(gateway, ["p-3", 1]);
  shipOrder(order.id);
  assert.deepEqual(shipOrder(order.id), { error: "ORDER_NOT_PAID", status: "shipped" });
  assert.deepEqual(shipOrder("order-nope"), { error: "ORDER_NOT_FOUND" });
});

test("cancelling refunds the payment and returns the stock", async () => {
  const gateway = new FakePaymentGateway();
  const before = stockOf("p-3")!;
  const order = await paidOrder(gateway, ["p-3", 4]);
  assert.equal(stockOf("p-3"), before - 4);

  const result = await cancelOrder(order.id, gateway);
  assert.ok("order" in result);
  assert.equal(result.order.status, "cancelled");
  assert.match(result.order.refundId ?? "", /^ref-/);
  assert.equal(gateway.find(order.paymentId)?.refundId, result.order.refundId);
  assert.equal(stockOf("p-3"), before);
  assert.deepEqual(
    result.order.history.map((h) => h.status),
    ["paid", "cancelled"],
  );
});

test("shipped and cancelled orders cannot be cancelled", async () => {
  const gateway = new FakePaymentGateway();
  const shipped = await paidOrder(gateway, ["p-3", 1]);
  shipOrder(shipped.id);
  assert.deepEqual(await cancelOrder(shipped.id, gateway), {
    error: "ORDER_NOT_PAID",
    status: "shipped",
  });

  const cancelled = await paidOrder(gateway, ["p-3", 1]);
  await cancelOrder(cancelled.id, gateway);
  const stock = stockOf("p-3");
  assert.deepEqual(await cancelOrder(cancelled.id, gateway), {
    error: "ORDER_NOT_PAID",
    status: "cancelled",
  });
  assert.equal(stockOf("p-3"), stock, "stock must not be returned twice");
});

test("a failed refund leaves the order paid and the stock reserved", async () => {
  const order = await paidOrder(new FakePaymentGateway(), ["p-3", 1]);
  const stock = stockOf("p-3");
  // A different gateway has never seen this payment, so the refund fails.
  const result = await cancelOrder(order.id, new FakePaymentGateway());
  assert.deepEqual(result, { error: "REFUND_FAILED", reason: "PAYMENT_NOT_FOUND" });
  assert.equal(getOrder(order.id)?.status, "paid");
  assert.equal(stockOf("p-3"), stock);
});

test("an order being cancelled can be neither shipped nor cancelled again", async () => {
  const order = await paidOrder(new FakePaymentGateway(), ["p-3", 1]);
  const gateway = new PendingGateway();
  const cancelling = cancelOrder(order.id, gateway);
  assert.deepEqual(shipOrder(order.id), { error: "CANCELLATION_IN_PROGRESS" });
  assert.deepEqual(await cancelOrder(order.id, gateway), { error: "CANCELLATION_IN_PROGRESS" });
  gateway.refunds[0]({ ok: true, refundId: "ref-pending" });
  const result = await cancelling;
  assert.ok("order" in result);
  assert.equal(result.order.status, "cancelled");
});

test("lists orders by status", async () => {
  const gateway = new FakePaymentGateway();
  const paid = await paidOrder(gateway, ["p-3", 1]);
  const shipped = await paidOrder(gateway, ["p-3", 1]);
  shipOrder(shipped.id);

  const paidIds = listOrders("paid").map((o) => o.id);
  const shippedIds = listOrders("shipped").map((o) => o.id);
  assert.ok(paidIds.includes(paid.id) && !paidIds.includes(shipped.id));
  assert.ok(shippedIds.includes(shipped.id) && !shippedIds.includes(paid.id));
  assert.ok(listOrders("cancelled").every((o) => o.status === "cancelled"));
  assert.equal(listOrders().length, new Set(listOrders().map((o) => o.id)).size);
});
