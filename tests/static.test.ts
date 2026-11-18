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

test("R1: / serves the page as HTML", async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type") ?? "", /^text\/html/);
  assert.match(await res.text(), /<html/);
});

test("R1: the page's script and style are served with browser-valid content types", async () => {
  const js = await fetch(`${base}/app.js`);
  assert.equal(js.status, 200);
  assert.match(js.headers.get("content-type") ?? "", /^text\/javascript/);
  const css = await fetch(`${base}/style.css`);
  assert.equal(css.status, 200);
  assert.match(css.headers.get("content-type") ?? "", /^text\/css/);
});

test("R1: the page's modules are served as JavaScript", async () => {
  for (const path of ["/shop-view.js", "/cart-session.js"]) {
    const res = await fetch(`${base}${path}`);
    assert.equal(res.status, 200, path);
    assert.match(res.headers.get("content-type") ?? "", /^text\/javascript/, path);
  }
});

test("R12: paths outside the list keep the JSON 404", async () => {
  for (const path of ["/unknown", "/package.json", "/src/server.ts"]) {
    const res = await fetch(`${base}${path}`);
    assert.equal(res.status, 404, path);
    assert.deepEqual(await res.json(), { error: "NOT_FOUND" }, path);
  }
});

test("R12: a path that climbs out of public/ is not served", async () => {
  // fetch normalises "/../", so send the raw request line
  const { port } = server.address() as AddressInfo;
  const { connect } = await import("node:net");
  const raw = await new Promise<string>((resolve) => {
    const socket = connect(port, "localhost", () => {
      socket.write("GET /../package.json HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n");
    });
    let data = "";
    socket.on("data", (chunk) => {
      data += chunk;
    });
    socket.on("end", () => resolve(data));
  });
  assert.match(raw, /^HTTP\/1\.1 404/);
  assert.match(raw, /NOT_FOUND/);
});

test("R12: the existing API routes still answer JSON", async () => {
  const products = await fetch(`${base}/products`);
  assert.equal(products.status, 200);
  assert.match(products.headers.get("content-type") ?? "", /^application\/json/);
  const cart = await fetch(`${base}/carts`, { method: "POST" });
  assert.equal(cart.status, 201);
  assert.match(cart.headers.get("content-type") ?? "", /^application\/json/);
});
