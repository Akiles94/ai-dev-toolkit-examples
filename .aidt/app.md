# How to run and use shop-api

## Run

- **Start:** `npm start` → `http://localhost:3000` (ready when `http://localhost:3000/products` answers)
- **Services it needs:** none (in-memory state, no dependencies)
- **Stop:** stop the `npm start` process; state is lost on restart (a kept cart then becomes unknown and the page starts a new one)
- **Logs:** the terminal running `npm start`

## Data and people

| Person | Device | Example data |
|---|---|---|
| Shopper (anonymous, no account) | desktop | Catalogue: The Pragmatic Programmer $39.99 (12, books), Refactoring $44.99 (4, books), Tetris Effect $29.99 (30, games), Kind of Blue (vinyl) $24.99 (0, music) |

- **Reaching a state fast:** open `/`; a cart is created on first visit. Or `POST /carts` and `POST /carts/:id/items` with curl.
- **Faked locally:** nothing; checkout does not exist yet.
- **Simulating time:** not possible.

## Demo

- **Device:** desktop
- **Voice and subtitles:** `demo` in `.aidt/config.json` (to confirm: the file has no `demo` section yet)
- **What every demo starts from:** the page `/` on a freshly started shop with the 4-product catalogue and an empty cart.

## QA

- **Journeys and promises:** the acceptance table of the block's `spec.md` (`.aidt/tasks/<task-id>/spec.md`) and `AGENTS.md` «Flows». Page texts that promise something: "No more in stock", "Only N left", "Out of stock", "Something went wrong. Try again.", shipping "free from $50".
- **Known or accepted:** none yet.
- **Start/stop:** the shop is normally already running at `http://localhost:3000`; the qa agent does not start or stop it. If it does not answer, ask the user to run `npm start`.
- **Browsers:** desktop Chromium via `aidt qa walk` (a `phone` device for narrow layouts).
- **Mail catcher:** none (the shop sends no email).
- **Time simulation:** none.
- **Data the walks change:** carts and nothing else (stock only goes down at checkout, which does not exist). The shop's state is reset only by restarting it, which the qa agent does not do.
- **Ids:** products are `p-1`..`p-4`; carts are `cart-<8 hex>`.
