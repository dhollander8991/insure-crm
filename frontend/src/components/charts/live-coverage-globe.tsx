import { motion } from "framer-motion";
import { Globe2 } from "lucide-react";
import { Card } from "@/components/ui/card";

// Stylized "live coverage" 3D globe — pure CSS/SVG, no extra deps.
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
    <Card
      className="relative h-full overflow-hidden border-0 p-6 text-primary-foreground"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="absolute inset-0 opacity-40 bg-aurora mix-blend-screen" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider opacity-80">Live Coverage</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">Global Reach</h3>
        </div>
        <Globe2 className="h-5 w-5 opacity-80" />
      </div>

      <div className="relative mx-auto my-6 flex h-56 w-56 items-center justify-center">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl" />

        {/* Rotating wireframe sphere */}
        <motion.div
          className="absolute inset-0 rounded-full border border-white/30"
          style={{ boxShadow: "inset 0 0 60px rgba(255,255,255,0.15), inset -20px -20px 60px rgba(0,0,0,0.25)" }}
        />
        <div className="absolute inset-0 animate-spin-slow">
          <div className="absolute inset-0 rounded-full border border-white/15" />
          <div className="absolute inset-4 rounded-full border border-white/15" />
          <div className="absolute inset-10 rounded-full border border-white/20" />
          {/* meridians */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/15" />
          <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-white/15" />
          <div className="absolute inset-0 rounded-full border-x border-white/10" style={{ transform: "rotateY(60deg)" }} />
          <div className="absolute inset-0 rounded-full border-x border-white/10" style={{ transform: "rotateY(-60deg)" }} />
        </div>

        {/* Orbiting accent dot */}
        <div className="absolute inset-0 animate-spin-slower">
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_12px_3px_rgba(255,255,255,0.7)]" />
          </div>
        </div>

        {/* Pulsing pins */}
        {pins.map((p, i) => (
          <div key={p.label} className="absolute" style={{ top: p.top, left: p.left }}>
            <span
              className="absolute -inset-1 rounded-full bg-white"
              style={{ animation: `pulse-ring 2.4s ${i * 0.35}s ease-out infinite` }}
            />
            <span className="relative block h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" />
          </div>
        ))}
      </div>

      <div className="relative flex items-end justify-between text-xs">
        <div>
          <p className="opacity-70">Active regions</p>
          <p className="text-lg font-semibold tabular-nums">24</p>
        </div>
        <div className="rounded-full bg-white/15 px-2.5 py-1 font-medium backdrop-blur-sm">+3 new</div>
      </div>
    </Card>
  );
}
