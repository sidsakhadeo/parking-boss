"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { deleteVehicle } from "../utils/apiClient";

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [pendingVehicleId, setPendingVehicleId] = useState<string | null>(null);

  const remove = (key: string) => {
    setPendingVehicleId(key);
    startTransition(async () => {
      try {
        await deleteVehicle(key);
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      } catch (error) {
        alert(`Error deleting vehicle: ${(error as Error).message}`);
      } finally {
        setPendingVehicleId(null);
      }
    });
  };

  return { isPending, pendingVehicleId, remove };
}
