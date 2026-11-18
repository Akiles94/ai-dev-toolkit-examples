<!--
  Template: .aidt/tasks/<task-id>/summary.md · written when a block closes · the block's record.
  Rules for the agent:
  - Read on demand, never at the start of a session: complete, but no longer than it needs to be.
  - A workflow task links its spec, plan and review index instead of repeating them.
  - Every decision with who took it and when; every deviation from the plan with `file:line`.
  Delete these comments when filling the template.
-->
# {{block}} · summary

> Branch: `{{branch}}` · Merged: `{{merge-commit}}` on {{date}} · Plan: {{plan link or «none»}}

## Done

<!-- What the block left working, in a few bullets a teammate understands without the code. -->

## Decisions

<!-- One line each: the decision, who took it, when, where it is written. Or «None». -->

## Deviations from the plan

<!-- What was built differently from the plan and why, with `file:line`. Or «None». -->

## Left for later

<!-- What was not done, and where it is written down (an issue, a deferred list). Or «Nothing». -->

## Verdicts

| Check | Verdict | On commit | Report |
|---|---|---|---|
| Reviewer | {{PASS/FAIL}} | `{{commit}}` | `review/index.md` |
