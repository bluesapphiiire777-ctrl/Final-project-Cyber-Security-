import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Smartphone, FileText, Globe, User, Database, ChevronRight, CheckCircle2 } from 'lucide-react';

const initialNodes = [
  { id: 'CASE', label: 'CASE: FIP-01', icon: Shield, pos: { x: 50, y: 50 }, type: 'core', desc: 'Central Case Authority Ledger' },
  { id: 'DEVICE', label: 'DEVICE_07 (iOS)', icon: Smartphone, pos: { x: 25, y: 30 }, type: 'artifact', desc: 'Encrypted iPhone 14 Pro extraction' },
  { id: 'FILE', label: 'PAYROLL.IMG', icon: FileText, pos: { x: 75, y: 30 }, type: 'artifact', desc: 'RAW bitstream forensic image' },
  { id: 'NETWORK', label: '198.51.100.42', icon: Globe, pos: { x: 25, y: 70 }, type: 'artifact', desc: 'Remote C2 beaconing endpoint' },
  { id: 'USER', label: 'ALPHA_ENTITY', icon: User, pos: { x: 75, y: 70 }, type: 'artifact', desc: 'Linked suspect biometric profile' },
  { id: 'STORE', label: 'IMMUTABLE_STORE', icon: Database, pos: { x: 50, y: 15 }, type: 'system', desc: 'SHA-256 Cloud forensic storage' },
];

const connections = [
  { from: 'CASE', to: 'DEVICE' },
  { from: 'CASE', to: 'FILE' },
  { from: 'CASE', to: 'NETWORK' },
  { from: 'CASE', to: 'USER' },
  { from: 'CASE', to: 'STORE' },
  { from: 'DEVICE', to: 'FILE' },
  { from: 'NETWORK', to: 'USER' },
];

export default function Act10Graph() {
  const [selectedNode, setSelectedNode] = useState<string | null>('DEVICE');

  const selectedNodeData = initialNodes.find(n => n.id === selectedNode);

  return (
    <section id="graph" className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-[0.25em] uppercase font-bold">
              SECTION_09 // VISUAL GRAPH CORRELATION
            </div>
            <h2 className="text-white text-3xl sm:text-5xl font-display font-black tracking-tight uppercase leading-tight">
              VISUAL<br />
              <span className="text-red-500 italic font-editorial">INTELLIGENCE GRAPH.</span>
            </h2>
            <p className="text-zinc-300 font-mono text-sm sm:text-base max-w-xl">
              Graph-based relationship clustering. Click on any forensic entity node to inspect its cross-artifact dependencies.
            </p>
          </div>
        </div>

        {/* Interactive Graph Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 relative min-h-[440px] sm:min-h-[500px] border border-zinc-800 bg-[#14151e]/90 rounded-lg overflow-hidden p-4">
            {/* SVG Connections Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((conn, i) => {
                const fromNode = initialNodes.find(n => n.id === conn.from);
                const toNode = initialNodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const isRelated = selectedNode === conn.from || selectedNode === conn.to;

                return (
                  <motion.line
                    key={i}
                    x1={`${fromNode.pos.x}%`}
                    y1={`${fromNode.pos.y}%`}
                    x2={`${toNode.pos.x}%`}
                    y2={`${toNode.pos.y}%`}
                    stroke={isRelated ? '#EF4444' : '#3F3F46'}
                    strokeWidth={isRelated ? 2.5 : 1}
                    strokeDasharray={isRelated ? 'none' : '4 4'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                );
              })}
            </svg>

            {/* Nodes Layer */}
            {initialNodes.map((node) => {
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  style={{ left: `${node.pos.x}%`, top: `${node.pos.y}%` }}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-110' 
                      : 'bg-[#1e202e] border border-zinc-700 text-zinc-300 hover:border-red-500/50 hover:text-white'
                  }`}>
                    <Icon size={22} />
                  </div>
                  
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
                     <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                       isSelected ? 'bg-amber-400 text-black font-black' : 'bg-black/70 text-zinc-300 border border-zinc-800'
                     }`}>
                       {node.label}
                     </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Node Inspector Sidebar */}
          <div className="lg:col-span-4 bg-[#14151e]/90 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">NODE INSPECTION</span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">ACTIVE CASE</span>
              </div>

              {selectedNodeData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">
                      {selectedNodeData.label}
                    </h3>
                    <div className="text-xs font-mono text-zinc-400 mt-1">
                      {selectedNodeData.desc}
                    </div>
                  </div>

                  <div className="p-3 bg-black/40 border border-zinc-800 rounded space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">CORRELATED LINKS:</span>
                      <span className="text-amber-400 font-bold">
                        {connections.filter(c => c.from === selectedNode || c.to === selectedNode).length} NODES
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">INTEGRITY HASH:</span>
                      <span className="text-emerald-400 font-bold">SHA-256 MATCH</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono text-zinc-400 font-bold uppercase">VERIFICATION STAGES:</div>
                    {['METADATA EXTRACTED', 'TIMELINE CORRELATED', 'LEGAL HOLD ACTIVE'].map((status) => (
                      <div key={status} className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-zinc-400 text-sm font-mono py-12 text-center">
                  Select a node from the graph to inspect forensic linkages.
                </div>
              )}
            </div>

            <button 
              onClick={() => alert(`Intelligence report generated for ${selectedNodeData?.label || 'selected node'}`)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2"
            >
              EXPORT NODE DOSSIER <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
