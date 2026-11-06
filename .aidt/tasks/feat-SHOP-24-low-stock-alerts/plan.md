# Plan · SHOP-24 Low-stock alerts

> Spec: [spec.md](spec.md) · Branch: `feat/SHOP-24-low-stock-alerts` · Status: approved

## Approach

`reserveStock` is the only place stock decreases, so it is the hook. After a successful decrease it
compares stock before and after: when `before >= THRESHOLD && after < THRESHOLD` it records an alert.
This is stateless: "once per drop" (R3, R4) and "re-armed after restock" (R5) follow from the
comparison, with no "alerted" flag. The low-stock list is a pure query over `listProducts()`. Two
read-only admin endpoints expose the list and the alerts.

**Discarded:**
- Per-product "alerted" flag cleared on restock: more state, and no restock operation exists to clear it.
- Putting alerts and the list inside `products.ts`: mixes catalog with alerting; separate modules keep each cohesive.
- Alert stores only `productId` and resolves the name on read: couples `alerts.ts` to `products.ts` and the name could change.
- Sort alerts by timestamp: equal ISO timestamps make "most recent first" non-deterministic; insertion order does not.

## Structure

Follows the project's existing flat `src/` layout (one module per concern, `.ts` imports, in-memory state).

| Path | Responsibility | New / changed |
|---|---|---|
| `src/types.ts` | `LowStockAlert`, `LowStockEntry` types | changed |
| `src/alerts.ts` | `LOW_STOCK_THRESHOLD` (5), in-memory alert log, `recordLowStockAlert`, `listAlerts` (newest first), `resetAlerts` (test helper) | new |
| `src/products.ts` | `reserveStock` records an alert on a threshold crossing | changed |
| `src/low-stock.ts` | `lowStockProducts()`: pure query, filter `stock < threshold`, sort by stock then name, add `outOfStock` | new |
| `src/server.ts` | `GET /admin/low-stock`, `GET /admin/alerts` | changed |
| `tests/alerts.test.ts` | alert log behavior | new |
| `tests/low-stock.test.ts` | list rules and ordering | new |
| `tests/products.test.ts` | alert-on-drop scenarios through `reserveStock` | changed |
| `tests/admin.test.ts` | HTTP-level test of both endpoints via exported `server` | new |

Types: `LowStockAlert { productId, productName, stock, at }`; `LowStockEntry { id, name, stock, threshold, outOfStock }`.
No branded id types: the project uses plain string ids everywhere and only one id kind is added.

## Reuse

- `reserveStock`, `findProduct`, `listProducts` (`src/products.ts`): reused as the hook and the data source; no new stock operation.
- `now()` (`src/utils.ts`) for alert timestamps; `send()` and the routing style in `src/server.ts`.
- Nothing already does alerting or low-stock listing (searched `src/`).

## Decisions

- Drop detection inside `reserveStock`, stateless (before/after comparison).
- New modules `src/alerts.ts` (threshold, log) and `src/low-stock.ts` (list).
- Alert stores `productId`, `productName` snapshot, `stock`, `at` (ISO from `now()`).
- `GET /admin/low-stock` → `{ threshold, products: [{ id, name, stock, threshold, outOfStock }] }`; `GET /admin/alerts` → array. Both 200, empty list when nothing to show, no auth.
- Alert order is insertion order reversed.
- Tests: `node:test`; unit tests for domain plus one HTTP test; `resetAlerts()` helper, and tests restore any stock they change.
- Sections merged into two (domain, endpoints), as the user asked.

## Sections

| # | Name | Intent | Main files | Est. lines | Covers |
|---|---|---|---|---|---|
| S1 | Low-stock domain | Alert log, drop detection in `reserveStock`, low-stock list | `src/alerts.ts`, `src/low-stock.ts`, `src/products.ts`, `src/types.ts` | ~70 | R1–R6, R8–R10 (domain) |
| S2 | Admin endpoints | Expose the list and the alerts over HTTP | `src/server.ts` | ~25 | R7, R9 (HTTP), R1/R2/R8 shape |

### S1 · Low-stock domain

- **Goal:** the domain knows what is low stock, records one alert per drop below the threshold, and lists both, with no HTTP yet.
- **Depends on:** —
- **Done when:** the domain tests pass (written first: list rules, ordering, alert on crossing, no repeat, re-arm, failed decrease), `npm test` is green and existing cart/product tests still pass.

### S2 · Admin endpoints

- **Goal:** the owner can read the low-stock list and the alerts through `GET /admin/low-stock` and `GET /admin/alerts`.
- **Depends on:** S1
- **Done when:** the HTTP test shows both endpoints return the documented shape (including empty lists and out-of-stock entries) and `npm test` is green.

## Tests

| Req | Test (file › name) | Level | Section |
|---|---|---|---|
| R1 | `low-stock.test.ts` › lists only products strictly below 5 (4 listed; 5, 12, 30 not) | unit | S1 |
| R2 | `low-stock.test.ts` › a product with stock 0 is listed and marked out of stock | unit | S1 |
| R3 | `products.test.ts` › taking 6 to 4 records one alert; taking 30 to 4 in one decrease records one alert | unit | S1 |
| R4 | `products.test.ts` › further decreases while low, including reaching 0, record no new alert | unit | S1 |
| R5 | `products.test.ts` › after restock to 10 (and to exactly 5) a new drop records a second alert | unit | S1 |
| R6 | `products.test.ts` › not enough stock or unknown product changes nothing and records no alert | unit | S1 |
| R7 | `admin.test.ts` › GET /admin/low-stock without credentials returns name, stock, threshold, outOfStock | integration | S2 |
| R8 | `low-stock.test.ts` › orders by lowest stock, ties by name (0, Alpha 3, Zeta 3) | unit | S1 |
| R8 | `admin.test.ts` › the endpoint keeps that order | integration | S2 |
| R9 | `alerts.test.ts` › most recent alert first, each with product, stock then, time; empty log gives empty list | unit | S1 |
| R9 | `admin.test.ts` › GET /admin/alerts returns them newest first, and `[]` when none | integration | S2 |
| R10 | `low-stock.test.ts` › a restocked product no longer appears | unit | S1 |

## Assumptions

- Product names are unique enough for the stable by-name tie-break (they are in the catalog).
- The restock in R5/R10 tests is done by setting `stock` on the object from `findProduct()`, since no restock operation exists (out of scope).
- Starting products already below 5 ("Refactoring" 4, "Kind of Blue (vinyl)" 0) get no alert at startup, which falls out of the design (alerts only fire in `reserveStock`).
- A single-process, in-memory server: alerts are lost on restart, like carts and the catalog.

## Risks

- **Shared module state in tests:** the catalog and alert log persist across tests in the same file. Each test must call `resetAlerts()` and restore any stock it changes, or tests will depend on order. Test files run in separate processes under `node --test`, so cross-file leakage is not expected.
- **Hook coupling:** `products.ts` now imports `alerts.ts`; `alerts.ts` must not import `products.ts` (no cycle). The name snapshot in the alert exists for this reason.
- **Mutation order in `reserveStock`:** the alert must be recorded only after the decrease succeeds, and with the post-decrease stock (R6).
- **Open admin routes:** `/admin/*` has no access control by decision (spec out of scope). Do not rely on the `/admin` prefix for protection; the follow-up auth ticket must cover these routes.
- **`qty` of 0 or negative** passed straight to `reserveStock` is not validated there today; the plan does not change that, and no alert fires since stock does not drop.
