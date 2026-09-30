import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ShieldAlert, Upload, Key, RefreshCw, AlertOctagon, FolderKanban, Search, ExternalLink, Image as ImageIcon, FileText, CheckCircle, Eye } from 'lucide-react';
import { useStore } from '../store';

export default function HashVerifier() {
  const { evidence, cases, reportTamperAlert, addTickerLog, currentUser } = useStore();
  const [dragActive, setDragActive] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-001');
  const [calculatedHash, setCalculatedHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [targetHashInput, setTargetHashInput] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<'MATCH' | 'MISMATCH' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // SHA-256 Raw Data Lookup State for Senior Investigators
  const [lookupHashInput, setLookupHashInput] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Filter evidence for selected Case ID
  const caseEvidence = evidence.filter(e => e.caseId === selectedCaseId || selectedCaseId === 'ALL');

  // Compute SHA-256 client-side using SubtleCrypto
  const computeFileHash = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setCalculatedHash(hashHex);

      // Compare calculated hash against database records for that Case ID
      let isMatch = false;
      if (targetHashInput.trim()) {
        isMatch = hashHex.toLowerCase() === targetHashInput.trim().toLowerCase();
      } else {
        const matchingRecord = caseEvidence.find(e => e.sha256Hash.toLowerCase() === hashHex.toLowerCase());
        if (matchingRecord) {
          setTargetHashInput(matchingRecord.sha256Hash);
          isMatch = true;
        } else {
          isMatch = false;
        }
      }

      setVerificationResult(isMatch ? 'MATCH' : 'MISMATCH');

      // Dispatch real-time telemetry log to Audit Ticker
      const utcTime = new Date().toUTCString().split(' ')[4] + ' UTC';
      addTickerLog({
        timestamp: utcTime,
        userLabel: currentUser?.name || 'INVESTIGATOR',
        action: 'VERIFIED',
        target: file.name,
        sha256Hash: hashHex,
        caseId: selectedCaseId.toUpperCase(),
      });

      if (!isMatch) {
        reportTamperAlert({
          evidenceTitle: file.name,
          tamperType: 'SHA256_MISMATCH',
          severity: 'CRITICAL',
          exactDiff: `CLIENT RE-HASH MISMATCH FOR ${selectedCaseId.toUpperCase()}:\nCalculated Local SHA-256: ${hashHex}\nTarget Case Evidence Count: ${caseEvidence.length}`,
          rawPayloadBefore: 'EXPECTED ANCHOR HASH',
          rawPayloadAfter: hashHex,
        });
      }
    } catch (err) {
      console.error('Crypto hash error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      computeFileHash(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      computeFileHash(e.target.files[0]);
    }
  };

  const verifyManually = () => {
    if (!calculatedHash || !targetHashInput) return;
    const isMatch = calculatedHash.toLowerCase() === targetHashInput.trim().toLowerCase();
    setVerificationResult(isMatch ? 'MATCH' : 'MISMATCH');

    const utcTime = new Date().toUTCString().split(' ')[4] + ' UTC';
    addTickerLog({
      timestamp: utcTime,
      userLabel: currentUser?.name || 'INVESTIGATOR',
      action: 'VERIFIED',
      target: fileName || 'Local Verification Payload',
      sha256Hash: calculatedHash,
      caseId: selectedCaseId.toUpperCase(),
    });

    if (!isMatch) {
      reportTamperAlert({
        evidenceTitle: fileName || 'Local Verification Target',
        tamperType: 'SHA256_MISMATCH',
        severity: 'CRITICAL',
        exactDiff: `MANUAL RE-HASH MISMATCH:\nCalculated: ${calculatedHash}\nExpected  : ${targetHashInput}`,
        rawPayloadBefore: targetHashInput,
        rawPayloadAfter: calculatedHash,
      });
    }
  };

  // Lookup raw data by SHA-256 Hash key
  const handleLookupRawDataByHash = async (hashToSearch?: string) => {
    const queryHash = (hashToSearch || lookupHashInput).trim();
    if (!queryHash) return;

    setIsLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    // 1. Try local store match first
    const storeMatch = evidence.find(e => e.sha256Hash.toLowerCase() === queryHash.toLowerCase() || e.id.toLowerCase() === queryHash.toLowerCase());
    if (storeMatch) {
      setLookupResult({
        success: true,
        sha256HashKey: storeMatch.sha256Hash,
        isIntegrityVerified: true,
        evidence: {
          id: storeMatch.id,
          caseId: storeMatch.caseId,
          title: storeMatch.title,
          type: storeMatch.type,
          size: storeMatch.size,
          uploadedBy: storeMatch.uploadedBy,
          uploadedByBadge: storeMatch.uploadedByBadge,
          createdAt: storeMatch.createdAt,
          driveUrl: storeMatch.driveUrl,
          driveFileId: storeMatch.driveFileId,
          merkleRoot: storeMatch.merkleRoot,
          digitalSealSignature: storeMatch.digitalSealSignature,
          rawContent: storeMatch.content,
          fileDataUrl: storeMatch.fileDataUrl || storeMatch.imageUrl,
          imageUrl: storeMatch.imageUrl,
          isWormLocked: true,
        },
        cryptographicGuide: {
          algorithm: 'SHA-256 Cryptography (FIPS PUB 180-4 Standard)',
          verificationInstruction: 'The hash key uniquely anchors this raw file in the enclave ledger. Raw format file is available in Google Drive.',
          rawFormatLocation: storeMatch.driveUrl || 'Google Drive WORM Vault Enclave',
        }
      });
      setIsLookupLoading(false);
      return;
    }

    // 2. Query backend API
    try {
      const res = await fetch(`/api/evidence/hash/${encodeURIComponent(queryHash)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch evidence by hash key.');
      }
      setLookupResult(data);
    } catch (err: any) {
      setLookupError(err.message || 'No evidence record matched the provided SHA-256 hash.');
    } finally {
      setIsLookupLoading(false);
    }
  };

  return (
    <div className="bg-[#1E293B] border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl space-y-6 font-mono text-[#D1D5DB]">
      {/* Header with Case ID Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Key size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              DRAG &amp; DROP HASH VERIFIER
            </h2>
            <p className="text-xs text-slate-400">
              Web Crypto API (<code className="text-amber-400">crypto.subtle.digest</code>) SHA-256 Client-Side Verification
            </p>
          </div>
        </div>

        {/* Case Selector */}
        <div className="flex items-center gap-2 bg-[#0F172A] p-1.5 rounded-xl border border-white/10">
          <FolderKanban size={14} className="text-amber-400 ml-1" />
          <span className="text-xs text-slate-400 font-bold">CASE ID:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-black/60 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-lg px-2.5 py-1 outline-none"
          >
            <option value="ALL">ALL CASE RECORDS</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id.toUpperCase()} — {c.caseName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative ${
          dragActive
            ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
            : 'border-white/15 bg-[#0F172A]/80 hover:border-amber-500/40 hover:bg-[#0F172A]'
        }`}
      >
        <input
          type="file"
          onChange={handleFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-400">
            {isProcessing ? <RefreshCw className="animate-spin" size={28} /> : <Upload size={28} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              {fileName ? `Loaded: ${fileName}` : 'DROP LOCAL FILE HERE TO CALCULATE SHA-256 HASH'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {fileSize ? `File Size: ${fileSize}` : `Comparing against database records for Case: ${selectedCaseId.toUpperCase()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Calculated SHA-256 Hash Display */}
      {calculatedHash && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 bg-[#0F172A] border border-white/10 p-5 rounded-xl">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              CALCULATED BROWSER SHA-256 HASH:
            </label>
            <div className="bg-[#08090d] border border-amber-500/40 p-3 rounded-lg font-mono text-xs text-[#F59E0B] break-all select-all font-bold">
              {calculatedHash}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              EXPECTED DATABASE ANCHOR HASH (MATCH OR MANUAL OVERRIDE):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetHashInput}
                onChange={(e) => setTargetHashInput(e.target.value)}
                placeholder="Database target hash..."
                className="flex-1 bg-[#08090d] border border-white/15 px-3 py-2 rounded-lg font-mono text-xs text-white focus:border-amber-500 outline-none"
              />
              <button
                onClick={verifyManually}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                COMPARE HASHES
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Verification Status Badge Feedback */}
      <AnimatePresence>
        {verificationResult === 'MATCH' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 bg-emerald-950/60 border-2 border-[#10B981] text-emerald-300 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <ShieldCheck size={36} className="text-[#10B981] shrink-0" />
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-[#10B981]">
                ✔ VERIFIED — INTEGRITY INTACT (SHA-256 MATCH)
              </h4>
              <p className="text-xs text-emerald-300/90 mt-1">
                Calculated browser hash matches the Case {selectedCaseId.toUpperCase()} database record bit-for-bit.
              </p>
            </div>
          </motion.div>
        )}

        {verificationResult === 'MISMATCH' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 bg-red-950/60 border-2 border-[#EF4444] text-red-300 rounded-xl flex items-center gap-4 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse"
          >
            <AlertOctagon size={36} className="text-[#EF4444] shrink-0" />
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-[#EF4444]">
                ✖ HASH MISMATCH — UNVERIFIED / TAMPERED FILE
              </h4>
              <p className="text-xs text-red-300/90 mt-1">
                The calculated file hash does NOT match any database records for Case {selectedCaseId.toUpperCase()}! Possible bit drift or file tampering detected.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SENIOR INVESTIGATOR RAW DATA SHA-256 LOOKUP SECTION */}
      <div className="border-t border-white/10 pt-6 mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-amber-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            SENIOR INVESTIGATOR SHA-256 RAW DATA LOOKUP
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          Enter any SHA-256 hash key to inspect the original raw evidence data payload, Google Drive storage link, and cryptographic Merkle tree root.
        </p>

        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={lookupHashInput}
            onChange={(e) => setLookupHashInput(e.target.value)}
            placeholder="Paste SHA-256 Hash Key (e.g. e3b0c44298fc...)"
            className="flex-1 bg-[#0F172A] border border-amber-500/30 px-3.5 py-2.5 rounded-xl font-mono text-xs text-white focus:border-amber-500 outline-none"
          />
          <button
            onClick={() => handleLookupRawDataByHash()}
            disabled={isLookupLoading}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLookupLoading ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />}
            <span>RETRIEVE RAW DATA</span>
          </button>
        </div>

        {/* Quick select buttons for existing evidence hashes */}
        {evidence.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Quick Samples:</span>
            {evidence.slice(0, 4).map((ev) => (
              <button
                key={ev.id}
                onClick={() => {
                  setLookupHashInput(ev.sha256Hash);
                  handleLookupRawDataByHash(ev.sha256Hash);
                }}
                className="px-2.5 py-1 bg-black/50 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-[10px] text-slate-300 font-mono rounded-lg transition-all"
              >
                {ev.title.length > 20 ? ev.title.substring(0, 20) + '...' : ev.title} ({ev.sha256Hash.substring(0, 8)}...)
              </button>
            ))}
          </div>
        )}

        {/* Lookup Error Feedback */}
        {lookupError && (
          <div className="p-4 bg-red-950/60 border border-red-500/60 text-red-300 rounded-xl text-xs">
            ⚠️ {lookupError}
          </div>
        )}

        {/* Lookup Result Modal Card */}
        {lookupResult && lookupResult.evidence && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-[#0F172A] border-2 border-amber-500/40 rounded-2xl space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <CheckCircle size={16} />
                <span>CRYPTOGRAPHIC RAW DATA MATCHED ({lookupResult.evidence.type})</span>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-[10px] font-bold">
                WORM PROTECTED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">FILE TITLE &amp; CASE:</span>
                <p className="text-white font-bold">{lookupResult.evidence.title} ({lookupResult.evidence.caseId?.toUpperCase()})</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">INGESTED BY:</span>
                <p className="text-slate-300">{lookupResult.evidence.uploadedBy} ({lookupResult.evidence.uploadedByBadge || 'FIP-8841'})</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">SHA-256 CRYPTOGRAPHIC HASH KEY:</span>
              <p className="p-2.5 bg-black/70 border border-amber-500/30 text-amber-400 font-mono text-xs break-all rounded-lg select-all">
                {lookupResult.sha256HashKey}
              </p>
            </div>

            {/* Raw Image or Raw Text Content Preview */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">RAW EVIDENCE PAYLOAD PREVIEW:</span>
              {lookupResult.evidence.fileDataUrl && lookupResult.evidence.fileDataUrl.startsWith('data:image') ? (
                <div className="p-2 bg-black/60 border border-white/10 rounded-xl flex items-center justify-center max-h-48 overflow-hidden">
                  <img
                    src={lookupResult.evidence.fileDataUrl}
                    alt={lookupResult.evidence.title}
                    className="max-h-44 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <pre className="p-3 bg-black/80 border border-white/10 text-slate-300 font-mono text-[11px] rounded-xl max-h-40 overflow-y-auto whitespace-pre-wrap break-all">
                  {lookupResult.evidence.rawContent || '[Binary Forensic Payload Stream]'}
                </pre>
              )}
            </div>

            {/* Google Drive & Unfiltered Raw Links */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase">RAW EVIDENCE ACCESS:</span>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/evidence/raw/${lookupResult.evidence.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Eye size={12} />
                  <span>VIEW UNFILTERED RAW FILE</span>
                </a>
                <a
                  href={lookupResult.evidence.driveUrl && lookupResult.evidence.driveUrl.startsWith('https://drive.google.com') ? lookupResult.evidence.driveUrl : `/api/evidence/raw/${lookupResult.evidence.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>{lookupResult.evidence.driveUrl?.startsWith('https://drive.google.com') ? 'OPEN IN GOOGLE DRIVE' : 'OPEN ENCLAVE RAW FILE'}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

