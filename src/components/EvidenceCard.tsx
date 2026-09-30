import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Download, Eye, Lock, FileText, Image as ImageIcon, AlertTriangle, Key, ExternalLink } from 'lucide-react';
import { Evidence } from '../types';
import { useStore } from '../store';

interface EvidenceCardProps {
  evidence: Evidence;
  onInspect?: (evidence: Evidence) => void;
  onViewRaw?: (evidence: Evidence) => void;
}

export default function EvidenceCard({ evidence, onInspect, onViewRaw }: EvidenceCardProps) {
  const { currentUser, reportTamperAlert } = useStore();
  const [copied, setCopied] = useState(false);
  const isImage = evidence.type?.startsWith('image/') || !!evidence.fileDataUrl || !!evidence.imageUrl;

  const copyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(evidence.sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCanaryCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (evidence.isCanary) {
      // Trigger Honeypot callback containment protocol
      reportTamperAlert({
        evidenceId: evidence.id,
        evidenceTitle: evidence.title,
        editorName: currentUser?.name || 'Unauthorized Assailant',
        editorEmail: currentUser?.email || 'unknown.attacker@external.net',
        editorIp: '185.220.101.5 (Tor Exit Node / Suspicious Probe)',
        severity: 'CRITICAL',
        tamperType: 'UNAUTHORIZED_OFFSET_MODIFICATION',
        exactDiff: `CANARY HONEYPOT ACCESSED: Attempted unauthorized read access on decoy file ${evidence.title}. Containment active.`,
        rawPayloadBefore: `CANARY_FILE_LOCKED`,
        rawPayloadAfter: `TRIPPED_HONEYPOT_WEBHOOK_FIRED`,
      });

      // Fire API honeypot callback
      fetch('/api/honeypot/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canaryId: evidence.id,
          fileName: evidence.title,
          userEmail: currentUser?.email,
          userName: currentUser?.name,
        }),
      }).catch(err => console.warn('Honeypot notification notice:', err));

      alert('🚨 FORENSIC CONTAINMENT PROTOCOL TRIPPED: Decoy Canary evidence item triggered. Incident logged and Senior Manager (bluesapphiiire777@gmail.com) notified.');
      return;
    }

    if (onViewRaw) {
      onViewRaw(evidence);
    } else if (evidence.driveUrl) {
      window.open(evidence.driveUrl, '_blank');
    } else {
      onInspect?.(evidence);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#111319] border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col justify-between relative group ${
        evidence.isCanary
          ? 'border-red-500/40 hover:border-red-500 bg-red-950/10'
          : 'border-white/10 hover:border-amber-500/50'
      }`}
    >
      {/* Top Badge & Indicators */}
      <div>
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">
              {evidence.id}
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              CASE: {evidence.caseId}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {evidence.isCanary ? (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-mono font-black rounded uppercase flex items-center gap-1">
                <AlertTriangle size={10} />
                CANARY HONEYPOT
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold rounded uppercase flex items-center gap-1">
                <Lock size={10} />
                WORM LOCKED
              </span>
            )}
          </div>
        </div>

        {/* Media / Image Preview Area */}
        <div className="relative bg-black/80 aspect-video flex items-center justify-center overflow-hidden border-b border-white/5 group-hover:bg-black/90 transition-colors">
          {isImage ? (
            <img
              src={evidence.fileDataUrl || evidence.imageUrl}
              alt={evidence.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                // Fallback icon if image fail to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <FileText size={36} className="text-slate-600 mb-2 group-hover:text-amber-500 transition-colors" />
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">{evidence.type}</span>
              <span className="text-[10px] text-slate-600 font-mono mt-1">{evidence.size || '3.40 MB'}</span>
            </div>
          )}

          {/* Quick View Overlay Button */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={handleCanaryCheck}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Eye size={14} />
              <span>RAW EVIDENCE PREVIEW</span>
            </button>
          </div>
        </div>

        {/* Evidence Metadata Body */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
              {evidence.title}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
              <span>By: {evidence.uploadedBy} ({evidence.uploadedByBadge || 'FIP-8841'})</span>
            </p>
          </div>

          {/* 64-Character Cryptographic SHA-256 Hash Display (Gold #F59E0B) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
              <span className="text-slate-400 uppercase flex items-center gap-1">
                <Key size={11} className="text-amber-500" />
                SHA-256 Cryptographic Fingerprint:
              </span>
              <button
                onClick={copyHash}
                className="text-amber-500 hover:text-amber-400 transition-colors"
              >
                {copied ? 'COPIED!' : 'COPY'}
              </button>
            </div>
            
            <div className="bg-[#090b0e] border border-amber-500/30 p-2.5 rounded-xl font-mono text-[11px] text-[#F59E0B] break-all tracking-tight leading-relaxed shadow-inner">
              {evidence.sha256Hash}
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 bg-black/40 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => onInspect?.(evidence)}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Inspect Ledger</span>
        </button>

        <button
          onClick={handleCanaryCheck}
          className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ExternalLink size={14} />
          <span>View Raw Evidence</span>
        </button>
      </div>
    </motion.div>
  );
}
