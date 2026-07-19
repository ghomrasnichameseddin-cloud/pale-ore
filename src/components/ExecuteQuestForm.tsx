import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import { QuestDifficulty, QuestType, QuestRecurrence } from '../types';
import { Plus } from 'lucide-react';

export const ExecuteQuestForm: React.FC = () => {
  const { state, addQuest, systemDate, selectedListId } = usePOS();

  const [newQuestName, setNewQuestName] = useState('');
  const [newQuestType, setNewQuestType] = useState<QuestType>('Main');
  const [newQuestDiff, setNewQuestDiff] = useState<QuestDifficulty>('Normal');
  const [newQuestGoal, setNewQuestGoal] = useState<string>('');
  const [newQuestListId, setNewQuestListId] = useState<string>('');
  const [newQuestSkills, setNewQuestSkills] = useState<string[]>([]);
  const [newQuestDuration, setNewQuestDuration] = useState<number>(30);
  const [newQuestRecurrence, setNewQuestRecurrence] = useState<QuestRecurrence | 'Custom'>('None');
  const [newQuestImportant, setNewQuestImportant] = useState(false);
  const [newQuestIsPenalty, setNewQuestIsPenalty] = useState(false);
  const [newQuestDescription, setNewQuestDescription] = useState('');
  const [newQuestEnergy, setNewQuestEnergy] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newQuestDeadline, setNewQuestDeadline] = useState('');

  useEffect(() => {
    if (selectedListId) {
      setNewQuestListId(selectedListId);
    } else {
      setNewQuestListId('');
    }
  }, [selectedListId]);

  // Custom recurrence creation states
  const [customRecurrenceType, setCustomRecurrenceType] = useState<'days' | 'weekdays' | 'text'>('days');
  const [customRecurrenceDays, setCustomRecurrenceDays] = useState<number>(3);
  const [customRecurrenceWeekdays, setCustomRecurrenceWeekdays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [customRecurrenceText, setCustomRecurrenceText] = useState<string>('Every month');

  // Toggle skills selection for new quest
  const handleSkillToggle = (skillId: string) => {
    setNewQuestSkills(prev => 
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestName.trim()) return;

    // Estimate XP based on Difficulty
    let xp = 80;
    if (newQuestDiff === 'Easy') xp = 50;
    else if (newQuestDiff === 'Normal') xp = 100;
    else if (newQuestDiff === 'Hard') xp = 200;
    else if (newQuestDiff === 'Boss') xp = 500;

    const autoImportant = newQuestType === 'Main' || newQuestType === 'Boss' || newQuestDiff === 'Hard' || newQuestDiff === 'Boss';
    const isImportant = newQuestImportant || autoImportant;

    // Compile Recurrence
    let finalRecurrence: QuestRecurrence = 'None';
    if (newQuestRecurrence === 'Custom') {
      if (customRecurrenceType === 'days') {
        finalRecurrence = `Custom: Every ${customRecurrenceDays} Days`;
      } else if (customRecurrenceType === 'weekdays') {
        finalRecurrence = `Custom: ${customRecurrenceWeekdays.join(', ')}`;
      } else {
        finalRecurrence = `Custom: ${customRecurrenceText}`;
      }
    } else {
      finalRecurrence = newQuestRecurrence;
    }

    addQuest({
      name: newQuestName,
      description: newQuestDescription.trim() || `Rapidly logged via OS terminal interface.`,
      difficulty: newQuestDiff,
      estimatedTime: newQuestDuration,
      xp,
      goalId: newQuestGoal ? newQuestGoal : null,
      projectId: null,
      milestoneId: null,
      listId: newQuestListId ? newQuestListId : null,
      relatedSkills: newQuestSkills,
      type: newQuestType,
      recurrence: finalRecurrence,
      deadline: newQuestDeadline || systemDate,
      important: isImportant,
      energyLevel: newQuestEnergy,
      isPenalty: newQuestIsPenalty || newQuestType === 'Penalty'
    });

    setNewQuestName('');
    setNewQuestDescription('');
    setNewQuestSkills([]);
    setNewQuestRecurrence('None');
    setNewQuestImportant(false);
    setNewQuestIsPenalty(false);
    setNewQuestEnergy('Medium');
    setNewQuestDeadline('');
  };

  return (
    <div className="glass-panel rounded-lg p-5" id="quick-add-panel">
      <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
        EXECUTE_NEW_QUEST_PROMPT
      </h4>
      
      <form onSubmit={handleQuickAdd} className="space-y-4">
        <div className="flex gap-2 items-start">
          <div className="flex-1 space-y-2">
            <input 
              type="text" 
              placeholder="Enter custom quest title..."
              value={newQuestName}
              onChange={(e) => setNewQuestName(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
              required
            />
            
            <input
              type="text"
              placeholder="Enter optional quest description..."
              value={newQuestDescription}
              onChange={(e) => setNewQuestDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
          
          <button 
            type="submit"
            className="bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 px-4 py-3 rounded text-xs font-mono hover:bg-cyan-900 transition-colors flex items-center gap-1.5 self-stretch justify-center"
          >
            <Plus className="h-3.5 w-3.5" />
            LOG
          </button>
        </div>

        {/* Form Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-10 gap-3 pt-1">
          {/* Energy level selection */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Energy Req</label>
            <select 
              value={newQuestEnergy}
              onChange={(e) => setNewQuestEnergy(e.target.value as any)}
              className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="Low">⚡ Low</option>
              <option value="Medium">⚡⚡ Medium</option>
              <option value="High">⚡⚡⚡ High</option>
            </select>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Quest Category</label>
            <select 
              value={newQuestType}
              onChange={(e) => setNewQuestType(e.target.value as QuestType)}
              className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="Main">Main Quest</option>
              <option value="Side">Side Quest</option>
              <option value="Boss">Boss Quest</option>
              <option value="Recovery">Recovery Quest</option>
              <option value="Penalty">Penalty Quest</option>
              <option value="Habit">Habit Quest</option>
              <option value="Optional">Optional Quest</option>
            </select>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Difficulty</label>
            <select 
              value={newQuestDiff}
              onChange={(e) => setNewQuestDiff(e.target.value as QuestDifficulty)}
              className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="Easy">Easy (50 XP)</option>
              <option value="Normal">Normal (100 XP)</option>
              <option value="Hard">Hard (200 XP)</option>
              <option value="Boss">Boss (500 XP)</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Est. Duration (Min)</label>
            <input 
              type="number"
              min="5"
              max="480"
              value={newQuestDuration}
              onChange={(e) => setNewQuestDuration(Number(e.target.value))}
              className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Recurrence Selection */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Recurrence</label>
            <select 
              value={newQuestRecurrence}
              onChange={(e) => setNewQuestRecurrence(e.target.value as any)}
              className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="None">Once Only</option>
              <option value="Daily">🔁 Daily</option>
              <option value="Every 2 Days">🔁 Every 2 Days</option>
              <option value="Weekly">🔁 Weekly</option>
              <option value="Monthly">🔁 Monthly</option>
              <option value="Custom">⚙️ Custom...</option>
            </select>
          </div>

          {/* Goal assignment */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Assign Goal</label>
            <select 
              value={newQuestGoal}
              onChange={(e) => setNewQuestGoal(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="">No Assigned Goal</option>
              {state.goals.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* List assignment */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Assign List</label>
            <select 
              value={newQuestListId}
              onChange={(e) => setNewQuestListId(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono truncate"
            >
              <option value="">No List</option>
              {(state.folders || []).map(folder => {
                const folderLists = (state.lists || []).filter(l => l.folderId === folder.id);
                if (folderLists.length === 0) return null;
                return (
                  <optgroup key={folder.id} label={`📁 ${folder.name}`}>
                    {folderLists.map(l => (
                      <option key={l.id} value={l.id}>📋 {l.name}</option>
                    ))}
                  </optgroup>
                );
              })}
              {(state.lists || []).filter(l => !l.folderId).length > 0 && (
                <optgroup label="Standalone Lists">
                  {(state.lists || []).filter(l => !l.folderId).map(l => (
                    <option key={l.id} value={l.id}>📋 {l.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Target Date / Deadline */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Target Date</label>
            <input 
              type="date"
              value={newQuestDeadline || systemDate}
              onChange={(e) => setNewQuestDeadline(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Critical Directive Toggle */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Critical</label>
            <button
              type="button"
              onClick={() => setNewQuestImportant(!newQuestImportant)}
              className={`w-full bg-zinc-950 border rounded p-1 text-xs font-mono transition-all duration-200 flex items-center justify-center gap-1 ${
                newQuestImportant 
                  ? 'border-rose-500/50 text-rose-400 bg-rose-950/20' 
                  : 'border-white/10 text-zinc-500 hover:border-white/20'
              }`}
            >
              {newQuestImportant ? '⚠️ YES' : 'NO'}
            </button>
          </div>

          {/* Penalty Quest Toggle */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Penalty</label>
            <button
              type="button"
              onClick={() => setNewQuestIsPenalty(!newQuestIsPenalty)}
              className={`w-full bg-zinc-950 border rounded p-1 text-xs font-mono transition-all duration-200 flex items-center justify-center gap-1 ${
                newQuestIsPenalty 
                  ? 'border-amber-500/50 text-amber-400 bg-amber-950/20 shadow-[0_0_8px_rgba(245,158,11,0.1)] font-bold' 
                  : 'border-white/10 text-zinc-500 hover:border-white/20'
              }`}
            >
              {newQuestIsPenalty ? '💀 YES' : 'NO'}
            </button>
          </div>
        </div>

        {/* Custom Recurrence Parameters */}
        {newQuestRecurrence === 'Custom' && (
          <div className="p-3.5 bg-zinc-950 border border-white/5 rounded-lg space-y-3 mt-1 max-w-xl animate-fadeIn">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
              <span className="uppercase font-bold text-cyan-400">CUSTOM_RECURRENCE_PARAMETERS</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {(['days', 'weekdays', 'text'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCustomRecurrenceType(type)}
                  className={`py-1 text-[9px] font-mono rounded border uppercase transition-all ${
                    customRecurrenceType === type 
                      ? 'bg-cyan-950 border-cyan-500/40 text-cyan-400 font-bold shadow-[0_0_8px_rgba(6,182,212,0.1)]' 
                      : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {customRecurrenceType === 'days' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-400 font-sans">Repeat every</span>
                <input 
                  type="number" 
                  min="1" 
                  max="365"
                  value={customRecurrenceDays}
                  onChange={(e) => setCustomRecurrenceDays(Number(e.target.value))}
                  className="w-16 bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-white text-center font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <span className="text-zinc-400 font-sans">days</span>
              </div>
            )}

            {customRecurrenceType === 'weekdays' && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">SELECT APPLICABLE WEEKDAYS:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                    const isSelected = customRecurrenceWeekdays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setCustomRecurrenceWeekdays(prev => 
                            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                          );
                        }}
                        className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-all ${
                          isSelected 
                            ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400 font-bold' 
                            : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {customRecurrenceType === 'text' && (
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">ENTER CUSTOM FREQUENCY STATEMENT:</span>
                <input 
                  type="text"
                  value={customRecurrenceText}
                  onChange={(e) => setCustomRecurrenceText(e.target.value)}
                  placeholder="e.g. Every 1st day of month, every Friday"
                  className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            )}
          </div>
        )}

        {/* Skills assignment check */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono text-zinc-500 uppercase">Associate Skills</label>
          
          {/* Primary Skills */}
          {state.skills.filter(s => (s.tier || 'Primary') === 'Primary').length > 0 && (
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-cyan-500 uppercase tracking-wider block">Primary Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {state.skills
                  .filter(s => (s.tier || 'Primary') === 'Primary')
                  .map(skill => {
                    const isSelected = newQuestSkills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleSkillToggle(skill.id)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
                          isSelected 
                            ? 'bg-cyan-950/50 text-cyan-400 border-cyan-500/30 font-bold' 
                            : 'bg-zinc-950 text-zinc-500 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Secondary Skills */}
          {state.skills.filter(s => s.tier === 'Secondary').length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[8px] font-mono text-fuchsia-500 uppercase tracking-wider block">Secondary Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {state.skills
                  .filter(s => s.tier === 'Secondary')
                  .map(skill => {
                    const isSelected = newQuestSkills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleSkillToggle(skill.id)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
                          isSelected 
                            ? 'bg-fuchsia-950/50 text-fuchsia-400 border-fuchsia-500/30 font-bold' 
                            : 'bg-zinc-950 text-zinc-500 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
