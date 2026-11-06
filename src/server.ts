import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { addItem, createCart, getCart, removeItem, totals } from "./cart.ts";
import { listProducts } from "./products.ts";
import type { Product } from "./types.ts";
import { formatCents, isPositiveInt, readJson } from "./utils.ts";

const CATEGORIES = ["books", "games", "music"];

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

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
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
  }

  send(res, 404, { error: "NOT_FOUND" });
}

export const server = createServer((req, res) => {
  route(req, res).catch(() => send(res, 500, { error: "INTERNAL" }));
});

if (import.meta.main) {
  const port = Number(process.env.PORT ?? 3000);
  server.listen(port, () => console.log(`shop-api on http://localhost:${port}`));
}
