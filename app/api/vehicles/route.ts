import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";

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

// Capitalize each word in a string
const capitalize = (str: string) =>
  str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicle, notes: rawNotes, name: rawName } = body;

    if (!vehicle || !rawNotes || !rawName) {
      return NextResponse.json(
        { error: "Missing required fields: vehicle, notes, name" },
        { status: 400 },
      );
    }

    // Capitalize make & model and owner name
    const makeModel = capitalize(rawNotes);
    const name = capitalize(rawName);
    const firstName = name.split(" ")[0];

    // Combine owner's first name with make & model for notes field
    const notes = `${firstName}'s ${makeModel}`;

    const vehiclesPath = join(process.cwd(), "db", "vehicles.json");
    const vehiclesData = JSON.parse(
      readFileSync(vehiclesPath, "utf8"),
    ) as Record<string, Vehicle>;

    // Generate a key from owner name and make/model
    const key = `${firstName.toLowerCase()}-${makeModel.toLowerCase().replace(/\s+/g, "-")}`;

    // Check if key already exists, append number if so
    let finalKey = key;
    let counter = 1;
    while (vehiclesData[finalKey]) {
      finalKey = `${key}-${counter}`;
      counter++;
    }

    // Create displayValue from owner's first name and make/model
    const displayValue = `${firstName}'s ${makeModel}`;

    vehiclesData[finalKey] = {
      vehicle: vehicle.toUpperCase(),
      notes,
      name,
      displayValue,
    };

    writeFileSync(vehiclesPath, JSON.stringify(vehiclesData, null, 2));

    return NextResponse.json({
      success: true,
      key: finalKey,
      vehicle: vehiclesData[finalKey],
    });
  } catch (error) {
    console.error("Failed to add vehicle:", error);
    return NextResponse.json(
      { error: "Failed to add vehicle" },
      { status: 500 },
    );
  }
}
