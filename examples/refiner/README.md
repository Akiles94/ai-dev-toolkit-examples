# Refiner: low-stock alerts (SHOP-24)

The [refiner](https://github.com/Akiles94/ai-dev-toolkit/blob/main/docs/refiner.md), installed
alone, on a one-line ticket. The spec continues in the [workflow example](../workflow/).

- [spec.md](spec.md): the approved spec.

## Cost

| Step | Model | Turns | Agent time | Tokens in (cached) | Tokens out | Cost at API prices |
|---|---|---|---|---|---|---|
| Questions, answers, approval | `claude-sonnet-5-5` | 3 | 1 min 40 s | 569k (544k) | 9k | $0.25 |

Measured with Claude Code on 2026-11-06. Most input tokens are cache reads, which cost a tenth of fresh input. With a Claude subscription the runs count toward usage limits instead.

## The conversation

### Call

**You:**

```text
/refiner SHOP-24 Low-stock alerts: when a product's stock drops below a threshold after a purchase, the shop owner should find out. Show low-stock products in the admin.
```

**Agent:**

I haven't created the branch or written anything yet. I need your answers to the points below first.

## 1. Branch
You're on `main`. I propose **`feat/SHOP-24-low-stock-alerts`**, which makes the task folder `.aidt/tasks/feat-SHOP-24-low-stock-alerts/`. There's no `AGENTS.md`, so I used the default convention. Confirm or give me another name.

## 2. Mode and control
- **Mode:** `full`. It covers alerting, an admin view and a threshold rule, so it will likely need more than one section.
- **Control:** `strict`, the project default. You approve the spec, the plan and every section.

## 3. What I found in the code
- **There's no admin.** The only routes are `/products` and `/carts`.
- **There's no purchase or checkout.** Adding to a cart doesn't touch stock. `reserveStock` in `src/products.ts` decreases stock but nothing calls it.
- **There's no notification mechanism, and no owner contact.**

The ticket assumes all three exist, so the questions below depend on this.

## 4. Questions

1. **What counts as a "purchase"?** (Stock only drops when something calls `reserveStock`.)
   - a) This ticket also adds a minimal checkout that reduces stock. *(Recommended if you want to see it work end to end.)*
   - b) Stock-reducing purchase is a separate ticket. This one covers only the check that runs whenever stock drops, plus the admin list.
2. **How does the owner "find out"?**
   - a) Email to a configured owner address.
   - b) A persistent in-app alert, shown in the admin list and in a "recent alerts" view. *(Recommended, because nothing sends email today.)*
   - c) Both.
3. **What is the threshold?**
   - a) One global value for all products. *(Recommended.)*
   - b) A per-product value.
   - c) Per category.

   What is the value? The sample catalog has stock 12, 4, 30 and 0. Is "below" strict (`stock < 5`) or inclusive (`stock <= 5`)?
4. **When do alerts fire?**
   - a) Once, when stock crosses from at-or-above the threshold to below it. It re-arms after restock. *(Recommended.)*
   - b) On every purchase while stock is below the threshold.
5. **What about out-of-stock (stock 0)?** Is it a low-stock product, a separate "out of stock" state, or both? Today `p-4` is already at 0. Should it appear in the admin list?
6. **What does "the admin" mean here?** The project has no admin UI.
   - a) A new JSON endpoint such as `GET /admin/low-stock`. *(Recommended, since the project is API-only.)*
   - b) An HTML page.
   - c) Something else I'm missing.

   Does it need access control, or is it open for now?
7. **What should the admin list show for each product?** For example name, current stock, threshold, and sorted by lowest stock first. Do you want anything beyond that?

### Answers

**You:**

```text
Branch ok, full + strict. 1b. 2b. 3a, value 5. Strict: stock < 5. 4a. 5: both, it is low and shown as out of stock. 6a, open for now (auth is out of scope). 7: name, stock, threshold, lowest stock first.
```

**Agent:**

I created the branch `feat/SHOP-24-low-stock-alerts` and wrote the draft spec. The spec is at `.aidt/tasks/feat-SHOP-24-low-stock-alerts/spec.md`, with `state.json` in the same folder. It isn't approved yet.

## Summary

**Goal:** The shop owner learns when a product runs low and can see the low-stock products in the admin, lowest stock first.

**Requirements (10):**
- **R1–R2, low stock:** One global threshold of 5. A product is low when its stock is strictly below 5. Stock 0 is also low and shown as out of stock.
- **R3–R6, alerts:** An in-app alert is recorded once when a stock decrease takes a product from 5 or more to below 5. There are no repeats while it stays low. Restocking to 5 or more re-arms it. A failed decrease records nothing.
- **R7–R8, low-stock list:** An open admin list showing name, stock, threshold and an out-of-stock flag. It is sorted by lowest stock first, then by name.
- **R9, alerts view:** The admin can see recorded alerts, most recent first.
- **R10:** The list always reflects current stock.

**Out of scope:**
- Email or other outward notifications.
- A checkout or purchase flow, and a restock mechanism. Alerts react to any stock decrease.
- Admin authentication.
- Per-product thresholds or a threshold that changes at runtime.
- An HTML page.
- Dismissing alerts.

**Please check:** R9 (the alerts view) is my addition. You chose in-app alerts and listed what the list shows, but never said where the owner reads the alert records. If you want only the low-stock list to serve as the alert, I'll drop R9 and the alert-recording wording becomes "list only". Products already below 5 at startup, like "Refactoring" at 4 and "Kind of Blue (vinyl)" at 0, appear in the list without an alert, because nothing dropped them.

Do you approve the spec, or want changes (for example, dropping R9)? After approval I'll mark it approved, move `state.json` to `phase: plan`, and offer the handoff to the planner. The planner agent isn't installed in this repo (only `refiner.md` is), so the approved spec would be the final result here.

### Approval

**You:**

```text
Keep R9. Approved.
```

**Agent:**

The spec is approved, with R9 kept.

- **Spec:** `.aidt/tasks/feat-SHOP-24-low-stock-alerts/spec.md` now says `Status: approved`.
- **State:** `state.json` is at `phase: plan` with `approvals.spec` set. The timestamp is a placeholder, `2026-11-06T00:00:00Z`, because I only had today's date and not the time.
- **Branch:** `feat/SHOP-24-low-stock-alerts`.

There's no planner in this repo (`.aidt/agents/` only has `refiner.md`), so the approved spec is the final output of this step. You can paste it into SHOP-24 or give it to any developer or agent to plan and build. If you add the planner agent later, it can start from this `state.json`.
