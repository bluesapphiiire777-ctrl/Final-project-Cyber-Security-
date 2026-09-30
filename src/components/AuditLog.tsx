import { motion } from 'motion/react';
import { Database, ShieldCheck, Activity, Search, Clock, Fingerprint } from 'lucide-react';

export default function AuditLog() {
  const logs = [
    { id: 'LOG-8821', action: 'EVIDENCE_UPLOAD', user: 'SYSTEM_INTAKE', target: 'DOC-192', hash: '8f2e...1a92', timestamp: '2026-08-19 14:22:11', status: 'VERIFIED' },
    { id: 'LOG-8820', action: 'ACCESS_VIEW', user: 'ADMIN_ROBERTS', target: 'CASE-001', hash: 'N/A', timestamp: '2026-08-19 13:05:44', status: 'OK' },
    { id: 'LOG-8819', action: 'INTEGRITY_CHECK', user: 'AUTO_DAEMON', target: 'ALL_VAULT', hash: 'MATCHED', timestamp: '2026-08-19 12:00:00', status: 'SECURE' },
    { id: 'LOG-8818', action: 'META_ANNOTATE', user: 'ADMIN_CHEN', target: 'IMG-441', hash: '3a1f...9b2c', timestamp: '2026-08-19 11:45:32', status: 'VERIFIED' },
  ];

  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-red-600" />
            <span className="text-red-600 text-[10px] font-black tracking-[0.4em] uppercase">IMMUTABLE RECORD</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-4">SYSTEM <span className="text-red-600">AUDIT LOG</span></h1>
          <p className="text-slate-500 text-xs font-black tracking-widest uppercase">TAMPER-EVIDENT CRYPTOGRAPHIC LOGGING ACTIVE</p>
        </div>

        <div className="bg-[#0d0d0d] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="p-6 text-[10px] font-black tracking-widest text-slate-500 uppercase">ID</th>
                  <th className="p-6 text-[10px] font-black tracking-widest text-slate-500 uppercase">ACTION</th>
                  <th className="p-6 text-[10px] font-black tracking-widest text-slate-500 uppercase">USER</th>
                  <th className="p-6 text-[10px] font-black tracking-widest text-slate-500 uppercase">TARGET</th>
                  <th className="p-6 text-[10px] font-black tracking-widest text-slate-500 uppercase">HASH/STATUS</th>
                  <th className="p-6 text-[10px] font-black tracking-widest text-slate-500 uppercase text-right">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6 font-mono text-[10px] text-white tracking-widest">{log.id}</td>
                    <td className="p-6">
                      <span className="px-2 py-1 bg-red-600/10 text-red-500 text-[9px] font-black tracking-widest uppercase border border-red-900/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-6 text-[11px] text-slate-300 font-bold uppercase tracking-tight">{log.user}</td>
                    <td className="p-6 text-[11px] text-slate-500 font-mono">{log.target}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-green-500" />
                        <span className="text-[10px] font-black tracking-widest text-green-500 uppercase">{log.status}</span>
                      </div>
                      <div className="text-[9px] text-slate-600 font-mono mt-1">{log.hash}</div>
                    </td>
                    <td className="p-6 text-[10px] text-slate-500 font-mono text-right">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 border-t border-white/5 bg-black/20 flex flex-col items-center justify-center">
            <Database size={40} className="text-red-900/30 mb-4" />
            <p className="text-[10px] text-slate-600 font-black tracking-widest uppercase text-center max-w-sm">
              THE PRECEDING RECORDS ARE STORED IN A READ-ONLY IMMUTABLE LEDGER. ANY ATTEMPTED MODIFICATION WILL INVALIDATE THE ENTIRE CHAIN.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
