"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useReservations } from "../hooks/useReservations";
import CurrentReservations from "./CurrentReservations";
import Usage from "./Usage";
import VehicleList from "./VehicleList";

const AddVehicleModal = dynamic(() => import("./AddVehicleModal"));

export default function HomeClient() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const handleOpenAdd = useCallback(() => setIsAddOpen(true), []);
  const handleCloseAdd = useCallback(() => setIsAddOpen(false), []);

  const { data } = useReservations();
  const reservedPlates = useMemo(
    () => new Set((data?.reservations ?? []).map((r) => r.display)),
    [data],
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-5 pb-12">
      <header className="flex h-16 items-center justify-between">
        <h1 className="text-[17px] font-semibold tracking-tight">
          Parking Boss
        </h1>
        <button
          type="button"
          onClick={handleOpenAdd}
          aria-label="Add new vehicle"
          className="-mr-2.5 flex size-11 items-center justify-center"
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </header>
      <main className="flex flex-col gap-7">
        <Usage />
        <CurrentReservations />
        <VehicleList reservedPlates={reservedPlates} onAdd={handleOpenAdd} />
      </main>
      <AddVehicleModal isOpen={isAddOpen} onClose={handleCloseAdd} />
    </div>
  );
}
