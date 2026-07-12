import { describe, expect, it, spyOn } from "bun:test";
import HomeClient from "@/app/components/HomeClient";
import { render, screen } from "@/test/utils/renderWithProviders";

describe("HomeClient", () => {
  it("renders the page header", () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    render(<HomeClient />);

    expect(screen.getByText("Parking Boss")).toBeInTheDocument();
  });
});
