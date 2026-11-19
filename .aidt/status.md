# Status

_Updated: 19/11/2026 · `b5930fa` on `fix/SHOP-41-storefront-qa-findings`_

## Now

Nothing in progress. SHOP-41 (the fixes of the storefront's QA) is built and reviewed: PASS on
its four sections. The QA's third pass gave PASS: QA-01, QA-02, QA-03 and QA-05 fixed; QA-04
accepted until accounts exist (in `.aidt/app.md`). Reports: `.aidt/tasks/feat-SHOP-40-storefront/qa/`
and `.aidt/tasks/fix-SHOP-41-storefront-qa-findings/qa/`. PRs #3 and #4 (SHOP-24) are still open
as drafts.

## Next

Structure migration (conventional level, Node preset), scheduled after SHOP-40. Types next to their
module, `utils.ts` split by subject, each move in its own commit, logic never mixed with moves.
Plan: the migration steps in `.aidt/tasks/structure-decision/summary.md`. Needs a branch name and a
control level from the user before it starts.

1. Run `aidt structure audit` to see the two findings (`src/utils.ts`, `src/types.ts`) as they are now.
2. Plan the moves, one commit each, with `npm test` green after every one.

### Read first

- `.aidt/tasks/structure-decision/summary.md`: the decision and the migration steps
- `src/utils.ts`: money and ids, to split by subject
- `src/types.ts`: shared types, to move next to their module

### Not needed

- `.aidt/tasks/feat-SHOP-40-storefront/`: closed block's record, only if a task asks for history
- `public/`: the page does not use `src/utils.ts`, it has its own `formatCents` copy and a parity test
- `examples/`: kept agent runs

## Open decisions

- PRs #3 and #4: keep as the workflow's example (recommended), or merge into `main`?
- SHOP-40 and SHOP-41: open PRs, or keep them as the examples (recommended)?
- Structure migration: start now (recommended), or later?

## Recent

- 19/11 · SHOP-41 and the storefront's QA, PASS · `examples/qa/README.md`
- 18/11 · SHOP-40 · `.aidt/tasks/feat-SHOP-40-storefront/summary.md`
- 07/11 · SHOP-24 · `.aidt/tasks/feat-SHOP-24-low-stock-alerts/summary.md`
- 06/11 · Structure audit and decision · `.aidt/tasks/structure-decision/summary.md`

All blocks: `.aidt/tasks/README.md`.
