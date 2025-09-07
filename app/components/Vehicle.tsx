interface VehicleData {
  vehicle: string;
  notes: string;
  name: string;
  displayValue: string;
}

interface VehicleProps {
  id: string;
  vehicle: VehicleData;
  onReserve: (vehicleId: string) => Promise<void>;
}

export default function Vehicle({ id, vehicle, onReserve }: VehicleProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      <h2 className="text-lg sm:text-xl font-semibold mb-2">{vehicle.displayValue}</h2>
      <div className="space-y-1 text-sm text-gray-400 mb-4">
        <p>
          <span className="font-medium">Owner:</span> {vehicle.name}
        </p>
        <p>
          <span className="font-medium">License:</span>{" "}
          {vehicle.vehicle || "N/A"}
        </p>
        <p>
          <span className="font-medium">Vehicle:</span> {vehicle.notes}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onReserve(id)}
        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors touch-manipulation"
      >
        Reserve
      </button>
    </div>
  );
}
