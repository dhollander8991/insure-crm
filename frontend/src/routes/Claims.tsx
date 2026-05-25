import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useMemo, useState, type MouseEvent } from "react";
import { ShieldAlert } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Clock, AlertCircle, GripVertical, Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

import styles from "./Claims.module.css";

import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/Sheet";
import { PageTransition } from "@/components/PageTransition";
import { BoardSkeleton, useMountLoading } from "@/components/Skeletons";

export type ClaimStatus = "Open" | "In Review" | "Approved" | "Rejected";
export type ClaimSeverity = "Low" | "Medium" | "High";
type PolicyType = "Life" | "Auto" | "Home" | "Health";

export interface Claim {
  id: string;
  clientName: string;
  policyType: PolicyType;
  amount: number;
  daysOpen: number;
  status: ClaimStatus;
  severity: ClaimSeverity;
  description: string;
  filedAt: string;
}

const seedClaims: Claim[] = [
  {
    id: "CLM-3000",
    clientName: "Olivia Carter",
    policyType: "Auto",
    amount: 3200,
    daysOpen: 5,
    status: "Open",
    severity: "Medium",
    description: "Vehicle collision on highway",
    filedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "CLM-3001",
    clientName: "Liam Bennett",
    policyType: "Home",
    amount: 8500,
    daysOpen: 12,
    status: "In Review",
    severity: "High",
    description: "Water damage from burst pipe",
    filedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "CLM-3002",
    clientName: "Emma Hayes",
    policyType: "Health",
    amount: 1200,
    daysOpen: 3,
    status: "Approved",
    severity: "Low",
    description: "Hospitalization expenses",
    filedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "CLM-3003",
    clientName: "Noah Reed",
    policyType: "Auto",
    amount: 5600,
    daysOpen: 8,
    status: "Open",
    severity: "High",
    description: "Rear-end collision",
    filedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "CLM-3004",
    clientName: "Ava Brooks",
    policyType: "Home",
    amount: 2300,
    daysOpen: 20,
    status: "Rejected",
    severity: "Low",
    description: "Storm damage to roof",
    filedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "CLM-3005",
    clientName: "Elijah Foster",
    policyType: "Life",
    amount: 15000,
    daysOpen: 30,
    status: "In Review",
    severity: "High",
    description: "Medical procedure coverage",
    filedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "CLM-3006",
    clientName: "Sophia Hughes",
    policyType: "Home",
    amount: 4100,
    daysOpen: 7,
    status: "Open",
    severity: "Medium",
    description: "Fire damage in kitchen",
    filedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "CLM-3007",
    clientName: "Lucas Morgan",
    policyType: "Auto",
    amount: 900,
    daysOpen: 2,
    status: "In Review",
    severity: "Low",
    description: "Theft of personal property",
    filedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "CLM-3008",
    clientName: "Isabella Russell",
    policyType: "Health",
    amount: 6700,
    daysOpen: 15,
    status: "Approved",
    severity: "Medium",
    description: "Hospitalization expenses",
    filedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "CLM-3009",
    clientName: "Mason Stone",
    policyType: "Home",
    amount: 3400,
    daysOpen: 18,
    status: "Rejected",
    severity: "Medium",
    description: "Water damage from burst pipe",
    filedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: "CLM-3010",
    clientName: "Mia Walker",
    policyType: "Auto",
    amount: 2100,
    daysOpen: 4,
    status: "Open",
    severity: "Low",
    description: "Vehicle collision on highway",
    filedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "CLM-3011",
    clientName: "Logan Parker",
    policyType: "Life",
    amount: 22000,
    daysOpen: 40,
    status: "In Review",
    severity: "High",
    description: "Medical procedure coverage",
    filedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: "CLM-3012",
    clientName: "Charlotte Coleman",
    policyType: "Health",
    amount: 4200,
    daysOpen: 6,
    status: "Approved",
    severity: "Medium",
    description: "Hospitalization expenses",
    filedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "CLM-3013",
    clientName: "Ethan Ward",
    policyType: "Auto",
    amount: 1800,
    daysOpen: 9,
    status: "Open",
    severity: "Low",
    description: "Rear-end collision",
    filedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "CLM-3014",
    clientName: "Amelia Bell",
    policyType: "Home",
    amount: 7300,
    daysOpen: 22,
    status: "Rejected",
    severity: "High",
    description: "Storm damage to roof",
    filedAt: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
  {
    id: "CLM-3015",
    clientName: "James Murphy",
    policyType: "Health",
    amount: 3100,
    daysOpen: 11,
    status: "Approved",
    severity: "Medium",
    description: "Medical procedure coverage",
    filedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: "CLM-3016",
    clientName: "Harper Cooper",
    policyType: "Auto",
    amount: 5900,
    daysOpen: 14,
    status: "In Review",
    severity: "High",
    description: "Vehicle collision on highway",
    filedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "CLM-3017",
    clientName: "Benjamin Rivera",
    policyType: "Home",
    amount: 2700,
    daysOpen: 1,
    status: "Open",
    severity: "Low",
    description: "Water damage from burst pipe",
    filedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "CLM-3018",
    clientName: "Evelyn Sanders",
    policyType: "Life",
    amount: 18500,
    daysOpen: 35,
    status: "In Review",
    severity: "High",
    description: "Medical procedure coverage",
    filedAt: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
  {
    id: "CLM-3019",
    clientName: "Henry Price",
    policyType: "Auto",
    amount: 1400,
    daysOpen: 3,
    status: "Open",
    severity: "Medium",
    description: "Theft of personal property",
    filedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "CLM-3020",
    clientName: "Abigail Powell",
    policyType: "Home",
    amount: 6200,
    daysOpen: 25,
    status: "Approved",
    severity: "High",
    description: "Fire damage in kitchen",
    filedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "CLM-3021",
    clientName: "Alexander Long",
    policyType: "Health",
    amount: 4800,
    daysOpen: 16,
    status: "Rejected",
    severity: "Medium",
    description: "Hospitalization expenses",
    filedAt: new Date(Date.now() - 16 * 86400000).toISOString(),
  },
];

const boardColumns: { status: ClaimStatus; columnClass: string }[] = [
  { status: "Open", columnClass: styles.columnOpen },
  { status: "In Review", columnClass: styles.columnInReview },
  { status: "Approved", columnClass: styles.columnApproved },
  { status: "Rejected", columnClass: styles.columnRejected },
];

const severityStripeClasses: Record<ClaimSeverity, string> = {
  Low: styles.severityLow,
  Medium: styles.severityMedium,
  High: styles.severityHigh,
};

export function ClaimsPage() {
  const { t } = useTranslation();
  const isMountLoading = useMountLoading();
  const [claims, setClaims] = useState<Claim[]>(seedClaims);
  const [selectedClaimIds, setSelectedClaimIds] = useState<Set<string>>(
    new Set(),
  );
  const [lastClickedClaimId, setLastClickedClaimId] = useState<string | null>(
    null,
  );
  const [detailClaim, setDetailClaim] = useState<Claim | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ClaimStatus | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const claimsByStatus = useMemo(() => {
    const statusMap: Record<ClaimStatus, Claim[]> = {
      Open: [],
      "In Review": [],
      Approved: [],
      Rejected: [],
    };
    claims.forEach((claim) => statusMap[claim.status].push(claim));
    return statusMap;
  }, [claims]);

  const handleClaimSelect = useCallback(
    (claim: Claim, mouseEvent: MouseEvent) => {
      const claimId = claim.id;
      const isMetaKeyHeld = mouseEvent.metaKey || mouseEvent.ctrlKey;
      const isShiftKeyHeld = mouseEvent.shiftKey;

      if (isShiftKeyHeld && lastClickedClaimId) {
        const statusColumn = claimsByStatus[claim.status];
        const rangeStartIndex = statusColumn.findIndex(
          (claimItem) => claimItem.id === lastClickedClaimId,
        );
        const rangeEndIndex = statusColumn.findIndex(
          (claimItem) => claimItem.id === claimId,
        );
        if (rangeStartIndex !== -1 && rangeEndIndex !== -1) {
          const [lowerBound, upperBound] =
            rangeStartIndex < rangeEndIndex
              ? [rangeStartIndex, rangeEndIndex]
              : [rangeEndIndex, rangeStartIndex];
          const selectedRange = statusColumn
            .slice(lowerBound, upperBound + 1)
            .map((claimItem) => claimItem.id);
          setSelectedClaimIds(
            (previousSelected) =>
              new Set([...previousSelected, ...selectedRange]),
          );
          return;
        }
      }

      if (isMetaKeyHeld) {
        setSelectedClaimIds((previousSelected) => {
          const nextSelected = new Set(previousSelected);
          if (nextSelected.has(claimId)) nextSelected.delete(claimId);
          else nextSelected.add(claimId);
          return nextSelected;
        });
        setLastClickedClaimId(claimId);
        return;
      }

      if (selectedClaimIds.size <= 1) {
        setSelectedClaimIds(new Set([claimId]));
        setLastClickedClaimId(claimId);
        setDetailClaim(claim);
      } else {
        setDetailClaim(claim);
      }
    },
    [claimsByStatus, lastClickedClaimId, selectedClaimIds],
  );

  const clearClaimSelection = () => setSelectedClaimIds(new Set());

  const handleDragStart = (dragStartEvent: DragStartEvent) => {
    const draggedId = String(dragStartEvent.active.id);
    setActiveDragId(draggedId);
    if (!selectedClaimIds.has(draggedId))
      setSelectedClaimIds(new Set([draggedId]));
  };

  const handleDragEnd = (dragEndEvent: DragEndEvent) => {
    setActiveDragId(null);
    setDragOverColumn(null);
    if (!dragEndEvent.over) return;
    const targetStatus = String(dragEndEvent.over.id) as ClaimStatus;
    const draggedClaimId = String(dragEndEvent.active.id);
    const claimsBeingMoved = selectedClaimIds.has(draggedClaimId)
      ? Array.from(selectedClaimIds)
      : [draggedClaimId];
    setClaims((previousClaims) =>
      previousClaims.map((claim) =>
        claimsBeingMoved.includes(claim.id)
          ? { ...claim, status: targetStatus }
          : claim,
      ),
    );
  };

  const activelyDraggedClaim = activeDragId
    ? claims.find((claim) => claim.id === activeDragId)
    : null;
  const dragStackSize =
    activeDragId && selectedClaimIds.has(activeDragId)
      ? selectedClaimIds.size
      : 1;

  return (
    <PageTransition>
      <div className={styles.page}>
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>{t("claims.title")}</h1>
            <p className={styles.pageSubtitle}>{t("claims.subtitle")}</p>
          </div>
          <div className={styles.headerActions}>
            <AnimatePresence>
              {selectedClaimIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={styles.selectionPill}
                >
                  <Layers className={styles.selectionIcon} />
                  <span className={styles.selectionCount}>
                    {selectedClaimIds.size} {t("claims.selected")}
                  </span>
                  <button
                    onClick={clearClaimSelection}
                    className={styles.selectionClear}
                  >
                    {t("claims.clearSelection")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => toast.info("Claims management coming soon")}
              className={styles.newClaimButton}
            >
              <Plus className={styles.plusIcon} /> {t("claims.newClaim")}
            </Button>
          </div>
        </div>

        {isMountLoading ? (
          <BoardSkeleton columns={4} perCol={3} />
        ) : claims.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title={t("claims.noClaimsTitle")}
            description={t("claims.noClaimsDesc")}
          />
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(dragOverEvent) =>
              setDragOverColumn(
                dragOverEvent.over
                  ? (String(dragOverEvent.over.id) as ClaimStatus)
                  : null,
              )
            }
            onDragCancel={() => {
              setActiveDragId(null);
              setDragOverColumn(null);
            }}
          >
            <div className={styles.board}>
              {boardColumns.map((column) => (
                <BoardColumn
                  key={column.status}
                  status={column.status}
                  columnClass={column.columnClass}
                  columnClaims={claimsByStatus[column.status]}
                  selectedClaimIds={selectedClaimIds}
                  onClaimSelect={handleClaimSelect}
                  isOver={dragOverColumn === column.status}
                  activeDragId={activeDragId}
                />
              ))}
            </div>

            <DragOverlay
              dropAnimation={{
                duration: 250,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {activelyDraggedClaim && (
                <DragStack
                  claim={activelyDraggedClaim}
                  stackSize={dragStackSize}
                />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <Sheet
        open={!!detailClaim}
        onOpenChange={(isSheetOpen) => !isSheetOpen && setDetailClaim(null)}
      >
        <SheetContent className={styles.sheetContent}>
          <AnimatePresence>
            {detailClaim && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SheetHeader>
                  <SheetTitle className={styles.sheetTitle}>
                    <AlertCircle className={styles.sheetTitleIcon} />
                    {t("claims.claimLabel")} {detailClaim.id}
                  </SheetTitle>
                  <SheetDescription>{detailClaim.description}</SheetDescription>
                </SheetHeader>
                <div className={styles.detailSheetContent}>
                  <ClaimDetailRow
                    label={t("claims.client")}
                    value={detailClaim.clientName}
                  />
                  <ClaimDetailRow
                    label={t("claims.policyType")}
                    value={detailClaim.policyType}
                  />
                  <ClaimDetailRow
                    label={t("claims.amount")}
                    value={`$${detailClaim.amount.toLocaleString()}`}
                  />
                  <ClaimDetailRow label={t("claims.status")} value={detailClaim.status} />
                  <ClaimDetailRow
                    label={t("claims.severity")}
                    value={detailClaim.severity}
                  />
                  <ClaimDetailRow
                    label={t("claims.daysOpen")}
                    value={`${detailClaim.daysOpen} ${t("claims.days")}`}
                  />
                  <ClaimDetailRow
                    label={t("claims.filed")}
                    value={new Date(detailClaim.filedAt).toLocaleDateString()}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </PageTransition>
  );
}

function BoardColumn({
  status,
  columnClass,
  columnClaims,
  selectedClaimIds,
  onClaimSelect,
  isOver,
  activeDragId,
}: {
  status: ClaimStatus;
  columnClass: string;
  columnClaims: Claim[];
  selectedClaimIds: Set<string>;
  onClaimSelect: (claim: Claim, mouseEvent: MouseEvent) => void;
  isOver: boolean;
  activeDragId: string | null;
}) {
  const { t } = useTranslation();
  const { setNodeRef } = useDroppable({ id: status });
  const isActiveInSelection =
    activeDragId !== null && selectedClaimIds.has(activeDragId);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0 }}
      className={styles.column}
    >
      <div className={clsx(styles.columnHeader, columnClass)}>
        <span className={styles.columnTitle}>{t(`claims.columns.${status}`)}</span>
        <span className={styles.columnCount}>{columnClaims.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={clsx(styles.columnBody, isOver && styles.columnBodyOver)}
      >
        {columnClaims.map((columnClaim) => {
          const isDimmed =
            isActiveInSelection &&
            selectedClaimIds.has(columnClaim.id) &&
            columnClaim.id !== activeDragId;
          return (
            <DraggableCard
              key={columnClaim.id}
              claim={columnClaim}
              isSelected={selectedClaimIds.has(columnClaim.id)}
              onSelect={onClaimSelect}
              isDimmed={isDimmed}
            />
          );
        })}
        {columnClaims.length === 0 && (
          <div className={styles.emptyDrop}>{t("claims.dropHere")}</div>
        )}
      </div>
    </motion.div>
  );
}

function DraggableCard({
  claim,
  isSelected,
  onSelect,
  isDimmed,
}: {
  claim: Claim;
  isSelected: boolean;
  onSelect: (claim: Claim, mouseEvent: MouseEvent) => void;
  isDimmed?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: claim.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(mouseEvent) => onSelect(claim, mouseEvent)}
      className={clsx(
        styles.cardWrapper,
        isDragging && styles.cardWrapperDragging,
        isDimmed && styles.cardWrapperDimmed,
      )}
    >
      <Card className={clsx(styles.card, isSelected && styles.cardSelected)}>
        <span
          className={clsx(
            styles.severityStripe,
            severityStripeClasses[claim.severity],
          )}
        />
        <div className={styles.gripIcon}>
          <GripVertical className={styles.gripIconSvg} />
        </div>
        <CardContent className={styles.cardContent}>
          <div className={styles.cardTopRow}>
            <span className={styles.cardId}>{claim.id}</span>
            <Badge variant="outline" className={styles.policyTypeBadge}>
              {claim.policyType}
            </Badge>
          </div>
          <p className={styles.cardClient}>{claim.clientName}</p>
          <p className={styles.cardDescription}>{claim.description}</p>
          <div className={styles.cardFooter}>
            <span className={styles.cardAmount}>
              ${claim.amount.toLocaleString()}
            </span>
            <span className={styles.cardDays}>
              <Clock className={styles.clockIcon} />
              {claim.daysOpen}d
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DragStack({ claim, stackSize }: { claim: Claim; stackSize: number }) {
  return (
    <div className={styles.dragStack}>
      {stackSize > 1 && (
        <>
          <div className={styles.dragShadow2} />
          <div className={styles.dragShadow1} />
        </>
      )}
      <Card className={styles.dragCard}>
        <span
          className={clsx(
            styles.severityStripe,
            severityStripeClasses[claim.severity],
          )}
        />
        <CardContent className={styles.cardContent}>
          <div className={styles.cardTopRow}>
            <span className={styles.cardId}>{claim.id}</span>
            <Badge variant="outline" className={styles.policyTypeBadge}>
              {claim.policyType}
            </Badge>
          </div>
          <p className={styles.cardClient}>{claim.clientName}</p>
          <div className={styles.cardFooter}>
            <span className={styles.cardAmount}>
              ${claim.amount.toLocaleString()}
            </span>
            <span className={styles.cardDays}>
              <Clock className={styles.clockIcon} />
              {claim.daysOpen}d
            </span>
          </div>
        </CardContent>
      </Card>
      {stackSize > 1 && (
        <div className={styles.dragBadge}>+{stackSize - 1}</div>
      )}
    </div>
  );
}

function ClaimDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}
