import { describe, expect, it, spyOn } from "bun:test";
import Usage from "@/app/components/Usage";
import { render, screen, waitFor } from "@/test/utils/renderWithProviders";

describe("Usage", () => {
  it("shows a loading state before data arrives", () => {
    spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));

    render(<Usage />);

    expect(
      screen.getByRole("status", { name: "Loading usage" }),
    ).toBeInTheDocument();
  });

  it("renders usage data once loaded", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          weeklyLimit: "20",
          monthlyLimit: "80",
          weeklyUsage: "5",
          monthlyUsage: "12",
        }),
      ),
    );

    render(<Usage />);

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("This week").parentElement).toHaveTextContent(
      "This week5 / 20 hrs",
    );
  });

  it("renders an error message when the fetch fails", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    render(<Usage />);

    await waitFor(() => {
      expect(screen.getByText("Usage unavailable")).toBeInTheDocument();
    });
  });
});
