"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const addVehicle = async (data: {
  vehicle: string;
  notes: string;
  name: string;
}) => {
  const response = await fetch("/api/vehicles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add vehicle");
  }

  return response.json();
};

export default function AddVehicleModal({
  isOpen,
  onClose,
}: AddVehicleModalProps) {
  const [licensePlate, setLicensePlate] = useState("");
  const [makeModel, setMakeModel] = useState("");
  const [owner, setOwner] = useState("");
  const queryClient = useQueryClient();

  const addVehicleMutation = useMutation({
    mutationFn: addVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setLicensePlate("");
      setMakeModel("");
      setOwner("");
      onClose();
    },
    onError: (error: Error) => {
      alert(`Error adding vehicle: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicleMutation.mutate({
      vehicle: licensePlate,
      notes: makeModel,
      name: owner,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div className="relative bg-[var(--background)] w-full h-full sm:h-auto sm:max-w-md sm:rounded-lg sm:mx-4 sm:border sm:border-gray-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Add New Vehicle</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-[var(--foreground)] text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <div>
              <label
                htmlFor="licensePlate"
                className="block text-sm font-medium mb-1"
              >
                License Plate
              </label>
              <input
                type="text"
                id="licensePlate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                required
                placeholder="e.g., 8FBY787"
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>

            <div>
              <label
                htmlFor="makeModel"
                className="block text-sm font-medium mb-1"
              >
                Make & Model
              </label>
              <input
                type="text"
                id="makeModel"
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                required
                placeholder="e.g., Tesla Model 3"
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>

            <div>
              <label htmlFor="owner" className="block text-sm font-medium mb-1">
                Owner
              </label>
              <input
                type="text"
                id="owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                required
                placeholder="e.g., John Doe"
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 hover:bg-gray-200/20 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addVehicleMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {addVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
