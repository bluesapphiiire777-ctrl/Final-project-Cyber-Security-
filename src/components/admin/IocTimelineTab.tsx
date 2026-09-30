import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Video, Hash, Globe, Cpu, 
  Clock, Plus, Search, Shield, AlertTriangle, 
  ExternalLink, Calendar, X, CheckCircle2
} from 'lucide-react';
import { IOCArtifact, TimelineEvent } from '../../types';

interface IocTimelineTabProps {
  iocs: IOCArtifact[];
  timelineEvents: TimelineEvent[];
  onAddIoc: (ioc: IOCArtifact) => void;
  onAddTimelineEvent: (event: TimelineEvent) => void;
}

export default function IocTimelineTab({
  iocs,
  timelineEvents,
  onAddIoc,
  onAddTimelineEvent
}: IocTimelineTabProps) {
  const [selectedIocType, setSelectedIocType] = useState<string>('ALL');
  const [activeCctvIoc, setActiveCctvIoc] = useState<IOCArtifact | null>(
    iocs.find(i => i.type === 'CCTV_FEED') || null
  );
  const [isAddIocModalOpen, setIsAddIocModalOpen] = useState(false);

  // Form State
  const [newIocType, setNewIocType] = useState<IOCArtifact['type']>('IP_ADDRESS');
  const [newIocValue, setNewIocValue] = useState('');
  const [newIocLabel, setNewIocLabel] = useState('');
  const [newIocMitre, setNewIocMitre] = useState('T1071.001');
  const [newIocActor, setNewIocActor] = useState('APT-44');
  const [newIocNotes, setNewIocNotes] = useState('');

  const filteredIocs = iocs.filter(
    ioc => selectedIocType === 'ALL' || ioc.type === selectedIocType
  );

  const handleCreateIoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIocValue || !newIocLabel) return;

    const newArtifact: IOCArtifact = {
      id: `IOC-${Math.floor(100 + Math.random() * 900)}`,
      type: newIocType,
      value: newIocValue,
      label: newIocLabel,
      caseId: 'case-001',
      threatActor: newIocActor || 'Unattributed Threat Actor',
      confidence: 'CONFIRMED',
      mitreTag: newIocMitre || 'T1059',
      discoveredAt: new Date().toUTCString(),
      notes: newIocNotes || 'Added by Senior Investigator via Command Center.',
    };

    onAddIoc(newArtifact);
    setNewIocValue('');
    setNewIocLabel('');
    setIsAddIocModalOpen(false);
  };

  const getIocIcon = (type: string) => {
    switch (type) {
      case 'IP_ADDRESS':
        return <Globe size={16} className="text-red-400" />;
      case 'SHA256_HASH':
        return <Hash size={16} className="text-amber-400" />;
      case 'CCTV_FEED':
        return <Video size={16} className="text-blue-400" />;
      case 'REGISTRY_KEY':
      case 'MEMORY_OFFSET':
        return <Cpu size={16} className="text-purple-400" />;
      default:
        return <Activity size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & CCTV Monitor Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live CCTV Stream Surveillance Card */}
        <div className="lg:col-span-5 bg-[#1F232D] rounded-3xl border border-amber-900/30 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                LIVE PHYSICAL PERIMETER CCTV FEED
              </span>
            </div>
            <span className="text-[9px] font-mono bg-black/60 px-2 py-0.5 rounded text-slate-300 border border-white/5">
              CAM-04 [ROOM B]
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-white/10 group">
            <img
              src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80"
              alt="Vault CCTV Stream"
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 filter contrast-125"
            />
            {/* HUD Overlays */}
            <div className="absolute top-3 left-3 bg-black/80 px-2 py-1 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>REC // 2026-08-20 08:34:12 UTC</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 bg-black/85 p-2 rounded-xl border border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
              <span className="text-amber-400 font-bold truncate">SURVEILLANCE: VAULT SERVER ENCLAVE</span>
              <span className="text-emerald-400 shrink-0">MOTION: CLEAR</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span>BIT-RATE: 4.2 MB/s H.265</span>
            <span className="text-amber-400 font-bold">TAMPER SENSORS: ONLINE</span>
          </div>
        </div>

        {/* IOC Catalog Control Strip */}
        <div className="lg:col-span-7 bg-[#1F232D] rounded-3xl border border-amber-900/30 p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                INDICATORS OF COMPROMISE (IOC) MATRIX
              </span>
              <button
                onClick={() => setIsAddIocModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase flex items-center gap-1.5 shadow-md shadow-amber-500/10"
              >
                <Plus size={14} />
                <span>CATALOG NEW IOC</span>
              </button>
            </div>
            <h2 className="text-xl font-serif font-black text-white">
              DIGITAL ARTIFACTS & FORENSIC SIGNATURES
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Correlated forensic indicators linked to threat actors, MITRE ATT&CK techniques, and evidence hashes.
            </p>
          </div>

          {/* IOC Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['ALL', 'IP_ADDRESS', 'SHA256_HASH', 'CCTV_FEED', 'REGISTRY_KEY'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedIocType(t)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all shrink-0 border ${
                  selectedIocType === t
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-black/40 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5 text-center font-mono text-xs">
            <div className="p-3 bg-black/40 rounded-xl border border-white/5">
              <div className="text-[9px] text-slate-500 uppercase">ACTIVE THREAT ACTORS</div>
              <div className="text-red-400 font-bold text-sm mt-0.5">APT-44 (Nightfall)</div>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5">
              <div className="text-[9px] text-slate-500 uppercase">IDENTIFIED IOCS</div>
              <div className="text-amber-400 font-bold text-sm mt-0.5">{iocs.length} Artifacts</div>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5">
              <div className="text-[9px] text-slate-500 uppercase">CONFIDENCE SCORE</div>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">100% Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* IOC Catalog Table / Grid */}
      <div className="bg-[#1F232D] rounded-3xl border border-amber-900/30 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 bg-black/20 flex items-center justify-between">
          <h3 className="text-sm font-serif font-black uppercase tracking-widest text-amber-300 flex items-center gap-2">
            <Hash size={16} className="text-amber-400" />
            FORENSIC IOC ARTIFACT LEDGER ({filteredIocs.length})
          </h3>
          <span className="text-[10px] font-mono text-slate-400">MITRE ATT&CK ALIGNED</span>
        </div>

        <div className="divide-y divide-white/5">
          {filteredIocs.map((ioc) => (
            <div key={ioc.id} className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {getIocIcon(ioc.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-amber-400 uppercase">
                      {ioc.id} • {ioc.type.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold">
                      {ioc.mitreTag}
                    </span>
                  </div>
                  <h4 className="text-sm font-serif font-black text-white">
                    {ioc.label}
                  </h4>
                  <div className="font-mono text-xs text-red-400 bg-black/50 px-3 py-1.5 rounded-lg border border-red-900/30 select-all max-w-xl truncate">
                    {ioc.value}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">
                    {ioc.notes}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-1 text-[10px] font-mono text-slate-400 self-end md:self-auto">
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold uppercase">
                  {ioc.confidence} CONFIDENCE
                </span>
                <span>ACTOR: {ioc.threatActor}</span>
                <span>DISCOVERED: {ioc.discoveredAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORENSIC GANTT TIMELINE MATRIX */}
      <div className="bg-[#1F232D] rounded-3xl border border-amber-900/30 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-serif font-black uppercase tracking-widest text-amber-300 flex items-center gap-2">
              <Calendar size={18} className="text-amber-400" />
              FORENSIC GANTT TIMELINE & INCIDENT SEQUENCE
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Chronological incident progression mapped with cryptographic timestamps and investigator signatures
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> CRITICAL
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2" /> WARNING
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-2" /> INFO
          </div>
        </div>

        {/* Gantt Timeline Bars */}
        <div className="space-y-4">
          {timelineEvents.map((evt, idx) => {
            const getBarColor = () => {
              if (evt.severity === 'CRITICAL') return 'from-red-600 to-red-900 border-red-500';
              if (evt.severity === 'WARNING') return 'from-amber-500 to-amber-800 border-amber-400';
              return 'from-blue-600 to-blue-900 border-blue-400';
            };

            return (
              <div key={evt.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{evt.id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-serif font-bold text-white text-sm">{evt.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <Clock size={12} className="text-amber-400" />
                    <span>{evt.timestamp}</span>
                    <span>({evt.durationHours} hrs)</span>
                  </div>
                </div>

                {/* Simulated Gantt Span Bar */}
                <div className="relative w-full h-3 bg-black/70 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getBarColor()} border`}
                    style={{
                      width: `${Math.min(100, (idx + 1) * 22)}%`,
                      marginLeft: `${idx * 15}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>LEAD: {evt.investigator}</span>
                  <span className="text-slate-500">{evt.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add IOC Modal */}
      <AnimatePresence>
        {isAddIocModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddIocModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#181A20] border border-amber-900/40 rounded-3xl p-6 shadow-2xl space-y-5 z-10 text-slate-200"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-serif font-black text-white uppercase">
                  ADD NEW IOC ARTIFACT
                </h3>
                <button
                  onClick={() => setIsAddIocModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateIoc} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    IOC TYPE
                  </label>
                  <select
                    value={newIocType}
                    onChange={(e: any) => setNewIocType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-amber-300 focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="IP_ADDRESS">IP ADDRESS</option>
                    <option value="SHA256_HASH">SHA-256 HASH</option>
                    <option value="CCTV_FEED">CCTV FEED / CAM STREAM</option>
                    <option value="REGISTRY_KEY">REGISTRY KEY</option>
                    <option value="MEMORY_OFFSET">MEMORY OFFSET</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    ARTIFACT VALUE / ADDRESS / HASH
                  </label>
                  <input
                    type="text"
                    required
                    value={newIocValue}
                    onChange={(e) => setNewIocValue(e.target.value)}
                    placeholder="e.g. 185.220.101.5 or sha256:a591a6d40..."
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    LABEL & DESCRIPTION
                  </label>
                  <input
                    type="text"
                    required
                    value={newIocLabel}
                    onChange={(e) => setNewIocLabel(e.target.value)}
                    placeholder="e.g. C2 Command & Control Exfiltration Socket"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      MITRE ATT&CK TAG
                    </label>
                    <input
                      type="text"
                      value={newIocMitre}
                      onChange={(e) => setNewIocMitre(e.target.value)}
                      placeholder="e.g. T1071.001"
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      THREAT ACTOR
                    </label>
                    <input
                      type="text"
                      value={newIocActor}
                      onChange={(e) => setNewIocActor(e.target.value)}
                      placeholder="e.g. APT-44"
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddIocModalOpen(false)}
                    className="px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-black uppercase"
                  >
                    SAVE ARTIFACT
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
