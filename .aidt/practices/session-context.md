<!--
  Practices: session context · what every new session reads, and how a block closes.
  Every session follows it; the project's rules file (AGENTS.md or CLAUDE.md) points to it in one
  line. Budgets and files: `context` in `.aidt/config.json`. Edit this file to fit your project.
-->
# Session context

Every new session knows only what is in the repository, so it starts by reading. Left alone, that
reading only grows: rules files and status documents get appended to after every block, and a
session pays for all of it before its first useful step. Keep it in layers, with limits a script
checks.

| Layer | What | When it is read | Budget |
|---|---|---|---|
| Always | The rules files the tool loads by itself (`AGENTS.md`, `CLAUDE.md` and its `@` imports, `.github/copilot-instructions.md`) | automatically | `context.budget.always` (3 000 tokens) |
| Start | The status (`.aidt/status.md`): where the work stands and what this session does first | first, every session | `context.budget.start` (2 500 tokens) |
| Task | The plan; the flows and invariants of the files being touched (`erctx context <file>` when the project has it) | while working | — |
| On demand | History, audits, deferred work, strategy documents | only when the task needs them | — |

`aidt context check` measures the first two and the status's «Read first» list. Tokens are
estimated as characters / 4.

## Starting a session

1. The always layer is already loaded. Read the status, then its **Read first** list. Nothing
   else until the task needs it.
2. Before editing a file, read what covers it (`erctx context <file>` when available), not whole
   folders of documentation.
3. A long read (history, an audit, a big document) goes through a subagent when the tool has them:
   it reads, and returns only the conclusions this session needs.

## Closing a block

The session that closes a block knows what the next one needs, so it writes it down. A block is
any piece of work that ends with a merge or a handoff: a workflow task, a fix, a phase of a plan.

1. **The block's record:** `.aidt/tasks/<task-id>/summary.md`, from `.aidt/templates/summary.md`.
   For a workflow task, mostly links: its spec, plan and review index already are the record.
2. **Its row** in `.aidt/tasks/README.md` (from `.aidt/templates/tasks-index.md` the first time).
3. **The status, rewritten** from `.aidt/templates/status.md`: *Now*, *Next* with its **Read
   first** and **Not needed** lists, *Open decisions*, *Recent* (the last three blocks, one line
   each). Never append the block's story to it: that is what step 1 is for.
4. `aidt context check` green, then commit the three with the block.

## Keeping each layer small

- **Status:** a snapshot, not a log. Plans for later blocks go in their own files, linked from
  *Next*; decisions go in the record of the block that took them.
- **Rules files:** what the project is, its commands, how to work, and indexes of one short line
  per entry. The detail lives in the file each line points to.
- **Rules for one folder** go in that folder's scoped rules, loaded only when working there: a
  `CLAUDE.md` inside the folder for Claude Code, `.github/instructions/<name>.instructions.md`
  with `applyTo` for Copilot.
- **Over budget:** the check names the heaviest sections of each file. Move them to the layer
  where they belong, leaving one line and a link; raise a budget only when the project really
  needs that much on every session, and say why in the commit.
