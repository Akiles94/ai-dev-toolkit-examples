# shop-api

A small shop API (products, carts, shipping) in TypeScript, with no dependencies. It exists to
show what the [AI Dev Toolkit](https://github.com/Akiles94/ai-dev-toolkit) agents produce on a
real codebase: every example linked from the toolkit's docs was run here, and its output is kept
in [`examples/`](examples/) and in this repository's pull requests.

```bash
npm test     # Node 22.18+ runs the TypeScript directly
npm start    # http://localhost:3000/products
```

## Checkout and orders

`POST /carts/:id/checkout` with `{ "cardToken": "tok_..." }` turns a cart into a paid order. It
reserves the stock for every item (or none: `409 OUT_OF_STOCK` lists the product ids), charges
the card through the `PaymentGateway` port and empties the cart. A declined card answers
`402 PAYMENT_DECLINED` and releases the stock again.

For now payments go through `FakePaymentGateway` (in memory), which declines every card token
starting with `tok_declined`.

| Route                     | What it does                                                   |
| ------------------------- | -------------------------------------------------------------- |
| `GET /orders/:id`         | One order, with item prices at checkout time and its history   |
| `GET /orders?status=`     | Orders, optionally filtered by `paid`, `shipped` or `cancelled` |
| `POST /orders/:id/ship`   | Ships a paid order (`409` otherwise)                           |
| `POST /orders/:id/cancel` | Cancels a paid order, refunds the payment, returns the stock   |
