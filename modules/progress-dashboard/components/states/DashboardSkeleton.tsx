export function KpiSkeleton() {
  return (
    <div className="premium-card animate-pulse p-4">
      <div className="h-3 w-20 rounded bg-accent-200" />
      <div className="mt-3 h-8 w-16 rounded bg-accent-200" />
    </div>
  );
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="premium-card animate-pulse rounded-[22px]"
      style={{ height }}
    />
  );
}