# Review · SHOP-12 · Discount codes

> Spec: none (ticket text) · Plan: none · Branch: `feat/discount-codes` · Mode: without spec, base `main`

Requirements derived from ticket SHOP-12:
R1 apply one code via `POST /carts/:id/discount`; R2 case-insensitive; R3 percent codes; R4 fixed codes capped at the subtotal; R5 valid through end of expiry date (UTC); R6 400 `UNKNOWN_CODE` / `EXPIRED_CODE`; R7 second code replaces first; R8 free shipping from $50 on subtotal after discount; R9 cart view shows the discount.

## Summary

Adds discount codes to the cart: a code table, an apply endpoint, and a discount line in the totals. The shape is sound, but three ticket rules are implemented wrongly (expiry day, fixed-amount cap, free shipping) and none has a test.

## At a glance

| | |
|---|---|
| Reviewable lines | 65 in 1 section |
| Tests | 36 lines |
| Filtered | 0 lines of noise, 0 of config |
| Requirements | 4 met · 2 partial · 3 missing |
| Reading time | ~8 min |

## Reading order

| # | Section | Lines | Kind | Verdict | PR |
|---|---|---|---|---|---|
| 1 | [S1 · Discount codes](s01-discount-codes.md) | 65 | 🧠 logic | FAIL | none |

## Requirement coverage

| Req | Sections | Tests | Status |
|---|---|---|---|
| R1 | S1 | unit only | ⚠️ Partial |
| R2 | S1 | ✅ | ✅ Met |
| R3 | S1 | ✅ | ✅ Met |
| R4 | S1 | ❌ | ❌ Missing (no cap) |
| R5 | S1 | ❌ | ❌ Missing (expires at 00:00 UTC of last day) |
| R6 | S1 | unit only | ⚠️ Partial |
| R7 | S1 | ✅ | ✅ Met |
| R8 | S1 | ❌ | ❌ Missing (uses undiscounted subtotal) |
| R9 | S1 | ❌ | ✅ Met |

## Warnings across the stack

- `npm test` 11/11 pass; `aidt clean --check` clean. The project defines no lint or coverage commands. `aidt structure audit` skipped (no `.aidt/structure.md`).

## Questions for the author

- Is a silently dropped expired code at view time intended?
