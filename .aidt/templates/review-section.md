<!--
  Template: review/sNN-<slug>.md · written by the reviewer · one per section, used as the PR description.
  Audience: a developer who has not seen the spec, plan or conversation. Write for them.
  Rules for the agent:
  - Plain language, short sentences. Define any technical term in one line the first time.
  - Every claim points to `file:line`. Never describe code you have not read.
  - "Walkthrough" uses one realistic input and follows it step by step with real values.
  - Numbers in "At a glance" come from `aidt diff --json`, never estimated.
  - Findings: 🔴 a real bug, risk or broken requirement · 🟡 worth a look · ℹ️ not requested.
  - Keep every block. Write "None" when a block has nothing to say. Customize the set of blocks
    by editing this template; the reviewer follows whatever blocks it contains.
  Delete these comments when filling the template.
-->
# {{sectionId}} · {{sectionName}}

> Stack: [index](index.md) · Part {{n}} of {{total}} · Previous: {{previous}} · Next: {{next}}
> Verdict: {{verdict}} · Reviewed commit: `{{commit}}`

## At a glance

| | |
|---|---|
| Reviewable lines | {{codeLines}} (+{{added}} / −{{deleted}}) in {{codeFiles}} files |
| Tests | {{testLines}} lines in {{testFiles}} files |
| Filtered | {{noiseLines}} lines of noise, {{configLines}} of config |
| Covers | {{requirements}} |
| Reading time | ~{{minutes}} min |

## Predict first

<!-- One question the reader should answer before opening the diff. -->
🤔 …

## What it does

<!-- 2–4 sentences: the behavior after this section, not a list of files. -->

## Walkthrough

<!-- Input: one realistic example. Then numbered steps: `file:line` → what happens → key values. Max ~8. -->
Input: `…`

1. `…:…` → …

## Reading order

<!-- Contracts first, then logic, then wiring, then UI. Mark what deserves care. -->
1. 🧠 [`…`](…) · read carefully: lines …
2. ⚙️ [`…`](…) · skim

## Affected flows

<!-- Direct: flows this section changes. Indirect: flows that use a changed symbol. -->
- **Direct:** …
- **Indirect:** …

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R1 | `…:…` | `…` | ✅ Met / ⚠️ Partial / ❌ Missing |

## Findings

<!--
  Confirmed defects from the defect search, most severe first. One block each:

  ### 🔴 <the problem in one sentence> · `file:line`
  **Fails when:** <concrete input or state> → <wrong result>.
  **Fix:**
  ```suggestion
  <replacement lines>
  ```
-->

- None

## Quality

<!--
  Rate the changed code with `.aidt/practices/code-quality.md`, one row per dimension it lists:
  ✅ Good · 🟡 Improvable · 🔴 Broken rule · ➖ Not applicable, with the reason in one line.
  Then at most 5 suggestions, highest impact first, one block each:

  ### 🟡 <what to change, in one sentence> · `file:line` · <dimension>
  <why it is better, one or two sentences>
  ```suggestion
  <replacement lines>
  ```
-->

| Dimension | Rating | Why |
|---|---|---|
| Structure | ✅ | … |

- No suggestions

## Questions for the author

- None
