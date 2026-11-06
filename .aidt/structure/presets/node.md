<!-- Preset: Node.js HTTP service (Express, Fastify, Hono) in TypeScript. Edit freely. -->
# Preset · Node.js service

Sources:
- Express FAQ, "How should I structure my application?": https://expressjs.com/en/starter/faq.html
  (no definitive answer: it is up to the application)
- Node.js Best Practices, project structure: https://github.com/goldbergyoni/nodebestpractices
  (structure by business components; keep the web layer inside its boundary)

## Level 1 · Conventional

```
src/
  server.ts            starts the app
  app.ts               creates it: middleware, routes
  routes/              one router per resource: orders.routes.ts
  controllers/         one per resource: orders.controller.ts (parse request, call service, reply)
  services/            business logic per resource: orders.service.ts
  db/                  connection, migrations, one repository per table: orders.repository.ts
  middleware/          one per concern: auth.middleware.ts
  config/              env parsing, validated once at start
```

Kind folders stay per resource: never one `routes.ts` or `services.ts` for the whole API.

## Level 2 · Modular

```
src/
  server.ts  app.ts
  modules/
    orders/            orders.routes.ts, orders.controller.ts, orders.service.ts,
                       orders.repository.ts, orders.schemas.ts, orders.test.ts, index.ts
    invoices/
  shared/
    http/  db/  auth/  config/   one subject per folder
```

A module exposes its router and service through `index.ts`; others never import its repository.

## Level 3 · Architecture

The toolkit's reference level (`../levels/architecture.md`): one bounded context per flow with
`domain/`, `application/` (use cases, ports), `infra/` (adapters), `http/` (routes, one DTO per
endpoint), and `delivery/` wiring everything. Express or Fastify appear only in `http/` and `delivery/`.

## Naming

| Kind | File | Name |
|---|---|---|
| Router | `orders.routes.ts` | `ordersRouter` |
| Controller / handler | `orders.controller.ts` | `createOrder` |
| Service | `orders.service.ts` | `OrdersService` or functions |
| Repository | `orders.repository.ts` | `OrdersRepository` |
| Request schema | `orders.schemas.ts` | `createOrderBody` |
| Test | next to the file: `orders.service.test.ts` | |

Files in `kebab-case`, roles as suffixes. Routes: plural resources, `kebab-case` paths.

## Boundaries

`dependency-cruiser` (or `eslint-plugin-boundaries`): modules import others only through `index.ts`;
`shared` imports no module.
