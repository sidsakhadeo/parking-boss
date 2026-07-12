import { describe, expect, it, spyOn } from "bun:test";
import userEvent from "@testing-library/user-event";
import CurrentReservations from "@/app/components/CurrentReservations";
import type { Reservation } from "@/app/utils/apiClient";
import { render, screen, waitFor } from "@/test/utils/renderWithProviders";

const grace = { min: { local: "2026-07-11T09:00:00" } };
const valid = { min: { local: "2026-07-11T09:00:00" } };

const reservations: Reservation[] = [
  {
    name: "Jane Doe",
    display: "ABC123",
    displayName: "Jane's Tesla",
    id: "res-1",
    grace,
    valid,
  },
  {
    name: "Bob Smith",
    display: "XYZ999",
    displayName: "Bob's Civic",
    id: "res-2",
    grace,
    valid,
  },
];

describe("CurrentReservations", () => {
  it("shows a loading state before data arrives", () => {
    spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));

    render(<CurrentReservations />);

    expect(screen.getByText("Loading reservations...")).toBeInTheDocument();
  });

  it("shows an empty state when there are no reservations", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ reservations: [], count: 0 })),
    );

    render(<CurrentReservations />);

    await waitFor(() => {
      expect(screen.getByText("No current reservations")).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: /Cancel All/ }),
    ).not.toBeInTheDocument();
  });

  it("renders each reservation and cancels all on demand", async () => {
    spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = input.toString();
      if (url.includes("/api/reservations")) {
        return new Response(JSON.stringify({ reservations, count: 2 }));
      }
      return new Response(JSON.stringify({ message: "ok" }));
    });
    const user = userEvent.setup();

    const { queryClient } = render(<CurrentReservations />);

    await waitFor(() => {
      expect(screen.getByText("Jane's Tesla")).toBeInTheDocument();
    });
    expect(screen.getByText("Bob's Civic")).toBeInTheDocument();

    const invalidateSpy = spyOn(queryClient, "invalidateQueries");
    await user.click(screen.getByRole("button", { name: /Cancel All/ }));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["reservations"],
      });
    });
  });
});
