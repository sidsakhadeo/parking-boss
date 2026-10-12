import { beforeEach, describe, expect, it } from "bun:test";
import { DELETE, GET, POST } from "@/app/api/vehicles/route";
import { getMockVehicles, setMockVehicles } from "@/test/mocks/store";

const fixtureVehicles = {
  "vismit-tesla-m3": {
    vehicle: "8FBY787",
    notes: "Tesla Model 3",
    name: "Vismit Patel",
    displayValue: "Vismit's Model 3",
  },
  "tejas-tesla": {
    vehicle: "",
    notes: "Tesla",
    name: "Tejas",
    displayValue: "Tejas's Tesla",
  },
};

const jsonRequest = (body: unknown, method = "POST") =>
  new Request("http://localhost/api/vehicles", {
    method,
    body: JSON.stringify(body),
  });

describe("GET /api/vehicles", () => {
  beforeEach(() => {
    setMockVehicles(fixtureVehicles);
  });

  it("returns all vehicles with a count, including the empty-plate edge case", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(2);
    expect(body.vehicles["tejas-tesla"].vehicle).toBe("");
  });

  it("returns a 500 when the vehicle store cannot be read", async () => {
    setMockVehicles(undefined);

    const response = await GET();
    expect(response.status).toBe(500);
  });
});

describe("POST /api/vehicles", () => {
  beforeEach(() => {
    setMockVehicles(fixtureVehicles);
  });

  it("returns a 400 when required fields are missing", async () => {
    const response = await POST(jsonRequest({ vehicle: "ABC123", notes: "" }));

    expect(response.status).toBe(400);
  });

  it("capitalizes name/notes and writes back a new entry", async () => {
    const response = await POST(
      jsonRequest({
        vehicle: "abc123",
        notes: "honda civic",
        name: "jane doe",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.key).toBe("jane-honda-civic");
    expect(body.vehicle).toEqual({
      vehicle: "ABC123",
      notes: "Jane's Honda Civic",
      name: "Jane Doe",
      displayValue: "Jane's Honda Civic",
    });
    expect(getMockVehicles()?.["jane-honda-civic"]).toEqual(body.vehicle);
  });

  it("appends a counter suffix when the generated key already exists", async () => {
    setMockVehicles({
      "jane-honda-civic": {
        vehicle: "XYZ999",
        notes: "Jane's Honda Civic",
        name: "Jane Doe",
        displayValue: "Jane's Honda Civic",
      },
    });

    const response = await POST(
      jsonRequest({
        vehicle: "abc123",
        notes: "honda civic",
        name: "jane doe",
      }),
    );
    const body = await response.json();

    expect(body.key).toBe("jane-honda-civic-1");
  });
});

describe("DELETE /api/vehicles", () => {
  beforeEach(() => {
    setMockVehicles(fixtureVehicles);
  });

  it("returns a 400 when the key is missing", async () => {
    const response = await DELETE(jsonRequest({}, "DELETE"));

    expect(response.status).toBe(400);
  });

  it("returns a 404 when the vehicle does not exist", async () => {
    const response = await DELETE(
      jsonRequest({ key: "does-not-exist" }, "DELETE"),
    );

    expect(response.status).toBe(404);
  });

  it("removes the vehicle and writes back the store", async () => {
    const response = await DELETE(
      jsonRequest({ key: "vismit-tesla-m3" }, "DELETE"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(getMockVehicles()?.["vismit-tesla-m3"]).toBeUndefined();
    expect(getMockVehicles()?.["tejas-tesla"]).toBeDefined();
  });
});
