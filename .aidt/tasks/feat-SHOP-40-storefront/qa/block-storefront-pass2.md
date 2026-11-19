# QA · feat/SHOP-40-storefront · block · pass 2

> Walked: `ed50c12` on `fix/SHOP-41-storefront-qa-findings` (clean tree, so the verdict binds to this commit) · Plan: `.aidt/tasks/fix-SHOP-41-storefront-qa-findings/plan.md` · First report: `block-storefront.md` · Verdict: **FAIL** (no 🔴; one new 🟡 that nobody owns)

## Scope

| Journey | Why it is in scope | People | States tried | Covered |
|---|---|---|---|---|
| QA-01 stale message | first-pass finding | Shopper desktop | 409 on fifth Refactoring, then filter Games | ✅ walk 02 (2 runs) |
| QA-02 null / malformed body | first-pass finding | Bad intentions | the whole of walk 08 (null, `not json{`, qty 0, -1, 1e9, "2", 1.5, unknown product/cart, static paths) | ✅ walk 08 (2 runs) |
| QA-03 phone cart | first-pass finding | Shopper phone | add 2 items; long cart (3 lines) with the 409 message; filter change; reload | ✅ walks 09, 10 (2 runs each) |

Not covered: see below. Not built yet, on purpose: as in pass 1.

## First-pass findings

| Id | Result | Evidence |
|---|---|---|
| QA-01 | Fixed | walk 02 step 12 shows «No more in stock»; step 14, after picking Games, no longer shows it. Same on walk 10 step 8 (phone). |
| QA-02 | Fixed | walk 08 steps 10 and 11: `400 {"error":"INVALID_ITEM"}` for `null` and for `not json{`; the other bad bodies unchanged; 0 console errors, no 5xx. |
| QA-03 | Fixed, with a new problem (QA-05) | walk 09 step 4 screenshot: the cart is docked at the bottom with the lines and totals in view. Walk 10 step 6: «No more in stock» in red inside the dock. |
| QA-04 | Unchanged (ℹ️ note, not part of this fix) | still open for the user's decision in pass 1 |

## Findings

| Id | Sev. | Where | In one line |
|---|---|---|---|
| QA-05 | 🟡 | walk 10 steps 6 and 10 | On a phone the last cart line's «Remove» button is cut in half, with empty space under it |

### QA-05 · Phone: the cart list clips its last line

- **Walk:** `walks/10-phone-docked-cart-limit.json`, steps 6 and 10 (screenshots `.aidt/qa/10-phone-docked-cart-limit/06-shopper.png` and `10-shopper.png`)
- **Seen:** with three lines in the cart (Pragmatic Programmer, Tetris Effect, Refactoring × 4), the «Remove» button of the third line is cut off at its middle. In step 10 (Music filter, cart not overlapping anything) there is also a blank gap of about 50 px under the clipped button before «Subtotal», so the clip is not for lack of room. Nothing shows the list scrolls. The text log lists all three «Remove» buttons, so the buttons exist; a person sees half a button.
- **Expected:** every line of the cart and its «Remove» fully visible, or an evident way to reach it (spec goal: see what they would pay and change it). Also three lines is a normal cart.
- **Where in the code:** `public/style.css` in the narrow-screen block: `#cart ul { flex: 1 1 auto; min-height: 0; overflow-y: auto }` with `#cart { max-height: 40vh; display: flex }` (added by the fix for QA-03).
- **Proposed fix:** make the list take its content height up to the room left (the flex sizing is clipping it early), and show a scroll cue (a fade, or a visible scrollbar) when it does scroll; a walk with 4 lines at phone width to check the last «Remove» is whole.
- **Reproduced:** twice (two runs of walk 10, new browsers)

## Unconfirmed

- None

## Official data checked

None: no official data is involved in these fixes.

## Not covered

- **Very long cart on a phone** (4 or more lines, the dock at its 40vh limit): walk 10 has 3 lines; QA-05 suggests it is worse with more. A third pass would walk it after the fix.
- **Phone height shorter than the 844 px the tool uses** and landscape: not tried.
- **Shop restarted while a page is open, offline on load, other browsers:** as in pass 1 (still not covered).
- Walk 02 ends at step 16 as in pass 1: the selector asks for an enabled «Add to cart» on Kind of Blue, which does not exist (the button is disabled, screenshot 16 confirms), so that stop is the expected result, not a finding. The walk file is unchanged.

## Decisions for the user

- **QA-05: what happens to this 🟡?** (it decides the verdict)
  1. Fix it, then a third pass of walk 10 plus a 4-line cart walk (recommended; needs the user's yes, about 45 000 tokens).
  2. Accept it as it is (write it in `.aidt/app.md` «Known or accepted»); the verdict becomes PASS.
- **QA-04 (from pass 1): record as accepted until accounts exist?** 1. Yes (recommended). 2. No, open a ticket before checkout.

## Cost

Walks run: 4 walk files (02, 08, 09, 10; one new), 7 runs · I did not start or stop the shop and changed no data except carts · tokens: not shown by the tool
