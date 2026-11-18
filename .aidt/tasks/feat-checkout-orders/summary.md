# SHOP-31 · Checkout and orders, walked through · summary

> Branch: `feat/checkout-orders` · Merged: never, on purpose (PR #2 is the walkthrough's example) · Plan: none

## Done

- PR #2: 893 changed lines in 12 files, written by another agent playing the teammate.
- Ticket: checkout reserves stock for all items or none (409 with product ids), charges through a
  `PaymentGateway` port (in-memory fake declining tokens starting `tok_declined`), stores the order
  as paid and empties the cart; a declined payment releases stock and answers 402. Orders list by
  status, ship (paid only) and cancel (paid only, refunded, stock returned), with a status history.
- `aidt walkthrough start` split it into 5 sections of at most 300 lines; the agent walked each
  with comments in a local copy (235 lines in 12 files), waiting for an answer after each.
- 9 review comments ready to paste, among them: a JSON `null` body makes `body.cardToken` throw in
  `src/server.ts`; cancel refunds before checking status; status history shared between orders.
  `aidt walkthrough finish` removed the copy and the comments.
- $1.11, 6 min 55 s, 7 turns. Run kept in `examples/walkthrough/`.

## Decisions

- Keep the branch as the walkthrough's example, never merged. Taken 06/11/2026.

## Deviations from the plan

None (no plan).

## Left for later

Nothing: the 9 comments were never posted.

## Verdicts

None: a walkthrough, not a reviewer run.
