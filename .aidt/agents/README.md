# Canonical agent format

Agents are defined once here and rendered to each AI tool by `aidt sync` (Copilot, Claude Code…).
Edit these files to customize an agent; never edit the generated per-tool files.

```markdown
---
name: refiner                       # lowercase, unique, used as the command name
description: One line. What it does and when to use it.
tier: balanced                      # efficient | balanced | max (model per tool: `models` in config.json)
context: shared                     # shared (default) | fresh: runs without the conversation
capabilities: [read, ask, write]    # what the agent may do (see below)
writes:                             # files it may create or change (globs); required with `write`
  - .aidt/tasks/*/spec.md
commands:                           # shell commands it may run (prefixes); required with `shell`
  - git branch
handoff: planner                    # next agent, offered after the user approves
---
Instructions in Markdown.
```

## Capabilities

| Capability | Allows | Enforced by |
|---|---|---|
| `read` | Read and search the repository | — |
| `ask` | Ask the user structured questions | — |
| `write` | Create or change only the files listed in `writes` | Tool permissions, hooks where supported |
| `edit` | Change source code | Tool permissions |
| `shell` | Run only the commands listed in `commands` | Tool permissions, hooks where supported |

Adapters map each capability to the closest permission of each tool. When a tool cannot enforce
a limit, the instructions still state it and the reviewer checks it afterwards.

## Shared conventions

- **Task folder:** `.aidt/tasks/<task-id>/`, where `<task-id>` is the branch name with `/` replaced
  by `-` (`feat/AUTH-87-rate-limit` → `feat-AUTH-87-rate-limit`).
- **Templates:** `.aidt/templates/`. Agents fill them; they never invent their own format.
- **Practices:** `.aidt/practices/` (by default, sustainable code and static analysis). The planner
  designs with them, the builder writes with them, the reviewer checks them. Project rules win.
- **Quality commands:** `quality.commands` in `.aidt/config.json`, or the project's single check
  script (e.g. `npm run verify`). Builder and reviewer run them; any failure blocks the section.
- **State:** `.aidt/tasks/<task-id>/state.json`, following `state.schema.json`. Every agent reads
  it first and updates it last.
- **Rule layers:** task decisions > project rules (`AGENTS.md`) > developer profile
  (`~/.aidt/profile.md`) > toolkit defaults. The profile never overrides the project; it can only
  propose.
- **Approval gates:** an agent never moves the task to the next phase on its own. It asks, and
  only an explicit "yes" from the user counts. The only gates that can be skipped are the ones
  the task's **control** level removes.
- **Control:** how much the user reviews along the way, chosen per task (`control` in
  `state.json`; default `workflow.control` in `.aidt/config.json`, else `strict`). The user can
  raise or lower it at any time.

  | Control | The user approves | The agents do on their own |
  |---|---|---|
  | `strict` | spec, plan, every section (with guide comments) | nothing |
  | `standard` | spec and plan | build every section in a row; review them all |
  | `fast` | the spec | plan, build and review; the user reviews the finished stack |

  At every level: sections stay within `limits.sectionLines`, quality commands and tests run,
  the reviewer gives its verdict, a FAIL is never delivered, and publishing and merging need an
  explicit yes. Under `standard` and `fast` an agent still **stops and asks** when the spec is
  ambiguous, when a check fails twice in a row, or before anything hard to undo (data migrations,
  deleting data, changing a public API).
- **Language:** artifacts and code in English; talk to the user in their language.
