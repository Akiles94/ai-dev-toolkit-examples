<!--
  Template: plan.md · written by the planner from spec.md only · the HOW.
  Rules for the agent:
  - Follow the rule layers: task decisions > project rules (AGENTS.md) > developer profile > defaults.
  - Ask only what is not already defined. Record every answer under "Decisions".
  - Split the work into sections by intent (e.g. data → domain → presentation → wiring).
    Each section targets ≤ {{sectionLines}} production lines (tests, config and noise excluded).
    One section = one branch = one PR in the stack. Order them so each builds on the previous one.
  - Every requirement from spec.md appears in at least one section and has at least one test.
  - Make assumptions and risks visible: each one is a place where this plan could be wrong.
  Delete these comments when filling the template.
-->
# Plan · {{title}}

> Spec: [spec.md](spec.md) · Branch: `{{branch}}` · Status: draft

## Approach

<!-- The chosen option in 2–4 sentences, then the alternatives discarded and why (one line each). -->

**Discarded:**
- …

## Structure

<!-- Where new code goes, new files and their responsibility, naming (ubiquitous language). -->
| Path | Responsibility | New / changed |
|---|---|---|
| … | … | … |

## Reuse

<!-- Existing code reused, or deliberately not reused and why. -->
- …

## Decisions

<!-- Technical decisions the user made during planning (approach, naming, reuse, trade-offs). -->
- …

## Sections

| # | Name | Intent | Main files | Est. lines | Covers |
|---|---|---|---|---|---|
| S1 | … | … | … | ~… | R1 |

<!-- Repeat one block per section. -->
### S1 · {{sectionName}}

- **Goal:** …
- **Depends on:** — <!-- or S1, S2… -->
- **Done when:** … <!-- observable result, ideally a passing test -->

## Tests

| Req | Test (file › name) | Level | Section |
|---|---|---|---|
| R1 | … | unit / integration / e2e | S1 |

## Assumptions

- …

## Risks

<!-- Include invariants or gotchas that apply (from the project context, if available). -->
- …
