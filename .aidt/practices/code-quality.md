<!--
  Practices: code quality review · what the reviewer and the walkthrough rate on every change,
  beyond bugs. Both agents use this file, so they judge the same way.
  Project rules (AGENTS.md) win over this file. Edit it to fit your team: add, remove or reword
  dimensions; the agents rate whatever dimensions it lists.
-->
# Code quality review

Rate the **changed code only**, never code the change did not touch. Compare it with how the
project already does things: consistency with the codebase counts more than general taste.

## Dimensions

| Dimension | What to look at |
|---|---|
| Structure | Files and folders follow `.aidt/structure.md` and its rules, or the existing layout when there is none. New code sits in the module it belongs to; no junk drawers; no feature reaching into another's internals. |
| Practices | Project rules (AGENTS.md) and `.aidt/practices/sustainable-code.md`: names in domain language, least surprise, errors as values, minimal visibility, no "just in case" abstractions. The stack's own idioms and official guides. |
| Readability | A newcomer understands it without the author: clear names, one level of abstraction per block, early returns, no clever tricks, comments that say why. |
| Maintainability | Easy to change safely: small cohesive functions, low complexity, no duplication of existing code, low coupling, dependencies that can be swapped in tests, no magic values. |
| Performance | Work proportional to the input: no repeated work in loops, N+1 queries, unbounded growth, needless copies, or blocking calls on a hot path. Only where it can matter. |
| Security | Untrusted input validated at the boundary; nothing unescaped reaching a query, shell, path or HTML; authorization checked; no secrets in code or logs; safe defaults. |
| Tests | Behavior tested, including the failing and edge cases; names in business language; each test can fail; no mocks of third-party internals. |

## Rating

Per dimension, one of:

- ✅ **Good:** nothing worth changing.
- 🟡 **Improvable:** a concrete change would make it clearly better. Not blocking.
- 🔴 **Broken rule:** the change breaks a written rule (`.aidt/structure.md`, AGENTS.md, the
  practices) or adds a confirmed security or performance problem. Blocking.
  A problem the change only inherits (a file that was already mixed or too big, and the change
  adds a few lines to it) is 🟡, with a suggestion to fix it apart. Only what the change
  introduces is 🔴: a new file in the wrong place, or a file that crosses a limit because of it.
- ➖ **Not applicable:** the change has nothing for this dimension (no queries, no input…).

## Suggestions

- At most **5 per section**, highest impact first. Drop the rest; never pad the list.
- Each one: `file:line`, the dimension, what to change and why it is better, in one or two
  sentences, and a `suggestion` block when the fix fits in a few lines.
- Concrete or nothing: "extract the price rule at `cart.ts:42` into `priceOf()`, it is repeated
  at `:88`" is a suggestion; "improve readability" is not.
- Never report what the formatter or linter already enforces, or personal taste the project
  does not share.
- A suggestion is not a bug. A defect that breaks behavior goes to the findings instead.
