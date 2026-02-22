import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo } from "react";
import type { Reservation } from "../api/reservations/route";
import { cancelReservation } from "../utils/api";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "numeric",
  day: "numeric",
});

const makeReadable = (dateStr: string): string =>
  dateFormatter.format(new Date(dateStr));

interface CurrentReservationProps {
  reservation: Reservation;
}

const CurrentReservation = memo(function CurrentReservation({
  reservation,
}: CurrentReservationProps) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => {
      // Invalidate and refetch reservations and usage
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
    onError: (error: Error) => {
      console.error("Failed to cancel reservation:", error.message);
    },
  });

  const handleCancel = () => {
    cancelMutation.mutate(reservation.id);
  };

  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
      <h3 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">
        {reservation.displayName}
      </h3>
      <div className="space-y-1 text-sm text-green-700 mb-4">
        <p>
          <span className="font-medium">Owner:</span> {reservation.name}
        </p>
        <p>
          <span className="font-medium">License:</span> {reservation.display}
        </p>
        <p>
          <span className="font-medium">Valid From:</span>{" "}
          {makeReadable(reservation.valid.min.local)}
        </p>
        {reservation.valid.max ? (
          <p>
            <span className="font-medium">Valid Until:</span>{" "}
            {makeReadable(reservation.valid.max.local)}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={cancelMutation.isPending}
        className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors touch-manipulation"
      >
        {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
      </button>
    </div>
  );
});

export default CurrentReservation;
