import { describe, expect, it } from "@jest/globals";

import { anonymizeMeSchema } from "../../../src/validators/privacy.validator";

describe("Privacy Validator", () => {
  it("accepts an explicit anonymization confirmation", () => {
    const result = anonymizeMeSchema.safeParse({
      confirmAnonymization: true,
      reason: "Derecho al olvido",
    });

    expect(result.success).toBe(true);
  });

  it("rejects anonymization without confirmation", () => {
    const result = anonymizeMeSchema.safeParse({
      confirmAnonymization: false,
      reason: "Derecho al olvido",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("confirmar");
    }
  });
});