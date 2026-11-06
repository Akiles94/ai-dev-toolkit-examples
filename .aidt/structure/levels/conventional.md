<!--
  Structure level 1 of 3: the stack's own conventions. No architecture, but a clear, minimal
  organisation. The layout and names come from the stack's preset in ../presets/; the common rules
  in ../rules.md apply on top. Edit freely.
-->
# Level 1 · Conventional

**Choose it when** the framework already dictates most of the layout (Next.js, Android, ASP.NET),
the project is small or medium, or the team does not want an architecture. It is the minimum: no
layers, but nothing loose and nothing in a junk drawer.

## What it means

1. **The stack's layout, as its official guide describes it.** The preset says which folders exist
   and what goes in each (`app/` routes in Next.js, `cmd/` and `internal/` in Go, `Controllers/`
   in ASP.NET…). Nothing invented on top.
2. **The stack's names.** The preset's naming table: casing per kind of file, role suffixes the
   ecosystem uses (`*Controller`, `use*`, `*_test.go`).
3. **The common rules** (`../rules.md`): no junk drawers, one module per resource, small files, no
   loose files, one naming convention, tests where the stack expects them.
4. **Grouping by kind is fine here** (`components/`, `services/`) while each folder stays small. When
   a kind folder passes the folder limit, group it by feature inside (`components/checkout/`) or
   move to level 2.

## When to move up

- The same feature is spread over five kind folders and every change touches all of them → level 2.
- Business rules leak into controllers, components or handlers and are tested only end to end →
  level 3.

## Review checklist

- [ ] New files are where the preset's layout puts them.
- [ ] Names follow the preset's naming table.
- [ ] Kind folders stay under the folder limit, grouped by feature inside when they grow.
- [ ] The common rules' checklist (`../rules.md`) passes.
