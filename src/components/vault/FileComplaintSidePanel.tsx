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
  Sparkles, 
  Clock, 
  DollarSign, 
  Paperclip, 
  Hash, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Zap, 
  Edit3, 
  FileCheck2, 
  ChevronDown, 
  ChevronUp,
  FolderOpen
} from 'lucide-react';
import { useStore } from '../../store';
import { Complaint } from '../../types';

interface FileComplaintSidePanelProps {
  onSelectComplaintForWizard: (complaintId: string) => void;
  onSelectComplaintForGallery: (complaintId: string) => void;
  onOpenFileComplaintModal: () => void;
  onOpenAmendSidebox: (complaint: Complaint) => void;
}

export const FileComplaintSidePanel: React.FC<FileComplaintSidePanelProps> = ({
  onSelectComplaintForWizard,
  onSelectComplaintForGallery,
  onOpenFileComplaintModal,
  onOpenAmendSidebox,
}) => {
  const { complaints, activeComplaint, setActiveComplaint, currentUser } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNDER_REVIEW' | 'EVIDENCE_SEALED' | 'SOLVED'>('ALL');
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  const active = activeComplaint || (complaints.length > 0 ? complaints[0] : null);
  const currentVersion = active?.versions[active.versions.length - 1];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EVIDENCE_SEALED':
      case 'EVIDENCE_STORED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 size={10} /> SEALED
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock size={10} /> IN REVIEW
          </span>
        );
      case 'SOLVED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <ShieldCheck size={10} /> SOLVED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#1F232D] rounded-3xl p-5 sm:p-6 border border-slate-700/60 shadow-xl flex flex-col space-y-5 font-mono text-zinc-300">
      
      {/* =========================================================================
          PANEL HEADER: STEP 1 INTAKE & ACTION
          ========================================================================= */}
      <div className="border-b border-zinc-700/60 pb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              File Complaint Hub
            </h3>
          </div>

          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
            {complaints.length} CASES FILED
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-snug">
          Create formal legal complaints, attach forensic evidence, and manage immutable version dossiers.
        </p>

        {/* Master Action Button */}
        <button
          id="file-complaint-sidepanel-btn"
          onClick={onOpenFileComplaintModal}
          className="mt-3.5 w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.98]"
        >
          <Plus size={16} className="text-white" />
          <span>+ FILE NEW FORENSIC COMPLAINT</span>
        </button>
      </div>

      {/* =========================================================================
          SELECTED COMPLAINT QUICK-FOCUS CARD
          ========================================================================= */}
      {active && (
        <div className="p-4 bg-[#181A20] rounded-2xl border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)] space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl pointer-events-none rounded-full" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
              <Zap size={10} /> ACTIVE COMPLAINT FOCUS
            </span>
            {getStatusBadge(active.status)}
          </div>

          <div>
            <div className="text-[11px] text-zinc-400 font-bold">{active.id}</div>
            <h4 className="text-sm font-bold text-white truncate" title={active.title}>
              {active.title}
            </h4>
          </div>

          <div className="text-xs text-zinc-400 line-clamp-2 bg-[#12141A] p-2 rounded-lg border border-zinc-800/80 font-sans">
            "{currentVersion?.statement || 'No statement provided'}"
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
            <span className="flex items-center gap-1">
              <Paperclip size={12} className="text-emerald-400" />
              <span>{currentVersion?.attachments.length || 0} Attached Files</span>
            </span>
            <span className="text-emerald-400 font-bold">
              v{active.currentVersionNumber}.0 Sealed
            </span>
          </div>

          {/* Interconnection Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onSelectComplaintForWizard(active.id)}
              className="py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              title="Ingest evidence into wizard for this complaint"
            >
              <Zap size={12} className="text-amber-400" />
              <span>+ Ingest In Wizard</span>
            </button>

            <button
              onClick={() => onSelectComplaintForGallery(active.id)}
              className="py-1.5 px-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
              title="Filter Evidence Gallery to show this case"
            >
              <FolderOpen size={12} className="text-blue-400" />
              <span>Vault Evidence</span>
            </button>
          </div>

          <button
            onClick={() => onOpenAmendSidebox(active)}
            className="w-full py-1 bg-[#12141A] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded text-[10px] flex items-center justify-center gap-1 transition-colors"
          >
            <Edit3 size={11} className="text-zinc-400" />
            <span>Amend Statement / Add Addendum (WORM Versioning)</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          ALL COMPLAINT DOSSIERS LIST (SEARCH & SELECT)
          ========================================================================= */}
      <div className="space-y-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={13} className="text-emerald-400" />
            <span>Case Dossiers ({filteredComplaints.length})</span>
          </span>

          {/* Quick Category filter buttons */}
          <div className="flex items-center gap-1 text-[10px]">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-1.5 py-0.5 rounded ${statusFilter === 'ALL' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('UNDER_REVIEW')}
              className={`px-1.5 py-0.5 rounded ${statusFilter === 'UNDER_REVIEW' ? 'bg-amber-950 text-amber-300' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Review
            </button>
            <button
              onClick={() => setStatusFilter('EVIDENCE_SEALED')}
              className={`px-1.5 py-0.5 rounded ${statusFilter === 'EVIDENCE_SEALED' ? 'bg-emerald-950 text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Sealed
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search complaint ID or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181A20] border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* List of Complaints */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {filteredComplaints.map((c) => {
            const isSelected = active?.id === c.id;
            const latestVer = c.versions[c.versions.length - 1];
            
            return (
              <div
                key={c.id}
                onClick={() => setActiveComplaint(c)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative ${
                  isSelected 
                    ? 'bg-[#181A20] border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/50' 
                    : 'bg-[#181A20]/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-[#181A20]'
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
                  {getStatusBadge(c.status)}
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 pt-1.5 border-t border-zinc-800/50">
                  <span className="text-zinc-400">{c.category.replace('_', ' ')}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Paperclip size={10} />
                    {latestVer?.attachments.length || 0} Files
                  </span>
                </div>
              </div>
            );
          })}

          {filteredComplaints.length === 0 && (
            <div className="text-center py-6 text-xs text-zinc-500 bg-[#181A20]/40 rounded-xl border border-dashed border-zinc-800">
              No matching complaint records.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
