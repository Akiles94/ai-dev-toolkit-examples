import { newId, now } from "./utils.ts";

export interface ChargeRequest {
  amountCents: number;
  cardToken: string;
  /** Our own reference for the charge, e.g. the cart id. */
  reference: string;
}

export type ChargeResult = { ok: true; paymentId: string } | { ok: false; reason: string };

export type RefundResult = { ok: true; refundId: string } | { ok: false; reason: string };

/** Port for whatever payment provider we end up using. */
export interface PaymentGateway {
  charge(request: ChargeRequest): Promise<ChargeResult>;
  refund(paymentId: string): Promise<RefundResult>;
}

interface FakePayment {
  id: string;
  amountCents: number;
  reference: string;
  chargedAt: string;
  refundId?: string;
}

export const DECLINED_TOKEN_PREFIX = "tok_declined";

/**
 * In-memory gateway until a real provider is wired in. Declines any card token that starts
 * with `tok_declined`, accepts everything else.
 */
export class FakePaymentGateway implements PaymentGateway {
  private readonly payments = new Map<string, FakePayment>();

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    if (request.cardToken.startsWith(DECLINED_TOKEN_PREFIX)) {
      return { ok: false, reason: "CARD_DECLINED" };
    }
    if (request.amountCents <= 0) {
      return { ok: false, reason: "INVALID_AMOUNT" };
    }
    const payment: FakePayment = {
      id: newId("pay"),
      amountCents: request.amountCents,
      reference: request.reference,
      chargedAt: now(),
    };
    this.payments.set(payment.id, payment);
    return { ok: true, paymentId: payment.id };
  }

  async refund(paymentId: string): Promise<RefundResult> {
    const payment = this.payments.get(paymentId);
    if (!payment) return { ok: false, reason: "PAYMENT_NOT_FOUND" };
    if (payment.refundId) return { ok: false, reason: "ALREADY_REFUNDED" };
    payment.refundId = newId("ref");
    return { ok: true, refundId: payment.refundId };
  }

  /** Test helper: what the gateway knows about a payment. */
  find(paymentId: string): Readonly<FakePayment> | undefined {
    return this.payments.get(paymentId);
  }
}
