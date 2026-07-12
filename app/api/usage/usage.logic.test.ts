import { describe, expect, it } from "bun:test";
import { getUsageLabel, parseLimits } from "@/app/api/usage/usage.logic";

describe("getUsageLabel", () => {
  it("extracts the label up to the first space for the matching limit id", () => {
    const usageItems = {
      "limit-1": { used: { entry: { display: "3 spots used" } } },
    };
    expect(
      getUsageLabel(usageItems, { id: "limit-1", display: "5 spots" }),
    ).toBe("3");
  });
});

describe("parseLimits", () => {
  it("splits limit items into weekly and monthly by their per field", () => {
    const limitItems = {
      a: { id: "a", display: "2 spots", per: "P1W" as const },
      b: { id: "b", display: "10 spots", per: "P1M" as const },
    };

    expect(parseLimits(limitItems)).toEqual({
      weeklyLimit: { id: "a", display: "2" },
      monthlyLimit: { id: "b", display: "10" },
    });
  });

  it("throws when a period has no matching limit item", () => {
    const limitItems = {
      a: { id: "a", display: "2 spots", per: "P1W" as const },
    };

    expect(() => parseLimits(limitItems)).toThrow();
  });
});
