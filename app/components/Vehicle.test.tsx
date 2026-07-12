import { describe, expect, it, mock } from "bun:test";
import Vehicle from "@/app/components/Vehicle";
import { render, screen } from "@/test/utils/renderWithProviders";

const vehicleData = {
  vehicle: "ABC123",
  notes: "Tesla Model 3",
  name: "Jane Doe",
  displayValue: "Jane's Model 3",
};

describe("Vehicle", () => {
  it("renders vehicle details", () => {
    render(
      <Vehicle id="jane-tesla" vehicle={vehicleData} onReserve={() => {}} />,
    );

    expect(screen.getByText("Jane's Model 3")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("Tesla Model 3")).toBeInTheDocument();
  });

  it("falls back to N/A when the license plate is empty", () => {
    render(
      <Vehicle
        id="tejas-tesla"
        vehicle={{ ...vehicleData, vehicle: "" }}
        onReserve={() => {}}
      />,
    );

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("calls onReserve with the vehicle id when the button is clicked", () => {
    const onReserve = mock();
    render(
      <Vehicle id="jane-tesla" vehicle={vehicleData} onReserve={onReserve} />,
    );

    screen.getByRole("button", { name: "Reserve" }).click();

    expect(onReserve).toHaveBeenCalledWith("jane-tesla");
  });

  it("disables the button and shows Reserving... when disabled", () => {
    const onReserve = mock();
    render(
      <Vehicle
        id="jane-tesla"
        vehicle={vehicleData}
        onReserve={onReserve}
        disabled={true}
      />,
    );

    const button = screen.getByRole("button", { name: "Reserving..." });
    expect(button).toBeDisabled();

    button.click();
    expect(onReserve).not.toHaveBeenCalled();
  });
});
