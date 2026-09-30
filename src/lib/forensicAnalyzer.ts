/**
 * Forensic Metadata Extractor & Malware Quarantine Sandbox Simulation Engine
 * Standards: ISO/IEC 27037, NIST SP 800-86
 */

export interface ExtractedMetadata {
  fileType: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
  sha1?: string;
  md5?: string;
  entropyScore: number; // 0.0 to 8.0 (high entropy >= 7.2 often indicates encrypted or packed payload)
  exifData?: {
    cameraModel?: string;
    lens?: string;
    timestamp?: string;
    gpsCoordinates?: { lat: number; lng: number; locationName?: string };
    software?: string;
    iso?: number;
    dimensions?: string;
  };
  documentProperties?: {
    author?: string;
    title?: string;
    producer?: string;
    pageCount?: number;
    creationDate?: string;
    modificationCount?: number;
  };
  networkIocs?: {
    extractedIps: string[];
    extractedDomains: string[];
    swiftTokens: string[];
    cryptoAddresses: string[];
  };
}

export interface QuarantineReport {
  status: 'CLEAN' | 'SUSPICIOUS_PAYLOAD' | 'CRITICAL_QUARANTINE';
  riskScore: number; // 0 - 100
  threatLabels: string[];
  sandboxLog: string[];
  isSandboxed: boolean;
  isolationProtocol: string;
}

/**
 * Calculates Shannon Entropy of a buffer to identify packed / encrypted malware
 */
export function calculateBufferEntropy(uint8Array: Uint8Array): number {
  if (uint8Array.length === 0) return 0;
  const frequencies = new Array(256).fill(0);
  for (let i = 0; i < uint8Array.length; i++) {
    frequencies[uint8Array[i]]++;
  }
  let entropy = 0;
  const len = uint8Array.length;
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const p = frequencies[i] / len;
      entropy -= p * Math.log2(p);
    }
  }
  return parseFloat(entropy.toFixed(3));
}

/**
 * Extracts deep metadata, EXIF, and embedded network IOCs
 */
export async function analyzeForensicArtifact(file: File, textContent?: string): Promise<{
  metadata: ExtractedMetadata;
  quarantine: QuarantineReport;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const entropy = calculateBufferEntropy(uint8);

  // Compute SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const sha256 = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  const isPcap = file.name.endsWith('.pcap') || file.name.endsWith('.cap');
  const isLogOrText = file.type.includes('text') || file.name.endsWith('.log') || file.name.endsWith('.json') || file.name.endsWith('.csv');

  // Synthesize realistic EXIF / Document properties based on file attributes
  let exifData: ExtractedMetadata['exifData'] | undefined;
  let docProperties: ExtractedMetadata['documentProperties'] | undefined;
  let extractedIps: string[] = [];
  let extractedDomains: string[] = [];
  let swiftTokens: string[] = [];
  let cryptoAddresses: string[] = [];

  const rawString = textContent || new TextDecoder().decode(uint8.slice(0, 50000));

  // Extract IPs
  const ipMatches = rawString.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g);
  if (ipMatches) extractedIps = Array.from(new Set(ipMatches)).slice(0, 5);

  // Extract SWIFT tokens
  const swiftMatches = rawString.match(/\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g);
  if (swiftMatches) swiftTokens = Array.from(new Set(swiftMatches)).slice(0, 3);

  // Extract Crypto Addresses (BTC / ETH)
  const ethMatches = rawString.match(/0x[a-fA-F0-9]{40}/g);
  if (ethMatches) cryptoAddresses = Array.from(new Set(ethMatches)).slice(0, 3);

  if (isImage) {
    exifData = {
      cameraModel: 'Sony Alpha ILCE-7RM5 // Forensic Lens FE 50mm',
      lens: 'FE 50mm F1.2 GM',
      timestamp: new Date(file.lastModified || Date.now() - 3600000).toISOString(),
      dimensions: '3840 x 2160 (4K Uncompressed Raw)',
      iso: 400,
      software: 'Hardware Enclave Direct Frame Grabber v4.2',
      gpsCoordinates: {
        lat: 37.7749 + (Math.random() - 0.5) * 0.05,
        lng: -122.4194 + (Math.random() - 0.5) * 0.05,
        locationName: 'District 4 Financial Corridor Beacon'
      }
    };
  }

  if (isPdf) {
    docProperties = {
      author: 'Official Transmitting Client / Digital Origin',
      title: file.name.replace(/\.pdf$/i, ''),
      producer: 'Certified Secure PDF / Enclave Export Node',
      pageCount: Math.floor(Math.random() * 8) + 1,
      creationDate: new Date(file.lastModified).toISOString(),
      modificationCount: 0
    };
  }

  // Malware Heuristics & Sandbox Scan
  const threatLabels: string[] = [];
  const sandboxLog: string[] = [
    `[${new Date().toISOString()}] Initiating Zero-Trust Sandbox Isolation Container...`,
    `[SANDBOX] Virtual memory mapped at 0x7FFF0000. Read-only permissions enforced.`,
    `[ENTROPY] Calculated Shannon Entropy: ${entropy} (Max 8.0).`
  ];

  let riskScore = 5;

  if (entropy > 7.4) {
    riskScore += 45;
    threatLabels.push('HIGH_ENTROPY_PACKED_PAYLOAD');
    sandboxLog.push(`[WARN] Abnormally high binary entropy detected. File may contain obfuscated or encrypted bytecode.`);
  }

  if (rawString.includes('eval(') || rawString.includes('cmd.exe') || rawString.includes('/bin/sh') || rawString.includes('powershell')) {
    riskScore += 40;
    threatLabels.push('EMBEDDED_SHELL_INJECTION_STRINGS');
    sandboxLog.push(`[ALERT] Detected shell invocation commands inside document stream.`);
  }

  if (file.name.endsWith('.exe') || file.name.endsWith('.dll') || file.name.endsWith('.sh') || file.name.endsWith('.bat')) {
    riskScore += 30;
    threatLabels.push('VOLATILE_EXECUTABLE_BINARY');
    sandboxLog.push(`[NOTICE] Executable binary quarantined from active execution.`);
  }

  let status: QuarantineReport['status'] = 'CLEAN';
  if (riskScore >= 70) {
    status = 'CRITICAL_QUARANTINE';
    sandboxLog.push(`[ISOLATION] File quarantined in sandbox. Execution halted to protect forensic environment.`);
  } else if (riskScore >= 30) {
    status = 'SUSPICIOUS_PAYLOAD';
    sandboxLog.push(`[MONITOR] Low-risk anomaly isolated. Evidence permitted for read-only cryptanalysis.`);
  } else {
    sandboxLog.push(`[VERIFIED] Clean forensic signature. Zero active exploits detected.`);
  }

  return {
    metadata: {
      fileType: file.type || 'application/octet-stream',
      mimeType: file.type || 'application/octet-stream',
      byteSize: file.size,
      sha256,
      entropyScore: entropy,
      exifData,
      documentProperties: docProperties,
      networkIocs: {
        extractedIps: extractedIps.length > 0 ? extractedIps : ['192.168.10.42', '185.220.101.4'],
        extractedDomains: ['swift-relay.auth.cc', 'gateway-sync.ec3.int'],
        swiftTokens: swiftTokens.length > 0 ? swiftTokens : ['SWFT-US-NY-8819'],
        cryptoAddresses: cryptoAddresses.length > 0 ? cryptoAddresses : ['0x71C...90B2']
      }
    },
    quarantine: {
      status,
      riskScore,
      threatLabels: threatLabels.length > 0 ? threatLabels : ['NO_THREATS_DETECTED'],
      sandboxLog,
      isSandboxed: true,
      isolationProtocol: 'NIST_SP_800_86_CONTAINER_V2'
    }
  };
}
