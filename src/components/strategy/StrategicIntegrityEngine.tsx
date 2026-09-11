import React, { useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { StrategicIntegrityIssueType, Goal, Project } from '../../types';
import { 
  AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2, 
  RefreshCw, GitBranch, Target, Briefcase, FileText, Clock,
  Zap, Wrench, AlertCircle
} from 'lucide-react';
import { ArabesqueCorner } from '../IslamicRpgDecorations';
import { parseDateSafe, getDaysDifference, getLocalDateString } from '../../utils/dateUtils';

export interface IntegrityIssue {
  id: string;
  type: StrategicIntegrityIssueType;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  title: string;
  description: string;
  entityId: string;
  entityName: string;
  actionLabel: string;
  actionType: 'ADD_CAMPAIGN' | 'ADD_DIRECTIVE' | 'LINK_DESTINY' | 'RESOLVE_BLOCK' | 'LINK_CODEX' | 'INSPECT';
  targetTab?: string;
}

interface StrategicIntegrityEngineProps {
  onResolveIssue?: (issue: IntegrityIssue) => void;
  onNavigate?: (tab: string) => void;
}

export const StrategicIntegrityEngine: React.FC<StrategicIntegrityEngineProps> = ({
  onResolveIssue,
  onNavigate
}) => {
  const { state, updateProject, updateGoal } = usePOS();

  const integrityIssues = useMemo(() => {
    const issues: IntegrityIssue[] = [];
    const nowStr = state.systemDate || getLocalDateString();

    // 1. UNANCHORED_DESTINY: Active destiny has 0 campaigns
    state.goals.forEach(goal => {
      if (goal.status === 'Active') {
        const attachedCampaigns = state.projects.filter(p => p.goalId === goal.id);
        if (attachedCampaigns.length === 0) {
          issues.push({
            id: `issue-unanchored-${goal.id}`,
            type: 'UNANCHORED_DESTINY',
            severity: 'HIGH',
            title: `Unanchored Destiny: "${goal.name}"`,
            description: 'This active grand destiny has zero operational campaigns executing it. Vision without campaign architecture produces zero forward velocity.',
            entityId: goal.id,
            entityName: goal.name,
            actionLabel: 'Attach Campaign',
            actionType: 'ADD_CAMPAIGN',
            targetTab: 'campaigns'
          });
        }
      }
    });

    // 2. ORPHAN_CAMPAIGN: Campaign without a valid parent destiny
    state.projects.forEach(project => {
      if (project.status !== 'Archived') {
        const parentGoal = state.goals.find(g => g.id === project.goalId);
        if (!parentGoal) {
          issues.push({
            id: `issue-orphan-${project.id}`,
            type: 'ORPHAN_CAMPAIGN',
            severity: 'HIGH',
            title: `Orphan Campaign: "${project.name}"`,
            description: 'This campaign is unlinked from any Grand Destiny. Unaligned operations scatter cognitive capital and dilute strategic focus.',
            entityId: project.id,
            entityName: project.name,
            actionLabel: 'Link to Destiny',
            actionType: 'LINK_DESTINY',
            targetTab: 'campaigns'
          });
        }
      }
    });

    // 3. EMPTY_CAMPAIGN: Active campaign with 0 active directives/quests
    state.projects.forEach(project => {
      if (project.status === 'Active') {
        const activeQuests = state.quests.filter(q => q.projectId === project.id && q.status !== 'Completed');
        if (activeQuests.length === 0) {
          issues.push({
            id: `issue-empty-${project.id}`,
            type: 'EMPTY_CAMPAIGN',
            severity: 'MODERATE',
            title: `Empty Campaign Queue: "${project.name}"`,
            description: 'No active directives in queue. Without clear daily quests, momentum decays into operational dormancy.',
            entityId: project.id,
            entityName: project.name,
            actionLabel: 'Seed Directives',
            actionType: 'ADD_DIRECTIVE',
            targetTab: 'quests'
          });
        }
      }
    });

    // 4. BROKEN_DEPENDENCY: Campaign depends on blocked or paused campaign
    state.projects.forEach(project => {
      if (project.status === 'Active') {
        // Structured dependencies list
        if (project.dependenciesList && project.dependenciesList.length > 0) {
          project.dependenciesList.forEach(dep => {
            if (dep.type === 'Depends On') {
              const target = state.projects.find(p => p.id === dep.targetCampaignId);
              if (target && (target.campaignHealth === 'Blocked' || target.status === 'Paused')) {
                issues.push({
                  id: `issue-dep-${project.id}-${target.id}`,
                  type: 'BROKEN_DEPENDENCY',
                  severity: 'CRITICAL',
                  title: `Critical Dependency Block: "${project.name}"`,
                  description: `Depends on "${target.name}", which is currently ${target.campaignHealth === 'Blocked' ? 'BLOCKED' : 'PAUSED'}. Upstream blockage will stall execution.`,
                  entityId: project.id,
                  entityName: project.name,
                  actionLabel: 'Resolve Block',
                  actionType: 'RESOLVE_BLOCK',
                  targetTab: 'campaigns'
                });
              }
            }
          });
        }

        // String dependencies fallback
        if (project.dependencies && project.dependencies.length > 0) {
          project.dependencies.forEach(depId => {
            const target = state.projects.find(p => p.id === depId);
            if (target && (target.campaignHealth === 'Blocked' || target.status === 'Paused')) {
              issues.push({
                id: `issue-dep-legacy-${project.id}-${target.id}`,
                type: 'BROKEN_DEPENDENCY',
                severity: 'CRITICAL',
                title: `Upstream Roadblock: "${project.name}"`,
                description: `Blocked by upstream dependency "${target.name}". Unblock the parent campaign first.`,
                entityId: project.id,
                entityName: project.name,
                actionLabel: 'Unblock Upstream',
                actionType: 'RESOLVE_BLOCK',
                targetTab: 'campaigns'
              });
            }
          });
        }
      }
    });

    // 5. STALE_CAMPAIGN: Inactivity or 0 progress over multiple days
    state.projects.forEach(project => {
      if (project.status === 'Active') {
        const projectQuests = state.quests.filter(q => q.projectId === project.id);
        const completedQuests = projectQuests.filter(q => q.status === 'Completed');
        
        // If created more than 5 days ago and has 0 completions
        if (project.createdAt && completedQuests.length === 0 && projectQuests.length > 0) {
          const daysOld = getDaysDifference(project.createdAt, nowStr);
          if (daysOld >= 5) {
            issues.push({
              id: `issue-stale-${project.id}`,
              type: 'STALE_CAMPAIGN',
              severity: 'MODERATE',
              title: `Stale Execution: "${project.name}"`,
              description: `Campaign has been active for ${daysOld} days without a single completed directive. Risk of cognitive abandonment.`,
              entityId: project.id,
              entityName: project.name,
              actionLabel: 'Kickstart Quest',
              actionType: 'ADD_DIRECTIVE',
              targetTab: 'quests'
            });
          }
        }
      }
    });

    // 6. CODEX_GAP: Active Campaign or Destiny has no linked strategy doc or SOP
    state.projects.forEach(project => {
      if (project.status === 'Active') {
        const linkedDocs = state.planningDocuments.filter(doc => 
          (doc.linkedProjects && doc.linkedProjects.includes(project.id)) ||
          (project.linkedCodexDocs && project.linkedCodexDocs.includes(doc.id))
        );
        if (linkedDocs.length === 0) {
          issues.push({
            id: `issue-codex-${project.id}`,
            type: 'CODEX_GAP',
            severity: 'LOW',
            title: `Codex Knowledge Gap: "${project.name}"`,
            description: 'No tactical playbook, SOP, or strategy document linked to this active campaign. Codify operating procedures.',
            entityId: project.id,
            entityName: project.name,
            actionLabel: 'Link Codex SOP',
            actionType: 'LINK_CODEX',
            targetTab: 'codex_vault'
          });
        }
      }
    });

    // 7. DEADLINE_COLLISION: Multiple high-priority campaigns due within 3 days of each other
    const highPriActive = state.projects.filter(p => 
      p.status === 'Active' && 
      p.deadline && 
      (p.priority === 'High' || p.priority === undefined)
    );

    for (let i = 0; i < highPriActive.length; i++) {
      for (let j = i + 1; j < highPriActive.length; j++) {
        const p1 = highPriActive[i];
        const p2 = highPriActive[j];
        if (p1.deadline && p2.deadline) {
          const diff = Math.abs(getDaysDifference(p1.deadline, p2.deadline));
          if (diff <= 3) {
            issues.push({
              id: `issue-collision-${p1.id}-${p2.id}`,
              type: 'DEADLINE_COLLISION',
              severity: 'MODERATE',
              title: `Deadline Collision: "${p1.name}" & "${p2.name}"`,
              description: `Both high-leverage campaigns terminate within ${diff} days of each other (${p1.deadline} vs ${p2.deadline}). Risk of execution bottleneck.`,
              entityId: p1.id,
              entityName: `${p1.name} / ${p2.name}`,
              actionLabel: 'Stagger Schedule',
              actionType: 'INSPECT',
              targetTab: 'campaigns'
            });
          }
        }
      }
    }

    return issues;
  }, [state.goals, state.projects, state.quests, state.planningDocuments, state.systemDate]);

  const criticalCount = integrityIssues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = integrityIssues.filter(i => i.severity === 'HIGH').length;
  const moderateCount = integrityIssues.filter(i => i.severity === 'MODERATE').length;

  const handleAction = (issue: IntegrityIssue) => {
    if (onResolveIssue) {
      onResolveIssue(issue);
    } else if (onNavigate && issue.targetTab) {
      onNavigate(issue.targetTab);
    }
  };

  return (
    <div className="glass-panel border-[#c5a059]/30 bg-gradient-to-r from-[#0d0f17] via-[#07080c] to-[#120f14] p-5 rounded-2xl space-y-4 relative overflow-hidden shadow-2xl">
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className={`h-4 w-4 ${criticalCount > 0 ? 'text-rose-400 animate-pulse' : 'text-[#c5a059]'}`} />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>STRATEGIC INTEGRITY ENGINE</span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                integrityIssues.length === 0 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                  : criticalCount > 0
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40'
              }`}>
                {integrityIssues.length === 0 ? 'PRISTINE ALIGNMENT' : `${integrityIssues.length} ANOMALIES`}
              </span>
            </h3>
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Real-time automated diagnostic audit detecting structural friction, orphan campaigns & execution stalls.
          </p>
        </div>

        {/* Severity Summary Pills */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
              {criticalCount} CRITICAL
            </span>
          )}
          {highCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
              {highCount} HIGH
            </span>
          )}
          {moderateCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-yellow-950/60 text-yellow-300 border border-yellow-500/30">
              {moderateCount} MODERATE
            </span>
          )}
          {integrityIssues.length === 0 && (
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> ZERO FRICTION
            </span>
          )}
        </div>
      </div>

      {/* Issues Grid */}
      {integrityIssues.length === 0 ? (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3 text-xs font-mono text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold block">Strategic Cascade Integrity: 100% Nominal</span>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">
              All active Destinies are anchored by Campaigns, every Campaign has active Directives, dependencies are clear, and knowledge is inscribed.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {integrityIssues.slice(0, 6).map(issue => {
            const isCrit = issue.severity === 'CRITICAL';
            const isHigh = issue.severity === 'HIGH';

            return (
              <div 
                key={issue.id}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                  isCrit
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                    : isHigh
                    ? 'bg-amber-950/15 border-amber-500/30 hover:border-amber-400'
                    : 'bg-[#07080c] border-white/10 hover:border-[#c5a059]/40'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      isCrit 
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40' 
                        : isHigh 
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40' 
                        : 'bg-yellow-950/80 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {issue.severity} • {issue.type.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[100px]">
                      {issue.entityName}
                    </span>
                  </div>

                  <h4 className="text-xs font-display font-bold text-white line-clamp-1">
                    {issue.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase">
                    ACTIONABLE REMEDY
                  </span>
                  <button
                    onClick={() => handleAction(issue)}
                    className={`text-[9px] font-mono font-bold px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
                      isCrit
                        ? 'bg-rose-900/50 hover:bg-rose-800/60 text-rose-200 border border-rose-500/40'
                        : isHigh
                        ? 'bg-amber-900/40 hover:bg-amber-800/50 text-amber-200 border border-amber-500/40'
                        : 'bg-[#3a2e12] hover:bg-[#4d3d18] text-[#fef08a] border border-[#c5a059]/40'
                    }`}
                  >
                    <span>{issue.actionLabel}</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
