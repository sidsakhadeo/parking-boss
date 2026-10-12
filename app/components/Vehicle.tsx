import { memo, useEffect, useRef, useState } from "react";
import type { VehicleData } from "../utils/apiClient";

export type { VehicleData };

interface VehicleProps {
  id: string;
  vehicle: VehicleData;
  onReserve: (vehicleId: string) => void;
  onDelete: (vehicleId: string) => void;
  disabled?: boolean;
  deleteDisabled?: boolean;
}

const Vehicle = memo(function Vehicle({
  id,
  vehicle,
  onReserve,
  onDelete,
  disabled,
  deleteDisabled,
}: VehicleProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleDelete = () => {
    setIsMenuOpen(false);
    if (confirm(`Delete ${vehicle.displayValue}? This cannot be undone.`)) {
      onDelete(id);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h2 className="text-lg sm:text-xl font-semibold">
          {vehicle.displayValue}
        </h2>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className="text-gray-400 hover:text-[var(--foreground)] px-2 py-1 rounded-md leading-none text-xl"
          >
            &#8942;
          </button>
          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 w-40 bg-[var(--background)] border border-gray-200 rounded-lg shadow-md z-10 overflow-hidden"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleDelete}
                disabled={deleteDisabled}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteDisabled ? "Deleting..." : "Delete vehicle"}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-1 text-sm text-gray-400 mb-4">
        <p>
          <span className="font-medium">Owner:</span> {vehicle.name}
        </p>
        <p>
          <span className="font-medium">License:</span>{" "}
          {vehicle.vehicle || "N/A"}
        </p>
        <p>
          <span className="font-medium">Vehicle:</span> {vehicle.notes}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onReserve(id)}
        disabled={disabled}
        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors touch-manipulation"
      >
        {disabled ? "Reserving..." : "Reserve"}
      </button>
    </div>
  );
});

export default Vehicle;
