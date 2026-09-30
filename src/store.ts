import { create } from 'zustand';
import { User, Case, Evidence, Task, EvidenceAnnotation, UserAccount, TamperAlert, IOCArtifact, TimelineEvent, TickerLog, Complaint, SeniorWorkstationReport } from './types';

interface FIPState {
  currentUser: User | null;
  cases: Case[];
  evidence: Evidence[];
  tasks: Task[];
  accounts: UserAccount[];
  tamperAlerts: TamperAlert[];
  iocs: IOCArtifact[];
  timelineEvents: TimelineEvent[];
  tickerLogs: TickerLog[];
  complaints: Complaint[];
  activeComplaint: Complaint | null;
  seniorReports: SeniorWorkstationReport[];
  isSeniorInvestigatorView: boolean;
  sessionKey: string;
  isVaultFrozen: boolean;
  tamperAlertsCount: number;
  activeNotification: string | null;
  selectedUserIdFilter: string | null;
  googleDriveConnected: boolean;
  googleDriveAccessToken: string | null;
  googleDriveUserEmail: string | null;
  setGoogleDriveAccessToken: (token: string | null, email?: string | null) => void;
  updateEvidenceDriveUrl: (evidenceId: string, driveUrl: string, driveFileId?: string, isDriveSynced?: boolean) => void;
  setSelectedUserIdFilter: (userId: string | null) => void;
  setCurrentUser: (user: User | null) => void;
  addCase: (newCase: Case) => void;
  toggleCaseFreeze: (caseId: string) => void;
  updateCaseStatus: (caseId: string, status: string) => void;
  addEvidence: (newEvidence: Evidence) => void;
  addAnnotation: (evidenceId: string, annotation: EvidenceAnnotation) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  toggleTask: (taskId: string) => void;
  rotateSessionKey: () => string;
  toggleVaultFreeze: () => boolean;
  reportTamperAlert: (alert?: Partial<TamperAlert>) => void;
  resolveTamperAlert: (alertId: string, resolutionNotes?: string) => void;
  addIocArtifact: (ioc: IOCArtifact) => void;
  addTimelineEvent: (event: TimelineEvent) => void;
  addTickerLog: (log: Omit<TickerLog, 'id'>) => void;
  setNotification: (msg: string | null) => void;
  setComplaints: (complaints: Complaint[]) => void;
  setActiveComplaint: (complaint: Complaint | null) => void;
  addSeniorReport: (report: SeniorWorkstationReport) => void;
  updateSeniorReport: (id: string, updates: Partial<SeniorWorkstationReport>) => void;
  deleteSeniorReport: (id: string) => void;
  toggleSeniorInvestigatorView: () => void;
  fetchComplaints: (isSenior?: boolean) => Promise<void>;
  createComplaint: (payload: any) => Promise<Complaint | null>;
  amendComplaint: (complaintId: string, payload: any) => Promise<Complaint | null>;
  reviewComplaint: (complaintId: string, payload: any) => Promise<Complaint | null>;
}

const initialSeniorReportsData: SeniorWorkstationReport[] = [
  {
    id: 'RPT-2026-0923-01',
    reportDate: '2026-09-23',
    timestamp: '2026-09-23T07:15:00Z',
    investigatorName: 'Senior Inspector FIPG 3638',
    investigatorBadge: 'FIPG-3638',
    caseId: 'CMP-2026-88192',
    caseTitle: 'Unauthorized SWIFT Gateway Extraction & API Key Tampering',
    caseCategory: 'FINANCIAL_FRAUD',
    partnerTeam: [
      {
        id: 'tm-1',
        name: 'Det. Marcus Kane',
        phone: '+1 (555) 912-4411',
        badge: 'FIP-5520-NET',
        role: 'Perimeter Egress & Network PCAP Analysis'
      },
      {
        id: 'tm-2',
        name: 'Dr. Elena Rostova',
        phone: '+1 (555) 291-7789',
        badge: 'FIP-7712-CRYPTO',
        role: 'Hardware TPM Key Recovery'
      }
    ],
    ideasImplemented: '1. Executed packet inspection on DNS relay gateway-sync-auth.cc to reconstruct payload base64 fragments.\n2. Correlated access token revocation timestamp (Sept 12) with raw gateway outbound connections (Sept 14).\n3. Reconstructed attacker ingress path using memory offset 0x7FF0012A.',
    findingsBreakthroughs: 'Recovered 14 unauthorized SWIFT message buffers matching ex-contractor signature #X-8809. Identified outbound IP destination 185.220.101.4 routed through compromised offshore proxy. Total confirmed impact: $142,500.00 USD.',
    caseProgressPercentage: 85,
    caseStatusAccordingToLead: 'CRYPTO_CROSS_EXAMINATION',
    verdictSummary: 'Evidentiary chain established. Primary suspect credential and exfiltration infrastructure identified and sealed in WORM ledger.',
    sha256Seal: 'e89d1b038c119284fa9b6189da44bcf0120199e81bca012984a91901bce89a12',
    courtReady: true,
  },
  {
    id: 'RPT-2026-0922-02',
    reportDate: '2026-09-22',
    timestamp: '2026-09-22T16:30:00Z',
    investigatorName: 'Senior Inspector FIPG 3638',
    investigatorBadge: 'FIPG-3638',
    caseId: 'case-001',
    caseTitle: 'Operation Nightfall // Sovereign Enclave Infiltration',
    caseCategory: 'CYBER_ESPIONAGE',
    partnerTeam: [
      {
        id: 'tm-3',
        name: 'Agent James Vance',
        phone: '+1 (555) 839-2041',
        badge: 'FIP-4091-INV',
        role: 'Volatile RAM Core Dump Acquisition'
      }
    ],
    ideasImplemented: '1. Acquired 842.6 MB raw memory snapshot before system reboot.\n2. Verified hardware TPM 2.0 SHA-256 seal to ensure zero bit-drift.\n3. Monitored active WORM write-lock layer for real-time unauthorized offset zeroing attempts.',
    findingsBreakthroughs: 'Detected and blocked external proxy attempt to overwrite offset 0x4FF80. Captured full ELF core dump sys_core_dump_enclave_0x77.raw.',
    caseProgressPercentage: 70,
    caseStatusAccordingToLead: 'ACTIVE_FIELDWORK',
    verdictSummary: 'Hardware memory secured. Attack vector isolated before lateral movement occurred.',
    sha256Seal: '9841bca012984a91901bce89a12e89d1b038c119284fa9b6189da44bcf012019',
    courtReady: true,
  }
];

const initialAccountsData: UserAccount[] = [
  {
    id: 'usr-001',
    name: 'Senior Inspector FIPG 3638 (Head of Investigation)',
    email: 'bluesapphiiire777@gmail.com',
    badgeId: 'FIPG-3638',
    role: 'CHIEF_INVESTIGATOR',
    assignedCasesCount: 5,
    cloudVaultUsage: '5.20 GB / 15.0 GB',
    cloudVaultBytes: 5200000000,
    lastActiveIp: '192.168.10.42 (Senior Police HQ Enclave)',
    lastActiveTime: 'Just now (Active Head of Police Investigation)',
    status: 'ACTIVE',
    phone: '+1 (555) 019-3638',
  },
  {
    id: 'usr-002',
    name: 'Agent James Vance',
    email: 'j.vance@fip-agency.internal',
    badgeId: 'FIP-4091-INV',
    role: 'SENIOR_EXAMINER',
    assignedCasesCount: 2,
    cloudVaultUsage: '2.14 GB / 15.0 GB',
    cloudVaultBytes: 2140000000,
    lastActiveIp: '10.0.4.119 (Station Alpha)',
    lastActiveTime: '12 minutes ago',
    status: 'ACTIVE',
    phone: '+1 (555) 839-2041',
  },
  {
    id: 'usr-003',
    name: 'Dr. Elena Rostova',
    email: 'e.rostova@fip-agency.internal',
    badgeId: 'FIP-7712-CRYPTO',
    role: 'FORENSIC_ANALYST',
    assignedCasesCount: 3,
    cloudVaultUsage: '6.90 GB / 15.0 GB',
    cloudVaultBytes: 6900000000,
    lastActiveIp: '172.16.88.201 (Cryptanalysis Lab)',
    lastActiveTime: '1 hour ago',
    status: 'ACTIVE',
    phone: '+1 (555) 291-7789',
  },
  {
    id: 'usr-004',
    name: 'Marcus Kane (NetSec)',
    email: 'm.kane@fip-agency.internal',
    badgeId: 'FIP-5520-NET',
    role: 'FORENSIC_ANALYST',
    assignedCasesCount: 1,
    cloudVaultUsage: '1.05 GB / 15.0 GB',
    cloudVaultBytes: 1050000000,
    lastActiveIp: '192.168.1.100 (Egress Sensor)',
    lastActiveTime: '3 hours ago',
    status: 'ACTIVE',
    phone: '+1 (555) 912-4411',
  },
  {
    id: 'usr-005',
    name: 'Officer Sarah Lin',
    email: 's.lin@fip-custody.gov',
    badgeId: 'FIP-3390-CUST',
    role: 'CUSTODY_OFFICER',
    assignedCasesCount: 3,
    cloudVaultUsage: '850 MB / 15.0 GB',
    cloudVaultBytes: 850000000,
    lastActiveIp: '10.200.1.4 (Physical Evidence Locker)',
    lastActiveTime: 'Yesterday 18:40 UTC',
    status: 'ACTIVE',
    phone: '+1 (555) 441-9032',
  },
  {
    id: 'usr-006',
    name: 'Special Auditor David Ross',
    email: 'd.ross@justice-audit.org',
    badgeId: 'FIP-9900-AUDIT',
    role: 'LEGAL_AUDITOR',
    assignedCasesCount: 2,
    cloudVaultUsage: '120 MB / 15.0 GB',
    cloudVaultBytes: 120000000,
    lastActiveIp: '198.51.100.44 (Judicial Enclave)',
    lastActiveTime: '2 days ago',
    status: 'ACTIVE',
    phone: '+1 (555) 700-1120',
  }
];

const initialTamperAlertsData: TamperAlert[] = [
  {
    id: 'TMP-901',
    evidenceId: 'EVD-90412-ALPHA',
    evidenceTitle: 'sys_core_dump_enclave_0x77.raw',
    editorName: 'Unknown Node / Infiltration Vector',
    editorEmail: 'shadow.proxy.99@exfil-relay.net',
    editorPhone: '+1 (555) 019-9941 [VOIP]',
    editorIp: '185.220.101.5 (Tor Exit Node / Foreign ISP)',
    severity: 'CRITICAL',
    tamperType: 'UNAUTHORIZED_OFFSET_MODIFICATION',
    exactDiff: '- [OFFSET 0x4FF80]: 0x0000 0x8892 0x1BBA [TCP SOCKETS OPEN: 14 ESTABLISHED]\n+ [OFFSET 0x4FF80]: 0x0000 0x0000 0x0000 [ZEROED OUT - TAMPER ATTEMPT BLOCKED]',
    rawPayloadBefore: 'SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (Original Anchor)',
    rawPayloadAfter: 'SHA256: d41d8cd98f00b204e9800998ecf8427e (Rejected Zero-Length Delta)',
    timestamp: '2026-08-20 08:34:12 UTC',
    status: 'ESCALATED',
  },
  {
    id: 'TMP-902',
    evidenceId: 'EVD-90413-BETA',
    evidenceTitle: 'perimeter_firewall_pcap_20260819.log',
    editorName: 'Suspicious Session ID 0x992B',
    editorEmail: 'external.auditor.probe@anonymized.org',
    editorPhone: '+44 20 7946 0991 [Unverified]',
    editorIp: '194.26.29.112 (Proxy Routing)',
    severity: 'HIGH',
    tamperType: 'WORM_PERMISSION_VIOLATION',
    exactDiff: 'ATTEMPTED CALL: DriveAPI.Permissions.update(role: "writer") -> HTTP 403 FORBIDDEN. Immutable WORM policy blocked write attempt.',
    rawPayloadBefore: 'WORM LOCK: READ_ONLY (Enforced by FIP Engine)',
    rawPayloadAfter: 'WRITE ACCESS: REJECTED AT GATEWAY',
    timestamp: '2026-08-19 22:15:00 UTC',
    status: 'INVESTIGATING',
  }
];

const initialIocsData: IOCArtifact[] = [
  {
    id: 'IOC-101',
    type: 'IP_ADDRESS',
    value: '185.220.101.5',
    label: 'C2 Command & Control Exfiltration Relay',
    caseId: 'case-001',
    threatActor: 'APT-44 / Nightfall Group',
    confidence: 'CONFIRMED',
    mitreTag: 'T1071.001 - Application Layer Protocol',
    discoveredAt: '2026-08-18 14:22 UTC',
    notes: 'Direct destination socket for encrypted memory dump payloads.',
  },
  {
    id: 'IOC-102',
    type: 'SHA256_HASH',
    value: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    label: 'Compromised Memory Injection Dropper DLL',
    caseId: 'case-001',
    threatActor: 'APT-44 Dropper Variant',
    confidence: 'CONFIRMED',
    mitreTag: 'T1055 - Process Injection',
    discoveredAt: '2026-08-18 18:00 UTC',
    notes: 'Extracted from volatile enclave dump before hardware zero-fill.',
  },
  {
    id: 'IOC-103',
    type: 'CCTV_FEED',
    value: 'CAM-DOCK-PERIMETER-04 [Vault Server Rack Room B]',
    label: 'Physical Vault Entrance Surveillance Stream',
    caseId: 'case-002',
    threatActor: 'Physical Breach Candidate',
    confidence: 'CONFIRMED',
    mitreTag: 'T1200 - Hardware Additions',
    discoveredAt: '2026-08-19 03:14 UTC',
    notes: 'Visual footage synchronized with tamper sensor trigger time 03:14:22.',
    cctvStreamUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'IOC-104',
    type: 'REGISTRY_KEY',
    value: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\FIP_Enclave_Hook',
    label: 'Persistence Hook into Hardware TPM Driver',
    caseId: 'case-003',
    threatActor: 'Quantum Breach Stalker',
    confidence: 'SUSPECTED',
    mitreTag: 'T1543.003 - Windows Service',
    discoveredAt: '2026-08-19 11:45 UTC',
    notes: 'Attempted to intercept private key derivation prior to WORM seal.',
  }
];

const initialTimelineEventsData: TimelineEvent[] = [
  {
    id: 'EVT-01',
    caseId: 'case-001',
    title: 'Anomalous TLS Tunnel Established to 185.220.101.5',
    timestamp: '2026-08-18 04:12 UTC',
    durationHours: 3.5,
    category: 'EXFILTRATION',
    investigator: 'Marcus Kane (FIP-5520-NET)',
    description: 'Outbound traffic spike of 842 MB detected crossing perimeter gateway before automatic firewall isolation.',
    severity: 'CRITICAL',
  },
  {
    id: 'EVT-02',
    caseId: 'case-001',
    title: 'Volatile Core Dump Acquired & Fingerprinted (SHA-256)',
    timestamp: '2026-08-18 08:30 UTC',
    durationHours: 1.2,
    category: 'EVIDENCE_INGESTION',
    investigator: 'Agent James Vance (FIP-4091-INV)',
    description: 'Hardware memory snapshot captured at 0x7FF0012A with zero bit drift verification.',
    severity: 'INFO',
  },
  {
    id: 'EVT-03',
    caseId: 'case-001',
    title: 'Unauthorized In-Memory Offset Edit Attempt Blocked',
    timestamp: '2026-08-19 08:34 UTC',
    durationHours: 0.5,
    category: 'TAMPER_ATTEMPT',
    investigator: 'bluesapphiiire777 (Chief Lead)',
    description: 'External proxy attempt to zero out offset 0x4FF80 rejected by WORM write-lock layer.',
    severity: 'CRITICAL',
  },
  {
    id: 'EVT-04',
    caseId: 'case-001',
    title: 'WORM Immutable Google Drive Anchor Sealed',
    timestamp: '2026-08-19 14:00 UTC',
    durationHours: 0.8,
    category: 'WORM_LOCK',
    investigator: 'Dr. Elena Rostova (FIP-7712-CRYPTO)',
    description: 'Merkle root mrk_99a81f34 permanently anchored with Proof of Deposit email dispatch.',
    severity: 'INFO',
  },
  {
    id: 'EVT-05',
    caseId: 'case-002',
    title: 'HSM Physical Sensor Calibration & Legal Deposit Package',
    timestamp: '2026-08-20 02:00 UTC',
    durationHours: 2.0,
    category: 'LEGAL_DEPOSIT',
    investigator: 'Officer Sarah Lin (FIP-3390-CUST)',
    description: 'Chain of custody bundle exported for judicial presentation with timestamped signature.',
    severity: 'INFO',
  }
];

const initialEvidenceData: Evidence[] = [
  {
    id: 'EVD-90412-ALPHA',
    caseId: 'case-001',
    title: 'sys_core_dump_enclave_0x77.raw',
    type: 'MEMORY_CORE_DUMP',
    size: '842.6 MB',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    merkleRoot: 'mrk_99a81f34ec01bb872d41804f112e84c901a8',
    chunkCount: 128,
    targetRefId: 'TRG-CASE-001-8841',
    digitalSealSignature: 'SEAL-WORM-SHA256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    content: `00000000  7f 45 4c 46 02 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|
00000010  04 00 3e 00 01 00 00 00  00 00 00 00 00 00 00 00  |..>.............|
00000020  40 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |@...............|
00000030  00 00 00 00 40 00 38 00  05 00 40 00 00 00 00 00  |....@.8...@.....|
00000040  01 00 00 00 05 00 00 00  00 00 00 00 00 00 00 00  |................|
00000050  00 00 40 00 00 00 00 00  00 00 40 00 00 00 00 00  |..@.......@.....|
00000060  d0 11 00 00 00 00 00 00  d0 11 00 00 00 00 00 00  |................|
[FORENSIC ENCLAVE VOLATILITY MEMORY CORE DUMP UNFILTERED RAW STREAM - OFFSET 0x00007FFF]
[PROCESS ISOLATED: thread_id=14092, status=SUSPENDED, memory_address=0x7ff4190b2000]
[SOCKET MAPPING: local=10.0.4.12:443 -> remote=185.220.101.5:8080 (ESTABLISHED)]`,
    fileDataUrl: 'data:text/plain;base64,N2Y0NTRjNDYwMjAxMDEwMDAwMDAwMDAwMDAwMDAwMDAwNDAwM2UwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDA0MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDQwMDM4MDAwNTAwNDAwMDAwMDAwMDAxMDAwMDAwMDUwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA0MDAwMDAwMDAwMDAwMDA0MDAwMDAwMDAwMGQwMTEwMDAwMDAwMDAwMGQwMTEwMDAwMDAwMDAw',
    uploadedBy: 'Forensic Unit Alpha',
    uploadedByBadge: 'FIP-8841-INV',
    createdAt: Date.now() - 3600000 * 18,
    depositStatus: 'ANCHORED',
    receiptSent: true,
    isFrozen: false,
    annotations: [
      {
        id: 'ann-101',
        evidenceId: 'EVD-90412-ALPHA',
        investigatorName: 'Agent James Vance',
        badgeId: 'FIP-4091-INV',
        phone: '+1 (555) 839-2041',
        email: 'j.vance@fip-agency.internal',
        diffDescription: 'Extracted volatility index at offset 0x4FF80. Isolated 14 suspended TCP sockets targeting foreign enclave IP 185.220.101.5.',
        noteCategory: 'FORENSIC_NOTE',
        timestamp: new Date(Date.now() - 3600000 * 12).toUTCString(),
        ipHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        verified: true,
      },
      {
        id: 'ann-102',
        evidenceId: 'EVD-90412-ALPHA',
        investigatorName: 'Dr. Elena Rostova',
        badgeId: 'FIP-7712-CRYPTO',
        phone: '+1 (555) 291-7789',
        email: 'e.rostova@fip-agency.internal',
        diffDescription: 'Chain-of-Custody integrity check passed. Merkle branch 0x0C validated with zero differential bit shift.',
        noteCategory: 'CHAIN_OF_CUSTODY',
        timestamp: new Date(Date.now() - 3600000 * 4).toUTCString(),
        ipHash: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        verified: true,
      }
    ]
  },
  {
    id: 'EVD-90413-BETA',
    caseId: 'case-001',
    title: 'perimeter_firewall_pcap_20260819.log',
    type: 'NETWORK_TELEMETRY',
    size: '14.2 GB',
    sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    merkleRoot: 'mrk_41c0e89aa201fe88114f09d84177c3a011be',
    chunkCount: 2048,
    targetRefId: 'TRG-CASE-001-1029',
    digitalSealSignature: 'SEAL-WORM-SHA256-a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    content: `2026-08-19T14:22:01.002Z INGRESS_ALLOW TCP 192.168.1.102:51202 -> 10.0.0.1:443 [SYN] seq=20419201 window=64240
2026-08-19T14:22:01.008Z INGRESS_ALLOW TCP 192.168.1.102:51202 -> 10.0.0.1:443 [ACK] seq=20419202 ack=88410291
2026-08-19T14:22:01.015Z TLS_HANDSHAKE_START ClientHello SNI=vault.enclave.fip.internal CipherSuites=[TLS_AES_256_GCM_SHA384]
2026-08-19T14:22:01.034Z EGRESS_DENY TCP 10.0.0.1:443 -> 185.220.101.5:8080 [RST] [EVASION_FLAGGED_BY_SENSOR]
[UNFILTERED RAW PACKET LOG STREAM - 100% ORIGINAL CAPTURE UNALTERED]`,
    fileDataUrl: 'data:text/plain;base64,MjAyNi0wOC0xOVQxNDoyMjowMS4wMDJaIElOR1JFU1NfQUxMT1cgVENQIDE5Mi4xNjguMS4xMDI6NTEyMDIgLT4gMTAuMC4wLjE6NDQzIFtTWU5dIHNlcT0yMDQxOTIwMSB3aW5kb3c9NjQyNDA=',
    uploadedBy: 'Cyber Incident Response Team',
    uploadedByBadge: 'FIP-1029-CIRT',
    createdAt: Date.now() - 3600000 * 8,
    depositStatus: 'ANCHORED',
    receiptSent: true,
    isFrozen: false,
    annotations: [
      {
        id: 'ann-103',
        evidenceId: 'EVD-90413-BETA',
        investigatorName: 'Senior Analyst Marcus Kane',
        badgeId: 'FIP-5520-NET',
        phone: '+1 (555) 912-4411',
        email: 'm.kane@fip-agency.internal',
        diffDescription: 'Flagged TLS 1.3 fingerprint evasion attempt during egress sweep. Original packet payload remains 100% bit-for-bit unchanged.',
        noteCategory: 'METADATA_DIFF',
        timestamp: new Date(Date.now() - 3600000 * 2).toUTCString(),
        ipHash: 'sha256:2c624232cdd221771294dfbb310aca000a0df6ec9b5fe98b724046f2ecf99bfb',
        verified: true,
      }
    ]
  },
  {
    id: 'EVD-90414-GAMMA',
    caseId: 'case-002',
    title: 'hsm_audit_tamper_sensor_telemetry.bin',
    type: 'HARDWARE_HSM_LOG',
    size: '1.2 MB',
    sha256Hash: '4355a46b19d348dc2f57c046f8ef63d4538ebb936000f3c9ee954a27460dd865',
    merkleRoot: 'mrk_66b18fa900bc314159265358979323846264',
    chunkCount: 16,
    targetRefId: 'TRG-CASE-002-9900',
    digitalSealSignature: 'SEAL-WORM-SHA256-4355a46b19d348dc2f57c046f8ef63d4538ebb936000f3c9ee954a27460dd865',
    content: `[HSM HARDWARE TAMPER SENSOR DUMP]
SENSOR_ID: SENS-HSM-QUAD-09
STATE: SEALED_NOMINAL
VOLTAGE_RAIL: 3.301V (NOMINAL)
TEMPERATURE: 24.1C
OPTICAL_MESH_RESISTANCE: 10.4kOhm (UNCOMPROMISED)
PHYSICAL_CHASSIS_INTACT: TRUE
TIMESTAMP_ANCHOR: 2026-08-22T00:00:00.000Z`,
    fileDataUrl: 'data:text/plain;base64,W0hTTSBIQVJEV0FSRSBUQU1QRVIgU0VOU09SIERVTVBdClNFTlNPUl9JRDogU0VOUy1IU00tUVVBRC0wOQpTVEFURTogU0VBTEVEX05PTUlOQUw=',
    uploadedBy: 'Internal Security Audit',
    uploadedByBadge: 'FIP-9900-SEC',
    createdAt: Date.now() - 3600000 * 24,
    depositStatus: 'ANCHORED',
    receiptSent: true,
    isFrozen: false,
    annotations: []
  },
  {
    id: 'EVD-IMG-101',
    caseId: 'case-001',
    title: 'cctv_cam_04_dock_perimeter.jpg',
    type: 'image/jpeg',
    size: '3.4 MB',
    sha256Hash: '9f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    merkleRoot: 'mrk_77189a01bb872d41804f112e84c901a8',
    chunkCount: 32,
    targetRefId: 'TRG-CAM-PERIMETER-04',
    digitalSealSignature: 'SEAL-WORM-SHA256-9f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    content: '[UNFILTERED RAW HIGH-RES IMAGE STREAM CAPTURED BY SENSOR CAM-04 DOCK PERIMETER]',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
    fileDataUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
    uploadedBy: 'Forensic Camera Sensor Alpha',
    uploadedByBadge: 'FIP-8841-INV',
    createdAt: Date.now() - 3600000 * 5,
    depositStatus: 'ANCHORED',
    receiptSent: true,
    isFrozen: false,
    annotations: []
  },
  {
    id: 'EVD-IMG-102',
    caseId: 'case-001',
    title: 'suspect_passport_identity_scan.png',
    type: 'image/png',
    size: '2.1 MB',
    sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    merkleRoot: 'mrk_33990184f112e84c901a8291a201f88a',
    chunkCount: 24,
    targetRefId: 'TRG-IDENTITY-SCAN-88',
    digitalSealSignature: 'SEAL-WORM-SHA256-4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    content: '[UNFILTERED RAW IDENTITY SCAN DOCUMENT PHOTO CAPTURED BY HIGH-RESOLUTION SCANNER]',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    fileDataUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    uploadedBy: 'Agent James Vance',
    uploadedByBadge: 'FIP-4091-INV',
    createdAt: Date.now() - 3600000 * 3,
    depositStatus: 'ANCHORED',
    receiptSent: true,
    isFrozen: false,
    annotations: []
  },
  {
    id: 'EVD-IMG-103',
    caseId: 'case-002',
    title: 'satellite_thermal_recon_target.jpg',
    type: 'image/jpeg',
    size: '5.8 MB',
    sha256Hash: '88a1029191244111339088414091771255209900884140917712552099001029',
    merkleRoot: 'mrk_88410291f112e84c901a8291a201f88a',
    chunkCount: 64,
    targetRefId: 'TRG-SATELLITE-SAT-09',
    digitalSealSignature: 'SEAL-WORM-SHA256-88a1029191244111339088414091771255209900884140917712552099001029',
    content: '[UNFILTERED RAW SATELLITE RECONNAISSANCE IMAGE CAPTURED OVER ORBITAL SECTOR 7]',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    fileDataUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    uploadedBy: 'Dr. Elena Rostova',
    uploadedByBadge: 'FIP-7712-CRYPTO',
    createdAt: Date.now() - 3600000 * 2,
    depositStatus: 'ANCHORED',
    receiptSent: true,
    isFrozen: false,
    annotations: []
  },
  {
    id: 'EVD-DOC-201',
    caseId: 'case-001',
    title: 'chain_of_custody_judicial_report.pdf',
    type: 'application/pdf',
    size: '1.8 MB',
    sha256Hash: '7c328cb08b5531fcacdabf8a4b227777d4dd1fc61c6f884f48641d02b4d121d3',
    merkleRoot: 'mrk_11223344556677889900aabbccddeeff',
    chunkCount: 16,
    targetRefId: 'TRG-LEGAL-REPORT-001',
    digitalSealSignature: 'SEAL-WORM-SHA256-7c328cb08b5531fcacdabf8a4b227777d4dd1fc61c6f884f48641d02b4d121d3',
    content: '[UNFILTERED OFFICIAL JUDICIAL CHAIN-OF-CUSTODY PDF DOCUMENT REPORT]',
    uploadedBy: 'Chief Lead bluesapphiiire777',
    uploadedByBadge: 'FIP-8841-INV',
    createdAt: Date.now() - 3600000 * 1,
    depositStatus: 'ANCHORED',
    receiptSent: true,
    isFrozen: false,
    annotations: []
  }
];

const initialComplaintsData: Complaint[] = [
  {
    id: 'CMP-2026-88192',
    complainantId: 'usr-001',
    complainantName: 'bluesapphiiire777 (Director of Cyber Sec)',
    complainantEmail: 'bluesapphiiire777@gmail.com',
    complainantBadge: 'FIP-8841-INV',
    title: 'Unauthorized SWIFT Gateway Extraction & API Key Tampering',
    category: 'FINANCIAL_FRAUD',
    incidentDate: '2026-09-14T08:30:00Z',
    priority: 'URGENT',
    status: 'FORENSIC_ANALYSIS',
    currentVersionNumber: 2,
    originalSha256Seal: 'a4f89d3118992e9e6c4b22c71289cf0099e013ab6611442998aabcf012431289',
    latestSha256Seal: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    isWormLocked: true,
    versions: [
      {
        versionNumber: 1,
        isOriginal: true,
        versionLabel: 'v1.0 (Original Master Filing)',
        statement: 'On September 14, 2026, our enterprise banking gateway detected 14 unauthorized Wire/SWIFT transfer dispatches originating from internal subnets 10.40.12.0/24 routed to an offshore account. The credential signature matches ex-contractor access keys revoked 48 hours prior.',
        incidentLocation: 'New York HQ Data Center / Gateway Node 04',
        suspectDetails: 'Ex-contractor credential ID #X-8809 (Revoked Sept 12)',
        financialLossEstimated: '$120,000.00 USD',
        attachments: [
          {
            id: 'att-101',
            fileName: 'swift_gateway_audit_sept14.csv',
            fileSize: '1.42 MB',
            mimeType: 'text/csv',
            sha256Hash: 'a4f89d3118992e9e6c4b22c71289cf0099e013ab6611442998aabcf012431289',
            uploadedAt: '2026-09-14T08:35:00Z',
          },
          {
            id: 'att-102',
            fileName: 'revoked_token_signature.log',
            fileSize: '412 KB',
            mimeType: 'text/plain',
            sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            uploadedAt: '2026-09-14T08:35:00Z',
          }
        ],
        sha256Seal: 'a4f89d3118992e9e6c4b22c71289cf0099e013ab6611442998aabcf012431289',
        canonicalJson: '{"complaintId":"CMP-2026-88192","version":1}',
        merkleRoot: 'mrk_a4f89d3118992e9e6c4b22c71289cf00',
        submittedAt: '2026-09-14T08:35:00Z',
        submittedBy: {
          userId: 'usr-001',
          userName: 'bluesapphiiire777 (Director of Cyber Sec)',
          userEmail: 'bluesapphiiire777@gmail.com',
          userBadge: 'FIP-8841-INV',
        },
        wormEnforced: 'WORM_IMMUTABLE',
      },
      {
        versionNumber: 2,
        isOriginal: false,
        versionLabel: 'v2.0 (Amended Revision Copy)',
        statement: 'ADDENDUM TO WIRE DISPATCH RECORD: NetSec forensic inspection recovered packet captures demonstrating DNS exfiltration through domain relay "gateway-sync-auth.cc". Attached 2 raw pcap logs and authorization header dumps. Impact adjusted to $142,500.00 USD.',
        incidentLocation: 'New York HQ Data Center & DNS Relay',
        suspectDetails: 'Ex-contractor credential ID #X-8809 & Offshore Host 185.220.101.4',
        financialLossEstimated: '$142,500.00 USD',
        attachments: [
          {
            id: 'att-101',
            fileName: 'swift_gateway_audit_sept14.csv',
            fileSize: '1.42 MB',
            mimeType: 'text/csv',
            sha256Hash: 'a4f89d3118992e9e6c4b22c71289cf0099e013ab6611442998aabcf012431289',
            uploadedAt: '2026-09-14T08:35:00Z',
          },
          {
            id: 'att-102',
            fileName: 'revoked_token_signature.log',
            fileSize: '412 KB',
            mimeType: 'text/plain',
            sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            uploadedAt: '2026-09-14T08:35:00Z',
          },
          {
            id: 'att-103',
            fileName: 'dns_tunnel_pcap_dump.pcapng',
            fileSize: '8.90 MB',
            mimeType: 'application/vnd.tcpdump.pcap',
            sha256Hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
            uploadedAt: '2026-09-16T14:15:00Z',
          }
        ],
        sha256Seal: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
        parentSealHash: 'a4f89d3118992e9e6c4b22c71289cf0099e013ab6611442998aabcf012431289',
        canonicalJson: '{"complaintId":"CMP-2026-88192","version":2}',
        merkleRoot: 'mrk_8f434346648f6b96df89dda901c5176b',
        revisionNotes: 'Added DNS tunneling pcap evidence and updated damages based on forensic reconciliation.',
        submittedAt: '2026-09-16T14:15:00Z',
        submittedBy: {
          userId: 'usr-001',
          userName: 'bluesapphiiire777 (Director of Cyber Sec)',
          userEmail: 'bluesapphiiire777@gmail.com',
          userBadge: 'FIP-8841-INV',
        },
        wormEnforced: 'WORM_IMMUTABLE',
      }
    ],
    seniorReview: {
      assignedTo: 'Agent James Vance (Senior Lead)',
      investigatorBadge: 'FIP-4091-INV',
      investigatorEmail: 'j.vance@fip-agency.internal',
      status: 'FORENSIC_ANALYSIS',
      forensicSummary: 'Re-verified all 3 cryptographic SHA-256 attachment hashes against raw storage. The DNS tunnel pcap exhibits high-entropy base64 beacons matching known APT-41 tooling.',
      legalAssessment: 'Violations of 18 U.S. Code § 1030 (Fraud and Related Activity in Connection with Computers). Sufficient evidence for grand jury subpoena.',
      hypothesis: 'Attacker maintained persistence via compromised secondary SSH bastion before key revocation.',
      actionChecklist: [
        { id: 'chk-1', task: 'Cross-reference offshore IP 185.220.101.4 with Threat Intel feeds', completed: true },
        { id: 'chk-2', task: 'Extract full Merkle proof of the CSV audit ledger', completed: true },
        { id: 'chk-3', task: 'Prepare formal court-admissible forensic certificate', completed: false },
      ],
      investigationLogs: [
        {
          id: 'log-rev-1',
          timestamp: '2026-09-15T10:00:00Z',
          investigatorName: 'Agent James Vance',
          investigatorBadge: 'FIP-4091-INV',
          action: 'CASE_ACCEPTED',
          notes: 'Case dossier assigned to Senior Case Research division. Cryptographic seal verified.',
          statusTransition: 'UNDER_REVIEW'
        },
        {
          id: 'log-rev-2',
          timestamp: '2026-09-16T15:30:00Z',
          investigatorName: 'Agent James Vance',
          investigatorBadge: 'FIP-4091-INV',
          action: 'AMENDMENT_AUDITED',
          notes: 'Audited Version 2.0 amendment. Original v1.0 integrity preserved without mutations. pcap verified.',
          statusTransition: 'FORENSIC_ANALYSIS'
        }
      ],
      lastReviewedAt: '2026-09-16T15:30:00Z',
    },
    createdAt: '2026-09-14T08:35:00Z',
    updatedAt: '2026-09-16T15:30:00Z',
  },
  {
    id: 'CMP-2026-90412',
    complainantId: 'usr-003',
    complainantName: 'Dr. Elena Rostova',
    complainantEmail: 'e.rostova@fip-agency.internal',
    complainantBadge: 'FIP-7712-CRYPTO',
    title: 'Quantum Key Distribution Node Calibration Forgery & Tamper Attempt',
    category: 'DOCUMENT_FORGERY',
    incidentDate: '2026-09-18T19:00:00Z',
    priority: 'HIGH',
    status: 'EVIDENCE_VERIFIED',
    currentVersionNumber: 1,
    originalSha256Seal: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    latestSha256Seal: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    isWormLocked: true,
    versions: [
      {
        versionNumber: 1,
        isOriginal: true,
        versionLabel: 'v1.0 (Original Master Filing)',
        statement: 'During routine hardware security module inspection, physical tamper tape seal on QKD Optical Commutation Rack #7 was severed. Calibration certificates submitted to internal repository show modified cryptographic public exponent.',
        incidentLocation: 'Zurich Subterranean Quantum Interconnect Lab',
        suspectDetails: 'Physical access log ID #SEC-ZUR-412',
        financialLossEstimated: '$45,000.00 USD (Equipment downtime)',
        attachments: [
          {
            id: 'att-201',
            fileName: 'tamper_seal_optical_microscope_4k.png',
            fileSize: '4.20 MB',
            mimeType: 'image/png',
            sha256Hash: 'b5d4045c3f466fa91fe2cc6abe79232a1a57cdf104f7a26e716e0a1e2789df78',
            uploadedAt: '2026-09-18T19:20:00Z',
          }
        ],
        sha256Seal: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        canonicalJson: '{"complaintId":"CMP-2026-90412","version":1}',
        merkleRoot: 'mrk_7f83b1657ff1fc53b92dc18148a1d65d',
        submittedAt: '2026-09-18T19:20:00Z',
        submittedBy: {
          userId: 'usr-003',
          userName: 'Dr. Elena Rostova',
          userEmail: 'e.rostova@fip-agency.internal',
          userBadge: 'FIP-7712-CRYPTO',
        },
        wormEnforced: 'WORM_IMMUTABLE',
      }
    ],
    seniorReview: {
      assignedTo: 'Special Auditor David Ross',
      investigatorBadge: 'FIP-9900-AUDIT',
      investigatorEmail: 'd.ross@justice-audit.org',
      status: 'EVIDENCE_VERIFIED',
      forensicSummary: 'Physical evidence microscope image matches mechanical shear pattern. Certificate hash mismatches verified against hardware ROM.',
      actionChecklist: [
        { id: 'chk-1', task: 'Lockdown Zurich node access logs', completed: true },
        { id: 'chk-2', task: 'Issue hardware recall directive', completed: true }
      ],
      investigationLogs: [
        {
          id: 'log-rev-3',
          timestamp: '2026-09-19T09:00:00Z',
          investigatorName: 'Special Auditor David Ross',
          investigatorBadge: 'FIP-9900-AUDIT',
          action: 'EVIDENCE_VERIFICATION_COMPLETE',
          notes: 'All physical microscope seals verified cryptographically.',
          statusTransition: 'EVIDENCE_VERIFIED'
        }
      ],
      lastReviewedAt: '2026-09-19T09:00:00Z'
    },
    createdAt: '2026-09-18T19:20:00Z',
    updatedAt: '2026-09-19T09:00:00Z',
  }
];

export const useStore = create<FIPState>((set, get) => {
  // Read initial user from localStorage if present or default to Senior Inspector FIPG 3638
  let initialUser: User | null = null;
  try {
    const saved = localStorage.getItem('fip_user_session');
    if (saved) initialUser = JSON.parse(saved);
  } catch (e) {}

  if (!initialUser) {
    initialUser = {
      id: 'usr-001',
      name: 'Senior Inspector FIPG 3638',
      email: 'bluesapphiiire777@gmail.com',
      role: 'CHIEF_INVESTIGATOR',
      badgeId: 'FIPG-3638',
      authProvider: 'FIP_POLICE_HQ_CREDENTIAL'
    };
  }

  // Read persisted evidence from localStorage if present
  let combinedEvidence: Evidence[] = initialEvidenceData;
  try {
    const savedEvidence = localStorage.getItem('fip_user_evidence');
    if (savedEvidence) {
      const parsed: Evidence[] = JSON.parse(savedEvidence);
      // Merge unique items based on ID
      const existingIds = new Set(initialEvidenceData.map(e => e.id));
      const userAdded = parsed.filter(e => !existingIds.has(e.id));
      combinedEvidence = [...userAdded, ...initialEvidenceData];
    }
  } catch (e) {}

  // Read persisted complaints from localStorage if present
  let combinedComplaints: Complaint[] = initialComplaintsData;
  try {
    const savedComplaints = localStorage.getItem('fip_user_complaints');
    if (savedComplaints) {
      combinedComplaints = JSON.parse(savedComplaints);
    }
  } catch (e) {}

  // Read persisted senior reports from localStorage if present
  let combinedSeniorReports: SeniorWorkstationReport[] = initialSeniorReportsData;
  try {
    const savedReports = localStorage.getItem('fip_senior_reports');
    if (savedReports) {
      combinedSeniorReports = JSON.parse(savedReports);
    }
  } catch (e) {}

  return {
    currentUser: initialUser,
    selectedUserIdFilter: null,
    setSelectedUserIdFilter: (userId) => set({ selectedUserIdFilter: userId }),
    googleDriveConnected: false,
    googleDriveAccessToken: null,
    googleDriveUserEmail: null,
    complaints: combinedComplaints,
    activeComplaint: combinedComplaints[0] || null,
    seniorReports: combinedSeniorReports,
    isSeniorInvestigatorView: true,
    addSeniorReport: (report) => {
      set((state) => {
        const updated = [report, ...state.seniorReports];
        try {
          localStorage.setItem('fip_senior_reports', JSON.stringify(updated));
        } catch (e) {}
        return {
          seniorReports: updated,
          activeNotification: `📋 POLICE REPORT FILED: Case ${report.caseId} Sealed by Senior Inspector FIPG 3638`
        };
      });
      // Synchronize with MongoDB backend
      fetch('/api/senior-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      }).catch(err => console.warn('Senior report backend sync notice:', err));
    },
    updateSeniorReport: (id, updates) => {
      set((state) => {
        const updated = state.seniorReports.map(r => r.id === id ? { ...r, ...updates } : r);
        try {
          localStorage.setItem('fip_senior_reports', JSON.stringify(updated));
        } catch (e) {}
        return { seniorReports: updated };
      });
    },
    deleteSeniorReport: (id) => {
      set((state) => {
        const updated = state.seniorReports.filter(r => r.id !== id);
        try {
          localStorage.setItem('fip_senior_reports', JSON.stringify(updated));
        } catch (e) {}
        return { seniorReports: updated };
      });
      fetch(`/api/senior-reports/${id}`, { method: 'DELETE' }).catch(() => {});
    },
    setComplaints: (complaints) => {
      try {
        localStorage.setItem('fip_user_complaints', JSON.stringify(complaints));
      } catch (e) {}
      set({ complaints });
    },
    setActiveComplaint: (complaint) => set({ activeComplaint: complaint }),
    toggleSeniorInvestigatorView: () => set((state) => ({ isSeniorInvestigatorView: !state.isSeniorInvestigatorView })),
    fetchComplaints: async (isSenior = false) => {
      try {
        const state = get();
        const userEmail = state.currentUser?.email || 'bluesapphiiire777@gmail.com';
        const url = isSenior ? '/api/complaints?isSenior=true' : `/api/complaints?userEmail=${encodeURIComponent(userEmail)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.complaints && Array.isArray(data.complaints)) {
            set({ complaints: data.complaints });
            if (!get().activeComplaint && data.complaints.length > 0) {
              set({ activeComplaint: data.complaints[0] });
            }
          }
        }
      } catch (err) {
        console.warn('Complaints fetch notice:', err);
      }
    },
    createComplaint: async (payload: any) => {
      try {
        const res = await fetch('/api/complaints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.complaint) {
            set((state) => {
              const updated = [data.complaint, ...state.complaints];
              try {
                localStorage.setItem('fip_user_complaints', JSON.stringify(updated));
              } catch (e) {}
              return {
                complaints: updated,
                activeComplaint: data.complaint,
                activeNotification: `🛡️ COMPLAINT RECORDED: ${data.complaint.id} SEALED IN WORM IMMUTABLE MODE`
              };
            });
            return data.complaint;
          }
        }
      } catch (err) {
        console.error('Create complaint error:', err);
      }
      return null;
    },
    amendComplaint: async (complaintId: string, payload: any) => {
      try {
        const res = await fetch(`/api/complaints/${complaintId}/amend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.complaint) {
            set((state) => {
              const updated = state.complaints.map(c => c.id === complaintId ? data.complaint : c);
              try {
                localStorage.setItem('fip_user_complaints', JSON.stringify(updated));
              } catch (e) {}
              return {
                complaints: updated,
                activeComplaint: data.complaint,
                activeNotification: `📝 VERSION ${data.complaint.currentVersionNumber}.0 CREATED (ORIGINAL v1.0 PRESERVED)`
              };
            });
            return data.complaint;
          }
        }
      } catch (err) {
        console.error('Amend complaint error:', err);
      }
      return null;
    },
    reviewComplaint: async (complaintId: string, payload: any) => {
      try {
        const res = await fetch(`/api/complaints/${complaintId}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.complaint) {
            set((state) => {
              const updated = state.complaints.map(c => c.id === complaintId ? data.complaint : c);
              try {
                localStorage.setItem('fip_user_complaints', JSON.stringify(updated));
              } catch (e) {}
              return {
                complaints: updated,
                activeComplaint: data.complaint,
                activeNotification: `⚖️ SENIOR INVESTIGATOR DOSSIER UPDATED: ${complaintId}`
              };
            });
            return data.complaint;
          }
        }
      } catch (err) {
        console.error('Review complaint error:', err);
      }
      return null;
    },
    setGoogleDriveAccessToken: (token, email) => set({
      googleDriveAccessToken: token,
      googleDriveConnected: Boolean(token),
      googleDriveUserEmail: email || null,
      activeNotification: token ? `🟢 CONNECTED TO PERSONAL GOOGLE DRIVE ACCOUNT (${email || 'bluesapphiiire777@gmail.com'})` : '🔴 DISCONNECTED FROM GOOGLE DRIVE'
    }),
    updateEvidenceDriveUrl: (evidenceId, driveUrl, driveFileId, isDriveSynced = true) => set((state) => ({
      evidence: state.evidence.map((ev) => ev.id === evidenceId ? {
        ...ev,
        driveUrl,
        driveFileId: driveFileId || ev.driveFileId,
        isDriveSynced
      } : ev)
    })),
    isVaultFrozen: false,
    tamperAlertsCount: 0,
    activeNotification: '⚡ AUTOMATED DIGITAL RECEIPT GENERATED & SENT TO REGISTERED EMAIL',
    sessionKey: 'KEY-0x9F' + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase() + '-ED25519',
    cases: [
      {
        id: 'case-001',
        caseName: 'Operation Nightfall - Cryptographic Exfiltration',
        customerId: 'INTERPOL-EC3 / DEPT-DEF',
        classification: 'TOP_SECRET',
        status: 'UNDER_INVESTIGATION',
        progress: 78,
        fileCount: 14,
        actionBadge: 'UPLOADS REQUIRED',
        createdAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'case-002',
        caseName: 'Project Chimera Volatile Memory Leak',
        customerId: 'DEPT-CYBER-SEC',
        classification: 'SECRET',
        status: 'OPEN',
        progress: 92,
        fileCount: 8,
        actionBadge: 'VERIFIED',
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'case-003',
        caseName: 'Quantum HSM Hardware Key Breach Vector',
        customerId: 'FINRA-SPECIAL-CRIMES',
        classification: 'RESTRICTED',
        status: 'UNDER_INVESTIGATION',
        progress: 45,
        fileCount: 5,
        actionBadge: 'IN AUDIT',
        createdAt: Date.now() - 86400000 * 4,
      }
    ],
    evidence: combinedEvidence,
    accounts: initialAccountsData,
    tamperAlerts: initialTamperAlertsData,
    iocs: initialIocsData,
    timelineEvents: initialTimelineEventsData,
    tickerLogs: [
      {
        id: 'tlog-1',
        timestamp: '10:32:07 UTC',
        userLabel: 'USER #2 (Agent James Vance)',
        action: 'UPLOADED',
        target: 'sys_core_dump_enclave_0x77.raw',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        caseId: 'case-001',
      },
      {
        id: 'tlog-2',
        timestamp: '10:30:14 UTC',
        userLabel: 'CHIEF LEAD (bluesapphiiire777)',
        action: 'VERIFIED',
        target: 'perimeter_firewall_pcap_20260819.log',
        sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
        caseId: 'case-001',
      },
      {
        id: 'tlog-3',
        timestamp: '10:28:40 UTC',
        userLabel: 'USER #3 (Dr. Elena Rostova)',
        action: 'EXPORTED_PDF',
        target: 'FIP_Court_Report_case-001.pdf',
        sha256Hash: '7c328cb08b5531fcacdabf8a4b227777d4dd1fc61c6f884f48641d02b4d121d3',
        caseId: 'case-001',
      },
      {
        id: 'tlog-4',
        timestamp: '10:24:19 UTC',
        userLabel: 'CHIEF LEAD (bluesapphiiire777)',
        action: 'CASE_FROZEN',
        target: 'Operation Nightfall Vault',
        sha256Hash: 'SEALED-WORM-VAULT-IMMUTABLE-001',
        caseId: 'case-001',
      }
    ],
    tasks: [
      {
        id: 'task-1',
        caseId: 'case-001',
        title: 'Analyze encrypted volume headers',
        description: 'Check SHA-256 entropy matrix for key derivation indicators',
        status: 'IN_PROGRESS',
        assignedTo: 'usr-001',
        updatedAt: Date.now(),
      },
      {
        id: 'task-2',
        caseId: 'case-001',
        title: 'Ingest and anchor raw pcap stream to immutable ledger',
        description: 'Validate zero bit drift across 2,048 cloud chunk blocks',
        status: 'COMPLETED',
        assignedTo: 'usr-002',
        updatedAt: Date.now() - 3600000,
      },
      {
        id: 'task-3',
        caseId: 'case-002',
        title: 'Perform Diff Analysis against untouched master image',
        description: 'Ensure annotations have signed cryptographic investigator receipts',
        status: 'OPEN',
        assignedTo: 'usr-003',
        updatedAt: Date.now() - 7200000,
      },
      {
        id: 'task-4',
        caseId: 'case-003',
        title: 'Export tamper-evident Proof Certificate for legal deposit',
        description: 'Generate timestamped Merkle proof package signed by Lead',
        status: 'OPEN',
        assignedTo: 'usr-001',
        updatedAt: Date.now() - 14400000,
      }
    ],
    setCurrentUser: (user) => {
      try {
        if (user) {
          localStorage.setItem('fip_user_session', JSON.stringify(user));
        } else {
          localStorage.removeItem('fip_user_session');
        }
      } catch (e) {}
      set({ currentUser: user });
    },
    addCase: (newCase) => set((state) => ({ cases: [newCase, ...state.cases] })),
    toggleCaseFreeze: (caseId) => set((state) => ({
      cases: state.cases.map(c => {
        if (c.id === caseId) {
          const nextFrozen = !c.isFrozen;
          return {
            ...c,
            isFrozen: nextFrozen,
            status: nextFrozen ? 'FROZEN' : 'UNDER_INVESTIGATION',
            actionBadge: nextFrozen ? 'SEALED' : 'IN AUDIT'
          };
        }
        return c;
      })
    })),
    updateCaseStatus: (caseId, status) => set((state) => ({
      cases: state.cases.map(c => c.id === caseId ? { ...c, status } : c)
    })),
    addEvidence: (newEvidence) => set((state) => {
      const updated = [newEvidence, ...state.evidence];
      try {
        localStorage.setItem('fip_user_evidence', JSON.stringify(updated));
      } catch (e) {}
      return { evidence: updated };
    }),
    addAnnotation: (evidenceId, annotation) => set((state) => ({
      evidence: state.evidence.map(item => {
        if (item.id === evidenceId) {
          return {
            ...item,
            annotations: [annotation, ...(item.annotations || [])]
          };
        }
        return item;
      })
    })),
    updateTask: (taskId, updates) => set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t)
    })),
    toggleTask: (taskId) => set((state) => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'COMPLETED' ? 'OPEN' : 'COMPLETED';
          return { ...t, status: nextStatus, updatedAt: Date.now() };
        }
        return t;
      })
    })),
    rotateSessionKey: () => {
      const newKey = 'KEY-0x' + Math.floor(10000000 + Math.random() * 90000000).toString(16).toUpperCase() + '-ED25519';
      set({ sessionKey: newKey });
      return newKey;
    },
    toggleVaultFreeze: () => {
      let nextState = false;
      set((state) => {
        nextState = !state.isVaultFrozen;
        return { isVaultFrozen: nextState };
      });
      return nextState;
    },
    reportTamperAlert: (alert) => set((state) => {
      const newAlert: TamperAlert = {
        id: `TMP-${Math.floor(900 + Math.random() * 100)}`,
        evidenceId: alert?.evidenceId || 'EVD-90412-ALPHA',
        evidenceTitle: alert?.evidenceTitle || 'sys_core_dump_enclave_0x77.raw',
        editorName: alert?.editorName || 'Unknown Ext Agent',
        editorEmail: alert?.editorEmail || 'anon@security-leak.org',
        editorPhone: alert?.editorPhone || '+1 (555) 999-0000',
        editorIp: alert?.editorIp || '198.51.100.88 (Unverified Gateway)',
        severity: alert?.severity || 'HIGH',
        tamperType: alert?.tamperType || 'UNAUTHORIZED_OFFSET_MODIFICATION',
        exactDiff: alert?.exactDiff || '- [DIFF]: In-memory bit alteration detected\n+ [FIP-GUARD]: Enclave rejection triggered',
        rawPayloadBefore: alert?.rawPayloadBefore || 'ORIGINAL BIT STREAM',
        rawPayloadAfter: alert?.rawPayloadAfter || 'MODIFIED BIT STREAM',
        timestamp: new Date().toUTCString(),
        status: 'PENDING_REVIEW',
        ...alert
      };
      return {
        tamperAlerts: [newAlert, ...state.tamperAlerts],
        tamperAlertsCount: state.tamperAlertsCount + 1,
        activeNotification: `🚨 EMERGENCY TAMPER FLAG RECORDED: ${newAlert.evidenceTitle}`
      };
    }),
    resolveTamperAlert: (alertId, resolutionNotes) => set((state) => ({
      tamperAlerts: state.tamperAlerts.map(a => a.id === alertId ? {
        ...a,
        status: 'RESOLVED',
        resolvedBy: state.currentUser?.name || 'bluesapphiiire777 (Chief Lead)',
        resolutionNotes: resolutionNotes || 'Integrity verified and forensic perimeter locked down.'
      } : a),
      tamperAlertsCount: Math.max(0, state.tamperAlertsCount - 1)
    })),
    addIocArtifact: (ioc) => set((state) => ({ iocs: [ioc, ...state.iocs] })),
    addTimelineEvent: (event) => set((state) => ({ timelineEvents: [event, ...state.timelineEvents] })),
    addTickerLog: (log) => set((state) => {
      const newLog: TickerLog = {
        id: `tlog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...log
      };
      return { tickerLogs: [newLog, ...(state.tickerLogs || [])] };
    }),
    setNotification: (msg) => set({ activeNotification: msg }),
  };
});

if (typeof window !== 'undefined') {
  (window as any).__FIP_STORE__ = useStore;
}

