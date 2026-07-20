import React, { useState, useMemo, useRef } from 'react';
import { usePOS } from '../POSContext';
import { Quest, QuestDifficulty, QuestType, QuestRecurrence } from '../types';
import { 
  Circle, CheckCircle2, Trash2, Edit3, Save, X, Skull, 
  Calendar, SkipForward, Play, Pause, Clock, Timer, 
  AlertTriangle, Copy, Ban, Check, ArrowLeft, Terminal, Sliders, Cpu, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ActiveDirectives: React.FC = () => {
  const { 
    state, addQuest, updateQuest, completeQuest, reopenQuest, failQuest, deleteQuest, duplicateQuest,
    addSubQuest, toggleSubQuest, deleteSubQuest,
    startFocusSession, activeFocusSession, pauseFocusSession, resumeFocusSession, stopFocusSession,
    isQuestFinishedForToday,
    isQuestScheduledForDate,
    systemDate,
    setSystemDate,
    updateProfileFocus,
    selectedFolderId,
    selectedListId
  } = usePOS();

  const [showTomorrowQuests, setShowTomorrowQuests] = useState(false);
  const [focusChoiceQuestId, setFocusChoiceQuestId] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Normal' | 'Hard' | 'Boss'>('All');
  const [terminalTab, setTerminalTab] = useState<'today' | 'tomorrow' | 'week' | 'deferred' | 'penalty'>('today');

  // Quick / Bulk Add States
  const [quickInputText, setQuickInputText] = useState('');
  const [bulkInputText, setBulkInputText] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [terminalLog, setTerminalLog] = useState<string | null>(null);

  // Command History & Intellisense State
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const parseBulkQuestLine = (line: string) => {
    let name = line.trim();
    if (!name) return null;

    let difficulty: QuestDifficulty = 'Normal';
    let isImportant = false;
    let qType: QuestType = 'Main';
    let recurrence: QuestRecurrence = 'None';

    // Check for critical mark '!'
    if (name.endsWith('!')) {
      isImportant = true;
      name = name.slice(0, -1).trim();
    } else if (name.includes(' !')) {
      isImportant = true;
      name = name.replace(' !', '').trim();
    }

    // Check difficulty tags like [easy], [normal], [hard], [boss]
    const diffMatch = name.match(/\[(easy|normal|hard|boss)\]/i);
    if (diffMatch) {
      const diffStr = diffMatch[1].toLowerCase();
      difficulty = diffStr.charAt(0).toUpperCase() + diffStr.slice(1) as QuestDifficulty;
      name = name.replace(diffMatch[0], '').trim();
    }

    // Check type/recurrence tags starting with *
    const tagMatches = name.match(/\*([a-zA-Z0-9]+)/g);
    if (tagMatches) {
      for (const tag of tagMatches) {
        const tagContent = tag.slice(1).toLowerCase();
        if (tagContent === 'habit') {
          qType = 'Habit';
          recurrence = 'Daily';
        } else if (tagContent === 'daily') {
          recurrence = 'Daily';
        } else if (tagContent === 'weekly') {
          recurrence = 'Weekly';
        } else if (tagContent === 'monthly') {
          recurrence = 'Monthly';
        } else if (tagContent === 'side') {
          qType = 'Side';
        } else if (tagContent === 'boss') {
          qType = 'Boss';
          difficulty = 'Boss';
        }
        name = name.replace(tag, '').trim();
      }
    }

    // Match skill tags starting with @
    const skillMatches = name.match(/@([a-zA-Z0-9_-]+)/g);
    const relatedSkills: string[] = [];
    if (skillMatches) {
      for (const tag of skillMatches) {
        const skillName = tag.slice(1);
        const skill = state.skills.find(s => s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === skillName.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (skill) {
          relatedSkills.push(skill.id);
        }
        name = name.replace(tag, '').trim();
      }
    }

    // Match project tags starting with #
    const projectMatches = name.match(/#([a-zA-Z0-9_-]+)/g);
    let projectId: string | null = null;
    let goalId: string | null = null;
    if (projectMatches) {
      for (const tag of projectMatches) {
        const projName = tag.slice(1);
        const project = state.projects.find(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === projName.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (project) {
          projectId = project.id;
          goalId = project.goalId || null;
        }
        name = name.replace(tag, '').trim();
      }
    }

    // Match goal tags starting with /
    const goalMatches = name.match(/\/([a-zA-Z0-9_-]+)/g);
    if (goalMatches) {
      for (const tag of goalMatches) {
        const gName = tag.slice(1);
        if (['help', 'complete', 'fail', 'delete', 'focus', 'simulate', 'sim'].includes(gName.toLowerCase())) {
          continue;
        }
        const goal = state.goals.find(g => g.name.toLowerCase().replace(/[^a-z0-9]/g, '') === gName.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (goal) {
          goalId = goal.id;
        }
        name = name.replace(tag, '').trim();
      }
    }

    name = name.replace(/\s+/g, ' ').trim();
    if (!name) return null;

    let xp = 100;
    if (difficulty === 'Easy') xp = 50;
    else if (difficulty === 'Normal') xp = 100;
    else if (difficulty === 'Hard') xp = 200;
    else if (difficulty === 'Boss') xp = 500;

    const autoImportant = qType === 'Main' || qType === 'Boss' || difficulty === 'Hard' || difficulty === 'Boss';
    const finalImportant = isImportant || autoImportant;

    return {
      name,
      description: "Logged via Pale Ore Terminal.",
      difficulty,
      estimatedTime: 30,
      xp,
      goalId,
      projectId,
      milestoneId: null,
      relatedSkills,
      type: qType,
      recurrence,
      deadline: systemDate,
      important: finalImportant,
      energyLevel: 'Medium' as const
    };
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = quickInputText.trim();
    if (!text) return;

    // Save to history list
    setCommandHistory(prev => {
      const filtered = prev.filter(h => h !== text);
      return [text, ...filtered].slice(0, 50);
    });
    setHistoryIndex(-1);

    const words = text.split(' ');
    const firstWord = words[0].toLowerCase();
    const restText = words.slice(1).join(' ').trim();

    if (firstWord === 'help' || text === '?') {
      setTerminalLog(`[HELP] Commands: add <directive> | complete <query> | fail <query> | delete <query> | focus <text> [/goal] | simulate <days>`);
      setQuickInputText('');
      return;
    }

    if (firstWord === 'complete' || firstWord === 'done') {
      if (!restText) {
        setTerminalLog(`[ERROR] Usage: complete <quest name or id>`);
        return;
      }
      const matched = state.quests.find(q => 
        q.status === 'Active' && 
        (q.id.toLowerCase() === restText.toLowerCase() || q.name.toLowerCase().includes(restText.toLowerCase()))
      );
      if (matched) {
        completeQuest(matched.id);
        setTerminalLog(`[SUCCESS] RESOLVED: "${matched.name}" completed.`);
        setQuickInputText('');
      } else {
        setTerminalLog(`[ERROR] Active quest matching "${restText}" not found.`);
      }
      setTimeout(() => setTerminalLog(null), 5000);
      return;
    }

    if (firstWord === 'fail' || firstWord === 'skip') {
      if (!restText) {
        setTerminalLog(`[ERROR] Usage: fail <quest name or id>`);
        return;
      }
      const matched = state.quests.find(q => 
        q.status === 'Active' && 
        (q.id.toLowerCase() === restText.toLowerCase() || q.name.toLowerCase().includes(restText.toLowerCase()))
      );
      if (matched) {
        failQuest(matched.id);
        setTerminalLog(`[SUCCESS] DIRECTIVE_FAILED: "${matched.name}". Recovery operations initiated.`);
        setQuickInputText('');
      } else {
        setTerminalLog(`[ERROR] Active quest matching "${restText}" not found.`);
      }
      setTimeout(() => setTerminalLog(null), 5000);
      return;
    }

    if (firstWord === 'delete' || firstWord === 'rm') {
      if (!restText) {
        setTerminalLog(`[ERROR] Usage: delete <quest name or id>`);
        return;
      }
      const matched = state.quests.find(q => 
        q.id.toLowerCase() === restText.toLowerCase() || q.name.toLowerCase().includes(restText.toLowerCase())
      );
      if (matched) {
        deleteQuest(matched.id);
        setTerminalLog(`[SUCCESS] DELETED: "${matched.name}" removed from log.`);
        setQuickInputText('');
      } else {
        setTerminalLog(`[ERROR] Quest matching "${restText}" not found.`);
      }
      setTimeout(() => setTerminalLog(null), 5000);
      return;
    }

    if (firstWord === 'focus') {
      if (!restText) {
        setTerminalLog(`[ERROR] Usage: focus <focus statement> [/linked_goal]`);
        return;
      }
      let focusMsg = restText;
      let linkedGoalId: string | null = null;
      const goalMatch = restText.match(/\/([a-zA-Z0-9_-]+)/);
      if (goalMatch) {
        const goalSlug = goalMatch[1];
        const matchedGoal = state.goals.find(g => 
          g.name.toLowerCase().replace(/[^a-z0-9]/g, '') === goalSlug.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        if (matchedGoal) {
          linkedGoalId = matchedGoal.id;
        }
        focusMsg = restText.replace(goalMatch[0], '').trim();
      }
      updateProfileFocus(focusMsg, linkedGoalId);
      setTerminalLog(`[SUCCESS] SYSTEM_FOCUS: Updated focus to "${focusMsg}".`);
      setQuickInputText('');
      setTimeout(() => setTerminalLog(null), 5000);
      return;
    }

    if (firstWord === 'simulate' || firstWord === 'sim') {
      const days = parseInt(restText, 10);
      if (isNaN(days) || days <= 0) {
        setTerminalLog(`[ERROR] Usage: simulate <days>`);
        return;
      }
      const currentDateObj = new Date(systemDate);
      currentDateObj.setDate(currentDateObj.getDate() + days);
      const newDateStr = currentDateObj.toISOString().split('T')[0];
      setSystemDate(newDateStr);
      setTerminalLog(`[SUCCESS] CHRONO_SHIFT: Advanced ${days} day(s) to ${newDateStr}.`);
      setQuickInputText('');
      setTimeout(() => setTerminalLog(null), 5000);
      return;
    }

    // Default to adding a quest (either plain text or explicitly "add ...")
    let questLine = text;
    if (firstWord === 'add' && restText) {
      questLine = restText;
    }

    const parsed = parseBulkQuestLine(questLine);
    if (parsed) {
      addQuest(parsed);
      setTerminalLog(`[SUCCESS] DIRECTIVE_LOGGED: "${parsed.name}" (${parsed.difficulty}, ${parsed.important ? 'CRITICAL' : 'Standard'})`);
      setQuickInputText('');
      setTimeout(() => setTerminalLog(null), 5000);
    } else {
      setTerminalLog(`[ERROR] INVALID_INPUT_FORMAT. Type "help" for options.`);
    }
  };

  const handleBulkAddSubmit = () => {
    const lines = bulkInputText.split('\n');
    let count = 0;
    lines.forEach(line => {
      const parsed = parseBulkQuestLine(line);
      if (parsed) {
        addQuest(parsed);
        count++;
      }
    });

    if (count > 0) {
      setTerminalLog(`[SUCCESS] BATCH_DEPLOYED: Initialized ${count} directives successfully.`);
      setBulkInputText('');
      setTimeout(() => setTerminalLog(null), 5000);
    } else {
      setTerminalLog(`[WARNING] No valid directives found to deploy.`);
    }
  };

  const suggestions = useMemo(() => {
    if (isBulkMode || !quickInputText) return [];

    const words = quickInputText.split(' ');
    const lastWord = words[words.length - 1];

    if (words.length === 1 && !quickInputText.startsWith('@') && !quickInputText.startsWith('#') && !quickInputText.startsWith('/') && !quickInputText.startsWith('[') && !quickInputText.startsWith('*')) {
      const commands = [
        { value: 'add ', display: 'add <quest>', desc: 'Add a new directive', type: 'command' },
        { value: 'complete ', display: 'complete <quest>', desc: 'Complete an active quest', type: 'command' },
        { value: 'fail ', display: 'fail <quest>', desc: 'Fail an active quest', type: 'command' },
        { value: 'delete ', display: 'delete <quest>', desc: 'Delete a quest', type: 'command' },
        { value: 'focus ', display: 'focus <text>', desc: 'Update operating focus', type: 'command' },
        { value: 'simulate ', display: 'simulate <days>', desc: 'Advance simulation days', type: 'command' },
        { value: 'help', display: 'help', desc: 'Display help details', type: 'command' }
      ];
      return commands.filter(c => c.value.startsWith(quickInputText.toLowerCase()));
    }

    if (lastWord.startsWith('@')) {
      const search = lastWord.slice(1).toLowerCase();
      return state.skills
        .filter(s => s.name.toLowerCase().includes(search))
        .map(s => ({
          value: `@${s.name.replace(/\s+/g, '')}`,
          display: `@${s.name}`,
          desc: `Level ${s.level}`,
          type: 'skill'
        }));
    }

    if (lastWord.startsWith('#')) {
      const search = lastWord.slice(1).toLowerCase();
      return state.projects
        .filter(p => p.status === 'Active' && p.name.toLowerCase().includes(search))
        .map(p => ({
          value: `#${p.name.replace(/\s+/g, '')}`,
          display: `#${p.name}`,
          desc: `Project`,
          type: 'project'
        }));
    }

    if (lastWord.startsWith('/')) {
      const search = lastWord.slice(1).toLowerCase();
      return state.goals
        .filter(g => g.status === 'Active' && g.name.toLowerCase().includes(search))
        .map(g => ({
          value: `/${g.name.replace(/\s+/g, '')}`,
          display: `/${g.name}`,
          desc: `${g.priority} Goal`,
          type: 'goal'
        }));
    }

    if (lastWord.startsWith('[')) {
      const search = lastWord.slice(1).toLowerCase();
      const options = ['easy]', 'normal]', 'hard]', 'boss]'];
      return options
        .filter(o => o.startsWith(search))
        .map(o => ({
          value: `[${o}`,
          display: `[${o.slice(0, -1)}]`,
          desc: `Difficulty`,
          type: 'difficulty'
        }));
    }

    if (lastWord.startsWith('*')) {
      const search = lastWord.slice(1).toLowerCase();
      const options = [
        { val: 'habit', disp: '*habit', desc: 'Daily Habit' },
        { val: 'daily', disp: '*daily', desc: 'Daily Resets' },
        { val: 'weekly', disp: '*weekly', desc: 'Weekly Resets' },
        { val: 'monthly', disp: '*monthly', desc: 'Monthly Resets' },
        { val: 'side', disp: '*side', desc: 'Side Quest' },
        { val: 'boss', disp: '*boss', desc: 'Boss Encounter' }
      ];
      return options
        .filter(o => o.val.startsWith(search))
        .map(o => ({
          value: o.disp,
          display: o.disp,
          desc: o.desc,
          type: 'type'
        }));
    }

    // Quest selects for complete/fail/delete commands
    const firstWord = words[0].toLowerCase();
    if (words.length > 1 && ['complete', 'done', 'fail', 'skip', 'delete', 'rm'].includes(firstWord)) {
      const query = words.slice(1).join(' ').toLowerCase();
      const activeQuests = state.quests.filter(q => 
        (firstWord === 'delete' || firstWord === 'rm') ? true : q.status === 'Active'
      );
      return activeQuests
        .filter(q => q.name.toLowerCase().includes(query))
        .slice(0, 5)
        .map(q => ({
          value: `${firstWord} ${q.name}`,
          display: q.name,
          desc: `${q.difficulty} | ${q.type}`,
          type: 'quest_select'
        }));
    }

    return [];
  }, [quickInputText, state.skills, state.projects, state.goals, state.quests, isBulkMode]);

  const handleSelectSuggestion = (suggestion: any) => {
    if (suggestion.type === 'command' || suggestion.type === 'quest_select') {
      setQuickInputText(suggestion.value);
    } else {
      const words = quickInputText.split(' ');
      words[words.length - 1] = suggestion.value;
      setQuickInputText(words.join(' ') + ' ');
    }
    setFocusedSuggestionIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedSuggestionIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[focusedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setFocusedSuggestionIndex(-1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const idx = focusedSuggestionIndex >= 0 ? focusedSuggestionIndex : 0;
        handleSelectSuggestion(suggestions[idx]);
      }
    } else {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const nextIdx = historyIndex + 1;
          if (nextIdx < commandHistory.length) {
            setHistoryIndex(nextIdx);
            setQuickInputText(commandHistory[nextIdx]);
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = historyIndex - 1;
        if (nextIdx >= 0) {
          setHistoryIndex(nextIdx);
          setQuickInputText(commandHistory[nextIdx]);
        } else {
          setHistoryIndex(-1);
          setQuickInputText('');
        }
      }
    }
  };

  // Quest Editing State
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [editQuestName, setEditQuestName] = useState('');
  const [editQuestDiff, setEditQuestDiff] = useState<QuestDifficulty>('Normal');
  const [editQuestType, setEditQuestType] = useState<QuestType>('Main');
  const [editQuestXp, setEditQuestXp] = useState<number>(100);
  const [editQuestGoal, setEditQuestGoal] = useState<string>('');
  const [editQuestListId, setEditQuestListId] = useState<string>('');
  const [editQuestRecurrence, setEditQuestRecurrence] = useState<QuestRecurrence | 'Custom'>('None');
  const [editQuestDescription, setEditQuestDescription] = useState('');
  const [editQuestDeadline, setEditQuestDeadline] = useState('');
  const [editQuestSkills, setEditQuestSkills] = useState<string[]>([]);

  // Custom recurrence edit states
  const [editCustomRecurrenceType, setEditCustomRecurrenceType] = useState<'days' | 'weekdays' | 'text'>('days');
  const [editCustomRecurrenceDays, setEditCustomRecurrenceDays] = useState<number>(3);
  const [editCustomRecurrenceWeekdays, setEditCustomRecurrenceWeekdays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [editCustomRecurrenceText, setEditCustomRecurrenceText] = useState<string>('Every month');

  const handleEditSkillToggle = (skillId: string) => {
    setEditQuestSkills(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const startEditingQuest = (quest: Quest) => {
    setEditingQuestId(quest.id);
    setEditQuestName(quest.name);
    setEditQuestDiff(quest.difficulty);
    setEditQuestType(quest.type);
    setEditQuestXp(quest.xp);
    setEditQuestGoal(quest.goalId || '');
    setEditQuestListId(quest.listId || '');
    setEditQuestDescription(quest.description || '');
    setEditQuestDeadline(quest.deadline || '');
    setEditQuestSkills(quest.relatedSkills || []);

    const rec = quest.recurrence || 'None';
    if (rec.startsWith('Custom:')) {
      setEditQuestRecurrence('Custom');
      const content = rec.replace('Custom:', '').trim();
      if (content.startsWith('Every ') && content.endsWith(' Days')) {
        setEditCustomRecurrenceType('days');
        const num = parseInt(content.replace('Every', '').replace('Days', '').trim());
        setEditCustomRecurrenceDays(isNaN(num) ? 3 : num);
      } else if (content.includes(',') || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].some(d => content.includes(d))) {
        setEditCustomRecurrenceType('weekdays');
        setEditCustomRecurrenceWeekdays(content.split(',').map(s => s.trim()));
      } else {
        setEditCustomRecurrenceType('text');
        setEditCustomRecurrenceText(content);
      }
    } else {
      setEditQuestRecurrence(rec as any);
    }
  };

  const handleSaveQuestEdit = (id: string) => {
    let finalRecurrence: QuestRecurrence = 'None';
    if (editQuestRecurrence === 'Custom') {
      if (editCustomRecurrenceType === 'days') {
        finalRecurrence = `Custom: Every ${editCustomRecurrenceDays} Days`;
      } else if (editCustomRecurrenceType === 'weekdays') {
        finalRecurrence = `Custom: ${editCustomRecurrenceWeekdays.join(', ')}`;
      } else {
        finalRecurrence = `Custom: ${editCustomRecurrenceText}`;
      }
    } else {
      finalRecurrence = editQuestRecurrence;
    }

    updateQuest(id, {
      name: editQuestName,
      difficulty: editQuestDiff,
      type: editQuestType,
      xp: editQuestXp,
      goalId: editQuestGoal ? editQuestGoal : null,
      listId: editQuestListId ? editQuestListId : null,
      recurrence: finalRecurrence,
      description: editQuestDescription,
      energyLevel: 'Medium',
      deadline: editQuestDeadline ? editQuestDeadline : null,
      relatedSkills: editQuestSkills
    });
    setEditingQuestId(null);
  };

  // Filter by Recovery Mode, Folder, and List if active
  const baseQuests = state.quests.filter(q => {
    // 1. Recovery Mode Filter
    if (state.profile.recoveryMode) {
      if (q.type !== 'Recovery' && q.type !== 'Optional' && q.type !== 'Penalty') return false;
    }

    // 2. Folder & List filters
    if (selectedListId) {
      if (q.listId !== selectedListId) return false;
    } else if (selectedFolderId) {
      const listIdsInFolder = (state.lists || []).filter(l => l.folderId === selectedFolderId).map(l => l.id);
      if (!q.listId || !listIdsInFolder.includes(q.listId)) return false;
    }
    
    return true;
  });

  const todayStr = systemDate;

  // Calculate tomorrow's string
  const getTomorrowStr = () => {
    try {
      const tomorrow = new Date(systemDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    } catch (e) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
  };

  const getNext7Days = (): string[] => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      try {
        const d = new Date(systemDate);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      } catch (e) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const tomorrowStr = getTomorrowStr();
  const next7Days = getNext7Days();

  // 1. Today's quests: Active & (No deadline OR deadline <= todayStr) OR Completed today
  const todayQuests = baseQuests.filter(q => {
    const isFinished = isQuestFinishedForToday(q);
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    if (!matchesDifficulty) return false;

    if (isFinished) {
       return q.status !== 'Failed'; // Show completed today, exclude fails
    }
    
    if (q.status !== 'Active') return false;
    
    // Check weekday schedule if applicable
    const isScheduled = isQuestScheduledForDate(q, todayStr);
    if (!isScheduled) return false;
    
    return !q.deadline || q.deadline <= todayStr;
  });

  // 2. Tomorrow's quests: Active & scheduled/deadline is tomorrow, plus completed recurring
  const tomorrowQuests = baseQuests.filter(q => {
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    if (!matchesDifficulty) return false;

    const isFinished = isQuestFinishedForToday(q);
    const isRecurring = q.recurrence && q.recurrence !== 'None';

    if (isFinished) {
      // Completed recurring quests are queued for tomorrow/future cycles
      return isRecurring;
    }

    if (q.status !== 'Active') return false;

    // Scheduled on tomorrow?
    const isScheduled = isQuestScheduledForDate(q, tomorrowStr);
    const isDueTomorrow = q.deadline === tomorrowStr;

    return isScheduled || isDueTomorrow;
  });

  // 3. This Week's quests: next 7 days scheduled/due
  const weekQuests = baseQuests.filter(q => {
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    if (!matchesDifficulty) return false;

    const isFinished = isQuestFinishedForToday(q);
    if (q.status !== 'Active') {
      return isFinished; // Show completed today too
    }

    // Scheduled on any of the next 7 days?
    const isScheduledSomeDay = next7Days.some(dateStr => isQuestScheduledForDate(q, dateStr));
    // Has a deadline within the next 7 days?
    const hasDeadlineThisWeek = q.deadline && q.deadline >= todayStr && q.deadline <= next7Days[6];

    return isScheduledSomeDay || hasDeadlineThisWeek;
  });

  // 4. Deferred quests: Active & deadline > todayStr, plus completed recurring
  const tomorrowPostponedQuests = baseQuests.filter(q => {
    const isFinished = isQuestFinishedForToday(q);
    const isRecurring = q.recurrence && q.recurrence !== 'None';
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    if (!matchesDifficulty) return false;
    
    if (isFinished) {
      // Completed recurring quests are queued for tomorrow/future cycles in the defer console
      return isRecurring;
    }
    
    return q.status === 'Active' && q.deadline && q.deadline > todayStr;
  });

  // 5. Penalty quests: Active and type === 'Penalty'
  const penaltyQuests = state.quests.filter(q => {
    if (q.status !== 'Active') return false;
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    if (!matchesDifficulty) return false;
    return q.type === 'Penalty';
  });

  const handleMoveToTomorrow = (questId: string) => {
    const tomorrowStr = getTomorrowStr();
    updateQuest(questId, { deadline: tomorrowStr });
  };

  const handleMoveToToday = (questId: string) => {
    updateQuest(questId, { deadline: null });
  };

  const renderQuestCard = (quest: Quest, isDeferred: boolean) => {
    const matchedGoal = state.goals.find(g => g.id === quest.goalId);
    const isEditing = editingQuestId === quest.id;
    
    if (isEditing) {
      return (
        <motion.div
          key={quest.id}
          layout
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="p-4 bg-zinc-950 border border-cyan-500/30 rounded-lg space-y-3 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
        >
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Cpu className="h-3 w-3 animate-spin" /> CHANGE_DIRECTIVE_PARAMETERS
            </span>
            <button 
              type="button"
              onClick={() => setEditingQuestId(null)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Quest Title</label>
              <input 
                type="text"
                value={editQuestName}
                onChange={(e) => setEditQuestName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Quest Description</label>
              <textarea 
                value={editQuestDescription}
                onChange={(e) => setEditQuestDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white font-sans h-16 resize-none focus:outline-none focus:border-cyan-500"
                placeholder="Enter quest description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Difficulty</label>
                <select 
                  value={editQuestDiff}
                  onChange={(e) => {
                    const diff = e.target.value as QuestDifficulty;
                    setEditQuestDiff(diff);
                    if (diff === 'Easy') setEditQuestXp(50);
                    else if (diff === 'Normal') setEditQuestXp(100);
                    else if (diff === 'Hard') setEditQuestXp(200);
                    else if (diff === 'Boss') setEditQuestXp(500);
                  }}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-white"
                >
                  <option value="Easy">Easy (50 XP)</option>
                  <option value="Normal">Normal (100 XP)</option>
                  <option value="Hard">Hard (200 XP)</option>
                  <option value="Boss">Boss (500 XP)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">XP Reward</label>
                <input 
                  type="number"
                  value={editQuestXp}
                  onChange={(e) => setEditQuestXp(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-white text-center font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Recurrence</label>
                <select 
                  value={editQuestRecurrence}
                  onChange={(e) => setEditQuestRecurrence(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-zinc-300"
                >
                  <option value="None">Once Only</option>
                  <option value="Daily">🔁 Daily</option>
                  <option value="Every 2 Days">🔁 Every 2 Days</option>
                  <option value="Weekly">🔁 Weekly</option>
                  <option value="Monthly">🔁 Monthly</option>
                  <option value="Custom">⚙️ Custom...</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Parent Goal</label>
                <select 
                  value={editQuestGoal}
                  onChange={(e) => setEditQuestGoal(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-zinc-300 truncate"
                >
                  <option value="">No Goal</option>
                  {state.goals.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Parent List</label>
                <select 
                  value={editQuestListId}
                  onChange={(e) => setEditQuestListId(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-zinc-300 truncate"
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
            </div>

            {editQuestRecurrence === 'Custom' && (
              <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg space-y-3 mt-1">
                <div className="grid grid-cols-3 gap-1.5">
                  {(['days', 'weekdays', 'text'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEditCustomRecurrenceType(type)}
                      className={`py-1 text-[9px] font-mono rounded border uppercase transition-all ${
                        editCustomRecurrenceType === type 
                          ? 'bg-cyan-950 border-cyan-500/40 text-cyan-400 font-bold' 
                          : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {editCustomRecurrenceType === 'days' && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400 font-sans">Repeat every</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="365"
                      value={editCustomRecurrenceDays}
                      onChange={(e) => setEditCustomRecurrenceDays(Number(e.target.value))}
                      className="w-16 bg-zinc-950 border border-white/10 rounded px-2 py-0.5 text-white text-center font-mono text-xs"
                    />
                    <span className="text-zinc-400 font-sans">days</span>
                  </div>
                )}

                {editCustomRecurrenceType === 'weekdays' && (
                  <div className="flex flex-wrap gap-1.5">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                      const isSelected = editCustomRecurrenceWeekdays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setEditCustomRecurrenceWeekdays(prev => 
                              prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                            );
                          }}
                          className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-all ${
                            isSelected 
                              ? 'bg-cyan-950 border-cyan-500/30 text-cyan-400 font-bold' 
                              : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                )}

                {editCustomRecurrenceType === 'text' && (
                  <div>
                    <input 
                      type="text"
                      value={editCustomRecurrenceText}
                      onChange={(e) => setEditCustomRecurrenceText(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Quest Category</label>
                <select 
                  value={editQuestType}
                  onChange={(e) => setEditQuestType(e.target.value as QuestType)}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-zinc-300"
                >
                  <option value="Main">Main Quest</option>
                  <option value="Side">Side Quest</option>
                  <option value="Boss">Boss Quest</option>
                  <option value="Recovery">Recovery Quest</option>
                  <option value="Habit">Habit Quest</option>
                  <option value="Optional">Optional Quest</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Target Date</label>
                <input 
                  type="date"
                  value={editQuestDeadline}
                  onChange={(e) => setEditQuestDeadline(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Associate Skills Section */}
            <div className="space-y-2 pt-1 border-t border-white/5">
              <label className="block text-[9px] font-mono text-zinc-500 uppercase">Associate Skills</label>
              
              {state.skills.length === 0 ? (
                <p className="text-[10px] font-mono text-zinc-600">No skill tracks available. Create one in the Skills tab first.</p>
              ) : (
                <div className="space-y-2">
                  {/* Primary Skills */}
                  {state.skills.filter(s => (s.tier || 'Primary') === 'Primary').length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-cyan-500 uppercase tracking-wider block">Primary Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {state.skills
                          .filter(s => (s.tier || 'Primary') === 'Primary')
                          .map(skill => {
                            const isSelected = editQuestSkills.includes(skill.id);
                            return (
                              <button
                                key={skill.id}
                                type="button"
                                onClick={() => handleEditSkillToggle(skill.id)}
                                className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all ${
                                  isSelected 
                                    ? 'bg-cyan-950/50 text-cyan-400 border-cyan-500/30 font-bold shadow-[0_0_8px_rgba(6,182,212,0.05)]' 
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
                            const isSelected = editQuestSkills.includes(skill.id);
                            return (
                              <button
                                key={skill.id}
                                type="button"
                                onClick={() => handleEditSkillToggle(skill.id)}
                                className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all ${
                                  isSelected 
                                    ? 'bg-fuchsia-950/50 text-fuchsia-400 border-fuchsia-500/30 font-bold shadow-[0_0_8px_rgba(217,70,239,0.05)]' 
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
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-white/5">
            <button 
              type="button"
              onClick={() => setEditingQuestId(null)}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              CANCEL
            </button>
            <button 
              type="button"
              onClick={() => handleSaveQuestEdit(quest.id)}
              className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono px-3 py-1 rounded transition-colors flex items-center gap-1"
            >
              <Save className="h-3 w-3" />
              SAVE_CHANGES
            </button>
          </div>
        </motion.div>
      );
    }

    const finished = isQuestFinishedForToday(quest);
    const isSelected = selectedQuestId === quest.id;

    return (
      <motion.div
        key={quest.id}
        layout
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: isDeferred ? 10 : -10 }}
        transition={{ duration: 0.15 }}
        onClick={() => setSelectedQuestId(quest.id)}
        className={`p-2.5 bg-zinc-950/40 hover:bg-zinc-900/60 border rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all relative ${
          isSelected 
            ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
            : finished 
              ? 'border-emerald-500/10 bg-emerald-950/5 opacity-75' 
              : isDeferred 
                ? 'border-amber-500/10 hover:border-amber-500/20' 
                : 'border-white/5 hover:border-white/10'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Checkbox */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (finished) {
                reopenQuest(quest.id);
              } else {
                completeQuest(quest.id);
              }
            }}
            className={`transition-colors shrink-0 ${
              finished ? 'text-emerald-400 hover:text-zinc-500' : 'text-zinc-500 hover:text-emerald-400'
            }`}
            title={finished ? "Reopen Quest" : "Complete Quest"}
          >
            {finished ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-sans text-xs font-semibold truncate ${
                finished ? 'line-through text-zinc-500' : 'text-white'
              }`}>
                {quest.name}
              </span>

              {/* Goal Relation Badge */}
              {matchedGoal && (
                <span className="text-[8px] font-mono text-zinc-500 truncate max-w-[120px] bg-zinc-900/40 px-1.5 py-0.5 rounded">
                  🎯 {matchedGoal.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {/* Difficulty Badge */}
              <span className={`text-[8px] font-mono uppercase px-1 py-0.5 rounded ${
                quest.difficulty === 'Easy' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700/50' :
                quest.difficulty === 'Normal' ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-500/10' :
                quest.difficulty === 'Hard' ? 'bg-purple-950/30 text-purple-400 border border-purple-500/10' :
                'bg-rose-950/40 text-rose-400 border border-rose-500/20 font-bold'
              }`}>
                {quest.difficulty}
              </span>

              {/* Category */}
              <span className="text-[8px] font-mono text-zinc-400 uppercase bg-zinc-900 px-1 py-0.5 rounded">
                {quest.type}
              </span>

              {/* Recurrence */}
              {quest.recurrence && quest.recurrence !== 'None' && (
                <span className="text-[8px] font-mono text-cyan-400 uppercase bg-cyan-950/20 px-1 py-0.5 rounded">
                  🔁 {quest.recurrence}
                </span>
              )}

              {/* Deadline */}
              {quest.deadline && (
                <span className="text-[8px] font-mono text-amber-400 bg-amber-950/20 px-1 py-0.5 rounded">
                  📅 {quest.deadline}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side XP & select indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono font-bold text-emerald-400/90">
            +{quest.xp} XP
          </span>
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
            isSelected ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-transparent'
          }`} />
        </div>
      </motion.div>
    );
  };

  const upperDashboardJSX = (
    <div className="space-y-4" id="active-quests-panel-upper">
      {/* Active Focus Session Banner (if running) */}
      {activeFocusSession && (
        <div className="glass-panel border-cyan-500/30 bg-cyan-950/10 p-4 rounded-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] relative overflow-hidden" id="pomodoro-focus-panel-directives">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#08334407_1px,transparent_1px)] pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-950/80 border border-cyan-500/30 rounded-lg animate-pulse">
                <Timer className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${activeFocusSession.status === 'paused' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
                    {activeFocusSession.status === 'paused' ? '⏸️ PAUSED' : activeFocusSession.mode === 'work' ? '🟢 WORK FOCUS' : '🟡 REST PHASE'}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">
                    CYCLE {activeFocusSession.completedCycles + 1} OF {activeFocusSession.estimatedCycles}
                  </span>
                </div>
                <h5 className="text-xs font-sans font-bold text-white mt-1">
                  Focusing: <span className="text-cyan-300">"{activeFocusSession.questName}"</span>
                </h5>
                <div className="text-[10px] font-mono text-zinc-400 mt-1 flex items-center gap-1.5">
                  <span>SESSION ELAPSED:</span>
                  <span className="text-cyan-400 font-bold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10">
                    {String(Math.floor((activeFocusSession.timeSpent || 0) / 60)).padStart(2, '0')}m {String((activeFocusSession.timeSpent || 0) % 60).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`font-mono text-xl md:text-2xl font-bold tracking-wider ${activeFocusSession.status === 'paused' ? 'text-zinc-500' : 'text-white'}`}>
                {String(Math.floor(activeFocusSession.timeLeft / 60)).padStart(2, '0')}:{String(activeFocusSession.timeLeft % 60).padStart(2, '0')}
              </div>

              <div className="flex items-center gap-1.5">
                {activeFocusSession.status === 'running' ? (
                  <button
                    onClick={pauseFocusSession}
                    className="p-1.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-400 rounded transition-all"
                    title="Pause Focus Session"
                  >
                    <Pause className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={resumeFocusSession}
                    className="p-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 rounded transition-all animate-pulse"
                    title="Resume Focus Session"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm("Complete the associated quest now? This will award standard XP and stop the focus timer.")) {
                      completeQuest(activeFocusSession.questId);
                      stopFocusSession();
                    }
                  }}
                  className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 rounded text-[9px] font-mono transition-colors"
                  title="Complete Quest"
                >
                  COMPLETE
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to abort this focus session?")) {
                      stopFocusSession();
                    }
                  }}
                  className="p-1 bg-rose-950/40 hover:bg-rose-950 border border-rose-500/20 rounded text-rose-400"
                  title="Stop Focus"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAST_QUEST_INPUT_CONSOLE */}
      <div className="glass-panel border-cyan-500/10 bg-zinc-950/30 p-4 rounded-lg space-y-3" id="fast-quest-console">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span className="text-[10px] font-mono text-zinc-300 font-bold tracking-wider">
              PALE_ORE_DIRECTIVE_LOGGER_SYSTEM [v2.0]
            </span>
          </div>
          <button 
            type="button"
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              setTerminalLog(null);
            }}
            className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-500/20 px-2 py-0.5 rounded transition-all"
          >
            {isBulkMode ? "⚡ QUICK_MODE" : "🗃️ BULK_MODE"}
          </button>
        </div>

        {terminalLog && (
          <div className="p-2 bg-zinc-950 border border-white/5 rounded font-mono text-[10px] text-cyan-400 flex items-center gap-2">
            <span className="animate-pulse">❯</span>
            <span>{terminalLog}</span>
          </div>
        )}

        {!isBulkMode ? (
          <div className="space-y-1 relative">
            <form onSubmit={handleQuickAddSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 font-mono text-xs text-cyan-500/60 select-none">❯</span>
                <input 
                  type="text"
                  placeholder="Type 'help' for commands, or write: Read books [easy] *habit @Discipline #Fitness /Health"
                  value={quickInputText}
                  onChange={(e) => {
                    setQuickInputText(e.target.value);
                    setFocusedSuggestionIndex(-1);
                  }}
                  onKeyDown={handleInputKeyDown}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                  className="w-full bg-zinc-950/80 border border-white/5 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              <button
                type="submit"
                className="px-4 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all"
              >
                Execute
              </button>
            </form>

            {/* Suggestions Intellisense Overlay */}
            {isInputFocused && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-zinc-950 border border-cyan-500/30 rounded-lg shadow-2xl max-h-48 overflow-y-auto z-50 divide-y divide-white/5 font-mono text-[10px]">
                {suggestions.map((s, index) => (
                  <button
                    key={index}
                    type="button"
                    onMouseDown={() => handleSelectSuggestion(s)}
                    onMouseEnter={() => setFocusedSuggestionIndex(index)}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors ${
                      index === focusedSuggestionIndex ? 'bg-cyan-950/60 text-cyan-300' : 'text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-500 font-bold select-none">❯</span>
                      <span className="font-bold text-zinc-100">{s.display}</span>
                      {s.desc && <span className="text-[9px] text-zinc-500">({s.desc})</span>}
                    </div>
                    <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded border leading-none ${
                      s.type === 'command' ? 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400' :
                      s.type === 'skill' ? 'bg-amber-950/40 border-amber-500/20 text-amber-400' :
                      s.type === 'project' ? 'bg-blue-950/40 border-blue-500/20 text-blue-400' :
                      s.type === 'goal' ? 'bg-purple-950/40 border-purple-500/20 text-purple-400' :
                      s.type === 'difficulty' ? 'bg-rose-950/40 border-rose-500/20 text-rose-400' :
                      s.type === 'type' ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' :
                      'bg-zinc-900 border-white/5 text-zinc-400'
                    }`}>
                      {s.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-[9px] font-mono text-zinc-500 pl-1 pt-1 flex items-center gap-1">
              Supports <span className="text-cyan-500/70">@skill</span>, <span className="text-cyan-500/70">#project</span>, <span className="text-cyan-500/70">/goal</span>, <span className="text-cyan-500/70">[difficulty]</span>, <span className="text-cyan-500/70">*habit</span>, <span className="text-cyan-500/70">!</span> critical. Use <kbd className="bg-zinc-900 px-1 border border-white/5 rounded text-[8px]">↑/↓</kbd> for history, <kbd className="bg-zinc-900 px-1 border border-white/5 rounded text-[8px]">Tab</kbd> to autocomplete.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[9px] font-mono text-zinc-500">
              Paste or type multiple directives (one per line). Format supports difficulty tags <span className="text-zinc-400">[easy]</span>, type tags <span className="text-zinc-400">*habit</span>, <span className="text-zinc-400">*weekly</span>, or <span className="text-zinc-400">!</span> for critical importance.
            </p>
            <textarea
              rows={4}
              placeholder="Example list:&#10;Study algorithms [hard] !&#10;Read 10 pages *habit&#10;Weekly review *weekly&#10;Buy groceries [easy]"
              value={bulkInputText}
              onChange={(e) => setBulkInputText(e.target.value)}
              className="w-full bg-zinc-950/80 border border-white/5 rounded-lg p-3 text-xs font-mono text-white placeholder-zinc-750 focus:outline-none focus:border-cyan-500/30 resize-none transition-all"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBulkInputText('')}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded border border-white/5 text-[10px] font-mono transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleBulkAddSubmit}
                className="px-4 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
              >
                Deploy Directives
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Strategy 2: Adaptive Load Difficulty Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-zinc-950/45 border border-white/5 rounded-lg gap-3">
        <div className="flex items-center gap-2.5">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
            ADAPTIVE_LOAD_DIFFICULTY_FILTER:
          </span>
        </div>
        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['All', 'Easy', 'Normal', 'Hard', 'Boss'] as const).map(level => (
            <button
              key={level}
              onClick={() => setDifficultyFilter(level)}
              className={`px-3 py-1 text-[10px] font-mono rounded border transition-all duration-200 uppercase whitespace-nowrap ${
                difficultyFilter === level
                  ? 'bg-cyan-950 text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.1)] font-bold'
                  : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
              }`}
            >
              {level === 'All' ? '🌌 ALL_DIFFICULTIES' : level === 'Easy' ? '🟢 EASY' : level === 'Normal' ? '🟡 NORMAL' : level === 'Hard' ? '🟠 HARD' : '🔴 BOSS'}
            </button>
          ))}
        </div>
      </div>

      {/* Recovery Alert Banner */}
      {state.profile.recoveryMode && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/25 rounded-lg flex items-center justify-between text-xs font-mono text-rose-400 mb-4 animate-pulse">
          <div className="flex items-center gap-2">
            <Skull className="h-4.5 w-4.5 text-rose-500 shrink-0" />
            <div>
              <p className="font-bold uppercase tracking-wider text-rose-300">⚠️ SECURITY SYSTEM ALERT: RECOVERY MODE ENGAGED</p>
              <p className="text-[10px] text-zinc-400">A directive has been failed or skipped. Normal operations are paused until all outstanding Penalty Quests are completed.</p>
            </div>
          </div>
          <button 
            onClick={() => setTerminalTab('penalty')}
            className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 border border-rose-500/30 rounded font-bold uppercase tracking-wider text-[10px] transition-colors whitespace-nowrap"
          >
            RESOLVE PENALTY QUESTS ({penaltyQuests.length})
          </button>
        </div>
      )}
    </div>
  );

  const renderQuestTerminalHUD = () => {
    // find the selected quest
    let quest = state.quests.find(q => q.id === selectedQuestId);
    
    // Fallback: if no quest is selected, auto-select the first quest from the active list
    const activeList = 
      terminalTab === 'today' ? todayQuests :
      terminalTab === 'tomorrow' ? tomorrowQuests :
      terminalTab === 'week' ? weekQuests :
      terminalTab === 'deferred' ? tomorrowPostponedQuests : penaltyQuests;

    if (!quest && activeList.length > 0) {
      quest = activeList[0];
    }

    if (!quest) {
      return (
        <div className="h-full flex flex-col justify-center items-center text-center p-6 border border-dashed border-cyan-500/10 rounded-lg bg-zinc-950/30">
          <Terminal className="h-10 w-10 text-cyan-500/20 mb-3 animate-pulse" />
          <p className="text-xs font-mono text-cyan-500/60 uppercase">SYSTEM_OPERATIONAL_LOG</p>
          <p className="text-[10px] font-mono text-zinc-500 mt-2 max-w-xs leading-relaxed">
            No directives active or selected in this sector. Choose a directive from the operational board to inspect parameters and engage.
          </p>
        </div>
      );
    }

    const matchedGoal = state.goals.find(g => g.id === quest.goalId);
    const finished = isQuestFinishedForToday(quest);
    const linkedDocs = state.planningDocuments?.filter(doc => doc.linkedQuests?.includes(quest.id)) || [];

    return (
      <div className="h-full flex flex-col overflow-hidden text-left" id="quest-hud-terminal">
        {/* HUD Top Bar */}
        <div className="flex justify-between items-center pb-2 border-b border-cyan-500/15 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
            <span>DIRECTIVE_HUD_TERM :: {quest.id.slice(0, 8)}</span>
          </div>
          <span className="text-[9px] font-mono text-cyan-500/60">SECURE_CHANNEL</span>
        </div>

        {/* HUD Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto pr-1 py-3.5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* Header Title & Status */}
          <div>
            <div className="flex justify-between items-start gap-2">
              <h3 className={`font-sans text-xs sm:text-sm font-bold leading-tight ${finished ? 'line-through text-zinc-500' : 'text-white'}`}>
                {quest.name}
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                +{quest.xp} XP
              </span>
            </div>
            {quest.description && (
              <p className="text-[11px] text-zinc-400 font-sans mt-1.5 whitespace-pre-wrap leading-relaxed bg-zinc-950/40 p-2 rounded border border-white/5">
                {quest.description}
              </p>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-zinc-950/50 p-2 rounded border border-white/5">
              <span className="text-zinc-500 uppercase block text-[8px] mb-0.5">Difficulty</span>
              <span className={`font-bold ${
                quest.difficulty === 'Easy' ? 'text-emerald-400' :
                quest.difficulty === 'Normal' ? 'text-cyan-400' :
                quest.difficulty === 'Hard' ? 'text-purple-400' : 'text-rose-400 font-extrabold animate-pulse'
              }`}>
                {quest.difficulty === 'Easy' ? '🟢 EASY' :
                 quest.difficulty === 'Normal' ? '🟡 NORMAL' :
                 quest.difficulty === 'Hard' ? '🟣 HARD' : '🔴 BOSS'}
              </span>
            </div>
            <div className="bg-zinc-950/50 p-2 rounded border border-white/5">
              <span className="text-zinc-500 uppercase block text-[8px] mb-0.5">Category</span>
              <span className="text-zinc-300 font-bold">{quest.type}</span>
            </div>
            {quest.recurrence && quest.recurrence !== 'None' && (
              <div className="bg-zinc-950/50 p-2 rounded border border-white/5">
                <span className="text-zinc-500 uppercase block text-[8px] mb-0.5">Recurrence</span>
                <span className="text-cyan-400 font-bold">🔁 {quest.recurrence}</span>
              </div>
            )}
            {quest.deadline && (
              <div className="bg-zinc-950/50 p-2 rounded border border-white/5">
                <span className="text-zinc-500 uppercase block text-[8px] mb-0.5">Target Date</span>
                <span className="text-amber-400 font-bold">📅 {quest.deadline}</span>
              </div>
            )}
            {matchedGoal && (
              <div className="col-span-2 bg-zinc-950/50 p-2 rounded border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-zinc-500 uppercase block text-[8px] mb-0.5">Linked Goal</span>
                  <span className="text-zinc-300 truncate font-semibold block max-w-[220px]">🎯 {matchedGoal.name}</span>
                </div>
              </div>
            )}
            {(() => {
              if (!quest.listId) return null;
              const matchedList = (state.lists || []).find(l => l.id === quest.listId);
              if (!matchedList) return null;
              const matchedFolder = matchedList.folderId ? (state.folders || []).find(f => f.id === matchedList.folderId) : null;
              return (
                <div className="col-span-2 bg-zinc-950/50 p-2 rounded border border-white/5">
                  <span className="text-zinc-500 uppercase block text-[8px] mb-0.5">Directory Path</span>
                  <span className="text-cyan-400 truncate font-semibold block" style={{ color: matchedFolder?.color }}>
                    📋 {matchedFolder ? `${matchedFolder.name} › ${matchedList.name}` : matchedList.name}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Subquests Section */}
          <div className="bg-zinc-950/40 p-2.5 rounded-lg border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
              <span>Subquests ({quest.subquests?.filter(s => s.completed).length || 0}/{quest.subquests?.length || 0})</span>
            </div>
            {quest.subquests && quest.subquests.length > 0 ? (
              <div className="space-y-1.5">
                {quest.subquests.map(sq => (
                  <div key={sq.id} className="flex items-center justify-between gap-2 group/hudsq">
                    <button
                      type="button"
                      onClick={() => toggleSubQuest(quest.id, sq.id)}
                      className="flex items-center gap-1.5 text-left text-zinc-300 hover:text-white transition-colors"
                    >
                      <span className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 transition-all ${
                        sq.completed 
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                          : 'border-white/10'
                      }`}>
                        {sq.completed && <Check className="h-2 w-2 stroke-[3]" />}
                      </span>
                      <span className={`font-sans text-[10.5px] ${sq.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                        {sq.name}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSubQuest(quest.id, sq.id)}
                      className="opacity-0 group-hover/hudsq:opacity-100 text-zinc-600 hover:text-rose-400 p-0.5 transition-all"
                      title="Delete Subquest"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] font-mono text-zinc-500 italic">No subquests. Add one below to breakdown execution.</p>
            )}

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('hudSubquestName') as HTMLInputElement;
                if (input && input.value.trim()) {
                  addSubQuest(quest.id, input.value.trim());
                  input.value = '';
                }
              }}
              className="flex gap-1.5 mt-2"
            >
              <input
                type="text"
                name="hudSubquestName"
                placeholder="Break down task..."
                className="bg-zinc-900 border border-white/5 rounded px-2 py-0.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/50 flex-1 font-sans"
              />
              <button
                type="submit"
                className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0"
              >
                ADD
              </button>
            </form>
          </div>

          {/* Linked SOPs / Playbooks */}
          {linkedDocs.length > 0 && (
            <div className="bg-zinc-950/40 p-2.5 rounded-lg border border-white/5 space-y-1.5">
              <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">📄 CONNECTED_OPERATIONAL_SOPs</span>
              <div className="flex flex-wrap gap-1.5">
                {linkedDocs.map(doc => (
                  <div key={doc.id} className="text-[9px] font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-500/15 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <span>📂</span>
                    <span className="max-w-[150px] truncate">{doc.name || doc.path.split('/').pop()?.replace('.md', '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* HUD Bottom Controller / Primary Actions */}
        <div className="pt-2.5 border-t border-cyan-500/15 shrink-0 space-y-2 bg-zinc-950/20">
          {/* POMODORO TRIGGER SECTION */}
          {!finished && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFocusChoiceQuestId(focusChoiceQuestId === quest.id ? null : quest.id);
                  startFocusSession(quest.id, 25);
                }}
                className="flex-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 font-bold font-mono text-xs py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.05)]"
              >
                <Timer className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span>ENGAGE_FOCUS_POMODORO (25M)</span>
              </button>
            </div>
          )}

          {/* CORE STATE CONTROLLERS */}
          <div className="grid grid-cols-3 gap-1.5">
            {/* Complete/Reopen */}
            <button
              type="button"
              onClick={() => {
                if (finished) reopenQuest(quest.id);
                else completeQuest(quest.id);
              }}
              className={`py-1 bg-zinc-900/60 border rounded-lg text-[9px] font-mono font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5 ${
                finished 
                  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900' 
                  : 'border-white/5 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{finished ? 'REOPEN' : 'COMPLETE'}</span>
            </button>

            {/* Postpone / Move */}
            {!finished ? (
              <button
                type="button"
                onClick={() => handleMoveToTomorrow(quest.id)}
                className="py-1 bg-zinc-900/60 border border-white/5 hover:border-amber-500/20 hover:text-amber-400 text-zinc-400 rounded-lg text-[9px] font-mono font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5"
                title="Postpone to tomorrow"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>POSTPONE</span>
              </button>
            ) : (
              <button
                type="button"
                className="py-1 bg-zinc-900/30 border border-white/5 text-zinc-600 rounded-lg text-[9px] font-mono font-bold uppercase flex flex-col items-center justify-center gap-0.5 cursor-not-allowed"
                disabled
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>POSTPONE</span>
              </button>
            )}

            {/* Fail/Skip Penalty */}
            {!finished ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Mark "${quest.name}" as "Won't Do"? It will activate an XP/momentum penalty.`)) {
                    failQuest(quest.id);
                  }
                }}
                className="py-1 bg-zinc-900/60 border border-white/5 hover:border-rose-500/20 hover:text-rose-400 text-zinc-400 rounded-lg text-[9px] font-mono font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>FAIL_SKIP</span>
              </button>
            ) : (
              <button
                type="button"
                className="py-1 bg-zinc-900/30 border border-white/5 text-zinc-600 rounded-lg text-[9px] font-mono font-bold uppercase flex flex-col items-center justify-center gap-0.5 cursor-not-allowed"
                disabled
              >
                <Ban className="h-3.5 w-3.5" />
                <span>FAIL_SKIP</span>
              </button>
            )}

            {/* Edit Option */}
            <button
              type="button"
              onClick={() => startEditingQuest(quest)}
              className="py-1 bg-zinc-900/60 border border-white/5 hover:border-cyan-500/20 hover:text-cyan-400 text-zinc-400 rounded-lg text-[9px] font-mono font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>EDIT</span>
            </button>

            {/* Duplicate Option */}
            <button
              type="button"
              onClick={() => duplicateQuest(quest.id)}
              className="py-1 bg-zinc-900/60 border border-white/5 hover:border-purple-500/20 hover:text-purple-400 text-zinc-400 rounded-lg text-[9px] font-mono font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>DUPLICATE</span>
            </button>

            {/* Delete Option */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete "${quest.name}"?`)) {
                  deleteQuest(quest.id);
                  setSelectedQuestId(null);
                }
              }}
              className="py-1 bg-zinc-900/60 border border-white/5 hover:border-red-500/20 hover:text-red-400 text-zinc-400 rounded-lg text-[9px] font-mono font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>DELETE</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4" id="active-quests-panel">
      {upperDashboardJSX}

      {/* COMPACTED UNIFIED TERMINAL CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 h-[620px]" id="unified-terminal-container">
        {/* Left Column: Directives Board List */}
        <div 
          className={`lg:col-span-3 glass-panel rounded-lg p-5 border transition-all duration-300 relative overflow-hidden flex flex-col h-full ${
            terminalTab === 'today'
              ? 'border-cyan-500/20 bg-zinc-950/45 shadow-[0_0_20px_rgba(6,182,212,0.03)]'
              : terminalTab === 'tomorrow'
              ? 'border-purple-500/20 bg-zinc-950/45 shadow-[0_0_20px_rgba(168,85,247,0.03)]'
              : terminalTab === 'week'
              ? 'border-emerald-500/20 bg-zinc-950/45 shadow-[0_0_20px_rgba(16,185,129,0.03)]'
              : terminalTab === 'deferred'
              ? 'border-amber-500/20 bg-zinc-950/45 shadow-[0_0_20px_rgba(245,158,11,0.02)]'
              : 'border-rose-500/35 bg-zinc-950/50 shadow-[0_0_20px_rgba(239,68,68,0.04)]'
          }`} 
          id="unified-terminal"
        >
          <div className={`absolute inset-0 pointer-events-none bg-[size:100%_4px] transition-all duration-300 ${
            terminalTab === 'today'
              ? 'bg-[linear-gradient(to_bottom,rgba(6,182,212,0.01)_1px,transparent_1px)]'
              : terminalTab === 'tomorrow'
              ? 'bg-[linear-gradient(to_bottom,rgba(168,85,247,0.01)_1px,transparent_1px)]'
              : terminalTab === 'week'
              ? 'bg-[linear-gradient(to_bottom,rgba(16,185,129,0.01)_1px,transparent_1px)]'
              : terminalTab === 'deferred'
              ? 'bg-[linear-gradient(to_bottom,rgba(245,158,11,0.01)_1px,transparent_1px)]'
              : 'bg-[linear-gradient(to_bottom,rgba(239,68,68,0.015)_1px,transparent_1px)]'
          }`} />
          
          {/* Terminal Header with Window Controls & Styled Tabs */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center pb-3 border-b border-white/10 mb-4 shrink-0 gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              {/* Terminal OS window indicator dots */}
              <div className="flex items-center gap-1.5 mr-1.5 shrink-0">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              </div>
              
              {/* Embedded interactive tab toggles */}
              <div className="flex flex-wrap bg-zinc-900/90 p-0.5 rounded border border-white/5 shrink-0 gap-0.5 max-w-full">
                <button
                  type="button"
                  onClick={() => setTerminalTab('today')}
                  className={`flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono rounded uppercase transition-all duration-150 ${
                    terminalTab === 'today'
                      ? 'bg-cyan-950 text-cyan-400 font-bold border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.05)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Terminal className="h-3 w-3" />
                  TODAY ({todayQuests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalTab('tomorrow')}
                  className={`flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono rounded uppercase transition-all duration-150 ${
                    terminalTab === 'tomorrow'
                      ? 'bg-purple-950 text-purple-400 font-bold border border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.05)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  TOMORROW ({tomorrowQuests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalTab('week')}
                  className={`flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono rounded uppercase transition-all duration-150 ${
                    terminalTab === 'week'
                      ? 'bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.05)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Compass className="h-3 w-3" />
                  WEEK ({weekQuests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalTab('deferred')}
                  className={`flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono rounded uppercase transition-all duration-150 ${
                    terminalTab === 'deferred'
                      ? 'bg-amber-950 text-amber-400 font-bold border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  DEFERRED ({tomorrowPostponedQuests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalTab('penalty')}
                  className={`flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono rounded uppercase transition-all duration-150 ${
                    terminalTab === 'penalty'
                      ? 'bg-rose-950 text-rose-400 font-bold border border-rose-500/20 shadow-[0_0_8px_rgba(239,68,68,0.05)]'
                      : 'text-zinc-500 hover:text-rose-400'
                  }`}
                >
                  <Skull className="h-3 w-3 text-rose-500" />
                  PENALTY ({penaltyQuests.length})
                </button>
              </div>
            </div>

            {/* Dynamic state monitor badge */}
            {terminalTab === 'today' ? (
              <div className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-bold tracking-wide shrink-0">
                ACTIVE: {todayQuests.filter(q => !isQuestFinishedForToday(q)).length} LEFT
              </div>
            ) : terminalTab === 'tomorrow' ? (
              <div className="text-[10px] font-mono text-purple-400/80 bg-purple-950/30 border border-purple-500/15 px-2 py-0.5 rounded uppercase font-bold tracking-wide shrink-0">
                FORECAST: {tomorrowQuests.filter(q => !isQuestFinishedForToday(q)).length} ACTIVE
              </div>
            ) : terminalTab === 'week' ? (
              <div className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/30 border border-emerald-500/15 px-2 py-0.5 rounded uppercase font-bold tracking-wide shrink-0">
                7D_HORIZON: {weekQuests.filter(q => !isQuestFinishedForToday(q)).length} ACTIVE
              </div>
            ) : terminalTab === 'deferred' ? (
              <div className="text-[10px] font-mono text-amber-400/80 bg-amber-950/30 border border-amber-500/15 px-2 py-0.5 rounded uppercase font-bold tracking-wide shrink-0">
                DEFERRED: {tomorrowPostponedQuests.length}
              </div>
            ) : (
              <div className="text-[10px] font-mono text-rose-400 bg-rose-950/30 border border-rose-500/15 px-2 py-0.5 rounded uppercase font-bold tracking-wide shrink-0 animate-pulse">
                CONSTRAINTS: {penaltyQuests.length}
              </div>
            )}
          </div>

          {/* Dynamic Body Log description box */}
          {terminalTab === 'today' ? (
            <div className="bg-zinc-900/60 border border-white/5 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-500 mb-4 shrink-0 leading-relaxed">
              <span className="text-cyan-400/80">root@pos-os:~#</span> cat /sys/today_operational_log<br/>
              Running daily operational protocol. Completed objectives archive below.
            </div>
          ) : terminalTab === 'tomorrow' ? (
            <div className="bg-zinc-900/60 border border-white/5 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-500 mb-4 shrink-0 leading-relaxed">
              <span className="text-purple-400/80">root@pos-os:~#</span> cat /sys/tomorrow_operational_log<br/>
              Simulating next-cycle directives. Anticipating objective schedules.
            </div>
          ) : terminalTab === 'week' ? (
            <div className="bg-zinc-900/60 border border-white/5 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-500 mb-4 shrink-0 leading-relaxed">
              <span className="text-emerald-400/80">root@pos-os:~#</span> cat /sys/week_horizon_log<br/>
              Analyzing 7-day milestone projection. Balancing recurring workloads.
            </div>
          ) : terminalTab === 'deferred' ? (
            <div className="bg-zinc-900/60 border border-white/5 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-500 mb-4 shrink-0 leading-relaxed">
              <span className="text-amber-500/80">root@pos-os:~#</span> cat /sys/deferred_queue_log<br/>
              Operational objectives postponed to future cycles. Click &lt;Accelerate&gt; to pull back.
            </div>
          ) : (
            <div className="bg-zinc-900/60 border border-rose-950/40 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-500 mb-4 shrink-0 leading-relaxed">
              <span className="text-rose-500">root@pos-os:~#</span> cat /sys/penalty_recovery_log<br/>
              ACTIVE SYSTEM PENALTIES DETECTED. Complete these directives immediately to disable Recovery Mode restriction lock.
            </div>
          )}

          {/* Dynamic unified Quest list scroll region */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {terminalTab === 'today' ? (
              todayQuests.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-cyan-500/10 rounded-lg">
                  <Terminal className="h-8 w-8 text-zinc-600 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-zinc-500 font-mono">NO ACTIVE DIRECTIVES LOGGED FOR THIS CYCLE</p>
                  <p className="text-[9px] text-zinc-600 font-mono mt-1">Use top CLI prompt to register a new directive.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {todayQuests.map(q => renderQuestCard(q, false))}
                </AnimatePresence>
              )
            ) : terminalTab === 'tomorrow' ? (
              tomorrowQuests.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-purple-500/10 rounded-lg">
                  <Calendar className="h-8 w-8 text-zinc-600 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-zinc-500 font-mono">NO DIRECTIVES FORECAST FOR TOMORROW</p>
                  <p className="text-[9px] text-zinc-600 font-mono mt-1">No tasks scheduled or due on tomorrow's date.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {tomorrowQuests.map(q => renderQuestCard(q, true))}
                </AnimatePresence>
              )
            ) : terminalTab === 'week' ? (
              weekQuests.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-emerald-500/10 rounded-lg">
                  <Compass className="h-8 w-8 text-zinc-600 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-zinc-500 font-mono">NO DIRECTIVES PLANNED FOR THE 7-DAY HORIZON</p>
                  <p className="text-[9px] text-zinc-600 font-mono mt-1">All upcoming days are clear of operational loads.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {weekQuests.map(q => renderQuestCard(q, true))}
                </AnimatePresence>
              )
            ) : terminalTab === 'deferred' ? (
              tomorrowPostponedQuests.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-amber-500/10 rounded-lg">
                  <Calendar className="h-8 w-8 text-zinc-600 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-zinc-500 font-mono">NO OBJECTIVES DELAYED OR POSTPONED</p>
                  <p className="text-[9px] text-zinc-600 font-mono mt-1">Postpone any active task to defer execution load.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {tomorrowPostponedQuests.map(q => renderQuestCard(q, true))}
                </AnimatePresence>
              )
            ) : (
              penaltyQuests.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-rose-500/20 bg-rose-950/5 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-rose-300 font-mono font-bold uppercase tracking-wider">ALL PENALTIES CLEANED & RECOVERED</p>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1">Operational protocol normal. No active penalty directives found.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {penaltyQuests.map(q => renderQuestCard(q, false))}
                </AnimatePresence>
              )
            )}
          </div>
        </div>

        {/* Right Column: Quest HUD Terminal Inspector */}
        <div 
          className="lg:col-span-2 glass-panel rounded-lg p-5 border border-cyan-500/15 bg-zinc-950/60 shadow-[0_0_25px_rgba(6,182,212,0.03)] flex flex-col h-full relative overflow-hidden"
          id="unified-hud-inspector"
        >
          {renderQuestTerminalHUD()}
        </div>
      </div>
    </div>
  );
};
