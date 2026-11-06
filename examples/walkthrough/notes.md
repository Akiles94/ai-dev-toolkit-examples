# Walkthrough: feat/checkout-orders (base main) — SHOP-31 Checkout and orders

## Requirements
- R1 Checkout reserves stock for all items, all or nothing; else 409 OUT_OF_STOCK with product ids
- R2 Payment through a PaymentGateway port; in-memory fake declines tokens starting 'tok_declined'
- R3 Order stored as 'paid'; cart emptied after checkout
- R4 Payment failure: release reserved stock, 402 PAYMENT_DECLINED
- R5 GET /orders/:id and GET /orders?status=paid|shipped|cancelled
- R6 POST /orders/:id/ship (paid orders only)
- R7 POST /orders/:id/cancel (paid only; refunds via gateway; returns stock)
- R8 Order keeps checkout-time item prices, totals, payment id, status history with timestamps

## Index
| # | Section | Lines | Status |
|---|---|---|---|
| S1 | Types, cart, orders, payments, products (src) | 297 | presented (R1-R4, R6-R8 logic met) |
| S2 | Tests: orders + cart | 263 | presented |
| S3 | Tests: payments + products | 52 | presented, no findings (minor gaps only) |
| S4 | server.ts routes + README | 113 | presented |
| S5 | Tests: orders-api | 168 | presented |

## Findings
- S1 🟡 `src/orders.ts:111` (and `src/cart.ts:43`): `clearCart` empties the whole cart, but the charge
  covered only the copy taken at `orders.ts:82`. An item added while the gateway call is pending is
  deleted without being paid. addItem is not blocked during checkout. Only reachable with a slow
  real gateway. Fix: remove only the charged lines/qty, or block addItem during checkout.
- S1 note: no other defects found in the logic (rollback, `finally` release, cancel guard all OK).
- S2 🟡 `tests/orders.test.ts:251-252`: the last two assertions of "lists orders by status" cannot fail
  (a filter always satisfies its own predicate; Map keys are unique). Cancelled list is never really
  tested. Suggest cancelling an order in that test and checking it appears only in `cancelled`.
- S2 🟡 `tests/orders.test.ts:102`: 409 test has one missing product; does not prove all ids are listed.
- S2 🟡 `tests/orders.test.ts:131`: gateway-throws test does not check the cart still has its items or
  that a new checkout works after the error.
- S2 🟡 `tests/orders.test.ts:200` and `:219`: no test for cancel of an unknown order, nor for a refund
  that throws. No test for the S1 clearCart-during-checkout case.
- S2 status: tests reviewed, assertions are otherwise concrete and cover R1-R4, R6-R8. `tests/cart.test.ts` OK.
- S5 🟡 `tests/orders-api.test.ts` (whole file): not covered over HTTP: 502 REFUND_FAILED mapping
  (`createShopServer` accepts a failing gateway, easy to add), 409 CHECKOUT_IN_PROGRESS /
  CANCELLATION_IN_PROGRESS, `?status=shipped|cancelled` lists (`:110`, only `paid` is filtered),
  cancel of an unknown order (404, `:141`), and the `null` body from S4. Existing assertions are
  concrete and pass for the right reasons.
- S4 ✔ unknown `?status=` is rejected with 400 UNKNOWN_STATUS (`src/server.ts:61`). R5 met.
- S4 🟡 `src/server.ts:130`: body `null` makes `body.cardToken` throw, so 500 INTERNAL instead of 400
  INVALID_PAYMENT (same pattern as the items route at :114).
- S4 ❓ `src/server.ts:131`: token validated with `trim()` but passed untrimmed; " tok_declined" is
  accepted by the fake. Only matters for the fake.
- S4 🟡 (docs) `README.md:27`: ship row says "409 otherwise" but an unknown order is 404; 502
  REFUND_FAILED and 409 CHECKOUT_IN_PROGRESS are undocumented.

## Summary (closed)
All five sections (S1-S5) were reviewed. Nothing was skipped. Worktree removed at the end.

Requirement coverage:
| Req | Status | Note |
|---|---|---|
| R1 all-or-nothing stock, 409 + ids | Met | Tests only use one missing id |
| R2 PaymentGateway port + fake | Met | |
| R3 order `paid`, cart emptied | Met, with caveat | clearCart empties items added during the charge |
| R4 decline: release stock, 402 | Met | |
| R5 get / list / filter | Met | `shipped` and `cancelled` filters not tested over HTTP |
| R6 ship paid only | Met | |
| R7 cancel paid only, refund, stock back | Met | 502 mapping untested |
| R8 prices, totals, payment id, history | Met | |

Overall opinion: logic is correct and well guarded (rollback, double submit, double cancel). One
real-world issue (clearCart during checkout) to fix or accept before a real gateway; the rest is
test gaps and small polish. No 🔴 findings.

## Ready to send (review comments)
1. `src/orders.ts:111` (and `src/cart.ts:43`) — 🟡 `clearCart` empties the whole cart, but the charge
   covered only the copy taken at line 82. If an item is added (POST /carts/:id/items) while the
   gateway call is pending, it is deleted without being paid or put in the order. Not visible with the
   fake gateway, real with a network provider. Suggest removing only the charged lines/quantities,
   or rejecting addItem while the cart is in `checkoutsInProgress`.
2. `src/server.ts:130` — 🟡 A body of JSON `null` makes `body.cardToken` throw, so the client gets 500
   INTERNAL instead of 400 INVALID_PAYMENT. Same pattern as the items route (`:114`); a guard like
   `if (!body || typeof body !== "object")` would fix it.
3. `src/server.ts:131` — ❓ The token is validated with `trim()` but passed untrimmed, so " tok_declined"
   is accepted by the fake. Do you want to pass the trimmed value?
4. `README.md:27` — 🟡 The ship row says "409 otherwise", but an unknown order is 404. 502 REFUND_FAILED
   and 409 CHECKOUT_IN_PROGRESS are not documented.
5. `tests/orders.test.ts:251-252` — 🟡 These two assertions cannot fail (a filter satisfies its own
   predicate, and Map keys are unique). Cancel an order in this test and check it appears only in
   `listOrders("cancelled")`.
6. `tests/orders.test.ts:102` — 🟡 Only one product is missing, so the test does not prove the 409 lists
   all missing ids. Add a case with two.
7. `tests/orders.test.ts:131` — 🟡 After the gateway throws, also check that the cart keeps its items and
   that a new checkout works (guard cleared).
8. `tests/orders.test.ts:200` and `:219` — 🟡 Missing: cancel of an unknown order (ORDER_NOT_FOUND), and a
   refund that throws.
9. `tests/orders-api.test.ts` (`:110`, `:141`) — 🟡 Missing over HTTP: 502 REFUND_FAILED (inject a
   failing gateway into `createShopServer`), 409 for the in-progress guards, `?status=shipped` and
   `?status=cancelled`, and cancel of an unknown order (404).
