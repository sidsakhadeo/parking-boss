import type { Vehicle } from "./store";

export function capitalize(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function buildVehicleEntry(
  vehicle: string,
  rawNotes: string,
  rawName: string,
): { baseKey: string; entry: Vehicle } {
  const makeModel = capitalize(rawNotes);
  const name = capitalize(rawName);
  const firstName = name.split(" ")[0];
  const label = `${firstName}'s ${makeModel}`;
  const baseKey = `${firstName.toLowerCase()}-${makeModel.toLowerCase().replace(/\s+/g, "-")}`;

  return {
    baseKey,
    entry: {
      vehicle: vehicle.toUpperCase(),
      notes: label,
      name,
      displayValue: label,
    },
  };
}

export function resolveKey(
  baseKey: string,
  existing: Record<string, unknown>,
): string {
  if (!existing[baseKey]) return baseKey;
  let counter = 1;
  while (existing[`${baseKey}-${counter}`]) counter++;
  return `${baseKey}-${counter}`;
}
