import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { 
  Folder, FolderOpen, List, Plus, Trash2, Edit3, X, Check,
  ChevronDown, ChevronRight, FolderPlus, PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const QuestDirectory: React.FC = () => {
  const {
    state,
    addFolder,
    updateFolder,
    deleteFolder,
    addList,
    updateList,
    deleteList,
    selectedFolderId,
    setSelectedFolderId,
    selectedListId,
    setSelectedListId
  } = usePOS();

  // Expanded folders state (keeps track of folder IDs that are expanded in the tree)
  const [expandedFolderIds, setExpandedFolderIds] = useState<Record<string, boolean>>(() => {
    // Expand first few folders by default if they exist
    return {};
  });

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

  const toggleFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolderIds(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
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
      setSelectedListId(null); // Reset list selection if a folder itself is selected
    }
  };

  const handleSelectList = (listId: string | null, folderId: string | null = null) => {
    setSelectedListId(listId);
    if (listId === null) {
      setSelectedFolderId(null);
    } else {
      // Keep track of parent folder if selected list belongs to one
      setSelectedFolderId(folderId);
    }
  };

  // Helper: Count quests in list
  const getQuestCountInList = (listId: string) => {
    const listQuests = state.quests.filter(q => q.listId === listId);
    const activeCount = listQuests.filter(q => q.status === 'Active').length;
    return { active: activeCount, total: listQuests.length };
  };

  // Helper: Count quests in folder (sum of all lists in folder)
  const getQuestCountInFolder = (folderId: string) => {
    const listIdsInFolder = (state.lists || []).filter(l => l.folderId === folderId).map(l => l.id);
    const folderQuests = state.quests.filter(q => q.listId && listIdsInFolder.includes(q.listId));
    const activeCount = folderQuests.filter(q => q.status === 'Active').length;
    return { active: activeCount, total: folderQuests.length };
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

  const folders = state.folders || [];
  const lists = state.lists || [];
  const standaloneLists = lists.filter(l => !l.folderId);

  return (
    <div className="glass-panel rounded-lg p-5 flex flex-col h-full" id="quest-directory-panel">
      <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4">
        <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <FolderOpen className="h-4 w-4 text-cyan-400" /> QUEST_ORGANIZER_TREE
        </h4>
        <div className="flex gap-1">
          <button
            onClick={() => {
              setShowAddFolder(!showAddFolder);
              setShowAddList(false);
              setEditingFolderId(null);
              setEditingListId(null);
            }}
            className="p-1 text-zinc-400 hover:text-cyan-400 transition-colors"
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
              if (folders.length > 0) {
                setListTargetFolderId(folders[0].id);
              } else {
                setListTargetFolderId('');
              }
            }}
            className="p-1 text-zinc-400 hover:text-cyan-400 transition-colors"
            title="Create List"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* CREATE FOLDER INLINE FORM */}
      <AnimatePresence>
        {showAddFolder && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateFolder}
            className="bg-zinc-950/80 border border-white/5 rounded p-3 mb-4 space-y-2 overflow-hidden"
          >
            <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">CREATE_NEW_FOLDER</div>
            <input
              type="text"
              placeholder="Folder Name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white"
              required
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={folderDesc}
              onChange={(e) => setFolderDesc(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-[11px] text-zinc-300"
            />
            
            {/* Color selector */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Terminal Accent Color</span>
              <div className="flex gap-2.5 py-1">
                {colorPresets.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFolderColor(preset.value)}
                    className="w-4 h-4 rounded-full border transition-all"
                    style={{
                      backgroundColor: preset.value,
                      borderColor: folderColor === preset.value ? '#ffffff' : 'transparent',
                      transform: folderColor === preset.value ? 'scale(1.2)' : 'scale(1)'
                    }}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAddFolder(false)}
                className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 uppercase px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-cyan-950 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono px-3 py-1 rounded uppercase hover:bg-cyan-900"
              >
                Create
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* CREATE LIST INLINE FORM */}
      <AnimatePresence>
        {showAddList && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateList}
            className="bg-zinc-950/80 border border-white/5 rounded p-3 mb-4 space-y-2 overflow-hidden"
          >
            <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">CREATE_NEW_LIST</div>
            <input
              type="text"
              placeholder="List Name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white"
              required
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={listDesc}
              onChange={(e) => setListDesc(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-[11px] text-zinc-300"
            />
            
            {/* Assign list to folder */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Parent Folder</span>
              <select
                value={listTargetFolderId}
                onChange={(e) => setListTargetFolderId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-zinc-300 font-sans focus:outline-none focus:border-cyan-500"
              >
                <option value="">No Folder (Standalone List)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>📁 {f.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAddList(false)}
                className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 uppercase px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-cyan-950 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono px-3 py-1 rounded uppercase hover:bg-cyan-900"
              >
                Create
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* EDIT FOLDER FORM */}
      <AnimatePresence>
        {editingFolderId && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveFolderEdit}
            className="bg-zinc-950 border border-cyan-500/20 rounded p-3 mb-4 space-y-2 overflow-hidden"
          >
            <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex justify-between items-center">
              <span>EDIT_FOLDER</span>
              <button type="button" onClick={() => setEditingFolderId(null)} className="text-zinc-500 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white"
              required
            />
            <input
              type="text"
              value={editFolderDesc}
              onChange={(e) => setEditFolderDesc(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-[11px] text-zinc-300"
              placeholder="Description"
            />
            
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Color</span>
              <div className="flex gap-2.5 py-1">
                {colorPresets.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setEditFolderColor(preset.value)}
                    className="w-4 h-4 rounded-full border transition-all"
                    style={{
                      backgroundColor: preset.value,
                      borderColor: editFolderColor === preset.value ? '#ffffff' : 'transparent',
                      transform: editFolderColor === preset.value ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="submit"
                className="bg-cyan-950 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono px-3 py-1 rounded uppercase hover:bg-cyan-900"
              >
                Save
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* EDIT LIST FORM */}
      <AnimatePresence>
        {editingListId && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveListEdit}
            className="bg-zinc-950 border border-cyan-500/20 rounded p-3 mb-4 space-y-2 overflow-hidden"
          >
            <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex justify-between items-center">
              <span>EDIT_LIST</span>
              <button type="button" onClick={() => setEditingListId(null)} className="text-zinc-500 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={editListName}
              onChange={(e) => setEditListName(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white"
              required
            />
            <input
              type="text"
              value={editListDesc}
              onChange={(e) => setEditListDesc(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-[11px] text-zinc-300"
              placeholder="Description"
            />
            
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Folder Assignment</span>
              <select
                value={editListFolderId}
                onChange={(e) => setEditListFolderId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-zinc-300"
              >
                <option value="">No Folder (Standalone)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="submit"
                className="bg-cyan-950 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono px-3 py-1 rounded uppercase hover:bg-cyan-900"
              >
                Save
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* TREE LIST DIRECTORY */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[500px]">
        {/* CLEAR FILTERS / ALL QUESTS LINK */}
        <button
          onClick={() => handleSelectFolder(null)}
          className={`w-full flex items-center justify-between text-xs font-mono py-2 px-3 border rounded text-left transition-all ${
            selectedFolderId === null && selectedListId === null
              ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)] font-bold'
              : 'bg-zinc-900/30 border-white/5 text-zinc-400 hover:border-white/10 hover:bg-zinc-900/50'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>⚔️</span>
            <span>ALL_ACTIVE_QUESTS</span>
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {state.quests.filter(q => q.status === 'Active').length}
          </span>
        </button>

        {/* FOLDERS LOOP */}
        <div className="space-y-1.5">
          {folders.map(folder => {
            const isFolderExpanded = expandedFolderIds[folder.id];
            const isFolderSelected = selectedFolderId === folder.id && selectedListId === null;
            const folderQuests = getQuestCountInFolder(folder.id);
            const folderLists = lists.filter(l => l.folderId === folder.id);

            return (
              <div key={folder.id} className="space-y-1">
                {/* Folder Row */}
                <div
                  onClick={() => handleSelectFolder(folder.id)}
                  className={`group flex items-center justify-between text-xs py-1.5 px-2.5 border rounded cursor-pointer transition-all ${
                    isFolderSelected
                      ? 'bg-cyan-950/25 text-white border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.15)] font-bold'
                      : 'bg-zinc-900/40 border-white/5 text-zinc-300 hover:bg-zinc-900/70 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
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
                    {/* Active/total quests badge */}
                    <span className="text-[10px] font-mono text-zinc-500 px-1">
                      {folderQuests.active > 0 ? `${folderQuests.active}/` : ''}{folderQuests.total}
                    </span>

                    {/* Actions on hover */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => startEditFolder(folder, e)}
                        className="p-0.5 text-zinc-500 hover:text-cyan-400"
                        title="Edit Folder"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete the folder "${folder.name}"? Lists inside it will be kept but made standalone.`)) {
                            deleteFolder(folder.id);
                            if (selectedFolderId === folder.id) {
                              setSelectedFolderId(null);
                            }
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

                {/* Lists inside Folder (Rendered only if folder is expanded) */}
                <AnimatePresence initial={false}>
                  {isFolderExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-5 space-y-1 overflow-hidden"
                    >
                      {folderLists.length === 0 ? (
                        <div className="text-[10px] font-mono text-zinc-600 py-1 pl-6">
                          [Empty Folder]
                        </div>
                      ) : (
                        folderLists.map(list => {
                          const isListSelected = selectedListId === list.id;
                          const listQuests = getQuestCountInList(list.id);

                          return (
                            <div
                              key={list.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectList(list.id, folder.id);
                              }}
                              className={`group flex items-center justify-between text-[11px] py-1 px-2.5 border rounded cursor-pointer transition-all ${
                                isListSelected
                                  ? 'bg-cyan-950/30 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(34,211,238,0.1)] font-bold'
                                  : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:bg-zinc-900/40 hover:border-white/10 hover:text-zinc-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <List className="h-3 w-3 text-zinc-500 shrink-0" />
                                <span className="truncate font-sans">{list.name}</span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                <span className="text-[9px] font-mono text-zinc-600">
                                  {listQuests.active > 0 ? `${listQuests.active}/` : ''}{listQuests.total}
                                </span>

                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                  <button
                                    onClick={(e) => startEditList(list, e)}
                                    className="p-0.5 text-zinc-500 hover:text-cyan-400"
                                    title="Edit List"
                                  >
                                    <Edit3 className="h-2.5 w-2.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm(`Are you sure you want to delete the list "${list.name}"? Quests inside it will be preserved but cleared of this list.`)) {
                                        deleteList(list.id);
                                        if (selectedListId === list.id) {
                                          setSelectedListId(null);
                                        }
                                      }
                                    }}
                                    className="p-0.5 text-zinc-500 hover:text-rose-500"
                                    title="Delete List"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
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

        {/* STANDALONE LISTS */}
        {standaloneLists.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-white/5">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block pl-1">
              STANDALONE_LISTS
            </span>
            <div className="space-y-1">
              {standaloneLists.map(list => {
                const isListSelected = selectedListId === list.id;
                const listQuests = getQuestCountInList(list.id);

                return (
                  <div
                    key={list.id}
                    onClick={() => handleSelectList(list.id, null)}
                    className={`group flex items-center justify-between text-[11px] py-1.5 px-2.5 border rounded cursor-pointer transition-all ${
                      isListSelected
                        ? 'bg-cyan-950/35 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(34,211,238,0.1)] font-bold'
                        : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-900/70 hover:border-white/10 hover:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <List className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate font-sans">{list.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="text-[9px] font-mono text-zinc-500">
                        {listQuests.active > 0 ? `${listQuests.active}/` : ''}{listQuests.total}
                      </span>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={(e) => startEditList(list, e)}
                          className="p-0.5 text-zinc-500 hover:text-cyan-400"
                          title="Edit List"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete the list "${list.name}"? Quests inside it will be preserved but cleared of this list.`)) {
                              deleteList(list.id);
                              if (selectedListId === list.id) {
                                setSelectedListId(null);
                              }
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
              })}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER METADATA */}
      <div className="pt-3 border-t border-white/5 mt-4 text-[9px] font-mono text-zinc-500 leading-normal">
        <div>OR_STATUS: DIRECTORY_SYNCHRONIZED</div>
        <div>ACTIVE: {state.quests.filter(q => q.status === 'Active').length} | FOLDERS: {folders.length} | LISTS: {lists.length}</div>
      </div>
    </div>
  );
};
