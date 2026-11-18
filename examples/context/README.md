# Context: what every new session reads

The [context](https://github.com/Akiles94/ai-dev-toolkit/blob/main/docs/context.md) product on this
repository: `aidt context check` before and after, the agent closing a block as
`.aidt/practices/session-context.md` says, and the same session start measured on both sides.

- **Before** (commit `055cc16`): an `AGENTS.md` imported by `CLAUDE.md`, and a status that kept the
  story of every block since the setup, as a status does when nothing stops it. Its content is this
  repository's real history (the other examples), written by hand in that style: it is the input,
  not an agent's output.
- **The close** (commit `4348309`): one prompt to the agent; everything it wrote is kept as it wrote
  it: [`.aidt/status.md`](../../.aidt/status.md), [`.aidt/tasks/README.md`](../../.aidt/tasks/README.md)
  and one `summary.md` per closed block under [`.aidt/tasks/`](../../.aidt/tasks/).

## Cost

| Step | Model | Turns | Agent time | Tokens in (cached) | Tokens out | Cost at API prices |
|---|---|---|---|---|---|---|
| Session start, status that kept every block (median of 3) | `claude-sonnet-5-5` | 4 | 8 s | 155k (140k) | 761 | $0.076 |
| Close the block: 5 summaries, the index, the status rewritten | `claude-sonnet-5-5` | 15 | 1 min 5 s | 449k (419k) | 11k | $0.28 |
| Session start, status rewritten (median of 3) | `claude-sonnet-5-5` | 2 | 7 s | 76k (67k) | 628 | $0.051 |

- The three starts before took 2, 4 and 4 turns ($0.072 to $0.078); the three after, 2 turns every
  time ($0.050 to $0.051). Same question, same answer each time: where the work stands, the next
  block, the files to read first.
- Here the status was small (2,130 tokens), so a session start saves about $0.025. The saving
  grows with the status: on a real project after three weeks, `aidt context check` measured
  19,891 tokens of status and 5,110 of rules, read before every session's first step.
- Most input tokens are Claude Code's own instructions and tools, the same in every session, and
  cache reads, which cost a tenth of fresh input.

Measured with Claude Code 2.1.327, headless (`claude -p`), on 2026-11-18. With a Claude
subscription the runs count toward usage limits instead.

## `aidt context check` (a script, no AI)

Before:

```text
Always (loaded by the tool): 477 / 3,000 tokens · ok
    AGENTS.md  474
    CLAUDE.md  3
Start (read first, every session): 2,130 / 2,500 tokens · ok
    .aidt/status.md  2,130

Tokens ≈ characters / 4. Layers and how to trim them: .aidt/practices/session-context.md
```

Within budget, but growing by about 350 tokens per block: over the budget by the eighth.

After:

```text
Always (loaded by the tool): 477 / 3,000 tokens · ok
    AGENTS.md  474
    CLAUDE.md  3
Start (read first, every session): 423 / 2,500 tokens · ok
    .aidt/status.md  423
Read first (next session): 3 path(s), 1,412 tokens

Tokens ≈ characters / 4. Layers and how to trim them: .aidt/practices/session-context.md
```

## The conversation

### Session start, before

**You:**

```text
Start of a new session. Following CLAUDE.md, tell me in a few lines where the work stands, what the next block is and which files you would read before its first step. Do not change anything.
```

**Agent** (first of the three runs):

**Where the work stands** (status last updated 07/11/2026)
- Setup is done: the API, the toolkit install, and the decision to keep each agent's run in `examples/`.
- SHOP-12 (reviewer, FAIL on planted bugs) and SHOP-31 (walkthrough) are done and not merged.
- SHOP-24 (low-stock alerts) is delivered as stacked PRs #3 and #4, both PASS from the reviewer. They are open and not merged.
- The structure audit is decided: keep the current layout, improved. The migration is not started.

**Next block: SHOP-40, a storefront page**
- At `/`, product cards show name, price and stock, with a category filter.
- A card shows "Only N left" under 5 in stock. At 0 it shows "Out of stock" and can't be added.
- "Add to cart" uses the existing cart endpoints. A cart panel shows items, subtotal, shipping (free from $50) and total, with a remove button.
- It runs on branch `feat/SHOP-40-storefront` from `main`, with the full workflow (`/refiner` → `/planner` → `/builder` → `/reviewer`) at control `strict`. A `/demo` kept in `examples/demo/` follows.

**Files I'd read before the first step** (the status's «Read first» list):
- `src/server.ts`, for the routes the page will call.
- `src/cart.ts`, for totals and shipping.
- `src/products.ts`, for the catalogue and its stock.

The first step is `/refiner` on the SHOP-40 ticket, after creating the branch. I haven't changed anything. Two caveats:
- The status says nothing is pushed or merged without your explicit yes.
- The status is dated 07/11 and today is 18/11. I haven't checked `git` for anything newer.

### Closing the block

**You:**

```text
Close the last block, SHOP-24 (delivered on 07/11 as PRs #3 and #4), following .aidt/practices/session-context.md. The status has kept the story of every block since the setup: give each closed block its record and its row in the tasks index, and rewrite the status for the next session, which starts SHOP-40. Then run aidt context check and tell me what you changed.
```

**Agent:**

SHOP-24 is closed and `aidt context check` passes. I haven't committed anything, because nothing is committed without your yes.

The check reports:
- **Always:** 477 of 3,000 tokens.
- **Start:** the status is 423 of 2,500 tokens. It was well over that before the rewrite, because it kept every block's story.
- **Read first:** 3 paths, 1,412 tokens.

**What I changed**
- **Block records:** I created `.aidt/tasks/<folder>/summary.md` for each of the five closed blocks. Each is built from the status's old story and the `examples/` runs:
  - `setup/`
  - `feat-discount-codes/` (SHOP-12)
  - `feat-checkout-orders/` (SHOP-31)
  - `structure-decision/`
  - `feat-SHOP-24-low-stock-alerts/`
- **SHOP-24 record:** It joins the refine and the full-workflow build into one block, as one ticket. It links the spec, plan and review index in `examples/`. It also lists the eight planner decisions, the four-to-two section merge, the costs and the two PASS verdicts (`e829af2`, `fb160a7`).
- **Tasks index:** `.aidt/tasks/README.md` has one row per block, newest last. SHOP-24 shows "not yet, drafts open" under Merged.
- **Status:** `.aidt/status.md` is rewritten from the template: Now, Next, Read first, Not needed, Open decisions and Recent. Next is SHOP-40 with its ticket, and Read first is the same three source files as before.

**Check these**
- The setup and structure blocks ran on `main`, so I gave them short folder names (`setup/`, `structure-decision/`) instead of branch names.
- I took the status header (`055cc16` on `main`) from the current HEAD, not from a merge commit, because nothing was merged.
- I copied dates from the old status, which writes 07/11 for several blocks while `examples/` says 2026-11-06. I didn't reconcile them.
- The two open decisions are my guess at recommendations: keep PRs #3 and #4 as examples, and do the structure migration after SHOP-40.

The practice says to commit the three together with the block. Tell me when, and I'll do it.

**You:** (the changes were committed as they were, in `4348309`.)

### Session start, after

**You:** the same message as before.

**Agent** (first of the three runs):

**Where it stands:** Nothing is in progress. The status was last updated 07/11/2026 at `055cc16` on `main`. SHOP-24 (low-stock alerts) is closed. PRs #3 and #4 are open as drafts, and the reviewer gave both a PASS.

**Next block:** SHOP-40, a storefront page at `/`.
- The page lists products as cards (name, price, stock) with a category filter.
- A card says "Only N left" under 5 in stock, and "Out of stock" at 0, where it can't be added.
- "Add to cart" uses the existing cart endpoints. A cart panel shows the items, subtotal, shipping (free from $50) and total, with a way to remove an item.
- It runs on branch `feat/SHOP-40-storefront` from `main`, with the full workflow (`/refiner` → `/planner` → `/builder` → `/reviewer`) at control `strict`. After that comes a `/demo`, kept in `examples/demo/`.

**Files I would read before the first step** (the status's «Read first» list):
- `src/server.ts`, for the routes the page will call
- `src/cart.ts`, for totals and shipping
- `src/products.ts`, for the catalogue and its stock

I would skip `.aidt/tasks/`, `examples/` and `.aidt/structure.md`, as the status says.

**Open decisions for you:**
- Keep PRs #3 and #4 as the workflow's example (recommended), or merge them into `main`?
- Run the structure migration after SHOP-40 (recommended), or earlier?

I haven't changed anything, and nothing will be pushed or merged without your yes.
