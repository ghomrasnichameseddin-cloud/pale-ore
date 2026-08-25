import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { QuestDifficulty, QuestType, CampaignHealth } from '../../types';
import { 
  X, Check, Plus, Swords, Briefcase, FlaskConical, 
  BookOpen, FolderOpen, Target, Calendar, Clock, AlertTriangle, Sparkles
} from 'lucide-react';
import { RubElHizbIcon } from '../IslamicRpgDecorations';

export type ActionSpawnType = 'quest' | 'campaign' | 'experiment' | 'sop' | 'codex';

interface UniversalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ActionSpawnType;
  initialTitle?: string;
  initialDescription?: string;
  sourceToolName?: string;
}

export const UniversalActionModal: React.FC<UniversalActionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'quest',
  initialTitle = '',
  initialDescription = '',
  sourceToolName = 'Thinking Lab'
}) => {
  const { 
    state, addQuest, addProject, addPlanningDocument, systemDate 
  } = usePOS();

  const [actionType, setActionType] = useState<ActionSpawnType>(defaultType);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  
  // Quest options
  const [questDifficulty, setQuestDifficulty] = useState<QuestDifficulty>('Normal');
  const [questType, setQuestType] = useState<QuestType>('Main');
  const [questTime, setQuestTime] = useState<number>(45);
  const [questDeadline, setQuestDeadline] = useState(systemDate || new Date().toISOString().split('T')[0]);
  const [questEnergy, setQuestEnergy] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(state.goals[0]?.id || '');
  const [selectedProjId, setSelectedProjId] = useState<string>(state.projects[0]?.id || '');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // Campaign options
  const [campaignGoalId, setCampaignGoalId] = useState<string>(state.goals[0]?.id || '');
  const [timeBudget, setTimeBudget] = useState<string>('20 hours');
  const [campaignHealth, setCampaignHealth] = useState<CampaignHealth>('Healthy');
  const [campaignDeliverables, setCampaignDeliverables] = useState<string>('');

  // Codex / SOP / Experiment options
  const [codexFolder, setCodexFolder] = useState<string>('05 SOPs');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync initial props when opened
  React.useEffect(() => {
    if (isOpen) {
      setActionType(defaultType);
      setTitle(initialTitle);
      setDescription(initialDescription);
      setSuccessMessage(null);
      if (defaultType === 'experiment') setCodexFolder('07 Experiments');
      else if (defaultType === 'sop') setCodexFolder('05 SOPs');
      else if (defaultType === 'codex') setCodexFolder('01 Strategies');
    }
  }, [isOpen, defaultType, initialTitle, initialDescription]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (actionType === 'quest') {
      const qXp = questDifficulty === 'Easy' ? 25 : questDifficulty === 'Normal' ? 50 : questDifficulty === 'Hard' ? 100 : 250;
      addQuest({
        name: title.trim(),
        description: description.trim() || `Generated from ${sourceToolName}`,
        difficulty: questDifficulty,
        type: questType,
        estimatedTime: questTime,
        xp: qXp,
        goalId: selectedGoalId || null,
        projectId: selectedProjId || null,
        milestoneId: null,
        relatedSkills: selectedSkillIds,
        energyLevel: questEnergy,
        deadline: questDeadline || null,
        recurrence: 'None',
        status: 'Active',
        completedAt: null,
        subquests: []
      });
      setSuccessMessage(`Directive "${title}" successfully dispatched to terminal!`);
    } else if (actionType === 'campaign') {
      const deliverablesList = campaignDeliverables.split('\n').map(d => d.trim()).filter(Boolean);
      addProject({
        name: title.trim(),
        description: description.trim() || `Strategic campaign born from ${sourceToolName}`,
        goalId: campaignGoalId,
        estimatedTime: timeBudget,
        status: 'Active',
        campaignHealth,
        deliverables: deliverablesList
      });
      setSuccessMessage(`Campaign "${title}" officially chartered!`);
    } else {
      // Codex / SOP / Experiment document creation
      const targetFolder = actionType === 'experiment' 
        ? '07 Experiments' 
        : actionType === 'sop' 
        ? '05 SOPs' 
        : codexFolder;

      const fileName = title.endsWith('.md') ? title : `${title}.md`;
      const docPath = `${targetFolder}/${fileName}`;
      const docContent = `# 📜 ${title}\n\n**Origin**: ${sourceToolName}\n**Date**: ${new Date().toLocaleDateString()}\n\n## 1. Overview\n${description || 'Document created from Strategic Thinking Lab.'}\n\n## 2. Execution Directives\n- Initial baseline parameters logged.\n- Continuous measurement and review protocol enabled.`;

      addPlanningDocument(docPath, fileName, docContent);
      setSuccessMessage(`Codex document "${fileName}" inscribed in ${targetFolder}!`);
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="universal-action-spawner-modal">
      <div className="bg-[#0b0d13] border border-[#c5a059]/40 rounded-2xl w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-[#c5a059]/20 bg-[#07080c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
            <div>
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                TRANSLATE INSIGHT ➔ OPERATIONAL ACTION
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Source: <span className="text-[#e5c875] font-bold">{sourceToolName}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Type Selector */}
        <div className="p-3 bg-[#0e121d] border-b border-white/5 grid grid-cols-4 gap-1.5 font-mono text-xs">
          {[
            { id: 'quest' as const, label: 'Quest', icon: Swords, color: 'text-amber-400 border-amber-500/40' },
            { id: 'campaign' as const, label: 'Campaign', icon: Briefcase, color: 'text-cyan-400 border-cyan-500/40' },
            { id: 'experiment' as const, label: 'Experiment', icon: FlaskConical, color: 'text-emerald-400 border-emerald-500/40' },
            { id: 'sop' as const, label: 'SOP / Codex', icon: FolderOpen, color: 'text-purple-400 border-purple-500/40' },
          ].map(t => {
            const Icon = t.icon;
            const isSelected = actionType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActionType(t.id)}
                className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 font-bold transition border cursor-pointer ${
                  isSelected 
                    ? `bg-[#141824] ${t.color} text-white shadow-lg` 
                    : 'bg-[#07080c] border-white/5 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 font-sans text-xs">
          
          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-xs flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              {actionType === 'quest' ? 'Directive / Quest Name *' : actionType === 'campaign' ? 'Campaign Title *' : 'Document Title *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Cache Validation Layer..."
              className="w-full bg-[#07080c] border border-white/15 focus:border-[#c5a059] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Description & Context
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the operational context, problem solved, or outcome..."
              className="w-full bg-[#07080c] border border-white/15 focus:border-[#c5a059] rounded-xl p-3 text-zinc-200 font-mono text-xs focus:outline-none resize-none"
            />
          </div>

          {/* QUEST CUSTOMIZATION */}
          {actionType === 'quest' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">DIFFICULTY</label>
                  <select
                    value={questDifficulty}
                    onChange={(e) => setQuestDifficulty(e.target.value as any)}
                    className="w-full bg-[#07080c] border border-white/15 rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  >
                    <option value="Easy">Easy (25 XP)</option>
                    <option value="Normal">Normal (50 XP)</option>
                    <option value="Hard">Hard (100 XP)</option>
                    <option value="Boss">Boss (250 XP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">TIME (MIN)</label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={questTime}
                    onChange={(e) => setQuestTime(Number(e.target.value))}
                    className="w-full bg-[#07080c] border border-white/15 rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">ENERGY</label>
                  <select
                    value={questEnergy}
                    onChange={(e) => setQuestEnergy(e.target.value as any)}
                    className="w-full bg-[#07080c] border border-white/15 rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Deep Focus)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">ASSIGN TO GRAND DESTINY</label>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="w-full bg-[#07080c] border border-white/15 rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  >
                    <option value="">-- No Destiny --</option>
                    {state.goals.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">ASSIGN TO CAMPAIGN</label>
                  <select
                    value={selectedProjId}
                    onChange={(e) => setSelectedProjId(e.target.value)}
                    className="w-full bg-[#07080c] border border-white/15 rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  >
                    <option value="">-- No Campaign --</option>
                    {state.projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* CAMPAIGN CUSTOMIZATION */}
          {actionType === 'campaign' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">PARENT DESTINY *</label>
                  <select
                    required
                    value={campaignGoalId}
                    onChange={(e) => setCampaignGoalId(e.target.value)}
                    className="w-full bg-[#07080c] border border-white/15 rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  >
                    {state.goals.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">TIME BUDGET</label>
                  <input
                    type="text"
                    value={timeBudget}
                    onChange={(e) => setTimeBudget(e.target.value)}
                    placeholder="e.g. 25 hours"
                    className="w-full bg-[#07080c] border border-white/15 rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-1">CAMPAIGN DELIVERABLES (ONE PER LINE)</label>
                <textarea
                  rows={2}
                  value={campaignDeliverables}
                  onChange={(e) => setCampaignDeliverables(e.target.value)}
                  placeholder="Deliverable 1: Design RFC approved&#10;Deliverable 2: Prototype deployed"
                  className="w-full bg-[#07080c] border border-white/15 rounded-lg p-2 text-white font-mono text-[11px] resize-none"
                />
              </div>
            </div>
          )}

          {/* CODEX VAULT SELECTION */}
          {actionType === 'sop' && (
            <div className="pt-2 border-t border-white/5">
              <label className="block text-[10px] font-mono text-zinc-400 mb-1">TARGET CODEX VAULT</label>
              <select
                value={codexFolder}
                onChange={(e) => setCodexFolder(e.target.value)}
                className="w-full bg-[#07080c] border border-white/15 rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
              >
                <option value="00 Vision">00 Vision</option>
                <option value="01 Strategies">01 Strategies</option>
                <option value="02 Master Plans">02 Master Plans</option>
                <option value="03 Tactical Playbooks">03 Tactical Playbooks</option>
                <option value="04 Operations">04 Operations</option>
                <option value="05 SOPs">05 SOPs</option>
                <option value="06 Frameworks">06 Frameworks</option>
                <option value="07 Experiments">07 Experiments</option>
                <option value="08 Lessons Learned">08 Lessons Learned</option>
                <option value="09 Reviews & Archive">09 Reviews & Archive</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white font-mono text-xs hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#9a7b38] text-black font-mono font-bold text-xs hover:brightness-110 shadow-lg flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-black" />
              CREATE {actionType.toUpperCase()}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
