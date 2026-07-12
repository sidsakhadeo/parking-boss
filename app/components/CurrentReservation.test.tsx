import { describe, expect, it, spyOn } from "bun:test";
import userEvent from "@testing-library/user-event";
import CurrentReservation from "@/app/components/CurrentReservation";
import type { Reservation } from "@/app/utils/apiClient";
import { render, screen, waitFor } from "@/test/utils/renderWithProviders";

const reservation: Reservation = {
  name: "Jane Doe",
  display: "ABC123",
  displayName: "Jane's Tesla",
  id: "res-1",
  grace: {
    min: { local: "2026-07-11T09:00:00" },
    max: { local: "2026-07-11T09:15:00" },
  },
  valid: {
    min: { local: "2026-07-11T09:00:00" },
    max: { local: "2026-07-11T17:00:00" },
  },
};

describe("CurrentReservation", () => {
  it("renders reservation details", () => {
    render(<CurrentReservation reservation={reservation} />);

    expect(screen.getByText("Jane's Tesla")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
  });

  it("cancels the reservation and invalidates related queries", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "ok" })),
    );
    const user = userEvent.setup();

    const { queryClient } = render(
      <CurrentReservation reservation={reservation} />,
    );
    const invalidateSpy = spyOn(queryClient, "invalidateQueries");

    await user.click(screen.getByRole("button", { name: /Cancel/ }));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["reservations"],
      });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["usage"] });
  });
});
