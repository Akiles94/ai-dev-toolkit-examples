// The person's cart across reloads. `env` is { storage, fetch }: the browser's localStorage and
// fetch in the page, plain stand-ins in the tests.

const CART_KEY = "shop.cartId";

async function call(env, path, init) {
  const res = await env.fetch(path, init);
  return { status: res.status, body: await res.json() };
}

function isCartGone(res) {
  return res.status === 404 && res.body.error === "CART_NOT_FOUND";
}

async function startNewCart(env) {
  const created = await call(env, "/carts", { method: "POST" });
  env.storage.setItem(CART_KEY, created.body.id);
  return expectCart(await call(env, `/carts/${created.body.id}`));
}

function expectCart(res) {
  if (res.status !== 200) throw new Error(`Unexpected ${res.status} from the shop`);
  return res.body;
}

export async function openCart(env) {
  const keptId = env.storage.getItem(CART_KEY);
  if (!keptId) return startNewCart(env);
  const kept = await call(env, `/carts/${keptId}`);
  if (isCartGone(kept)) return startNewCart(env);
  return expectCart(kept);
}

function postItem(env, cartId, productId) {
  return call(env, `/carts/${cartId}/items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productId, qty: 1 }),
  });
}

export async function addToCart(env, cartId, productId) {
  let res = await postItem(env, cartId, productId);
  if (isCartGone(res)) {
    const fresh = await startNewCart(env);
    res = await postItem(env, fresh.id, productId);
  }
  if (res.status === 409) return { error: "No more in stock" };
  return expectCart(res);
}

export async function removeFromCart(env, cartId, productId) {
  const res = await call(env, `/carts/${cartId}/items/${productId}`, { method: "DELETE" });
  if (isCartGone(res)) return startNewCart(env);
  return expectCart(res);
}
