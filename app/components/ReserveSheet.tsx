"use client";

import { useState } from "react";
import type { VehicleData } from "../utils/apiClient";
import Sheet from "./Sheet";

export const DURATION_HOURS = [1, 2, 4] as const;
export type DurationHours = (typeof DURATION_HOURS)[number];
const DEFAULT_HOURS: DurationHours = 4;

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const hoursLabel = (h: number) => `${h} ${h === 1 ? "hour" : "hours"}`;

interface ReserveSheetProps {
  vehicle: VehicleData;
  onConfirm: (hours: DurationHours) => void;
  onClose: () => void;
}

export default function ReserveSheet({
  vehicle,
  onConfirm,
  onClose,
}: ReserveSheetProps) {
  const [hours, setHours] = useState<DurationHours>(DEFAULT_HOURS);
  const now = new Date();
  const end = new Date(now.getTime() + hours * 3_600_000);
  const endDay =
    end.toDateString() === now.toDateString() ? "today" : "tomorrow";
  const endsAt = `${endDay} at ${timeFormatter.format(end)}`;

  return (
    <Sheet label={`Reserve ${vehicle.displayValue}`} onClose={onClose}>
      <div className="space-y-0.5 pb-5">
        <p className="text-lg font-semibold tracking-tight">
          Reserve {vehicle.displayValue}
        </p>
        <p className="text-sm text-muted">
          {vehicle.vehicle || "N/A"} · {vehicle.notes}
        </p>
      </div>

      <fieldset className="grid grid-cols-3 gap-2.5">
        <legend className="pb-2.5 text-[13px] font-medium text-muted">
          How long?
        </legend>
        {DURATION_HOURS.map((h) => (
          <label
            key={h}
            className="flex h-[72px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border border-line bg-surface has-checked:border-ink has-checked:bg-ink has-checked:text-bg has-focus-visible:ring-2 has-focus-visible:ring-ink has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-bg"
          >
            <input
              type="radio"
              name="duration"
              value={h}
              checked={hours === h}
              onChange={() => setHours(h)}
              className="sr-only"
            />
            <span className="text-2xl font-semibold tabular-nums">{h}</span>{" "}
            <span className="text-[13px] opacity-70">
              {h === 1 ? "hour" : "hours"}
            </span>
          </label>
        ))}
      </fieldset>

      <p className="pt-4 pb-5 text-sm text-muted tabular-nums">Ends {endsAt}</p>
      <button
        type="button"
        onClick={() => onConfirm(hours)}
        className="h-[52px] w-full rounded-full bg-ink text-base font-medium text-bg"
      >
        Reserve for {hoursLabel(hours)}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="mt-1 h-12 w-full text-[15px] text-muted"
      >
        Cancel
      </button>
    </Sheet>
  );
}
