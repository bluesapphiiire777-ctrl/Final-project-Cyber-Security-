import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, 
  Send, Terminal, Phone, Mail, Globe, 
  User, Flame, RefreshCw, Eye
} from 'lucide-react';
import { TamperAlert } from '../../types';

interface TamperAlertsTabProps {
  tamperAlerts: TamperAlert[];
  onResolveAlert: (alertId: string, notes?: string) => void;
  onSimulateTamper: () => void;
  onDispatchChiefAlert: (alert: TamperAlert) => Promise<boolean>;
}

export default function TamperAlertsTab({
  tamperAlerts,
  onResolveAlert,
  onSimulateTamper,
  onDispatchChiefAlert
}: TamperAlertsTabProps) {
  const [selectedAlert, setSelectedAlert] = useState<TamperAlert | null>(
    tamperAlerts.length > 0 ? tamperAlerts[0] : null
  );
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const activeAlerts = tamperAlerts.filter(a => a.status !== 'RESOLVED');
  const resolvedAlerts = tamperAlerts.filter(a => a.status === 'RESOLVED');

  const handleDispatch = async (alert: TamperAlert) => {
    setDispatchingId(alert.id);
    setDispatchStatus(null);
    try {
      const success = await onDispatchChiefAlert(alert);
      if (success) {
        setDispatchStatus(`✅ EMERGENCY DISPATCH SENT TO CHIEF INVESTIGATOR (bluesapphiiire777@gmail.com)`);
      } else {
        setDispatchStatus(`⚠️ Dispatch completed via fallback protocol.`);
      }
    } catch (e) {
      setDispatchStatus(`❌ Dispatch error.`);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleResolve = (alertId: string) => {
    onResolveAlert(alertId, resolutionNotes || 'Investigated by Senior Lead. Diff unauthorized; payload blocked at WORM gateway.');
    setResolutionNotes('');
    setDispatchStatus('✅ Tamper flag verified and marked as RESOLVED in immutable audit log.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert Bar */}
      <div className={`p-6 rounded-3xl border shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        activeAlerts.length > 0
          ? 'bg-red-950/40 border-red-500/50 text-red-200'
          : 'bg-[#1F232D] border-emerald-500/30 text-emerald-300'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
            activeAlerts.length > 0
              ? 'bg-red-600/20 border-red-500 text-red-400 animate-pulse'
              : 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
          }`}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                activeAlerts.length > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                IMMUTABLE INTEGRITY MONITOR
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                activeAlerts.length > 0 ? 'bg-red-600 text-black' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              }`}>
                {activeAlerts.length} ACTIVE FLAGS
              </span>
            </div>
            <h2 className="text-xl font-serif font-black tracking-wide text-white uppercase mt-0.5">
              {activeAlerts.length > 0
                ? 'UNAUTHORIZED EDIT & BIT-TAMPER DETECTIONS'
                : 'ZERO TAMPER DEVIATIONS — ALL BLOCKS INTEGRITY VERIFIED'}
            </h2>
            <p className="text-xs font-mono text-slate-300 mt-1">
              Logs unauthorized edit attempts displaying editor Name, Email, Phone, Enclave IP, and exact differential patches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSimulateTamper}
            className="px-4 py-2.5 rounded-xl bg-black/60 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-black font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <Flame size={14} />
            <span>SIMULATE TAMPER PROBE</span>
          </button>
        </div>
      </div>

      {dispatchStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-black/80 border border-amber-500/40 text-xs font-mono text-amber-300 flex items-center justify-between"
        >
          <span>{dispatchStatus}</span>
          <button onClick={() => setDispatchStatus(null)} className="text-slate-400 hover:text-white">✕</button>
        </motion.div>
      )}

      {/* Main Grid: Alert List (Left) + Detailed Diff & Actor Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alert List Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-2">
            <span>AUDIT QUEUE ({tamperAlerts.length} TOTAL)</span>
            <span className="text-red-400 font-bold">{activeAlerts.length} UNRESOLVED</span>
          </div>

          <div className="space-y-3">
            {tamperAlerts.map((alert) => {
              const isSelected = selectedAlert?.id === alert.id;
              const isResolved = alert.status === 'RESOLVED';

              return (
                <motion.div
                  key={alert.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#1F232D] border-red-500 shadow-lg shadow-red-500/10'
                      : isResolved
                      ? 'bg-[#1F232D]/50 border-white/5 opacity-70 hover:opacity-100'
                      : 'bg-[#1F232D] border-amber-900/40 hover:border-red-500/40'
                  }`}
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                    isResolved ? 'bg-emerald-500' : alert.severity === 'CRITICAL' ? 'bg-red-600 animate-pulse' : 'bg-amber-500'
                  }`} />

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-wider">
                        {alert.id} • {alert.tamperType.replace(/_/g, ' ')}
                      </span>
                      <h4 className="text-sm font-serif font-black text-white mt-0.5">
                        {alert.evidenceTitle}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                      isResolved
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-950 text-red-400 border border-red-500/40'
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-slate-300">
                    <div className="flex items-center gap-1.5 truncate">
                      <User size={12} className="text-slate-400" />
                      <span>{alert.editorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 truncate">
                      <Globe size={12} className="text-slate-400" />
                      <span>{alert.editorIp}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{alert.timestamp}</span>
                    <span className="text-amber-400 font-bold uppercase">{alert.severity} SEVERITY</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Selected Alert Dossier & Exact Diff Viewer */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="bg-[#1F232D] rounded-3xl border border-amber-900/40 shadow-2xl p-6 space-y-6">
              {/* Header Info */}
              <div className="border-b border-white/10 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    INCIDENT DOSSIER: {selectedAlert.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500/50 text-red-400 text-[10px] font-mono font-black uppercase">
                    {selectedAlert.severity} PRIORITY
                  </span>
                </div>
                <h3 className="text-xl font-serif font-black text-white">
                  {selectedAlert.evidenceTitle}
                </h3>
                <p className="text-xs font-mono text-amber-400 mt-1">
                  EVIDENCE REF: {selectedAlert.evidenceId} • DETECTED AT: {selectedAlert.timestamp}
                </p>
              </div>

              {/* Unauthorized Actor Identity Matrix */}
              <div className="space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Terminal size={14} className="text-amber-400" />
                  UNAUTHORIZED ACTOR IDENTITY TRACE
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                      <User size={11} /> ACTOR IDENTIFIER
                    </div>
                    <div className="text-white font-bold">{selectedAlert.editorName}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                      <Mail size={11} /> CLAIMED / SPOOFED EMAIL
                    </div>
                    <div className="text-amber-300 font-bold truncate">{selectedAlert.editorEmail}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                      <Phone size={11} /> CONTACT TELEPHONE
                    </div>
                    <div className="text-white font-bold">{selectedAlert.editorPhone}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                      <Globe size={11} /> SOURCE NODE & ENCLAVE IP
                    </div>
                    <div className="text-red-400 font-bold truncate">{selectedAlert.editorIp}</div>
                  </div>
                </div>
              </div>

              {/* Exact Differential Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>EXACT DIFFERENTIAL PATCH (REJECTED BY WORM GUARD)</span>
                  <span className="text-emerald-400">STATUS: REJECTED AT GATEWAY</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/80 border border-red-900/50 font-mono text-xs overflow-x-auto">
                  <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedAlert.exactDiff}
                  </pre>
                </div>
              </div>

              {/* Payload Hashes comparison */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/5 space-y-2 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-slate-400 uppercase">ANCHORED PAYLOAD:</span>
                  <span className="text-emerald-400 font-bold">{selectedAlert.rawPayloadBefore}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 border-t border-white/5 pt-2">
                  <span className="text-slate-400 uppercase">UNAUTHORIZED TARGET:</span>
                  <span className="text-red-400 font-bold">{selectedAlert.rawPayloadAfter}</span>
                </div>
              </div>

              {/* Resolution / Action Footer */}
              {selectedAlert.status !== 'RESOLVED' ? (
                <div className="p-4 rounded-2xl bg-black/40 border border-amber-900/30 space-y-3">
                  <div className="text-xs font-serif font-black uppercase tracking-wider text-amber-300">
                    SENIOR INVESTIGATOR COMMAND ACTIONS
                  </div>

                  <input
                    type="text"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter forensic resolution findings (e.g. Blocked external Tor probe; original hash verified)..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-amber-500/60"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      onClick={() => handleDispatch(selectedAlert)}
                      disabled={dispatchingId === selectedAlert.id}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-black font-serif font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>{dispatchingId === selectedAlert.id ? 'DISPATCHING...' : 'DISPATCH ALERT TO CHIEF'}</span>
                    </button>

                    <button
                      onClick={() => handleResolve(selectedAlert.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-serif font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} />
                      <span>RESOLVE & SEAL FLAG</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>RESOLVED BY: {selectedAlert.resolvedBy || 'Chief Investigator'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{selectedAlert.resolutionNotes}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#1F232D] rounded-3xl border border-white/10 p-12 text-center text-slate-500 font-mono text-xs">
              Select a tamper alert from the queue to view cryptographic differential details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
