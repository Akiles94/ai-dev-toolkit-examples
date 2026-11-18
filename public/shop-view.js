// What the page shows, as pure functions: data in, text out. No DOM, so node:test can run them.

export function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

const LOW_STOCK_BELOW = 5;

export function stockLabel(stock) {
  if (stock === 0) return "Out of stock";
  if (stock < LOW_STOCK_BELOW) return `Only ${stock} left`;
  return `${stock} in stock`;
}

export function canAdd(product) {
  return product.stock > 0;
}

export function filterByCategory(products, category) {
  if (category === "all") return products;
  return products.filter((product) => product.category === category);
}

export function cartPanelView(cart, products) {
  const byId = new Map(products.map((product) => [product.id, product]));
  return {
    lines: cart.items.map((item) => cartLine(item, byId.get(item.productId))),
    subtotal: formatCents(cart.subtotalCents),
    shipping: formatCents(cart.shippingCents),
    total: formatCents(cart.totalCents),
  };
}

function cartLine(item, product) {
  return {
    productId: item.productId,
    name: product ? product.name : item.productId,
    qty: item.qty,
    linePrice: product ? formatCents(product.priceCents * item.qty) : "—",
  };
}
