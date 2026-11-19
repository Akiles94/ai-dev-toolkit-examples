# S2 · Message clears

> Stack: [index](index.md) · Part 2 of 3 · Previous: [S1](s01-bad-cart-item-bodies.md) · Next: [S3](s03-phone-cart.md)
> Verdict: PASS · Reviewed commit: `920a964`

## At a glance

| | |
|---|---|
| Reviewable lines | 16 (+13 / −3) in 2 files |
| Tests | 14 lines in 1 file |
| Filtered | 0 lines of noise, 0 of config |
| Covers | R1, R2 |
| Reading time | ~3 min |

## Predict first

🤔 After «No more in stock» is shown, the shopper picks Games. Before this change, which line of `app.js` would have had to clear the message, and did it exist?

## What it does

A new pure function `messageAfter(event, current)` says when the cart message ends: on a filter change, a successful add and a remove it returns an empty string; for any other event it keeps the current text. The page calls it in those three places, so the stale message no longer survives a filter change.

## Walkthrough

Input: 4 × Refactoring already in the cart; a fifth add answers 409 and the page shows «No more in stock»; then the shopper picks Games.

1. `public/app.js:73-75` → the 409 sets the message (unchanged).
2. `public/app.js:96` → the category `change` handler calls `messageAfter("filter-changed", "No more in stock")`.
3. `public/shop-view.js:27` → `"filter-changed"` is in `CLEARING_EVENTS` (`:24`), so it returns `""`.
4. `public/app.js:96-97` → the message element is emptied, then `renderProducts()` draws Games.
5. A later successful add (`app.js:76`) or remove (`app.js:83`) goes through the same function.

## Reading order

1. 🧠 [`public/shop-view.js`](../../../../public/shop-view.js) · read carefully: lines 24-28
2. ⚙️ [`public/app.js`](../../../../public/app.js) · skim: lines 76, 83, 95-98
3. ⚙️ [`tests/shop-view.test.ts`](../../../../tests/shop-view.test.ts) · skim: the three new tests at the end

## Affected flows

- **Direct:** browse and filter, add to cart, remove from cart on the storefront.
- **Indirect:** the offline message «Something went wrong. Try again.» is also cleared by a filter change. The plan accepts this.

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R1 | `public/app.js:95-98`, `public/shop-view.js:26-28` | `R1: messageAfter clears «No more in stock» when the filter changes` | ✅ Met |
| R2 | `public/app.js:76`, `:83` | `R2: messageAfter clears the message on a successful add and on a remove` | ✅ Met |

## Findings

- None

## Quality

| Dimension | Rating | Why |
|---|---|---|
| Structure | ✅ | Pure logic in `shop-view.js`, DOM in `app.js`, as the page already does. |
| Practices | ✅ | Event names as plain strings, no new module, as planned. |
| Readability | ✅ | `CLEARING_EVENTS` and `messageAfter` read as a rule. |
| Maintainability | 🟡 | Event names are string literals in `app.js` and the tests; a typo in `app.js` would silently keep the message. Acceptable at three call sites. |
| Performance | ➖ | Nothing that scales. |
| Security | ➖ | Uses `textContent`, no HTML. |
| Tests | ✅ | Covers clear, keep and the walk 02 case. The `app.js` wiring is not tested (no browser tool, by plan). |

- No suggestions

## Questions for the author

- None
