import request from "supertest";
import { describe, expect, it } from "@jest/globals";

import { app } from "../../src/app";

describe("GET /legal/privacy", () => {
  it("returns the legal privacy page", async () => {
    const response = await request(app).get("/legal/privacy");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("Política de tratamiento de datos personales");
    expect(response.text).toContain("Acepto términos y política de tratamiento de datos");
  });
});