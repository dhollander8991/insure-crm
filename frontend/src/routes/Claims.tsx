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
import { clsx as cx } from "clsx";

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

const boardColumns: { status: ClaimStatus; accent: string; ring: string }[] = [
  {
    status: "Open",
    accent: "from-sky-500/15 to-sky-500/0",
    ring: "border-info/30",
  },
  {
    status: "In Review",
    accent: "from-amber-500/15 to-amber-500/0",
    ring: "border-warning/30",
  },
  {
    status: "Approved",
    accent: "from-emerald-500/15 to-emerald-500/0",
    ring: "border-success/30",
  },
  {
    status: "Rejected",
    accent: "from-rose-500/15 to-rose-500/0",
    ring: "border-destructive/30",
  },
];

const severityStripeColors: Record<ClaimSeverity, string> = {
  Low: "bg-success",
  Medium: "bg-warning",
  High: "bg-destructive",
};

export function ClaimsPage() {
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
      <div className="relative px-4 py-6 md:px-6 lg:px-8">
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>

        <div className="relative mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Claims Board
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Drag to reassign. Hold{" "}
              <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">
                ⌘
              </kbd>{" "}
              /
              <kbd className="ml-1 rounded border bg-muted px-1.5 py-0.5 text-[10px]">
                Ctrl
              </kbd>{" "}
              to multi-select,
              <kbd className="ml-1 rounded border bg-muted px-1.5 py-0.5 text-[10px]">
                Shift
              </kbd>{" "}
              for a range.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {selectedClaimIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="glass-strong flex items-center gap-3 rounded-full px-4 py-2 shadow-[var(--shadow-elegant)]"
                >
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium tabular-nums">
                    {selectedClaimIds.size} selected
                  </span>
                  <button
                    onClick={clearClaimSelection}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={() => toast.info("Claims management coming soon")}
              className="gap-2 shadow-[var(--shadow-elegant)]"
            >
              <Plus className="h-4 w-4" /> New Claim
            </Button>
          </div>
        </div>

        {isMountLoading ? (
          <BoardSkeleton columns={4} perCol={3} />
        ) : claims.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No claims yet"
            description="Claims will appear here once they are filed."
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
            <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {boardColumns.map((column) => (
                <BoardColumn
                  key={column.status}
                  status={column.status}
                  accent={column.accent}
                  ring={column.ring}
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
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <AnimatePresence>
            {detailClaim && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Claim {detailClaim.id}
                  </SheetTitle>
                  <SheetDescription>{detailClaim.description}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4 px-4">
                  <ClaimDetailRow
                    label="Client"
                    value={detailClaim.clientName}
                  />
                  <ClaimDetailRow
                    label="Policy Type"
                    value={detailClaim.policyType}
                  />
                  <ClaimDetailRow
                    label="Amount"
                    value={`$${detailClaim.amount.toLocaleString()}`}
                  />
                  <ClaimDetailRow label="Status" value={detailClaim.status} />
                  <ClaimDetailRow
                    label="Severity"
                    value={detailClaim.severity}
                  />
                  <ClaimDetailRow
                    label="Days Open"
                    value={`${detailClaim.daysOpen} days`}
                  />
                  <ClaimDetailRow
                    label="Filed"
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
  accent,
  ring,
  columnClaims,
  selectedClaimIds,
  onClaimSelect,
  isOver,
  activeDragId,
}: {
  status: ClaimStatus;
  accent: string;
  ring: string;
  columnClaims: Claim[];
  selectedClaimIds: Set<string>;
  onClaimSelect: (claim: Claim, mouseEvent: MouseEvent) => void;
  isOver: boolean;
  activeDragId: string | null;
}) {
  const { setNodeRef } = useDroppable({ id: status });
  const isActiveInSelection =
    activeDragId !== null && selectedClaimIds.has(activeDragId);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0 }}
      className="flex flex-col"
    >
      <div
        className={cx(
          "mb-3 flex items-center justify-between rounded-xl border bg-gradient-to-b px-3 py-2.5",
          accent,
          ring,
        )}
      >
        <span className="text-sm font-semibold tracking-tight">{status}</span>
        <span className="rounded-full bg-background/70 px-2 py-0.5 text-xs font-medium tabular-nums">
          {columnClaims.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cx(
          "relative min-h-[180px] flex-1 space-y-2.5 rounded-xl p-2 transition-all duration-300",
          isOver &&
            "bg-primary/5 ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
        )}
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
          <div className="rounded-lg border border-dashed py-10 text-center text-xs text-muted-foreground">
            Drop here
          </div>
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
      className={cx(
        "group relative cursor-grab select-none transition-opacity duration-200 active:cursor-grabbing",
        isDragging && "opacity-30",
        isDimmed && "opacity-30",
      )}
    >
      <Card
        className={cx(
          "relative overflow-hidden border bg-card/80 backdrop-blur-sm transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]",
          isSelected &&
            "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[var(--shadow-elegant)]",
        )}
      >
        <span
          className={cx(
            "absolute left-0 top-0 h-full w-1",
            severityStripeColors[claim.severity],
          )}
        />
        <div className="absolute right-2 top-2 text-muted-foreground/30 opacity-0 transition-opacity group-hover:opacity-100">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <CardContent className="space-y-2 p-4 pl-5">
          <div className="flex items-center justify-between pr-5">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {claim.id}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {claim.policyType}
            </Badge>
          </div>
          <p className="text-sm font-semibold leading-tight">
            {claim.clientName}
          </p>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {claim.description}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold tabular-nums">
              ${claim.amount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
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
    <div className="relative w-[280px]">
      {stackSize > 1 && (
        <>
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl border bg-card/60 backdrop-blur" />
          <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-xl border bg-card/80 backdrop-blur" />
        </>
      )}
      <Card className="relative overflow-hidden border drag-glow bg-card/95 backdrop-blur">
        <span
          className={cx(
            "absolute left-0 top-0 h-full w-1",
            severityStripeColors[claim.severity],
          )}
        />
        <CardContent className="space-y-2 p-4 pl-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {claim.id}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {claim.policyType}
            </Badge>
          </div>
          <p className="text-sm font-semibold leading-tight">
            {claim.clientName}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold tabular-nums">
              ${claim.amount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {claim.daysOpen}d
            </span>
          </div>
        </CardContent>
      </Card>
      {stackSize > 1 && (
        <div className="absolute -right-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-lifted)]">
          +{stackSize - 1}
        </div>
      )}
    </div>
  );
}

function ClaimDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
