import { describe, expect, it, spyOn } from "bun:test";
import userEvent from "@testing-library/user-event";
import VehicleList from "@/app/components/VehicleList";
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

describe("VehicleList", () => {
  it("shows a loading state before data arrives", () => {
    spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));

    render(<VehicleList />);

    expect(screen.getByText("Loading vehicles...")).toBeInTheDocument();
  });

  it("renders vehicles once loaded", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ vehicles: fixtureVehicles, count: 2 })),
    );

    render(<VehicleList />);

    await waitFor(() => {
      expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
    });
    expect(screen.getByText("Bob's Civic")).toBeInTheDocument();
    expect(screen.getByText("Total vehicles: 2")).toBeInTheDocument();
  });

  it("filters vehicles by search query", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ vehicles: fixtureVehicles, count: 2 })),
    );
    const user = userEvent.setup();

    render(<VehicleList />);

    await waitFor(() => {
      expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Search vehicles..."), "civic");

    await waitFor(() => {
      expect(screen.queryByText("Jane's Model 3")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Bob's Civic")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 2 vehicles")).toBeInTheDocument();
  });

  it("creates a reservation and invalidates related queries on Reserve", async () => {
    let resolveReservation: (() => void) | undefined;
    spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = input.toString();
      if (url.includes("/api/vehicles")) {
        return new Response(
          JSON.stringify({ vehicles: fixtureVehicles, count: 2 }),
        );
      }
      if (url.includes("/api/reservation")) {
        await new Promise<void>((resolve) => {
          resolveReservation = resolve;
        });
        return new Response(JSON.stringify({ success: true }));
      }
      throw new Error(`Unexpected fetch to ${url}`);
    });
    const user = userEvent.setup();

    const { queryClient } = render(<VehicleList />);

    await waitFor(() => {
      expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
    });

    const invalidateSpy = spyOn(queryClient, "invalidateQueries");
    const reserveButtons = screen.getAllByRole("button", { name: "Reserve" });
    await user.click(reserveButtons[0]);

    await waitFor(() => {
      expect(reserveButtons[0]).toHaveTextContent("Reserving...");
    });
    expect(reserveButtons[1]).toHaveTextContent("Reserve");
    expect(reserveButtons[1]).not.toBeDisabled();

    resolveReservation?.();

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["reservations"],
      });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["usage"] });
  });

  it("opens the Add Vehicle modal", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ vehicles: fixtureVehicles, count: 2 })),
    );
    const user = userEvent.setup();

    render(<VehicleList />);

    await waitFor(() => {
      expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Add New Vehicle" }));

    await waitFor(() => {
      expect(
        screen.getByText("Add New Vehicle", { selector: "h2" }),
      ).toBeInTheDocument();
    });
  });
});
