# S1 · Bad cart-item bodies

> Stack: [index](index.md) · Part 1 of 3 · Previous: none · Next: [S2](s02-message-clears.md)
> Verdict: PASS · Reviewed commit: `f5f37a5`

## At a glance

| | |
|---|---|
| Reviewable lines | 16 (+14 / −2) in 1 file |
| Tests | 61 lines in 1 file |
| Filtered | 0 lines of noise, 0 of config |
| Covers | R3 |
| Reading time | ~4 min |

## Predict first

🤔 `POST /carts/:id/items` with the body `null` used to answer 500. What should an API client get instead, and where must the check sit so that `null` never reaches `body.productId`?

## What it does

`POST /carts/:id/items` now reads its body through a small helper. If the body is not valid JSON, or is `null`, an array, a number or a string, the answer is `400 { "error": "INVALID_ITEM" }`. A valid object with a bad `productId` or `qty` still gets the same 400 as before. Valid bodies still add the item.

## Walkthrough

Input: `POST /carts/c-1/items` with the raw body `null`.

1. `src/server.ts:57` → the route calls `readItemBody(req)` instead of `readJson` directly.
2. `src/server.ts:20` → `readJson` parses `null` (`src/utils.ts:19`).
3. `src/server.ts:21-22` → `null` is not an object for this helper, so it returns `undefined`.
4. `src/server.ts:58` → `!body` is true, so the route answers `400 { "error": "INVALID_ITEM" }` before `body.productId` is read.
5. With `not json{`: `JSON.parse` throws at `src/utils.ts:19`; `src/server.ts:23-24` catches it and returns `undefined`, same answer.

## Reading order

1. 🧠 [`src/server.ts`](../../../../src/server.ts) · read carefully: lines 16-25 and 57-58
2. ⚙️ [`tests/server-items.test.ts`](../../../../tests/server-items.test.ts) · skim: real HTTP against the exported `server`

## Affected flows

- **Direct:** add to cart (`POST /carts/:id/items`).
- **Indirect:** the storefront's add button (`public/app.js`) and QA walk 08 steps 10 and 11. `readJson` is not changed, so `POST /carts` and other callers behave as before.

## Requirement coverage

| Req | Where | Test | Status |
|---|---|---|---|
| R3 | `src/server.ts:18-26`, `:57-58` | `tests/server-items.test.ts` › `R3: a null body…`, `R3: unparsable JSON…`, `R3: an array, a number and a string…`, `R3: qty 0 still answers 400…` | ✅ Met |

## Findings

- None

## Quality

| Dimension | Rating | Why |
|---|---|---|
| Structure | ✅ | Helper sits in `server.ts` next to its only caller; `utils.ts` untouched, as planned. |
| Practices | ✅ | Error as a status code with `{ "error": "CODE" }`, as `AGENTS.md` asks. |
| Readability | ✅ | `isObject` names the rule; early return of `undefined`. |
| Maintainability | ✅ | No duplication; `readJson` keeps its behaviour for other callers. |
| Performance | ➖ | Nothing that scales. |
| Security | ✅ | Untrusted body is shape-checked at the boundary before use. |
| Tests | ✅ | Failing and passing cases, over real HTTP; each can fail on the old code. |

- No suggestions

## Questions for the author

- None
