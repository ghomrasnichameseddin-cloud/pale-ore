import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { OverviewView } from './skills/OverviewView';
import { AttributesView } from './skills/AttributesView';
import { DisciplinesView } from './skills/DisciplinesView';
import { IntelligenceView } from './skills/IntelligenceView';
import { StrategicCapabilityGap } from '../utils/capabilityIntelligence';
import { 
  Sparkles, Compass, Shield, Award, Target, 
  GitMerge, BookOpen, Layers, BarChart2, Zap
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';

export type SkillsTabType = 'OVERVIEW' | 'ATTRIBUTES' | 'DISCIPLINES' | 'INTELLIGENCE';

export const SkillsView: React.FC = () => {
  const { state, getAttributes, getSkillXpAndLevel } = usePOS();

  const [activeTab, setActiveTab] = useState<SkillsTabType>('OVERVIEW');
  const [selectedAttributeName, setSelectedAttributeName] = useState<string>('Discipline');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(state.skills[0]?.id || null);
  const [activeGapModal, setActiveGapModal] = useState<StrategicCapabilityGap | null>(null);

  const attributes = getAttributes();
  const activeSkills = state.skills.filter(s => !s.archived);
  const primarySkills = activeSkills.filter(s => (s.tier || 'Primary') === 'Primary');
  const secondarySkills = activeSkills.filter(s => s.tier === 'Secondary');

  // Total XP across all skills
  const totalSkillXp = state.skills.reduce((acc, s) => acc + getSkillXpAndLevel(s.id).xp, 0);

  return (
    <div className="space-y-6 pb-12" id="pale-ore-capability-intelligence-root">
      
      {/* 1. TOP STATS RIBBON & TITLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0b0d13] border border-[#c5a059]/25 rounded-2xl p-5 relative overflow-hidden">
        <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider font-bold flex items-center gap-1">
              <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
              PALE_ORE_OS // CAPABILITY_LAYER
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a]">
              DUAL_ARCHITECTURE
            </span>
          </div>

          <h1 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-2">
            Capability Intelligence Engine
          </h1>

          <p className="text-xs font-sans text-zinc-400 max-w-2xl leading-relaxed">
            Connecting human constitutional attributes (internal character) with specialized domain disciplines (operational craft) and strategic campaign requirements.
          </p>
        </div>

        {/* SUMMARY METRICS PILLS */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-[#07080c] border border-white/5 px-3 py-1.5 rounded-xl text-center">
            <span className="text-xs font-mono font-bold text-white block">9</span>
            <span className="text-[8px] font-mono text-zinc-500 uppercase">Sovereign Attrs</span>
          </div>
          <div className="bg-[#07080c] border border-white/5 px-3 py-1.5 rounded-xl text-center">
            <span className="text-xs font-mono font-bold text-[#fef08a] block">{primarySkills.length}</span>
            <span className="text-[8px] font-mono text-zinc-500 uppercase">Primary Crafts</span>
          </div>
          <div className="bg-[#07080c] border border-white/5 px-3 py-1.5 rounded-xl text-center">
            <span className="text-xs font-mono font-bold text-purple-300 block">{secondarySkills.length}</span>
            <span className="text-[8px] font-mono text-zinc-500 uppercase">Specializations</span>
          </div>
          <div className="bg-[#07080c] border border-white/5 px-3 py-1.5 rounded-xl text-center">
            <span className="text-xs font-mono font-bold text-cyan-300 block">{totalSkillXp.toLocaleString()}</span>
            <span className="text-[8px] font-mono text-zinc-500 uppercase">Craft XP</span>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTROLS (4 CORE PILLARS) */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1" id="capability-tab-nav">
        {[
          { id: 'OVERVIEW', label: 'OVERVIEW', icon: Sparkles, desc: 'Constitution & Gaps' },
          { id: 'ATTRIBUTES', label: 'ATTRIBUTES', icon: Shield, desc: 'Human Constitution (9)' },
          { id: 'DISCIPLINES', label: 'DISCIPLINES', icon: Award, desc: 'Craft Tree & Specializations' },
          { id: 'INTELLIGENCE', label: 'INTELLIGENCE', icon: Target, desc: 'Gap Engine & Hygiene' },
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
              <span className={`text-[9px] font-normal hidden sm:inline ${isActive ? 'text-[#e5c875]/80' : 'text-zinc-600'}`}>
                ({tab.desc})
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE TAB VIEW CONTAINER */}
      <div>
        {activeTab === 'OVERVIEW' && (
          <OverviewView
            onNavigateTab={setActiveTab}
            onSelectAttribute={(name) => {
              setSelectedAttributeName(name);
              setActiveTab('ATTRIBUTES');
            }}
            onSelectSkill={(id) => {
              setSelectedSkillId(id);
              setActiveTab('DISCIPLINES');
            }}
            onOpenGapModal={(gap) => {
              setActiveGapModal(gap);
              setActiveTab('INTELLIGENCE');
            }}
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
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'DISCIPLINES' && (
          <DisciplinesView
            selectedSkillId={selectedSkillId}
            onSelectSkill={setSelectedSkillId}
            onSelectAttribute={(name) => {
              setSelectedAttributeName(name);
              setActiveTab('ATTRIBUTES');
            }}
            onNavigateTab={setActiveTab}
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
            onNavigateTab={setActiveTab}
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
