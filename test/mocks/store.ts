import { mock } from "bun:test";
import type { Config } from "@/app/api/config/getConfig";
import type { Vehicle } from "@/app/api/vehicles/store";

let vehicles: Record<string, Vehicle> | undefined = {};
let config: Config | undefined;

export const setMockVehicles = (next: Record<string, Vehicle> | undefined) => {
  vehicles = next;
};

export const getMockVehicles = () => vehicles;

export const setMockConfig = (next: Config | undefined) => {
  config = next;
};

mock.module("@/app/api/vehicles/store", () => ({
  readVehicles: async () => {
    if (!vehicles) {
      throw new Error("no mock vehicles set — call setMockVehicles()");
    }
    return vehicles;
  },
  writeVehicles: async (data: Record<string, Vehicle>) => {
    vehicles = data;
  },
  getDisplayValueByPlate: async () =>
    new Map(
      Object.values(vehicles ?? {}).map((v) => [v.vehicle, v.displayValue]),
    ),
}));

mock.module("@/app/api/config/getConfig", () => ({
  getConfig: () => {
    if (!config) {
      throw new Error("no mock config set — call setMockConfig()");
    }
    return config;
  },
}));
