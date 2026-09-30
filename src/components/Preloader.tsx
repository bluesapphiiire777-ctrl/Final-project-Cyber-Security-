import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200); // Slightly longer to allow for animations
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[1000] bg-[#0B0C10] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Technical Grid Background */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 blueprint-grid"
          />

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Logo Sequence */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="text-white text-7xl font-display font-black tracking-tighter"
              >
                F.I.P
              </motion.h1>
            </div>

            <div className="overflow-hidden">
              <motion.p
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                className="text-[var(--gold)] font-mono text-[10px] tracking-[0.5em] uppercase font-black"
              >
                Forensic Investigation Platform
              </motion.p>
            </div>

            {/* System Engine Reveal */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 mt-8">
              {[
                "EVIDENCE ENGINE",
                "ANALYSIS ENGINE",
                "TIMELINE ENGINE",
                "INTELLIGENCE CORE"
              ].map((label, i) => (
                <div key={label} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      ease: [0.16, 1, 0.3, 1], 
                      delay: 0.5 + (i * 0.1) 
                    }}
                    className="text-white/20 font-mono text-[8px] tracking-widest uppercase font-bold"
                  >
                    {label}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Scanning Line */}
          <motion.div 
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
            className="absolute left-0 w-full h-[1px] bg-[var(--crimson)]/30 z-20"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
