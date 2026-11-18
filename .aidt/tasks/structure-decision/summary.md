# Structure · audit and decision · summary

> Branch: `main` · Merged: n/a, decision file on `main` since 06/11/2026 · Plan: five-step migration in `.aidt/structure.md`

## Done

- `aidt structure audit` on `main` (a script, no AI): 2 findings in 5 source files. `src/utils.ts`
  is a junk drawer (money, ids, JSON parsing) and `src/types.ts` one file for every type.
- The architect proposed three paths: keep it improved, the stack's conventional layout, or an
  architecture. Run kept in `examples/structure/`. $0.15, 34 s.

## Decisions

- **Keep it, improved**: conventional level, Node preset, written to `.aidt/structure.md`.
  Taken 06/11/2026. New code follows it from now on.
- Migration steps: types next to their module, `utils.ts` split by subject, moves in their own
  commits, logic never mixed with moves.

## Deviations from the plan

None.

## Left for later

- The migration itself: not started; to schedule after SHOP-40 (`.aidt/structure.md`).

## Verdicts

None: no reviewer run.
