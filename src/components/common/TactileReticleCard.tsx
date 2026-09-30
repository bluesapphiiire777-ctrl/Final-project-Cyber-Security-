import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';

interface TactileReticleCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'amber' | 'emerald' | 'blue' | 'purple' | 'red';
  showReticles?: boolean;
  onClick?: () => void;
}

export const TactileReticleCard: React.FC<TactileReticleCardProps> = ({
  children,
  className = '',
  glowColor = 'amber',
  showReticles = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getGlowRgba = () => {
    switch (glowColor) {
      case 'emerald': return 'rgba(16, 185, 129, 0.12)';
      case 'blue': return 'rgba(59, 130, 246, 0.12)';
      case 'purple': return 'rgba(168, 85, 247, 0.12)';
      case 'red': return 'rgba(239, 68, 68, 0.15)';
      case 'amber':
      default: return 'rgba(245, 158, 11, 0.12)';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative bg-[#0A0D14]/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl ${
        onClick ? 'cursor-pointer hover:border-slate-700' : ''
      } ${className}`}
    >
      {/* Top Edge Micro-Bevel Hairline Highlight */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

      {/* Interactive Radial Hover Spotlight */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${getGlowRgba()}, transparent 70%)`,
          }}
        />
      )}

      {/* Corner Hardware Reticles */}
      {showReticles && (
        <>
          <div className="absolute top-2 left-2 w-2.5 h-2.5 border-l-2 border-t-2 border-white/20 pointer-events-none z-10" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 border-r-2 border-t-2 border-white/20 pointer-events-none z-10" />
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-l-2 border-b-2 border-white/20 pointer-events-none z-10" />
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-r-2 border-b-2 border-white/20 pointer-events-none z-10" />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
};
