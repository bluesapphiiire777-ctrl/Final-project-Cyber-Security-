import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HardDrive, CheckCircle, AlertCircle, RefreshCw, Key, ShieldCheck, ExternalLink, LogOut, UploadCloud, ShieldAlert, FolderCheck } from 'lucide-react';
import { useStore } from '../../store';
import { 
  requestGoogleDriveAccessToken, 
  getSavedGoogleDriveToken, 
  disconnectGoogleDriveToken,
  uploadDirectToGoogleDrive 
} from '../../lib/googleDriveClient';

export const PersonalDriveConnectBanner: React.FC = () => {
  const { 
    currentUser, 
    evidence, 
    googleDriveConnected, 
    googleDriveAccessToken, 
    googleDriveUserEmail, 
    setGoogleDriveAccessToken,
    updateEvidenceDriveUrl,
    setNotification
  } = useStore();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgressMsg, setSyncProgressMsg] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [customToken, setCustomToken] = useState('');

  const userEmail = currentUser?.email || googleDriveUserEmail || 'bluesapphiiire777@gmail.com';

  // Restore saved token on mount
  useEffect(() => {
    if (!googleDriveAccessToken) {
      const saved = getSavedGoogleDriveToken();
      if (saved && saved.token) {
        setGoogleDriveAccessToken(saved.token, saved.email);
      }
    }
  }, [googleDriveAccessToken, setGoogleDriveAccessToken]);

  const unsyncedCount = evidence.filter(e => !e.isDriveSynced || e.driveUrl?.includes('/api/evidence/raw/')).length;

  const handleConnectDrive = () => {
    setIsConnecting(true);
    requestGoogleDriveAccessToken(
      (token, email) => {
        setIsConnecting(false);
        setGoogleDriveAccessToken(token, email || userEmail);
        setNotification(`🟢 GOOGLE DRIVE CONNECTED & OAUTH GRANTED: ${email || userEmail}`);
      },
      (err) => {
        setIsConnecting(false);
        console.warn('Drive connection error:', err);
        setNotification(`⚠️ GOOGLE OAUTH POPUP CANCELLED OR BLOCKED: ${err.message || 'Please enable popups'}`);
      },
      { prompt: 'consent' }
    );
  };

  const handleSaveCustomToken = () => {
    if (!customToken.trim()) return;
    setGoogleDriveAccessToken(customToken.trim(), userEmail);
    setShowTokenInput(false);
    setCustomToken('');
    setNotification(`🟢 GOOGLE DRIVE OAUTH TOKEN APPLIED FOR: ${userEmail}`);
  };

  const handleDisconnectDrive = () => {
    disconnectGoogleDriveToken();
    setGoogleDriveAccessToken(null, null);
    setNotification('🔴 DISCONNECTED FROM GOOGLE DRIVE');
  };

  const handleSyncAllUnsynced = async () => {
    let token = googleDriveAccessToken;

    if (!token) {
      // Prompt OAuth flow first
      setIsConnecting(true);
      requestGoogleDriveAccessToken(
        async (acquiredToken, email) => {
          setIsConnecting(false);
          setGoogleDriveAccessToken(acquiredToken, email || userEmail);
          await startSyncingFiles(acquiredToken, email || userEmail);
        },
        (err) => {
          setIsConnecting(false);
          setNotification(`⚠️ OAUTH AUTHORIZATION REQUIRED: ${err.message}`);
        },
        { prompt: 'consent' }
      );
      return;
    }

    await startSyncingFiles(token, userEmail);
  };

  const startSyncingFiles = async (token: string, email: string) => {
    const unsyncedItems = evidence.filter(e => !e.isDriveSynced || e.driveUrl?.includes('/api/evidence/raw/'));
    if (unsyncedItems.length === 0) {
      setNotification('✅ ALL EVIDENCE IS ALREADY SYNCED TO YOUR GOOGLE DRIVE!');
      return;
    }

    setIsSyncingAll(true);
    let syncedSuccessCount = 0;

    for (let i = 0; i < unsyncedItems.length; i++) {
      const ev = unsyncedItems[i];
      setSyncProgressMsg(`Uploading ${ev.title} (${i + 1}/${unsyncedItems.length})...`);

      try {
        // Direct Client-Side Google Drive Upload
        const directResult = await uploadDirectToGoogleDrive({
          accessToken: token,
          userEmail: email,
          caseId: ev.caseId || 'case-001',
          fileName: ev.title,
          mimeType: ev.type,
          fileDataUrlOrBuffer: ev.fileDataUrl || ev.imageUrl || ev.content || '',
          sha256Hash: ev.sha256Hash,
          fileSize: ev.size,
        });

        if (directResult.fileId) {
          updateEvidenceDriveUrl(ev.id, directResult.driveUrl, directResult.fileId, true);
          syncedSuccessCount++;

          // Also notify backend server
          fetch('/api/evidence/sync-drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              evidenceId: ev.id,
              userEmail: email,
              driveAccessToken: token,
            })
          }).catch(() => {});
        }
      } catch (e: any) {
        console.error(`Direct Drive sync error for ${ev.id}:`, e);
        // Fallback to server sync
        try {
          const res = await fetch('/api/evidence/sync-drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              evidenceId: ev.id,
              userEmail: email,
              driveAccessToken: token,
            })
          });
          const data = await res.json();
          if (res.ok && data.driveUrl) {
            updateEvidenceDriveUrl(ev.id, data.driveUrl, data.driveFileId, true);
            syncedSuccessCount++;
          }
        } catch (serverErr) {
          console.warn('Server fallback sync error:', serverErr);
        }
      }
    }

    setIsSyncingAll(false);
    setSyncProgressMsg('');
    setNotification(`⚡ SYNC COMPLETE: ${syncedSuccessCount} EVIDENCE FILES STORED DIRECTLY IN GOOGLE DRIVE (${email})`);
  };

  return (
    <div className="bg-[#0F172A] border border-amber-500/30 rounded-2xl p-5 shadow-xl font-mono text-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            googleDriveConnected ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
          }`}>
            <HardDrive size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">PERSONAL GOOGLE DRIVE VAULT</h3>
              {googleDriveConnected ? (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-md text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle size={10} /> CONNECTED &amp; ACTIVE
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-md text-[10px] font-bold">
                  NOT CONNECTED
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {googleDriveConnected 
                ? `Account: ${userEmail} • Vault: FIP_Evidence_Vault/User_${userEmail.split('@')[0]}`
                : 'Connect your Google Drive account to save uploaded raw files & SHA-256 seals directly into your Drive.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {googleDriveConnected ? (
            <>
              <button
                onClick={handleSyncAllUnsynced}
                disabled={isSyncingAll}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg"
              >
                {isSyncingAll ? <RefreshCw size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                <span>{isSyncingAll ? (syncProgressMsg || 'SYNCING...') : `SYNC TO GOOGLE DRIVE ${unsyncedCount > 0 ? `(${unsyncedCount})` : ''}`}</span>
              </button>
              <a
                href="https://drive.google.com/drive/folders"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-white/10 flex items-center gap-1.5"
                title="Open Google Drive Web App"
              >
                <FolderCheck size={14} className="text-emerald-400" />
                <span className="text-[10px] font-bold uppercase">OPEN DRIVE</span>
              </a>
              <button
                onClick={handleDisconnectDrive}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-xl transition-colors border border-white/10"
                title="Disconnect Google Drive"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleConnectDrive}
                disabled={isConnecting}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 border border-slate-300"
              >
                {isConnecting ? (
                  <RefreshCw size={14} className="animate-spin text-slate-700" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                )}
                <span>{isConnecting ? 'AUTHORIZING...' : 'Sign in with Google'}</span>
              </button>
              <button
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-white/10 text-[10px] font-bold flex items-center gap-1"
                title="Enter OAuth Access Token"
              >
                <Key size={14} />
                <span className="hidden sm:inline">TOKEN / KEY</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual OAuth Token Input Panel (Optional Advanced Option) */}
      <AnimatePresence>
        {showTokenInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-black/60 border border-amber-500/30 rounded-xl space-y-2"
          >
            <span className="text-[10px] text-amber-400 font-bold uppercase block">ADVANCED GOOGLE DRIVE OAUTH TOKEN AUTHORIZATION:</span>
            <div className="flex gap-2">
              <input
                type="password"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="Paste OAuth2 Access Token (ya29...)"
                className="flex-1 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white outline-none focus:border-amber-500 font-mono"
              />
              <button
                onClick={handleSaveCustomToken}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg uppercase"
              >
                AUTHORIZE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drive Vault Status Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
        <div className="p-2.5 bg-slate-900/80 border border-white/5 rounded-xl space-y-1">
          <span className="text-slate-500 text-[10px] font-bold uppercase block">TARGET DIRECTORY IN DRIVE</span>
          <p className="text-amber-300 font-bold truncate">FIP_Evidence_Vault/User_{userEmail.split('@')[0]}</p>
        </div>
        <div className="p-2.5 bg-slate-900/80 border border-white/5 rounded-xl space-y-1">
          <span className="text-slate-500 text-[10px] font-bold uppercase block">UNFILTERED RAW STORAGE</span>
          <p className="text-emerald-400 font-bold">100% Original Format Stream</p>
        </div>
        <div className="p-2.5 bg-slate-900/80 border border-white/5 rounded-xl space-y-1">
          <span className="text-slate-500 text-[10px] font-bold uppercase block">DIGITAL SHA-256 SEALS</span>
          <p className="text-slate-300 font-bold">Dual Format .sha256-seal.txt</p>
        </div>
      </div>
    </div>
  );
};
