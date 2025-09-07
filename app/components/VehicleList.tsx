"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Vehicle from "./Vehicle";

interface VehicleData {
  vehicle: string;
  notes: string;
  name: string;
  displayValue: string;
}

const fetchVehicles = async (): Promise<{
  vehicles: Record<string, VehicleData>;
  count: number;
}> => {
  const response = await fetch("/api/vehicles");
  if (!response.ok) {
    throw new Error("Failed to fetch vehicles");
  }
  return response.json();
};

const createReservation = async (data: {
  vehicle: string;
  notes: string;
  name: string;
}) => {
  const response = await fetch("/api/reservation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create reservation");
  }

  return response.json();
};

export default function VehicleList() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const {
    data: vehiclesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const vehiclesData = vehiclesResponse?.vehicles || {};
  const vehicles = Object.entries(vehiclesData);

  const reservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      // Invalidate and refetch reservations and usage
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
    onError: (error: Error) => {
      alert(`Error reserving: ${error.message}`);
    },
  });

  const handleReserve = async (vehicleId: string) => {
    const vehicle = vehiclesData[vehicleId];

    reservationMutation.mutate({
      vehicle: vehicle.vehicle,
      notes: vehicle.notes,
      name: vehicle.name,
    });
  };

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
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Available Vehicles</h2>
          <div className="text-gray-500">Loading vehicles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Available Vehicles</h2>
          <div className="text-red-500">
            Error:{" "}
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Available Vehicles</h2>

        <div className="mb-4 sm:mb-6">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-3 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base sm:text-lg"
            inputMode="search"
          />
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map(([id, vehicle]) => (
            <Vehicle
              key={id}
              id={id}
              vehicle={vehicle}
              onReserve={handleReserve}
            />
          ))}
        </div>

        {filteredVehicles.length === 0 && searchQuery && (
          <div className="text-center text-gray-500 mt-8">
            No vehicles found matching "{searchQuery}"
          </div>
        )}

        <div className="mt-8 text-center text-gray-500">
          {searchQuery
            ? `Showing ${filteredVehicles.length} of ${vehicles.length} vehicles`
            : `Total vehicles: ${vehicles.length}`}
        </div>
      </div>
    </section>
  );
}
