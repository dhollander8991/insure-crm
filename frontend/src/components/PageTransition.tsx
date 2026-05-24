import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

import styles from "./layout.module.css";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={styles.wrapper}
    >
      {children}
    </motion.div>
  );
}
