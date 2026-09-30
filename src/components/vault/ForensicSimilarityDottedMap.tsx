import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Crosshair, 
  MapPin, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  Search, 
  Maximize2, 
  Filter, 
  Activity, 
  Layers, 
  Eye, 
  Cpu, 
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import { TwinCaseMatchItem } from '../../types';

interface ForensicSimilarityDottedMapProps {
  activeCaseId: string;
  activeCaseTitle: string;
  matchedCases: TwinCaseMatchItem[];
  onSelectPriorCase: (priorCase: TwinCaseMatchItem) => void;
  selectedPriorCaseId?: string | null;
  activeVectorFocus?: string;
}

export const ForensicSimilarityDottedMap: React.FC<ForensicSimilarityDottedMapProps> = ({
  activeCaseId,
  activeCaseTitle,
  matchedCases,
  onSelectPriorCase,
  selectedPriorCaseId,
  activeVectorFocus = 'ALL'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<'RADAR_CONSTELLATION' | 'DOTTED_GEO_MAP'>('RADAR_CONSTELLATION');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Geo coordinate mock points for prior cases
  const geoLocations: Record<string, { x: number; y: number; label: string; region: string }> = {
    'CMP-2026-88192': { x: 0.28, y: 0.38, label: 'New York HQ Gateway Node 04', region: 'North America' },
    'CMP-2026-90412': { x: 0.52, y: 0.32, label: 'Zurich Optical QKD Node', region: 'Europe' },
    'CASE-001': { x: 0.48, y: 0.35, label: 'Interpol EC3 Lyon Relay', region: 'Europe' },
    'CASE-002': { x: 0.82, y: 0.45, label: 'Singapore Cyber Substation Alpha', region: 'Asia-Pacific' },
    'CMP-2026-91140': { x: 0.74, y: 0.52, label: 'Bangalore Cloud DC Pod 9', region: 'Asia-Pacific' },
    'CMP-2026-78821': { x: 0.24, y: 0.42, label: 'Chicago Commodity Exchange Bastion', region: 'North America' }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = 420);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 700;
      height = canvas.height = 420;
    };
    window.addEventListener('resize', handleResize);

    // Generate dotted grid matrix
    const dotSpacing = 18;
    const cols = Math.floor(width / dotSpacing);
    const rows = Math.floor(height / dotSpacing);

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw Dotted Background Mesh
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const dx = c * dotSpacing + dotSpacing / 2;
          const dy = r * dotSpacing + dotSpacing / 2;

          let dotAlpha = 0.08;
          let dotColor = 'rgba(148, 163, 184,';

          if (viewMode === 'RADAR_CONSTELLATION') {
            const distFromCenter = Math.hypot(dx - centerX, dy - centerY);
            // Ripple waves
            const wave = Math.sin((distFromCenter - frame * 1.5) * 0.05);
            if (wave > 0.8) {
              dotAlpha = 0.22;
              dotColor = 'rgba(245, 158, 11,';
            }
          } else {
            // Simulated Dotted World Landmass contours
            const inSimulatedLand = 
              (dx > width * 0.15 && dx < width * 0.38 && dy > height * 0.22 && dy < height * 0.7) || // Americas
              (dx > width * 0.45 && dx < width * 0.62 && dy > height * 0.2 && dy < height * 0.6) || // Europe/Africa
              (dx > width * 0.63 && dx < width * 0.9 && dy > height * 0.22 && dy < height * 0.75); // Asia/Australia

            if (inSimulatedLand) {
              dotAlpha = 0.22;
              dotColor = 'rgba(59, 130, 246,';
            }
          }

          ctx.beginPath();
          ctx.arc(dx, dy, 1, 0, Math.PI * 2);
          ctx.fillStyle = `${dotColor} ${dotAlpha})`;
          ctx.fill();
        }
      }

      // 2. Draw Radar Circles in Radar Mode
      if (viewMode === 'RADAR_CONSTELLATION') {
        const rings = [60, 120, 180, 230];
        rings.forEach((rad, idx) => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, rad, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.12 - idx * 0.02})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Ring Label
          ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.font = '9px monospace';
          const label = idx === 0 ? '90-100% MATCH' : idx === 1 ? '75-89% SIMILAR' : idx === 2 ? '50-74% CORROBORATED' : 'DISTANT ARCHIVE';
          ctx.fillText(label, centerX + rad - 30, centerY - 4);
        });

        // Rotating Scanning Sweep
        const angle = (frame * 0.02) % (Math.PI * 2);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 240);
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 240, 0, Math.PI * 0.35);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw Nodes for Prior Cases
      matchedCases.forEach((match, index) => {
        let nx = 0;
        let ny = 0;

        if (viewMode === 'RADAR_CONSTELLATION') {
          // Position by similarity score: closer = higher score
          const simScore = match.similarity.overallSimilarity; // 0 - 100
          const radius = Math.max(45, (100 - simScore) * 2.3 + 35);
          const baseAngle = (index / Math.max(1, matchedCases.length)) * Math.PI * 2 + (frame * 0.002);
          nx = centerX + Math.cos(baseAngle) * radius;
          ny = centerY + Math.sin(baseAngle) * radius;
        } else {
          // Position by Geo coordinate map
          const geo = geoLocations[match.priorCaseId] || {
            x: 0.25 + (index * 0.15) % 0.6,
            y: 0.3 + (index * 0.12) % 0.45,
            label: 'Offshore Gateway Relay',
            region: 'Global Network'
          };
          nx = geo.x * width;
          ny = geo.y * height;
        }

        const isHovered = hoveredNodeId === match.priorCaseId;
        const isSelected = selectedPriorCaseId === match.priorCaseId;
        const isHighMatch = match.similarity.overallSimilarity >= 75;

        // Draw connecting beam to active center
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = isSelected
          ? 'rgba(245, 158, 11, 0.8)'
          : isHighMatch
          ? 'rgba(245, 158, 11, 0.35)'
          : 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.setLineDash(isHighMatch ? [3, 3] : [6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Node Glow
        const nodeColor = isSelected ? '#F59E0B' : isHighMatch ? '#10B981' : '#3B82F6';
        const nodeRadius = isSelected ? 8 : isHovered ? 7 : isHighMatch ? 6 : 5;

        // Pulsing ring
        const pulse = Math.sin(frame * 0.1 + index) * 3;
        ctx.beginPath();
        ctx.arc(nx, ny, nodeRadius + 4 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `${nodeColor}44`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Solid Node Circle
        ctx.beginPath();
        ctx.arc(nx, ny, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node Label
        ctx.font = isSelected ? 'bold 11px monospace' : '10px monospace';
        ctx.fillStyle = isSelected ? '#F59E0B' : '#E2E8F0';
        const labelText = `${match.priorCaseId} (${match.similarity.overallSimilarity}%)`;
        ctx.fillText(labelText, nx + 10, ny - 6);

        if (isHovered || isSelected) {
          ctx.fillStyle = '#94A3B8';
          ctx.font = '9px sans-serif';
          ctx.fillText(match.priorCaseTitle.slice(0, 26) + '...', nx + 10, ny + 7);
        }
      });

      // 4. Draw Center Active Case Node
      // Outer glow rings
      ctx.beginPath();
      ctx.arc(centerX, centerY, 18 + Math.sin(frame * 0.08) * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Core Red Target Dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center Label
      ctx.fillStyle = '#FCA5A5';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`TARGET: ${activeCaseId}`, centerX, centerY + 22);
      ctx.textAlign = 'start';

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [viewMode, matchedCases, selectedPriorCaseId, hoveredNodeId]);

  return (
    <div className="bg-[#0C0E14] rounded-2xl border border-zinc-800/90 p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-4">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Crosshair size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Interactive Forensic Similarity Dotted Constellation</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-950 text-amber-400 border border-amber-500/40">
                LIVE DOTTED RADAR
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans">
              Visualizes topological distance, phrasing vectors, and criminal proximity of prior cases against active dossier.
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#151922] p-1 rounded-xl border border-zinc-800 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setViewMode('RADAR_CONSTELLATION')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'RADAR_CONSTELLATION'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity size={12} />
            <span>Similarity Orbit Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('DOTTED_GEO_MAP')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'DOTTED_GEO_MAP'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe size={12} />
            <span>Geo/Attack Dotted Map</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Visualizer */}
      <div className="relative w-full h-[380px] bg-[#07090E] rounded-xl border border-zinc-800/80 overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 bg-[#0C0E14]/90 backdrop-blur-md border border-zinc-800 rounded-xl p-2.5 space-y-1.5 font-mono text-[10px] shadow-lg pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-zinc-300">Active Working Case ({activeCaseId})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-zinc-300">High Match (&ge; 75% Similarity)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-zinc-300">Corroborating Historical Case</span>
          </div>
        </div>

        {/* Vector Info Overlay */}
        <div className="absolute bottom-3 right-3 bg-[#0C0E14]/90 backdrop-blur-md border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-mono text-zinc-400 space-y-0.5 shadow-lg">
          <span className="text-amber-400 font-bold block">ACTIVE VECTOR PROJECTION:</span>
          <span>{viewMode === 'RADAR_CONSTELLATION' ? 'Polar Distance = (100 - Similarity)' : 'Equirectangular Dotted Projection'}</span>
        </div>
      </div>

      {/* Interactive Case Node Quick-Selection Strip */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
          Click Prior Case Node to Inspect Shared Clues &amp; Modus Operandi:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {matchedCases.map((match) => {
            const isSelected = selectedPriorCaseId === match.priorCaseId;
            const isHigh = match.similarity.overallSimilarity >= 75;

            return (
              <button
                key={match.priorCaseId}
                type="button"
                onMouseEnter={() => setHoveredNodeId(match.priorCaseId)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => onSelectPriorCase(match)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                    : isHigh
                    ? 'bg-[#151922] border-emerald-500/40 hover:border-emerald-400 text-zinc-300'
                    : 'bg-[#151922]/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-mono font-bold text-amber-300">
                    {match.priorCaseId}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isHigh ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                  }`}>
                    {match.similarity.overallSimilarity}% MATCH
                  </span>
                </div>

                <div className="text-xs font-bold text-zinc-200 line-clamp-1 mb-1.5">
                  {match.priorCaseTitle}
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-800/60">
                  <span className="truncate max-w-[130px]">{match.priorLocation}</span>
                  <span className="text-amber-400 flex items-center gap-0.5">
                    Study <ArrowRight size={10} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
