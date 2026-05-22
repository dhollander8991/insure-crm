import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Top-of-viewport progress bar that appears whenever the router is
 * loading/transitioning to a new route. Keeps navigation feeling responsive
 * even when a loader is still resolving data.
 */
export function RouteProgress() {
  const status = useRouterState({ select: (s) => s.status });
  const isPending = status !== "idle";

  // Delay showing the bar slightly so instant navigations don't flash it.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!isPending) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [isPending]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="route-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: ["-100%", "30%", "100%"] }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
