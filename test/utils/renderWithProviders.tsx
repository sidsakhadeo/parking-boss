import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  type RenderOptions,
  render as rtlRender,
} from "@testing-library/react";
import type { ReactElement } from "react";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
    },
  });

export const render = (ui: ReactElement, options?: RenderOptions) => {
  const queryClient = createTestQueryClient();
  return {
    queryClient,
    ...rtlRender(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
      options,
    ),
  };
};

export * from "@testing-library/react";
