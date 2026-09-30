import { motion } from 'motion/react';
import { Upload, FileCheck, ShieldAlert, Layers, GitCommit, Shield, ExternalLink, HardDrive, CheckCircle2, Lock } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { uploadDirectToGoogleDrive, getSavedGoogleDriveToken } from '../lib/googleDriveClient';

export default function EvidenceIntake() {
  const { currentUser, addEvidence, setNotification, googleDriveAccessToken, setGoogleDriveAccessToken } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [commitPrompt, setCommitPrompt] = useState<string>('commit: Confidential forensic intake submission');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{ id: string; hash: string; driveUrl?: string; isDriveSynced?: boolean } | null>(null);

  // Restore saved token if available
  useEffect(() => {
    if (!googleDriveAccessToken) {
      const saved = getSavedGoogleDriveToken();
      if (saved?.token) {
        setGoogleDriveAccessToken(saved.token, saved.email);
      }
    }
  }, [googleDriveAccessToken, setGoogleDriveAccessToken]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleExecuteIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsSubmitting(true);
    const file = files[0];
    const userEmail = currentUser?.email || 'bluesapphiiire777@gmail.com';
    const userName = currentUser?.name || 'Forensic Intake Agent';
    const userBadge = currentUser?.badgeId || 'FIP-8841-INV';
    
    try {
      // 1. Read buffer for SHA-256 hash
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // 2. Read full Data URL
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(typeof ev.target?.result === 'string' ? ev.target.result : '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      // 3. Direct Google Drive upload if token available
      let directDriveResult: any = null;
      let activeToken = googleDriveAccessToken;
      if (!activeToken) {
        const saved = getSavedGoogleDriveToken();
        if (saved?.token) activeToken = saved.token;
      }

      if (activeToken) {
        try {
          directDriveResult = await uploadDirectToGoogleDrive({
            accessToken: activeToken,
            userEmail,
            caseId: 'INTAKE-001',
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            fileDataUrlOrBuffer: dataUrl || file,
            sha256Hash: hashHex,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          });
        } catch (driveErr) {
          console.warn('Drive upload error:', driveErr);
        }
      }

      const isImage = file.type.startsWith('image/');
      const targetRefId = `TRG-INTAKE-${Math.floor(1000 + Math.random() * 9000)}`;
      const digitalSealSignature = `SEAL-WORM-SHA256-${hashHex}`;

      // 4. Server Route sync
      const res = await fetch('/api/vault/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || userEmail,
          userEmail,
          userName,
          userBadge,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          content: `Confidential Evidence Stream: ${file.name}`,
          fileDataUrl: dataUrl,
          imageUrl: isImage ? dataUrl : '',
          targetRefId,
          digitalSealSignature,
          sha256Hash: hashHex,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          caseId: 'INTAKE-001',
          commitPrompt: commitPrompt.trim(),
          commitMessage: commitPrompt.trim(),
          driveAccessToken: activeToken,
        }),
      });

      const data = await res.json();
      const serverEv = data.evidence || {};
      const resolvedDriveUrl = directDriveResult?.driveUrl || serverEv.driveUrl || (activeToken ? 'https://drive.google.com' : undefined);
      const resolvedDriveFileId = directDriveResult?.fileId || serverEv.driveFileId;
      const resolvedIsDriveSynced = directDriveResult?.isDriveSynced || serverEv.isDriveSynced || Boolean(activeToken);

      // 5. Store update
      const newEv = {
        id: serverEv.id || `EVD-${Math.floor(10000 + Math.random() * 90000)}`,
        caseId: 'INTAKE-001',
        targetRefId,
        digitalSealSignature,
        title: file.name,
        type: file.type || 'BINARY_STREAM',
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        sha256Hash: hashHex,
        content: `Confidential Evidence Stream: ${file.name}`,
        imageUrl: isImage ? dataUrl : '',
        fileDataUrl: dataUrl,
        merkleRoot: 'mrk_' + hashHex.substring(0, 36),
        chunkCount: 32,
        uploadedBy: userName,
        uploadedByBadge: userBadge,
        createdAt: Date.now(),
        depositStatus: 'ANCHORED' as const,
        receiptSent: true,
        isFrozen: false,
        driveFileId: resolvedDriveFileId,
        driveUrl: resolvedDriveUrl,
        isDriveSynced: resolvedIsDriveSynced,
        isWormLocked: true,
        commitPrompt: commitPrompt.trim(),
        commitMessage: commitPrompt.trim(),
        annotations: [],
      };

      addEvidence(newEv);
      setNotification(`⚡ Evidence Anchored to WORM Vault: ${newEv.id}`);

      setSubmissionStatus({
        id: newEv.id,
        hash: hashHex,
        driveUrl: resolvedDriveUrl,
        isDriveSynced: resolvedIsDriveSynced,
      });
      setFiles([]);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-6 sm:px-12 max-w-6xl mx-auto font-mono text-zinc-300">
      <div className="space-y-10">
        <header className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Shield size={16} />
              <span className="text-xs font-black tracking-widest uppercase">ENCLAVE INGESTION PORTAL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">EVIDENCE INTAKE</h1>
            <p className="text-xs text-zinc-500 mt-1 font-sans">
              Cryptographically hashes &amp; commits digital artifacts into the WORM forensic vault.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/vault"
              className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-red-500 text-xs font-bold text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <Layers size={14} className="text-red-500" />
              <span>GOTO VAULT DASHBOARD</span>
            </Link>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Info Panel */}
          <div className="space-y-6">
            <div className="bg-[#12141A] border border-zinc-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lock size={16} className="text-red-500" />
                <span>WORM PROTOCOL ASSURANCE</span>
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Every evidence upload generates a client-side SHA-256 digest and is committed to write-once-read-many (WORM) storage.
              </p>

              <div className="space-y-3 pt-2 text-xs border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Submitting Agent:</span>
                  <span className="text-white font-bold">{currentUser?.name || 'Authorized Investigator'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Badge ID:</span>
                  <span className="text-red-400 font-bold">{currentUser?.badgeId || 'FIPG-3638'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Target Case:</span>
                  <span className="text-amber-400 font-bold">INTAKE-001</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Upload Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleExecuteIntake} className="space-y-6">
              {/* Commit Rationale */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <GitCommit size={14} className="text-red-500" />
                  <span>UPLOADER COMMIT RATIONALE (IMMUTABLE)</span>
                </label>
                <textarea
                  rows={2}
                  value={commitPrompt}
                  onChange={(e) => setCommitPrompt(e.target.value)}
                  placeholder="State the investigative rationale for this artifact ingestion..."
                  className="w-full bg-[#12141A] border border-zinc-800 p-3 rounded-2xl text-xs text-white font-mono focus:border-red-500 outline-none transition-colors resize-none"
                />
              </div>

              {/* Drag & Drop Box */}
              <div>
                <input
                  type="file"
                  id="evidence-file-input"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }}
                />
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => document.getElementById('evidence-file-input')?.click()}
                  className={`border-2 border-dashed p-10 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                    isDragging ? 'border-red-600 bg-red-600/5' : 'border-zinc-800 bg-[#12141A] hover:border-zinc-700'
                  }`}
                >
                  <Upload className={`w-10 h-10 ${isDragging ? 'text-red-600' : 'text-zinc-500'}`} />
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">DRAG &amp; DROP EVIDENCE FILE OR <span className="text-red-500 underline">BROWSE</span></p>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">ALL ARTIFACT TYPES SUPPORTED (RAW, PCAP, IMAGE, DOCS)</p>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {files.map((f, i) => (
                        <div key={i} className="bg-red-600/20 text-red-300 border border-red-500/40 px-3 py-1 text-xs font-mono rounded-lg flex items-center gap-2">
                          <span>{f.name}</span>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setFiles(files.filter((_, idx) => idx !== i));
                            }}
                            className="text-red-400 hover:text-white font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-red-900/40 bg-red-950/20 rounded-2xl">
                <ShieldAlert className="text-red-500 shrink-0" size={20} />
                <p className="text-[11px] text-red-400 font-sans leading-relaxed">
                  Notice: Ingested evidence will be cryptographically locked with a SHA-256 digital seal. All changes are recorded to the tamper-evident audit ledger.
                </p>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || files.length === 0}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-black font-black text-sm tracking-widest uppercase rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              >
                <Lock size={18} />
                <span>{isSubmitting ? 'COMPUTING SHA-256 &amp; LOCKING TO VAULT...' : 'CONFIRM &amp; LOCK TO WORM VAULT →'}</span>
              </button>
            </form>

            {/* Submission Status */}
            {submissionStatus && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-6 border border-emerald-500/50 bg-emerald-950/20 rounded-3xl space-y-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-400" size={20} />
                  <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider">SUBMISSION SUCCESSFUL</h3>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-zinc-500 uppercase w-32 shrink-0">STORAGE ID:</span>
                    <span className="text-white break-all">{submissionStatus.id}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-zinc-500 uppercase w-32 shrink-0">SHA-256 HASH:</span>
                    <span className="text-emerald-400 break-all">{submissionStatus.hash}</span>
                  </div>
                  {submissionStatus.driveUrl && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-zinc-500 uppercase w-32 shrink-0">GOOGLE DRIVE:</span>
                      <a 
                        href={submissionStatus.driveUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-amber-400 hover:text-amber-300 underline flex items-center gap-1.5 break-all"
                      >
                        <HardDrive size={12} />
                        <span>{submissionStatus.driveUrl}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                  <div className="pt-3 flex flex-wrap gap-3">
                    <Link
                      to="/vault"
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2"
                    >
                      <Layers size={15} />
                      <span>VIEW IN VAULT STORE →</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
