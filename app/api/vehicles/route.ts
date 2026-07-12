import { type NextRequest, NextResponse } from "next/server";
import { readVehicles, writeVehicles } from "./store";
import { buildVehicleEntry, resolveKey } from "./vehicles.logic";

export async function GET() {
  try {
    const vehiclesData = await readVehicles();
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

    const vehiclesData = await readVehicles();
    const { baseKey, entry } = buildVehicleEntry(vehicle, rawNotes, rawName);
    const finalKey = resolveKey(baseKey, vehiclesData);

    vehiclesData[finalKey] = entry;
    await writeVehicles(vehiclesData);

    return NextResponse.json({ success: true, key: finalKey, vehicle: entry });
  } catch (error) {
    console.error("Failed to add vehicle:", error);
    return NextResponse.json(
      { error: "Failed to add vehicle" },
      { status: 500 },
    );
  }
}
