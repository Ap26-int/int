import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          data-testid="preloader"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[hsl(var(--obsidian))]"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: "-100%",
            transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          <div className="flex flex-col items-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[hsl(var(--gold))] tracking-luxury text-[10px] uppercase"
            >
              Lumière By Sambita Bose
            </motion.div>
            <motion.div
              className="font-display text-[hsl(var(--ivory))] text-5xl md:text-7xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              <span className="italic">Lumière</span>
            </motion.div>
            <div className="w-40 h-px overflow-hidden bg-[hsl(var(--border))] relative">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[hsl(var(--gold))]"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
