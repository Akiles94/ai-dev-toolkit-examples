# SHOP-41 · Fix the storefront's QA findings (QA-01, QA-02, QA-03, QA-05)

> Branch: `fix/SHOP-41-storefront-qa-findings` · Source: `.aidt/tasks/feat-SHOP-40-storefront/qa/block-storefront.md` (pass 1) and `block-storefront-pass2.md` (QA-05, walk 10) · Mode: light · Status: approved

## Goal

The 🟡 findings of the storefront's QA passes are fixed, so a third pass can give PASS: no stale message
on the page, a clear 400 for bad cart-item bodies, visible feedback on a phone, and on a phone a cart
whose lines and «Remove» buttons are not cut off (QA-05, found in pass 2 in the fix for QA-03).

## Requirements

- **R1** A message tied to one action («No more in stock») disappears when the person changes the category filter.
- **R2** The same message also disappears on any new action (a successful add, a remove).
- **R3** `POST /carts/:id/items` answers `400 { "error": "INVALID_ITEM" }` when the body is not a JSON object: `null`, unparsable JSON, an array, a number or a string.
- **R4** On a phone-width screen, the cart (lines, subtotal, shipping, total) and the «No more in stock» message are visible without scrolling past the product cards, so pressing «Add to cart» visibly changes what the person sees.
- **R5** On desktop width the layout and behaviour stay as they are.
- **R6** On a 390 × 844 phone, a cart of up to 3 lines shows every line and its «Remove» button whole (nothing cut), together with the message and the totals, with no scrolling inside the cart.
- **R7** On the same phone, when a cart has more lines than fit, the list scrolls and shows a visible sign that there is more (a fade, a partly shown next line or a scrollbar); the message and the totals stay in view.

## Acceptance criteria

| Req | Given | When | Then |
|---|---|---|---|
| R1 | Refactoring ×4 in the cart, a fifth add showed «No more in stock» | the person picks Games | the message is empty |
| R2 | «No more in stock» is shown | the person adds Tetris Effect, or removes a line | the message is empty (or that action's own message) |
| R3 | an existing cart | `POST /carts/{id}/items` with body `null` | 400 `INVALID_ITEM` |
| R3 | an existing cart | body `not json{` | 400 `INVALID_ITEM` |
| R3 | an existing cart | body `[]`, `5` or `"abc"` | 400 `INVALID_ITEM` |
| R3 | an existing cart | a body with qty 0 (already handled), and a valid body | qty 0 still 400 `INVALID_ITEM`; the valid body still adds the item |
| R4 | a 390 px wide screen | the person presses «Add to cart» on Tetris Effect | the cart with the new line and total is in view, no scrolling |
| R4 | a 390 px wide screen, stock limit reached | the fifth add on Refactoring | «No more in stock» is in view |
| R5 | a 1280 px wide screen | the page loads | cards and cart as before this ticket |
| R6 | a 390 × 844 phone, cart with The Pragmatic Programmer, Tetris Effect and Refactoring × 4 (walk 10) | the person looks at the cart | all three lines show their «Remove» whole, then «Subtotal», «Shipping», «Total»; no gap that clips a button |
| R6 | the same cart, «No more in stock» shown | the fifth Refactoring add | the message, the three lines and the totals are all whole and in view |
| R6 | the same cart | the person picks Music | the cart looks the same (nothing overlaps or clips) |
| R7 | a 390 × 844 phone, a cart of 5 lines (cannot be built with today's catalogue, see Edge cases) | the person looks at the cart | the list shows a sign that it scrolls, the last visible «Remove» is never cut in half without that sign, and the totals are in view |

## Edge cases

- **Longest cart today:** the catalogue has 4 products and Kind of Blue is out of stock, so a cart has at most 3 lines. R7 cannot happen until the catalogue grows; R6 covers every cart the shop can produce now.

## Out of scope

- QA-04 (cart id is the only secret): accepted until accounts exist.
- Other endpoints that read a body (`POST /carts`, …): only `POST /carts/:id/items`.
- Tablet widths, other browsers, offline-on-load, restart-while-open (listed as "Not covered" in the QA reports).
- Phones shorter than 844 px and landscape (not tried by the QA tool): R6 and R7 are for 390 × 844.
- Changing the catalogue or the stock to make a 5-line cart possible.
- A cart badge, quantity selector, loading state (not built on purpose).

## Decisions

- QA-03: the cart is always in view on narrow screens. Discarded: a header count linking to the cart, and a message next to the pressed button.
- QA-03 applies to phone widths only; desktop unchanged.
- QA-02: any non-object body is 400 `INVALID_ITEM`, only on `POST /carts/:id/items`. Discarded: fixing every body-reading endpoint.
- QA-05: carts of up to 3 lines are shown whole; longer ones scroll with a visible sign. Discarded: up to 4 lines whole, and a cart that grows without limit (it would cover the cards again).
- QA-05: the scroll sign is required, not optional. Discarded: relying on a whole last line.
- QA-05: for a 390 × 844 phone only. Discarded: also a shorter phone, such as 390 × 667.
- QA-01: any new action or filter change clears the message. Discarded: clearing only on filter change.

## Open questions

- None
