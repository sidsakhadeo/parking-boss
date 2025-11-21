import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import type { Config } from "@/app/api/config/route";
import { makeFetch, makePut } from "@/app/utils/makeFetch";
import { getViewpoint } from "@/app/utils/viewpoint";
import { API_DOMAIN } from "../constants";

const RESERVE_URL = `https://${API_DOMAIN}/v1/permits/temporary`;

export async function POST(request: NextRequest) {
  try {
    const viewpoint = getViewpoint();
    const body = await request.json();
    const { vehicle, notes, name } = body;

    const configResponse = await fetch("http://localhost:3000/api/config");
    if (!configResponse.ok) {
      throw new Error("Failed to fetch configuration");
    }
    const config: Config = await configResponse.json();

    const reserveUrl = new URL(RESERVE_URL);
    reserveUrl.searchParams.append("viewpoint", viewpoint);
    reserveUrl.searchParams.append("location", config.location);
    reserveUrl.searchParams.append("policy", config.policy);
    reserveUrl.searchParams.append("tenant", config.tenant);
    reserveUrl.searchParams.append("token", config.token);
    reserveUrl.searchParams.append("vehicle", vehicle);
    reserveUrl.searchParams.append("space", config.space);
    reserveUrl.searchParams.append("duration", config.duration);
    reserveUrl.searchParams.append("notes", notes);
    reserveUrl.searchParams.append("name", name);
    reserveUrl.searchParams.append("email", config.email);
    reserveUrl.searchParams.append("tel", config.tel);

    await makeFetch(reserveUrl, "POST", z.object());

    return NextResponse.json(
      { message: "Reservation created successfully" },
      { status: 201 },
    );
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const viewpoint = getViewpoint();
    const body = await request.json();
    const { id } = body;

    const configResponse = await fetch("http://localhost:3000/api/config");
    if (!configResponse.ok) {
      throw new Error("Failed to fetch configuration");
    }
    const config: Config = await configResponse.json();

    const expiryURL = new URL(`https://${API_DOMAIN}/v1/permits/${id}/expires`);

    expiryURL.searchParams.append("viewpoint", viewpoint);
    expiryURL.searchParams.append("permit", id);
    expiryURL.searchParams.append("to", config.email);

    await makePut(expiryURL);

    return NextResponse.json(
      { message: "Reservation cancelled successfully" },
      { status: 200 },
    );
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
