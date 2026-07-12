import { describe, expect, it } from "bun:test";
import { getUntilFirstSpace } from "@/app/utils/string";

describe("getUntilFirstSpace", () => {
  it("returns the substring before the first space", () => {
    expect(getUntilFirstSpace("hello world")).toBe("hello");
  });

  it("returns the whole string when there is no space", () => {
    expect(getUntilFirstSpace("hello")).toBe("hello");
  });

  it("returns an empty string when input starts with a space", () => {
    expect(getUntilFirstSpace(" hello")).toBe("");
  });

  it("handles an empty string", () => {
    expect(getUntilFirstSpace("")).toBe("");
  });
});
