import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { listAlerts, LOW_STOCK_THRESHOLD, recordLowStockAlert, resetAlerts } from "../src/alerts.ts";

beforeEach(resetAlerts);

test("R1: the threshold is 5", () => {
  assert.equal(LOW_STOCK_THRESHOLD, 5);
});

test("R9: most recent alert first, each with product, stock then, time", () => {
  recordLowStockAlert({ id: "p-2", name: "Refactoring" }, 4);
  recordLowStockAlert({ id: "p-9", name: "Zeta" }, 3);

  const alerts = listAlerts();
  assert.deepEqual(
    alerts.map((a) => [a.productId, a.productName, a.stock]),
    [
      ["p-9", "Zeta", 3],
      ["p-2", "Refactoring", 4],
    ],
  );
  assert.ok(!Number.isNaN(Date.parse(alerts[0].at)));
});

test("R9: an empty log gives an empty list", () => {
  assert.deepEqual(listAlerts(), []);
});
