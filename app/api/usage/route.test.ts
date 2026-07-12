import { beforeEach, describe, expect, it, spyOn } from "bun:test";
import { GET } from "@/app/api/usage/route";
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

const usagePayload = {
  limits: {
    items: {
      w1: { id: "limit-week", display: "20 spots week", per: "P1W" },
      m1: { id: "limit-month", display: "80 spots month", per: "P1M" },
    },
  },
  usage: {
    items: {
      "limit-week": { used: { e1: { display: "5 used" } } },
      "limit-month": { used: { e1: { display: "12 used" } } },
    },
  },
};

describe("GET /api/usage", () => {
  beforeEach(() => {
    setMockConfig(fixtureConfig);
  });

  it("chains the auth-token and usage calls and buckets weekly/monthly limits", async () => {
    spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = input.toString();
      if (url.includes("/accounts/auth/tokens")) {
        return new Response(
          JSON.stringify({ subject: "subj-1", token: "auth-token" }),
        );
      }
      if (url.includes("/permits/temporary/usage")) {
        return new Response(JSON.stringify(usagePayload));
      }
      throw new Error(`Unexpected fetch to ${url}`);
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      weeklyLimit: "20",
      monthlyLimit: "80",
      weeklyUsage: "5",
      monthlyUsage: "12",
    });
  });

  it("returns a 500 when the external API call fails", async () => {
    spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});
