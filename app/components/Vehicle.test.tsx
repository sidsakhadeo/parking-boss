import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import userEvent from "@testing-library/user-event";
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
      <Vehicle
        id="jane-tesla"
        vehicle={vehicleData}
        onReserve={() => {}}
        onDelete={() => {}}
      />,
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
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("calls onReserve with the vehicle id when the button is clicked", () => {
    const onReserve = mock();
    render(
      <Vehicle
        id="jane-tesla"
        vehicle={vehicleData}
        onReserve={onReserve}
        onDelete={() => {}}
      />,
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
        onDelete={() => {}}
        disabled={true}
      />,
    );

    const button = screen.getByRole("button", { name: "Reserving..." });
    expect(button).toBeDisabled();

    button.click();
    expect(onReserve).not.toHaveBeenCalled();
  });

  describe("delete menu", () => {
    afterEach(() => {
      mock.restore();
    });

    it("hides the delete option until the more-options menu is opened", async () => {
      const user = userEvent.setup();
      render(
        <Vehicle
          id="jane-tesla"
          vehicle={vehicleData}
          onReserve={() => {}}
          onDelete={() => {}}
        />,
      );

      expect(
        screen.queryByRole("menuitem", { name: "Delete vehicle" }),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "More options" }));

      expect(
        screen.getByRole("menuitem", { name: "Delete vehicle" }),
      ).toBeInTheDocument();
    });

    it("asks for confirmation and calls onDelete when confirmed", async () => {
      spyOn(window, "confirm").mockReturnValue(true);
      const user = userEvent.setup();
      const onDelete = mock();
      render(
        <Vehicle
          id="jane-tesla"
          vehicle={vehicleData}
          onReserve={() => {}}
          onDelete={onDelete}
        />,
      );

      await user.click(screen.getByRole("button", { name: "More options" }));
      await user.click(
        screen.getByRole("menuitem", { name: "Delete vehicle" }),
      );

      expect(window.confirm).toHaveBeenCalledWith(
        "Delete Jane's Model 3? This cannot be undone.",
      );
      expect(onDelete).toHaveBeenCalledWith("jane-tesla");
    });

    it("does not call onDelete when the confirmation is declined", async () => {
      spyOn(window, "confirm").mockReturnValue(false);
      const user = userEvent.setup();
      const onDelete = mock();
      render(
        <Vehicle
          id="jane-tesla"
          vehicle={vehicleData}
          onReserve={() => {}}
          onDelete={onDelete}
        />,
      );

      await user.click(screen.getByRole("button", { name: "More options" }));
      await user.click(
        screen.getByRole("menuitem", { name: "Delete vehicle" }),
      );

      expect(onDelete).not.toHaveBeenCalled();
    });

    it("shows Deleting... and disables the menu item when deleteDisabled", async () => {
      const user = userEvent.setup();
      render(
        <Vehicle
          id="jane-tesla"
          vehicle={vehicleData}
          onReserve={() => {}}
          onDelete={() => {}}
          deleteDisabled={true}
        />,
      );

      await user.click(screen.getByRole("button", { name: "More options" }));

      const menuItem = screen.getByRole("menuitem", { name: "Deleting..." });
      expect(menuItem).toBeDisabled();
    });
  });
});
