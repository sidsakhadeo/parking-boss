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

    expect(
      screen.getByRole("status", { name: "Loading reservations" }),
    ).toBeInTheDocument();
  });

  it("shows an error with a retry button when the fetch fails", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );
    const user = userEvent.setup();

    render(<CurrentReservations />);

    await waitFor(() => {
      expect(
        screen.getByText("Couldn't load reservations"),
      ).toBeInTheDocument();
    });

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ reservations: [], count: 0 })),
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(
        screen.getByText("Nothing reserved right now"),
      ).toBeInTheDocument();
    });
  });

  it("shows an empty state when there are no reservations", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ reservations: [], count: 0 })),
    );

    render(<CurrentReservations />);

    await waitFor(() => {
      expect(
        screen.getByText("Nothing reserved right now"),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: "Cancel all" }),
    ).not.toBeInTheDocument();
  });

  describe("cancel all", () => {
    const setup = () => {
      spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = input.toString();
        if (url.endsWith("/api/reservations")) {
          return new Response(JSON.stringify({ reservations, count: 2 }));
        }
        return new Response(JSON.stringify({ message: "ok" }));
      });
      return userEvent.setup();
    };

    it("renders each reservation", async () => {
      setup();

      render(<CurrentReservations />);

      await waitFor(() => {
        expect(screen.getByText("Jane's Tesla")).toBeInTheDocument();
      });
      expect(screen.getByText("Bob's Civic")).toBeInTheDocument();
    });

    it("asks for confirmation before cancelling", async () => {
      const user = setup();

      const { queryClient } = render(<CurrentReservations />);
      await waitFor(() => {
        expect(screen.getByText("Jane's Tesla")).toBeInTheDocument();
      });

      const invalidateSpy = spyOn(queryClient, "invalidateQueries");
      await user.click(screen.getByRole("button", { name: "Cancel all" }));

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(
        screen.getByText("These 2 spots will be released right away."),
      ).toBeInTheDocument();
      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("keeps the reservations when the confirmation is dismissed", async () => {
      const user = setup();

      const { queryClient } = render(<CurrentReservations />);
      await waitFor(() => {
        expect(screen.getByText("Jane's Tesla")).toBeInTheDocument();
      });

      const invalidateSpy = spyOn(queryClient, "invalidateQueries");
      await user.click(screen.getByRole("button", { name: "Cancel all" }));
      await user.click(screen.getByRole("button", { name: "Keep them" }));

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("cancels every reservation once confirmed", async () => {
      const user = setup();

      const { queryClient } = render(<CurrentReservations />);
      await waitFor(() => {
        expect(screen.getByText("Jane's Tesla")).toBeInTheDocument();
      });

      const invalidateSpy = spyOn(queryClient, "invalidateQueries");
      await user.click(screen.getByRole("button", { name: "Cancel all" }));
      await user.click(
        screen.getByRole("button", { name: "Cancel 2 reservations" }),
      );

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ["reservations"],
        });
      });
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });
});
