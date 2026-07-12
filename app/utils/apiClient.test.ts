import { describe, expect, it, spyOn } from "bun:test";
import {
  addVehicle,
  cancelReservation,
  createReservation,
  fetchReservations,
  fetchUsage,
  fetchVehicles,
} from "@/app/utils/apiClient";

describe("fetchVehicles", () => {
  it("GETs /api/vehicles and returns the parsed body", async () => {
    const body = { vehicles: {}, count: 0 };
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(body)),
    );

    await expect(fetchVehicles()).resolves.toEqual(body);
  });
});

describe("addVehicle", () => {
  it("POSTs /api/vehicles with the vehicle payload and returns the created entry", async () => {
    const responseBody = {
      success: true,
      key: "jane-tesla",
      vehicle: {
        vehicle: "ABC123",
        notes: "Jane's Tesla",
        name: "Jane",
        displayValue: "Jane's Tesla",
      },
    };
    const spy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responseBody)),
    );

    await expect(
      addVehicle({ vehicle: "ABC123", notes: "Tesla", name: "Jane" }),
    ).resolves.toEqual(responseBody);

    expect(spy).toHaveBeenCalledWith("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle: "ABC123",
        notes: "Tesla",
        name: "Jane",
      }),
    });
  });

  it("throws the server-provided error message on failure", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Plate already exists" }), {
        status: 400,
      }),
    );

    await expect(
      addVehicle({ vehicle: "ABC123", notes: "Tesla", name: "Jane" }),
    ).rejects.toThrow("Plate already exists");
  });
});

describe("fetchReservations", () => {
  it("GETs /api/reservations and returns the parsed body", async () => {
    const body = { reservations: [], count: 0 };
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(body)),
    );

    await expect(fetchReservations()).resolves.toEqual(body);
  });
});

describe("createReservation", () => {
  it("POSTs /api/reservation with the reservation payload", async () => {
    const spy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "ok" })),
    );

    await createReservation({
      vehicle: "ABC123",
      notes: "Tesla",
      name: "Jane",
    });

    expect(spy).toHaveBeenCalledWith("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle: "ABC123",
        notes: "Tesla",
        name: "Jane",
      }),
    });
  });
});

describe("cancelReservation", () => {
  it("DELETEs /api/reservation with the given id", async () => {
    const spy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "ok" }), { status: 200 }),
    );

    await cancelReservation("res-1");

    expect(spy).toHaveBeenCalledWith("/api/reservation", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "res-1" }),
    });
  });

  it("throws the server-provided error message on failure", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Reservation not found" }), {
        status: 404,
      }),
    );

    await expect(cancelReservation("missing")).rejects.toThrow(
      "Reservation not found",
    );
  });

  it("falls back to a default error message when none is provided", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 500 }),
    );

    await expect(cancelReservation("res-1")).rejects.toThrow("Request failed");
  });
});

describe("fetchUsage", () => {
  it("GETs /api/usage and returns the parsed body", async () => {
    const body = {
      weeklyLimit: "20",
      monthlyLimit: "80",
      weeklyUsage: "5",
      monthlyUsage: "12",
    };
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(body)),
    );

    await expect(fetchUsage()).resolves.toEqual(body);
  });
});
