import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { 
  SOVEREIGN_ATTRIBUTES_METADATA, 
  evaluateStrategicGaps 
} from '../../utils/capabilityIntelligence';
import { Target, User, ShieldCheck } from 'lucide-react';

interface CapabilityRadarProps {
  initialMode?: 'attributes' | 'strategic';
  height?: number;
}

export const CapabilityRadar: React.FC<CapabilityRadarProps> = ({ 
  initialMode = 'attributes',
  height = 360 
}) => {
  const { state, getAttributes, getSkillXpAndLevel } = usePOS();
  const [radarMode, setRadarMode] = useState<'attributes' | 'strategic'>(initialMode);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');

  const attributes = getAttributes();
  const strategicGaps = evaluateStrategicGaps(state);

  // Filter gaps if a specific entity is selected
  const activeGaps = selectedEntityId === 'all' 
    ? strategicGaps 
    : strategicGaps.filter(g => g.sourceEntityId === selectedEntityId);

  // Entities for strategic mode selector
  const activeGoalsAndProjects = [
    ...state.goals.filter(g => g.status === 'Active').map(g => ({ id: g.id, name: g.name, type: 'Destiny' })),
    ...state.projects.filter(p => p.status === 'Active').map(p => ({ id: p.id, name: p.name, type: 'Campaign' }))
  ];

  // RADAR GEOMETRY SETUP
  const size = 320;
  const center = size / 2;
  const radius = center - 42;

  // Data items based on mode
  interface RadarAxis {
    label: string;
    subLabel?: string;
    currentVal: number; // 0 to 100
    targetVal?: number;  // 0 to 100
    color?: string;
  }

  const axes: RadarAxis[] = radarMode === 'attributes'
    ? attributes.map(attr => {
        const meta = SOVEREIGN_ATTRIBUTES_METADATA[attr.name];
        // Normalize level for radar: Level 1 -> 10%, Level 25 -> 100%
        const normalized = Math.min(100, Math.max(10, Math.round((attr.level / 25) * 100)));
        return {
          label: attr.name,
          subLabel: `Lvl ${attr.level}`,
          currentVal: normalized,
          color: meta?.color || '#c5a059'
        };
      })
    : (() => {
        if (activeGaps.length === 0) {
          // Fallback if no specific requirements configured yet: show top 6 skills
          const topSkills = state.skills.slice(0, 6);
          return topSkills.map(s => {
            const stats = getSkillXpAndLevel(s.id);
            return {
              label: s.name,
              subLabel: `Lvl ${stats.level}`,
              currentVal: Math.min(100, Math.round((stats.level / 30) * 100)),
              targetVal: 80,
              color: '#38bdf8'
            };
          });
        }
        return activeGaps.slice(0, 8).map(gap => ({
          label: gap.skillName,
          subLabel: `${gap.sourceEntityName.slice(0, 16)}...`,
          currentVal: Math.min(100, Math.round((gap.currentLevel / gap.targetLevel) * 100)),
          targetVal: 100,
          color: gap.isCritical ? '#f87171' : '#38bdf8'
        }));
      })();

  const count = axes.length || 3;
  const angleStep = (Math.PI * 2) / count;

  // Calculate polygon points for grid rings (25%, 50%, 75%, 100%)
  const getRingPolygon = (pct: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * (pct / 100);
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Calculate polygon points for current values
  const currentPolygon = axes.map((axis, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius * (Math.max(5, axis.currentVal) / 100);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Calculate polygon points for target values (if in strategic mode)
  const targetPolygon = radarMode === 'strategic'
    ? axes.map((axis, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = radius * ((axis.targetVal || 100) / 100);
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ')
    : '';

  return (
    <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-4 flex flex-col justify-between" id="capability-radar-card">
      {/* HEADER & TOGGLE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5">
              {radarMode === 'attributes' ? <User className="h-3.5 w-3.5 text-[#c5a059]" /> : <Target className="h-3.5 w-3.5 text-cyan-400" />}
              {radarMode === 'attributes' ? 'CONSTITUTION_RADAR' : 'STRATEGIC_READINESS_RADAR'}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold bg-[#141824] border border-[#c5a059]/30 text-zinc-300">
              {axes.length} AXES
            </span>
          </div>
          <p className="text-[10px] font-sans text-zinc-400 mt-0.5">
            {radarMode === 'attributes' 
              ? 'Human Constitution: Symmetrical development across 9 Sovereign Attributes' 
              : 'Strategic Readiness: Current mastery versus required campaign capabilities'}
          </p>
        </div>

        {/* MODE SWITCHER */}
        <div className="flex items-center gap-1 bg-[#07080c] p-0.5 rounded-lg border border-[#c5a059]/30">
          <button
            type="button"
            onClick={() => setRadarMode('attributes')}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
              radarMode === 'attributes'
                ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            CONSTITUTION
          </button>
          <button
            type="button"
            onClick={() => setRadarMode('strategic')}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
              radarMode === 'strategic'
                ? 'bg-[#0e2a36] text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            STRATEGIC
          </button>
        </div>
      </div>

      {/* STRATEGIC FILTER SELECTOR (only in strategic mode) */}
      {radarMode === 'strategic' && activeGoalsAndProjects.length > 0 && (
        <div className="pt-2 flex items-center gap-2">
          <span className="text-[9px] font-mono text-zinc-500 uppercase">Focus Scope:</span>
          <select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="bg-[#07080c] border border-cyan-500/30 text-cyan-200 text-[10px] font-mono px-2 py-1 rounded focus:outline-none focus:border-cyan-400 truncate max-w-xs"
          >
            <option value="all">All Strategic Requirements</option>
            {activeGoalsAndProjects.map(e => (
              <option key={e.id} value={e.id}>
                [{e.type}] {e.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* RADAR SVG DISPLAY */}
      <div className="flex justify-center items-center py-2 relative" style={{ minHeight: `${height - 100}px` }}>
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          className="w-full max-w-[340px] max-h-[340px] overflow-visible select-none"
        >
          {/* CONCENTRIC RADAR RINGS */}
          {[25, 50, 75, 100].map(pct => (
            <polygon
              key={pct}
              points={getRingPolygon(pct)}
              fill="none"
              stroke={pct === 100 ? 'rgba(197,160,89,0.3)' : 'rgba(255,255,255,0.06)'}
              strokeWidth={pct === 100 ? 1.2 : 0.8}
              strokeDasharray={pct === 100 ? 'none' : '2,2'}
            />
          ))}

          {/* SPOKE AXIS LINES */}
          {axes.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="rgba(197,160,89,0.18)"
                strokeWidth={0.8}
              />
            );
          })}

          {/* STRATEGIC TARGET POLYGON (Ghost / Reference) */}
          {radarMode === 'strategic' && targetPolygon && (
            <polygon
              points={targetPolygon}
              fill="rgba(56,189,248,0.04)"
              stroke="rgba(56,189,248,0.4)"
              strokeWidth={1.5}
              strokeDasharray="4,3"
            />
          )}

          {/* CURRENT REALIZED CAPABILITY POLYGON */}
          <polygon
            points={currentPolygon}
            fill={radarMode === 'attributes' ? 'rgba(197,160,89,0.22)' : 'rgba(56,189,248,0.2)'}
            stroke={radarMode === 'attributes' ? '#c5a059' : '#38bdf8'}
            strokeWidth={2}
          />

          {/* VERTEX NODES & LABELS */}
          {axes.map((axis, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = radius * (Math.max(5, axis.currentVal) / 100);
            const vx = center + r * Math.cos(angle);
            const vy = center + r * Math.sin(angle);

            // Label coordinates slightly outside the outermost ring
            const labelR = radius + 22;
            const lx = center + labelR * Math.cos(angle);
            const ly = center + labelR * Math.sin(angle);

            // Text anchor calculation
            let anchor: 'middle' | 'start' | 'end' = 'middle';
            if (Math.abs(Math.cos(angle)) > 0.3) {
              anchor = Math.cos(angle) > 0 ? 'start' : 'end';
            }

            return (
              <g key={i}>
                {/* Vertex Node */}
                <circle
                  cx={vx}
                  cy={vy}
                  r={3.5}
                  fill={axis.color || '#c5a059'}
                  stroke="#07080c"
                  strokeWidth={1.5}
                />

                {/* Target marker (if strategic mode) */}
                {radarMode === 'strategic' && (
                  <circle
                    cx={center + radius * Math.cos(angle)}
                    cy={center + radius * Math.sin(angle)}
                    r={2}
                    fill="rgba(56,189,248,0.7)"
                  />
                )}

                {/* Axis Label */}
                <text
                  x={lx}
                  y={ly - 4}
                  textAnchor={anchor}
                  fill={axis.color || '#e5c875'}
                  fontSize="9px"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {axis.label.length > 13 ? `${axis.label.slice(0, 11)}..` : axis.label}
                </text>
                {axis.subLabel && (
                  <text
                    x={lx}
                    y={ly + 6}
                    textAnchor={anchor}
                    fill="#a1a1aa"
                    fontSize="7.5px"
                    fontFamily="monospace"
                  >
                    {axis.subLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* FOOTER LEGEND */}
      <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${radarMode === 'attributes' ? 'bg-[#c5a059]' : 'bg-cyan-400'}`} />
            <span>Current Realized</span>
          </div>
          {radarMode === 'strategic' && (
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full border border-cyan-400 border-dashed" />
              <span>Target Requirement</span>
            </div>
          )}
        </div>
        <span className="text-zinc-500 font-bold">
          {radarMode === 'attributes' ? 'DYNAMIC ENGINE' : 'GAP AUDIT ACTIVE'}
        </span>
      </div>
    </div>
  );
};
