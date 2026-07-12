import { describe, expect, it, mock, spyOn } from "bun:test";
import userEvent from "@testing-library/user-event";
import AddVehicleModal from "@/app/components/AddVehicleModal";
import { render, screen, waitFor } from "@/test/utils/renderWithProviders";

describe("AddVehicleModal", () => {
  it("renders nothing when closed", () => {
    render(<AddVehicleModal isOpen={false} onClose={() => {}} />);

    expect(screen.queryByText("Add New Vehicle")).not.toBeInTheDocument();
  });

  it("submits the form and invalidates the vehicles query on success", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true })),
    );
    const user = userEvent.setup();
    const onClose = mock();

    const { queryClient } = render(
      <AddVehicleModal isOpen={true} onClose={onClose} />,
    );
    const invalidateSpy = spyOn(queryClient, "invalidateQueries");

    await user.type(screen.getByLabelText("License Plate"), "ABC123");
    await user.type(screen.getByLabelText("Make & Model"), "Tesla Model 3");
    await user.type(screen.getByLabelText("Owner"), "Jane Doe");
    await user.click(screen.getByRole("button", { name: "Add Vehicle" }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["vehicles"] });
  });

  it("alerts with the error message when the submission fails", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Plate already exists" }), {
        status: 400,
      }),
    );
    const alertSpy = spyOn(window, "alert").mockImplementation(() => {});
    const user = userEvent.setup();

    render(<AddVehicleModal isOpen={true} onClose={() => {}} />);

    await user.type(screen.getByLabelText("License Plate"), "ABC123");
    await user.type(screen.getByLabelText("Make & Model"), "Tesla Model 3");
    await user.type(screen.getByLabelText("Owner"), "Jane Doe");
    await user.click(screen.getByRole("button", { name: "Add Vehicle" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Error adding vehicle: Plate already exists",
      );
    });
  });

  it("closes on Escape key press", async () => {
    const onClose = mock();
    const user = userEvent.setup();

    render(<AddVehicleModal isOpen={true} onClose={onClose} />);
    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });
});
