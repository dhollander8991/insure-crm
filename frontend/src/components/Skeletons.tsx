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
          <Skeleton className={styles.skelKpiLabel} />
          <Skeleton className={styles.skelKpiValue} />
          <Skeleton className={styles.skelKpiDelta} />
        </div>
        <Skeleton className={styles.skelKpiIcon} />
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
        <CardHeader className={styles.chartSkeletonHeader}>
          <Skeleton className={styles.skelChartTitle} />
          <Skeleton className={styles.skelChartSub} />
        </CardHeader>
      )}
      <CardContent>
        <div className={clsx(styles.chartInner, height)}>
          <Skeleton className={styles.skelChartFill} />
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
        <Skeleton className={styles.skelTableHeaderSearch} />
        <Skeleton className={styles.skelTableHeaderAction} />
      </CardHeader>
      <CardContent className={styles.tableCardContent}>
        <div className={styles.tableRows}>
          <div
            className={styles.tableHeaderGrid}
            style={{ "--grid-cols": cols } as React.CSSProperties}
          >
            {Array.from({ length: cols }).map((_, index) => (
              <Skeleton key={index} className={styles.skelColHead} />
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
                    <Skeleton className={styles.skelRowAvatar} />
                  )}
                  <Skeleton
                    className={
                      colIndex === 0 ? styles.skelRowName : styles.skelRowCell
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
              <Skeleton className={styles.skelCardIcon} />
              <Skeleton className={styles.skelCardBadge} />
            </div>
            <div className={styles.cardItemText}>
              <Skeleton className={styles.skelCardName} />
              <Skeleton className={styles.skelCardTitle} />
            </div>
            <div className={styles.cardItemFooter}>
              <div className={styles.cardItemFooterLeft}>
                <Skeleton className={styles.skelCardLabelSm} />
                <Skeleton className={styles.skelCardValue} />
              </div>
              <Skeleton className={styles.skelCardDate} />
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
            <Skeleton className={styles.skelBoardColHead} />
            <Skeleton className={styles.skelBoardColCount} />
          </div>
          <div className={styles.boardColumnBody}>
            {Array.from({ length: perCol }).map((_, rowIndex) => (
              <Card key={rowIndex} className={styles.boardCard}>
                <CardContent className={styles.boardCardContent}>
                  <div className={styles.boardCardHeader}>
                    <Skeleton className={styles.skelBoardCardId} />
                    <Skeleton className={styles.skelBoardCardBadge} />
                  </div>
                  <Skeleton className={styles.skelBoardCardName} />
                  <Skeleton className={styles.skelBoardCardDesc} />
                  <div className={styles.boardCardFooter}>
                    <Skeleton className={styles.skelBoardCardAmount} />
                    <Skeleton className={styles.skelBoardCardDate} />
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
