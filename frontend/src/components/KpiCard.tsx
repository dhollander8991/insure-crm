import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

function CountUp({
  to,
  prefix = "",
  suffix = "",
}: {
  to: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1200, bounce: 0 });
  const rounded = useTransform(spring, (v) => {
    const n = Math.round(v);
    return `${prefix}${n.toLocaleString()}${suffix}`;
  });
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  useEffect(() => rounded.on("change", setDisplay), [rounded]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delta: number;
  icon: LucideIcon;
  index?: number;
}

export function KpiCard({
  label,
  value,
  prefix,
  suffix,
  delta,
  icon: Icon,
  index = 0,
}: KpiCardProps) {
  const up = delta >= 0;
  const ref = useRef<HTMLDivElement>(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 200, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 200, damping: 18 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 12);
    rx.set(-py * 12);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const isLargeValue = String(value).length >= 7 || Boolean(prefix);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="perspective-1200"
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="tilt-card"
      >
        <Card className="relative overflow-hidden p-5 transition-shadow duration-300 hover:shadow-[var(--shadow-lifted)]">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-20 blur-2xl"
            style={{ background: "var(--gradient-primary)" }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--primary) 15%, transparent), transparent 60%)",
            }}
          />
          <div
            className="relative flex items-start justify-between gap-3"
            style={{ transform: "translateZ(30px)" }}
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p
                className={cn(
                  "font-semibold tracking-tight tabular-nums leading-none",
                  isLargeValue ? "text-3xl" : "text-4xl",
                )}
              >
                <CountUp to={value} prefix={prefix} suffix={suffix} />
              </p>
              <div
                className={cn(
                  "inline-flex flex-wrap items-center gap-1 text-xs font-medium",
                  up ? "text-success" : "text-destructive",
                )}
              >
                {up ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {up ? "+" : ""}
                {delta}% vs last month
              </div>
            </div>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-elegant)]"
              style={{
                background: "var(--gradient-primary)",
                transform: "translateZ(50px)",
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
