import { useRef } from 'react';
import { motion } from 'motion/react';
import { Database, Zap, Search, Link as LinkIcon, Share2, Eye, FileText, ArrowRight } from 'lucide-react';

const steps = [
  { label: 'EVIDENCE', sub: 'Ingest raw artifacts', icon: Database, color: 'text-red-500', border: 'border-red-500/40' },
  { label: 'INGESTION', sub: 'SHA-256 validation', icon: Zap, color: 'text-amber-400', border: 'border-amber-500/40' },
  { label: 'ANALYSIS', sub: 'Deep parsing', icon: Search, color: 'text-red-500', border: 'border-red-500/40' },
  { label: 'CORRELATION', sub: 'Cross-source link', icon: LinkIcon, color: 'text-amber-400', border: 'border-amber-500/40' },
  { label: 'TIMELINE', sub: 'Temporal sync', icon: Share2, color: 'text-red-500', border: 'border-red-500/40' },
  { label: 'VISUALIZATION', sub: 'Interactive graph', icon: Eye, color: 'text-amber-400', border: 'border-amber-500/40' },
  { label: 'INTELLIGENCE', sub: 'Court-ready dossier', icon: FileText, color: 'text-emerald-400', border: 'border-emerald-500/40' },
];

export default function Act3Benefits() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="approach" ref={containerRef} className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-[0.25em] uppercase font-bold"
          >
            SECTION_02 // THE UNIFIED ARCHITECTURE
          </motion.div>
          
          <h2 className="text-white text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight uppercase leading-tight">
            ONE INVESTIGATION.<br />
            <span className="text-red-500 italic font-editorial">ONE INTELLIGENCE LAYER.</span>
          </h2>

          <p className="text-zinc-300 font-mono text-sm sm:text-base max-w-2xl mx-auto">
            From fragmented forensic extractions to court-admissible visual dossiers in seven automated phases.
          </p>
        </div>

        {/* Visual Pipeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`bg-[#14151e]/90 border ${step.border} p-5 rounded-lg flex flex-col justify-between relative group hover:bg-[#1a1b26] transition-colors`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded bg-black/40 ${step.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-zinc-400 font-mono text-xs font-bold">0{i + 1}</span>
                </div>
                <div>
                  <h3 className="text-white font-mono font-bold text-sm uppercase tracking-wider mb-1">
                    {step.label}
                  </h3>
                  <p className="text-zinc-400 text-xs font-sans">
                    {step.sub}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Architecture Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#14151e]/80 border border-zinc-800 p-6 sm:p-8 rounded-lg space-y-4">
            <h3 className="text-white text-xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
              <ArrowRight className="text-red-500" size={20} />
              Unified Forensic Data Flow
            </h3>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-sans">
              F.I.P normalizes heterogeneous forensic artifacts into a single temporal intelligence layer. 
              From raw disk images (E01) to network traces (PCAP), every record is cross-referenced with exact timestamp correlation.
            </p>
          </div>
          <div className="bg-[#14151e]/80 border border-zinc-800 p-6 sm:p-8 rounded-lg space-y-4">
            <h3 className="text-white text-xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
              <ArrowRight className="text-amber-400" size={20} />
              Court-Grade Traceability Core
            </h3>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-sans">
              Maintain an unbroken chain of custody through automated SHA-256 integrity verification and immutable audit logging. 
              Every reconstructed timeline is provably authentic and exportable for courtroom presentation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
