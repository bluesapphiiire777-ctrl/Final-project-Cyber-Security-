import { motion } from 'motion/react';
import { Shield, Search, Link as LinkIcon, FileCheck, ArrowRight, ArrowDown } from 'lucide-react';

const phases = [
  {
    num: '01',
    title: 'PRESERVE',
    icon: Shield,
    color: 'text-red-500',
    border: 'border-red-500/30',
    bgBadge: 'bg-red-500/10 text-red-400',
    description: 'Evidence is collected, verified, and sealed with immutable SHA-256 cryptographic hashes and chain-of-custody logging.',
    input: 'Raw Disk Images, PCAPs, RAM Dumps',
    process: 'Crypto Stamping & Verification',
    output: 'Immutable Storage Ledger'
  },
  {
    num: '02',
    title: 'ANALYZE',
    icon: Search,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bgBadge: 'bg-amber-500/10 text-amber-400',
    description: 'Deep automated processing through integrated toolchains (Autopsy, Volatility, Tshark) to extract system artifacts.',
    input: 'Evidence Objects',
    process: 'Metadata & Registry Extraction',
    output: 'Normalized Artifact Schema'
  },
  {
    num: '03',
    title: 'CORRELATE',
    icon: LinkIcon,
    color: 'text-red-500',
    border: 'border-red-500/30',
    bgBadge: 'bg-red-500/10 text-red-400',
    description: 'Multi-device temporal clustering connects disparate network connections, modified files, and user credentials.',
    input: 'Analysis Outputs',
    process: 'Multi-Vector Temporal Clustering',
    output: 'Unified Knowledge Graph'
  },
  {
    num: '04',
    title: 'INTELLIGENCE',
    icon: FileCheck,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bgBadge: 'bg-emerald-500/10 text-emerald-400',
    description: 'Synthesizes complete investigative storylines into court-ready executive briefings and technical dossiers.',
    input: 'Correlated Knowledge Graph',
    process: 'Automated Anomaly & Timeline Engine',
    output: 'Certified Judicial Dossier'
  }
];

export default function Act11FourPhase() {
  return (
    <section id="framework" className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12">
        
        {/* Header */}
        <div className="space-y-3 mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-[0.25em] uppercase font-bold">
            SECTION_10 // FORENSIC LIFECYCLE
          </div>
          <h2 className="text-white text-3xl sm:text-5xl font-display font-black tracking-tight uppercase leading-tight">
            THE FOUR PHASE<br />
            <span className="text-red-500 italic font-editorial">INVESTIGATION LIFECYCLE.</span>
          </h2>
          <p className="text-zinc-300 font-mono text-sm sm:text-base leading-relaxed">
            From bitstream capture to judicial testimony, F.I.P enforces mathematical chain-of-custody at each stage.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {phases.map((phase, i) => {
            const Icon = phase.icon;
            return (
              <motion.div
                key={phase.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 sm:p-8 bg-[#14151e]/95 border ${phase.border} rounded-lg flex flex-col justify-between space-y-6 hover:bg-[#1a1c29] transition-all`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded bg-black/40 ${phase.color}`}>
                        <Icon size={24} />
                      </div>
                      <span className="font-display font-black text-2xl text-white tracking-tight">
                        {phase.title}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-black/50 text-zinc-400 border border-zinc-800">
                      PHASE {phase.num}
                    </span>
                  </div>

                  <p className="text-zinc-300 text-sm sm:text-base font-sans leading-relaxed">
                    {phase.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-black/40 rounded border border-zinc-800 space-y-1">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">INPUT</div>
                    <div className="text-zinc-300 truncate">{phase.input}</div>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded border border-zinc-800 space-y-1">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">PROCESS</div>
                    <div className="text-zinc-300 truncate">{phase.process}</div>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded border border-zinc-800 space-y-1">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase">OUTPUT</div>
                    <div className="text-zinc-200 font-bold truncate">{phase.output}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
