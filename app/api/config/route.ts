import { NextResponse } from "next/server";
import { getConfig } from "./getConfig";

export type { Config } from "./getConfig";

export async function GET() {
  try {
    const configData = getConfig();
    return NextResponse.json(configData);
  } catch (error) {
    console.error("Failed to read config data:", error);
    return NextResponse.json(
      { error: "Failed to load configuration data" },
      { status: 500 },
    );
  }
}
