# Review · SHOP-41 · Fix the storefront's first QA findings

> Spec: [spec.md](../spec.md) · Plan: [plan.md](../plan.md) · Branch: `fix/SHOP-41-storefront-qa-findings` · Mode: light

## Summary

Three small fixes for the 🟡 findings of the storefront's first QA pass: a clear 400 for bad cart-item bodies, no stale cart message after a filter change, and a cart docked on phone screens. The first two are correct and tested. The third docks the cart on a phone, confirmed in a browser screenshot at 390 px (the first review had doubted it from the CSS alone).

## At a glance

| | |
|---|---|
| Reviewable lines | 57 in 3 sections |
| Tests | 75 lines |
| Filtered | 0 lines of noise, 0 of config |
| Requirements | 5 met · 0 partial · 0 missing |
| Quality | `Maintainability 🟡 S2`, `Tests 🟡 S3`, 0 suggestions |
| Reading time | ~10 min |

## Reading order

| # | Section | Lines | Kind | Verdict | PR |
|---|---|---|---|---|---|
| 1 | [S1 · Bad cart-item bodies](s01-bad-cart-item-bodies.md) | 16 | 🧠 logic | PASS | none yet |
| 2 | [S2 · Message clears](s02-message-clears.md) | 16 | 🧠 logic | PASS | none yet |
| 3 | [S3 · Phone cart](s03-phone-cart.md) | 25 | 🧠 CSS | PASS | none yet |
| 4 | [S4 · Phone cart fits](s04-phone-cart-fits.md) | 22 | 🧠 CSS | PASS | none yet |

## Requirement coverage

| Req | Sections | Tests | Status |
|---|---|---|---|
| R1 | S2 | ✅ | ✅ Met |
| R2 | S2 | ✅ | ✅ Met |
| R3 | S1 | ✅ | ✅ Met |
| R4 | S3 | manual by plan (walk 09) | ✅ Met |
| R5 | S3, S4 | manual by plan | ✅ Met |
| R6 | S4 | manual by plan (walk 10 step 6, `06-shopper.png`) | ✅ Met |
| R7 | S4 | manual by plan, not yet seen | ⚠️ Partial |

## Warnings across the stack

- S4 (`5549861`): PASS. Gates: `npm test` 41/41, `aidt check` ok (22 lines, 7/7 requirements), `aidt clean --check` ok, `aidt context check` ok. Walk 10 replayed at 390 × 844 (`.aidt/qa/10-phone-docked-cart-limit/06-shopper.png`): three lines with whole «Remove», «No more in stock» and the totals in view. R7 (scroll fade) is correct by reading but was not seen rendered; check it in DevTools with 5 lines before the third QA pass.

- Gates on `8694974`: `npm test` 41/41, `aidt check` ok (sections 16 / 16 / 25 lines, 5/5 requirements with a test), `aidt clean --check` ok, `aidt context check` ok.
- `aidt structure audit` reports `src/utils.ts` and `src/types.ts`. Neither is touched here; they are the planned migration, not findings of this change.
- `state.json` listed 19 and 30 lines for S2 and S3; `aidt diff` says 16 and 25. Corrected.
- Builder decisions outside the plan: the `main` bottom padding that the plan names for S3 was left out. Not needed: the cart is sticky, so at the end of the page it returns to the flow and covers no card.
- S3 was reviewed twice: FAIL from the CSS alone, then PASS with the walk 09 screenshot at 390 px (`.aidt/qa/09-phone-layout/04-shopper.png`). The «No more in stock» message on a phone is not in that screenshot; walk 02 in QA pass 2 should show it.

## Questions for the author

- None
