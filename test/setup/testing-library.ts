import { afterEach, mock } from "bun:test";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

afterEach(() => {
  cleanup();
  mock.restore();
});
