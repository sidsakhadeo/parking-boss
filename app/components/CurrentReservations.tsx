"use client";

import { useState } from "react";
import { useCancelAllReservations } from "../hooks/useReservationMutations";
import { useReservations } from "../hooks/useReservations";
import CurrentReservation from "./CurrentReservation";
import SectionError from "./SectionError";
import Sheet from "./Sheet";

const heading = (
  <h2 className="text-[13px] font-medium text-muted">Reserved now</h2>
);

export default function CurrentReservations() {
  const { isPending, cancelAll } = useCancelAllReservations();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { data, isLoading, error, refetch } = useReservations();

  const reservations = data?.reservations || [];

  const handleCloseConfirm = () => setIsConfirmOpen(false);
  const handleCancelAll = () => {
    setIsConfirmOpen(false);
    cancelAll(reservations);
  };

  if (isLoading) {
    return (
      <section
        role="status"
        aria-label="Loading reservations"
        className="animate-pulse space-y-2.5"
      >
        <div className="h-3.5 w-24 rounded-md bg-field" />
        <div className="h-[168px] rounded-2xl bg-field" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-2.5">
        {heading}
        <SectionError
          title="Couldn't load reservations"
          error={error}
          onRetry={() => refetch()}
        />
      </section>
    );
  }

  const count = reservations.length;

  return (
    <section aria-label="Current reservations" className="space-y-2.5">
      <div className="flex min-h-5 items-center justify-between">
        {heading}
        {count > 0 ? (
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            disabled={isPending}
            className="-my-3 -mr-2 h-11 px-2 text-sm text-danger disabled:opacity-50"
          >
            {isPending ? "Cancelling..." : "Cancel all"}
          </button>
        ) : null}
      </div>

      {count === 0 ? (
        <div className="flex h-[72px] items-center justify-center rounded-2xl border border-dashed border-line text-sm text-muted">
          Nothing reserved right now
        </div>
      ) : (
        <div className="space-y-3.5">
          {reservations.map((reservation) => (
            <CurrentReservation
              key={reservation.id}
              reservation={reservation}
            />
          ))}
        </div>
      )}

      {isConfirmOpen ? (
        <Sheet
          label="Cancel all reservations"
          role="alertdialog"
          onClose={handleCloseConfirm}
        >
          <div className="space-y-1 pb-4">
            <p className="text-lg font-semibold tracking-tight">
              Cancel all reservations?
            </p>
            <p className="text-sm text-muted">
              {count === 1
                ? "This spot will be released right away."
                : `These ${count} spots will be released right away.`}
            </p>
          </div>
          <ul className="mb-5 border-y border-line">
            {reservations.map((r) => (
              <li
                key={r.id}
                className="flex min-h-14 items-center justify-between border-b border-line last:border-b-0"
              >
                <span className="text-[15px] font-medium">
                  {r.displayName ?? r.name}
                </span>
                <span className="font-mono text-sm text-muted">
                  {r.display}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleCancelAll}
            className="h-[52px] w-full rounded-full bg-danger text-base font-medium text-white"
          >
            {count === 1
              ? "Cancel 1 reservation"
              : `Cancel ${count} reservations`}
          </button>
          <button
            type="button"
            onClick={handleCloseConfirm}
            className="mt-1 h-12 w-full text-[15px] text-muted"
          >
            Keep {count === 1 ? "it" : "them"}
          </button>
        </Sheet>
      ) : null}
    </section>
  );
}
