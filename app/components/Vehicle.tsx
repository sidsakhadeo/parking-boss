import { memo, useState } from "react";
import type { VehicleData } from "../utils/apiClient";
import Sheet from "./Sheet";

export type { VehicleData };

interface VehicleProps {
  id: string;
  vehicle: VehicleData;
  onReserve: (vehicleId: string) => void;
  onDelete: (vehicleId: string) => void;
  disabled?: boolean;
  deleteDisabled?: boolean;
  reserved?: boolean;
}

const Vehicle = memo(function Vehicle({
  id,
  vehicle,
  onReserve,
  onDelete,
  disabled,
  deleteDisabled,
  reserved,
}: VehicleProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  const handleDelete = () => {
    closeMenu();
    onDelete(id);
  };

  return (
    <li className="flex min-h-19 items-center gap-2 border-b border-line">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-base font-medium">
          {vehicle.displayValue}
        </span>
        <span className="truncate text-sm text-muted">
          <span>{vehicle.vehicle || "N/A"}</span>
          {" · "}
          <span>{vehicle.notes}</span>
        </span>
      </div>

      {reserved ? (
        <span className="flex h-11 items-center gap-1.5 px-1.5 text-sm font-medium text-ok">
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          Reserved
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onReserve(id)}
          disabled={disabled}
          className="flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-medium text-bg transition-opacity disabled:opacity-60"
        >
          {disabled ? (
            <>
              <svg
                aria-hidden="true"
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 3a9 9 0 1 0 9 9" />
              </svg>
              Reserving
            </>
          ) : (
            "Reserve"
          )}
        </button>
      )}

      <button
        type="button"
        onClick={() => setIsMenuOpen(true)}
        aria-label={`More options for ${vehicle.displayValue}`}
        aria-haspopup="dialog"
        className="-mr-2.5 flex h-11 w-10 items-center justify-center text-muted"
      >
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="5.5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="18.5" r="1.6" />
        </svg>
      </button>

      {isMenuOpen ? (
        <Sheet
          label={`Options for ${vehicle.displayValue}`}
          onClose={closeMenu}
        >
          <div className="space-y-0.5 pb-3.5">
            <p className="text-lg font-semibold tracking-tight">
              {vehicle.displayValue}
            </p>
            <p className="text-sm text-muted">
              {vehicle.vehicle || "N/A"} · {vehicle.notes} · {vehicle.name}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteDisabled}
            className="flex h-14 w-full items-center gap-3 border-t border-line text-left text-base text-danger disabled:opacity-50"
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
            </svg>
            {deleteDisabled ? "Deleting..." : "Delete vehicle"}
          </button>
          <button
            type="button"
            onClick={closeMenu}
            className="mt-2 h-13 w-full rounded-2xl bg-field text-base font-medium"
          >
            Cancel
          </button>
        </Sheet>
      ) : null}
    </li>
  );
});

export default Vehicle;
