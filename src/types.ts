export enum InvestigationStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  SEALING = 'SEALING',
  VERIFIED = 'VERIFIED',
  OPEN = 'OPEN',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  badgeId?: string;
  picture?: string;
  authProvider?: string;
}

export interface EvidenceAnnotation {
  id: string;
  evidenceId: string;
  investigatorName: string;
  badgeId: string;
  phone: string;
  email: string;
  diffDescription: string;
  noteCategory: 'FORENSIC_NOTE' | 'HEADER_PATCH' | 'METADATA_DIFF' | 'CHAIN_OF_CUSTODY' | 'INTEGRITY_STAMP';
  timestamp: string;
  ipHash: string;
  verified: boolean;
}

export interface Case {
  id: string;
  caseName: string;
  customerId: string;
  classification: string;
  status: InvestigationStatus | string;
  progress?: number;
  fileCount?: number;
  actionBadge?: 'UPLOADS REQUIRED' | 'VERIFIED' | 'IN AUDIT' | 'SEALED' | 'HIGH PRIORITY';
  isFrozen?: boolean;
  assignedUsers?: string[];
  createdAt: number;
}

export interface Evidence {
  id: string;
  caseId: string;
  title: string;
  type: string;
  size?: string;
  sha256Hash: string;
  content?: string;
  imageUrl?: string;
  fileDataUrl?: string;
  targetRefId?: string;
  digitalSealSignature?: string;
  uploadedBy: string;
  uploadedByBadge?: string;
  uploaderId?: string;
  uploaderEmail?: string;
  isCanary?: boolean;
  canaryCallbackUrl?: string;
  createdAt: number;
  merkleRoot?: string;
  chunkCount?: number;
  depositStatus?: 'PENDING' | 'SECURED' | 'ANCHORED';
  receiptSent?: boolean;
  driveFileId?: string;
  driveUrl?: string;
  folderName?: string;
  isDriveSynced?: boolean;
  isWormLocked?: boolean;
  commitPrompt?: string;
  commitMessage?: string;
  biometricSignature?: string;
  annotations?: EvidenceAnnotation[];
  isFrozen?: boolean;
}

export interface Task {
  id: string;
  caseId: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  assignedTo: string;
  updatedAt: number;
}

export interface CaseFile {
  id: string;
  name: string;
  status: InvestigationStatus;
  timestamp: string;
  hash?: string;
  evidenceType: string;
  imageUrl?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  badgeId: string;
  role: 'CHIEF_INVESTIGATOR' | 'SENIOR_EXAMINER' | 'FORENSIC_ANALYST' | 'CUSTODY_OFFICER' | 'LEGAL_AUDITOR';
  assignedCasesCount: number;
  cloudVaultUsage: string;
  cloudVaultBytes: number;
  lastActiveIp: string;
  lastActiveTime: string;
  picture?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED';
  phone?: string;
}

export interface TamperAlert {
  id: string;
  evidenceId: string;
  evidenceTitle: string;
  editorName: string;
  editorEmail: string;
  editorPhone: string;
  editorIp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  tamperType: 'UNAUTHORIZED_OFFSET_MODIFICATION' | 'SHA256_MISMATCH' | 'WORM_PERMISSION_VIOLATION' | 'TIME_STAMP_ANOMALY';
  exactDiff: string;
  rawPayloadBefore: string;
  rawPayloadAfter: string;
  timestamp: string;
  status: 'PENDING_REVIEW' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED';
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface IOCArtifact {
  id: string;
  type: 'IP_ADDRESS' | 'SHA256_HASH' | 'CCTV_FEED' | 'FILE_ARTIFACT' | 'REGISTRY_KEY' | 'MEMORY_OFFSET';
  value: string;
  label: string;
  caseId: string;
  threatActor?: string;
  confidence: 'CONFIRMED' | 'SUSPECTED' | 'UNVERIFIED';
  mitreTag: string;
  discoveredAt: string;
  notes: string;
  cctvStreamUrl?: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  title: string;
  timestamp: string;
  durationHours: number;
  category: 'EXFILTRATION' | 'EVIDENCE_INGESTION' | 'TAMPER_ATTEMPT' | 'WORM_LOCK' | 'LEGAL_DEPOSIT';
  investigator: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
}

export interface ProofCertificate {
  certificateId: string;
  evidenceId: string;
  fileName: string;
  caseName: string;
  sha256Hash: string;
  merkleRoot: string;
  issuerBadge: string;
  recipientEmail: string;
  issuedAt: string;
  signature: string;
}

export interface TickerLog {
  id: string;
  timestamp: string;
  userLabel: string;
  action: 'UPLOADED' | 'VERIFIED' | 'EXPORTED_PDF' | 'CASE_FROZEN' | 'CASE_UNFROZEN' | 'TAMPER_ALERT';
  target: string;
  sha256Hash: string;
  caseId: string;
}

// ----------------------------------------------------
// STRUCTURED COMPLAINT & FORENSIC VERSIONING SCHEMAS
// ----------------------------------------------------

export type ComplaintCategory = 
  | 'FINANCIAL_FRAUD'
  | 'CYBER_EXTORTION'
  | 'IDENTITY_THEFT'
  | 'DATA_BREACH'
  | 'DOCUMENT_FORGERY'
  | 'CORPORATE_ESPIONAGE'
  | 'HARASSMENT_STALKING'
  | 'INTELLECTUAL_PROPERTY'
  | 'UNAUTHORIZED_ACCESS'
  | 'OTHER_OFFENSE';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ComplaintStatus = 
  | 'REGISTERED'
  | 'UNDER_REVIEW'
  | 'FORENSIC_ANALYSIS'
  | 'EVIDENCE_VERIFIED'
  | 'ESCALATED'
  | 'SOLVED'
  | 'CLOSED';

export interface ComplaintAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  sha256Hash: string;
  contentSnippet?: string;
  fileDataUrl?: string;
  driveUrl?: string;
  uploadedAt: string;
}

export interface ComplaintVersion {
  versionNumber: number;
  isOriginal: boolean;
  versionLabel: string;
  statement: string;
  incidentLocation?: string;
  suspectDetails?: string;
  financialLossEstimated?: string;
  attachments: ComplaintAttachment[];
  sha256Seal: string;
  parentSealHash?: string;
  canonicalJson: string;
  merkleRoot: string;
  revisionNotes?: string;
  submittedAt: string;
  submittedBy: {
    userId: string;
    userName: string;
    userEmail: string;
    userBadge?: string;
  };
  wormEnforced: 'WORM_IMMUTABLE';
}

export interface InvestigatorLogEntry {
  id: string;
  timestamp: string;
  investigatorName: string;
  investigatorBadge: string;
  action: string;
  notes: string;
  statusTransition?: ComplaintStatus;
}

export interface SeniorInvestigatorReview {
  assignedTo: string;
  investigatorBadge: string;
  investigatorEmail: string;
  status: ComplaintStatus;
  forensicSummary?: string;
  legalAssessment?: string;
  hypothesis?: string;
  actionChecklist?: Array<{ id: string; task: string; completed: boolean }>;
  investigationLogs: InvestigatorLogEntry[];
  lastReviewedAt?: string;
  resolutionReport?: {
    conclusion: string;
    resolvedAt: string;
    evidentiaryConfidence: 'HIGH' | 'MEDIUM' | 'INCONCLUSIVE';
    recommendedNextStep: string;
  };
}

export interface WorkstationTeamMember {
  id: string;
  name: string;
  phone: string;
  badge: string;
  role: string;
}

export interface SeniorWorkstationReport {
  id: string;
  reportDate: string;
  timestamp: string;
  investigatorName: string;
  investigatorBadge: string;
  caseId: string;
  caseTitle: string;
  caseCategory: string;
  partnerTeam: WorkstationTeamMember[];
  ideasImplemented: string;
  findingsBreakthroughs: string;
  caseProgressPercentage: number;
  caseStatusAccordingToLead: 'INTAKE_STUDY' | 'ACTIVE_FIELDWORK' | 'CRYPTO_CROSS_EXAMINATION' | 'VERDICT_SEALED' | 'SOLVED_CLOSED';
  verdictSummary: string;
  sha256Seal: string;
  courtReady: boolean;
}

export interface Complaint {
  id: string;
  complainantId: string;
  complainantName: string;
  complainantEmail: string;
  complainantBadge?: string;
  title: string;
  category: ComplaintCategory;
  incidentDate: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  currentVersionNumber: number;
  latestSha256Seal: string;
  originalSha256Seal: string;
  versions: ComplaintVersion[];
  seniorReview?: SeniorInvestigatorReview;
  workstationReports?: SeniorWorkstationReport[];
  isWormLocked: true;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// AI TWIN-CASE PATTERN & COLD-CASE CROSS-MATCHER TYPES
// ----------------------------------------------------

export interface CasePatternFilterSettings {
  focusVectors: {
    wordingSyntax: boolean;
    locationGeocoding: boolean;
    suspectSignature: boolean;
    attackModusOperandi: boolean;
    targetVector: boolean;
  };
  minSimilarityThreshold: number; // 0 to 100
  keywordFilter: string;
  categoryFilter: string;
  timeframeScope: 'ALL_TIME' | 'PAST_30_DAYS' | 'PAST_6_MONTHS' | 'PAST_2_YEARS' | 'COLD_CASES_ONLY';
}

export interface CaseSimilarityVectorScore {
  overallSimilarity: number; // 0 - 100%
  wordingSyntaxScore: number;
  locationProximityScore: number;
  criminalSignatureScore: number;
  attackMoScore: number;
  temporalRelevanceScore: number;
}

export interface SharedCluePoint {
  id: string;
  category: 'LOCATION' | 'WORDING' | 'CRIMINAL' | 'ATTACK_VECTOR' | 'EVIDENCE_HASH' | 'TIMING';
  title: string;
  activeCaseSnippet: string;
  priorCaseSnippet: string;
  significance: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  explanation: string;
}

export interface TwinCaseMatchItem {
  priorCaseId: string;
  priorCaseTitle: string;
  priorCaseCategory: string;
  priorCaseStatus: string;
  priorCaseDate: string;
  priorLocation: string;
  priorSuspects: string;
  priorModusOperandi: string;
  priorResolutionVerdict?: string;
  similarity: CaseSimilarityVectorScore;
  sharedClues: SharedCluePoint[];
  criminalAttributionLead: {
    suspectIdentified: string;
    aliasOrHandle?: string;
    recurringSignature: string;
    probabilityScore: number; // 0 - 100%
    rationale: string;
  };
  recommendedAction: string;
  studyPriority: 'URGENT_STUDY' | 'HIGH_RELEVANCE' | 'CORROBORATING_LEAD' | 'LOW_SIMILARITY';
}

export interface AiCrossCaseMatchResponse {
  success: boolean;
  activeCaseId: string;
  analyzedPriorCasesCount: number;
  topMatches: TwinCaseMatchItem[];
  forensicSynthesisSummary: string;
  primaryPerpetratorProfile: {
    matchedIdentity: string;
    knownAliases: string[];
    modusOperandiSignature: string;
    connectedPriorCaseIds: string[];
    suggestedWarrantTarget: string;
    confidenceLevel: 'HIGH_CERTAINTY' | 'STRONG_INDICATIVE' | 'EXPLORATORY';
  };
  suggestedStudyPathway: string[];
  generatedAt: string;
}

export interface CasePatternBotMessage {
  id: string;
  sender: 'SENIOR_LEAD' | 'AI_PATTERN_COPILOT';
  text: string;
  timestamp: string;
  matchedCases?: TwinCaseMatchItem[];
  highlightedClues?: SharedCluePoint[];
  suggestedPrompts?: string[];
}

