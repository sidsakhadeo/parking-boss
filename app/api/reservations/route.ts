import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import z from "zod";
import type { Config } from "@/app/api/config/route";
import { makeFetch } from "@/app/utils/makeFetch";
import { getViewpoint } from "@/app/utils/viewpoint";
import { API_DOMAIN } from "../constants";

const CURENT_RESERVATIONS_TOKENS_URL = `https://${API_DOMAIN}/v1/accounts/auth/tokens`;
const VALID_PERMIT_TITLE = "Guest Parking";

export type Reservation = {
  name: string;
  display: string;
  displayName?: string;
  id: string;
  grace: {
    min: {
      local: string;
    };
    max: {
      local: string;
    };
  };
  valid: {
    min: {
      local: string;
    };
    max: {
      local: string;
    };
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

    const configResponse = await fetch("http://localhost:3000/api/config");
    if (!configResponse.ok) {
      throw new Error("Failed to fetch configuration");
    }
    const config: Config = await configResponse.json();

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

      // Find matching vehicle by license plate and add displayName
      const matchingVehicle = Object.values(localVehiclesData).find(
        (vehicle) => vehicle.vehicle === obj.display,
      );

      if (matchingVehicle) {
        obj.displayName = matchingVehicle.displayValue;
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
