import { describe, expect, it, mock } from "bun:test";
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

  it("disables the button and shows Reserving when disabled", () => {
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

    const button = screen.getByRole("button", { name: "Reserving" });
    expect(button).toBeDisabled();

    button.click();
    expect(onReserve).not.toHaveBeenCalled();
  });

  it("shows Reserved instead of the Reserve button for a reserved vehicle", () => {
    render(
      <Vehicle
        id="jane-tesla"
        vehicle={vehicleData}
        onReserve={() => {}}
        onDelete={() => {}}
        reserved={true}
      />,
    );

    expect(screen.getByText("Reserved")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reserve" }),
    ).not.toBeInTheDocument();
  });

  describe("options sheet", () => {
    const openSheet = async () => {
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
      await user.click(
        screen.getByRole("button", { name: "More options for Jane's Model 3" }),
      );
      return { user, onDelete };
    };

    it("hides the delete option until the more-options button is tapped", async () => {
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
        screen.queryByRole("button", { name: "Delete vehicle" }),
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: "More options for Jane's Model 3" }),
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete vehicle" }),
      ).toBeInTheDocument();
    });

    it("calls onDelete and closes the sheet when Delete vehicle is tapped", async () => {
      const { user, onDelete } = await openSheet();

      await user.click(screen.getByRole("button", { name: "Delete vehicle" }));

      expect(onDelete).toHaveBeenCalledWith("jane-tesla");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes without deleting on Cancel", async () => {
      const { user, onDelete } = await openSheet();

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onDelete).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes on Escape", async () => {
      const { user } = await openSheet();

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("shows Deleting... and disables the button when deleteDisabled", async () => {
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

      await user.click(
        screen.getByRole("button", { name: "More options for Jane's Model 3" }),
      );

      expect(
        screen.getByRole("button", { name: "Deleting..." }),
      ).toBeDisabled();
    });
  });
});
