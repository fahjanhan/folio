export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-muted/40 animate-pulse rounded-sm ${className}`}
      aria-hidden
    />
  );
}
