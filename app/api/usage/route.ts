import { NextResponse } from "next/server";
import z from "zod";
import type { Config } from "@/app/api/config/route";
import { makeFetch } from "@/app/utils/makeFetch";
import { getUntilFirstSpace } from "@/app/utils/string";
import { getViewpoint } from "@/app/utils/viewpoint";

const CURENT_RESERVATIONS_TOKENS_URL =
  "https://api.parkingboss.com/v1/accounts/auth/tokens";
const limitItemSchema = z.object({
  display: z.string(),
  id: z.string(),
  per: z.enum(["P1W", "P1M"]),
});

const limitItemPartialSchema = limitItemSchema.partial({
  per: true,
});
const usageItemsSchema = z.record(
  z.string(),
  z.object({
    used: z.record(
      z.string(),
      z.object({
        display: z.string(),
      }),
    ),
  }),
);

const usageResponseSchema = z.object({
  limits: z.object({
    items: z.record(z.string(), limitItemSchema),
  }),
  usage: z.object({
    items: usageItemsSchema,
  }),
});

type LimitItemPartialSchema = z.infer<typeof limitItemPartialSchema>;
type UsageItems = z.infer<typeof usageItemsSchema>;

const getUsageLabel = (
  usageItems: UsageItems,
  limitObj: LimitItemPartialSchema,
): string => {
  const limitObjId = limitObj.id;
  const usageObj = usageItems[limitObjId]?.used;
  const key = Object.keys(usageObj)[0];
  const usage = usageObj[key]?.display;
  const result = getUntilFirstSpace(usage);
  return result;
};

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

    const checkUsageURL = new URL(
      `https://api.parkingboss.com/v1/locations/${config.location}/tenants/${subject}/permits/temporary/usage`,
    );

    checkUsageURL.searchParams.append("viewpoint", viewpoint);
    checkUsageURL.searchParams.append("sample", "PT24H");
    checkUsageURL.searchParams.append("Authorization", `bearer ${authToken}`);

    const usageRes = await makeFetch(checkUsageURL, "GET", usageResponseSchema);

    const limitItems = usageRes.limits.items;
    const usageItems = usageRes.usage.items;

    let weeklyLimit: LimitItemPartialSchema | undefined;
    let monthlyLimit: LimitItemPartialSchema | undefined;

    for (const limitItemKey in limitItems) {
      const limitItem = limitItems[limitItemKey];
      if (limitItem.per === "P1W") {
        weeklyLimit = {
          id: limitItem.id,
          display: getUntilFirstSpace(limitItem.display),
        };
      } else if (limitItem.per === "P1M") {
        monthlyLimit = {
          id: limitItem.id,
          display: getUntilFirstSpace(limitItem.display),
        };
      }
    }

    weeklyLimit = limitItemPartialSchema.parse(weeklyLimit);
    monthlyLimit = limitItemPartialSchema.parse(monthlyLimit);

    const weeklyUsage = getUsageLabel(usageItems, weeklyLimit);
    const monthlyUsage = getUsageLabel(usageItems, monthlyLimit);

    return NextResponse.json({
      weeklyLimit: weeklyLimit.display,
      monthlyLimit: monthlyLimit.display,
      weeklyUsage,
      monthlyUsage,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
