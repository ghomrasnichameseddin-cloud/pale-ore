import React, { useState } from 'react';
import { 
  ChevronRight, Sparkles, Filter, X, ArrowUpRight, 
  HelpCircle, Eye, EyeOff, Layers, CheckCircle2
} from 'lucide-react';
import { Attribute, CoreDomain, POSState } from '../types';
import { 
  CORE_DOMAINS, 
  DOMAIN_ATTRIBUTES, 
  CORE_DOMAIN_METADATA, 
  canonicalizeAttributeName, 
  ATTRIBUTE_DOMAIN_MAP,
  CoreDomainProgress
} from '../utils/progressionEngine';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';

interface DashboardDomainAttributesProps {
  attributes: Attribute[];
  coreDomains: Record<CoreDomain, CoreDomainProgress>;
  selectedAttributeName: string | null;
  onSelectAttribute: (name: string | null) => void;
  selectedDomainFilter: CoreDomain | 'ALL';
  onChangeDomainFilter: (domain: CoreDomain | 'ALL') => void;
  state: POSState;
  onNavigate?: (tab: string) => void;
}

export const DashboardDomainAttributes: React.FC<DashboardDomainAttributesProps> = ({
  attributes,
  coreDomains,
  selectedAttributeName,
  onSelectAttribute,
  selectedDomainFilter,
  onChangeDomainFilter,
  state,
  onNavigate
}) => {
  // Toggle between simplified view and detailed formula view
  const [showDetailedFormulas, setShowDetailedFormulas] = useState(false);

  // Calculate domain equilibrium / balance insight
  const domainLevels = CORE_DOMAINS.map(d => ({
    domain: d,
    level: coreDomains[d]?.level ?? 1,
    progress: coreDomains[d]?.progress ?? 0
  }));
  const minDomain = domainLevels.reduce((prev, curr) => curr.level < prev.level ? curr : prev, domainLevels[0]);
  const maxDomain = domainLevels.reduce((prev, curr) => curr.level > prev.level ? curr : prev, domainLevels[0]);
  const isBalanced = maxDomain.level - minDomain.level <= 2;

  // Selected attribute object
  const selectedAttr = selectedAttributeName 
    ? attributes.find(a => canonicalizeAttributeName(a.name) === canonicalizeAttributeName(selectedAttributeName))
    : null;

  // Linked skills for selected attribute
  const relatedSkills = selectedAttr
    ? state.skills.filter(s => {
        const canonical = canonicalizeAttributeName(selectedAttr.name);
        const p = canonicalizeAttributeName(s.primaryAttribute);
        const sec = s.secondaryAttribute ? canonicalizeAttributeName(s.secondaryAttribute) : null;
        return p === canonical || sec === canonical;
      })
    : [];

  // Filtered attributes based on domain
  const displayedAttributes = attributes.filter(attr => {
    if (selectedDomainFilter === 'ALL') return true;
    const canonical = canonicalizeAttributeName(attr.name);
    return DOMAIN_ATTRIBUTES[selectedDomainFilter].includes(canonical);
  });

  return (
    <div 
      className="glass-panel rounded-2xl p-5 border border-[var(--border-accent)] bg-[var(--bg-card)]/90 relative overflow-hidden space-y-4 shadow-xl" 
      id="dashboard-attributes-matrix"
    >
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />

      {/* TOP HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright)] shrink-0" />
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>CORE DOMAINS &amp; ATTRIBUTES</span>
              <span className="text-[10px] font-sans font-normal text-zinc-400 hidden sm:inline">
                ({attributes.length} Sovereign Pillars)
              </span>
            </h3>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          {/* Detailed Formulas toggle */}
          <button
            type="button"
            onClick={() => setShowDetailedFormulas(!showDetailedFormulas)}
            className={`px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              showDetailedFormulas 
                ? 'bg-[var(--accent-surface)] border-[var(--border-accent)] text-[var(--accent-highlight)]' 
                : 'bg-[#07080c] border-white/10 text-zinc-400 hover:text-white'
            }`}
            title={showDetailedFormulas ? "Switch to simplified view" : "Show formula breakdown"}
          >
            {showDetailedFormulas ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            <span>{showDetailedFormulas ? 'DETAILED' : 'SIMPLIFIED'}</span>
          </button>

          {selectedAttributeName && (
            <button
              onClick={() => onSelectAttribute(null)}
              className="text-[10px] text-rose-300 hover:text-white bg-rose-950/40 border border-rose-500/30 px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              <span>CLEAR FILTER</span>
            </button>
          )}

          {onNavigate && (
            <button 
              onClick={() => onNavigate('skills')}
              className="text-[10px] font-bold text-[var(--accent-bright)] hover:text-[var(--accent-highlight)] flex items-center gap-1 transition cursor-pointer ml-1"
            >
              <span>CODEX</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* 1. THREE CORE DOMAINS (MIND, BODY, SOUL) TRIAD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CORE_DOMAINS.map(domainName => {
          const domainInfo = coreDomains[domainName];
          const isSelected = selectedDomainFilter === domainName;
          const meta = CORE_DOMAIN_METADATA[domainName];
          const accentColor = domainName === 'Mind' ? '#38bdf8' : (domainName === 'Body' ? '#f87171' : '#e5c875');
          const domainPillarsCount = DOMAIN_ATTRIBUTES[domainName].length;

          return (
            <div
              key={domainName}
              onClick={() => onChangeDomainFilter(isSelected ? 'ALL' : domainName)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-[#181c2b] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.25)] ring-1 ring-[#c5a059]/50'
                  : 'bg-[#07080c]/80 border-white/5 hover:border-white/20 hover:bg-[#0c0e17]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg border border-white/10 shrink-0"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                      {domainName}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Mean: <strong className="text-white font-bold">Lv.{domainInfo?.level ?? 1}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-extrabold block" style={{ color: accentColor }}>
                    {domainInfo?.progress ?? 0}%
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">
                    {domainPillarsCount} Pillars
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#050608] h-1.5 rounded-full overflow-hidden mt-3 border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${domainInfo?.progress ?? 0}%`, 
                    backgroundColor: accentColor,
                    boxShadow: `0 0 8px ${accentColor}66`
                  }}
                />
              </div>

              {/* Selection hint */}
              <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                <span className="truncate">
                  {DOMAIN_ATTRIBUTES[domainName].slice(0, 3).join(' · ')}...
                </span>
                <span className={`transition-colors font-bold ${isSelected ? 'text-[#e5c875]' : 'group-hover:text-zinc-300'}`}>
                  {isSelected ? 'ACTIVE ▾' : 'FILTER →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DOMAIN EQUILIBRIUM & FILTER SELECTOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-white/5">
        <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
          <span className="text-emerald-400">●</span>
          <span>
            {isBalanced ? (
              <span className="text-zinc-300 font-medium">Domain Equilibrium: <strong className="text-emerald-400">Balanced Triad</strong></span>
            ) : (
              <span className="text-zinc-300 font-medium">Ascension Focus: <strong className="text-amber-400">{minDomain.domain} Domain (Lv.{minDomain.level})</strong></span>
            )}
          </span>
        </div>

        {/* Clean domain segmented selector */}
        <div className="flex items-center gap-1 p-0.5 bg-[#07080c] border border-white/10 rounded-lg">
          {(['ALL', 'Mind', 'Body', 'Soul'] as const).map(d => {
            const isActive = selectedDomainFilter === d;
            const count = d === 'ALL' ? attributes.length : DOMAIN_ATTRIBUTES[d].length;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onChangeDomainFilter(d)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold ${
                  isActive
                    ? 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)] shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {d === 'ALL' ? `All (${count})` : `${d} (${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ATTRIBUTES GRID - SIMPLIFIED OR DETAILED */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {displayedAttributes.map(attr => {
          const totalVal = attr.total ?? attr.level;
          const baseVal = attr.baseLevel ?? 10;
          const bonusVal = attr.earnedBonus ?? (totalVal - baseVal);
          const isSelected = selectedAttributeName === attr.name;
          const ptsInto = attr.pointsIntoLevel ?? 0;
          const ptsNeeded = attr.pointsRequiredForNextLevel ?? 14;
          const pct = attr.progress ?? 0;
          const canonical = canonicalizeAttributeName(attr.name);
          const domain = ATTRIBUTE_DOMAIN_MAP[canonical] || 'Mind';
          const domainColor = domain === 'Mind' ? '#38bdf8' : (domain === 'Body' ? '#f87171' : '#e5c875');

          return (
            <div 
              key={attr.name} 
              onClick={() => onSelectAttribute(isSelected ? null : attr.name)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer space-y-1.5 relative group ${
                isSelected
                  ? 'bg-[var(--accent-surface)] border-[var(--accent-bright)] shadow-[0_0_15px_var(--glow-color)] ring-1 ring-[var(--border-accent)]'
                  : 'bg-[var(--bg-void)]/80 border-[var(--border-subtle)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              {/* Top row: Icon, Name, and Level */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base shrink-0">{attr.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-mono font-bold text-white truncate block">
                      {attr.name}
                    </span>
                    <span 
                      className="text-[8px] font-mono uppercase font-bold tracking-wider block leading-none mt-0.5"
                      style={{ color: domainColor }}
                    >
                      {domain}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-extrabold text-[var(--accent-highlight)] tabular-nums">
                    Lv.{totalVal}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[var(--bg-void)] rounded-full h-1.5 overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${pct}%`,
                    backgroundColor: domainColor,
                    boxShadow: isSelected ? `0 0 8px ${domainColor}88` : undefined
                  }}
                />
              </div>

              {/* Formula details or simplified progress line */}
              {showDetailedFormulas ? (
                <div className="flex justify-between text-[8px] font-mono text-zinc-400 pt-0.5 tabular-nums">
                  <span>BASE {baseVal}</span>
                  <span className="text-zinc-300">{ptsInto}/{ptsNeeded} XP</span>
                  <span className="text-emerald-400 font-bold">+{bonusVal}</span>
                </div>
              ) : (
                <div className="flex justify-between text-[9px] font-mono text-zinc-400 pt-0.5 tabular-nums">
                  <span>{pct}% to Lv.{totalVal + 1}</span>
                  <span className="text-zinc-500">{ptsInto}/{ptsNeeded} XP</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. COMPACT & CLEAN ATTRIBUTE RESONANCE INSPECTOR */}
      {selectedAttr && (
        <div className="p-3.5 bg-[var(--bg-void)]/95 border border-[var(--border-accent)] rounded-xl space-y-3 animate-fadeIn shadow-lg">
          <div className="flex justify-between items-start gap-2 border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1 bg-white/5 rounded-lg border border-white/10 shrink-0">
                {selectedAttr.icon}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                    <RubElHizbIcon className="h-3 w-3 text-[var(--accent-bright)]" />
                    {selectedAttr.name} Pillar Resonance
                  </h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a]">
                    {ATTRIBUTE_DOMAIN_MAP[canonicalizeAttributeName(selectedAttr.name)] || 'Mind'} Domain
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    ⚡ DIRECTIVES FILTERED
                  </span>
                </div>
                <p className="text-[11px] font-sans text-zinc-300 mt-1">
                  {selectedAttr.description}
                </p>
              </div>
            </div>

            <button 
              onClick={() => onSelectAttribute(null)}
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/5 text-xs font-mono cursor-pointer shrink-0"
              title="Close inspection"
            >
              ✕
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg">
              <span className="text-[9px] text-zinc-400 uppercase block">Current Tier</span>
              <span className="text-sm font-extrabold text-white">LVL {selectedAttr.total ?? selectedAttr.level}</span>
            </div>
            <div className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg">
              <span className="text-[9px] text-zinc-400 uppercase block">Next Level XP</span>
              <span className="text-xs font-bold text-[#fef08a]">{selectedAttr.pointsIntoLevel ?? 0} / {selectedAttr.pointsRequiredForNextLevel ?? 14} PTS</span>
            </div>
            <div className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg">
              <span className="text-[9px] text-zinc-400 uppercase block">Progress</span>
              <span className="text-xs font-bold text-emerald-400">{selectedAttr.progress ?? 0}%</span>
            </div>
            <div className="p-2 bg-[var(--accent-surface)] border border-[var(--border-accent)] rounded-lg">
              <span className="text-[9px] text-[var(--accent-highlight)] font-bold uppercase block">Earned Bonus</span>
              <span className="text-sm font-extrabold text-[var(--accent-bright)]">+{selectedAttr.earnedBonus ?? 0}</span>
            </div>
          </div>

          {/* Linked Skills Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[var(--accent-bright)] font-bold uppercase">Linked Competencies:</span>
              {relatedSkills.length > 0 ? (
                relatedSkills.map(sk => (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => onNavigate && onNavigate('skills')}
                    className="bg-[var(--accent-surface)] hover:bg-[var(--accent-surface)]/80 border border-[var(--border-accent)] text-[var(--accent-highlight)] hover:text-white px-2 py-0.5 rounded-md transition cursor-pointer"
                  >
                    {sk.name} (Lv.{sk.level})
                  </button>
                ))
              ) : (
                <span className="text-zinc-500 italic">No direct skills mapped yet</span>
              )}
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('skills')}
                className="text-[10px] font-mono text-zinc-400 hover:text-[var(--accent-highlight)] flex items-center gap-1 cursor-pointer ml-auto"
              >
                <span>Deep Codex &amp; Formula Settings</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
