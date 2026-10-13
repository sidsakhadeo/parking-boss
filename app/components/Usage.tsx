"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUsage } from "../utils/apiClient";

function Meter({
  label,
  used,
  limit,
}: {
  label: string;
  used: string;
  limit: string;
}) {
  const ratio = Number(used) / Number(limit);
  const percent = Number.isFinite(ratio)
    ? Math.min(100, Math.max(0, ratio * 100))
    : 0;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-[17px] font-semibold tabular-nums">
        <span>{used}</span>
        <span className="text-[13px] font-normal text-muted">
          {" / "}
          <span>{limit}</span>
          {" hrs"}
        </span>
      </span>
      <div className="mt-0.5 h-1 rounded-full bg-line">
        <div
          className="h-1 rounded-full bg-ink"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function Usage() {
  const {
    data: usage,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["usage"],
    queryFn: fetchUsage,
    refetchInterval: 300_000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <section
        role="status"
        aria-label="Loading usage"
        className="flex animate-pulse gap-6"
      >
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-3.5 w-20 rounded-md bg-field" />
          <div className="h-1 rounded-full bg-field" />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-3.5 w-24 rounded-md bg-field" />
          <div className="h-1 rounded-full bg-field" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        role="alert"
        className="flex min-h-11 items-center justify-between gap-3"
      >
        <span className="text-sm text-muted">Usage unavailable</span>
        <button
          type="button"
          onClick={() => refetch()}
          className="-mr-2 h-11 px-2 text-sm font-medium"
        >
          Retry
        </button>
      </section>
    );
  }

  if (!usage) {
    return null;
  }

  return (
    <section aria-label="Usage" className="flex gap-6">
      <Meter
        label="This week"
        used={usage.weeklyUsage}
        limit={usage.weeklyLimit}
      />
      <Meter
        label="This month"
        used={usage.monthlyUsage}
        limit={usage.monthlyLimit}
      />
    </section>
  );
}
