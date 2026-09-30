import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Clock, 
  Activity, 
  Lock, 
  Unlock,
  Cpu, 
  Mail, 
  Bell, 
  X, 
  Radio, 
  Layers, 
  RefreshCw,
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Upload, 
  FileCheck2, 
  Hash, 
  ArrowRight, 
  FileCode, 
  AlertCircle, 
  FileText, 
  History, 
  FolderKanban, 
  FileStack, 
  ListTodo, 
  LogOut, 
  ChevronRight, 
  Copy, 
  Check, 
  Shield, 
  Zap, 
  Database,
  FolderOpen,
  ArrowDown,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  HardDrive,
  Award,
  Globe,
  Plus
} from 'lucide-react';
import { useStore } from '../store';
import { Evidence, User, Complaint } from '../types';
import { SeniorInvestigatorWorkstation } from './vault/SeniorInvestigatorWorkstation';
import { FileComplaintHubSection } from './vault/FileComplaintHubSection';
import { EvidenceIngestionZone } from './vault/EvidenceIngestionZone';
import { EvidenceGallerySection } from './vault/EvidenceGallerySection';
import { AuditTimelineSection } from './vault/AuditTimelineSection';
import { SecurityIntegritySection } from './vault/SecurityIntegritySection';
import { TamperReportModal } from './vault/TamperReportModal';
import { ProofCertificateModal } from './vault/ProofCertificateModal';
import { SeniorLeadConsolePanel } from './vault/SeniorLeadConsolePanel';
import { CloudStorageInspectorModal } from './vault/CloudStorageInspectorModal';
import { UserStorageSidePanel } from './vault/UserStorageSidePanel';
import { MongoDbInspectorModal } from './vault/MongoDbInspectorModal';
import { ComplaintIntakeModal } from './ComplaintIntakeModal';
import { ComplaintAmendSidebox } from './ComplaintAmendSidebox';
import { UserEnclavePortal } from './UserEnclavePortal';
import { SoundToggle } from './common/SoundToggle';
import { HexScrambleText } from './common/HexScrambleText';
import HashVerifier from './HashVerifier';

/* =========================================================================
   AMBIENT CYBER PARTICLE BACKDROP
   ========================================================================= */
const AmbientParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleCount = 24;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      radius: Math.random() * 1.2 + 0.6,
      color: Math.random() > 0.6 ? 'rgba(245, 158, 11,' : Math.random() > 0.3 ? 'rgba(59, 130, 246,' : 'rgba(16, 185, 129,',
      alpha: Math.random() * 0.25 + 0.08,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.08 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-50" />;
};

/* =========================================================================
   STRUCTURED FORENSIC VAULT & DASHBOARD CONTROLLER (SENIOR INSPECTOR FIPG 3638)
   ========================================================================= */
export const Vault: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    setCurrentUser, 
    evidence, 
    cases,
    complaints,
    activeComplaint,
    setActiveComplaint, 
    isVaultFrozen, 
    activeNotification, 
    setNotification 
  } = useStore();

  // Active View Tab: 'SENIOR_DESK', 'ALL' (Stream), 'PART_1' (Hub), 'PART_2' (Wizard), 'PART_3' (Vault)
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'SENIOR_DESK' | 'ALL' | 'PART_1' | 'PART_2' | 'PART_3'>('SENIOR_DESK');

  // Selected complaint linking Senior Desk -> Part 1 -> Part 2 -> Part 3
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    activeComplaint?.id || (complaints.length > 0 ? complaints[0].id : 'case-001')
  );
  const [filterGalleryComplaintId, setFilterGalleryComplaintId] = useState<string | null>(null);

  // Secondary tools tab
  const [secondaryTab, setSecondaryTab] = useState<'NONE' | 'VERIFIER' | 'AUDIT' | 'CONTROLS'>('NONE');
  const [showArchGuide, setShowArchGuide] = useState(false);

  // Modals state
  const [isTamperModalOpen, setIsTamperModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isSeniorConsoleOpen, setIsSeniorConsoleOpen] = useState(false);
  const [isCloudStorageModalOpen, setIsCloudStorageModalOpen] = useState(false);
  const [isMongoInspectorOpen, setIsMongoInspectorOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [amendModalComplaint, setAmendModalComplaint] = useState<Complaint | null>(null);
  const [isAmendModalOpen, setIsAmendModalOpen] = useState(false);
  
  const [proofEvidenceTarget, setProofEvidenceTarget] = useState<Evidence | null>(evidence[0] || null);
  const [selectedAuditEvidenceId, setSelectedAuditEvidenceId] = useState<string>(evidence[0]?.id || 'EVD-90412-ALPHA');

  // DOM Refs for smooth scrolling
  const seniorDeskRef = useRef<HTMLDivElement>(null);
  const part1Ref = useRef<HTMLDivElement>(null);
  const part2Ref = useRef<HTMLDivElement>(null);
  const part3Ref = useRef<HTMLDivElement>(null);

  // Live UTC Clock
  const [utcTime, setUtcTime] = useState('');
  useEffect(() => {
    const updateTime = () => setUtcTime(new Date().toUTCString());
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync activeComplaint changes
  useEffect(() => {
    if (activeComplaint) {
      setSelectedComplaintId(activeComplaint.id);
    }
  }, [activeComplaint]);

  const handleOpenProofModal = (ev: Evidence) => {
    setProofEvidenceTarget(ev);
    setIsProofModalOpen(true);
  };

  const handleEvidenceDeposited = (ev: Evidence) => {
    setSelectedAuditEvidenceId(ev.id);
    setProofEvidenceTarget(ev);
    setFilterGalleryComplaintId(null);
    setNotification(`⚡ Evidence Deposited into WORM Vault: ${ev.id}`);
    
    if (activeWorkflowTab === 'ALL') {
      setTimeout(() => {
        part3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    } else {
      setActiveWorkflowTab('PART_3');
    }
  };

  const handleSelectComplaintForWizard = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    const found = complaints.find(c => c.id === complaintId);
    if (found) setActiveComplaint(found);
    
    setNotification(`⚡ Step 2 Activated: Target Case bound to ${complaintId}`);

    if (activeWorkflowTab === 'ALL') {
      part2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setActiveWorkflowTab('PART_2');
    }
  };

  const handleSelectComplaintForGallery = (complaintId: string) => {
    setFilterGalleryComplaintId(complaintId);
    const found = complaints.find(c => c.id === complaintId);
    if (found) setActiveComplaint(found);
    
    setNotification(`🔍 Step 3 Filtered: Viewing Evidence for ${complaintId}`);

    if (activeWorkflowTab === 'ALL') {
      part3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setActiveWorkflowTab('PART_3');
    }
  };

  const handleOpenAmendModal = (c: Complaint) => {
    setAmendModalComplaint(c);
    setIsAmendModalOpen(true);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const isSenior = 
    currentUser?.role === 'CHIEF_INVESTIGATOR' || 
    currentUser?.role === 'SENIOR_INVESTIGATOR' || 
    currentUser?.email?.toLowerCase() === 'bluesapphire777@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'bluesapphiiire777@gmail.com' ||
    currentUser?.email?.toLowerCase().startsWith('bluesapph');

  // If user is a regular citizen/client, render the dedicated User Document & Case Enclave Portal
  if (!isSenior) {
    return <UserEnclavePortal />;
  }

  const userBadge = currentUser?.badgeId || 'FIPG-3638';
  const userName = currentUser?.name || 'Senior Inspector FIPG 3638';

  // Compute storage utilization
  const totalEvidenceCount = evidence.length;
  const totalCasesCount = complaints.length + cases.length;
  const lockedWormCount = evidence.filter(e => e.isWormLocked || e.depositStatus === 'ANCHORED').length;

  return (
    <div className="min-h-screen bg-[#07090E] text-[#D1D5DB] font-sans relative overflow-x-hidden selection:bg-[#EF4444] selection:text-white">
      {/* Ambience & Grid */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.06),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      <AmbientParticleCanvas />

      {/* =========================================================================
          TOP NOTIFICATION TOAST
          ========================================================================= */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-2xl bg-[#0F131D]/95 border border-amber-500/70 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-[0_0_40px_rgba(245,158,11,0.3)] flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <Zap size={16} className="text-amber-400 shrink-0" />
              <span className="font-bold tracking-wide">{activeNotification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MAIN APPLICATION CONTAINER
          ========================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-8">
        
        {/* ---------------------------------------------------------------------
            HEADER PANEL: EXECUTIVE FORENSIC ENCLAVE & COMMAND TELEMETRY
            --------------------------------------------------------------------- */}
        <header className="relative bg-[#0E121B]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/70 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Subtle accent glows */}
          <div className="absolute top-0 right-0 w-96 h-40 bg-gradient-to-bl from-amber-500/10 via-red-500/5 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Identity & Department Clearance */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-[2px] shadow-[0_0_30px_rgba(245,158,11,0.35)]">
                  <div className="w-full h-full bg-[#090C12] rounded-2xl flex items-center justify-center text-amber-400 font-bold text-xl">
                    <Award size={30} className="text-amber-400" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0E121B] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {userName}
                  </h1>
                  <span className="text-xs text-amber-400 font-mono font-black bg-amber-950/90 px-2.5 py-0.5 rounded-lg border border-amber-500/50 shadow-sm">
                    [{userBadge}]
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    JUDICIAL CLEARANCE LV-5
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Head of Forensic Police Investigation &bull; Automated Case Docket Ingestion &amp; WORM Ledger
                </p>
              </div>
            </div>

            {/* Quick Command Actions */}
            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
              <div className="hidden sm:flex flex-col text-right px-3.5 py-1.5 bg-[#080A0F] rounded-xl border border-zinc-800 shadow-inner">
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest font-mono">MASTER UTC CLOCK</span>
                <span className="text-xs text-amber-400 font-bold font-mono">{utcTime || 'SYNCING UTC...'}</span>
              </div>

              <button
                onClick={() => setShowArchGuide(!showArchGuide)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  showArchGuide 
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-[#080A0F] hover:bg-zinc-800 text-amber-300 border border-amber-500/40'
                }`}
                title="Toggle System Architecture & Flow Guide"
              >
                <Sparkles size={15} />
                <span>HOW IT WORKS</span>
              </button>

              <SoundToggle />

              <button
                onClick={() => setIsSeniorConsoleOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <ShieldCheck size={15} className="text-amber-400" />
                <span>CHIEF CONSOLE</span>
              </button>

              <button
                onClick={() => setIsCloudStorageModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/50 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="Open Google Drive WORM Vault"
              >
                <HardDrive size={15} className="text-blue-400" />
                <span>DRIVE VAULT</span>
              </button>

              <button
                onClick={() => setIsTamperModalOpen(true)}
                className="px-3.5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="Report Tampering Event"
              >
                <ShieldAlert size={15} />
                <span>REPORT TAMPER</span>
              </button>

              <button
                onClick={handleSignOut}
                className="p-2.5 bg-[#080A0F] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-all cursor-pointer"
                title="Sign Out of Session"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              COLLAPSIBLE SYSTEM ARCHITECTURE & INTEGRITY FLOW GUIDE
              ------------------------------------------------------------------- */}
          <AnimatePresence>
            {showArchGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-zinc-800 overflow-hidden"
              >
                <div className="bg-[#080A0F]/90 p-5 rounded-2xl border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Shield size={16} />
                      <span>HOW THE FORENSIC WORM VAULT GUARANTEES 100% LEGAL IMMUTABILITY</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                      RFC-6962 &bull; NIST SP 800-86 COMPLIANT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#0E121B] border border-emerald-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">1</span>
                        <span>Phase 1: Case Intake & Docket</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Every incident is registered under a permanent reference number. All revisions are version-tracked with cryptographic author signatures and timestamps.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0E121B] border border-amber-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                        <span>Phase 2: SHA-256 Hashing & Ingestion</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Evidence bytes are parsed client-side to generate an irreversible 256-bit hash digest. The file is locked with WORM flags (Write Once, Read Many).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0E121B] border border-blue-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px]">3</span>
                        <span>Phase 3: Immutable Vault & Proofs</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Evidence artifacts are archived with digital hardware seals, cloud drive backup, Merkle tree root hashes, and court-admissible audit certificates.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* -------------------------------------------------------------------
              OPERATIONAL METRICS & ENCLAVE TELEMETRY STRIP (4 TILES)
              ------------------------------------------------------------------- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/80 text-xs">
            
            {/* Tile 1: Enclave Security */}
            <div className="bg-[#080A0F]/80 p-3.5 rounded-2xl border border-zinc-800/80 flex items-center justify-between hover:border-slate-700 transition-colors">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">ENCLAVE STATUS</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE / SECURE
                </span>
              </div>
              <Cpu size={22} className="text-emerald-500/50" />
            </div>

            {/* Tile 2: Active Dockets */}
            <div className="bg-[#080A0F]/80 p-3.5 rounded-2xl border border-zinc-800/80 flex items-center justify-between hover:border-slate-700 transition-colors">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">CASES &amp; DOCKETS</span>
                <span className="text-white font-bold text-sm mt-0.5">
                  {totalCasesCount} Active Files
                </span>
              </div>
              <FolderKanban size={22} className="text-amber-500/50" />
            </div>

            {/* Tile 3: Anchored WORM Artifacts */}
            <div className="bg-[#080A0F]/80 p-3.5 rounded-2xl border border-zinc-800/80 flex items-center justify-between hover:border-slate-700 transition-colors">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">ANCHORED WORM EVIDENCE</span>
                <span className="text-amber-400 font-bold text-sm mt-0.5 flex items-center gap-1">
                  <span>{lockedWormCount} Records</span>
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">100% WORM</span>
                </span>
              </div>
              <ShieldCheck size={22} className="text-amber-500/50" />
            </div>

            {/* Tile 4: Zero Bit-Drift Ledger */}
            <div className="bg-[#080A0F]/80 p-3.5 rounded-2xl border border-zinc-800/80 flex items-center justify-between hover:border-slate-700 transition-colors">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">CRYPTOGRAPHIC INTEGRITY</span>
                <span className="text-emerald-400 font-bold text-sm mt-0.5">
                  0.00% DRIFT &bull; VERIFIED
                </span>
              </div>
              <Hash size={22} className="text-emerald-500/50" />
            </div>

          </div>
        </header>

        {/* ---------------------------------------------------------------------
            PROFESSIONAL MASTER WORKSTATION SEGMENTED NAVIGATION BAR
            --------------------------------------------------------------------- */}
        <div className="bg-[#0E121B]/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-2.5 sm:p-3 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Navigation Segments */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 w-full md:w-auto">
            
            {/* 1. SENIOR POLICE WORKSTATION DESK */}
            <button
              onClick={() => {
                setActiveWorkflowTab('SENIOR_DESK');
                setTimeout(() => seniorDeskRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer ${
                activeWorkflowTab === 'SENIOR_DESK'
                  ? 'bg-amber-500 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-[1.02]'
                  : 'bg-[#080A0F] text-amber-400 hover:bg-amber-950/40 border border-amber-500/40'
              }`}
            >
              <Award size={15} />
              <span>Senior Workstation</span>
            </button>

            {/* 2. FILE COMPLAINT HUB */}
            <button
              onClick={() => {
                setActiveWorkflowTab('PART_1');
                setTimeout(() => part1Ref.current?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer ${
                activeWorkflowTab === 'PART_1'
                  ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02]'
                  : 'bg-[#080A0F] text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30'
              }`}
            >
              <span className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>1. Intake Docket</span>
            </button>

            {/* 3. EVIDENCE WIZARD */}
            <button
              onClick={() => {
                setActiveWorkflowTab('PART_2');
                setTimeout(() => part2Ref.current?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer ${
                activeWorkflowTab === 'PART_2'
                  ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02]'
                  : 'bg-[#080A0F] text-amber-400 hover:bg-amber-950/40 border border-amber-500/30'
              }`}
            >
              <span className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>2. Ingestion & Seal</span>
            </button>

            {/* 4. VAULT STORE */}
            <button
              onClick={() => {
                setActiveWorkflowTab('PART_3');
                setTimeout(() => part3Ref.current?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer ${
                activeWorkflowTab === 'PART_3'
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] scale-[1.02]'
                  : 'bg-[#080A0F] text-blue-400 hover:bg-blue-950/40 border border-blue-500/30'
              }`}
            >
              <span className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>3. WORM Vault</span>
            </button>

            {/* 5. COMPLETE MASTER STREAM */}
            <button
              onClick={() => {
                setActiveWorkflowTab('ALL');
                setTimeout(() => seniorDeskRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer ${
                activeWorkflowTab === 'ALL'
                  ? 'bg-zinc-700 text-white shadow-md scale-[1.02]'
                  : 'bg-[#080A0F] text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              <Layers size={15} />
              <span>Master Stream</span>
            </button>

          </div>

          {/* Active target case display */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-zinc-400 font-mono pr-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">Case Under Study:</span>
            <strong className="text-amber-400 bg-[#080A0F] px-3 py-1 rounded-xl border border-zinc-800 font-bold shadow-inner">
              {selectedComplaintId || 'CMP-2026-88192'}
            </strong>
          </div>
        </div>

        {/* =========================================================================
            STRUCTURED WORKSTATION SECTIONS
            ========================================================================= */}
        <div className="space-y-10">
          
          {/* =======================================================================
              MASTER SECTION: SENIOR INVESTIGATOR WORKSTATION (FIPG 3638)
              ======================================================================= */}
          {(activeWorkflowTab === 'ALL' || activeWorkflowTab === 'SENIOR_DESK') && (
            <div ref={seniorDeskRef} className="scroll-mt-24 transition-all duration-300">
              <SeniorInvestigatorWorkstation
                onSelectCaseForIngestion={handleSelectComplaintForWizard}
                onSelectCaseForVault={handleSelectComplaintForGallery}
              />
            </div>
          )}

          {/* =======================================================================
              PART 1: FILE COMPLAINT HUB & CASE DOCKET
              ======================================================================= */}
          {(activeWorkflowTab === 'ALL' || activeWorkflowTab === 'PART_1') && (
            <div ref={part1Ref} className="scroll-mt-24 transition-all duration-300">
              <FileComplaintHubSection
                onSelectComplaintForWizard={handleSelectComplaintForWizard}
                onSelectComplaintForGallery={handleSelectComplaintForGallery}
                onOpenFileComplaintModal={() => setIsComplaintModalOpen(true)}
                onOpenAmendSidebox={handleOpenAmendModal}
              />
            </div>
          )}

          {/* Visual Step Transition Divider (When in ALL mode) */}
          {activeWorkflowTab === 'ALL' && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                <div className="h-[1px] w-28 bg-gradient-to-r from-transparent to-zinc-700" />
                <span className="flex items-center gap-1.5 text-zinc-400 bg-[#080A0F] px-3 py-1 rounded-full border border-zinc-800">
                  <span>Case Studied &bull; Ingest Volatile Artifacts</span>
                  <ArrowDown size={14} className="text-amber-400 animate-bounce" />
                </span>
                <div className="h-[1px] w-28 bg-gradient-to-l from-transparent to-zinc-700" />
              </div>
            </div>
          )}

          {/* =======================================================================
              PART 2: EVIDENCE INVESTIGATION WIZARD
              ======================================================================= */}
          {(activeWorkflowTab === 'ALL' || activeWorkflowTab === 'PART_2') && (
            <div ref={part2Ref} className="scroll-mt-24 transition-all duration-300">
              <EvidenceIngestionZone
                linkedComplaintId={selectedComplaintId}
                onSelectComplaintId={(cId) => setSelectedComplaintId(cId)}
                onEvidenceDeposited={handleEvidenceDeposited}
                onRequestProofCertificate={handleOpenProofModal}
                onOpenCloudStorage={() => setIsCloudStorageModalOpen(true)}
                onViewInGallery={() => {
                  if (activeWorkflowTab === 'ALL') {
                    part3Ref.current?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveWorkflowTab('PART_3');
                  }
                }}
              />
            </div>
          )}

          {/* Visual Step Transition Divider (When in ALL mode) */}
          {activeWorkflowTab === 'ALL' && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                <div className="h-[1px] w-28 bg-gradient-to-r from-transparent to-zinc-700" />
                <span className="flex items-center gap-1.5 text-zinc-400 bg-[#080A0F] px-3 py-1 rounded-full border border-zinc-800">
                  <span>Artifact Cryptographically Sealed &bull; Inspect in Vault</span>
                  <ArrowDown size={14} className="text-blue-400 animate-bounce" />
                </span>
                <div className="h-[1px] w-28 bg-gradient-to-l from-transparent to-zinc-700" />
              </div>
            </div>
          )}

          {/* =======================================================================
              PART 3: EVIDENCE GALLERY & ACTUAL VAULT STORE
              ======================================================================= */}
          {(activeWorkflowTab === 'ALL' || activeWorkflowTab === 'PART_3') && (
            <div ref={part3Ref} className="scroll-mt-24 transition-all duration-300">
              <EvidenceGallerySection
                filterComplaintId={filterGalleryComplaintId}
                onClearComplaintFilter={() => setFilterGalleryComplaintId(null)}
                onSelectComplaint={(cId) => setSelectedComplaintId(cId)}
                onOpenProofModal={handleOpenProofModal}
                onOpenCloudStorage={() => setIsCloudStorageModalOpen(true)}
              />
            </div>
          )}

        </div>

        {/* =========================================================================
            PROFESSIONAL FORENSIC TOOLSET (ESSENTIAL TOOLS ONLY)
            ========================================================================= */}
        <div className="bg-[#0E121B]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal size={16} className="text-amber-400" />
                <span>Forensic Bit-Drift &amp; Chain-of-Custody Tools</span>
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Essential verification utilities: standalone SHA-256 bit-drift check, immutable audit timeline &amp; tamper reporting.
              </p>
            </div>

            {/* Tool buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSecondaryTab(secondaryTab === 'VERIFIER' ? 'NONE' : 'VERIFIER')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  secondaryTab === 'VERIFIER'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-[#080A0F] text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <Hash size={14} />
                <span>Bit-Drift Verifier</span>
              </button>

              <button
                onClick={() => setSecondaryTab(secondaryTab === 'AUDIT' ? 'NONE' : 'AUDIT')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  secondaryTab === 'AUDIT'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-[#080A0F] text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <History size={14} />
                <span>Audit Timeline</span>
              </button>

              <button
                onClick={() => setSecondaryTab(secondaryTab === 'CONTROLS' ? 'NONE' : 'CONTROLS')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  secondaryTab === 'CONTROLS'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-[#080A0F] text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Security Integrity</span>
              </button>
            </div>
          </div>

          {/* Active Tool View */}
          <AnimatePresence mode="wait">
            {secondaryTab === 'VERIFIER' && (
              <motion.div
                key="tab-verifier"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pt-2"
              >
                <HashVerifier />
              </motion.div>
            )}

            {secondaryTab === 'AUDIT' && (
              <motion.div
                key="tab-audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pt-2"
              >
                <AuditTimelineSection
                  selectedEvidenceId={selectedAuditEvidenceId}
                  onSelectEvidenceId={setSelectedAuditEvidenceId}
                  onReportTamper={() => setIsTamperModalOpen(true)}
                />
              </motion.div>
            )}

            {secondaryTab === 'CONTROLS' && (
              <motion.div
                key="tab-controls"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pt-2"
              >
                <SecurityIntegritySection
                  onOpenTamperModal={() => setIsTamperModalOpen(true)}
                  onOpenProofModal={handleOpenProofModal}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-zinc-500 py-6 border-t border-zinc-900 space-y-1">
          <div className="font-bold text-zinc-400">Senior Police Investigator Command &bull; Badge FIPG-3638 Judicial Custody Enclave</div>
          <div className="text-[11px] text-zinc-600 font-mono">
            Automated Google Drive WORM Enclave &bull; Lead Investigator Email: bluesapphiiire777@gmail.com
          </div>
        </footer>
      </div>

      {/* =========================================================================
          GLOBAL MODALS & DRAWERS
          ========================================================================= */}
      <TamperReportModal
        isOpen={isTamperModalOpen}
        onClose={() => setIsTamperModalOpen(false)}
        prefillEvidenceId={selectedAuditEvidenceId}
      />

      <ProofCertificateModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        evidence={proofEvidenceTarget}
        currentUser={currentUser}
      />

      <SeniorLeadConsolePanel
        isOpen={isSeniorConsoleOpen}
        onClose={() => setIsSeniorConsoleOpen(false)}
      />

      <CloudStorageInspectorModal
        isOpen={isCloudStorageModalOpen}
        onClose={() => setIsCloudStorageModalOpen(false)}
        onOpenProofModal={handleOpenProofModal}
      />

      <MongoDbInspectorModal
        isOpen={isMongoInspectorOpen}
        onClose={() => setIsMongoInspectorOpen(false)}
      />

      <ComplaintIntakeModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
      />

      <ComplaintAmendSidebox
        complaint={amendModalComplaint}
        isOpen={isAmendModalOpen}
        onClose={() => {
          setIsAmendModalOpen(false);
          setAmendModalComplaint(null);
        }}
      />

      <UserStorageSidePanel />
    </div>
  );
};

export default Vault;
