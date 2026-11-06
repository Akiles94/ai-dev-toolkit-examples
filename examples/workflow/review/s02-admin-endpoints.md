# S2 · Admin endpoints

> Stack: [index](index.md) · Part 2 of 2 · Previous: [S1](s01-low-stock-domain.md) · Next: none
> Verdict: PASS · Reviewed commit: `fb160a7`

## At a glance

| | |
|---|---|
| Reviewable lines | 10 (+10 / −0) in 1 file |
| Tests | 83 lines in 1 file |
| Filtered | 0 lines of noise, 0 of config |
| Covers | R7, R9 (HTTP), R1/R2/R8 shape |
| Reading time | ~3 min |

## Predict first

🤔 What does `GET /admin/low-stock` return when nothing is low: an error, or something else?

## What it does

Two read-only routes expose the S1 domain. `GET /admin/low-stock` returns the threshold and the sorted list; `GET /admin/alerts` returns the alerts, newest first. Neither asks for credentials (by decision, out of scope for this ticket).

## Walkthrough

Input: `GET /admin/low-stock` with the starting catalog.

1. `src/server.ts:35` → method and path match.
2. `src/server.ts:36` → `lowStockProducts()` returns "Kind of Blue (vinyl)" (0) and "Refactoring" (4).
3. Response 200: `{ "threshold": 5, "products": [{ "id": "p-4", ..., "outOfStock": true }, { "id": "p-2", ... }] }`.
4. `GET /admin/alerts` → `src/server.ts:39-41` → `[]` at startup, status 200.

## Reading order

1. 🧠 [`src/server.ts`](../../../../src/server.ts) · lines 35–41
2. ⚙️ [`tests/admin.test.ts`](../../../../tests/admin.test.ts) · skim

## Affected flows

- **Direct:** HTTP routing in `route()` gains two GET routes.
- **Indirect:** none; existing routes are untouched.

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R7 | `src/server.ts:35-37` | `admin.test.ts` › R7 (both) | ✅ Met |
| R8 | `src/server.ts:36` | `admin.test.ts` › R8 | ✅ Met |
| R9 | `src/server.ts:39-41` | `admin.test.ts` › R9 | ✅ Met |

## Findings

- None

## Questions for the author

- None
