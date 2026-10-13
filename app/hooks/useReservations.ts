"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchReservations } from "../utils/apiClient";

export function useReservations() {
  return useQuery({
    queryKey: ["reservations"],
    queryFn: fetchReservations,
    refetchInterval: 300_000, // Refetch every 5 min
  });
}
