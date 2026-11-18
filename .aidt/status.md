# Status

_Updated: 07/11/2026 · `055cc16` on `main`_

## Now

Nothing in progress. SHOP-24 is closed: PRs #3 and #4 (low-stock alerts) are open as drafts, the
reviewer's PASS on both.

## Next

SHOP-40 · A storefront page. The API is JSON only; a page at `/` lets a person use the shop in a
browser, and is the first change a demo video can show. Branch `feat/SHOP-40-storefront` from
`main`, full workflow, control `strict`.

Ticket: «At `/`, a page lists the products as cards (name, price, stock), with a category filter.
Under 5 in stock the card says "Only N left"; at 0 it says "Out of stock" and cannot be added.
"Add to cart" uses the existing cart endpoints, and a cart panel shows the items, subtotal,
shipping (free from $50) and total, with a way to remove an item.»

1. `/refiner` on the ticket, then `/planner`, `/builder`, `/reviewer`.
2. Then a demo with `/demo`, kept in `examples/demo/`.

### Read first

- `src/server.ts`: the routes the page will call
- `src/cart.ts`: totals and shipping
- `src/products.ts`: the catalogue and its stock

### Not needed

- `.aidt/tasks/`: closed blocks' records, only if a task asks for history
- `examples/`: kept agent runs
- `.aidt/structure.md`: the migration is scheduled after SHOP-40

## Open decisions

- PRs #3 and #4: keep as the workflow's example (recommended), or merge into `main`?
- Structure migration: after SHOP-40 (recommended), or earlier?

## Recent

- 07/11 · SHOP-24 · `.aidt/tasks/feat-SHOP-24-low-stock-alerts/summary.md`
- 06/11 · Structure audit and decision · `.aidt/tasks/structure-decision/summary.md`
- 06/11 · SHOP-31 · `.aidt/tasks/feat-checkout-orders/summary.md`

All blocks: `.aidt/tasks/README.md`.
