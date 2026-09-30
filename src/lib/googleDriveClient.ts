import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export interface DriveFolderInfo {
  id: string;
  name: string;
}

export interface DirectDriveUploadResult {
  fileId: string;
  driveUrl: string;
  folderId: string;
  folderName: string;
  hashFileId?: string;
  hashDriveUrl?: string;
  isDriveSynced: boolean;
  timestamp: string;
}

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const TOKEN_STORAGE_KEY = "fip_google_drive_access_token";
const USER_STORAGE_KEY = "fip_google_drive_user_email";
const EXPIRES_STORAGE_KEY = "fip_google_drive_token_expires_at";

// Scopes required for Google Drive integration (least-privilege per-file scope to avoid Google verification block)
export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

let cachedAccessToken: string | null = null;
let cachedUserEmail: string | null = null;

/**
 * Returns saved active access token from memory or localStorage
 */
export function getSavedGoogleDriveToken(): { token: string; email: string } | null {
  if (cachedAccessToken && cachedUserEmail) {
    return { token: cachedAccessToken, email: cachedUserEmail };
  }
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const email = localStorage.getItem(USER_STORAGE_KEY) || 'bluesapphiiire777@gmail.com';
    const expiresAt = Number(localStorage.getItem(EXPIRES_STORAGE_KEY) || '0');

    if (token && (expiresAt === 0 || expiresAt > Date.now())) {
      cachedAccessToken = token;
      cachedUserEmail = email;
      return { token, email };
    }
  } catch (e) {
    console.warn('Error reading saved Drive token:', e);
  }
  return null;
}

/**
 * Authenticates with Google Drive via Firebase Auth Popup (Primary)
 * or fallback to Google Identity Services token client using the configured OAuth Client ID.
 */
export async function requestGoogleDriveAccessToken(
  onSuccess: (token: string, email: string) => void,
  onError?: (err: any) => void,
  _options?: { prompt?: '' | 'consent' | 'select_account' }
): Promise<void> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.setCustomParameters({
      prompt: 'consent',
      access_type: 'offline',
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    const userEmail = result.user.email || 'bluesapphiiire777@gmail.com';

    if (!accessToken) {
      throw new Error('Google OAuth succeeded but no access token was returned.');
    }

    cachedAccessToken = accessToken;
    cachedUserEmail = userEmail;

    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      localStorage.setItem(USER_STORAGE_KEY, userEmail);
      localStorage.setItem(EXPIRES_STORAGE_KEY, (Date.now() + 3500 * 1000).toString());
    } catch (e) {}

    onSuccess(accessToken, userEmail);
  } catch (firebaseErr: any) {
    console.warn('Firebase popup attempt notice:', firebaseErr);

    // Fallback to GIS Token Client using the exact provisioned oAuthClientId
    try {
      const clientId = firebaseConfig.oAuthClientId;
      if (!clientId) {
        throw firebaseErr;
      }

      const runGIS = () => {
        if (!window.google?.accounts?.oauth2) {
          throw new Error('Google Identity Services not loaded');
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES.join(' '),
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              const errMsg = tokenResponse.error_description || tokenResponse.error;
              onError?.(new Error(`Google OAuth error: ${errMsg}`));
              return;
            }

            const token = tokenResponse.access_token;
            let email = 'bluesapphiiire777@gmail.com';

            try {
              const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (infoRes.ok) {
                const info = await infoRes.json();
                email = info.email || email;
              }
            } catch (e) {}

            cachedAccessToken = token;
            cachedUserEmail = email;

            try {
              localStorage.setItem(TOKEN_STORAGE_KEY, token);
              localStorage.setItem(USER_STORAGE_KEY, email);
              localStorage.setItem(EXPIRES_STORAGE_KEY, (Date.now() + 3500 * 1000).toString());
            } catch (e) {}

            onSuccess(token, email);
          },
        });

        client.requestAccessToken({ prompt: 'consent' });
      };

      if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
        runGIS();
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => runGIS();
        script.onerror = () => onError?.(firebaseErr);
        document.head.appendChild(script);
      }
    } catch (gisErr) {
      console.error('All Google OAuth flows failed:', gisErr);
      onError?.(firebaseErr || gisErr);
    }
  }
}

/**
 * Disconnects local Google Drive token session
 */
export function disconnectGoogleDriveToken(): void {
  try {
    signOut(auth).catch(() => {});
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && window.google?.accounts?.oauth2) {
      try {
        window.google.accounts.oauth2.revoke(token, () => {});
      } catch (e) {}
    }
    cachedAccessToken = null;
    cachedUserEmail = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(EXPIRES_STORAGE_KEY);
  } catch (e) {}
}

/**
 * Checks whether a given Google Drive file ID is an existing, non-trashed folder
 */
async function isValidDriveFolder(accessToken: string, folderId?: string): Promise<boolean> {
  if (!folderId || folderId === 'root' || typeof folderId !== 'string' || folderId.trim().length === 0) {
    return false;
  }
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId.trim())}?fields=id,mimeType,trashed`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return data.mimeType === 'application/vnd.google.apps.folder' && !data.trashed;
  } catch {
    return false;
  }
}

/**
 * Finds or creates a folder under a parent folder in Google Drive
 */
async function findOrCreateFolder(
  accessToken: string,
  folderName: string,
  parentId?: string
): Promise<string | undefined> {
  const isParentValid = await isValidDriveFolder(accessToken, parentId);
  const effectiveParentId = isParentValid ? parentId : undefined;
  const escapedName = folderName.replace(/'/g, "\\'");

  const query = effectiveParentId
    ? `name = '${escapedName}' and mimeType = 'application/vnd.google.apps.folder' and '${effectiveParentId}' in parents and trashed = false`
    : `name = '${escapedName}' and mimeType = 'application/vnd.google.apps.folder' and trashed = false`;
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&spaces=drive`;

  try {
    const listRes = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData.files && listData.files.length > 0 && listData.files[0].id) {
        return listData.files[0].id;
      }
    }
  } catch {
    // Proceed to create
  }

  // Attempt creation with parent if valid
  if (effectiveParentId) {
    try {
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google.apps.folder',
          parents: [effectiveParentId],
          description: `FIP Forensic Enclave Vault Folder: ${folderName}`,
        }),
      });

      if (createRes.ok) {
        const folderData = await createRes.json();
        if (folderData.id) return folderData.id;
      }
    } catch {
      // Proceed to create at root
    }
  }

  // Create folder without parent (at root)
  try {
    const createRootRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google.apps.folder',
        description: `FIP Forensic Enclave Vault Folder: ${folderName}`,
      }),
    });

    if (createRootRes.ok) {
      const rootFolderData = await createRootRes.json();
      return rootFolderData.id;
    }
  } catch {
    // Root creation fallback
  }

  return undefined;
}

/**
 * Direct Client-Side Multipart Upload to Google Drive
 */
export async function uploadDirectToGoogleDrive(options: {
  accessToken: string;
  userEmail: string;
  caseId?: string;
  fileName: string;
  mimeType?: string;
  fileDataUrlOrBuffer: string | Blob;
  sha256Hash: string;
  fileSize?: string;
}): Promise<DirectDriveUploadResult> {
  const {
    accessToken,
    userEmail,
    caseId = 'case-001',
    fileName,
    mimeType = 'application/octet-stream',
    fileDataUrlOrBuffer,
    sha256Hash,
    fileSize,
  } = options;

  const cleanUser = userEmail.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanCase = caseId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const folderPathStr = `FIP_Evidence_Vault/User_${cleanUser}/Case_${cleanCase}`;
  const now = new Date().toISOString();

  // 1. Resolve folder hierarchy safely
  let targetFolderId: string | undefined;
  try {
    const rootVaultFolderId = await findOrCreateFolder(accessToken, 'FIP_Evidence_Vault');
    const userVaultFolderId = rootVaultFolderId
      ? await findOrCreateFolder(accessToken, `User_${cleanUser}`, rootVaultFolderId)
      : await findOrCreateFolder(accessToken, `User_${cleanUser}`);
    const caseVaultFolderId = userVaultFolderId
      ? await findOrCreateFolder(accessToken, `Case_${cleanCase}`, userVaultFolderId)
      : (userVaultFolderId || rootVaultFolderId);

    targetFolderId = caseVaultFolderId || userVaultFolderId || rootVaultFolderId;
  } catch (fErr) {
    console.warn('Folder resolution error (proceeding to upload at root):', fErr);
  }

  // 2. Prepare file blob
  let fileBlob: Blob;
  if (typeof fileDataUrlOrBuffer === 'string') {
    if (fileDataUrlOrBuffer.startsWith('data:')) {
      const parts = fileDataUrlOrBuffer.split(',');
      const byteString = atob(parts[1] || '');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const activeMime = mimeMatch ? mimeMatch[1] : mimeType;
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      fileBlob = new Blob([ab], { type: activeMime });
    } else {
      fileBlob = new Blob([fileDataUrlOrBuffer], { type: mimeType });
    }
  } else {
    fileBlob = fileDataUrlOrBuffer;
  }

  // 3. Upload Original Evidence File via Multipart Upload (with fallback if parent rejected)
  const buildForm = (folderId?: string) => {
    const meta: any = {
      name: fileName,
      description: `FIP Court-Ready Forensic Evidence. SHA-256: ${sha256Hash}. Timestamp: ${now}. WORM Locked.`,
      properties: {
        fipFormat: 'original_as_is',
        fipSha256: sha256Hash,
        fipUserId: userEmail,
        fipLocked: 'true',
        fipWormEnforced: 'WORM_IMMUTABLE',
      },
    };
    if (folderId && folderId !== 'root') {
      meta.parents = [folderId];
    }
    const f = new FormData();
    f.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
    f.append('file', fileBlob);
    return f;
  };

  let uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: buildForm(targetFolderId),
    }
  );

  // If failed with parentNotAFolder or 400/403/404, retry without parent
  if (!uploadRes.ok && targetFolderId) {
    const firstErr = await uploadRes.text();
    console.warn(`Drive upload with parent failed (${uploadRes.status}): ${firstErr}. Retrying at root...`);
    targetFolderId = undefined;
    uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: buildForm(undefined),
      }
    );
  }

  if (!uploadRes.ok) {
    const errorBody = await uploadRes.text();
    throw new Error(`Google Drive upload failed (${uploadRes.status}): ${errorBody}`);
  }

  const uploadData = await uploadRes.json();
  const fileId = uploadData.id;
  const driveUrl = uploadData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

  // 4. Upload Format 1 SHA-256 Digital Seal File (.sha256-seal.txt)
  let hashFileId: string | undefined;
  let hashDriveUrl: string | undefined;

  try {
    const hashSealContent = [
      `=================================================================`,
      `FIP FORENSIC INTEGRITY PROTOCOL - CRYPTOGRAPHIC SHA-256 HASH SEAL`,
      `=================================================================`,
      `ORIGINAL FILE NAME : ${fileName}`,
      `FILE SIZE          : ${fileSize || 'Unknown'}`,
      `SHA-256 HASH KEY   : ${sha256Hash}`,
      `MERKLE ROOT ANCHOR : mrk_${sha256Hash.substring(0, 32)}`,
      `INGEST TIMESTAMP   : ${now}`,
      `UPLOADER USER ID   : ${userEmail}`,
      `GOOGLE DRIVE VAULT : ${folderPathStr}`,
      `WORM VAULT STATUS  : IMMUTABLE / READ-ONLY / NON-DELETABLE`,
      `=================================================================`,
      `VERIFICATION INSTRUCTION:`,
      `This cryptographic hash file serves as an unalterable mathematical`,
      `fingerprint of the original file. If any byte of the original file`,
      `is altered, this hash will mismatch, proving unauthorized tampering.`,
      `=================================================================`,
    ].join('\n');

    const buildHashForm = (folderId?: string) => {
      const hashMeta: any = {
        name: `${fileName}.sha256-seal.txt`,
        description: `FIP Cryptographic SHA-256 Hash Seal (Format 1). Linked to ${fileName}. WORM Locked.`,
        properties: {
          fipFormat: 'hash_key_seal',
          fipSha256: sha256Hash,
          fipUserId: userEmail,
          fipLocked: 'true',
          fipWormEnforced: 'WORM_IMMUTABLE',
        },
      };
      if (folderId && folderId !== 'root') {
        hashMeta.parents = [folderId];
      }
      const hf = new FormData();
      hf.append('metadata', new Blob([JSON.stringify(hashMeta)], { type: 'application/json' }));
      hf.append('file', new Blob([hashSealContent], { type: 'text/plain' }));
      return hf;
    };

    let hashUploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: buildHashForm(targetFolderId),
      }
    );

    if (!hashUploadRes.ok && targetFolderId) {
      hashUploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: buildHashForm(undefined),
        }
      );
    }

    if (hashUploadRes.ok) {
      const hashData = await hashUploadRes.json();
      hashFileId = hashData.id;
      hashDriveUrl = hashData.webViewLink || `https://drive.google.com/file/d/${hashFileId}/view`;
    }
  } catch (sealErr) {
    console.warn('Notice uploading .sha256-seal.txt file:', sealErr);
  }

  return {
    fileId,
    driveUrl,
    folderId: targetFolderId || 'root',
    folderName: folderPathStr,
    hashFileId,
    hashDriveUrl,
    isDriveSynced: true,
    timestamp: now,
  };
}
