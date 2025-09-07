import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Reservation } from "../api/reservations/route";

const makeReadable = (endsAt: string): string => {
  const endDate = new Date(endsAt);
  const endAtHours = endDate.getHours() % 12;
  const amOrPm = endDate.getHours() >= 12 ? " pm" : " am";
  const endAtMins = endDate.getMinutes();

  const endAtDate = endDate.getDate();
  const endAtMonth = endDate.getMonth() + 1;

  return `${endAtHours === 0 ? `00` : endAtHours}:${
    endAtMins < 10 ? `0${endAtMins}` : endAtMins
  }${amOrPm} on ${endAtMonth}/${endAtDate}`;
};

const cancelReservation = async (id: string) => {
  const response = await fetch("/api/reservation", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to cancel reservation");
  }

  return response.json();
};

interface CurrentReservationProps {
  reservation: Reservation;
}

export default function CurrentReservation({
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
        {reservation.valid.max && (
          <p>
            <span className="font-medium">Valid Until:</span>{" "}
            {makeReadable(reservation.valid.max.local)}
          </p>
        )}
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
}
