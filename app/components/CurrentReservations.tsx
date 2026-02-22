"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Reservation } from "../api/reservations/route";
import { cancelReservation } from "../utils/api";
import CurrentReservation from "./CurrentReservation";

const cancelAllReservations = (reservations: Reservation[]) =>
  Promise.all(reservations.map((r) => cancelReservation(r.id)));

const currentReservationsLoading = (
  <div className="p-4 sm:p-6 md:p-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Current Reservations</h2>
      <div className="text-gray-500">Loading reservations...</div>
    </div>
  </div>
);

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
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["reservations"],
    queryFn: fetchReservations,
    refetchInterval: 300_000, // Refetch every 5 min
  });

  const reservations = data?.reservations || [];

  const cancelAllMutation = useMutation({
    mutationFn: () => cancelAllReservations(reservations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
    onError: (error: Error) => {
      console.error("Failed to cancel all reservations:", error.message);
    },
  });

  const handleCancelAll = () => {
    cancelAllMutation.mutate();
  };

  if (isLoading) {
    return currentReservationsLoading;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Current Reservations
          </h2>
          <div className="text-red-500">
            Error:{" "}
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="p-4 sm:p-6 md:p-8 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">
            Current Reservations
          </h2>
          {reservations.length > 0 ? (
            <button
              type="button"
              onClick={handleCancelAll}
              disabled={cancelAllMutation.isPending}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {cancelAllMutation.isPending ? "Cancelling..." : "Cancel All"}
            </button>
          ) : null}
        </div>

        {reservations.length === 0 ? (
          <div className="text-gray-500">No current reservations</div>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation) => (
              <CurrentReservation
                key={reservation.id}
                reservation={reservation}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
