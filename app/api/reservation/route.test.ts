import { beforeEach, describe, expect, it, spyOn } from "bun:test";
import { DELETE, POST } from "@/app/api/reservation/route";
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

const jsonRequest = (body: unknown) =>
  new Request("http://localhost/api/reservation", {
    method: "POST",
    body: JSON.stringify(body),
  });

describe("POST /api/reservation", () => {
  beforeEach(() => {
    setMockConfig(fixtureConfig);
  });

  it("creates a reservation against the external API", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));

    const response = await POST(
      jsonRequest({ vehicle: "ABC123", notes: "Tesla Model 3", name: "Jane" }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ message: "Reservation created successfully" });
  });

  it("passes an allowed duration through to the external API", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}"),
    );

    const response = await POST(
      jsonRequest({
        vehicle: "ABC123",
        notes: "Tesla Model 3",
        name: "Jane",
        duration: "PT2H",
      }),
    );

    expect(response.status).toBe(201);
    const calledUrl = new URL(String(fetchSpy.mock.calls[0][0]));
    expect(calledUrl.searchParams.get("duration")).toBe("PT2H");
  });

  it("uses the configured duration when none is provided", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}"),
    );

    await POST(
      jsonRequest({ vehicle: "ABC123", notes: "Tesla Model 3", name: "Jane" }),
    );

    const calledUrl = new URL(String(fetchSpy.mock.calls[0][0]));
    expect(calledUrl.searchParams.get("duration")).toBe("P1D");
  });

  it("rejects a duration that is not allowed", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}"),
    );

    const response = await POST(
      jsonRequest({
        vehicle: "ABC123",
        notes: "Tesla Model 3",
        name: "Jane",
        duration: "P30D",
      }),
    );

    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns a 500 when the external API call fails", async () => {
    spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

    const response = await POST(
      jsonRequest({ vehicle: "ABC123", notes: "Tesla Model 3", name: "Jane" }),
    );

    expect(response.status).toBe(500);
  });
});

describe("DELETE /api/reservation", () => {
  beforeEach(() => {
    setMockConfig(fixtureConfig);
  });

  it("cancels a reservation against the external API", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(new Response(null));

    const response = await DELETE(jsonRequest({ id: "res-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ message: "Reservation cancelled successfully" });
  });

  it("returns a 500 when the external API call fails", async () => {
    spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

    const response = await DELETE(jsonRequest({ id: "res-1" }));

    expect(response.status).toBe(500);
  });

  it("returns a 500 instead of reporting success when the upstream cancel fails", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 }),
    );

    const response = await DELETE(jsonRequest({ id: "res-1" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).not.toEqual({ message: "Reservation cancelled successfully" });
  });
});
