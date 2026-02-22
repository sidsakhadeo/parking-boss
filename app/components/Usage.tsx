"use client";

import { useQuery } from "@tanstack/react-query";

interface UsageData {
  weeklyLimit: string;
  monthlyLimit: string;
  weeklyUsage: string;
  monthlyUsage: string;
}

const usageLoading = (
  <div className="p-4 sm:p-6 md:p-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Usage Statistics</h2>
      <div className="text-gray-500">Loading usage data...</div>
    </div>
  </div>
);

const fetchUsage = async (): Promise<UsageData> => {
  const response = await fetch("/api/usage");
  if (!response.ok) {
    throw new Error("Failed to fetch usage data");
  }
  return response.json();
};

export default function Usage() {
  const {
    data: usage,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["usage"],
    queryFn: fetchUsage,
    refetchInterval: 300_000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return usageLoading;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Usage Statistics</h2>
          <div className="text-red-500">
            Error:{" "}
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        </div>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  return (
    <section className="p-4 sm:p-6 md:p-8 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Usage Statistics</h2>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Weekly Usage</h3>
            <div className="space-y-1 text-sm text-blue-700">
              <p>
                <span className="font-medium">Used:</span> {usage.weeklyUsage}
              </p>
              <p>
                <span className="font-medium">Limit:</span> {usage.weeklyLimit}
              </p>
            </div>
          </div>

          <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-2">
              Monthly Usage
            </h3>
            <div className="space-y-1 text-sm text-purple-700">
              <p>
                <span className="font-medium">Used:</span> {usage.monthlyUsage}
              </p>
              <p>
                <span className="font-medium">Limit:</span> {usage.monthlyLimit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
