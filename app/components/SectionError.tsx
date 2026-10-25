interface SectionErrorProps {
  title: string;
  error: unknown;
  onRetry: () => void;
}

export default function SectionError({
  title,
  error,
  onRetry,
}: SectionErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-4.5 py-4"
    >
      <div className="flex items-start gap-3">
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-px shrink-0 text-danger"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5M12 16v.01" />
        </svg>
        <div>
          <p className="text-[15px] font-medium">{title}</p>
          <p className="text-sm text-muted">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="h-11 rounded-xl border border-line text-[15px] font-medium"
      >
        Try again
      </button>
    </div>
  );
}
