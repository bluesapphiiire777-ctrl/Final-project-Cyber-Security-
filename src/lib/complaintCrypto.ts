/**
 * Cryptographic Utility for Canonical Forensic Complaint Records
 * Produces FIPS PUB 180-4 compliant SHA-256 seals for complaints and revision chains
 */

import { ComplaintAttachment, ComplaintVersion } from '../types';

export async function computeSha256(data: string | Uint8Array | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === 'string') {
    buffer = new TextEncoder().encode(data).buffer;
  } else if (data instanceof Uint8Array) {
    buffer = data.buffer;
  } else {
    buffer = data;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalizeJson).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => `${JSON.stringify(key)}:${canonicalizeJson(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}

export const canonicalJsonStringify = canonicalizeJson;

export async function computeSha256OfText(text: string): Promise<string> {
  return computeSha256(text);
}

export async function computeSha256OfFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return computeSha256(arrayBuffer);
}

export function generateMockMerkleRoot(seal: string, hashes: string[]): string {
  if (!hashes || hashes.length === 0) return seal;
  const combined = [seal, ...hashes].join('');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const chr = combined.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}${seal.slice(0, 54)}`;
}

export async function computeMerkleRoot(hashes: string[]): Promise<string> {
  if (!hashes || hashes.length === 0) {
    return computeSha256('FIP_EMPTY_LEAF');
  }
  if (hashes.length === 1) {
    return hashes[0];
  }

  let currentLevel = [...hashes];
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const combined = currentLevel[i] + currentLevel[i + 1];
        nextLevel.push(await computeSha256(combined));
      } else {
        // Duplicate odd leaf
        const combined = currentLevel[i] + currentLevel[i];
        nextLevel.push(await computeSha256(combined));
      }
    }
    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

export async function generateComplaintVersionSeal(params: {
  complaintId: string;
  versionNumber: number;
  statement: string;
  incidentDate: string;
  incidentLocation?: string;
  suspectDetails?: string;
  financialLossEstimated?: string;
  attachments: ComplaintAttachment[];
  submittedBy: {
    userId: string;
    userName: string;
    userEmail: string;
    userBadge?: string;
  };
  submittedAt: string;
  parentSealHash?: string;
  revisionNotes?: string;
}): Promise<{
  sha256Seal: string;
  canonicalJson: string;
  merkleRoot: string;
}> {
  // Collect attachment hashes
  const attachmentHashes = params.attachments.map(a => a.sha256Hash || '0000000000000000000000000000000000000000000000000000000000000000');
  const attachmentsMerkle = await computeMerkleRoot(attachmentHashes);

  // Standardized Canonical Representation for Legal Ingestion
  const canonicalPayload = {
    fipProtocol: 'FIP-LEGAL-EVIDENCE-V2',
    complaintId: params.complaintId,
    versionNumber: params.versionNumber,
    isOriginalMaster: params.versionNumber === 1,
    parentSealHash: params.parentSealHash || null,
    submittedBy: {
      userId: params.submittedBy.userId,
      userName: params.submittedBy.userName,
      userEmail: params.submittedBy.userEmail,
      userBadge: params.submittedBy.userBadge || 'PUBLIC_COMPLAINANT',
    },
    submittedAt: params.submittedAt,
    incidentContext: {
      incidentDate: params.incidentDate,
      incidentLocation: params.incidentLocation || 'UNSPECIFIED_JURISDICTION',
      financialLossEstimated: params.financialLossEstimated || '$0.00 USD',
      suspectDetails: params.suspectDetails || 'UNKNOWN_OR_UNCONFIRMED',
    },
    statementHash: await computeSha256(params.statement),
    statementBody: params.statement,
    attachmentCount: params.attachments.length,
    attachmentManifest: params.attachments.map(a => ({
      fileName: a.fileName,
      sha256: a.sha256Hash,
      mimeType: a.mimeType,
      size: a.fileSize,
    })),
    attachmentsMerkle,
    revisionNotes: params.revisionNotes || (params.versionNumber === 1 ? 'ORIGINAL_DEPOSIT' : 'AMENDMENT_RECORD'),
    securityDirective: 'WORM_IMMUTABLE_ENFORCED',
  };

  const canonicalJson = canonicalizeJson(canonicalPayload);
  const sha256Seal = await computeSha256(canonicalJson);
  const overallMerkleRoot = await computeMerkleRoot([sha256Seal, attachmentsMerkle, params.parentSealHash || sha256Seal]);

  return {
    sha256Seal,
    canonicalJson,
    merkleRoot: overallMerkleRoot,
  };
}
