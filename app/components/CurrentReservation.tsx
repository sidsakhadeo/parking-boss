import { memo } from "react";
import { useNow } from "../hooks/useNow";
import { useCancelReservation } from "../hooks/useReservationMutations";
import type { Reservation } from "../utils/apiClient";

const EXPIRING_WINDOW_MINUTES = 60;

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "numeric",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const formatDateTime = (dateStr: string): string =>
  dateTimeFormatter.format(new Date(dateStr));

const formatTime = (dateStr: string): string =>
  timeFormatter.format(new Date(dateStr));

const isSameDay = (a: string, b: string): boolean =>
  new Date(a).toDateString() === new Date(b).toDateString();

interface CurrentReservationProps {
  reservation: Reservation;
}

const CurrentReservation = memo(function CurrentReservation({
  reservation,
}: CurrentReservationProps) {
  const { isPending, cancel } = useCancelReservation();

  const handleCancel = () => cancel(reservation.id);

  const from = reservation.valid.min.local;
  const until = reservation.valid.max?.local;
  const now = useNow(30_000);
  const isActive = new Date(from).getTime() <= now;
  const minutesLeft = until
    ? Math.ceil((new Date(until).getTime() - now) / 60_000)
    : null;
  const isExpiring =
    minutesLeft !== null &&
    minutesLeft > 0 &&
    minutesLeft <= EXPIRING_WINDOW_MINUTES;

  const status = isExpiring
    ? {
        label: `Expiring in ${minutesLeft} min`,
        text: "text-danger",
        dot: "bg-danger",
      }
    : isActive
      ? { label: "Active", text: "text-ok", dot: "bg-ok" }
      : { label: "Upcoming", text: "text-muted", dot: "bg-muted" };

  return (
    <div className="space-y-3.5 rounded-2xl border border-line bg-surface p-[18px]">
      <div className="space-y-1.5">
        <div
          className={`flex items-center gap-2 text-[13px] font-medium ${status.text}`}
        >
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${status.dot}`}
          />
          {status.label}
        </div>
        <div className="font-mono text-2xl font-semibold tracking-wide">
          {reservation.display}
        </div>
        <div className="text-sm text-muted">
          {reservation.displayName ? (
            <>
              <span>{reservation.displayName}</span>
              {" · "}
            </>
          ) : null}
          <span>{reservation.name}</span>
        </div>
        <div className="text-sm tabular-nums">
          {formatDateTime(from)}
          {until ? (
            <>
              {" "}
              <span className="text-muted">to</span>{" "}
              {isSameDay(from, until)
                ? formatTime(until)
                : formatDateTime(until)}
            </>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="h-11 w-full rounded-xl border border-line text-[15px] font-medium text-danger transition-opacity disabled:opacity-50"
      >
        {isPending ? "Cancelling..." : "Cancel"}
      </button>
    </div>
  );
});

export default CurrentReservation;
