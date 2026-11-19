# QA · feat/SHOP-40-storefront · block · pass 3

> Walked: `b5930fa` on `fix/SHOP-41-storefront-qa-findings` (clean tree at the start, so the verdict binds to this commit) · Plan: `.aidt/tasks/fix-SHOP-41-storefront-qa-findings/plan.md` · Previous report: `.aidt/tasks/feat-SHOP-40-storefront/qa/block-storefront-pass2.md` · Verdict: **PASS for the approved scope (QA-05 only)**; no new findings.

## Scope

The user narrowed this pass to QA-05 and what S4 could break. Nothing else was walked.

| Journey | Why it is in scope | People | States tried | Covered |
|---|---|---|---|---|
| QA-05 phone cart fits (R6) | pass-2 finding, fixed in S4 | Shopper phone (390 × 844) | 3 lines (Pragmatic, Tetris, Refactoring × 4); fifth add (409); Games; Music; reload | ✅ walk 10 |
| Phone stock limit (R4, R6) | the fifth add must show the message with lines and totals whole | Shopper phone | fifth Refactoring add, then Music | ✅ walk 11 (new) |
| Desktop 1280 layout (R5) | S4 changed `public/style.css` | Shopper desktop | empty cart, then the same 3-line cart with the message | ✅ walk 12 (new) |

Not walked on purpose (outside the approved scope): hostile bodies (QA-02, R3), double tap, offline add, foreign cart, reload with cleared storage, QA-01 on add and remove. They were not re-run after S4.

## Pass-2 finding

| Id | Result | Evidence |
|---|---|---|
| QA-05 | **Fixed** | Walk 10 step 5 (`.aidt/qa/10-phone-docked-cart-limit/05-shopper.png`): the three lines each show a whole «Remove», then Subtotal $249.94, Shipping $0.00, Total $249.94, with no scrolling inside the cart. Step 7: «No more in stock» in red between the last line and the totals; lines and totals whole. Step 11 (Music): cart identical, nothing overlaps or clips. Walk 11 steps 7 and 9 show the same. |

## Findings

None.

## Checked against the spec

| Req | Result | Where |
|---|---|---|
| R4 (fifth add, message in view) | ✅ | walk 11 step 7: message inside the docked cart, no scrolling |
| R5 (desktop unchanged) | ✅ | walk 12 step 7 against the pass-2 desktop screenshot (`.aidt/qa/02-add-stock-limit/12-shopper.png`): same card grid and sizes, cart panel in the same place and width, «Remove» under each line as before; the cart is not docked and not capped. The only difference is the third line, which the cart had no reason to match. |
| R6 (up to 3 lines whole, message and totals in view) | ✅ | walks 10 and 11 |
| R6 (Music keeps the cart the same) | ✅ | walk 10 step 11, walk 11 step 9 |
| R7 (5 lines scroll with a cue) | ⛔ not walkable | the catalogue allows at most 3 lines (spec «Edge cases») |

Also seen, without being asked: after the Games or Music filter the message is gone (walk 10 step 9, walk 11 step 9). That is QA-01's behaviour, but it was not walked as its own journey.

## Notes (not findings)

- ℹ️ On the phone, with no message showing, there is a gap of about 30 px (CSS) between the last line and «Subtotal»: the message row keeps its space. It clips nothing, and R6 asks only that no gap clips a button. Pass 2 recorded the same space next to the clipped button.
- ℹ️ The dock covers the lower part of the Tetris Effect card's button at 390 × 844 with 3 lines. That is how a dock works. I did not scroll down to check the last card stays reachable.
- ℹ️ Console: one error per walk, the expected 409 on the fifth Refactoring add. 0 page errors, no 5xx.
- ℹ️ QA-04 (a cart id is the only secret): unchanged and not re-walked; still waiting for the user's decision in `.aidt/status.md`.

## Unconfirmed

- None

## Official data checked

None: no official data is involved.

## Not covered

- R7's scroll cue (4 or more lines): cannot be built with the catalogue.
- Phones shorter than 844 px, landscape, tablet widths, other browsers.
- Everything listed under «Not walked on purpose» above.

## Decisions for the user

- None for this pass. If you want the full 9-walk scope (QA-01, QA-02, offline, foreign cart, reload) on `b5930fa` before merging, say so; it is a separate approval.

## Cost

3 walks (10 rerun, 11 and 12 new), 3 runs · the shop was not started or stopped, and only carts changed (3 new carts) · tokens: not shown by the tool.

Walks: `.aidt/tasks/fix-SHOP-41-storefront-qa-findings/qa/walks/10-phone-docked-cart-limit.json`, `11-phone-stock-limit.json`, `12-desktop-1280-layout.json`.
