import React, { useState, useMemo, useEffect } from 'react';
import { usePOS } from '../POSContext';
import { 
  Compass, Target, Briefcase, FolderOpen, Layers, 
  Search, Sparkles, ArrowRight, CheckCircle, Clock, Award,
  Filter, FileText, ChevronRight, BookOpen, Swords, Zap,
  AlertTriangle, ShieldAlert, CheckSquare, GitBranch, GitCommit,
  FlaskConical, Lightbulb, RefreshCw, ChevronDown, ChevronUp,
  Sliders, Activity, Brain, Bookmark
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
  const [selectedHorizon, setSelectedHorizon] = useState<string>('All');
  const [expandedDestinyId, setExpandedDestinyId] = useState<string | null>(null);
  const [activeLoopStep, setActiveLoopStep] = useState<number>(0);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleTabChange = (newTab: StrategySubTab) => {
    setSubTab(newTab);
    if (onNavigate) {
      onNavigate(newTab === 'overview' ? 'strategy_codex' : newTab);
    }
  };

  // Calculate high-level strategic health metrics
  const totalGoals = state.goals.length;
  const completedGoals = state.goals.filter(g => getGoalProgress(g.id) >= 100).length;
  const totalProjects = state.projects.length;
  const completedProjects = state.projects.filter(p => getProjectProgress(p.id) >= 100).length;
  const totalDocs = state.planningDocuments.length;

  // Filtered lists for cross-search in Synthesis Overview
  const filteredGoals = state.goals.filter(g => {
    const matchesSearch = !globalSearch.trim() || 
      g.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      g.description?.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesHorizon = selectedHorizon === 'All' || g.horizon === selectedHorizon;
    return matchesSearch && matchesHorizon;
  });

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

  // Strategic Bottlenecks calculation
  const strategicBottlenecks = useMemo(() => {
    const bottlenecks: Array<{
      id: string;
      type: 'BLOCKED_CAMPAIGN' | 'AT_RISK_CAMPAIGN' | 'STALLED_DESTINY' | 'ORPHAN_QUESTS' | 'EMPTY_CAMPAIGN';
      title: string;
      description: string;
      severity: 'high' | 'medium' | 'low';
      actionLabel: string;
      actionTargetTab: StrategySubTab;
    }> = [];

    // 1. Blocked or At Risk Campaigns
    state.projects.forEach(p => {
      if (p.campaignHealth === 'Blocked') {
        bottlenecks.push({
          id: `proj-blocked-${p.id}`,
          type: 'BLOCKED_CAMPAIGN',
          title: `Campaign Blocked: "${p.name}"`,
          description: `Identified risks: ${p.risks && p.risks.length > 0 ? p.risks.join(', ') : 'Roadblock detected in critical path'}. Needs Root Cause & OODA analysis.`,
          severity: 'high',
          actionLabel: 'Analyze Block',
          actionTargetTab: 'frameworks'
        });
      } else if (p.campaignHealth === 'At Risk') {
        bottlenecks.push({
          id: `proj-atrisk-${p.id}`,
          type: 'AT_RISK_CAMPAIGN',
          title: `Campaign At-Risk: "${p.name}"`,
          description: `Timeline or time budget pressure detected. Re-calibrate deliverable milestones.`,
          severity: 'medium',
          actionLabel: 'Review Campaign',
          actionTargetTab: 'projects'
        });
      }
    });

    // 2. Destinies with 0 campaigns attached
    state.goals.forEach(g => {
      const attachedCampaigns = state.projects.filter(p => p.goalId === g.id);
      if (attachedCampaigns.length === 0 && g.status === 'Active') {
        bottlenecks.push({
          id: `destiny-empty-${g.id}`,
          type: 'STALLED_DESTINY',
          title: `Unanchored Destiny: "${g.name}"`,
          description: `Grand destiny has 0 operational campaigns executing it. Convert destiny into actionable campaigns.`,
          severity: 'high',
          actionLabel: 'Add Campaign',
          actionTargetTab: 'projects'
        });
      }
    });

    // 3. Campaigns with 0 quests
    state.projects.forEach(p => {
      const attachedQuests = state.quests.filter(q => q.projectId === p.id && !q.completed);
      if (attachedQuests.length === 0 && p.status !== 'Completed') {
        bottlenecks.push({
          id: `camp-empty-${p.id}`,
          type: 'EMPTY_CAMPAIGN',
          title: `Empty Campaign Queue: "${p.name}"`,
          description: `No active daily directives linked to this campaign. Seed quests from milestones.`,
          severity: 'low',
          actionLabel: 'Seed Directives',
          actionTargetTab: 'projects'
        });
      }
    });

    return bottlenecks;
  }, [state.projects, state.goals, state.quests]);

  // Strategic Loop Steps
  const strategicLoopSteps = [
    { step: 1, name: 'Goal / Destiny', desc: 'Define ultimate desired outcome & deadline in 30-Day/Quarterly horizons.', icon: Target, ctaTab: 'goals' as StrategySubTab },
    { step: 2, name: 'Analyze & Heuristics', desc: 'Stress-test constraints, first principles & Pareto 80/20 leverage.', icon: Compass, ctaTab: 'frameworks' as StrategySubTab },
    { step: 3, name: 'Root Cause (5 Whys)', desc: 'Isolate root friction & failure vectors before building complex plans.', icon: GitCommit, ctaTab: 'frameworks' as StrategySubTab },
    { step: 4, name: 'Solutions & SCAMPER', desc: 'Lateral thinking, SCAMPER transforms & brainstorming sandbox.', icon: Lightbulb, ctaTab: 'frameworks' as StrategySubTab },
    { step: 5, name: 'Master Strategy & PR/FAQ', desc: 'Amazon Working Backwards PR/FAQ + 10-folder Codex master plans.', icon: FileText, ctaTab: 'planning' as StrategySubTab },
    { step: 6, name: 'Execute Campaigns', desc: 'Convert strategy into milestones, deliverables, and daily quests.', icon: Briefcase, ctaTab: 'projects' as StrategySubTab },
    { step: 7, name: 'Measure & Benchmark', desc: 'Track time budgets, XP yields, and campaign health (Healthy/At Risk).', icon: Activity, ctaTab: 'projects' as StrategySubTab },
    { step: 8, name: 'Learn & Experiment', desc: 'Log trial & error hypotheses, metrics, and failure learnings.', icon: FlaskConical, ctaTab: 'frameworks' as StrategySubTab },
    { step: 9, name: 'Adapt & Codify SOP', desc: 'Promote winning experiments into immutable 05 SOPs & repeat cycle.', icon: Bookmark, ctaTab: 'planning' as StrategySubTab },
  ];

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
            { id: 'planning' as const, label: '10-Folder Codex Vault', icon: FolderOpen, count: totalDocs },
            { id: 'frameworks' as const, label: 'Strategic Thinking Lab', icon: Compass, count: '11 Engines' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">11 Interactive Tactical Engines</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Tactical Engines:</span>
                    <span className="text-emerald-300 font-bold">11 Engines Active</span>
                  </div>
                </div>

              </div>
            </div>

            {/* STRATEGIC BOTTLENECKS & ANOMALY DIAGNOSTICS */}
            {strategicBottlenecks.length > 0 && (
              <div className="glass-panel border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-[#0b0d13] to-rose-950/10 p-5 rounded-2xl space-y-3 relative overflow-hidden shadow-lg">
                <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#f43f5e" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
                    <h3 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-widest">
                      STRATEGIC BOTTLENECKS & FRICTION DETECTED ({strategicBottlenecks.length})
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                    REAL-TIME AUDIT
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {strategicBottlenecks.map(b => (
                    <div key={b.id} className="p-3 bg-[#07080c] border border-rose-500/20 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                          b.severity === 'high' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}>
                          {b.severity.toUpperCase()} RISK
                        </span>
                        <button
                          onClick={() => handleTabChange(b.actionTargetTab)}
                          className="text-[9px] font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {b.actionLabel} <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-display font-bold text-white line-clamp-1">{b.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono line-clamp-2 leading-relaxed">{b.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9-STEP STRATEGIC EXECUTION LOOP INTERACTIVE BAR */}
            <div className="glass-panel border-[#c5a059]/30 bg-[#0b0d13]/90 p-5 rounded-2xl space-y-4 relative overflow-hidden shadow-xl">
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-[#c5a059]" />
                    <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                      THE STRATEGIC EXECUTION LOOP
                    </h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Think ➔ Plan ➔ Execute ➔ Measure ➔ Learn ➔ Adapt • Click any phase to inspect or jump to its tactical module.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange(strategicLoopSteps[activeLoopStep].ctaTab)}
                  className="px-3 py-1.5 rounded-lg bg-[#3a2e12] hover:bg-[#4d3d18] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold transition flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
                >
                  <span>Launch Phase {activeLoopStep + 1} Module</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Steps Scrollable Rail */}
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 pt-2">
                {strategicLoopSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isSelected = activeLoopStep === idx;
                  return (
                    <button
                      key={step.step}
                      onClick={() => setActiveLoopStep(idx)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[76px] ${
                        isSelected
                          ? 'bg-[#1a170e] border-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.25)] text-[#fef08a]'
                          : 'bg-[#07080c] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[8px] font-mono opacity-60 font-bold">0{step.step}</span>
                        <Icon className={`h-3 w-3 ${isSelected ? 'text-[#e5c875]' : 'text-zinc-500'}`} />
                      </div>
                      <span className="text-[10px] font-mono font-bold truncate block mt-1">{step.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Details Banner */}
              <div className="p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-start gap-2.5">
                  <span className="p-1.5 rounded-lg bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/30 shrink-0">
                    <RubElHizbIcon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <span className="text-[#c5a059] font-bold uppercase text-[10px] block">
                      PHASE 0{strategicLoopSteps[activeLoopStep].step}: {strategicLoopSteps[activeLoopStep].name}
                    </span>
                    <p className="text-zinc-300 text-[11px] mt-0.5">{strategicLoopSteps[activeLoopStep].desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTabChange(strategicLoopSteps[activeLoopStep].ctaTab)}
                  className="text-cyan-400 hover:text-cyan-200 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  OPEN {strategicLoopSteps[activeLoopStep].ctaTab.toUpperCase()} TAB <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* INTERACTIVE STRATEGIC CASCADE TREE & CODEX DOCTRINE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Active Destinies & Attached Campaigns with Interactive Tree */}
              <div className="glass-panel rounded-2xl p-5 border border-[#c5a059]/30 bg-[#0b0d13]/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#c5a059]" />
                    <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                      STRATEGIC CASCADE HIERARCHY
                    </h3>
                  </div>

                  {/* Horizon filter */}
                  <div className="flex items-center gap-1">
                    {['All', '30-Day', 'Quarterly', 'Annual', 'Lifetime'].map(h => (
                      <button
                        key={h}
                        onClick={() => setSelectedHorizon(h)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded transition ${
                          selectedHorizon === h ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {filteredGoals.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                      No destinies matched the selected horizon or search query.
                    </div>
                  ) : (
                    filteredGoals.map(goal => {
                      const progress = getGoalProgress(goal.id);
                      const relatedProjects = state.projects.filter(p => p.goalId === goal.id);
                      const isExpanded = expandedDestinyId === goal.id;

                      return (
                        <div key={goal.id} className="p-3.5 bg-[#07080c] border border-[#c5a059]/15 rounded-xl space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-[#c5a059] font-bold uppercase px-1.5 py-0.2 rounded bg-[#3a2e12]/60 border border-[#c5a059]/30">
                                  {goal.horizon || 'Quarterly'}
                                </span>
                                {goal.deadline && (
                                  <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" /> {goal.deadline}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-display font-bold text-white mt-1">{goal.name}</h4>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-mono font-bold text-[#fef08a]">{progress}%</span>
                              <button
                                onClick={() => setExpandedDestinyId(isExpanded ? null : goal.id)}
                                className="p-1 rounded bg-[#141824] hover:bg-[#1f2438] text-zinc-400 hover:text-white transition"
                              >
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-[#141824] rounded-full h-1.5 overflow-hidden">
                            <div className="rpg-progress-gold h-full rounded-full" style={{ width: `${progress}%` }} />
                          </div>

                          {/* Linked Campaigns list preview */}
                          {relatedProjects.length > 0 ? (
                            <div className="pt-1.5 border-t border-white/5 space-y-1.5">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                                <GitBranch className="h-2.5 w-2.5 text-cyan-400" />
                                LINKED CAMPAIGNS ({relatedProjects.length}):
                              </span>
                              <div className="space-y-1.5">
                                {relatedProjects.map(proj => {
                                  const projProgress = getProjectProgress(proj.id);
                                  const projQuests = state.quests.filter(q => q.projectId === proj.id);
                                  const completedQuests = projQuests.filter(q => q.completed).length;

                                  return (
                                    <div key={proj.id} className="p-2 rounded-lg bg-[#0b0d13] border border-cyan-500/15 flex flex-col gap-1 text-[10px] font-mono">
                                      <div className="flex items-center justify-between">
                                        <span className="text-cyan-300 font-bold flex items-center gap-1">
                                          <Briefcase className="h-3 w-3 text-cyan-400" />
                                          {proj.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          {proj.campaignHealth && (
                                            <span className={`text-[8px] px-1 rounded uppercase font-bold ${
                                              proj.campaignHealth === 'Healthy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                                              proj.campaignHealth === 'At Risk' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                                              proj.campaignHealth === 'Blocked' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                                              'bg-blue-950 text-blue-300 border border-blue-500/30'
                                            }`}>
                                              {proj.campaignHealth}
                                            </span>
                                          )}
                                          <span className="text-[#e5c875] font-bold">{projProgress}%</span>
                                        </div>
                                      </div>

                                      {/* Expanded details */}
                                      {isExpanded && (
                                        <div className="pl-4 pt-1 border-t border-white/5 space-y-1 text-[9px] text-zinc-400">
                                          <div className="flex items-center justify-between">
                                            <span>Quests Completed: {completedQuests}/{projQuests.length}</span>
                                            {proj.timeBudgetHours && <span>Budget: {proj.timeBudgetHours}h</span>}
                                          </div>
                                          {proj.deliverables && proj.deliverables.length > 0 && (
                                            <div className="text-zinc-500">
                                              Deliverables: {proj.deliverables.join(' • ')}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] font-mono text-zinc-600 italic pt-1">
                              No campaigns attached. Create a campaign linked to this destiny.
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Codex Documents & SOP Protocols */}
              <div className="glass-panel rounded-2xl p-5 border border-[#c5a059]/30 bg-[#0b0d13]/90 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
                    <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-purple-400" />
                      10-FOLDER CODEX KNOWLEDGE VAULT
                    </h3>
                    <button 
                      onClick={() => setSubTab('planning')}
                      className="text-[10px] font-mono text-[#e5c875] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Open Codex Explorer <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {filteredDocs.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 text-xs font-mono">
                        No documents found matching search.
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

                {/* Friday Weekly Muḥāsabah Strategy Bridge */}
                <div className="p-3.5 bg-gradient-to-r from-[#17140e] via-[#0b0d13] to-[#121624] border border-[#c5a059]/30 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-lg bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40">
                      <RubElHizbIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-white font-bold text-xs uppercase">Friday Weekly Muḥāsabah Review</h4>
                      <p className="text-[10px] text-zinc-400">Weekly audit of Destinies, Campaigns, Sacred Score & SOP revisions.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSubTab('planning')}
                    className="px-3 py-1.5 rounded-lg bg-[#07080c] hover:bg-[#141824] border border-[#c5a059]/40 text-[#fef08a] text-[10px] font-bold shrink-0 transition flex items-center gap-1 cursor-pointer"
                  >
                    Open SOPs <ChevronRight className="h-3 w-3" />
                  </button>
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
