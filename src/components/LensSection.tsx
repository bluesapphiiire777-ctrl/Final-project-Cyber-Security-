import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, ReactNode } from 'react';

interface LensSectionProps {
  children: ReactNode;
  id?: string;
}

export default function LensSection({ children, id }: LensSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Gentle depth transformation without ever hiding content
  const y = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section 
      id={id} 
      ref={containerRef} 
      className="relative min-h-screen overflow-hidden bg-transparent"
    >
      <motion.div 
        style={{ y }}
        className="relative z-10 w-full"
      >
        {children}
      </motion.div>
    </section>
  );
}
