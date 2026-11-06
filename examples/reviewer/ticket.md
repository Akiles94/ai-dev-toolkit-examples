# SHOP-12

SHOP-12 Discount codes. A customer can apply one discount code to their cart (POST /carts/:id/discount with { "code": "..." }). Codes are case-insensitive. Percent codes take a percentage off the subtotal; fixed codes take a fixed amount off, but the discount never exceeds the subtotal. A code is valid through the end of its expiry date (UTC). Unknown codes answer 400 UNKNOWN_CODE, expired ones 400 EXPIRED_CODE. Applying a second code replaces the first. Free shipping (from $50) is based on the subtotal after the discount. The cart view shows the discount.
