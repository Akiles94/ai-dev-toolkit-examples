# S2 · Page logic

> Stack: [index](index.md) · Part 2 of 3 · Previous: [S1](s01-serve-the-page.md) · Next: [S3](s03-page-wiring.md)
> Verdict: PASS · Reviewed commit: `06da872`

## At a glance

| | |
|---|---|
| Reviewable lines | 97 (+97 / −0) in 2 files |
| Tests | 255 lines in 3 files |
| Filtered | 0 lines of noise, 0 of config |
| Covers | R2–R11 (logic), R12 |
| Reading time | ~10 min |

## Predict first

🤔 The cart API returns product ids and quantities, not names. If the page's catalogue does not contain an id from the cart, what should the cart panel show?

## What it does

Two plain-JavaScript modules hold every decision the page makes, with no DOM, so `node:test` can run them. `shop-view.js` turns products and a cart response into text: stock labels, the category filter, and the cart panel (line prices, and the amounts exactly as the server sent them). `cart-session.js` keeps the cart id in storage, reuses it on reload, starts a new empty cart when the shop no longer knows it, and answers "No more in stock" on a 409.

## Walkthrough

Input: the person adds Refactoring (4 in stock) a fifth time, with the cart already holding × 4.

1. `public/cart-session.js:45` → `addToCart` posts `{ productId, qty: 1 }` to `/carts/:id/items`.
2. The server answers 409 `OUT_OF_STOCK`.
3. `public/cart-session.js:51` → returns `{ error: "No more in stock" }`; the cart is not touched.
4. If the answer had been 404 `CART_NOT_FOUND` (shop restarted), `:46-49` starts a new cart (`:20-24`) and posts the item again.
5. `public/shop-view.js:28-35` → for a cart response, joins each `productId` with the catalogue and formats `priceCents × qty`; subtotal, shipping and total are only formatted, never recomputed.

## Reading order

1. 🧠 [`public/cart-session.js`](../../../../public/cart-session.js) · read carefully: `addToCart` and `removeFromCart` (lines 45-62)
2. 🧠 [`public/shop-view.js`](../../../../public/shop-view.js) · read carefully: `cartPanelView` (lines 24-41)
3. ⚙️ [`tests/cart-session.test.ts`](../../../../tests/cart-session.test.ts) · skim: real server on port 0
4. ⚙️ [`tests/shop-view.test.ts`](../../../../tests/shop-view.test.ts) · skim

## Affected flows

- **Direct:** none in the running app yet (the modules are loaded by S3).
- **Indirect:** the cart endpoints, called by `cart-session.js` as any client would; no server code changed.

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R2 | `shop-view.js:19-22` | `shop-view` › filter starts on all, books shows 2 | ✅ Met |
| R3 | `shop-view.js:8-13` | `shop-view` › 30, 4, 5 | ✅ Met |
| R4 | `shop-view.js:8-17` | `shop-view` › 0 is out of stock, cannot be added | ✅ Met |
| R5 | `cart-session.js:45-53` | `cart-session` › adds 1, again raises to 2 | ✅ Met |
| R6 | `cart-session.js:51` | `cart-session` › Refactoring × 4 then "No more in stock" | ✅ Met |
| R7 | `shop-view.js:24-41` | `shop-view` › lines and amounts | ✅ Met |
| R8 | amounts from the server | `shop-view` › $4.99, $0.00, $50.00, empty | ✅ Met |
| R9 | `cart-session.js:56-61` | `cart-session` › remove drops the line | ✅ Met |
| R10 | `cart-session.js:34-39` | `cart-session` › same storage, same cart | ✅ Met |
| R11 | `cart-session.js:10-24`, `:45-61` | `cart-session` › unknown id, add and remove on a stale cart | ✅ Met |
| R12 | `shop-view.js:24-30` | `shop-view` › amounts are the response's; `cart-session` › amounts from GET | ✅ Met |

## Findings

- None

## Quality

| Dimension | Rating | Why |
|---|---|---|
| Structure | ✅ | Pure logic split from DOM code, as the plan says. |
| Practices | ✅ | Errors as values (`{ error }`), storage and fetch passed in. |
| Readability | ✅ | Small named helpers, constants named (`LOW_STOCK_BELOW`, `CART_KEY`). |
| Maintainability | 🟡 | `formatCents` is copied from `src/utils.ts`; the parity test (`tests/shop-view.test.ts:24-28`) catches drift. Accepted in the plan. |
| Performance | ✅ | Linear in products and lines. |
| Security | ✅ | The stored cart id is the page's own value, used only in same-origin paths. |
| Tests | ✅ | Failing and edge cases covered (stale cart, unknown product, last line). |

- No suggestions

## Questions for the author

- None
