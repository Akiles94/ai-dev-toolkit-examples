import { randomUUID } from "node:crypto";

export const newId = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`;

export const now = () => new Date().toISOString();

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export async function readJson(request: AsyncIterable<Buffer>): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
}
