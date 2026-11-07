import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { addItem, createCart, getCart, removeItem, totals } from "./cart.ts";
import {
  cancelOrder,
  checkout,
  getOrder,
  listOrders,
  ORDER_STATUSES,
  shipOrder,
  type CheckoutError,
  type OrderTransitionResult,
} from "./orders.ts";
import { FakePaymentGateway, type PaymentGateway } from "./payments.ts";
import { listProducts } from "./products.ts";
import type { Order, OrderStatus, Product } from "./types.ts";
import { formatCents, isPositiveInt, readJson } from "./utils.ts";

const CATEGORIES = ["books", "games", "music"];

const CHECKOUT_ERROR_STATUS: Record<CheckoutError["error"], number> = {
  CART_NOT_FOUND: 404,
  CART_EMPTY: 400,
  CHECKOUT_IN_PROGRESS: 409,
  OUT_OF_STOCK: 409,
  PAYMENT_DECLINED: 402,
};

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function cartView(cartId: string) {
  const cart = getCart(cartId);
  if (!cart) return undefined;
  const t = totals(cart);
  return { ...cart, ...t, total: formatCents(t.totalCents) };
}

function orderView(order: Order) {
  return { ...order, total: formatCents(order.totalCents) };
}

function sendTransition(res: ServerResponse, result: OrderTransitionResult): void {
  if ("order" in result) return send(res, 200, orderView(result.order));
  const status =
    result.error === "ORDER_NOT_FOUND" ? 404 : result.error === "REFUND_FAILED" ? 502 : 409;
  send(res, status, result);
}

/** Handles /orders routes. Returns false when nothing matched. */
async function routeOrders(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  parts: string[],
  gateway: PaymentGateway,
): Promise<boolean> {
  if (req.method === "GET" && parts.length === 1) {
    const status = url.searchParams.get("status") ?? undefined;
    if (status && !ORDER_STATUSES.includes(status as OrderStatus)) {
      send(res, 400, { error: "UNKNOWN_STATUS" });
      return true;
    }
    send(res, 200, listOrders(status as OrderStatus | undefined).map(orderView));
    return true;
  }
  const orderId = parts[1];
  if (!orderId) return false;
  if (req.method === "GET" && parts.length === 2) {
    const order = getOrder(orderId);
    if (order) send(res, 200, orderView(order));
    else send(res, 404, { error: "ORDER_NOT_FOUND" });
    return true;
  }
  if (req.method === "POST" && parts.length === 3 && parts[2] === "ship") {
    sendTransition(res, shipOrder(orderId));
    return true;
  }
  if (req.method === "POST" && parts.length === 3 && parts[2] === "cancel") {
    sendTransition(res, await cancelOrder(orderId, gateway));
    return true;
  }
  return false;
}

async function route(
  req: IncomingMessage,
  res: ServerResponse,
  gateway: PaymentGateway,
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);

  if (req.method === "GET" && url.pathname === "/products") {
    const category = url.searchParams.get("category") ?? undefined;
    if (category && !CATEGORIES.includes(category)) {
      return send(res, 400, { error: "UNKNOWN_CATEGORY" });
    }
    return send(res, 200, listProducts(category as Product["category"] | undefined));
  }

  if (req.method === "POST" && url.pathname === "/carts") {
    return send(res, 201, createCart());
  }

  if (parts[0] === "carts" && parts[1]) {
    const cartId = parts[1];
    if (req.method === "GET" && parts.length === 2) {
      const view = cartView(cartId);
      return view ? send(res, 200, view) : send(res, 404, { error: "CART_NOT_FOUND" });
    }
    if (req.method === "POST" && parts[2] === "items") {
      const body = (await readJson(req)) as { productId?: unknown; qty?: unknown };
      if (typeof body.productId !== "string" || !isPositiveInt(body.qty)) {
        return send(res, 400, { error: "INVALID_ITEM" });
      }
      const result = addItem(cartId, body.productId, body.qty);
      if (typeof result === "string") {
        return send(res, result === "OUT_OF_STOCK" ? 409 : 404, { error: result });
      }
      return send(res, 200, cartView(cartId));
    }
    if (req.method === "DELETE" && parts[2] === "items" && parts[3]) {
      return removeItem(cartId, parts[3])
        ? send(res, 200, cartView(cartId))
        : send(res, 404, { error: "CART_NOT_FOUND" });
    }
    if (req.method === "POST" && parts[2] === "checkout" && parts.length === 3) {
      const body = (await readJson(req)) as { cardToken?: unknown };
      if (typeof body.cardToken !== "string" || body.cardToken.trim() === "") {
        return send(res, 400, { error: "INVALID_PAYMENT" });
      }
      const result = await checkout(cartId, body.cardToken, gateway);
      if ("order" in result) return send(res, 201, orderView(result.order));
      return send(res, CHECKOUT_ERROR_STATUS[result.error], result);
    }
  }

  if (parts[0] === "orders" && (await routeOrders(req, res, url, parts, gateway))) return;

  send(res, 404, { error: "NOT_FOUND" });
}

/** Builds the HTTP server; tests pass their own gateway to control payment outcomes. */
export function createShopServer(gateway: PaymentGateway = new FakePaymentGateway()) {
  return createServer((req, res) => {
    route(req, res, gateway).catch(() => send(res, 500, { error: "INTERNAL" }));
  });
}

export const server = createShopServer();

if (import.meta.main) {
  const port = Number(process.env.PORT ?? 3000);
  server.listen(port, () => console.log(`shop-api on http://localhost:${port}`));
}
