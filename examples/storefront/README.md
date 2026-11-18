# Workflow: a storefront page (SHOP-40), end to end

The [workflow](https://github.com/Akiles94/ai-dev-toolkit/blob/main/docs/workflow.md) on a change a person sees: the API's first web page. Mode `full`, control `strict`, every approval given by hand. The page is what the [demo example](../demo/) records.

- [spec.md](../../.aidt/tasks/feat-SHOP-40-storefront/spec.md), [plan.md](../../.aidt/tasks/feat-SHOP-40-storefront/plan.md), [state.json](../../.aidt/tasks/feat-SHOP-40-storefront/state.json): the task folder at the end.
- [review/](../../.aidt/tasks/feat-SHOP-40-storefront/review/): the reviewer's guides, PASS on the three sections.
- The code: `src/static.ts`, `public/`, `tests/static.test.ts`, `tests/shop-view.test.ts`, `tests/cart-session.test.ts`.

## Cost

| Step | Model | Turns | Agent time | Tokens in (cached) | Tokens out | Cost at API prices |
|---|---|---|---|---|---|---|
| Refiner | `claude-sonnet-5-5` | 15 | 1 min | 557k (533k) | 7k | $0.22 |
| Planner | `claude-sonnet-5-5` | 13 | 59 s | 438k (409k) | 8k | $0.23 |
| Builder, 3 sections | `claude-sonnet-5-5` | 79 | 3 min 22 s | 2.9M (2.8M) | 29k | $0.83 |
| Reviewer | `claude-sonnet-5-5` | — | 1 min 19 s | 791k (722k) | 12k | $0.37 |
| **Total** | | | | | | **$1.65** |

Measured with Claude Code 2.1.327, headless (`claude -p`), on 2026-11-18, with every answer typed by hand. Most input tokens are cache reads, which cost a tenth of fresh input. Agents that run apart from the conversation (the reviewer, the demo's first call) report no turns. With a Claude subscription the runs count toward usage limits instead.

## The conversation

### Refiner

**You:**

```text
/refiner SHOP-40 Storefront page. At `/`, a page lists the products as cards (name, price, stock), with a category filter. Under 5 in stock the card says "Only N left"; at 0 it says "Out of stock" and cannot be added. "Add to cart" uses the existing cart endpoints, and a cart panel shows the items, subtotal, shipping (free from $50) and total, with a way to remove an item.
```

**Agent:**

Before I write the spec, I need your confirmation on the branch and the mode.

**Branch.** You're on `claude/gifted-volta-n479gk`, which is unrelated to this task. I propose `feat/SHOP-40-storefront`, cut from `main`, as `.aidt/status.md` plans. The task folder would be `.aidt/tasks/feat-SHOP-40-storefront/`. Confirm or give me another name, and I'll create it and switch to it.

**Mode and control.** I propose `full` mode with `strict` control. The ticket needs several sections, and `strict` is the repo default.

**Business questions.** The recommended option is first in each.

1. **Cart across visits.** If the person reloads the page, should their cart still be there?
   - (a) Yes, the same cart comes back.
   - (b) No, each visit starts an empty cart.
2. **Same product added twice.** Each click adds 1 unit, and the line's quantity goes up. Is that right?
   - (a) Yes, one unit per click.
   - (b) The card has a quantity selector.
3. **Stock limit.** A product has 4 in stock and the cart already holds 4. What should the person see on a further "Add to cart"?
   - (a) A short message such as "No more in stock", with the cart unchanged.
   - (b) The button is disabled once the cart holds all the stock.
4. **Cart lines.** Each cart line would show the product name, quantity and line price. Is that enough?
   - (a) Yes.
   - (b) Also show the unit price.
5. **Remove.** Should "remove" take the whole line out of the cart (what the existing endpoint does), or one unit at a time?
   - (a) The whole line.
   - (b) One unit at a time.
6. **Stock on the cards.** The card shows the catalogue's stock, which does not drop when items go into a cart. It only drops at checkout, which stays out of scope. Is that acceptable?
   - (a) Yes.
   - (b) No, the card should show stock minus what is in the cart.
7. **Category filter.** The filter would offer "All" plus books, games and music, and start on "All". Is that right?
   - (a) Yes.
   - (b) Something else.

Answer by number, e.g. "branch ok, full/strict, 1a 2a 3a 4a 5a 6a 7a". Then I'll create the branch and write the spec.

**You:**

```text
Branch ok, but cut it from the current branch, not from main: this one has the context and demo products installed. full/strict, 1a 2a 3a 4a 5a 6a 7a.
```

**Agent:**

I haven't created the branch. The `git switch -c feat/SHOP-40-storefront` command needs your approval, and it wasn't granted. You're still on `claude/gifted-volta-n479gk`, and I haven't written anything.

I don't want to write the spec first. The task folder is named after the branch, so `.aidt/tasks/feat-SHOP-40-storefront/` would be orphaned if the branch doesn't exist.

I'll cut the branch from your current branch, as you asked, not from `main`. Either approve the command, or switch yourself with `git switch -c feat/SHOP-40-storefront` and tell me. Once I'm on that branch, I'll write the spec with your answers: `full`/`strict`, 1a 2a 3a 4a 5a 6a 7a.

**You:**

```text
I switched: you're on feat/SHOP-40-storefront now. Go on.
```

_Run headless, `git switch` was not pre-approved, so the user created the branch with `git switch -c feat/SHOP-40-storefront`._

**Agent:**

The spec is written, still in draft, at `.aidt/tasks/feat-SHOP-40-storefront/spec.md`. `state.json` is in the same folder. Nothing has been run or tested; I only wrote the two files.

**Goal.** A person can browse, filter, add to a cart and remove items from a page at `/`. They don't have to call the JSON API by hand.

**Requirements (R1–R12)**
- **R1–R2:** One card per product with name, price and stock. The filter offers All, books, games and music, and starts on All.
- **R3–R4:** Stock of 5 or more shows "N in stock". With 1 to 4 left the card says "Only N left". At 0 it says "Out of stock" and can't be added.
- **R5–R6:** "Add to cart" adds 1 unit, and adding the same product again raises that line's quantity. At the stock limit the page shows "No more in stock" and the cart doesn't change.
- **R7–R8:** The cart panel shows each line with name, quantity and line price, plus subtotal, shipping and total. Shipping is $4.99 under $50 and free from $50. An empty cart shows $0.00 throughout.
- **R9:** Remove takes out the whole line.
- **R10–R11:** The cart survives a reload. If the kept cart no longer exists, the page starts a new empty one without an error.
- **R12:** No new product or cart behavior. Everything comes from the existing endpoints.

**Out of scope**
- Checkout, payment and any stock reduction.
- A quantity selector, and removing one unit at a time.
- Search, sorting, images and accounts.
- Changes to the JSON API.

All seven of your answers are recorded under Decisions, each with the alternative you discarded. There are no open questions.

**One thing to check.** The catalogue can't reach a subtotal of exactly $50.00. I kept that case in R8 as a rule of the shop, and the planner will have to test it at the cart level.

Do you approve the spec, or do you want changes? On approval I'll set `Status: approved` and update `state.json` with `phase: plan` and the spec approval. You can then continue with `/planner`.

**You:**

```text
Approved.
```

**Agent:**

The spec is approved. I set `Status: approved` in `.aidt/tasks/feat-SHOP-40-storefront/spec.md`. In `state.json` I set `phase: plan`, mode `full`, control `strict`, and recorded the spec approval as 2026-11-18.

Nothing is committed or pushed. The task folder is untracked on `feat/SHOP-40-storefront`.

Next step: run `/planner` to plan the work. I won't start it myself.

### Planner

**You:**

```text
/planner
```

**Agent:**

I've read the spec and the code. Three decisions aren't settled by the project rules, so I need your answers before I write the plan. My recommendation comes first in each.

**1. How is the page served?**
- **a) Static files** in `public/` (`index.html`, `app.js`, `shop-view.js`, `style.css`), with a small static handler in `server.ts` for `GET /`. I recommend this. The browser needs plain JavaScript, because it can't run `.ts`, and static files keep it as ordinary front-end code.
- b) One TypeScript module that returns the whole page as an HTML string. This is a single file, but it embeds JS and CSS in strings that nobody can lint or read well.

**2. How do we test the page without a browser or any dependency?**
- **a) Pure view logic in `public/shop-view.js`, tested with `node:test`.** I recommend this. It holds the card stock label (R3/R4), the cents-to-dollars format, the category filter and the cart line view. `app.js` does only the DOM work and `fetch`. Server tests cover `GET /` and the static handler. R10 and R11 (kept cart, unknown cart) are tested through a small `cart-session` function that takes a storage object and a fetch function, so the tests can pass in fakes. The DOM itself is checked by hand in `/reviewer` and the demo.
- b) Add a browser test tool such as Playwright. This tests the real page, but it adds a dependency and breaks the "no dependencies" rule.

**3. Where does `formatCents` come from on the client?**
- **a) A small copy in `shop-view.js`, with a test that checks it gives the same output as `src/utils.ts`.** I recommend this. The server and the page stay independent, and the test catches drift.
- b) Serve `src/utils.ts` to the browser. Browsers can't run it as it is, and I'd have to turn it into plain JS first.

If you agree with all three, say "go with the recommendations". Then I'll write the plan with about 3 sections and show you the sections table to approve.

**You:**

```text
Go with the recommendations.
```

**Agent:**

The plan is written to `.aidt/tasks/feat-SHOP-40-storefront/plan.md` with status draft. It is not approved yet.

**Approach:** the server serves a fixed list of static files from `public/`. The page loads the whole catalogue once, filters it in the browser, and uses the existing cart endpoints. All amounts come from `GET /carts/:id`. The logic that can go wrong lives in pure functions tested with `node:test`, and `app.js` only does the DOM.

| # | Name | Intent | Est. lines | Covers |
|---|---|---|---|---|
| S1 | Serve the page | `src/static.ts` and a hook in `server.ts` for `GET /`, plus a minimal `index.html`. A path whitelist and JSON 404s stay as they are. | ~45 | R12 |
| S2 | Page logic | `public/shop-view.js` (stock labels, filter, cart panel view, `formatCents` copy with a parity test) and `public/cart-session.js` (kept cart, stale-cart recovery, "No more in stock"). Tests come first. | ~110 | R2–R11 logic |
| S3 | Page wiring | `app.js`, markup and `style.css` that draw the cards, filter and cart panel. Checked by hand against the spec's acceptance table. | ~150 | R1–R11 in the browser |

Every requirement maps to at least one test (table in the plan). Risks I recorded:
- The DOM code has no automated test. I keep it thin and check it by hand.
- A stale cart also fails on `POST` and `DELETE`, not only on open, so `cart-session` handles all three.
- Cart lines carry only product ids, so the panel joins them with the loaded catalogue.

Do you approve the approach and the sections? On a yes I'll set `Status: approved` and update `state.json` (`phase: build`, `approvals.plan`, three sections `pending`). Then you can continue with `/builder`.

**You:**

```text
Approved.
```

**Agent:**

The plan is approved. `plan.md` now says `Status: approved`. `state.json` has `phase: build`, `approvals.plan` set to 2026-11-18, and S1, S2 and S3 as `pending`.

The next step is `/builder`, starting with S1 (Serve the page). I haven't started it.

### Builder

**You:**

```text
/builder
```

**Agent:**

## S1 · Serve the page: awaiting your approval

The spec and plan are committed as `3657560`. `GET /` now returns an HTML shell, and `/app.js`, `/shop-view.js`, `/cart-session.js` and `/style.css` come from a fixed list of files in `public/`. Anything else keeps the JSON 404. A path from the request is only ever a key into that list, never part of a file path, so `/../package.json` can't reach anything.

**Open in this order:**
1. `src/static.ts`: the file list and `serveStatic`, which returns `true` or `false`
2. `src/server.ts:63`: the single call, placed after every API route so it can't shadow an endpoint
3. `public/index.html`, `public/app.js`, `public/style.css`: the shell and two placeholders
4. `tests/static.test.ts`

**Decisions not in the plan:**
- `public/app.js` and `public/style.css` are empty placeholders, which the plan doesn't list for S1. Without them there is no real JS or CSS to serve, so the content-type tests couldn't pass. S3 fills them.
- `tests/static.test.ts`: I left out the content-type test for `shop-view.js` and `cart-session.js` because those files don't exist until S2. I'll add it there.
- `src/static.ts:27`: a listed file that is missing returns `false`, so it gets the normal JSON 404 instead of a 500.

**Verify:** `npm test` passes all 12 tests (6 of them new). To see the shell, run `npm start` and open http://localhost:3000/.

**Size:** 52 reviewable lines (limit 300) and 66 test lines. `aidt check` shows 2 of 12 requirements referenced by tests so far, which is right for S1. R2–R11 land in S2 and S3.

Questions, changes, or an explicit yes to commit S1?

**You:**

```text
Yes, commit S1 and go on with S2.
```

**Agent:**

The `git add` for S1 needs your approval in the permission prompt, and it was declined or not yet answered. I haven't committed anything.

The working tree is clean of guide comments and all 12 tests pass. S1 is still `awaiting-approval` in `state.json`, and I haven't started S2.

Approve the `git add` / `git commit` prompt and I'll commit S1, record the hash and line count in `state.json`, then start S2. If you'd rather commit it yourself, say so and I'll carry on from there.

**You:**

```text
Approved, go ahead: commit S1 and go on with S2.
```

_The resumed headless session had no permission for `git add` and `git commit`; they were allowed for the rest of the run, as the builder's own command list says._

**Agent:**

## S2 · Page logic: awaiting your approval

S1 is committed as `7b2172d`. S2 adds two modules the page will use, both free of the DOM so `node:test` can run them.

- **`shop-view.js`** turns data into text: stock labels, the category filter, and the cart panel's lines and amounts.
- **`cart-session.js`** keeps the cart id in storage across reloads. It also handles the shop forgetting the cart, and the stock limit (409).

**Open in this order:**
1. `public/shop-view.js`
2. `public/cart-session.js`
3. `tests/shop-view.test.ts`
4. `tests/cart-session.test.ts`, which runs against the real server
5. `tests/static.test.ts`: the content-type test deferred from S1

**Decisions not in the plan:**
- `public/shop-view.js:44`: a cart line whose product isn't in the catalogue shows the id as its name and "—" as the line price. The plan only said it must not crash.
- `public/cart-session.js:17`: after `POST /carts` there is a follow-up `GET /carts/:id`, because `POST /carts` returns the cart without totals. Every caller then gets the same cart shape.
- `public/cart-session.js:45`: when the shop has forgotten the cart, `addToCart` creates a new cart and retries the add once, with no loop. `removeFromCart` just returns the new empty cart.
- `public/cart-session.js:25`: any answer other than a cart, a 409 or a missing cart (a 500, say) throws, so a real failure is never hidden. S3's `app.js` will need to catch it.
- `public/cart-session.js`: the functions take a `cartId` argument rather than a cart object.

**Verify:** `npm test` passes all 34 tests, 22 of them new, including the `formatCents` parity test against `src/utils.ts`.

**Size:** 109 reviewable lines (limit 300) and 255 test lines. `aidt check` shows 12 of 12 requirements referenced by tests. R1–R12 are only referenced so far; R1–R11 still need the by-hand browser run in S3.

Questions, changes, or an explicit yes to commit S2?

**You:**

```text
Yes, commit S2 and go on with S3.
```

**Agent:**

S2 is committed as `06da872`. S3 is written and `npm test` still passes all 34 tests, but I have not run the page in a browser.

## S3 · Page wiring: awaiting your approval

The page is now a working storefront. `index.html` has the category filter, the product area and the cart panel. `app.js` loads the catalogue once, then restores the kept cart. It draws one card per product, and on a click it calls `cart-session.js` and redraws the panel. `style.css` is a two-column layout that stacks on a narrow screen.

**Open in this order:**
1. `public/index.html`
2. `public/app.js`, read from `start()` at the bottom, then `add` and `remove`
3. `public/style.css`, which only styles and carries no behaviour

**Decisions not in the plan:**
- `public/index.html`: the filter is a `<select>` (All, Books, Games, Music) rather than buttons.
- `public/app.js:55`: at 0 stock the "Add to cart" button is disabled rather than removed. The plan allowed either.
- `public/app.js`: cards and lines are built with `textContent`, never `innerHTML`, so product names can't inject markup.
- `public/app.js:94`: a thrown error from `cart-session` shows "Something went wrong. Try again." in the message area. This is the catch S2 said S3 would need.
- `public/app.js`: the message is cleared after a successful add or remove, and the "No more in stock" message stays until then.
- An empty cart shows no lines and $0.00 everywhere, with no "cart is empty" note, since the spec doesn't ask for one.

**Verify:** `npm test` passes all 34 tests. The DOM code has no automated tests, as the plan said. My allowed commands don't include starting the server, so the by-hand acceptance run is yours. Run `npm start`, open http://localhost:3000/ and check:
- the filter, and "Only 4 left" on Refactoring
- Kind of Blue can't be added
- Refactoring × 4, then "No more in stock"
- shipping $4.99 on Tetris Effect alone, free once Refactoring is added
- Remove
- a reload keeps the cart
- restarting the server shows an empty cart with no error

**Size:** 256 reviewable lines (limit 300), against the plan's ~150, mostly the stylesheet. It includes about 13 temporary guide lines, so it will be a little smaller once they are cleaned. There are no new test lines. `aidt check` shows 12 of 12 requirements referenced.

Questions, changes, or an explicit yes to commit S3?

**You:**

```text
I checked it in the browser: filter, Only 4 left, Kind of Blue disabled, No more in stock at 5, shipping free once Refactoring is in, remove, and the cart survives a reload. Yes, commit S3.
```

**Agent:**

S3 is committed as `c043ebf`, and all three sections are approved. `state.json` now says `phase: review`.

| Section | Commit | Lines |
|---|---|---|
| S1 · Serve the page | `7b2172d` | 52 |
| S2 · Page logic | `06da872` | 109 |
| S3 · Page wiring | `c043ebf` | 243 |

- **Tests:** `npm test` passes all 34 tests. `aidt check` shows 12 of 12 requirements referenced by a test.
- **Browser run:** your by-hand check covered the filter, "Only 4 left", Kind of Blue disabled, "No more in stock", free shipping, remove, and a reload keeping the cart. It didn't mention the restart case (R11: a shop restart gives an empty cart with no error). That case is covered by the automated cart-session tests but hasn't been tried in the browser.
- **Lines:** the S3 count is 243 added lines from `git diff`, because `aidt check` didn't list S3 yet. That's within the 300 limit.
- **Uncommitted:** `state.json` is still modified. It holds the hashes and `phase: review`, and I haven't committed it. Tell me if you want it committed, or if it should go in with the reviewer's work.
- **Nothing pushed.** The three section commits and the spec/plan commit (`3657560`) are local on `feat/SHOP-40-storefront`.

Next is `/reviewer`. I haven't started it.

### Reviewer

**You:**

```text
/reviewer
```

**Agent:**

All three sections of SHOP-40 pass review. No defects, no failing gate, and all 12 requirements are met. The DOM code in `public/app.js` was not run in a browser; it is checked by reading only.

**Verdict per section**

| Section | Commit | Reviewable lines | Verdict |
|---|---|---|---|
| S1 · Serve the page | `7b2172d` | 43 | PASS |
| S2 · Page logic | `06da872` | 97 | PASS |
| S3 · Page wiring | `c043ebf` | 243 | PASS |

All three are under the 300-line limit.

**Gates**
- `npm test` passes all 34 tests.
- `aidt check` passes: 12 of 12 requirements have a test, and sections are within the size limit.
- `aidt clean --check` finds no guide comments.
- `aidt structure audit` reports 2 findings, in `src/utils.ts` and `src/types.ts`. This change does not touch either file, and the structure migration is already scheduled after SHOP-40.

**Quality ratings**
- Maintainability is 🟡 in S2: `formatCents` is copied into the page code. The plan accepted this, and a parity test catches any drift.
- Tests is 🟡 in S3: the DOM code has no automated test, as the plan decided. It needs a by-hand check against the spec's acceptance table or the demo.
- One optional suggestion: `localStorage` can throw in browsers that block storage, so the page would show an error instead of the products it already loaded (`public/app.js:11`). The plan lists storage being available as an assumption.

I rewrote the section entries in `state.json` to `reviewed` with a `PASS` verdict. I did not touch the phase or run `aidt stack prepare`.

**Decision for you:** do you want me to prepare the delivery, which means one branch and one draft PR per section with its guide as the description? Publishing and merging would each need a separate yes from you.

Files are in `/home/user/ai-dev-toolkit-examples/.aidt/tasks/feat-SHOP-40-storefront/`:
- `review/index.md`
- `review/s01-serve-the-page.md`
- `review/s02-page-logic.md`
- `review/s03-page-wiring.md`
- `state.json`

The delivery was not prepared: the branch stays in this repository as the example.
