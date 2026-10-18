import React, { useState, useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { 
  Compass, Target, Zap, Activity, BookOpen, ShieldCheck, 
  AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ArrowRight,
  TrendingUp, Award, Sparkles, Scale, Info, CheckSquare
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';
import { getLocalDateString } from '../../utils/dateUtils';

interface ScoreDimension {
  id: string;
  category: 'short_term' | 'long_term' | 'balance';
  title: string;
  score: number; // 0 to 10
  weight: number;
  description: string;
  metricLabel: string;
  metricValue: string;
  status: 'EXCELLENT' | 'SOLID' | 'NEEDS_ATTENTION';
  recommendation: string;
  actionTab?: 'roadmap' | 'cockpit' | 'capacity' | 'codex';
}

interface StrategicMaturityScoreCardProps {
  onSwitchTab?: (tab: 'roadmap' | 'cockpit' | 'capacity' | 'codex') => void;
}

export const StrategicMaturityScoreCard: React.FC<StrategicMaturityScoreCardProps> = ({
  onSwitchTab
}) => {
  const { state, getGoalProgress, getProjectProgress } = usePOS();
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute Empirical Strategic Scores
  const evaluation = useMemo(() => {
    const goals = state.goals || [];
    const activeGoals = goals.filter(g => g.status === 'Active');
    const projects = state.projects || [];
    const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'Planned');
    const quests = state.quests || [];
    const activeQuests = quests.filter(q => q.status === 'Active');
    const docs = state.planningDocuments || [];

    // --- 1. Long-Term Horizon Architecture (Weight: 25%) ---
    // Criteria: Has active goals across horizons; goals are anchored to campaigns
    const hasLifetime = goals.some(g => (g.horizon || '').toLowerCase().includes('life') || (g.horizon || '').toLowerCase().includes('decade') || (g.horizon || '').toLowerCase().includes('10-year'));
    const hasAnnualOrPillar = goals.some(g => (g.horizon || '').toLowerCase().includes('3-year') || (g.horizon || '').toLowerCase().includes('annual') || (g.horizon || '').toLowerCase().includes('1-year'));
    const anchoredGoals = activeGoals.filter(g => projects.some(p => p.goalId === g.id));
    const anchorRatio = activeGoals.length > 0 ? (anchoredGoals.length / activeGoals.length) : 1;

    let longTermScore = 7.0;
    if (activeGoals.length >= 2) longTermScore += 1.0;
    if (hasLifetime || hasAnnualOrPillar) longTermScore += 1.0;
    if (anchorRatio >= 0.75) longTermScore += 1.0;
    else if (anchorRatio < 0.5) longTermScore -= 1.0;
    longTermScore = Math.min(10, Math.max(1, Math.round(longTermScore * 10) / 10));

    // --- 2. Short-Term Sprint Execution Engine (Weight: 30%) ---
    // Criteria: Active campaigns with clear health, directives attached, velocity
    const blockedProjects = projects.filter(p => p.campaignHealth === 'Blocked');
    const atRiskProjects = projects.filter(p => p.campaignHealth === 'At Risk');
    const healthyProjects = activeProjects.filter(p => p.campaignHealth === 'Healthy' || !p.campaignHealth);
    
    let sprintScore = 7.5;
    if (activeProjects.length >= 1) sprintScore += 1.0;
    if (activeQuests.length >= 2) sprintScore += 0.8;
    if (blockedProjects.length > 0) sprintScore -= (blockedProjects.length * 1.0);
    if (atRiskProjects.length > 0) sprintScore -= (atRiskProjects.length * 0.4);
    if (healthyProjects.length >= 2) sprintScore += 0.7;
    sprintScore = Math.min(10, Math.max(1, Math.round(sprintScore * 10) / 10));

    // --- 3. 168-Hour Capacity & Margin Discipline (Weight: 25%) ---
    // Criteria: Rest bank balance, non-burnout work allocation, domain diversification
    const restBankMinutes = state.profile.timeCredits ?? 60;
    let capacityScore = 8.0;
    if (restBankMinutes < 0) {
      // Overdraft penalty
      capacityScore -= 1.5;
    } else if (restBankMinutes > 120) {
      capacityScore += 1.0;
    }
    // Check habits or spiritual routine presence
    const habitsCount = quests.filter(q => q.type === 'Habit').length;
    if (habitsCount >= 3) capacityScore += 1.0;
    capacityScore = Math.min(10, Math.max(1, Math.round(capacityScore * 10) / 10));

    // --- 4. Codex & Operational SOP Protocol (Weight: 20%) ---
    // Criteria: Codex manuscripts, PR/FAQs, architectural SOPs
    let codexScore = 7.0;
    if (docs.length >= 1) codexScore += 1.0;
    if (docs.length >= 3) codexScore += 1.2;
    const hasSop = docs.some(d => (d.path || '').toLowerCase().includes('sop') || (d.name || '').toLowerCase().includes('sop') || (d.content || '').toLowerCase().includes('sop'));
    if (hasSop) codexScore += 0.8;
    codexScore = Math.min(10, Math.max(1, Math.round(codexScore * 10) / 10));

    // Weighted Overall Score (1 to 10)
    const overallScore = Math.round(
      (longTermScore * 0.25 + sprintScore * 0.30 + capacityScore * 0.25 + codexScore * 0.20) * 10
    ) / 10;

    // Dimensions detailed list
    const dimensions: ScoreDimension[] = [
      {
        id: 'long_term',
        category: 'long_term',
        title: 'Long-Term Horizon Architecture',
        score: longTermScore,
        weight: 25,
        description: 'Multi-horizon cascade: Lifelong North Stars → 10-Year Horizons → 3-Year Strategic Pillars → Annual OKRs.',
        metricLabel: 'Active Destinies',
        metricValue: `${activeGoals.length} Destinies (${Math.round(anchorRatio * 100)}% anchored to campaigns)`,
        status: longTermScore >= 8.5 ? 'EXCELLENT' : longTermScore >= 7.0 ? 'SOLID' : 'NEEDS_ATTENTION',
        recommendation: anchorRatio < 0.75 ? 'Attach operational campaigns to orphaned grand destinies in the Life Roadmap.' : 'Horizon hierarchy is well-calibrated and anchored.',
        actionTab: 'roadmap'
      },
      {
        id: 'sprint_engine',
        category: 'short_term',
        title: '90-Day Sprint War-Room & Velocity',
        score: sprintScore,
        weight: 30,
        description: 'Quarterly tactical campaigns, active battle-ready directives, and bottleneck friction resolution.',
        metricLabel: 'Active Sprint Campaigns',
        metricValue: `${activeProjects.length} Campaigns (${blockedProjects.length} Blocked, ${atRiskProjects.length} At-Risk)`,
        status: sprintScore >= 8.5 ? 'EXCELLENT' : sprintScore >= 7.0 ? 'SOLID' : 'NEEDS_ATTENTION',
        recommendation: blockedProjects.length > 0 ? `Unblock ${blockedProjects.length} campaign(s) in the Sprint War-Room by forging corrective directives.` : 'High sprint momentum with low friction.',
        actionTab: 'cockpit'
      },
      {
        id: 'capacity_margin',
        category: 'balance',
        title: 'Weekly 168h Capacity & Margin Balance',
        score: capacityScore,
        weight: 25,
        description: 'Sustainable deep work pacing, rest bank solvency, domain allocation, and burnout prevention.',
        metricLabel: 'Rest Bank Solvency',
        metricValue: `${restBankMinutes >= 0 ? '+' : ''}${Math.round(restBankMinutes / 60 * 10) / 10}h (${habitsCount} Rhythms active)`,
        status: capacityScore >= 8.5 ? 'EXCELLENT' : capacityScore >= 7.0 ? 'SOLID' : 'NEEDS_ATTENTION',
        recommendation: restBankMinutes < 0 ? 'Liquidate rest deficit to restore cognitive bandwidth.' : 'Capacity margin is sustainable across life domains.',
        actionTab: 'capacity'
      },
      {
        id: 'codex_protocol',
        category: 'long_term',
        title: 'Codex Vault & Interactive SOP Protocols',
        score: codexScore,
        weight: 20,
        description: 'Living operational knowledge, Amazon-style PR/FAQs, Quarterly Sprint calibrations, and standard operating procedures.',
        metricLabel: 'Codex Manuscripts',
        metricValue: `${docs.length} Active Manuscripts (${hasSop ? 'SOP Protocol active' : 'No SOPs recorded'})`,
        status: codexScore >= 8.5 ? 'EXCELLENT' : codexScore >= 7.0 ? 'SOLID' : 'NEEDS_ATTENTION',
        recommendation: !hasSop ? 'Draft an operating SOP template in the Codex Vault to codify critical execution workflows.' : 'Strategic playbook codified.',
        actionTab: 'codex'
      }
    ];

    return {
      overallScore,
      longTermScore,
      sprintScore,
      capacityScore,
      codexScore,
      dimensions
    };
  }, [state, getGoalProgress, getProjectProgress]);

  const getScoreColor = (score: number) => {
    if (score >= 9.0) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 8.0) return 'text-[#fef08a] border-[#c5a059]/40 bg-[#3a2e12]';
    if (score >= 6.5) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getScoreBadgeText = (score: number) => {
    if (score >= 9.0) return 'SOVEREIGN // GRADE A+';
    if (score >= 8.0) return 'TACTICAL // GRADE A';
    if (score >= 7.0) return 'OPERATIONAL // GRADE B';
    return 'CALIBRATING // GRADE C';
  };

  return (
    <div className="bg-[#080b14]/95 border border-[#c5a059]/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-2xl transition-all">
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

      {/* COMPACT SUMMARY HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Main Score Ring / Badge */}
          <div className="flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-[#05070d] border border-[#c5a059]/50 shadow-[0_0_20px_rgba(197,160,89,0.25)] shrink-0">
            <span className="text-xl font-mono font-black text-[#fef08a] tabular-nums leading-none">
              {evaluation.overallScore}
            </span>
            <span className="text-[8px] font-mono text-[#c5a059]/80 uppercase mt-0.5 tracking-wider font-bold">
              / 10.0
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                STRATEGIC PLANNING &amp; EXECUTION MATURITY
              </h3>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${getScoreColor(evaluation.overallScore)}`}>
                {getScoreBadgeText(evaluation.overallScore)}
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans mt-0.5 max-w-xl">
              Empirical assessment of short-term 90-day sprint execution ({evaluation.sprintScore}/10) &amp; long-term horizon architecture ({evaluation.longTermScore}/10).
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="hidden sm:flex items-center gap-3 mr-2 font-mono text-[11px] text-zinc-400">
            <div>
              <span className="text-zinc-500">Short-Term: </span>
              <span className="text-emerald-400 font-bold tabular-nums">{evaluation.sprintScore}/10</span>
            </div>
            <span className="text-zinc-600">|</span>
            <div>
              <span className="text-zinc-500">Long-Term: </span>
              <span className="text-[#fef08a] font-bold tabular-nums">{evaluation.longTermScore}/10</span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 bg-[#05070d] hover:bg-white/5 border border-[#c5a059]/30 text-[#e5c875] text-xs font-mono rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="h-3.5 w-3.5" />
            <span>{isExpanded ? 'HIDE AUDIT' : 'SCORE AUDIT & DIAGNOSTIC'}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* EXPANDED DIAGNOSTIC BREAKDOWN */}
      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="uppercase text-[#c5a059]">4-Pillar Strategic Evaluation Rubric:</span>
            <span>Weighted Overall: <strong className="text-white">{evaluation.overallScore} / 10</strong></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evaluation.dimensions.map(dim => (
              <div 
                key={dim.id}
                className="bg-[#05070d]/90 border border-white/10 rounded-xl p-3.5 space-y-2 hover:border-[#c5a059]/30 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white uppercase">{dim.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400">{dim.weight}% wt</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border tabular-nums ${getScoreColor(dim.score)}`}>
                      {dim.score} / 10
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  {dim.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono">
                  <span className="text-zinc-400">{dim.metricLabel}:</span>
                  <span className="text-zinc-200 font-bold">{dim.metricValue}</span>
                </div>

                <div className="pt-1 flex items-start justify-between gap-2 text-[10px] font-mono">
                  <div className="text-zinc-400">
                    <span className="text-amber-400 font-bold">Protocol Tip: </span>
                    <span>{dim.recommendation}</span>
                  </div>
                  {dim.actionTab && onSwitchTab && (
                    <button
                      onClick={() => onSwitchTab(dim.actionTab!)}
                      className="text-[#e5c875] hover:text-white underline shrink-0 cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Jump</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* VERDICT SUMMARY */}
          <div className="p-3 bg-[#05070d] border border-[#c5a059]/20 rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#c5a059]" />
              <span className="text-zinc-300">
                <strong>Verdict: </strong> 
                The Strategic Matrix Hub scores <span className="text-[#fef08a] font-bold">{evaluation.overallScore} / 10</span>. 
                Short-term sprints connect directly to tactical directives, and long-term horizons cascade cleanly from vision to quarterly execution.
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold shrink-0 ml-2">
              REAL-TIME INTEGRATED
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
