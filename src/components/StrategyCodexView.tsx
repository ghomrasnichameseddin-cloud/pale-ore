import React, { useState, useMemo } from 'react';
import { usePOS } from '../POSContext';
import { 
  Compass, Target, Briefcase, FolderOpen, Layers, 
  Search, Sparkles, ArrowRight, CheckCircle, Clock, Award,
  Filter, FileText, ChevronRight, BookOpen, Swords, Zap,
  AlertTriangle, ShieldAlert, CheckSquare, GitBranch, GitCommit,
  FlaskConical, Lightbulb, RefreshCw, ChevronDown, ChevronUp,
  Sliders, Activity, Brain, Bookmark, ShieldCheck, Scale,
  Plus, Edit3, Trash2, Check, Lock, Unlock, Eye, HelpCircle
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';
import { HierarchicalRoadmapView } from './strategy/HierarchicalRoadmapView';
import { SprintWarRoomView } from './strategy/SprintWarRoomView';
import { CapacityAllocationRadar } from './strategy/CapacityAllocationRadar';
import { InteractiveCodexVault } from './strategy/InteractiveCodexVault';
import { StrategyNoviceGuideModal } from './strategy/StrategyNoviceGuideModal';
import { StrategicMaturityScoreCard } from './strategy/StrategicMaturityScoreCard';

export type StrategySubTab = 'roadmap' | 'cockpit' | 'capacity' | 'codex';

interface StrategyCodexViewProps {
  initialSubTab?: StrategySubTab;
  onNavigate?: (tab: string) => void;
  onOpenGuide?: (section?: string) => void;
}

export const StrategyCodexView: React.FC<StrategyCodexViewProps> = ({ 
  initialSubTab = 'roadmap',
  onNavigate,
  onOpenGuide
}) => {
  const { state, getGoalProgress, getProjectProgress } = usePOS();

  // Active Sub-Tab: Roadmap | Cockpit | Capacity | Codex
  const [activeSubTab, setActiveSubTab] = useState<StrategySubTab>(initialSubTab);

  // Global search across Strategy Hub
  const [globalSearch, setGlobalSearch] = useState('');

  // Guide modal state
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleNavigate = (targetTab: string) => {
    if (onNavigate) {
      onNavigate(targetTab);
    }
  };

  // High-level Strategic KPIs
  const totalGoals = state.goals.length;
  const activeGoals = state.goals.filter(g => g.status === 'Active').length;
  const completedGoals = state.goals.filter(g => getGoalProgress(g.id) >= 100).length;
  const totalProjects = state.projects.length;
  const activeProjects = state.projects.filter(p => p.status === 'Active').length;
  const totalDocs = state.planningDocuments.length;

  // Bottlenecks count
  const blockedCampaigns = state.projects.filter(p => p.campaignHealth === 'Blocked').length;
  const atRiskCampaigns = state.projects.filter(p => p.campaignHealth === 'At Risk').length;

  return (
    <div className="space-y-6">
      
      {/* TOP HEADER: STRATEGIC MATRIX HUB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#080b14]/95 p-5 rounded-2xl border border-[#c5a059]/40 relative overflow-hidden shadow-2xl">
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
        
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#101422] border border-[#c5a059]/50 rounded-xl text-[#e5c875] shadow-[0_0_20px_rgba(197,160,89,0.3)]">
            <RubElHizbIcon className="h-6 w-6 text-[#c5a059]" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              STRATEGIC MATRIX HUB // LIFE OPERATING SYSTEM
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold">
                ROADMAP &amp; SPRINT WAR-ROOM
              </span>
            </h2>
            <p className="text-xs font-mono text-[#c5a059]/80 mt-0.5">
              Multi-horizon Life Roadmap, 90-Day Sprint War-Room, Strategic Capacity Allocation &amp; Interactive Codex
            </p>
          </div>
        </div>

        {/* Global Hub Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-[#c5a059]/60 absolute left-2.5 top-2.5" />
            <input 
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search all horizons &amp; campaigns..."
              className="bg-[#05070d] border border-[#c5a059]/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059] font-mono w-44 sm:w-60"
            />
          </div>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-3 py-1.5 bg-[#05070d] hover:bg-white/5 border border-[#c5a059]/30 text-[#e5c875] text-xs font-mono rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>STRATEGY MANUAL</span>
          </button>
        </div>
      </div>

      {/* STRATEGIC PLANNING & EXECUTION MATURITY SCORE (1-10) */}
      <StrategicMaturityScoreCard onSwitchTab={(tab) => setActiveSubTab(tab)} />

      {/* STRATEGIC KPI BANNER (Zero-Pill Rule, Strict Tabular Numerals) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#080b14]/90 border border-white/10 rounded-xl p-3.5 space-y-1 shadow-md">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">Grand Destinies</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-[#fef08a] tabular-nums">{totalGoals}</span>
            <span className="text-[10px] font-mono text-zinc-400">({activeGoals} Active · {completedGoals} Reached)</span>
          </div>
        </div>

        <div className="bg-[#080b14]/90 border border-white/10 rounded-xl p-3.5 space-y-1 shadow-md">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">Operational Campaigns</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-purple-400 tabular-nums">{totalProjects}</span>
            <span className="text-[10px] font-mono text-zinc-400">({activeProjects} Executing)</span>
          </div>
        </div>

        <div className="bg-[#080b14]/90 border border-white/10 rounded-xl p-3.5 space-y-1 shadow-md">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">Campaign Friction</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-mono font-bold tabular-nums ${blockedCampaigns > 0 ? 'text-rose-400' : atRiskCampaigns > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {blockedCampaigns + atRiskCampaigns}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              ({blockedCampaigns} Blocked · {atRiskCampaigns} At-Risk)
            </span>
          </div>
        </div>

        <div className="bg-[#080b14]/90 border border-white/10 rounded-xl p-3.5 space-y-1 shadow-md">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">Planning Manuscripts</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-teal-300 tabular-nums">{totalDocs}</span>
            <span className="text-[10px] font-mono text-zinc-400">Codex Scrolls Active</span>
          </div>
        </div>
      </div>

      {/* 4 CORE SUB-TABS: LIFE ROADMAP | SPRINT COCKPIT | CAPACITY RADAR | PLANNING CODEX */}
      <div className="flex items-center gap-1 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: 'roadmap', label: '1. LIFE ROADMAP', icon: Compass, desc: 'Multi-horizon cascade (Vision to Sprints)' },
          { id: 'cockpit', label: '2. SPRINT WAR-ROOM', icon: Zap, desc: '90-Day Sprint battle-plan & bottlenecks' },
          { id: 'capacity', label: '3. CAPACITY RADAR', icon: Activity, desc: '168h Allocation & Domain Focus' },
          { id: 'codex', label: '4. PLANNING CODEX', icon: BookOpen, desc: 'Interactive templates (PR/FAQ, SOPs)' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as StrategySubTab)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.25)]' 
                  : 'bg-[#080b14] hover:bg-[#101424] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#e5c875]' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <div>
        {activeSubTab === 'roadmap' && (
          <HierarchicalRoadmapView 
            searchQuery={globalSearch}
            onNavigateToCampaign={(id) => handleNavigate('projects')}
            onNavigateToDirectives={() => handleNavigate('quests')}
          />
        )}

        {activeSubTab === 'cockpit' && (
          <SprintWarRoomView 
            onNavigateToCampaign={(id) => handleNavigate('projects')}
            onNavigateToDirectives={() => handleNavigate('quests')}
          />
        )}

        {activeSubTab === 'capacity' && (
          <CapacityAllocationRadar />
        )}

        {activeSubTab === 'codex' && (
          <InteractiveCodexVault 
            onNavigateToGoal={(id) => handleNavigate('goals')}
            onNavigateToCampaign={(id) => handleNavigate('projects')}
          />
        )}
      </div>

      {/* STRATEGY NOVICE GUIDE MODAL */}
      <StrategyNoviceGuideModal 
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

    </div>
  );
};
