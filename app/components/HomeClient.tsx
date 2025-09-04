"use client";

import QueryProvider from "../providers/QueryProvider";
import CurrentReservations from "./CurrentReservations";
import Usage from "./Usage";
import VehicleList from "./VehicleList";

export default function HomeClient() {
  return (
    <QueryProvider>
      <div className="min-h-screen">
        <header className="p-8 border-b">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">Parking Boss</h1>
          </div>
        </header>
        <main>
          <Usage />
          <CurrentReservations />
          <VehicleList />
        </main>
      </div>
    </QueryProvider>
  );
}
