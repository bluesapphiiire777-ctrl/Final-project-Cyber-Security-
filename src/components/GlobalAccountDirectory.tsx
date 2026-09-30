import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Shield, Clock, Hash, CheckCircle2, ChevronRight, X, FolderGit2, AlertTriangle, Activity, Database, Lock } from 'lucide-react';
import { useStore } from '../store';
import { UserAccount, Evidence, Task } from '../types';

export const GlobalAccountDirectory: React.FC = () => {
  const { accounts, evidence, tasks, currentUser } = useStore();
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);

  const handleInspectAccount = (account: UserAccount) => {
    setSelectedAccount(account);
  };

  const closePanel = () => {
    setSelectedAccount(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-md overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#334155] flex items-center justify-between bg-[#1E293B]">
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Users size={18} className="text-[#94A3B8]" />
            Global Account Directory
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#94A3B8]">
            <thead className="bg-[#1A2333] border-b border-[#334155] uppercase font-semibold text-white">
              <tr>
                <th className="px-4 py-3">Investigator</th>
                <th className="px-4 py-3">Badge ID</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Assigned Cases</th>
                <th className="px-4 py-3">Cloud Vault Usage</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155] bg-[#0F172A]">
              {accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-[#1E293B] transition-colors group cursor-pointer" onClick={() => handleInspectAccount(acc)}>
                  <td className="px-4 py-3 font-medium text-white">{acc.name}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#34D399]">{acc.badgeId}</td>
                  <td className="px-4 py-3 text-[#F59E0B]">{acc.role.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">{acc.assignedCasesCount}</td>
                  <td className="px-4 py-3 text-white">{acc.cloudVaultUsage}</td>
                  <td className="px-4 py-3">{acc.lastActiveTime}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${acc.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                      {acc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[#2563EB] hover:text-white transition-colors" title="Inspect Drill-down">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedAccount && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={closePanel}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#0F172A] border-l border-[#334155] z-50 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-[#334155] bg-[#1E293B]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0F172A] border border-[#334155] flex items-center justify-center text-[#F59E0B]">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{selectedAccount.name}</h3>
                    <p className="text-xs font-mono text-[#94A3B8]">{selectedAccount.badgeId} • {selectedAccount.role.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <button onClick={closePanel} className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#334155] rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1E293B] border border-[#334155] p-4 rounded-xl">
                    <h4 className="text-xs text-[#94A3B8] mb-1 uppercase">Vault Usage</h4>
                    <div className="text-lg text-white font-bold">{selectedAccount.cloudVaultUsage}</div>
                  </div>
                  <div className="bg-[#1E293B] border border-[#334155] p-4 rounded-xl">
                    <h4 className="text-xs text-[#94A3B8] mb-1 uppercase">Last IP Address</h4>
                    <div className="text-lg text-[#34D399] font-mono text-sm">{selectedAccount.lastActiveIp}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 border-b border-[#334155] pb-2">
                    <Database size={16} className="text-[#F59E0B]" />
                    Uploaded Evidence Vault
                  </h4>
                  <div className="space-y-2">
                    {evidence.filter(e => e.uploadedByBadge === selectedAccount.badgeId || e.uploadedBy === selectedAccount.name).length > 0 ? (
                      evidence.filter(e => e.uploadedByBadge === selectedAccount.badgeId || e.uploadedBy === selectedAccount.name).map(ev => (
                        <div key={ev.id} className="p-3 bg-[#1E293B] border border-[#334155] rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Lock size={16} className="text-[#34D399]" />
                            <div>
                              <div className="text-sm text-white font-medium">{ev.title}</div>
                              <div className="text-[10px] font-mono text-[#94A3B8]">SHA-256: {ev.sha256Hash.substring(0, 32)}...</div>
                            </div>
                          </div>
                          <span className="text-xs text-[#94A3B8] bg-[#0F172A] px-2 py-1 rounded border border-[#334155]">{ev.size || 'Unknown'}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#94A3B8] p-4 text-center bg-[#1E293B] border border-[#334155] rounded-xl border-dashed">No evidence uploaded by this investigator.</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 border-b border-[#334155] pb-2">
                    <Activity size={16} className="text-[#3B82F6]" />
                    Task Completion Metrics
                  </h4>
                  <div className="space-y-2">
                    {tasks.filter(t => t.assignedTo.includes(selectedAccount.name) || t.assignedTo.includes(selectedAccount.badgeId)).length > 0 ? (
                      tasks.filter(t => t.assignedTo.includes(selectedAccount.name) || t.assignedTo.includes(selectedAccount.badgeId)).map(task => (
                        <div key={task.id} className="p-3 bg-[#1E293B] border border-[#334155] rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {task.status === 'COMPLETED' ? <CheckCircle2 size={16} className="text-[#34D399]" /> : <Clock size={16} className="text-[#F59E0B]" />}
                            <span className="text-sm text-white">{task.title}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded ${task.status === 'COMPLETED' ? 'bg-[#34D399]/10 text-[#34D399]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                            {task.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#94A3B8] p-4 text-center bg-[#1E293B] border border-[#334155] rounded-xl border-dashed">No tasks assigned to this investigator.</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
