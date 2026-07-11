import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import z from "zod";
import { getConfig } from "@/app/api/config/getConfig";
import { makeFetch } from "@/app/utils/makeFetch";
import { getViewpoint } from "@/app/utils/viewpoint";
import { API_DOMAIN } from "../constants";

const CURENT_RESERVATIONS_TOKENS_URL = `https://${API_DOMAIN}/v1/accounts/auth/tokens`;
const VALID_PERMIT_TITLE = "Guest Parking";

type Reservation = {
  name: string;
  display: string;
  displayName?: string;
  id: string;
  grace: {
    min: { local: string };
    max: { local: string };
  };
  valid: {
    min: { local: string };
    max?: { local: string };
  };
};

const reservationsSchema = z.object({
  permits: z.object({
    items: z.record(
      z.string(),
      z.object({
        title: z.string(),
        vehicle: z.string(),
        name: z.string(),
        id: z.string(),
        valid: z.object({
          min: z.object({ local: z.string() }),
          max: z.object({ local: z.string() }).optional(),
        }),
        grace: z.object({
          min: z.object({ local: z.string() }),
          max: z.object({ local: z.string() }).optional(),
        }),
      }),
    ),
  }),
  vehicles: z.object({
    items: z.record(
      z.string(),
      z.object({
        display: z.string(),
      }),
    ),
  }),
});

export async function GET() {
  try {
    const viewpoint = getViewpoint();

    const config = getConfig();

    const tokenUrl = new URL(CURENT_RESERVATIONS_TOKENS_URL);
    tokenUrl.searchParams.append("viewpoint", viewpoint);
    tokenUrl.searchParams.append("location", config.location);
    tokenUrl.searchParams.append("tenant", config.tenant);
    tokenUrl.searchParams.append("password", config.token);

    const { subject, token: authToken } = await makeFetch(
      tokenUrl,
      "POST",
      z.object({
        subject: z.string(),
        token: z.string(),
      }),
    );

    const currentReservationsURL = new URL(
      `https://${API_DOMAIN}/v1/locations/${config.location}/tenants/${subject}/permits`,
    );

    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    const valid = `${viewpoint}/${now.toISOString()}`;

    currentReservationsURL.searchParams.append("viewpoint", viewpoint);
    currentReservationsURL.searchParams.append("valid", valid);
    currentReservationsURL.searchParams.append(
      "Authorization",
      `bearer ${authToken}`,
    );

    const res = await makeFetch(
      currentReservationsURL,
      "GET",
      reservationsSchema,
    );

    const items = res.permits.items;
    const vehicles = res.vehicles.items;

    // Load local vehicles data for displayName lookup
    const vehiclesPath = join(process.cwd(), "db", "vehicles.json");
    const localVehiclesData = JSON.parse(
      readFileSync(vehiclesPath, "utf8"),
    ) as Record<
      string,
      {
        vehicle: string;
        notes: string;
        name: string;
        displayValue: string;
      }
    >;

    const displayValueByPlate = new Map(
      Object.values(localVehiclesData).map((v) => [v.vehicle, v.displayValue]),
    );

    const validPermitsKeys = Object.keys(items).filter(
      (key) => items[key]?.title === VALID_PERMIT_TITLE,
    );

    const result: Reservation[] = [];

    validPermitsKeys.forEach((key) => {
      const obj = Object.assign(
        {},
        { ...vehicles[items[key]?.vehicle] },
        { ...items[key] },
      ) as Reservation;

      const displayName = displayValueByPlate.get(obj.display);
      if (displayName) {
        obj.displayName = displayName;
      }

      result.push(obj);
    });

    return NextResponse.json({
      reservations: result,
      count: result.length,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
