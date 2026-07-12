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
  const response = await fetch(url, { method: "PUT" });
  if (!response.ok) {
    throw new Error(`PUT ${url} failed with status ${response.status}`);
  }
  return "OK";
};
