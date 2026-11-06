# Project structure

| | |
|---|---|
| Level | modular |
| Preset | .aidt/structure/presets/node.md (level 2) |
| Origin | existing, migrating to modular |

## Layout

```
src/
  server.ts              starts the HTTP server
  app.ts                 builds the router from each module's public entry
  modules/
    products/            products.service.ts, products.types.ts, products.routes.ts, products.test.ts, index.ts
    cart/                cart.service.ts, cart.types.ts, cart.routes.ts, cart.test.ts, index.ts
    (orders/, payments/, users/ arrive here, same shape)
  shared/
    ids/                 new-id.ts
    money/               format-cents.ts
    http/                read-json.ts, send.ts, validate-positive-int.ts
```

## Naming

The preset's table applies: `kebab-case` files with role suffixes (`.service.ts`, `.routes.ts`,
`.types.ts`, `.test.ts`). Tests sit next to the file or module they test. Routes use plural
resources and `kebab-case` paths. No differences from the preset.

## Boundaries

- A module is imported by others only through its `index.ts`, never its internals.
- `shared` imports no module.
- Check with `dependency-cruiser` (`npx depcruise src`). It is not installed yet; migration step 5 adds it.

## Exceptions

None. Until the migration reaches them, `src/utils.ts`, `src/types.ts`, `src/cart.ts`,
`src/products.ts` and `tests/` are known problems, not exceptions.

## Migration

New code (orders, payments, users) follows the target from day one. Each step is one workflow task;
moves and renames stay separate from logic changes.

1. [ ] Create `shared/ids`, `shared/money` and `shared/http`, move the helpers out of `utils.ts`
   into them, and delete `utils.ts`. (Fixes S1.)
2. [ ] Split `types.ts` into `modules/products` and `modules/cart`, move `products.ts` and `cart.ts`
   into their modules as `*.service.ts`, and add an `index.ts` to each. (Fixes S2.)
3. [ ] Move the tests from `tests/` next to their modules. (Fixes S7.)
4. [ ] Extract the routing from `server.ts` into `app.ts`, with each module's routes in
   `<module>.routes.ts`.
5. [ ] Add `dependency-cruiser` and the boundary rule, and run it in the test flow.
