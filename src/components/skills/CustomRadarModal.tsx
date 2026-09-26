import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { CustomRadarConfig, CustomRadarAxis } from '../../types';
import { SOVEREIGN_ATTRIBUTES_METADATA } from '../../utils/capabilityIntelligence';
import { 
  X, Plus, Trash2, Sparkles, Sliders, Palette, 
  Target, Award, Shield, Check, HelpCircle
} from 'lucide-react';
import { ArabesqueCorner, RubElHizbIcon } from '../IslamicRpgDecorations';

interface CustomRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  radarToEdit?: CustomRadarConfig | null;
  onSave?: (radarId: string) => void;
}

const COLOR_PRESETS = [
  { name: 'Imperial Gold', hex: '#c5a059', ring: 'rgba(197,160,89,0.3)' },
  { name: 'Cyber Cyan', hex: '#38bdf8', ring: 'rgba(56,189,248,0.3)' },
  { name: 'Sacred Emerald', hex: '#10b981', ring: 'rgba(16,185,129,0.3)' },
  { name: 'Astral Violet', hex: '#a855f7', ring: 'rgba(168,85,247,0.3)' },
  { name: 'Solar Amber', hex: '#f59e0b', ring: 'rgba(245,158,11,0.3)' },
  { name: 'Crimson Blade', hex: '#ef4444', ring: 'rgba(239,68,68,0.3)' },
  { name: 'Sterling Silver', hex: '#94a3b8', ring: 'rgba(148,163,184,0.3)' }
];

export const CustomRadarModal: React.FC<CustomRadarModalProps> = ({
  isOpen,
  onClose,
  radarToEdit,
  onSave
}) => {
  const { state, getAttributes, getSkillXpAndLevel, addCustomRadar, updateCustomRadar } = usePOS();

  const attributes = getAttributes();
  const activeSkills = state.skills.filter(s => !s.archived);

  // Form states
  const [name, setName] = useState<string>(radarToEdit?.name || '');
  const [description, setDescription] = useState<string>(radarToEdit?.description || '');
  const [accentColor, setAccentColor] = useState<string>(radarToEdit?.accentColor || '#c5a059');
  const [axes, setAxes] = useState<CustomRadarAxis[]>(() => {
    if (radarToEdit?.axes && radarToEdit.axes.length > 0) {
      return [...radarToEdit.axes];
    }
    // Default starter 5-axis pentagon
    return [
      { id: 'ax-1', label: 'Deep Focus', sourceType: 'attribute', sourceId: 'Focus', targetValue: 80, color: '#c5a059' },
      { id: 'ax-2', label: 'Discipline', sourceType: 'attribute', sourceId: 'Discipline', targetValue: 85, color: '#e5c875' },
      { id: 'ax-3', label: 'Core Knowledge', sourceType: 'attribute', sourceId: 'Knowledge', targetValue: 80, color: '#38bdf8' },
      { id: 'ax-4', label: 'Vitality & Vigor', sourceType: 'attribute', sourceId: 'Vitality', targetValue: 75, color: '#34d399' },
      { id: 'ax-5', label: 'Inner Resolve', sourceType: 'attribute', sourceId: 'Resolve', targetValue: 80, color: '#a855f7' }
    ];
  });

  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState<string>('');
  const [selectedAttrToAdd, setSelectedAttrToAdd] = useState<string>('');
  const [customMetricName, setCustomMetricName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Add Axis from Skill
  const handleAddSkillAxis = () => {
    if (!selectedSkillToAdd) return;
    const skill = activeSkills.find(s => s.id === selectedSkillToAdd);
    if (!skill) return;

    if (axes.length >= 12) {
      setErrorMsg('A radar can contain at most 12 axes for optimal geometry.');
      return;
    }

    const newAxis: CustomRadarAxis = {
      id: `ax-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: skill.name,
      sourceType: 'skill',
      sourceId: skill.id,
      targetValue: 20, // target level 20 by default
      color: accentColor
    };
    setAxes(prev => [...prev, newAxis]);
    setSelectedSkillToAdd('');
    setErrorMsg('');
  };

  // Add Axis from Attribute
  const handleAddAttributeAxis = () => {
    if (!selectedAttrToAdd) return;
    const attr = attributes.find(a => a.name === selectedAttrToAdd);
    if (!attr) return;

    if (axes.length >= 12) {
      setErrorMsg('A radar can contain at most 12 axes for optimal geometry.');
      return;
    }

    const meta = SOVEREIGN_ATTRIBUTES_METADATA[attr.name];
    const newAxis: CustomRadarAxis = {
      id: `ax-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: attr.name,
      sourceType: 'attribute',
      sourceId: attr.name,
      targetValue: 80, // target 80% (approx Level 20)
      color: meta?.color || accentColor
    };
    setAxes(prev => [...prev, newAxis]);
    setSelectedAttrToAdd('');
    setErrorMsg('');
  };

  // Add Custom Metric Axis
  const handleAddCustomMetricAxis = () => {
    if (!customMetricName.trim()) return;

    if (axes.length >= 12) {
      setErrorMsg('A radar can contain at most 12 axes for optimal geometry.');
      return;
    }

    const newAxis: CustomRadarAxis = {
      id: `ax-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: customMetricName.trim(),
      sourceType: 'custom',
      customValue: 60,
      targetValue: 90,
      color: accentColor
    };
    setAxes(prev => [...prev, newAxis]);
    setCustomMetricName('');
    setErrorMsg('');
  };

  // Quick Preset Handlers
  const applyPreset = (type: 'triad' | 'pentagon' | 'hexagon' | 'skills') => {
    if (type === 'triad') {
      setAxes([
        { id: 'ax-t1', label: 'Mind (Knowledge)', sourceType: 'attribute', sourceId: 'Knowledge', targetValue: 85, color: '#38bdf8' },
        { id: 'ax-t2', label: 'Body (Vitality)', sourceType: 'attribute', sourceId: 'Vitality', targetValue: 80, color: '#34d399' },
        { id: 'ax-t3', label: 'Spirit (Faith)', sourceType: 'attribute', sourceId: 'Faith', targetValue: 90, color: '#c5a059' }
      ]);
    } else if (type === 'pentagon') {
      setAxes([
        { id: 'ax-p1', label: 'Deep Focus', sourceType: 'attribute', sourceId: 'Focus', targetValue: 80, color: '#c5a059' },
        { id: 'ax-p2', label: 'Discipline', sourceType: 'attribute', sourceId: 'Discipline', targetValue: 85, color: '#e5c875' },
        { id: 'ax-p3', label: 'Knowledge Base', sourceType: 'attribute', sourceId: 'Knowledge', targetValue: 80, color: '#38bdf8' },
        { id: 'ax-p4', label: 'Physical Vitality', sourceType: 'attribute', sourceId: 'Vitality', targetValue: 75, color: '#34d399' },
        { id: 'ax-p5', label: 'Inner Resolve', sourceType: 'attribute', sourceId: 'Resolve', targetValue: 80, color: '#a855f7' }
      ]);
    } else if (type === 'hexagon') {
      setAxes([
        { id: 'ax-h1', label: 'Focus', sourceType: 'attribute', sourceId: 'Focus', targetValue: 85, color: '#c5a059' },
        { id: 'ax-h2', label: 'Discipline', sourceType: 'attribute', sourceId: 'Discipline', targetValue: 90, color: '#e5c875' },
        { id: 'ax-h3', label: 'Knowledge', sourceType: 'attribute', sourceId: 'Knowledge', targetValue: 85, color: '#38bdf8' },
        { id: 'ax-h4', label: 'Wisdom', sourceType: 'attribute', sourceId: 'Wisdom', targetValue: 80, color: '#818cf8' },
        { id: 'ax-h5', label: 'Execution Speed', sourceType: 'custom', customValue: 75, targetValue: 90, color: '#f59e0b' },
        { id: 'ax-h6', label: 'Clarity', sourceType: 'attribute', sourceId: 'Clarity', targetValue: 80, color: '#34d399' }
      ]);
    } else if (type === 'skills') {
      const topSkills = activeSkills.slice(0, 6);
      if (topSkills.length >= 3) {
        setAxes(topSkills.map((s, idx) => ({
          id: `ax-sk-${idx}`,
          label: s.name,
          sourceType: 'skill',
          sourceId: s.id,
          targetValue: 20,
          color: COLOR_PRESETS[idx % COLOR_PRESETS.length].hex
        })));
      } else {
        setErrorMsg('You need at least 3 active skills to use the Top Skills preset.');
      }
    }
  };

  // Remove Axis
  const handleRemoveAxis = (axisId: string) => {
    if (axes.length <= 3) {
      setErrorMsg('A radar requires at least 3 axes to construct a valid polygon.');
      return;
    }
    setAxes(prev => prev.filter(a => a.id !== axisId));
    setErrorMsg('');
  };

  // Update Axis Property
  const handleUpdateAxis = (axisId: string, updates: Partial<CustomRadarAxis>) => {
    setAxes(prev => prev.map(a => a.id === axisId ? { ...a, ...updates } : a));
  };

  // Form Submit
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a name for this custom radar.');
      return;
    }
    if (axes.length < 3) {
      setErrorMsg('A radar must have at least 3 axes.');
      return;
    }

    if (radarToEdit) {
      updateCustomRadar(radarToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        accentColor,
        axes
      });
      if (onSave) onSave(radarToEdit.id);
    } else {
      const newId = addCustomRadar({
        name: name.trim(),
        description: description.trim(),
        accentColor,
        axes
      });
      if (onSave) onSave(newId);
    }
    onClose();
  };

  // Calculate live values for Mini-Radar Preview
  const previewAxes = axes.map(axis => {
    let currentVal = 50;
    let targetVal = axis.targetValue || 100;

    if (axis.sourceType === 'skill' && axis.sourceId) {
      const skill = activeSkills.find(s => s.id === axis.sourceId);
      if (skill) {
        const stats = getSkillXpAndLevel(skill.id);
        const targetLevel = axis.targetValue || 20;
        currentVal = Math.min(100, Math.max(5, Math.round((stats.level / Math.max(1, targetLevel)) * 100)));
        targetVal = 100;
      }
    } else if (axis.sourceType === 'attribute' && axis.sourceId) {
      const attr = attributes.find(a => a.name === axis.sourceId);
      if (attr) {
        currentVal = Math.min(100, Math.max(10, Math.round((attr.level / 25) * 100)));
        targetVal = axis.targetValue || 80;
      }
    } else if (axis.sourceType === 'custom') {
      currentVal = Math.min(100, Math.max(5, axis.customValue ?? 60));
      targetVal = Math.min(100, Math.max(10, axis.targetValue ?? 90));
    }

    return {
      label: axis.label,
      currentVal,
      targetVal,
      color: axis.color || accentColor
    };
  });

  // Mini-Radar Geometry
  const size = 220;
  const center = size / 2;
  const radius = center - 30;
  const count = Math.max(3, previewAxes.length);
  const angleStep = (Math.PI * 2) / count;

  const getRingPolygon = (pct: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * (pct / 100);
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const currentPolygon = previewAxes.map((axis, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius * (Math.max(5, axis.currentVal) / 100);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const targetPolygon = previewAxes.map((axis, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius * (Math.max(10, axis.targetVal) / 100);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="bg-[#0b0d13] border border-[#c5a059]/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden my-auto"
        id="custom-radar-modal"
      >
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color={accentColor} />
        <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-4 w-4" color={accentColor} />

        {/* MODAL HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#07080c]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg border flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}50` }}
            >
              <RubElHizbIcon className="h-4 w-4" color={accentColor} />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white tracking-wide flex items-center gap-2">
                {radarToEdit ? 'Re-align Custom Radar' : 'Forge Custom Capability Radar'}
              </h3>
              <p className="text-[11px] font-sans text-zinc-400">
                Design custom polygonal competency vectors across skills, attributes, or operator metrics.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 font-mono flex items-center justify-between">
              <span>⚠️ {errorMsg}</span>
              <button 
                type="button" 
                onClick={() => setErrorMsg('')} 
                className="text-red-400 hover:text-red-200 cursor-pointer text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TOP SECTION: CONFIG & LIVE PREVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* LEFT / CENTER: PRIMARY METADATA (7 COLS) */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider block font-bold mb-1.5">
                  Radar Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Full-Stack Systems Architect, Spiritual Focus Triad..."
                  className="w-full bg-[#07080c] border border-white/10 focus:border-[#c5a059] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold mb-1.5">
                  Strategic Scope / Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Tracks craft disciplines essential for Q4 engineering targets..."
                  className="w-full bg-[#07080c] border border-white/10 focus:border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none font-sans"
                />
              </div>

              {/* ACCENT COLOR SELECTION */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold mb-1.5 flex items-center gap-1.5">
                  <Palette className="h-3 w-3 text-zinc-400" />
                  <span>Resonance Theme Tint</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setAccentColor(preset.hex)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        accentColor === preset.hex
                          ? 'border-white text-white shadow-md'
                          : 'border-white/10 text-zinc-400 hover:border-white/20'
                      }`}
                      style={{
                        backgroundColor: accentColor === preset.hex ? `${preset.hex}25` : '#07080c'
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* QUICK PRESETS */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold mb-1.5">
                  Quick Geometry Presets
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyPreset('triad')}
                    className="px-2.5 py-1 bg-[#07080c] hover:bg-[#141824] border border-white/10 hover:border-white/20 text-zinc-300 rounded text-[10px] font-mono cursor-pointer transition-colors"
                  >
                    🔺 Triad (3)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('pentagon')}
                    className="px-2.5 py-1 bg-[#07080c] hover:bg-[#141824] border border-white/10 hover:border-white/20 text-zinc-300 rounded text-[10px] font-mono cursor-pointer transition-colors"
                  >
                    ⭐ Pentagon (5)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('hexagon')}
                    className="px-2.5 py-1 bg-[#07080c] hover:bg-[#141824] border border-white/10 hover:border-white/20 text-zinc-300 rounded text-[10px] font-mono cursor-pointer transition-colors"
                  >
                    ⬡ Hexagon (6)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('skills')}
                    className="px-2.5 py-1 bg-[#07080c] hover:bg-[#141824] border border-white/10 hover:border-white/20 text-zinc-300 rounded text-[10px] font-mono cursor-pointer transition-colors"
                  >
                    🎯 Top Active Skills
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: LIVE MINI-RADAR PREVIEW (5 COLS) */}
            <div className="md:col-span-5 bg-[#07080c] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center relative">
              <div className="w-full flex justify-between items-center text-[9px] font-mono text-zinc-400 mb-1">
                <span className="uppercase font-bold tracking-wider" style={{ color: accentColor }}>
                  POLYGON PREVIEW
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                  {axes.length} AXES
                </span>
              </div>

              {/* LIVE SVG PREVIEW */}
              <div className="w-[220px] h-[220px] relative flex items-center justify-center">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible select-none">
                  {/* CONCENTRIC RADAR RINGS */}
                  {[25, 50, 75, 100].map(pct => (
                    <polygon
                      key={pct}
                      points={getRingPolygon(pct)}
                      fill="none"
                      stroke={pct === 100 ? `${accentColor}50` : 'rgba(255,255,255,0.06)'}
                      strokeWidth={pct === 100 ? 1.2 : 0.8}
                      strokeDasharray={pct === 100 ? 'none' : '2,2'}
                    />
                  ))}

                  {/* SPOKES */}
                  {previewAxes.map((_, i) => {
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
                        stroke={`${accentColor}25`}
                        strokeWidth={0.8}
                      />
                    );
                  })}

                  {/* GHOST TARGET POLYGON */}
                  {targetPolygon && (
                    <polygon
                      points={targetPolygon}
                      fill="none"
                      stroke={`${accentColor}60`}
                      strokeWidth={1.2}
                      strokeDasharray="3,3"
                    />
                  )}

                  {/* REALIZED POLYGON */}
                  <polygon
                    points={currentPolygon}
                    fill={`${accentColor}25`}
                    stroke={accentColor}
                    strokeWidth={2}
                  />

                  {/* VERTEX NODES & LABELS */}
                  {previewAxes.map((axis, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const r = radius * (Math.max(5, axis.currentVal) / 100);
                    const vx = center + r * Math.cos(angle);
                    const vy = center + r * Math.sin(angle);

                    const labelR = radius + 15;
                    const lx = center + labelR * Math.cos(angle);
                    const ly = center + labelR * Math.sin(angle);

                    let anchor: 'middle' | 'start' | 'end' = 'middle';
                    if (Math.abs(Math.cos(angle)) > 0.3) {
                      anchor = Math.cos(angle) > 0 ? 'start' : 'end';
                    }

                    return (
                      <g key={i}>
                        <circle
                          cx={vx}
                          cy={vy}
                          r={3}
                          fill={axis.color || accentColor}
                          stroke="#07080c"
                          strokeWidth={1.2}
                        />
                        <text
                          x={lx}
                          y={ly}
                          textAnchor={anchor}
                          fill="#d4d4d8"
                          fontSize="7.5px"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {axis.label.length > 10 ? `${axis.label.slice(0, 9)}..` : axis.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="w-full flex justify-between items-center text-[9px] font-mono text-zinc-500 mt-2 pt-2 border-t border-white/5">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span>Realized Polygon</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full border border-dashed" style={{ borderColor: accentColor }} />
                  <span>Target Ghost</span>
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: AXIS BUILDER */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h4 className="text-xs font-mono font-bold text-[#fef08a] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-[#c5a059]" />
                  <span>Operational Axes Configuration ({axes.length}/12)</span>
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Add disciplines from your active skills, core attributes, or custom performance indicators.
                </p>
              </div>
            </div>

            {/* THREE QUICK-ADD TOOLBARS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* TOOLBAR 1: ADD FROM ACTIVE SKILL */}
              <div className="p-3 bg-[#07080c] border border-white/10 rounded-xl space-y-2">
                <span className="text-[10px] font-mono text-cyan-300 uppercase block font-semibold flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span>From Active Skill Track</span>
                </span>
                <div className="flex gap-1.5 items-center">
                  <select
                    value={selectedSkillToAdd}
                    onChange={(e) => setSelectedSkillToAdd(e.target.value)}
                    className="bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white flex-1 min-w-0 font-mono truncate focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">-- Choose Skill --</option>
                    {activeSkills.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Lv. {getSkillXpAndLevel(s.id).level})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedSkillToAdd}
                    onClick={handleAddSkillAxis}
                    className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 rounded text-xs font-mono font-bold disabled:opacity-40 cursor-pointer shrink-0 transition-colors"
                  >
                    ADD
                  </button>
                </div>
              </div>

              {/* TOOLBAR 2: ADD FROM ATTRIBUTES */}
              <div className="p-3 bg-[#07080c] border border-white/10 rounded-xl space-y-2">
                <span className="text-[10px] font-mono text-[#e5c875] uppercase block font-semibold flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>From Core Attribute</span>
                </span>
                <div className="flex gap-1.5 items-center">
                  <select
                    value={selectedAttrToAdd}
                    onChange={(e) => setSelectedAttrToAdd(e.target.value)}
                    className="bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white flex-1 min-w-0 font-mono truncate focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="">-- Choose Attribute --</option>
                    {attributes.map(a => (
                      <option key={a.name} value={a.name}>
                        {a.name} (Lv. {a.level})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedAttrToAdd}
                    onClick={handleAddAttributeAxis}
                    className="px-3 py-1.5 bg-[#3a2e12] hover:bg-[#524119] border border-[#c5a059]/40 text-[#fef08a] rounded text-xs font-mono font-bold disabled:opacity-40 cursor-pointer shrink-0 transition-colors"
                  >
                    ADD
                  </button>
                </div>
              </div>

              {/* TOOLBAR 3: ADD CUSTOM METRIC */}
              <div className="p-3 bg-[#07080c] border border-white/10 rounded-xl space-y-2">
                <span className="text-[10px] font-mono text-emerald-300 uppercase block font-semibold flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>Custom Metric Axis</span>
                </span>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="text"
                    value={customMetricName}
                    onChange={(e) => setCustomMetricName(e.target.value)}
                    placeholder="e.g. Sleep Restfulness"
                    className="bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white flex-1 min-w-0 font-sans focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    disabled={!customMetricName.trim()}
                    onClick={handleAddCustomMetricAxis}
                    className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 rounded text-xs font-mono font-bold disabled:opacity-40 cursor-pointer shrink-0 transition-colors"
                  >
                    ADD
                  </button>
                </div>
              </div>

            </div>

            {/* DYNAMIC LIST OF ACTIVE AXES */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Configured Axes ({axes.length})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {axes.map((axis, idx) => (
                  <div 
                    key={axis.id}
                    className="p-3 bg-[#07080c] border border-white/10 rounded-xl space-y-2 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: axis.color || accentColor }} 
                        />
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 uppercase font-bold shrink-0">
                          {axis.sourceType}
                        </span>
                        <input
                          type="text"
                          value={axis.label}
                          onChange={(e) => handleUpdateAxis(axis.id, { label: e.target.value })}
                          className="bg-transparent border-b border-white/10 focus:border-[#c5a059] text-xs font-mono font-bold text-white px-1 py-0.5 w-full focus:outline-none truncate"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAxis(axis.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer shrink-0"
                        title="Remove Axis"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* TARGET CONTROLS PER AXIS TYPE */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 gap-2 pt-1 border-t border-white/5">
                      {axis.sourceType === 'skill' && (
                        <>
                          <span>Target Level:</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={axis.targetValue || 20}
                              onChange={(e) => handleUpdateAxis(axis.id, { targetValue: Number(e.target.value) || 20 })}
                              className="w-16 bg-[#0b0d13] border border-white/10 rounded px-1.5 py-0.5 text-center text-cyan-300 font-bold focus:outline-none"
                            />
                            <span>Lvl</span>
                          </div>
                        </>
                      )}

                      {axis.sourceType === 'attribute' && (
                        <>
                          <span>Target Score:</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="range"
                              min={20}
                              max={100}
                              step={5}
                              value={axis.targetValue || 80}
                              onChange={(e) => handleUpdateAxis(axis.id, { targetValue: Number(e.target.value) })}
                              className="w-24 accent-[#c5a059]"
                            />
                            <span className="text-[#fef08a] font-bold">{axis.targetValue || 80}%</span>
                          </div>
                        </>
                      )}

                      {axis.sourceType === 'custom' && (
                        <div className="w-full flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1">
                            <span>Score:</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={axis.customValue ?? 60}
                              onChange={(e) => handleUpdateAxis(axis.id, { customValue: Math.min(100, Math.max(0, Number(e.target.value))) })}
                              className="w-12 bg-[#0b0d13] border border-white/10 rounded px-1 py-0.5 text-center text-emerald-300 font-bold focus:outline-none"
                            />
                            <span>%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Target:</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={axis.targetValue ?? 90}
                              onChange={(e) => handleUpdateAxis(axis.id, { targetValue: Math.min(100, Math.max(0, Number(e.target.value))) })}
                              className="w-12 bg-[#0b0d13] border border-white/10 rounded px-1 py-0.5 text-center text-[#fef08a] font-bold focus:outline-none"
                            />
                            <span>%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-white/10 bg-[#07080c]/80 shrink-0">
          <div className="text-[11px] font-mono text-zinc-500">
            {axes.length >= 3 
              ? `Ready: ${axes.length} axes synthesized` 
              : 'Minimum 3 axes required'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-zinc-400 hover:text-white rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim() || axes.length < 3}
              className="px-5 py-2 bg-[#3a2e12] hover:bg-[#524119] border border-[#c5a059] text-[#fef08a] rounded-xl text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(197,160,89,0.2)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>{radarToEdit ? 'Save Re-alignment' : 'Forge Custom Radar'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
