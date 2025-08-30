"use client";

import QueryProvider from "../providers/QueryProvider";
import CurrentReservations from "./CurrentReservations";
import Usage from "./Usage";
import VehicleList from "./VehicleList";

export default function HomeClient() {
  return (
    <QueryProvider>
      <Usage />
      <CurrentReservations />
      <VehicleList />
    </QueryProvider>
  );
}
