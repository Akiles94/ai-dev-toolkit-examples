# S1 · Serve the page

> Stack: [index](index.md) · Part 1 of 3 · Previous: none · Next: [S2](s02-page-logic.md)
> Verdict: PASS · Reviewed commit: `7b2172d`

## At a glance

| | |
|---|---|
| Reviewable lines | 43 (+43 / −0) in 5 files |
| Tests | 66 lines in 1 file |
| Filtered | 0 lines of noise, 0 of config |
| Covers | R12 (and the serving half of R1) |
| Reading time | ~5 min |

## Predict first

🤔 The server must send files from `public/`. How would you stop a request like `/../package.json` from reading files outside that folder?

## What it does

`GET /` now returns an HTML page, and four more paths return the page's script and style files. Any other path still gets the JSON 404 `{ "error": "NOT_FOUND" }`. The files to serve are a fixed list, so the request path is never used to build a file path. The page itself is only a shell here; S3 fills it.

## Walkthrough

Input: `GET /app.js`

1. `src/server.ts:62` → for a `GET`, calls `serveStatic("/app.js", res)` before the 404 fallback.
2. `src/static.ts:5-11` → looks the path up in the fixed `FILES` table: `app.js`, `text/javascript; charset=utf-8`.
3. `src/static.ts:18-19` → reads `public/app.js`, answers 200 with that content type.
4. For `/../package.json` or `/unknown`: `src/static.ts:16` finds no entry, returns false, and `server.ts:64` sends the JSON 404.

## Reading order

1. 🧠 [`src/static.ts`](../../../../src/static.ts) · read carefully: the whole file (25 lines)
2. ⚙️ [`src/server.ts`](../../../../src/server.ts) · skim: lines 4 and 62
3. ⚙️ [`tests/static.test.ts`](../../../../tests/static.test.ts) · skim
4. ⚙️ `public/index.html`, `public/app.js`, `public/style.css` · placeholders, filled in S3

## Affected flows

- **Direct:** the router's fallthrough: `GET` on unknown paths now passes through `serveStatic` first.
- **Indirect:** all JSON routes. They are matched before the static lookup, and `tests/static.test.ts:67` checks `/products` and `/carts` still answer JSON.

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R1 (serving) | `src/static.ts:5-22` | `static` › `/` serves the page as HTML; script and style content types | ✅ Met |
| R12 | `src/server.ts:62` | `static` › paths outside the list keep the JSON 404; existing API routes still answer JSON | ✅ Met |

## Findings

- None

## Quality

| Dimension | Rating | Why |
|---|---|---|
| Structure | ✅ | One small module in `src/`, as the plan says; the migration to the new layout is scheduled after SHOP-40. |
| Practices | ✅ | Fixed whitelist, boolean result, minimal exports. |
| Readability | ✅ | Short, named table, early return. |
| Maintainability | ✅ | Adding a file is one table line. |
| Performance | ✅ | Reads the file on each request; fine for this size. |
| Security | ✅ | No path built from the request; `/../package.json` and `/src/server.ts` return 404 (`tests/static.test.ts:41-60`). |
| Tests | ✅ | Real HTTP, includes the traversal and API-unchanged cases. |

- No suggestions

## Questions for the author

- None
