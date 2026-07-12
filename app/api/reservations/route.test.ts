import { beforeEach, describe, expect, it, spyOn } from "bun:test";
import { GET } from "@/app/api/reservations/route";
import { setMockConfig, setMockVehicles } from "@/test/mocks/store";

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

const fixtureVehicles = {
  "jane-tesla": {
    vehicle: "ABC123",
    notes: "Jane's Tesla",
    name: "Jane Doe",
    displayValue: "Jane's Tesla",
  },
};

const validRange = { min: { local: "2026-07-11T00:00:00" } };

const permitsPayload = {
  permits: {
    items: {
      p1: {
        title: "Guest Parking",
        vehicle: "ABC123",
        name: "Jane Doe",
        id: "perm-1",
        valid: validRange,
        grace: validRange,
      },
      p2: {
        title: "Resident",
        vehicle: "XYZ999",
        name: "Bob Smith",
        id: "perm-2",
        valid: validRange,
        grace: validRange,
      },
    },
  },
  vehicles: {
    items: {
      ABC123: { display: "ABC123" },
      XYZ999: { display: "XYZ999" },
    },
  },
};

describe("GET /api/reservations", () => {
  beforeEach(() => {
    setMockConfig(fixtureConfig);
    setMockVehicles(fixtureVehicles);
  });

  it("filters to Guest Parking permits and attaches the local displayName", async () => {
    spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = input.toString();
      if (url.includes("/accounts/auth/tokens")) {
        return new Response(
          JSON.stringify({ subject: "subj-1", token: "auth-token" }),
        );
      }
      if (url.includes("/permits")) {
        return new Response(JSON.stringify(permitsPayload));
      }
      throw new Error(`Unexpected fetch to ${url}`);
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(1);
    expect(body.reservations[0]).toMatchObject({
      id: "perm-1",
      vehicle: "ABC123",
      displayName: "Jane's Tesla",
    });
  });

  it("returns a 500 when the external API call fails", async () => {
    spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});
