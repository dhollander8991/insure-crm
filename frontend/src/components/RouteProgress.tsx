import { useNavigation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import styles from "./layout.module.css";

export function RouteProgress() {
  const navigation = useNavigation();
  const isPending = navigation.state !== "idle";

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
          className={styles.bar}
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: ["-100%", "30%", "100%"] }}
            transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
            className={styles.fill}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
