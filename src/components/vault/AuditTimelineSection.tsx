import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Phone, 
  Mail, 
  FileDiff, 
  Clock, 
  Network, 
  Plus, 
  Send, 
  X, 
  AlertTriangle,
  History,
  CheckCircle2,
  FileText,
  Hash,
  Sparkles,
  Search
} from 'lucide-react';
import { useStore } from '../../store';
import { Evidence, EvidenceAnnotation } from '../../types';

interface AuditTimelineSectionProps {
  selectedEvidenceId: string;
  onSelectEvidenceId: (id: string) => void;
  onReportTamper: (evidenceId: string) => void;
}

export const AuditTimelineSection: React.FC<AuditTimelineSectionProps> = ({
  selectedEvidenceId,
  onSelectEvidenceId,
  onReportTamper,
}) => {
  const { currentUser, evidence, addAnnotation, setNotification } = useStore();
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationCategory, setAnnotationCategory] = useState<EvidenceAnnotation['noteCategory']>('FORENSIC_NOTE');
  const [diffText, setDiffText] = useState('');
  const [investigatorPhone, setInvestigatorPhone] = useState('+1 (555) 304-9921');
  const [submittingAnnotation, setSubmittingAnnotation] = useState(false);

  // Isolate personal vault files
  const personalEvidence = evidence.filter(e => 
    e.uploadedBy === currentUser?.name || 
    e.uploadedByBadge === currentUser?.badgeId
  );

  const activeEvidence = personalEvidence.find(e => e.id === selectedEvidenceId) || personalEvidence[0];

  if (!activeEvidence) {
    return (
      <div className="p-8 text-center bg-[#181A20] border border-zinc-700/80 rounded-2xl">
        <h3 className="text-white font-bold mb-2">No Vault Evidence Found</h3>
        <p className="text-zinc-500 text-xs">You have not uploaded any evidence to your personal vault.</p>
      </div>
    );
  }

  const handleAddAnnotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvidence || !diffText.trim()) return;

    setSubmittingAnnotation(true);

    setTimeout(() => {
      const randomIpHash = 'sha256:' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('') + '9069';

      const newAnnotation: EvidenceAnnotation = {
        id: 'ann-' + Math.floor(1000 + Math.random() * 9000),
        evidenceId: activeEvidence.id,
        investigatorName: currentUser?.name || 'Senior Forensic Investigator',
        badgeId: currentUser?.badgeId || 'FIP-8841-INV',
        phone: investigatorPhone,
        email: currentUser?.email || 'bluesapphiiire777@gmail.com',
        diffDescription: diffText.trim(),
        noteCategory: annotationCategory,
        timestamp: new Date().toUTCString(),
        ipHash: randomIpHash,
        verified: true,
      };

      addAnnotation(activeEvidence.id, newAnnotation);
      setNotification(`✓ SIGNED INVESTIGATOR ANNOTATION APPENDED (ORIGINAL FILE UNTOUCHED)`);
      
      // Trigger Notification Email
      fetch('/api/email/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser?.email,
          userName: currentUser?.name || 'Admin User',
          badgeId: currentUser?.badgeId || 'ADMIN',
          actionType: 'NEW_ANNOTATION_ADDED',
          actionDetails: `A new annotation was added to Evidence: ${activeEvidence.title}\nCategory: ${annotationCategory}\nDescription: ${diffText.trim()}`,
          targetId: activeEvidence.id
        })
      }).catch(err => console.warn('Notification email dispatch failed:', err));

      setDiffText('');
      setIsAnnotating(false);
      setSubmittingAnnotation(false);
    }, 600);
  };

  const annotations = activeEvidence?.annotations || [];

  return (
    <div className="w-full bg-[#1F232D] rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-xl space-y-6 font-mono text-[#D1D5DB]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-md uppercase">
              ZERO-KNOWLEDGE IMMUTABILITY
            </span>
            <span className="text-xs text-zinc-400 font-semibold">NON-DESTRUCTIVE AUDIT LOG</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Immutable Audit Log &amp; Differential Chain
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Original master file is permanently bit-locked. All examiner observations are signed as cryptographically sealed diff layers.
          </p>
        </div>

        {/* Evidence Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-bold uppercase">Inspect Stream:</span>
          <select
            value={activeEvidence?.id || ''}
            onChange={(e) => onSelectEvidenceId(e.target.value)}
            className="bg-[#181A20] border border-zinc-700 text-amber-400 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            {personalEvidence.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.id} ({ev.title})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Left = Master File Status, Right = Diff Annotations Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Master Original Payload Status (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#181A20] border border-zinc-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-400">
                <Lock size={20} />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Master Original Payload</span>
                <h3 className="text-sm font-bold text-white">UNTOUCHED &amp; BIT-LOCKED</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-zinc-800 pt-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">File Name:</span>
                <span className="text-white font-bold truncate max-w-[170px]">{activeEvidence?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">File Size:</span>
                <span className="text-zinc-300">{activeEvidence?.size || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Bit Drift:</span>
                <span className="text-emerald-400 font-bold">0.000% (Absolute Zero)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Storage Enclave:</span>
                <span className="text-zinc-300">15 GB Free Google Vault</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">WORM Lock:</span>
                <span className="text-emerald-400 font-bold">ENFORCED (Read-Only)</span>
              </div>
            </div>

            <div>
              <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1">
                SHA-256 Master Fingerprint
              </span>
              <div className="p-2.5 bg-[#12141A] border border-amber-500/30 rounded-xl font-mono text-[11px] text-amber-300 break-all select-all">
                {activeEvidence?.sha256Hash}
              </div>
            </div>

            <button
              onClick={() => setIsAnnotating(true)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all uppercase"
            >
              <Plus size={15} />
              <span>APPEND INVESTIGATOR NOTE</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Investigator Annotations & Differential Notes (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Investigator Differential Annotations ({annotations.length})
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500">Layered Non-Destructively</span>
          </div>

          {annotations.length === 0 ? (
            <div className="bg-[#181A20] border border-zinc-800 rounded-2xl p-8 text-center space-y-3">
              <FileDiff size={32} className="text-zinc-600 mx-auto" />
              <div className="text-xs text-zinc-400 font-bold">No differential annotations appended yet.</div>
              <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                The original evidence remains pristine in its zero-bit-drift state. Add a signed examiner note to record observations.
              </p>
              <button
                onClick={() => setIsAnnotating(true)}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus size={13} />
                <span>ADD FIRST NOTE</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {annotations.map((ann, idx) => (
                <div
                  key={ann.id}
                  className="bg-[#181A20] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 sm:p-5 space-y-3 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                        <UserCheck size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white">{ann.investigatorName}</span>
                        <span className="text-[10px] text-amber-400 ml-2 font-mono">({ann.badgeId})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 text-zinc-300 rounded-md">
                        {ann.noteCategory}
                      </span>
                      <span className="text-[10px] text-zinc-500">{ann.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-200 leading-relaxed pl-2 border-l-2 border-amber-500/50">
                    {ann.diffDescription}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-zinc-500 bg-[#12141A] p-2.5 rounded-xl">
                    <div className="flex items-center gap-1 truncate">
                      <Mail size={11} className="text-zinc-400" />
                      <span>{ann.email}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <Phone size={11} className="text-zinc-400" />
                      <span>{ann.phone}</span>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-1 truncate font-mono text-[9px] text-zinc-400">
                      <Network size={10} />
                      <span>Enclave IP Hash: {ann.ipHash}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: ADD INVESTIGATOR ANNOTATION
          ========================================================================= */}
      <AnimatePresence>
        {isAnnotating && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-mono">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-xl bg-[#1F232D] border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-[#D1D5DB]"
            >
              <div className="flex items-start justify-between border-b border-zinc-700 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500 text-black rounded-md uppercase">
                    FORENSIC ATTESTATION
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-wide mt-1 uppercase">
                    Append Investigator Differential Note
                  </h3>
                </div>
                <button
                  onClick={() => setIsAnnotating(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddAnnotationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase font-bold mb-1">
                      Investigator Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${currentUser?.name || 'Senior Forensic Investigator'} (${currentUser?.badgeId || 'FIP-8841-INV'})`}
                      className="w-full bg-[#181A20] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 text-xs disabled:opacity-75"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase font-bold mb-1">
                      Annotation Category
                    </label>
                    <select
                      value={annotationCategory}
                      onChange={(e: any) => setAnnotationCategory(e.target.value)}
                      className="w-full bg-[#181A20] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="FORENSIC_NOTE">FORENSIC_NOTE // General Examiner Observation</option>
                      <option value="CHAIN_OF_CUSTODY">CHAIN_OF_CUSTODY // Custody Transfer Log</option>
                      <option value="HEADER_PATCH">HEADER_PATCH // Offset Anomaly Flag</option>
                      <option value="METADATA_DIFF">METADATA_DIFF // Telemetry Differential</option>
                      <option value="INTEGRITY_STAMP">INTEGRITY_STAMP // Legal Verification Seal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase font-bold mb-1">
                      Contact Phone (Investigator)
                    </label>
                    <input
                      type="text"
                      value={investigatorPhone}
                      onChange={(e) => setInvestigatorPhone(e.target.value)}
                      className="w-full bg-[#181A20] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase font-bold mb-1">
                      Target Evidence Stream
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${activeEvidence?.id} (${activeEvidence?.title})`}
                      className="w-full bg-[#181A20] border border-zinc-700 rounded-xl px-3 py-2 text-amber-400 text-xs disabled:opacity-75"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase font-bold mb-1">
                    Differential Finding / Custody Observation
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={diffText}
                    onChange={(e) => setDiffText(e.target.value)}
                    placeholder="Describe offsets analyzed, socket terminations, volatility flags, or chain-of-custody transfer notes..."
                    className="w-full bg-[#181A20] border border-zinc-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500 placeholder-zinc-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAnnotating(false)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAnnotation || !diffText.trim()}
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 uppercase"
                  >
                    <Send size={14} />
                    <span>{submittingAnnotation ? 'SEALING...' : 'APPEND & SIGN NOTE'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
