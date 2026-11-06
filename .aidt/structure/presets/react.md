<!-- Preset: React single-page app (Vite). Layout and names per level. Edit freely. -->
# Preset · React (Vite)

Sources:
- React docs, file structure: https://legacy.reactjs.org/docs/faq-structure.html ("group by features or
  routes" or "by file type"; avoid deep nesting; don't overthink it at the start)
- Vite project layout: https://vite.dev/guide/#index-html-and-project-root

React does not prescribe a layout. These are the toolkit's defaults, built on those guides and on the
common rules (`../rules.md`).

## Level 1 · Conventional

```
index.html
src/
  main.tsx            entry: mounts <App />
  app.tsx             providers, router
  pages/              one component per route: orders-page.tsx
  components/         reusable UI, grouped by subject once it passes 15 files (components/forms/)
  hooks/              reusable hooks: use-debounce.ts
  api/                one file per resource: orders.api.ts, users.api.ts (never one api.ts)
  styles/
```

## Level 2 · Modular

```
src/
  main.tsx
  app/                router, providers, layout
  features/
    orders/           components/, hooks/, orders.api.ts, order.types.ts, index.ts (public entry)
    invoices/
  shared/
    ui/               design-system components
    http/             the HTTP client (one), not the calls
    format/           one subject per folder: format-money.ts, format-date.ts
```

Features import each other only through `index.ts`.

## Level 3 · Architecture

Per feature (bounded context): `domain/` (types and rules, no React), `application/` (use cases and
ports), `infra/` (HTTP adapters: `orders-http-repository.ts`), `ui/` (components and hooks that call
use cases). React lives only in `ui/`; `domain` imports nothing from the other layers.

## Naming

| Kind | File | Name |
|---|---|---|
| Component | `order-card.tsx` | `OrderCard` |
| Page | `orders-page.tsx` | `OrdersPage` |
| Hook | `use-orders.ts` | `useOrders` |
| API calls | `orders.api.ts` | `fetchOrders`, `createOrder` |
| Types | `order.types.ts` | `Order` |
| Test | next to the file: `order-card.test.tsx` | |

`PascalCase.tsx` files (`OrderCard.tsx`) are equally valid: pick one casing for the whole project.

## Boundaries

`eslint-plugin-boundaries` or `dependency-cruiser`: `shared` imports no feature; features import
others only through their `index.ts`.
