# S3 · Phone cart

> Stack: [index](index.md) · Part 3 of 3 · Previous: [S2](s02-message-clears.md) · Next: none
> Verdict: PASS · Reviewed commit: `8694974` (second review; the first said FAIL)

## At a glance

| | |
|---|---|
| Reviewable lines | 25 (+25 / −0) in 1 file |
| Tests | 0 lines in 0 files |
| Filtered | 0 lines of noise, 0 of config |
| Covers | R4, R5 |
| Reading time | ~3 min |

## Predict first

🤔 On a phone the page is one column: product cards, then the cart as the last grid item. `#cart` is `position: sticky; bottom: 0`. Does it dock at the bottom of the screen while the cards scroll, or does it stay below the last card?

(The first review predicted it would stay below the cards. It was wrong; see "What changed since the first review".)

## What it does

Inside the existing `@media (max-width: 40rem)` block, the cart panel is docked at the bottom of the screen, at most 40vh tall. The lines list scrolls inside it, while the message and totals stay visible. Desktop rules are not changed.

## Walkthrough

Input: a 390 px wide screen, all four product cards loaded, the shopper presses «Add to cart» on Tetris Effect, then on Refactoring (QA walk 09).

1. `public/style.css:109-111` → one column: the cart comes after `#products` (`public/index.html:22-23`).
2. `public/style.css:113-120` → `#cart` is `sticky; bottom: 0`, a flex column, `max-height: 40vh`, with a shadow on its top edge.
3. `public/style.css:127-131` → `#cart ul` takes the spare height and scrolls (`min-height: 0; overflow-y: auto`).
4. `public/style.css:133-136` → `#message` and `#cart-totals` do not shrink, so they stay in view.
5. Result, seen in `.aidt/qa/09-phone-layout/04-shopper.png` (replayed on this commit's CSS): the cart sits at the bottom edge over the third card; both lines (Tetris Effect × 1 $29.99, Refactoring × 1 $44.99) and Subtotal $74.98, Shipping $0.00, Total $74.98 are in view; the fourth card is not on screen, so the cart is docked, not in its place in the flow.

## Reading order

1. 🧠 [`public/style.css`](../../../../public/style.css) · read carefully: lines 108-137 (the media block)

## Affected flows

- **Direct:** the cart panel on narrow screens (QA walks 02 and 09).
- **Indirect:** none above 40rem; the rules sit in the media block.

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R4 | `public/style.css:113-136` | None, manual by plan: walk 09 at 390 px, screenshot `04-shopper.png` | ✅ Met for the line and total case. The «No more in stock» message is not in that screenshot; its element sits between the lines and the totals in a block that does not shrink (`style.css:133-136`, `index.html:25`), so it is in view when set. Walk 02 on a phone in QA pass 2 will show it. |
| R5 | `public/style.css` media block only | None, manual by plan | ✅ Met: no rule outside the media block changed (`git diff` is +25 lines at 112-136 only) |

Gates on `8694974`: `npm test` 41/41, `aidt check` ok (S3 25 lines, 5/5 requirements with a test), `aidt clean --check` ok. `public/`, `src/` and `tests/` are identical at the current `HEAD`.

## Findings

- None

## What changed since the first review

The first review gave FAIL because, by reading the CSS, a sticky box inside its own grid row has no room to move. The screenshot of the real page at 390 px shows the cart does dock in Chromium, so the finding is withdrawn. A review of CSS layout needs a browser look; this one now has it.
The plan also named bottom padding on `main`. It is absent and not needed: `sticky` is not `fixed`, so when the shopper reaches the end of the page the cart returns to its place in the flow and covers nothing. Not a deviation that changes behaviour.

## Quality

| Dimension | Rating | Why |
|---|---|---|
| Structure | ✅ | CSS only, inside the existing media block. |
| Practices | ✅ | Desktop rules untouched. |
| Readability | ✅ | Small rules per element. |
| Maintainability | ✅ | The 40vh limit is one value. |
| Performance | ➖ | Nothing that scales. |
| Security | ➖ | No input. |
| Tests | 🟡 | No automated test for R4 and R5, by plan; the phone layout is guarded only by QA walks 02 and 09. |

- No suggestions

## Questions for the author

- None
