// The storefront page: draws what shop-view.js describes and calls cart-session.js on clicks.
import { addToCart, openCart, removeFromCart } from "/cart-session.js";
import {
  canAdd,
  cartPanelView,
  filterByCategory,
  formatCents,
  stockLabel,
} from "/shop-view.js";

const env = { storage: localStorage, fetch: (path, init) => fetch(path, init) };

const productsEl = document.querySelector("#products");
const linesEl = document.querySelector("#cart-lines");
const messageEl = document.querySelector("#message");
const categoryEl = document.querySelector("#category");

const state = { products: [], cart: undefined };

function element(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}

function button(label, onClick, disabled = false) {
  const el = element("button", label);
  el.type = "button";
  el.disabled = disabled;
  el.addEventListener("click", onClick);
  return el;
}

function productCard(product) {
  const card = element("article", undefined, "card");
  card.append(
    element("h3", product.name),
    element("p", formatCents(product.priceCents), "price"),
    element("p", stockLabel(product.stock), "stock"),
    button("Add to cart", () => run(() => add(product.id)), !canAdd(product)),
  );
  return card;
}

function renderProducts() {
  const shown = filterByCategory(state.products, categoryEl.value);
  productsEl.replaceChildren(...shown.map(productCard));
}

function cartLine(line) {
  const item = element("li");
  item.append(
    element("span", `${line.name} × ${line.qty}`),
    element("span", line.linePrice, "line-price"),
    button("Remove", () => run(() => remove(line.productId))),
  );
  return item;
}

function renderCart() {
  const view = cartPanelView(state.cart, state.products);
  linesEl.replaceChildren(...view.lines.map(cartLine));
  document.querySelector("#subtotal").textContent = view.subtotal;
  document.querySelector("#shipping").textContent = view.shipping;
  document.querySelector("#total").textContent = view.total;
}

async function add(productId) {
  const result = await addToCart(env, state.cart.id, productId);
  if (result.error) {
    messageEl.textContent = result.error;
    return;
  }
  messageEl.textContent = "";
  state.cart = result;
  renderCart();
}

async function remove(productId) {
  state.cart = await removeFromCart(env, state.cart.id, productId);
  messageEl.textContent = "";
  renderCart();
}

async function run(action) {
  try {
    await action();
  } catch {
    messageEl.textContent = "Something went wrong. Try again.";
  }
}

categoryEl.addEventListener("change", renderProducts);

async function start() {
  state.products = await (await fetch("/products")).json();
  state.cart = await openCart(env);
  renderProducts();
  renderCart();
}

run(start);
