import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Fingerprint, Search, Shield, Hash, FileText } from 'lucide-react';

export default function DossierWorkspace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMagnifierPos({ x, y });
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-[#E6DFD3] paper-texture overflow-hidden flex items-center justify-center cursor-none"
    >
      {/* 3D Focal Point: The Case File */}
      <motion.div 
        initial={{ rotate: -2, y: 50, opacity: 0 }}
        whileInView={{ rotate: -1, y: 0, opacity: 1 }}
        className="relative w-[600px] h-[800px] bg-[#F4EFE6] shadow-[40px_40px_80px_rgba(0,0,0,0.1)] border-x-8 border-y-2 border-[#D2C8B8] p-12 flex flex-col gap-8"
      >
        <div className="flex justify-between items-start border-b-4 border-[#111111] pb-8">
          <div className="space-y-2">
            <h2 className="font-stencil text-5xl text-[#111111] tracking-tighter uppercase">CASE_FILE_ALPHA</h2>
            <div className="font-typewriter text-xs text-[#111111]/60 tracking-widest">REF: SEC_DOC_882 // CLASSIFIED</div>
          </div>
          <div className="w-20 h-20 bg-[#D91A2A] text-white flex items-center justify-center font-stencil text-3xl shadow-xl">
            TOP
          </div>
        </div>

        {/* Evidence Node: Fingerprint */}
        <div className="relative flex-1 bg-black/5 flex items-center justify-center group overflow-hidden border-2 border-black/5">
          <Fingerprint size={300} className="text-[#111111]/10 group-hover:text-[#D91A2A]/20 transition-colors duration-1000" />
          <div className="absolute inset-0 halftone opacity-5" />
          
          {/* Crimson Scanning Line */}
          <motion.div 
            animate={{ y: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            className="absolute left-0 w-full h-[2px] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] z-10"
          />
        </div>

        <div className="space-y-6 font-typewriter text-sm text-[#111111]/80">
          <p>This document serves as the primary chain of custody record for Artifact CR-2026-FIP-01. Any unauthorized modification to this ledger will trigger an immediate sharding alert across the Bureau network.</p>
          <div className="flex justify-between items-end pt-12">
            <div className="space-y-1">
              <div className="text-[10px] opacity-40 uppercase">INVESTIGATOR_STAMP</div>
              <div className="font-handwritten text-4xl text-[#111111]/30">Jameson.W</div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-[10px] opacity-40 uppercase">LEDGER_HASH</div>
              <div className="font-stencil text-xs text-red-600">8F2E1A92B3C4D5E6F7G8</div>
            </div>
          </div>
        </div>

        {/* Binder Clip */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-12 bg-zinc-600 shadow-lg rounded-t-lg border-b-8 border-zinc-700" />
      </motion.div>

      {/* Magnifying Glass Refraction Effect */}
      <div 
        className="absolute w-72 h-72 rounded-full border-[12px] border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.4)] pointer-events-none z-50 overflow-hidden"
        style={{ 
          left: `${magnifierPos.x}%`, 
          top: `${magnifierPos.y}%`, 
          transform: 'translate(-50%, -50%)',
          backdropFilter: 'blur(2px) contrast(1.3) brightness(1.1) saturate(1.4) scale(1.1)',
        }}
      >
        <div className="absolute inset-0 bg-red-600/5" />
        <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]" />
      </div>

      {/* Pinned Elements Floating around */}
      <div className="absolute inset-0 pointer-events-none">
        <PinnedEvidence 
          top="10%" 
          left="5%" 
          rotation={-15} 
          title="SURVEILLANCE_NODE_A" 
          image="https://picsum.photos/seed/surv1/200/250" 
        />
        <PinnedEvidence 
          top="60%" 
          left="80%" 
          rotation={10} 
          title="BALLISTICS_REPORT_X" 
          image="https://picsum.photos/seed/ball1/200/250" 
        />
        <PinnedEvidence 
          top="15%" 
          left="75%" 
          rotation={5} 
          title="SUSPECT_INTEL_88" 
          image="https://picsum.photos/seed/susp1/200/250" 
        />
      </div>

      {/* Dynamic Instruction Overlay */}
      <div className="absolute bottom-12 right-12 font-stencil text-[#111111]/40 text-xs tracking-widest">
        USE_MAGNIFIER_TO_REVEAL_HIDDEN_METADATA
      </div>
    </section>
  );
}

function PinnedEvidence({ top, left, rotation, title, image }: { top: string, left: string, rotation: number, title: string, image: string }) {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      className="absolute bg-[#F4EFE6] p-2 shadow-xl border border-black/5"
      style={{ top, left, transform: `rotate(${rotation}deg)` }}
    >
      <div className="w-40 h-48 overflow-hidden grayscale contrast-125 mb-2 halftone">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="font-stencil text-[8px] text-[#111111] uppercase tracking-tighter text-center">{title}</div>
      {/* Red String Connection (Visual only) */}
      <div className="absolute top-0 left-1/2 w-[1px] h-40 bg-[#D91A2A]/40 -translate-y-full origin-bottom" style={{ transform: `rotate(${-rotation}deg)` }} />
    </motion.div>
  );
}
