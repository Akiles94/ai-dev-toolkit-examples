# SHOP-24 · Low-stock alerts

> Branch: `feat/SHOP-24-low-stock-alerts` · Source: ticket text in prompt · Mode: full · Status: approved

## Goal

The shop owner finds out when a product is running low, so they can restock before it sells out.
They see the low-stock products in the admin, lowest stock first.

## Context

Products have a stock number. Stock goes down whenever units are taken out of stock (the stock
reservation operation). Today nobody is told when stock gets low, and there is no admin area: the
shop only offers products and carts. There is no purchase/checkout flow yet; building one is a
separate ticket, so this work reacts to any stock decrease, whatever triggers it.

## Requirements

- **R1** A product is *low stock* when its stock is strictly below the threshold. The threshold is
  one global value for all products: **5**.
- **R2** A product with stock 0 is also low stock, and is shown as out of stock.
- **R3** When a stock decrease takes a product from at-or-above the threshold to below it, an
  in-app alert is recorded for the owner, once, with the product and its stock at that moment.
- **R4** No further alert is recorded for a product while its stock stays below the threshold
  (further decreases, including reaching 0, do not repeat it).
- **R5** After a product's stock returns to the threshold or above (restock), a later drop below
  the threshold records a new alert.
- **R6** A failed stock decrease (not enough stock, unknown product) changes nothing and records
  no alert.
- **R7** The admin offers a low-stock list, open to anyone for now, with every low-stock product
  showing name, current stock, threshold, and an out-of-stock indication when stock is 0.
- **R8** The low-stock list is sorted by lowest stock first; products with equal stock keep a
  stable order by name.
- **R9** The admin offers a way to see the recorded alerts (product, stock at the time, when),
  most recent first.
- **R10** The list reflects current stock: a restocked product no longer appears.

## Acceptance criteria

| Req | Given | When | Then |
|---|---|---|---|
| R1 | Stock: "Refactoring" 4, "The Pragmatic Programmer" 12, "Tetris Effect" 30 | Owner opens the low-stock list | Only "Refactoring" is listed; threshold shown is 5 |
| R1 | "Refactoring" has stock 5 | Owner opens the list | "Refactoring" is not listed (5 is not below 5) |
| R2 | "Kind of Blue (vinyl)" has stock 0 | Owner opens the list | It is listed and marked out of stock |
| R3 | "The Pragmatic Programmer" has stock 6 | 2 units are taken out (stock 4) | One alert exists: "The Pragmatic Programmer", stock 4 |
| R3 | "Tetris Effect" has stock 30 | 26 units are taken out in one decrease (stock 4) | One alert exists for "Tetris Effect", stock 4 |
| R4 | "Refactoring" is at 4 with its alert already recorded | 1 unit, then 3 units are taken out (stock 0) | Still exactly one alert for "Refactoring" |
| R5 | "Refactoring" was alerted at 4, then restocked to 10 | 6 units are taken out (stock 4) | A second alert for "Refactoring" exists |
| R6 | "Tetris Effect" has stock 30 | 40 units of "Tetris Effect" are requested | Stock stays 30, no alert exists for "Tetris Effect" |
| R7 | Low-stock products exist | Owner opens the list without logging in | Each entry has name, stock, threshold; stock-0 entries show out of stock |
| R8 | Low stock: "Zeta" 3, "Kind of Blue (vinyl)" 0, "Alpha" 3 | Owner opens the list | Order: "Kind of Blue (vinyl)" (0), "Alpha" (3), "Zeta" (3) |
| R9 | Alerts for "Refactoring" (earlier) and "Zeta" (later) | Owner opens the alerts | "Zeta" is first; each shows product, stock then, time |
| R9 | No alert has been recorded | Owner opens the alerts | The list is empty |
| R10 | "Refactoring" listed at stock 4 | It is restocked to 10 | It no longer appears in the list |

## Edge cases

- A product already below the threshold when the system starts (e.g. "Kind of Blue (vinyl)" at 0,
  "Refactoring" at 4) appears in the list but has no alert, since nothing dropped it.
- A product at exactly the threshold (5) is not low; dropping it to 4 triggers the alert.
- Restocking to exactly 5 re-arms alerts (5 is not below 5).
- Empty list: when no product is low, the list is empty, not an error.

## Out of scope

- Email or any other outward notification to the owner.
- A purchase/checkout flow, and any way to restock (separate tickets). Alerts react to any stock decrease.
- Authentication or access control for the admin.
- Per-product or per-category thresholds, and changing the threshold at runtime.
- An HTML admin page.
- Marking alerts as read or dismissing them.

## Decisions

- Purchase flow is not part of this ticket; the alert reacts to any stock decrease (discarded: add a minimal checkout here).
- In-app alerts only (discarded: email, or both).
- One global threshold of 5, strictly below (discarded: per-product, per-category, "5 or fewer").
- Alert once per drop below the threshold, re-armed after restock (discarded: alert on every purchase while low).
- Stock 0 is both low stock and out of stock (discarded: a separate list).
- Admin is an API-style list, no access control yet (discarded: HTML page, authentication).
- List shows name, stock, threshold, lowest first.

## Open questions

- None
