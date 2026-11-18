# SHOP-12 · Discount codes, reviewed · summary

> Branch: `feat/discount-codes` · Merged: never, on purpose (PR #1 is the reviewer's example) · Plan: none

## Done

- PR #1: 65 reviewable lines, 11 green tests, written with three of the ticket's rules wrong to
  show what the reviewer finds when tests pass.
- Ticket: one code per cart, case-insensitive, percent or fixed (never above the subtotal), valid
  through the end of its expiry date in UTC, 400 `UNKNOWN_CODE` / `EXPIRED_CODE`, a second code
  replaces the first, free shipping on the subtotal after the discount, the cart view shows it.
- Reviewer, with no spec, asked for the ticket and derived requirements from it: **FAIL** with
  the three planted bugs (cart total skipped the first item, hidden by a test with price 0;
  unknown code silently ignored; expiry compared local time) and an unplanted one: the code
  `constructor` hit an inherited function and the total became `NaN` (`Object.hasOwn` fixes it).
- Re-run on 07/11 with the code quality review: same four findings plus ratings. $0.22, 1 min 17 s.
  Run kept in `examples/reviewer/`.

## Decisions

- Leave the branch unfixed and unmerged as the reviewer's example. Taken 07/11/2026.

## Deviations from the plan

None (no plan).

## Left for later

Nothing: the bugs stay on purpose.

## Verdicts

| Check | Verdict | On commit | Report |
|---|---|---|---|
| Reviewer | FAIL | n/a | `examples/reviewer/review/index.md` |
