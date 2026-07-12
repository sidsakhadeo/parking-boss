import { NextResponse } from "next/server";
import z from "zod";
import { getConfig } from "@/app/api/config/getConfig";
import { makeFetch } from "@/app/utils/makeFetch";
import { getViewpoint } from "@/app/utils/viewpoint";
import { API_DOMAIN } from "../constants";
import { getDisplayValueByPlate } from "../vehicles/store";
import { buildReservations, reservationsSchema } from "./reservations.logic";

const TOKENS_URL = `https://${API_DOMAIN}/v1/accounts/auth/tokens`;

export async function GET() {
  try {
    const viewpoint = getViewpoint();
    const config = getConfig();

    // Independent of the auth/permits calls below, so start it now and
    // await it only once we're ready to merge in local vehicle data.
    const displayValueByPlatePromise = getDisplayValueByPlate();

    const tokenUrl = new URL(TOKENS_URL);
    tokenUrl.searchParams.append("viewpoint", viewpoint);
    tokenUrl.searchParams.append("location", config.location);
    tokenUrl.searchParams.append("tenant", config.tenant);
    tokenUrl.searchParams.append("password", config.token);

    const { subject, token: authToken } = await makeFetch(
      tokenUrl,
      "POST",
      z.object({ subject: z.string(), token: z.string() }),
    );

    const reservationsUrl = new URL(
      `https://${API_DOMAIN}/v1/locations/${config.location}/tenants/${subject}/permits`,
    );

    const now = new Date();
    now.setMonth(now.getMonth() + 1);

    reservationsUrl.searchParams.append("viewpoint", viewpoint);
    reservationsUrl.searchParams.append(
      "valid",
      `${viewpoint}/${now.toISOString()}`,
    );
    reservationsUrl.searchParams.append("Authorization", `bearer ${authToken}`);

    const res = await makeFetch(reservationsUrl, "GET", reservationsSchema);

    const reservations = buildReservations(
      res.permits.items,
      res.vehicles.items,
      await displayValueByPlatePromise,
    );

    return NextResponse.json({ reservations, count: reservations.length });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
