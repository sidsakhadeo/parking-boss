import { NextResponse } from "next/server";
import z from "zod";
import { getConfig } from "@/app/api/config/getConfig";
import { makeFetch } from "@/app/utils/makeFetch";
import { getViewpoint } from "@/app/utils/viewpoint";
import { API_DOMAIN } from "../constants";
import { getUsageLabel, parseLimits, usageResponseSchema } from "./usage.logic";

const TOKENS_URL = `https://${API_DOMAIN}/v1/accounts/auth/tokens`;

export async function GET() {
  try {
    const viewpoint = getViewpoint();
    const config = getConfig();

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

    const usageUrl = new URL(
      `https://${API_DOMAIN}/v1/locations/${config.location}/tenants/${subject}/permits/temporary/usage`,
    );
    usageUrl.searchParams.append("viewpoint", viewpoint);
    usageUrl.searchParams.append("sample", "PT24H");
    usageUrl.searchParams.append("Authorization", `bearer ${authToken}`);

    const usageRes = await makeFetch(usageUrl, "GET", usageResponseSchema);

    const { weeklyLimit, monthlyLimit } = parseLimits(usageRes.limits.items);

    return NextResponse.json({
      weeklyLimit: weeklyLimit.display,
      monthlyLimit: monthlyLimit.display,
      weeklyUsage: getUsageLabel(usageRes.usage.items, weeklyLimit),
      monthlyUsage: getUsageLabel(usageRes.usage.items, monthlyLimit),
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
