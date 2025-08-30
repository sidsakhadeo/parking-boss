import type { z } from "zod";

export const makeFetch = async <T>(
  url: URL,
  method: "POST" | "GET",
  schema: z.Schema<T>,
  body?: string,
) => {
  const raw = await fetch(url, { method, body });
  const res = (await raw.json()) as T;
  const parsed = schema.parse(res);
  return parsed;
};

export const makePut = async (url: URL) => {
  await fetch(url, { method: "PUT" });
  return "OK";
};
