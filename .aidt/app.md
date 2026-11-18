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

Not filled (the `qa` agent is not installed).
