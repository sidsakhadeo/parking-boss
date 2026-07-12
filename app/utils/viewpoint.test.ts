import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  setSystemTime,
} from "bun:test";
import { getViewpoint } from "@/app/utils/viewpoint";

describe("getViewpoint", () => {
  beforeEach(() => {
    setSystemTime(new Date("2026-07-11T12:34:56.789Z"));
  });

  afterEach(() => {
    setSystemTime();
  });

  it("returns a local ISO timestamp with a UTC offset suffix", () => {
    expect(getViewpoint()).toBe("2026-07-11T12:34:56.789+00:00");
  });
});
