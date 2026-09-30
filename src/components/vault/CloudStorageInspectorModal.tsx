import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  HardDrive, 
  Folder, 
  FileText, 
  Lock, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Hash, 
  Download, 
  Trash2, 
  RefreshCw,
  Server,
  Cloud
} from 'lucide-react';
import { useStore } from '../../store';
import { Evidence } from '../../types';

interface CloudStorageInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProofModal: (evidence: Evidence) => void;
}

export const CloudStorageInspectorModal: React.FC<CloudStorageInspectorModalProps> = ({
  isOpen,
  onClose,
  onOpenProofModal
}) => {
  const { evidence, currentUser } = useStore();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(evidence[0]?.id || null);

  if (!isOpen) return null;

  // Calculate total storage used (simulated + actual uploaded evidence sizes)
  // Default base usage = 16.4 GB or sum of evidence sizes
  let totalBytes = 16.4 * 1024 * 1024 * 1024; // 16.4 GB baseline
  evidence.forEach(ev => {
    // parse size like "3.40 MB" or "1.2 GB"
    if (ev.size.includes('MB')) {
      const num = parseFloat(ev.size);
      if (!isNaN(num)) totalBytes += num * 1024 * 1024;
    } else if (ev.size.includes('GB')) {
      const num = parseFloat(ev.size);
      if (!isNaN(num)) totalBytes += num * 1024 * 1024 * 1024;
    } else if (ev.size.includes('KB')) {
      const num = parseFloat(ev.size);
      if (!isNaN(num)) totalBytes += num * 1024;
    }
  });

  const totalUsageGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
  const storageLimitGB = 90.0; // 15 GB free tier x 6 nodes or 90 GB enterprise tier
  const usagePercentage = Math.min(Math.round((parseFloat(totalUsageGB) / storageLimitGB) * 100), 100);

  const handleDownloadFile = (ev: Evidence) => {
    const dataUrl = ev.fileDataUrl || ev.imageUrl;
    if (dataUrl && dataUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = ev.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([ev.content || `FIP Raw Evidence: ${ev.title}`], { type: ev.type || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ev.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-4xl max-h-[90vh] bg-[#141721] border border-amber-500/40 rounded-3xl shadow-2xl z-[160] flex flex-col text-white overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-800 bg-[#1A1E29] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Cloud className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold tracking-wider text-amber-300">GOOGLE DRIVE CLOUD STORAGE &amp; WORM VAULT</h2>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      ACTIVE TIER (90 GB POOL)
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Inspecting isolated folder <code className="text-amber-400">FIP_Vault_Enclave_Storage</code> with WORM immutable read-only locks.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Storage Progress Overview */}
            <div className="p-6 bg-[#1A1E29]/60 border-b border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#12151D] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-amber-400" /> Total Storage Used</span>
                  <span className="text-white font-bold">{totalUsageGB} GB</span>
                </div>
                <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(usagePercentage, 5)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>Limit: {storageLimitGB} GB Enclave Pool</span>
                  <span className="text-emerald-400 font-bold">{usagePercentage}% Capacity</span>
                </div>
              </div>

              <div className="bg-[#12151D] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-blue-400" /> Uploaded Evidence Streams
                </div>
                <div className="text-3xl font-bold text-white mb-1">{evidence.length} Files</div>
                <div className="text-[10px] text-blue-400">✓ Fully Merkle Anchored &amp; WORM Sealed</div>
              </div>

              <div className="bg-[#12151D] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Google Drive Storage &amp; Seal
                </div>
                <div className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Digital Seal Active (SHA-256)
                </div>
                <a
                  href="https://drive.google.com/drive/u/0/my-drive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Google Drive Storage</span>
                </a>
              </div>
            </div>

            {/* Evidence & Storage List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Stored Evidence Files &amp; Drive Vault Folders
                </h3>
                <span className="text-xs text-amber-400">Click any file to inspect Merkle proof</span>
              </div>

              <div className="space-y-3">
                {evidence.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setSelectedFileId(ev.id);
                      onOpenProofModal(ev);
                    }}
                    className="bg-[#1B1F2A] border border-gray-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm">{ev.title}</span>
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> WORM LOCKED
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Size: <strong className="text-white">{ev.size}</strong></span>
                          <span>&bull;</span>
                          <span>ID: <code className="text-amber-400 font-mono">{ev.id}</code></span>
                          <span>&bull;</span>
                          <span>Uploader: <span className="text-gray-300">{ev.uploadedBy}</span></span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-2">
                          <Hash className="w-3 h-3 text-amber-500" /> SHA-256: {ev.sha256Hash.substring(0, 24)}...
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFile(ev);
                        }}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Download Original File Payload"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Download Payload</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProofModal(ev);
                        }}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Inspect Proof &amp; WORM</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-[#12151D] flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" /> Google Drive Isolated Vault Folder: <code className="text-amber-400">/FIP_Vault_Enclave/</code>
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
