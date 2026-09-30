import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Search, 
  Filter, 
  ShieldAlert, 
  Globe, 
  Layers, 
  Hash, 
  User, 
  FileText, 
  Maximize2, 
  Download, 
  Share2, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../store';
import { Complaint, Evidence } from '../../types';

interface IntelligenceNode {
  id: string;
  label: string;
  type: 'CASE' | 'SUSPECT' | 'IP_PROXY' | 'WALLET_TOKEN' | 'EVIDENCE_FILE' | 'OFFICER';
  subtitle: string;
  status: 'CONFIRMED' | 'SUSPICIOUS' | 'SEALED' | 'MONITORED';
  x: number;
  y: number;
  connections: string[];
  details: string;
  sha256?: string;
}

export const CaseIntelligenceMatrix: React.FC = () => {
  const { complaints, evidence, seniorReports } = useStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-case-1');
  const [filterType, setFilterType] = useState<'ALL' | 'CASE' | 'SUSPECT' | 'IP_PROXY' | 'WALLET_TOKEN' | 'EVIDENCE_FILE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Generate intelligence graph nodes from live cases and evidence
  const nodes: IntelligenceNode[] = useMemo(() => [
    {
      id: 'node-case-1',
      label: 'CMP-2026-88192 (SWIFT Tampering)',
      type: 'CASE',
      subtitle: 'Financial Fraud & Unauthorized Gateway Extraction',
      status: 'SEALED',
      x: 220,
      y: 160,
      connections: ['node-suspect-1', 'node-ip-1', 'node-token-1', 'node-evd-1', 'node-officer-1'],
      details: 'Primary victim case filed by Global Asset Holdings. Total impact $142,500 USD with compromised ex-contractor authorization tokens.',
      sha256: 'e89d1b038c119284fa9b6189da44bcf0120199e81bca012984a91901bce89a12'
    },
    {
      id: 'node-suspect-1',
      label: 'Suspect Entity // Sector-9 Ex-Contractor',
      type: 'SUSPECT',
      subtitle: 'Alias: "ViperZero" • Revoked Sept 12',
      status: 'CONFIRMED',
      x: 480,
      y: 90,
      connections: ['node-case-1', 'node-ip-1', 'node-token-1'],
      details: 'Identified through correlated IP beacon logs and physical CCTV timestamp at access terminal 0x7FF.',
      sha256: '4f29a018bc771901bce89a12e89d1b038c119284fa9b6189da44bcf0120199e8'
    },
    {
      id: 'node-ip-1',
      label: '185.220.101.4 (Offshore BGP Proxy)',
      type: 'IP_PROXY',
      subtitle: 'Egress Subnet & DNS Relay gateway-sync-auth.cc',
      status: 'SUSPICIOUS',
      x: 720,
      y: 180,
      connections: ['node-suspect-1', 'node-case-1', 'node-case-2'],
      details: 'Autonomous System AS-44912. Packet capture confirms unencrypted TLS handshake fragments.',
      sha256: '9841bca012984a91901bce89a12e89d1b038c119284fa9b6189da44bcf012019'
    },
    {
      id: 'node-token-1',
      label: 'SWIFT Key #X-8809 (Revoked Token)',
      type: 'WALLET_TOKEN',
      subtitle: 'Cryptographic API Key & Token Hash',
      status: 'SEALED',
      x: 480,
      y: 280,
      connections: ['node-case-1', 'node-suspect-1', 'node-evd-1'],
      details: 'Recovered in memory enclave at offset 0x7FF0012A. Bit-exact match to exfiltrated batch payload.',
      sha256: '7721a91901bce89a12e89d1b038c119284fa9b6189da44bcf0120199e81bca01'
    },
    {
      id: 'node-evd-1',
      label: 'EVD-90412-ALPHA (Volatile Core Dump)',
      type: 'EVIDENCE_FILE',
      subtitle: 'WORM Locked • 842.6 MB Memory Image',
      status: 'SEALED',
      x: 180,
      y: 360,
      connections: ['node-case-1', 'node-token-1'],
      details: 'Captured in live sandbox enclave. Merkle tree verified with 0.00% bit-drift against genesis anchor.',
      sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
    },
    {
      id: 'node-case-2',
      label: 'CMP-2026-90411 (Apex Enclave Ransom)',
      type: 'CASE',
      subtitle: 'Linked via Common AS-44912 Proxy Subnet',
      status: 'MONITORED',
      x: 740,
      y: 350,
      connections: ['node-ip-1', 'node-suspect-1'],
      details: 'Secondary corporate breach sharing identical lateral movement offset 0x4FF80 signature.',
      sha256: '9901bce89a12e89d1b038c119284fa9b6189da44bcf0120199e81bca012984a9'
    },
    {
      id: 'node-officer-1',
      label: 'Senior Inspector FIPG 3638',
      type: 'OFFICER',
      subtitle: 'Lead Forensic Investigator • Clearance LV-5',
      status: 'CONFIRMED',
      x: 100,
      y: 80,
      connections: ['node-case-1'],
      details: 'Chief investigator commanding case triage, warrant execution, and court affidavit sealing.',
      sha256: 'fipg3638_judicial_clearance_master_signature'
    }
  ], []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const filteredNodes = nodes.filter(n => {
    const matchesType = filterType === 'ALL' || n.type === filterType;
    const matchesSearch = 
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getNodeColor = (type: IntelligenceNode['type']) => {
    switch (type) {
      case 'CASE': return { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', stroke: '#F59E0B' };
      case 'SUSPECT': return { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400', stroke: '#EF4444' };
      case 'IP_PROXY': return { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400', stroke: '#A855F7' };
      case 'WALLET_TOKEN': return { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400', stroke: '#06B6D4' };
      case 'EVIDENCE_FILE': return { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', stroke: '#10B981' };
      case 'OFFICER': return { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', stroke: '#3B82F6' };
      default: return { bg: 'bg-slate-500/20', border: 'border-slate-500', text: 'text-slate-400', stroke: '#64748B' };
    }
  };

  return (
    <div className={`bg-[#0C0E14] rounded-3xl border border-slate-700/70 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden ${isFullScreen ? 'fixed inset-4 z-50 overflow-y-auto' : ''}`}>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-xs font-bold text-amber-400">
            <Network size={16} />
            <span>CROSS-CASE THREAT &amp; RELATIONSHIP MATRIX</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-zinc-400 font-normal">Real-Time Corroboration Engine</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Forensic Intelligence Link Graph
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Visual correlation engine cross-referencing multiple citizen complaints, suspect aliases, compromised SWIFT tokens, offshore IP relays, and sealed memory artifacts.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="flex items-center bg-[#151922] border border-zinc-700 rounded-xl px-3 py-1.5 text-xs">
            <Search size={14} className="text-zinc-400 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suspect, IP, hash, or case..."
              className="bg-transparent text-white placeholder-zinc-500 focus:outline-none w-48 text-xs font-sans"
            />
          </div>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 bg-[#151922] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl transition-all cursor-pointer"
            title={isFullScreen ? 'Exit Full Screen' : 'Expand Matrix'}
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#080A0F] rounded-xl border border-zinc-800 text-xs">
        {[
          { id: 'ALL', label: 'All Entities (7)' },
          { id: 'CASE', label: 'Case Dockets' },
          { id: 'SUSPECT', label: 'Suspect Nodes' },
          { id: 'IP_PROXY', label: 'Offshore Proxies' },
          { id: 'WALLET_TOKEN', label: 'SWIFT Tokens' },
          { id: 'EVIDENCE_FILE', label: 'Sealed Artifacts' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id as any)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === f.id
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Interactive Canvas (8 Cols) + Entity Details (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SVG Interactive Relationship Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-[#080A0F] rounded-2xl border border-zinc-800 p-4 relative min-h-[440px] overflow-hidden shadow-inner flex items-center justify-center">
          
          {/* Ambient Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
          
          <svg className="w-full h-[400px] select-none" viewBox="0 0 880 440">
            {/* Connection Lines */}
            {nodes.map(n1 => 
              n1.connections.map(targetId => {
                const n2 = nodes.find(n => n.id === targetId);
                if (!n2) return null;
                const isHighlighted = n1.id === selectedNodeId || n2.id === selectedNodeId;
                return (
                  <line
                    key={`${n1.id}-${n2.id}`}
                    x1={n1.x + 40}
                    y1={n1.y + 20}
                    x2={n2.x + 40}
                    y2={n2.y + 20}
                    stroke={isHighlighted ? '#F59E0B' : '#334155'}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    strokeDasharray={isHighlighted ? 'none' : '4 4'}
                    className="transition-all duration-300"
                  />
                );
              })
            )}

            {/* Render Nodes */}
            {filteredNodes.map(node => {
              const color = getNodeColor(node.type);
              const isSelected = node.id === selectedNodeId;

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x - 30}, ${node.y - 10})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer group"
                >
                  {/* Node Outer Halo */}
                  {isSelected && (
                    <rect
                      x={-6}
                      y={-6}
                      width={160}
                      height={56}
                      rx={16}
                      fill="none"
                      stroke={color.stroke}
                      strokeWidth={2}
                      className="animate-pulse"
                    />
                  )}

                  {/* Node Body Card */}
                  <rect
                    x={0}
                    y={0}
                    width={148}
                    height={44}
                    rx={12}
                    fill="#0E121B"
                    stroke={isSelected ? color.stroke : '#1E293B'}
                    strokeWidth={1.5}
                    className="group-hover:stroke-slate-500 transition-colors"
                  />

                  {/* Type Indicator Dot */}
                  <circle cx={14} cy={22} r={5} fill={color.stroke} />

                  {/* Text Title */}
                  <text
                    x={26}
                    y={18}
                    fill="#FFFFFF"
                    fontSize={10.5}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {node.label.length > 17 ? node.label.substring(0, 16) + '...' : node.label}
                  </text>

                  {/* Subtitle */}
                  <text
                    x={26}
                    y={32}
                    fill="#94A3B8"
                    fontSize={8.5}
                    fontFamily="sans-serif"
                  >
                    {node.type} &bull; {node.status}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Legend at bottom */}
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400 font-mono bg-[#0E121B]/90 px-3 py-1.5 rounded-xl border border-zinc-800 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Case</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Suspect</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> Proxy/IP</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Token/Key</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Evidence</span>
            </div>
            <span>CLICK ANY NODE TO INSPECT CORRELATION</span>
          </div>
        </div>

        {/* RIGHT PANEL: SELECTED ENTITY DEEP FORENSICS (4 Cols) */}
        <div className="lg:col-span-4 bg-[#080A0F] rounded-2xl border border-zinc-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">
              ENTITY INTELLIGENCE DOSSIER
            </span>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
              {selectedNode.status}
            </span>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-base font-bold text-white">
              {selectedNode.label}
            </h4>
            <p className="text-xs text-zinc-400">
              {selectedNode.subtitle}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0E121B] border border-zinc-800/80 space-y-2 text-xs">
            <span className="text-zinc-500 font-mono text-[10px] uppercase block">CORROBORATED DISCOVERY:</span>
            <p className="text-zinc-200 leading-relaxed font-sans text-xs">
              {selectedNode.details}
            </p>
          </div>

          {/* SHA-256 Hash Digest */}
          {selectedNode.sha256 && (
            <div className="space-y-1 bg-[#0E121B] p-3 rounded-xl border border-zinc-800/80 text-xs">
              <span className="text-zinc-500 font-mono text-[10px] uppercase block">CRYPTOGRAPHIC ANCHOR (SHA-256):</span>
              <p className="font-mono text-[10px] text-amber-300 break-all">
                {selectedNode.sha256}
              </p>
            </div>
          )}

          {/* Connected Entities */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="text-zinc-500 font-mono text-[10px] uppercase block">
              CORRELATED LINKS ({selectedNode.connections.length}):
            </span>
            <div className="space-y-1.5">
              {selectedNode.connections.map(cId => {
                const targetNode = nodes.find(n => n.id === cId);
                if (!targetNode) return null;
                const cColor = getNodeColor(targetNode.type);
                return (
                  <button
                    key={cId}
                    onClick={() => setSelectedNodeId(cId)}
                    className="w-full p-2 rounded-lg bg-[#0E121B] hover:bg-[#151922] border border-zinc-800/80 text-left flex items-center justify-between group transition-all cursor-pointer"
                  >
                    <span className="text-xs text-zinc-300 group-hover:text-white font-sans truncate">
                      {targetNode.label}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${cColor.text}`}>
                      {targetNode.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
