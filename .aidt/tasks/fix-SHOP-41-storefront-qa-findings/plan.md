# Plan · SHOP-41 Fix the storefront's QA findings

> Spec: [spec.md](spec.md) · Branch: `fix/SHOP-41-storefront-qa-findings` · Status: approved (S1 to S3 approved and built on 2026-11-18; S4 added and approved on 2026-11-19 for QA-05)

## Approach

Four independent fixes, one section each, each with a test that reproduces the finding's walk at the
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
- **QA-05 (R6, R7), added after QA pass 2:** CSS only, in the same narrow-screen block, no markup change.
  *Cause, read from the CSS (not measured in a browser):* the dock is capped at 40vh (337 px at
  844 px of height) and the 3-line walk 10 cart needs about 390 px: each line is about 72 px because
  «Remove» has its own row, and `#message` keeps the default paragraph margins (about 32 px), which
  is the blank gap QA saw. So the list is really squeezed, not short of room by mistake.
  *Fix:* (1) on phones each line is one row, name | price | «Remove» (`#cart li` gets three columns
  and the button loses its own row), keeping a comfortable tap size; (2) smaller margins on
  `#message` and smaller padding on `#cart`; the cart then needs about 270 px; (3) a scroll sign on
  `#cart ul` made of CSS "scroll shadows" (a soft fade at the top or bottom edge only while there is
  more to scroll to), because phones hide overlay scrollbars.

**Discarded:**
- QA-05: raising the dock to about 50vh (covers half the phone, and breaks again with one more line).
- QA-05: a thin always-visible scrollbar as the sign (not reliable on phones).
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
| `public/style.css` | Narrow-screen docked cart (S3); compact cart lines and scroll sign (S4) | Changed |
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
- Sections: one per finding (S1 to S3, now S4 for QA-05). Discarded: a single section.
- QA-05: compact the cart on phones and keep the 40vh cap, with CSS scroll shadows as the scroll sign. Discarded: a 50vh cap; a scrollbar as the sign.
- QA-05 tests: none automated (CSS, no browser tool); R6 by hand and by replaying walk 10; R7 by hand with extra lines added in DevTools, because the catalogue only allows 3 lines.

## Sections

| # | Name | Intent | Main files | Est. lines | Covers |
|---|---|---|---|---|---|
| S1 | Bad cart-item bodies | QA-02: 400 `INVALID_ITEM` for non-object or unparsable bodies | `src/server.ts`, `tests/server-items.test.ts` | ~10 (+~45 tests) | R3 |
| S2 | Message clears | QA-01: `messageAfter` and its use in the page | `public/shop-view.js`, `public/app.js`, `tests/shop-view.test.ts` | ~15 (+~25 tests) | R1, R2 |
| S3 | Phone cart | QA-03: docked cart on narrow screens | `public/style.css` | ~25 | R4, R5 |
| S4 | Phone cart fits | QA-05: compact lines so 3 fit, scroll sign for longer carts | `public/style.css` | ~20 | R6, R7 (keeps R4, R5) |

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

### S4 · Phone cart fits

- **Goal:** In the `max-width: 40rem` block of `public/style.css`, and nowhere else (no markup, no
  JavaScript, desktop rules untouched): (1) `#cart li` in three columns (name, price, «Remove») with
  the button back on the same row (undo the S3-era `grid-column: 1 / -1` and top margin for phones
  only), keeping a tap target of about 44 px; (2) smaller `#message` margins and smaller `#cart`
  padding, keeping the reserved message height so nothing jumps when the message appears; (3) CSS
  scroll shadows on `#cart ul` (top and bottom fade, shown only while there is content to scroll to).
- **Depends on:** S3 (it changes the rules S3 added).
- **Done when:** by hand at 390 × 844 with `npm start`, replaying walk 10 (the QA tool at
  `aidt qa walk .aidt/tasks/feat-SHOP-40-storefront/qa/walks/10-phone-docked-cart-limit.json`): the
  3-line cart shows every «Remove» whole, then the totals, with no scrolling and no gap that clips a
  button (steps 6 and 10), and «No more in stock» is in view with them. For R7, with extra `li`
  lines added in DevTools to make 5 lines, the list scrolls, the fade shows at the edge that has
  more, and message and totals stay in view. At 1280 px the page is as before; `npm test` is green.

## Tests

| Req | Test (file › name) | Level | Section |
|---|---|---|---|
| R1 | `tests/shop-view.test.ts` › `R1: messageAfter clears the message when the filter changes` (the walk 02 step 14 case: 409 message, then Games) | unit | S2 |
| R2 | `tests/shop-view.test.ts` › `R2: messageAfter clears the message on add and on remove` | unit | S2 |
| R3 | `tests/server-items.test.ts` › `R3: null body answers 400 INVALID_ITEM`, `R3: unparsable JSON ...`, `R3: array, number and string bodies ...` (walk 08 steps 10, 11) | integration (real HTTP) | S1 |
| R3 | `tests/server-items.test.ts` › `R3: qty 0 still answers 400 and a valid body still adds the item` | integration | S1 |
| R4 | No automated test (no browser tool). By hand in `/reviewer`, then walks 02 and 09 in QA pass 2 | manual | S3 |
| R5 | No automated test. By hand at 1280 px in `/reviewer`; `npm test` stays green | manual | S3, S4 |
| R6 | No automated test. Walk 10 steps 6 and 10 replayed at 390 × 844 (the QA's walk for QA-05, closest level without a browser tool), and by hand in `/reviewer` | manual (walk) | S4 |
| R7 | No automated test. By hand with 5 lines added in DevTools (a 5-line cart cannot be built with today's catalogue, so no walk can do it) | manual | S4 |

## Plan check

- **People:** the shopper on a phone (the finding), on desktop (must not change), and the person with bad intentions (the body guard). No staff or third parties in this block.
- **States:** message shown, then filter change, add, remove (S2). Cart empty on a phone: the docked panel must not hide the cards or cover them with empty space (S3). Offline error message («Something went wrong…») is also cleared by a filter change; accepted, it is also tied to one action.
- **Seams (older journeys QA will walk):** J1 browse and filter, J2 add (stock limit), J3 remove, J4 come back, offline (walk 06), API cart flow and hostile requests (walks 07, 08), phone layout (walk 09).
- **Contradictions:** none with `AGENTS.md` (errors are status codes with `{ "error": "CODE" }`) or with the SHOP-40 spec (R6 only asks for the message at the failed add). The migration in `.aidt/status.md` is not blocked: `src/utils.ts` is untouched.
- **Official data:** none shown or changed.
- **Business / promises:** no price, tax or shipping change; no page text changes.
- **Out of scope:** written in the spec (QA-04, other endpoints, tablet widths, other browsers).
- **Added for S4:** *States:* cart with 0, 1, 2 and 3 lines (the compact row must also look right with one short line), the message shown and hidden, the Music filter (walk 10 step 10), a reload with the cart kept. *Seams:* walks 02, 09 and 10 are re-walked, and the cart on desktop (R5) must not change. *Contradictions:* the 40vh cap of S3 stays; R4 (everything in view without scrolling past the cards) still holds. *Promises/official data:* none.
- The check changed the plan in two places: the bottom padding in S3, so the docked cart does not hide the last card, and the explicit note that the error message is also cleared on filter change.

## Assumptions

- Sticky positioning at the bottom works inside the one-column grid of `main` in Chromium (the QA browser); it needs a manual look at 390 px.
- Node's `fetch` can send the raw bodies `null` and `not json{` with a JSON content type; the server does not check the content type.
- `messageAfter` returning `""` on add success matches today's behaviour exactly, so R2 is already true and the test locks it.

- The 270 px estimate for the compact cart comes from reading the CSS; the real height must be seen at 390 × 844.
- Scroll shadows work with `background-attachment: local` in current Chromium and Safari; no JavaScript is needed.

## Risks

- S4: a smaller «Remove» row could shrink the tap target below a comfortable size; the plan keeps about 44 px, and a QA pass on a real phone is the check.
- S4: R7 is never exercised by a walk until the catalogue grows; a later CSS change could break the scroll sign unnoticed.
- S4: a very short phone or landscape is out of scope (spec), so the cart may still clip there.
- The docked panel takes about 40% of a phone screen once the cart has lines; a second QA pass may call that a new finding. Mitigation: the lines scroll, and the maximum height is one value in CSS.
- R4 and R5 have no automated test: a later CSS change could break the phone cart unnoticed until the next QA pass.
- The server guard must run before `body.productId`; a guard added after would still throw on `null`. Test first catches this.
- Money stays in integer cents; nothing in this plan touches it.
