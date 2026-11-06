# Examples

Real runs of every [AI Dev Toolkit](https://github.com/Akiles94/ai-dev-toolkit) agent on this
repository, kept in full: what was asked, every answer of the agent as it gave it, the files it
wrote, and what it cost. Nothing was edited, except local paths.

| Example | Agent | Input | What it produced | Cost |
|---|---|---|---|---|
| [reviewer](reviewer/) | `reviewer` | [PR #1](https://github.com/Akiles94/ai-dev-toolkit-examples/pull/1), 65 lines, ticket SHOP-12 | FAIL with the three planted bugs, each with a failing case and a fix | $0.27 |
| [walkthrough](walkthrough/) | `walkthrough` | [PR #2](https://github.com/Akiles94/ai-dev-toolkit-examples/pull/2), 893 lines, ticket SHOP-31 | 5 sections explained in the code, 9 review comments to paste | $1.11 |
| [refiner](refiner/) | `refiner` | A one-line ticket, SHOP-24 | A spec with 10 requirements and 13 acceptance criteria | $0.25 |
| [structure](structure/) | `aidt structure audit`, `architect` | This repository's `main` | Three paths, a decision file and a five-step migration | $0.15 |
| [workflow](workflow/) | `refiner` → `planner` → `builder` → `reviewer` | The SHOP-24 spec | Two reviewed, stacked PRs: [#3](https://github.com/Akiles94/ai-dev-toolkit-examples/pull/3), [#4](https://github.com/Akiles94/ai-dev-toolkit-examples/pull/4) | $1.43 |

All runs: Claude Code, model `claude-sonnet-5-5` (tier `balanced`), 2026-11-06. Costs are at API
list prices; with a Claude subscription they count toward usage limits instead.

The review guides and transcripts mention commit ids from the original runs; the branches were
rebased onto this `main` when published.

## Run them yourself

```bash
git clone https://github.com/Akiles94/ai-dev-toolkit-examples && cd ai-dev-toolkit-examples
git checkout feat/discount-codes
# Claude Code: /reviewer <ticket SHOP-12 from examples/reviewer/ticket.md>
# Copilot: pick "reviewer" in the chat and paste the same ticket
```

The agents are already installed in `.aidt/`, `.github/agents/` and `.claude/skills/`.
