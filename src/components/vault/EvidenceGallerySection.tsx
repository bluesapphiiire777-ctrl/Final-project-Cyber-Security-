import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  FileText, 
  Image as ImageIcon, 
  HardDrive, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  Clock, 
  Hash, 
  Lock, 
  X, 
  FileCode, 
  Download,
  Calendar,
  UserCheck,
  Zap,
  Folder,
  Tag,
  Film,
  Music,
  Database,
  GitCommit
} from 'lucide-react';
import { useStore } from '../../store';
import { Evidence } from '../../types';
import { MongoDbInspectorModal } from './MongoDbInspectorModal';
import { PersonalDriveConnectBanner } from './PersonalDriveConnectBanner';
import { UnfilteredRawViewerModal } from './UnfilteredRawViewerModal';

interface EvidenceGallerySectionProps {
  onOpenProofModal: (ev: Evidence) => void;
  onOpenCloudStorage?: () => void;
  filterComplaintId?: string | null;
  onClearComplaintFilter?: () => void;
  onSelectComplaint?: (complaintId: string) => void;
}

export const EvidenceGallerySection: React.FC<EvidenceGallerySectionProps> = ({
  onOpenProofModal,
  onOpenCloudStorage,
  filterComplaintId,
  onClearComplaintFilter,
  onSelectComplaint,
}) => {
  const { evidence, currentUser, selectedUserIdFilter, setSelectedUserIdFilter, accounts, complaints } = useStore();
  const isSeniorLead = 
    currentUser?.role === 'CHIEF_INVESTIGATOR' || 
    currentUser?.email?.toLowerCase().includes('bluesapph') || 
    currentUser?.badgeId === 'FIPG-3638';

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'IMAGE' | 'DOCUMENT' | 'FORENSIC'>('ALL');
  const [docTypeSubFilter, setDocTypeSubFilter] = useState<'ALL' | 'PDF' | 'EXCEL_CSV' | 'DOCX' | 'LOGS_PCAP' | 'RAW'>('ALL');
  const [userScopeFilter, setUserScopeFilter] = useState<'ALL_ENCLAVE' | 'MY_UPLOADS'>('ALL_ENCLAVE');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST' | 'DRIVE_FOLDERS'>('GRID');
  const [selectedFolderFile, setSelectedFolderFile] = useState<{ ev: Evidence; type: 'ORIGINAL' | 'HASH_SEAL' } | null>(null);
  const [isMongoInspectorOpen, setIsMongoInspectorOpen] = useState(false);
  
  // Selected evidence for full-screen inspection lightbox
  const [activeViewerEvidence, setActiveViewerEvidence] = useState<Evidence | null>(null);
  const [activeModalFormatTab, setActiveModalFormatTab] = useState<'UNFILTERED_RAW' | 'WORM_SEAL'>('UNFILTERED_RAW');
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  const activeComplaintObj = filterComplaintId ? complaints.find(c => c.id === filterComplaintId) : null;

  // Synthesize all evidence: direct evidence store + complaint attachments
  const allEvidenceItems = React.useMemo(() => {
    const combined: Evidence[] = [...evidence];
    const existingIds = new Set(combined.map(e => e.id));
    const existingHashes = new Set(combined.map(e => (e.sha256Hash || '').toLowerCase()));

    complaints.forEach((comp) => {
      comp.versions?.forEach((ver) => {
        ver.attachments?.forEach((att: any, idx: number) => {
          const hash = (att.sha256Hash || '').toLowerCase();
          const docId = att.id || `EVD-ATT-${comp.id}-${ver.versionNumber}-${idx}`;
          if (!existingIds.has(docId) && (!hash || !existingHashes.has(hash))) {
            const dateStr = att.uploadedAt || ver.submittedAt || comp.createdAt;
            const title = att.fileName || att.name || `document_${idx + 1}.bin`;
            const mime = att.mimeType || att.type || (title.endsWith('.pdf') ? 'application/pdf' : 'DOCUMENT');

            combined.push({
              id: docId,
              caseId: comp.id,
              targetRefId: `TRG-${comp.id.replace('CMP-', 'CASE-')}-${(idx + 1).toString().padStart(3, '0')}`,
              digitalSealSignature: `SEAL-WORM-SHA256-${att.sha256Hash || ver.sha256Seal}`,
              title,
              type: mime,
              size: att.fileSize || att.size || '1.20 MB',
              sha256Hash: att.sha256Hash || ver.sha256Seal,
              merkleRoot: ver.merkleRoot || comp.originalSha256Seal,
              chunkCount: 16,
              content: att.fileDataUrl || att.content || `[COMPLAINT ATTACHMENT: ${title} - Incident Case ${comp.id}]`,
              fileDataUrl: att.fileDataUrl || att.content,
              imageUrl: mime.startsWith('image/') ? (att.fileDataUrl || att.content) : '',
              uploadedBy: ver.submittedBy?.userName || comp.complainantName || 'Complainant',
              uploadedByBadge: ver.submittedBy?.userBadge || comp.complainantBadge || 'PUBLIC_USER',
              uploaderId: ver.submittedBy?.userId || comp.complainantId,
              uploaderEmail: ver.submittedBy?.userEmail || comp.complainantEmail,
              createdAt: new Date(dateStr).getTime() || Date.now(),
              depositStatus: 'ANCHORED',
              receiptSent: true,
              isFrozen: false,
              driveUrl: att.driveUrl || `https://drive.google.com`,
              isWormLocked: true,
              commitPrompt: `commit: Attached ${title} to ${comp.title} (v${ver.versionNumber}.0)`,
              commitMessage: `commit: Attached ${title} to ${comp.title} (v${ver.versionNumber}.0)`,
              annotations: [],
            });
            existingIds.add(docId);
            if (hash) existingHashes.add(hash);
          }
        });
      });
    });

    return combined;
  }, [evidence, complaints]);

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const getWormSealText = (ev: Evidence) => {
    const dateStr = new Date(ev.createdAt).toUTCString();
    const targetRef = ev.targetRefId || `TRG-${(ev.caseId || '001').toUpperCase()}-${ev.id.slice(-5)}`;
    const sealSig = ev.digitalSealSignature || `SEAL-WORM-SHA256-${ev.sha256Hash}`;
    const merkle = ev.merkleRoot || `mrk_${ev.sha256Hash.substring(0, 32)}`;

    return `================================================================================
FORENSIC IMMUTABILITY PLATFORM (FIP) - WORM DIGITAL SEAL FILE
================================================================================
TARGET REFERENCE ID : ${targetRef}
ORIGINAL FILE TITLE : ${ev.title}
FILE MIME / TYPE    : ${ev.type}
FILE SIZE           : ${ev.size || 'UNSPECIFIED'}
SHA-256 HASH DIGEST : ${ev.sha256Hash}
MERKLE TREE ROOT    : ${merkle}
DEPOSIT TIMESTAMPT  : ${dateStr}
UPLOADER AGENT      : ${ev.uploadedBy} (${ev.uploadedByBadge || 'FIP-8841-INV'})
WORM STORAGE LOCK   : ACTIVE (WRITE-ONCE-READ-MANY READ-ONLY IMMUTABLE)
DIGITAL SEAL SIG    : ${sealSig}
================================================================================
VERIFICATION SUMMARY:
This artifact is cryptographically sealed in the FIP Vault. Bit-for-bit checksums
guarantee 100% data integrity against tampering or unauthorized modification.
================================================================================`;
  };

  const handleDownloadRawFile = (ev: Evidence) => {
    const dataUrl = ev.fileDataUrl || ev.imageUrl;
    if (dataUrl && dataUrl.startsWith('data:')) {
      try {
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : (ev.type || 'application/octet-stream');
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = ev.title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        return;
      } catch (e) {
        console.error('Blob download conversion error:', e);
      }
    }

    if (dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = ev.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (ev.content) {
      const blob = new Blob([ev.content], { type: ev.type || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ev.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  };

  const handleDownloadWormSealFile = (ev: Evidence) => {
    const sealText = getWormSealText(ev);
    const blob = new Blob([sealText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ev.title}.sha256-seal.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to categorize file type
  const getFileCategory = (typeStr: string = '', titleStr: string = '', imageUrl: string = '') => {
    const combined = (typeStr + ' ' + titleStr + ' ' + imageUrl).toLowerCase();
    if (combined.includes('image') || combined.includes('photo') || combined.includes('cctv') || combined.includes('png') || combined.includes('jpg') || combined.includes('jpeg') || combined.includes('gif') || combined.includes('webp') || combined.includes('svg') || Boolean(imageUrl)) {
      return 'IMAGE';
    }
    if (
      combined.includes('pdf') || 
      combined.includes('doc') || 
      combined.includes('docx') || 
      combined.includes('xls') || 
      combined.includes('xlsx') || 
      combined.includes('csv') || 
      combined.includes('txt') || 
      combined.includes('log') || 
      combined.includes('json') || 
      combined.includes('xml') || 
      combined.includes('document')
    ) {
      return 'DOCUMENT';
    }
    return 'FORENSIC';
  };

  // Helper for sub-document type matching
  const matchesDocTypeSubFilter = (ev: Evidence, subFilter: typeof docTypeSubFilter) => {
    if (subFilter === 'ALL') return true;
    const combined = (ev.title + ' ' + ev.type).toLowerCase();
    if (subFilter === 'PDF') return combined.includes('pdf') || ev.title.endsWith('.pdf');
    if (subFilter === 'EXCEL_CSV') return combined.includes('xls') || combined.includes('csv') || combined.includes('spreadsheet');
    if (subFilter === 'DOCX') return combined.includes('doc') || combined.includes('word');
    if (subFilter === 'LOGS_PCAP') return combined.includes('log') || combined.includes('pcap') || combined.includes('tcpdump') || combined.includes('packet');
    if (subFilter === 'RAW') return combined.includes('raw') || combined.includes('bin') || combined.includes('dump') || combined.includes('core');
    return true;
  };

  const tryExtractRawContent = (ev: Evidence): string => {
    if (ev.content && ev.content.length > 0 && !ev.content.includes('[Binary Payload]')) {
      return ev.content;
    }
    const dataUrl = ev.fileDataUrl || ev.imageUrl;
    if (dataUrl && dataUrl.startsWith('data:')) {
      try {
        const parts = dataUrl.split(',');
        if (parts.length === 2) {
          const isBase64 = parts[0].includes('base64');
          const mime = parts[0].toLowerCase();
          if (isBase64 && (mime.includes('text') || mime.includes('json') || mime.includes('javascript') || mime.includes('xml') || mime.includes('csv') || mime.includes('html') || mime.includes('log') || mime.includes('octet-stream'))) {
            const decoded = atob(parts[1]);
            if (decoded && decoded.length > 0) return decoded;
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return ev.content || `[UNFILTERED RAW FORENSIC PAYLOAD - 100% ORIGINAL CAPTURE]
FILE NAME : ${ev.title}
FILE TYPE : ${ev.type}
FILE SIZE : ${ev.size || '3.40 MB'}
SHA256    : ${ev.sha256Hash}
MERKLE    : ${ev.merkleRoot || 'mrk_' + ev.sha256Hash.slice(0, 32)}
STATUS    : UNFILTERED RAW STREAM LOCKED IN WORM ENCLAVE`;
  };

  // Helper to render card format preview
  const renderFormatCardPreview = (ev: Evidence) => {
    const title = ev.title.toLowerCase();
    const type = (ev.type || '').toLowerCase();
    const dataUrl = ev.fileDataUrl || ev.imageUrl;
    const isImage = type.startsWith('image/') || type.includes('image') || type.includes('photo') || type.includes('cctv') || title.match(/\.(jpg|jpeg|png|gif|webp|svg)$/) || Boolean(ev.imageUrl);

    if (isImage && dataUrl) {
      return (
        <img 
          src={dataUrl} 
          alt={ev.title} 
          className="w-full h-36 object-cover rounded-lg group-hover/preview:scale-105 transition-transform duration-300" 
        />
      );
    }

    if (type.startsWith('video/') || title.match(/\.(mp4|webm|mov|m4v)$/)) {
      return dataUrl ? (
        <video 
          src={dataUrl} 
          className="w-full h-36 object-cover rounded-lg" 
          muted 
        />
      ) : (
        <div className="text-center p-3 space-y-1">
          <Film size={28} className="mx-auto text-amber-400" />
          <span className="text-[10px] text-zinc-300 font-bold block">VIDEO FORMAT ({ev.size || 'MP4'})</span>
        </div>
      );
    }

    if (type.startsWith('audio/') || title.match(/\.(mp3|wav|ogg|m4a|flac)$/)) {
      return (
        <div className="w-full p-2 bg-black/60 rounded-lg text-center space-y-1">
          <Music size={22} className="mx-auto text-amber-400" />
          <span className="text-[10px] text-amber-300 font-bold block truncate">{ev.title}</span>
          {dataUrl ? (
            <audio controls src={dataUrl} className="w-full h-7 max-w-full" />
          ) : (
            <span className="text-[9px] text-zinc-500">Audio Payload</span>
          )}
        </div>
      );
    }

    if (type.includes('pdf') || title.endsWith('.pdf')) {
      return (
        <div className="w-full h-36 bg-[#121419] rounded-lg p-3 border border-red-500/30 flex flex-col items-center justify-center space-y-1.5">
          <FileText size={32} className="text-red-400 animate-pulse" />
          <div className="text-center">
            <span className="text-xs font-bold text-white block">PDF DOCUMENT FORMAT</span>
            <span className="text-[10px] text-zinc-400 font-mono">{ev.size || 'PDF'}</span>
          </div>
        </div>
      );
    }

    if (title.endsWith('.docx') || title.endsWith('.doc') || type.includes('word')) {
      return (
        <div className="w-full h-36 bg-[#121419] rounded-lg p-3 border border-blue-500/30 flex flex-col items-center justify-center space-y-1.5">
          <FileText size={32} className="text-blue-400" />
          <div className="text-center">
            <span className="text-xs font-bold text-white block">WORD DOCUMENT</span>
            <span className="text-[10px] text-blue-400 font-mono">{ev.size || 'DOCX'}</span>
          </div>
        </div>
      );
    }

    if (title.endsWith('.xlsx') || title.endsWith('.xls') || type.includes('spreadsheet') || type.includes('excel')) {
      return (
        <div className="w-full h-36 bg-[#121419] rounded-lg p-3 border border-emerald-500/30 flex flex-col items-center justify-center space-y-1.5">
          <Grid size={32} className="text-emerald-400" />
          <div className="text-center">
            <span className="text-xs font-bold text-white block">EXCEL SPREADSHEET</span>
            <span className="text-[10px] text-emerald-400 font-mono">{ev.size || 'XLSX'}</span>
          </div>
        </div>
      );
    }

    if (title.match(/\.(zip|rar|7z|tar|gz)$/) || type.includes('zip') || type.includes('compressed')) {
      return (
        <div className="w-full h-36 bg-[#121419] rounded-lg p-3 border border-amber-500/30 flex flex-col items-center justify-center space-y-1.5">
          <Folder size={32} className="text-amber-400" />
          <div className="text-center">
            <span className="text-xs font-bold text-white block">ZIP ARCHIVE FORMAT</span>
            <span className="text-[10px] text-amber-400 font-mono">{ev.size || 'ZIP'}</span>
          </div>
        </div>
      );
    }

    const rawText = tryExtractRawContent(ev);
    if (rawText && rawText.length > 0) {
      return (
        <div className="w-full h-36 overflow-hidden p-2 text-[10px] text-emerald-400 font-mono bg-black/60 rounded-lg">
          <div className="text-zinc-500 text-[9px] mb-1 flex items-center justify-between border-b border-zinc-800 pb-1">
            <span>RAW UNFILTERED CONTENT</span>
            <span>{ev.size || 'TEXT'}</span>
          </div>
          <pre className="whitespace-pre-wrap break-all opacity-80 leading-relaxed font-mono">
            {rawText.slice(0, 240)}...
          </pre>
        </div>
      );
    }

    return (
      <div className="text-center p-4 space-y-2">
        <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <HardDrive size={24} />
        </div>
        <div className="text-[11px] text-zinc-400 font-mono font-bold uppercase">{ev.type}</div>
        <div className="text-[10px] text-zinc-500">{ev.size || 'Binary Payload'}</div>
      </div>
    );
  };

  // Helper to render full modal format viewer
  const renderModalFormatViewer = (ev: Evidence) => {
    const title = ev.title.toLowerCase();
    const type = (ev.type || '').toLowerCase();
    const dataUrl = ev.fileDataUrl || ev.imageUrl;
    const isImage = type.startsWith('image/') || type.includes('image') || type.includes('photo') || type.includes('cctv') || title.match(/\.(jpg|jpeg|png|gif|webp|svg)$/) || Boolean(ev.imageUrl);

    // 1. IMAGE FORMAT
    if (isImage && dataUrl) {
      return (
        <div className="space-y-4 text-center">
          <div className="p-2 bg-black rounded-2xl border border-zinc-800 shadow-2xl inline-block max-w-full">
            <img 
              src={dataUrl} 
              alt={ev.title} 
              className="max-h-[400px] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
          <div className="flex items-center justify-center gap-4 text-xs font-mono text-zinc-400">
            <span>High-Resolution Original Image</span>
            <span>&bull;</span>
            <button
              onClick={() => handleDownloadRawFile(ev)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} />
              <span>Download Original Image ({ev.size})</span>
            </button>
          </div>
        </div>
      );
    }

    // 2. PDF DOCUMENT FORMAT
    if (type.includes('pdf') || title.endsWith('.pdf')) {
      return (
        <div className="w-full space-y-4">
          {dataUrl ? (
            <div className="space-y-3">
              <object
                data={dataUrl}
                type="application/pdf"
                className="w-full h-[420px] rounded-xl border border-zinc-800 shadow-xl bg-white"
              >
                <iframe 
                  src={dataUrl} 
                  title={ev.title} 
                  className="w-full h-[420px] rounded-xl"
                />
              </object>
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span>PDF Document Stream Ready</span>
                <button
                  onClick={() => handleDownloadRawFile(ev)}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <Download size={14} />
                  <span>Download Original PDF File ({ev.size || 'PDF'})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-black/80 rounded-2xl border border-red-500/30 space-y-4">
              <FileText size={48} className="mx-auto text-red-400 animate-pulse" />
              <div className="space-y-1">
                <div className="text-white font-bold text-base">PDF DOCUMENT FORMAT</div>
                <p className="text-zinc-400 text-xs max-w-md mx-auto font-mono">
                  Stored as-is in your vault ({ev.size || 'PDF'}).
                </p>
              </div>
              <button
                onClick={() => handleDownloadRawFile(ev)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto transition-all shadow-lg"
              >
                <Download size={15} />
                <span>Download &amp; View PDF File</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    // 3. VIDEO FORMAT
    if (type.startsWith('video/') || title.match(/\.(mp4|webm|mov|m4v)$/)) {
      return (
        <div className="w-full space-y-4 text-center">
          {dataUrl ? (
            <div className="space-y-3">
              <video 
                controls 
                src={dataUrl} 
                className="w-full max-h-[400px] rounded-xl border border-zinc-800 shadow-2xl bg-black"
              />
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span>HTML5 Video Media Stream</span>
                <button
                  onClick={() => handleDownloadRawFile(ev)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <Download size={14} />
                  <span>Download Original Video ({ev.size})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-black/80 rounded-2xl border border-amber-500/30 space-y-3">
              <Film size={48} className="mx-auto text-amber-400" />
              <div className="text-white font-bold text-base">VIDEO RECORDING FORMAT ({ev.size})</div>
              <button
                onClick={() => handleDownloadRawFile(ev)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 mx-auto transition-all"
              >
                <Download size={15} />
                <span>Download Video Payload</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    // 4. AUDIO FORMAT
    if (type.startsWith('audio/') || title.match(/\.(mp3|wav|ogg|m4a|flac)$/)) {
      return (
        <div className="w-full p-8 bg-black/90 rounded-2xl border border-amber-500/30 space-y-5 text-center">
          <Music size={52} className="mx-auto text-amber-400 animate-pulse" />
          <div className="space-y-1">
            <div className="text-white font-bold text-base">{ev.title}</div>
            <div className="text-zinc-400 text-xs font-mono">Audio Stream &bull; {ev.size}</div>
          </div>
          {dataUrl && (
            <audio controls src={dataUrl} className="w-full max-w-lg mx-auto" />
          )}
          <button
            onClick={() => handleDownloadRawFile(ev)}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 mx-auto transition-all"
          >
            <Download size={15} />
            <span>Download Original Audio Recording ({ev.size})</span>
          </button>
        </div>
      );
    }

    // 5. WORD DOCUMENT FORMAT
    if (title.endsWith('.docx') || title.endsWith('.doc') || type.includes('word')) {
      return (
        <div className="w-full p-8 bg-[#0F131D] rounded-2xl border border-blue-500/40 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
            <FileText size={36} />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">{ev.title}</h4>
            <div className="text-blue-400 font-bold text-xs uppercase tracking-wider">MICROSOFT WORD DOCUMENT FORMAT</div>
            <p className="text-zinc-400 text-xs max-w-md mx-auto font-mono mt-1">
              File Size: <strong className="text-white">{ev.size || 'DOCX'}</strong> &bull; Stored Bit-for-Bit in WORM Enclave
            </p>
          </div>
          <button
            onClick={() => handleDownloadRawFile(ev)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto transition-all shadow-xl shadow-blue-600/20"
          >
            <Download size={16} />
            <span>DOWNLOAD &amp; OPEN WORD DOCUMENT ({ev.title})</span>
          </button>
        </div>
      );
    }

    // 6. EXCEL SPREADSHEET FORMAT
    if (title.endsWith('.xlsx') || title.endsWith('.xls') || type.includes('spreadsheet') || type.includes('excel')) {
      return (
        <div className="w-full p-8 bg-[#0D1A14] rounded-2xl border border-emerald-500/40 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <Grid size={36} />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">{ev.title}</h4>
            <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider">MICROSOFT EXCEL SPREADSHEET FORMAT</div>
            <p className="text-zinc-400 text-xs max-w-md mx-auto font-mono mt-1">
              File Size: <strong className="text-white">{ev.size || 'XLSX'}</strong> &bull; Stored Bit-for-Bit in WORM Enclave
            </p>
          </div>
          <button
            onClick={() => handleDownloadRawFile(ev)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto transition-all shadow-xl shadow-emerald-600/20"
          >
            <Download size={16} />
            <span>DOWNLOAD &amp; OPEN SPREADSHEET ({ev.title})</span>
          </button>
        </div>
      );
    }

    // 7. ZIP ARCHIVE FORMAT
    if (title.match(/\.(zip|rar|7z|tar|gz)$/) || type.includes('zip') || type.includes('compressed')) {
      return (
        <div className="w-full p-8 bg-[#18150D] rounded-2xl border border-amber-500/40 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-600/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Folder size={36} />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">{ev.title}</h4>
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">ZIP ARCHIVE FORMAT</div>
            <p className="text-zinc-400 text-xs max-w-md mx-auto font-mono mt-1">
              File Size: <strong className="text-white">{ev.size || 'ZIP'}</strong> &bull; Compressed Forensic Container
            </p>
          </div>
          <button
            onClick={() => handleDownloadRawFile(ev)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 mx-auto transition-all shadow-xl shadow-amber-500/20"
          >
            <Download size={16} />
            <span>DOWNLOAD &amp; EXTRACT ARCHIVE ({ev.title})</span>
          </button>
        </div>
      );
    }

    // 8. TEXT / CODE / LOGS / JSON / CSV FORMAT
    const rawContent = tryExtractRawContent(ev);
    return (
      <div className="w-full text-emerald-400 bg-black p-4 rounded-xl border border-zinc-800 font-mono overflow-x-auto max-h-[380px] space-y-3">
        <div className="text-zinc-500 text-[10px] border-b border-zinc-800 pb-2 flex items-center justify-between">
          <span>UNFILTERED RAW STREAM ({ev.title})</span>
          <div className="flex items-center gap-3">
            <span>SIZE: {ev.size || '3.40 MB'}</span>
            <button
              onClick={() => handleDownloadRawFile(ev)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold flex items-center gap-1"
            >
              <Download size={11} />
              <span>Download Raw File</span>
            </button>
          </div>
        </div>
        <pre className="whitespace-pre-wrap break-all text-[11px] leading-relaxed select-all">
          {rawContent}
        </pre>
      </div>
    );
  };

  // Filtered evidence items with synthesized complaint attachments & flexible user scope
  const filteredEvidence = allEvidenceItems.filter(ev => {
    // 1. Dual-Storage User Isolation / Scope Filter
    if (!isSeniorLead) {
      if (userScopeFilter === 'MY_UPLOADS') {
        const isMine = 
          (currentUser?.id && ev.uploaderId === currentUser.id) ||
          (currentUser?.email && ev.uploaderEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser?.name && ev.uploadedBy?.toLowerCase() === currentUser.name.toLowerCase()) ||
          (ev.caseId && complaints.some(c => c.id === ev.caseId && (c.complainantId === currentUser?.id || c.complainantEmail?.toLowerCase() === currentUser?.email?.toLowerCase())));
        if (!isMine) return false;
      }
    } else if (selectedUserIdFilter && selectedUserIdFilter !== 'ALL_USERS') {
      // Senior Manager selecting specific user account vault
      const targetAcc = accounts.find(a => a.id === selectedUserIdFilter);
      const isSelectedUser = 
        ev.uploaderId === selectedUserIdFilter ||
        (targetAcc?.email && ev.uploaderEmail?.toLowerCase() === targetAcc.email.toLowerCase()) ||
        (targetAcc?.name && ev.uploadedBy?.toLowerCase() === targetAcc.name.toLowerCase());
      if (!isSelectedUser) return false;
    }

    if (filterComplaintId) {
      const matchesComplaint = 
        ev.caseId === filterComplaintId || 
        (ev.targetRefId && ev.targetRefId.toLowerCase().includes(filterComplaintId.toLowerCase())) ||
        (activeComplaintObj && ev.caseId === activeComplaintObj.id);
      if (!matchesComplaint) return false;
    }

    const title = ev.title || '';
    const hash = ev.sha256Hash || '';
    const targetRef = ev.targetRefId || ev.caseId || '';
    const uploader = ev.uploadedBy || '';
    const query = searchTerm.toLowerCase();

    const matchesSearch = 
      title.toLowerCase().includes(query) ||
      hash.toLowerCase().includes(query) ||
      targetRef.toLowerCase().includes(query) ||
      uploader.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // Check Sub-filter for specific document types
    if (!matchesDocTypeSubFilter(ev, docTypeSubFilter)) {
      return false;
    }

    if (categoryFilter === 'ALL') return true;
    const cat = getFileCategory(ev.type, ev.title, ev.imageUrl);
    return cat === categoryFilter;
  });

  return (
    <div id="evidence-gallery-vault-section" className="w-full bg-[#151922] rounded-3xl p-6 sm:p-8 border border-slate-700/70 shadow-2xl space-y-6 font-mono text-zinc-300 relative overflow-hidden">
      
      {/* Top Background Glow Effect */}
      <div className="absolute top-0 left-1/3 w-96 h-40 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* =========================================================================
          SECTION HEADER: PART 03 // EVIDENCE GALLERY & ACTUAL VAULT STORE
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-xs text-blue-400 font-bold tracking-wider">
            <span className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xs">
              03
            </span>
            <span>PART 03 &bull; EVIDENCE GALLERY &amp; ACTUAL VAULT STORE</span>
            <span className="text-zinc-600 font-normal">/</span>
            <span className="text-zinc-400 font-normal">{allEvidenceItems.length} Immutable Vault Documents &amp; Assets</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-3">
            <span>Evidence Gallery &amp; Actual Vault Store</span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs rounded-full font-mono font-bold">
              {filteredEvidence.length} Available Documents
            </span>
          </h2>

          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Inspect all case files, uploaded incident documents, spreadsheets, PDFs, network dumps, live SHA-256 hashes &amp; WORM Digital Seals.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsMongoInspectorOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Database size={14} className="text-emerald-400" />
            <span>RAW STORAGE INSPECTOR</span>
          </button>

          {onOpenCloudStorage && (
            <button
              onClick={onOpenCloudStorage}
              className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <HardDrive size={14} className="text-blue-400" />
              <span>DRIVE WORM VAULT</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER ACTIVE COMPLAINT BANNER */}
      {filterComplaintId && (
        <div className="p-3 bg-blue-950/40 border border-blue-500/50 rounded-2xl flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-blue-300">
            <Tag size={14} className="text-blue-400" />
            <span>FILTERED BY CASE DOSSIER:</span>
            <strong className="text-white bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700">
              {filterComplaintId} {activeComplaintObj ? `(${activeComplaintObj.title})` : ''}
            </strong>
            <span className="text-zinc-400 text-[11px]">({filteredEvidence.length} assets matched)</span>
          </div>

          {onClearComplaintFilter && (
            <button
              onClick={onClearComplaintFilter}
              className="px-3 py-1 bg-blue-800/60 hover:bg-blue-700 text-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <X size={12} />
              <span>Show All Vault Items</span>
            </button>
          )}
        </div>
      )}

      {/* Personal Google Drive Connection & Sync Banner */}
      <PersonalDriveConnectBanner />

      {/* DUAL STORAGE LOCATION BANNER */}
      <div className="p-4 bg-[#141822] rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database size={20} />
          </div>
          <div>
            <div className="text-white font-bold text-sm flex items-center gap-2">
              <span>UNFILTERED RAW STORAGE &amp; GOOGLE DRIVE WORM DUAL-LOCATION ACTIVE</span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              • <strong className="text-emerald-400">Place 1 (Backend MongoDB):</strong> Unfiltered raw original documents/file payload stream &bull; • <strong className="text-amber-400">Place 2 (Google Drive):</strong> WORM <code className="text-amber-300">.sha256-seal.txt</code> read-only cryptographic seal.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMongoInspectorOpen(true)}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-lg"
        >
          <Database size={14} />
          <span>Open MongoDB Explorer</span>
        </button>
      </div>

      {/* MODULE 1: SENIOR MANAGER GLOBAL OVERSIGHT OR CITIZEN USER VAULT SCOPE SWITCHER */}
      {isSeniorLead ? (
        <div className="p-4 bg-[#10131B] border border-amber-500/30 rounded-2xl space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-amber-500 text-black font-black text-[10px] rounded uppercase tracking-wider">
                SENIOR LEAD OVERLAY
              </span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>GLOBAL OVERSIGHT ACCOUNT SELECTOR</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-amber-400 font-mono">{currentUser?.email || 'bluesapphiiire777@gmail.com'}</span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedUserIdFilter(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  !selectedUserIdFilter || selectedUserIdFilter === 'ALL_USERS'
                    ? 'bg-amber-500 text-black font-black shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                <Zap size={13} />
                <span>MASTER STREAM (ALL ACCOUNTS)</span>
              </button>

              <select
                value={selectedUserIdFilter || 'ALL_USERS'}
                onChange={(e) => setSelectedUserIdFilter(e.target.value === 'ALL_USERS' ? null : e.target.value)}
                className="bg-[#090b0e] border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold outline-none focus:border-amber-400"
              >
                <option value="ALL_USERS">-- Filter Vault By User Account --</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.email}) - Role: {acc.role}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {selectedUserIdFilter && selectedUserIdFilter !== 'ALL_USERS' ? (
              <span className="text-amber-300">
                🔍 Filter Active: Inspecting isolated vault for user ID: <strong className="text-white">{selectedUserIdFilter}</strong> ({accounts.find(a => a.id === selectedUserIdFilter)?.email}). Displaying {filteredEvidence.length} files.
              </span>
            ) : (
              <span className="text-emerald-400">
                ⚡ Master Stream Active: Viewing combined real-time chronological vault feed across all accounts ({allEvidenceItems.length} total files).
              </span>
            )}
          </p>
        </div>
      ) : (
        <div className="p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <Lock size={16} className="text-amber-400 shrink-0" />
            <span className="text-slate-200">
              Authenticated Citizen User: <strong className="text-amber-300">{currentUser?.email || 'User Enclave'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUserScopeFilter('ALL_ENCLAVE')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                userScopeFilter === 'ALL_ENCLAVE'
                  ? 'bg-amber-500 text-black shadow-md font-black'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              All Case &amp; Vault Documents ({allEvidenceItems.length})
            </button>
            <button
              onClick={() => setUserScopeFilter('MY_UPLOADS')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                userScopeFilter === 'MY_UPLOADS'
                  ? 'bg-amber-500 text-black shadow-md font-black'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              My Uploads Only
            </button>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col gap-3 bg-[#181A20] p-4 rounded-2xl border border-zinc-800">
        
        {/* Row 1: Category Tabs & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => { setCategoryFilter('ALL'); setDocTypeSubFilter('ALL'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === 'ALL'
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-[#1F232D] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              ALL ASSETS ({allEvidenceItems.length})
            </button>
            <button
              onClick={() => { setCategoryFilter('DOCUMENT'); setDocTypeSubFilter('ALL'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                categoryFilter === 'DOCUMENT'
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-[#1F232D] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <FileText size={13} />
              <span>DOCUMENTS &amp; TEXT</span>
            </button>
            <button
              onClick={() => { setCategoryFilter('IMAGE'); setDocTypeSubFilter('ALL'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                categoryFilter === 'IMAGE'
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-[#1F232D] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <ImageIcon size={13} />
              <span>IMAGES &amp; CCTV</span>
            </button>
            <button
              onClick={() => { setCategoryFilter('FORENSIC'); setDocTypeSubFilter('ALL'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                categoryFilter === 'FORENSIC'
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-[#1F232D] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <HardDrive size={13} />
              <span>RAW MEMORY &amp; PCAP</span>
            </button>
          </div>

          {/* Search Input & View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search Title, SHA-256, Target Ref ID..."
                className="w-full bg-[#101216] border border-zinc-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center bg-[#101216] p-1 rounded-xl border border-zinc-800 shrink-0 gap-1">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  viewMode === 'GRID' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid size={14} />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  viewMode === 'LIST' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="List View"
              >
                <List size={14} />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('DRIVE_FOLDERS')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  viewMode === 'DRIVE_FOLDERS' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Drive Vault Folders & Dual Formats"
              >
                <Folder size={14} />
                <span>Drive Folders</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Document Format Specific Sub-filters */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800/80 overflow-x-auto text-[11px]">
          <span className="text-zinc-500 font-bold uppercase text-[10px] shrink-0 mr-1 flex items-center gap-1">
            <Filter size={11} /> Format Filter:
          </span>
          {[
            { key: 'ALL', label: 'All Document Formats' },
            { key: 'PDF', label: '📄 PDF Files' },
            { key: 'EXCEL_CSV', label: '📊 Excel / CSV Spreadsheets' },
            { key: 'DOCX', label: '📝 Word Docs' },
            { key: 'LOGS_PCAP', label: '📡 Network PCAP & Logs' },
            { key: 'RAW', label: '💾 Raw Memory & Binaries' },
          ].map((sub) => (
            <button
              key={sub.key}
              onClick={() => setDocTypeSubFilter(sub.key as any)}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                docTypeSubFilter === sub.key
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-[#12151B] text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* GALLERY GRID / LIST DISPLAY */}
      {filteredEvidence.length === 0 ? (
        <div className="bg-[#181A20] rounded-2xl p-10 text-center border border-dashed border-zinc-800 space-y-3">
          <FileCode size={36} className="mx-auto text-zinc-600" />
          <p className="text-zinc-400 text-sm font-bold">No evidence items match your filter search query.</p>
          <p className="text-xs text-zinc-600">Try clearing your search query or upload a new item using the Evidence Ingestion wizard above.</p>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvidence.map((ev) => {
            const dateStr = new Date(ev.createdAt).toUTCString();
            const targetRef = ev.targetRefId || `TRG-${(ev.caseId || '001').toUpperCase()}-${ev.id.slice(-5)}`;
            const isImage = !!ev.imageUrl || getFileCategory(ev.type, ev.title) === 'IMAGE';
            const digitalSeal = ev.digitalSealSignature || `SEAL-WORM-${ev.sha256Hash.substring(0, 12).toUpperCase()}`;

            return (
              <motion.div
                key={ev.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#181A20] rounded-2xl border border-zinc-800 hover:border-amber-500/50 transition-all p-4 space-y-3 flex flex-col justify-between group shadow-lg"
              >
                {/* Card Top Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <Tag size={10} />
                      <span>{targetRef}</span>
                    </span>

                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck size={10} />
                      <span>WORM SEALED</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm truncate group-hover:text-amber-400 transition-colors" title={ev.title}>
                    {ev.title}
                  </h3>
                </div>

                {/* Actual Content / Format Preview Box */}
                <div className="relative bg-[#0F1115] border border-zinc-800 rounded-xl overflow-hidden min-h-[140px] flex items-center justify-center p-2 group/preview">
                  {renderFormatCardPreview(ev)}

                  {/* Hover Overlay Button to View Full File */}
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center p-3 gap-2">
                    <button
                      onClick={() => setActiveViewerEvidence(ev)}
                      className="px-3 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg hover:bg-amber-400 transition-colors"
                    >
                      <Eye size={14} />
                      <span>View Actual File</span>
                    </button>
                  </div>
                </div>

                {/* Metadata & Timestamps */}
                <div className="space-y-2 font-mono text-[11px]">
                  {/* Date & Time */}
                  <div className="flex items-center justify-between text-zinc-400 bg-black/30 p-2 rounded-lg border border-zinc-800/80">
                    <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <Calendar size={12} />
                      <span>DATE &amp; TIME</span>
                    </span>
                    <span className="text-amber-300 font-bold text-[10px]">{dateStr.replace(' GMT', ' UTC')}</span>
                  </div>

                  {/* SHA-256 Hash Key with Copy Button */}
                  <div className="bg-black/30 p-2 rounded-lg border border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Hash size={11} className="text-amber-400" />
                        <span>SHA-256 HASH KEY:</span>
                      </span>
                      <button
                        onClick={() => handleCopyHash(ev.id, ev.sha256Hash)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px] font-bold"
                      >
                        {copiedHashId === ev.id ? (
                          <>
                            <Check size={11} className="text-emerald-400" />
                            <span className="text-emerald-400">COPIED!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>COPY HASH</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-[10px] text-zinc-300 font-mono break-all line-clamp-1 bg-black/60 p-1 rounded border border-zinc-800/50">
                      {ev.sha256Hash}
                    </div>
                  </div>

                  {/* PERMANENT IMMUTABLE UPLOADER COMMIT PROMPT */}
                  <div className="bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/30 space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-emerald-400 font-bold uppercase">
                      <span className="flex items-center gap-1">
                        <GitCommit size={11} /> IMMUTABLE COMMIT PROMPT:
                      </span>
                      <span className="text-[8px] text-emerald-300 font-mono bg-emerald-500/20 px-1 rounded">WORM LOCKED</span>
                    </div>
                    <div className="text-[10px] text-white font-mono leading-tight italic truncate" title={ev.commitPrompt || ev.commitMessage}>
                      "{ev.commitPrompt || ev.commitMessage || `commit: Forensic upload & WORM seal for ${ev.title}`}"
                    </div>
                  </div>

                  {/* Digital Seal & Depositing Officer */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                    <span className="flex items-center gap-1 text-zinc-500">
                      <UserCheck size={11} className="text-emerald-400" />
                      <span>{ev.uploadedBy}</span>
                    </span>
                    <span className="text-zinc-500 text-[9px] font-mono">{ev.uploadedByBadge || 'FIP-8841-INV'}</span>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                  <button
                    onClick={() => setActiveViewerEvidence(ev)}
                    className="flex-1 py-1.5 bg-[#1F232D] hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye size={13} className="text-amber-400" />
                    <span>View Format</span>
                  </button>

                  <button
                    onClick={() => onOpenProofModal(ev)}
                    className="flex-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck size={13} />
                    <span>Digital Seal</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : viewMode === 'LIST' ? (
        /* COMPACT LIST TABLE VIEW */
        <div className="overflow-x-auto bg-[#181A20] rounded-2xl border border-zinc-800">
          <table className="w-full text-left font-mono text-xs text-zinc-300">
            <thead className="bg-[#121419] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">TARGET REF ID</th>
                <th className="py-3 px-4">EVIDENCE TITLE</th>
                <th className="py-3 px-4">DATE &amp; TIME (UTC)</th>
                <th className="py-3 px-4">SHA-256 HASH KEY</th>
                <th className="py-3 px-4">UPLOADER</th>
                <th className="py-3 px-4 text-center">SEAL &amp; ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredEvidence.map((ev) => {
                const dateStr = new Date(ev.createdAt).toUTCString();
                const targetRef = ev.targetRefId || `TRG-${(ev.caseId || '001').toUpperCase()}-${ev.id.slice(-5)}`;

                return (
                  <tr key={ev.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-amber-400 whitespace-nowrap">
                      {targetRef}
                    </td>
                    <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                      {ev.title}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                      {dateStr.replace(' GMT', '')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-300 bg-black/50 px-2 py-0.5 rounded border border-zinc-800">
                          {ev.sha256Hash.substring(0, 16)}...
                        </span>
                        <button
                          onClick={() => handleCopyHash(ev.id, ev.sha256Hash)}
                          className="text-amber-400 hover:text-amber-300 p-1"
                          title="Copy Full Hash Key"
                        >
                          {copiedHashId === ev.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                      <div>{ev.uploadedBy}</div>
                      <div className="text-[9px] text-zinc-500">{ev.uploadedByBadge || 'FIP-8841-INV'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setActiveViewerEvidence(ev)}
                          className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40"
                          title="View Actual Format"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => onOpenProofModal(ev)}
                          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/40"
                          title="Inspect Digital Seal"
                        >
                          <ShieldCheck size={13} />
                        </button>
                        {ev.driveUrl && (
                          <a
                            href={ev.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg border border-blue-500/40"
                            title="Open Google Drive Storage"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GOOGLE DRIVE VAULT FOLDERS & DUAL FORMATS TREE EXPLORER */
        <div className="bg-[#181A20] rounded-2xl border border-zinc-800 p-5 space-y-5 font-mono">
          
          {/* Main User Drive Folder Header */}
          <div className="bg-[#101216] border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xl shrink-0">
                <Folder size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">
                    FIP_Vault_{currentUser?.email ? currentUser.email.replace(/[^a-zA-Z0-9]/g, '_') : 'bluesapphiiire777_gmail_com'}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded font-bold">
                    WORM LOCKED VAULT
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Official Google Drive Cloud Enclave Directory &bull; Dual-Format Ingestion Active
                </p>
              </div>
            </div>

            <a
              href="https://drive.google.com/drive/u/0/my-drive"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors self-start sm:self-center"
            >
              <ExternalLink size={14} />
              <span>Open in Google Drive</span>
            </a>
          </div>

          {/* Folder Tree List */}
          <div className="space-y-4">
            {filteredEvidence.map((ev) => {
              const dateStr = new Date(ev.createdAt).toUTCString();
              const targetRef = ev.targetRefId || `TRG-${(ev.caseId || '001').toUpperCase()}-${ev.id.slice(-5)}`;
              const hashFileName = `${ev.title}.sha256-seal.txt`;

              return (
                <div key={ev.id} className="bg-[#101216]/80 border border-zinc-800 rounded-xl p-4 space-y-3 hover:border-amber-500/40 transition-colors">
                  
                  {/* Folder Row Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Folder size={16} className="text-amber-400 shrink-0" />
                      <span className="text-amber-300 font-bold text-xs">{targetRef}</span>
                      <span className="text-zinc-500 text-[10px]">&bull;</span>
                      <span className="text-zinc-300 text-xs font-bold truncate max-w-xs">{ev.title}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <Calendar size={12} className="text-zinc-500" />
                      <span>{dateStr.replace(' GMT', ' UTC')}</span>
                    </div>
                  </div>

                  {/* Dual Formats Files Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    
                    {/* FORMAT 1: HASH KEY SEAL FILE */}
                    <div className="bg-black/60 border border-emerald-500/30 rounded-xl p-3 space-y-2 hover:border-emerald-500/60 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                          <Hash size={14} />
                          <span className="truncate max-w-[180px] sm:max-w-xs">{hashFileName}</span>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold">
                          FORMAT 1: HASH SEAL
                        </span>
                      </div>

                      <div className="text-[10px] text-zinc-400 space-y-1">
                        <div>SHA-256 HASH: <code className="text-amber-300">{ev.sha256Hash.substring(0, 24)}...</code></div>
                        <div>DIGITAL SEAL: <code className="text-emerald-400">{ev.digitalSealSignature || 'SEAL-WORM-VERIFIED'}</code></div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-zinc-500">Read-Only WORM Lock</span>
                        <button
                          onClick={() => onOpenProofModal(ev)}
                          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                        >
                          <ShieldCheck size={12} />
                          <span>Inspect Seal File</span>
                        </button>
                      </div>
                    </div>

                    {/* FORMAT 2: ORIGINAL FILE AS-IS */}
                    <div className="bg-black/60 border border-blue-500/30 rounded-xl p-3 space-y-2 hover:border-blue-500/60 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                          <FileText size={14} />
                          <span className="truncate max-w-[180px] sm:max-w-xs">{ev.title}</span>
                        </div>
                        <span className="bg-blue-500/20 text-blue-300 text-[9px] px-1.5 py-0.5 rounded border border-blue-500/40 font-bold">
                          FORMAT 2: ORIGINAL FILE
                        </span>
                      </div>

                      <div className="text-[10px] text-zinc-400 space-y-1">
                        <div>TYPE: <span className="text-zinc-200">{ev.type}</span></div>
                        <div>SIZE: <span className="text-zinc-200">{ev.size || '3.40 MB'}</span></div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-zinc-500">Stored As-Is Payload</span>
                        <button
                          onClick={() => setActiveViewerEvidence(ev)}
                          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>View Actual File</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* =========================================================================
          FULL FORMAT CONTENT LIGHTBOX VIEWER MODAL
          ========================================================================= */}
      <AnimatePresence>
        {activeViewerEvidence && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181A20] border border-amber-500/50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.2)] font-mono"
            >
              {/* Modal Header */}
              <div className="p-5 bg-[#1F232D] border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xl">
                    <Eye size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {activeViewerEvidence.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span>REF: <strong className="text-amber-400">{activeViewerEvidence.targetRefId || activeViewerEvidence.id}</strong></span>
                      <span>&bull;</span>
                      <span>TYPE: <strong className="text-zinc-300">{activeViewerEvidence.type}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveViewerEvidence(null)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                
                {/* Format Toggle Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#101216] p-2 rounded-2xl border border-zinc-800">
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveModalFormatTab('UNFILTERED_RAW')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                        activeModalFormatTab === 'UNFILTERED_RAW'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-[#181A20] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      <FileText size={14} />
                      <span>1. UNFILTERED RAW ORIGINAL FILE</span>
                    </button>

                    <button
                      onClick={() => setActiveModalFormatTab('WORM_SEAL')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                        activeModalFormatTab === 'WORM_SEAL'
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                          : 'bg-[#181A20] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      <ShieldCheck size={14} />
                      <span>2. WORM DIGITAL SEAL FILE (.sha256-seal.txt)</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {activeModalFormatTab === 'UNFILTERED_RAW' ? '100% BIT-FOR-BIT ORIGINAL' : 'IMMUTABLE WORM LOCK'}
                  </span>
                </div>

                {/* Format Media / Content View Box */}
                <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[240px]">
                  {activeModalFormatTab === 'UNFILTERED_RAW' ? (
                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800/80 pb-2">
                        <span className="text-blue-400 font-bold flex items-center gap-1">
                          <Zap size={12} />
                          <span>RAW UNFILTERED FILE FORMAT (AS UPLOADED)</span>
                        </span>
                        <span className="text-zinc-500 font-mono">
                          MIME: {activeViewerEvidence.type} &bull; SIZE: {activeViewerEvidence.size || '3.40 MB'}
                        </span>
                      </div>
                      {renderModalFormatViewer(activeViewerEvidence)}
                    </div>
                  ) : (
                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800/80 pb-2">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck size={12} />
                          <span>WORM READ-ONLY IMMUTABLE DIGITAL SEAL LEDGER</span>
                        </span>
                        <span className="text-emerald-400 font-mono">
                          LOCK: WRITE-ONCE-READ-MANY
                        </span>
                      </div>
                      <div className="bg-black p-4 rounded-xl border border-zinc-800 text-emerald-400 font-mono overflow-x-auto max-h-[320px]">
                        <pre className="whitespace-pre-wrap break-all text-[11px] leading-relaxed select-all">
                          {getWormSealText(activeViewerEvidence)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cryptographic & Forensic Ledger Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Box: Cryptographic Seals */}
                  <div className="bg-[#121419] p-4 rounded-2xl border border-zinc-800 space-y-2">
                    <div className="text-amber-400 font-bold text-xs uppercase flex items-center gap-1.5">
                      <Hash size={14} />
                      <span>CRYPTOGRAPHIC SHA-256 HASH</span>
                    </div>
                    <div className="p-2 bg-black/60 rounded-xl border border-zinc-800 font-mono text-[10px] text-zinc-300 break-all select-all">
                      {activeViewerEvidence.sha256Hash}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">MERKLE ROOT ANCHOR:</span>
                      <span className="text-amber-300 font-mono font-bold">
                        {activeViewerEvidence.merkleRoot || `mrk_${activeViewerEvidence.sha256Hash.substring(0, 16)}`}
                      </span>
                    </div>
                  </div>

                  {/* Right Box: Target Ref & Upload Details */}
                  <div className="bg-[#121419] p-4 rounded-2xl border border-zinc-800 space-y-2">
                    <div className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1.5">
                      <ShieldCheck size={14} />
                      <span>TARGET REFERENCE &amp; WORM DIGITAL SEAL</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">TARGET REF ID:</span>
                        <span className="text-amber-400 font-bold">
                          {activeViewerEvidence.targetRefId || activeViewerEvidence.caseId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">INGEST DATE &amp; TIME:</span>
                        <span className="text-zinc-200">
                          {new Date(activeViewerEvidence.createdAt).toUTCString().replace(' GMT', ' UTC')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">UPLOADER AGENT:</span>
                        <span className="text-zinc-200">{activeViewerEvidence.uploadedBy} ({activeViewerEvidence.uploadedByBadge || 'FIP-8841-INV'})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">WORM PERMISSION:</span>
                        <span className="text-emerald-400 font-bold">READ-ONLY IMMUTABLE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-[#1F232D] border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setActiveViewerEvidence(null);
                    onOpenProofModal(activeViewerEvidence);
                  }}
                  className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 rounded-xl font-bold flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
                >
                  <ShieldCheck size={15} />
                  <span>View Court Proof Certificate</span>
                </button>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  {activeModalFormatTab === 'UNFILTERED_RAW' ? (
                    <button
                      onClick={() => handleDownloadRawFile(activeViewerEvidence)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
                    >
                      <Download size={15} />
                      <span>Download Raw Unfiltered File</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadWormSealFile(activeViewerEvidence)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
                    >
                      <Download size={15} />
                      <span>Download WORM Seal File (.sha256-seal.txt)</span>
                    </button>
                  )}

                  {activeViewerEvidence.driveUrl && (
                    <a
                      href={activeViewerEvidence.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/50 rounded-xl font-bold flex items-center gap-2 transition-all"
                    >
                      <ExternalLink size={15} />
                      <span>Open in Drive</span>
                    </a>
                  )}

                  <button
                    onClick={() => setActiveViewerEvidence(null)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UNFILTERED RAW EVIDENCE VIEWER MODAL */}
      <UnfilteredRawViewerModal
        evidence={activeViewerEvidence}
        onClose={() => setActiveViewerEvidence(null)}
      />

      {/* MONGODB BACKEND RAW DATA INSPECTOR MODAL */}
      <MongoDbInspectorModal
        isOpen={isMongoInspectorOpen}
        onClose={() => setIsMongoInspectorOpen(false)}
      />
    </div>
  );
};
