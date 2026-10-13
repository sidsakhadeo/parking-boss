import {
  afterEach,
  describe,
  expect,
  it,
  setSystemTime,
  spyOn,
} from "bun:test";
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

  it("shows the end time without repeating the date on the same day", () => {
    render(<CurrentReservation reservation={reservation} />);

    expect(screen.getByText(/7\/11, 9:00 AM/)).toHaveTextContent(
      "7/11, 9:00 AM to 5:00 PM",
    );
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
  describe("status label", () => {
    afterEach(() => {
      setSystemTime();
    });

    const labelAt = (time: string) => {
      setSystemTime(new Date(`2026-07-11T${time}`));
      render(<CurrentReservation reservation={reservation} />);
    };

    it("shows Active when the reservation is not close to ending", () => {
      labelAt("12:00:00");

      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.queryByText(/Expiring/)).not.toBeInTheDocument();
    });

    it("starts counting down 60 minutes before the end", () => {
      labelAt("16:00:00");

      const label = screen.getByText("Expiring in 60 min");
      expect(label).toHaveClass("text-danger");
    });

    it("rounds partial minutes up", () => {
      labelAt("16:55:40");

      expect(screen.getByText("Expiring in 5 min")).toBeInTheDocument();
    });

    it("never shows less than 1 minute", () => {
      labelAt("16:59:50");

      expect(screen.getByText("Expiring in 1 min")).toBeInTheDocument();
    });

    it("stays Active just outside the window", () => {
      labelAt("15:59:00");

      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("stays Active when the reservation has no end time", () => {
      setSystemTime(new Date("2026-07-11T16:59:00"));
      render(
        <CurrentReservation
          reservation={{
            ...reservation,
            valid: { min: reservation.valid.min },
          }}
        />,
      );

      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });
});
