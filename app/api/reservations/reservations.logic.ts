import z from "zod";

export const reservationsSchema = z.object({
  permits: z.object({
    items: z.record(
      z.string(),
      z.object({
        title: z.string(),
        vehicle: z.string(),
        name: z.string(),
        id: z.string(),
        valid: z.object({
          min: z.object({ local: z.string() }),
          max: z.object({ local: z.string() }).optional(),
        }),
        grace: z.object({
          min: z.object({ local: z.string() }),
          max: z.object({ local: z.string() }).optional(),
        }),
      }),
    ),
  }),
  vehicles: z.object({
    items: z.record(z.string(), z.object({ display: z.string() })),
  }),
});

type PermitItems = z.infer<typeof reservationsSchema>["permits"]["items"];
type VehicleItems = z.infer<typeof reservationsSchema>["vehicles"]["items"];

type Reservation = {
  name: string;
  display: string;
  displayName?: string;
  id: string;
  grace: { min: { local: string }; max?: { local: string } };
  valid: { min: { local: string }; max?: { local: string } };
};

const VALID_PERMIT_TITLE = "Guest Parking";

export function buildReservations(
  items: PermitItems,
  vehicles: VehicleItems,
  displayValueByPlate: Map<string, string>,
): Reservation[] {
  return Object.keys(items)
    .filter((key) => items[key]?.title === VALID_PERMIT_TITLE)
    .map((key) => {
      const obj = Object.assign(
        {},
        { ...vehicles[items[key]?.vehicle] },
        { ...items[key] },
      ) as Reservation;

      const displayName = displayValueByPlate.get(obj.display);
      if (displayName) obj.displayName = displayName;

      return obj;
    });
}
