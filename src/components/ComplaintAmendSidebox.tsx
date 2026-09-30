import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  History, 
  X, 
  Lock, 
  ShieldAlert, 
  Upload, 
  FileText, 
  GitBranch, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Complaint, ComplaintAttachment, ComplaintVersion } from '../types';
import { computeSha256OfText, computeSha256OfFile, canonicalJsonStringify, generateMockMerkleRoot } from '../lib/complaintCrypto';

interface ComplaintAmendSideboxProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ComplaintAmendSidebox: React.FC<ComplaintAmendSideboxProps> = ({
  complaint,
  isOpen,
  onClose
}) => {
  const { currentUser, amendComplaint, setNotification } = useStore();

  const [statement, setStatement] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [suspectDetails, setSuspectDetails] = useState('');
  const [financialLoss, setFinancialLoss] = useState('');
  const [attachments, setAttachments] = useState<ComplaintAttachment[]>([]);
  const [isHashingFiles, setIsHashingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSeal, setPreviewSeal] = useState('');

  const currentVersion: ComplaintVersion | undefined = complaint?.versions[complaint.versions.length - 1];
  const originalVersion: ComplaintVersion | undefined = complaint?.versions[0];
  const nextVersionNumber = (complaint?.currentVersionNumber || 1) + 1;

  useEffect(() => {
    if (complaint && currentVersion) {
      setStatement(currentVersion.statement);
      setIncidentLocation(currentVersion.incidentLocation || '');
      setSuspectDetails(currentVersion.suspectDetails || '');
      setFinancialLoss(currentVersion.financialLossEstimated || '');
      setAttachments([...currentVersion.attachments]);
      setRevisionNotes('');
      recomputeSeal(currentVersion.statement, currentVersion.attachments);
    }
  }, [complaint, isOpen]);

  if (!isOpen || !complaint) return null;

  const recomputeSeal = async (stmt: string, atts: ComplaintAttachment[]) => {
    const parentHash = currentVersion?.sha256Seal || complaint.originalSha256Seal;
    const payload = {
      complaintId: complaint.id,
      version: nextVersionNumber,
      statement: stmt,
      parentSealHash: parentHash,
      attachments: atts.map(a => a.sha256Hash),
      user: currentUser?.email || 'bluesapphiiire777@gmail.com'
    };
    const canonical = canonicalJsonStringify(payload);
    const hash = await computeSha256OfText(canonical);
    setPreviewSeal(hash);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsHashingFiles(true);
    const newAtts: ComplaintAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const hash = await computeSha256OfFile(file);
        const formatSize = (bytes: number) => {
          if (bytes < 1024) return `${bytes} B`;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
          return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        };

        newAtts.push({
          id: `att-amend-${Date.now()}-${i}`,
          fileName: file.name,
          fileSize: formatSize(file.size),
          mimeType: file.type || 'application/octet-stream',
          sha256Hash: hash,
          uploadedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('File hashing error:', err);
      }
    }

    const merged = [...attachments, ...newAtts];
    setAttachments(merged);
    setIsHashingFiles(false);
    recomputeSeal(statement, merged);
  };

  const removeAttachment = (id: string) => {
    const updated = attachments.filter(a => a.id !== id);
    setAttachments(updated);
    recomputeSeal(statement, updated);
  };

  const handleSubmitAmendment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) {
      alert('Updated statement cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parentSeal = currentVersion?.sha256Seal || complaint.originalSha256Seal;
      const canonical = canonicalJsonStringify({
        complaintId: complaint.id,
        version: nextVersionNumber,
        statement: statement.trim(),
        incidentLocation: incidentLocation.trim(),
        suspectDetails: suspectDetails.trim(),
        financialLossEstimated: financialLoss.trim(),
        revisionNotes: revisionNotes.trim(),
        parentSealHash: parentSeal,
        attachments: attachments.map(a => ({ fileName: a.fileName, sha256Hash: a.sha256Hash }))
      });
      const finalSeal = await computeSha256OfText(canonical);
      const merkle = generateMockMerkleRoot(finalSeal, attachments.map(a => a.sha256Hash));

      const payload = {
        statement: statement.trim(),
        revisionNotes: revisionNotes.trim() || `Amended revision to version ${nextVersionNumber}.0`,
        incidentLocation: incidentLocation.trim() || currentVersion?.incidentLocation,
        suspectDetails: suspectDetails.trim() || currentVersion?.suspectDetails,
        financialLossEstimated: financialLoss.trim() || currentVersion?.financialLossEstimated,
        attachments,
        sha256Seal: finalSeal,
        merkleRoot: merkle,
        user: {
          userId: currentUser?.id || 'usr-001',
          userName: currentUser?.name || 'bluesapphiiire777',
          userEmail: currentUser?.email || 'bluesapphiiire777@gmail.com',
          userBadge: currentUser?.badgeId || 'FIP-8841-INV'
        }
      };

      const result = await amendComplaint(complaint.id, payload);
      if (result) {
        setNotification(`📝 VERSION ${result.currentVersionNumber}.0 CREATED: ORIGINAL v1.0 PRESERVED PERMANENTLY`);
        onClose();
      } else {
        alert('Failed to save amendment.');
      }
    } catch (err) {
      console.error('Amendment submission error:', err);
      alert('Failed to submit amendment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="complaint-amend-sidebox-backdrop" 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end transition-opacity"
    >
      <div 
        id="complaint-amend-sidebox-panel"
        className="w-full max-w-2xl bg-slate-900 border-l border-amber-500/30 h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Complaint Amendment Sidebox</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  VERSION {nextVersionNumber}.0 DRAFT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {complaint.id} • Original v1.0 remains locked and immutable
              </p>
            </div>
          </div>
          <button
            id="close-amend-sidebox-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Rule Banner */}
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-6 py-3 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-amber-300 block mb-0.5">
              WORM (Write Once, Read Many) Versioning Enforced
            </span>
            When you commit changes, the original message (v1.0) stays untouched in permanent forensic storage. A new child version copy (<span className="font-mono text-amber-300 font-bold">v{nextVersionNumber}.0</span>) is cryptographically chained to parent seal <span className="font-mono text-[10px] text-amber-200">{currentVersion?.sha256Seal.slice(0, 12)}...</span>.
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmitAmendment} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Read-Only Original Reference Accordion/Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Original Master Record (v1.0 Sealed)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                ORIGINAL IMMUTABLE
              </span>
            </div>
            <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 max-h-28 overflow-y-auto font-sans leading-relaxed">
              {originalVersion?.statement}
            </div>
            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Master Hash: {originalVersion?.sha256Seal.slice(0, 24)}...</span>
              <span>Filed: {originalVersion?.submittedAt ? new Date(originalVersion.submittedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          {/* Revision Reason Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Reason for Amendment / Revision Notes <span className="text-amber-400">*</span>
            </label>
            <input
              id="amend-notes-input"
              type="text"
              required
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="e.g. Added secondary DNS packet trace & updated forensic loss estimate"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* New Copy Statement Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Updated Narrative & Statement (Version {nextVersionNumber}.0) <span className="text-amber-400">*</span>
              </label>
              <span className="text-[10px] text-amber-400 font-mono">NEW REVISION COPY</span>
            </div>
            <textarea
              id="amend-statement-textarea"
              required
              rows={5}
              value={statement}
              onChange={(e) => {
                setStatement(e.target.value);
                recomputeSeal(e.target.value, attachments);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />
          </div>

          {/* Editable Auxiliary Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Updated Suspect / Threat Actor
              </label>
              <input
                id="amend-suspect-input"
                type="text"
                value={suspectDetails}
                onChange={(e) => setSuspectDetails(e.target.value)}
                placeholder="e.g. Host 185.220.101.4"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Updated Estimated Loss
              </label>
              <input
                id="amend-loss-input"
                type="text"
                value={financialLoss}
                onChange={(e) => setFinancialLoss(e.target.value)}
                placeholder="e.g. $142,500.00 USD"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Evidence Documents for Version {nextVersionNumber}.0
              </label>
              <span className="text-[10px] text-slate-500">{attachments.length} files attached</span>
            </div>

            <div className="border border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-3 bg-slate-950/40 text-center">
              <input
                id="amend-file-upload"
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="amend-file-upload"
                className="cursor-pointer flex items-center justify-center gap-2 text-xs text-amber-400 hover:underline font-medium"
              >
                <Upload className="w-4 h-4" />
                <span>Add additional evidence files or logs</span>
              </label>
            </div>

            {isHashingFiles && (
              <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Hashing attached files...</span>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate text-slate-200">{att.fileName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({att.fileSize})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cryptographic Proof Chaining Preview */}
          <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-amber-400 text-[11px] font-bold">
              <span>CRYPTOGRAPHIC CHAIN LINK</span>
              <span>SHA-256</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>
                <span className="text-slate-500">Parent Version Seal:</span>{' '}
                <span className="text-slate-300">{currentVersion?.sha256Seal.slice(0, 28)}...</span>
              </div>
              <div>
                <span className="text-slate-500">New v{nextVersionNumber}.0 Seal:</span>{' '}
                <span className="text-amber-300 break-all">{previewSeal || 'Calculating...'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              id="cancel-amend-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-amend-btn"
              disabled={isSubmitting || !statement.trim()}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Signing Amendment...</span>
                </>
              ) : (
                <>
                  <GitBranch className="w-4 h-4" />
                  <span>Commit & Seal Version {nextVersionNumber}.0</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
