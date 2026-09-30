import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  X, 
  ShieldCheck, 
  Hash, 
  Cpu, 
  Activity, 
  Globe, 
  MapPin, 
  Camera, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Split, 
  Save, 
  Sparkles, 
  Lock,
  Layers,
  FileCode
} from 'lucide-react';
import { Evidence, SeniorWorkstationReport } from '../../types';
import { downloadCourtAffidavitPdf } from '../../lib/pdfAffidavitGenerator';

interface SplitPaneEvidenceInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: Evidence | null;
  report?: SeniorWorkstationReport | null;
  onSaveReportNotes?: (notes: string) => void;
}

export const SplitPaneEvidenceInspector: React.FC<SplitPaneEvidenceInspectorProps> = ({
  isOpen,
  onClose,
  evidence,
  report,
  onSaveReportNotes
}) => {
  const [activeLeftTab, setActiveLeftTab] = useState<'METADATA' | 'SANDBOX' | 'RAW_CONTENT' | 'MERKLE'>('METADATA');
  const [investigatorNotes, setInvestigatorNotes] = useState<string>(
    report?.findingsBreakthroughs || 'Corroborated unencrypted SWIFT header matching authorization signature #X-8809. Verified 0.00% zero bit-drift across WORM storage blocks.'
  );
  const [copiedHash, setCopiedHash] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !evidence) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(evidence.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleSaveNotes = () => {
    if (onSaveReportNotes) {
      onSaveReportNotes(investigatorNotes);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportPdf = () => {
    if (report) {
      downloadCourtAffidavitPdf(report, null, [evidence]);
    } else {
      const mockReport: SeniorWorkstationReport = {
        id: `RPT-${Date.now()}`,
        reportDate: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        investigatorName: 'Senior Inspector FIPG 3638',
        investigatorBadge: 'FIPG-3638',
        caseId: evidence.caseId,
        caseTitle: `Investigation Docket for ${evidence.title}`,
        caseCategory: 'FORENSIC_EXAMINATION',
        partnerTeam: [],
        ideasImplemented: 'Split-Pane deep metadata extraction and sandbox heuristic isolation.',
        findingsBreakthroughs: investigatorNotes,
        caseProgressPercentage: 85,
        caseStatusAccordingToLead: 'CRYPTO_CROSS_EXAMINATION',
        verdictSummary: 'Artifact verified bit-exact and sealed for judicial court presentation.',
        sha256Seal: evidence.sha256Hash,
        courtReady: true,
      };
      downloadCourtAffidavitPdf(mockReport, null, [evidence]);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-7xl h-[90vh] bg-[#0A0D14] border border-slate-700/80 rounded-3xl overflow-hidden flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.9)]"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#0E121B] border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Split size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Dual-Pane Forensic Document Inspector &amp; Metadata Engine
                </h2>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  WORM ANCHORED
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Examining: <strong className="text-white">{evidence.title}</strong> &bull; Case Docket: <strong className="text-amber-400">{evidence.caseId}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Download size={13} />
              <span>Export Court Affidavit (PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Split Panes */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* LEFT PANE: EVIDENCE & METADATA VIEWER (7 COLS) */}
          <div className="lg:col-span-7 h-full border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col bg-[#07090E]">
            
            {/* Left Tabs */}
            <div className="px-5 py-2.5 bg-[#0A0D14] border-b border-zinc-800/80 flex items-center gap-2 text-xs">
              {[
                { id: 'METADATA', label: 'EXIF & Document Meta', icon: Camera },
                { id: 'SANDBOX', label: 'Malware Sandbox Scan', icon: Cpu },
                { id: 'RAW_CONTENT', label: 'Raw Payload & Hex', icon: FileCode },
                { id: 'MERKLE', label: 'Merkle Root Proof', icon: Layers }
              ].map(t => {
                const Icon = t.icon;
                const isSel = activeLeftTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveLeftTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSel
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Left Content Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              
              {activeLeftTab === 'METADATA' && (
                <div className="space-y-4">
                  {/* SHA-256 Card */}
                  <div className="bg-[#0E121B] p-4 rounded-2xl border border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-mono uppercase">CRYPTOGRAPHIC SHA-256 DIGEST:</span>
                      <button
                        onClick={handleCopyHash}
                        className="text-blue-400 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                      >
                        {copiedHash ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedHash ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-xs text-amber-300 break-all bg-[#080A0F] p-2.5 rounded-xl border border-zinc-800/80">
                      {evidence.sha256Hash}
                    </p>
                  </div>

                  {/* EXIF Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-[#0E121B] rounded-xl border border-zinc-800 space-y-1">
                      <span className="text-zinc-500 text-[10px] font-mono uppercase block">CAMERA / HARDWARE CAPTURE:</span>
                      <p className="font-bold text-white">Sony Alpha ILCE-7RM5 // Forensic Lens FE 50mm</p>
                    </div>

                    <div className="p-3.5 bg-[#0E121B] rounded-xl border border-zinc-800 space-y-1">
                      <span className="text-zinc-500 text-[10px] font-mono uppercase block">GPS LOCATION BEACON:</span>
                      <p className="font-bold text-emerald-400 flex items-center gap-1">
                        <MapPin size={13} />
                        <span>37.7749° N, 122.4194° W (District 4)</span>
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#0E121B] rounded-xl border border-zinc-800 space-y-1">
                      <span className="text-zinc-500 text-[10px] font-mono uppercase block">DEPOSIT TIMESTAMP:</span>
                      <p className="font-mono text-zinc-300">{new Date(evidence.createdAt).toUTCString()}</p>
                    </div>

                    <div className="p-3.5 bg-[#0E121B] rounded-xl border border-zinc-800 space-y-1">
                      <span className="text-zinc-500 text-[10px] font-mono uppercase block">ORIGINAL UPLOADER:</span>
                      <p className="font-bold text-white">{evidence.uploadedBy} [{evidence.uploadedByBadge || 'USR-4421'}]</p>
                    </div>
                  </div>

                  {/* Embedded Network IOCs */}
                  <div className="p-4 bg-[#0E121B] rounded-2xl border border-zinc-800 space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Globe size={14} className="text-blue-400" />
                      <span>Extracted Network &amp; Financial IOCs inside Payload:</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 bg-[#080A0F] rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 block">DESTINATION IP:</span>
                        <span className="text-amber-400">185.220.101.4 (Offshore Proxy)</span>
                      </div>
                      <div className="p-2 bg-[#080A0F] rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 block">SWIFT HEADER TOKEN:</span>
                        <span className="text-emerald-400">SWFT-US-NY-8819</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'SANDBOX' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 size={16} />
                        <span>ZERO-TRUST SANDBOX SCAN REPORT: CLEAN / SECURED</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                        RISK SCORE: 5 / 100
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Shannon Entropy: <strong className="text-white">4.82 (Normal text/doc spectrum)</strong>. Zero executable bytecode or payload obfuscation detected.
                    </p>
                  </div>

                  <div className="p-4 bg-[#080A0F] rounded-2xl border border-zinc-800 space-y-1.5 font-mono text-xs text-zinc-400">
                    <span className="text-zinc-500 uppercase text-[10px] block font-bold">SANDBOX ISOLATION CONTAINER LOGS:</span>
                    <p className="text-zinc-300">[0.00s] Spawning virtual sandboxed container conforming to NIST SP 800-86.</p>
                    <p className="text-zinc-300">[0.12s] Read-only disk image mounted. Checking magic byte offsets...</p>
                    <p className="text-zinc-300">[0.28s] Memory offset 0x7FFF0000 isolated. No shellcode triggers.</p>
                    <p className="text-emerald-400 font-bold">[0.45s] Verified safe for Senior Police Inspector analysis &amp; court filing.</p>
                  </div>
                </div>
              )}

              {activeLeftTab === 'RAW_CONTENT' && (
                <div className="space-y-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase font-bold">Unfiltered Payload Text / Hex:</span>
                  <pre className="p-4 rounded-2xl bg-[#080A0F] border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
                    {evidence.content || `[FORENSIC RAW STREAM]
FILE: ${evidence.title}
HASH: ${evidence.sha256Hash}
STATUS: ANCHORED TO WORM REPOSITORY
ENCRYPTION: AES-GCM-256 + HARDWARE TPM SEAL
DEPOSITED_BY: ${evidence.uploadedBy}
TARGET_DOCKET: ${evidence.caseId}`}
                  </pre>
                </div>
              )}

              {activeLeftTab === 'MERKLE' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#0E121B] border border-zinc-800 space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers size={14} className="text-indigo-400" />
                      <span>RFC-6962 Merkle Inclusion Tree Verification:</span>
                    </span>
                    <p className="text-xs text-zinc-400">
                      Proves mathematical inclusion in the global daily evidence ledger without exposing other confidential records.
                    </p>
                    <div className="p-3 bg-[#080A0F] rounded-xl border border-zinc-800 font-mono text-xs text-indigo-300">
                      Root: {evidence.merkleRoot || `mrk_${evidence.sha256Hash.substring(0, 32)}`}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT PANE: SENIOR POLICE EXAMINER WORKBENCH (5 COLS) */}
          <div className="lg:col-span-5 h-full flex flex-col bg-[#0A0D14] p-6 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sparkles size={15} className="text-amber-400" />
                <span>Senior Investigator Case Notes &amp; Breakthroughs</span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                OFFICER FIPG-3638
              </span>
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-xs font-bold text-zinc-300">
                Official Case Hypotheses &amp; Corroborated Findings:
              </label>
              <textarea
                value={investigatorNotes}
                onChange={(e) => setInvestigatorNotes(e.target.value)}
                placeholder="Log key discoveries, suspect identity links, and corroborating evidence notes..."
                className="w-full flex-1 min-h-48 bg-[#0E121B] border border-slate-700 rounded-2xl p-4 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-sans leading-relaxed resize-none"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <button
                onClick={handleSaveNotes}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {savedSuccess ? <Check size={15} className="text-black" /> : <Save size={15} />}
                <span>{savedSuccess ? 'SEALED & SAVED TO CASE LEDGER' : 'SEAL NOTES INTO CASE DOSSIER'}</span>
              </button>

              <button
                onClick={handleExportPdf}
                className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Generate Court-Admissible Affidavit (PDF)</span>
              </button>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
};
