import React, { useState, useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { Project, Quest, Goal } from '../../types';
import { 
  Briefcase, Zap, AlertTriangle, ShieldAlert, CheckCircle, Clock, 
  ArrowRight, Flame, Plus, Check, X, Target, Play, TrendingUp,
  Activity, Layers, Filter, Compass, AlertOctagon, HelpCircle
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';
import { getLocalDateString, getDaysDifference } from '../../utils/dateUtils';

interface SprintWarRoomViewProps {
  onNavigateToCampaign?: (campaignId: string) => void;
  onNavigateToDirectives?: () => void;
}

export const SprintWarRoomView: React.FC<SprintWarRoomViewProps> = ({
  onNavigateToCampaign,
  onNavigateToDirectives
}) => {
  const { 
    state, 
    getGoalProgress, 
    getProjectProgress, 
    addQuest, 
    updateQuest,
    updateProject 
  } = usePOS();

  // Quick forge directive state
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskDifficulty, setQuickTaskDifficulty] = useState<'Easy' | 'Normal' | 'Hard' | 'Boss'>('Normal');
  const [quickTaskEstimatedTime, setQuickTaskEstimatedTime] = useState(30);

  // Corrective action drawer on bottleneck
  const [activeFixBottleneckId, setActiveFixBottleneckId] = useState<string | null>(null);
  const [correctiveDirectiveTitle, setCorrectiveDirectiveTitle] = useState('');

  // Calculate Current Quarter & Days Remaining based on systemDate
  const sprintCalendar = useMemo(() => {
    const sysDateStr = state.systemDate || getLocalDateString();
    const [yearStr, monthStr] = sysDateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    let quarterName = 'Q1';
    let quarterEndMonth = 3;
    let quarterEndDay = 31;

    if (month >= 1 && month <= 3) {
      quarterName = 'Q1';
      quarterEndMonth = 3;
      quarterEndDay = 31;
    } else if (month >= 4 && month <= 6) {
      quarterName = 'Q2';
      quarterEndMonth = 6;
      quarterEndDay = 30;
    } else if (month >= 7 && month <= 9) {
      quarterName = 'Q3';
      quarterEndMonth = 9;
      quarterEndDay = 30;
    } else {
      quarterName = 'Q4';
      quarterEndMonth = 12;
      quarterEndDay = 31;
    }

    const quarterEndDateStr = `${year}-${String(quarterEndMonth).padStart(2, '0')}-${String(quarterEndDay).padStart(2, '0')}`;
    const daysRemaining = Math.max(0, getDaysDifference(sysDateStr, quarterEndDateStr));
    const totalDaysInQuarter = 90;
    const daysElapsed = Math.max(0, Math.min(totalDaysInQuarter, totalDaysInQuarter - daysRemaining));
    const quarterPercentElapsed = Math.round((daysElapsed / totalDaysInQuarter) * 100);

    return {
      quarterName: `${quarterName} ${year}`,
      daysRemaining,
      daysElapsed,
      quarterPercentElapsed
    };
  }, [state.systemDate]);

  // Quarterly active campaigns
  const activeCampaigns = useMemo(() => {
    return state.projects.filter(p => p.status === 'Active' || p.status === 'Planned');
  }, [state.projects]);

  // Active sprint directives
  const activeDirectives = useMemo(() => {
    return state.quests.filter(q => q.status === 'Active');
  }, [state.quests]);

  // Completed sprint directives
  const completedDirectives = useMemo(() => {
    return state.quests.filter(q => q.status === 'Completed');
  }, [state.quests]);

  // Sprint Velocity & Health calculations
  const sprintVelocity = useMemo(() => {
    const totalCampaigns = activeCampaigns.length;
    if (totalCampaigns === 0) return { avgProgress: 0, healthyCount: 0, atRiskCount: 0, blockedCount: 0 };

    let sumProgress = 0;
    let healthyCount = 0;
    let atRiskCount = 0;
    let blockedCount = 0;

    activeCampaigns.forEach(p => {
      sumProgress += getProjectProgress(p.id);
      if (p.campaignHealth === 'Blocked') blockedCount++;
      else if (p.campaignHealth === 'At Risk') atRiskCount++;
      else healthyCount++;
    });

    return {
      avgProgress: Math.round(sumProgress / totalCampaigns),
      healthyCount,
      atRiskCount,
      blockedCount
    };
  }, [activeCampaigns, getProjectProgress]);

  // Real-time Bottleneck Scanner
  const bottlenecks = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'BLOCKED' | 'AT_RISK' | 'UNANCHORED' | 'EMPTY_QUEUE';
      title: string;
      description: string;
      severity: 'high' | 'medium' | 'low';
      targetId: string;
      targetType: 'project' | 'goal';
    }> = [];

    // 1. Blocked campaigns
    state.projects.forEach(p => {
      if (p.campaignHealth === 'Blocked') {
        list.push({
          id: `b-block-${p.id}`,
          type: 'BLOCKED',
          title: `Campaign Blocked: "${p.name}"`,
          description: p.risks && p.risks.length > 0 ? p.risks.join(', ') : 'Critical operational friction detected. Needs immediate unblocking.',
          severity: 'high',
          targetId: p.id,
          targetType: 'project'
        });
      } else if (p.campaignHealth === 'At Risk') {
        list.push({
          id: `b-risk-${p.id}`,
          type: 'AT_RISK',
          title: `Timeline Warning: "${p.name}"`,
          description: 'Campaign velocity is lagging behind quarterly sprint timeline expectations.',
          severity: 'medium',
          targetId: p.id,
          targetType: 'project'
        });
      }
    });

    // 2. Destinies without campaigns
    state.goals.forEach(g => {
      if (g.status === 'Active') {
        const attached = state.projects.filter(p => p.goalId === g.id);
        if (attached.length === 0) {
          list.push({
            id: `b-unanchored-${g.id}`,
            type: 'UNANCHORED',
            title: `Unanchored Destiny: "${g.name}"`,
            description: 'Grand Destiny has zero operational campaigns executing it this quarter.',
            severity: 'high',
            targetId: g.id,
            targetType: 'goal'
          });
        }
      }
    });

    // 3. Campaigns with 0 active quests
    state.projects.forEach(p => {
      if (p.status === 'Active') {
        const attachedQuests = state.quests.filter(q => q.projectId === p.id && q.status === 'Active');
        if (attachedQuests.length === 0) {
          list.push({
            id: `b-empty-${p.id}`,
            type: 'EMPTY_QUEUE',
            title: `Empty Directive Queue: "${p.name}"`,
            description: 'No active tactical directives in motion for this campaign.',
            severity: 'low',
            targetId: p.id,
            targetType: 'project'
          });
        }
      }
    });

    return list;
  }, [state.projects, state.goals, state.quests]);

  // Handle Quick Forge Quest
  const handleForgeDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    const project = state.projects.find(p => p.id === selectedCampaignId);

    addQuest({
      name: quickTaskTitle.trim(),
      description: project ? `Direct operational action for ${project.name}` : 'Strategic sprint directive',
      difficulty: quickTaskDifficulty,
      estimatedTime: quickTaskEstimatedTime,
      xp: quickTaskDifficulty === 'Boss' ? 300 : quickTaskDifficulty === 'Hard' ? 200 : 100,
      projectId: project ? project.id : null,
      goalId: project?.goalId || null,
      milestoneId: null,
      relatedSkills: [],
      type: 'Main',
      recurrence: 'None',
      deadline: null
    });

    setQuickTaskTitle('');
  };

  // Handle Bottleneck Corrective Action
  const handleFixBottleneck = (b: typeof bottlenecks[0]) => {
    if (!correctiveDirectiveTitle.trim()) return;

    if (b.targetType === 'project') {
      const project = state.projects.find(p => p.id === b.targetId);
      addQuest({
        name: correctiveDirectiveTitle.trim(),
        description: `Unblocking action for campaign: ${project?.name || ''}`,
        difficulty: 'Hard',
        estimatedTime: 45,
        xp: 150,
        projectId: b.targetId,
        goalId: project?.goalId || null,
        milestoneId: null,
        relatedSkills: [],
        type: 'Main',
        recurrence: 'None',
        deadline: null
      });

      // If it was blocked, mark it under active diagnosis
      if (project && project.campaignHealth === 'Blocked') {
        updateProject(project.id, { campaignHealth: 'At Risk' });
      }
    } else {
      // It's a goal
      addQuest({
        name: correctiveDirectiveTitle.trim(),
        description: `Initial campaign scoping directive for destiny.`,
        difficulty: 'Normal',
        estimatedTime: 30,
        xp: 100,
        projectId: null,
        goalId: b.targetId,
        milestoneId: null,
        relatedSkills: [],
        type: 'Main',
        recurrence: 'None',
        deadline: null
      });
    }

    setCorrectiveDirectiveTitle('');
    setActiveFixBottleneckId(null);
  };

  // Direct toggle quest completion
  const handleToggleQuestComplete = (quest: Quest) => {
    const isCompleted = quest.status === 'Completed';
    updateQuest(quest.id, {
      status: isCompleted ? 'Active' : 'Completed',
      completedAt: isCompleted ? null : new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. ACTIVE 90-DAY SPRINT COMMAND BANNER */}
      <div className="bg-[#080b14]/95 border border-[#c5a059]/40 rounded-xl p-5 relative overflow-hidden shadow-2xl">
        <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Quarter Indicator & Mission */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold uppercase">
                ACTIVE 90-DAY SPRINT // {sprintCalendar.quarterName}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {sprintCalendar.daysRemaining} DAYS REMAINING
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider leading-snug">
              OPERATIONAL WAR-ROOM &amp; SPRINT COCKPIT
            </h3>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Real-time tactical execution command: track quarterly milestone velocity, break active bottlenecks, and forge high-leverage weekly directives.
            </p>
          </div>

          {/* Sprint Velocity KPIs */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-3">
            <div className="bg-[#05070d] border border-white/10 rounded-lg p-3 text-center space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Sprint Velocity</span>
              <span className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
                {sprintVelocity.avgProgress}%
              </span>
              <div className="w-full bg-[#080b14] rounded-full h-1 overflow-hidden border border-white/5">
                <div className="h-full bg-emerald-500" style={{ width: `${sprintVelocity.avgProgress}%` }} />
              </div>
            </div>

            <div className="bg-[#05070d] border border-white/10 rounded-lg p-3 text-center space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Active Campaigns</span>
              <span className="text-xl font-mono font-bold text-purple-400 tabular-nums">
                {activeCampaigns.length}
              </span>
              <span className="text-[9px] font-mono text-zinc-500 block">
                {sprintVelocity.healthyCount} Healthy · {sprintVelocity.atRiskCount + sprintVelocity.blockedCount} At-Risk
              </span>
            </div>

            <div className="bg-[#05070d] border border-white/10 rounded-lg p-3 text-center space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Directives Done</span>
              <span className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
                {completedDirectives.length}/{state.quests.length}
              </span>
              <span className="text-[9px] font-mono text-zinc-500 block">
                {activeDirectives.length} in flight
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN COCKPIT SPLIT: WEEKLY BATTLE-PLAN & BOTTLENECK RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT 2 COLS: WEEKLY STRATEGIC BATTLE-PLAN */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-[#080b14]/90 border border-white/10 rounded-xl p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  WEEKLY CAMPAIGN BATTLE-PLAN ({activeCampaigns.length} CAMPAIGNS)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                PRIORITIZED BY IMPACT
              </span>
            </div>

            {/* High-Leverage Campaigns List */}
            <div className="space-y-3">
              {activeCampaigns.slice(0, 5).map(campaign => {
                const prog = getProjectProgress(campaign.id);
                const quests = state.quests.filter(q => q.projectId === campaign.id);
                const activeQ = quests.filter(q => q.status === 'Active');
                const compQ = quests.filter(q => q.status === 'Completed');
                const isBlocked = campaign.campaignHealth === 'Blocked';
                const isAtRisk = campaign.campaignHealth === 'At Risk';

                return (
                  <div 
                    key={campaign.id}
                    className={`bg-[#05070d] border rounded-xl p-3.5 space-y-2.5 transition shadow-md ${
                      isBlocked ? 'border-rose-500/40' : isAtRisk ? 'border-amber-500/30' : 'border-white/10 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-display text-xs font-bold text-white uppercase truncate">
                            {campaign.name}
                          </h5>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                            isBlocked 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                              : isAtRisk 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {campaign.campaignHealth || 'Healthy'}
                          </span>
                        </div>
                        {campaign.description && (
                          <p className="text-[11px] text-zinc-400 font-sans mt-0.5 line-clamp-1">
                            {campaign.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className="text-xs font-bold text-purple-400 tabular-nums">{prog}%</span>
                        <div className="text-[9px] text-zinc-500">
                          {compQ.length}/{quests.length} TASKS
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#080b14] rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isBlocked ? 'bg-rose-500' : isAtRisk ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-500 to-indigo-400'
                        }`} 
                        style={{ width: `${prog}%` }} 
                      />
                    </div>

                    {/* Active Directives under Campaign */}
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>ACTIVE CAMPAIGN DIRECTIVES ({activeQ.length})</span>
                        {onNavigateToCampaign && (
                          <button
                            onClick={() => onNavigateToCampaign(campaign.id)}
                            className="text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Campaign</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>

                      {activeQ.length > 0 ? (
                        <div className="space-y-1">
                          {activeQ.slice(0, 3).map(quest => (
                            <div 
                              key={quest.id}
                              onClick={() => handleToggleQuestComplete(quest)}
                              className="p-1.5 bg-[#080b14] hover:bg-white/5 rounded border border-white/5 flex items-center justify-between text-xs cursor-pointer transition group/q"
                            >
                              <div className="flex items-center gap-2 truncate max-w-[320px]">
                                <div className="h-3.5 w-3.5 rounded border border-zinc-500 group-hover/q:border-emerald-400 flex items-center justify-center shrink-0" />
                                <span className="font-sans text-[11px] text-zinc-200 group-hover/q:text-white truncate">
                                  {quest.name}
                                </span>
                              </div>
                              <span className="text-[9px] font-mono text-amber-400 font-bold shrink-0">
                                +{quest.xp} XP
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-amber-950/20 border border-amber-500/20 text-[10px] font-mono text-amber-300/80 flex items-center justify-between">
                          <span>No active directives queued for this campaign.</span>
                          <button
                            onClick={() => setSelectedCampaignId(campaign.id)}
                            className="text-amber-300 font-bold hover:underline cursor-pointer"
                          >
                            + Forge Directive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DIRECTIVE QUICK-FORGE FORM */}
          <div className="bg-[#080b14]/90 border border-[#c5a059]/30 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono text-[#e5c875] font-bold uppercase flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#c5a059]" /> DIRECTIVE QUICK-FORGE (INSTANT ACTION QUEUE)
              </span>
              <span className="text-[10px] font-mono text-zinc-400 font-bold">TODAY'S MATRIX SYNC</span>
            </div>

            <form onSubmit={handleForgeDirective} className="space-y-3 font-sans text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="md:col-span-2">
                  <input 
                    type="text"
                    required
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    placeholder="Enter immediate tactical task name (e.g. Write PRD for authentication)..."
                    className="w-full bg-[#05070d] border border-white/10 rounded-lg p-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full bg-[#05070d] border border-white/10 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="">Select Anchor Campaign...</option>
                    {activeCampaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                    <span>DIFFICULTY:</span>
                    {(['Easy', 'Normal', 'Hard', 'Boss'] as const).map(diff => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setQuickTaskDifficulty(diff)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          quickTaskDifficulty === diff 
                            ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] font-bold' 
                            : 'bg-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                    <span>EST TIME:</span>
                    {[15, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setQuickTaskEstimatedTime(mins)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          quickTaskEstimatedTime === mins 
                            ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] font-bold' 
                            : 'bg-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#d4b068] text-black font-mono font-bold rounded-lg text-xs flex items-center gap-1 shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>FORGE DIRECTIVE</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT 1 COL: BOTTLENECK BREAKER RADAR */}
        <div className="space-y-4">
          
          <div className="bg-[#080b14]/90 border border-rose-500/30 rounded-xl p-4 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
              <span className="text-xs font-mono text-rose-300 font-bold uppercase flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4 text-rose-400" />
                BOTTLENECK BREAKER RADAR
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                {bottlenecks.length} ISSUES
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              Automated friction diagnostic identifying stalled campaigns, at-risk deadlines, and unanchored destinies.
            </p>

            {/* Bottlenecks List */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {bottlenecks.length > 0 ? (
                bottlenecks.map(b => (
                  <div 
                    key={b.id}
                    className={`bg-[#05070d] border rounded-lg p-3 space-y-2 transition shadow-md ${
                      b.severity === 'high' 
                        ? 'border-rose-500/40 bg-rose-950/10' 
                        : b.severity === 'medium' 
                        ? 'border-amber-500/30 bg-amber-950/10' 
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className={`text-[9px] font-mono font-bold uppercase ${
                          b.severity === 'high' ? 'text-rose-400' : b.severity === 'medium' ? 'text-amber-400' : 'text-zinc-400'
                        }`}>
                          [{b.type}]
                        </span>
                        <h6 className="font-display text-xs font-bold text-white uppercase leading-tight">
                          {b.title}
                        </h6>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      {b.description}
                    </p>

                    {/* Action to break bottleneck */}
                    {activeFixBottleneckId === b.id ? (
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <span className="text-[10px] font-mono text-emerald-300 font-bold block">
                          FORGE UNBLOCKING DIRECTIVE:
                        </span>
                        <input 
                          type="text"
                          value={correctiveDirectiveTitle}
                          onChange={(e) => setCorrectiveDirectiveTitle(e.target.value)}
                          placeholder="Action to break this block..."
                          className="w-full bg-[#080b14] border border-emerald-500/40 rounded p-1.5 text-xs text-white placeholder-zinc-500 font-sans focus:outline-none"
                        />
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleFixBottleneck(b)}
                            className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-mono font-bold cursor-pointer"
                          >
                            INSCRIBE UNBLOCKER
                          </button>
                          <button
                            onClick={() => setActiveFixBottleneckId(null)}
                            className="px-2 py-1 bg-white/5 text-zinc-400 hover:text-white rounded text-[10px] font-mono cursor-pointer"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveFixBottleneckId(b.id);
                          setCorrectiveDirectiveTitle(`Unblock: ${b.title}`);
                        }}
                        className="w-full py-1 px-2 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Zap className="h-3 w-3" />
                        <span>BREAK BOTTLENECK</span>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-zinc-500 font-mono text-xs border border-dashed border-white/10 rounded-lg space-y-1">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                  <p className="text-zinc-300 font-semibold">Zero Critical Bottlenecks</p>
                  <p className="text-[10px]">All campaigns have active directives and healthy trajectories.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
