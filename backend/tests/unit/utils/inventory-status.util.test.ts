import { describe, expect, it } from "@jest/globals";

import { getInventoryStatus, isExpirationDateInPast } from "../../../src/utils/inventory-status.util";

describe("inventory-status util", () => {
  const reference = new Date("2026-05-12T12:00:00.000Z");

  it("returns EXPIRED for past UTC day", () => {
    const expiration = new Date("2026-05-11T23:59:59.000Z");
    expect(getInventoryStatus(expiration, 3, reference)).toBe("EXPIRED");
  });

  it("returns EXPIRING for product inside threshold", () => {
    const expiration = new Date("2026-05-14T00:00:00.000Z");
    expect(getInventoryStatus(expiration, 3, reference)).toBe("EXPIRING");
  });

  it("returns OK for product outside threshold", () => {
    const expiration = new Date("2026-05-20T00:00:00.000Z");
    expect(getInventoryStatus(expiration, 3, reference)).toBe("OK");
  });

  it("detects past expiration day", () => {
    const expiration = new Date("2026-05-10T00:00:00.000Z");
    expect(isExpirationDateInPast(expiration, reference)).toBe(true);
  });
});
