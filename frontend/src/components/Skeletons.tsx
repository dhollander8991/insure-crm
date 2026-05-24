import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function useMountLoading(durationMs = 350) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timeoutId = setTimeout(() => setIsLoading(false), durationMs);
    return () => clearTimeout(timeoutId);
  }, [durationMs]);
  return isLoading;
}

export function KpiCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-card/70 backdrop-blur-xl">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </CardContent>
    </Card>
  );
}

export function KpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="skeleton-kpi-grid">
      {Array.from({ length: count }).map((_, index) => (
        <KpiCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ChartSkeleton({
  className,
  title = true,
  height = "h-64",
}: {
  className?: string;
  title?: boolean;
  height?: string;
}) {
  return (
    <Card className={cn("h-full bg-card/70 backdrop-blur-xl", className)}>
      {title && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </CardHeader>
      )}
      <CardContent>
        <div
          className={cn("relative w-full overflow-hidden rounded-lg", height)}
        >
          <Skeleton className="absolute inset-0" />
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2">
            {[40, 65, 50, 78, 55, 82, 60, 70, 90, 68, 75, 88].map(
              (barHeightPercent, index) => (
                <div
                  key={index}
                  className="skeleton-chart-bar"
                  style={
                    {
                      "--bar-height": `${barHeightPercent}%`,
                    } as React.CSSProperties
                  }
                />
              ),
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <Card className="bg-card/70 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          <div
            className="skeleton-table-header-grid"
            style={{ "--grid-cols": cols } as React.CSSProperties}
          >
            {Array.from({ length: cols }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-20" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="skeleton-table-row-grid"
              style={{ "--grid-cols": cols } as React.CSSProperties}
            >
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="flex items-center gap-3">
                  {colIndex === 0 && (
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  )}
                  <Skeleton
                    className={cn(
                      "h-3",
                      colIndex === 0 ? "w-28" : "w-full max-w-[140px]",
                    )}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="flex items-end justify-between pt-2">
              <div className="space-y-1">
                <Skeleton className="h-2 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function BoardSkeleton({
  columns = 4,
  perCol = 3,
}: {
  columns?: number;
  perCol?: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: columns }).map((_, columnIndex) => (
        <div key={columnIndex} className="flex flex-col">
          <div className="mb-3 flex items-center justify-between rounded-xl border bg-muted/30 px-3 py-2.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="space-y-2.5 rounded-xl p-2">
            {Array.from({ length: perCol }).map((_, rowIndex) => (
              <Card key={rowIndex} className="bg-card/80">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
