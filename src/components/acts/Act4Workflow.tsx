import { useRef } from 'react';
import { motion } from 'motion/react';
import { HardDrive, Cpu, Globe, FileText, Database, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

const sources = [
  { label: 'DISK IMAGE (E01)', icon: HardDrive, id: 'IMG_01', type: 'Raw Bitstream' },
  { label: 'MEMORY DUMP (RAW)', icon: Cpu, id: 'MEM_02', type: 'Volatile RAM' },
  { label: 'NETWORK PCAP', icon: Globe, id: 'PCAP_03', type: 'Packet Stream' },
  { label: 'METADATA & DOCS', icon: FileText, id: 'DOC_04', type: 'File Artifacts' },
];

export default function Act4Workflow() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="workflow" ref={containerRef} className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Header Content */}
          <div className="lg:col-span-5 space-y-6">
             <motion.div
               initial={{ opacity: 0, y: 15 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="space-y-4"
             >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-[0.25em] uppercase font-bold">
                  SECTION_03 // INGESTION ENGINE
                </div>
                
                <h2 className="text-white text-3xl sm:text-5xl font-display font-black tracking-tight uppercase leading-tight">
                  EVIDENCE<br />
                  <span className="text-red-500 italic font-editorial">INGESTION.</span>
                </h2>
             </motion.div>

             <p className="text-zinc-300 font-mono text-sm sm:text-base leading-relaxed">
                Bring heterogeneous forensic evidence into a structured investigation environment while maintaining unbroken traceability. 
                Every artifact is cryptographically hashed with SHA-256 upon arrival.
             </p>

             <div className="p-5 bg-[#14151e] border border-zinc-800 rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="text-emerald-400" size={20} />
                   <span className="text-xs font-mono text-white tracking-wider uppercase font-bold">Cryptographic Chain: VERIFIED</span>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                   SHA-256 ledger synced with immutable local and cloud forensic stores.
                </div>
             </div>
          </div>

          {/* Ingestion Pipeline Visualization */}
          <div className="lg:col-span-7 space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sources.map((source, i) => {
                  const Icon = source.icon;
                  return (
                    <motion.div
                      key={source.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 bg-[#14151e]/90 border border-zinc-800 hover:border-red-500/50 rounded-lg transition-all flex flex-col justify-between relative group"
                    >
                       <div className="flex justify-between items-start mb-4">
                          <div className="p-2 rounded bg-red-600/10 text-red-500">
                             <Icon size={22} />
                          </div>
                          <span className="text-zinc-500 font-mono text-xs">{source.id}</span>
                       </div>
                       
                       <div className="space-y-1">
                          <div className="text-white text-base font-display font-bold uppercase tracking-tight">{source.label}</div>
                          <div className="text-zinc-400 font-mono text-xs">{source.type}</div>
                       </div>

                       {/* Processing Indicator */}
                       <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">STATUS:</span>
                          <span className="text-emerald-400 font-semibold">HASH MATCHED</span>
                       </div>
                    </motion.div>
                  );
                })}
             </div>

             {/* Pipeline Flow Bar */}
             <div className="flex flex-wrap sm:flex-nowrap items-center justify-between p-4 bg-[#14151e]/90 border border-zinc-800 rounded-lg gap-4">
                <div className="flex items-center gap-2">
                   <Database className="text-zinc-400" size={18} />
                   <span className="text-xs font-mono text-zinc-300 font-bold">1. RAW BLOB</span>
                </div>
                <ArrowRight className="text-zinc-600 hidden sm:block" size={16} />
                <div className="flex items-center gap-2">
                   <Cpu className="text-amber-400" size={18} />
                   <span className="text-xs font-mono text-amber-400 font-bold">2. PARSING & EXTRACTION</span>
                </div>
                <ArrowRight className="text-zinc-600 hidden sm:block" size={16} />
                <div className="flex items-center gap-2">
                   <Activity className="text-red-500" size={18} />
                   <span className="text-xs font-mono text-red-400 font-bold">3. NORMALIZED LEDGER</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
