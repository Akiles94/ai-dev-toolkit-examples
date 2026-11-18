# SHOP-40 · Storefront page

> Branch: `feat/SHOP-40-storefront` · Source: ticket SHOP-40 (prompt) · Mode: full · Status: approved

## Goal

A person can use the shop in a browser: at `/` they browse the products, filter them by category,
put items in a cart, see what they would pay and remove items, without calling the JSON API by
hand. It is also the first change a demo video can show.

## Context

Today the shop only speaks JSON. Products are listed with `GET /products` (optionally by
category), and the cart flow is `POST /carts` → `POST /carts/:id/items` (409 `OUT_OF_STOCK`) →
`GET /carts/:id` with subtotal, shipping (free from $50) and total → `DELETE /carts/:id/items/:productId`.
The catalogue has 4 products: The Pragmatic Programmer ($39.99, 12 in stock, books),
Refactoring ($44.99, 4, books), Tetris Effect ($29.99, 30, games) and Kind of Blue (vinyl)
($24.99, 0, music). Shipping is $4.99 under $50.00 and free from $50.00; an empty cart has no
shipping. Stock only goes down at checkout, never when an item goes into a cart. Checkout is not part of this page.

## Requirements

- **R1** Opening `/` shows a page with one card per product, each card showing the product name, its price in dollars (e.g. `$39.99`) and its stock.
- **R2** A category filter offers "All", books, games and music, starts on "All", and shows only the products of the chosen category.
- **R3** A product with 5 or more in stock shows its stock as "N in stock"; with 1 to 4 in stock the card says "Only N left".
- **R4** A product with 0 in stock says "Out of stock" and cannot be added to the cart.
- **R5** "Add to cart" on a card puts 1 unit of that product in the cart; adding the same product again raises that line's quantity by 1.
- **R6** When the cart already holds all the stock of a product and the person adds it again, the page shows the message "No more in stock" and the cart does not change.
- **R7** A cart panel shows each line with product name, quantity and line price (unit price × quantity), plus subtotal, shipping and total.
- **R8** Shipping is $4.99 when the subtotal is under $50.00, and free ($0.00) from $50.00; an empty cart shows $0.00 for subtotal, shipping and total.
- **R9** Each cart line has a remove action that takes the whole line out of the cart, and the panel updates its lines and amounts.
- **R10** The person's cart is kept when they reload the page: the same cart, with the same lines, is shown again.
- **R11** If the kept cart no longer exists (for example the shop was restarted), the page starts a new empty cart without showing an error.
- **R12** The page needs no new product or cart behavior: all products, stock and amounts come from the existing endpoints.

## Acceptance criteria

| Req | Given | When | Then |
|---|---|---|---|
| R1 | The 4-product catalogue | The person opens `/` | 4 cards: "The Pragmatic Programmer $39.99", "Refactoring $44.99", "Tetris Effect $29.99", "Kind of Blue (vinyl) $24.99", each with its stock |
| R2 | Filter on "All" | The person picks "books" | Only The Pragmatic Programmer and Refactoring are shown |
| R2 | Filter on "books" | The person picks "All" | All 4 cards are shown again |
| R2 | The page just opened | Nothing chosen | The filter is on "All" |
| R3 | Tetris Effect has 30 in stock | The person looks at its card | It says "30 in stock" |
| R3 | Refactoring has 4 in stock | The person looks at its card | It says "Only 4 left" |
| R3 | A product with exactly 5 in stock | The person looks at its card | It says "5 in stock", not "Only 5 left" |
| R4 | Kind of Blue has 0 in stock | The person looks at its card | It says "Out of stock" and "Add to cart" is not available |
| R5 | Empty cart | The person adds Tetris Effect | The cart shows "Tetris Effect × 1" |
| R5 | Cart has Tetris Effect × 1 | The person adds it again | The cart shows "Tetris Effect × 2", one line only |
| R6 | Refactoring has 4 in stock and the cart holds Refactoring × 4 | The person adds Refactoring | "No more in stock" is shown and the cart still holds Refactoring × 4 |
| R7 | Cart has The Pragmatic Programmer × 1 and Tetris Effect × 2 | The person looks at the cart panel | Lines "The Pragmatic Programmer × 1 $39.99" and "Tetris Effect × 2 $59.98"; subtotal $99.97, shipping $0.00, total $99.97 |
| R8 | Cart has Tetris Effect × 1 ($29.99) | The person looks at the cart panel | Subtotal $29.99, shipping $4.99, total $34.98 |
| R8 | Cart has Refactoring × 1 ($44.99) | The person adds Tetris Effect ($29.99) | Subtotal $74.98, shipping $0.00, total $74.98 |
| R8 | Cart subtotal is exactly $50.00 (the catalogue cannot reach it; the shop's rule is "free from $50") | The cart panel shows it | Shipping $0.00 |
| R8 | Empty cart | The person looks at the cart panel | Subtotal $0.00, shipping $0.00, total $0.00 |
| R9 | Cart has The Pragmatic Programmer × 1 and Tetris Effect × 2 | The person removes Tetris Effect | The cart shows only The Pragmatic Programmer × 1; subtotal $39.99, shipping $4.99, total $44.98 |
| R10 | Cart has Tetris Effect × 2 | The person reloads the page | The cart panel still shows Tetris Effect × 2 |
| R11 | The person's kept cart is unknown to the shop | The page opens | An empty cart is shown, with no error, and adding items works |
| R12 | Any of the above | The page is used | No product, stock or amount shown comes from anywhere but the existing endpoints (the cart totals are the ones `GET /carts/:id` returns) |

## Edge cases

- A category with no products in stock still shows its cards, each "Out of stock".
- Removing the last line leaves an empty cart ($0.00 everywhere), not an error.
- The card's stock is the catalogue's stock; it does not go down when items are put in a cart.
- A cart line whose product has run out of stock for others is still shown as it is; only checkout (out of scope) decides.

## Out of scope

- Checkout, orders and payment, and any stock reduction.
- Quantity selector on cards, changing a line's quantity down, removing one unit at a time.
- Search, sorting, product images or detail pages.
- User accounts or a cart shared between browsers or devices.
- Changes to the JSON API's behavior.

## Decisions

- The cart is kept across reloads (discarded: a new empty cart on every visit).
- One unit per "Add to cart" click (discarded: a quantity selector on the card).
- At the stock limit, "Add to cart" stays available and answers "No more in stock" (discarded: disabling the button).
- Cart lines show name, quantity and line price (discarded: also showing the unit price).
- Remove takes out the whole line (discarded: one unit at a time).
- Cards show the catalogue's stock (discarded: stock minus what is in the cart).
- Filter is "All" plus books, games, music, starting on "All".

## Open questions

- None
