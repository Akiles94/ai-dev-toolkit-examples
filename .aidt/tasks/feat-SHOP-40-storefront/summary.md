# SHOP-40 · Storefront page · summary

> Branch: `feat/SHOP-40-storefront`, now part of `claude/gifted-volta-n479gk` · Merged: not merged, no PR yet (closed 18/11/2026) · Plan: [plan](plan.md)

Spec: [spec](spec.md) (12 requirements). Review: [index](review/index.md). Task state: [state.json](state.json).
Runs kept in full: [examples/storefront](../../../examples/storefront/README.md) (workflow, $1.65) and
[examples/demo](../../../examples/demo/README.md) (video, $0.28). Demo script: [demo/storefront.json](demo/storefront.json).

## Done

- A page at `/`: product cards (name, price, stock), a category filter starting on "All", "Only N
  left" under 5 and "Out of stock" (not addable) at 0, "Add to cart" on the existing endpoints, and
  a cart panel with items, subtotal, shipping (free from $50), total and a remove action. The cart
  survives a reload and a stale cart is replaced without an error.
- The server serves a fixed list of files from `public/` (`src/static.ts`); the logic is in two
  tested plain-JS modules (`shop-view.js`, `cart-session.js`) and `app.js` only draws and listens.
  No cart or product behavior changed (R12).
- Three sections, 383 reviewable lines, one commit each: S1 `7b2172d` (43), S2 `06da872` (97),
  S3 `c043ebf` (243). Reviewer PASS on all three, 12 of 12 requirements met.
- Demo, 1 min 20 s, made with `/demo` and kept in `examples/demo/` (`storefront.mp4`, `storefront.vtt`,
  `pr-text.md`). The command that starts the app is `demo.start` in `.aidt/config.json`.

## Decisions

All taken by the user on 18/11/2026 and written in the spec (Decisions) and plan (Decisions): cart
kept across reloads; one unit per click; "No more in stock" at the limit with the button available;
lines show name, quantity and line price; remove takes the whole line; cards show the catalogue's
stock; filter "All" plus three categories. Branch cut from the current branch, not `main`, because it
carries the context and demo products. Plain JS in `public/`, no browser test tool, a copy of
`formatCents` with a parity test.

## Deviations from the plan

None.

## Left for later

- Optional hardening: `localStorage` can throw and the page then never starts; fall back to an
  in-memory store (`public/app.js:11`, review S3). The plan assumes storage is available.
- No automated DOM test (by plan); `app.js` was checked by hand and in the demo.
- Checkout from the page, quantity selectors and other items in the spec's «Out of scope».
- The structure migration, scheduled after this block (see the status).

## Verdicts

| Check | Verdict | On commit | Report |
|---|---|---|---|
| Reviewer S1 | PASS | `7b2172d` | `review/s01-serve-the-page.md` |
| Reviewer S2 | PASS | `06da872` | `review/s02-page-logic.md` |
| Reviewer S3 | PASS | `c043ebf` | `review/s03-page-wiring.md` |
