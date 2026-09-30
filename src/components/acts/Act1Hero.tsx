import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown, Shield, Database, Activity, Cpu, KeyRound, Fingerprint, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Act1Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.5]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section 
      id="hero" 
      ref={containerRef} 
      className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-center items-center pt-24 pb-16 overflow-hidden"
    >
      {/* BACKGROUND FORENSIC GRAPH */}
      <motion.div 
        style={{ scale: bgScale, opacity: bgOpacity }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute inset-0 blueprint-grid opacity-40" />
        
        {/* Stylized Forensic Graph */}
        <div className="absolute inset-0 flex items-center justify-center opacity-70">
           <svg width="100%" height="100%" viewBox="0 0 1000 800" className="w-full max-w-5xl h-full">
              <defs>
                 <linearGradient id="heroLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity="0.8" />
                 </linearGradient>
              </defs>
              <g>
                 {/* Central Node */}
                 <circle cx="500" cy="400" r="6" fill="#DC2626" />
                 <circle cx="500" cy="400" r="45" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.4" className="animate-spin-slow" />
                 <circle cx="500" cy="400" r="90" stroke="#F59E0B" strokeWidth="1" strokeDasharray="8 8" fill="none" opacity="0.25" />
                 
                 {/* Sub Nodes */}
                 {[
                   { x: 260, y: 240, label: "DEVICE_NODE_01" },
                   { x: 740, y: 240, label: "NETWORK_TRACE" },
                   { x: 280, y: 560, label: "MEMORY_DUMP" },
                   { x: 720, y: 560, label: "FILE_ARTIFACT" }
                 ].map((node, i) => (
                   <g key={i}>
                      <line x1="500" y1="400" x2={node.x} y2={node.y} stroke="url(#heroLineGrad)" strokeWidth="1" />
                      <circle cx={node.x} cy={node.y} r="5" fill="#F59E0B" />
                      <circle cx={node.x} cy={node.y} r="12" stroke="#F59E0B" strokeWidth="1" fill="none" opacity="0.3" />
                      <text x={node.x + 16} y={node.y + 4} fill="#E5E7EB" fontSize="11" fontFamily="monospace" fontWeight="bold" opacity="0.85">{node.label}</text>
                   </g>
                 ))}
              </g>
           </svg>
        </div>
      </motion.div>

      {/* HERO CONTENT */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 sm:px-12 w-full text-center">
        <motion.div style={{ y: textY }} className="space-y-6">
          <div className="flex flex-col items-center">
            
            {/* Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-xs tracking-[0.25em] uppercase font-bold mb-6 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              FORENSICS INTO INTELLIGENCE
            </motion.div>

            {/* Main Headline - Properly Proportioned */}
            <h1 className="text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black leading-[1.02] tracking-tight uppercase mb-6">
               <motion.span
                 initial={{ y: 30, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                 className="block"
               >
                 EVERY TRACE
               </motion.span>
               <motion.span
                 initial={{ y: 30, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                 className="block italic font-editorial text-red-500"
               >
                 TELLS A STORY.
               </motion.span>
            </h1>

            {/* Subtitle with High Contrast */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-zinc-200 font-mono text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed tracking-normal font-medium"
            >
              A unified platform for digital evidence, automated timeline correlation, 
              and actionable forensic intelligence. Built for modern investigative excellence.
            </motion.p>
          </div>

          {/* Action / CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="pt-8 flex flex-wrap justify-center items-center gap-4"
          >
            <Link 
              to="/signin"
              className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(220,38,38,0.5)] flex items-center gap-2 rounded-lg"
            >
              <KeyRound size={15} />
              <span>SIGN IN TO VAULT</span>
              <ArrowRight size={14} />
            </Link>
            <Link 
              to="/signup"
              className="px-8 py-3.5 border border-zinc-700 hover:border-red-500 bg-zinc-900/80 text-zinc-200 hover:text-white font-mono text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 rounded-lg"
            >
              <Fingerprint size={15} className="text-amber-400" />
              <span>CREATE ACCOUNT</span>
            </Link>
            <a 
              href="#problem"
              className="px-6 py-3.5 border border-zinc-800 hover:border-zinc-700 bg-black/40 text-zinc-400 hover:text-zinc-200 font-mono text-xs font-bold uppercase tracking-widest transition-all rounded-lg"
            >
              EXPLORE PIPELINE
            </a>
          </motion.div>

          {/* Scroll Down Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="pt-10 flex flex-col items-center gap-2"
          >
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em] font-semibold">Scroll to Investigate</div>
            <ChevronDown className="text-red-500 animate-bounce" size={18} />
          </motion.div>
        </motion.div>
      </div>

      {/* FOOTER METADATA STRIP */}
      <div className="w-full max-w-6xl mx-auto px-6 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
             {[Shield, Database, Activity, Cpu].map((Icon, i) => (
               <div key={i} className="w-7 h-7 border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-400">
                  <Icon size={13} />
               </div>
             ))}
          </div>
          <span className="font-semibold text-zinc-300">FIP_PROTOCOL_V4.2 // ALL NODES VERIFIED</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-red-500 font-bold tracking-wider uppercase">CONFIDENTIAL</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-300">Bureau of Forensic Integrity</span>
        </div>
      </div>
    </section>
  );
}
