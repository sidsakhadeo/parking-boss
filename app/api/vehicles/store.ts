import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface Vehicle {
  vehicle: string;
  notes: string;
  name: string;
  displayValue: string;
}

const VEHICLES_PATH = join(process.cwd(), "db", "vehicles.json");

export function readVehicles(): Record<string, Vehicle> {
  return JSON.parse(readFileSync(VEHICLES_PATH, "utf8")) as Record<
    string,
    Vehicle
  >;
}

export function writeVehicles(data: Record<string, Vehicle>): void {
  writeFileSync(VEHICLES_PATH, JSON.stringify(data, null, 2));
}

export function getDisplayValueByPlate(): Map<string, string> {
  return new Map(
    Object.values(readVehicles()).map((v) => [v.vehicle, v.displayValue]),
  );
}
