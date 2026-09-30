import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  X, 
  Search, 
  ShieldCheck, 
  User, 
  Globe, 
  Key, 
  FileText, 
  Smartphone, 
  HardDrive, 
  Cpu, 
  Zap, 
  ArrowRight, 
  ExternalLink,
  Layers,
  Filter,
  Eye,
  Maximize2
} from 'lucide-react';
import { Complaint, Evidence } from '../../types';

interface EntityNode {
  id: string;
  label: string;
  type: 'COMPLAINANT' | 'CASE' | 'SUSPECT_IP' | 'CRYPTO_WALLET' | 'SUSPECT_DEVICE' | 'EVIDENCE_FILE' | 'BREAKTHROUGH_CLUE';
  description: string;
  confidence: number;
  x: number;
  y: number;
  meta: Record<string, string>;
}

interface EntityLink {
  from: string;
  to: string;
  relation: string;
  strength: 'STRONG' | 'CORROBORATED' | 'INDIRECT';
}

interface EntityLinkGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
  caseTitle?: string;
}

export const EntityLinkGraphModal: React.FC<EntityLinkGraphModalProps> = ({
  isOpen,
  onClose,
  caseId = 'CMP-2026-88192',
  caseTitle = 'Unauthorized SWIFT Gateway Extraction & API Key Tampering'
}) => {
  const [selectedNode, setSelectedNode] = useState<EntityNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const nodes: EntityNode[] = [
    {
      id: 'n-case',
      label: caseId,
      type: 'CASE',
      description: caseTitle,
      confidence: 100,
      x: 50,
      y: 45,
      meta: { Status: '75% Cryptanalysis', Classification: 'FINANCIAL_FRAUD', Lead: 'Senior Inspector FIPG 3638' }
    },
    {
      id: 'n-victim',
      label: 'Victim Client',
      type: 'COMPLAINANT',
      description: 'Authorized Corporate Transmitting Party',
      confidence: 100,
      x: 20,
      y: 25,
      meta: { Identity: 'Verified Citizen ID', Channel: 'Encrypted WORM Ingestion', Impact: '$142,500.00 USD' }
    },
    {
      id: 'n-ip',
      label: '185.220.101.4',
      type: 'SUSPECT_IP',
      description: 'Offshore Proxy Ingress Node',
      confidence: 94,
      x: 80,
      y: 20,
      meta: { Location: 'Seychelles Relay', ASN: 'AS9009 Egress', Protocol: 'TLS 1.3 Fingerprint #991' }
    },
    {
      id: 'n-wallet',
      label: '0x71C...90B2',
      type: 'CRYPTO_WALLET',
      description: 'Tainted Destination Smart Contract',
      confidence: 88,
      x: 82,
      y: 70,
      meta: { Network: 'Ethereum Mainnet', GasOrigin: 'Tornado Cash Relay', TotalLaundered: '48.2 ETH' }
    },
    {
      id: 'n-device',
      label: 'IMEI 862910049',
      type: 'SUSPECT_DEVICE',
      description: 'Hardware Beacon Matched via Cell Tower',
      confidence: 91,
      x: 22,
      y: 75,
      meta: { Tower: 'District 4 Financial Mast', Timestamp: '2026-09-14 03:14 UTC', Hardware: 'OnePlus 11 5G' }
    },
    {
      id: 'n-ev1',
      label: 'SWIFT_Transfer.pdf',
      type: 'EVIDENCE_FILE',
      description: 'WORM Sealed Wire Confirmation',
      confidence: 100,
      x: 35,
      y: 50,
      meta: { Hash: 'e89d1b038c119284fa9b6189da44bcf0120199e81bca012984a91901bce89a12', Drift: '0.00% Zero-Drift' }
    },
    {
      id: 'n-ev2',
      label: 'PCAP_Stream_0x77.cap',
      type: 'EVIDENCE_FILE',
      description: 'Raw Packet Capture Stream',
      confidence: 98,
      x: 65,
      y: 35,
      meta: { PacketCount: '14,291 Packets', Headers: '14 SWIFT Tokens Recovered', Hash: '9841bca012984a91901bce89a12e89d1b038c119284' }
    },
    {
      id: 'n-breakthrough',
      label: 'Token #X-8809',
      type: 'BREAKTHROUGH_CLUE',
      description: 'Revoked Contractor Session Key',
      confidence: 96,
      x: 50,
      y: 80,
      meta: { IssuedTo: 'Ex-Contractor SysAdmin', RevokedAt: '2026-09-12', ReplayedAt: '2026-09-14 03:12 UTC' }
    }
  ];

  const links: EntityLink[] = [
    { from: 'n-victim', to: 'n-case', relation: 'REGISTERED_DOCKET', strength: 'STRONG' },
    { from: 'n-victim', to: 'n-ev1', relation: 'DEPOSITED_FILE', strength: 'STRONG' },
    { from: 'n-ev1', to: 'n-case', relation: 'ANCHORED_IN_WORM', strength: 'STRONG' },
    { from: 'n-case', to: 'n-ev2', relation: 'ACQUIRED_PCAP', strength: 'STRONG' },
    { from: 'n-ev2', to: 'n-ip', relation: 'OUTBOUND_DESTINATION', strength: 'STRONG' },
    { from: 'n-ev2', to: 'n-breakthrough', relation: 'PAYLOAD_SIGNATURE', strength: 'STRONG' },
    { from: 'n-breakthrough', to: 'n-wallet', relation: 'EXFILTRATION_TARGET', strength: 'CORROBORATED' },
    { from: 'n-ip', to: 'n-device', relation: 'CORRELATED_BEACON', strength: 'CORROBORATED' }
  ];

  const filteredNodes = filterType === 'ALL' 
    ? nodes 
    : nodes.filter(n => n.type === filterType || n.type === 'CASE');

  if (!isOpen) return null;

  const getNodeColor = (type: EntityNode['type']) => {
    switch (type) {
      case 'CASE': return 'border-amber-500 bg-amber-950/80 text-amber-300';
      case 'COMPLAINANT': return 'border-blue-500 bg-blue-950/80 text-blue-300';
      case 'SUSPECT_IP': return 'border-red-500 bg-red-950/80 text-red-300';
      case 'CRYPTO_WALLET': return 'border-purple-500 bg-purple-950/80 text-purple-300';
      case 'SUSPECT_DEVICE': return 'border-rose-500 bg-rose-950/80 text-rose-300';
      case 'EVIDENCE_FILE': return 'border-emerald-500 bg-emerald-950/80 text-emerald-300';
      case 'BREAKTHROUGH_CLUE': return 'border-yellow-400 bg-yellow-950/80 text-yellow-300';
      default: return 'border-zinc-500 bg-zinc-900 text-zinc-300';
    }
  };

  const getNodeIcon = (type: EntityNode['type']) => {
    switch (type) {
      case 'CASE': return ShieldCheck;
      case 'COMPLAINANT': return User;
      case 'SUSPECT_IP': return Globe;
      case 'CRYPTO_WALLET': return Key;
      case 'SUSPECT_DEVICE': return Smartphone;
      case 'EVIDENCE_FILE': return HardDrive;
      case 'BREAKTHROUGH_CLUE': return Zap;
      default: return Cpu;
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl h-[88vh] bg-[#0A0D14] border border-amber-500/40 rounded-3xl overflow-hidden flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.9)]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-[#0E121B] border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Network size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Palantir-Grade Entity Link Graph &amp; Evidence Matrix
                </h2>
                <span className="text-[10px] text-amber-400 font-mono bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  LIVE CORRELATION
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Visual relationship mapping connecting complainants, compromised tokens, suspect beacons, and sealed WORM artifacts for {caseId}.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-2.5 bg-[#080A0F] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-500 font-mono text-[10px] uppercase mr-1">Filter Entity:</span>
            {[
              { id: 'ALL', label: 'All Nodes' },
              { id: 'SUSPECT_IP', label: 'Suspect IPs' },
              { id: 'CRYPTO_WALLET', label: 'Wallets' },
              { id: 'EVIDENCE_FILE', label: 'WORM Files' },
              { id: 'BREAKTHROUGH_CLUE', label: 'Breakthroughs' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterType === f.id
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>8 Entities Corroborated &bull; Zero Bit-Drift</span>
          </div>
        </div>

        {/* Graph Workspace & Side Inspector Split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
          
          {/* Main SVG Graph Canvas (8 or 12 cols) */}
          <div className={`${selectedNode ? 'lg:col-span-8' : 'lg:col-span-12'} relative h-full bg-[#07090E] p-4 transition-all duration-300 overflow-hidden`}>
            
            {/* Background Grid & Radar Circle */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-amber-500/5 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full border border-blue-500/5 pointer-events-none" />

            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {links.map((link, idx) => {
                const src = nodes.find(n => n.id === link.from);
                const dst = nodes.find(n => n.id === link.to);
                if (!src || !dst) return null;

                return (
                  <g key={idx}>
                    <line
                      x1={`${src.x}%`}
                      y1={`${src.y}%`}
                      x2={`${dst.x}%`}
                      y2={`${dst.y}%`}
                      stroke={link.strength === 'STRONG' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.3)'}
                      strokeWidth={link.strength === 'STRONG' ? 1.5 : 1}
                      strokeDasharray={link.strength === 'CORROBORATED' ? '4 4' : undefined}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive Node Badges */}
            {filteredNodes.map((node) => {
              const Icon = getNodeIcon(node.type);
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 ${
                    isSelected ? 'scale-110 z-20' : 'hover:scale-105'
                  }`}
                >
                  <div className={`px-3 py-2 rounded-2xl border flex items-center gap-2 shadow-xl backdrop-blur-md ${getNodeColor(node.type)} ${
                    isSelected ? 'ring-2 ring-white shadow-[0_0_25px_rgba(245,158,11,0.5)]' : ''
                  }`}>
                    <Icon size={16} className="shrink-0" />
                    <div className="text-left">
                      <span className="block text-xs font-bold whitespace-nowrap">{node.label}</span>
                      <span className="block text-[9px] opacity-75 font-mono">{node.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Canvas Hint */}
            <div className="absolute bottom-4 left-4 text-[10px] text-zinc-500 font-mono bg-[#0A0D14]/90 px-3 py-1.5 rounded-xl border border-zinc-800">
              Click on any entity node to inspect forensic attributes &amp; link confidence.
            </div>
          </div>

          {/* Side Entity Inspector (4 Cols) */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="lg:col-span-4 h-full bg-[#0E121B] border-t lg:border-t-0 lg:border-l border-zinc-800 p-6 space-y-5 overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Eye size={15} className="text-amber-400" />
                    <span>Entity Intelligence Inspector</span>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border ${getNodeColor(selectedNode.type)} space-y-1`}>
                    <span className="text-[10px] uppercase font-mono font-bold block">{selectedNode.type}</span>
                    <h3 className="text-base font-bold text-white">{selectedNode.label}</h3>
                    <p className="text-xs text-zinc-300 font-sans">{selectedNode.description}</p>
                  </div>

                  <div className="space-y-2 bg-[#080A0F] p-4 rounded-2xl border border-zinc-800 text-xs">
                    <div className="flex justify-between items-center text-zinc-400 pb-2 border-b border-zinc-800/80">
                      <span>Corroboration Confidence:</span>
                      <strong className="text-emerald-400 font-bold">{selectedNode.confidence}% High</strong>
                    </div>

                    {Object.entries(selectedNode.meta).map(([key, value]) => (
                      <div key={key} className="space-y-0.5 pt-1">
                        <span className="text-[10px] uppercase text-zinc-500 font-mono block">{key}:</span>
                        <p className="text-xs text-white font-mono break-all">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Connected Links */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-300 block">Direct Relational Links:</span>
                    <div className="space-y-1.5">
                      {links
                        .filter(l => l.from === selectedNode.id || l.to === selectedNode.id)
                        .map((l, i) => {
                          const otherId = l.from === selectedNode.id ? l.to : l.from;
                          const otherNode = nodes.find(n => n.id === otherId);

                          return (
                            <div key={i} className="p-2.5 rounded-xl bg-[#080A0F] border border-zinc-800 text-xs flex items-center justify-between">
                              <span className="font-mono text-[11px] text-amber-400">{l.relation}</span>
                              <span className="text-white font-bold">{otherNode?.label}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
};
