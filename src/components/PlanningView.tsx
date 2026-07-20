import React, { useState, useMemo, useEffect } from 'react';
import { usePOS } from '../POSContext';
import { PlanningDocument } from '../types';
import { 
  Folder, FolderOpen, FileText, Plus, Edit2, Trash2, 
  BookOpen, Eye, Save, Link2, Unlink, ExternalLink,
  ChevronRight, ChevronDown, Search, Compass, CheckSquare, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlanningViewProps {
  onNavigate?: (tab: 'dashboard' | 'goals' | 'projects' | 'skills' | 'analytics' | 'system' | 'quests') => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ onNavigate }) => {
  const { 
    state, addPlanningDocument, updatePlanningDocument, deletePlanningDocument, linkPlanningDocToComponent 
  } = usePOS();

  const [selectedDocId, setSelectedDocId] = useState<string | null>('pdoc-00-1'); // Default to Life Vision
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Folder expansion state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '00 Vision': true,
    '01 Strategies': true,
    '02 Master Plans': false,
    '03 Tactical Playbooks': false,
    '04 Operations': false,
    '05 SOPs': false,
    '06 Frameworks': false,
    '07 Reviews': false,
    'Archive': false,
  });

  // Creation State
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileFolder, setNewFileFolder] = useState<string>('00 Vision');
  const [customFolder, setCustomFolder] = useState<string>('');

  // Folder editing / renaming state
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [folderRenameValue, setFolderRenameValue] = useState<string>('');

  // Editing state for current document content
  const [editContent, setEditContent] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editPath, setEditPath] = useState<string>('');

  // Link components dropdown selectors
  const [showLinkSelector, setShowLinkSelector] = useState<'goal' | 'project' | 'quest' | 'skill' | null>(null);

  const activeDoc = useMemo(() => {
    const doc = state.planningDocuments.find(d => d.id === selectedDocId);
    if (doc) {
      // Sync local editing buffers when doc selection changes
      setEditContent(doc.content);
      setEditName(doc.name);
      setEditPath(doc.path);
    }
    return doc;
  }, [selectedDocId, state.planningDocuments]);

  // Expand or collapse directory
  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Organize documents by virtual folders
  const folderStructure = useMemo(() => {
    const folders: Record<string, PlanningDocument[]> = {};

    state.planningDocuments.forEach(doc => {
      // Extract top folder name
      const parts = doc.path.split('/');
      const topFolder = parts[0] || 'Unsorted';
      if (!folders[topFolder]) {
        folders[topFolder] = [];
      }
      folders[topFolder].push(doc);
    });

    // Sort files within each folder alphabetically
    Object.keys(folders).forEach(k => {
      folders[k].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Return folders sorted alphabetically by folder name
    const sortedFolders: Record<string, PlanningDocument[]> = {};
    Object.keys(folders).sort().forEach(key => {
      sortedFolders[key] = folders[key];
    });

    return sortedFolders;
  }, [state.planningDocuments]);

  // Sync newFileFolder to first available folder if current one is deleted/renamed
  useEffect(() => {
    const folders = Object.keys(folderStructure);
    if (folders.length > 0 && !folders.includes(newFileFolder) && newFileFolder !== '__custom__') {
      setNewFileFolder(folders[0]);
    }
  }, [folderStructure, newFileFolder]);

  // Filtered folder structure based on search
  const filteredFolderStructure = useMemo(() => {
    if (!searchQuery.trim()) return folderStructure;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, PlanningDocument[]> = {};

    Object.keys(folderStructure).forEach(folder => {
      const docs = folderStructure[folder].filter(doc => 
        doc.name.toLowerCase().includes(query) || 
        doc.content.toLowerCase().includes(query)
      );
      if (docs.length > 0 || folder.toLowerCase().includes(query)) {
        filtered[folder] = folderStructure[folder].filter(doc => 
          doc.name.toLowerCase().includes(query) || 
          doc.content.toLowerCase().includes(query)
        );
      }
    });

    return filtered;
  }, [folderStructure, searchQuery]);

  // Icons for main folders
  const getFolderEmoji = (folder: string): string => {
    if (folder.includes('00 Vision')) return '🌍';
    if (folder.includes('01 Strategies')) return '🎯';
    if (folder.includes('02 Master Plans')) return '📋';
    if (folder.includes('03 Tactical Playbooks')) return '⚔️';
    if (folder.includes('04 Operations')) return '📅';
    if (folder.includes('05 SOPs')) return '📚';
    if (folder.includes('06 Frameworks')) return '🛠️';
    if (folder.includes('07 Reviews')) return '📊';
    if (folder.includes('Archive')) return '🗃️';
    return '📂';
  };

  // Custom visual markdown renderer that converts basic markdown to premium cybernetic HTML blocks
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return <p className="text-zinc-500 italic">This document is empty.</p>;

    const lines = markdown.split('\n');
    let inList = false;
    let listItems: React.ReactNode[] = [];
    const elements: React.ReactNode[] = [];

    const flushList = (key: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-6 space-y-1.5 my-3 text-zinc-300 font-sans leading-relaxed text-sm">
            {...listItems}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Inline code or inline styling parser
      const parseInlineStyles = (text: string): React.ReactNode[] => {
        const parts: React.ReactNode[] = [];
        let currentText = text;
        let styleKey = 0;

        // Simple parse for **bold**, *italic*, and `code`
        while (currentText.length > 0) {
          const boldMatch = currentText.match(/\*\*(.*?)\*\*/);
          const italicMatch = currentText.match(/\*(.*?)\*/);
          const codeMatch = currentText.match(/`(.*?)`/);

          // Find first match
          const matches = [
            { type: 'bold', index: boldMatch?.index ?? -1, length: boldMatch ? boldMatch[0].length : 0, content: boldMatch ? boldMatch[1] : '' },
            { type: 'italic', index: italicMatch?.index ?? -1, length: italicMatch ? italicMatch[0].length : 0, content: italicMatch ? italicMatch[1] : '' },
            { type: 'code', index: codeMatch?.index ?? -1, length: codeMatch ? codeMatch[0].length : 0, content: codeMatch ? codeMatch[1] : '' }
          ].filter(m => m.index !== -1).sort((a, b) => a.index - b.index);

          if (matches.length === 0) {
            parts.push(<span key={`text-${styleKey++}`}>{currentText}</span>);
            break;
          }

          const first = matches[0];
          // Add pre-match text
          if (first.index > 0) {
            parts.push(<span key={`text-${styleKey++}`}>{currentText.slice(0, first.index)}</span>);
          }

          // Add styled text
          if (first.type === 'bold') {
            parts.push(<strong key={`bold-${styleKey++}`} className="font-bold text-cyan-400 font-sans">{first.content}</strong>);
          } else if (first.type === 'italic') {
            parts.push(<em key={`italic-${styleKey++}`} className="italic text-zinc-300">{first.content}</em>);
          } else if (first.type === 'code') {
            parts.push(<code key={`code-${styleKey++}`} className="bg-zinc-900 border border-white/5 rounded px-1 py-0.5 text-xs font-mono text-cyan-300">{first.content}</code>);
          }

          currentText = currentText.slice(first.index + first.length);
        }

        return parts;
      };

      // Header H1
      if (trimmed.startsWith('# ')) {
        flushList(index);
        const text = trimmed.slice(2);
        elements.push(
          <h1 key={`h1-${index}`} className="text-2xl font-display font-extrabold tracking-tight text-white border-b border-white/5 pb-2 mt-6 mb-4 flex items-center gap-2 uppercase">
            {parseInlineStyles(text)}
          </h1>
        );
      }
      // Header H2
      else if (trimmed.startsWith('## ')) {
        flushList(index);
        const text = trimmed.slice(3);
        elements.push(
          <h2 key={`h2-${index}`} className="text-lg font-display font-bold tracking-tight text-white mt-5 mb-2.5 uppercase border-l-2 border-cyan-500/40 pl-2.5">
            {parseInlineStyles(text)}
          </h2>
        );
      }
      // Header H3
      else if (trimmed.startsWith('### ')) {
        flushList(index);
        const text = trimmed.slice(4);
        elements.push(
          <h3 key={`h3-${index}`} className="text-sm font-sans font-bold text-zinc-200 mt-4 mb-2 uppercase tracking-wide">
            {parseInlineStyles(text)}
          </h3>
        );
      }
      // Checkboxes (- [ ] or - [x])
      else if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
        flushList(index);
        const isChecked = trimmed.startsWith('- [x]');
        const text = trimmed.slice(5).trim();
        elements.push(
          <div key={`check-${index}`} className="flex items-start gap-2 my-2 text-sm text-zinc-300">
            <span className="mt-0.5 shrink-0">
              {isChecked 
                ? <CheckSquare className="h-4 w-4 text-cyan-400 fill-cyan-400/10" /> 
                : <span className="h-4 w-4 rounded border border-zinc-700 block shrink-0" />
              }
            </span>
            <span className={`${isChecked ? 'line-through text-zinc-500' : ''}`}>
              {parseInlineStyles(text)}
            </span>
          </div>
        );
      }
      // Bullet list items
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        const text = trimmed.slice(2);
        listItems.push(
          <li key={`li-${index}`} className="marker:text-cyan-500 leading-relaxed">
            {parseInlineStyles(text)}
          </li>
        );
      }
      // Blockquotes
      else if (trimmed.startsWith('> ')) {
        flushList(index);
        const text = trimmed.slice(2);
        elements.push(
          <blockquote key={`quote-${index}`} className="border-l-4 border-cyan-500/30 bg-zinc-900/30 pl-4 py-2 pr-2 my-3 rounded-r text-zinc-400 text-sm font-sans italic leading-relaxed">
            {parseInlineStyles(text)}
          </blockquote>
        );
      }
      // Blank line
      else if (trimmed === '') {
        flushList(index);
        elements.push(<div key={`blank-${index}`} className="h-3" />);
      }
      // Standard Paragraph
      else {
        if (inList) {
          // If in a list, we might have nested or multi-line. But keep it simple
          flushList(index);
        }
        elements.push(
          <p key={`p-${index}`} className="text-zinc-300 text-sm font-sans leading-relaxed my-2">
            {parseInlineStyles(trimmed)}
          </p>
        );
      }
    });

    // End-of-file flush
    if (inList) {
      flushList(lines.length);
    }

    return elements;
  };

  const handleSaveDoc = () => {
    if (!activeDoc) return;
    updatePlanningDocument(activeDoc.id, {
      content: editContent,
      name: editName,
      path: `${editPath.split('/')[0]}/${editName}`
    });
    setIsEditMode(false);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    // Ensure it ends with .md
    let finalName = newFileName.trim();
    if (!finalName.endsWith('.md')) {
      finalName += '.md';
    }

    const targetFolder = newFileFolder === '__custom__' ? customFolder.trim() : newFileFolder;
    if (!targetFolder) return;

    const fullPath = `${targetFolder}/${finalName}`;
    const defaultMarkdown = `# ${finalName.replace('.md', '')}\n\nSeed structured contents here aligned with your ${targetFolder.replace(/^\d+\s+/, '')} strategies.`;
    
    const newId = addPlanningDocument(fullPath, finalName, defaultMarkdown);
    
    // Reset inputs
    setNewFileName('');
    setCustomFolder('');
    setIsCreatingFile(false);
    setSelectedDocId(newId);
    setIsEditMode(true);
  };

  const handleDeleteFile = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action is local-only but irreversible.`)) {
      deletePlanningDocument(id);
      if (selectedDocId === id) {
        setSelectedDocId('pdoc-00-1');
        setIsEditMode(false);
      }
    }
  };

  const handleRenameFolder = (oldFolderName: string, newFolderName: string) => {
    const trimmedNewName = newFolderName.trim();
    if (!trimmedNewName || trimmedNewName === oldFolderName) {
      setEditingFolder(null);
      return;
    }

    // Update all files in this folder to have the new folder path
    const docsToUpdate = state.planningDocuments.filter(doc => doc.path.startsWith(oldFolderName + '/'));
    docsToUpdate.forEach(doc => {
      const restOfPath = doc.path.substring(oldFolderName.length + 1);
      updatePlanningDocument(doc.id, {
        path: `${trimmedNewName}/${restOfPath}`
      });
    });

    // Update folder expansion state if it was expanded
    if (expandedFolders[oldFolderName] !== undefined) {
      setExpandedFolders(prev => {
        const copy = { ...prev };
        const oldState = copy[oldFolderName];
        delete copy[oldFolderName];
        copy[trimmedNewName] = oldState;
        return copy;
      });
    }

    setEditingFolder(null);
  };

  const handleDeleteFolder = (folderName: string) => {
    const filesInFolder = state.planningDocuments.filter(doc => doc.path.startsWith(folderName + '/'));
    const message = filesInFolder.length > 0 
      ? `Are you sure you want to delete the folder "${folderName}" and all of its ${filesInFolder.length} files? This action is local-only but irreversible.`
      : `Are you sure you want to delete the folder "${folderName}"?`;

    if (window.confirm(message)) {
      filesInFolder.forEach(doc => {
        deletePlanningDocument(doc.id);
        if (selectedDocId === doc.id) {
          setSelectedDocId('pdoc-00-1');
          setIsEditMode(false);
        }
      });
    }
  };

  // Dropdown list options for linking
  const linkableGoals = useMemo(() => {
    if (!activeDoc) return [];
    return state.goals.filter(g => !activeDoc.linkedGoals?.includes(g.id));
  }, [state.goals, activeDoc]);

  const linkableProjects = useMemo(() => {
    if (!activeDoc) return [];
    return state.projects.filter(p => !activeDoc.linkedProjects?.includes(p.id));
  }, [state.projects, activeDoc]);

  const linkableQuests = useMemo(() => {
    if (!activeDoc) return [];
    return state.quests.filter(q => !activeDoc.linkedQuests?.includes(q.id));
  }, [state.quests, activeDoc]);

  const linkableSkills = useMemo(() => {
    if (!activeDoc) return [];
    return state.skills.filter(s => !activeDoc.linkedSkills?.includes(s.id));
  }, [state.skills, activeDoc]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full" id="planning-view-root">
      
      {/* LEFT COLUMN: VIRTUAL MARKDOWN DIRECTORY TREE */}
      <div className="lg:col-span-1 bg-zinc-900/40 border border-white/5 rounded-lg p-4 flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
        
        {/* Sidebar Header */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-sm font-extrabold text-white tracking-widest uppercase flex items-center gap-2">
              <Folder className="h-4 w-4 text-cyan-400 shrink-0" />
              PLANNING DIRECTORY
            </h3>
            
            {/* New File Trigger */}
            <button 
              onClick={() => setIsCreatingFile(true)}
              className="p-1 rounded bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-500/50 text-cyan-400 transition"
              title="Create New Document"
              id="btn-create-planning-doc"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-white/5 rounded pl-8 pr-3 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/30 placeholder-zinc-600"
            />
          </div>
        </div>

        {/* Directory Structure */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1" id="file-tree-container">
          {Object.keys(filteredFolderStructure).map((folderName) => {
            const hasFiles = filteredFolderStructure[folderName].length > 0;
            const isExpanded = expandedFolders[folderName];
            const folderEmoji = getFolderEmoji(folderName);

            return (
              <div key={folderName} className="space-y-0.5">
                {/* Folder Header Row */}
                <div className="group/folder flex items-center justify-between rounded hover:bg-white/[0.02] transition">
                  {editingFolder === folderName ? (
                    <div className="flex items-center gap-1.5 p-1 w-full">
                      <input
                        type="text"
                        value={folderRenameValue}
                        onChange={(e) => setFolderRenameValue(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-cyan-500/50 rounded px-1.5 py-0.5 text-xs font-mono text-zinc-300 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameFolder(folderName, folderRenameValue);
                        }}
                        className="px-1.5 py-0.5 bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-500/30 rounded text-[9px] font-mono shrink-0"
                      >
                        SAVE
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolder(null);
                        }}
                        className="px-1.5 py-0.5 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-white/5 rounded text-[9px] font-mono shrink-0"
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleFolder(folderName)}
                        className="flex-1 flex items-center justify-between text-left px-2 py-1.5 text-xs font-mono font-bold tracking-wide text-zinc-400 hover:text-white transition"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] text-zinc-600">
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                          </span>
                          <span>{folderEmoji} {folderName}</span>
                        </div>
                      </button>
                      
                      <div className="flex items-center gap-1 pr-2">
                        {/* Folder controls - visible on hover */}
                        <div className="opacity-0 group-hover/folder:opacity-100 flex items-center gap-1.5 mr-1.5 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFolder(folderName);
                              setFolderRenameValue(folderName);
                            }}
                            className="p-0.5 text-zinc-500 hover:text-cyan-400 transition"
                            title="Rename Folder"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folderName);
                            }}
                            className="p-0.5 text-zinc-500 hover:text-rose-400 transition"
                            title="Delete Folder"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-[9px] bg-zinc-950 px-1.5 py-0.5 rounded border border-white/5 text-zinc-500">
                          {filteredFolderStructure[folderName].length}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Folder Children Files */}
                {isExpanded && (
                  <div className="pl-4 border-l border-white/5 ml-3.5 space-y-0.5 my-1">
                    {hasFiles ? (
                      filteredFolderStructure[folderName].map((doc) => {
                        const isSelected = doc.id === selectedDocId;
                        return (
                          <div 
                            key={doc.id}
                            className={`group flex items-center justify-between pl-2 pr-1.5 py-1 rounded text-xs transition-all duration-150 ${
                              isSelected 
                                ? 'bg-cyan-500/10 text-cyan-300 font-bold border-l-2 border-cyan-400' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]'
                            }`}
                          >
                            <button
                              onClick={() => {
                                setSelectedDocId(doc.id);
                                setIsEditMode(false);
                              }}
                              className="flex-1 text-left font-mono truncate flex items-center gap-1.5 py-0.5"
                            >
                              <FileText className={`h-3 w-3 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-zinc-600'}`} />
                              <span className="truncate">{doc.name}</span>
                            </button>

                            {/* Delete specific document */}
                            <button
                              onClick={() => handleDeleteFile(doc.id, doc.name)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-600 hover:text-rose-400 transition"
                              title="Delete File"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-zinc-600 italic pl-5 block py-1 font-mono">Empty Folder</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create File Modal Pop-in */}
        <AnimatePresence>
          {isCreatingFile && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-3 p-3 bg-zinc-950 border border-cyan-500/20 rounded"
              id="create-file-widget"
            >
              <form onSubmit={handleCreateFile} className="space-y-2.5">
                <div>
                  <label className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">TARGET DIRECTORY</label>
                  <select 
                    value={newFileFolder}
                    onChange={(e) => setNewFileFolder(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded px-2 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/30"
                  >
                    {Object.keys(folderStructure).map(f => (
                      <option key={f} value={f}>{getFolderEmoji(f)} {f}</option>
                    ))}
                    <option value="__custom__">📁 [+ CREATE NEW FOLDER...]</option>
                  </select>

                  {newFileFolder === '__custom__' && (
                    <div className="mt-2">
                      <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">NEW FOLDER NAME</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 08 My Special Plans"
                        value={customFolder}
                        onChange={(e) => setCustomFolder(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/50 placeholder-zinc-600"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">FILE NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Health Roadmap.md"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/50 placeholder-zinc-600"
                    autoFocus
                  />
                </div>

                <div className="flex gap-1.5 justify-end text-[10px] font-mono pt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsCreatingFile(false)}
                    className="px-2 py-1 text-zinc-500 hover:text-zinc-300"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="bg-cyan-950 border border-cyan-500/30 text-cyan-300 px-2.5 py-1 rounded hover:bg-cyan-900/50"
                  >
                    CREATE
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT WORKSPACE: MARKDOWN VIEWER OR EDITOR */}
      <div className="lg:col-span-3 flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
        {activeDoc ? (
          <div className="bg-zinc-900/25 border border-white/5 rounded-lg flex flex-col h-full overflow-hidden">
            
            {/* Workspace Header */}
            <div className="glass-panel border-b border-white/5 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 tracking-wider uppercase block">
                  📂 {activeDoc.path}
                </span>
                <h2 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-400 shrink-0 animate-pulse" />
                  {activeDoc.name}
                </h2>
              </div>

              {/* Mode Toggle & Control Actions */}
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition ${
                    isEditMode
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                      : 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400 hover:border-cyan-500/40'
                  }`}
                  id="btn-toggle-view-edit"
                >
                  {isEditMode ? (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      PREVIEW MODE
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-3.5 w-3.5" />
                      EDIT MARKDOWN
                    </>
                  )}
                </button>

                {isEditMode && (
                  <button
                    onClick={handleSaveDoc}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 border border-cyan-500/30 text-cyan-300 rounded hover:bg-cyan-900/50 transition font-black"
                    title="Save Changes"
                    id="btn-save-planning-doc"
                  >
                    <Save className="h-3.5 w-3.5 animate-bounce" />
                    SAVE
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {isEditMode ? (
                /* EDIT MODE: TEXTAREA AND FORMATTING GUIDES */
                <div className="h-full flex flex-col space-y-3">
                  {/* Markdown Format Helpers Bar */}
                  <div className="flex flex-wrap gap-1 border-b border-white/5 pb-2">
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\n# `)}
                      className="px-2 py-1 bg-zinc-950 border border-white/5 text-[10px] font-mono hover:text-cyan-400 hover:border-cyan-500/20 rounded transition"
                      title="Header 1"
                    >
                      # H1
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\n## `)}
                      className="px-2 py-1 bg-zinc-950 border border-white/5 text-[10px] font-mono hover:text-cyan-400 hover:border-cyan-500/20 rounded transition"
                      title="Header 2"
                    >
                      ## H2
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\n- `)}
                      className="px-2 py-1 bg-zinc-950 border border-white/5 text-[10px] font-mono hover:text-cyan-400 hover:border-cyan-500/20 rounded transition"
                      title="Bullet List"
                    >
                      • List
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\n- [ ] `)}
                      className="px-2 py-1 bg-zinc-950 border border-white/5 text-[10px] font-mono hover:text-cyan-400 hover:border-cyan-500/20 rounded transition"
                      title="Checklist Item"
                    >
                      ☑ Checklist
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}**bold**`)}
                      className="px-2 py-1 bg-zinc-950 border border-white/5 text-[10px] font-mono hover:text-cyan-400 hover:border-cyan-500/20 rounded transition font-bold"
                      title="Bold"
                    >
                      B
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}*italic*`)}
                      className="px-2 py-1 bg-zinc-950 border border-white/5 text-[10px] font-mono hover:text-cyan-400 hover:border-cyan-500/20 rounded transition italic"
                      title="Italic"
                    >
                      I
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\`code\``)}
                      className="px-2 py-1 bg-zinc-950 border border-white/5 text-[10px] font-mono hover:text-cyan-400 hover:border-cyan-500/20 rounded transition"
                      title="Code Block"
                    >
                      &lt;/&gt;
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\n> `)}
                      className="px-2 py-1 bg-zinc-950 border border-white/5 text-[10px] font-mono hover:text-cyan-400 hover:border-cyan-500/20 rounded transition"
                      title="Quote"
                    >
                      &ldquo; Quote
                    </button>
                  </div>

                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full flex-1 bg-zinc-950 border border-white/5 rounded-lg p-4 font-mono text-sm leading-relaxed text-zinc-200 focus:outline-none focus:border-cyan-500/30 resize-none h-64 sm:h-auto min-h-[300px]"
                    placeholder="Write your markdown here..."
                  />
                  
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-1">
                    <span>CHARS: {editContent.length} • WORDS: {editContent.trim() ? editContent.trim().split(/\s+/).length : 0}</span>
                    <span>LAST SAVED: {new Date(activeDoc.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ) : (
                /* READ MODE: DETAILED CUSTOM RENDERED HTML AND SYSTEM LINKS PANEL */
                <div className="space-y-8" id="planning-document-view-content">
                  
                  {/* HTML Styled Markdown Output */}
                  <div className="prose max-w-none border-b border-white/5 pb-8">
                    {renderMarkdown(activeDoc.content)}
                  </div>

                  {/* CONNECTED SYSTEMS PANEL (INTEGRATING CRITICAL SYSTEM HOOKS) */}
                  <div className="space-y-4" id="document-connections-panel">
                    <h3 className="font-display text-xs font-bold text-zinc-400 tracking-widest uppercase flex items-center gap-2 border-b border-white/5 pb-2">
                      <Link2 className="h-3.5 w-3.5 text-cyan-400" />
                      CONNECTED SYSTEM HOOKS
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Strategic Goals Connection */}
                      <div className="bg-zinc-900/30 border border-white/5 rounded-lg p-3.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                            🎯 STRATEGIC GOALS
                          </span>
                          <button 
                            onClick={() => setShowLinkSelector(showLinkSelector === 'goal' ? null : 'goal')}
                            className="text-[9px] font-mono text-cyan-400 hover:underline"
                          >
                            {showLinkSelector === 'goal' ? '[CLOSE]' : '[LINK GOAL]'}
                          </button>
                        </div>

                        {/* Dropdown Goal selector */}
                        {showLinkSelector === 'goal' && (
                          <div className="p-2 bg-zinc-950 border border-white/5 rounded space-y-2">
                            {linkableGoals.length > 0 ? (
                              <div className="max-h-24 overflow-y-auto space-y-1">
                                {linkableGoals.map(g => (
                                  <button
                                    key={g.id}
                                    onClick={() => {
                                      linkPlanningDocToComponent(activeDoc.id, 'goal', g.id, true);
                                      setShowLinkSelector(null);
                                    }}
                                    className="w-full text-left font-mono text-[10px] hover:text-cyan-300 p-1 rounded hover:bg-white/[0.02]"
                                  >
                                    + {g.title}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[9px] font-mono text-zinc-600 italic">No unlinked goals in terminal.</p>
                            )}
                          </div>
                        )}

                        {/* Active Linked Goals */}
                        <div className="space-y-1.5">
                          {activeDoc.linkedGoals && activeDoc.linkedGoals.length > 0 ? (
                            state.goals.filter(g => activeDoc.linkedGoals.includes(g.id)).map(g => (
                              <div key={g.id} className="flex justify-between items-center bg-zinc-950 border border-white/[0.02] p-2 rounded text-xs">
                                <button
                                  onClick={() => onNavigate && onNavigate('goals')}
                                  className="font-mono text-[10px] text-zinc-300 hover:text-cyan-400 flex items-center gap-1.5 truncate text-left"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{g.title}</span>
                                </button>
                                <button
                                  onClick={() => linkPlanningDocToComponent(activeDoc.id, 'goal', g.id, false)}
                                  className="text-[9px] font-mono text-rose-500 hover:underline shrink-0 pl-2"
                                  title="Unlink"
                                >
                                  UNLINK
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] font-mono text-zinc-600 italic">No goals connected to this planning strategy.</p>
                          )}
                        </div>
                      </div>

                      {/* Operational Projects Connection */}
                      <div className="bg-zinc-900/30 border border-white/5 rounded-lg p-3.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                            💼 OPERATIONAL PROJECTS
                          </span>
                          <button 
                            onClick={() => setShowLinkSelector(showLinkSelector === 'project' ? null : 'project')}
                            className="text-[9px] font-mono text-cyan-400 hover:underline"
                          >
                            {showLinkSelector === 'project' ? '[CLOSE]' : '[LINK PROJECT]'}
                          </button>
                        </div>

                        {/* Dropdown Project selector */}
                        {showLinkSelector === 'project' && (
                          <div className="p-2 bg-zinc-950 border border-white/5 rounded space-y-2">
                            {linkableProjects.length > 0 ? (
                              <div className="max-h-24 overflow-y-auto space-y-1">
                                {linkableProjects.map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => {
                                      linkPlanningDocToComponent(activeDoc.id, 'project', p.id, true);
                                      setShowLinkSelector(null);
                                    }}
                                    className="w-full text-left font-mono text-[10px] hover:text-cyan-300 p-1 rounded hover:bg-white/[0.02]"
                                  >
                                    + {p.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[9px] font-mono text-zinc-600 italic">No unlinked projects in terminal.</p>
                            )}
                          </div>
                        )}

                        {/* Active Linked Projects */}
                        <div className="space-y-1.5">
                          {activeDoc.linkedProjects && activeDoc.linkedProjects.length > 0 ? (
                            state.projects.filter(p => activeDoc.linkedProjects.includes(p.id)).map(p => (
                              <div key={p.id} className="flex justify-between items-center bg-zinc-950 border border-white/[0.02] p-2 rounded text-xs">
                                <button
                                  onClick={() => onNavigate && onNavigate('projects')}
                                  className="font-mono text-[10px] text-zinc-300 hover:text-cyan-400 flex items-center gap-1.5 truncate text-left"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{p.name}</span>
                                </button>
                                <button
                                  onClick={() => linkPlanningDocToComponent(activeDoc.id, 'project', p.id, false)}
                                  className="text-[9px] font-mono text-rose-500 hover:underline shrink-0 pl-2"
                                >
                                  UNLINK
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] font-mono text-zinc-600 italic">No projects connected to this master plan.</p>
                          )}
                        </div>
                      </div>

                      {/* Active Quests Connection */}
                      <div className="bg-zinc-900/30 border border-white/5 rounded-lg p-3.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                            ⚔️ ACTIVE TERMINAL QUESTS
                          </span>
                          <button 
                            onClick={() => setShowLinkSelector(showLinkSelector === 'quest' ? null : 'quest')}
                            className="text-[9px] font-mono text-cyan-400 hover:underline"
                          >
                            {showLinkSelector === 'quest' ? '[CLOSE]' : '[LINK QUEST]'}
                          </button>
                        </div>

                        {/* Dropdown Quest selector */}
                        {showLinkSelector === 'quest' && (
                          <div className="p-2 bg-zinc-950 border border-white/5 rounded space-y-2">
                            {linkableQuests.length > 0 ? (
                              <div className="max-h-24 overflow-y-auto space-y-1">
                                {linkableQuests.map(q => (
                                  <button
                                    key={q.id}
                                    onClick={() => {
                                      linkPlanningDocToComponent(activeDoc.id, 'quest', q.id, true);
                                      setShowLinkSelector(null);
                                    }}
                                    className="w-full text-left font-mono text-[10px] hover:text-cyan-300 p-1 rounded hover:bg-white/[0.02]"
                                  >
                                    + {q.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[9px] font-mono text-zinc-600 italic">No unlinked quests in terminal.</p>
                            )}
                          </div>
                        )}

                        {/* Active Linked Quests */}
                        <div className="space-y-1.5">
                          {activeDoc.linkedQuests && activeDoc.linkedQuests.length > 0 ? (
                            state.quests.filter(q => activeDoc.linkedQuests.includes(q.id)).map(q => (
                              <div key={q.id} className="flex justify-between items-center bg-zinc-950 border border-white/[0.02] p-2 rounded text-xs">
                                <button
                                  onClick={() => onNavigate && onNavigate('quests')}
                                  className="font-mono text-[10px] text-zinc-300 hover:text-cyan-400 flex items-center gap-1.5 truncate text-left"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{q.name}</span>
                                </button>
                                <button
                                  onClick={() => linkPlanningDocToComponent(activeDoc.id, 'quest', q.id, false)}
                                  className="text-[9px] font-mono text-rose-500 hover:underline shrink-0 pl-2"
                                >
                                  UNLINK
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] font-mono text-zinc-600 italic">No quests associated with this playbook/SOP.</p>
                          )}
                        </div>
                      </div>

                      {/* Skills Path Connection */}
                      <div className="bg-zinc-900/30 border border-white/5 rounded-lg p-3.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                            🎖️ SKILL COMPETENCIES
                          </span>
                          <button 
                            onClick={() => setShowLinkSelector(showLinkSelector === 'skill' ? null : 'skill')}
                            className="text-[9px] font-mono text-cyan-400 hover:underline"
                          >
                            {showLinkSelector === 'skill' ? '[CLOSE]' : '[LINK SKILL]'}
                          </button>
                        </div>

                        {/* Dropdown Skill selector */}
                        {showLinkSelector === 'skill' && (
                          <div className="p-2 bg-zinc-950 border border-white/5 rounded space-y-2">
                            {linkableSkills.length > 0 ? (
                              <div className="max-h-24 overflow-y-auto space-y-1">
                                {linkableSkills.map(s => (
                                  <button
                                    key={s.id}
                                    onClick={() => {
                                      linkPlanningDocToComponent(activeDoc.id, 'skill', s.id, true);
                                      setShowLinkSelector(null);
                                    }}
                                    className="w-full text-left font-mono text-[10px] hover:text-cyan-300 p-1 rounded hover:bg-white/[0.02]"
                                  >
                                    + {s.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[9px] font-mono text-zinc-600 italic">No unlinked skills in terminal.</p>
                            )}
                          </div>
                        )}

                        {/* Active Linked Skills */}
                        <div className="space-y-1.5">
                          {activeDoc.linkedSkills && activeDoc.linkedSkills.length > 0 ? (
                            state.skills.filter(s => activeDoc.linkedSkills.includes(s.id)).map(s => (
                              <div key={s.id} className="flex justify-between items-center bg-zinc-950 border border-white/[0.02] p-2 rounded text-xs">
                                <button
                                  onClick={() => onNavigate && onNavigate('skills')}
                                  className="font-mono text-[10px] text-zinc-300 hover:text-cyan-400 flex items-center gap-1.5 truncate text-left"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{s.name}</span>
                                </button>
                                <button
                                  onClick={() => linkPlanningDocToComponent(activeDoc.id, 'skill', s.id, false)}
                                  className="text-[9px] font-mono text-rose-500 hover:underline shrink-0 pl-2"
                                >
                                  UNLINK
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] font-mono text-zinc-600 italic">No active skills bound to this document.</p>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 bg-zinc-900/25 border border-white/5 rounded-lg flex flex-col justify-center items-center p-8 text-center text-zinc-500">
            <BookOpen className="h-10 w-10 text-zinc-700 mb-3 animate-pulse" />
            <p className="text-sm font-mono uppercase tracking-widest">Select a document from the directory to begin tracking strategy.</p>
          </div>
        )}
      </div>

    </div>
  );
};
