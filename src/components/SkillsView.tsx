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
  const { state, getAttributes, getSkillXpAndLevel } = usePOS();

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
  const activeSkills = state.skills.filter(s => !s.archived);

  // Total XP across all skills
  const totalSkillXp = state.skills.reduce((acc, s) => acc + getSkillXpAndLevel(s.id).xp, 0);

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
              SANCTUM MASTERY
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a]">
              PROGRESSION
            </span>
          </div>

          <h1 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-2">
            Skills & Competencies
          </h1>

          <p className="text-xs font-sans text-zinc-400 max-w-2xl leading-relaxed">
            Cultivate real-world craft mastery and strengthen the 9 constitutional character attributes that anchor your operational capability.
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
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Avg Constitution</span>
          </div>
          <div className="bg-[#07080c] border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="text-sm font-mono font-bold text-cyan-300 block">{totalSkillXp.toLocaleString()}</span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Total Craft XP</span>
          </div>
        </div>
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
