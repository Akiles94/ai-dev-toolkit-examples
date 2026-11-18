# Plan check: before building a block

The planner goes through this list when it writes a block's plan, before any design or code. A gap
found here costs a line of the plan; found by the QA after building, it costs a fix block. It
applies to designs, code and business processes alike. Write down what the check changed in the
plan, and ask the user only what they alone can decide.

1. **People.** Every person the block involves, each with their own path: one person alone, a
   group or family (a second adult, minors), a third party (a host, a provider), the staff, and
   someone with bad intentions. What does each one see, decide and get?
2. **States.** For every screen or step: empty, loading, error, success, expired, cancelled, done
   twice, done out of order, and the way back from each.
3. **Seams.** Older journeys that read what this block changes, or whose assumptions it breaks (a
   new kind of person, state, data or way in). Name them in the plan: the QA walks them.
4. **Contradictions.** The plan against the flow documents, the screens, the emails, the decisions
   already taken (`.aidt/status.md` and the tasks' records) and the project rules (`AGENTS.md`).
5. **Official data.** Every fee, deadline, requirement, link or law the block shows, with its
   current official source and the date it was read; what cannot be confirmed is «to verify».
6. **Business.** Price, taxes, refunds, who does each step, what it costs, how long it takes, what
   happens if it fails or is late, and the legal risk.
7. **Promises.** What the landing page, terms, emails and help texts say about this, against what
   the block will really do.
8. **Out of scope.** What the block leaves for later, written in the plan, so nobody takes it for a
   dead end.
