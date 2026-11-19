<!--
  Template: qa/<mode>-<slug>.md · written by the qa agent · one report per pass.
  Rules for the agent:
  - A developer who saw nothing of the block reproduces every finding from its walk file alone.
  - Quote what the screen says; give the walk, the step and, when it helps, the screenshot.
  - Severity: 🔴 blocks or misleads a person, loses data or shows it to someone else ·
    🟡 a real annoyance or risk · ℹ️ a note.
  Delete these comments when filling the template.
-->
# QA · {{block}} · {{mode}} · pass {{pass}}

> Walked: `{{commit}}` (or the design or document version) · Plan: {{plan}} · Verdict: **{{verdict}}**

## Scope

| Journey | Why it is in scope | People | States tried | Covered |
|---|---|---|---|---|
| … | changed / touched (which assumption) / promise | … | … | ✅ / partly / ❌ |

Not built yet, on purpose (from the plan): …

## Findings

| Id | Sev. | Where | In one line |
|---|---|---|---|
| QA-01 | 🔴 | … | … |

### QA-01 · {{title}}

- **Walk:** `walks/{{slug}}.json`, step {{n}} (run it with `aidt qa walk <path>`)
- **Seen:** «…» (the call, the status, the text on screen)
- **Expected:** … (`docs/…` or the spec says …)
- **Where in the code** (if looked): `file:line`
- **Proposed fix:** … and the test that reproduces the walk
- **Reproduced:** twice

## Unconfirmed

<!-- Seen once and not again, or only inferred. Never dropped. -->
- None

## Official data checked

| Data | Shown | Source (link) | Read on | Result |
|---|---|---|---|---|

## Not covered

<!-- Where a second pass starts: journeys, people or states not tried, and why. -->
- None

## Decisions for the user

<!-- Each as a question with options, the recommended one first. -->
- None

## Cost

Walks run: {{n}} · tokens: {{tokens, if the tool shows them}}
