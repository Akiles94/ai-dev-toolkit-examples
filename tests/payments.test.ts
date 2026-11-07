import assert from "node:assert/strict";
import { test } from "node:test";
import { FakePaymentGateway } from "../src/payments.ts";

test("charges an accepted card and remembers the payment", async () => {
  const gateway = new FakePaymentGateway();
  const result = await gateway.charge({ amountCents: 1500, cardToken: "tok_visa", reference: "c" });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.match(result.paymentId, /^pay-/);
  assert.equal(gateway.find(result.paymentId)?.amountCents, 1500);
});

test("declines card tokens starting with tok_declined", async () => {
  const gateway = new FakePaymentGateway();
  for (const cardToken of ["tok_declined", "tok_declined_insufficient_funds"]) {
    const result = await gateway.charge({ amountCents: 100, cardToken, reference: "c" });
    assert.deepEqual(result, { ok: false, reason: "CARD_DECLINED" });
  }
});

test("refuses to charge nothing", async () => {
  const gateway = new FakePaymentGateway();
  const result = await gateway.charge({ amountCents: 0, cardToken: "tok_visa", reference: "c" });
  assert.deepEqual(result, { ok: false, reason: "INVALID_AMOUNT" });
});

test("refunds a payment once", async () => {
  const gateway = new FakePaymentGateway();
  const charge = await gateway.charge({ amountCents: 900, cardToken: "tok_visa", reference: "c" });
  assert.ok(charge.ok);
  const refund = await gateway.refund(charge.paymentId);
  assert.equal(refund.ok, true);
  assert.deepEqual(await gateway.refund(charge.paymentId), {
    ok: false,
    reason: "ALREADY_REFUNDED",
  });
});

test("cannot refund an unknown payment", async () => {
  const gateway = new FakePaymentGateway();
  assert.deepEqual(await gateway.refund("pay-nope"), { ok: false, reason: "PAYMENT_NOT_FOUND" });
});
