# SHOP-41 · Fix the storefront's first QA findings (QA-01, QA-02, QA-03)

> Branch: `fix/SHOP-41-storefront-qa-findings` · Source: `.aidt/tasks/feat-SHOP-40-storefront/qa/block-storefront.md` (pass 1) · Mode: light · Status: approved

## Goal

The three 🟡 findings of the storefront's first QA pass are fixed, so a second pass can give PASS:
no stale message on the page, a clear 400 for bad cart-item bodies, and visible feedback on a phone.

## Requirements

- **R1** A message tied to one action («No more in stock») disappears when the person changes the category filter.
- **R2** The same message also disappears on any new action (a successful add, a remove).
- **R3** `POST /carts/:id/items` answers `400 { "error": "INVALID_ITEM" }` when the body is not a JSON object: `null`, unparsable JSON, an array, a number or a string.
- **R4** On a phone-width screen, the cart (lines, subtotal, shipping, total) and the «No more in stock» message are visible without scrolling past the product cards, so pressing «Add to cart» visibly changes what the person sees.
- **R5** On desktop width the layout and behaviour stay as they are.

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

## Out of scope

- QA-04 (cart id is the only secret): accepted until accounts exist.
- Other endpoints that read a body (`POST /carts`, …): only `POST /carts/:id/items`.
- Tablet widths, other browsers, offline-on-load, restart-while-open (listed as "Not covered" in the QA report).
- A cart badge, quantity selector, loading state (not built on purpose).

## Decisions

- QA-03: the cart is always in view on narrow screens. Discarded: a header count linking to the cart, and a message next to the pressed button.
- QA-03 applies to phone widths only; desktop unchanged.
- QA-02: any non-object body is 400 `INVALID_ITEM`, only on `POST /carts/:id/items`. Discarded: fixing every body-reading endpoint.
- QA-01: any new action or filter change clears the message. Discarded: clearing only on filter change.

## Open questions

- None
