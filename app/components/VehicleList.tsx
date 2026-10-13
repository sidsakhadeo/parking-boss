"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useCreateReservation } from "../hooks/useReservationMutations";
import { useDeleteVehicle } from "../hooks/useVehicleMutations";
import { fetchVehicles } from "../utils/apiClient";
import ReserveSheet, { type DurationHours } from "./ReserveSheet";
import SectionError from "./SectionError";
import Vehicle from "./Vehicle";

const heading = (
  <h2 className="text-[13px] font-medium text-muted">Vehicles</h2>
);

const skeletonRows = ["w-32", "w-28", "w-24", "w-36"];

interface VehicleListProps {
  onAdd: () => void;
  reservedPlates?: ReadonlySet<string>;
}

export default function VehicleList({
  onAdd,
  reservedPlates,
}: VehicleListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [reserveId, setReserveId] = useState<string | null>(null);

  const handleCloseReserve = useCallback(() => setReserveId(null), []);
  const { pendingVehicleId, create } = useCreateReservation();
  const { pendingVehicleId: pendingDeleteId, remove } = useDeleteVehicle();

  const {
    data: vehiclesResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const vehiclesData = useMemo(
    () => vehiclesResponse?.vehicles ?? {},
    [vehiclesResponse],
  );
  const vehicles = useMemo(() => Object.entries(vehiclesData), [vehiclesData]);

  const handleConfirmReserve = useCallback(
    (hours: DurationHours) => {
      if (!reserveId) return;
      const vehicle = vehiclesData[reserveId];
      setReserveId(null);
      create(reserveId, {
        vehicle: vehicle.vehicle,
        notes: vehicle.notes,
        name: vehicle.name,
        duration: `PT${hours}H`,
      });
    },
    [reserveId, vehiclesData, create],
  );

  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) {
      return vehicles;
    }

    const query = searchQuery.toLowerCase();
    return vehicles.filter(([_id, vehicle]) => {
      return (
        vehicle.displayValue.toLowerCase().includes(query) ||
        vehicle.name.toLowerCase().includes(query) ||
        vehicle.notes.toLowerCase().includes(query) ||
        vehicle.vehicle.toLowerCase().includes(query)
      );
    });
  }, [vehicles, searchQuery]);

  if (isLoading) {
    return (
      <section
        role="status"
        aria-label="Loading vehicles"
        className="animate-pulse space-y-2.5"
      >
        <div className="h-3.5 w-16 rounded-md bg-field" />
        <div className="h-12 rounded-xl bg-field" />
        <div>
          {skeletonRows.map((width) => (
            <div
              key={width}
              className="flex h-19 items-center gap-4 border-b border-line"
            >
              <div className="flex-1 space-y-2">
                <div className={`h-4 rounded-md bg-field ${width}`} />
                <div className="h-3.5 w-44 rounded-md bg-field" />
              </div>
              <div className="h-11 w-22 rounded-full bg-field" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-2.5">
        {heading}
        <SectionError
          title="Couldn't load vehicles"
          error={error}
          onRetry={() => refetch()}
        />
      </section>
    );
  }

  const reserveVehicle = reserveId ? vehiclesData[reserveId] : undefined;

  return (
    <section aria-label="Vehicles" className="space-y-2.5">
      {heading}

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 px-6 pt-14 text-center">
          <p className="mt-2 text-[17px] font-semibold">No vehicles yet</p>
          <p className="max-w-65 text-sm text-muted">
            Add a car once, then reserve it in one tap.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 h-12 rounded-full bg-ink px-7 text-[15px] font-medium text-bg"
          >
            Add vehicle
          </button>
        </div>
      ) : (
        <>
          <div className="flex h-12 items-center gap-2.5 rounded-xl bg-field pr-1.5 pl-3.5">
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              className="shrink-0 text-muted"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              aria-label="Search vehicles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              inputMode="search"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            />
            {searchQuery ? (
              <button
                type="button"
                aria-label="Clear"
                onClick={() => setSearchQuery("")}
                className="flex size-11 items-center justify-center text-muted"
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            ) : null}
          </div>

          {filteredVehicles.length === 0 ? (
            <div
              role="status"
              className="flex flex-col items-center gap-1.5 px-6 pt-12 text-center"
            >
              <p className="text-[17px] font-semibold">
                No matches for "{searchQuery}"
              </p>
              <p className="text-sm text-muted">
                Search by name, plate or model.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-3.5 h-11 rounded-full border border-line px-5 text-[15px] font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            <ul>
              {filteredVehicles.map(([id, vehicle]) => (
                <Vehicle
                  key={id}
                  id={id}
                  vehicle={vehicle}
                  onReserve={setReserveId}
                  onDelete={remove}
                  disabled={pendingVehicleId === id}
                  deleteDisabled={pendingDeleteId === id}
                  reserved={reservedPlates?.has(vehicle.vehicle)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {reserveVehicle ? (
        <ReserveSheet
          key={reserveId}
          vehicle={reserveVehicle}
          onConfirm={handleConfirmReserve}
          onClose={handleCloseReserve}
        />
      ) : null}
    </section>
  );
}
