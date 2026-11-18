# S3 · Page wiring

> Stack: [index](index.md) · Part 3 of 3 · Previous: [S2](s02-page-logic.md) · Next: none
> Verdict: PASS · Reviewed commit: `c043ebf`

## At a glance

| | |
|---|---|
| Reviewable lines | 243 (+243 / −3) in 3 files |
| Tests | 0 lines in 0 files (DOM code, checked by hand; see the plan's risks) |
| Filtered | 0 lines of noise, 0 of config |
| Covers | R1–R11 (in the browser) |
| Reading time | ~10 min |

## Predict first

🤔 The cards show the catalogue's stock. After you add 2 units of Tetris Effect, should the card's "30 in stock" change? (The spec says no.)

## What it does

The page now works: it loads the products once, draws a card per product with its price and stock label, filters by category, and draws the cart panel. "Add to cart" and "Remove" call the S2 modules and redraw the panel. "Add to cart" is disabled when stock is 0. Text is set with `textContent`, never as HTML.

## Walkthrough

Input: open `/` with an empty storage, pick "books", add Refactoring.

1. `public/app.js:93-98` → `start` fetches `/products`, then `openCart(env)` creates a cart and stores its id.
2. `app.js:44-47` → `renderProducts` shows all 4 cards; "Kind of Blue" has its button disabled (`:35`, via `canAdd`).
3. `app.js:101` → choosing "books" fires `change`; `filterByCategory` leaves 2 cards.
4. `app.js:37` → click on "Add to cart" runs `add("refactoring")` through `run`.
5. `app.js:64-72` → `addToCart` returns the cart; `renderCart` shows "Refactoring × 1 $44.99", subtotal $44.99, shipping $4.99, total $49.98.
6. A failure anywhere is caught in `run` (`:85-90`) and shown as "Something went wrong. Try again."

## Reading order

1. 🧠 [`public/app.js`](../../../../public/app.js) · read carefully: `add`, `remove`, `run`, `start` (lines 64-103)
2. ⚙️ [`public/index.html`](../../../../public/index.html) · skim
3. ⚙️ [`public/style.css`](../../../../public/style.css) · skim

## Affected flows

- **Direct:** the storefront page at `/`.
- **Indirect:** none; no server or shared code changed.

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R1 | `app.js:31-42` | `static` › `/` serves the page; `shop-view` price format (logic); DOM by hand | ✅ Met |
| R2 | `index.html:15-20`, `app.js:44-47,101` | `shop-view` filter tests; DOM by hand | ✅ Met |
| R3, R4 | `app.js:35-38` | `shop-view` stock tests; DOM by hand | ✅ Met |
| R5, R6 | `app.js:64-72` | `cart-session` tests | ✅ Met |
| R7, R8 | `app.js:56-62` | `shop-view` panel tests | ✅ Met |
| R9 | `app.js:49-54,74-78` | `cart-session` remove tests | ✅ Met |
| R10, R11 | `app.js:93-98` | `cart-session` tests | ✅ Met |

All 34 tests pass, and every requirement has a test (`aidt check`: 12/12). The DOM layer itself has no automated test, as the plan decided; its logic is in the tested modules.

## Findings

- None

## Quality

| Dimension | Rating | Why |
|---|---|---|
| Structure | ✅ | DOM code only draws and listens, as planned. |
| Practices | ✅ | Small functions, one level of abstraction each. |
| Readability | ✅ | Clear names, header comment says the module's role. |
| Maintainability | ✅ | Logic lives in tested modules. |
| Performance | ✅ | Redraws small lists. |
| Security | ✅ | `textContent` only, no `innerHTML`. |
| Tests | 🟡 | No automated DOM test, a known plan risk; checked by hand and in the demo. |

### 🟡 `localStorage` can throw, and the page then never starts · `public/app.js:11` · Practices
In a browser that blocks storage, `openCart` throws inside `start`, so the page shows an error message instead of products already loaded. Optional hardening: fall back to an in-memory store. The plan lists "localStorage is available" as an assumption, so this is not blocking.

## Questions for the author

- None
