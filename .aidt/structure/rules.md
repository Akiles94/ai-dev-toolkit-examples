<!--
  Structure rules: they apply at every level and in every stack, with or without an architecture.
  `aidt structure audit` checks the ones marked (audit); the reviewer checks the rest.
  Thresholds live in .aidt/config.json ("structure"). Edit freely; record deliberate exceptions in
  .aidt/structure.md so they stop being reported.
-->
# Structure rules

**Rule of thumb: whoever opens a folder or a file for the first time knows what it holds by its
name, and finds what they look for without searching.**

## S1 · No junk drawers (audit)

A folder or file named after nothing (`utils`, `helpers`, `misc`, `general`, `stuff`,
`functions`) collects whatever had no home, and grows forever.

- A helper lives **next to its only user**.
- When two features need it, it moves to `shared/<what-it-is>/`, named by what it does:
  `shared/money/format-money.ts`, not `utils/format.ts`.
- `shared` (or `common`, `lib`, `core`) is allowed only if every file in it belongs to a subfolder
  that names one subject.

## S2 · One module per resource (audit)

Never one file for everything of a kind: no single `api.ts` with every endpoint, `types.ts` with
every type, `constants.ts`, `store.ts` or `services.ts` for the whole app.

- API calls are grouped by resource or feature: `orders/orders.api.ts`, `users/users.api.ts`.
- Types, constants and state live with the feature they describe.
- A file that the whole app imports is a smell; a file that only its feature imports is the goal.

## S3 · Small files and folders (audit)

- A file over **300 lines** (default) is split by responsibility, not by line count.
- A folder with more than **15 files** (default) directly inside is grouped into subfolders that
  name a kind (`components/`, `hooks/`) or a subject (`checkout/`, `invoices/`).

## S4 · No loose files (audit)

- The source root holds only the entry point(s) and folders.
- Inside a feature or layer, files sit in a subfolder that names their kind once there are more than
  a handful; a file alone among folders is either an entry point or misplaced.

## S5 · One naming convention per kind of file (audit)

- Each kind of file (component, hook, module, test…) uses one casing everywhere, the one the stack's
  preset recommends (`kebab-case.ts`, `PascalCase.tsx`, `snake_case.go`…).
- The name says what the file is: a noun for things (`order.ts`), a role suffix where the stack uses
  one (`orders.api.ts`, `OrderService.cs`, `order_handler.go`).
- English for code names, the domain's words for the business (`invoice`, not `doc2`).

## S6 · Features do not reach into each other

- A feature uses another only through its public entry (`index.ts`, an exported package, an
  interface), never by importing its internals.
- `shared` never imports a feature.
- Boundaries are checked by a tool where the stack has one (see the preset): `dependency-cruiser`,
  `eslint-plugin-boundaries`, Go `internal/`, .NET project references, ArchUnit, Konsist.

## S7 · Tests where the stack expects them

Next to the file they test, or in the mirrored tree the stack expects (`src/test/java/…`,
`Tests/` projects, `*_test.go` beside the code). Never in a single `tests/` folder for the whole app
unless the stack requires it.

## Review checklist

- [ ] No new `utils` / `helpers` / `common` file or folder; shared code named by what it does.
- [ ] New API calls, types and state live with their feature, not in a global file.
- [ ] No file over the size limit and no folder over the file limit without a recorded exception.
- [ ] No loose files at the source root or among folders.
- [ ] File names follow the preset's casing and say what the file is.
- [ ] No feature imports another feature's internals; `shared` imports no feature.
- [ ] Tests sit where the stack expects them.
