import request from "supertest";
import { describe, it, expect } from "@jest/globals";

process.env.REQUIRE_HTTPS = "1";

import { app } from "../../src/app";

describe("HTTPS hardening", () => {
  it("returns 426 when HTTP is used in enforce mode", async () => {
    const response = await request(app)
      .get("/health")
      .set("x-forwarded-proto", "http");

    expect(response.status).toBe(426);
    expect(response.body.message).toBe("HTTPS requerido");
  });
});
