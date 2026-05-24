import { motion } from "framer-motion";

import { pipelineData } from "@/lib/mock-data";

export function PipelineFunnel() {
  const max = Math.max(...pipelineData.map((d) => d.count));
  return (
    <div className="space-y-3 py-2">
      {pipelineData.map((d, i) => {
        const pct = (d.count / max) * 100;
        return (
          <div key={d.stage} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{d.stage}</span>
              <span className="text-muted-foreground">{d.count}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full rounded-full"
                style={{ background: "var(--gradient-primary)" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
