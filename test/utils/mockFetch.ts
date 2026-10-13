import { spyOn } from "bun:test";

type FetchArgs = Parameters<typeof fetch>;

// `typeof fetch` also requires Bun's `preconnect`, which test doubles don't need.
export const mockFetch = (
  impl: (input: FetchArgs[0], init?: FetchArgs[1]) => Promise<Response>,
) =>
  spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(impl, { preconnect: () => {} }),
  );
