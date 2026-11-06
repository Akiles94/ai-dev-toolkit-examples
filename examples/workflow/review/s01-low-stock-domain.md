# S1 · Low-stock domain

> Stack: [index](index.md) · Part 1 of 2 · Previous: none · Next: [S2](s02-admin-endpoints.md)
> Verdict: PASS · Reviewed commit: `e829af2`

## At a glance

| | |
|---|---|
| Reviewable lines | 55 (+55 / −0) in 4 files |
| Tests | 162 lines in 3 files |
| Filtered | 0 lines of noise, 0 of config |
| Covers | R1–R6, R8–R10 (domain) |
| Reading time | ~8 min |

## Predict first

🤔 A product goes 30 → 4 in one decrease, then 4 → 0. How many alerts exist, and what decides it?

## What it does

Stock decreases now leave a trace. When `reserveStock` takes a product from 5 or more to below 5, one alert is stored with the product name and the new stock. Nothing is stored for further drops while low, and a restock followed by a new drop alerts again. A new query lists the products below 5, lowest stock first, ties by name.

## Walkthrough

Input: "Tetris Effect" has stock 30; `reserveStock("p-3", 26)`, then `reserveStock("p-3", 4)`.

1. `src/products.ts:23` → `before = 30`.
2. `src/products.ts:24` → stock becomes 4.
3. `src/products.ts:25` → `30 >= 5 && 4 < 5` is true.
4. `src/products.ts:26` → alert stored `{ "p-3", "Tetris Effect", 4, <ISO time> }` (`src/alerts.ts:8`).
5. Second call: `before = 4`, so `4 >= 5` is false and no alert. Stock is 0, still one alert.
6. `src/low-stock.ts:7` → "Tetris Effect" (0) is listed, `outOfStock: true` (`src/low-stock.ts:13`).

## Reading order

1. 🧠 [`src/products.ts`](../../../../src/products.ts) · read carefully: lines 20–29
2. ⚙️ [`src/alerts.ts`](../../../../src/alerts.ts) · skim
3. 🧠 [`src/low-stock.ts`](../../../../src/low-stock.ts) · filter and sort, lines 6–16
4. ⚙️ [`src/types.ts`](../../../../src/types.ts) · skim
5. 🧠 [`tests/products.test.ts`](../../../../tests/products.test.ts) · boundary cases (5 → 4, re-arm)

## Affected flows

- **Direct:** stock reservation (`reserveStock`) now has a side effect on a threshold crossing.
- **Indirect:** none today. `reserveStock` has no caller in `src/`; the cart does not reserve stock yet. `alerts.ts` does not import `products.ts`, so there is no cycle.

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R1 | `src/low-stock.ts:7`, `src/alerts.ts:4` | `low-stock.test.ts` › R1 (both) | ✅ Met |
| R2 | `src/low-stock.ts:7,13` | `low-stock.test.ts` › R2 | ✅ Met |
| R3 | `src/products.ts:25-26` | `products.test.ts` › R3 (both) | ✅ Met |
| R4 | `src/products.ts:25` | `products.test.ts` › R4 (both) | ✅ Met |
| R5 | `src/products.ts:25` | `products.test.ts` › R5 | ✅ Met |
| R6 | `src/products.ts:22` | `products.test.ts` › R6 | ✅ Met |
| R8 | `src/low-stock.ts:15` | `low-stock.test.ts` › R8 | ✅ Met |
| R9 | `src/alerts.ts:12-14` | `alerts.test.ts` › R9 (both) | ✅ Met |
| R10 | `src/low-stock.ts:6` | `low-stock.test.ts` › R10 | ✅ Met |

## Findings

- None

## Questions for the author

- None
