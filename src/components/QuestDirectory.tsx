import React, { useState } from 'react';
import { usePOS, isQuestArchived } from '../POSContext';
import { 
  Folder, FolderOpen, List, Plus, Trash2, Edit3, X, Check,
  ChevronDown, ChevronRight, FolderPlus, PlusCircle, GripVertical,
  Archive, ArchiveRestore, RotateCcw, PackageOpen, Boxes, FileBox, ShieldAlert, Sparkles, FolderArchive, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuestFolder, QuestList, Quest } from '../types';

export const QuestDirectory: React.FC = () => {
  const {
    state,
    addFolder,
    updateFolder,
    deleteFolder,
    archiveFolder,
    unarchiveFolder,
    reorderFolders,
    addList,
    updateList,
    deleteList,
    archiveList,
    unarchiveList,
    reorderLists,
    updateQuest,
    deleteQuest,
    archiveQuest,
    unarchiveQuest,
    selectedFolderId,
    setSelectedFolderId,
    selectedListId,
    setSelectedListId
  } = usePOS();

  // Expanded folders state (keeps track of folder IDs that are expanded in the tree)
  const [expandedFolderIds, setExpandedFolderIds] = useState<Record<string, boolean>>({});
  
  // Archive section expanded state
  const [isArchiveExpanded, setIsArchiveExpanded] = useState<boolean>(false);
  const [expandedArchivedFolderIds, setExpandedArchivedFolderIds] = useState<Record<string, boolean>>({});
  const [expandedArchivedListIds, setExpandedArchivedListIds] = useState<Record<string, boolean>>({});

  // Quick modal / picker state for unarchiving a quest to a specific list
  const [unarchivePickerQuest, setUnarchivePickerQuest] = useState<Quest | null>(null);
  const [targetListForUnarchive, setTargetListForUnarchive] = useState<string>('');

  // Creation / Editing states
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderDesc, setFolderDesc] = useState('');
  const [folderColor, setFolderColor] = useState('#22d3ee'); // Default cyan

  const [showAddList, setShowAddList] = useState(false);
  const [listName, setListName] = useState('');
  const [listDesc, setListDesc] = useState('');
  const [listTargetFolderId, setListTargetFolderId] = useState<string>('');

  // Editing existing items
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderDesc, setEditFolderDesc] = useState('');
  const [editFolderColor, setEditFolderColor] = useState('#22d3ee');

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState('');
  const [editListDesc, setEditListDesc] = useState('');
  const [editListFolderId, setEditListFolderId] = useState<string>('');

  // Drag & Drop State
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'LIST' | 'FOLDER' | 'QUEST'; folderId?: string | null } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ id: string; type: 'LIST' | 'FOLDER' | 'STANDALONE_SECTION' } | null>(null);

  const toggleFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolderIds(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const toggleArchivedFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedArchivedFolderIds(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const toggleArchivedListExpand = (listId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedArchivedListIds(prev => ({
      ...prev,
      [listId]: !prev[listId]
    }));
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    const newId = addFolder(folderName.trim(), folderDesc.trim() || undefined, folderColor);
    setFolderName('');
    setFolderDesc('');
    setShowAddFolder(false);
    // Auto-expand the new folder
    setExpandedFolderIds(prev => ({ ...prev, [newId]: true }));
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;
    const parentId = listTargetFolderId ? listTargetFolderId : null;
    addList(parentId, listName.trim(), listDesc.trim() || undefined);
    setListName('');
    setListDesc('');
    setShowAddList(false);
    if (parentId) {
      setExpandedFolderIds(prev => ({ ...prev, [parentId]: true }));
    }
  };

  const startEditFolder = (folder: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setEditFolderName(folder.name);
    setEditFolderDesc(folder.description || '');
    setEditFolderColor(folder.color || '#22d3ee');
    setEditingListId(null);
  };

  const handleSaveFolderEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolderId || !editFolderName.trim()) return;
    updateFolder(editingFolderId, {
      name: editFolderName.trim(),
      description: editFolderDesc.trim() || undefined,
      color: editFolderColor
    });
    setEditingFolderId(null);
  };

  const startEditList = (list: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingListId(list.id);
    setEditListName(list.name);
    setEditListDesc(list.description || '');
    setEditListFolderId(list.folderId || '');
    setEditingFolderId(null);
  };

  const handleSaveListEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListId || !editListName.trim()) return;
    updateList(editingListId, {
      name: editListName.trim(),
      description: editListDesc.trim() || undefined,
      folderId: editListFolderId ? editListFolderId : null
    });
    setEditingListId(null);
  };

  const handleSelectFolder = (folderId: string | null) => {
    if (folderId === null) {
      setSelectedFolderId(null);
      setSelectedListId(null);
    } else {
      setSelectedFolderId(folderId);
      setSelectedListId(null);
    }
  };

  const handleSelectList = (listId: string | null, folderId: string | null = null) => {
    setSelectedListId(listId);
    if (listId === null) {
      setSelectedFolderId(null);
    } else {
      setSelectedFolderId(folderId);
    }
  };

  // Helper: Count active quests in list (excluding archived)
  const getQuestCountInList = (listId: string) => {
    const listQuests = state.quests.filter(q => q.listId === listId && !isQuestArchived(q, state.lists, state.folders));
    const activeCount = listQuests.filter(q => q.status === 'Active').length;
    return { active: activeCount, total: listQuests.length };
  };

  // Helper: Count active quests in folder (excluding archived)
  const getQuestCountInFolder = (folderId: string) => {
    const listIdsInFolder = (state.lists || []).filter(l => l.folderId === folderId && !l.archived).map(l => l.id);
    const folderQuests = state.quests.filter(q => q.listId && listIdsInFolder.includes(q.listId) && !isQuestArchived(q, state.lists, state.folders));
    const activeCount = folderQuests.filter(q => q.status === 'Active').length;
    return { active: activeCount, total: folderQuests.length };
  };

  // Drag and Drop Handlers (Operate only on active items)
  const handleDragStartItem = (e: React.DragEvent, id: string, type: 'LIST' | 'FOLDER', folderId?: string | null) => {
    e.stopPropagation();
    const payload = { id, type, folderId };
    setDraggedItem(payload);
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEndItem = () => {
    setDraggedItem(null);
    setDragOverTarget(null);
  };

  const handleDragOverList = (e: React.DragEvent, targetList: QuestList) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTarget?.id !== targetList.id) {
      setDragOverTarget({ id: targetList.id, type: 'LIST' });
    }
  };

  const handleDropOnList = (e: React.DragEvent, targetList: QuestList) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);

    let payload = draggedItem;
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) payload = JSON.parse(raw);
      } catch (err) {}
    }

    if (!payload) return;

    if (payload.type === 'QUEST' && (payload as any).questId) {
      updateQuest((payload as any).questId, { listId: targetList.id });
      setDraggedItem(null);
      return;
    }

    if (payload.type === 'LIST' && payload.id !== targetList.id) {
      const currentLists = [...(state.lists || [])];
      const sourceIndex = currentLists.findIndex(l => l.id === payload.id);
      const targetIndex = currentLists.findIndex(l => l.id === targetList.id);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [movedList] = currentLists.splice(sourceIndex, 1);
        movedList.folderId = targetList.folderId; // Assign same folder as target list

        const newTargetIndex = currentLists.findIndex(l => l.id === targetList.id);
        currentLists.splice(newTargetIndex, 0, movedList);

        reorderLists(currentLists);
      }
    }
    setDraggedItem(null);
  };

  const handleDragOverFolder = (e: React.DragEvent, targetFolder: QuestFolder) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTarget?.id !== targetFolder.id) {
      setDragOverTarget({ id: targetFolder.id, type: 'FOLDER' });
    }
  };

  const handleDropOnFolder = (e: React.DragEvent, targetFolder: QuestFolder) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);

    let payload = draggedItem;
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) payload = JSON.parse(raw);
      } catch (err) {}
    }

    if (!payload) return;

    if (payload.type === 'QUEST' && (payload as any).questId) {
      const folderLists = (state.lists || []).filter(l => l.folderId === targetFolder.id && !l.archived);
      if (folderLists.length > 0) {
        updateQuest((payload as any).questId, { listId: folderLists[0].id });
      } else {
        const newListId = addList(targetFolder.id, 'General Tasks');
        updateQuest((payload as any).questId, { listId: newListId });
      }
      setDraggedItem(null);
      return;
    }

    if (payload.type === 'FOLDER' && payload.id !== targetFolder.id) {
      const currentFolders = [...(state.folders || [])];
      const sourceIndex = currentFolders.findIndex(f => f.id === payload.id);
      const targetIndex = currentFolders.findIndex(f => f.id === targetFolder.id);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [movedFolder] = currentFolders.splice(sourceIndex, 1);
        currentFolders.splice(targetIndex, 0, movedFolder);
        reorderFolders(currentFolders);
      }
    } else if (payload.type === 'LIST') {
      const currentLists = (state.lists || []).map(l => 
        l.id === payload.id ? { ...l, folderId: targetFolder.id } : l
      );
      reorderLists(currentLists);
      setExpandedFolderIds(prev => ({ ...prev, [targetFolder.id]: true }));
    }
    setDraggedItem(null);
  };

  const handleDragOverStandaloneSection = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTarget?.id !== 'standalone_section') {
      setDragOverTarget({ id: 'standalone_section', type: 'STANDALONE_SECTION' });
    }
  };

  const handleDropOnStandaloneSection = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);

    let payload = draggedItem;
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) payload = JSON.parse(raw);
      } catch (err) {}
    }

    if (!payload) return;

    if (payload.type === 'LIST') {
      const currentLists = (state.lists || []).map(l => 
        l.id === payload.id ? { ...l, folderId: null } : l
      );
      reorderLists(currentLists);
    }
    setDraggedItem(null);
  };

  // Presets of beautiful dark neon theme colors
  const colorPresets = [
    { value: '#22d3ee', label: 'Cyan' },
    { value: '#d946ef', label: 'Fuchsia' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#10b981', label: 'Emerald' },
    { value: '#f43f5e', label: 'Rose' },
    { value: '#8b5cf6', label: 'Purple' }
  ];

  // Active items
  const activeFolders = (state.folders || []).filter(f => !f.archived);
  const activeLists = (state.lists || []).filter(l => !l.archived);
  const activeStandaloneLists = activeLists.filter(l => !l.folderId);
  const activeQuestsCount = state.quests.filter(q => q.status === 'Active' && !isQuestArchived(q, state.lists, state.folders)).length;

  // Archived items
  const archivedFolders = (state.folders || []).filter(f => f.archived);
  const archivedLists = (state.lists || []).filter(l => l.archived);
  const directlyArchivedQuests = state.quests.filter(q => q.archived);
  
  // All quests that are archived either directly or via parent list/folder
  const allArchivedQuests = state.quests.filter(q => isQuestArchived(q, state.lists, state.folders));
  
  // Total archived components count
  const totalArchivedCount = archivedFolders.length + archivedLists.length + directlyArchivedQuests.length;

  return (
    <div className="glass-panel rounded-2xl border border-[#c5a059]/20 bg-[#0b0d13]/85 p-5 flex flex-col h-full shadow-[0_0_20px_rgba(13,18,26,0.8)]" id="quest-directory-panel">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
        <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <FolderOpen className="h-4 w-4 text-[#c5a059]" /> QUEST_ORGANIZER_TREE
        </h4>
        <div className="flex gap-1">
          <button
            onClick={() => {
              setShowAddFolder(!showAddFolder);
              setShowAddList(false);
              setEditingFolderId(null);
              setEditingListId(null);
            }}
            className="p-1 text-zinc-400 hover:text-[#e5c875] transition-colors"
            title="Create Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setShowAddList(!showAddList);
              setShowAddFolder(false);
              setEditingFolderId(null);
              setEditingListId(null);
              if (activeFolders.length > 0) {
                setListTargetFolderId(activeFolders[0].id);
              } else {
                setListTargetFolderId('');
              }
            }}
            className="p-1 text-zinc-400 hover:text-[#e5c875] transition-colors"
            title="Create List"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* CREATE FOLDER DRAWER */}
      <AnimatePresence>
        {showAddFolder && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateFolder}
            className="bg-[#0b0d13]/90 border border-[#c5a059]/30 rounded p-3 mb-3 space-y-2 text-xs font-mono"
          >
            <div className="flex justify-between items-center text-[#e5c875] font-bold">
              <span className="flex items-center gap-1">
                <FolderPlus className="h-3.5 w-3.5" /> NEW_DIRECTORY_FOLDER
              </span>
              <button
                type="button"
                onClick={() => setShowAddFolder(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Folder Name (e.g. Work, Health, Mastery)..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/60"
              autoFocus
            />
            <input
              type="text"
              placeholder="Optional Description..."
              value={folderDesc}
              onChange={(e) => setFolderDesc(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/60"
            />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-zinc-500">Color:</span>
              <div className="flex gap-1.5 flex-1">
                {colorPresets.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFolderColor(preset.value)}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      folderColor === preset.value ? 'scale-125 border-white ring-1 ring-white/50' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={!folderName.trim()}
                className="px-2.5 py-1 bg-[#3a2e12]/80 text-[#fef08a] border border-[#c5a059]/40 rounded hover:bg-[#524017] disabled:opacity-40 transition-colors font-bold"
              >
                CREATE
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* CREATE LIST DRAWER */}
      <AnimatePresence>
        {showAddList && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateList}
            className="bg-[#0b0d13]/90 border border-[#c5a059]/30 rounded p-3 mb-3 space-y-2 text-xs font-mono"
          >
            <div className="flex justify-between items-center text-[#e5c875] font-bold">
              <span className="flex items-center gap-1">
                <PlusCircle className="h-3.5 w-3.5" /> NEW_QUEST_LIST
              </span>
              <button
                type="button"
                onClick={() => setShowAddList(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="List Name (e.g. Sprint Tasks, Daily Rituals)..."
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/60"
              autoFocus
            />
            <input
              type="text"
              placeholder="Optional Description..."
              value={listDesc}
              onChange={(e) => setListDesc(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/60"
            />
            <div className="flex items-center gap-2 pt-1">
              <select
                value={listTargetFolderId}
                onChange={(e) => setListTargetFolderId(e.target.value)}
                className="bg-zinc-950 border border-white/10 rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-cyan-500/60 flex-1"
              >
                <option value="">[Standalone / Root List]</option>
                {activeFolders.map(f => (
                  <option key={f.id} value={f.id}>📁 Folder: {f.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!listName.trim()}
                className="px-2.5 py-1 bg-[#3a2e12]/80 text-[#fef08a] border border-[#c5a059]/40 rounded hover:bg-[#524017] disabled:opacity-40 transition-colors font-bold"
              >
                ADD_LIST
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* EDIT FOLDER MODAL/DRAWER */}
      <AnimatePresence>
        {editingFolderId && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveFolderEdit}
            className="bg-zinc-900/95 border border-amber-500/40 rounded p-3 mb-3 space-y-2 text-xs font-mono shadow-lg"
          >
            <div className="flex justify-between items-center text-amber-400 font-bold">
              <span className="flex items-center gap-1">
                <Edit3 className="h-3.5 w-3.5" /> EDIT_FOLDER
              </span>
              <button
                type="button"
                onClick={() => setEditingFolderId(null)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-amber-500/60"
            />
            <input
              type="text"
              placeholder="Description..."
              value={editFolderDesc}
              onChange={(e) => setEditFolderDesc(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-amber-500/60"
            />
            <div className="flex items-center gap-2 pt-1">
              <div className="flex gap-1.5 flex-1">
                {colorPresets.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setEditFolderColor(preset.value)}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      editFolderColor === preset.value ? 'scale-125 border-white ring-1 ring-white/50' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: preset.value }}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-500/30 transition-colors font-bold"
              >
                SAVE
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* EDIT LIST MODAL/DRAWER */}
      <AnimatePresence>
        {editingListId && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveListEdit}
            className="bg-zinc-900/95 border border-amber-500/40 rounded p-3 mb-3 space-y-2 text-xs font-mono shadow-lg"
          >
            <div className="flex justify-between items-center text-amber-400 font-bold">
              <span className="flex items-center gap-1">
                <Edit3 className="h-3.5 w-3.5" /> EDIT_LIST
              </span>
              <button
                type="button"
                onClick={() => setEditingListId(null)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={editListName}
              onChange={(e) => setEditListName(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-amber-500/60"
            />
            <input
              type="text"
              placeholder="Description..."
              value={editListDesc}
              onChange={(e) => setEditListDesc(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-amber-500/60"
            />
            <div className="flex items-center gap-2 pt-1">
              <select
                value={editListFolderId}
                onChange={(e) => setEditListFolderId(e.target.value)}
                className="bg-zinc-950 border border-white/10 rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-amber-500/60 flex-1"
              >
                <option value="">[Standalone / Root List]</option>
                {activeFolders.map(f => (
                  <option key={f.id} value={f.id}>📁 Folder: {f.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-500/30 transition-colors font-bold"
              >
                SAVE
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* UNARCHIVE QUEST DESTINATION PICKER MODAL (Fixed Centered Overlay) */}
      <AnimatePresence>
        {unarchivePickerQuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-zinc-950 border border-emerald-500/40 rounded-xl p-5 space-y-3.5 text-xs font-mono shadow-2xl max-w-md w-full"
            >
              <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-white/5 pb-2">
                <span className="flex items-center gap-2 text-sm">
                  <ArchiveRestore className="h-4 w-4 text-emerald-400" /> RESTORE_QUEST_DIRECTIVE
                </span>
                <button
                  type="button"
                  onClick={() => setUnarchivePickerQuest(null)}
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-zinc-300 text-xs">
                Restoring <span className="text-white font-bold">"{unarchivePickerQuest.name}"</span> back into active duty.
              </p>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Target Destination List:</label>
                <select
                  value={targetListForUnarchive}
                  onChange={(e) => setTargetListForUnarchive(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="">[Standalone Directive / Root]</option>
                  {activeFolders.map(f => {
                    const listsInFolder = activeLists.filter(l => l.folderId === f.id);
                    if (listsInFolder.length === 0) return null;
                    return (
                      <optgroup key={f.id} label={`📁 ${f.name}`}>
                        {listsInFolder.map(l => (
                          <option key={l.id} value={l.id}>📋 {l.name}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                  {activeStandaloneLists.length > 0 && (
                    <optgroup label="Standalone Lists">
                      {activeStandaloneLists.map(l => (
                        <option key={l.id} value={l.id}>📋 {l.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setUnarchivePickerQuest(null)}
                  className="px-3 py-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg border border-white/5 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    unarchiveQuest(unarchivePickerQuest.id, targetListForUnarchive || null);
                    setUnarchivePickerQuest(null);
                  }}
                  className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg hover:bg-emerald-500/30 font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all"
                >
                  <ArchiveRestore className="h-3.5 w-3.5" /> RESTORE DIRECTIVE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TREE LIST DIRECTORY */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[500px]">
        {/* CLEAR FILTERS / ALL ACTIVE QUESTS LINK */}
        <button
          onClick={() => handleSelectFolder(null)}
          className={`w-full flex items-center justify-between text-xs font-mono py-2 px-3 border rounded text-left transition-all ${
            selectedFolderId === null && selectedListId === null
              ? 'bg-[#3a2e12]/60 border-[#c5a059]/40 text-[#fef08a] shadow-[0_0_10px_rgba(197,160,89,0.12)] font-bold'
              : 'bg-zinc-900/30 border-white/5 text-zinc-400 hover:border-white/10 hover:bg-zinc-900/50'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>⚔️</span>
            <span>ALL_ACTIVE_QUESTS</span>
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {activeQuestsCount}
          </span>
        </button>

        {/* ACTIVE FOLDERS LOOP */}
        <div className="space-y-1.5">
          {activeFolders.map(folder => {
            const isFolderExpanded = expandedFolderIds[folder.id];
            const isFolderSelected = selectedFolderId === folder.id && selectedListId === null;
            const folderQuests = getQuestCountInFolder(folder.id);
            const folderLists = activeLists.filter(l => l.folderId === folder.id);

            const isFolderDragging = draggedItem?.id === folder.id;
            const isFolderOver = dragOverTarget?.id === folder.id && dragOverTarget?.type === 'FOLDER';

            return (
              <div 
                key={folder.id} 
                className="space-y-1"
                draggable
                onDragStart={(e) => handleDragStartItem(e, folder.id, 'FOLDER')}
                onDragEnd={handleDragEndItem}
                onDragOver={(e) => handleDragOverFolder(e, folder)}
                onDrop={(e) => handleDropOnFolder(e, folder)}
              >
                {/* Folder Row */}
                <div
                  onClick={() => handleSelectFolder(folder.id)}
                  className={`group flex items-center justify-between text-xs py-1.5 px-2 border rounded cursor-pointer transition-all ${
                    isFolderDragging
                      ? 'opacity-40 border-dashed border-[#c5a059]'
                      : isFolderOver
                        ? 'bg-[#3a2e12]/60 text-[#fef08a] border-[#c5a059] ring-2 ring-[#c5a059]/30 shadow-[0_0_15px_rgba(197,160,89,0.18)] font-bold'
                        : isFolderSelected
                          ? 'bg-[#3a2e12]/45 text-[#fef08a] border-[#c5a059]/40 shadow-[0_0_10px_rgba(197,160,89,0.12)] font-bold'
                          : 'bg-zinc-900/40 border-white/5 text-zinc-300 hover:bg-zinc-900/70 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <GripVertical className="h-3.5 w-3.5 text-zinc-600 hover:text-cyan-400 cursor-grab active:cursor-grabbing shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                    
                    <button
                      onClick={(e) => toggleFolderExpand(folder.id, e)}
                      className="text-zinc-500 hover:text-zinc-300 p-0.5"
                    >
                      {isFolderExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {isFolderExpanded ? (
                      <FolderOpen className="h-3.5 w-3.5 shrink-0" style={{ color: folder.color || '#22d3ee' }} />
                    ) : (
                      <Folder className="h-3.5 w-3.5 shrink-0" style={{ color: folder.color || '#22d3ee' }} />
                    )}
                    <span className="truncate font-sans font-medium" style={{ color: isFolderSelected ? '#ffffff' : (folder.color || undefined) }}>
                      {folder.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className="text-[10px] font-mono text-zinc-500 px-1">
                      {folderQuests.active > 0 ? `${folderQuests.active}/` : ''}{folderQuests.total}
                    </span>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      {/* Edit Folder */}
                      <button
                        onClick={(e) => startEditFolder(folder, e)}
                        className="p-0.5 text-zinc-500 hover:text-cyan-400"
                        title="Edit Folder"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>

                      {/* Archive Folder */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveFolder(folder.id, true);
                          if (selectedFolderId === folder.id) {
                            setSelectedFolderId(null);
                          }
                        }}
                        className="p-0.5 text-zinc-500 hover:text-amber-400"
                        title="Archive Folder (Exempt from midnight rule)"
                      >
                        <Archive className="h-3 w-3" />
                      </button>

                      {/* Delete Folder */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFolder(folder.id);
                          if (selectedFolderId === folder.id) {
                            setSelectedFolderId(null);
                          }
                        }}
                        className="p-0.5 text-zinc-500 hover:text-rose-500"
                        title="Delete Folder"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lists inside Folder */}
                <AnimatePresence initial={false}>
                  {isFolderExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-5 space-y-1 overflow-hidden"
                    >
                      {folderLists.length === 0 ? (
                        <div 
                          className={`text-[10px] font-mono text-zinc-600 py-1.5 pl-4 border border-dashed rounded ${
                            isFolderOver ? 'border-cyan-400/60 bg-cyan-950/20 text-cyan-300 font-bold' : 'border-white/5'
                          }`}
                        >
                          [Drop list or quest here]
                        </div>
                      ) : (
                        folderLists.map(list => {
                          const isListSelected = selectedListId === list.id;
                          const listQuests = getQuestCountInList(list.id);

                          const isListDragging = draggedItem?.id === list.id;
                          const isListOver = dragOverTarget?.id === list.id && dragOverTarget?.type === 'LIST';

                          return (
                            <div
                              key={list.id}
                              draggable
                              onDragStart={(e) => handleDragStartItem(e, list.id, 'LIST', folder.id)}
                              onDragEnd={handleDragEndItem}
                              onDragOver={(e) => handleDragOverList(e, list)}
                              onDrop={(e) => handleDropOnList(e, list)}
                              onClick={() => handleSelectList(list.id, folder.id)}
                              className={`group flex items-center justify-between text-[11px] py-1.5 px-2 border rounded cursor-pointer transition-all ${
                                isListDragging
                                  ? 'opacity-40 border-dashed border-[#c5a059]'
                                  : isListOver
                                    ? 'bg-[#3a2e12]/60 text-[#fef08a] border-[#c5a059] ring-1 ring-[#c5a059]/30 shadow-[0_0_12px_rgba(197,160,89,0.15)] font-bold'
                                    : isListSelected
                                      ? 'bg-[#3a2e12]/45 text-[#fef08a] border-[#c5a059]/30 shadow-[0_0_8px_rgba(197,160,89,0.1)] font-bold'
                                      : 'bg-zinc-900/30 border-white/5 text-zinc-400 hover:bg-zinc-900/60 hover:border-white/10 hover:text-zinc-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <GripVertical className="h-3.5 w-3.5 text-zinc-600 hover:text-cyan-400 cursor-grab active:cursor-grabbing shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                <List className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                                <span className="truncate font-sans">{list.name}</span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                <span className="text-[9px] font-mono text-zinc-500">
                                  {listQuests.active > 0 ? `${listQuests.active}/` : ''}{listQuests.total}
                                </span>

                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                  {/* Edit List */}
                                  <button
                                    onClick={(e) => startEditList(list, e)}
                                    className="p-0.5 text-zinc-500 hover:text-cyan-400"
                                    title="Edit List"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>

                                  {/* Archive List */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      archiveList(list.id, true);
                                      if (selectedListId === list.id) {
                                        setSelectedListId(null);
                                      }
                                    }}
                                    className="p-0.5 text-zinc-500 hover:text-amber-400"
                                    title="Archive List"
                                  >
                                    <Archive className="h-3 w-3" />
                                  </button>

                                  {/* Delete List */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteList(list.id);
                                      if (selectedListId === list.id) {
                                        setSelectedListId(null);
                                      }
                                    }}
                                    className="p-0.5 text-zinc-500 hover:text-rose-500"
                                    title="Delete List"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* STANDALONE ACTIVE LISTS SECTION */}
        <div 
          className="space-y-1 pt-1"
          onDragOver={handleDragOverStandaloneSection}
          onDrop={handleDropOnStandaloneSection}
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase px-1 pb-0.5">
            <span>STANDALONE_LISTS</span>
            <span className="text-[9px]">{activeStandaloneLists.length}</span>
          </div>

          <div className={`space-y-1 p-1 rounded transition-colors ${
            dragOverTarget?.id === 'standalone_section' ? 'bg-cyan-950/30 border border-dashed border-cyan-400/60' : ''
          }`}>
            {activeStandaloneLists.length === 0 ? (
              <div className="text-[10px] font-mono text-zinc-600 py-1 pl-2">
                [No standalone lists]
              </div>
            ) : (
              activeStandaloneLists.map(list => {
                const isListSelected = selectedListId === list.id;
                const listQuests = getQuestCountInList(list.id);

                const isListDragging = draggedItem?.id === list.id;
                const isListOver = dragOverTarget?.id === list.id && dragOverTarget?.type === 'LIST';

                return (
                  <div
                    key={list.id}
                    draggable
                    onDragStart={(e) => handleDragStartItem(e, list.id, 'LIST', null)}
                    onDragEnd={handleDragEndItem}
                    onDragOver={(e) => handleDragOverList(e, list)}
                    onDrop={(e) => handleDropOnList(e, list)}
                    onClick={() => handleSelectList(list.id, null)}
                    className={`group flex items-center justify-between text-[11px] py-1.5 px-2 border rounded cursor-pointer transition-all ${
                      isListDragging
                        ? 'opacity-40 border-dashed border-[#c5a059]'
                        : isListOver
                          ? 'bg-[#3a2e12]/60 text-[#fef08a] border-[#c5a059] ring-1 ring-[#c5a059]/30 shadow-[0_0_12px_rgba(197,160,89,0.15)] font-bold'
                          : isListSelected
                            ? 'bg-[#3a2e12]/45 text-[#fef08a] border-[#c5a059]/30 shadow-[0_0_8px_rgba(197,160,89,0.1)] font-bold'
                            : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-900/70 hover:border-white/10 hover:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <GripVertical className="h-3.5 w-3.5 text-zinc-600 hover:text-cyan-400 cursor-grab active:cursor-grabbing shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                      <List className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate font-sans">{list.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="text-[9px] font-mono text-zinc-500">
                        {listQuests.active > 0 ? `${listQuests.active}/` : ''}{listQuests.total}
                      </span>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        {/* Edit List */}
                        <button
                          onClick={(e) => startEditList(list, e)}
                          className="p-0.5 text-zinc-500 hover:text-cyan-400"
                          title="Edit List"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>

                        {/* Archive List */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveList(list.id, true);
                            if (selectedListId === list.id) {
                              setSelectedListId(null);
                            }
                          }}
                          className="p-0.5 text-zinc-500 hover:text-amber-400"
                          title="Archive List"
                        >
                          <Archive className="h-3 w-3" />
                        </button>

                        {/* Delete List */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteList(list.id);
                            if (selectedListId === list.id) {
                              setSelectedListId(null);
                            }
                          }}
                          className="p-0.5 text-zinc-500 hover:text-rose-500"
                          title="Delete List"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AUTOMATICALLY GENERATED ARCHIVE VAULT FOLDER */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-white/5 space-y-1">
          <div
            onClick={() => setIsArchiveExpanded(!isArchiveExpanded)}
            className={`group flex items-center justify-between text-xs py-2 px-2.5 rounded border cursor-pointer transition-all ${
              isArchiveExpanded
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)] font-bold'
                : 'bg-zinc-950/60 border-amber-500/20 text-zinc-400 hover:border-amber-500/35 hover:bg-zinc-900/60 hover:text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsArchiveExpanded(!isArchiveExpanded);
                }}
                className="text-amber-500/70 hover:text-amber-300 p-0.5"
              >
                {isArchiveExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
              <Archive className="h-4 w-4 text-amber-400 shrink-0" />
              <div className="truncate font-mono tracking-wider text-[11px] uppercase flex items-center gap-1.5">
                <span>ARCHIVE_VAULT</span>
                <span className="text-[9px] px-1 py-0.2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded font-mono">
                  EXEMPT
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-white/10 rounded text-amber-300 font-bold">
                {totalArchivedCount}
              </span>
            </div>
          </div>

          {/* EXPANDED ARCHIVE VAULT CONTENTS */}
          <AnimatePresence initial={false}>
            {isArchiveExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-2 pr-1 pt-1.5 space-y-3 overflow-hidden text-xs font-mono"
              >
                {/* Vault Info Badge */}
                <div className="p-2 bg-amber-950/20 border border-amber-500/20 rounded text-[10px] text-amber-200/80 leading-relaxed">
                  📦 <span className="font-bold text-amber-300">Archive Isolation:</span> Archived items are hidden from all operational terminals & dashboards and are 100% exempt from midnight penalties. Select any component below to return it to active duty.
                </div>

                {totalArchivedCount === 0 && (
                  <div className="py-4 text-center text-[10px] text-zinc-600 border border-dashed border-white/5 rounded">
                    [VAULT EMPTY — NO ARCHIVED ITEMS]
                  </div>
                )}

                {/* 1. ARCHIVED FOLDERS */}
                {archivedFolders.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                      <FolderArchive className="h-3 w-3 text-amber-400" />
                      <span>ARCHIVED_FOLDERS ({archivedFolders.length})</span>
                    </div>

                    <div className="space-y-1 pl-1">
                      {archivedFolders.map(folder => {
                        const isFolderOpen = expandedArchivedFolderIds[folder.id];
                        const folderArchivedLists = (state.lists || []).filter(l => l.folderId === folder.id);
                        const listIdsInThisFolder = folderArchivedLists.map(l => l.id);
                        const folderQuests = state.quests.filter(q => q.listId && listIdsInThisFolder.includes(q.listId));

                        return (
                          <div key={folder.id} className="bg-zinc-900/60 border border-amber-500/20 rounded p-2 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={(e) => toggleArchivedFolderExpand(folder.id, e)}
                                  className="text-zinc-500 hover:text-zinc-300 p-0.5"
                                >
                                  {isFolderOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                </button>
                                <Folder className="h-3.5 w-3.5 shrink-0" style={{ color: folder.color || '#f59e0b' }} />
                                <span className="font-sans font-medium text-zinc-200 truncate">{folder.name}</span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {/* Restore Folder and All Contents */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    unarchiveFolder(folder.id, true);
                                  }}
                                  className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] flex items-center gap-1 font-bold"
                                  title="Unarchive folder and restore all contained lists and quests"
                                >
                                  <ArchiveRestore className="h-3 w-3" />
                                  <span>RESTORE_ALL</span>
                                </button>

                                {/* Delete Folder Permanently */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteFolder(folder.id);
                                  }}
                                  className="p-1 text-zinc-500 hover:text-rose-400"
                                  title="Delete Permanently"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {/* Nested Lists & Quests inside Archived Folder */}
                            {isFolderOpen && (
                              <div className="pl-4 pt-1 space-y-1 border-t border-white/5 mt-1">
                                {folderArchivedLists.length === 0 && folderQuests.length === 0 ? (
                                  <div className="text-[9px] text-zinc-600 py-0.5">[Empty folder container]</div>
                                ) : (
                                  folderArchivedLists.map(list => {
                                    const listQuests = state.quests.filter(q => q.listId === list.id);
                                    return (
                                      <div key={list.id} className="bg-zinc-950/50 border border-white/5 rounded p-1.5 space-y-1">
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="flex items-center gap-1 text-zinc-300">
                                            <List className="h-3 w-3 text-zinc-500" />
                                            {list.name}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => unarchiveList(list.id, folder.id, true)}
                                            className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] flex items-center gap-1 font-bold"
                                            title="Unarchive only this list and its quests"
                                          >
                                            <ArchiveRestore className="h-2.5 w-2.5" />
                                            <span>RESTORE_LIST</span>
                                          </button>
                                        </div>

                                        {listQuests.length > 0 && (
                                          <div className="pl-3 space-y-0.5 pt-0.5">
                                            {listQuests.map(q => (
                                              <div key={q.id} className="flex items-center justify-between text-[10px] text-zinc-400 py-0.5">
                                                <span className="truncate pr-2">• {q.name}</span>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                  <button
                                                    type="button"
                                                    onClick={() => unarchiveQuest(q.id)}
                                                    className="text-emerald-400 hover:text-emerald-300 text-[9px] underline flex items-center gap-0.5 font-bold"
                                                    title="Instantly restore quest"
                                                  >
                                                    <ArchiveRestore className="h-2.5 w-2.5" /> restore
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setTargetListForUnarchive(q.listId || '');
                                                      setUnarchivePickerQuest(q);
                                                    }}
                                                    className="text-cyan-400 hover:text-cyan-300 text-[9px] underline"
                                                    title="Restore to specific destination"
                                                  >
                                                    to...
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. ARCHIVED STANDALONE / INDIVIDUAL LISTS */}
                {archivedLists.filter(l => !l.folderId || !archivedFolders.some(f => f.id === l.folderId)).length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                      <List className="h-3 w-3 text-amber-400" />
                      <span>ARCHIVED_LISTS</span>
                    </div>

                    <div className="space-y-1 pl-1">
                      {archivedLists
                        .filter(l => !l.folderId || !archivedFolders.some(f => f.id === l.folderId))
                        .map(list => {
                          const isListOpen = expandedArchivedListIds[list.id];
                          const listQuests = state.quests.filter(q => q.listId === list.id);

                          return (
                            <div key={list.id} className="bg-zinc-900/60 border border-amber-500/20 rounded p-2 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={(e) => toggleArchivedListExpand(list.id, e)}
                                    className="text-zinc-500 hover:text-zinc-300 p-0.5"
                                  >
                                    {isListOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                  </button>
                                  <List className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                  <span className="font-sans font-medium text-zinc-200 truncate">{list.name}</span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Restore List */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      unarchiveList(list.id, list.folderId || null, true);
                                    }}
                                    className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] flex items-center gap-1 font-bold"
                                    title="Unarchive list and return to active organizer"
                                  >
                                    <ArchiveRestore className="h-3 w-3" />
                                    <span>RESTORE_LIST</span>
                                  </button>

                                  {/* Delete List Permanently */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteList(list.id);
                                    }}
                                    className="p-1 text-zinc-500 hover:text-rose-400"
                                    title="Delete Permanently"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Nested Quests inside list */}
                              {isListOpen && (
                                <div className="pl-4 pt-1 space-y-0.5 border-t border-white/5 mt-1">
                                  {listQuests.length === 0 ? (
                                    <div className="text-[9px] text-zinc-600 py-0.5">[No quests in list]</div>
                                  ) : (
                                    listQuests.map(q => (
                                      <div key={q.id} className="flex items-center justify-between text-[10px] text-zinc-400 py-0.5">
                                        <span className="truncate pr-2">• {q.name}</span>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => unarchiveQuest(q.id)}
                                            className="text-emerald-400 hover:text-emerald-300 text-[9px] underline flex items-center gap-0.5 font-bold"
                                            title="Instantly restore quest"
                                          >
                                            <ArchiveRestore className="h-2.5 w-2.5" /> restore
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setTargetListForUnarchive(q.listId || '');
                                              setUnarchivePickerQuest(q);
                                            }}
                                            className="text-cyan-400 hover:text-cyan-300 text-[9px] underline"
                                            title="Restore to specific destination"
                                          >
                                            to...
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* 3. ARCHIVED DIRECTIVES / QUESTS */}
                {directlyArchivedQuests.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                      <Archive className="h-3 w-3 text-amber-400" />
                      <span>DIRECTLY_ARCHIVED_QUESTS ({directlyArchivedQuests.length})</span>
                    </div>

                    <div className="space-y-1 pl-1">
                      {directlyArchivedQuests.map(quest => (
                        <div key={quest.id} className="bg-zinc-900/60 border border-amber-500/20 rounded p-2 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-zinc-200 font-sans font-medium text-[11px] truncate flex items-center gap-1.5">
                              <span>⚔️</span>
                              <span>{quest.name}</span>
                            </div>
                            <div className="text-[9px] text-zinc-500 font-mono flex items-center gap-2 mt-0.5">
                              <span className="text-amber-400/80">+{quest.xp} XP</span>
                              <span>{quest.type}</span>
                              <span>{quest.difficulty}</span>
                              {quest.deadline && <span>Due: {quest.deadline}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* 1-Click Instant Restore Quest */}
                            <button
                              type="button"
                              onClick={() => unarchiveQuest(quest.id)}
                              className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] flex items-center gap-1 font-bold transition-all"
                              title="Instantly restore back to active directives"
                            >
                              <ArchiveRestore className="h-3 w-3" />
                              <span>RESTORE</span>
                            </button>

                            {/* Restore to specific destination */}
                            <button
                              type="button"
                              onClick={() => {
                                setTargetListForUnarchive(quest.listId || '');
                                setUnarchivePickerQuest(quest);
                              }}
                              className="px-1.5 py-0.5 bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/30 rounded text-[9px] flex items-center gap-0.5 transition-all"
                              title="Restore to a specific list/folder"
                            >
                              <span>TO...</span>
                            </button>

                            {/* Delete Quest */}
                            <button
                              type="button"
                              onClick={() => {
                                deleteQuest(quest.id);
                              }}
                              className="p-1 text-zinc-500 hover:text-rose-400"
                              title="Delete Permanently"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER METADATA */}
      <div className="pt-3 border-t border-white/5 mt-4 text-[9px] font-mono text-zinc-500 leading-normal flex justify-between items-center">
        <div>OR_STATUS: DIRECTORY_SYNCHRONIZED</div>
        <div>ACTIVE: {activeQuestsCount} | ARCHIVED: {totalArchivedCount}</div>
      </div>
    </div>
  );
};
