import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { DisciplinesView } from './skills/DisciplinesView';
import { AttributesView } from './skills/AttributesView';
import { IntelligenceView } from './skills/IntelligenceView';
import { StrategicCapabilityGap } from '../utils/capabilityIntelligence';
import { 
  Award, Shield, Target, Sparkles, BarChart2, Plus
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';

export type SkillsTabType = 'DISCIPLINES' | 'ATTRIBUTES' | 'INTELLIGENCE';

export const SkillsView: React.FC = () => {
  const { state, getAttributes, getCoreDomains, getSkillXpAndLevel } = usePOS();

  // Default to DISCIPLINES so users land directly on their real skills
  const [activeTab, setActiveTab] = useState<SkillsTabType>('DISCIPLINES');
  const [selectedAttributeName, setSelectedAttributeName] = useState<string>('Discipline');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(state.skills[0]?.id || null);
  const [activeGapModal, setActiveGapModal] = useState<StrategicCapabilityGap | null>(null);

  const handleNavigateTab = (tab: 'OVERVIEW' | 'ATTRIBUTES' | 'DISCIPLINES' | 'INTELLIGENCE') => {
    if (tab === 'OVERVIEW') {
      setActiveTab('INTELLIGENCE');
    } else {
      setActiveTab(tab);
    }
  };

  const attributes = getAttributes();
  const coreDomains = getCoreDomains();
  const activeSkills = state.skills.filter(s => !s.archived);

  // Total XP across all skills
  const totalSkillXp = state.skills.reduce((acc, s) => acc + (s.xp || getSkillXpAndLevel(s.id).xp), 0);

  // Average constitutional attribute level
  const avgAttributeLevel = attributes.length > 0 
    ? (attributes.reduce((sum, a) => sum + a.level, 0) / attributes.length).toFixed(1)
    : '1.0';

  return (
    <div className="space-y-6 pb-12" id="pale-ore-skills-root">
      
      {/* 1. TOP HEADER & METRICS SUMMARY */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0b0d13] border border-[#c5a059]/25 rounded-2xl p-5 relative overflow-hidden shadow-lg">
        <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider font-bold flex items-center gap-1">
              <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
              UNIFIED PROGRESSION SYSTEM
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a]">
              DOMAINS → ATTRIBUTES → SKILLS
            </span>
          </div>

          <h1 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-2">
            Core Domains, Attributes & Skills
          </h1>

          <p className="text-xs font-sans text-zinc-400 max-w-2xl leading-relaxed">
            Cultivate real-world craft mastery across Primary &amp; Secondary skills that feed the 9 canonical attributes across your Mind, Body, and Soul.
          </p>
        </div>

        {/* SUMMARY METRICS BADGES */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-[#07080c] border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="text-sm font-mono font-bold text-[#fef08a] block">{activeSkills.length}</span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Active Skills</span>
          </div>
          <div className="bg-[#07080c] border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="text-sm font-mono font-bold text-white block">Lv. {avgAttributeLevel}</span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Avg Attribute</span>
          </div>
          <div className="bg-[#07080c] border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="text-sm font-mono font-bold text-cyan-300 block">{totalSkillXp.toLocaleString()}</span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Total Skill XP</span>
          </div>
        </div>
      </div>

      {/* 2. THE THREE CORE DOMAINS (MIND, BODY, SOUL) CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="core-domains-banner">
        {(['Mind', 'Body', 'Soul'] as const).map(domainName => {
          const domain = coreDomains[domainName];
          const isMind = domainName === 'Mind';
          const isBody = domainName === 'Body';
          const isSoul = domainName === 'Soul';
          const accentColor = isMind ? '#38bdf8' : (isBody ? '#f87171' : '#e5c875');
          const borderClass = isMind ? 'border-sky-500/30' : (isBody ? 'border-rose-500/30' : 'border-amber-500/30');

          return (
            <div 
              key={domainName}
              onClick={() => {
                const firstAttr = domain.attributes[0]?.name || (isMind ? 'Focus' : isBody ? 'Strength' : 'Faith');
                setSelectedAttributeName(firstAttr);
                setActiveTab('ATTRIBUTES');
              }}
              className={`bg-[#0b0d13] border ${borderClass} hover:border-[#c5a059] rounded-xl p-4 transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-md hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{domain.icon}</span>
                  <div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <span>{domainName}</span>
                      <span className="text-[9px] font-mono text-zinc-500 font-normal">DOMAIN</span>
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Derived Mean: <strong className="text-white">Lv. {domain.level}</strong>
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border bg-black/40" style={{ color: accentColor, borderColor: `${accentColor}40` }}>
                  {domain.progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#050608] h-1.5 rounded-full overflow-hidden border border-white/5 mb-3">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${domain.progress}%`, backgroundColor: accentColor }}
                />
              </div>

              {/* Underlying Attributes Pills */}
              <div className="space-y-1">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">
                  3 Canonical Attributes:
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {domain.attributes.map(attr => (
                    <div 
                      key={attr.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAttributeName(attr.name);
                        setActiveTab('ATTRIBUTES');
                      }}
                      className="bg-black/40 border border-white/5 hover:border-white/20 px-1.5 py-1 rounded text-center transition"
                    >
                      <span className="text-[10px] font-mono font-bold text-zinc-200 block truncate">
                        {attr.name}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-zinc-400">
                        Lv.{attr.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. STREAMLINED TAB NAVIGATION */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1" id="skills-tab-nav">
        {[
          { 
            id: 'DISCIPLINES', 
            label: 'Skills & Crafts', 
            icon: Award, 
            badge: `${activeSkills.length}`,
            desc: 'Tracks, levels & practice' 
          },
          { 
            id: 'ATTRIBUTES', 
            label: '9 Core Attributes', 
            icon: Shield, 
            badge: '9 Pillars',
            desc: 'Constitutional character' 
          },
          { 
            id: 'INTELLIGENCE', 
            label: 'Mastery Radar & Insights', 
            icon: BarChart2, 
            desc: 'Radars, gaps & reviews' 
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SkillsTabType)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                isActive
                  ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] shadow-[0_0_16px_rgba(197,160,89,0.2)]'
                  : 'bg-[#07080c] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#c5a059]' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-[#c5a059]/30 text-[#fef08a]' : 'bg-white/5 text-zinc-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE TAB VIEW CONTENT */}
      <div>
        {activeTab === 'DISCIPLINES' && (
          <DisciplinesView
            selectedSkillId={selectedSkillId}
            onSelectSkill={setSelectedSkillId}
            onSelectAttribute={(name) => {
              setSelectedAttributeName(name);
              setActiveTab('ATTRIBUTES');
            }}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'ATTRIBUTES' && (
          <AttributesView
            selectedAttributeName={selectedAttributeName}
            onSelectAttribute={setSelectedAttributeName}
            onSelectSkill={(id) => {
              setSelectedSkillId(id);
              setActiveTab('DISCIPLINES');
            }}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'INTELLIGENCE' && (
          <IntelligenceView
            onSelectSkill={(id) => {
              setSelectedSkillId(id);
              setActiveTab('DISCIPLINES');
            }}
            onSelectAttribute={(name) => {
              setSelectedAttributeName(name);
              setActiveTab('ATTRIBUTES');
            }}
            onNavigateTab={handleNavigateTab}
            activeGapModal={activeGapModal}
            onCloseGapModal={() => setActiveGapModal(null)}
            onOpenGapModal={setActiveGapModal}
          />
        )}
      </div>

    </div>
  );
};

export default SkillsView;
