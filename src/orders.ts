import { clearCart, getCart, totalsFromSubtotal } from "./cart.ts";
import type { PaymentGateway } from "./payments.ts";
import { findProduct, releaseStock, reserveStock } from "./products.ts";
import type { CartItem, Order, OrderItem, OrderStatus } from "./types.ts";
import { newId, now } from "./utils.ts";

export const ORDER_STATUSES: OrderStatus[] = ["paid", "shipped", "cancelled"];

const orders = new Map<string, Order>();

/** Carts with a checkout awaiting the payment gateway, so the same cart cannot be paid twice. */
const checkoutsInProgress = new Set<string>();

export type CheckoutError =
  | { error: "CART_NOT_FOUND" }
  | { error: "CART_EMPTY" }
  | { error: "CHECKOUT_IN_PROGRESS" }
  | { error: "OUT_OF_STOCK"; productIds: string[] }
  | { error: "PAYMENT_DECLINED"; reason: string };

export type CheckoutResult = { order: Order } | CheckoutError;

/** Product ids in `items` that cannot be fully served from the current stock. */
function missingStock(items: CartItem[]): string[] {
  return items
    .filter((item) => {
      const product = findProduct(item.productId);
      return !product || product.stock < item.qty;
    })
    .map((item) => item.productId);
}

/** Reserves every item or none of them. */
function reserveAll(items: CartItem[]): string[] {
  const missing = missingStock(items);
  if (missing.length > 0) return missing;
  const reserved: CartItem[] = [];
  for (const item of items) {
    if (!reserveStock(item.productId, item.qty)) {
      // Should not happen after the check above, but never leave a partial reservation behind.
      releaseAll(reserved);
      return [item.productId];
    }
    reserved.push(item);
  }
  return [];
}

function releaseAll(items: { productId: string; qty: number }[]): void {
  for (const item of items) releaseStock(item.productId, item.qty);
}

/** Copies the current catalog price of each item so the order is not affected by later changes. */
function snapshotItems(items: CartItem[]): OrderItem[] {
  return items.map((item) => {
    const product = findProduct(item.productId);
    if (!product) throw new Error(`product ${item.productId} vanished during checkout`);
    return {
      productId: product.id,
      name: product.name,
      unitPriceCents: product.priceCents,
      qty: item.qty,
      lineTotalCents: product.priceCents * item.qty,
    };
  });
}

/**
 * Turns a cart into a paid order: reserves stock (all or nothing), charges the card, stores the
 * order and empties the cart. A declined payment releases the stock again.
 */
export async function checkout(
  cartId: string,
  cardToken: string,
  gateway: PaymentGateway,
): Promise<CheckoutResult> {
  const cart = getCart(cartId);
  if (!cart) return { error: "CART_NOT_FOUND" };
  if (cart.items.length === 0) return { error: "CART_EMPTY" };
  if (checkoutsInProgress.has(cartId)) return { error: "CHECKOUT_IN_PROGRESS" };

  const items = cart.items.map((i) => ({ ...i }));
  const missing = reserveAll(items);
  if (missing.length > 0) return { error: "OUT_OF_STOCK", productIds: missing };

  checkoutsInProgress.add(cartId);
  let paid = false;
  try {
    const orderItems = snapshotItems(items);
    const totals = totalsFromSubtotal(orderItems.reduce((sum, i) => sum + i.lineTotalCents, 0));
    const charge = await gateway.charge({
      amountCents: totals.totalCents,
      cardToken,
      reference: cartId,
    });
    if (!charge.ok) return { error: "PAYMENT_DECLINED", reason: charge.reason };
    paid = true;

    const at = now();
    const order: Order = {
      id: newId("order"),
      cartId,
      items: orderItems,
      ...totals,
      status: "paid",
      paymentId: charge.paymentId,
      history: [{ status: "paid", at }],
      createdAt: at,
    };
    orders.set(order.id, order);
    clearCart(cartId);
    return { order };
  } finally {
    if (!paid) releaseAll(items);
    checkoutsInProgress.delete(cartId);
  }
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id);
}

/** All orders, oldest first, optionally only those with the given status. */
export function listOrders(status?: OrderStatus): Order[] {
  const all = [...orders.values()];
  return status ? all.filter((o) => o.status === status) : all;
}

/** Orders with a refund awaiting the gateway; they can be neither shipped nor cancelled again. */
const cancellationsInProgress = new Set<string>();

export type OrderTransitionError =
  | { error: "ORDER_NOT_FOUND" }
  | { error: "ORDER_NOT_PAID"; status: OrderStatus }
  | { error: "CANCELLATION_IN_PROGRESS" }
  | { error: "REFUND_FAILED"; reason: string };

export type OrderTransitionResult = { order: Order } | OrderTransitionError;

function setStatus(order: Order, status: OrderStatus): void {
  order.status = status;
  order.history.push({ status, at: now() });
}

function paidOrder(id: string): { order: Order } | OrderTransitionError {
  const order = orders.get(id);
  if (!order) return { error: "ORDER_NOT_FOUND" };
  if (order.status !== "paid") return { error: "ORDER_NOT_PAID", status: order.status };
  if (cancellationsInProgress.has(id)) return { error: "CANCELLATION_IN_PROGRESS" };
  return { order };
}

export function shipOrder(id: string): OrderTransitionResult {
  const found = paidOrder(id);
  if ("error" in found) return found;
  setStatus(found.order, "shipped");
  return found;
}

/** Cancels a paid order: refunds the payment and puts the items back into stock. */
export async function cancelOrder(
  id: string,
  gateway: PaymentGateway,
): Promise<OrderTransitionResult> {
  const found = paidOrder(id);
  if ("error" in found) return found;
  const { order } = found;

  cancellationsInProgress.add(id);
  try {
    const refund = await gateway.refund(order.paymentId);
    if (!refund.ok) return { error: "REFUND_FAILED", reason: refund.reason };
    order.refundId = refund.refundId;
    releaseAll(order.items);
    setStatus(order, "cancelled");
    return { order };
  } finally {
    cancellationsInProgress.delete(id);
  }
}
