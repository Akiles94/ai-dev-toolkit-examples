# Demo: the storefront page (SHOP-40)

The [demo](https://github.com/Akiles94/ai-dev-toolkit/blob/main/docs/demo.md) agent on the branch of the [storefront example](../storefront/): it proposed the scenes and a cost, wrote a script, and `aidt demo render` recorded it with an offline voice, with no tokens.

**[▶ storefront.mp4](storefront.mp4)** · 1 min 16 s · 1.1 MB · voice `en_US-lessac-high` (the default: American English, a woman) · subtitles in [storefront.vtt](storefront.vtt)

- [storefront.json](../../.aidt/tasks/feat-SHOP-40-storefront/demo/storefront.json): the script, committed with the task. Rendering it again costs nothing.
- [pr-text.md](pr-text.md): the text `aidt demo render` wrote for the PR description, with the narration as a written walkthrough.
- [.aidt/app.md](../../.aidt/app.md): how to run the product, drafted by the agent and approved with the scope.

## Cost

| Step | Model | Turns | Agent time | Tokens in (cached) | Tokens out | Cost at API prices |
|---|---|---|---|---|---|---|
| Scope and cost | `claude-sonnet-5-5` | — | 15 s | 188k (169k) | 2k | $0.08 |
| Script, a sample and the video | `claude-sonnet-5-5` | 15 | 4 min 25 s | 498k (474k) | 6k | $0.20 |
| **Total** | | | | | | **$0.28** |

- **Writing the script:** the tokens above. **Rendering:** no tokens; the full video took 108 s to render on a cloud container (Playwright, Piper and ffmpeg), and the agent rendered a first-scene sample before it.
- **After a change asked in review:** `aidt demo render .aidt/tasks/feat-SHOP-40-storefront/demo/storefront.json` again, still no tokens; the script is touched only where a step or a line became wrong.

Measured with Claude Code 2.1.327, headless (`claude -p`), on 2026-11-18, with every answer typed by hand. Most input tokens are cache reads, which cost a tenth of fresh input. Agents that run apart from the conversation (the reviewer, the demo's first call) report no turns. With a Claude subscription the runs count toward usage limits instead.

## The conversation

### Scope and cost

**You:**

```text
/demo SHOP-40, the storefront page this branch built.
```

**Agent:**

**Demo proposal for SHOP-40 (storefront page). I'm stopping here until you reply "scope approved".**

**What was built.** The shop now has a page at `/`. A shopper browses 4 product cards, filters them by category, adds items to a cart, sees subtotal, shipping and total, removes lines, and keeps the cart across a reload. The page uses only the existing endpoints. This comes from the spec and plan in `.aidt/tasks/feat-SHOP-40-storefront/` and the three commits on the branch.

**Proposed scenes.** Device: desktop. Length: about 3 minutes at normal speed.

1. **Main path (about 2:15):**
   - Open `/` and see the 4 cards with price and stock: "30 in stock", "Only 4 left" and "Out of stock" for Kind of Blue, whose "Add to cart" is not available.
   - Filter to books and back to All.
   - Add Tetris Effect twice. The cart shows "Tetris Effect × 2". Shipping is $4.99 because the subtotal is under $50.
   - Add The Pragmatic Programmer. The subtotal passes $50 and shipping becomes $0.00.
   - Remove Tetris Effect. The cart and amounts update.
2. **Other paths (about 0:45):**
   - Add Refactoring five times. The fifth click shows "No more in stock" and the cart does not change.
   - Reload the page. The cart is still there.
   - Restarting the shop to show the stale-cart case (R11) is not feasible inside the allowed commands, so it will not appear in the video.

**Token estimate.** About 8–12k tokens to read the three `public/` files and write one script. Rendering uses no tokens, and fixing a step and re-rendering is free. This project has not rendered a demo before, so I would first render the first scene as a `--sample`.

**`.aidt/app.md`.** I drafted it from what the repository shows, using the template, and wrote it to `/home/user/ai-dev-toolkit-examples/.aidt/app.md`:
- Start: `npm start`, then `http://localhost:3000`.
- No other services.
- Example data: the 4-product catalogue.
- Device: desktop.

It is part of the scope you approve, so please check it.

**Things to confirm:**
- `.aidt/config.json` has no `demo` section, so there is no voice language or output setting. The render may stop on this. I would use English and tell you if the render needs the setting added.
- The render needs a browser and an offline voice. If tools are missing I will show you the install commands and not install anything.

Approve this scope, or tell me what to change.

### Script and render

**You:**

```text
Scope approved, and app.md is right. Without a demo section the config's defaults apply: an American English woman's voice, subtitles in a .vtt file.
```

**Agent:**

The full demo rendered without errors, but I haven't watched the video, so please check it before it goes in the PR.

- **Video:** `/home/user/ai-dev-toolkit-examples/.aidt/demo/storefront.mp4`. It is 76 seconds long and 1.1 MB, and rendering took 108 seconds.
- **Subtitles:** `/home/user/ai-dev-toolkit-examples/.aidt/demo/storefront.vtt`. The voice and subtitle format are the defaults you named.
- **First-scene sample:** `/home/user/ai-dev-toolkit-examples/.aidt/demo/storefront-sample.mp4`, which rendered before the full video.
- **Script:** `.aidt/tasks/feat-SHOP-40-storefront/demo/storefront.json`. It is committed, and the video is not.
- **PR text:** `.aidt/demo/storefront.md`. Paste it into the PR description, then drag the video into it.
- **Tokens:** I can't see my own token usage, and the render itself used none. My estimate for writing the script was 8–12k.
- **Page errors:** the render reported none.

The video is shorter than the 3 minutes I proposed, because I kept the narration short.

**Where it differs from my proposal:**
- **Shipping:** I had the numbers wrong. Two Tetris Effect copies cost $59.98, so shipping is already free at that point. The video adds one copy (shipping $4.99), adds a second (shipping $0.00), adds The Pragmatic Programmer, then removes Tetris Effect. Shipping comes back to $4.99, which shows it changing in both directions.
- **Category filter:** `fill` doesn't work on a dropdown, so the script clicks it and uses the arrow keys instead.
- **Not shown:** the stale-cart case after a shop restart (R11), as I said in the proposal.

**What the video shows:**
- **Cards:** the four product cards, including "Only 4 left" and the out-of-stock vinyl.
- **Filter and cart:** the books filter and back to All, then the cart steps above.
- **Other paths:** four Refactoring adds and a fifth that shows "No more in stock", then a reload that keeps the cart.

`.aidt/app.md` is still untracked. Nothing is committed or pushed.

The category filter is a dropdown. With no step for it yet, the agent opened it with the keyboard; the browser's own option list never shows in a recording. The toolkit then gained a `select` step for dropdowns.
