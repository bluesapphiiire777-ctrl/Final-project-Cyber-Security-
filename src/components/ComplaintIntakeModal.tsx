import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  FileText, 
  ShieldCheck, 
  Upload, 
  X, 
  Lock, 
  Calendar, 
  DollarSign, 
  User, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { computeSha256OfText, computeSha256OfFile, canonicalJsonStringify, generateMockMerkleRoot } from '../lib/complaintCrypto';
import { ComplaintCategory, ComplaintPriority, ComplaintAttachment } from '../types';

interface ComplaintIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintCreated?: (newC: any) => void;
}

export const ComplaintIntakeModal: React.FC<ComplaintIntakeModalProps> = ({ isOpen, onClose, onComplaintCreated }) => {
  const { currentUser, createComplaint, setNotification } = useStore();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('FINANCIAL_FRAUD');
  const [priority, setPriority] = useState<ComplaintPriority>('HIGH');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 16));
  const [statement, setStatement] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [suspectDetails, setSuspectDetails] = useState('');
  const [financialLoss, setFinancialLoss] = useState('');
  
  const [attachments, setAttachments] = useState<ComplaintAttachment[]>([]);
  const [isHashingFiles, setIsHashingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewHash, setPreviewHash] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsHashingFiles(true);
    const newAttachments: ComplaintAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const hash = await computeSha256OfFile(file);
        const formatSize = (bytes: number) => {
          if (bytes < 1024) return `${bytes} B`;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
          return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        };

        newAttachments.push({
          id: `att-${Date.now()}-${i}`,
          fileName: file.name,
          fileSize: formatSize(file.size),
          mimeType: file.type || 'application/octet-stream',
          sha256Hash: hash,
          uploadedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error hashing file:', err);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    setIsHashingFiles(false);
    updatePreviewSeal(statement, [...attachments, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    const updated = attachments.filter(a => a.id !== id);
    setAttachments(updated);
    updatePreviewSeal(statement, updated);
  };

  const updatePreviewSeal = async (stmt: string, atts: ComplaintAttachment[]) => {
    if (!stmt.trim() && atts.length === 0) {
      setPreviewHash('');
      return;
    }
    const samplePayload = {
      title,
      category,
      statement: stmt,
      attachments: atts.map(a => a.sha256Hash),
      user: currentUser?.email || 'bluesapphiiire777@gmail.com',
      mode: 'WORM_IMMUTABLE'
    };
    const canonical = canonicalJsonStringify(samplePayload);
    const hash = await computeSha256OfText(canonical);
    setPreviewHash(hash);
  };

  const handleStatementChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setStatement(val);
    updatePreviewSeal(val, attachments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !statement.trim()) {
      alert('Please provide a complaint title and detailed incident statement.');
      return;
    }

    setIsSubmitting(true);
    try {
      const canonical = canonicalJsonStringify({
        title: title.trim(),
        category,
        incidentDate,
        statement: statement.trim(),
        incidentLocation: incidentLocation.trim() || 'Unspecified',
        suspectDetails: suspectDetails.trim() || 'Under Investigation',
        financialLossEstimated: financialLoss.trim() || 'N/A',
        attachments: attachments.map(a => ({
          fileName: a.fileName,
          sha256Hash: a.sha256Hash
        }))
      });
      const finalSeal = await computeSha256OfText(canonical);
      const merkle = generateMockMerkleRoot(finalSeal, attachments.map(a => a.sha256Hash));

      const payload = {
        title: title.trim(),
        category,
        priority,
        incidentDate: incidentDate || new Date().toISOString(),
        statement: statement.trim(),
        incidentLocation: incidentLocation.trim() || 'Unspecified',
        suspectDetails: suspectDetails.trim() || 'Under Investigation',
        financialLossEstimated: financialLoss.trim() || 'N/A',
        attachments,
        sha256Seal: finalSeal,
        merkleRoot: merkle,
        complainantId: currentUser?.id || 'usr-001',
        complainantName: currentUser?.name || 'bluesapphiiire777',
        complainantEmail: currentUser?.email || 'bluesapphiiire777@gmail.com',
        complainantBadge: currentUser?.badgeId || 'FIP-8841-INV'
      };

      const result = await createComplaint(payload);
      if (result) {
        setNotification(`🔒 COMPLAINT ${result.id} REGISTERED & CRYPTOGRAPHICALLY SEALED IN WORM REPOSITORY`);
        if (onComplaintCreated) {
          onComplaintCreated(result);
        }
        onClose();
      } else {
        alert('Failed to register complaint. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('An error occurred during cryptographic registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div id="complaint-intake-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="complaint-intake-modal-dialog" 
        className="bg-slate-900 border border-emerald-500/30 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">Register & File Secure Complaint</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  WORM IMMUTABLE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Encrypted into structured file format with SHA-256 seal • Dispatched to Senior Investigator Console
              </p>
            </div>
          </div>
          <button
            id="close-complaint-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Integrity Guarantee Banner */}
          <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-emerald-300">
                Cryptographic Integrity & Non-Deletable Guarantee
              </p>
              <p className="text-slate-400 leading-relaxed">
                Every filed complaint is converted into canonical JSON, locked with a deterministic SHA-256 hash key, and routed into the Senior Investigator's audit ledger. Under WORM rules, this original record can never be deleted or overwritten.
              </p>
            </div>
          </div>

          {/* User Info Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Complainant / Agent</span>
                <span className="font-medium text-slate-200">{currentUser?.name || 'bluesapphiiire777'}</span>
              </div>
            </div>
            <div className="truncate text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Verified Email</span>
              <span className="font-mono text-slate-200">{currentUser?.email || 'bluesapphiiire777@gmail.com'}</span>
            </div>
            <div className="truncate text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Investigative Badge</span>
              <span className="font-mono font-bold text-emerald-400">{currentUser?.badgeId || 'FIP-8841-INV'}</span>
            </div>
          </div>

          {/* Core Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Complaint / Case Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="complaint-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unauthorized SWIFT Wire Extraction & Access Token Compromise"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Category
              </label>
              <select
                id="complaint-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="FINANCIAL_FRAUD">Financial Fraud / Wire Breach</option>
                <option value="DATA_BREACH">Data Exfiltration / Leak</option>
                <option value="UNAUTHORIZED_ACCESS">Unauthorized Access / Bastion</option>
                <option value="SYSTEM_SABOTAGE">System Sabotage / Rootkit</option>
                <option value="DOCUMENT_FORGERY">Document Forgery / Signature Drift</option>
                <option value="EXTORTION_RANSOMWARE">Extortion / Ransomware Payload</option>
                <option value="OTHER">Other Security Incident</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Incident Date & Time
              </label>
              <div className="relative">
                <input
                  id="complaint-date-input"
                  type="datetime-local"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Priority Rating
              </label>
              <select
                id="complaint-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="LOW">Low (Standard Review)</option>
                <option value="MEDIUM">Medium (Within 24h)</option>
                <option value="HIGH">High (Within 6h)</option>
                <option value="URGENT">Urgent (Immediate Senior Intervention)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Estimated Financial Impact / Loss
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  id="complaint-loss-input"
                  type="text"
                  value={financialLoss}
                  onChange={(e) => setFinancialLoss(e.target.value)}
                  placeholder="e.g. $140,000.00 USD"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Incident Location / Network Subnet / Enclave
              </label>
              <input
                id="complaint-location-input"
                type="text"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                placeholder="e.g. NY Data Center / Gateway Node 04 (10.40.12.0/24)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Suspect Identifier / Threat Actor / External IP
              </label>
              <input
                id="complaint-suspect-input"
                type="text"
                value={suspectDetails}
                onChange={(e) => setSuspectDetails(e.target.value)}
                placeholder="e.g. Credential ID #X-8809 / Host 185.220.101.4"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Detailed Statement */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Detailed Incident Statement & Forensic Narrative <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-slate-500">
                {statement.length} characters (Included in SHA-256 seal)
              </span>
            </div>
            <textarea
              id="complaint-statement-textarea"
              required
              rows={4}
              value={statement}
              onChange={handleStatementChange}
              placeholder="Provide an exact chronological statement of the incident, timestamps, indicators observed, affected enclaves, and remediation steps taken..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
            />
          </div>

          {/* Evidence Attachments Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Evidence Documents & Forensic Logs (Auto SHA-256 Hashed)
              </label>
              <span className="text-[10px] text-slate-500">
                {attachments.length} files attached
              </span>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-4 bg-slate-950/50 transition-colors text-center">
              <input
                id="complaint-file-upload-input"
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="complaint-file-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-400 hover:underline">
                    Click to select evidence files
                  </span>
                  <span className="text-xs text-slate-400"> or drag and drop</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  PCAP, CSV, RAW, LOG, PDF, PNG, JSON (Calculates SHA-256 hash on upload)
                </p>
              </label>
            </div>

            {isHashingFiles && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 py-1 font-mono">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Computing cryptographic SHA-256 checksums...</span>
              </div>
            )}

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-medium text-slate-200 block truncate">{att.fileName}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>{att.fileSize}</span>
                          <span>•</span>
                          <span className="text-emerald-400 truncate">SHA-256: {att.sha256Hash.slice(0, 16)}...{att.sha256Hash.slice(-8)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cryptographic Seal Live Preview */}
          {previewHash && (
            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3 text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  Deterministic SHA-256 Seal Key
                </span>
                <span className="text-slate-500 text-[10px]">WORM INTEGRITY ANCHOR</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] text-emerald-300 break-all select-all">
                {previewHash}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              id="cancel-complaint-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-complaint-btn"
              disabled={isSubmitting || !title.trim() || !statement.trim()}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Sealing Record...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Seal & Register Complaint (WORM Mode)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
