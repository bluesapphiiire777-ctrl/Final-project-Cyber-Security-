import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  KeyRound, 
  Mail, 
  Lock, 
  Unlock, 
  FileText, 
  AlertOctagon, 
  RefreshCw, 
  CheckCircle2, 
  Radio, 
  Server,
  Download,
  Terminal,
  ExternalLink,
  Shield,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { useStore } from '../../store';
import { Evidence } from '../../types';

interface SecurityIntegritySectionProps {
  onOpenTamperModal: () => void;
  onOpenProofModal: (evidence: Evidence) => void;
}

export const SecurityIntegritySection: React.FC<SecurityIntegritySectionProps> = ({
  onOpenTamperModal,
  onOpenProofModal,
}) => {
  const { 
    currentUser, 
    evidence, 
    sessionKey, 
    rotateSessionKey, 
    isVaultFrozen, 
    toggleVaultFreeze,
    tamperAlertsCount,
    setNotification 
  } = useStore();

  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [isResendingReceipt, setIsResendingReceipt] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const activeEvidence = evidence[0] || null;

  const handleRotateKey = () => {
    setIsRotatingKey(true);
    setTimeout(() => {
      const newKey = rotateSessionKey();
      setIsRotatingKey(false);
      setNotification(`🔑 SESSION KEY ROTATED: ${newKey}`);
    }, 600);
  };

  const handleResendReceipt = async () => {
    setIsResendingReceipt(true);
    const recipient = currentUser?.email || 'bluesapphiiire777@gmail.com';

    try {
      if (activeEvidence) {
        await fetch('/api/email/receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipient,
            userName: currentUser?.name || 'Investigator',
            badgeId: currentUser?.badgeId || 'FIP-8841-INV',
            evidenceId: activeEvidence.id,
            fileName: activeEvidence.title,
            sha256Hash: activeEvidence.sha256Hash,
            size: activeEvidence.size,
            driveUrl: activeEvidence.driveUrl,
            merkleRoot: activeEvidence.merkleRoot,
          }),
        });
      }
    } catch (err) {
      console.warn('Resend receipt fallback:', err);
    }

    setIsResendingReceipt(false);
    setNotification(`✉️ AUDIT RECEIPT DISPATCHED VIA GMAIL TO: ${recipient}`);
  };

  const handleFreezeToggle = () => {
    const isNowFrozen = toggleVaultFreeze();
    setNotification(
      isNowFrozen
        ? '🔒 VAULT INTAKE EMERGENCY SEAL ACTIVATED - WRITES SUSPENDED'
        : '🔓 VAULT INTAKE UNLOCKED - EVIDENCE INGESTION RESUMED'
    );
  };

  const copySessionKey = () => {
    navigator.clipboard.writeText(sessionKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="w-full bg-[#1F232D] rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-xl space-y-6 font-mono text-[#D1D5DB]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/40 rounded-md uppercase">
              ENCLAVE DEFENSE CONTROLS
            </span>
            <span className="text-xs text-zinc-400 font-semibold">SENIOR LEAD DISPATCH &amp; KEY ROTATION</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Tactical Control Bar &amp; Security Leads
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Emergency tamper escalation to bluesapphiiire777@gmail.com, session cryptographic key rotation, and vault freezing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Vault Intake Status:</span>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-xl flex items-center gap-1.5 ${
              isVaultFrozen
                ? 'bg-red-600/20 text-red-400 border border-red-500/60'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/60'
            }`}
          >
            {isVaultFrozen ? <Lock size={12} /> : <Unlock size={12} />}
            <span>{isVaultFrozen ? 'FROZEN / READ-ONLY' : 'OPERATIONAL / LIVE'}</span>
          </span>
        </div>
      </div>

      {/* Tactical Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* ACTION 1: REPORT TAMPER */}
        <div className="p-5 bg-[#181A20] border border-red-500/40 hover:border-red-500 rounded-2xl space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-red-600/20 text-red-500 rounded-xl border border-red-600/50">
              <ShieldAlert size={24} />
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-red-600 text-white rounded uppercase">
              PRIORITY-1 ALERT
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Report Evidence Tampering
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Dispatches encrypted anomaly notification to Senior Lead (<strong>bluesapphiiire777@gmail.com</strong>).
            </p>
          </div>

          <button
            onClick={onOpenTamperModal}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all uppercase"
          >
            <AlertOctagon size={15} />
            <span>DISPATCH TAMPER ALERT</span>
          </button>
        </div>

        {/* ACTION 2: RESEND RECEIPT */}
        <div className="p-5 bg-[#181A20] border border-amber-500/40 hover:border-amber-500 rounded-2xl space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/50">
              <Mail size={24} />
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500 text-black rounded uppercase">
              GMAIL DISPATCH
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Resend Digital Proof Receipt
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Re-dispatches WORM-anchored deposit receipt and SHA-256 seal to registered email inbox.
            </p>
          </div>

          <button
            onClick={handleResendReceipt}
            disabled={isResendingReceipt}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all uppercase disabled:opacity-50"
          >
            <Mail size={15} />
            <span>{isResendingReceipt ? 'DISPATCHING...' : 'RESEND GMAIL RECEIPT'}</span>
          </button>
        </div>

        {/* ACTION 3: PROOF CERTIFICATE */}
        <div className="p-5 bg-[#181A20] border border-zinc-700/80 hover:border-zinc-500 rounded-2xl space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-zinc-800 text-emerald-400 rounded-xl border border-zinc-700">
              <FileText size={24} />
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500 text-black rounded uppercase">
              COURT-READY
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              View Proof Certificate Seal
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Open cryptographic custody attestation with Merkle root, SHA-256 hash, and Google Drive ID.
            </p>
          </div>

          <button
            onClick={() => activeEvidence && onOpenProofModal(activeEvidence)}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all uppercase border border-zinc-700"
          >
            <Download size={15} />
            <span>GENERATE CERTIFICATE</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Key Rotation & Freeze Control */}
      <div className="p-5 bg-[#181A20] rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
            <KeyRound size={20} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Active Cryptographic Session Token</span>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-200">
              <span>{sessionKey}</span>
              <button onClick={copySessionKey} className="text-zinc-400 hover:text-white">
                {copiedKey ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRotateKey}
            disabled={isRotatingKey}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRotatingKey ? 'animate-spin' : ''} />
            <span>ROTATE SESSION KEY</span>
          </button>

          <button
            onClick={handleFreezeToggle}
            className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all ${
              isVaultFrozen
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            }`}
          >
            {isVaultFrozen ? <Unlock size={14} /> : <Lock size={14} />}
            <span>{isVaultFrozen ? 'UNFREEZE VAULT' : 'EMERGENCY FREEZE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
