import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

export interface Config {
  email: string;
  location: string;
  tenant: string;
  token: string;
  policy: string;
  space: string;
  duration: string;
  tel: string;
}

export async function GET() {
  try {
    const configPath = join(process.cwd(), "db", "config.json");
    const configData = JSON.parse(readFileSync(configPath, "utf8")) as Config;

    return NextResponse.json(configData);
  } catch (error) {
    console.error("Failed to read config data:", error);
    return NextResponse.json(
      { error: "Failed to load configuration data" },
      { status: 500 },
    );
  }
}
