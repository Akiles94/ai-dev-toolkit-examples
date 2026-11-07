# S1 · Discount codes

> Stack: [index](index.md) · Part 1 of 1 · Previous: none · Next: none
> Verdict: FAIL · Reviewed commit: `88eba3f` (HEAD `aa60128` adds only toolkit files)

## At a glance

| | |
|---|---|
| Reviewable lines | 70 (+68 / −5 in total; see note) in 4 files |
| Tests | 35 lines in 2 files |
| Filtered | 0 lines of noise, 0 of config (toolkit files under `.aidt/`, `.claude/`, `.github/` not reviewed) |
| Covers | R1–R9 (see index) |
| Reading time | ~8 min |

## Predict first

🤔 A customer has a $49.99 cart and applies a $30 code. What should the total be, and does the customer pay shipping?

## What it does

Adds `POST /carts/:id/discount`. The code is stored on the cart (`src/cart.ts:50`). `totals()` looks it up again on every read and subtracts the discount (`src/cart.ts:60-70`). The cart view returns `discountCents` and the code.

## Walkthrough

Input: `POST /carts/c1/discount {"code":"bigsaver"}`, cart holds one $29.99 item (2999 cents).

1. `src/server.ts:54-60` → body parsed, `code` is a string, calls `applyCode`.
2. `src/discounts.ts:21-24` → uppercases to `BIGSAVER`, finds it (fixed, 3000), checks expiry.
3. `src/cart.ts:50` → stores `discountCode = "BIGSAVER"`, replacing any earlier code.
4. `src/cart.ts:61` → `discountCents` returns 3000, more than the 2999 subtotal.
5. `src/cart.ts:62-63` → shipping uses the subtotal 2999 (under 5000), so 499 shipping.
6. `src/cart.ts:66` → total = 2999 − 3000 + 499 = 498. Expected: discount capped at 2999, total 499.

## Reading order

1. 🧠 `src/discounts.ts` · read carefully: lines 20-31
2. 🧠 `src/cart.ts` · read carefully: lines 45-70
3. ⚙️ `src/server.ts` · skim lines 54-60
4. ⚙️ `src/types.ts` · skim
5. 🧠 `tests/discounts.test.ts` · note what is not tested

## Affected flows

- **Direct:** apply code to cart, cart totals.
- **Indirect:** `GET /carts/:id`, add and remove item (all use `cartView` and `totals`).

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R1 apply one code via POST | `server.ts:54` | none over HTTP | ⚠️ Partial |
| R2 case-insensitive | `discounts.ts:21` | `finds codes case-insensitively` | ✅ Met |
| R3 percent off subtotal | `discounts.ts:29` | `takes a percentage off the subtotal` | ✅ Met |
| R4 fixed off, never above subtotal | `discounts.ts:30` | none | ❌ Missing |
| R5 valid through end of expiry day (UTC) | `discounts.ts:23` | none for the boundary | ❌ Missing |
| R6 UNKNOWN_CODE / EXPIRED_CODE as 400 | `server.ts:58`, `discounts.ts:22-23` | function level only, not HTTP | ✅ Met |
| R7 second code replaces first | `cart.ts:50` | `a second code replaces the first` | ✅ Met |
| R8 free shipping from $50 on post-discount subtotal | `cart.ts:62` | none | ❌ Missing |
| R9 cart view shows discount | `cart.ts:64-69`, `server.ts:19` | none | ✅ Met |

## Findings

### 🔴 A code expires at the start of its last day, not the end · `src/discounts.ts:23`
**Fails when:** `expiresOn = "2027-12-31"`, now is `2027-12-31T10:00Z`. The string `"2027-12-31"` sorts before `"2027-12-31T10:00:00.000Z"` (it is a prefix), so the code answers `EXPIRED_CODE` on its final valid day. The ticket says valid through the end of that date. The only expiry test uses a date a month after, so it cannot see this.
**Fix:**
```suggestion
  if (found.expiresOn < today.toISOString().slice(0, 10)) return "EXPIRED_CODE";
```

### 🔴 Fixed discount can exceed the subtotal · `src/discounts.ts:30`
**Fails when:** one 2999-cent item and `BIGSAVER` (3000) → discount 3000. With an empty cart and `FIVEOFF` → discount 500, `totalCents = -500`. Negative totals are possible.
**Fix:**
```suggestion
  return Math.min(code.value, subtotalCents);
```

### 🔴 Free shipping uses the subtotal before the discount · `src/cart.ts:62`
**Fails when:** 5000-cent subtotal with `WELCOME10`: discount 500, post-discount 4500, but `subtotalCents >= 5000` gives shipping 0. The ticket says free shipping is based on the subtotal after the discount, so shipping should be 499.
**Fix:**
```suggestion
  const shippingCents =
    subtotalCents === 0 || subtotalCents - discount >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
```

### 🟡 An applied code that later expires silently drops out of the totals · `src/cart.ts:60-61`
`totals` re-validates the code and treats `EXPIRED_CODE` as no discount, without telling the customer. Maybe intended, but the ticket does not say.

## Quality

| Dimension | Rating | Why |
|---|---|---|
| Structure | 🟡 | New `src/discounts.ts` is well placed. The audit flags `src/types.ts` and `src/utils.ts`, both existing before; this change only adds 2 lines to `types.ts`. |
| Practices | ✅ | Errors as values, same style as `addItem`. |
| Readability | ✅ | Small functions, clear names. |
| Maintainability | 🟡 | Code table hard-coded at `discounts.ts:10`; `totals` cannot inject the date, so it is hard to test expiry through the cart. |
| Performance | ✅ | One lookup per totals call. |
| Security | ✅ | Body type checked; lookup is a record key with uppercased input. |
| Tests | 🔴 | No test covers the boundary day, the cap, the shipping rule or the HTTP 400 responses. Three requirements with bugs have no test. |

### 🟡 Add tests for the gaps · `tests/discounts.test.ts`
Add: expiry boundary (`2027-12-31T23:59:59Z` valid, `2028-01-01T00:00:00Z` expired), fixed code above subtotal, free shipping on the post-discount subtotal, and HTTP 400 `UNKNOWN_CODE` / `EXPIRED_CODE`.

### 🟡 Use a `Map` for the code table · `src/discounts.ts:10`
A plain object lookup with user input can hit inherited keys. Not exploitable today (keys are uppercased, so `constructor` does not match), but a `Map` removes the risk class.

## Questions for the author

- Should an applied code that later expires be removed from the cart, or ignored in totals (current behavior)?
