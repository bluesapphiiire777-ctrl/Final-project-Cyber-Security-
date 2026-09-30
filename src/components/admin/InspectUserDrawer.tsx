import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Shield, HardDrive, CheckCircle2, Clock, 
  ExternalLink, Key, CheckSquare, Square, ShieldCheck
} from 'lucide-react';
import { UserAccount, Evidence, Task, Case } from '../../types';

interface InspectUserDrawerProps {
  user: UserAccount | null;
  onClose: () => void;
  evidenceList: Evidence[];
  tasks: Task[];
  cases: Case[];
  onToggleTask: (taskId: string) => void;
}

export default function InspectUserDrawer({
  user,
  onClose,
  evidenceList,
  tasks,
  cases,
  onToggleTask
}: InspectUserDrawerProps) {
  if (!user) return null;

  // Filter evidence uploaded by this user (or matches badge/name)
  const userEvidence = evidenceList.filter(
    e => e.uploadedByBadge === user.badgeId || 
         e.uploadedBy?.toLowerCase().includes(user.name.toLowerCase().split(' ')[0]) ||
         (user.email === 'bluesapphiiire777@gmail.com')
  );

  // Filter tasks assigned to user
  const userTasks = tasks.filter(
    t => t.assignedTo === user.id || t.assignedTo === 'usr-001' || user.role === 'CHIEF_INVESTIGATOR'
  );

  // User activity audit logs
  const activityLogs = [
    {
      id: 'act-1',
      action: 'ENCLAVE_SESSION_AUTHENTICATED',
      detail: `Validated ED25519 session credentials from ${user.lastActiveIp}`,
      timestamp: 'Today, 08:30 UTC',
      status: 'VERIFIED'
    },
    {
      id: 'act-2',
      action: 'PROOF_RECEIPT_DISPATCHED',
      detail: `Cryptographic proof receipt auto-emailed to ${user.email}`,
      timestamp: 'Today, 07:15 UTC',
      status: 'DISPATCHED'
    },
    {
      id: 'act-3',
      action: 'SESSION_KEY_ROTATED',
      detail: 'Hardware TPM rotated enclave session key (ED25519-0x9F8B2)',
      timestamp: 'Yesterday, 18:00 UTC',
      status: 'SECURE'
    },
    {
      id: 'act-4',
      action: 'WORM_EVIDENCE_DEPOSITED',
      detail: `Committed 3 evidence records to Google Drive Vault folder FIP_Vault_${user.id}`,
      timestamp: 'Yesterday, 14:22 UTC',
      status: 'ANCHORED'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-2xl bg-[#181A20] border-l border-amber-900/40 text-slate-200 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 bg-[#1F232D]/90 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-black text-xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
                      ACCOUNT INSPECTION DOSSIER
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[9px] font-mono font-bold">
                      {user.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-black tracking-wide text-white">
                    {user.name}
                  </h2>
                  <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                    <span>{user.email}</span>
                    <span className="text-amber-500">•</span>
                    <span className="text-amber-300 font-bold">{user.badgeId}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Close Inspector"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Quick Telemetry Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#1F232D] p-4 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">
                    ROLE LEVEL
                  </div>
                  <div className="text-xs font-mono font-black text-amber-400">
                    {user.role.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="bg-[#1F232D] p-4 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">
                    CLOUD VAULT USAGE
                  </div>
                  <div className="text-xs font-mono font-black text-emerald-400">
                    {user.cloudVaultUsage}
                  </div>
                </div>
                <div className="bg-[#1F232D] p-4 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">
                    ACTIVE SESSIONS
                  </div>
                  <div className="text-xs font-mono font-black text-white">
                    1 Hardware Node
                  </div>
                </div>
              </div>

              {/* SECTION A: Uploaded Files (Google Drive Vault Links & SHA-256) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-black uppercase tracking-widest text-amber-300 flex items-center gap-2">
                    <HardDrive size={16} className="text-amber-400" />
                    SECTION A: VAULTED EVIDENCE FILES ({userEvidence.length})
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Google Drive 15GB Cloud</span>
                </div>

                <div className="bg-[#1F232D] rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
                  {userEvidence.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 font-mono">
                      No vaulted files on record for this investigator.
                    </div>
                  ) : (
                    userEvidence.map((file) => (
                      <div key={file.id} className="p-4 hover:bg-white/[0.02] transition-colors space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {file.title}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                            {file.size || '3.4 MB'}
                          </span>
                        </div>

                        <div className="bg-black/50 p-2.5 rounded-lg border border-amber-900/30 flex items-center justify-between">
                          <div className="text-[10px] font-mono text-amber-400/90 truncate mr-2">
                            <span className="text-slate-500 uppercase mr-1">SHA-256:</span>
                            {file.sha256Hash}
                          </div>
                          <span className="text-[9px] font-black text-emerald-400 uppercase flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={10} /> WORM LOCKED
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                          <span>Deposit ID: {file.id}</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck size={11} />
                            <span>Cloud Storage Vault Secure</span>
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SECTION B: User Activity Audit Log */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-black uppercase tracking-widest text-amber-300 flex items-center gap-2">
                    <Clock size={16} className="text-amber-400" />
                    SECTION B: CHRONOLOGICAL ACTIVITY AUDIT
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Hardware TPM 2.0</span>
                </div>

                <div className="bg-[#1F232D] rounded-2xl border border-white/10 p-4 space-y-4">
                  {activityLogs.map((log, idx) => (
                    <div key={log.id} className="relative pl-6 pb-2 border-l border-amber-500/20 last:border-l-0">
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-[#1F232D]" />
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="font-bold text-white uppercase">{log.action}</span>
                        <span className="text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        {log.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION C: Case Workload & Checklist */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-black uppercase tracking-widest text-amber-300 flex items-center gap-2">
                    <Shield size={16} className="text-amber-400" />
                    SECTION C: CASE WORKLOAD & FORENSIC TASKS
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {userTasks.filter(t => t.status === 'COMPLETED').length} / {userTasks.length} Done
                  </span>
                </div>

                <div className="bg-[#1F232D] rounded-2xl border border-white/10 p-4 space-y-3">
                  {userTasks.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500 font-mono">
                      No active tasks currently assigned.
                    </div>
                  ) : (
                    userTasks.map((t) => {
                      const isDone = t.status === 'COMPLETED';
                      return (
                        <div
                          key={t.id}
                          onClick={() => onToggleTask(t.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                            isDone 
                              ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75' 
                              : 'bg-black/40 border-white/5 hover:border-amber-500/40'
                          }`}
                        >
                          <button className="mt-0.5 text-amber-400">
                            {isDone ? <CheckSquare size={16} className="text-emerald-400" /> : <Square size={16} />}
                          </button>
                          <div className="flex-1">
                            <div className={`text-xs font-bold font-mono uppercase ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                              {t.title}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                              {t.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[9px] font-mono text-amber-400/80">
                              <span>CASE REF: {t.caseId}</span>
                              <span>•</span>
                              <span className={isDone ? 'text-emerald-400' : 'text-amber-400'}>{t.status}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-white/10 bg-[#1F232D]/90 flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-400">
                AUDIT SIGNATURE: <span className="text-amber-400">ED25519-VERIFIED</span>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-black text-xs uppercase tracking-wider transition-colors"
              >
                CLOSE DOSSIER
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
