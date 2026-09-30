import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  ShieldCheck, 
  Lock, 
  Search, 
  ArrowRight, 
  ChevronRight, 
  Clock, 
  Paperclip, 
  Hash, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Zap, 
  Edit3, 
  FileCheck2, 
  FolderOpen,
  User,
  Calendar,
  Filter,
  Eye,
  ArrowDown
} from 'lucide-react';
import { useStore } from '../../store';
import { Complaint, ComplaintVersion, ComplaintStatus } from '../../types';

interface FileComplaintHubSectionProps {
  onSelectComplaintForWizard: (complaintId: string) => void;
  onSelectComplaintForGallery: (complaintId: string) => void;
  onOpenFileComplaintModal: () => void;
  onOpenAmendSidebox: (complaint: Complaint) => void;
}

export const FileComplaintHubSection: React.FC<FileComplaintHubSectionProps> = ({
  onSelectComplaintForWizard,
  onSelectComplaintForGallery,
  onOpenFileComplaintModal,
  onOpenAmendSidebox,
}) => {
  const { complaints, activeComplaint, setActiveComplaint, currentUser } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNDER_REVIEW' | 'EVIDENCE_VERIFIED' | 'SOLVED'>('ALL');
  const [selectedVersionIdx, setSelectedVersionIdx] = useState<number | null>(null);

  const active = activeComplaint || (complaints.length > 0 ? complaints[0] : null);
  const currentVersion: ComplaintVersion | undefined = 
    selectedVersionIdx !== null && active?.versions[selectedVersionIdx]
      ? active.versions[selectedVersionIdx]
      : active?.versions[active.versions.length - 1];

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complainantName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  const getStatusText = (status: ComplaintStatus) => {
    switch (status) {
      case 'EVIDENCE_VERIFIED':
      case 'REGISTERED':
        return <span className="text-emerald-400 font-semibold">● SEALED (WORM)</span>;
      case 'UNDER_REVIEW':
      case 'FORENSIC_ANALYSIS':
        return <span className="text-amber-400 font-semibold">● IN REVIEW</span>;
      case 'SOLVED':
      case 'CLOSED':
        return <span className="text-blue-400 font-semibold">● SOLVED</span>;
      default:
        return <span className="text-zinc-400">{status}</span>;
    }
  };

  return (
    <div id="file-complaint-hub-section" className="w-full bg-[#151922] rounded-3xl border border-slate-700/70 p-6 sm:p-8 shadow-2xl space-y-6 font-mono text-zinc-300 relative overflow-hidden">
      
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 left-0 w-96 h-40 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* =========================================================================
          SECTION HEADER: PART 01 // FILE COMPLAINT HUB
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-bold tracking-wider">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs">
              01
            </span>
            <span>PART 01 &bull; FORENSIC CASE INTAKE</span>
            <span className="text-zinc-600 font-normal">/</span>
            <span className="text-zinc-400 font-normal">{complaints.length} Registered Case Dossiers</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            File Complaint Hub
          </h2>

          <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-3xl">
            Register formal legal complaints, attach initial incident streams, establish immutable SHA-256 version histories, and bind cases directly into the Evidence Ingestion Wizard.
          </p>
        </div>

        {/* Primary Master Action */}
        <div className="flex items-center gap-3">
          <button
            id="file-complaint-master-btn"
            onClick={onOpenFileComplaintModal}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all transform active:scale-95"
          >
            <Plus size={16} className="text-white" />
            <span>FILE NEW COMPLAINT</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2-PANEL BALANCED COMPLAINT INTERACTION GRID
          - Left: Active Focus Case Card with direct Wizard & Vault links (7 cols)
          - Right: Searchable Case Dossiers Browser (5 cols)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT SUB-PANEL: ACTIVE CASE DOSSIER & WORKFLOW LINKING (7 Cols) */}
        <div className="lg:col-span-7 bg-[#11141B] rounded-2xl border border-emerald-500/30 p-5 sm:p-6 space-y-5 flex flex-col justify-between relative shadow-lg">
          <div className="space-y-4">
            
            {/* Dossier Header Info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800 flex items-center gap-1.5">
                  <Zap size={13} /> ACTIVE TARGET CASE
                </span>
                <span className="text-xs text-zinc-400">{active?.id || 'NO SELECTION'}</span>
              </div>

              <div className="text-xs">
                {active && getStatusText(active.status)}
              </div>
            </div>

            {active ? (
              <>
                {/* Title & Metadata */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {active.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-2">
                    <span className="flex items-center gap-1">
                      <User size={12} className="text-zinc-500" />
                      <span>{active.complainantName}</span>
                    </span>
                    <span className="text-zinc-600">&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-zinc-500" />
                      <span>{new Date(active.incidentDate).toLocaleDateString()}</span>
                    </span>
                    <span className="text-zinc-600">&bull;</span>
                    <span className="text-emerald-400 font-semibold">
                      {active.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Statement & Version Viewer */}
                <div className="bg-[#181C26] rounded-xl p-4 border border-zinc-800/80 space-y-2.5 font-sans">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                      <FileCheck2 size={13} className="text-emerald-400" />
                      <span>Dossier Statement (v{currentVersion?.versionNumber || active.currentVersionNumber}.0 Sealed)</span>
                    </span>
                    <span className="text-zinc-500 text-[11px]">
                      Seal: {currentVersion?.sha256Seal?.substring(0, 10)}...
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed max-h-24 overflow-y-auto pr-1 whitespace-pre-wrap">
                    "{currentVersion?.statement || 'No detailed statement provided for this version.'}"
                  </p>

                  {/* Attached Evidence Thumbnails & File count */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Paperclip size={13} className="text-emerald-400" />
                      <span>{currentVersion?.attachments.length || 0} Forensic Attachments</span>
                    </span>

                    {active.versions.length > 1 && (
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-zinc-500">History:</span>
                        {active.versions.map((ver, idx) => (
                          <button
                            key={ver.versionNumber}
                            onClick={() => setSelectedVersionIdx(idx)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              (selectedVersionIdx === idx || (selectedVersionIdx === null && idx === active.versions.length - 1))
                                ? 'bg-emerald-500 text-black'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            v{ver.versionNumber}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                No active complaint selected. Please file a complaint or select one from the right list.
              </div>
            )}
          </div>

          {/* Direct Workflow Pipeline Actions */}
          {active && (
            <div className="space-y-2.5 pt-3 border-t border-zinc-800 font-mono">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Direct Workflow Interconnections:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => onSelectComplaintForWizard(active.id)}
                  className="py-2.5 px-3.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] group"
                >
                  <Zap size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>2. Ingest In Wizard &rarr;</span>
                </button>

                <button
                  onClick={() => onSelectComplaintForGallery(active.id)}
                  className="py-2.5 px-3.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all group"
                >
                  <FolderOpen size={14} className="text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>3. View in Vault &rarr;</span>
                </button>
              </div>

              <button
                onClick={() => onOpenAmendSidebox(active)}
                className="w-full py-2 bg-[#181C26] hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit3 size={13} className="text-emerald-400" />
                <span>Amend Statement / Add Addendum (WORM Versioning)</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SUB-PANEL: SEARCHABLE COMPLAINT DOSSIERS LIST (5 Cols) */}
        <div className="lg:col-span-5 bg-[#11141B] rounded-2xl border border-zinc-800/80 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-emerald-400" />
                <span>Registered Cases ({filteredComplaints.length})</span>
              </span>

              {/* Status filter chips */}
              <div className="flex items-center gap-1 text-[10px]">
                {(['ALL', 'UNDER_REVIEW', 'EVIDENCE_VERIFIED'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                      statusFilter === filter 
                        ? 'bg-zinc-700 text-white' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {filter === 'ALL' ? 'All' : filter === 'UNDER_REVIEW' ? 'Review' : 'Sealed'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by ID, name, or incident..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#181C26] border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Scrollable List */}
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {filteredComplaints.map((c) => {
                const isSelected = active?.id === c.id;
                const latestVer = c.versions[c.versions.length - 1];

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveComplaint(c);
                      setSelectedVersionIdx(null);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#181C26] border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                        : 'bg-[#181C26]/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-[#181C26]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                          <span className="font-bold text-white">{c.id}</span>
                          <span>&bull;</span>
                          <span>{new Date(c.incidentDate).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs font-bold text-zinc-200 truncate mt-0.5">
                          {c.title}
                        </div>
                      </div>
                      <div className="text-[10px] shrink-0">
                        {c.status === 'EVIDENCE_VERIFIED' || c.status === 'REGISTERED' ? (
                          <span className="text-emerald-400 font-bold">SEALED</span>
                        ) : (
                          <span className="text-amber-400 font-bold">REVIEW</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 pt-1.5 border-t border-zinc-800/40">
                      <span>{c.complainantName}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Paperclip size={10} />
                        {latestVer?.attachments.length || 0} Files
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredComplaints.length === 0 && (
                <div className="text-center py-8 text-xs text-zinc-500 bg-[#181C26]/40 rounded-xl border border-dashed border-zinc-800">
                  No matching complaint records found.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

