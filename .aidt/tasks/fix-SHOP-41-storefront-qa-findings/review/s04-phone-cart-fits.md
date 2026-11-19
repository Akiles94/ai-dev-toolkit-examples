# S4 · Phone cart fits

> Stack: [index](index.md) · Part 4 of 4 · Previous: [S3](s03-phone-cart.md) · Next: none
> Verdict: PASS · Reviewed commit: `5549861`

## At a glance

| | |
|---|---|
| Reviewable lines | 22 (+22 / −0) in 1 file |
| Tests | 0 lines in 0 files |
| Filtered | 0 lines of noise, 0 of config |
| Covers | R6, R7 (keeps R4, R5) |
| Reading time | ~3 min |

## Predict first

🤔 S3 docked the cart at 40% of a 844 px phone (about 337 px). Three cart lines, the message and the totals need about 390 px with S3's layout. Which rules shrink the cart without cutting the «Remove» buttons, and what tells the person a longer list scrolls?

## What it does

On a phone (`max-width: 40rem`) each cart line becomes one row: name, price, «Remove». The message has smaller margins and the panel less padding, so three lines, the message and the totals fit in the 40vh dock with no scrolling. A list longer than the dock scrolls inside it and shows a soft fade at the edge that has more lines. Desktop rules are not touched: every change is inside the media block.

## Walkthrough

Input: a 390 × 844 phone, cart with The Pragmatic Programmer × 1, Tetris Effect × 1, Refactoring × 4, and «No more in stock» shown (QA walk 10, step 6).

1. `public/style.css:123` → `#cart li` gets three columns `1fr auto auto`, items centred, padding 0.25rem: the line is one row.
2. `public/style.css:129` → the button goes back to its own column (`grid-column: auto`, no top margin) and keeps `min-height: 2.75rem` (44 px), a comfortable tap size.
3. `public/style.css:135` → `#message` margin 0.25rem instead of the default paragraph margin (about 32 px in total, the blank gap QA saw). Its `min-height: 1.25rem` (line 88) still reserves its space.
4. `public/style.css:119` → the panel padding is 0.75rem.
5. `public/style.css:144` → the list is the only part that scrolls (`flex: 1 1 auto; min-height: 0; overflow-y: auto`); message and totals are `flex: none` (line 155).
6. `public/style.css:148` → four backgrounds: two white `local` layers that cover two grey `scroll` shadows. A shadow shows only when there is content hidden beyond that edge.
7. Result in `.aidt/qa/10-phone-docked-cart-limit/06-shopper.png` (780 × 1688, a 2× capture of 390 × 844): the three lines with their «Remove» whole, «No more in stock», then Subtotal $249.94, Shipping $0.00, Total $249.94, all in view with no scrolling.

## Reading order

1. 🧠 [`public/style.css`](../../../../public/style.css): read carefully lines 123 to 153 (the 22 new lines)
2. ⚙️ [`public/style.css`](../../../../public/style.css): skim lines 67 to 90 (the base rules the media block overrides)

## Affected flows

- **Direct:** the cart on a phone: add, remove, stock limit, filter change (walks 02, 09, 10).
- **Indirect:** none. No markup or JavaScript changed, and the desktop cart does not use these rules.

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R6 | `public/style.css:119-137` | walk 10 step 6, `06-shopper.png` (manual by plan) | ✅ Met |
| R7 | `public/style.css:144-153` | none: a 5-line cart cannot be built today; by plan, by hand in DevTools | ⚠️ Partial: correct by reading, never seen rendered |
| R4 (kept) | `public/style.css:113-121` | same screenshot: message and totals in view | ✅ Met |
| R5 (kept) | all new rules inside `@media (max-width: 40rem)` | `npm test` green; no desktop rule changed | ✅ Met |

## Findings

- None

## Quality

| Dimension | Rating | Why |
|---|---|---|
| Structure | ✅ | One CSS file, inside the media block S3 opened; no markup moved |
| Practices | ✅ | CSS only, no dependency, desktop untouched, as the plan says |
| Readability | 🟡 | The four-layer background has no comment saying why (see suggestion) |
| Maintainability | 🟡 | `#fff` is repeated in two gradients and must match the panel colour at line 34 |
| Performance | ➖ | Static CSS; `local` backgrounds cost nothing that matters |
| Security | ➖ | No input, no HTML |
| Tests | 🟡 | No automated test (no browser tool, by plan); R7 has no evidence yet |

### 🟡 Say why the list has four backgrounds · `public/style.css:148` · Readability
A newcomer will not know the first two layers hide the last two. One comment saves a "cleanup" that breaks the sign.
```suggestion
    /* Scroll shadows: the white "local" layers cover the grey "scroll" shadows
       until there is more content to scroll to. #fff must match #cart. */
    background:
```

## Questions for the author

- R7: was the scroll fade seen with 5 lines added in DevTools? The plan asks for it; the review had no browser. If it was not, do it before the third QA pass.
