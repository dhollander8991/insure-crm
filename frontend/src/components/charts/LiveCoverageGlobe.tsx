import { motion } from "framer-motion";
import { Globe2 } from "lucide-react";

import styles from "./LiveCoverageGlobe.module.css";

import { Card } from "@/components/ui/Card";

const pins = [
  { top: "28%", left: "22%", label: "NYC" },
  { top: "34%", left: "48%", label: "LDN" },
  { top: "42%", left: "70%", label: "TYO" },
  { top: "60%", left: "30%", label: "SAO" },
  { top: "55%", left: "82%", label: "SYD" },
  { top: "20%", left: "60%", label: "BER" },
];

export function LiveCoverageGlobe() {
  return (
    <Card className={styles.card}>
      <div className={styles.aurora} />

      <div className={styles.header}>
        <div>
          <p className={styles.headerTitle}>Live Coverage</p>
          <h3 className={styles.headerHeading}>Global Reach</h3>
        </div>
        <Globe2 className="h-5 w-5 opacity-80" />
      </div>

      <div className={styles.globeWrap}>
        <div className={styles.glow} />

        <motion.div
          className={styles.sphere}
          style={{
            boxShadow:
              "inset 0 0 60px rgba(255,255,255,0.15), inset -20px -20px 60px rgba(0,0,0,0.25)",
          }}
        />
        <div className={styles.wireframe}>
          <div className={styles.wireRingOuter} />
          <div className={styles.wireRingMid} />
          <div className={styles.wireRingInner} />
          <div className={styles.meridianV} />
          <div className={styles.meridianH} />
          <div
            className="absolute inset-0 rounded-full border-x border-white/10"
            style={{ transform: "rotateY(60deg)" }}
          />
          <div
            className="absolute inset-0 rounded-full border-x border-white/10"
            style={{ transform: "rotateY(-60deg)" }}
          />
        </div>

        <div className={styles.orbit}>
          <div className={styles.orbitDotWrap}>
            <div className={styles.orbitDot} />
          </div>
        </div>

        {pins.map((p, i) => (
          <div
            key={p.label}
            className={styles.pin}
            style={{ top: p.top, left: p.left }}
          >
            <span
              className={styles.pinPulse}
              style={{
                animation: `pulse-ring 2.4s ${i * 0.35}s ease-out infinite`,
              }}
            />
            <span className={styles.pinDot} />
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div>
          <p className={styles.footerLabel}>Active regions</p>
          <p className={styles.footerValue}>24</p>
        </div>
        <div className={styles.footerBadge}>+3 new</div>
      </div>
    </Card>
  );
}
