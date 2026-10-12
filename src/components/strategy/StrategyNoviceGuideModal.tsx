import React, { useState } from 'react';
import { 
  X, BookOpen, Compass, ShieldCheck, Scale, FlaskConical, ShieldAlert,
  Target, Briefcase, FileText, Sparkles, CheckCircle2, ArrowRight,
  Lightbulb, AlertTriangle, Layers, Bookmark, Lock, HelpCircle,
  FolderTree, RefreshCw
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';

interface StrategyNoviceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenSystemGuide?: () => void;
}

type GuideTopic = 
  | 'mental-model' 
  | 'doctrines' 
  | 'decisions' 
  | 'experiments' 
  | 'postmortems' 
  | 'codex-vault' 
  | 'workflow-loop';

export const StrategyNoviceGuideModal: React.FC<StrategyNoviceGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenSystemGuide
}) => {
  const [activeTopic, setActiveTopic] = useState<GuideTopic>('mental-model');

  if (!isOpen) return null;

  const topics: { id: GuideTopic; label: string; icon: React.ElementType; badge: string }[] = [
    { id: 'mental-model', label: '1. Mental Model & Cascade', icon: Compass, badge: 'FOUNDATION' },
    { id: 'doctrines', label: '2. Immutable Doctrines', icon: ShieldCheck, badge: 'LAWS' },
    { id: 'decisions', label: '3. Strategic Decision Log', icon: Scale, badge: 'CHOICES' },
    { id: 'experiments', label: '4. Experimentation Lab', icon: FlaskConical, badge: 'EMPIRICAL' },
    { id: 'postmortems', label: '5. Incident Postmortems', icon: ShieldAlert, badge: 'LEARNING' },
    { id: 'codex-vault', label: '6. 10-Folder Codex Vault', icon: FolderTree, badge: 'KNOWLEDGE' },
    { id: 'workflow-loop', label: '7. Novice 9-Step Routine', icon: RefreshCw, badge: 'PRACTICE' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div 
        dir="ltr"
        className="relative border border-[#c5a059]/50 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.25)] bg-gradient-to-b from-[#0e111a] via-[#090b10] to-[#07080c]"
      >
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
        <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-4 w-4" color="#c5a059" />

        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#c5a059]/30 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#1c160a] via-[#0b0d13] to-[#1c160a] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#3a2e12]/80 border border-[#c5a059]/50 rounded-xl text-[#fef08a] shadow-[0_0_15px_rgba(197,160,89,0.25)]">
              <Compass className="h-5 w-5 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide flex items-center gap-2">
                  <span>STRATEGY & CODEX NOVICE GUIDE</span>
                </h3>
                <span className="text-[10px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 px-2 py-0.5 rounded uppercase font-bold">
                  BEGINNER TO ARCHITECT
                </span>
              </div>
              <p className="text-xs font-mono text-[#c5a059]/80 mt-0.5">
                How to align high-level vision, immutable laws, and daily directives without cognitive overload.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSystemGuide && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSystemGuide();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#07080c] hover:bg-white/5 border border-[#c5a059]/40 text-[#fef08a] text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#c5a059]" />
                <span className="hidden sm:inline">Open Full System Guide</span>
                <span className="sm:hidden">Full Guide</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Close Guide"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* BODY CONTAINER */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* TOPIC SIDEBAR */}
          <div className="w-full md:w-80 lg:w-84 border-b md:border-b-0 md:border-r border-[#c5a059]/20 bg-[#07080c]/80 p-3 space-y-1.5 shrink-0 overflow-x-auto md:overflow-y-auto max-h-52 md:max-h-none flex md:flex-col gap-1.5 md:gap-1.5">
            <div className="text-[10px] font-mono text-[#c5a059]/70 font-bold uppercase tracking-wider px-2 py-0.5 hidden md:flex items-center gap-1.5">
              <Compass className="h-3 w-3 text-[#c5a059]" />
              <span>GUIDE MODULES</span>
            </div>

            {topics.map(t => {
              const Icon = t.icon;
              const isActive = activeTopic === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTopic(t.id)}
                  title={t.label}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 text-xs font-mono cursor-pointer shrink-0 min-w-[260px] md:min-w-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#3a2e12] via-[#241c09] to-[#12141f] border-[#c5a059] text-[#fef08a] font-bold shadow-[0_0_12px_rgba(197,160,89,0.2)]'
                      : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#c5a059]' : 'text-zinc-500'}`} />
                    <span className="truncate font-bold">{t.label}</span>
                  </div>
                  <span className={`text-[8.5px] px-2 py-0.5 rounded border shrink-0 font-mono tracking-wider uppercase font-semibold whitespace-nowrap inline-flex items-center ${
                    isActive 
                      ? 'border-[#c5a059]/80 text-[#fef08a] bg-[#3a2e12]/90 shadow-sm' 
                      : 'border-white/10 text-zinc-400 bg-black/50'
                  }`}>
                    {t.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* MAIN TOPIC CONTENT */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#090b10]/90 text-sm">
            
            {/* 1. MENTAL MODEL & CASCADE */}
            {activeTopic === 'mental-model' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#c5a059]/20 pb-3">
                  <h4 className="text-base font-display font-bold text-[#fef08a] flex items-center gap-2">
                    <Compass className="h-5 w-5 text-[#c5a059]" />
                    <span>The Core Mental Model: The Strategic Cascade</span>
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Why the hub exists and how top-tier operators avoid busywork.
                  </p>
                </div>

                <div className="p-3.5 bg-gradient-to-r from-[#1c160a] to-[#0d1017] border border-[#c5a059]/40 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-[#fef08a] block">
                    THE GOLDEN CASCADE RULE:
                  </span>
                  <div className="font-mono text-xs text-white flex flex-wrap items-center gap-1.5 py-1">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10">VISION</span>
                    <ArrowRight className="h-3 w-3 text-[#c5a059]" />
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10">DOCTRINE</span>
                    <ArrowRight className="h-3 w-3 text-[#c5a059]" />
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10">DESTINY (Goal)</span>
                    <ArrowRight className="h-3 w-3 text-[#c5a059]" />
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10">CAMPAIGN (Project)</span>
                    <ArrowRight className="h-3 w-3 text-[#c5a059]" />
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">DIRECTIVE (Quest)</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    A quest performed without a campaign is <em>random labor</em>. A campaign without a destiny is <em>directionless effort</em>. A destiny without doctrines is <em>fragile ambition</em>. The Strategy Hub is your governance dashboard to guarantee that every ounce of energy spent today serves a permanent legacy.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#07080c] border border-white/10 rounded-xl space-y-1">
                    <strong className="text-cyan-300 block flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" /> Grand Destinies (Goals)
                    </strong>
                    <p className="text-zinc-400 font-sans text-xs">
                      High-level milestones spanning 30-Day sprints, Quarterly seasons, or Lifetime horizons. Always anchor 1 to 3 active campaigns inside them.
                    </p>
                  </div>
                  <div className="p-3 bg-[#07080c] border border-white/10 rounded-xl space-y-1">
                    <strong className="text-purple-300 block flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" /> Operational Campaigns (Projects)
                    </strong>
                    <p className="text-zinc-400 font-sans text-xs">
                      Time-budgeted mission containers broken into milestone phases. These contain your daily executable quests.
                    </p>
                  </div>
                </div>

                {/* BOTTLENECK AUDIT EXPLANATION */}
                <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    How the Automatic Bottleneck Audit Works
                  </span>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Look at the top of the <strong>Overview & Cascade</strong> tab. The system actively scans your database for 3 deadly strategic mistakes:
                  </p>
                  <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4 font-sans">
                    <li><strong className="text-zinc-200">Stalled Destinies:</strong> A goal that has 0 campaigns running underneath it.</li>
                    <li><strong className="text-zinc-200">Empty Campaigns:</strong> A campaign with 0 active directives in your quest queue.</li>
                    <li><strong className="text-zinc-200">At-Risk Campaigns:</strong> A campaign exceeding its planned time budget or falling behind target milestones.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. IMMUTABLE DOCTRINES */}
            {activeTopic === 'doctrines' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#c5a059]/20 pb-3">
                  <h4 className="text-base font-display font-bold text-[#fef08a] flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#c5a059]" />
                    <span>Immutable Operating Doctrines: Your Personal Constitution</span>
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Rules that govern how you execute, decide, and allocate time under pressure.
                  </p>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  Doctrines are <strong>non-negotiable laws</strong>. When willpower fluctuates, doctrines dictate action. For example: <em>"Never begin work without an unambiguous deliverable specification"</em> or <em>"Fajr to sunrise is an immutable deep work sanctuary."</em>
                </p>

                <div className="space-y-2.5">
                  <h5 className="text-xs font-mono font-bold text-[#fef08a] uppercase">Doctrine Domains:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-[#07080c] border border-white/10 rounded-lg">
                      <span className="text-emerald-300 font-bold block">Execution</span>
                      <span className="text-zinc-400 text-[11px] font-sans">Rules for deep work, task sizes, and context switching.</span>
                    </div>
                    <div className="p-2.5 bg-[#07080c] border border-white/10 rounded-lg">
                      <span className="text-blue-300 font-bold block">Architecture</span>
                      <span className="text-zinc-400 text-[11px] font-sans">System design, modular code, and simplicity constraints.</span>
                    </div>
                    <div className="p-2.5 bg-[#07080c] border border-white/10 rounded-lg">
                      <span className="text-amber-300 font-bold block">Planning</span>
                      <span className="text-zinc-400 text-[11px] font-sans">Horizon calibration, time estimates, and phase buffers.</span>
                    </div>
                    <div className="p-2.5 bg-[#07080c] border border-white/10 rounded-lg">
                      <span className="text-purple-300 font-bold block">Temporal</span>
                      <span className="text-zinc-400 text-[11px] font-sans">Sleep windows, sacred prayer anchors, and sabbath rest.</span>
                    </div>
                    <div className="p-2.5 bg-[#07080c] border border-white/10 rounded-lg">
                      <span className="text-cyan-300 font-bold block">Knowledge</span>
                      <span className="text-zinc-400 text-[11px] font-sans">Mandatory SOP updates, documentation, and error retrospectives.</span>
                    </div>
                    <div className="p-2.5 bg-[#07080c] border border-white/10 rounded-lg">
                      <span className="text-[#fef08a] font-bold block">Spiritual</span>
                      <span className="text-zinc-400 text-[11px] font-sans">Ikhlas (sincerity), moral friction, and accountability before Allah.</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#07080c] border border-[#c5a059]/30 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-[#fef08a] block">
                    HOW NOVICES SHOULD USE DOCTRINES:
                  </span>
                  <ol className="text-xs text-zinc-300 space-y-1.5 list-decimal pl-4 font-sans leading-relaxed">
                    <li>Click <strong className="text-[#fef08a]">+ Inscribe Doctrine</strong> to open the builder.</li>
                    <li>Pick from the <strong>battle-tested presets</strong> (e.g., <em>Stability Over Intensity</em>, <em>Protect Golden Hours</em>) or write your own.</li>
                    <li>Mark new principles as <strong>Draft</strong> if you are testing them, then upgrade them to <strong>Active</strong> when validated.</li>
                    <li>Review active doctrines before every planning session or sprint launch.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 3. STRATEGIC DECISION LOG */}
            {activeTopic === 'decisions' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#c5a059]/20 pb-3">
                  <h4 className="text-base font-display font-bold text-[#fef08a] flex items-center gap-2">
                    <Scale className="h-5 w-5 text-[#c5a059]" />
                    <span>The Strategic Decision Log: Defeating Hindsight Bias</span>
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Document critical forks in the road before you know whether they succeeded or failed.
                  </p>
                </div>

                <div className="p-3.5 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-blue-300 block">
                    WHY LOG DECISIONS?
                  </span>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Humans suffer from <em>outcome bias</em>: if an outcome is good, we assume our decision was smart; if bad, we kick ourselves. The Decision Log records your reasoning, evaluated options, and expected outcomes <strong>at the exact moment you decide</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-mono font-bold text-[#fef08a] uppercase">What to Include in Every Decision:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-[#07080c] border border-white/10 rounded-lg">
                      <strong className="text-white block">1. The Problem & Context</strong>
                      <span className="text-zinc-400 font-sans text-xs">What specific trade-off or architectural crossroads are you confronting?</span>
                    </div>
                    <div className="p-2.5 bg-[#07080c] border border-white/10 rounded-lg">
                      <strong className="text-white block">2. Viable Alternatives</strong>
                      <span className="text-zinc-400 font-sans text-xs">At least 2 realistic alternatives considered and why you rejected them.</span>
                    </div>
                    <div className="p-2.5 bg-[#07080c] border border-white/10 rounded-lg">
                      <strong className="text-white block">3. Mental Model / Framework</strong>
                      <span className="text-zinc-400 font-sans text-xs">Did you use First Principles, Second-Order Thinking, Inversion, or Regret Minimization?</span>
                    </div>
                    <div className="p-2.5 bg-[#07080c] border border-white/10 rounded-lg">
                      <strong className="text-white block">4. Scheduled Review Date & Confidence</strong>
                      <span className="text-zinc-400 font-sans text-xs">Set a calendar date (typically 14 to 30 days) to revisit the decision and record actual results.</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#07080c] border border-emerald-500/30 rounded-xl text-xs font-mono space-y-1">
                  <span className="text-emerald-300 font-bold block">💡 Novice Pro-Tip:</span>
                  <p className="text-zinc-300 font-sans">
                    When the scheduled review date arrives, click <strong>Edit Decision</strong>, record the actual result, declare the verdict (Validated or Invalidated), and capture the permanent lesson learned!
                  </p>
                </div>
              </div>
            )}

            {/* 4. EXPERIMENTATION LAB */}
            {activeTopic === 'experiments' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#c5a059]/20 pb-3">
                  <h4 className="text-base font-display font-bold text-[#fef08a] flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-[#c5a059]" />
                    <span>The Experimentation Lab: Trial & Error Scientific Method</span>
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Formulate falsifiable hypotheses, run strict timeboxes, and codify winners.
                  </p>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  Never change your entire routine on a whim. Instead, run an <strong>empirical experiment</strong> with a clear timebox (e.g., 7 or 14 days) and measurable metrics.
                </p>

                <div className="p-3.5 bg-[#0d1017] border border-cyan-500/30 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-cyan-300 block">
                    THE 4-PART SCIENTIFIC PROTOCOL:
                  </span>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-bold shrink-0">1. HYPOTHESIS</span>
                      <span className="text-zinc-300 font-sans">"If I complete 90 minutes of uninterrupted work right after Fajr..."</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-bold shrink-0">2. PREDICTION</span>
                      <span className="text-zinc-300 font-sans">"...then daily campaign velocity will double and afternoon fatigue will decrease by 40%."</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-bold shrink-0">3. MEASUREMENT</span>
                      <span className="text-zinc-300 font-sans">Track daily completed Pomodoros and subjective focus rating (1-10) for 14 days.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-bold shrink-0">4. VERDICT & ACTION</span>
                      <span className="text-zinc-300 font-sans">Conclude with <strong>Keep</strong> (adopt), <strong>Modify</strong> (tweak), or <strong>Reject</strong> (discard).</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#07080c] border border-[#c5a059]/40 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-[#fef08a] flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[#c5a059]" />
                    1-Click Codification Magic:
                  </span>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    When an experiment succeeds and receives a <span className="text-emerald-400 font-bold font-mono">KEEP</span> verdict:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                    <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
                      <strong className="text-[#fef08a] block">🛡️ Codify to Doctrine</strong>
                      <span className="text-zinc-400 font-sans text-[11px]">Instantly turns the validated protocol into an immutable system operating rule.</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
                      <strong className="text-cyan-300 block">📁 Promote to 05 SOP</strong>
                      <span className="text-zinc-400 font-sans text-[11px]">Generates a permanent markdown Standard Operating Procedure inside the Codex Vault!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. ROOT-CAUSE POSTMORTEMS */}
            {activeTopic === 'postmortems' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#c5a059]/20 pb-3">
                  <h4 className="text-base font-display font-bold text-[#fef08a] flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-[#c5a059]" />
                    <span>Root-Cause Incident Postmortems: Blameless Retrospectives</span>
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Convert painful failures, slipped deadlines, and habits into permanent systemic armor.
                  </p>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  Whenever a project milestone fails, a major slip occurs, or burnout strikes, do not rely on generic guilt or emotional promises. Conduct an engineering-grade <strong>postmortem</strong>.
                </p>

                <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-rose-300 block">
                    THE 5-WHYS DECONSTRUCTION ENGINE:
                  </span>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Drill down five levels past surface excuses to uncover the mechanical vulnerability:
                  </p>
                  <div className="text-xs font-mono space-y-1 text-zinc-400 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <div>1. <em>Why was the sprint deadline missed?</em> ➔ Tasks took twice as long as estimated.</div>
                    <div>2. <em>Why were estimates inaccurate?</em> ➔ Edge cases and dependencies were not mapped upfront.</div>
                    <div>3. <em>Why were they not mapped?</em> ➔ Coding began before writing a functional spec document.</div>
                    <div>4. <em>Why was no spec written?</em> ➔ Perceived urgency skipped the planning phase.</div>
                    <div>5. <strong className="text-rose-300">Root Cause:</strong> <em>Lack of an immutable gateway doctrine requiring spec approval before sprint execution.</em></div>
                  </div>
                </div>

                <div className="p-3 bg-[#07080c] border border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold text-white block">
                    FAILURE VECTOR CATEGORIES:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-zinc-900 rounded border border-white/5 text-center text-zinc-300">Planning Bias</div>
                    <div className="p-2 bg-zinc-900 rounded border border-white/5 text-center text-zinc-300">Execution Friction</div>
                    <div className="p-2 bg-zinc-900 rounded border border-white/5 text-center text-zinc-300">Willpower Reliance</div>
                    <div className="p-2 bg-zinc-900 rounded border border-white/5 text-center text-zinc-300">Distraction / Context</div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. 10-FOLDER CODEX VAULT */}
            {activeTopic === 'codex-vault' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#c5a059]/20 pb-3">
                  <h4 className="text-base font-display font-bold text-[#fef08a] flex items-center gap-2">
                    <FolderTree className="h-5 w-5 text-[#c5a059]" />
                    <span>The 10-Folder Standardized Codex Architecture</span>
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Your external brain, SOP repository, and long-term markdown memory.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-[#07080c] border border-white/5 rounded-lg">
                    <strong className="text-[#fef08a]">00 Vision:</strong> North Star, life charter, values.
                  </div>
                  <div className="p-2 bg-[#07080c] border border-white/5 rounded-lg">
                    <strong className="text-cyan-300">01 Strategies:</strong> High-level domain playbooks.
                  </div>
                  <div className="p-2 bg-[#07080c] border border-white/5 rounded-lg">
                    <strong className="text-blue-300">02 Master Plans:</strong> Multi-year roadmaps.
                  </div>
                  <div className="p-2 bg-[#07080c] border border-white/5 rounded-lg">
                    <strong className="text-purple-300">03 Tactical Playbooks:</strong> Daily focus battleplans.
                  </div>
                  <div className="p-2 bg-[#07080c] border border-white/5 rounded-lg">
                    <strong className="text-emerald-300">04 Operations:</strong> Friday Muhasabah audits.
                  </div>
                  <div className="p-2 bg-[#07080c] border border-white/5 rounded-lg">
                    <strong className="text-amber-300">05 SOPs:</strong> Checklists, routines, execution runbooks.
                  </div>
                  <div className="p-2 bg-[#07080c] border border-white/5 rounded-lg">
                    <strong className="text-indigo-300">06 Frameworks:</strong> Mental models & decision trees.
                  </div>
                  <div className="p-2 bg-[#07080c] border border-white/5 rounded-lg">
                    <strong className="text-rose-300">07 Experiments:</strong> Scientific test records.
                  </div>
                  <div className="p-2 bg-[#07080c] border border-white/5 rounded-lg">
                    <strong className="text-orange-300">08 Lessons Learned:</strong> Debriefs & retrospectives.
                  </div>
                  <div className="p-2 bg-[#07080c] border border-white/5 rounded-lg">
                    <strong className="text-zinc-400">09 Reviews & Archive:</strong> Annual/quarterly reviews.
                  </div>
                </div>

                <div className="p-3 bg-[#0d1017] border border-cyan-500/30 rounded-xl space-y-1 text-xs">
                  <span className="text-cyan-300 font-mono font-bold block">Accessing Full Codex Documents:</span>
                  <p className="text-zinc-300 font-sans">
                    Switch to the <strong>Planning View</strong> tab in the main sidebar to browse, edit, create, or search every Markdown document with full live split preview and syntax highlighting.
                  </p>
                </div>
              </div>
            )}

            {/* 7. WORKFLOW LOOP */}
            {activeTopic === 'workflow-loop' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-[#c5a059]/20 pb-3">
                  <h4 className="text-base font-display font-bold text-[#fef08a] flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-[#c5a059]" />
                    <span>The Novice 9-Step Operating Routine</span>
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Follow this checklist weekly to keep your strategic engine running smoothly.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    { step: 1, title: 'Check Active Bottlenecks', desc: 'Inspect the Overview tab for stalled destinies or empty campaign queues.' },
                    { step: 2, title: 'Verify Horizon Alignment', desc: 'Ensure active campaigns point directly to a 30-Day or Quarterly goal.' },
                    { step: 3, title: 'Enforce Doctrines', desc: 'Review active operating laws before committing to new scope or timeline changes.' },
                    { step: 4, title: 'Seed Daily Directives', desc: 'Use "+ DIRECTIVE" on campaigns to generate 1-3 high-impact daily quests.' },
                    { step: 5, title: 'Execute in Focus Sanctum', desc: 'Run Pomodoro focus sessions directly on linked directives.' },
                    { step: 6, title: 'Log Critical Crossroads', desc: 'When changing architectures or strategy, write an entry in the Strategic Decision Log.' },
                    { step: 7, title: 'Run Timeboxed Experiments', desc: 'If tweaking routines, set a 14-day experiment in the Experiment Lab.' },
                    { step: 8, title: 'Postmortem Any Friction', desc: 'Turn slipped milestones into 5-Whys retrospectives.' },
                    { step: 9, title: 'Friday Muhasabah Reconcile', desc: 'Reconcile weekly results, harvest lessons, and archive into the Codex.' }
                  ].map(s => (
                    <div key={s.step} className="p-2.5 bg-[#07080c] border border-white/5 rounded-xl flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded-lg bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a] text-xs font-mono font-bold shrink-0">
                        STEP {s.step}
                      </span>
                      <div>
                        <strong className="text-white text-xs font-mono block">{s.title}</strong>
                        <p className="text-zinc-400 text-xs font-sans mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <div className="p-3 sm:p-4 border-t border-[#c5a059]/30 bg-[#07080c] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-400">
            <Sparkles className="h-4 w-4 text-[#c5a059]" />
            <span>PALE ORE • STRATEGIC MATRIX COMPASS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#3a2e12] hover:bg-[#4d3d18] border border-[#c5a059] text-[#fef08a] font-bold transition cursor-pointer"
            >
              Close Guide & Return to Matrix
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
