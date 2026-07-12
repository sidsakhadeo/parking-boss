import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface Vehicle {
  vehicle: string;
  notes: string;
  name: string;
  displayValue: string;
}

const VEHICLES_PATH = join(process.cwd(), "db", "vehicles.json");

export async function readVehicles(): Promise<Record<string, Vehicle>> {
  return JSON.parse(await readFile(VEHICLES_PATH, "utf8")) as Record<
    string,
    Vehicle
  >;
}

export async function writeVehicles(
  data: Record<string, Vehicle>,
): Promise<void> {
  await writeFile(VEHICLES_PATH, JSON.stringify(data, null, 2));
}

export async function getDisplayValueByPlate(): Promise<Map<string, string>> {
  return new Map(
    Object.values(await readVehicles()).map((v) => [v.vehicle, v.displayValue]),
  );
}
