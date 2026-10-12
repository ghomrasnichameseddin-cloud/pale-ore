import React, { useState, useMemo } from 'react';
import { usePOS } from '../POSContext';
import { 
  Compass, Target, Briefcase, FolderOpen, Layers, 
  Search, Sparkles, ArrowRight, CheckCircle, Clock, Award,
  Filter, FileText, ChevronRight, BookOpen, Swords, Zap,
  AlertTriangle, ShieldAlert, CheckSquare, GitBranch, GitCommit,
  FlaskConical, Lightbulb, RefreshCw, ChevronDown, ChevronUp,
  Sliders, Activity, Brain, Bookmark, ShieldCheck, Scale,
  Plus, Edit3, Trash2, Check, Lock, Unlock, Eye, Sparkle
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';
import { Doctrine, StrategicDecision, StrategicExperiment, StrategicPostmortem, ExperimentVerdict } from '../types';
import { DoctrineModal } from './strategy/DoctrineModal';
import { DecisionModal } from './strategy/DecisionModal';
import { ExperimentModal } from './strategy/ExperimentModal';
import { PostmortemModal } from './strategy/PostmortemModal';
import { StrategyNoviceGuideModal } from './strategy/StrategyNoviceGuideModal';

export type StrategySubTab = 'overview' | 'doctrines' | 'decisions' | 'experiments' | 'postmortems';

interface StrategyCodexViewProps {
  initialSubTab?: StrategySubTab;
  onNavigate?: (tab: string) => void;
  onOpenGuide?: (section?: string) => void;
}

export const StrategyCodexView: React.FC<StrategyCodexViewProps> = ({ 
  initialSubTab = 'overview',
  onNavigate,
  onOpenGuide
}) => {
  const { 
    state, 
    getGoalProgress, 
    getProjectProgress, 
    addQuest,
    addDoctrine,
    updateDoctrine,
    deleteDoctrine,
    addStrategicDecision,
    updateStrategicDecision,
    deleteStrategicDecision,
    addStrategicExperiment,
    updateStrategicExperiment,
    deleteStrategicExperiment,
    addStrategicPostmortem,
    updateStrategicPostmortem,
    deleteStrategicPostmortem,
    setStrategicFreeze,
    addPlanningDocument
  } = usePOS();

  // Active Hub Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<StrategySubTab>(initialSubTab);

  // Global & Local Search filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedHorizon, setSelectedHorizon] = useState<string>('All');
  const [expandedDestinyId, setExpandedDestinyId] = useState<string | null>(null);
  const [activeLoopStep, setActiveLoopStep] = useState<number>(0);
  const [quickQuestGoalId, setQuickQuestGoalId] = useState<string | null>(null);
  const [quickQuestName, setQuickQuestName] = useState('');

  // Category filters for Doctrines, Decisions, Experiments
  const [selectedDoctrineCategory, setSelectedDoctrineCategory] = useState<string>('All');
  const [selectedDoctrineStatus, setSelectedDoctrineStatus] = useState<string>('All');
  const [selectedDecisionFramework, setSelectedDecisionFramework] = useState<string>('All');
  const [selectedExperimentVerdict, setSelectedExperimentVerdict] = useState<string>('All');

  // Modal open states & editing items
  const [isDoctrineModalOpen, setIsDoctrineModalOpen] = useState(false);
  const [editingDoctrine, setEditingDoctrine] = useState<Doctrine | null>(null);

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<StrategicDecision | null>(null);

  const [isExperimentModalOpen, setIsExperimentModalOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<StrategicExperiment | null>(null);

  const [isPostmortemModalOpen, setIsPostmortemModalOpen] = useState(false);
  const [editingPostmortem, setEditingPostmortem] = useState<StrategicPostmortem | null>(null);

  // Novice Guide Modal State
  const [isNoviceGuideOpen, setIsNoviceGuideOpen] = useState(false);

  // Success toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNavigate = (targetTab: string) => {
    if (onNavigate) {
      onNavigate(targetTab);
    }
  };

  const horizonMatches = (horizon: string | undefined, filter: string) => {
    if (filter === 'All') return true;
    const normalized = (horizon || '').toLowerCase();
    if (filter === '30-Day') return normalized.includes('30-day');
    if (filter === 'Quarterly') return normalized.includes('quarter');
    if (filter === 'Annual') return normalized.includes('annual');
    if (filter === 'Lifetime') return normalized.includes('life') || normalized.includes('lifetime');
    return false;
  };

  const createNextDirective = (goalId: string) => {
    if (!quickQuestName.trim()) return;
    const goal = state.goals.find(item => item.id === goalId);
    if (!goal) return;

    addQuest({
      name: quickQuestName.trim(),
      description: `Next directive for ${goal.name}.`,
      difficulty: 'Normal',
      estimatedTime: 30,
      xp: 100,
      goalId,
      projectId: null,
      milestoneId: null,
      relatedSkills: goal.relatedSkills || [],
      type: 'Main',
      recurrence: 'None',
      deadline: null
    });
    setQuickQuestName('');
    setQuickQuestGoalId(null);
    showToast(`Directive "${quickQuestName.trim()}" inscribed.`);
  };

  // High-level strategic metrics
  const totalGoals = state.goals.length;
  const completedGoals = state.goals.filter(g => getGoalProgress(g.id) >= 100).length;
  const totalProjects = state.projects.length;
  const completedProjects = state.projects.filter(p => getProjectProgress(p.id) >= 100).length;
  const totalDocs = state.planningDocuments.length;
  const doctrinesList = state.doctrines || [];
  const decisionsList = state.strategicDecisions || [];
  const experimentsList = state.strategicExperiments || [];
  const postmortemsList = state.strategicPostmortems || [];

  // Filtered lists for cross-search in Synthesis Overview
  const filteredGoals = state.goals.filter(g => {
    const matchesSearch = !globalSearch.trim() || 
      g.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      g.description?.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesHorizon = horizonMatches(g.horizon, selectedHorizon);
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
      type: 'BLOCKED_CAMPAIGN' | 'AT_RISK_CAMPAIGN' | 'STALLED_DESTINY' | 'EMPTY_CAMPAIGN';
      title: string;
      description: string;
      severity: 'high' | 'medium' | 'low';
      actionLabel: string;
      targetTab: string;
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
          targetTab: 'frameworks'
        });
      } else if (p.campaignHealth === 'At Risk') {
        bottlenecks.push({
          id: `proj-atrisk-${p.id}`,
          type: 'AT_RISK_CAMPAIGN',
          title: `Campaign At-Risk: "${p.name}"`,
          description: `Timeline or time budget pressure detected. Re-calibrate deliverable milestones.`,
          severity: 'medium',
          actionLabel: 'Review Campaign',
          targetTab: 'projects'
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
          targetTab: 'projects'
        });
      }
    });

    // 3. Campaigns with 0 quests
    state.projects.forEach(p => {
      const attachedQuests = state.quests.filter(q => q.projectId === p.id && q.status !== 'Completed');
      if (attachedQuests.length === 0 && p.status !== 'Completed') {
        bottlenecks.push({
          id: `camp-empty-${p.id}`,
          type: 'EMPTY_CAMPAIGN',
          title: `Empty Campaign Queue: "${p.name}"`,
          description: `No active daily directives linked to this campaign. Seed quests from milestones.`,
          severity: 'low',
          actionLabel: 'Seed Directives',
          targetTab: 'projects'
        });
      }
    });

    return bottlenecks;
  }, [state.projects, state.goals, state.quests]);

  // Strategic Loop Steps
  const strategicLoopSteps = [
    { step: 1, name: 'Goal / Destiny', desc: 'Define ultimate desired outcome & deadline in 30-Day/Quarterly horizons.', icon: Target, ctaTab: 'goals' },
    { step: 2, name: 'Analyze & Heuristics', desc: 'Stress-test constraints, first principles & Pareto 80/20 leverage.', icon: Compass, ctaTab: 'frameworks' },
    { step: 3, name: 'Root Cause (5 Whys)', desc: 'Isolate root friction & failure vectors before building complex plans.', icon: GitCommit, ctaTab: 'frameworks' },
    { step: 4, name: 'Solutions & SCAMPER', desc: 'Lateral thinking, SCAMPER transforms & brainstorming sandbox.', icon: Lightbulb, ctaTab: 'frameworks' },
    { step: 5, name: 'Master Strategy & PR/FAQ', desc: 'Amazon Working Backwards PR/FAQ + 10-folder Codex master plans.', icon: FileText, ctaTab: 'planning' },
    { step: 6, name: 'Execute Campaigns', desc: 'Convert strategy into milestones, deliverables, and daily quests.', icon: Briefcase, ctaTab: 'projects' },
    { step: 7, name: 'Measure & Benchmark', desc: 'Track time budgets, XP yields, and campaign health (Healthy/At Risk).', icon: Activity, ctaTab: 'projects' },
    { step: 8, name: 'Learn & Experiment', desc: 'Log trial & error hypotheses, metrics, and failure learnings.', icon: FlaskConical, ctaTab: 'experiments' },
    { step: 9, name: 'Adapt & Codify SOP', desc: 'Promote winning experiments into immutable 05 SOPs & repeat cycle.', icon: Bookmark, ctaTab: 'planning' },
  ];

  // Doctrine handlers
  const handleSaveDoctrine = (doc: Omit<Doctrine, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      updateDoctrine(existingId, doc);
      showToast('Operating doctrine updated.');
    } else {
      addDoctrine(doc);
      showToast('New doctrine inscribed permanently.');
    }
  };

  const handleToggleDoctrineStatus = (doc: Doctrine) => {
    const nextStatus = doc.status === 'Active' ? 'Draft' : doc.status === 'Draft' ? 'Deprecated' : 'Active';
    updateDoctrine(doc.id, { status: nextStatus });
    showToast(`Doctrine status set to ${nextStatus}.`);
  };

  // Decision handlers
  const handleSaveDecision = (dec: Omit<StrategicDecision, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      updateStrategicDecision(existingId, dec);
      showToast('Strategic decision record updated.');
    } else {
      addStrategicDecision(dec);
      showToast('Strategic decision logged.');
    }
  };

  // Experiment handlers
  const handleSaveExperiment = (exp: Omit<StrategicExperiment, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      updateStrategicExperiment(existingId, exp);
      showToast('Strategic experiment updated.');
    } else {
      addStrategicExperiment(exp);
      showToast('New experiment launched in lab.');
    }
  };

  const handleQuickVerdict = (exp: StrategicExperiment, verdict: ExperimentVerdict) => {
    updateStrategicExperiment(exp.id, { 
      verdict, 
      status: verdict === 'Pending' ? 'Running' : 'Concluded' 
    });
    showToast(`Experiment verdict updated to ${verdict}.`);
  };

  const handleCodifyExperimentToDoctrine = (exp: StrategicExperiment) => {
    const title = exp.title || 'Experimental Standard';
    const rule = exp.decision || exp.result || exp.prediction || exp.hypothesis;
    addDoctrine({
      name: title,
      rule,
      appliesTo: 'Operations & Execution',
      origin: `Strategic Experiment: ${exp.hypothesis}`,
      category: 'Execution',
      status: 'Active'
    });
    updateStrategicExperiment(exp.id, { codifiedSopOrDoctrine: `Doctrine: ${title}` });
    showToast(`Experiment codified into permanent Doctrine: "${title}"!`);
  };

  const handleCodifyExperimentToSOP = (exp: StrategicExperiment) => {
    const title = exp.title || 'Experimental Protocol';
    const content = `# SOP: ${title}\n\n## Empirical Origin\n**Hypothesis:** ${exp.hypothesis}\n\n## Tested Protocol\n${exp.experiment}\n\n## Measurement & Result\n${exp.result || exp.prediction}\n\n## Final Mandate\n${exp.decision || 'Execute this protocol as standard operating procedure.'}\n`;
    addPlanningDocument('05 SOPs', `SOP: ${title}`, content);
    updateStrategicExperiment(exp.id, { codifiedSopOrDoctrine: `SOP: ${title}` });
    showToast(`Experiment promoted to Codex 05 SOP: "${title}"!`);
  };

  // Postmortem handlers
  const handleSavePostmortem = (pm: Omit<StrategicPostmortem, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      updateStrategicPostmortem(existingId, pm);
      showToast('Postmortem audit updated.');
    } else {
      addStrategicPostmortem(pm);
      showToast('Root-cause postmortem inscribed.');
    }
  };

  const handleCodifyPostmortemToSOP = (pm: StrategicPostmortem) => {
    const title = pm.title || pm.event;
    const content = `# SOP: Incident Mitigation for ${title}\n\n## Incident Summary\n${pm.actualOutcome}\n\n## Root Cause (5 Whys Analysis)\n${pm.rootCause}\n\n## Primary Failure Vector\n${pm.failurePoint}\n\n## Mandatory Corrective Action\n${pm.correctiveAction}\n\n## Compounded Life Lesson\n${pm.lesson || 'Systemized to prevent recurring friction.'}\n`;
    addPlanningDocument('05 SOPs', `SOP: Mitigation for ${title}`, content);
    updateStrategicPostmortem(pm.id, { codifiedSopOrDoctrine: `SOP: Mitigation for ${title}` });
    showToast(`Corrective mitigation codified into Codex 05 SOP!`);
  };

  // Filtered sub-views
  const filteredDoctrines = doctrinesList.filter(d => {
    const matchesSearch = !globalSearch.trim() || 
      d.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      d.rule.toLowerCase().includes(globalSearch.toLowerCase()) ||
      d.appliesTo.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesCategory = selectedDoctrineCategory === 'All' || d.category === selectedDoctrineCategory;
    const matchesStatus = selectedDoctrineStatus === 'All' || d.status === selectedDoctrineStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredDecisions = decisionsList.filter(dec => {
    const matchesSearch = !globalSearch.trim() ||
      dec.problem.toLowerCase().includes(globalSearch.toLowerCase()) ||
      dec.decision.toLowerCase().includes(globalSearch.toLowerCase()) ||
      dec.reason?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      dec.lesson?.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesFramework = selectedDecisionFramework === 'All' || 
      dec.frameworkUsed.toLowerCase().includes(selectedDecisionFramework.toLowerCase());
    return matchesSearch && matchesFramework;
  });

  const filteredExperiments = experimentsList.filter(exp => {
    const matchesSearch = !globalSearch.trim() ||
      exp.hypothesis.toLowerCase().includes(globalSearch.toLowerCase()) ||
      exp.prediction.toLowerCase().includes(globalSearch.toLowerCase()) ||
      exp.title?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      exp.experiment.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesVerdict = selectedExperimentVerdict === 'All' || 
      (selectedExperimentVerdict === 'Pending' ? exp.verdict === 'Pending' : exp.verdict === selectedExperimentVerdict);
    return matchesSearch && matchesVerdict;
  });

  const filteredPostmortems = postmortemsList.filter(pm => {
    return !globalSearch.trim() ||
      pm.event.toLowerCase().includes(globalSearch.toLowerCase()) ||
      pm.rootCause.toLowerCase().includes(globalSearch.toLowerCase()) ||
      pm.failurePoint.toLowerCase().includes(globalSearch.toLowerCase()) ||
      pm.correctiveAction.toLowerCase().includes(globalSearch.toLowerCase()) ||
      pm.title?.toLowerCase().includes(globalSearch.toLowerCase());
  });

  return (
    <div className="space-y-6" id="strategy-codex-unified-root">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-3.5 bg-[#0b0d13] border border-[#c5a059] text-[#fef08a] rounded-xl shadow-2xl text-xs font-mono flex items-center gap-2 animate-bounce">
          <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* UNIFIED HEADER & TOP BAR */}
      <div className="border-b border-[#c5a059]/20 pb-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2.5">
              <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
              <span>STRATEGY & CODEX MATRIX HUB</span>
            </h2>
            <p className="text-xs text-zinc-300 font-mono mt-1">
              SANCTUM_STRATEGY • Unified Grand Destinies, Operating Doctrines, Decision Logs, Experiments & Codex SOPs
            </p>
          </div>

          {/* GLOBAL SEARCH INPUT & NOVICE GUIDE TRIGGER */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#c5a059]" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search matrix, doctrines, SOPs..."
                className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsNoviceGuideOpen(true)}
              className="px-3 py-2 rounded-xl bg-[#3a2e12]/80 hover:bg-[#4d3d18] border border-[#c5a059]/60 text-[#fef08a] text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
              title="Open Novice Strategy Guide"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#c5a059]" />
              <span className="hidden sm:inline">Novice Guide</span>
            </button>
          </div>
        </div>

        {/* 5-SUBTAB INTERACTIVE NAVIGATOR */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 p-1.5 bg-[#07080c] border border-[#c5a059]/20 rounded-2xl">
          <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="h-4 w-4 text-[#c5a059]" />
            <span>Overview & Cascade</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('doctrines')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              activeSubTab === 'doctrines'
                ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-[#c5a059]" />
            <span>Immutable Doctrines ({doctrinesList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('decisions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              activeSubTab === 'decisions'
                ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scale className="h-4 w-4 text-[#c5a059]" />
            <span>Strategic Decisions ({decisionsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('experiments')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              activeSubTab === 'experiments'
                ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FlaskConical className="h-4 w-4 text-[#c5a059]" />
            <span>Experiment Lab ({experimentsList.length})</span>
          </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('postmortems')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                activeSubTab === 'postmortems'
                  ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-[#c5a059]" />
              <span>Root-Cause Postmortems ({postmortemsList.length})</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono text-[#c5a059]">
            <RubElHizbIcon className="h-3 w-3" />
            <button
              type="button"
              onClick={() => setIsNoviceGuideOpen(true)}
              className="hover:underline text-[#fef08a] flex items-center gap-1 cursor-pointer"
            >
              <span>Need help? Read Novice Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* STRATEGIC FREEZE BANNER (If Active) */}
      {state.strategicFreeze && (
        <div className="p-4 bg-gradient-to-r from-blue-950/60 via-[#0b0d13] to-blue-950/40 border border-blue-500/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-900/60 text-blue-300 border border-blue-400/30 shrink-0">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-blue-300 tracking-wider block">
                STRATEGIC FREEZE ACTIVE
              </span>
              <p className="text-xs text-zinc-300">
                Non-core tracks and secondary campaigns are strictly frozen. 100% of cognitive focus is directed to the primary production milestone.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setStrategicFreeze(false);
              showToast('Strategic Freeze lifted.');
            }}
            className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-500/40 text-blue-200 text-xs font-mono font-bold self-start md:self-auto cursor-pointer transition flex items-center gap-1.5"
          >
            <Unlock className="h-3.5 w-3.5" /> Lift Freeze
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. OVERVIEW & CASCADE TAB                                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6" id="strategy-synthesis-overview">
          
          {/* EXECUTIVE BANNER */}
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

              {/* Quick Action Button for Doctrines & Decisions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDoctrine(null);
                    setIsDoctrineModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#3a2e12] hover:bg-[#4d3d18] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Inscribe Doctrine
                </button>
              </div>
            </div>

            {/* 4 STRATEGIC PILLARS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#c5a059]/15">
              
              {/* 1. Grand Destinies Pillar */}
              <div 
                onClick={() => handleNavigate('goals')}
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
                onClick={() => handleNavigate('projects')}
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
                onClick={() => handleNavigate('planning')}
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
                onClick={() => handleNavigate('frameworks')}
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

          {/* STRATEGIC BOTTLENECKS */}
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
                        type="button"
                        onClick={() => handleNavigate(b.targetTab)}
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

          {/* 9-STEP STRATEGIC EXECUTION LOOP */}
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
                type="button"
                onClick={() => {
                  const target = strategicLoopSteps[activeLoopStep].ctaTab;
                  if (target === 'experiments') {
                    setActiveSubTab('experiments');
                  } else {
                    handleNavigate(target);
                  }
                }}
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
                    type="button"
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

            {/* Active Step Details */}
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
                type="button"
                onClick={() => {
                  const target = strategicLoopSteps[activeLoopStep].ctaTab;
                  if (target === 'experiments') {
                    setActiveSubTab('experiments');
                  } else {
                    handleNavigate(target);
                  }
                }}
                className="text-cyan-400 hover:text-cyan-200 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                OPEN {strategicLoopSteps[activeLoopStep].ctaTab.toUpperCase()} TAB <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* CASCADE HIERARCHY TREE & 10-FOLDER CODEX */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Active Destinies & Attached Campaigns */}
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
                      type="button"
                      onClick={() => setSelectedHorizon(h)}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded transition cursor-pointer ${
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
                            {quickQuestGoalId === goal.id && (
                              <form
                                onSubmit={(event) => {
                                  event.preventDefault();
                                  createNextDirective(goal.id);
                                }}
                                className="flex items-center gap-1.5 mt-2"
                              >
                                <input
                                  autoFocus
                                  value={quickQuestName}
                                  onChange={(event) => setQuickQuestName(event.target.value)}
                                  placeholder="Next directive..."
                                  className="min-w-0 flex-1 bg-[#0b0d13] border border-cyan-500/40 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-cyan-300"
                                />
                                <button type="submit" className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 text-[9px] font-bold">CREATE</button>
                              </form>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono font-bold text-[#fef08a]">{progress}%</span>
                            <button
                              type="button"
                              onClick={() => setExpandedDestinyId(isExpanded ? null : goal.id)}
                              className="p-1 rounded bg-[#141824] hover:bg-[#1f2438] text-zinc-400 hover:text-white transition cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#141824] rounded-full h-1.5 overflow-hidden">
                          <div className="rpg-progress-gold h-full rounded-full" style={{ width: `${progress}%` }} />
                        </div>

                        {/* Linked Campaigns list */}
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
                                const completedQuests = projQuests.filter(q => q.status === 'Completed').length;

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
                          <div className="pt-1 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-zinc-600 italic">
                              No campaigns attached. Create a campaign linked to this destiny.
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuickQuestGoalId(quickQuestGoalId === goal.id ? null : goal.id)}
                              className="shrink-0 text-[9px] font-mono font-bold text-cyan-300 hover:text-cyan-100 border border-cyan-500/30 rounded px-2 py-1 cursor-pointer"
                            >
                              + DIRECTIVE
                            </button>
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
                    type="button"
                    onClick={() => handleNavigate('planning')}
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
                        onClick={() => handleNavigate('planning')}
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
                  type="button"
                  onClick={() => handleNavigate('planning')}
                  className="px-3 py-1.5 rounded-lg bg-[#07080c] hover:bg-[#141824] border border-[#c5a059]/40 text-[#fef08a] text-[10px] font-bold shrink-0 transition flex items-center gap-1 cursor-pointer"
                >
                  Open SOPs <ChevronRight className="h-3 w-3" />
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. IMMUTABLE OPERATING DOCTRINES TAB                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'doctrines' && (
        <div className="space-y-6" id="strategy-doctrines-view">
          
          {/* TOP BAR: FILTERS & INSCRIBE BUTTON */}
          <div className="glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0b0d13]/90 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#c5a059]" />
                  <span>IMMUTABLE OPERATING DOCTRINES & LAWS</span>
                </h3>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  Non-negotiable operational principles, laws of execution & standards protecting focus and long-term velocity
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingDoctrine(null);
                  setIsDoctrineModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#3a2e12] hover:bg-[#4d3d18] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg self-start md:self-auto cursor-pointer"
              >
                <Plus className="h-4 w-4 text-[#c5a059]" />
                <span>+ Inscribe Doctrine</span>
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 uppercase mr-1">Category:</span>
                {['All', 'Execution', 'Architecture', 'Planning', 'Temporal', 'Knowledge', 'Spiritual'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedDoctrineCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      selectedDoctrineCategory === cat
                        ? 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059] font-bold'
                        : 'bg-[#07080c] text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 uppercase mr-1">Status:</span>
                {['All', 'Active', 'Draft', 'Deprecated'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedDoctrineStatus(st)}
                    className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
                      selectedDoctrineStatus === st
                        ? 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059] font-bold'
                        : 'bg-[#07080c] text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DOCTRINES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoctrines.length === 0 ? (
              <div className="md:col-span-2 text-center py-16 glass-panel rounded-2xl border border-white/5 space-y-3">
                <ShieldCheck className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-mono text-zinc-400">No doctrines match the selected filter criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoctrineCategory('All');
                    setSelectedDoctrineStatus('All');
                    setGlobalSearch('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#fef08a] border border-white/10"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredDoctrines.map(doc => (
                <div 
                  key={doc.id}
                  className="p-5 bg-[#0b0d13] border border-[#c5a059]/20 hover:border-[#c5a059]/50 rounded-2xl space-y-4 transition shadow-lg relative group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-[#c5a059] font-bold uppercase px-2 py-0.5 rounded bg-[#3a2e12]/60 border border-[#c5a059]/30">
                          {doc.category || 'Execution'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleDoctrineStatus(doc)}
                          title="Click to toggle status"
                          className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold cursor-pointer transition border ${
                            doc.status === 'Active' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' :
                            doc.status === 'Draft' ? 'bg-amber-950 text-amber-300 border-amber-500/40' :
                            'bg-zinc-900 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {doc.status}
                        </button>
                      </div>
                      <h4 className="font-display text-sm font-bold text-white tracking-wide">{doc.name}</h4>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDoctrine(doc);
                          setIsDoctrineModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#141824] hover:bg-[#1f2438] text-zinc-400 hover:text-white transition cursor-pointer"
                        title="Edit doctrine"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deprecate and delete doctrine "${doc.name}"?`)) {
                            deleteDoctrine(doc.id);
                            showToast(`Doctrine "${doc.name}" removed.`);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#141824] hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete doctrine"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mandate / Rule block */}
                  <div className="p-3.5 bg-[#07080c] border border-white/5 rounded-xl">
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans italic border-l-2 border-[#c5a059] pl-3">
                      "{doc.rule}"
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-500 gap-2">
                    <span>Scope: <strong className="text-zinc-400 font-normal">{doc.appliesTo}</strong></span>
                    <span>Origin: <strong className="text-zinc-400 font-normal">{doc.origin}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STRATEGIC DECISION LOG TAB                                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'decisions' && (
        <div className="space-y-6" id="strategy-decisions-view">
          
          {/* TOP BAR */}
          <div className="glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0b0d13]/90 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Scale className="h-4 w-4 text-[#c5a059]" />
                  <span>STRATEGIC DECISION RECORDS & TRADE-OFF LOG</span>
                </h3>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  High-stakes architectural, operational and scoping decisions logged with frameworks, confidence ratings & retrospective reviews
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    const next = !state.strategicFreeze;
                    setStrategicFreeze(next);
                    showToast(next ? 'Strategic Freeze activated.' : 'Strategic Freeze lifted.');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                    state.strategicFreeze 
                      ? 'bg-blue-950 text-blue-200 border-blue-500 shadow-md' 
                      : 'bg-[#141824] text-zinc-300 border-white/10 hover:text-white'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5 text-blue-400" />
                  <span>{state.strategicFreeze ? 'Freeze Active' : 'Strategic Freeze'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingDecision(null);
                    setIsDecisionModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#3a2e12] hover:bg-[#4d3d18] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-[#c5a059]" />
                  <span>+ Log Decision</span>
                </button>
              </div>
            </div>

            {/* Framework Filter */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/5 text-xs font-mono">
              <span className="text-[10px] text-zinc-500 uppercase mr-1">Framework:</span>
              {['All', 'Pareto', 'First Principles', 'Working Backwards', 'OODA', '5 Whys'].map(fw => (
                <button
                  key={fw}
                  type="button"
                  onClick={() => setSelectedDecisionFramework(fw)}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    selectedDecisionFramework === fw
                      ? 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059] font-bold'
                      : 'bg-[#07080c] text-zinc-400 border-white/5 hover:text-white'
                  }`}
                >
                  {fw}
                </button>
              ))}
            </div>
          </div>

          {/* DECISIONS CARDS */}
          <div className="space-y-4">
            {filteredDecisions.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-2xl border border-white/5 space-y-3">
                <Scale className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-mono text-zinc-400">No decisions match the selected framework filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDecisionFramework('All');
                    setGlobalSearch('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#fef08a] border border-white/10"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredDecisions.map(dec => (
                <div 
                  key={dec.id}
                  className="p-5 bg-[#0b0d13] border border-[#c5a059]/25 hover:border-[#c5a059]/50 rounded-2xl space-y-4 transition shadow-xl"
                >
                  {/* Top Bar of Decision Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/30">
                        <Scale className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono text-[#c5a059] font-bold uppercase block">
                          FRAMEWORK: {dec.frameworkUsed}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          Recorded: {new Date(dec.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Confidence Pill */}
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="text-zinc-500 text-[10px]">Confidence:</span>
                        <span className="text-[#fef08a] font-bold">{dec.confidence}%</span>
                      </div>

                      {/* Review Date */}
                      {dec.reviewDate && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#141824] text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> Review: {dec.reviewDate.split('T')[0]}
                        </span>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDecision(dec);
                            setIsDecisionModalOpen(true);
                          }}
                          className="p-1 rounded bg-[#141824] hover:bg-[#1f2438] text-zinc-400 hover:text-white transition cursor-pointer"
                          title="Edit decision"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this strategic decision record?')) {
                              deleteStrategicDecision(dec.id);
                              showToast('Strategic decision removed.');
                            }
                          }}
                          className="p-1 rounded bg-[#141824] hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                          title="Delete decision"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Problem & Context */}
                  <div className="space-y-1">
                    <h4 className="font-display text-sm font-bold text-white">{dec.problem}</h4>
                    {dec.context && (
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed">{dec.context}</p>
                    )}
                  </div>

                  {/* Options Considered */}
                  {dec.options && dec.options.length > 0 && (
                    <div className="p-3 bg-[#07080c] border border-white/5 rounded-xl space-y-1.5">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                        OPTIONS EVALUATED:
                      </span>
                      <div className="space-y-1">
                        {dec.options.map((opt, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs font-mono text-zinc-300">
                            <span className="text-zinc-500 text-[10px]">0{idx + 1}.</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chosen Decision & Rationale */}
                  <div className="p-3.5 bg-[#17140e] border border-[#c5a059]/40 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#c5a059] font-bold">
                      <Check className="h-3.5 w-3.5 text-[#fef08a]" />
                      <span>CHOSEN DECISION & ACTION:</span>
                    </div>
                    <p className="text-xs font-sans text-white font-medium leading-relaxed">
                      {dec.decision}
                    </p>
                    {dec.reason && (
                      <p className="text-[11px] font-sans text-zinc-400 leading-relaxed border-t border-white/5 pt-1.5">
                        <strong className="text-zinc-300 font-medium">Core Leverage:</strong> {dec.reason}
                      </p>
                    )}
                  </div>

                  {/* Expected vs Actual */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-[#07080c] border border-white/5 rounded-lg space-y-0.5">
                      <span className="text-[9px] text-zinc-500 uppercase block">Expected Result:</span>
                      <span className="text-zinc-300 font-medium">{dec.expectedResult}</span>
                    </div>
                    {dec.actualResult && (
                      <div className="p-2.5 bg-[#07080c] border border-emerald-500/30 rounded-lg space-y-0.5">
                        <span className="text-[9px] text-emerald-400 uppercase block">Actual Outcome:</span>
                        <span className="text-emerald-200 font-medium">{dec.actualResult}</span>
                      </div>
                    )}
                  </div>

                  {/* Compounding Lesson Learned */}
                  {dec.lesson && (
                    <div className="p-3 bg-[#0a101d] border border-cyan-500/30 rounded-xl flex items-start gap-2 text-xs font-mono text-cyan-200">
                      <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider block text-cyan-300">
                          COMPOUNDING LIFE LESSON:
                        </span>
                        <p className="text-[11px] mt-0.5 leading-relaxed">{dec.lesson}</p>
                      </div>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EXPERIMENTATION LAB TAB                                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'experiments' && (
        <div className="space-y-6" id="strategy-experiments-view">
          
          {/* TOP BAR */}
          <div className="glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0b0d13]/90 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-[#c5a059]" />
                  <span>STRATEGIC EXPERIMENTATION LAB</span>
                </h3>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  14-day empirical hypothesis testing sandbox • Validate behavioral interventions & promote winning protocols to permanent SOPs
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingExperiment(null);
                  setIsExperimentModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#3a2e12] hover:bg-[#4d3d18] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg self-start md:self-auto cursor-pointer"
              >
                <Plus className="h-4 w-4 text-[#c5a059]" />
                <span>+ Launch Experiment</span>
              </button>
            </div>

            {/* Verdict Filter */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/5 text-xs font-mono">
              <span className="text-[10px] text-zinc-500 uppercase mr-1">Verdict:</span>
              {['All', 'Pending', 'Keep', 'Modify', 'Reject'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelectedExperimentVerdict(v)}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    selectedExperimentVerdict === v
                      ? 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059] font-bold'
                      : 'bg-[#07080c] text-zinc-400 border-white/5 hover:text-white'
                  }`}
                >
                  {v === 'Pending' ? 'Running / Pending' : v}
                </button>
              ))}
            </div>
          </div>

          {/* EXPERIMENTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExperiments.length === 0 ? (
              <div className="md:col-span-2 text-center py-16 glass-panel rounded-2xl border border-white/5 space-y-3">
                <FlaskConical className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-mono text-zinc-400">No experiments match the selected verdict filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExperimentVerdict('All');
                    setGlobalSearch('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#fef08a] border border-white/10"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredExperiments.map(exp => (
                <div 
                  key={exp.id}
                  className="p-5 bg-[#0b0d13] border border-[#c5a059]/25 hover:border-[#c5a059]/50 rounded-2xl space-y-4 transition shadow-xl relative group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-cyan-300 font-bold uppercase px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                            {exp.timeboxDays}D TIMEBOX
                          </span>
                          <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                            exp.verdict === 'Keep' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' :
                            exp.verdict === 'Modify' ? 'bg-amber-950 text-amber-300 border-amber-500/40' :
                            exp.verdict === 'Reject' ? 'bg-rose-950 text-rose-300 border-rose-500/40' :
                            'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                          }`}>
                            VERDICT: {exp.verdict}
                          </span>
                        </div>
                        <h4 className="font-display text-sm font-bold text-white mt-1">
                          {exp.title || 'Experimental Protocol'}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExperiment(exp);
                            setIsExperimentModalOpen(true);
                          }}
                          className="p-1 rounded bg-[#141824] hover:bg-[#1f2438] text-zinc-400 hover:text-white transition cursor-pointer"
                          title="Edit experiment"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this strategic experiment?')) {
                              deleteStrategicExperiment(exp.id);
                              showToast('Experiment deleted.');
                            }
                          }}
                          className="p-1 rounded bg-[#141824] hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                          title="Delete experiment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Hypothesis */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-[#c5a059] uppercase font-bold block">
                        FALSIFIABLE HYPOTHESIS:
                      </span>
                      <p className="text-xs font-sans text-zinc-200 leading-relaxed">
                        {exp.hypothesis}
                      </p>
                    </div>

                    {/* Prediction & Protocol */}
                    <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                      <div className="p-2.5 bg-[#07080c] border border-white/5 rounded-xl space-y-0.5">
                        <span className="text-[9px] text-zinc-500 uppercase block">Prediction:</span>
                        <span className="text-zinc-300">{exp.prediction}</span>
                      </div>
                      <div className="p-2.5 bg-[#07080c] border border-white/5 rounded-xl space-y-0.5">
                        <span className="text-[9px] text-zinc-500 uppercase block">Protocol:</span>
                        <span className="text-zinc-300">{exp.experiment}</span>
                      </div>
                    </div>

                    {/* Empirical Result & Codification */}
                    {exp.result && (
                      <div className="p-3 bg-[#17140e] border border-[#c5a059]/40 rounded-xl space-y-1 text-xs font-mono">
                        <span className="text-[9px] uppercase font-bold text-[#fef08a] block">EMPIRICAL RESULT:</span>
                        <p className="text-zinc-200">{exp.result}</p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Strip: Quick Verdict + 1-Click Codify */}
                  <div className="pt-3 border-t border-white/5 space-y-2 mt-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Set Verdict:</span>
                      <div className="flex items-center gap-1">
                        {(['Keep', 'Modify', 'Reject'] as const).map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleQuickVerdict(exp, v)}
                            className={`px-2 py-0.5 text-[9px] font-mono rounded border transition cursor-pointer ${
                              exp.verdict === v 
                                ? 'bg-white/10 text-white font-bold border-white/30' 
                                : 'bg-black text-zinc-500 border-white/5 hover:text-zinc-300'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 1-Click Promotion Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCodifyExperimentToDoctrine(exp)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-[#3a2e12] hover:bg-[#4d3d18] border border-[#c5a059]/40 text-[#fef08a] text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Promote to permanent Operating Doctrine"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span>Codify Doctrine</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCodifyExperimentToSOP(exp)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Promote to 10-Folder Codex SOP (05 SOPs)"
                      >
                        <FolderOpen className="h-3 w-3" />
                        <span>Promote to SOP</span>
                      </button>
                    </div>

                    {exp.codifiedSopOrDoctrine && (
                      <span className="text-[9px] font-mono text-emerald-400 block truncate text-center pt-0.5">
                        ✓ Codified: {exp.codifiedSopOrDoctrine}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ROOT-CAUSE POSTMORTEMS TAB                                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'postmortems' && (
        <div className="space-y-6" id="strategy-postmortems-view">
          
          {/* TOP BAR */}
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-[#0b0d13]/90 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span>ROOT-CAUSE POSTMORTEMS & 5-WHYS RETROSPECTIVES</span>
                </h3>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  Transform operational friction, timeline slips and energy crashes into permanent structural SOPs and systemic guardrails
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPostmortem(null);
                  setIsPostmortemModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg self-start md:self-auto cursor-pointer"
              >
                <Plus className="h-4 w-4 text-rose-300" />
                <span>+ Conduct Postmortem</span>
              </button>
            </div>
          </div>

          {/* POSTMORTEMS LIST */}
          <div className="space-y-4">
            {filteredPostmortems.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-2xl border border-white/5 space-y-3">
                <ShieldAlert className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-mono text-zinc-400">No postmortems found.</p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPostmortem(null);
                    setIsPostmortemModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-xs font-mono text-rose-200 border border-rose-500/30 cursor-pointer"
                >
                  Conduct First Postmortem
                </button>
              </div>
            ) : (
              filteredPostmortems.map(pm => (
                <div 
                  key={pm.id}
                  className="p-5 bg-[#0b0d13] border border-rose-500/20 hover:border-rose-500/40 rounded-2xl space-y-4 transition shadow-xl"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-500/30">
                        <ShieldAlert className="h-4 w-4" />
                      </span>
                      <div>
                        <h4 className="font-display text-sm font-bold text-white">
                          {pm.title || pm.event}
                        </h4>
                        <span className="text-[9px] font-mono text-zinc-500">
                          Incident Recorded: {new Date(pm.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPostmortem(pm);
                          setIsPostmortemModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#141824] hover:bg-[#1f2438] text-zinc-400 hover:text-white transition cursor-pointer"
                        title="Edit postmortem"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this postmortem audit?')) {
                            deleteStrategicPostmortem(pm.id);
                            showToast('Postmortem removed.');
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#141824] hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete postmortem"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Incident Event & Outcome Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-[#07080c] border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-500 uppercase block">Expected Target:</span>
                      <p className="text-zinc-300">{pm.expectedOutcome}</p>
                    </div>
                    <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-1">
                      <span className="text-[9px] text-rose-400 uppercase block">Actual Friction / Outcome:</span>
                      <p className="text-rose-200">{pm.actualOutcome}</p>
                    </div>
                  </div>

                  {/* Failure Point & 5 Whys Root Cause */}
                  <div className="p-3.5 bg-[#07080c] border border-rose-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-rose-400 font-bold uppercase flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                        5-WHYS ROOT CAUSE ANALYSIS:
                      </span>
                      {pm.failurePoint && (
                        <span className="text-zinc-500">Vector: {pm.failurePoint}</span>
                      )}
                    </div>
                    <p className="text-xs font-sans text-zinc-200 leading-relaxed">
                      {pm.rootCause}
                    </p>
                  </div>

                  {/* Mandatory Corrective Action */}
                  <div className="p-3.5 bg-[#17140e] border border-[#c5a059]/40 rounded-xl space-y-1 text-xs">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#c5a059] flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-[#fef08a]" />
                      PERMANENT CORRECTIVE SYSTEM GUARDRAIL:
                    </span>
                    <p className="font-sans text-white font-medium leading-relaxed">
                      {pm.correctiveAction}
                    </p>
                  </div>

                  {/* Compounding Lesson Learned */}
                  {pm.lesson && (
                    <div className="p-3 bg-[#0a101d] border border-cyan-500/30 rounded-xl flex items-start gap-2 text-xs font-mono text-cyan-200">
                      <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider block text-cyan-300">
                          LESSON CODIFIED FOR POSTERITY:
                        </span>
                        <p className="text-[11px] mt-0.5 leading-relaxed">{pm.lesson}</p>
                      </div>
                    </div>
                  )}

                  {/* Bottom Strip: 1-Click Codify Action */}
                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">
                      Impact: {pm.impact || 'Systemic retrospective audit'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCodifyPostmortemToSOP(pm)}
                      className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Generate a permanent SOP mitigation document in Codex (05 SOPs)"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span>Codify into Codex 05 SOP</span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* BESPOKE STRATEGIC CREATION MODALS                                         */}
      {/* ========================================================================= */}
      <DoctrineModal
        isOpen={isDoctrineModalOpen}
        onClose={() => setIsDoctrineModalOpen(false)}
        onSave={handleSaveDoctrine}
        editingDoctrine={editingDoctrine}
      />

      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        onSave={handleSaveDecision}
        editingDecision={editingDecision}
      />

      <ExperimentModal
        isOpen={isExperimentModalOpen}
        onClose={() => setIsExperimentModalOpen(false)}
        onSave={handleSaveExperiment}
        editingExperiment={editingExperiment}
      />

      <PostmortemModal
        isOpen={isPostmortemModalOpen}
        onClose={() => setIsPostmortemModalOpen(false)}
        onSave={handleSavePostmortem}
        editingPostmortem={editingPostmortem}
      />

      {/* NOVICE GUIDE MODAL */}
      <StrategyNoviceGuideModal
        isOpen={isNoviceGuideOpen}
        onClose={() => setIsNoviceGuideOpen(false)}
        onNavigateTab={handleNavigate}
        onOpenSystemGuide={onOpenGuide ? () => onOpenGuide('strategic-models') : undefined}
      />

    </div>
  );
};
