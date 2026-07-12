import { beforeEach, describe, expect, it } from "bun:test";
import { GET } from "@/app/api/config/route";
import { setMockConfig } from "@/test/mocks/store";

const fixtureConfig = {
  email: "test@example.com",
  location: "loc-1",
  tenant: "tenant-1",
  token: "token-1",
  policy: "policy-1",
  space: "space-1",
  duration: "P1D",
  tel: "555-0100",
};

describe("GET /api/config", () => {
  beforeEach(() => {
    setMockConfig(fixtureConfig);
  });

  it("returns the parsed config on success", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(fixtureConfig);
  });

  it("returns a 500 when getConfig throws", async () => {
    setMockConfig(undefined);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to load configuration data" });
  });
});
