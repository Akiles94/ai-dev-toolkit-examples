# Plan · SHOP-40 Storefront page

> Spec: [spec.md](spec.md) · Branch: `feat/SHOP-40-storefront` · Status: approved

## Approach

The server serves a small set of static files from `public/` (plain HTML, CSS and JavaScript, since
browsers cannot run `.ts`). The page fetches the whole catalogue once, filters it in the browser,
and calls the existing cart endpoints; every amount shown comes from `GET /carts/:id` (R12).
Logic that can be wrong is kept out of the DOM code, in pure functions (`shop-view.js`,
`cart-session.js`) tested with `node:test`; `app.js` only draws and listens.

**Discarded:**
- The page as an HTML string inside a TypeScript module: JS and CSS embedded in strings, unreadable and not lintable.
- A browser test tool (Playwright): adds a dependency, against "no dependencies".
- Serving `src/utils.ts` to the browser: not runnable there without a build step.
- Filtering by `GET /products?category=`: the cart lines need names of any product, so the page loads all products once and filters locally.

## Structure

Follows the project's own layout (`.aidt/structure.md` is not needed: migration is scheduled after SHOP-40).
The flow that owns the change is the storefront: browse products + cart.

| Path | Responsibility | New / changed |
|---|---|---|
| `src/static.ts` | `serveStatic(pathname, res)`: maps `/`, `/app.js`, `/shop-view.js`, `/cart-session.js`, `/style.css` to files in `public/` with the right content type; returns false for anything else | New |
| `src/server.ts` | Calls `serveStatic` for `GET` before the 404 fallback | Changed |
| `public/index.html` | Page shell: filter, product list, cart panel | New |
| `public/style.css` | Layout and look | New |
| `public/shop-view.js` | Pure functions: `formatCents`, `stockLabel`, `canAdd`, `filterByCategory`, `cartPanelView` | New |
| `public/cart-session.js` | Kept cart: `openCart`, `addToCart`, `removeFromCart` with storage and `fetch` passed in | New |
| `public/app.js` | DOM and events only, wires the two modules above | New |
| `tests/static.test.ts` | Static serving over real HTTP | New |
| `tests/shop-view.test.ts` | View logic | New |
| `tests/cart-session.test.ts` | Kept cart, stale cart, stock limit | New |

## Reuse

- `server` is exported from `src/server.ts`; the new server tests start it on port 0, as the endpoints already allow.
- `formatCents` in `src/utils.ts` is not imported by the page (not runnable in the browser); `shop-view.js` has its own copy and a test asserts both give the same output for sample values.
- No existing HTML or static handling in the repo; nothing else to reuse. Cart, shipping and stock rules stay in `src/cart.ts` and `src/products.ts`, untouched.

## Decisions

- Static files in `public/` (not an HTML string in TypeScript).
- Pure view logic in `public/shop-view.js` tested with `node:test`; DOM checked by hand in `/reviewer` and the demo (no browser test tool).
- Small copy of `formatCents` in `shop-view.js`, with a parity test against `src/utils.ts`.
- Client code is plain JavaScript (the browser cannot run `.ts`); tests stay in TypeScript and import the `.js` modules.

## Sections

| # | Name | Intent | Main files | Est. lines | Covers |
|---|---|---|---|---|---|
| S1 | Serve the page | `GET /` and its files from `public/`, with a minimal shell | `src/static.ts`, `src/server.ts`, `public/index.html` | ~45 | R12 (no API change) |
| S2 | Page logic | Pure view functions and the kept-cart module | `public/shop-view.js`, `public/cart-session.js` | ~110 | R2–R11 (logic) |
| S3 | Page wiring | Markup, style and DOM code that draws products and cart | `public/app.js`, `public/index.html`, `public/style.css` | ~150 | R1–R11 (in the browser) |

### S1 · Serve the page

- **Goal:** Opening `/` returns an HTML page; `/app.js`, `/shop-view.js`, `/cart-session.js` and `/style.css` are served with correct content types; any other path keeps today's JSON 404. A fixed list of paths, never a path built from the request, so no traversal.
- **Depends on:** —
- **Done when:** `tests/static.test.ts` passes (`/` is `text/html`, JS is `text/javascript`, `/../package.json` and `/unknown` give 404 `NOT_FOUND`), the existing tests pass, and `npm start` shows the shell at `/`.

### S2 · Page logic

- **Goal:** Test first. `stockLabel` ("N in stock" from 5, "Only N left" 1–4, "Out of stock" at 0), `canAdd`, `filterByCategory` ("all" plus the three categories), `cartPanelView` (lines with name, quantity, line price; subtotal, shipping, total formatted from the cart response, never recomputed). `cart-session`: `openCart` reuses the stored id, and on a 404 creates a new cart and stores it, with no error; `addToCart` returns the new cart or `{ error: "No more in stock" }` on 409 (cart unchanged), and recovers from a 404 cart the same way as `openCart`; `removeFromCart` returns the updated cart.
- **Depends on:** S1 (files are served from `public/`)
- **Done when:** `tests/shop-view.test.ts` and `tests/cart-session.test.ts` pass, including the `formatCents` parity test.

### S3 · Page wiring

- **Goal:** `index.html` and `app.js` load all products once, draw one card per product (name, price, stock label, "Add to cart" absent/disabled at 0), a filter starting on "All", and the cart panel (lines, remove action, subtotal, shipping, total); show "No more in stock" when `addToCart` says so; keep the cart id in `localStorage` through `cart-session`.
- **Depends on:** S2
- **Done when:** `npm test` passes and, with `npm start`, the acceptance table of the spec holds by hand in the browser: filter, "Only 4 left", Kind of Blue not addable, Refactoring × 4 then "No more in stock", $4.99 vs free shipping, remove, reload keeps the cart, restart keeps no error.

## Tests

| Req | Test (file › name) | Level | Section |
|---|---|---|---|
| R1 | `shop-view` › card shows name, price `$39.99`, stock label; `static` › `/` serves the page | unit / integration | S2, S1 |
| R2 | `shop-view` › filter starts on all, books shows 2, all shows 4 | unit | S2 |
| R3 | `shop-view` › 30 → "30 in stock", 4 → "Only 4 left", 5 → "5 in stock" | unit | S2 |
| R4 | `shop-view` › 0 → "Out of stock" and `canAdd` false | unit | S2 |
| R5 | `cart-session` › adds one unit, adding again raises the same line to 2 | integration (real server) | S2 |
| R6 | `cart-session` › 409 gives "No more in stock" and the cart keeps Refactoring × 4 | integration | S2 |
| R7 | `shop-view` › cart panel lines `× 1 $39.99`, `× 2 $59.98`, subtotal `$99.97` | unit | S2 |
| R8 | `shop-view` › $29.99 → shipping $4.99, total $34.98; $74.98 → $0.00; empty → all $0.00; subtotal $50.00 → $0.00 | unit | S2 |
| R9 | `cart-session` › remove drops the whole line; panel view shows $39.99, $4.99, $44.98 | integration + unit | S2 |
| R10 | `cart-session` › second `openCart` with the same storage returns the same cart and lines | integration | S2 |
| R11 | `cart-session` › unknown stored id → new empty cart stored, no error; add on a stale cart recovers | integration | S2 |
| R12 | `static` › existing API routes unchanged (`/products`, `/carts` still JSON); `shop-view` › panel amounts equal the cart response values | integration / unit | S1, S2 |

`cart-session` integration tests run against the real `server` on port 0 with in-memory fake storage.

## Assumptions

- Node 22.18+ can `import` the `.js` files from the `.ts` tests without configuration (`"type": "module"` is already set).
- The catalogue is small, so loading all products once is fine; stock on the cards is not refreshed after adding (spec: cards show the catalogue's stock).
- `localStorage` is available in the demo browser.

## Risks

- **DOM code is not covered by automated tests.** Mitigated by keeping `app.js` thin and by the by-hand acceptance run in S3 and `/reviewer`.
- **`formatCents` copy can drift.** The parity test in S2 catches it.
- **Stale carts also fail on `POST` and `DELETE`** (the API answers 404 `CART_NOT_FOUND`, same as `GET`), not only when the page opens. `cart-session` handles all three the same way.
- **Cart response has no product names** (only `productId` and `qty`): the panel joins them with the loaded catalogue; a `productId` missing from it must not crash the panel.
- **Static serving is the only new exposure:** an explicit path whitelist, no file path built from user input.
- JS content type must be `text/javascript`, or browsers refuse the module scripts.
