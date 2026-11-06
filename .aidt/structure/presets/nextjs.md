<!-- Preset: Next.js (App Router). Layout and names per level. Edit freely. -->
# Preset · Next.js (App Router)

Sources:
- Project structure and organization: https://nextjs.org/docs/app/getting-started/project-structure
  (top-level `app`, `public`, optional `src`; private folders `_folder`; route groups `(group)`;
  three strategies: files outside `app`, top-level folders inside `app`, split by feature or route)

Next.js is unopinionated beyond routing files. Its docs use `components` and `lib` as placeholders;
the common rules (`../rules.md`) replace a catch-all `lib/` or `utils/` with subject folders.

## Level 1 · Conventional

"Files outside `app`": `app/` holds routing only.

```
src/
  app/                    layout.tsx, page.tsx, loading.tsx, error.tsx, route.ts per segment
    (shop)/cart/page.tsx  route groups organise without changing the URL
  components/             reusable UI, grouped by subject once it grows
  server/                 server-only code: one file per resource (orders.queries.ts, orders.actions.ts)
  hooks/
public/
```

## Level 2 · Modular

"Split by feature": route files stay thin and import from the feature.

```
src/
  app/
    orders/page.tsx       renders <OrdersScreen />, reads params
  features/
    orders/               components/, orders.actions.ts, orders.queries.ts, order.types.ts, index.ts
    invoices/
  shared/
    ui/  db/  auth/       one subject per folder
```

Colocating a private folder inside a route (`app/orders/_components/`) is fine for code only that
route uses.

## Level 3 · Architecture

Per feature: `domain/`, `application/` (use cases, ports), `infra/` (database, external APIs), `ui/`.
Server actions and route handlers are adapters: they parse input, call one use case and map the result.
Nothing in `domain` or `application` imports Next.js or React.

## Naming

| Kind | File | Name |
|---|---|---|
| Routing file | `page.tsx`, `layout.tsx`, `route.ts` | framework names, untouched |
| Component | `order-card.tsx` | `OrderCard` |
| Server action | `orders.actions.ts` | `createOrder` |
| Data read | `orders.queries.ts` | `getOrders` |
| Hook | `use-orders.ts` | `useOrders` |
| Test | next to the file | |

## Boundaries

`eslint-plugin-boundaries` or `dependency-cruiser`; mark server-only modules with `import "server-only"`.
