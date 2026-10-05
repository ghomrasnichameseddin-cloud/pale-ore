import React, { useState } from 'react';
import { 
  ChevronRight, X, Sparkles, Filter, 
  ArrowUpRight, Eye, LayoutGrid, Columns3
} from 'lucide-react';
import { Attribute, CoreDomain, POSState } from '../types';
import { 
  CORE_DOMAINS, 
  DOMAIN_ATTRIBUTES, 
  CORE_DOMAIN_METADATA, 
  canonicalizeAttributeName, 
  ATTRIBUTE_DOMAIN_MAP,
  CANONICAL_ATTRIBUTE_METADATA,
  CanonicalAttributeName,
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
  // View mode: 'TRIAD_COLUMNS' (3 orderly columns, one per realm) vs 'TABBED_REALM' (focus on 1 realm at a time)
  const [layoutMode, setLayoutMode] = useState<'TRIAD_COLUMNS' | 'TABBED_REALM'>('TRIAD_COLUMNS');

  // Active tab when in TABBED_REALM mode
  const [activeTabDomain, setActiveTabDomain] = useState<CoreDomain>('Mind');

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

  // Map of canonical name to Attribute
  const attrMap = new Map<string, Attribute>();
  attributes.forEach(a => {
    attrMap.set(canonicalizeAttributeName(a.name), a);
  });

  return (
    <div 
      className="glass-panel rounded-2xl p-4 sm:p-5 border border-[var(--border-accent)] bg-[var(--bg-card)]/90 relative overflow-hidden space-y-3.5 shadow-xl" 
      id="dashboard-attributes-matrix"
    >
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />

      {/* TOP HEADER & CONTROLS */}
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright)] shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              CONSTITUTIONAL REALMS &amp; PILLARS
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
              18 Pillars Ordered
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          {/* Domain Equilibrium Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-white/5 text-zinc-400">
            <span className={isBalanced ? "text-emerald-400" : "text-amber-400"}>●</span>
            <span>
              {isBalanced ? 'Balanced Equilibrium' : `Focus: ${minDomain.domain}`}
            </span>
          </div>

          {/* Layout Mode Toggle */}
          <div className="flex items-center bg-[#07080c] border border-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode('TRIAD_COLUMNS')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer font-bold ${
                layoutMode === 'TRIAD_COLUMNS'
                  ? 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Show all 3 realms in clean parallel columns"
            >
              <Columns3 className="h-3 w-3" />
              <span className="hidden md:inline">3 REALMS</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('TABBED_REALM')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer font-bold ${
                layoutMode === 'TABBED_REALM'
                  ? 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Focus on 1 realm tab at a time"
            >
              <LayoutGrid className="h-3 w-3" />
              <span className="hidden md:inline">TABS</span>
            </button>
          </div>

          {/* Full Codex Link */}
          {onNavigate && (
            <button 
              onClick={() => onNavigate('skills')}
              className="text-[10px] font-bold text-[var(--accent-bright)] hover:text-[var(--accent-highlight)] flex items-center gap-0.5 transition cursor-pointer ml-1"
              title="Open full skills & attributes codex"
            >
              <span>CODEX</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE RESONANCE BANNER (COMPACT 1-LINE) */}
      {selectedAttr && (
        <div className="px-3 py-2 bg-[var(--accent-surface)]/80 border border-[var(--border-accent)] rounded-xl flex items-center justify-between gap-2 text-xs font-mono animate-fadeIn">
          <div className="flex items-center gap-2 truncate">
            <span className="text-base">{selectedAttr.icon}</span>
            <span className="text-white font-bold truncate">
              RESONANCE ACTIVE: <strong className="text-[var(--accent-highlight)]">{selectedAttr.name.toUpperCase()}</strong> (Lv.{selectedAttr.total ?? selectedAttr.level})
            </span>
            <span className="text-[10px] text-zinc-400 hidden sm:inline">
              — Directives Board below is filtered
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectAttribute(null)}
            className="text-[10px] text-rose-300 hover:text-white bg-rose-950/50 border border-rose-500/30 px-2 py-0.5 rounded cursor-pointer shrink-0 font-bold flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            <span>CLEAR</span>
          </button>
        </div>
      )}

      {/* MODE 1: TRIAD COLUMNS (3 ORDERLY REALM COLUMNS) */}
      {layoutMode === 'TRIAD_COLUMNS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CORE_DOMAINS.map(domain => {
            const domainInfo = coreDomains[domain];
            const meta = CORE_DOMAIN_METADATA[domain];
            const accent = domain === 'Mind' ? '#38bdf8' : (domain === 'Body' ? '#f87171' : '#e5c875');
            const pillarNames = DOMAIN_ATTRIBUTES[domain];

            return (
              <div 
                key={domain} 
                className="bg-[#07080c]/90 border border-white/10 rounded-xl p-3 space-y-2.5 flex flex-col justify-between"
              >
                {/* Realm Column Header */}
                <div className="border-b border-white/5 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base p-1 rounded-md border border-white/10" style={{ backgroundColor: `${accent}15` }}>
                        {meta.icon}
                      </span>
                      <div>
                        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          {domain} Realm
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-400">
                          Mean: <strong className="text-white font-bold">Lv.{domainInfo?.level ?? 1}</strong>
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-extrabold" style={{ color: accent }}>
                      {domainInfo?.progress ?? 0}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#050608] h-1.5 rounded-full overflow-hidden mt-2 border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${domainInfo?.progress ?? 0}%`, 
                        backgroundColor: accent,
                        boxShadow: `0 0 6px ${accent}66`
                      }} 
                    />
                  </div>
                </div>

                {/* 6 Ordered Pillars */}
                <div className="space-y-1.5">
                  {pillarNames.map(attrName => {
                    const attr = attrMap.get(canonicalizeAttributeName(attrName));
                    const totalVal = attr?.total ?? attr?.level ?? 10;
                    const pct = attr?.progress ?? 0;
                    const ptsInto = attr?.pointsIntoLevel ?? 0;
                    const ptsNeeded = attr?.pointsRequiredForNextLevel ?? 14;
                    const isSelected = selectedAttributeName === attrName;
                    const attrMeta = CANONICAL_ATTRIBUTE_METADATA[attrName as CanonicalAttributeName];

                    return (
                      <button
                        key={attrName}
                        type="button"
                        onClick={() => onSelectAttribute(isSelected ? null : attrName)}
                        className={`w-full text-left p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-[var(--accent-surface)] border-[var(--accent-bright)] shadow-[0_0_10px_var(--glow-color)] ring-1 ring-[var(--border-accent)]'
                            : 'bg-[#0b0d13] border-white/5 hover:border-white/20 hover:bg-[#131622]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs shrink-0">{attrMeta?.icon || '⚡'}</span>
                          <span className="text-[11px] font-mono font-bold text-white truncate">
                            {attrName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Mini Progress Bar */}
                          <div className="w-12 bg-black/60 h-1.5 rounded-full overflow-hidden border border-white/5 hidden sm:block">
                            <div 
                              className="h-full rounded-full" 
                              style={{ width: `${pct}%`, backgroundColor: accent }} 
                            />
                          </div>

                          <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
                            {ptsInto}/{ptsNeeded}
                          </span>

                          <span className="text-[11px] font-mono font-extrabold text-[var(--accent-highlight)] tabular-nums w-10 text-right">
                            Lv.{totalVal}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODE 2: TABBED REALM (FOCUS ON 1 REALM AT A TIME) */}
      {layoutMode === 'TABBED_REALM' && (
        <div className="space-y-3">
          {/* Domain Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {CORE_DOMAINS.map(domain => {
              const isActive = activeTabDomain === domain;
              const domainInfo = coreDomains[domain];
              const meta = CORE_DOMAIN_METADATA[domain];
              const accent = domain === 'Mind' ? '#38bdf8' : (domain === 'Body' ? '#f87171' : '#e5c875');

              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setActiveTabDomain(domain)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#181c2b] border-[#c5a059] shadow-[0_0_12px_rgba(197,160,89,0.25)] ring-1 ring-[#c5a059]/40'
                      : 'bg-[#07080c]/80 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <span>{meta.icon}</span>
                      <span>{domain}</span>
                    </span>
                    <span className="text-xs font-mono font-extrabold" style={{ color: accent }}>
                      Lv.{domainInfo?.level ?? 1}
                    </span>
                  </div>
                  <div className="w-full bg-[#050608] h-1 rounded-full overflow-hidden mt-2 border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${domainInfo?.progress ?? 0}%`, backgroundColor: accent }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* 6 Ordered Pillars for Active Tab Domain */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DOMAIN_ATTRIBUTES[activeTabDomain].map(attrName => {
              const attr = attrMap.get(canonicalizeAttributeName(attrName));
              const totalVal = attr?.total ?? attr?.level ?? 10;
              const pct = attr?.progress ?? 0;
              const ptsInto = attr?.pointsIntoLevel ?? 0;
              const ptsNeeded = attr?.pointsRequiredForNextLevel ?? 14;
              const isSelected = selectedAttributeName === attrName;
              const attrMeta = CANONICAL_ATTRIBUTE_METADATA[attrName as CanonicalAttributeName];
              const accent = activeTabDomain === 'Mind' ? '#38bdf8' : (activeTabDomain === 'Body' ? '#f87171' : '#e5c875');

              return (
                <button
                  key={attrName}
                  type="button"
                  onClick={() => onSelectAttribute(isSelected ? null : attrName)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[var(--accent-surface)] border-[var(--accent-bright)] shadow-[0_0_12px_var(--glow-color)] ring-1 ring-[var(--border-accent)]'
                      : 'bg-[#07080c] border-white/10 hover:border-white/20 hover:bg-[#111420]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm shrink-0">{attrMeta?.icon || '⚡'}</span>
                      <span className="text-xs font-mono font-bold text-white truncate">
                        {attrName}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-[var(--accent-highlight)]">
                      Lv.{totalVal}
                    </span>
                  </div>

                  <div className="w-full bg-[#050608] h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: accent }}
                    />
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                    <span>{pct}% to Lv.{totalVal + 1}</span>
                    <span className="text-zinc-500">{ptsInto}/{ptsNeeded} XP</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
