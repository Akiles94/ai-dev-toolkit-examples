# Reviewer: discount codes (SHOP-12)

The [reviewer](https://github.com/Akiles94/ai-dev-toolkit/blob/main/docs/reviewer.md) on branch
`feat/discount-codes` ([PR #1](https://github.com/Akiles94/ai-dev-toolkit-examples/pull/1)): 65 reviewable
lines, 11 green tests, and three rules of the ticket implemented wrongly on purpose.

- [ticket.md](ticket.md): the ticket given to the agent.
- [review/s01-discount-codes.md](review/s01-discount-codes.md): the review guide, also the PR description.
- [review/index.md](review/index.md): the index, with the requirements derived from the ticket.

## Cost

| Step | Model | Turns | Agent time | Tokens in (cached) | Tokens out | Cost at API prices |
|---|---|---|---|---|---|---|
| Review | `claude-sonnet-5-5` | 1 | 1 min 23 s | 411k (356k) | 10k | $0.27 |

Measured with Claude Code on 2026-11-06. Most input tokens are cache reads, which cost a tenth of fresh input. With a Claude subscription the runs count toward usage limits instead.

## The conversation

### Call

**You:**

```text
/reviewer Ticket: SHOP-12 Discount codes. A customer can apply one discount code to their cart (POST /carts/:id/discount with { "code": "..." }). Codes are case-insensitive. Percent codes take a percentage off the subtotal; fixed codes take a fixed amount off, but the discount never exceeds the subtotal. A code is valid through the end of its expiry date (UTC). Unknown codes answer 400 UNKNOWN_CODE, expired ones 400 EXPIRED_CODE. Applying a second code replaces the first. Free shipping (from $50) is based on the subtotal after the discount. The cart view shows the discount. Nothing else to keep in mind, base is main.
```

**Agent:**

**Verdict: FAIL** on `feat/discount-codes` against `main` (reviewed commit `41a22c3`, feature commit `54e73bd`). I reviewed it without a spec, using SHOP-12 as the reference, and wrote no `state.json`. `npm test` passes 11 of 11 and `aidt clean --check` is clean. The project defines no lint or coverage commands, and there is no `.aidt/structure.md`, so I skipped `aidt structure audit`.

Three ticket rules are implemented wrongly, and none has a test, so the suite stays green. The change is 65 reviewable lines and 36 test lines.

Confirmed bugs:
1. **Expiry (`src/discounts.ts:23`):** it compares the date `"2027-12-31"` to a full timestamp, so a code expires at 00:00 UTC on its last valid day. For example, `SUMMER25` returns `EXPIRED_CODE` on 2026-09-01 at 10:00 UTC. The fix is to compare against `toISOString().slice(0, 10)`.
2. **Fixed discount not capped (`src/discounts.ts:31`):** `BIGSAVER` (3000 cents) on a 500-cent subtotal gives a total of −2001. The fix is `Math.min(code.value, subtotalCents)`.
3. **Free shipping ignores the discount (`src/cart.ts:60-61`):** it uses the undiscounted subtotal. With a 5400 subtotal and `BIGSAVER`, shipping is 0 when 499 is due.

Smaller items:
- **Missing tests:** none cover the expiry boundary, the cap, shipping after discount, or the endpoint status codes.
- **`null` body:** a `null` JSON body returns 500 (`src/server.ts:54`). The existing items route has the same issue.
- **Expired after applying:** a code that expires after being applied silently stops discounting (`src/cart.ts:58`). I left this as a question for the author.

Requirement coverage: of R1–R9 (my numbering of the ticket's rules), 4 are met (R2, R3, R7, R9), 2 are partial (R1, R6) and 3 are missing (R4, R5, R8).

The author needs to fix the three bugs and add tests for the expiry boundary, the cap, shipping after discount, and the 400 and 404 responses. Then the change should be reviewed again.

The guides are ready to paste as PR descriptions, in `.aidt/tasks/feat-discount-codes/review/`:
- `index.md`
- `s01-discount-codes.md`
