import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  FileText, 
  Plus, 
  Lock, 
  GitBranch, 
  ShieldCheck, 
  Clock, 
  User, 
  CheckCircle2, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  FileSpreadsheet, 
  FileCode, 
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Complaint, ComplaintVersion } from '../types';
import { ComplaintIntakeModal } from './ComplaintIntakeModal';
import { ComplaintAmendSidebox } from './ComplaintAmendSidebox';

export const ComplaintCenter: React.FC = () => {
  const { 
    complaints, 
    activeComplaint, 
    setActiveComplaint, 
    currentUser
  } = useStore();

  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isAmendSideboxOpen, setIsAmendSideboxOpen] = useState(false);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState<number>(0);

  // Sync active complaint versions
  const active = activeComplaint || (complaints.length > 0 ? complaints[0] : null);
  const displayedVersion: ComplaintVersion | undefined = active?.versions[selectedVersionIdx] || active?.versions[active.versions.length - 1];

  // User's own complaints or all
  const userComplaints = complaints.filter(c => 
    !currentUser?.email || c.complainantEmail.toLowerCase() === currentUser.email.toLowerCase() || currentUser.role === 'FORENSIC_INVESTIGATOR'
  );

  return (
    <div id="complaint-center-container" className="space-y-6">
      {/* Top Header & Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-slate-100 tracking-tight">Forensic Complaint & Incident Registry</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                WORM SHA-256 SEALED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured complaint filings • Deterministic hash key conversion • Non-deletable multi-version custody
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            id="file-new-complaint-btn"
            onClick={() => setIsIntakeOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>File New Complaint</span>
          </button>
        </div>
      </div>

      {/* User Complaint Filing Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List of User Complaints (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Registered Complaints ({userComplaints.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Immutable Ledger</span>
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {userComplaints.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                  No complaints registered yet. Click &quot;File New Complaint&quot; above to submit a case.
                </div>
              ) : (
                userComplaints.map((c) => {
                  const isSelected = active?.id === c.id;
                  const hasVersions = c.versions.length > 1;

                  return (
                    <div
                      key={c.id}
                      id={`user-complaint-card-${c.id}`}
                      onClick={() => {
                        setActiveComplaint(c);
                        setSelectedVersionIdx(c.versions.length - 1);
                      }}
                      className={`cursor-pointer rounded-xl p-4 transition-all border text-left ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          {c.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {hasVersions && (
                            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                              <GitBranch className="w-2.5 h-2.5" />
                              v{c.currentVersionNumber}.0
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-800 text-slate-300">
                            {c.priority}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug mb-2">
                        {c.title}
                      </h3>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Lock className="w-3 h-3" />
                          WORM SEALED
                        </span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Complaint Detail & Amendment Trigger (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {active ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-500/40">
                        {active.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        Category: <strong className="text-emerald-400">{active.category}</strong>
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Filed: {new Date(active.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-100 pt-1">
                      {active.title}
                    </h2>
                  </div>

                  {/* UPDATE / AMEND BUTTON */}
                  <button
                    id="trigger-amend-sidebox-btn"
                    onClick={() => setIsAmendSideboxOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>Update / Amend (Generate Copy)</span>
                  </button>
                </div>

                {/* Explanatory Banner about Amendment Rule */}
                <div className="bg-slate-950 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3">
                  <GitBranch className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-amber-300 block mb-0.5">
                      Immutable Multi-Version Structure
                    </span>
                    If you need to update or add documents to your complaint, clicking{' '}
                    <strong className="text-amber-300">Update / Amend</strong> will open the side-box. The original message (v1.0) stays permanently as-is, and a secondary revision copy is generated for changes.
                  </div>
                </div>

                {/* Cryptographic SHA-256 Hash Seal Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      Cryptographic SHA-256 Seal Key (Non-Deletable)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      WORM VERIFIED
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 break-all select-all">
                    {active.latestSha256Seal}
                  </div>
                </div>

                {/* Version Selector Tabs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      Available Versions ({active.versions.length})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Select a version below to review its exact state
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {active.versions.map((ver, idx) => (
                      <button
                        key={ver.versionNumber}
                        id={`user-version-tab-${ver.versionNumber}`}
                        onClick={() => setSelectedVersionIdx(idx)}
                        className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all shrink-0 ${
                          selectedVersionIdx === idx
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {ver.isOriginal ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                        <span>{ver.versionLabel}</span>
                      </button>
                    ))}
                  </div>

                  {/* Displayed Version Content */}
                  {displayedVersion && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{displayedVersion.versionLabel}</span>
                          {displayedVersion.isOriginal ? (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                              ORIGINAL MASTER FILING
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                              REVISION COPY
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(displayedVersion.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      {displayedVersion.revisionNotes && (
                        <div className="bg-amber-950/30 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200">
                          <strong className="text-amber-400 block mb-0.5">Revision Notes:</strong>
                          {displayedVersion.revisionNotes}
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Incident Statement / Complaint Narrative:
                        </span>
                        <p className="text-xs text-slate-200 bg-slate-900 p-3.5 rounded-lg border border-slate-800 leading-relaxed font-sans">
                          {displayedVersion.statement}
                        </p>
                      </div>

                      {/* Auxiliary Metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Location / Subnet</span>
                          <span className="text-slate-200">{displayedVersion.incidentLocation || 'N/A'}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Suspect / Actor</span>
                          <span className="text-slate-200">{displayedVersion.suspectDetails || 'N/A'}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Loss Estimate</span>
                          <span className="text-emerald-400 font-mono font-semibold">{displayedVersion.financialLossEstimated || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Attached Evidence Files */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Attached Evidence Files ({displayedVersion.attachments.length})
                        </span>
                        <div className="space-y-1.5">
                          {displayedVersion.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                <div className="truncate">
                                  <span className="font-medium text-slate-200 block truncate">{att.fileName}</span>
                                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                    <span>{att.fileSize}</span>
                                    <span>•</span>
                                    <span className="text-emerald-400">SHA-256: {att.sha256Hash}</span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                                BIT-SEALED
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Senior Investigator Findings & Review Status */}
                {active.seniorReview && (
                  <div className="bg-gradient-to-r from-indigo-950/40 to-slate-950 border border-indigo-500/30 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-slate-200">Senior Investigator Case Review</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        {active.seniorReview.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Lead Investigator Assigned:</span>
                        <span className="font-medium text-indigo-300">{active.seniorReview.assignedTo} ({active.seniorReview.investigatorBadge})</span>
                      </div>
                      {active.seniorReview.forensicSummary && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Forensic Assessment:</span>
                          <p className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                            {active.seniorReview.forensicSummary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                No complaint selected. Select a complaint or file a new one.
              </div>
            )}
          </div>
        </div>

      {/* Modals and Sidebox */}
      <ComplaintIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
      />

      <ComplaintAmendSidebox
        complaint={active}
        isOpen={isAmendSideboxOpen}
        onClose={() => setIsAmendSideboxOpen(false)}
      />
    </div>
  );
};
