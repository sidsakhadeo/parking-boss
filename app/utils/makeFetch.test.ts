import { describe, expect, it, spyOn } from "bun:test";
import { z } from "zod";
import { makeFetch, makePut } from "@/app/utils/makeFetch";

describe("makeFetch", () => {
  it("fetches, parses JSON, and validates against the schema", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ subject: "abc", token: "xyz" })),
    );

    const schema = z.object({ subject: z.string(), token: z.string() });
    const result = await makeFetch(
      new URL("https://example.com/token"),
      "POST",
      schema,
    );

    expect(result).toEqual({ subject: "abc", token: "xyz" });
  });

  it("throws when the response does not match the schema", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ unexpected: true })),
    );

    const schema = z.object({ subject: z.string() });

    await expect(
      makeFetch(new URL("https://example.com/token"), "GET", schema),
    ).rejects.toThrow();
  });
});

describe("makePut", () => {
  it("issues a PUT request and returns OK", async () => {
    const spy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null),
    );

    const result = await makePut(new URL("https://example.com/expires"));

    expect(result).toBe("OK");
    expect(spy).toHaveBeenCalledWith(new URL("https://example.com/expires"), {
      method: "PUT",
    });
  });

  it("throws when the response is not ok", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 }),
    );

    await expect(
      makePut(new URL("https://example.com/expires")),
    ).rejects.toThrow("failed with status 404");
  });
});
