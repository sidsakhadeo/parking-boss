import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

export interface Vehicle {
  vehicle: string;
  notes: string;
  name: string;
  displayValue: string;
}

export async function GET() {
  try {
    const vehiclesPath = join(process.cwd(), "db", "vehicles.json");
    const vehiclesData = JSON.parse(
      readFileSync(vehiclesPath, "utf8"),
    ) as Record<string, Vehicle>;

    return NextResponse.json({
      vehicles: vehiclesData,
      count: Object.keys(vehiclesData).length,
    });
  } catch (error) {
    console.error("Failed to read vehicles data:", error);
    return NextResponse.json(
      { error: "Failed to load vehicles data" },
      { status: 500 },
    );
  }
}
