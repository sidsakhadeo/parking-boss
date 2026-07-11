"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
import {
  cancelReservation,
  createReservation,
  type Reservation,
} from "../utils/apiClient";

const RESERVATION_KEYS = [["reservations"], ["usage"]] as const;

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  for (const key of RESERVATION_KEYS) {
    queryClient.invalidateQueries({ queryKey: key });
  }
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const create = (data: { vehicle: string; notes: string; name: string }) => {
    startTransition(async () => {
      try {
        await createReservation(data);
        invalidateAll(queryClient);
      } catch (error) {
        alert(`Error reserving: ${(error as Error).message}`);
      }
    });
  };

  return { isPending, create };
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const cancel = (id: string) => {
    startTransition(async () => {
      try {
        await cancelReservation(id);
        invalidateAll(queryClient);
      } catch (error) {
        console.error("Failed to cancel reservation:", (error as Error).message);
      }
    });
  };

  return { isPending, cancel };
}

export function useCancelAllReservations() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const cancelAll = (reservations: Reservation[]) => {
    startTransition(async () => {
      try {
        await Promise.all(reservations.map((r) => cancelReservation(r.id)));
        invalidateAll(queryClient);
      } catch (error) {
        console.error("Failed to cancel all reservations:", (error as Error).message);
      }
    });
  };

  return { isPending, cancelAll };
}
