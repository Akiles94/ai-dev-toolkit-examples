# shop-api: working agreement

A small shop API (products, carts, shipping) in TypeScript with no dependencies. It is the
demo repository of the AI Dev Toolkit: every agent is run here and its output kept in
`examples/`.

## Start of every session

1. Read `.aidt/status.md`: where the work stands, the next block and its first steps.
2. Then only what the status's «Read first» list names, and what the task needs.
3. When a block closes, follow `.aidt/practices/session-context.md`.

## Commands

- test: `npm test` (Node 22.18+ runs the TypeScript directly, `node:test`)
- start: `npm start` → http://localhost:3000/products
- context: `aidt context check` (what every session reads, against its budget)

## How we work

- Tickets are `SHOP-<n>`. Each block runs in its own session on its own branch, with the AI Dev
  Toolkit workflow: `/refiner` → `/planner` → `/builder` → `/reviewer`, control `strict`.
- Sections of at most 300 reviewable lines; one commit per section; stacked PRs.
- Nothing is pushed or merged without an explicit yes.
- Every example run is kept in full in `examples/<agent>/README.md`, with its cost.

## Code

- `src/server.ts` routes JSON over `node:http`; `src/cart.ts`, `src/products.ts` hold the
  in-memory state; `src/types.ts` the shared types; `src/utils.ts` money and ids.
- Money is integer cents (`priceCents`), formatted only at the edge (`formatCents`).
- Errors are status codes with a JSON `{ "error": "CODE" }`.
- Tests next to the behaviour they name, in `tests/*.test.ts`.
- Structure: `examples/structure/structure.md` (conventional level, Node preset, migration pending).

## Flows

- Browse products: `GET /products?category=books|games|music` → list, 400 `UNKNOWN_CATEGORY`.
- Cart: `POST /carts` → `POST /carts/:id/items` (409 `OUT_OF_STOCK`) → `GET /carts/:id` with
  subtotal, shipping (free from $50) and total → `DELETE /carts/:id/items/:productId`.
