# QA · feat/SHOP-40-storefront · block · pass 1

> Walked: `e915426` (source and tests unchanged; the only uncommitted changes are `.aidt/app.md` and the qa walks and report, so the code verdict binds to `e915426`) · Plan: `.aidt/tasks/feat-SHOP-40-storefront/plan.md` · Verdict: **FAIL** (no 🔴; three 🟡 that nobody owns yet)

## Scope

| Journey | Why it is in scope | People | States tried | Covered |
|---|---|---|---|---|
| J1 Browse and filter | changed (new page) | Shopper desktop | first visit; Books, Music, All | ✅ walk 01 |
| J2 Add to cart | changed | Shopper desktop, flaky | totals under and over $50; same product twice (one line); stock limit 4 then "No more in stock"; Kind of Blue disabled; double and triple tap | ✅ walks 02, 05 |
| J3 Remove | changed | Shopper desktop | remove one line, remove the last line | ✅ walk 03 |
| J4 Come back | changed | Shopper desktop | reload; leave and back; storage cleared | ✅ walk 04 |
| Offline | changed | Shopper flaky | offline on add and on remove, then retry | ✅ walk 06 (steps 1-12) |
| API cart flow | touched: built for one caller, now a browser stores the id | Bad intentions | foreign cart id: read, add, delete | ✅ walk 07 |
| `POST /carts/:id/items`, `GET /products`, static paths, 404 fallback | touched | Bad intentions | qty 0, -1, 1e9, "2", 1.5; unknown product; out-of-stock product; null and malformed body; unknown cart; `/../package.json`, `/%2e%2e/`, `/index.html`, `/src/server.ts`, `/unknown`, `POST /` | ✅ walk 08 |
| Layout | changed | Shopper phone | four cards then the cart | partly: walk 09 |

Not built yet, on purpose (from the plan and spec): checkout, accounts, quantity selector, cart badge, loading state, stock going down. Not treated as findings.

## Findings

| Id | Sev. | Where | In one line |
|---|---|---|---|
| QA-01 | 🟡 | walk 02 step 14 | "No more in stock" stays on screen after the person changes the filter |
| QA-02 | 🟡 | walk 08 steps 10, 11 | `POST /carts/:id/items` with a `null` or malformed JSON body answers 500 `INTERNAL`, not a 400 |
| QA-03 | 🟡 | walk 09 step 4 | On a phone the cart is below all four cards, so "Add to cart" shows nothing |
| QA-04 | ℹ️ | walk 07 steps 4-6 | Whoever has a cart id can read and change that cart; ids are `cart-` plus 8 hex characters |

### QA-01 · Stale "No more in stock" message

- **Walk:** `walks/02-add-stock-limit.json`, step 14 (run it with `aidt qa walk <path>`)
- **Seen:** after Refactoring × 4 and a fifth add, the page shows «No more in stock». After picking Games (Refactoring no longer on screen) the text «No more in stock» is still in the cart panel, with nothing it refers to.
- **Expected:** a message tied to one action goes away when the person moves on (spec R6 only asks for the message at the moment of the failed add).
- **Where in the code:** `public/app.js:59-70` (the message is cleared only in `add` and `remove`; `categoryEl` change only calls `renderProducts`).
- **Proposed fix:** clear `messageEl` in the category change handler; a test that picks a category after a 409 and expects an empty message.
- **Reproduced:** twice (walk 02, two runs from new browsers)

### QA-02 · Malformed or null body gives 500

- **Walk:** `walks/08-hostile-requests.json`, steps 10 and 11
- **Seen:** `POST /carts/{cart}/items` with body `null` → `500 {"error":"INTERNAL"}`; with body `not json{` → `500 {"error":"INTERNAL"}`.
- **Expected:** a client mistake is a 400 with a code; `AGENTS.md`: errors are status codes with `{ "error": "CODE" }`, and the other bad bodies (qty 0, "2", 1.5) already answer `400 INVALID_ITEM`.
- **Where in the code:** `src/utils.ts` `readJson` (`JSON.parse` unguarded) and `src/server.ts:46-47` (`body.productId` on `null`). The page never sends these; the API is older than this block, but it is now public through the page's origin.
- **Proposed fix:** answer 400 `INVALID_ITEM` for unparsable or non-object bodies; tests for `null` and invalid JSON.
- **Reproduced:** twice (two runs of walk 08)

### QA-03 · Phone: adding gives no visible feedback

- **Walk:** `walks/09-phone-layout.json`, step 4 (screenshot `.aidt/qa/09-phone-layout/04-shopper.png`)
- **Seen:** at phone width the four cards fill the screen and the «Cart» heading starts at the bottom edge. After clicking «Add to cart» on Tetris Effect and Refactoring, the visible part of the page is unchanged (no button text change, no message in view). The «No more in stock» text, too, would appear under the fold.
- **Expected:** the person can tell the add worked and see what they would pay (spec goal: "see what they would pay"). No requirement covers the phone, so this is a gap, not a spec failure.
- **Where in the code:** `public/index.html` (cart `aside` after the products `section`), `public/style.css`.
- **Proposed fix:** one of: cart first or sticky on narrow screens, a count in the header linking to the cart, or the message placed next to the pressed button.
- **Reproduced:** twice (two runs of walk 09; same layout)

### QA-04 · The cart id is the only secret (note)

- **Walk:** `walks/07-foreign-cart.json`, steps 4, 5, 6
- **Seen:** a second person with the id got `200` with the full cart, added Pragmatic Programmer to it and removed Tetris Effect from it. The first person's page, after a reload, shows the changed cart with no hint.
- **Expected:** the spec leaves accounts out of scope, so this is consistent with the plan; recorded so it is a decision, not a surprise. The id is 8 hex characters, so it is guessable in principle, and the browser keeps it in `localStorage`.
- **Proposed fix:** none for now; when checkout comes, tie the cart to something longer than 32 bits.
- **Reproduced:** twice

## Unconfirmed

- None

## Official data checked

| Data | Shown | Source (link) | Read on | Result |
|---|---|---|---|---|
| Shipping free from $50 | $4.99 under $50.00 (walks 02, 03, 04), $0.00 above | the repository's `spec.md` and `AGENTS.md` (no external source) | 2026-11-18 | matches |

## Not covered

- **Shop restarted while a page is open** (R11 during an add, `addToCart` retry path): the walks cannot restart the shop, and I do not restart it. A cleared `localStorage` (walk 04) and an unknown id were exercised only through the page's start. A second pass can ask the user to restart the shop at a chosen step.
- **Offline on load** (walk 06 step 14): the browser cannot reload a page while offline, so what the person sees when `/products` fails at start is not seen. Reading `public/app.js` (`run(start)`), the message is shown and there are no cards and no retry besides a reload.
- **Odd values (`<b>`, emoji, accents):** the page has no text input, so there was nothing to type into; product names come from the catalogue.
- **Phone width:** only the first screen (viewport screenshot); no scroll to the cart panel.
- **Other browsers:** only desktop Chromium.

## Decisions for the user

- **QA-01, QA-02, QA-03: what happens to each 🟡?** (they decide the verdict)
  1. Fix all three, then a second pass (recommended: about 90 000 tokens at most; each fix is small).
  2. Fix QA-01 and QA-03, and accept QA-02 as an API issue for another ticket (write it in `.aidt/app.md` «Known or accepted»).
  3. Accept some or all as they are (write each in «Known or accepted»); the verdict becomes PASS for the accepted ones.
- **QA-04: record as accepted?**
  1. Yes, add it to «Known or accepted» until accounts exist (recommended).
  2. No, open a ticket before checkout.

## Cost

Walks run: 9 walk files, 15 runs · tokens: not shown by the tool
