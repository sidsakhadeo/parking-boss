const ENDPOINTS = {
  vehicles: "/api/vehicles",
  reservation: "/api/reservation",
  reservations: "/api/reservations",
  usage: "/api/usage",
} as const;

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(err.error ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export interface VehicleData {
  vehicle: string;
  notes: string;
  name: string;
  displayValue: string;
}

export interface Reservation {
  name: string;
  display: string;
  displayName?: string;
  id: string;
  grace: {
    min: { local: string };
    max?: { local: string };
  };
  valid: {
    min: { local: string };
    max?: { local: string };
  };
}

export interface UsageData {
  weeklyLimit: string;
  monthlyLimit: string;
  weeklyUsage: string;
  monthlyUsage: string;
}

export const fetchVehicles = () =>
  apiFetch<{ vehicles: Record<string, VehicleData>; count: number }>(
    ENDPOINTS.vehicles,
  );

export const addVehicle = (data: {
  vehicle: string;
  notes: string;
  name: string;
}) =>
  apiFetch<{ success: boolean; key: string; vehicle: VehicleData }>(
    ENDPOINTS.vehicles,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

export const fetchReservations = () =>
  apiFetch<{ reservations: Reservation[]; count: number }>(
    ENDPOINTS.reservations,
  );

export const createReservation = (data: {
  vehicle: string;
  notes: string;
  name: string;
}) =>
  apiFetch<{ message: string }>(ENDPOINTS.reservation, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const cancelReservation = (id: string): Promise<void> =>
  apiFetch<void>(ENDPOINTS.reservation, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

export const fetchUsage = () => apiFetch<UsageData>(ENDPOINTS.usage);
