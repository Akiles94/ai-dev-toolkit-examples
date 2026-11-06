<!--
  Template: review/index.md · written by the reviewer · the entry point for anyone reviewing the stack.
  Rules for the agent:
  - Readable in under a minute: what changed, why, and where to start.
  - Links point to each section guide and, when known, to its PR.
  - Totals come from `aidt diff --json`, never estimated.
  Delete these comments when filling the template.
-->
# Review · {{ticket}} · {{title}}

> Spec: [spec.md](../spec.md) · Plan: [plan.md](../plan.md) · Branch: `{{branch}}` · Mode: {{mode}}

## Summary

<!-- 2–3 sentences: the business change and how it was built. -->

## At a glance

| | |
|---|---|
| Reviewable lines | {{codeLines}} in {{sections}} sections |
| Tests | {{testLines}} lines |
| Filtered | {{noiseLines}} lines of noise, {{configLines}} of config |
| Requirements | {{met}} met · {{partial}} partial · {{missing}} missing |
| Reading time | ~{{minutes}} min |

## Reading order

| # | Section | Lines | Kind | Verdict | PR |
|---|---|---|---|---|---|
| 1 | [S1 · …](s01-….md) | … | 🧠 logic / ⚙️ skim | PASS / FAIL | #… |

## Requirement coverage

| Req | Sections | Tests | Status |
|---|---|---|---|
| R1 | S1 | ✅ | ✅ Met |

## Warnings across the stack

<!-- Only what spans sections or matters for the whole change. Per-section warnings stay in their guide. -->
- None

## Questions for the author

- None
