# Review · SHOP-24 · Low-stock alerts

> Spec: [spec.md](../spec.md) · Plan: [plan.md](../plan.md) · Branch: `feat/SHOP-24-low-stock-alerts` · Mode: full

## Summary

The shop owner can now see which products are below 5 units (lowest first) and a log of alerts, one per drop below the threshold. It is built as a stateless before/after check in `reserveStock`, plus two read-only admin GET routes.

## At a glance

| | |
|---|---|
| Reviewable lines | 65 in 2 sections |
| Tests | 245 lines |
| Filtered | 0 lines of noise, 0 of config |
| Requirements | 10 met · 0 partial · 0 missing |
| Reading time | ~11 min |

## Reading order

| # | Section | Lines | Kind | Verdict | PR |
|---|---|---|---|---|---|
| 1 | [S1 · Low-stock domain](s01-low-stock-domain.md) | 55 | 🧠 logic | PASS | not yet |
| 2 | [S2 · Admin endpoints](s02-admin-endpoints.md) | 10 | ⚙️ skim | PASS | not yet |

## Requirement coverage

| Req | Sections | Tests | Status |
|---|---|---|---|
| R1 | S1 | ✅ | ✅ Met |
| R2 | S1 | ✅ | ✅ Met |
| R3 | S1 | ✅ | ✅ Met |
| R4 | S1 | ✅ | ✅ Met |
| R5 | S1 | ✅ | ✅ Met |
| R6 | S1 | ✅ | ✅ Met |
| R7 | S2 | ✅ | ✅ Met |
| R8 | S1, S2 | ✅ | ✅ Met |
| R9 | S1, S2 | ✅ | ✅ Met |
| R10 | S1 | ✅ | ✅ Met |

## Warnings across the stack

- `/admin/*` has no access control (by decision). A follow-up auth ticket must cover these routes.
- Nothing calls `reserveStock` yet, so no alert can be produced outside tests until a checkout exists.
- Alerts are in memory and lost on restart.

## Questions for the author

- None
