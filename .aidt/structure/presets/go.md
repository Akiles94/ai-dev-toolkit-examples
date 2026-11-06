<!-- Preset: Go module (service or CLI). Edit freely. -->
# Preset · Go

Sources:
- Organizing a Go module: https://go.dev/doc/modules/layout (`cmd/<name>/` per command, `internal/`
  for code other modules must not import, server projects keep their logic in `internal/`)
- Effective Go, package names: https://go.dev/doc/effective_go#package-names (short, lower case,
  single word; no `util`, `common`)

## Level 1 · Conventional

```
go.mod
cmd/
  api/main.go          one folder per binary; main only wires and starts
internal/
  orders/              a package per subject: orders.go, store.go, orders_test.go
  invoices/
  platform/            infrastructure shared by packages, one subpackage each: postgres/, httpx/
```

Packages are named by what they provide (`orders`, `postgres`), never `util`, `helpers`, `models`,
`common`; Effective Go asks for the same.

## Level 2 · Modular

The same tree with each package owning one business area end to end: its HTTP handlers, logic and
storage inside `internal/<area>/`. Other packages use its exported API only; unexported identifiers
are the private part.

```
internal/
  orders/              handler.go, service.go, store.go, order.go, *_test.go
  invoices/
```

## Level 3 · Architecture

Per bounded context: `internal/<context>/domain` (types and rules, standard library only),
`internal/<context>/app` (use cases and port interfaces, declared where they are used),
`internal/<context>/adapters` (`postgres`, `stripe`, `http`). `cmd/` wires the adapters into the use
cases.

## Naming

| Kind | File | Name |
|---|---|---|
| Package | `internal/orders/` | `orders` (short, lower case, no underscores) |
| Source file | `order_store.go` | `snake_case.go` |
| Type | `order.go` | `Order`, `Store` (not `OrderStore` inside package `orders`) |
| Interface | where it is used | `Repository`, `Notifier` (`-er` for single methods) |
| Test | `order_store_test.go` beside the code | |

## Boundaries

`internal/` is enforced by the compiler. For rules between packages, `depguard` (golangci-lint) or
`go-arch-lint`.
