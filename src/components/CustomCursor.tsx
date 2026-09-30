import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence, useMotionTemplate } from 'motion/react';

const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 300 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const flashlightBackground = useMotionTemplate`radial-gradient(400px circle at ${cursorX}px ${cursorY}px, rgba(185, 28, 28, 0.05) 0%, transparent 80%)`;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);

      const target = e.target as HTMLElement;
      const hoverData = target.closest('[data-cursor]')?.getAttribute('data-cursor');
      
      if (hoverData) {
        setCursorText(hoverData);
        setIsHovering(true);
      } else {
        setCursorText('');
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed top-0 left-0 flex items-center justify-center pointer-events-none z-[10000] mix-blend-difference hidden lg:flex"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              x: cursorX,
              y: cursorY,
              translateX: '-50%',
              translateY: '-50%',
            }}
          >
            {/* Inner Dot / Label Container */}
            <motion.div
              animate={{
                width: isHovering ? 100 : 8,
                height: isHovering ? 100 : 8,
                backgroundColor: isHovering ? 'rgba(255,255,255,0.1)' : 'var(--crimson)',
                border: isHovering ? '1px solid rgba(255,255,255,0.3)' : 'none',
              }}
              className="rounded-full flex items-center justify-center transition-all duration-300"
            >
              {isHovering && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] font-mono font-black tracking-widest text-white uppercase text-center"
                >
                  {cursorText}
                </motion.span>
              )}
            </motion.div>

            {/* Outer Crosshair / Ring */}
            <motion.div
              animate={{
                scale: isHovering ? 1.2 : 1,
                opacity: isHovering ? 0 : 0.5,
                rotate: isHovering ? 90 : 0,
              }}
              className="absolute w-12 h-12 border border-[var(--crimson)] rounded-full flex items-center justify-center"
            >
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-[var(--crimson)]" />
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-[var(--crimson)]" />
               <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-2 bg-[var(--crimson)]" />
               <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-2 bg-[var(--crimson)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Dynamic Flashlight */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-[9998] hidden lg:block"
        style={{
          background: flashlightBackground,
        }}
      />
    </>
  );
};

export default CustomCursor;
