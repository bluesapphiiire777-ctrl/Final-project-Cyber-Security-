import { useRef } from 'react';
import { motion } from 'motion/react';
import { Search, Brain, Share2, FileCheck, Layers, Terminal, ArrowRight } from 'lucide-react';

const tools = [
  { name: 'AUTOPSY', status: 'COMPATIBLE', detail: 'File System & Disk Image Analysis' },
  { name: 'VOLATILITY 3', status: 'COMPATIBLE', detail: 'Volatile RAM & Kernel Artifacts' },
  { name: 'WIRESHARK / TSHARK', status: 'COMPATIBLE', detail: 'Network PCAP Deep Packet Inspection' },
];

export default function Act6Telemetry() {
  return (
    <section id="analysis" className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12">
        
        {/* SECTION 04: ANALYSIS ENGINE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-[0.25em] uppercase font-bold">
                SECTION_04 // ANALYSIS ENGINE
              </div>
              <h2 className="text-white text-3xl sm:text-5xl font-display font-black tracking-tight uppercase leading-tight">
                ANALYSIS<br />
                <span className="text-red-500 italic font-editorial">ENGINE.</span>
              </h2>
            </motion.div>

            <p className="text-zinc-300 font-mono text-sm sm:text-base leading-relaxed">
              Process heterogeneous forensic artifacts through specialized analysis modules. 
              F.I.P normalizes raw outputs from standard forensics frameworks into a single structured temporal graph.
            </p>

            <div className="space-y-3">
              {tools.map((tool) => (
                <div key={tool.name} className="p-4 bg-[#14151e]/90 border border-zinc-800 rounded-lg flex justify-between items-center group hover:border-zinc-700 transition-all">
                  <div className="space-y-0.5">
                    <div className="text-white text-sm font-mono font-bold">{tool.name}</div>
                    <div className="text-xs font-mono text-zinc-400">{tool.detail}</div>
                  </div>
                  <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded font-bold">
                    {tool.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
             {/* Technical Workflow Visualization */}
             <div className="p-6 sm:p-8 bg-[#14151e]/90 border border-zinc-800 rounded-lg space-y-8 shadow-xl">
                <div className="flex items-center gap-4 pb-4 border-b border-zinc-800">
                   <div className="p-3 bg-red-600/10 text-red-500 rounded">
                      <Layers size={22} />
                   </div>
                   <div>
                      <div className="text-white text-base sm:text-lg font-display font-bold uppercase tracking-tight">Intelligence Normalization Pipeline</div>
                      <div className="text-zinc-400 font-mono text-xs">Continuous ingestion to multi-modal correlation</div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                   <div className="p-4 bg-black/40 border border-zinc-800 rounded-lg space-y-2">
                      <div className="text-amber-400 font-mono text-xs font-bold uppercase">1. ARTIFACT</div>
                      <div className="text-zinc-300 text-xs font-mono">Raw Disk / Memory</div>
                   </div>
                   <div className="p-4 bg-black/40 border border-zinc-800 rounded-lg space-y-2">
                      <div className="text-amber-400 font-mono text-xs font-bold uppercase">2. NORMALIZE</div>
                      <div className="text-zinc-300 text-xs font-mono">Universal Schema</div>
                   </div>
                   <div className="p-4 bg-red-600/10 border border-red-500/40 rounded-lg space-y-2">
                      <div className="text-red-400 font-mono text-xs font-bold uppercase">3. F.I.P CORE</div>
                      <div className="text-zinc-200 text-xs font-mono font-bold">Correlated Graph</div>
                   </div>
                </div>

                <div className="p-4 bg-black/50 border-l-4 border-red-500 rounded text-xs font-mono text-zinc-300 space-y-1">
                   <div className="text-zinc-500">LIVE PARSER CONSOLE:</div>
                   <div className="text-emerald-400 font-semibold">&gt; Loaded 1,492 MFT records from image.E01 (SHA-256 verified)</div>
                   <div className="text-zinc-400">&gt; Synced with 31,048 packet headers from capture.pcapng</div>
                </div>
             </div>
          </div>
        </div>

        {/* SECTION 06: AI INTELLIGENCE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
           <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="p-6 sm:p-8 bg-[#14151e]/95 border border-zinc-800 rounded-lg space-y-6">
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                       <Brain className="text-red-500" size={22} />
                       <span className="text-sm font-mono text-white tracking-wider uppercase font-bold">AUTOMATED PATTERN CORRELATOR</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30 font-bold">ONLINE</span>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'INPUT', val: 'Heterogeneous Artifacts' },
                      { label: 'CORRELATION', val: 'Identified Clusters' },
                      { label: 'INTELLIGENCE', val: 'High-Confidence Paths' },
                      { label: 'REPORT', val: 'Court-Ready Summary' },
                    ].map((step, i) => (
                      <div key={i} className="p-3 bg-black/40 border border-zinc-800 rounded space-y-1">
                         <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">{step.label}</div>
                         <div className="text-xs font-mono text-zinc-300 font-medium">{step.val}</div>
                      </div>
                    ))}
                 </div>

                 <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                       <div className="text-red-400 font-mono text-xs uppercase font-bold">AUTOMATED ANOMALY DETECTION:</div>
                       <div className="text-white text-xs font-mono font-medium">Critical cross-match: IP 198.51.100.42 linked to suspect UID across 3 distinct machines.</div>
                    </div>
                    <span className="px-2.5 py-1 bg-red-600/30 border border-red-500/40 text-red-300 font-mono text-xs font-bold shrink-0 rounded">
                       98.4% CONFIDENCE
                    </span>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-[0.25em] uppercase font-bold">
                  SECTION_06 // RECONSTRUCTION
                </div>
                <h2 className="text-white text-3xl sm:text-5xl font-display font-black tracking-tight uppercase leading-tight">
                  FROM DATA<br />
                  <span className="text-red-500 italic font-editorial">TO INTEL.</span>
                </h2>
              </motion.div>

              <p className="text-zinc-300 font-mono text-sm sm:text-base leading-relaxed">
                F.I.P bridges the gap between isolated log files and court-ready visual intelligence. 
                Surface hidden lateral movement and identify suspect linkages in seconds.
              </p>
           </div>
        </div>
      </div>
    </section>
  );
}
