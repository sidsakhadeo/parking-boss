import { describe, expect, it, mock, spyOn } from "bun:test";
import userEvent from "@testing-library/user-event";
import VehicleList from "@/app/components/VehicleList";
import { mockFetch } from "@/test/utils/mockFetch";
import { render, screen, waitFor } from "@/test/utils/renderWithProviders";

const fixtureVehicles = {
  "jane-tesla": {
    vehicle: "ABC123",
    notes: "Tesla Model 3",
    name: "Jane Doe",
    displayValue: "Jane's Model 3",
  },
  "bob-civic": {
    vehicle: "XYZ999",
    notes: "Honda Civic",
    name: "Bob Smith",
    displayValue: "Bob's Civic",
  },
};

const mockVehicles = (vehicles: object = fixtureVehicles) =>
  spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({ vehicles, count: Object.keys(vehicles).length }),
    ),
  );

describe("VehicleList", () => {
  it("shows a loading state before data arrives", () => {
    mockFetch(() => new Promise(() => {}));

    render(<VehicleList onAdd={() => {}} />);

    expect(
      screen.getByRole("status", { name: "Loading vehicles" }),
    ).toBeInTheDocument();
  });

  it("shows an error with a retry button when the fetch fails", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );
    const user = userEvent.setup();

    render(<VehicleList onAdd={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Couldn't load vehicles")).toBeInTheDocument();
    });

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ vehicles: fixtureVehicles, count: 2 })),
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
    });
  });

  it("renders vehicles once loaded", async () => {
    mockVehicles();

    render(<VehicleList onAdd={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
    });
    expect(screen.getByText("Bob's Civic")).toBeInTheDocument();
  });

  it("marks vehicles with an active reservation as Reserved", async () => {
    mockVehicles();

    render(
      <VehicleList onAdd={() => {}} reservedPlates={new Set(["ABC123"])} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Reserved")).toBeInTheDocument();
    });
    expect(screen.getAllByRole("button", { name: "Reserve" })).toHaveLength(1);
  });

  it("shows an empty state that opens the add flow when there are no vehicles", async () => {
    mockVehicles({});
    const onAdd = mock();
    const user = userEvent.setup();

    render(<VehicleList onAdd={onAdd} />);

    await waitFor(() => {
      expect(screen.getByText("No vehicles yet")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "Add vehicle" }));

    expect(onAdd).toHaveBeenCalled();
  });

  it("filters vehicles by search query", async () => {
    mockVehicles();
    const user = userEvent.setup();

    render(<VehicleList onAdd={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
    });

    await user.type(
      screen.getByRole("textbox", { name: "Search vehicles" }),
      "civic",
    );

    await waitFor(() => {
      expect(screen.queryByText("Jane's Model 3")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Bob's Civic")).toBeInTheDocument();
  });

  it("shows a no-results state that can be cleared", async () => {
    mockVehicles();
    const user = userEvent.setup();

    render(<VehicleList onAdd={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
    });

    await user.type(
      screen.getByRole("textbox", { name: "Search vehicles" }),
      "toyota",
    );

    expect(screen.getByText('No matches for "toyota"')).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
    expect(screen.getByText("Bob's Civic")).toBeInTheDocument();
  });

  describe("reserving", () => {
    const setup = () => {
      let resolveReservation: (() => void) | undefined;
      const reservationBodies: unknown[] = [];
      mockFetch(async (input, init) => {
        const url = input.toString();
        if (url.endsWith("/api/vehicles")) {
          return new Response(
            JSON.stringify({ vehicles: fixtureVehicles, count: 2 }),
          );
        }
        if (url.endsWith("/api/reservation")) {
          reservationBodies.push(JSON.parse(String(init?.body)));
          await new Promise<void>((resolve) => {
            resolveReservation = resolve;
          });
          return new Response(JSON.stringify({ success: true }));
        }
        throw new Error(`Unexpected fetch to ${url}`);
      });
      return { reservationBodies, resolve: () => resolveReservation?.() };
    };

    it("asks for a duration, defaulting to 4 hours", async () => {
      setup();
      const user = userEvent.setup();

      render(<VehicleList onAdd={() => {}} />);
      await waitFor(() => {
        expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole("button", { name: "Reserve" })[0]);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByLabelText("4 hours")).toBeChecked();
      expect(screen.getByLabelText("1 hour")).not.toBeChecked();
      expect(
        screen.getByRole("button", { name: "Reserve for 4 hours" }),
      ).toBeInTheDocument();
    });

    it("creates a reservation with the chosen duration and invalidates related queries", async () => {
      const { reservationBodies, resolve } = setup();
      const user = userEvent.setup();

      const { queryClient } = render(<VehicleList onAdd={() => {}} />);
      await waitFor(() => {
        expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
      });

      const invalidateSpy = spyOn(queryClient, "invalidateQueries");
      const reserveButtons = screen.getAllByRole("button", { name: "Reserve" });
      await user.click(reserveButtons[0]);
      await user.click(screen.getByLabelText("2 hours"));
      await user.click(
        screen.getByRole("button", { name: "Reserve for 2 hours" }),
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await waitFor(() => {
        expect(reserveButtons[0]).toHaveTextContent("Reserving");
      });
      expect(reserveButtons[1]).toHaveTextContent("Reserve");
      expect(reserveButtons[1]).not.toBeDisabled();
      expect(reservationBodies).toEqual([
        {
          vehicle: "ABC123",
          notes: "Tesla Model 3",
          name: "Jane Doe",
          duration: "PT2H",
        },
      ]);

      resolve();

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ["reservations"],
        });
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["usage"] });
    });

    it("does not reserve when the sheet is dismissed", async () => {
      const { reservationBodies } = setup();
      const user = userEvent.setup();

      render(<VehicleList onAdd={() => {}} />);
      await waitFor(() => {
        expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole("button", { name: "Reserve" })[0]);
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(reservationBodies).toEqual([]);
    });
  });
});
