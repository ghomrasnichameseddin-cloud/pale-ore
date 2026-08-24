import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { 
  Compass, Target, Briefcase, FolderOpen, Layers, 
  Search, Sparkles, ArrowRight, CheckCircle, Clock, Award,
  Filter, FileText, ChevronRight, BookOpen, Swords, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';
import { GoalsView } from './GoalsView';
import { ProjectsView } from './ProjectsView';
import { PlanningView } from './PlanningView';
import { FrameworksView } from './FrameworksView';

export type StrategySubTab = 'overview' | 'goals' | 'projects' | 'planning' | 'frameworks';

interface StrategyCodexViewProps {
  initialSubTab?: StrategySubTab;
  onNavigate?: (tab: string) => void;
}

export const StrategyCodexView: React.FC<StrategyCodexViewProps> = ({ 
  initialSubTab = 'overview', 
  onNavigate 
}) => {
  const { state, getGoalProgress, getProjectProgress } = usePOS();
  const [subTab, setSubTab] = useState<StrategySubTab>(initialSubTab);
  const [globalSearch, setGlobalSearch] = useState('');

  // Calculate high-level strategic health metrics
  const totalGoals = state.goals.length;
  const completedGoals = state.goals.filter(g => getGoalProgress(g.id) >= 100).length;
  const totalProjects = state.projects.length;
  const completedProjects = state.projects.filter(p => getProjectProgress(p.id) >= 100).length;
  const totalDocs = state.planningDocuments.length;

  // Filtered lists for cross-search in Synthesis Overview
  const filteredGoals = state.goals.filter(g => 
    !globalSearch.trim() || 
    g.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
    g.description?.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredProjects = state.projects.filter(p => 
    !globalSearch.trim() || 
    p.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
    p.description?.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredDocs = state.planningDocuments.filter(d => 
    !globalSearch.trim() || 
    d.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
    d.path.toLowerCase().includes(globalSearch.toLowerCase()) ||
    d.content.toLowerCase().includes(globalSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" id="strategy-codex-unified-root">
      
      {/* UNIFIED HEADER WITH SUB-NAV BAR */}
      <div className="border-b border-[#c5a059]/20 pb-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2.5">
              <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
              <span>STRATEGIC CODEX & CAMPAIGNS</span>
            </h2>
            <p className="text-xs text-zinc-300 font-mono mt-1">
              SANCTUM_STRATEGY • Unified doctrine, long-term destinies, operational campaigns & strategic models
            </p>
          </div>

          {/* QUICK HIGH-LEVEL SUMMARY BADGES */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#0b0d13] border border-[#c5a059]/30 text-[#e5c875] flex items-center gap-1.5 whitespace-nowrap">
              <Target className="h-3 w-3 text-[#c5a059]" />
              {completedGoals}/{totalGoals} DESTINIES
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#0b0d13] border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 whitespace-nowrap">
              <Briefcase className="h-3 w-3 text-cyan-400" />
              {completedProjects}/{totalProjects} CAMPAIGNS
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#0b0d13] border border-purple-500/30 text-purple-300 flex items-center gap-1.5 whitespace-nowrap">
              <FolderOpen className="h-3 w-3 text-purple-400" />
              {totalDocs} CODEX DOCS
            </span>
          </div>
        </div>

        {/* ENHANCED SUB-NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 border-t border-white/5 scrollbar-thin">
          {[
            { id: 'overview' as const, label: 'Strategic Matrix & Synthesis', icon: Layers, count: null },
            { id: 'goals' as const, label: 'Grand Destinies', icon: Target, count: totalGoals },
            { id: 'projects' as const, label: 'Campaigns & Milestones', icon: Briefcase, count: totalProjects },
            { id: 'planning' as const, label: 'Codex & SOPs', icon: FolderOpen, count: totalDocs },
            { id: 'frameworks' as const, label: 'Strategic Decision Models', icon: Compass, count: '5 Models' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap border cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#c5a059]/25 via-[#141824] to-[#0b0d13] text-[#fef08a] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                    : 'bg-[#0b0d13]/80 hover:bg-[#141824] text-zinc-400 hover:text-zinc-200 border-white/5 hover:border-[#c5a059]/30'
                }`}
                id={`strategy-subtab-${tab.id}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#e5c875]' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-VIEW RENDERING */}
      <div>
        {subTab === 'overview' && (
          <div className="space-y-6" id="strategy-synthesis-overview">
            
            {/* EXECUTIVE STRATEGIC SYNTHESIS BANNER */}
            <div className="glass-panel rounded-2xl p-6 border border-[#c5a059]/30 bg-gradient-to-r from-[#0e121d] via-[#07080c] to-[#121624] relative overflow-hidden shadow-xl space-y-6">
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-bold flex items-center gap-1">
                      <RubElHizbIcon className="h-3 w-3" /> STRATEGIC CASCADE ALIGNMENT
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono border font-bold uppercase bg-[#3a2e12] text-[#fef08a] border-[#c5a059]/50">
                      SYNERGY ACTIVE
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white tracking-wider">
                    VISION ➔ DOCTRINE ➔ DESTINY ➔ CAMPAIGN ➔ DIRECTIVES
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans max-w-3xl">
                    Every daily trial executes an operational campaign, fulfilling a strategic destiny, anchored in immutable doctrine and guided by mental models.
                  </p>
                </div>

                {/* GLOBAL SEARCH IN STRATEGY ARCHIVES */}
                <div className="w-full md:w-72">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#c5a059]" />
                    <input
                      type="text"
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                      placeholder="Search destinies, campaigns, SOPs..."
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>
              </div>

              {/* 4 STRATEGIC PILLARS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#c5a059]/15">
                
                {/* 1. Grand Destinies Pillar */}
                <div 
                  onClick={() => setSubTab('goals')}
                  className="p-4 bg-[#07080c]/80 hover:bg-[#141824] border border-[#c5a059]/20 hover:border-[#c5a059]/50 rounded-xl cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-[#3a2e12]/60 text-[#fef08a] border border-[#c5a059]/30">
                      <Target className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-mono text-[#c5a059] group-hover:text-[#fef08a] flex items-center gap-1 font-bold">
                      MANAGE <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-bold text-white">Grand Destinies</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">30-Day, Quarterly & Lifetime Horizons</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Total Enacted:</span>
                    <span className="text-[#fef08a] font-bold">{totalGoals}</span>
                  </div>
                </div>

                {/* 2. Operational Campaigns Pillar */}
                <div 
                  onClick={() => setSubTab('projects')}
                  className="p-4 bg-[#07080c]/80 hover:bg-[#141824] border border-[#c5a059]/20 hover:border-[#c5a059]/50 rounded-xl cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 group-hover:text-cyan-200 flex items-center gap-1 font-bold">
                      MANAGE <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-bold text-white">Campaigns & Milestones</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Time-budgeted execution blocks</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Active Blocks:</span>
                    <span className="text-cyan-300 font-bold">{totalProjects}</span>
                  </div>
                </div>

                {/* 3. Codex & SOPs Pillar */}
                <div 
                  onClick={() => setSubTab('planning')}
                  className="p-4 bg-[#07080c]/80 hover:bg-[#141824] border border-[#c5a059]/20 hover:border-[#c5a059]/50 rounded-xl cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-500/30">
                      <FolderOpen className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-mono text-purple-400 group-hover:text-purple-200 flex items-center gap-1 font-bold">
                      EXPLORE <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-bold text-white">Codex & SOP Doctrine</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Vision, master plans & protocols</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Inscribed Docs:</span>
                    <span className="text-purple-300 font-bold">{totalDocs}</span>
                  </div>
                </div>

                {/* 4. Strategic Models Pillar */}
                <div 
                  onClick={() => setSubTab('frameworks')}
                  className="p-4 bg-[#07080c]/80 hover:bg-[#141824] border border-[#c5a059]/20 hover:border-[#c5a059]/50 rounded-xl cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      <Compass className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 group-hover:text-emerald-200 flex items-center gap-1 font-bold">
                      EXECUTE <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-bold text-white">Decision Frameworks</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Eisenhower, SWOT, SMART, Pareto, OODA</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Tactical Engines:</span>
                    <span className="text-emerald-300 font-bold">5 Available</span>
                  </div>
                </div>

              </div>
            </div>

            {/* CROSS-LINKED CASCADE PREVIEW & SEARCH RESULTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Active Destinies & Attached Campaigns */}
              <div className="glass-panel rounded-xl p-5 border border-[#c5a059]/30 bg-[#0b0d13]/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#c5a059]" />
                    ACTIVE DESTINY HIERARCHY
                  </h3>
                  <button 
                    onClick={() => setSubTab('goals')}
                    className="text-[10px] font-mono text-[#e5c875] hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredGoals.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-xs font-mono">
                      No grand destinies found.
                    </div>
                  ) : (
                    filteredGoals.slice(0, 6).map(goal => {
                      const progress = getGoalProgress(goal.id);
                      const relatedProjects = state.projects.filter(p => p.goalId === goal.id);

                      return (
                        <div key={goal.id} className="p-3.5 bg-[#07080c] border border-[#c5a059]/15 rounded-xl space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[9px] font-mono text-[#c5a059] font-bold uppercase">{goal.horizon || 'Quarterly'}</span>
                              <h4 className="text-xs font-display font-bold text-white mt-0.5">{goal.name}</h4>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#fef08a] shrink-0">{progress}%</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-[#141824] rounded-full h-1.5 overflow-hidden">
                            <div className="rpg-progress-gold h-full rounded-full" style={{ width: `${progress}%` }} />
                          </div>

                          {/* Linked Campaigns list preview */}
                          {relatedProjects.length > 0 && (
                            <div className="pt-1.5 border-t border-white/5 space-y-1">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase">LINKED CAMPAIGNS:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {relatedProjects.map(proj => (
                                  <span key={proj.id} className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                                    <Briefcase className="h-2.5 w-2.5" />
                                    {proj.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Codex Documents & SOP Protocols */}
              <div className="glass-panel rounded-xl p-5 border border-[#c5a059]/30 bg-[#0b0d13]/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-purple-400" />
                    FOUNDATIONAL CODEX & DOCTRINE
                  </h3>
                  <button 
                    onClick={() => setSubTab('planning')}
                    className="text-[10px] font-mono text-[#e5c875] hover:underline flex items-center gap-1"
                  >
                    Open Codex <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredDocs.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-xs font-mono">
                      No documents found.
                    </div>
                  ) : (
                    filteredDocs.slice(0, 8).map(doc => (
                      <div 
                        key={doc.id}
                        onClick={() => setSubTab('planning')}
                        className="p-3 bg-[#07080c] hover:bg-[#141824] border border-white/5 hover:border-purple-500/30 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="h-4 w-4 text-purple-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-mono font-medium text-zinc-200 block truncate">{doc.name}</span>
                            <span className="text-[9px] font-mono text-zinc-500 block truncate">{doc.path}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 1. GRAND DESTINIES (GOALS) */}
        {subTab === 'goals' && (
          <GoalsView />
        )}

        {/* 2. CAMPAIGNS (PROJECTS) */}
        {subTab === 'projects' && (
          <ProjectsView />
        )}

        {/* 3. CODEX & SOPS (PLANNING) */}
        {subTab === 'planning' && (
          <PlanningView onNavigate={onNavigate as any} />
        )}

        {/* 4. STRATEGIC DECISION FRAMEWORKS */}
        {subTab === 'frameworks' && (
          <FrameworksView />
        )}
      </div>

    </div>
  );
};
