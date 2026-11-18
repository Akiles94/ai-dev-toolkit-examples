import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { server } from "../src/server.ts";

let base = "";

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
});

async function newCartId(): Promise<string> {
  const res = await fetch(`${base}/carts`, { method: "POST" });
  return ((await res.json()) as { id: string }).id;
}

// Sends the body exactly as given (a string), so invalid JSON can be tested.
function postItem(cartId: string, rawBody: string): Promise<Response> {
  return fetch(`${base}/carts/${cartId}/items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: rawBody,
  });
}

async function assertInvalidItem(rawBody: string): Promise<void> {
  const res = await postItem(await newCartId(), rawBody);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "INVALID_ITEM" });
}

test("R3: a null body answers 400 INVALID_ITEM", async () => {
  await assertInvalidItem("null");
});

test("R3: unparsable JSON answers 400 INVALID_ITEM", async () => {
  await assertInvalidItem("not json{");
});

test("R3: an array, a number and a string body answer 400 INVALID_ITEM", async () => {
  await assertInvalidItem("[]");
  await assertInvalidItem("5");
  await assertInvalidItem('"abc"');
});

test("R3: qty 0 still answers 400 and a valid body still adds the item", async () => {
  const cartId = await newCartId();
  const bad = await postItem(cartId, JSON.stringify({ productId: "p-3", qty: 0 }));
  assert.equal(bad.status, 400);
  assert.deepEqual(await bad.json(), { error: "INVALID_ITEM" });

  const good = await postItem(cartId, JSON.stringify({ productId: "p-3", qty: 1 }));
  assert.equal(good.status, 200);
  const cart = (await good.json()) as { items: { productId: string; qty: number }[] };
  assert.deepEqual(cart.items, [{ productId: "p-3", qty: 1 }]);
});
