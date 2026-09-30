import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Phone, 
  BadgeCheck, 
  Sparkles, 
  Sliders, 
  Save, 
  Printer, 
  Search, 
  Layers, 
  FolderOpen, 
  ExternalLink, 
  Hash, 
  Calendar,
  Lock,
  Zap,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  Award
} from 'lucide-react';
import { useStore } from '../../store';
import { SeniorWorkstationReport, WorkstationTeamMember, Complaint, Evidence } from '../../types';
import { EntityLinkGraphModal } from './EntityLinkGraphModal';
import { SplitPaneEvidenceInspector } from './SplitPaneEvidenceInspector';
import { AiTwinCasePatternMatcher } from './AiTwinCasePatternMatcher';
import { downloadCourtAffidavitPdf } from '../../lib/pdfAffidavitGenerator';

interface SeniorInvestigatorWorkstationProps {
  onSelectCaseForIngestion?: (caseId: string) => void;
  onSelectCaseForVault?: (caseId: string) => void;
}

export const SeniorInvestigatorWorkstation: React.FC<SeniorInvestigatorWorkstationProps> = ({
  onSelectCaseForIngestion,
  onSelectCaseForVault,
}) => {
  const { 
    currentUser, 
    complaints, 
    cases, 
    evidence,
    activeComplaint, 
    setActiveComplaint, 
    seniorReports, 
    addSeniorReport,
    setNotification 
  } = useStore();

  // All available cases pool (Complaints + Incident Cases)
  const allCasesPool = [
    ...complaints.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      complainant: c.complainantName,
      status: c.status,
      incidentDate: c.incidentDate,
      type: 'COMPLAINT'
    })),
    ...cases.map(c => ({
      id: c.id,
      title: c.caseName,
      category: c.classification,
      complainant: c.customerId,
      status: c.status,
      incidentDate: new Date(c.createdAt).toISOString(),
      type: 'INCIDENT_CASE'
    }))
  ];

  // Selected Case to study / evaluate
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    activeComplaint?.id || (allCasesPool[0]?.id || 'CMP-2026-88192')
  );

  const activeCaseObj = allCasesPool.find(c => c.id === selectedCaseId) || allCasesPool[0];

  // Workstation Daily Report Form State
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [ideasImplemented, setIdeasImplemented] = useState<string>('');
  const [findingsBreakthroughs, setFindingsBreakthroughs] = useState<string>('');
  const [progressPercentage, setProgressPercentage] = useState<number>(75);
  const [caseStatus, setCaseStatus] = useState<SeniorWorkstationReport['caseStatusAccordingToLead']>('ACTIVE_FIELDWORK');
  const [verdictSummary, setVerdictSummary] = useState<string>('');
  
  // Team members working with Senior Inspector FIPG 3638
  const [teamMembers, setTeamMembers] = useState<WorkstationTeamMember[]>([
    {
      id: 'tm-1',
      name: 'Det. Marcus Kane',
      phone: '+1 (555) 912-4411',
      badge: 'FIP-5520-NET',
      role: 'Cyber Egress & Network PCAP Analysis'
    },
    {
      id: 'tm-2',
      name: 'Dr. Elena Rostova',
      phone: '+1 (555) 291-7789',
      badge: 'FIP-7712-CRYPTO',
      role: 'Hardware TPM Key Recovery'
    }
  ]);

  // New member form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberBadge, setNewMemberBadge] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Modals
  const [isEntityGraphOpen, setIsEntityGraphOpen] = useState(false);
  const [isSplitPaneOpen, setIsSplitPaneOpen] = useState(false);
  const [selectedEvidenceForInspector, setSelectedEvidenceForInspector] = useState<Evidence | null>(null);

  // Filter for past reports
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Workstation View Mode Switcher
  const [workstationView, setWorkstationView] = useState<'AI_PATTERN_MATCHER' | 'DAILY_DOCKET' | 'ALL_SECTIONS'>('AI_PATTERN_MATCHER');

  // Sync when activeComplaint changes
  useEffect(() => {
    if (activeComplaint) {
      setSelectedCaseId(activeComplaint.id);
    }
  }, [activeComplaint]);

  // Sync with backend MongoDB on mount
  useEffect(() => {
    fetch('/api/senior-reports')
      .then(res => res.json())
      .then(data => {
        if (data?.reports && Array.isArray(data.reports) && data.reports.length > 0) {
          data.reports.forEach((rpt: any) => {
            if (!seniorReports.some(r => r.id === rpt.id)) {
              addSeniorReport(rpt);
            }
          });
        }
      })
      .catch(err => console.warn('Senior reports sync notice:', err));
  }, []);

  // Handle adding team member
  const handleAddTeamMember = () => {
    if (!newMemberName.trim()) return;
    const newMember: WorkstationTeamMember = {
      id: `tm-${Date.now()}`,
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || '+1 (555) 000-0000',
      badge: newMemberBadge.trim() || 'FIP-OFFICER',
      role: newMemberRole.trim() || 'Field Investigator'
    };
    setTeamMembers(prev => [...prev, newMember]);
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberBadge('');
    setNewMemberRole('');
    setIsAddingMember(false);
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  // Compute SHA-256 seal for report
  const generateSha256 = async (str: string): Promise<string> => {
    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(str));
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // Submit and save report
  const handleSaveReport = async () => {
    if (!ideasImplemented.trim() && !findingsBreakthroughs.trim()) {
      setNotification('⚠️ Please enter at least one idea implemented or finding obtained.');
      return;
    }

    const canonicalData = JSON.stringify({
      caseId: activeCaseObj?.id,
      date: reportDate,
      investigatorBadge: 'FIPG-3638',
      team: teamMembers,
      ideas: ideasImplemented,
      findings: findingsBreakthroughs,
      progress: progressPercentage,
      status: caseStatus,
      verdict: verdictSummary,
      timestamp: new Date().toISOString()
    });

    const sha256 = await generateSha256(canonicalData);

    const newReport: SeniorWorkstationReport = {
      id: `RPT-${reportDate.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`,
      reportDate,
      timestamp: new Date().toISOString(),
      investigatorName: currentUser?.name || 'Senior Inspector FIPG 3638',
      investigatorBadge: 'FIPG-3638',
      caseId: activeCaseObj?.id || 'CMP-2026-88192',
      caseTitle: activeCaseObj?.title || 'Case Investigation',
      caseCategory: activeCaseObj?.category || 'CRIMINAL_OFFENSE',
      partnerTeam: teamMembers,
      ideasImplemented,
      findingsBreakthroughs,
      caseProgressPercentage: progressPercentage,
      caseStatusAccordingToLead: caseStatus,
      verdictSummary: verdictSummary || 'Investigation proceeding according to protocol. Evidentiary records verified.',
      sha256Seal: sha256,
      courtReady: true
    };

    addSeniorReport(newReport);
    setIdeasImplemented('');
    setFindingsBreakthroughs('');
    setVerdictSummary('');
    setNotification(`🛡️ DAILY POLICE REPORT FILED: Case ${newReport.caseId} Sealed by Senior Inspector FIPG 3638`);
  };

  // Filtered reports
  const filteredReports = seniorReports.filter(r => 
    r.caseId.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    r.caseTitle.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    r.ideasImplemented.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    r.findingsBreakthroughs.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  const getProgressLabel = (pct: number) => {
    if (pct <= 25) return '25% - Initial Intake & Evidence Triage';
    if (pct <= 50) return '50% - Fieldwork & Volatile Capture Active';
    if (pct <= 75) return '75% - Cross-Examination & Cryptanalysis';
    if (pct < 100) return '90% - Suspect Identified & Corroborated';
    return '100% - Case Solved & Judicially Sealed';
  };

  return (
    <div id="senior-workstation-container" className="w-full bg-[#131620] rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl space-y-8 font-mono text-zinc-300 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-52 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-52 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* =========================================================================
          SECTION HEADER: SENIOR POLICE CHIEF WORKSTATION (FIPG 3638)
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 text-xs text-amber-400 font-bold tracking-wider">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">
              ★
            </span>
            <span>CHIEF POLICE INVESTIGATOR WORKSTATION</span>
            <span className="text-zinc-600 font-normal">/</span>
            <span className="text-white bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50">
              BADGE FIPG-3638
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Senior Inspector FIPG 3638 Case Desk
          </h2>

          <p className="text-xs text-zinc-400 font-sans max-w-3xl leading-relaxed">
            Head of forensic investigation daily docket. Study every case, log co-investigators &amp; field team, record investigative hypotheses implemented, catalog obtained discoveries, and track official case progress.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-[#0C0E14] rounded-2xl border border-amber-500/30 text-xs">
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">ALL INCOMING CASES</span>
            <strong className="text-amber-300 font-bold text-sm">
              {allCasesPool.length} Active Dossiers
            </strong>
          </div>

          <div className="px-4 py-2 bg-[#0C0E14] rounded-2xl border border-emerald-500/30 text-xs">
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">REPORTS FILED</span>
            <strong className="text-emerald-400 font-bold text-sm">
              {seniorReports.length} Sealed Daily Logs
            </strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CASE SELECTOR BAR: ALL CASES ROUTED TO HEAD FIPG 3638
          ========================================================================= */}
      <div className="bg-[#0C0E14] rounded-2xl border border-zinc-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <FolderOpen size={20} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">
              Currently Evaluating Case (All Routed to FIPG-3638):
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{activeCaseObj?.id}</span>
              <span className="text-zinc-500 font-normal">&bull;</span>
              <span className="text-amber-300">{activeCaseObj?.title}</span>
            </h3>
          </div>
        </div>

        {/* Case Switcher Dropdown & Intelligence Tool Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <select
            value={selectedCaseId}
            onChange={(e) => {
              setSelectedCaseId(e.target.value);
              const found = complaints.find(c => c.id === e.target.value);
              if (found) setActiveComplaint(found);
            }}
            className="bg-[#151922] border border-amber-500/60 text-amber-300 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 shadow-inner"
          >
            {allCasesPool.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} // {c.title.substring(0, 36)}... ({c.category})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsEntityGraphOpen(true)}
            className="px-3.5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Open Interactive Entity Link Graph"
          >
            <Zap size={14} className="text-purple-400" />
            <span>Entity Graph</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const matchingEv = evidence.find(e => e.caseId === selectedCaseId) || evidence[0];
              setSelectedEvidenceForInspector(matchingEv || null);
              setIsSplitPaneOpen(true);
            }}
            className="px-3.5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Open Dual-Pane Document & Metadata Inspector"
          >
            <FileText size={14} className="text-blue-400" />
            <span>Dual-Pane Inspector</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          WORKSTATION PRIMARY SECTION SWITCHER TABS
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0C0E14] p-2 rounded-2xl border border-zinc-800 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setWorkstationView('AI_PATTERN_MATCHER')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              workstationView === 'AI_PATTERN_MATCHER'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 font-black scale-105'
                : 'bg-[#151922] text-amber-300 hover:text-white border border-amber-500/30 hover:border-amber-500/60'
            }`}
          >
            <Sparkles size={15} className={workstationView === 'AI_PATTERN_MATCHER' ? 'text-black' : 'text-amber-400'} />
            <span>🤖 AI Pattern Matcher &amp; Cold Case Linker</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              workstationView === 'AI_PATTERN_MATCHER' ? 'bg-black/30 text-black font-black' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
            }`}>
              COPILOT
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWorkstationView('DAILY_DOCKET')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              workstationView === 'DAILY_DOCKET'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 font-black scale-105'
                : 'bg-[#151922] text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <FileText size={15} />
            <span>📝 Daily Police Report Form &amp; Field Team</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkstationView('ALL_SECTIONS')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              workstationView === 'ALL_SECTIONS'
                ? 'bg-zinc-700 text-white font-bold'
                : 'bg-[#151922] text-zinc-500 hover:text-zinc-300 border border-zinc-800'
            }`}
          >
            <Layers size={14} />
            <span>All Sections View</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-500 pr-2">
          <span>Target Dossier: <strong className="text-amber-300">{activeCaseObj?.id}</strong></span>
        </div>
      </div>

      {/* =========================================================================
          MODULE: AI TWIN-CASE PATTERN & COLD-CASE CROSS-MATCHER SUITE
          ========================================================================= */}
      {(workstationView === 'AI_PATTERN_MATCHER' || workstationView === 'ALL_SECTIONS') && (
        <AiTwinCasePatternMatcher
          activeCase={{
            id: activeCaseObj?.id || 'CMP-2026-88192',
            title: activeCaseObj?.title || 'Case Investigation',
            category: activeCaseObj?.category || 'FINANCIAL_FRAUD',
            statement: activeComplaint?.versions?.[activeComplaint.versions.length - 1]?.statement || activeCaseObj?.title,
            incidentLocation: activeComplaint?.versions?.[activeComplaint.versions.length - 1]?.incidentLocation || 'New York HQ Data Center / Gateway Node 04',
            suspectDetails: activeComplaint?.versions?.[activeComplaint.versions.length - 1]?.suspectDetails || 'Ex-contractor credential ID #X-8809',
            incidentDate: activeCaseObj?.incidentDate || new Date().toISOString(),
            status: activeCaseObj?.status || 'UNDER_INVESTIGATION'
          }}
          allComplaints={complaints}
          allCases={cases}
          allEvidence={evidence}
          onApplyInsightsToReport={({ ideasImplemented: ideas, findingsBreakthroughs: findings, verdictSummary: verdict }) => {
            setIdeasImplemented(prev => prev ? `${prev}\n\n${ideas}` : ideas);
            setFindingsBreakthroughs(prev => prev ? `${prev}\n\n${findings}` : findings);
            if (verdict) setVerdictSummary(verdict);
            setNotification(`⚡ AI Match Insights from prior cases loaded into Daily Police Report!`);
            // Switch over to Daily Docket so senior can review and sign
            setWorkstationView('DAILY_DOCKET');
          }}
          onSelectCaseForStudy={(targetId) => {
            setSelectedCaseId(targetId);
            const found = complaints.find(c => c.id === targetId);
            if (found) setActiveComplaint(found);
          }}
        />
      )}

      {/* =========================================================================
          MAIN WORKSTATION GRID:
          - Left: Daily Police Case Investigation Report Desk (8 Cols)
          - Right: Field Team & Contacts Working on Case (4 Cols)
          ========================================================================= */}
      {(workstationView === 'DAILY_DOCKET' || workstationView === 'ALL_SECTIONS') && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: DAILY REPORT FORM (8 COLS) */}
        <div className="lg:col-span-8 bg-[#0C0E14] rounded-2xl border border-zinc-800/90 p-6 space-y-6 shadow-xl">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <FileText size={16} className="text-amber-400" />
              <span>Senior Police Daily Case Activity &amp; Findings Report</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500">Date:</span>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="bg-[#151922] border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* 1. IDEAS & STRATEGIES IMPLEMENTED */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                <span>1. Ideas &amp; Investigative Methodologies Implemented Today:</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Hypotheses &bull; Forensic Warrants &bull; Cryptanalysis</span>
            </div>

            {/* Quick-Click Methodologies */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono self-center mr-1">Quick Add:</span>
              {[
                'Memory Enclave Offset Scan (0x7FF)',
                'PCAP Stream Decryption & TLS Fingerprint',
                'Hardware TPM 2.0 Key Extraction',
                'ISP Routing Subpoena & BGP Trace',
                'CCTV Facial Hash Correlation',
                'WORM Biometric Cryptostamp'
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setIdeasImplemented(prev => prev ? `${prev}\n• ${chip}` : `• ${chip}`)}
                  className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 hover:border-amber-400 rounded-md text-[10px] transition-all cursor-pointer font-sans"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={ideasImplemented}
              onChange={(e) => setIdeasImplemented(e.target.value)}
              placeholder="e.g. Executed hardware memory offset scan at 0x7FF0012A, cross-referenced suspect timestamp with DNS relay logs, issued subpoena for offshore proxy subnet..."
              className="w-full bg-[#151922] border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans leading-relaxed"
            />
          </div>

          {/* 2. FINDINGS & CLUES OBTAINED */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>2. Evidence, Clues &amp; Breakthroughs Obtained:</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Checksums &bull; Recovered Payloads &bull; Corroborated Leads</span>
            </div>

            {/* Quick-Click Findings */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono self-center mr-1">Quick Add:</span>
              {[
                'SHA-256 Bit-Level Checksum Verified (0.00% Drift)',
                '14 Unencrypted SWIFT Header Tokens Recovered',
                'Physical Presence Corroborated via CCTV Timestamp',
                'Zero-Day Payload Extracted & Isolated in Sandbox',
                'Suspect Device IMEI Matched to Cell Tower Beacon'
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFindingsBreakthroughs(prev => prev ? `${prev}\n• ${chip}` : `• ${chip}`)}
                  className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 rounded-md text-[10px] transition-all cursor-pointer font-sans"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={findingsBreakthroughs}
              onChange={(e) => setFindingsBreakthroughs(e.target.value)}
              placeholder="e.g. Recovered 14 unencrypted SWIFT authorization headers matching revoked token signature #X-8809. Established physical presence via CCTV feed at 03:14 UTC..."
              className="w-full bg-[#151922] border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans leading-relaxed"
            />
          </div>

          {/* 3. CASE PROGRESS METER & OFFICIAL STAGE */}
          <div className="space-y-3 bg-[#151922] rounded-xl p-4 border border-zinc-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sliders size={14} className="text-blue-400" />
                <span>3. Case Progress (According to Senior Inspector FIPG 3638):</span>
              </span>
              <strong className="text-amber-400 font-bold">{progressPercentage}% Complete</strong>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progressPercentage}
              onChange={(e) => setProgressPercentage(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            {/* Milestone Buttons */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { val: 25, label: '25% Triage' },
                { val: 50, label: '50% Fieldwork' },
                { val: 75, label: '75% Cryptanalysis' },
                { val: 90, label: '90% Indictment' },
                { val: 100, label: '100% Sealed' }
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setProgressPercentage(m.val)}
                  className={`px-1.5 py-1 rounded-md text-[10px] font-bold text-center transition-all cursor-pointer ${
                    progressPercentage === m.val
                      ? 'bg-amber-500 text-black shadow-sm font-black'
                      : 'bg-[#0C0E14] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="font-mono text-amber-300 font-semibold">{getProgressLabel(progressPercentage)}</span>
            </div>

            {/* Lead Status Selector */}
            <div className="pt-2 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] text-zinc-400">Official Case Stage:</span>
              <div className="flex flex-wrap gap-1.5">
                {(['INTAKE_STUDY', 'ACTIVE_FIELDWORK', 'CRYPTO_CROSS_EXAMINATION', 'VERDICT_SEALED', 'SOLVED_CLOSED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setCaseStatus(st)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                      caseStatus === st
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. FINAL VERDICT / REMARKS */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <span>4. Final Investigator Verdict &amp; Recommended Next Actions:</span>
            </label>
            <input
              type="text"
              value={verdictSummary}
              onChange={(e) => setVerdictSummary(e.target.value)}
              placeholder="e.g. Case ready for judicial indictment. Forwarding sealed WORM package to Crown Prosecutor."
              className="w-full bg-[#151922] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-400 font-sans"
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleSaveReport}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all transform active:scale-95"
            >
              <Save size={15} />
              <span>SEAL &amp; SAVE DAILY POLICE REPORT (SHA-256)</span>
            </button>

            <div className="flex items-center gap-2">
              {onSelectCaseForIngestion && (
                <button
                  onClick={() => onSelectCaseForIngestion(activeCaseObj?.id)}
                  className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Zap size={13} />
                  <span>Ingest in Wizard</span>
                </button>
              )}

              {onSelectCaseForVault && (
                <button
                  onClick={() => onSelectCaseForVault(activeCaseObj?.id)}
                  className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <FolderOpen size={13} />
                  <span>View in Vault</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: CO-WORKERS & INVESTIGATION TEAM (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-[#0C0E14] rounded-2xl border border-zinc-800/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <UserCheck size={16} className="text-emerald-400" />
                <span>Investigation Team Logged</span>
              </div>
              <button
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
              >
                <Plus size={11} />
                <span>Add Officer</span>
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans">
              Personnel co-working on <strong className="text-white">{activeCaseObj?.id}</strong> alongside Senior Inspector FIPG 3638:
            </p>

            {/* List of Team Members */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {teamMembers.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#151922] rounded-xl p-3 border border-zinc-800/90 space-y-1 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <User size={12} className="text-amber-400" />
                        <span>{m.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">[{m.badge}]</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                        <Phone size={10} />
                        <span>{m.phone}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveTeamMember(m.id)}
                      className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from case"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="text-[10px] text-zinc-400 font-sans pt-1 border-t border-zinc-800/40">
                    Role: {m.role}
                  </div>
                </div>
              ))}

              {teamMembers.length === 0 && (
                <div className="text-center py-4 text-xs text-zinc-500">
                  No co-workers logged yet.
                </div>
              )}
            </div>

            {/* Add Team Member Modal / Inline Form */}
            {isAddingMember && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#151922] p-3 rounded-xl border border-amber-500/40 space-y-2 text-xs"
              >
                <div className="font-bold text-amber-300 text-[11px]">Log New Co-Worker:</div>
                <input
                  type="text"
                  placeholder="Officer / Analyst Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-[#0C0E14] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600"
                />
                <input
                  type="text"
                  placeholder="Phone Number (e.g. +1 555-019-8841)"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full bg-[#0C0E14] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600"
                />
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    placeholder="Badge ID (e.g. FIP-4091)"
                    value={newMemberBadge}
                    onChange={(e) => setNewMemberBadge(e.target.value)}
                    className="w-full bg-[#0C0E14] border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-600"
                  />
                  <input
                    type="text"
                    placeholder="Specialty Role"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full bg-[#0C0E14] border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-600"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsAddingMember(false)}
                    className="px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded-lg text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTeamMember}
                    className="px-3 py-1 bg-amber-500 text-black font-bold rounded-lg text-[10px]"
                  >
                    Save Officer
                  </button>
                </div>
              </motion.div>
            )}

          </div>

          {/* Quick Police Badge Card */}
          <div className="bg-[#0C0E14] rounded-2xl border border-amber-500/30 p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black">
                <Award size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Senior Inspector FIPG 3638</div>
                <div className="text-[10px] text-amber-400 font-bold">CHIEF OF FORENSIC OPERATIONS</div>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans pt-1">
              Authoritative judicial signatory. All filings, evidence packages &amp; daily logs are cryptographically sealed with hardware TPM 2.0 signatures.
            </p>
          </div>

        </div>

      </div>
      )}

      {/* =========================================================================
          HISTORICAL DAILY POLICE REPORTS ARCHIVE (BY SENIOR INSPECTOR FIPG 3638)
          ========================================================================= */}
      {(workstationView === 'DAILY_DOCKET' || workstationView === 'ALL_SECTIONS') && (
      <div className="bg-[#0C0E14] rounded-2xl border border-zinc-800/90 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <span>Sealed Historical Daily Police Reports ({filteredReports.length})</span>
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Immutable record of daily case studies, team contacts, ideas implemented, and progress benchmarks.
            </p>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search reports by case or keyword..."
              value={historySearchTerm}
              onChange={(e) => setHistorySearchTerm(e.target.value)}
              className="bg-[#151922] border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Reports Accordion List */}
        <div className="space-y-3">
          {filteredReports.map((rpt) => {
            const isExpanded = expandedReportId === rpt.id;
            return (
              <div
                key={rpt.id}
                className="bg-[#151922] rounded-xl border border-zinc-800/80 overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedReportId(isExpanded ? null : rpt.id)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-amber-400">{rpt.caseId}</span>
                      <span className="text-zinc-600">&bull;</span>
                      <span className="text-white font-semibold">{rpt.caseTitle}</span>
                      <span className="text-zinc-600">&bull;</span>
                      <span className="text-zinc-400 text-[11px]">{rpt.reportDate}</span>
                    </div>
                    <div className="text-xs text-zinc-400 font-sans truncate max-w-2xl">
                      "{rpt.ideasImplemented.substring(0, 90)}..."
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start md:self-center">
                    <div className="text-right text-xs">
                      <span className="text-amber-400 font-bold block">{rpt.caseProgressPercentage}% Progress</span>
                      <span className="text-[10px] text-zinc-500">{rpt.caseStatusAccordingToLead}</span>
                    </div>

                    <div className="p-1 rounded-lg bg-zinc-800 text-zinc-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-[#0C0E14] border-t border-zinc-800/80 space-y-4 font-sans text-xs"
                  >
                    {/* Team on this report */}
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                        Co-Working Team &amp; Contacts:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {rpt.partnerTeam.map(m => (
                          <div key={m.id} className="px-2.5 py-1 bg-[#151922] rounded-lg border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                            <strong className="text-white">{m.name}</strong> ({m.role}) &bull; <span className="text-emerald-400">{m.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ideas Implemented */}
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                        Ideas &amp; Methodologies Implemented:
                      </span>
                      <p className="text-zinc-300 bg-[#151922] p-3 rounded-xl border border-zinc-800/60 whitespace-pre-wrap leading-relaxed">
                        {rpt.ideasImplemented}
                      </p>
                    </div>

                    {/* Findings Obtained */}
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                        Findings &amp; Discoveries Obtained:
                      </span>
                      <p className="text-zinc-300 bg-[#151922] p-3 rounded-xl border border-zinc-800/60 whitespace-pre-wrap leading-relaxed">
                        {rpt.findingsBreakthroughs}
                      </p>
                    </div>

                    {/* Cryptographic Seal & Export Action */}
                    <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">
                          SHA-256 Seal: <strong className="text-amber-400 font-mono">{rpt.sha256Seal.substring(0, 24)}...</strong>
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          <BadgeCheck size={13} />
                          <span>FIPG-3638 VERIFIED</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(JSON.stringify(rpt, null, 2));
                            setNotification(`📋 Report JSON Copied: ${rpt.id}`);
                          }}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Copy Raw Digest</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const affidavitText = `================================================================================
SENIOR POLICE INVESTIGATOR OFFICIAL DAILY REPORT - BADGE FIPG-3638
================================================================================
REPORT ID           : ${rpt.id}
DATE FILED          : ${rpt.reportDate} (Timestamp: ${rpt.timestamp})
INVESTIGATOR LEAD   : ${rpt.investigatorName} [${rpt.investigatorBadge}]
TARGET CASE ID      : ${rpt.caseId}
CASE TITLE          : ${rpt.caseTitle} (${rpt.caseCategory})
CASE PROGRESS       : ${rpt.caseProgressPercentage}% (${rpt.caseStatusAccordingToLead})
COURT ADMISSIBILITY : CERTIFIED (JUDICIAL CLEARANCE LEVEL-5)
SHA-256 SEAL DIGEST : ${rpt.sha256Seal}
================================================================================
INVESTIGATION TEAM ROSTER:
${rpt.partnerTeam.map(m => ` - ${m.name} [Badge: ${m.badge}] | Role: ${m.role} | Tel: ${m.phone}`).join('\n')}

================================================================================
1. IDEAS & METHODOLOGIES IMPLEMENTED:
${rpt.ideasImplemented}

================================================================================
2. EVIDENCE, CLUES & BREAKTHROUGHS OBTAINED:
${rpt.findingsBreakthroughs}

================================================================================
3. OFFICIAL VERDICT / RECOMMENDED ACTIONS:
${rpt.verdictSummary}
================================================================================
SIGNATURE OF SENIOR INVESTIGATOR: [FIPG-3638-DIGITALLY-SEALED]
================================================================================`;
                            const blob = new Blob([affidavitText], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `AFFIDAVIT_${rpt.id}_${rpt.caseId}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            setTimeout(() => URL.revokeObjectURL(url), 10000);
                            setNotification(`📄 Exported Court Affidavit (TXT): ${rpt.id}`);
                          }}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <FileText size={12} />
                          <span>Download TXT</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            downloadCourtAffidavitPdf(rpt, null, evidence);
                            setNotification(`📄 Downloaded Certified Court Affidavit PDF: ${rpt.id}`);
                          }}
                          className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                          <Printer size={12} />
                          <span>Export Legal PDF (QR Seal)</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}

          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-xs text-zinc-500">
              No matching daily police reports found.
            </div>
          )}
        </div>
      </div>
      )}

      {/* Interactive Entity Link Graph Modal */}
      {isEntityGraphOpen && (
        <EntityLinkGraphModal
          isOpen={isEntityGraphOpen}
          onClose={() => setIsEntityGraphOpen(false)}
          caseId={activeCaseObj?.id}
          caseTitle={activeCaseObj?.title}
        />
      )}

      {/* Dual-Pane Forensic Evidence & Metadata Inspector */}
      {isSplitPaneOpen && selectedEvidenceForInspector && (
        <SplitPaneEvidenceInspector
          isOpen={isSplitPaneOpen}
          onClose={() => setIsSplitPaneOpen(false)}
          evidence={selectedEvidenceForInspector}
          report={seniorReports.find(r => r.caseId === selectedCaseId) || null}
          onSaveReportNotes={(notes) => {
            setFindingsBreakthroughs(notes);
            setNotification('⚡ Dossier Notes Synced from Dual-Pane Inspector');
          }}
        />
      )}

    </div>
  );
};
