# Review · SHOP-12 · Discount codes

> Spec: none (requirements derived from the ticket) · Branch: `feat/discount-codes` · Mode: review without spec · Base: `main`

## Requirements (derived from ticket SHOP-12)

- R1 Apply one code via `POST /carts/:id/discount {code}`.
- R2 Codes are case-insensitive.
- R3 Percent codes take a percentage off the subtotal.
- R4 Fixed codes take a fixed amount off, never more than the subtotal.
- R5 Valid through the end of the expiry date (UTC).
- R6 Unknown code: 400 `UNKNOWN_CODE`. Expired: 400 `EXPIRED_CODE`.
- R7 A second code replaces the first.
- R8 Free shipping from $50, based on the subtotal after the discount.
- R9 The cart view shows the discount.

## Summary

Adds discount codes in `src/discounts.ts`, a route in `src/server.ts` and discount math in `totals()` in `src/cart.ts`. Three requirements are broken (expiry day, cap, shipping threshold) and none of them has a test. Verdict: FAIL on `88eba3f`.

## At a glance

| | |
|---|---|
| Reviewable lines | 70 in 1 section |
| Tests | 35 lines |
| Filtered | toolkit files (`.aidt/`, `.claude/`, `.github/`) not reviewed |
| Requirements | 5 met · 1 partial · 3 missing |
| Quality | Tests 🔴, Structure 🟡, Maintainability 🟡; 2 suggestions |
| Reading time | ~8 min |

## Reading order

| # | Section | Lines | Kind | Verdict | PR |
|---|---|---|---|---|---|
| 1 | [S1 · Discount codes](s01-discount-codes.md) | 70 | 🧠 logic | FAIL | n/a |

## Requirement coverage

| Req | Sections | Tests | Status |
|---|---|---|---|
| R1 | S1 | no HTTP test | ⚠️ Partial |
| R2, R3, R6, R7, R9 | S1 | yes (R6 and R9 not over HTTP) | ✅ Met |
| R4 | S1 | ❌ | ❌ Missing (not capped) |
| R5 | S1 | ❌ | ❌ Missing (expires a day early) |
| R8 | S1 | ❌ | ❌ Missing (uses pre-discount subtotal) |

## Warnings across the stack

- `npm test`: 11 pass. `aidt clean --check`: clean. `aidt structure audit`: 2 findings that existed before (`src/utils.ts`, `src/types.ts`), not introduced here.

## Questions for the author

- Should an applied code that later expires be dropped from totals silently?
