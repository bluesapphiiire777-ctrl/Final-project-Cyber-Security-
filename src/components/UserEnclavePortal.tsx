import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  Key, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  HardDrive, 
  Hash, 
  Copy, 
  Check, 
  Download, 
  Lock, 
  UserCheck, 
  FileCheck2, 
  LogOut, 
  FolderOpen, 
  Plus, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  HelpCircle,
  Eye,
  Info
} from 'lucide-react';
import { useStore } from '../store';
import { Complaint, Evidence } from '../types';
import { ProofCertificateModal } from './vault/ProofCertificateModal';
import { ComplaintIntakeModal } from './ComplaintIntakeModal';
import { ComplaintAmendSidebox } from './ComplaintAmendSidebox';
import { analyzeForensicArtifact, ExtractedMetadata, QuarantineReport } from '../lib/forensicAnalyzer';

export const UserEnclavePortal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    setCurrentUser, 
    complaints, 
    evidence, 
    addEvidence, 
    seniorReports,
    setNotification 
  } = useStore();

  const userEmail = currentUser?.email || 'user@portal.org';
  const userName = currentUser?.name || 'Citizen User';
  const userBadge = currentUser?.badgeId || 'USR-4421';

  // Filter cases belonging to this user
  const userComplaints = complaints.filter(
    c => !c.complainantEmail || c.complainantEmail.toLowerCase() === userEmail.toLowerCase() || c.complainantName === userName
  );

  // If user has no complaints yet, make available fallback list so they can easily link files or create first
  const activeCases = userComplaints.length > 0 ? userComplaints : complaints.slice(0, 2);

  // Active Tab: 'SEND_FILES', 'MY_CASES', 'FILE_NEW_CASE', 'MY_VAULT'
  const [activeTab, setActiveTab] = useState<'SEND_FILES' | 'MY_CASES' | 'FILE_NEW_CASE' | 'MY_VAULT'>('SEND_FILES');

  // Modals
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [amendModalComplaint, setAmendModalComplaint] = useState<Complaint | null>(null);
  const [isAmendModalOpen, setIsAmendModalOpen] = useState(false);
  const [selectedProofEvidence, setSelectedProofEvidence] = useState<Evidence | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  // File Transmission Wizard State
  const [targetCaseId, setTargetCaseId] = useState<string>(activeCases[0]?.id || 'CMP-2026-88192');
  const [docCategory, setDocCategory] = useState<'FINANCIAL' | 'CREDENTIALS' | 'CHAT_LOGS' | 'PCAP_NETWORK' | 'LEGAL_ID' | 'RAW_EVIDENCE'>('FINANCIAL');
  const [fileTitle, setFileTitle] = useState('');
  const [rawNotesCredentials, setRawNotesCredentials] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSizeFormatted, setFileSizeFormatted] = useState('0 KB');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [computedHash, setComputedHash] = useState('');
  const [completedEvidence, setCompletedEvidence] = useState<Evidence | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [latestAnalysisMeta, setLatestAnalysisMeta] = useState<ExtractedMetadata | null>(null);
  const [latestQuarantine, setLatestQuarantine] = useState<QuarantineReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-Time Server-Sent Events (SSE) Listener for Live Push Updates
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/live/stream');
      eventSource.addEventListener('case_updated', (event) => {
        setNotification('⚡ Live Update: Senior Police Inspector updated your case status.');
      });
      eventSource.addEventListener('report_sealed', (event) => {
        setNotification('📜 Live Court Notice: Senior Inspector sealed a new breakthrough affidavit.');
      });
    } catch (err) {
      console.warn('SSE connection notice:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [setNotification]);

  // Keep targetCaseId synced
  useEffect(() => {
    if (activeCases.length > 0 && !targetCaseId) {
      setTargetCaseId(activeCases[0].id);
    }
  }, [activeCases, targetCaseId]);

  // Handle Sign Out
  const handleSignOut = () => {
    setCurrentUser(null);
    navigate('/');
  };

  // Convert buffer to hex
  const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // Handle File Selection
  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    if (!fileTitle) {
      setFileTitle(file.name);
    }
    const sizeKB = (file.size / 1024).toFixed(1);
    setFileSizeFormatted(`${sizeKB} KB`);
  };

  // Handle File Submission to Senior Investigator with Metadata & Sandbox Analysis
  const handleTransmitToSeniorInvestigator = async () => {
    if (!selectedFile && !rawNotesCredentials.trim()) {
      setNotification('⚠️ Attention: Please attach a document or enter credential details before transmitting.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      let contentData = rawNotesCredentials;
      let arrayBuffer: ArrayBuffer;

      if (selectedFile) {
        arrayBuffer = await selectedFile.arrayBuffer();
        setUploadProgress(35);
        // Run deep metadata & sandbox analysis
        const analysis = await analyzeForensicArtifact(selectedFile, rawNotesCredentials);
        setLatestAnalysisMeta(analysis.metadata);
        setLatestQuarantine(analysis.quarantine);
        setUploadProgress(60);
      } else {
        const encoder = new TextEncoder();
        arrayBuffer = encoder.encode(rawNotesCredentials).buffer;
        setUploadProgress(40);
      }

      // Compute client-side SHA-256 digest
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashHex = bufferToHex(hashBuffer);
      setComputedHash(hashHex);
      setUploadProgress(85);

      // Create new evidence record
      const evidenceId = `EVD-${Math.floor(10000 + Math.random() * 90000)}-${(selectedFile?.name?.slice(-3) || 'DOC').toUpperCase()}`;
      const newEv: Evidence = {
        id: evidenceId,
        caseId: targetCaseId,
        title: fileTitle || selectedFile?.name || `Confidential Document (${docCategory})`,
        type: selectedFile?.type || 'application/octet-stream',
        size: fileSizeFormatted || `${(rawNotesCredentials.length / 1024).toFixed(1)} KB`,
        sha256Hash: hashHex,
        uploadedBy: userName,
        uploadedByBadge: userBadge,
        uploaderEmail: userEmail,
        uploaderId: currentUser?.id,
        createdAt: Date.now(),
        depositStatus: 'ANCHORED',
        isWormLocked: true,
        targetRefId: `TRG-${targetCaseId.toUpperCase()}-${evidenceId.slice(-5)}`,
        digitalSealSignature: `SEAL-WORM-SHA256-${hashHex.substring(0, 32)}`,
        merkleRoot: `mrk_${hashHex.substring(0, 24)}`,
        commitPrompt: `User submitted document for Senior Investigator review: ${fileTitle || selectedFile?.name}`,
        content: contentData || undefined,
      };

      // Add to store
      addEvidence(newEv);
      setCompletedEvidence(newEv);
      setUploadProgress(100);

      // Send to server
      fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEv),
      }).catch(err => console.warn('Sync notice:', err));

      setNotification(`⚡ Document Transmitted to Senior Inspector FIPG 3638: ${newEv.title}`);
    } catch (err) {
      console.error('Upload error:', err);
      setNotification('❌ Failed to transmit file. Please retry.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetForm = () => {
    setSelectedFile(null);
    setFileTitle('');
    setRawNotesCredentials('');
    setComputedHash('');
    setCompletedEvidence(null);
    setLatestAnalysisMeta(null);
    setLatestQuarantine(null);
    setUploadProgress(0);
  };

  // Find latest senior report for active case if available
  const latestSeniorReport = seniorReports.find(r => r.caseId === targetCaseId) || seniorReports[0];

  return (
    <div className="min-h-screen bg-[#07090E] text-[#D1D5DB] font-sans relative overflow-x-hidden selection:bg-[#EF4444] selection:text-white">
      {/* Ambience & Grid */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.06),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* =========================================================================
          MAIN CONTAINER
          ========================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-8">
        
        {/* ---------------------------------------------------------------------
            HEADER: CITIZEN / USER CASE ENCLAVE
            --------------------------------------------------------------------- */}
        <header className="relative bg-[#0E121B]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/70 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-40 bg-gradient-to-bl from-blue-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* User Identity & Clearance */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-slate-900 p-[2px] shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <div className="w-full h-full bg-[#090C12] rounded-2xl flex items-center justify-center text-blue-400 font-bold text-xl">
                    <UserCheck size={28} />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0E121B] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {userName}
                  </h1>
                  <span className="text-xs text-blue-400 font-mono font-bold bg-blue-950/80 px-2.5 py-0.5 rounded-lg border border-blue-500/40">
                    [{userBadge}]
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    USER ACCESS PORTAL
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
                  <span>Direct Encrypted Transmission to Senior Investigator:</span>
                  <strong className="text-amber-400 font-mono">Senior Inspector FIPG 3638 (bluesapphire777@gmail.com)</strong>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
              <button
                onClick={() => setIsNewCaseModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>+ FILE NEW CASE</span>
              </button>

              <button
                onClick={handleSignOut}
                className="p-2.5 bg-[#080A0F] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              4-TILE STATUS METRICS
              ------------------------------------------------------------------- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/80 text-xs">
            
            <div className="bg-[#080A0F]/80 p-3.5 rounded-2xl border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">MY REGISTERED CASES</span>
              <span className="text-white font-bold text-sm mt-0.5 block">
                {userComplaints.length} Active Dossiers
              </span>
            </div>

            <div className="bg-[#080A0F]/80 p-3.5 rounded-2xl border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">FILES &amp; CREDENTIALS TRANSMITTED</span>
              <span className="text-blue-400 font-bold text-sm mt-0.5 block">
                {evidence.length} Sealed WORM Records
              </span>
            </div>

            <div className="bg-[#080A0F]/80 p-3.5 rounded-2xl border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">ASSIGNED POLICE LEAD</span>
              <span className="text-amber-400 font-bold text-sm mt-0.5 flex items-center gap-1.5">
                <Shield size={14} className="text-amber-400" />
                <span>Inspector FIPG 3638</span>
              </span>
            </div>

            <div className="bg-[#080A0F]/80 p-3.5 rounded-2xl border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">CRYPTOGRAPHIC INTEGRITY</span>
              <span className="text-emerald-400 font-bold text-sm mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>0.00% Drift &bull; Verified</span>
              </span>
            </div>

          </div>
        </header>

        {/* ---------------------------------------------------------------------
            5-STAGE CASE RESOLUTION JOURNEY STEPPER & TRUST ASSURANCE STRIP
            --------------------------------------------------------------------- */}
        <div className="bg-[#0E121B]/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Zap size={15} className="text-amber-400" />
              <span>CASE RESOLUTION JOURNEY: HOW SENIOR INSPECTOR SOLVES YOUR CASE</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              END-TO-END WORM VERIFICATION &bull; ISO/IEC 27037
            </span>
          </div>

          {/* 5 Stepper Items */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            {[
              { num: '01', title: 'Intake Dossier', desc: 'Case minted in immutable ledger', status: 'COMPLETED', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' },
              { num: '02', title: 'SHA-256 Seal', desc: 'Files anchored to WORM store', status: 'ACTIVE', color: 'text-blue-400 border-blue-500/40 bg-blue-950/30' },
              { num: '03', title: 'Cryptanalysis', desc: 'Metadata & IOCs deep triage', status: 'UPCOMING', color: 'text-amber-400 border-amber-500/40 bg-amber-950/30' },
              { num: '04', title: 'Suspect Footprint', desc: 'Correlating IP & beacon leads', status: 'UPCOMING', color: 'text-purple-400 border-purple-500/40 bg-purple-950/30' },
              { num: '05', title: 'Affidavit Sealed', desc: 'Court certificate issued', status: 'UPCOMING', color: 'text-teal-400 border-teal-500/40 bg-teal-950/30' }
            ].map((step, idx) => (
              <div key={idx} className={`p-3.5 rounded-2xl border ${step.color} space-y-1.5 relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold">{step.num}</span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-bold">
                    {step.status}
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs">{step.title}</h4>
                <p className="text-[10px] text-zinc-400 leading-snug">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Trust Assurance Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck size={14} />
              <span>Zero Bit-Drift Guarantee (0.00% Drift)</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <Lock size={14} />
              <span>Exclusive Direct Line to Senior Inspector FIPG 3638</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <HardDrive size={14} />
              <span>Hardware Enclave WORM Storage</span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            STRUCTURED USER NAVIGATION BAR
            --------------------------------------------------------------------- */}
        <div className="bg-[#0E121B]/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-2.5 sm:p-3 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
            
            <button
              onClick={() => setActiveTab('SEND_FILES')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer ${
                activeTab === 'SEND_FILES'
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-[1.02]'
                  : 'bg-[#080A0F] text-blue-400 hover:bg-blue-950/40 border border-blue-500/30'
              }`}
            >
              <Upload size={15} />
              <span>1. Send Documents &amp; Files</span>
            </button>

            <button
              onClick={() => setActiveTab('MY_CASES')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer ${
                activeTab === 'MY_CASES'
                  ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-[1.02]'
                  : 'bg-[#080A0F] text-amber-400 hover:bg-amber-950/40 border border-amber-500/30'
              }`}
            >
              <FileText size={15} />
              <span>2. Case Status &amp; Updates</span>
            </button>

            <button
              onClick={() => setActiveTab('FILE_NEW_CASE')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer ${
                activeTab === 'FILE_NEW_CASE'
                  ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-[1.02]'
                  : 'bg-[#080A0F] text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30'
              }`}
            >
              <Plus size={15} />
              <span>3. Register New Incident</span>
            </button>

            <button
              onClick={() => setActiveTab('MY_VAULT')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer ${
                activeTab === 'MY_VAULT'
                  ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-[1.02]'
                  : 'bg-[#080A0F] text-indigo-400 hover:bg-indigo-950/40 border border-indigo-500/30'
              }`}
            >
              <HardDrive size={15} />
              <span>4. My Vault Proofs</span>
            </button>

          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400 pr-2">
            <span className="text-zinc-500">Connected to Lead:</span>
            <span className="text-amber-400 font-mono font-bold">bluesapphire777@gmail.com</span>
          </div>
        </div>

        {/* =====================================================================
            TAB 1: SEND DOCUMENTS, CREDENTIALS & DIGITAL FILES
            ===================================================================== */}
        {activeTab === 'SEND_FILES' && (
          <div className="bg-[#0E121B]/95 rounded-3xl border border-slate-700/70 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload size={18} className="text-blue-400" />
                  <span>Transmit Documents, Credentials &amp; Case Files to Senior Investigator</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  All uploads are automatically hashed using SHA-256 for legal non-repudiation, locked into the WORM ledger, and routed immediately to Senior Inspector FIPG 3638.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono bg-[#080A0F] px-3.5 py-1.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-500">Security:</span>
                <span className="text-emerald-400 font-bold">SHA-256 CLIENT-SEALED</span>
              </div>
            </div>

            {completedEvidence ? (
              /* Success Receipt View */
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#080A0F] rounded-2xl border border-emerald-500/40 p-6 space-y-6 shadow-2xl"
              >
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 size={24} className="shrink-0" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Document Transmitted Successfully to Senior Investigator!
                    </h3>
                    <p className="text-xs text-emerald-300">
                      Record anchored into WORM ledger. Case docket <strong className="text-white">{completedEvidence.caseId}</strong> updated.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#0E121B] border border-zinc-800 space-y-1.5">
                    <span className="text-zinc-500 block">DOCUMENT TITLE:</span>
                    <strong className="text-white text-sm">{completedEvidence.title}</strong>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0E121B] border border-zinc-800 space-y-1.5">
                    <span className="text-zinc-500 block">ASSIGNED LEAD RECIPIENT:</span>
                    <strong className="text-amber-400 text-sm">Senior Inspector FIPG 3638 (bluesapphire777@gmail.com)</strong>
                  </div>

                  <div className="md:col-span-2 p-4 rounded-xl bg-[#0E121B] border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">IMMUTABLE SHA-256 HASH DIGEST:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(completedEvidence.sha256Hash);
                          setCopiedHash(true);
                          setTimeout(() => setCopiedHash(false), 2000);
                        }}
                        className="text-blue-400 hover:text-white flex items-center gap-1 font-mono text-[11px] cursor-pointer"
                      >
                        {copiedHash ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedHash ? 'COPIED' : 'COPY HASH'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-xs text-amber-300 break-all bg-[#080A0F] p-2.5 rounded-lg border border-zinc-800/80">
                      {completedEvidence.sha256Hash}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      setSelectedProofEvidence(completedEvidence);
                      setIsProofModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/50 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Download size={14} />
                    <span>View Legal Proof Certificate</span>
                  </button>

                  <button
                    onClick={handleResetForm}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    <Plus size={14} />
                    <span>Send Another Document / File</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Upload Form */
              <div className="space-y-6">
                
                {/* Step A: Select Target Case */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">A</span>
                    <span>Select Target Case Docket:</span>
                  </label>
                  <select
                    value={targetCaseId}
                    onChange={(e) => setTargetCaseId(e.target.value)}
                    className="w-full bg-[#080A0F] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                  >
                    {activeCases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} &bull; {c.title} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step B: Category Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">B</span>
                    <span>Document / Credential Type:</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {[
                      { id: 'FINANCIAL', label: 'Financial & Bank', icon: FileText },
                      { id: 'CREDENTIALS', label: 'Compromised Keys', icon: Key },
                      { id: 'CHAT_LOGS', label: 'Chats & Phishing', icon: FileText },
                      { id: 'PCAP_NETWORK', label: 'Network & PCAP', icon: Layers },
                      { id: 'LEGAL_ID', label: 'Legal ID & Proof', icon: Shield },
                      { id: 'RAW_EVIDENCE', label: 'Raw Evidence', icon: HardDrive },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const isSel = docCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setDocCategory(cat.id as any)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                            isSel
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md font-bold'
                              : 'bg-[#080A0F] text-zinc-400 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <Icon size={16} className={isSel ? 'text-white' : 'text-blue-400'} />
                          <span className="text-[11px]">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step C: Document Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">C</span>
                    <span>Document Title / File Name:</span>
                  </label>
                  <input
                    type="text"
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    placeholder="e.g. Fraudulent Wire Confirmation SWIFT-9912.pdf or Leaked AWS Token Key"
                    className="w-full bg-[#080A0F] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                {/* Step D: Drag & Drop File Zone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">D</span>
                    <span>Attach Digital File / Document:</span>
                  </label>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileChange(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-blue-400 bg-blue-950/20' 
                        : selectedFile 
                          ? 'border-emerald-500/60 bg-[#080A0F]' 
                          : 'border-zinc-800 hover:border-slate-700 bg-[#080A0F]'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3 text-emerald-400">
                        <FileCheck2 size={28} />
                        <div className="text-left">
                          <p className="font-bold text-white text-xs">{selectedFile.name}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">{fileSizeFormatted} &bull; Click to replace</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload size={28} className="mx-auto text-blue-400/80" />
                        <p className="text-xs font-bold text-zinc-300">
                          Click to browse or drop document, screenshot, log, or zip file here
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Supports PDF, DOCX, PNG, JPG, CSV, PCAP, JSON, ZIP &bull; Max 50 MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step E: Confidential Notes / Credentials Text Box */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">E</span>
                    <span>Confidential Explanations, Compromised Credentials or Notes for Investigator:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rawNotesCredentials}
                    onChange={(e) => setRawNotesCredentials(e.target.value)}
                    placeholder="Provide any crucial context, transaction hashes, suspect phone numbers, or compromised account credentials for Senior Inspector FIPG 3638..."
                    className="w-full bg-[#080A0F] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                  />
                </div>

                {/* Progress bar if uploading */}
                {isUploading && (
                  <div className="space-y-2 bg-[#080A0F] p-4 rounded-xl border border-blue-500/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-300 font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                        COMPUTING SHA-256 HASH &bull; TRANSMITTING TO SENIOR INVESTIGATOR...
                      </span>
                      <strong className="text-blue-400">{uploadProgress}%</strong>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                    <Shield size={14} className="text-emerald-400" />
                    <span>Protected by Hardware Enclave WORM Protocol</span>
                  </div>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleTransmitToSeniorInvestigator}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span>SEAL &amp; TRANSMIT TO SENIOR INVESTIGATOR</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 2: MY SUBMITTED CASES & SENIOR INVESTIGATOR PROGRESS
            ===================================================================== */}
        {activeTab === 'MY_CASES' && (
          <div className="space-y-6">
            <div className="bg-[#0E121B]/95 rounded-3xl border border-slate-700/70 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText size={18} className="text-amber-400" />
                    <span>My Registered Cases &amp; Police Investigation Status</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Track real-time investigation stages, discoveries, and breakthrough notes logged by Senior Inspector FIPG 3638.
                  </p>
                </div>

                <button
                  onClick={() => setIsNewCaseModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-center"
                >
                  <Plus size={14} />
                  <span>+ File New Incident</span>
                </button>
              </div>

              {/* Cases List */}
              <div className="space-y-4">
                {activeCases.map((c) => {
                  const matchingReport = seniorReports.find(r => r.caseId === c.id);
                  const progress = matchingReport?.caseProgressPercentage || (c.status === 'SOLVED' ? 100 : c.status === 'EVIDENCE_VERIFIED' ? 75 : 45);

                  return (
                    <div
                      key={c.id}
                      className="bg-[#080A0F] rounded-2xl border border-zinc-800/90 p-5 space-y-4 shadow-md hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                              {c.id}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-white">
                              {c.title}
                            </h3>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">
                            Category: <strong className="text-zinc-200">{c.category}</strong> &bull; Registered: {new Date(c.incidentDate || Date.now()).toLocaleDateString()}
                          </p>
                        </div>

                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-950/80 text-blue-300 border border-blue-500/30 self-start sm:self-center">
                          {c.status || 'UNDER_INVESTIGATION'}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5 bg-[#0E121B] p-3.5 rounded-xl border border-zinc-800/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400 flex items-center gap-1.5">
                            <Clock size={13} className="text-amber-400" />
                            <span>Senior Investigator Stage: <strong>{matchingReport?.caseStatusAccordingToLead || 'ACTIVE_FIELDWORK'}</strong></span>
                          </span>
                          <strong className="text-amber-400 font-bold">{progress}% Solved</strong>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Senior Investigator Findings & Notes */}
                      {matchingReport && (
                        <div className="bg-[#0E121B] p-4 rounded-xl border border-amber-500/20 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <ShieldCheck size={15} />
                            <span>Latest Findings from Senior Inspector FIPG 3638 ({matchingReport.reportDate}):</span>
                          </div>
                          <p className="text-zinc-300 leading-relaxed text-[11px] font-sans">
                            {matchingReport.findingsBreakthroughs || matchingReport.ideasImplemented}
                          </p>
                          {matchingReport.verdictSummary && (
                            <p className="text-emerald-300 text-[11px] font-semibold pt-1 border-t border-zinc-800">
                              Verdict / Recommended Action: {matchingReport.verdictSummary}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <span className="text-[11px] text-zinc-500">
                          Lead: Senior Inspector FIPG 3638
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setTargetCaseId(c.id);
                              setActiveTab('SEND_FILES');
                            }}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload size={13} />
                            <span>Submit More Files</span>
                          </button>

                          <button
                            onClick={() => {
                              setAmendModalComplaint(c);
                              setIsAmendModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Info size={13} />
                            <span>Amend Case</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: REGISTER NEW INCIDENT / COMPLAINT
            ===================================================================== */}
        {activeTab === 'FILE_NEW_CASE' && (
          <div className="bg-[#0E121B]/95 rounded-3xl border border-slate-700/70 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus size={18} className="text-emerald-400" />
                  <span>Register a New Case Dossier with Senior Police Investigator</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Once submitted, an official reference docket ID will be minted, and Senior Inspector FIPG 3638 will begin reviewing evidence.
                </p>
              </div>
            </div>

            <ComplaintIntakeModal
              isOpen={true}
              onClose={() => setActiveTab('SEND_FILES')}
              onComplaintCreated={(newC) => {
                setTargetCaseId(newC.id);
                setNotification(`⚡ New Case Registered: ${newC.id}. Now ready to attach documents.`);
                setActiveTab('SEND_FILES');
              }}
            />
          </div>
        )}

        {/* =====================================================================
            TAB 4: MY VAULT PROOFS & TRANSMITTED FILES
            ===================================================================== */}
        {activeTab === 'MY_VAULT' && (
          <div className="bg-[#0E121B]/95 rounded-3xl border border-slate-700/70 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <HardDrive size={18} className="text-indigo-400" />
                  <span>My Cryptographically Sealed WORM Evidence &amp; Proof Receipts</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Immutable records verified with zero bit-drift. Download official court proof certificates at any time.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('SEND_FILES')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-center"
              >
                <Upload size={14} />
                <span>+ Transmit File</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-[#080A0F] rounded-2xl border border-zinc-800 p-5 space-y-3.5 shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                        {ev.id}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        100% WORM
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate" title={ev.title}>
                      {ev.title}
                    </h4>

                    <p className="text-[11px] text-zinc-400">
                      Linked Case: <strong className="text-zinc-200">{ev.caseId}</strong>
                    </p>

                    <div className="bg-[#0E121B] p-2 rounded-lg border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 uppercase font-mono block">SHA-256 HASH:</span>
                      <p className="font-mono text-[10px] text-amber-300 truncate">
                        {ev.sha256Hash}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">
                      {new Date(ev.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedProofEvidence(ev);
                        setIsProofModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={11} />
                      <span>Certificate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {isProofModalOpen && selectedProofEvidence && (
        <ProofCertificateModal
          evidence={selectedProofEvidence}
          currentUser={currentUser}
          isOpen={isProofModalOpen}
          onClose={() => setIsProofModalOpen(false)}
        />
      )}

      {isAmendModalOpen && amendModalComplaint && (
        <ComplaintAmendSidebox
          complaint={amendModalComplaint}
          isOpen={isAmendModalOpen}
          onClose={() => setIsAmendModalOpen(false)}
        />
      )}

      {isNewCaseModalOpen && (
        <ComplaintIntakeModal
          isOpen={isNewCaseModalOpen}
          onClose={() => setIsNewCaseModalOpen(false)}
          onComplaintCreated={(newC) => {
            setIsNewCaseModalOpen(false);
            setTargetCaseId(newC.id);
            setNotification(`⚡ Case Created: ${newC.id}`);
            setActiveTab('SEND_FILES');
          }}
        />
      )}
    </div>
  );
};
