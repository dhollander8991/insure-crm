import { motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";

export function PageTransition({ children }: { children: React.ReactNode }) {
  // Key the motion div by pathname so the animation replays on route changes
  // without an opacity flash (kept subtle to avoid the prior "bleep" bug).
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0"
    >
      {children}
    </motion.div>
  );
}
