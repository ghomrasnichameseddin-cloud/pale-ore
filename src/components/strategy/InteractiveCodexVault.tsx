import React, { useState, useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { PlanningDocument, Goal, Project } from '../../types';
import { 
  FileText, Plus, BookOpen, CheckCircle, ArrowRight, 
  ExternalLink, Edit3, Trash2, Save, Sparkles, FolderOpen,
  Compass, Briefcase, Target, ShieldCheck, ChevronDown, ChevronRight,
  Layers, Check, Copy, Flame
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';
import { getLocalDateString } from '../../utils/dateUtils';

interface InteractiveCodexVaultProps {
  onNavigateToGoal?: (goalId: string) => void;
  onNavigateToCampaign?: (campaignId: string) => void;
}

type TemplateType = 'pr_faq' | 'quarterly_sprint' | 'annual_vision' | 'sop_checklist';

export const InteractiveCodexVault: React.FC<InteractiveCodexVaultProps> = ({
  onNavigateToGoal,
  onNavigateToCampaign
}) => {
  const { 
    state, 
    addPlanningDocument, 
    updatePlanningDocument, 
    deletePlanningDocument,
    addGoal,
    addProject 
  } = usePOS();

  // Active Template Mode vs Document Reader Mode
  const [activeTemplate, setActiveTemplate] = useState<TemplateType | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Template 1: PR/FAQ Form State
  const [prfaqHeadline, setPrfaqHeadline] = useState('');
  const [prfaqFutureDate, setPrfaqFutureDate] = useState('2026-12-31');
  const [prfaqQuote, setPrfaqQuote] = useState('');
  const [prfaqProblem, setPrfaqProblem] = useState('');
  const [prfaqSolution, setPrfaqSolution] = useState('');
  const [prfaqMilestone1, setPrfaqMilestone1] = useState('');
  const [prfaqMilestone2, setPrfaqMilestone2] = useState('');
  const [prfaqMilestone3, setPrfaqMilestone3] = useState('');

  // Template 2: Quarterly Sprint Calibration
  const [sprintQuarter, setSprintQuarter] = useState('Q4 2026');
  const [sprintNorthStar, setSprintNorthStar] = useState('');
  const [sprintCampaign1, setSprintCampaign1] = useState('');
  const [sprintCampaign2, setSprintCampaign2] = useState('');
  const [sprintCampaign3, setSprintCampaign3] = useState('');
  const [sprintNonNegotiables, setSprintNonNegotiables] = useState('');

  // Template 3: Annual Vision Architect
  const [visionTitle, setVisionTitle] = useState('2027 Grand Vision');
  const [visionCoreOutcome, setVisionCoreOutcome] = useState('');
  const [visionBet1, setVisionBet1] = useState('');
  const [visionBet2, setVisionBet2] = useState('');
  const [visionAntiGoals, setVisionAntiGoals] = useState('');

  // Template 4: Operating SOP Builder
  const [sopTitle, setSopTitle] = useState('');
  const [sopTrigger, setSopTrigger] = useState('');
  const [sopStep1, setSopStep1] = useState('');
  const [sopStep2, setSopStep2] = useState('');
  const [sopStep3, setSopStep3] = useState('');
  const [sopQualityStandard, setSopQualityStandard] = useState('');

  // Historical Governance Drawer State
  const [isGovernanceDrawerOpen, setIsGovernanceDrawerOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter planning documents
  const filteredDocs = useMemo(() => {
    return state.planningDocuments.filter(doc => {
      if (!searchDocQuery.trim()) return true;
      const q = searchDocQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.path.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q)
      );
    });
  }, [state.planningDocuments, searchDocQuery]);

  const selectedDoc = selectedDocId 
    ? state.planningDocuments.find(d => d.id === selectedDocId) 
    : filteredDocs[0] || null;

  // Publish Template 1: PR/FAQ to Campaign & Milestones
  const handlePublishPRFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prfaqHeadline.trim()) return;

    // 1. Generate Markdown content
    const markdown = `# PR/FAQ: ${prfaqHeadline}
**Target Release Date:** ${prfaqFutureDate}

## 1. Press Release Summary
${prfaqSolution}

## 2. Customer / Future Self Testimonial
> "${prfaqQuote}"

## 3. The Core Friction Vector Solved
${prfaqProblem}

## 4. Operational Key Milestones
1. ${prfaqMilestone1 || 'Architecture & Proof of Concept'}
2. ${prfaqMilestone2 || 'Core Deliverable Integration'}
3. ${prfaqMilestone3 || 'Production Launch & Verification'}
`;

    // 2. Inscribe to Planning Documents
    const docId = addPlanningDocument(
      `04 Operations/PRFAQ - ${prfaqHeadline.slice(0, 30)}.md`,
      `PRFAQ - ${prfaqHeadline.slice(0, 30)}.md`,
      markdown
    );

    // 3. Directly Publish to Real Campaign (Project)
    addProject({
      goalId: state.goals[0]?.id || '',
      name: prfaqHeadline,
      description: prfaqSolution,
      status: 'Active',
      campaignHealth: 'Healthy',
      priority: 'High',
      startDate: getLocalDateString(),
      estimatedTime: '60h',
      subProjects: [],
      risks: []
    });

    showToast('PR/FAQ codified to Codex & Operational Campaign published!');
    setActiveTemplate(null);
  };

  // Publish Template 2: Quarterly Sprint Calibration
  const handlePublishQuarterlySprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintNorthStar.trim()) return;

    const markdown = `# Sprint Calibration: ${sprintQuarter}
**Quarterly North Star:** ${sprintNorthStar}

## Focus Campaigns
- ${sprintCampaign1 || 'Primary Campaign'}
- ${sprintCampaign2 || 'Secondary Campaign'}
- ${sprintCampaign3 || 'Tertiary Campaign'}

## Non-Negotiable Operating Standards
${sprintNonNegotiables}
`;

    addPlanningDocument(
      `02 Quarterly Reviews/${sprintQuarter} Calibration.md`,
      `${sprintQuarter} Calibration.md`,
      markdown
    );

    // Also scaffold as an Annual / Quarterly Goal
    addGoal({
      name: `${sprintQuarter}: ${sprintNorthStar}`,
      description: `Quarterly sprint commitment for ${sprintQuarter}.`,
      status: 'Active',
      priority: 'High',
      horizon: 'Quarterly',
      relatedSkills: [],
      relevantAttributes: [],
      estimatedCompletion: '2026-12-31',
      subGoals: [
        sprintCampaign1 ? { id: `sg-1-${Date.now()}`, name: sprintCampaign1, completed: false } : null,
        sprintCampaign2 ? { id: `sg-2-${Date.now()}`, name: sprintCampaign2, completed: false } : null,
        sprintCampaign3 ? { id: `sg-3-${Date.now()}`, name: sprintCampaign3, completed: false } : null
      ].filter(Boolean) as any[]
    });

    showToast('Sprint calibration published into Strategic Roadmap!');
    setActiveTemplate(null);
  };

  // Publish Template 3: Annual Vision Architect
  const handlePublishAnnualVision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visionCoreOutcome.trim()) return;

    const markdown = `# ${visionTitle}
## Core Ultimate Reality
${visionCoreOutcome}

## Strategic Bets
1. ${visionBet1}
2. ${visionBet2}

## Anti-Goals (What We Will NOT Do)
${visionAntiGoals}
`;

    addPlanningDocument(
      `00 Vision/${visionTitle}.md`,
      `${visionTitle}.md`,
      markdown
    );

    addGoal({
      name: visionTitle,
      description: visionCoreOutcome,
      desiredOutcome: visionCoreOutcome,
      status: 'Active',
      priority: 'High',
      horizon: 'Annual Vision',
      relatedSkills: [],
      relevantAttributes: [],
      estimatedCompletion: '2027-12-31',
      subGoals: [
        visionBet1 ? { id: `sg-1-${Date.now()}`, name: visionBet1, completed: false } : null,
        visionBet2 ? { id: `sg-2-${Date.now()}`, name: visionBet2, completed: false } : null
      ].filter(Boolean) as any[]
    });

    showToast('Annual Vision codified into Grand Destinies!');
    setActiveTemplate(null);
  };

  // Publish Template 4: Operating SOP
  const handlePublishSOP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sopTitle.trim()) return;

    const markdown = `# SOP: ${sopTitle}
**Trigger Condition:** ${sopTrigger}

## Step-by-Step Protocol
1. ${sopStep1}
2. ${sopStep2}
3. ${sopStep3}

## Quality Standard & Invariants
${sopQualityStandard}
`;

    addPlanningDocument(
      `05 SOPs/${sopTitle}.md`,
      `${sopTitle}.md`,
      markdown
    );

    showToast('Standard Operating Procedure inscribed into Codex!');
    setActiveTemplate(null);
  };

  return (
    <div className="space-y-6">
      
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#101422] border border-[#c5a059] text-[#fef08a] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#e5c875]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-[#080b14]/95 border border-[#c5a059]/30 rounded-xl p-5 relative overflow-hidden shadow-2xl">
        <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#e5c875]" />
              INTERACTIVE PLANNING CODEX &amp; SPRINT TEMPLATES
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold">
                DIRECT-TO-STATE PUBLISHING
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              No more static text files: interactive structured master templates that directly scaffold real Grand Destinies, Operational Campaigns, and Sprint Directives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTemplate('pr_faq')}
              className="px-3 py-1.5 bg-[#c5a059] hover:bg-[#d4b068] text-black font-mono font-bold text-xs rounded-lg transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>NEW PR/FAQ</span>
            </button>
            <button
              onClick={() => setActiveTemplate('quarterly_sprint')}
              className="px-3 py-1.5 bg-[#3a2e12] hover:bg-[#4d3d17] border border-[#c5a059] text-[#fef08a] font-mono font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Target className="h-3.5 w-3.5 text-[#e5c875]" />
              <span>SPRINT CALIBRATION</span>
            </button>
          </div>
        </div>
      </div>

      {/* TEMPLATE PICKER CARDS (When no modal/template is active) */}
      {!activeTemplate && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setActiveTemplate('pr_faq')}
            className="bg-[#05070d] hover:bg-[#0b0e1a] border border-white/10 hover:border-purple-500/50 p-4 rounded-xl cursor-pointer transition space-y-2 shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-mono text-purple-400 uppercase font-bold">CAMPAIGN FORGE</span>
            </div>
            <h4 className="font-display text-xs font-bold text-white uppercase group-hover:text-purple-300">
              Amazon Working Backwards PR/FAQ
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans line-clamp-2">
              Write the internal press release and publish directly to an active operational campaign.
            </p>
          </div>

          <div 
            onClick={() => setActiveTemplate('quarterly_sprint')}
            className="bg-[#05070d] hover:bg-[#0b0e1a] border border-white/10 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition space-y-2 shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                <Target className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">90-DAY CALIBRATION</span>
            </div>
            <h4 className="font-display text-xs font-bold text-white uppercase group-hover:text-emerald-300">
              Quarterly Sprint Calibration
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans line-clamp-2">
              Calibrate the next 90 days with primary key results and non-negotiables.
            </p>
          </div>

          <div 
            onClick={() => setActiveTemplate('annual_vision')}
            className="bg-[#05070d] hover:bg-[#0b0e1a] border border-white/10 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition space-y-2 shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
                <Compass className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-mono text-amber-400 uppercase font-bold">DESTINY BLUEPRINT</span>
            </div>
            <h4 className="font-display text-xs font-bold text-white uppercase group-hover:text-amber-300">
              Annual Vision &amp; Anti-Goals
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans line-clamp-2">
              Define the year's big bets and anti-goals to publish into Grand Destinies.
            </p>
          </div>

          <div 
            onClick={() => setActiveTemplate('sop_checklist')}
            className="bg-[#05070d] hover:bg-[#0b0e1a] border border-white/10 hover:border-cyan-500/50 p-4 rounded-xl cursor-pointer transition space-y-2 shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold">EXECUTION SOP</span>
            </div>
            <h4 className="font-display text-xs font-bold text-white uppercase group-hover:text-cyan-300">
              Standard Operating Procedure
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans line-clamp-2">
              Codify repeatable checklists and recovery protocols into 05 SOPs.
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE TEMPLATE FORMS */}
      {activeTemplate === 'pr_faq' && (
        <div className="bg-[#080b14] border border-purple-500/40 rounded-xl p-5 space-y-4 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="font-display text-sm font-bold text-purple-300 uppercase flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> AMAZON WORKING BACKWARDS: PR/FAQ GENERATOR
            </h4>
            <button 
              onClick={() => setActiveTemplate(null)}
              className="text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
            >
              CLOSE
            </button>
          </div>

          <form onSubmit={handlePublishPRFAQ} className="space-y-3 font-sans text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="text-zinc-300 font-mono block mb-1">PRESS RELEASE HEADLINE (CAMPAIGN TITLE)</label>
                <input 
                  type="text"
                  required
                  value={prfaqHeadline}
                  onChange={(e) => setPrfaqHeadline(e.target.value)}
                  placeholder="e.g. Pale Ore OS Launches Autonomous Arabic Morphology Engine"
                  className="w-full bg-[#05070d] border border-purple-500/30 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-mono block mb-1">TARGET RELEASE DATE</label>
                <input 
                  type="date"
                  value={prfaqFutureDate}
                  onChange={(e) => setPrfaqFutureDate(e.target.value)}
                  className="w-full bg-[#05070d] border border-purple-500/30 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-300 font-mono block mb-1">FUTURE CUSTOMER / OPERATOR QUOTE</label>
              <input 
                type="text"
                value={prfaqQuote}
                onChange={(e) => setPrfaqQuote(e.target.value)}
                placeholder="e.g. 'This engine reduced my translation friction by 80% while retaining precise nuance.'"
                className="w-full bg-[#05070d] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-300 font-mono block mb-1">CORE FRICTION SOLVED (THE PROBLEM)</label>
                <textarea 
                  rows={2}
                  value={prfaqProblem}
                  onChange={(e) => setPrfaqProblem(e.target.value)}
                  placeholder="What painful friction currently exists?"
                  className="w-full bg-[#05070d] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-mono block mb-1">THE DELIVERED SOLUTION</label>
                <textarea 
                  rows={2}
                  value={prfaqSolution}
                  onChange={(e) => setPrfaqSolution(e.target.value)}
                  placeholder="How does this campaign cleanly resolve the problem?"
                  className="w-full bg-[#05070d] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-300 font-mono block mb-1">3 SEQUENTIAL KEY DELIVERABLES (WILL BE PUBLISHED AS MILESTONES)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input 
                  type="text"
                  value={prfaqMilestone1}
                  onChange={(e) => setPrfaqMilestone1(e.target.value)}
                  placeholder="Milestone 1: Proof of concept"
                  className="bg-[#05070d] border border-white/10 rounded-lg p-1.5 text-white"
                />
                <input 
                  type="text"
                  value={prfaqMilestone2}
                  onChange={(e) => setPrfaqMilestone2(e.target.value)}
                  placeholder="Milestone 2: Functional prototype"
                  className="bg-[#05070d] border border-white/10 rounded-lg p-1.5 text-white"
                />
                <input 
                  type="text"
                  value={prfaqMilestone3}
                  onChange={(e) => setPrfaqMilestone3(e.target.value)}
                  placeholder="Milestone 3: Production launch"
                  className="bg-[#05070d] border border-white/10 rounded-lg p-1.5 text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveTemplate(null)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg font-mono text-xs cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold rounded-lg text-xs cursor-pointer shadow-md"
              >
                PUBLISH CAMPAIGN &amp; CODIFY DOC
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CODEX DOCUMENTS REPOSITORY & LIVE VIEWER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT 1 COL: DOCUMENTS LIST */}
        <div className="bg-[#080b14]/90 border border-white/10 rounded-xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4 text-[#c5a059]" />
              CODEX MANUSCRIPTS ({filteredDocs.length})
            </span>
          </div>

          <input 
            type="text"
            value={searchDocQuery}
            onChange={(e) => setSearchDocQuery(e.target.value)}
            placeholder="Search planning scrolls..."
            className="w-full bg-[#05070d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#c5a059]"
          />

          <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
            {filteredDocs.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                    isSelected 
                      ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] font-bold shadow-sm' 
                      : 'bg-[#05070d] hover:bg-white/5 border-white/5 text-zinc-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-mono text-[10px] text-zinc-400 block truncate">
                      {doc.path}
                    </span>
                    <span className="font-sans truncate text-xs block">
                      {doc.name}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 2 COLS: DOCUMENT PREVIEW */}
        <div className="lg:col-span-2 bg-[#080b14]/90 border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
          {selectedDoc ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#c5a059] uppercase block font-bold">
                    {selectedDoc.path}
                  </span>
                  <h4 className="font-display text-sm font-bold text-white uppercase mt-0.5">
                    {selectedDoc.name}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedDoc.content);
                      showToast('Document markdown copied to clipboard.');
                    }}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded transition cursor-pointer"
                    title="Copy Markdown"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Rendered Document Prose */}
              <div className="bg-[#05070d] p-4 rounded-xl border border-white/5 text-xs text-zinc-300 font-sans leading-relaxed max-h-[500px] overflow-y-auto space-y-3 prose prose-invert prose-sm">
                <pre className="font-sans whitespace-pre-wrap leading-relaxed text-zinc-300">
                  {selectedDoc.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-zinc-500 font-mono text-xs">
              <FileText className="h-8 w-8 text-[#c5a059]/40 mx-auto mb-2" />
              <p>Select any planning manuscript to read its operational framework.</p>
            </div>
          )}
        </div>

      </div>

      {/* ARCHIVED GOVERNANCE DRAWER (Doctrines, Decisions, Experiments Preservation) */}
      <div className="border border-white/10 rounded-xl bg-[#080b14]/60 overflow-hidden">
        <button
          onClick={() => setIsGovernanceDrawerOpen(!isGovernanceDrawerOpen)}
          className="w-full p-3.5 flex items-center justify-between text-left text-xs font-mono text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#c5a059]" />
            <span>ARCHIVED GOVERNANCE &amp; DECISION VAULT (HISTORICAL LOGS)</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] opacity-70">
              {state.doctrines?.length || 0} Doctrines · {state.strategicDecisions?.length || 0} Decisions
            </span>
            {isGovernanceDrawerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </button>

        {isGovernanceDrawerOpen && (
          <div className="p-4 border-t border-white/10 space-y-4 bg-[#05070d]">
            <p className="text-[11px] text-zinc-400 font-sans">
              Historical strategic rules and decision records remain preserved here for archival reference.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Doctrines summary */}
              <div className="space-y-1.5 bg-[#080b14] p-3 rounded-lg border border-white/5">
                <span className="text-[10px] font-mono text-amber-300 font-bold block">
                  ACTIVE OPERATING DOCTRINES ({state.doctrines?.length || 0})
                </span>
                {(state.doctrines || []).slice(0, 3).map(doc => (
                  <div key={doc.id} className="text-xs text-zinc-300 truncate">
                    · {doc.name || doc.rule}
                  </div>
                ))}
              </div>

              {/* Decisions summary */}
              <div className="space-y-1.5 bg-[#080b14] p-3 rounded-lg border border-white/5">
                <span className="text-[10px] font-mono text-cyan-300 font-bold block">
                  STRATEGIC DECISION RECORDS ({state.strategicDecisions?.length || 0})
                </span>
                {(state.strategicDecisions || []).slice(0, 3).map(dec => (
                  <div key={dec.id} className="text-xs text-zinc-300 truncate">
                    · {dec.problem || dec.decision}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
