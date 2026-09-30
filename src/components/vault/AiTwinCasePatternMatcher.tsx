import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  Search, 
  Filter, 
  Sliders, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Fingerprint, 
  MapPin, 
  FileText, 
  Send, 
  Bot, 
  RotateCcw, 
  Zap, 
  ExternalLink, 
  BookOpen, 
  Award, 
  GitCompare, 
  BadgeAlert,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Compass,
  Tag,
  Crosshair
} from 'lucide-react';
import { 
  Complaint, 
  Case, 
  Evidence, 
  CasePatternFilterSettings, 
  TwinCaseMatchItem, 
  AiCrossCaseMatchResponse, 
  CasePatternBotMessage,
  SharedCluePoint 
} from '../../types';
import { ForensicSimilarityDottedMap } from './ForensicSimilarityDottedMap';

interface AiTwinCasePatternMatcherProps {
  activeCase: {
    id: string;
    title: string;
    category: string;
    statement?: string;
    incidentLocation?: string;
    suspectDetails?: string;
    incidentDate?: string;
    status?: string;
  };
  allComplaints: Complaint[];
  allCases: Case[];
  allEvidence: Evidence[];
  onApplyInsightsToReport?: (insights: {
    ideasImplemented: string;
    findingsBreakthroughs: string;
    verdictSummary: string;
    recommendedSuspect: string;
  }) => void;
  onSelectCaseForStudy?: (caseId: string) => void;
}

export const AiTwinCasePatternMatcher: React.FC<AiTwinCasePatternMatcherProps> = ({
  activeCase,
  allComplaints,
  allCases,
  allEvidence,
  onApplyInsightsToReport,
  onSelectCaseForStudy,
}) => {
  // Filter settings state
  const [filters, setFilters] = useState<CasePatternFilterSettings>({
    focusVectors: {
      wordingSyntax: true,
      locationGeocoding: true,
      suspectSignature: true,
      attackModusOperandi: true,
      targetVector: true,
    },
    minSimilarityThreshold: 40,
    keywordFilter: '',
    categoryFilter: 'ALL',
    timeframeScope: 'ALL_TIME'
  });

  // Cross-match results state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResponse, setMatchResponse] = useState<AiCrossCaseMatchResponse | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<TwinCaseMatchItem | null>(null);
  const [activeTab, setActiveTab] = useState<'MATCHES_MAP' | 'COPILOT_CHAT' | 'TWIN_DIFF'>('MATCHES_MAP');

  // AI Copilot Chat state
  const [chatMessages, setChatMessages] = useState<CasePatternBotMessage[]>([
    {
      id: 'msg-init',
      sender: 'AI_PATTERN_COPILOT',
      text: `Hello Senior Inspector FIPG 3638. I am your specialized **AI Twin-Case Pattern & Criminal Cross-Matcher**.
I have indexed all historical cases, archived affidavits, and evidence checksums in your workstation docket.
Select your vector filters above or ask me to compare the active case against any prior incident to identify recurring perpetrators and matching attack actions.`,
      timestamp: new Date().toLocaleTimeString(),
      suggestedPrompts: [
        'Find previous cases with identical DNS tunneling & ex-contractor tokens',
        'Compare phrasing & technical jargon with the SWIFT fraud case',
        'Are there any matching physical or cyber locations in prior filings?',
        'Who is the primary recurring suspect based on this attack MO?'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Separate Filter Box Modal State
  const [isFilterBoxOpen, setIsFilterBoxOpen] = useState(false);

  // Initial analysis run
  useEffect(() => {
    runCrossCaseAnalysis();
  }, [activeCase.id]);

  // Run AI Cross Match
  const runCrossCaseAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Build prior cases payload
      const priorCasesPayload = [
        ...allComplaints
          .filter(c => c.id !== activeCase.id)
          .map(c => ({
            id: c.id,
            title: c.title,
            category: c.category,
            statement: c.versions?.[c.versions.length - 1]?.statement || c.title,
            incidentLocation: c.versions?.[c.versions.length - 1]?.incidentLocation || 'Corporate HQ / Data Center',
            suspectDetails: c.versions?.[c.versions.length - 1]?.suspectDetails || 'Unidentified Threat Actor',
            incidentDate: c.incidentDate || c.createdAt,
            status: c.status,
            moduOperandi: c.seniorReview?.hypothesis || c.category,
            verdict: c.seniorReview?.forensicSummary || 'Prior resolved incident',
          })),
        ...allCases
          .filter(c => c.id !== activeCase.id)
          .map(c => ({
            id: c.id,
            title: c.caseName,
            category: c.classification,
            statement: `Investigation case docket for ${c.caseName}. Client: ${c.customerId}. Status: ${c.status}.`,
            incidentLocation: 'Enclave Subnet / External Gateway',
            suspectDetails: 'Suspect Cluster Alpha / APT Group',
            incidentDate: new Date(c.createdAt).toISOString(),
            status: c.status,
            moduOperandi: c.classification,
            verdict: 'Archived case record',
          }))
      ];

      const res = await fetch('/api/ai/cross-case-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCase: {
            id: activeCase.id,
            title: activeCase.title,
            category: activeCase.category,
            statement: activeCase.statement || activeCase.title,
            incidentLocation: activeCase.incidentLocation || 'Unknown Location',
            suspectDetails: activeCase.suspectDetails || 'Unknown Suspect',
            incidentDate: activeCase.incidentDate || new Date().toISOString(),
            status: activeCase.status || 'UNDER_INVESTIGATION'
          },
          priorCases: priorCasesPayload,
          filterSettings: filters
        })
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: AiCrossCaseMatchResponse = await res.json();
      setMatchResponse(data);
      if (data.topMatches && data.topMatches.length > 0) {
        setSelectedMatch(data.topMatches[0]);
      }
    } catch (err: any) {
      console.warn('AI match error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Chat Submit
  const handleSendChatMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputQuery).trim();
    if (!textToSend || isChatLoading) return;

    const userMsg: CasePatternBotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'SENIOR_LEAD',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/pattern-bot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          activeCase: {
            id: activeCase.id,
            title: activeCase.title,
            category: activeCase.category,
            statement: activeCase.statement || activeCase.title,
            incidentLocation: activeCase.incidentLocation,
            suspectDetails: activeCase.suspectDetails
          },
          priorCases: matchResponse?.topMatches || []
        })
      });

      const data = await res.json();
      const botMsg: CasePatternBotMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'AI_PATTERN_COPILOT',
        text: data.reply || 'Analysis completed for query against prior docket.',
        timestamp: new Date().toLocaleTimeString(),
        matchedCases: matchResponse?.topMatches?.slice(0, 2),
        suggestedPrompts: [
          'What specific warrant should I prepare for this suspect?',
          'Transfer these matching clues directly into today\'s police report',
          'Highlight the identical wording phrases between both cases'
        ]
      };

      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.warn('Bot query failed:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Transfer matched findings into Senior Workstation Report
  const handleApplyToPoliceReport = (match: TwinCaseMatchItem) => {
    if (!onApplyInsightsToReport) return;

    const ideas = `• Applied Twin-Case MO Hypothesis from Historical Case ${match.priorCaseId} (${match.priorCaseTitle}).\n• Cross-referenced suspect fingerprint & recurring signature: ${match.criminalAttributionLead.suspectIdentified} (${match.criminalAttributionLead.recurringSignature}).\n• Targeted geographic / subnet vector: ${match.priorLocation}.`;
    
    const findings = `• IDENTIFIED CRUCIAL TWIN-CASE CLUES (${match.similarity.overallSimilarity}% Match with ${match.priorCaseId}):\n${match.sharedClues.map(c => `  - [${c.category}] ${c.title}: ${c.explanation}`).join('\n')}\n• RECURRING CRIMINAL ATTRIBUTION: ${match.criminalAttributionLead.suspectIdentified} (${match.criminalAttributionLead.probabilityScore}% confidence).\n• RECOMMENDED ACTION: ${match.recommendedAction}`;
    
    const verdict = `Criminal attribution established through cross-case MO correlation with ${match.priorCaseId}. Suspect ${match.criminalAttributionLead.suspectIdentified} exhibits matching exploitation cadence. Subpoena initiated.`;

    onApplyInsightsToReport({
      ideasImplemented: ideas,
      findingsBreakthroughs: findings,
      verdictSummary: verdict,
      recommendedSuspect: match.criminalAttributionLead.suspectIdentified
    });

    setTransferSuccess(`✅ Insights from Case ${match.priorCaseId} transferred directly into Senior Inspector FIPG 3638 Daily Report form!`);
    setTimeout(() => setTransferSuccess(null), 5000);
  };

  return (
    <div className="w-full bg-[#0B0D13] rounded-3xl border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6 font-mono text-zinc-300 relative overflow-hidden">
      
      {/* Glow Backdrops */}
      <div className="absolute top-0 right-0 w-[500px] h-60 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-60 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* =========================================================================
          HEADER: DEDICATED AI CASE PATTERN & TWIN-CASE CROSS-MATCHER
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 text-xs text-amber-400 font-bold tracking-wider">
            <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black shadow-md shadow-amber-500/20">
              <Brain size={16} />
            </span>
            <span>AI CASE PATTERN &amp; COLD-CASE CROSS-MATCHER COPILOT</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40">
              SENIOR DESK ONLY
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Investigative Twin-Case Correlation Engine</span>
          </h3>

          <p className="text-xs text-zinc-400 font-sans max-w-3xl leading-relaxed">
            Forensic AI designed exclusively to cross-examine your active case against all prior closed and archived cases in your workstation.
            Detect identical phrasing wordings, attack vectors, attack locations, and recurring criminal signatures to identify the perpetrator as soon as possible.
          </p>
        </div>

        {/* Action Controls & Separate Filter Box Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsFilterBoxOpen(true)}
            className="px-3.5 py-2.5 bg-[#151922] hover:bg-[#1C2230] text-amber-300 border border-amber-500/40 hover:border-amber-400 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Sliders size={14} className="text-amber-400" />
            <span>Multi-Vector Filter &amp; Thresholds</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40">
              &ge;{filters.minSimilarityThreshold}%
            </span>
          </button>

          <button
            type="button"
            onClick={runCrossCaseAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>CROSS-EXAMINING DOCKET...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>RUN AI CROSS-CASE ANALYSIS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Status Strip: Active Filters & Vectors */}
      <div className="bg-[#121622] rounded-xl border border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-zinc-400">
          <span className="text-[10px] uppercase font-bold text-zinc-500">Active Vectors:</span>
          {filters.focusVectors.attackModusOperandi && (
            <span className="px-2 py-0.5 rounded-md bg-[#182030] text-amber-300 border border-amber-500/30 text-[10px]">
              ⚔️ Attack MO
            </span>
          )}
          {filters.focusVectors.suspectSignature && (
            <span className="px-2 py-0.5 rounded-md bg-[#182030] text-emerald-300 border border-emerald-500/30 text-[10px]">
              👤 Suspect
            </span>
          )}
          {filters.focusVectors.wordingSyntax && (
            <span className="px-2 py-0.5 rounded-md bg-[#182030] text-blue-300 border border-blue-500/30 text-[10px]">
              📝 Wording
            </span>
          )}
          {filters.focusVectors.locationGeocoding && (
            <span className="px-2 py-0.5 rounded-md bg-[#182030] text-purple-300 border border-purple-500/30 text-[10px]">
              📍 Location
            </span>
          )}
          {filters.keywordFilter && (
            <span className="px-2 py-0.5 rounded-md bg-[#182030] text-zinc-200 border border-zinc-700 text-[10px]">
              🔍 &quot;{filters.keywordFilter}&quot;
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsFilterBoxOpen(true)}
          className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>Modify Thresholds &amp; Vectors &rarr;</span>
        </button>
      </div>

      {/* Transfer Alert banner if triggered */}
      {transferSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-between"
        >
          <span>{transferSuccess}</span>
          <span className="text-[10px] font-mono bg-emerald-900 px-2 py-0.5 rounded text-emerald-200">SEALED IN FORM</span>
        </motion.div>
      )}

      {/* =========================================================================
          SEPARATE BOX MODAL: SENIOR INVESTIGATOR MULTI-VECTOR FILTER & THRESHOLD
          ========================================================================= */}
      <AnimatePresence>
        {isFilterBoxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#0F121C] border border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-mono text-zinc-300 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Sliders size={16} />
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Senior Investigator Multi-Vector Filter &amp; Threshold Deck
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    Configure forensic cross-examination weights, phrasing tolerances, and similarity thresholds without cluttering the main case desk.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterBoxOpen(false)}
                  className="p-2 rounded-xl bg-[#181D2A] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Vector Selection Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <Fingerprint size={14} />
                  <span>1. Select Active Forensic Correlation Vectors:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'attackModusOperandi', label: '⚔️ Attack MO & Tactics', desc: 'Malware payloads, exploit mechanics, C2 beaconing' },
                    { key: 'suspectSignature', label: '👤 Suspect Fingerprint', desc: 'Alias handles, credentials, behavioral patterns' },
                    { key: 'wordingSyntax', label: '📝 Wording & Linguistic Syntax', desc: 'Extortion phrases, technical terms, grammar habits' },
                    { key: 'locationGeocoding', label: '📍 Incident Location & Subnet', desc: 'IP ranges, data center pods, physical addresses' },
                    { key: 'targetVector', label: '🎯 Target Asset & Protocols', desc: 'SWIFT gateways, QKD nodes, HSM modules' },
                  ].map((v) => {
                    const isActive = (filters.focusVectors as any)[v.key];
                    return (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => {
                          setFilters(prev => ({
                            ...prev,
                            focusVectors: {
                              ...prev.focusVectors,
                              [v.key]: !isActive
                            }
                          }));
                        }}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isActive
                            ? 'bg-amber-950/30 border-amber-500/70 text-white ring-1 ring-amber-500/40'
                            : 'bg-[#151922] border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{v.label}</span>
                          {isActive && <CheckCircle2 size={13} className="text-amber-400" />}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-sans">{v.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Threshold Slider */}
              <div className="space-y-2.5 bg-[#151922] p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Crosshair size={14} className="text-amber-400" />
                    <span>2. Minimum Forensic Similarity Threshold:</span>
                  </span>
                  <strong className="text-amber-400 font-mono text-sm">&ge; {filters.minSimilarityThreshold}% Match</strong>
                </div>

                <input
                  type="range"
                  min={20}
                  max={90}
                  step={5}
                  value={filters.minSimilarityThreshold}
                  onChange={(e) => setFilters(prev => ({ ...prev, minSimilarityThreshold: Number(e.target.value) }))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>20% (Exploratory Broad)</span>
                  <span>50% (Corroborated)</span>
                  <span>80%+ (Strict Criminal Link)</span>
                </div>
              </div>

              {/* Keyword Filter & Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <span className="text-zinc-400 text-[11px]">Free Keyword / Phrasing Filter:</span>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="e.g. DNS tunnel, SWIFT, Bastion..."
                      value={filters.keywordFilter}
                      onChange={(e) => setFilters(prev => ({ ...prev, keywordFilter: e.target.value }))}
                      className="w-full bg-[#151922] border border-zinc-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-zinc-400 text-[11px]">Timeframe &amp; Cold Case Scope:</span>
                  <select
                    value={filters.timeframeScope}
                    onChange={(e) => setFilters(prev => ({ ...prev, timeframeScope: e.target.value as any }))}
                    className="w-full bg-[#151922] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                  >
                    <option value="ALL_TIME">All Historical Records &amp; Cold Cases</option>
                    <option value="COLD_CASES_ONLY">Archived / Cold Cases Only</option>
                    <option value="PAST_6_MONTHS">Past 6 Months</option>
                    <option value="PAST_2_YEARS">Past 2 Years</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFilters({
                      focusVectors: {
                        wordingSyntax: true,
                        locationGeocoding: true,
                        suspectSignature: true,
                        attackModusOperandi: true,
                        targetVector: true,
                      },
                      minSimilarityThreshold: 40,
                      keywordFilter: '',
                      categoryFilter: 'ALL',
                      timeframeScope: 'ALL_TIME'
                    });
                  }}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Reset Defaults
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFilterBoxOpen(false)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFilterBoxOpen(false);
                      runCrossCaseAnalysis();
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    Save &amp; Apply Filters
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          VIEW MODE TABS:
          1. 🗺️ Dotted Map & Matched Prior Cases
          2. 🤖 AI Pattern Copilot Interactive Chat
          3. ⚖️ Twin-Case Side-by-Side Comparison
          ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        {[
          { id: 'MATCHES_MAP', label: '🌐 Interactive Forensic Dotted Map & Matches', count: matchResponse?.topMatches?.length || 0 },
          { id: 'COPILOT_CHAT', label: '🤖 AI Pattern Copilot Assistant', count: 'Active' },
          { id: 'TWIN_DIFF', label: '⚖️ Twin-Case Side-by-Side Comparison', count: selectedMatch ? selectedMatch.priorCaseId : 'None' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-[#121622] text-zinc-400 hover:text-white hover:bg-[#181E2E] border border-zinc-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              activeTab === tab.id ? 'bg-black/30 text-black font-black' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          TAB 1: INTERACTIVE DOTTED MAP & MATCHED PRIOR CASES LIST
          ========================================================================= */}
      {activeTab === 'MATCHES_MAP' && (
        <div className="space-y-6">
          
          {/* Primary Perpetrator Alert Profile Box */}
          {matchResponse?.primaryPerpetratorProfile && (
            <div className="bg-gradient-to-r from-red-950/40 via-[#151922] to-[#151922] rounded-2xl border border-red-500/50 p-5 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400">
                    <Fingerprint size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                        RECURRING PERPETRATOR DETECTED ACROSS DOCKET
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {matchResponse.primaryPerpetratorProfile.confidenceLevel}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-white mt-0.5">
                      Identified Suspect: <span className="text-amber-300">{matchResponse.primaryPerpetratorProfile.matchedIdentity}</span>
                    </h4>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {matchResponse.primaryPerpetratorProfile.connectedPriorCaseIds.map(cId => (
                    <span key={cId} className="px-2 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/40">
                      Linked: {cId}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                <strong className="text-white">Modus Operandi Signature:</strong> {matchResponse.primaryPerpetratorProfile.modusOperandiSignature}
              </p>

              <div className="pt-2 border-t border-red-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-zinc-400 font-sans">
                  Target for Subpoena / Search Warrant: <strong className="text-white font-mono">{matchResponse.primaryPerpetratorProfile.suggestedWarrantTarget}</strong>
                </span>
                
                {selectedMatch && (
                  <button
                    type="button"
                    onClick={() => handleApplyToPoliceReport(selectedMatch)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <BookOpen size={13} />
                    <span>Study This Idea &amp; Transfer to Daily Report</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dotted Map Canvas Visualizer */}
          <ForensicSimilarityDottedMap
            activeCaseId={activeCase.id}
            activeCaseTitle={activeCase.title}
            matchedCases={matchResponse?.topMatches || []}
            onSelectPriorCase={(item) => {
              setSelectedMatch(item);
              setActiveTab('TWIN_DIFF');
            }}
            selectedPriorCaseId={selectedMatch?.priorCaseId}
          />

          {/* Matched Prior Cases Detailed Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <GitCompare size={16} className="text-amber-400" />
                <span>Top Correlated Prior Cases in Senior Docket ({matchResponse?.topMatches?.length || 0})</span>
              </h4>
              <span className="text-xs text-zinc-500 font-mono">Ranked by Modus Operandi &amp; Phrasing Similarity</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {matchResponse?.topMatches?.map((match) => {
                const isUrgent = match.studyPriority === 'URGENT_STUDY';
                const sim = match.similarity;

                return (
                  <div
                    key={match.priorCaseId}
                    className="bg-[#121622] rounded-2xl border border-zinc-800 hover:border-amber-500/50 p-6 transition-all space-y-4 shadow-xl text-xs"
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-zinc-800">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-500/40">
                            {match.priorCaseId}
                          </span>
                          <span className="text-zinc-500">&bull;</span>
                          <span className="text-zinc-300 font-semibold">{match.priorCaseCategory}</span>
                          <span className="text-zinc-500">&bull;</span>
                          <span className="text-zinc-400 font-mono text-[11px]">{match.priorCaseDate}</span>
                          {isUrgent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/50 animate-pulse">
                              🔥 URGENT TO STUDY
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-white">
                          {match.priorCaseTitle}
                        </h3>
                      </div>

                      {/* Overall Score Badge */}
                      <div className="flex items-center gap-3 self-start md:self-center">
                        <div className="text-right">
                          <span className="text-lg font-black text-amber-400 font-mono block">
                            {sim.overallSimilarity}%
                          </span>
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">TOTAL SIMILARITY</span>
                        </div>
                      </div>
                    </div>

                    {/* Vector Score Breakdown Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0B0D13] p-3 rounded-xl border border-zinc-800/80 font-mono text-[11px]">
                      <div>
                        <span className="text-zinc-500 text-[10px] block">⚔️ Attack MO / Action:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${sim.attackMoScore}%` }} />
                          </div>
                          <strong className="text-amber-300">{sim.attackMoScore}%</strong>
                        </div>
                      </div>

                      <div>
                        <span className="text-zinc-500 text-[10px] block">👤 Criminal / Suspect:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400" style={{ width: `${sim.criminalSignatureScore}%` }} />
                          </div>
                          <strong className="text-emerald-300">{sim.criminalSignatureScore}%</strong>
                        </div>
                      </div>

                      <div>
                        <span className="text-zinc-500 text-[10px] block">📝 Wording / Syntax:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400" style={{ width: `${sim.wordingSyntaxScore}%` }} />
                          </div>
                          <strong className="text-blue-300">{sim.wordingSyntaxScore}%</strong>
                        </div>
                      </div>

                      <div>
                        <span className="text-zinc-500 text-[10px] block">📍 Location Proximity:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-400" style={{ width: `${sim.locationProximityScore}%` }} />
                          </div>
                          <strong className="text-purple-300">{sim.locationProximityScore}%</strong>
                        </div>
                      </div>
                    </div>

                    {/* Shared Clues Highlight */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-amber-400 uppercase font-bold block">
                        Exact Shared Clues &amp; Crucial Correlation Points:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {match.sharedClues.map(clue => (
                          <div key={clue.id} className="bg-[#171C28] p-3 rounded-xl border border-zinc-800/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <strong className="text-white text-xs flex items-center gap-1.5">
                                <span>{clue.title}</span>
                              </strong>
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                                {clue.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                              {clue.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Criminal Attribution Lead */}
                    <div className="bg-[#0E121A] p-3.5 rounded-xl border border-amber-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-300 font-bold flex items-center gap-1.5">
                          <Fingerprint size={14} className="text-amber-400" />
                          <span>Criminal Attribution Lead: {match.criminalAttributionLead.suspectIdentified}</span>
                        </span>
                        <span className="font-mono text-[11px] text-emerald-400 font-bold">
                          {match.criminalAttributionLead.probabilityScore}% Match Confidence
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans">
                        {match.criminalAttributionLead.rationale}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-zinc-400 font-sans">
                        <strong className="text-white">Recommended Action:</strong> {match.recommendedAction}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMatch(match);
                            setActiveTab('TWIN_DIFF');
                          }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>Compare Side-by-Side</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyToPoliceReport(match)}
                          className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                        >
                          <Sparkles size={13} />
                          <span>Study This Case &amp; Adopt Ideas</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: AI PATTERN COPILOT INTERACTIVE CHAT PANEL
          ========================================================================= */}
      {activeTab === 'COPILOT_CHAT' && (
        <div className="bg-[#121622] rounded-2xl border border-zinc-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Senior Forensic Twin-Case Intelligence Copilot
                </h4>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Query the AI exclusively on cross-matching historical affidavits, phrasing, and attack parameters.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setChatMessages([
                  {
                    id: `msg-${Date.now()}`,
                    sender: 'AI_PATTERN_COPILOT',
                    text: 'Chat history reset. Ready for new twin-case forensic queries.',
                    timestamp: new Date().toLocaleTimeString(),
                    suggestedPrompts: [
                      'Find previous cases with identical DNS tunneling & ex-contractor tokens',
                      'Compare phrasing & technical jargon with the SWIFT fraud case',
                      'Who is the primary recurring suspect based on this attack MO?'
                    ]
                  }
                ]);
              }}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-[10px] flex items-center gap-1"
            >
              <RotateCcw size={11} />
              <span>Reset Chat</span>
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {chatMessages.map((msg) => {
              const isBot = msg.sender === 'AI_PATTERN_COPILOT';
              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    isBot
                      ? 'bg-[#0E121A] border-amber-500/30 text-zinc-200'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-100 ml-8'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span className="font-bold text-amber-400">
                      {isBot ? '🤖 AI PATTERN COPILOT (FORENSIC AGENT)' : '👮 SENIOR INSPECTOR FIPG 3638'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Quick Prompts */}
                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 block">Suggested Quick Queries:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedPrompts.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendChatMessage(p)}
                            className="px-2.5 py-1 bg-[#151922] hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-700 hover:border-amber-500/40 rounded-lg text-[10px] transition-all cursor-pointer text-left font-sans"
                          >
                            &bull; {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isChatLoading && (
              <div className="p-4 rounded-2xl bg-[#0E121A] border border-amber-500/30 text-xs text-amber-400 flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin" />
                <span>AI Copilot is cross-referencing evidence ledgers and calculating similarity scores...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <input
              type="text"
              placeholder="Ask AI Copilot: 'Compare suspect details with prior cyber cases' or 'Who used DNS tunnel?'..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              className="flex-1 bg-[#0B0D13] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 font-sans"
            />
            <button
              type="button"
              onClick={() => handleSendChatMessage()}
              disabled={!inputQuery.trim() || isChatLoading}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TWIN-CASE SIDE-BY-SIDE DIFF & ATTRIBUTION MATRIX
          ========================================================================= */}
      {activeTab === 'TWIN_DIFF' && selectedMatch && (
        <div className="bg-[#121622] rounded-2xl border border-zinc-800 p-6 space-y-6 shadow-xl text-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <GitCompare size={16} className="text-amber-400" />
                <span>Twin-Case Forensic Comparison Matrix</span>
              </h4>
              <p className="text-[11px] text-zinc-400 font-sans">
                Direct juxtaposition of Active Dossier vs Matched Historical Case <strong className="text-amber-300">{selectedMatch.priorCaseId}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleApplyToPoliceReport(selectedMatch)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Adopt Case Findings into Daily Police Report</span>
            </button>
          </div>

          {/* Dual Column Juxtaposition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Active Working Case */}
            <div className="bg-[#0B0D13] p-5 rounded-2xl border border-red-500/40 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-[10px] font-mono uppercase font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-500/40">
                  CURRENT ACTIVE WORKING CASE ({activeCase.id})
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">UNDER EVALUATION</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block">Title:</span>
                <strong className="text-white text-sm">{activeCase.title}</strong>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block">Category:</span>
                <span className="text-amber-400 font-mono">{activeCase.category}</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block">Incident Statement / Attack Description:</span>
                <p className="text-zinc-300 bg-[#151922] p-3 rounded-xl border border-zinc-800/80 font-sans leading-relaxed text-xs">
                  {activeCase.statement || 'Active case filing with forensic logs under investigation.'}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block">Physical / Cyber Location:</span>
                <span className="text-zinc-200 font-mono">{activeCase.incidentLocation || 'Corporate HQ Gateway / External Subnet'}</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block">Identified Suspect Notes:</span>
                <span className="text-zinc-200 font-mono">{activeCase.suspectDetails || 'Unknown Intruder / Revoked Token Replay'}</span>
              </div>
            </div>

            {/* Right: Matched Historical Case */}
            <div className="bg-[#0B0D13] p-5 rounded-2xl border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                  HISTORICAL PRIOR CASE ({selectedMatch.priorCaseId})
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  {selectedMatch.similarity.overallSimilarity}% SIMILAR
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block">Title:</span>
                <strong className="text-white text-sm">{selectedMatch.priorCaseTitle}</strong>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block">Category:</span>
                <span className="text-emerald-400 font-mono">{selectedMatch.priorCaseCategory}</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block">Prior Modus Operandi &amp; Ingress:</span>
                <p className="text-zinc-300 bg-[#151922] p-3 rounded-xl border border-zinc-800/80 font-sans leading-relaxed text-xs">
                  {selectedMatch.priorModusOperandi}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block">Prior Incident Location:</span>
                <span className="text-zinc-200 font-mono">{selectedMatch.priorLocation}</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block">Identified Perpetrator in Prior Case:</span>
                <span className="text-amber-300 font-mono font-bold">{selectedMatch.priorSuspects}</span>
              </div>
            </div>

          </div>

          {/* Shared Clues Cross-Examination Table */}
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>Exact Matching Patterns &amp; Clues Discovered by AI</span>
            </h5>

            <div className="space-y-2">
              {selectedMatch.sharedClues.map((clue, idx) => (
                <div key={clue.id || idx} className="bg-[#0B0D13] p-4 rounded-xl border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{clue.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40">
                      {clue.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-sans">
                    <div className="bg-[#151922] p-2.5 rounded-lg border border-red-500/20 text-red-200">
                      <span className="text-[9px] font-mono uppercase text-red-400 block mb-0.5">Active Case Wording:</span>
                      &quot;{clue.activeCaseSnippet}&quot;
                    </div>
                    <div className="bg-[#151922] p-2.5 rounded-lg border border-emerald-500/20 text-emerald-200">
                      <span className="text-[9px] font-mono uppercase text-emerald-400 block mb-0.5">Prior Case Wording:</span>
                      &quot;{clue.priorCaseSnippet}&quot;
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    <strong className="text-zinc-300">Forensic Deduction:</strong> {clue.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
