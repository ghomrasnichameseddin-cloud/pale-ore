import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { 
  SOVEREIGN_ATTRIBUTES_METADATA, 
  evaluateStrategicGaps 
} from '../../utils/capabilityIntelligence';
import { CustomRadarConfig } from '../../types';
import { CustomRadarModal } from './CustomRadarModal';
import { Target, User, Plus, Edit2, Trash2, Sparkles, Sliders } from 'lucide-react';

interface CapabilityRadarProps {
  initialMode?: 'attributes' | 'strategic' | 'custom';
  initialCustomRadarId?: string;
  height?: number;
}

export const CapabilityRadar: React.FC<CapabilityRadarProps> = ({ 
  initialMode = 'attributes',
  initialCustomRadarId,
  height = 360 
}) => {
  const { state, getAttributes, getSkillXpAndLevel, deleteCustomRadar } = usePOS();
  const [radarMode, setRadarMode] = useState<'attributes' | 'strategic' | 'custom'>(initialMode);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');

  const customRadars = state.customRadars || [];
  const [selectedCustomRadarId, setSelectedCustomRadarId] = useState<string>(() => {
    if (initialCustomRadarId && customRadars.some(r => r.id === initialCustomRadarId)) {
      return initialCustomRadarId;
    }
    return customRadars[0]?.id || '';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [radarToEdit, setRadarToEdit] = useState<CustomRadarConfig | null>(null);

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

  // Active custom radar
  const selectedCustomRadar = customRadars.find(r => r.id === selectedCustomRadarId) || customRadars[0] || null;
  const customRadarColor = selectedCustomRadar?.accentColor || '#c5a059';

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

  const axes: RadarAxis[] = (() => {
    if (radarMode === 'attributes') {
      return attributes.map(attr => {
        const meta = SOVEREIGN_ATTRIBUTES_METADATA[attr.name];
        const normalized = Math.min(100, Math.max(10, Math.round((attr.level / 25) * 100)));
        return {
          label: attr.name,
          subLabel: `Lvl ${attr.level}`,
          currentVal: normalized,
          targetVal: 80,
          color: meta?.color || '#c5a059'
        };
      });
    }

    if (radarMode === 'strategic') {
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
    }

    // CUSTOM RADAR MODE
    if (selectedCustomRadar && selectedCustomRadar.axes && selectedCustomRadar.axes.length > 0) {
      return selectedCustomRadar.axes.map(axis => {
        let currentVal = 50;
        let targetVal = axis.targetValue || 100;
        let subLabel = '';

        if (axis.sourceType === 'skill' && axis.sourceId) {
          const skill = state.skills.find(s => s.id === axis.sourceId);
          if (skill) {
            const stats = getSkillXpAndLevel(skill.id);
            const targetLevel = axis.targetValue || 20;
            currentVal = Math.min(100, Math.max(5, Math.round((stats.level / Math.max(1, targetLevel)) * 100)));
            targetVal = 100;
            subLabel = `Lvl ${stats.level} / ${targetLevel}`;
          } else {
            subLabel = 'Skill';
          }
        } else if (axis.sourceType === 'attribute' && axis.sourceId) {
          const attr = attributes.find(a => a.name === axis.sourceId);
          if (attr) {
            currentVal = Math.min(100, Math.max(10, Math.round((attr.level / 25) * 100)));
            targetVal = axis.targetValue || 80;
            subLabel = `Lvl ${attr.level} (${currentVal}%)`;
          } else {
            subLabel = 'Attr';
          }
        } else if (axis.sourceType === 'custom') {
          currentVal = Math.min(100, Math.max(5, axis.customValue ?? 60));
          targetVal = Math.min(100, Math.max(10, axis.targetValue ?? 90));
          subLabel = `${currentVal}% / ${targetVal}%`;
        }

        return {
          label: axis.label,
          subLabel,
          currentVal,
          targetVal,
          color: axis.color || customRadarColor
        };
      });
    }

    return [
      { label: 'Deep Focus', subLabel: 'Lvl 1', currentVal: 35, targetVal: 80, color: customRadarColor },
      { label: 'Discipline', subLabel: 'Lvl 1', currentVal: 45, targetVal: 85, color: customRadarColor },
      { label: 'Execution', subLabel: 'Lvl 1', currentVal: 40, targetVal: 75, color: customRadarColor }
    ];
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

  // Calculate polygon points for target values (if in strategic or custom mode)
  const targetPolygon = (radarMode === 'strategic' || radarMode === 'custom')
    ? axes.map((axis, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = radius * ((axis.targetVal || 100) / 100);
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ')
    : '';

  // Average Realized Metric
  const avgRealizedPercent = axes.length > 0 
    ? Math.round(axes.reduce((sum, a) => sum + a.currentVal, 0) / axes.length)
    : 0;

  // Handle Deleting Current Custom Radar
  const handleDeleteCurrentRadar = () => {
    if (!selectedCustomRadar) return;
    if (window.confirm(`Are you sure you want to delete the custom radar "${selectedCustomRadar.name}"?`)) {
      deleteCustomRadar(selectedCustomRadar.id);
      const remaining = customRadars.filter(r => r.id !== selectedCustomRadar.id);
      if (remaining.length > 0) {
        setSelectedCustomRadarId(remaining[0].id);
      } else {
        setRadarMode('attributes');
      }
    }
  };

  return (
    <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-4 flex flex-col justify-between" id="capability-radar-card">
      
      {/* HEADER & MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: radarMode === 'custom' ? customRadarColor : radarMode === 'strategic' ? '#38bdf8' : '#e5c875' }}>
              {radarMode === 'attributes' && <User className="h-3.5 w-3.5 text-[#c5a059]" />}
              {radarMode === 'strategic' && <Target className="h-3.5 w-3.5 text-cyan-400" />}
              {radarMode === 'custom' && <Sparkles className="h-3.5 w-3.5" style={{ color: customRadarColor }} />}
              
              {radarMode === 'attributes' && 'CONSTITUTION_RADAR'}
              {radarMode === 'strategic' && 'STRATEGIC_READINESS_RADAR'}
              {radarMode === 'custom' && (selectedCustomRadar?.name.toUpperCase() || 'CUSTOM_CAPABILITY_RADAR')}
            </span>

            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold bg-[#141824] border border-white/10 text-zinc-300">
              {axes.length} AXES
            </span>

            {radarMode === 'custom' && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold border" style={{ backgroundColor: `${customRadarColor}15`, borderColor: `${customRadarColor}40`, color: customRadarColor }}>
                {avgRealizedPercent}% REALIZED
              </span>
            )}
          </div>

          <p className="text-[10px] font-sans text-zinc-400 mt-0.5">
            {radarMode === 'attributes' && 'Human Constitution: Symmetrical development across 9 Sovereign Attributes'}
            {radarMode === 'strategic' && 'Strategic Readiness: Current mastery versus required campaign capabilities'}
            {radarMode === 'custom' && (selectedCustomRadar?.description || 'Custom-designed operator capability polygon and competency matrix')}
          </p>
        </div>

        {/* 3-WAY MODE SWITCHER */}
        <div className="flex items-center gap-1 bg-[#07080c] p-0.5 rounded-lg border border-white/10 self-stretch sm:self-auto justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => setRadarMode('attributes')}
            className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
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
            className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
              radarMode === 'strategic'
                ? 'bg-[#0e2a36] text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            STRATEGIC
          </button>
          <button
            type="button"
            onClick={() => {
              setRadarMode('custom');
              if (customRadars.length > 0 && !selectedCustomRadarId) {
                setSelectedCustomRadarId(customRadars[0].id);
              }
            }}
            className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer flex items-center gap-1 ${
              radarMode === 'custom'
                ? 'bg-[#1b1c26] text-white border border-white/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>CUSTOM</span>
            {customRadars.length > 0 && (
              <span className="text-[8px] px-1 py-0.2 rounded bg-white/10 text-zinc-300">
                {customRadars.length}
              </span>
            )}
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

      {/* CUSTOM RADAR CONTROLS (only in custom mode) */}
      {radarMode === 'custom' && (
        <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[9px] font-mono text-zinc-500 uppercase shrink-0">Radar:</span>
            {customRadars.length > 0 ? (
              <select
                value={selectedCustomRadarId}
                onChange={(e) => setSelectedCustomRadarId(e.target.value)}
                className="bg-[#07080c] border border-white/15 text-white text-[10px] font-mono px-2 py-1 rounded focus:outline-none focus:border-[#c5a059] truncate flex-1 max-w-xs"
              >
                {customRadars.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.axes.length} axes)
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[10px] font-mono text-zinc-500 italic">No custom radars forged yet</span>
            )}

            {selectedCustomRadar && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setRadarToEdit(selectedCustomRadar);
                    setIsModalOpen(true);
                  }}
                  className="p-1 rounded bg-[#07080c] hover:bg-[#141824] border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Edit Custom Radar"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCurrentRadar}
                  className="p-1 rounded bg-[#07080c] hover:bg-red-950/60 border border-white/10 hover:border-red-500/40 text-zinc-400 hover:text-red-300 transition-colors cursor-pointer"
                  title="Delete Custom Radar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* QUICK FORGE RADAR BUTTON */}
          <button
            type="button"
            onClick={() => {
              setRadarToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-2.5 py-1 bg-[#3a2e12] hover:bg-[#524119] border border-[#c5a059]/40 text-[#fef08a] rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="h-3 w-3" />
            <span>+ FORGE RADAR</span>
          </button>
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
              stroke={pct === 100 ? (radarMode === 'custom' ? `${customRadarColor}50` : 'rgba(197,160,89,0.3)') : 'rgba(255,255,255,0.06)'}
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
                stroke={radarMode === 'custom' ? `${customRadarColor}25` : 'rgba(197,160,89,0.18)'}
                strokeWidth={0.8}
              />
            );
          })}

          {/* TARGET POLYGON (Ghost / Reference in Strategic and Custom mode) */}
          {(radarMode === 'strategic' || radarMode === 'custom') && targetPolygon && (
            <polygon
              points={targetPolygon}
              fill="none"
              stroke={radarMode === 'custom' ? `${customRadarColor}60` : 'rgba(56,189,248,0.4)'}
              strokeWidth={1.5}
              strokeDasharray="4,3"
            />
          )}

          {/* CURRENT REALIZED CAPABILITY POLYGON */}
          <polygon
            points={currentPolygon}
            fill={
              radarMode === 'custom' 
                ? `${customRadarColor}25`
                : radarMode === 'strategic' 
                  ? 'rgba(56,189,248,0.2)' 
                  : 'rgba(197,160,89,0.22)'
            }
            stroke={radarMode === 'custom' ? customRadarColor : radarMode === 'strategic' ? '#38bdf8' : '#c5a059'}
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
                  fill={axis.color || customRadarColor}
                  stroke="#07080c"
                  strokeWidth={1.5}
                />

                {/* Target marker (if targetVal is specified) */}
                {(radarMode === 'strategic' || radarMode === 'custom') && (
                  <circle
                    cx={center + (radius * ((axis.targetVal || 100) / 100)) * Math.cos(angle)}
                    cy={center + (radius * ((axis.targetVal || 100) / 100)) * Math.sin(angle)}
                    r={2}
                    fill={radarMode === 'custom' ? `${customRadarColor}90` : 'rgba(56,189,248,0.7)'}
                  />
                )}

                {/* Axis Label */}
                <text
                  x={lx}
                  y={ly - 4}
                  textAnchor={anchor}
                  fill={axis.color || (radarMode === 'custom' ? customRadarColor : '#e5c875')}
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
            <span 
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: radarMode === 'custom' ? customRadarColor : radarMode === 'strategic' ? '#38bdf8' : '#c5a059'
              }}
            />
            <span>Current Realized</span>
          </div>

          {(radarMode === 'strategic' || radarMode === 'custom') && (
            <div className="flex items-center gap-1">
              <span 
                className="h-2 w-2 rounded-full border border-dashed"
                style={{
                  borderColor: radarMode === 'custom' ? customRadarColor : '#38bdf8'
                }}
              />
              <span>Target Standard</span>
            </div>
          )}
        </div>

        <span className="text-zinc-500 font-bold">
          {radarMode === 'attributes' && 'DYNAMIC ENGINE'}
          {radarMode === 'strategic' && 'GAP AUDIT ACTIVE'}
          {radarMode === 'custom' && `${avgRealizedPercent}% MATRIX ALIGNMENT`}
        </span>
      </div>

      {/* CUSTOM RADAR BUILDER MODAL */}
      <CustomRadarModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRadarToEdit(null);
        }}
        radarToEdit={radarToEdit}
        onSave={(newRadarId) => {
          setSelectedCustomRadarId(newRadarId);
          setRadarMode('custom');
        }}
      />
    </div>
  );
};
