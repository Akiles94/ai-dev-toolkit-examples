<!--
  Practices: sustainable code · default, based on the ideas of "Código sostenible" (Carlos Blé)
  that bring a clear benefit, not applied to the letter.
  The planner designs with them, the builder writes with them, the reviewer checks them.
  Project rules (AGENTS.md) win over this file. Edit it to fit your team; delete what you don't want.
-->
# Sustainable code

## Always

- **Names that reveal intent.** Taken from the domain, pronounceable, consistent within their
  context. If a name needs a comment to be understood, rename it.
- **Least surprise.** A function does what its name says and nothing else. A query changes
  nothing; a command returns no data, except the id or new version of what it creates.
- **Simple design** (Kent Beck), in this order: passes the tests, reveals intent, has no
  duplication, has the fewest elements. No abstractions "just in case". Remove a duplication the
  third time it appears, not the second.
- **Small steps.** Refactor continuously, in small steps, with the tests green. Never a big
  rewrite on the side.
- **Short functions, one level of abstraction per block, early returns** instead of nested `if`s.
  No boolean flag parameters that switch behavior: write two functions.
- **Pure functions and immutable data**, above all in the domain.
- **Errors as values.** Expected failures are returned as values (`Result` or the language's
  idiom); exceptions only for the unexpected (a bug, a service down), logged with context. When
  validating input, collect every error, not only the first.
- **Comments say why, not what.** Doc comments on exported symbols are short and say what they are
  for or why they exist, never repeat the name.
- **Sustainable tests.** They test behavior, not implementation; their names use business
  language; each one fails for a single reason; in-memory adapters instead of mocks that imitate
  third-party libraries.

## When it pays off

- **Domain types.** Branded or wrapper types for ids, money, dates and other values that are easy
  to mix up (`UserId` vs `OrderId`, `Money` with amount and currency). Do not wrap every string.
- **Parse, don't validate.** Only validated data enters the domain: constructors such as
  `parseEmail` or `Money.fromCents` check and return a `Result`.
- **Tell, don't ask.** The rules of an entity live in its module, next to its data; nobody changes
  its fields from outside.
- **SOLID**, with judgement:
  - Single responsibility: yes.
  - Dependency inversion: yes, with ports only at the edges with the outside world (database,
    network, third-party services).
  - Open/closed: preferably through configuration or data, not inheritance.
  - Interfaces: small, and only when there is a second implementation, even if it is the test one.
- **Cohesion and coupling.** Independent modules or contexts; one does not walk through the data
  of another. Apply the law of Demeter between contexts, not to reading immutable data.
- **Minimal visibility.** Export only what is used outside. Unused exports are dead code.
- **Test first** in the domain and use cases (rules, money, permissions, payments). In adapters
  and UI, tests may come after.
- **Design patterns** only when they remove real complexity, and named after the pattern so
  readers recognize them.

## Not applied

- One small class per concept, getters and setters for everything.
- Interfaces without a second implementation.
- The whole tactical DDD toolbox everywhere (domain events, factories, specifications) when a
  function does the job.
- Coverage as a goal. A minimum in the domain and use cases is a safety net, not a target.

## Review checklist

- [ ] Names reveal intent in domain language; nothing surprises when reading it.
- [ ] Short functions, one level of abstraction, early returns; queries without side effects.
- [ ] No "just in case" abstractions, no interfaces without a second implementation.
- [ ] Easily confused values have their own types; only validated data enters the domain.
- [ ] Entity rules live in their module; nobody changes its fields from outside.
- [ ] Expected errors are values; unexpected ones are logged with context.
- [ ] Tests describe behavior; domain and use cases were built test first.
- [ ] Only what is used outside is exported; comments say why.
