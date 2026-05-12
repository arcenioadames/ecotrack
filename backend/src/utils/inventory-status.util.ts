export type InventoryStatus = "OK" | "EXPIRING" | "EXPIRED";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toUtcStartOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_IN_MS);
}

export function isExpirationDateInPast(expirationDate: Date, referenceDate: Date = new Date()): boolean {
  const expirationDay = toUtcStartOfDay(expirationDate);
  const referenceDay = toUtcStartOfDay(referenceDate);
  return expirationDay < referenceDay;
}

export function getInventoryStatus(
  expirationDate: Date,
  expiringDays: number,
  referenceDate: Date = new Date(),
): InventoryStatus {
  const expirationDay = toUtcStartOfDay(expirationDate);
  const referenceDay = toUtcStartOfDay(referenceDate);

  if (expirationDay < referenceDay) {
    return "EXPIRED";
  }

  const thresholdDay = addUtcDays(referenceDay, expiringDays);
  if (expirationDay <= thresholdDay) {
    return "EXPIRING";
  }

  return "OK";
}

export default {
  getInventoryStatus,
  isExpirationDateInPast,
};
