import { ReactNode, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import CustomCursor from './CustomCursor';
import BackgroundEngine from './BackgroundEngine';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-transparent text-white overflow-x-hidden selection:bg-[var(--crimson)] selection:text-white">
      <BackgroundEngine />
      
      {/* Top Ticker Marquee */}
      <div className="fixed top-0 left-0 w-full z-[100] bg-[var(--gold)] text-black font-mono text-[10px] font-black uppercase py-1 border-b border-black overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee flex gap-12 items-center py-0.5">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="flex items-center gap-4">
              <span>⚠️ RESTRICTED AREA — SYSTEM ONLINE — ALL NODES SECURE</span>
              <div className="w-1.5 h-1.5 bg-black rotate-45" />
            </span>
          ))}
        </div>
      </div>

      <div className="film-grain" />
      <CustomCursor />

      <main className="relative pt-6">
        {children}
      </main>
    </div>
  );
}
