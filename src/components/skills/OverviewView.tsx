import React from 'react';
import { usePOS } from '../../POSContext';
import { 
  SOVEREIGN_ATTRIBUTES_METADATA, 
  getAttributeTrend, 
  evaluateStrategicGaps, 
  generateCapabilityRecommendations, 
  getSkillIntelligenceOverview,
  StrategicCapabilityGap,
  CapabilityRecommendation
} from '../../utils/capabilityIntelligence';
import { CapabilityRadar } from './CapabilityRadar';
import { 
  Sparkles, Award, Target, TrendingUp, AlertTriangle, 
  ArrowRight, ShieldCheck, ChevronRight, CheckCircle2,
  BookOpen, Compass, Zap
} from 'lucide-react';
import { RubElHizbIcon } from '../IslamicRpgDecorations';

interface OverviewViewProps {
  onNavigateTab: (tab: 'OVERVIEW' | 'ATTRIBUTES' | 'DISCIPLINES' | 'INTELLIGENCE') => void;
  onSelectAttribute: (attributeName: string) => void;
  onSelectSkill: (skillId: string) => void;
  onOpenGapModal: (gap: StrategicCapabilityGap) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateTab,
  onSelectAttribute,
  onSelectSkill,
  onOpenGapModal
}) => {
  const { state, getAttributes, getSkillXpAndLevel } = usePOS();

  const attributes = getAttributes();
  const strategicGaps = evaluateStrategicGaps(state);
  const criticalGaps = strategicGaps.filter(g => g.isCritical);
  const intelligenceOverview = getSkillIntelligenceOverview(state);

  // Generate actionable recommendations
  interface OverviewRecommendation {
    priority: 'High' | 'Medium' | 'Low';
    capabilityName: string;
    type: 'attribute' | 'discipline';
    recommendation: string;
    rationale: string;
    actionSteps: string[];
  }

  const recommendations: OverviewRecommendation[] = [];

  // Critical gaps first
  criticalGaps.slice(0, 2).forEach(gap => {
    recommendations.push({
      priority: 'High',
      capabilityName: gap.skillName,
      type: 'discipline',
      recommendation: `Bridge deficit for ${gap.sourceEntityName}`,
      rationale: `Currently Level ${gap.currentLevel} (Target: Level ${gap.targetLevel}). Essential capability for active campaign execution.`,
      actionSteps: [`Complete deliberate practice in ${gap.skillName}`, `Execute sub-directive for ${gap.sourceEntityName}`]
    });
  });

  // Cooling disciplines
  intelligenceOverview.declining.slice(0, 2).forEach(item => {
    recommendations.push({
      priority: 'Medium',
      capabilityName: item.skill.name,
      type: 'discipline',
      recommendation: 'Reactivate dormant execution cadence',
      rationale: `${item.daysInactive} days without directive execution. At risk of skill decay.`,
      actionSteps: [`Schedule 25m Pomodoro in ${item.skill.name}`, 'Execute a quick side directive']
    });
  });

  // Lowest attribute
  if (attributes.length > 0) {
    const lowestAttr = [...attributes].sort((a, b) => a.level - b.level)[0];
    const meta = SOVEREIGN_ATTRIBUTES_METADATA[lowestAttr.name];
    recommendations.push({
      priority: 'Medium',
      capabilityName: lowestAttr.name,
      type: 'attribute',
      recommendation: `Fortify constitutional foundation in ${lowestAttr.name}`,
      rationale: `Lowest sovereign attribute at Level ${lowestAttr.level}. Strengthening this balances character constitution.`,
      actionSteps: meta?.suggestedActions ? meta.suggestedActions.slice(0, 2) : ['Engage in deliberate constitutional practice']
    });
  }

  // Calculate average constitution level
  const avgAttributeLevel = attributes.length > 0 
    ? (attributes.reduce((sum, a) => sum + a.level, 0) / attributes.length).toFixed(1)
    : '1.0';

  return (
    <div className="space-y-6" id="skills-overview-root">
      
      {/* 1. STRATEGIC CAPABILITY GAP ALERT BAR */}
      {criticalGaps.length > 0 ? (
        <div className="bg-gradient-to-r from-red-950/40 via-[#160c0c] to-[#0b0d13] border border-red-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_16px_rgba(239,68,68,0.12)]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-300">
                  CRITICAL_CAPABILITY_GAP_DETECTED ({criticalGaps.length})
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-black bg-red-900/60 text-red-200 border border-red-500/40">
                  BLOCKING EXECUTION
                </span>
              </div>
              <p className="text-xs text-zinc-200 mt-0.5 font-medium">
                {criticalGaps[0].sourceEntityName}: <span className="text-white font-bold">{criticalGaps[0].skillName}</span> is at Lvl {criticalGaps[0].currentLevel} (Target: Lvl {criticalGaps[0].targetLevel}, Gap: -{criticalGaps[0].gapLevel} lvls)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => onOpenGapModal(criticalGaps[0])}
              className="px-3 py-1.5 bg-red-950 border border-red-500/50 hover:border-red-400 text-red-200 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>INSPECT GAP</span>
              <ChevronRight className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('INTELLIGENCE')}
              className="px-3 py-1.5 bg-[#07080c] border border-white/10 hover:border-[#c5a059]/40 text-zinc-300 hover:text-white rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
            >
              GAP ENGINE
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0b0d13] border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                STRATEGIC_ALIGNMENT: CAPABILITY_EQUILIBRIUM
              </span>
              <span className="text-xs text-zinc-300">
                All active Destinies and Campaigns have verified baseline capabilities meeting current operational milestones.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('INTELLIGENCE')}
            className="text-[10px] font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1 shrink-0 font-bold"
          >
            <span>AUDIT GAPS</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* 2. CORE DUAL-COLUMN LAYOUT: 9 SOVEREIGN ATTRIBUTES + CAPABILITY RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLUMNS: 9 SOVEREIGN ATTRIBUTES CONSTITUTION SUMMARY */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#c5a059]/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5">
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                SOVEREIGN_ATTRIBUTES (HUMAN CONSTITUTION)
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a]">
                AVG LVL {avgAttributeLevel}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('ATTRIBUTES')}
              className="text-[10px] font-mono text-[#c5a059] hover:text-[#fef08a] transition-colors flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>DEEP INSPECTOR</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* 9 ATTRIBUTES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {attributes.map(attr => {
              const meta = SOVEREIGN_ATTRIBUTES_METADATA[attr.name];
              const trend = getAttributeTrend(attr.name, state.xpHistory, state.systemDate);
              const progressPct = attr.progress || 0;

              return (
                <div
                  key={attr.id}
                  onClick={() => {
                    onSelectAttribute(attr.name);
                    onNavigateTab('ATTRIBUTES');
                  }}
                  className="bg-[#0b0d13] border border-[#c5a059]/20 hover:border-[#c5a059]/60 hover:bg-[#131722]/80 rounded-xl p-3.5 transition-all cursor-pointer group flex flex-col justify-between space-y-2 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base group-hover:scale-110 transition-transform">
                        {meta?.icon || '⚡'}
                      </span>
                      <div>
                        <h4 className="font-display font-bold text-xs text-zinc-200 group-hover:text-white transition-colors">
                          {attr.name}
                        </h4>
                        <span className="text-[8px] font-mono text-zinc-500 uppercase">
                          {meta?.category || 'Constitutional'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#fef08a] bg-[#3a2e12] border border-[#c5a059]/40 px-1.5 py-0.5 rounded">
                      LVL_{attr.level}
                    </span>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-mono text-zinc-400">
                      <span>NEXT_TIER</span>
                      <span className="text-[#e5c875] font-bold">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-[#07080c] h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full transition-all duration-300 rounded-full"
                        style={{ 
                          width: `${progressPct}%`,
                          backgroundColor: meta?.color || '#c5a059'
                        }}
                      />
                    </div>
                  </div>

                  {/* FOOTER TREND BADGE */}
                  <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[8px] font-mono">
                    <span className="text-zinc-500 truncate max-w-[100px]">
                      {attr.pointsIntoLevel || 0}/{attr.pointsRequiredForNextLevel || 10} pts
                    </span>
                    <span className={`px-1 py-0.2 rounded font-bold uppercase ${
                      trend.status === 'Improving' 
                        ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30'
                        : trend.status === 'Declining'
                          ? 'text-amber-400 bg-amber-950/60 border border-amber-500/30'
                          : 'text-zinc-400 bg-zinc-900 border border-zinc-700/40'
                    }`}>
                      {trend.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: RADAR VISUALIZER */}
        <div className="space-y-4">
          <CapabilityRadar height={380} />
        </div>
      </div>

      {/* 3. CAPABILITY INTELLIGENCE HIGHLIGHTS: DEVELOPED, STRATEGIC, & UNDERUSED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* BOX 1: MOST DEVELOPED DISCIPLINE */}
        <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] font-mono font-bold text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-[#c5a059]" />
              APEX_CRAFT_DISCIPLINES
            </span>
            <span className="text-[9px] font-mono text-zinc-500">
              TOP MASTERY
            </span>
          </div>
          {intelligenceOverview.mostDeveloped.length > 0 ? (
            <div className="space-y-2">
              {intelligenceOverview.mostDeveloped.slice(0, 3).map(item => {
                const skill = item.skill;
                const stats = getSkillXpAndLevel(skill.id);
                return (
                  <div
                    key={skill.id}
                    onClick={() => {
                      onSelectSkill(skill.id);
                      onNavigateTab('DISCIPLINES');
                    }}
                    className="p-2.5 bg-[#07080c] hover:bg-[#141824] border border-[#c5a059]/20 hover:border-[#c5a059] rounded-lg flex justify-between items-center cursor-pointer transition-all group"
                  >
                    <div>
                      <h5 className="font-display font-bold text-xs text-white group-hover:text-[#fef08a] transition-colors">
                        {skill.name}
                      </h5>
                      <span className="text-[8px] font-mono text-zinc-400">
                        Mastery {stats.mastery}% • {skill.equippedTitle || 'Practitioner'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#c5a059]">
                      LVL_{stats.level}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic py-3 text-center">
              No developed disciplines logged yet.
            </p>
          )}
          <button
            type="button"
            onClick={() => onNavigateTab('DISCIPLINES')}
            className="w-full text-center text-[10px] font-mono text-[#c5a059] hover:text-[#fef08a] pt-1 font-bold block cursor-pointer"
          >
            VIEW ALL DISCIPLINES →
          </button>
        </div>

        {/* BOX 2: STRATEGIC REQUIREMENTS */}
        <div className="bg-[#0b0d13] border border-cyan-500/25 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-cyan-400" />
              CRITICAL_MISSION_NEEDS
            </span>
            <span className="text-[9px] font-mono text-cyan-400">
              {intelligenceOverview.mostNeeded.length} ACTIVE
            </span>
          </div>
          {intelligenceOverview.mostNeeded.length > 0 ? (
            <div className="space-y-2">
              {intelligenceOverview.mostNeeded.slice(0, 3).map(item => {
                const skill = item.skill;
                const stats = getSkillXpAndLevel(skill.id);
                return (
                  <div
                    key={skill.id}
                    onClick={() => {
                      onSelectSkill(skill.id);
                      onNavigateTab('DISCIPLINES');
                    }}
                    className="p-2.5 bg-[#07080c] hover:bg-[#0e2a36] border border-cyan-500/20 hover:border-cyan-400 rounded-lg flex justify-between items-center cursor-pointer transition-all group"
                  >
                    <div>
                      <h5 className="font-display font-bold text-xs text-white group-hover:text-cyan-200 transition-colors">
                        {skill.name}
                      </h5>
                      <span className="text-[8px] font-mono text-cyan-400/80">
                        Linked to active campaigns
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      LVL_{stats.level}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic py-3 text-center">
              No specific required capabilities tied to campaigns yet.
            </p>
          )}
          <button
            type="button"
            onClick={() => onNavigateTab('INTELLIGENCE')}
            className="w-full text-center text-[10px] font-mono text-cyan-400 hover:text-cyan-200 pt-1 font-bold block cursor-pointer"
          >
            OPEN GAP ENGINE →
          </button>
        </div>

        {/* BOX 3: COOLING / AT-RISK CAPABILITIES */}
        <div className="bg-[#0b0d13] border border-amber-500/25 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400 rotate-180" />
              COOLING_DISCIPLINES (14D+ COLD)
            </span>
            <span className="text-[9px] font-mono text-amber-400">
              {intelligenceOverview.declining.length} TRACKS
            </span>
          </div>
          {intelligenceOverview.declining.length > 0 ? (
            <div className="space-y-2">
              {intelligenceOverview.declining.slice(0, 3).map(item => {
                const skill = item.skill;
                const stats = getSkillXpAndLevel(skill.id);
                return (
                  <div
                    key={skill.id}
                    onClick={() => {
                      onSelectSkill(skill.id);
                      onNavigateTab('DISCIPLINES');
                    }}
                    className="p-2.5 bg-[#07080c] hover:bg-[#20150c] border border-amber-500/20 hover:border-amber-400 rounded-lg flex justify-between items-center cursor-pointer transition-all group"
                  >
                    <div>
                      <h5 className="font-display font-bold text-xs text-white group-hover:text-amber-200 transition-colors">
                        {skill.name}
                      </h5>
                      <span className="text-[8px] font-mono text-amber-400/80">
                        Dormant execution cadence
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      LVL_{stats.level}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic py-3 text-center">
              All active disciplines have maintained healthy execution velocity.
            </p>
          )}
          <button
            type="button"
            onClick={() => onNavigateTab('INTELLIGENCE')}
            className="w-full text-center text-[10px] font-mono text-amber-400 hover:text-amber-200 pt-1 font-bold block cursor-pointer"
          >
            SKILL HYGIENE SUITE →
          </button>
        </div>

      </div>

      {/* 4. STRATEGIC RECOMMENDATIONS & TRAINING BLUEPRINT */}
      <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#c5a059]" />
            <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider">
              STRATEGIC_CAPABILITY_RECOMMENDATIONS
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-400 uppercase">
            ACTIONABLE BLUEPRINT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.slice(0, 4).map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[#07080c] border border-white/10 hover:border-[#c5a059]/40 rounded-xl space-y-2"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${
                    rec.priority === 'High'
                      ? 'text-red-300 bg-red-950/80 border-red-500/40'
                      : rec.priority === 'Medium'
                        ? 'text-amber-300 bg-amber-950/80 border-amber-500/40'
                        : 'text-zinc-300 bg-zinc-900 border-zinc-700/40'
                  }`}>
                    {rec.priority} PRIORITY
                  </span>
                  <span className="text-[9px] font-mono text-[#c5a059] font-bold">
                    {rec.capabilityName}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-zinc-500 uppercase">
                  {rec.type}
                </span>
              </div>
              <h5 className="font-display font-bold text-xs text-white">
                {rec.recommendation}
              </h5>
              <p className="text-[11px] font-sans text-zinc-400 leading-relaxed">
                {rec.rationale}
              </p>
              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px] font-mono">
                <span className="text-[#fef08a] font-bold">
                  Next Step: {rec.actionSteps[0]}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (rec.type === 'attribute') {
                      onSelectAttribute(rec.capabilityName);
                      onNavigateTab('ATTRIBUTES');
                    } else {
                      const found = state.skills.find(s => s.name.toLowerCase() === rec.capabilityName.toLowerCase());
                      if (found) onSelectSkill(found.id);
                      onNavigateTab('DISCIPLINES');
                    }
                  }}
                  className="text-[#c5a059] hover:text-[#fef08a] flex items-center gap-0.5 font-bold cursor-pointer"
                >
                  <span>ACTIVATE</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
