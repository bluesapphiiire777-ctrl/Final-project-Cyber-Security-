import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Filter, Shield, UserCheck, 
  HardDrive, Clock, ChevronRight, Eye, RefreshCw
} from 'lucide-react';
import { UserAccount } from '../../types';

interface UserDirectoryTabProps {
  accounts: UserAccount[];
  onInspectAccount: (account: UserAccount) => void;
}

export default function UserDirectoryTab({ accounts, onInspectAccount }: UserDirectoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const roles = [
    { label: 'ALL ROLES', value: 'ALL' },
    { label: 'CHIEF INVESTIGATOR', value: 'CHIEF_INVESTIGATOR' },
    { label: 'SENIOR EXAMINER', value: 'SENIOR_EXAMINER' },
    { label: 'FORENSIC ANALYST', value: 'FORENSIC_ANALYST' },
    { label: 'CUSTODY OFFICER', value: 'CUSTODY_OFFICER' },
    { label: 'LEGAL AUDITOR', value: 'LEGAL_AUDITOR' },
  ];

  const filteredAccounts = accounts.filter((acc) => {
    const matchesQuery = 
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.badgeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.lastActiveIp.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'ALL' || acc.role === selectedRole;
    return matchesQuery && matchesRole;
  });

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'CHIEF_INVESTIGATOR':
        return 'bg-red-950/80 text-red-400 border-red-500/40';
      case 'SENIOR_EXAMINER':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
      case 'FORENSIC_ANALYST':
        return 'bg-blue-950/80 text-blue-400 border-blue-500/40';
      case 'CUSTODY_OFFICER':
        return 'bg-purple-950/80 text-purple-400 border-purple-500/40';
      case 'LEGAL_AUDITOR':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Search & Role Filters */}
      <div className="bg-[#1F232D] rounded-3xl p-6 border border-amber-900/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by investigator name, email, badge ID (e.g. FIP-8841), or enclave IP..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-amber-500/60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
              >
                CLEAR
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 self-end md:self-auto">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <UserCheck size={16} />
              {filteredAccounts.length}
            </span>
            <span>OF {accounts.length} REGISTERED INVESTIGATORS</span>
          </div>
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mr-2 shrink-0">
            <Filter size={12} /> ROLE FILTER:
          </span>
          {roles.map((r) => {
            const isActive = selectedRole === r.value;
            return (
              <button
                key={r.value}
                onClick={() => setSelectedRole(r.value)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all shrink-0 border ${
                  isActive
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-black/40 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Master User Directory Table */}
      <div className="bg-[#1F232D] rounded-3xl border border-amber-900/30 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div>
            <h2 className="text-base font-serif font-black tracking-wide text-white uppercase flex items-center gap-2">
              <Shield size={18} className="text-amber-400" />
              MASTER INVESTIGATOR LEDGER DIRECTORY
            </h2>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Zero-trust authenticated nodes anchored with Google Drive Cloud Vault isolation
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYNCHRONIZED (TPM 2.0)
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">
                <th className="py-4 px-6">INVESTIGATOR IDENTITY</th>
                <th className="py-4 px-4">BADGE & ROLE</th>
                <th className="py-4 px-4 text-center">CASES</th>
                <th className="py-4 px-4">CLOUD VAULT (15 GB)</th>
                <th className="py-4 px-4">LAST ACTIVE NODE / IP</th>
                <th className="py-4 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    No investigator accounts found matching your query.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc, index) => (
                  <motion.tr
                    key={acc.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* User Name & Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-black text-sm group-hover:scale-105 transition-transform">
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                            {acc.name}
                            {acc.email === 'bluesapphiiire777@gmail.com' && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase tracking-wider">
                                CHIEF LEAD
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{acc.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Badge & Role */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="text-amber-400 font-bold font-mono text-[11px]">
                          {acc.badgeId}
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(acc.role)}`}>
                          {acc.role.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Assigned Cases Count */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-black/50 border border-white/10 text-white font-bold font-mono">
                        {acc.assignedCasesCount}
                      </span>
                    </td>

                    {/* Cloud Vault Usage */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="text-slate-200 font-mono text-xs flex items-center gap-1.5">
                          <HardDrive size={13} className="text-amber-400" />
                          <span>{acc.cloudVaultUsage}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-28 h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                            style={{
                              width: `${Math.min(100, (acc.cloudVaultBytes / 15000000000) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Last Active IP & Time */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <div className="text-slate-300 text-[11px] truncate max-w-[200px]" title={acc.lastActiveIp}>
                          {acc.lastActiveIp}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock size={11} className="text-slate-500" />
                          <span>{acc.lastActiveTime}</span>
                        </div>
                      </div>
                    </td>

                    {/* Action: Inspect Account */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onInspectAccount(acc)}
                        className="px-4 py-2 rounded-xl bg-black/60 hover:bg-amber-500 border border-amber-500/40 text-amber-300 hover:text-black font-serif font-black text-xs uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-sm group-hover:border-amber-400"
                      >
                        <Eye size={13} />
                        <span>INSPECT ACCOUNT</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Directory Footer Status */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          <div>
            SHOWING <span className="text-white font-bold">{filteredAccounts.length}</span> ACTIVE FORENSIC ACCOUNTS
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">ENCLAVE STORAGE QUOTA: 15.0 GB FREE TIER ACTIVE</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('ALL');
              }}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
            >
              <RefreshCw size={12} /> RESET FILTERS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
