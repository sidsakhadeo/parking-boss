import { describe, expect, it, spyOn } from "bun:test";
import userEvent from "@testing-library/user-event";
import HomeClient from "@/app/components/HomeClient";
import { mockFetch } from "@/test/utils/mockFetch";
import { render, screen, waitFor } from "@/test/utils/renderWithProviders";

describe("HomeClient", () => {
  it("renders the page header", () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    render(<HomeClient />);

    expect(screen.getByText("Parking Boss")).toBeInTheDocument();
  });

  it("opens the add vehicle form from the header", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    const user = userEvent.setup();

    render(<HomeClient />);
    await user.click(screen.getByRole("button", { name: "Add new vehicle" }));

    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: "Add vehicle" }),
      ).toBeInTheDocument();
    });
  });

  it("marks vehicles that have an active reservation", async () => {
    mockFetch(async (input) => {
      const url = input.toString();
      if (url.endsWith("/api/vehicles")) {
        return new Response(
          JSON.stringify({
            vehicles: {
              jane: {
                vehicle: "ABC123",
                notes: "Tesla Model 3",
                name: "Jane Doe",
                displayValue: "Jane's Model 3",
              },
            },
            count: 1,
          }),
        );
      }
      if (url.endsWith("/api/reservations")) {
        return new Response(
          JSON.stringify({
            reservations: [
              {
                name: "Jane Doe",
                display: "ABC123",
                id: "res-1",
                grace: { min: { local: "2026-07-11T09:00:00" } },
                valid: { min: { local: "2026-07-11T09:00:00" } },
              },
            ],
            count: 1,
          }),
        );
      }
      return new Response(JSON.stringify({}));
    });

    render(<HomeClient />);

    await waitFor(() => {
      expect(screen.getByText("Reserved")).toBeInTheDocument();
    });
  });
});
