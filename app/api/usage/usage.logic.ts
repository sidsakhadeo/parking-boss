import z from "zod";
import { getUntilFirstSpace } from "@/app/utils/string";

export const limitItemSchema = z.object({
  display: z.string(),
  id: z.string(),
  per: z.enum(["P1W", "P1M"]),
});

export const limitItemPartialSchema = limitItemSchema.partial({ per: true });

export const usageItemsSchema = z.record(
  z.string(),
  z.object({
    used: z.record(z.string(), z.object({ display: z.string() })),
  }),
);

export const usageResponseSchema = z.object({
  limits: z.object({ items: z.record(z.string(), limitItemSchema) }),
  usage: z.object({ items: usageItemsSchema }),
});

export type LimitItem = z.infer<typeof limitItemPartialSchema>;
export type UsageItems = z.infer<typeof usageItemsSchema>;

export function getUsageLabel(
  usageItems: UsageItems,
  limitObj: LimitItem,
): string {
  const usageObj = usageItems[limitObj.id]?.used;
  const key = Object.keys(usageObj)[0];
  return getUntilFirstSpace(usageObj[key]?.display);
}

export function parseLimits(
  limitItems: z.infer<typeof usageResponseSchema>["limits"]["items"],
): { weeklyLimit: LimitItem; monthlyLimit: LimitItem } {
  let weeklyLimit: LimitItem | undefined;
  let monthlyLimit: LimitItem | undefined;

  for (const key in limitItems) {
    const item = limitItems[key];
    if (item.per === "P1W") {
      weeklyLimit = { id: item.id, display: getUntilFirstSpace(item.display) };
    } else if (item.per === "P1M") {
      monthlyLimit = { id: item.id, display: getUntilFirstSpace(item.display) };
    }
  }

  return {
    weeklyLimit: limitItemPartialSchema.parse(weeklyLimit),
    monthlyLimit: limitItemPartialSchema.parse(monthlyLimit),
  };
}
