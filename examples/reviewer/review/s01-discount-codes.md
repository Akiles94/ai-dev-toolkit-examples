# S1 · Discount codes

> Stack: [index](index.md) · Part 1 of 1 · Previous: none · Next: none
> Verdict: FAIL · Reviewed commit: `41a22c3` (feature commit `54e73bd`)

## At a glance

| | |
|---|---|
| Reviewable lines | 65 (+62 / −3) in 4 files |
| Tests | 36 lines changed (+35 / −1) in 2 files |
| Filtered | 0 lines of noise, 0 of config |
| Covers | R1–R9 (derived from ticket SHOP-12) |
| Reading time | ~8 min |

## Predict first

🤔 A customer has a $5.00 item and applies a fixed $30 code. What should the total be, and what does the code give?

## What it does

Adds `POST /carts/:id/discount`. It looks the code up (case-insensitive), rejects unknown or expired codes with 400, and stores the code on the cart (`src/cart.ts:45`). `totals()` then subtracts a discount and the cart view returns `discountCents` (`src/cart.ts:56-69`, `src/server.ts:19`). Codes live in a hard-coded table (`src/discounts.ts:9`).

## Walkthrough

Input: cart with one item at $40.00 (4000 cents), `POST /carts/c1/discount {"code":"welcome10"}`.

1. `src/server.ts:54` → body parsed, `code` is a string.
2. `src/cart.ts:47` → `findCode("welcome10")` → `src/discounts.ts:21` upper-cases to `WELCOME10`, found, not expired.
3. `src/cart.ts:50` → cart stores `discountCode = "WELCOME10"`; a new code overwrites the old one.
4. `src/server.ts:60` → `cartView` calls `totals()`.
5. `src/cart.ts:58` → code re-resolved; `discountCents(…, 4000)` = 400.
6. `src/cart.ts:60` → shipping looks at the **undiscounted** subtotal 4000, so 499 is charged. Total = 4000 − 400 + 499 = 4099.

## Reading order

1. 🧠 `src/discounts.ts` · read carefully: lines 20-31
2. 🧠 `src/cart.ts` · read carefully: lines 44-69
3. ⚙️ `src/server.ts` · skim: lines 54-60
4. ⚙️ `src/types.ts` · skim
5. 🧪 `tests/discounts.test.ts`

## Affected flows

- **Direct:** apply a code; cart totals; cart view.
- **Indirect:** every endpoint that returns `cartView` (GET cart, add item, remove item) now includes `discountCents` and `discountCode`.

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R1 Apply one code via POST /carts/:id/discount | `src/server.ts:54` | none at HTTP level | ⚠️ Partial |
| R2 Case-insensitive | `src/discounts.ts:21` | `finds codes case-insensitively` | ✅ Met |
| R3 Percent off subtotal | `src/discounts.ts:30` | `takes a percentage off the subtotal` | ✅ Met |
| R4 Fixed off, never above subtotal | `src/discounts.ts:31` | none | ❌ Missing |
| R5 Valid through end of expiry date (UTC) | `src/discounts.ts:23` | none for the boundary | ❌ Missing |
| R6 Unknown 400 UNKNOWN_CODE, expired 400 EXPIRED_CODE | `src/discounts.ts:22-23`, `src/server.ts:58` | unit only | ⚠️ Partial |
| R7 Second code replaces first | `src/cart.ts:50` | `a second code replaces the first` | ✅ Met |
| R8 Free shipping uses subtotal after discount | `src/cart.ts:60-61` | none | ❌ Missing |
| R9 Cart view shows discount | `src/server.ts:19` | none | ✅ Met |

## Findings

### 🔴 Expiry compares a date to a full timestamp, so a code dies at 00:00 UTC of its last day · `src/discounts.ts:23`
**Fails when:** `SUMMER25` (expires `2026-09-01`) is used on 2026-09-01 at 10:00 UTC. `"2026-09-01" < "2026-09-01T10:00:00.000Z"` is true, so it answers `EXPIRED_CODE` on its last valid day. The ticket says valid through the end of the expiry date.
**Fix:**
```suggestion
  if (found.expiresOn < today.toISOString().slice(0, 10)) return "EXPIRED_CODE";
```

### 🔴 Fixed discount is not capped at the subtotal · `src/discounts.ts:31`
**Fails when:** subtotal is 500 cents and `BIGSAVER` (3000) is applied: discount 3000, total = 500 − 3000 + 499 = −2001. An empty cart with `FIVEOFF` gives total −500.
**Fix:**
```suggestion
  return Math.min(code.value, subtotalCents);
```

### 🔴 Free shipping ignores the discount · `src/cart.ts:60-61`
**Fails when:** subtotal 5400 and `BIGSAVER` applied. After the discount the subtotal is 2400, under $50, so shipping (499) is due. The code uses 5400, charges 0 shipping, and the customer pays 2400 instead of 2899.
**Fix (needs the cap above):**
```suggestion
  const discounted = subtotalCents - discount;
  const shippingCents =
    discounted === 0 || discounted >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
```
and `totalCents: discounted + shippingCents`.

### 🟡 Missing tests for the new rules · `tests/discounts.test.ts`
No test covers the expiry boundary day, the cap, shipping after discount, or the endpoint status codes (400 UNKNOWN_CODE / EXPIRED_CODE, 404 cart). That is why the three bugs above pass the suite (11 of 11 green). The expired test uses 2026-10-01, which is not the boundary.

### 🟡 Non-object JSON body gives a 500 · `src/server.ts:54`
**Fails when:** body is `null` → `body.code` throws a TypeError, answered as 500 INTERNAL. Same pattern as the existing items route, so low priority.

### ℹ️ A code that expires after being applied silently stops discounting · `src/cart.ts:58`
`totals()` drops the discount with no signal. Probably acceptable; confirm it is intended.

## Questions for the author

- Is a silently dropped expired code at view time intended?
