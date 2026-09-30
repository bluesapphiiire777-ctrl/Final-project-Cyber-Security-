import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import Act1Hero from './acts/Act1Hero';
import Act2Problem from './acts/Act2Problem';
import Act3Benefits from './acts/Act3Benefits';
import Act4Workflow from './acts/Act4Workflow';
import Act5EvidenceBoard from './acts/Act5EvidenceBoard';
import Act6Telemetry from './acts/Act6Telemetry';
import Act7Footer from './acts/Act7Footer';
import Act8Timeline from './acts/Act8Timeline';
import Act9Reconstruction from './acts/Act9Reconstruction';
import Act10Graph from './acts/Act10Graph';
import Act11FourPhase from './acts/Act11FourPhase';
import CustomCursor from './CustomCursor';
import Navbar from './Navbar';
import Preloader from './Preloader';
import VelocityStrip from './VelocityStrip';
import LensSection from './LensSection';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Preloader />
      
      <div className={`relative min-h-screen bg-transparent overflow-x-hidden ${isLoading ? 'h-screen overflow-hidden' : ''}`}>
        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--crimson)] z-[600] origin-left"
          style={{ scaleX }}
        />

        {/* INTRODUCTION */}
        <Act1Hero />

        {/* THE INVESTIGATION - PROBLEM */}
        <LensSection id="problem">
          <Act2Problem />
        </LensSection>

        <VelocityStrip />

        {/* THE APPROACH */}
        <Act3Benefits />

        {/* EVIDENCE INGESTION & WORKFLOW */}
        <LensSection id="workflow">
          <Act4Workflow />
        </LensSection>

        {/* EVIDENCE BOARD */}
        <Act5EvidenceBoard />

        {/* TIMELINE ENGINE */}
        <Act8Timeline />

        {/* ANALYSIS & TELEMETRY */}
        <Act6Telemetry />

        {/* 3D RECONSTRUCTION */}
        <LensSection id="reconstruction">
          <Act9Reconstruction />
        </LensSection>

        {/* VISUAL INTELLIGENCE GRAPH */}
        <Act10Graph />

        {/* FOUR PHASE FLOW */}
        <Act11FourPhase />

        {/* FINAL INTELLIGENCE / FOOTER */}
        <Act7Footer />
      </div>
    </>
  );
}
