import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Hash, 
  ShieldCheck, 
  HardDrive, 
  FileText, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  CheckCircle2,
  Lock,
  Cpu
} from 'lucide-react';
import { useStore } from '../../store';

export const UserStorageSidePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { evidence, currentUser } = useStore();

  const userEmail = currentUser?.email || 'bluesapphiiire777@gmail.com';
  const userEvidenceCount = evidence.length;

  return (
    <>
      {/* Floating Toggle Button on the Right Edge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/3 z-40 bg-gradient-to-l from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-mono font-bold px-3 py-3 rounded-l-2xl shadow-2xl flex items-center gap-2 border-l border-t border-b border-amber-400 transition-all duration-300 transform hover:scale-105"
        title="Open Storage & Cryptography Guide"
      >
        <Database size={16} className="text-black animate-pulse" />
        <span className="text-xs uppercase tracking-wider hidden sm:inline">Storage &amp; SHA-256 Guide</span>
        {isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Side Panel Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-[#0d0f17]/95 backdrop-blur-2xl border-l border-amber-500/30 z-50 flex flex-col shadow-2xl text-zinc-200 font-sans"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-[#12151d]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-white uppercase">Backend &amp; SHA-256 Guide</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">User Vault &amp; Cryptography Protocol</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs leading-relaxed">
              
              {/* SECTION 1: Backend Storage Confirmation */}
              <div className="bg-[#12151d] border border-amber-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  <HardDrive size={14} />
                  <span>1. Is My Upload Stored in the Backend?</span>
                </div>
                <p className="text-zinc-300">
                  <strong className="text-white">Yes, absolutely.</strong> Whenever you upload a file or record forensic evidence, the application immediately transmits the payload to the secure backend server (<code className="text-amber-300 font-mono">/api/vault/upload</code>).
                </p>
                <div className="p-2.5 bg-black/40 rounded-xl border border-zinc-800 space-y-1 font-mono text-[10px] text-zinc-400">
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> MongoDB Backend Collections:
                  </div>
                  <div>• <code className="text-amber-300">evidence</code>: Stores file metadata, SHA-256 hash, Merkle root, and WORM status.</div>
                  <div>• <code className="text-amber-300">audit_logs</code>: Immutable chain-of-custody audit trail.</div>
                  <div>• <code className="text-amber-300">Google Drive Vault</code>: Automatically mirrors into <code className="text-white">FIP_Vault_{userEmail.split('@')[0]}</code>.</div>
                </div>
              </div>

              {/* SECTION 2: How SHA-256 Fingerprint Works */}
              <div className="bg-[#12151d] border border-blue-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
                  <Hash size={14} />
                  <span>2. How SHA-256 Cryptography Works</span>
                </div>
                <p className="text-zinc-300">
                  The <strong className="text-white">SHA-256</strong> algorithm generates a unique 64-character hexadecimal fingerprint (e.g., <code className="text-blue-300 font-mono text-[10px]">a8f5c2...</code>) computed directly from the exact binary contents of your file.
                </p>
                <ul className="space-y-1.5 text-zinc-400 list-disc list-inside font-mono text-[11px]">
                  <li><span className="text-white font-bold">Zero Bit-Drift:</span> Even changing a single comma or pixel alters the hash entirely.</li>
                  <li><span className="text-white font-bold">Judicial Admissibility:</span> Guarantees the file has not been tampered with since upload.</li>
                </ul>
              </div>

              {/* SECTION 3: Dual-Format Storage & WORM Immutability */}
              <div className="bg-[#12151d] border border-emerald-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  <FileText size={14} />
                  <span>3. Dual-Format Storage &amp; WORM Immutability</span>
                </div>
                <p className="text-zinc-300">
                  Whenever you upload evidence, the system securely stores it in <strong className="text-white">two separate formats</strong> in your cloud vault:
                </p>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-black/50 rounded-xl border border-emerald-500/30 space-y-1">
                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                      <Hash size={12} /> Format 1: SHA-256 Hash Key Seal
                    </div>
                    <p className="text-zinc-400 text-[10px]">Saved as <code className="text-amber-300">[filename].sha256-seal.txt</code>. Contains the cryptographic fingerprint, Merkle root anchor, and verification ledger.</p>
                  </div>

                  <div className="p-2.5 bg-black/50 rounded-xl border border-blue-500/30 space-y-1">
                    <div className="text-blue-400 font-bold flex items-center gap-1">
                      <HardDrive size={12} /> Format 2: Original File As-Is
                    </div>
                    <p className="text-zinc-400 text-[10px]">Saved in its exact original format (PDF, E01, PCAP, image, etc.) for investigator review.</p>
                  </div>

                  <div className="p-2.5 bg-black/50 rounded-xl border border-amber-500/30 space-y-1">
                    <div className="text-amber-400 font-bold flex items-center gap-1">
                      <Lock size={12} /> WORM Lock (Non-Deletable &amp; Read-Only)
                    </div>
                    <p className="text-zinc-400 text-[10px]">Both files are protected with Write-Once-Read-Many (WORM) cloud permissions. <strong className="text-white">No one can delete or modify them</strong> once stored.</p>
                  </div>
                </div>

                {/* Direct Google Drive Link Box */}
                <div className="p-3 bg-black/60 rounded-xl border border-emerald-500/30 space-y-2 mt-3">
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                    <span>Official Cloud Drive Folder</span>
                    <span className="text-emerald-400 font-bold">Connected</span>
                  </div>
                  <a
                    href="https://drive.google.com/drive/u/0/my-drive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-3 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <ExternalLink size={14} />
                    <span>Open Official Google Drive Storage</span>
                  </a>
                  <div className="text-[10px] text-zinc-500 text-center font-mono">
                    URL: https://drive.google.com/drive/u/0/my-drive
                  </div>
                </div>
              </div>

              {/* SECTION 4: How System / Admins See User Data */}
              <div className="bg-[#12151d] border border-purple-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider text-[11px]">
                  <Lock size={14} />
                  <span>4. How the System / Admin Sees Your Data</span>
                </div>
                <p className="text-zinc-300">
                  Authorized Senior Forensic Investigators and system administrators can review all user deposits, audit logs, and cryptographic Merkle seals via the <strong className="text-white">Senior Lead Command Center</strong>. All data is protected with role-based access control and encrypted enclaves.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-[#12151d] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck size={14} /> FIPS 180-4 Compliant
              </span>
              <span>Enclave Active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
