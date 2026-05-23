import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useMemo, useState, type MouseEvent } from "react";
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
import { Clock, AlertCircle, GripVertical, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PageTransition } from "@/components/page-transition";
import { BoardSkeleton, useMountLoading } from "@/components/skeletons";
import { claims as seedClaims, type Claim, type ClaimStatus, type ClaimSeverity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/claims")({
  head: () => ({
    meta: [
      { title: "Claims — Aegis CRM" },
      { name: "description", content: "Drag claims between stages. Hold ⌘ / Ctrl to select multiple, Shift for a range." },
    ],
  }),
  component: ClaimsPage,
});

const columns: { status: ClaimStatus; accent: string; ring: string }[] = [
  { status: "Open", accent: "from-sky-500/15 to-sky-500/0", ring: "border-info/30" },
  { status: "In Review", accent: "from-amber-500/15 to-amber-500/0", ring: "border-warning/30" },
  { status: "Approved", accent: "from-emerald-500/15 to-emerald-500/0", ring: "border-success/30" },
  { status: "Rejected", accent: "from-rose-500/15 to-rose-500/0", ring: "border-destructive/30" },
];

const severityStripe: Record<ClaimSeverity, string> = {
  Low: "bg-success",
  Medium: "bg-warning",
  High: "bg-destructive",
};

function ClaimsPage() {
  const loading = useMountLoading();
  const [claims, setClaims] = useState<Claim[]>(seedClaims);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastClicked, setLastClicked] = useState<string | null>(null);
  const [detail, setDetail] = useState<Claim | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<ClaimStatus | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byStatus = useMemo(() => {
    const map: Record<ClaimStatus, Claim[]> = { Open: [], "In Review": [], Approved: [], Rejected: [] };
    claims.forEach((c) => map[c.status].push(c));
    return map;
  }, [claims]);

  const handleSelect = useCallback(
    (claim: Claim, e: MouseEvent) => {
      const id = claim.id;
      const isMeta = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      if (isShift && lastClicked) {
        const col = byStatus[claim.status];
        const startIdx = col.findIndex((c) => c.id === lastClicked);
        const endIdx = col.findIndex((c) => c.id === id);
        if (startIdx !== -1 && endIdx !== -1) {
          const [a, b] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          const range = col.slice(a, b + 1).map((c) => c.id);
          setSelected((prev) => new Set([...prev, ...range]));
          return;
        }
      }

      if (isMeta) {
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
        setLastClicked(id);
        return;
      }

      // Plain click: open detail; if part of selection, keep selection
      if (selected.size <= 1) {
        setSelected(new Set([id]));
        setLastClicked(id);
        setDetail(claim);
      } else {
        setDetail(claim);
      }
    },
    [byStatus, lastClicked, selected],
  );

  const clearSelection = () => setSelected(new Set());

  const onDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    setActiveId(id);
    // If dragging an unselected card, replace selection with just that card
    if (!selected.has(id)) setSelected(new Set([id]));
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    setOverCol(null);
    if (!e.over) return;
    const target = String(e.over.id) as ClaimStatus;
    const dragId = String(e.active.id);
    const moving = selected.has(dragId) ? Array.from(selected) : [dragId];
    setClaims((prev) => prev.map((c) => (moving.includes(c.id) ? { ...c, status: target } : c)));
  };

  const activeClaim = activeId ? claims.find((c) => c.id === activeId) : null;
  const stackCount = activeId && selected.has(activeId) ? selected.size : 1;

  return (
    <PageTransition>
      <div className="relative px-4 py-6 md:px-6 lg:px-8">
        <div className="mesh-bg"><div className="mesh-orb" /></div>

        <div className="relative mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Claims Board</h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Drag to reassign. Hold <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">⌘</kbd> /
              <kbd className="ml-1 rounded border bg-muted px-1.5 py-0.5 text-[10px]">Ctrl</kbd> to multi-select,
              <kbd className="ml-1 rounded border bg-muted px-1.5 py-0.5 text-[10px]">Shift</kbd> for a range.
            </p>
          </div>

          <AnimatePresence>
            {selected.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="glass-strong flex items-center gap-3 rounded-full px-4 py-2 shadow-[var(--shadow-elegant)]"
              >
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium tabular-nums">{selected.size} selected</span>
                <button onClick={clearSelection} className="text-xs text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading ? (
          <BoardSkeleton columns={4} perCol={3} />
        ) : (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={(e) => setOverCol(e.over ? (String(e.over.id) as ClaimStatus) : null)}
          onDragCancel={() => { setActiveId(null); setOverCol(null); }}
        >
          <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {columns.map((col, ci) => (
              <Column
                key={col.status}
                status={col.status}
                accent={col.accent}
                ring={col.ring}
                items={byStatus[col.status]}
                selected={selected}
                onSelect={handleSelect}
                isOver={overCol === col.status}
                ci={ci}
                activeId={activeId}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
            {activeClaim && <DragStack claim={activeClaim} count={stackCount} />}
          </DragOverlay>
        </DndContext>
        )}
      </div>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <AnimatePresence>
            {detail && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Claim {detail.id}
                  </SheetTitle>
                  <SheetDescription>{detail.description}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4 px-4">
                  <Detail label="Client" value={detail.clientName} />
                  <Detail label="Policy Type" value={detail.policyType} />
                  <Detail label="Amount" value={`$${detail.amount.toLocaleString()}`} />
                  <Detail label="Status" value={detail.status} />
                  <Detail label="Severity" value={detail.severity} />
                  <Detail label="Days Open" value={`${detail.daysOpen} days`} />
                  <Detail label="Filed" value={new Date(detail.filedAt).toLocaleDateString()} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </PageTransition>
  );
}

function Column({
  status, accent, ring, items, selected, onSelect, isOver, ci, activeId,
}: {
  status: ClaimStatus;
  accent: string;
  ring: string;
  items: Claim[];
  selected: Set<string>;
  onSelect: (c: Claim, e: MouseEvent) => void;
  isOver: boolean;
  ci: number;
  activeId: string | null;
}) {
  const { setNodeRef } = useDroppable({ id: status });
  const dragActive = activeId !== null;
  const activeInSelection = dragActive && selected.has(activeId!);
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0 }}
      className="flex flex-col"
    >
      <div className={cn("mb-3 flex items-center justify-between rounded-xl border bg-gradient-to-b px-3 py-2.5", accent, ring)}>
        <span className="text-sm font-semibold tracking-tight">{status}</span>
        <span className="rounded-full bg-background/70 px-2 py-0.5 text-xs font-medium tabular-nums">{items.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "relative min-h-[180px] flex-1 space-y-2.5 rounded-xl p-2 transition-all duration-300",
          isOver && "bg-primary/5 ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
        )}
      >
        {items.map((c) => {
          // Fade all selected items while any of them is being dragged
          const dimmed = activeInSelection && selected.has(c.id) && c.id !== activeId;
          return (
            <DraggableCard key={c.id} claim={c} selected={selected.has(c.id)} onSelect={onSelect} dimmed={dimmed} />
          );
        })}
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed py-10 text-center text-xs text-muted-foreground">
            Drop here
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DraggableCard({
  claim, selected, onSelect, dimmed,
}: { claim: Claim; selected: boolean; onSelect: (c: Claim, e: MouseEvent) => void; dimmed?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: claim.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => onSelect(claim, e)}
      className={cn(
        "group relative cursor-grab select-none transition-opacity duration-200 active:cursor-grabbing",
        isDragging && "opacity-30",
        dimmed && "opacity-30",
      )}
    >
      <Card
        className={cn(
          "relative overflow-hidden border bg-card/80 backdrop-blur-sm transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]",
          selected && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[var(--shadow-elegant)]",
        )}
      >
        <span className={cn("absolute left-0 top-0 h-full w-1", severityStripe[claim.severity])} />
        <div className="absolute right-2 top-2 text-muted-foreground/30 opacity-0 transition-opacity group-hover:opacity-100">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <CardContent className="space-y-2 p-4 pl-5">
          <div className="flex items-center justify-between pr-5">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">{claim.id}</span>
            <Badge variant="outline" className="text-[10px]">{claim.policyType}</Badge>
          </div>
          <p className="text-sm font-semibold leading-tight">{claim.clientName}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{claim.description}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold tabular-nums">${claim.amount.toLocaleString()}</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />{claim.daysOpen}d
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DragStack({ claim, count }: { claim: Claim; count: number }) {
  return (
    <div className="relative w-[280px]">
      {count > 1 && (
        <>
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl border bg-card/60 backdrop-blur" />
          <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-xl border bg-card/80 backdrop-blur" />
        </>
      )}
      <Card className="relative overflow-hidden border drag-glow bg-card/95 backdrop-blur">
        <span className={cn("absolute left-0 top-0 h-full w-1", severityStripe[claim.severity])} />
        <CardContent className="space-y-2 p-4 pl-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">{claim.id}</span>
            <Badge variant="outline" className="text-[10px]">{claim.policyType}</Badge>
          </div>
          <p className="text-sm font-semibold leading-tight">{claim.clientName}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold tabular-nums">${claim.amount.toLocaleString()}</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />{claim.daysOpen}d
            </span>
          </div>
        </CardContent>
      </Card>
      {count > 1 && (
        <div className="absolute -right-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-lifted)]">
          +{count - 1}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
