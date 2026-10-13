"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo, useEffect, useState } from "react";
import { addVehicle } from "../utils/apiClient";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  "h-[52px] w-full rounded-xl border border-line bg-surface px-4 text-base outline-none placeholder:text-muted focus:border-ink";

const AddVehicleModal = memo(function AddVehicleModal({
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add vehicle"
      className="fixed inset-0 z-50 overflow-y-auto bg-bg"
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pb-8"
      >
        <header className="flex h-16 shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-ml-3 flex size-11 items-center justify-center"
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
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <h2 className="text-[17px] font-semibold tracking-tight">
            Add vehicle
          </h2>
          <span aria-hidden="true" className="w-8" />
        </header>

        <div className="flex flex-1 flex-col gap-7 pt-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="licensePlate"
              className="text-[13px] font-medium text-muted"
            >
              License plate
            </label>
            <input
              type="text"
              id="licensePlate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              required
              autoCapitalize="characters"
              placeholder="8FBY787"
              className={`${inputClass} font-mono text-lg font-medium tracking-wider`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="makeModel"
              className="text-[13px] font-medium text-muted"
            >
              Make and model
            </label>
            <input
              type="text"
              id="makeModel"
              value={makeModel}
              onChange={(e) => setMakeModel(e.target.value)}
              required
              placeholder="Tesla Model 3"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="owner"
              className="text-[13px] font-medium text-muted"
            >
              Owner
            </label>
            <input
              type="text"
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
              placeholder="John Doe"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={addVehicleMutation.isPending}
          className="mt-8 h-[52px] w-full shrink-0 rounded-full bg-ink text-base font-medium text-bg disabled:opacity-60"
        >
          {addVehicleMutation.isPending ? "Adding..." : "Add vehicle"}
        </button>
      </form>
    </div>
  );
});

export default AddVehicleModal;
