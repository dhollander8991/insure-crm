import { useEffect, useState } from "react";
import clsx from "clsx";

import styles from "./Skeletons.module.css";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

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
    <Card className={styles.kpiCard}>
      <CardContent className={styles.kpiCardContent}>
        <div className={styles.kpiTextGroup}>
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
    <div className={styles.kpiGrid}>
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
    <Card className={clsx(styles.chartCard, className)}>
      {title && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </CardHeader>
      )}
      <CardContent>
        <div className={clsx(styles.chartInner, height)}>
          <Skeleton className="absolute inset-0" />
          <div className={styles.chartBarsRow}>
            {[40, 65, 50, 78, 55, 82, 60, 70, 90, 68, 75, 88].map(
              (barHeightPercent, index) => (
                <div
                  key={index}
                  className={styles.chartBar}
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
    <Card className={styles.tableCard}>
      <CardHeader className={styles.tableHeader}>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          <div
            className={styles.tableHeaderGrid}
            style={{ "--grid-cols": cols } as React.CSSProperties}
          >
            {Array.from({ length: cols }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-20" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={styles.tableRowGrid}
              style={{ "--grid-cols": cols } as React.CSSProperties}
            >
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className={styles.tableCellContent}>
                  {colIndex === 0 && (
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  )}
                  <Skeleton
                    className={
                      colIndex === 0 ? "h-3 w-28" : "h-3 w-full max-w-[140px]"
                    }
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
    <div className={styles.cardGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={styles.cardItem}>
          <CardContent className={styles.cardItemContent}>
            <div className={styles.cardItemHeader}>
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className={styles.cardItemText}>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className={styles.cardItemFooter}>
              <div className={styles.cardItemFooterLeft}>
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
    <div className={styles.boardGrid}>
      {Array.from({ length: columns }).map((_, columnIndex) => (
        <div key={columnIndex} className={styles.boardColumn}>
          <div className={styles.boardColumnHeader}>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className={styles.boardColumnBody}>
            {Array.from({ length: perCol }).map((_, rowIndex) => (
              <Card key={rowIndex} className={styles.boardCard}>
                <CardContent className={styles.boardCardContent}>
                  <div className={styles.boardCardHeader}>
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <div className={styles.boardCardFooter}>
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
