"use client";

import { useQuery } from "@tanstack/react-query";
import type { Reservation } from "../api/reservations/route";
import CurrentReservation from "./CurrentReservation";

const fetchReservations = async (): Promise<{
  reservations: Reservation[];
  count: number;
}> => {
  const response = await fetch("/api/reservations");
  if (!response.ok) {
    throw new Error("Failed to fetch reservations");
  }
  return response.json();
};

export default function CurrentReservations() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["reservations"],
    queryFn: fetchReservations,
    refetchInterval: 300_000, // Refetch every 5 min
  });

  const reservations = data?.reservations || [];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Current Reservations</h2>
          <div className="text-gray-500">Loading reservations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Current Reservations</h2>
          <div className="text-red-500">
            Error:{" "}
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 border-b">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Current Reservations</h2>

        {reservations.length === 0 ? (
          <div className="text-gray-500">No current reservations</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation) => (
              <CurrentReservation
                key={reservation.id}
                reservation={reservation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
