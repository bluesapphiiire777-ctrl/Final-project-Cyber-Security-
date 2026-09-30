import { useRef } from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, Share2, Clipboard, ChevronRight, Activity, Database, FileCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Act5EvidenceBoard() {
  return (
    <section id="case-management" className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-16">
          <div className="space-y-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-[0.25em] uppercase font-bold"
            >
              SECTION_05 // ACTIVE DOSSIER MANAGEMENT
            </motion.div>
            <h2 className="text-white text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight uppercase leading-tight">
              ONE CASE.<br />
              <span className="text-red-500 italic font-editorial">EVERY TRACE.</span>
            </h2>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-1 bg-[#14151e] border border-zinc-800 p-4 rounded-lg">
             <div className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">ACTIVE CASE IDENTIFIER</div>
             <div className="text-white text-2xl font-mono font-black tracking-tight">FIP-DEMO-001</div>
          </div>
        </div>

        {/* Editorial Dashboard Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Case Stats */}
          <div className="lg:col-span-8 bg-[#14151e]/90 border border-zinc-800 rounded-lg p-6 sm:p-8 space-y-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="text-red-400 font-mono text-xs uppercase font-bold tracking-wider">CURRENT INVESTIGATION STATUS</div>
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_#F59E0B]" />
                         <span className="text-white text-xl sm:text-2xl font-display font-bold uppercase tracking-tight">ACTIVE ANALYSIS</span>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="text-zinc-400 font-mono text-xs uppercase font-bold tracking-wider">EVIDENCE DENSITY</div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-xs font-mono text-zinc-300 font-bold">
                            <span>24 VERIFIED ARTIFACTS</span>
                            <span className="text-emerald-400">100% SHA-256 MATCH</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: '84%' }} className="h-full bg-red-600 rounded-full" />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="text-zinc-400 font-mono text-xs uppercase font-bold tracking-wider">CORRELATED LAYERS</div>
                      <div className="grid grid-cols-3 gap-2">
                         {[Activity, Share2, Database].map((Icon, i) => (
                           <div key={i} className="aspect-square border border-zinc-700 bg-black/40 rounded flex items-center justify-center text-amber-400">
                              <Icon size={20} />
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="text-red-400 font-mono text-xs uppercase font-bold tracking-wider">REPORT DOSSIER</div>
                      <div className="flex items-center gap-3">
                         <FileText className="text-zinc-300" size={20} />
                         <span className="text-white text-lg font-mono font-bold uppercase">COURT_DRAFT_v2.4</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Analyst Notes Block */}
             <div className="space-y-3 pt-6 border-t border-zinc-800">
                <div className="text-zinc-400 font-mono text-xs uppercase font-bold tracking-wider">LEAD ANALYST FIELD ASSESSMENT</div>
                <div className="p-4 bg-black/30 border-l-4 border-red-600 rounded-r space-y-2">
                   <p className="text-zinc-200 text-sm font-sans leading-relaxed">
                      "Initial correlation between DEVICE_07 and outbound packet telemetry confirmed. Primary suspect identity match correlated with encrypted artifact DOC_04. Chain of custody verified."
                   </p>
                   <div className="text-xs font-mono text-amber-400 font-bold uppercase">— LEAD EXAMINER [BADGE #8821]</div>
                </div>
             </div>
          </div>

          {/* Activity Log Feed */}
          <div className="lg:col-span-4 bg-[#14151e]/90 border border-zinc-800 rounded-lg p-6 sm:p-8 space-y-6">
             <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <div className="text-white font-display font-bold text-lg tracking-tight uppercase flex items-center gap-2">
                   <Clipboard className="text-red-500" size={18} /> IMMUTABLE AUDIT FEED
                </div>
             </div>

             <div className="space-y-4">
                {[
                  { time: '14:22', event: 'Evidence Ingested', node: 'Node-01' },
                  { time: '14:45', event: 'Hash Integrity Verified', node: 'Ledger-X' },
                  { time: '15:10', event: 'Timeline Synced', node: 'Core' },
                  { time: '15:32', event: 'Entity Cluster Linked', node: 'AI-Correlator' },
                  { time: '16:04', event: 'Report Dossier Updated', node: 'Analyst' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 items-start pb-3 border-b border-zinc-800/60 last:border-0 last:pb-0">
                     <div className="text-xs font-mono text-red-400 font-bold w-12 shrink-0">{log.time}</div>
                     <div className="space-y-0.5">
                        <div className="text-xs font-mono text-white font-bold">{log.event}</div>
                        <div className="text-[11px] font-mono text-zinc-400">{log.node}</div>
                     </div>
                  </div>
                ))}
             </div>

             <Link 
               to="/audit"
               className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 mt-4"
             >
                VIEW FULL AUDIT LOG <ChevronRight size={14} />
             </Link>
          </div>

        </div>

        {/* Quick Actions Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
           {[
             { label: 'TIMELINE SYNC', icon: Activity, path: '#timeline' },
             { label: 'EVIDENCE VAULT', icon: Database, path: '/vault' },
             { label: 'INTAKE PORTAL', icon: FileCheck, path: '/intake' },
             { label: 'ADMIN CONSOLE', icon: Shield, path: '/admin' },
           ].map((action, i) => {
             const Icon = action.icon;
             return (
               <a 
                 key={i}
                 href={action.path}
                 className="p-5 bg-[#14151e]/80 hover:bg-red-600 border border-zinc-800 hover:border-red-500 rounded-lg flex flex-col items-center justify-center gap-2 group transition-all"
               >
                  <div className="text-red-500 group-hover:text-white transition-colors">
                     <Icon size={20} />
                  </div>
                  <div className="text-xs font-mono text-zinc-300 group-hover:text-white uppercase tracking-wider font-bold transition-colors text-center">
                     {action.label}
                  </div>
               </a>
             );
           })}
        </div>

      </div>
    </section>
  );
}
