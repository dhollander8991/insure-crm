import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import clsx from "clsx";

import styles from "./KpiCard.module.css";

import { Card } from "@/components/ui/Card";

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
    <span ref={ref} className={styles.countUp}>
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
      className={styles.perspective}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={styles.tilt}
      >
        <Card className={styles.card}>
          <div className={styles.glowTop} />
          <div className={styles.glowHover} />
          <div className={styles.inner}>
            <div className={styles.textGroup}>
              <p className={styles.label}>{label}</p>
              <p className={isLargeValue ? styles.valueSm : styles.valueLg}>
                <CountUp to={value} prefix={prefix} suffix={suffix} />
              </p>
              <div
                className={clsx(
                  styles.delta,
                  up ? styles.deltaUp : styles.deltaDown,
                )}
              >
                {up ? (
                  <ArrowUpRight className={styles.deltaIcon} />
                ) : (
                  <ArrowDownRight className={styles.deltaIcon} />
                )}
                {up ? "+" : ""}
                {delta}% vs last month
              </div>
            </div>
            <div className={styles.iconWrap}>
              <Icon className={styles.kpiIcon} />
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
