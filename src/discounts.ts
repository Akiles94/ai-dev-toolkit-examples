export interface DiscountCode {
  code: string;
  kind: "percent" | "fixed";
  /** Percent (0–100) for `percent`, cents for `fixed`. */
  value: number;
  /** Last day the code is valid, `YYYY-MM-DD`, UTC. */
  expiresOn: string;
}

const codes: Record<string, DiscountCode> = {
  WELCOME10: { code: "WELCOME10", kind: "percent", value: 10, expiresOn: "2027-12-31" },
  FIVEOFF: { code: "FIVEOFF", kind: "fixed", value: 500, expiresOn: "2027-12-31" },
  BIGSAVER: { code: "BIGSAVER", kind: "fixed", value: 3000, expiresOn: "2027-12-31" },
  SUMMER25: { code: "SUMMER25", kind: "percent", value: 25, expiresOn: "2026-09-01" },
};

export type CodeError = "UNKNOWN_CODE" | "EXPIRED_CODE";

/** Looks a code up, case-insensitively, and checks it has not expired. */
export function findCode(code: string, today = new Date()): DiscountCode | CodeError {
  const found = codes[code.toUpperCase()];
  if (!found) return "UNKNOWN_CODE";
  if (found.expiresOn < today.toISOString()) return "EXPIRED_CODE";
  return found;
}

/** How much the code takes off the subtotal. */
export function discountCents(code: DiscountCode, subtotalCents: number): number {
  if (code.kind === "percent") return Math.round((subtotalCents * code.value) / 100);
  return code.value;
}
