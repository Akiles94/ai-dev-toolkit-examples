# Plan · SHOP-41 Fix the storefront's first QA findings

> Spec: [spec.md](spec.md) · Branch: `fix/SHOP-41-storefront-qa-findings` · Status: approved

## Approach

Three independent fixes, one section each, each with a test that reproduces the finding's walk at the
closest level the repository has (no browser test tool, no dependencies).

- **QA-02 (R3):** `POST /carts/:id/items` reads the body defensively. Unparsable JSON, `null`, arrays,
  numbers and strings give 400 `INVALID_ITEM` before `productId` is read. Tested over real HTTP
  against the exported `server`, as `tests/static.test.ts` does.
- **QA-01 (R1, R2):** the rule "when does the message clear" moves out of `app.js` into a pure
  function in `public/shop-view.js`, tested with `node:test`; `app.js` calls it on filter change,
  add and remove.
- **QA-03 (R4, R5):** CSS only, inside the existing `@media (max-width: 40rem)` block. The cart panel
  is docked at the bottom of the viewport (`position: sticky; bottom: 0`), with a maximum height of
  about 40% of the screen. The lines list scrolls inside it; message and totals stay visible. The
  markup, the DOM order and the desktop rules do not change.

**Discarded:**
- Cart first / sticky at the top on phones: pushes the products down.
- A header count linking to the cart, or the message next to the pressed button: the person still would not see the total.
- A browser test tool (Playwright): adds a dependency, against `AGENTS.md`.
- A test that reads `style.css` for the media rule: brittle and proves little.
- Fixing every body-reading endpoint, or changing `readJson` for all callers: out of scope (spec).

## Structure

| Path | Responsibility | New / changed |
|---|---|---|
| `src/server.ts` | Guard the body of `POST /carts/:id/items`: parse failure or non-object → 400 `INVALID_ITEM` | Changed |
| `public/shop-view.js` | `messageAfter(event, current)`: when the cart message clears | Changed |
| `public/app.js` | Call `messageAfter` on filter change, add and remove | Changed |
| `public/style.css` | Narrow-screen docked cart | Changed |
| `tests/server-items.test.ts` | Bad bodies over HTTP, valid body still works | New |
| `tests/shop-view.test.ts` | `messageAfter` cases | Changed |

`src/utils.ts` is not touched: the structure migration (split by subject) is scheduled right after
this ticket, and `readJson` keeps its behaviour for other callers.

## Reuse

- `readJson` and `isPositiveInt` stay; the server catches the parse error and checks the shape.
- `INVALID_ITEM` is the code the endpoint already uses for qty 0, "2" and 1.5.
- The `before/after` server setup on port 0 from `tests/static.test.ts` is copied, not extracted
  (two files; no shared helper until a third).
- `messageAfter` follows the existing pattern: pure logic in `shop-view.js`, DOM in `app.js`.

## Decisions

- QA-03: cart docked at the bottom on narrow screens, CSS only. Discarded: cart first, sticky at the top.
- Tests: pure function for the message (`node:test`); R4 checked by hand in `/reviewer` and by walks 02 and 09 in QA pass 2. Discarded: browser tool, stylesheet-reading test.
- Sections: three, one per finding. Discarded: a single section.

## Sections

| # | Name | Intent | Main files | Est. lines | Covers |
|---|---|---|---|---|---|
| S1 | Bad cart-item bodies | QA-02: 400 `INVALID_ITEM` for non-object or unparsable bodies | `src/server.ts`, `tests/server-items.test.ts` | ~10 (+~45 tests) | R3 |
| S2 | Message clears | QA-01: `messageAfter` and its use in the page | `public/shop-view.js`, `public/app.js`, `tests/shop-view.test.ts` | ~15 (+~25 tests) | R1, R2 |
| S3 | Phone cart | QA-03: docked cart on narrow screens | `public/style.css` | ~25 | R4, R5 |

### S1 · Bad cart-item bodies

- **Goal:** Test first. Write the failing HTTP tests, then guard the body: catch the parse error and
  require a non-null, non-array object before reading `productId` and `qty`; answer
  400 `INVALID_ITEM`. The existing checks for `productId` and `qty` stay as they are.
- **Depends on:** —
- **Done when:** `tests/server-items.test.ts` passes with bodies `null`, `not json{`, `[]`, `5`,
  `"abc"` (each 400 `INVALID_ITEM`), qty 0 (still 400) and a valid body (200, item added); the
  other tests still pass; walk 08 steps 10 and 11 answer 400 (checked with `aidt qa walk` by hand).

### S2 · Message clears

- **Goal:** Test first. `messageAfter(event, current)` returns `""` for `filter-changed`, `added`
  and `removed`, and keeps `current` for an event that does not clear it. `app.js` sets
  `messageEl.textContent` from it in the category handler, in `add` (success) and in `remove`; the
  409 and error messages are still set where they happen. The helper gets the event names as
  strings, no new module.
- **Depends on:** — (independent of S1; builds on the page from SHOP-40)
- **Done when:** `tests/shop-view.test.ts` passes with the new cases; by hand, walk 02 step 14 shows
  an empty message after picking Games and after a successful add or a remove.

### S3 · Phone cart

- **Goal:** In the `max-width: 40rem` block, dock `#cart` at the bottom (`position: sticky;
  bottom: 0`, max height about 40vh, `#cart ul` scrolls, message and totals stay visible), and give
  `main` bottom padding so the last card is not hidden behind it. The desktop rules are untouched.
- **Depends on:** —
- **Done when:** by hand at 390 px wide: after «Add to cart» on Tetris Effect the new line and the
  total are in view with no scrolling; at the stock limit «No more in stock» is in view; at
  1280 px the page is as before (`npm test` still green).

## Tests

| Req | Test (file › name) | Level | Section |
|---|---|---|---|
| R1 | `tests/shop-view.test.ts` › `R1: messageAfter clears the message when the filter changes` (the walk 02 step 14 case: 409 message, then Games) | unit | S2 |
| R2 | `tests/shop-view.test.ts` › `R2: messageAfter clears the message on add and on remove` | unit | S2 |
| R3 | `tests/server-items.test.ts` › `R3: null body answers 400 INVALID_ITEM`, `R3: unparsable JSON ...`, `R3: array, number and string bodies ...` (walk 08 steps 10, 11) | integration (real HTTP) | S1 |
| R3 | `tests/server-items.test.ts` › `R3: qty 0 still answers 400 and a valid body still adds the item` | integration | S1 |
| R4 | No automated test (no browser tool). By hand in `/reviewer`, then walks 02 and 09 in QA pass 2 | manual | S3 |
| R5 | No automated test. By hand at 1280 px in `/reviewer`; `npm test` stays green | manual | S3 |

## Plan check

- **People:** the shopper on a phone (the finding), on desktop (must not change), and the person with bad intentions (the body guard). No staff or third parties in this block.
- **States:** message shown, then filter change, add, remove (S2). Cart empty on a phone: the docked panel must not hide the cards or cover them with empty space (S3). Offline error message («Something went wrong…») is also cleared by a filter change; accepted, it is also tied to one action.
- **Seams (older journeys QA will walk):** J1 browse and filter, J2 add (stock limit), J3 remove, J4 come back, offline (walk 06), API cart flow and hostile requests (walks 07, 08), phone layout (walk 09).
- **Contradictions:** none with `AGENTS.md` (errors are status codes with `{ "error": "CODE" }`) or with the SHOP-40 spec (R6 only asks for the message at the failed add). The migration in `.aidt/status.md` is not blocked: `src/utils.ts` is untouched.
- **Official data:** none shown or changed.
- **Business / promises:** no price, tax or shipping change; no page text changes.
- **Out of scope:** written in the spec (QA-04, other endpoints, tablet widths, other browsers).
- The check changed the plan in two places: the bottom padding in S3, so the docked cart does not hide the last card, and the explicit note that the error message is also cleared on filter change.

## Assumptions

- Sticky positioning at the bottom works inside the one-column grid of `main` in Chromium (the QA browser); it needs a manual look at 390 px.
- Node's `fetch` can send the raw bodies `null` and `not json{` with a JSON content type; the server does not check the content type.
- `messageAfter` returning `""` on add success matches today's behaviour exactly, so R2 is already true and the test locks it.

## Risks

- The docked panel takes about 40% of a phone screen once the cart has lines; a second QA pass may call that a new finding. Mitigation: the lines scroll, and the maximum height is one value in CSS.
- R4 and R5 have no automated test: a later CSS change could break the phone cart unnoticed until the next QA pass.
- The server guard must run before `body.productId`; a guard added after would still throw on `null`. Test first catches this.
- Money stays in integer cents; nothing in this plan touches it.
