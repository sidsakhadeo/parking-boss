export const cancelReservation = async (id: string): Promise<void> => {
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
};
