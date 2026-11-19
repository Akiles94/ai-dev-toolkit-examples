<!--
  Template: .aidt/app.md · how to run and use this product · read by the `demo` and the `qa`.
  Rules for the agent:
  - Only what the repository shows or the user said; mark anything guessed «to confirm».
  - Commands exactly as they are run, from the repository root.
  - Example people and data only, never real ones.
  Delete these comments when filling the template.
-->
# How to run and use {{product}}

## Run

- **Start:** `{{command}}` → `{{url}}` (ready when `{{url}}{{path}}` answers)
- **Services it needs:** {{database, email catcher, file store… and how to start them, or «none»}}
- **Stop:** {{how, and what must not be stopped because others use it}}
- **Logs:** {{where the server writes them, to read errors while walking}}

## Data and people

| Person | Device | Example data |
|---|---|---|
| {{who}} | desktop / phone | {{name, email, ids to use}} |

- **Reaching a state fast:** {{end-to-end helpers or commands that create a user, an order…}}
- **Faked locally:** {{payments, email, AI… and what the fakes return}}
- **Simulating time:** {{how, or «not possible»}}

## Demo

- **Device:** desktop / phone
- **Voice and subtitles:** `demo` in `.aidt/config.json`
- **What every demo starts from:** {{the page and the state}}

## QA

- **Where each journey is written:** {{flow documents, specs (`.aidt/tasks/*/spec.md`), tickets…}}
- **Promises:** {{landing page, emails, terms, help texts, and where each one is}}
- **Already known or accepted** (not reported again unless worse): {{… or «none»}}
- **Someone with bad intentions could try:** {{another person's ids or links, calls that skip the
  page, replays… what applies here}}
- **Staff side:** {{what the team can see or do for a person, and where, or «none»}}
