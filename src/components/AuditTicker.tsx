import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, Zap, AlertTriangle, FileCheck, Download } from 'lucide-react';
import { useStore } from '../store';
import { TickerLog } from '../types';

export default function AuditTicker() {
  const { tickerLogs, activeNotification } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-cycle through ticker logs every 4 seconds
  useEffect(() => {
    if (!tickerLogs || tickerLogs.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerLogs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tickerLogs]);

  const activeLog = tickerLogs && tickerLogs.length > 0 ? tickerLogs[currentIndex % tickerLogs.length] : null;

  return (
    <div className="w-full bg-[#090b10] border-b border-white/10 text-xs font-mono py-2 px-4 flex flex-col md:flex-row items-center justify-between gap-2 overflow-hidden shadow-inner">
      {/* Left section: Glowing green indicator & Telemetry badge */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Terminal size={14} className="text-emerald-400" />
          LIVE TELEMETRY STREAM
        </span>
        <span className="text-slate-600 hidden sm:inline">&bull;</span>
      </div>

      {/* Center section: Animated rolling telemetry log line */}
      <div className="flex-1 w-full overflow-hidden text-center md:text-left min-h-[20px] flex items-center justify-center md:justify-start">
        <AnimatePresence mode="wait">
          {activeLog ? (
            <motion.div
              key={activeLog.id + currentIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex items-center gap-2 truncate text-[11px] text-slate-300 font-mono"
            >
              <span className="text-amber-400 font-bold">[{activeLog.timestamp}]</span>
              <span className="text-slate-200 font-extrabold">{activeLog.userLabel}</span>
              
              {activeLog.action === 'UPLOADED' && (
                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded uppercase">
                  UPLOADED
                </span>
              )}
              {activeLog.action === 'VERIFIED' && (
                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold rounded uppercase">
                  VERIFIED
                </span>
              )}
              {activeLog.action === 'EXPORTED_PDF' && (
                <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold rounded uppercase">
                  EXPORTED PDF
                </span>
              )}
              {activeLog.action === 'CASE_FROZEN' && (
                <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold rounded uppercase">
                  CASE FROZEN
                </span>
              )}
              {activeLog.action === 'TAMPER_ALERT' && (
                <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold rounded uppercase">
                  TAMPER ALERT
                </span>
              )}

              <span className="text-white font-bold">{activeLog.target}</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400 font-mono">
                SHA-256: {activeLog.sha256Hash?.length > 16 ? `${activeLog.sha256Hash.substring(0, 4)}...${activeLog.sha256Hash.substring(activeLog.sha256Hash.length - 4)}` : activeLog.sha256Hash}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300 uppercase font-semibold">{activeLog.caseId}</span>
            </motion.div>
          ) : (
            <div className="text-[11px] text-slate-500 italic">
              Initializing forensic event telemetry stream...
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Right section: System status badge & Total event counter */}
      <div className="flex items-center gap-3 shrink-0 text-[10px] text-slate-400">
        <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold rounded flex items-center gap-1">
          <Zap size={10} />
          WORM PROTOCOL ACTIVE
        </span>
        <span className="font-mono text-slate-500">
          LOGS: {tickerLogs ? tickerLogs.length : 0}
        </span>
      </div>
    </div>
  );
}
