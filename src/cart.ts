import { findProduct } from "./products.ts";
import type { Cart, CartTotals } from "./types.ts";
import { newId, now } from "./utils.ts";

const FREE_SHIPPING_FROM_CENTS = 5000;
const SHIPPING_CENTS = 499;

const carts = new Map<string, Cart>();

export function createCart(): Cart {
  const cart: Cart = { id: newId("cart"), items: [], createdAt: now() };
  carts.set(cart.id, cart);
  return cart;
}

export function getCart(id: string): Cart | undefined {
  return carts.get(id);
}

export type AddItemError = "CART_NOT_FOUND" | "PRODUCT_NOT_FOUND" | "OUT_OF_STOCK";

/** Adds `qty` units, merging with the same product already in the cart. */
export function addItem(cartId: string, productId: string, qty: number): Cart | AddItemError {
  const cart = carts.get(cartId);
  if (!cart) return "CART_NOT_FOUND";
  const product = findProduct(productId);
  if (!product) return "PRODUCT_NOT_FOUND";
  const existing = cart.items.find((i) => i.productId === productId);
  const wanted = (existing?.qty ?? 0) + qty;
  if (wanted > product.stock) return "OUT_OF_STOCK";
  if (existing) existing.qty = wanted;
  else cart.items.push({ productId, qty });
  return cart;
}

export function removeItem(cartId: string, productId: string): Cart | undefined {
  const cart = carts.get(cartId);
  if (!cart) return undefined;
  cart.items = cart.items.filter((i) => i.productId !== productId);
  return cart;
}

export function clearCart(cartId: string): Cart | undefined {
  const cart = carts.get(cartId);
  if (!cart) return undefined;
  cart.items = [];
  return cart;
}

/** Adds flat shipping under the free-shipping threshold; nothing to ship costs nothing. */
export function totalsFromSubtotal(subtotalCents: number): CartTotals {
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
  return { subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

/** Subtotal of the items, plus flat shipping under the free-shipping threshold. */
export function totals(cart: Cart): CartTotals {
  const subtotalCents = cart.items.reduce((sum, item) => {
    const product = findProduct(item.productId);
    return sum + (product ? product.priceCents * item.qty : 0);
  }, 0);
  return totalsFromSubtotal(subtotalCents);
}
