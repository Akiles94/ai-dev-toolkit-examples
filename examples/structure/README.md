# Structure: a shop API that will grow

`aidt structure audit` and the [architect](https://github.com/Akiles94/ai-dev-toolkit/blob/main/docs/structure.md)
on this repository's `main` (the app before any example branch).

- [structure.md](structure.md): the decision it wrote to `.aidt/structure.md`.

## The audit (a script, no AI)

```text
$ npx @akiles94/ai-dev-toolkit structure audit
Structure: 2 finding(s) in 5 source files
S1 · No junk drawers (1)
    src/utils.ts  junk-drawer file
S2 · One module per resource (1)
    src/types.ts  one file for the whole app: split it by feature

Rules: .aidt/structure/rules.md · deliberate exceptions go under "## Exceptions" in .aidt/structure.md
```

## Cost of the architect

| Step | Model | Turns | Agent time | Tokens in (cached) | Tokens out | Cost at API prices |
|---|---|---|---|---|---|---|
| Proposal and decision | `claude-sonnet-5-5` | 2 | 34 s | 266k (244k) | 3k | $0.15 |

Measured with Claude Code on 2026-11-06. Most input tokens are cache reads, which cost a tenth of fresh input. With a Claude subscription the runs count toward usage limits instead.

## The conversation

### Call

**You:**

```text
/architect Organise this project's code. It will grow: orders, payments and users are coming next.
```

**Agent:**

The project is small (5 source files, 241 lines), so I haven't written `.aidt/structure.md` yet. I need you to pick a path first.

## What exists today

- **Structure:** a flat `src/` where each file is a feature: `cart.ts`, `products.ts`, `server.ts`.
- **Tests:** they sit in a single `tests/` folder.
- **Problems:** the audit found two.
  - **S1:** `utils.ts` is a junk drawer. It mixes ID and date helpers, money formatting, input validation and request-body parsing.
  - **S2:** `types.ts` holds the types for the whole app, for both products and cart.
- **Other problems:**
  - **Routing:** `server.ts` holds all the routing by hand, so every new resource would land there.
  - **Tests:** the single `tests/` folder breaks S7.
  - **Missing:** there is no boundary check yet.
- **Sizes:** no file is near the 300-line limit.

## Three paths

| Path | What changes | Size |
|---|---|---|
| **A. Keep it, improved** | Split `utils.ts` and `types.ts`, and move the tests next to their code. Everything else stays flat. | About 6 files |
| **B. Conventional** (Node preset, level 1) | Folders by kind: `routes/`, `controllers/`, `services/`, `db/`. | About 10 files |
| **C. Modular** (Node preset, level 2) | `src/modules/<feature>/` plus `shared/`. | About 8 files |

## Recommendation: C, Modular

You said orders, payments and users are coming. Each of them would otherwise add another top-level file, plus more entries in `types.ts` and `server.ts`. Modular gives each one its own folder from day one. The migration is small because the code is small, and the Node preset's level 2 fits.

```
src/
  server.ts              starts the HTTP server
  app.ts                 builds the router from each module's public entry
  modules/
    products/            products.service.ts, products.types.ts, products.test.ts, index.ts
    cart/                cart.service.ts, cart.types.ts, cart.test.ts, index.ts
    (orders/ payments/ users/ arrive here)
  shared/
    ids/                 new-id.ts
    money/               format-cents.ts
    http/                read-json.ts, send.ts, validate-positive-int.ts
```

- **Names:** files are `kebab-case` with role suffixes, as in the Node preset.
- **Boundaries:** modules import each other only through `index.ts`, and `shared` imports no module. `dependency-cruiser` would check this, but it isn't installed yet. Adding it would be its own task.
- **Exceptions:** none.

## Migration plan

Each step is one workflow task. Moves come before logic changes.

1. Create `shared/` and move the helpers out of `utils.ts` into named subfolders. Delete `utils.ts`.
2. Split `types.ts` into `products` and `cart` modules and move the files into `modules/`. Add an `index.ts` to each module.
3. Move the tests next to their modules.
4. Extract routing from `server.ts` into `app.ts`, with the routes for each module in `<module>.routes.ts`.
5. Add `dependency-cruiser` and the boundary rule.

Orders, payments and users follow the target from the start.

Do you approve **C**? I can also switch to A (smaller) or B. Once you approve, I'll write `.aidt/structure.md`. I'll then offer step 1 as a one-paragraph task for the refiner, but I won't start it myself.

### Decision

**You:**

```text
Yes, C.
```

**Agent:**

I wrote the decision to `.aidt/structure.md`: modular level, Node preset level 2, existing project migrating. I haven't committed it, and I didn't change any source code or run the audit again. It's worth committing so later tasks follow it.

**First task for the refiner (migration step 1):**

> Create `src/shared/ids/new-id.ts`, `src/shared/money/format-cents.ts` and `src/shared/http/{read-json,validate-positive-int}.ts` from the helpers in `src/utils.ts`. Update every import in `src/` and `tests/`, then delete `utils.ts`. Move code only, with no logic changes. `npm test` must pass and `aidt structure audit` must no longer report S1.

I haven't started it. Tell me if you want it handed to the refiner.
