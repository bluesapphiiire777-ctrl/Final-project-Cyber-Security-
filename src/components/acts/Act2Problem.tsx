import { useRef } from 'react';
import { motion } from 'motion/react';
import { Search, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

export default function Act2Problem() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="problem" ref={containerRef} className="relative py-20 md:py-32 bg-transparent overflow-hidden">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 blueprint-grid opacity-30" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12">
        <div className="space-y-16 md:space-y-20">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-600/10 border border-red-500/30 text-red-500 font-mono text-xs tracking-[0.2em] uppercase font-bold"
            >
              <AlertTriangle size={14} />
              SECTION_01 // THE INVESTIGATIVE CHALLENGE
            </motion.div>
            
            <h2 className="text-white text-3xl sm:text-5xl md:text-6xl font-display font-black leading-tight tracking-tight uppercase">
              DIGITAL EVIDENCE <br className="hidden sm:inline" />
              IS EVERYWHERE. <br />
              <span className="text-amber-400 italic font-editorial">BUT INTELLIGENCE IS FRAGMENTED.</span>
            </h2>

            <p className="text-zinc-300 font-mono text-sm sm:text-base max-w-3xl leading-relaxed">
              Modern cyber and criminal investigations span mobile extractions, network PCAPs, cloud snapshots, 
              and hard drive images. Without structured correlation, critical clues remain buried in silos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Main Narrative & Metrics */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-[#14151e]/90 border border-zinc-800 p-6 sm:p-8 rounded-lg space-y-6">
                <h3 className="text-white text-lg sm:text-xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
                  <ShieldAlert className="text-red-500" size={20} />
                  The Cost of Tool & Format Silos
                </h3>
                <p className="text-zinc-300 text-sm sm:text-base font-sans leading-relaxed">
                  Digital investigations typically involve large volumes of heterogeneous evidence from differing vendor formats 
                  (E01, RAW, JSON, SQLite, PCAP). Investigators need a unified environment to ingest, verify SHA-256 integrity, 
                  and link timestamps across disparate devices.
                </p>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                   <div className="space-y-1">
                      <div className="text-red-400 font-mono text-xs font-bold uppercase">FRAGMENTATION INDEX</div>
                      <div className="text-white text-2xl sm:text-3xl font-display font-black tracking-tight">84.2%</div>
                      <div className="text-zinc-400 text-xs font-mono">Uncorrelated artifacts</div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-amber-400 font-mono text-xs font-bold uppercase">TIME-TO-INSIGHT</div>
                      <div className="text-white text-2xl sm:text-3xl font-display font-black tracking-tight">12.5 DAYS</div>
                      <div className="text-zinc-400 text-xs font-mono">Industry average per case</div>
                   </div>
                </div>
              </div>
            </div>

            {/* Tactical Live Inspection Card */}
            <div className="lg:col-span-5 relative">
               <div className="bg-[#14151e] border-2 border-red-600/40 p-6 sm:p-8 rounded-lg relative overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.15)]">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Cpu size={80} className="text-red-500" />
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                     <div className="flex justify-between items-start">
                        <div className="text-red-500">
                           <Search size={32} />
                        </div>
                        <span className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                           LIVE BENCHMARK
                        </span>
                     </div>

                     <div className="space-y-3">
                        <div className="text-white text-lg font-display font-black uppercase tracking-tight">DEMO_CASE: FIP-0x001</div>
                        <p className="text-zinc-300 font-mono text-xs uppercase leading-relaxed">
                           Analyzing 2.4TB of synthetic multi-source artifacts. F.I.P automated entity linking resolves fragmented records in under 4 minutes.
                        </p>
                     </div>

                     <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-400">STATUS:</span>
                        <span className="text-emerald-400 font-bold">SYSTEM ACTIVE</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
