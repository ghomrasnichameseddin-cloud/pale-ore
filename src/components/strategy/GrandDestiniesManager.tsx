import React, { useState, useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { Goal, GoalPriority, GoalStatus, DestinyHealth, Project } from '../../types';
import { 
  Target, Plus, Edit3, Trash2, CheckCircle2, AlertTriangle, 
  Clock, Award, BookOpen, Layers, ShieldAlert, Sliders,
  HelpCircle, ChevronRight, RefreshCw, X, ArrowRight, Activity
} from 'lucide-react';
import { ArabesqueCorner } from '../IslamicRpgDecorations';
import { parseDateSafe, getDaysDifference } from '../../utils/dateUtils';

interface GrandDestiniesManagerProps {
  onNavigateToCampaign?: (campaignId: string) => void;
  onNavigateToCodex?: (docId: string) => void;
}

export const GrandDestiniesManager: React.FC<GrandDestiniesManagerProps> = ({
  onNavigateToCampaign,
  onNavigateToCodex
}) => {
  const { state, addGoal, updateGoal, deleteGoal, getGoalProgress, addSystemMessage } = usePOS();
  
  const [selectedHorizon, setSelectedHorizon] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reviewGoal, setReviewGoal] = useState<Goal | null>(null);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  // Create Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formHorizon, setFormHorizon] = useState<'30-Day Sprint' | 'Quarterly (Q1-Q4)' | 'Annual Vision' | 'Life Vision'>('Quarterly (Q1-Q4)');
  const [formPriority, setFormPriority] = useState<GoalPriority>('High');
  const [formWeight, setFormWeight] = useState(70);
  const [formConfidence, setFormConfidence] = useState(80);
  const [formDeadline, setFormDeadline] = useState('');

  // Review Modal State
  const [reviewSummary, setReviewSummary] = useState('');
  const [reviewFriction, setReviewFriction] = useState('');
  const [reviewVerdict, setReviewVerdict] = useState<'CONTINUE' | 'MODIFY' | 'PAUSE' | 'ABANDON' | 'CODIFY'>('CONTINUE');
  const [reviewNewHealth, setReviewNewHealth] = useState<DestinyHealth>('On Track');

  const filteredGoals = useMemo(() => {
    return state.goals.filter(goal => {
      if (selectedHorizon === 'All') return true;
      const h = (goal.horizon || '').toLowerCase();
      if (selectedHorizon === '30-Day') return h.includes('30-day');
      if (selectedHorizon === 'Quarterly') return h.includes('quarter');
      if (selectedHorizon === 'Annual') return h.includes('annual');
      if (selectedHorizon === 'Lifetime') return h.includes('life');
      return true;
    });
  }, [state.goals, selectedHorizon]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    addGoal({
      name: formName.trim(),
      description: formDescription.trim(),
      horizon: formHorizon,
      priority: formPriority,
      strategicWeight: formWeight,
      confidence: formConfidence,
      health: 'On Track',
      destinyHealth: 'On Track',
      deadline: formDeadline || undefined,
      estimatedCompletion: formDeadline || 'Flexible',
      status: 'Active',
      subGoals: [],
      relatedSkills: []
    });

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'log',
      title: 'Grand Destiny Inscribed',
      content: `Grand Destiny inscribed: "${formName.trim()}" in ${formHorizon}.`,
      priority: 'medium'
    });
    setIsCreateModalOpen(false);
    setFormName('');
    setFormDescription('');
    setFormDeadline('');
  };

  const openReviewModal = (goal: Goal) => {
    setReviewGoal(goal);
    setReviewSummary('');
    setReviewFriction('');
    setReviewVerdict('CONTINUE');
    setReviewNewHealth(goal.health || goal.destinyHealth || 'On Track');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewGoal) return;

    let newStatus: GoalStatus = reviewGoal.status;
    if (reviewVerdict === 'PAUSE') newStatus = 'Paused';
    if (reviewVerdict === 'ABANDON') newStatus = 'Archived';
    if (reviewVerdict === 'CODIFY') newStatus = 'Completed';

    updateGoal(reviewGoal.id, {
      health: reviewNewHealth,
      destinyHealth: reviewNewHealth,
      status: newStatus
    });

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'log',
      title: 'Strategic Review Executed',
      content: `Strategic Review executed for "${reviewGoal.name}". Verdict: ${reviewVerdict}. Health set to ${reviewNewHealth}.`,
      priority: 'medium'
    });

    setReviewGoal(null);
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border-[#c5a059]/30 bg-[#07080c]/90">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#c5a059]" />
            <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
              GRAND DESTINIES ARCHITECTURE
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold">
              {state.goals.length} ACTIVE
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            Answers: "WHERE AM I GOING?" • Multi-horizon North Stars governed by strategic weights & confidence ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Horizon Pills */}
          <div className="flex items-center gap-1 text-xs font-mono bg-[#0b0d13] p-1 rounded-xl border border-white/10">
            {['All', 'Lifetime', 'Annual', 'Quarterly', '30-Day'].map(horizon => (
              <button
                key={horizon}
                onClick={() => setSelectedHorizon(horizon)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  selectedHorizon === horizon
                    ? 'bg-[#c5a059] text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {horizon}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-[#c5a059] hover:bg-[#b08d48] text-black font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-[#c5a059]/20"
          >
            <Plus className="h-4 w-4" /> Inscribe Destiny
          </button>
        </div>
      </div>

      {/* Grid of Destinies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.length === 0 ? (
          <div className="col-span-2 text-center py-12 glass-panel rounded-2xl border-white/5 text-zinc-500 font-mono text-xs">
            No grand destinies found for this horizon filter. Inscribe a new destination above.
          </div>
        ) : (
          filteredGoals.map(goal => {
            const progress = getGoalProgress(goal.id);
            const attachedProjects = state.projects.filter(p => p.goalId === goal.id);
            const blockedProjects = attachedProjects.filter(p => p.campaignHealth === 'Blocked');
            const health = goal.health || goal.destinyHealth || 'On Track';
            const weight = goal.strategicWeight || (goal.priority === 'High' ? 80 : 50);
            const confidence = goal.confidence || 75;

            return (
              <div 
                key={goal.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0b0d13] space-y-4 hover:border-[#c5a059]/40 transition-all shadow-xl relative overflow-hidden flex flex-col justify-between"
              >
                <ArabesqueCorner position="top-right" className="top-2 right-2 h-3.5 w-3.5" color="#c5a059" />

                <div className="space-y-3">
                  {/* Top Bar: Horizon + Health + Priority */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-[#fef08a] border border-[#c5a059]/30">
                      {goal.horizon || 'Strategic Horizon'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        health === 'On Track'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : health === 'At Risk'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : health === 'Dormant'
                          ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}>
                        {health.toUpperCase()}
                      </span>

                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                        {goal.priority || 'Normal'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-sm font-display font-bold text-white leading-tight">
                      {goal.name}
                    </h4>
                    {goal.description && (
                      <p className="text-xs font-mono text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Metrics & Sliders */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded-xl bg-[#07080c] border border-white/5 space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>Strategic Weight</span>
                        <span className="text-[#fef08a] font-bold">{weight}/100</span>
                      </div>
                      <input 
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={weight}
                        onChange={e => updateGoal(goal.id, { strategicWeight: Number(e.target.value) })}
                        className="w-full accent-[#c5a059] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="p-2 rounded-xl bg-[#07080c] border border-white/5 space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>Confidence Rating</span>
                        <span className="text-cyan-300 font-bold">{confidence}%</span>
                      </div>
                      <input 
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={confidence}
                        onChange={e => updateGoal(goal.id, { confidence: Number(e.target.value) })}
                        className="w-full accent-cyan-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>Execution Velocity</span>
                      <span className="text-[#fef08a] font-bold">{progress}% Complete</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#c5a059] h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Attached Campaigns count */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-white/5">
                    <span>
                      {attachedProjects.length} Campaigns attached 
                      {blockedProjects.length > 0 && (
                        <span className="text-rose-400 ml-1 font-bold">({blockedProjects.length} Blocked!)</span>
                      )}
                    </span>
                    {goal.deadline && (
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Clock className="h-3 w-3" /> {goal.deadline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openReviewModal(goal)}
                      className="px-2.5 py-1 rounded-lg bg-[#3a2e12] hover:bg-[#4d3d18] text-[#fef08a] border border-[#c5a059]/40 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Activity className="h-3 w-3" /> Periodic Review
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete Grand Destiny "${goal.name}"? Attached campaigns will be detached.`)) {
                        deleteGoal(goal.id);
                      }
                    }}
                    className="text-zinc-600 hover:text-rose-400 p-1 cursor-pointer"
                    title="Delete Destiny"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Periodic Strategic Review Modal */}
      {reviewGoal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border-[#c5a059]/40 bg-[#0d0f17] max-w-lg w-full p-6 rounded-2xl space-y-4 relative shadow-2xl">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#c5a059]" />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  PERIODIC STRATEGIC REVIEW: "{reviewGoal.name}"
                </h3>
              </div>
              <button 
                onClick={() => setReviewGoal(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Execution & Reality Assessment:</label>
                <textarea
                  value={reviewSummary}
                  onChange={e => setReviewSummary(e.target.value)}
                  placeholder="What did reality teach us about this destiny? Are campaigns producing expected leverage?"
                  rows={3}
                  className="w-full p-2.5 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Identified Friction Points & Blockers:</label>
                <input
                  type="text"
                  value={reviewFriction}
                  onChange={e => setReviewFriction(e.target.value)}
                  placeholder="Dependencies, cognitive overload, unrealistic timelines..."
                  className="w-full p-2.5 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Updated Health Status:</label>
                  <select
                    value={reviewNewHealth}
                    onChange={e => setReviewNewHealth(e.target.value as DestinyHealth)}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  >
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Off Track">Off Track</option>
                    <option value="Dormant">Dormant</option>
                    <option value="Completed">Completed</option>
                    <option value="Abandoned">Abandoned</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Executive Verdict:</label>
                  <select
                    value={reviewVerdict}
                    onChange={e => setReviewVerdict(e.target.value as any)}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  >
                    <option value="CONTINUE">CONTINUE (Maintain Velocity)</option>
                    <option value="MODIFY">MODIFY (Adjust Scope / Weight)</option>
                    <option value="PAUSE">PAUSE (Halt Pending Upstream)</option>
                    <option value="ABANDON">ABANDON (Prune Initiative)</option>
                    <option value="CODIFY">CODIFY (Promote to Doctrine/SOP)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setReviewGoal(null)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#b08d48] text-black font-bold rounded-lg cursor-pointer"
                >
                  Inscribe Review Verdict
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inscribe Destiny Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border-[#c5a059]/40 bg-[#0d0f17] max-w-lg w-full p-6 rounded-2xl space-y-4 relative shadow-2xl">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#c5a059]" />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  INSCRIBE NEW GRAND DESTINY
                </h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Destiny Name / Desired Outcome:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Master Production AI Systems Architecture"
                  className="w-full p-2.5 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Strategic Horizon:</label>
                  <select
                    value={formHorizon}
                    onChange={e => setFormHorizon(e.target.value as any)}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  >
                    <option value="30-Day Sprint">30-Day Sprint</option>
                    <option value="Quarterly Horizon">Quarterly Horizon</option>
                    <option value="Annual Milestone">Annual Milestone</option>
                    <option value="Lifetime Vision">Lifetime Vision</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Priority Level:</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as GoalPriority)}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Core Description & Why It Matters:</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Provide clarity on why this destination alters the state of your trajectory."
                  rows={2}
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Strategic Weight (1-100):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formWeight}
                    onChange={e => setFormWeight(Number(e.target.value))}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Target Deadline (Optional):</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={e => setFormDeadline(e.target.value)}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#b08d48] text-black font-bold rounded-lg cursor-pointer"
                >
                  Inscribe Destiny
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
