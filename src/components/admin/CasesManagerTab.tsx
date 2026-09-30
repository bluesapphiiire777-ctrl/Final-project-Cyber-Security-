import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderPlus, Shield, Lock, Unlock, 
  Search, CheckCircle2, AlertCircle, Plus,
  FileText, User, Building, X
} from 'lucide-react';
import { Case, InvestigationStatus } from '../../types';

interface CasesManagerTabProps {
  cases: Case[];
  onAddCase: (newCase: Case) => void;
  onToggleCaseFreeze: (caseId: string) => void;
  onUpdateCaseStatus: (caseId: string, status: string) => void;
}

export default function CasesManagerTab({
  cases,
  onAddCase,
  onToggleCaseFreeze,
  onUpdateCaseStatus
}: CasesManagerTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Case Form State
  const [caseName, setCaseName] = useState('');
  const [customerId, setCustomerId] = useState('INTERPOL-EC3');
  const [classification, setClassification] = useState('TOP_SECRET');
  const [actionBadge, setActionBadge] = useState<'UPLOADS REQUIRED' | 'VERIFIED' | 'IN AUDIT' | 'SEALED' | 'HIGH PRIORITY'>('HIGH PRIORITY');

  const filteredCases = cases.filter((c) => {
    const matchesQuery = 
      c.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.classification.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName.trim()) return;

    const newCase: Case = {
      id: `case-${String(cases.length + 1).padStart(3, '0')}`,
      caseName: caseName.trim(),
      customerId: customerId.trim(),
      classification,
      status: InvestigationStatus.OPEN,
      progress: 10,
      fileCount: 0,
      actionBadge,
      createdAt: Date.now(),
    };

    onAddCase(newCase);
    setCaseName('');
    setIsCreateModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNDER_INVESTIGATION':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
      case 'OPEN':
        return 'bg-blue-950/80 text-blue-400 border-blue-500/40';
      case 'VERIFIED':
      case 'SEALED':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
      case 'FROZEN':
        return 'bg-red-950/80 text-red-400 border-red-500/40 animate-pulse';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="bg-[#1F232D] rounded-3xl p-6 border border-amber-900/30 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases by title, customer agency, or classification..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-amber-500/60 transition-all"
          />
        </div>

        {/* Filters and New Case Button */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-slate-300 text-xs font-mono focus:outline-none focus:border-amber-500/60"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
            <option value="OPEN">OPEN</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="SEALED">SEALED</option>
            <option value="FROZEN">FROZEN</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 shrink-0"
          >
            <Plus size={16} />
            <span>CREATE INCIDENT CASE</span>
          </button>
        </div>
      </div>

      {/* Cases Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((c) => {
          const isFrozen = c.status === 'FROZEN';

          return (
            <motion.div
              key={c.id}
              whileHover={{ y: -3 }}
              className={`bg-[#1F232D] rounded-3xl border p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all ${
                isFrozen ? 'border-red-500/60 shadow-red-500/10' : 'border-amber-900/30 hover:border-amber-500/40'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-amber-400">
                      {c.id}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {c.classification}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-black uppercase ${getStatusBadge(c.status)}`}>
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Case Title */}
                <h3 className="text-base font-serif font-black text-white mb-2 leading-snug">
                  {c.caseName}
                </h3>

                {/* Customer Agency */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-4">
                  <Building size={13} className="text-amber-400" />
                  <span>{c.customerId}</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 mb-6">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>FORENSIC COMPLETION</span>
                    <span className="text-amber-400 font-bold">{c.progress || 60}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                      style={{ width: `${c.progress || 60}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                {/* Freeze / Unfreeze Toggle */}
                <button
                  onClick={() => onToggleCaseFreeze(c.id)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    isFrozen
                      ? 'bg-red-600 text-black border-red-500 hover:bg-red-500'
                      : 'bg-black/40 text-slate-300 border-white/10 hover:border-red-500/40 hover:text-red-400'
                  }`}
                >
                  {isFrozen ? <Unlock size={12} /> : <Lock size={12} />}
                  <span>{isFrozen ? 'UNFREEZE CASE' : 'FREEZE INGESTION'}</span>
                </button>

                {/* Status Selector */}
                <select
                  value={c.status}
                  onChange={(e) => onUpdateCaseStatus(c.id, e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/10 text-[10px] font-mono text-amber-300 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="UNDER_INVESTIGATION">INVESTIGATING</option>
                  <option value="OPEN">OPEN</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="SEALED">SEALED</option>
                  <option value="FROZEN">FROZEN</option>
                </select>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create Case Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#181A20] border border-amber-900/40 rounded-3xl p-6 shadow-2xl space-y-6 z-10 text-slate-200"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <FolderPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-black text-white uppercase">
                      NEW FORENSIC INCIDENT CASE
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      Provision cryptographic case dossier in FIP ledger
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCase} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                    CASE INVESTIGATION NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={caseName}
                    onChange={(e) => setCaseName(e.target.value)}
                    placeholder="e.g. Operation Chimera - Quantum Cryptographic Exfiltration"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                      CUSTOMER / AGENCY ID
                    </label>
                    <input
                      type="text"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      placeholder="e.g. INTERPOL-EC3"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                      CLASSIFICATION LEVEL
                    </label>
                    <select
                      value={classification}
                      onChange={(e) => setClassification(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-amber-300 focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="TOP_SECRET">TOP SECRET</option>
                      <option value="SECRET">SECRET</option>
                      <option value="RESTRICTED">RESTRICTED</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                      <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                    INITIAL ACTION BADGE
                  </label>
                  <select
                    value={actionBadge}
                    onChange={(e: any) => setActionBadge(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="HIGH PRIORITY">HIGH PRIORITY</option>
                    <option value="UPLOADS REQUIRED">UPLOADS REQUIRED</option>
                    <option value="IN AUDIT">IN AUDIT</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="SEALED">SEALED</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-black uppercase tracking-wider"
                  >
                    INITIALIZE CASE
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
