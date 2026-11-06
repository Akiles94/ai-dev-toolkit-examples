<!--
  Template: spec.md · written by the refiner · the WHAT, in business terms.
  Rules for the agent:
  - No technical decisions here (no files, libraries, patterns). That belongs in plan.md.
  - Every requirement is testable and numbered (R1, R2…). Tests will reference these ids.
  - Acceptance criteria use concrete example data, never "valid input" or "some user".
  - Remove sections that do not apply in `light` mode, except Goal, Requirements and Out of scope.
  - "Open questions" must be empty before this spec is approved.
  Delete these comments when filling the template.
-->
# {{ticket}} · {{title}}

> Branch: `{{branch}}` · Source: {{source}} · Mode: {{mode}} · Status: draft

## Goal

<!-- One or two sentences. Who benefits and what changes for them. -->

## Context

<!-- What happens today, in plain words. Mention the business flows this touches. -->

## Requirements

<!-- Testable statements. One behavior each. -->
- **R1** …
- **R2** …

## Acceptance criteria

<!-- At least one per requirement. Given / When / Then with real example data. -->
| Req | Given | When | Then |
|---|---|---|---|
| R1 | … | … | … |

## Edge cases

- …

## Out of scope

<!-- What this change deliberately does NOT do. Prevents scope creep in plan and build. -->
- …

## Decisions

<!-- Business decisions the user made while refining, with the alternative discarded. -->
- …

## Open questions

<!-- Must be empty before approval. -->
- None
