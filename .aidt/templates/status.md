<!--
  Template: .aidt/status.md · rewritten when a block closes · read first by every session.
  Rules for the agent:
  - A snapshot of now, never a log: rewrite it, do not append. Each closed block's story goes to
    its `.aidt/tasks/<task-id>/summary.md`.
  - Within `context.budget.start` (default 2 500 tokens): `aidt context check` fails otherwise.
  - Paths in «Read first» go before the «: why», in backticks from the repository root (or as
    links relative to this file); every one must exist.
  - Plans for later blocks live in their own files, linked from «Next».
  Delete these comments when filling the template.
-->
# Status

_Updated: {{date}} · `{{commit}}` on `{{branch}}`_

## Now

<!-- What is in progress and on which branch, or «Nothing in progress». Up to five lines. -->

## Next

<!-- The next block: its goal in one or two lines, and where its plan is if it has one. -->

1. <!-- First step -->
2. <!-- Second step -->

### Read first

<!-- Only what the next session needs before its first step, one path per line with why. -->
- `{{path}}`: {{why}}

### Not needed

<!-- What looks relevant to this block but is not, so the next session does not read it. -->
- `{{path}}`: {{why not}}

## Open decisions

<!-- For the user, one line each: the question and the options, the recommended one first. Or «None». -->

## Recent

<!-- The last three closed blocks, newest first, one line each. Older ones: the index. -->
- {{date}} · {{block}} · `.aidt/tasks/{{task-id}}/summary.md`

All blocks: `.aidt/tasks/README.md`.
