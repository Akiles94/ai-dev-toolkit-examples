# Walkthrough: checkout and orders (SHOP-31)

The [walkthrough](https://github.com/Akiles94/ai-dev-toolkit/blob/main/docs/walkthrough.md) on
`feat/checkout-orders` ([PR #2](https://github.com/Akiles94/ai-dev-toolkit-examples/pull/2)): 893 changed
lines in 12 files, written by another agent playing the teammate. Every section, start to close.

- [ticket.md](ticket.md): the ticket.
- [guide-comments.diff](guide-comments.diff): every comment it wrote into the local copy (235 lines in 12 files), as a diff over the PR.
- [notes.md](notes.md): its notes file: requirements, progress, findings with their line in the PR.

## Cost

| Step | Model | Turns | Agent time | Tokens in (cached) | Tokens out | Cost at API prices |
|---|---|---|---|---|---|---|
| All 5 sections and the close | `claude-sonnet-5-5` | 7 | 6 min 55 s | 2.5M (2.4M) | 44k | $1.11 |

Measured with Claude Code on 2026-11-06. Most input tokens are cache reads, which cost a tenth of fresh input. With a Claude subscription the runs count toward usage limits instead.

## The conversation

### Call

**You:**

```text
/walkthrough Walk me through my teammate's branch feat/checkout-orders (no gh here; base is main). Ticket: SHOP-31 Checkout and orders. POST /carts/:id/checkout turns a cart into an order: it reserves stock for every item (all or nothing: if any item lacks stock, nothing is reserved and it answers 409 OUT_OF_STOCK with the product ids), charges a payment through a PaymentGateway port (a fake in-memory gateway for now, which declines card tokens starting with 'tok_declined'), stores the order with status 'paid', and empties the cart. On payment failure, release the reserved stock and answer 402 PAYMENT_DECLINED. Orders: GET /orders/:id, GET /orders?status=paid|shipped|cancelled, POST /orders/:id/ship (only paid orders), POST /orders/:id/cancel (paid orders only; refunds through the gateway and returns stock). Each order keeps the item prices at checkout time, the totals, the payment id and a status history with timestamps. Nothing else to keep in mind.
```

**Agent:**

I checked out `feat/checkout-orders` against `main` in a worktree at `.aidt/walkthrough/feat-checkout-orders/`. I haven't read any code yet.

## Map

| # | Section | Lines | What it is about |
|---|---|---|---|
| S1 | Contracts and core · `src/` (`types`, `cart`, `orders`, `payments`, `products`) | 297 | The order model, the order service (checkout, ship, cancel), the PaymentGateway port with its fake, and the small changes to cart and products. |
| S2 | Tests · `orders.test.ts`, `cart.test.ts` | 263 | Tests for the order logic and the cart change. |
| S3 | Tests · `payments.test.ts`, `products.test.ts` | 52 | Tests for the fake gateway and the stock changes. |
| S4 | Integration · `src/server.ts`, `README.md` | 113 | The new HTTP routes and the status-code mapping (409, 402), plus the README. |
| S5 | Tests · `orders-api.test.ts` | 168 | HTTP-level tests of the order endpoints. |

- **Order:** I kept the tool's order. Contracts and logic come first, then their tests, then the routes, then the API tests. The tests are split into three groups instead of sitting next to the code they test, because sections can't go over 300 lines.
- **Reading time:** about 1 minute per 25 lines, so roughly 45 minutes for everything. S1 alone takes about 12 minutes. You can stop any time.
- **Notes file:** `.aidt/walkthrough/feat-checkout-orders.md` holds the requirements R1–R8 from SHOP-31 and the progress, so a later session can resume from it.

Say "go" and I'll start with S1.

### S1

**You:**

```text
/walkthrough go
```

**Agent:**

## S1: Types, cart, orders, payments, products (297 lines)

**What it does.** This section holds the order model, the checkout and cancel logic, and the payment port with its fake. Checkout checks the stock for the whole cart first, then reserves it. It charges the gateway for the price snapshot, stores the order as `paid` with its history, and empties the cart. A decline or a gateway error releases the stock again. Ship and cancel share one rule: the order must be `paid` and have no refund in progress. This section covers R1–R4 and R6–R8 at the logic level. The routes and status codes are in S4, and R5 is only half here (`listOrders` filters by status, but the route is still to check).

**Reading order** (guide comments are in `.aidt/walkthrough/feat-checkout-orders/`):
1. `src/types.ts`: skim. It only defines the shapes.
2. `src/orders.ts`: read this one carefully, especially `checkout` and `cancelOrder`.
3. `src/payments.ts`: skim. It is a small fake.
4. `src/cart.ts`, `src/products.ts`: skim. They are small helpers.

**Findings**
- 🟡 `src/orders.ts:111` (also `src/cart.ts:43`): `clearCart` empties the whole cart, but the charge covered only the copy taken at line 82.
  - **Failing input:** a client calls `POST /carts/:id/items` while the gateway call is pending.
  - **Result:** that item is deleted without being charged or put in the order.
  - **Reachability:** `addItem` is not blocked during checkout, and `checkoutsInProgress` only guards `checkout` itself. With the fake gateway the window is almost zero, so this only bites with a real provider.
  - **Fix:** remove only the charged lines and quantities, or reject `addItem` while the cart is mid-checkout.

I checked the rest and found no other defects. These cases hold up:
- The stock is given back on every failure path, including a gateway exception.
- A double checkout or a double cancel is safe.
- A failed refund leaves the order `paid` with its stock untouched.

**Opinion.** The logic looks right and is well structured. I would ask the author to fix or consciously accept the 🟡 above before a real gateway is plugged in. It is not a blocker with the fake.

I recorded this in the notes file. Tell me which section to open next: S2 (order tests) is the natural one, or I can go back and dig deeper into any part of S1.

### S2

**You:**

```text
/walkthrough next
```

**Agent:**

I've finished S2, so here is the section.

## S2: Tests for orders and cart (263 lines)

**What it does.** `tests/orders.test.ts` drives the order service directly, with no HTTP. It uses the real cart and product modules, the fake gateway, and a `PendingGateway` double that lets a test resolve charges and refunds by hand. That double is how the tests observe the "still waiting on the gateway" state, where the double-checkout and double-cancel guards live. `tests/cart.test.ts` only adds a test for `clearCart`. Together they cover R1–R4 and R6–R8. R5 is only partly tested here.

**Reading order**
1. The helpers and `PendingGateway`, at the top of `orders.test.ts`. Skim them.
2. The checkout tests. Read these carefully. The snapshot test, the all-or-nothing test and the concurrent-checkout test are the strongest.
3. The ship and cancel tests. The tests that check the stock is not returned twice and that a failed refund leaves the order `paid` are worth a close read.
4. `cart.test.ts`: skim, it is one small test.

**Findings** (guide comments are in the worktree copy)
- 🟡 `tests/orders.test.ts:251-252`: the last two assertions of "lists orders by status" cannot fail.
  - **First assertion:** `listOrders("cancelled").every(status === "cancelled")` is true by construction of the filter, and also true for an empty list.
  - **Second assertion:** "ids are unique" is always true because orders live in a Map keyed by id.
  - **Result:** the `cancelled` filter is never really tested. Suggest cancelling an order in that test and checking it shows up only in the `cancelled` list.
- 🟡 `tests/orders.test.ts:102`: the 409 test has only one missing product. It does not prove the answer lists all missing ids, which the ticket asks for.
- 🟡 `tests/orders.test.ts:131`: the gateway-throws test checks the stock but not that the cart keeps its items. It also doesn't check that a new checkout works afterwards, meaning the in-progress guard was cleared.
- 🟡 `tests/orders.test.ts:200` and `:219`: there is no test for cancelling an unknown order, and none for a refund that throws. Nothing covers the S1 `clearCart`-during-checkout case either.

The other assertions are concrete: the amounts are written out, not computed. The stock is about 13 of 30 units for `p-3`, so the shared state across tests has room.

**Opinion.** The tests are good and match the logic from S1. I would ask the author to fix the two assertions that can't fail and to add the multi-id 409 case. The other gaps are nice to have.

I recorded all of this in the notes file. Which section next? S3 (the payments and products tests, 52 lines) is the short one. S4 (the routes) is the one that completes R5 and the 409/402 mapping.

### S3

**You:**

```text
/walkthrough next
```

**Agent:**

## S3: Tests for payments and products (52 lines)

**What it does.** `tests/payments.test.ts` pins down the behavior of `FakePaymentGateway`, which the order tests depend on. It checks that:
- an accepted card gives a `pay-` id and the gateway remembers the amount;
- `tok_declined` and longer tokens with that prefix are declined (R2);
- a zero amount is refused;
- a payment can be refunded once, and a second refund says `ALREADY_REFUNDED`;
- an unknown payment says `PAYMENT_NOT_FOUND`.

`tests/products.test.ts` adds one test: reserving 3 units and releasing 3 gives back the original stock.

**Reading order.** Both files are small, so skim them in the order above.

**Findings.** None that matter. Two gaps are minor and not worth a review comment:
- The decline test doesn't check that a declined charge leaves no payment in the gateway.
- `releaseStock` with an unknown product id (silently ignored) is not tested.

**Opinion.** These look right. The assertions are concrete, and the "unknown payment" test is the one the order tests use to force a failing refund.

I updated the notes. Next is S4, the routes in `src/server.ts` plus the README. That section completes R5 and the 409/402 status mapping, and I will check there that an unknown `?status=` is rejected. Say "next" to open it.

### S4

**You:**

```text
/walkthrough next
```

**Agent:**

## S4: Routes and README (113 lines)

**What it does.** `src/server.ts` adds `POST /carts/:id/checkout` and the four `/orders` routes (get, list, ship, cancel). It turns the result values from `orders.ts` into HTTP codes: 409 for out of stock, 402 for a declined payment, 502 for a failed refund, and 404 or 409 for the rest. The server is now built by `createShopServer(gateway)`, so tests can inject a gateway, and the old `server` export still exists. The README documents the endpoints. This section covers R1, R4, R5, R6 and R7 at the HTTP level.

**Reading order**
1. `src/server.ts`:
   - `CHECKOUT_ERROR_STATUS` and `sendTransition`: the status mapping. Read these carefully.
   - `routeOrders`: carefully.
   - The checkout branch inside `route`: carefully.
   - `createShopServer`: skim.
2. `README.md`: skim.

**Verified**
- An unknown `?status=` returns 400 `UNKNOWN_STATUS` (`src/server.ts:61`). This closes the check I left open in S1, so R5 is met.
- The 409 body carries `productIds` and the 402 body carries the reason, as the ticket asks.
- A wrong method or extra path parts end in 404, never in the wrong handler.

**Findings**
- 🟡 `src/server.ts:130`: a body of JSON `null` makes `body.cardToken` throw, so the client gets 500 `INTERNAL` instead of 400 `INVALID_PAYMENT`. The items route at `:114` has the same pattern, so it is consistent with the existing code.
- ❓ `src/server.ts:131`: the token is checked with `trim()` but passed on untrimmed. `" tok_declined"` passes validation and the fake accepts it as a good card. This only matters for the fake.
- 🟡 `README.md:27`: the ship row says "409 otherwise", but an unknown order is 404. The 502 `REFUND_FAILED` and 409 `CHECKOUT_IN_PROGRESS` responses are not documented.

**Opinion.** The routing is clean and matches the ticket. I would ask the author to fix the `null` body (a one-line guard) and to touch up the README. The other points are optional.

The notes are updated. The last section is S5, the HTTP tests in `tests/orders-api.test.ts` (168 lines). Say "next" to open it, or "stop" to get the closing summary with the ready-to-paste comments.

### S5

**You:**

```text
/walkthrough next
```

**Agent:**

## S5: HTTP tests for orders (168 lines)

**What it does.** `tests/orders-api.test.ts` starts one real server on a free port. The server shares one `FakePaymentGateway` with the test, so the tests can ask the gateway whether a refund was recorded. It runs the new routes end to end:
- a checkout that answers 201 and empties the cart;
- the 400, 404, 409 and 402 error answers;
- get, list and filter, including the 400 for `?status=lost`;
- ship, cancel with refund and stock back, and cancelling a shipped order;
- unknown routes falling through to 404.

It covers the HTTP side of R1, R4, R5, R6 and R7.

**Reading order.** Skim the setup and helpers at the top. Read the checkout tests, then the cancel test (`:141`), carefully. Skim the rest.

**Findings**
- 🟡 `tests/orders-api.test.ts` (whole file): some paths are not covered over HTTP.
  - **Refund failure:** the 502 `REFUND_FAILED` mapping is untested. `createShopServer` accepts a gateway, so a failing one is easy to add.
  - **Guard states:** the 409 answers for `CHECKOUT_IN_PROGRESS` and `CANCELLATION_IN_PROGRESS` are untested.
  - **List filters:** `?status=shipped` and `?status=cancelled` are never requested. The test at `:110` only filters by `paid`.
  - **Cancel on an unknown order:** the 404 is untested (`:141`).
  - **Null body:** the `null` checkout body from S4 is untested.

The assertions that exist are concrete and pass for the right reasons, with no tests that can't fail here.

**Opinion.** Good coverage of the happy and main error paths. The gaps are nice to have, and the 502 mapping is the one I would ask for.

All five sections are now presented. Say "next" or "close" and I'll give you the closing summary: requirement coverage, the remaining findings, and the ready-to-paste review comments.

### Close

**You:**

```text
/walkthrough That's all. Close it and clean up the worktree.
```

**Agent:**

The review of `feat/checkout-orders` is closed. I reviewed all five sections, S1 to S5, and skipped none. I removed the worktree and every guide comment in it. The notes file stays at `.aidt/walkthrough/feat-checkout-orders.md` until you delete it.

## Summary

**Requirements.** All eight are met, with one caveat on R3.

| Req | Status | Note |
|---|---|---|
| R1 all-or-nothing stock, 409 with ids | Met | The tests only use one missing product |
| R2 PaymentGateway port and fake | Met | |
| R3 order `paid`, cart emptied | Met, with a caveat | `clearCart` can delete items added during the charge |
| R4 decline releases stock, 402 | Met | |
| R5 get, list, filter | Met | The `shipped` and `cancelled` filters aren't tested over HTTP |
| R6 ship paid only | Met | |
| R7 cancel paid only, refund, stock back | Met | The 502 mapping is untested |
| R8 prices, totals, payment id, history | Met | |

**Opinion.** The logic is correct and well guarded. The stock rollback, the double checkout and the double cancel all hold up. I found no 🔴 findings. One item is worth fixing or accepting before a real gateway is plugged in (the first comment below). The rest is test gaps and small polish.

## Review comments to paste

Line numbers are in the PR, not in the commented copy.

1. **`src/orders.ts:111`** (also `src/cart.ts:43`) 🟡: `clearCart` empties the whole cart, but the charge covered only the copy taken at line 82. An item added through `POST /carts/:id/items` while the gateway call is pending is deleted without being paid or put in the order. The fake gateway hides this, but a real provider would expose it. Suggest removing only the charged lines and quantities, or rejecting `addItem` while the cart is in `checkoutsInProgress`.
2. **`src/server.ts:130`** 🟡: a body of JSON `null` makes `body.cardToken` throw, so the client gets 500 `INTERNAL` instead of 400 `INVALID_PAYMENT`. The items route at `:114` has the same pattern. A guard like `if (!body || typeof body !== "object")` would fix it.
3. **`src/server.ts:131`** ❓: the token is checked with `trim()` but passed on untrimmed, so `" tok_declined"` is accepted by the fake. Should the trimmed value be passed instead?
4. **`README.md:27`** 🟡: the ship row says "409 otherwise", but an unknown order is 404. The 502 `REFUND_FAILED` and 409 `CHECKOUT_IN_PROGRESS` responses are not documented.
5. **`tests/orders.test.ts:251-252`** 🟡: these two assertions cannot fail. A filter always satisfies its own predicate, and Map keys are unique. Cancel an order in this test and check it appears only in `listOrders("cancelled")`.
6. **`tests/orders.test.ts:102`** 🟡: only one product is missing, so the test doesn't prove the 409 lists all missing ids. Add a case with two.
7. **`tests/orders.test.ts:131`** 🟡: after the gateway throws, also check that the cart keeps its items and that a new checkout works (the guard was cleared).
8. **`tests/orders.test.ts:200` and `:219`** 🟡: missing tests for cancelling an unknown order (`ORDER_NOT_FOUND`) and for a refund that throws.
9. **`tests/orders-api.test.ts`** (around `:110` and `:141`) 🟡: missing over HTTP:
   - the 502 `REFUND_FAILED` mapping (inject a failing gateway into `createShopServer`);
   - the 409 for the in-progress guards;
   - `?status=shipped` and `?status=cancelled`;
   - cancel of an unknown order (404).

The same list, with the requirement table, is in the notes file. I haven't posted anything to the branch or the PR.
