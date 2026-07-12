import { describe, expect, it } from "bun:test";
import {
  buildVehicleEntry,
  capitalize,
  resolveKey,
} from "@/app/api/vehicles/vehicles.logic";

describe("capitalize", () => {
  it("capitalizes each word and lowercases the rest", () => {
    expect(capitalize("tEsLA moDEL 3")).toBe("Tesla Model 3");
  });

  it("handles a single word", () => {
    expect(capitalize("vismit")).toBe("Vismit");
  });
});

describe("buildVehicleEntry", () => {
  it("builds a base key and entry from vehicle, notes, and name", () => {
    const { baseKey, entry } = buildVehicleEntry(
      "abc123",
      "honda civic",
      "jane doe",
    );

    expect(baseKey).toBe("jane-honda-civic");
    expect(entry).toEqual({
      vehicle: "ABC123",
      notes: "Jane's Honda Civic",
      name: "Jane Doe",
      displayValue: "Jane's Honda Civic",
    });
  });
});

describe("resolveKey", () => {
  it("returns the base key when it's free", () => {
    expect(resolveKey("jane-honda-civic", {})).toBe("jane-honda-civic");
  });

  it("appends an incrementing counter on collision", () => {
    const existing = { "jane-honda-civic": {} };
    expect(resolveKey("jane-honda-civic", existing)).toBe("jane-honda-civic-1");
  });

  it("keeps incrementing until a free key is found", () => {
    const existing = {
      "jane-honda-civic": {},
      "jane-honda-civic-1": {},
      "jane-honda-civic-2": {},
    };
    expect(resolveKey("jane-honda-civic", existing)).toBe("jane-honda-civic-3");
  });
});
