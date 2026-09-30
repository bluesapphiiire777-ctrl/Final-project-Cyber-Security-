import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useVelocity, useAnimationFrame, useMotionValue } from 'motion/react';
import { wrap } from 'motion';

interface VelocityStripProps {
  text: string;
  baseVelocity: number;
}

function ParallaxText({ text, baseVelocity = 100 }: VelocityStripProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 400,
    damping: 50
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((_t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap py-8 border-y border-white/5 bg-black/20 backdrop-blur-sm">
      <motion.div className="flex flex-nowrap gap-12 text-6xl md:text-9xl font-display font-black uppercase tracking-tighter italic text-white/5" style={{ x }}>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
      </motion.div>
    </div>
  );
}

export default function VelocityStrip() {
  return (
    <div className="relative z-0">
      <ParallaxText text="EVIDENCE — TRACE — ANALYZE — CORRELATE — RECONSTRUCT — INTELLIGENCE — " baseVelocity={-2} />
    </div>
  );
}
