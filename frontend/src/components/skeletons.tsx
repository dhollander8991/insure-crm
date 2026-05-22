import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Returns `true` for `ms` after mount, then `false`. Used to show a brief
 * skeleton placeholder on every route navigation so pages feel instant
 * even before real data has resolved.
 */
export function useMountLoading(ms = 350) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
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
    <div
      className="relative grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <KpiCardSkeleton key={i} />
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
        <div className={cn("relative w-full overflow-hidden rounded-lg", height)}>
          <Skeleton className="absolute inset-0" />
          {/* Faux chart bars */}
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2">
            {[40, 65, 50, 78, 55, 82, 60, 70, 90, 68, 75, 88].map((h, i) => (
              <div
                key={i}
                className="w-full rounded-t bg-primary/20"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card className="bg-card/70 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          <div className="grid gap-3 px-6 py-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-20" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, r) => (
            <div
              key={r}
              className="grid items-center gap-3 px-6 py-4"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: cols }).map((_, c) => (
                <div key={c} className="flex items-center gap-3">
                  {c === 0 && <Skeleton className="h-9 w-9 shrink-0 rounded-full" />}
                  <Skeleton className={cn("h-3", c === 0 ? "w-28" : "w-full max-w-[140px]")} />
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
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
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

export function BoardSkeleton({ columns = 4, perCol = 3 }: { columns?: number; perCol?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: columns }).map((_, ci) => (
        <div key={ci} className="flex flex-col">
          <div className="mb-3 flex items-center justify-between rounded-xl border bg-muted/30 px-3 py-2.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="space-y-2.5 rounded-xl p-2">
            {Array.from({ length: perCol }).map((_, ri) => (
              <Card key={ri} className="bg-card/80">
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
