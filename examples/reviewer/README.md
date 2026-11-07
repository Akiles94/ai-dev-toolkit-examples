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
| Review | `claude-sonnet-5-5` | 1 | 1 min 17 s | 332k (298k) | 11k | $0.22 |

Measured with Claude Code on 2026-11-07. Most input tokens are cache reads, which cost a tenth of fresh input. With a Claude subscription the runs count toward usage limits instead.

## The conversation

### Call

**You:**

```text
/reviewer Ticket: SHOP-12 Discount codes. A customer can apply one discount code to their cart (POST /carts/:id/discount with { "code": "..." }). Codes are case-insensitive. Percent codes take a percentage off the subtotal; fixed codes take a fixed amount off, but the discount never exceeds the subtotal. A code is valid through the end of its expiry date (UTC). Unknown codes answer 400 UNKNOWN_CODE, expired ones 400 EXPIRED_CODE. Applying a second code replaces the first. Free shipping (from $50) is based on the subtotal after the discount. The cart view shows the discount. Nothing else to keep in mind, base is main.
```

**Agent:**

**Verdict: FAIL** on commit `88eba3f` (SHOP-12, base `main`). I reviewed it without a spec, using requirements R1–R9 that I derived from the ticket. I did not edit any source code.

**Checks**
- `npm test` passes with 11 tests.
- `aidt clean --check` finds no guide comments.
- `aidt structure audit` reports two findings, `src/utils.ts` and `src/types.ts`. Both files already existed, so they don't count against this change.

**Requirement coverage:** 5 met, 1 partial, 3 missing.

**Defects (all 🔴, none caught by the current tests)**
1. **Expiry (R5), `src/discounts.ts:23`.**
   - The check `expiresOn < today.toISOString()` compares `"2027-12-31"` with `"2027-12-31T10:00…Z"`.
   - The date string sorts first, so a code is rejected as `EXPIRED_CODE` on its last valid day.
   - Fix: compare against `.slice(0, 10)`.
2. **Fixed codes not capped (R4), `src/discounts.ts:30`.**
   - `BIGSAVER` (3000 cents) on a 2999-cent cart gives a 3000-cent discount.
   - `FIVEOFF` on an empty cart gives a total of −500.
   - Fix: `Math.min(code.value, subtotalCents)`.
3. **Free shipping (R8), `src/cart.ts:62`.**
   - The threshold uses the subtotal before the discount.
   - A 5000-cent cart with `WELCOME10` has a 4500-cent subtotal after the discount, but still ships free.
   - Fix: use `subtotalCents - discount`.

**Quality**
- **Tests: 🔴.** Nothing covers the expiry boundary, the cap, the shipping rule, or the HTTP 400 responses.
- **Structure and Maintainability: 🟡.**
- **Suggestions:** add the missing tests, and use a `Map` for the code table.
- **Question for the author:** should a code that expires after being applied silently drop out of the totals, as it does now?

To get a PASS, fix the three defects and add tests for each. The cap and the shipping rule need unit tests, and the expiry boundary needs a test at `2027-12-31T23:59:59Z`. The HTTP 400 responses for unknown and expired codes should also be tested.

Guides, usable as PR descriptions (`state.json` not created, since this was a review without a spec):
- `.aidt/tasks/feat-discount-codes/review/index.md`
- `.aidt/tasks/feat-discount-codes/review/s01-discount-codes.md`
