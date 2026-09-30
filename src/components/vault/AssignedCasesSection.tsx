import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FolderKanban, 
  FileStack, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Lock, 
  AlertCircle,
  Sparkles,
  ListTodo,
  CheckSquare,
  Square,
  Plus,
  FileText,
  Shield,
  Unlock
} from 'lucide-react';
import { useStore } from '../../store';
import { Case, Task } from '../../types';
import { generateCourtReadyPdfReport } from '../../lib/pdfGenerator';

export const AssignedCasesSection: React.FC = () => {
  const { cases, evidence, tasks, toggleTask, toggleCaseFreeze, addTickerLog, setNotification, currentUser } = useStore();
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('ALL');

  const isSeniorManager = currentUser?.email === 'bluesapphiiire777@gmail.com' || currentUser?.role === 'CHIEF_INVESTIGATOR' || currentUser?.role === 'ADMIN';

  const personalTasks = tasks.filter(t => 
    t.assignedTo.includes(currentUser?.name || '') || 
    t.assignedTo.includes(currentUser?.badgeId || '') ||
    t.assignedTo === 'UNASSIGNED' ||
    isSeniorManager
  );

  const personalCases = isSeniorManager 
    ? cases 
    : cases.filter(c => personalTasks.some(t => t.caseId === c.id));

  const filteredTasks = selectedCaseFilter === 'ALL'
    ? personalTasks
    : personalTasks.filter(t => t.caseId === selectedCaseFilter);

  const handleExportPdf = (c: Case) => {
    const caseEvidence = evidence.filter(e => e.caseId === c.id || c.id === 'case-001');
    generateCourtReadyPdfReport({
      currentCase: c,
      investigator: currentUser,
      evidenceList: caseEvidence
    });

    const utcTime = new Date().toUTCString().split(' ')[4] + ' UTC';
    addTickerLog({
      timestamp: utcTime,
      userLabel: currentUser?.name || 'SENIOR LEAD',
      action: 'EXPORTED_PDF',
      target: `FIP_Court_Report_${c.id}.pdf`,
      sha256Hash: c.id === 'case-001' ? '7c328cb08b5531fcacdabf8a4b227777d4dd1fc61c6f884f48641d02b4d121d3' : 'SEALED-PDF-HASH-STREAM-001',
      caseId: c.id.toUpperCase(),
    });

    setNotification(`📄 COURT-READY PDF REPORT GENERATED FOR CASE ${c.id.toUpperCase()}`);
  };

  const handleToggleFreeze = async (c: Case) => {
    if (!isSeniorManager) {
      setNotification(`⛔ DENIED: Only Senior Manager (bluesapphiiire777@gmail.com) can freeze case vaults!`);
      return;
    }

    const nextFrozen = !c.isFrozen;
    toggleCaseFreeze(c.id);

    const utcTime = new Date().toUTCString().split(' ')[4] + ' UTC';
    addTickerLog({
      timestamp: utcTime,
      userLabel: currentUser?.name || 'CHIEF LEAD (bluesapphiiire777)',
      action: nextFrozen ? 'CASE_FROZEN' : 'CASE_UNFROZEN',
      target: c.caseName,
      sha256Hash: 'SEALED-WORM-VAULT-IMMUTABLE-001',
      caseId: c.id.toUpperCase(),
    });

    setNotification(nextFrozen ? `🔒 CASE ${c.id.toUpperCase()} FROZEN — READ-ONLY AUDIT MODE` : `🔓 CASE ${c.id.toUpperCase()} UNFROZEN`);

    try {
      await fetch('/api/cases/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: c.id,
          isFrozen: nextFrozen,
          requestedByEmail: currentUser?.email || 'bluesapphiiire777@gmail.com'
        })
      });
    } catch (e) {
      console.warn('Backend freeze sync warning:', e);
    }
  };

  const handleToggleTask = (taskId: string, title: string) => {
    toggleTask(taskId);
    setNotification(`TASK STATUS UPDATED: "${title}"`);
    
    fetch('/api/email/notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: currentUser?.email,
        userName: currentUser?.name || 'Forensic Agent',
        badgeId: currentUser?.badgeId || 'FIP-AGENT',
        actionType: 'TASK_STATUS_CHANGED',
        actionDetails: `Investigator toggled the completion status for tactical task: "${title}"`,
        targetId: taskId
      })
    }).catch(err => console.warn('Notification email dispatch failed:', err));
  };

  return (
    <div className="w-full bg-[#1F232D] rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-xl space-y-8 font-mono text-[#D1D5DB]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-md uppercase">
              ACTIVE CASE DOSSIERS
            </span>
            <span className="text-xs text-zinc-400 font-semibold">INVESTIGATOR DISPATCH &amp; QUEUE</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Assigned Forensic Cases &amp; Tactical Tasks
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor active investigation branches, legal deposit checklists, and multi-agency case files.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'case-001', 'case-002', 'case-003'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedCaseFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCaseFilter === filter
                  ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-[#181A20] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {filter === 'ALL' ? 'ALL DOSSIERS' : filter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Case Dossiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {personalCases.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-[#181A20] border border-zinc-700/80 rounded-2xl">
            <h3 className="text-white font-bold mb-2">No Assigned Cases</h3>
            <p className="text-zinc-500 text-xs">You currently have no active cases assigned to you.</p>
          </div>
        ) : (
          personalCases.map((c) => {
            const isSelected = selectedCaseFilter === 'ALL' || selectedCaseFilter === c.id;
            return (
            <div
              key={c.id}
              onClick={() => setSelectedCaseFilter(selectedCaseFilter === c.id ? 'ALL' : c.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-[#181A20] border-zinc-700/90 hover:border-amber-500/50 shadow-lg'
                  : 'bg-[#181A20]/60 border-zinc-800/80 opacity-60'
              }`}
            >
              {/* Frozen Lock Badge Alert */}
              {c.isFrozen && (
                <div className="mb-3 p-2 bg-red-950/80 border border-red-500/80 text-red-300 rounded-xl flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase animate-pulse">
                  <Lock size={14} className="text-red-400 shrink-0" />
                  <span>🔒 CASE FROZEN — READ-ONLY AUDIT MODE</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">{c.id}</span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase ${
                    c.isFrozen
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : c.actionBadge === 'UPLOADS REQUIRED'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : c.actionBadge === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {c.isFrozen ? 'FROZEN / SEALED' : (c.actionBadge || 'UNDER_INVESTIGATION')}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2 leading-snug line-clamp-2">
                {c.caseName}
              </h3>

              <div className="text-[11px] text-zinc-400 mb-4">
                Target Customer: <strong className="text-zinc-200">{c.customerId}</strong>
              </div>

              {/* Action Buttons: PDF Export & Freeze Case Vault */}
              <div className="flex flex-col gap-2 my-3" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleExportPdf(c)}
                  className="w-full py-1.5 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <FileText size={12} />
                  <span>Export Court-Ready PDF</span>
                </button>

                {isSeniorManager && (
                  <button
                    onClick={() => handleToggleFreeze(c)}
                    className={`w-full py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border ${
                      c.isFrozen
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                  >
                    {c.isFrozen ? (
                      <>
                        <Unlock size={12} />
                        <span>Unfreeze Case Vault</span>
                      </>
                    ) : (
                      <>
                        <Lock size={12} />
                        <span>Freeze Case Vault</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 border-t border-zinc-800 pt-3">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-500 uppercase font-bold">Investigation Seal</span>
                  <span className="text-amber-400 font-bold">{c.progress || 80}%</span>
                </div>
                <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                    style={{ width: `${c.progress || 80}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
                  <span>Classification: <strong className="text-zinc-300">{c.classification}</strong></span>
                  <span>Files: <strong className="text-zinc-300">{c.fileCount || 12}</strong></span>
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Task Checklist Section */}
      <div className="bg-[#181A20] rounded-2xl p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ListTodo size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Assigned Investigation Checklist ({filteredTasks.filter(t => t.status === 'COMPLETED').length}/{filteredTasks.length} Completed)
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500">Click item to toggle status</span>
        </div>

        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id, task.title)}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-zinc-400'
                    : 'bg-[#14161D] border-zinc-800 hover:border-amber-500/40 text-zinc-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button type="button" className="mt-0.5 text-amber-400 shrink-0">
                    {isDone ? <CheckSquare size={18} className="text-emerald-400" /> : <Square size={18} />}
                  </button>
                  <div>
                    <span className={`text-xs font-bold block ${isDone ? 'line-through text-zinc-400' : 'text-white'}`}>
                      {task.title}
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">{task.description}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold block">{task.caseId}</span>
                  <span
                    className={`text-[10px] font-bold ${
                      isDone ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
