import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePOS } from '../POSContext';
import { 
  Network, Target, Award, Zap, Sparkles, Activity, Search, 
  Filter, Eye, Layers, Compass, RefreshCw, ZoomIn, ZoomOut, 
  Maximize2, Share2, Info, ArrowRight, ShieldCheck, Flame, CheckCircle,
  HelpCircle, Clock, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type NodeType = 'core' | 'goal' | 'project' | 'quest' | 'skill' | 'attribute' | 'milestone';

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  status?: string;
  level?: number;
  progress?: number;
  updatedAt?: string;
  x: number;
  y: number;
  radius: number;
  ring: number;
  angle: number;
  color: string;
  isModifiedRecently?: boolean;
  skillTier?: 'Primary' | 'Secondary';
  parentId?: string | null;
}

export interface GraphLink {
  id: string;
  source: string;
  target: string;
  sourceType: NodeType;
  targetType: NodeType;
  label?: string;
  isModifiedRecently?: boolean;
}

interface SpiderwebGraphProps {
  compact?: boolean;
  onSelectEntity?: (type: NodeType, id: string) => void;
}

export const SpiderwebGraph: React.FC<SpiderwebGraphProps> = ({ compact = false, onSelectEntity }) => {
  const { state } = usePOS();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<NodeType | 'all' | 'primary_skill' | 'secondary_skill'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);
  const [recentModifications, setRecentModifications] = useState<Array<{ id: string; type: NodeType; title: string; timestamp: string; action: string }>>([]);

  const prevItemsRef = useRef<string>('');

  // Dimensions of SVG spiderweb canvas
  const svgWidth = 800;
  const svgHeight = 800;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;

  // Concentric spiderweb rings radii
  const ringRadii = [0, 110, 200, 290, 360];

  // 1. DYNAMICALLY COMPUTE NODES & LINKS FROM POS STATE
  const { nodes, links, nodeMap, modifiedNodeIds } = useMemo(() => {
    const nodeList: GraphNode[] = [];
    const linkList: GraphLink[] = [];
    const nMap = new Map<string, GraphNode>();
    const modSet = new Set<string>();

    // Determine recently updated items (within last 24h or highest XP/recent status changes)
    const now = Date.now();

    // 1. CORE PLAYER NODE (Center)
    const coreNode: GraphNode = {
      id: 'core-player',
      name: state.profile.name || 'OPERATOR CORE',
      type: 'core',
      level: state.profile.level,
      status: 'Active',
      x: cx,
      y: cy,
      radius: 22,
      ring: 0,
      angle: 0,
      color: '#06b6d4' // Cyan
    };
    nodeList.push(coreNode);
    nMap.set(coreNode.id, coreNode);

    // 2. ATTRIBUTES (Ring 1 - Radial placement)
    const attrs = state.attributes || [];
    attrs.forEach((attr, idx) => {
      const angle = (idx / Math.max(attrs.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const r = ringRadii[1];
      const isRecentlyModified = attr.xp > 0 && attr.level > 1;
      if (isRecentlyModified) modSet.add(attr.id);

      const node: GraphNode = {
        id: attr.id,
        name: attr.name,
        type: 'attribute',
        level: attr.level,
        progress: attr.progress,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 14,
        ring: 1,
        angle,
        color: '#10b981', // Emerald
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);

      // Link Attribute -> Core
      linkList.push({
        id: `link-attr-core-${attr.id}`,
        source: attr.id,
        target: coreNode.id,
        sourceType: 'attribute',
        targetType: 'core',
        isModifiedRecently: isRecentlyModified
      });
    });

    // 3. GOALS (Ring 1 - Alternating angle placement)
    const goals = state.goals || [];
    goals.forEach((goal, idx) => {
      const angle = ((idx + 0.5) / Math.max(goals.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const r = ringRadii[1] + 25;
      const isRecentlyModified = goal.status === 'Completed' || goal.progress > 0;
      if (isRecentlyModified) modSet.add(goal.id);

      const node: GraphNode = {
        id: goal.id,
        name: goal.name,
        type: 'goal',
        status: goal.status,
        progress: goal.progress,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 13,
        ring: 1,
        angle,
        color: '#f59e0b', // Amber
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);

      // Link Goal -> Core
      linkList.push({
        id: `link-goal-core-${goal.id}`,
        source: goal.id,
        target: coreNode.id,
        sourceType: 'goal',
        targetType: 'core',
        isModifiedRecently: isRecentlyModified
      });
    });

    // 4. PROJECTS (Ring 2)
    const projects = state.projects || [];
    projects.forEach((proj, idx) => {
      const angle = (idx / Math.max(projects.length, 1)) * 2 * Math.PI - Math.PI / 3;
      const r = ringRadii[2];
      const isRecentlyModified = proj.status === 'Completed' || proj.progress > 0;
      if (isRecentlyModified) modSet.add(proj.id);

      const node: GraphNode = {
        id: proj.id,
        name: proj.name,
        type: 'project',
        status: proj.status,
        progress: proj.progress,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 12,
        ring: 2,
        angle,
        color: '#a855f7', // Purple
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);

      // Link Project -> Goal (if assigned)
      if (proj.goalId && nMap.has(proj.goalId)) {
        linkList.push({
          id: `link-proj-goal-${proj.id}`,
          source: proj.id,
          target: proj.goalId,
          sourceType: 'project',
          targetType: 'goal',
          isModifiedRecently: isRecentlyModified
        });
      } else {
        // Link to Core if standalone
        linkList.push({
          id: `link-proj-core-${proj.id}`,
          source: proj.id,
          target: coreNode.id,
          sourceType: 'project',
          targetType: 'core'
        });
      }
    });

    // 5. MILESTONES (Ring 2 - Connected to Projects)
    const milestones = state.milestones || [];
    milestones.forEach((ms, idx) => {
      let angle = (idx / Math.max(milestones.length, 1)) * 2 * Math.PI;
      let parentProjNode = ms.projectId ? nMap.get(ms.projectId) : null;
      if (parentProjNode) {
        angle = parentProjNode.angle + ((idx % 3 - 1) * 0.25);
      }

      const r = ringRadii[2] + 35;
      const isRecentlyModified = ms.completed;
      if (isRecentlyModified) modSet.add(ms.id);

      const node: GraphNode = {
        id: ms.id,
        name: ms.name,
        type: 'milestone',
        status: ms.completed ? 'Completed' : 'Pending',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 9,
        ring: 2,
        angle,
        color: '#ec4899', // Pink
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);

      if (ms.projectId && nMap.has(ms.projectId)) {
        linkList.push({
          id: `link-ms-proj-${ms.id}`,
          source: ms.id,
          target: ms.projectId,
          sourceType: 'milestone',
          targetType: 'project',
          isModifiedRecently: isRecentlyModified
        });
      }
    });

    // 6. QUESTS (Ring 3)
    const quests = state.quests || [];
    quests.forEach((quest, idx) => {
      // Angle offset based on parent goal or project
      let angle = (idx / Math.max(quests.length, 1)) * 2 * Math.PI + 0.1;
      const parentGoal = quest.goalId ? nMap.get(quest.goalId) : null;
      const parentProj = quest.projectId ? nMap.get(quest.projectId) : null;

      if (parentProj) {
        angle = parentProj.angle + ((idx % 4 - 1.5) * 0.2);
      } else if (parentGoal) {
        angle = parentGoal.angle + ((idx % 4 - 1.5) * 0.2);
      }

      const r = ringRadii[3];
      const isRecentlyModified = quest.status === 'Completed' || (quest.xpEarned && quest.xpEarned > 0);
      if (isRecentlyModified) modSet.add(quest.id);

      const node: GraphNode = {
        id: quest.id,
        name: quest.name,
        type: 'quest',
        status: quest.status,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 10,
        ring: 3,
        angle,
        color: quest.status === 'Completed' ? '#38bdf8' : quest.status === 'Active' ? '#f43f5e' : '#64748b',
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);

      // Link Quest -> Goal or Project
      if (quest.goalId && nMap.has(quest.goalId)) {
        linkList.push({
          id: `link-quest-goal-${quest.id}`,
          source: quest.id,
          target: quest.goalId,
          sourceType: 'quest',
          targetType: 'goal',
          isModifiedRecently: isRecentlyModified
        });
      }
      if (quest.projectId && nMap.has(quest.projectId)) {
        linkList.push({
          id: `link-quest-proj-${quest.id}`,
          source: quest.id,
          target: quest.projectId,
          sourceType: 'quest',
          targetType: 'project',
          isModifiedRecently: isRecentlyModified
        });
      }
    });

    // 7. SKILLS (Ring 4 Primary Skills & Satellite Secondary Skills)
    const skills = state.skills || [];
    const primarySkills = skills.filter(s => (s.tier || 'Primary') === 'Primary');
    const secondarySkills = skills.filter(s => s.tier === 'Secondary');

    // 7A. Primary Skills (Ring 4)
    primarySkills.forEach((skill, idx) => {
      let angle = (idx / Math.max(primarySkills.length, 1)) * 2 * Math.PI - 0.2;
      const parentAttrNode = (skill as any).attributeId ? nMap.get((skill as any).attributeId) : null;
      if (parentAttrNode) {
        angle = parentAttrNode.angle + ((idx % 4 - 1.5) * 0.22);
      }

      const r = ringRadii[4];
      const isRecentlyModified = skill.level > 1 || skill.xp > 0;
      if (isRecentlyModified) modSet.add(skill.id);

      const node: GraphNode = {
        id: skill.id,
        name: skill.name,
        type: 'skill',
        level: skill.level,
        progress: skill.progress,
        skillTier: 'Primary',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 12, // Larger node for Primary Skill
        ring: 4,
        angle,
        color: '#2563eb', // Vibrant Sapphire Blue
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);

      // Link Primary Skill -> Attribute
      if ((skill as any).attributeId && nMap.has((skill as any).attributeId)) {
        linkList.push({
          id: `link-skill-attr-${skill.id}`,
          source: skill.id,
          target: (skill as any).attributeId,
          sourceType: 'skill',
          targetType: 'attribute',
          isModifiedRecently: isRecentlyModified
        });
      }

      // Link Primary Skill -> Quests that train this skill
      quests.forEach(q => {
        if (q.skillIds && q.skillIds.includes(skill.id) && nMap.has(q.id)) {
          linkList.push({
            id: `link-quest-skill-${q.id}-${skill.id}`,
            source: q.id,
            target: skill.id,
            sourceType: 'quest',
            targetType: 'skill',
            isModifiedRecently: isRecentlyModified
          });
        }
      });
    });

    // 7B. Secondary Skills (Satellite Sub-Orbit connected to Parent Primary Skill)
    secondarySkills.forEach((secSkill, idx) => {
      const parentNode = secSkill.parentId ? nMap.get(secSkill.parentId) : null;
      let angle = (idx / Math.max(secondarySkills.length, 1)) * 2 * Math.PI + 0.15;
      let r = ringRadii[4] + 32; // Satellite sub-orbit

      if (parentNode) {
        // Position satellite near parent Primary Skill
        angle = parentNode.angle + ((idx % 3 - 1) * 0.2);
      }

      const isRecentlyModified = secSkill.level > 1 || secSkill.xp > 0;
      if (isRecentlyModified) modSet.add(secSkill.id);

      const node: GraphNode = {
        id: secSkill.id,
        name: secSkill.name,
        type: 'skill',
        level: secSkill.level,
        progress: secSkill.progress,
        skillTier: 'Secondary',
        parentId: secSkill.parentId || null,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 8, // Compact satellite node
        ring: 4,
        angle,
        color: '#818cf8', // Indigo / Violet
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);

      // Link Secondary Skill -> Parent Primary Skill
      if (secSkill.parentId && nMap.has(secSkill.parentId)) {
        linkList.push({
          id: `link-sec-pri-skill-${secSkill.id}`,
          source: secSkill.id,
          target: secSkill.parentId,
          sourceType: 'skill',
          targetType: 'skill',
          label: 'Child Skill',
          isModifiedRecently: isRecentlyModified
        });
      }

      // Link Secondary Skill -> Quests that train this skill
      quests.forEach(q => {
        if (q.skillIds && q.skillIds.includes(secSkill.id) && nMap.has(q.id)) {
          linkList.push({
            id: `link-quest-secskill-${q.id}-${secSkill.id}`,
            source: q.id,
            target: secSkill.id,
            sourceType: 'quest',
            targetType: 'skill',
            isModifiedRecently: isRecentlyModified
          });
        }
      });
    });

    return { nodes: nodeList, links: linkList, nodeMap: nMap, modifiedNodeIds: modSet };
  }, [state]);

  // TRACK REAL-TIME MODIFICATION EVENTS TO GENERATE SPIDERWEB GLOW HIGHLIGHTS
  useEffect(() => {
    const currentStateSummary = JSON.stringify({
      quests: state.quests.map(q => ({ id: q.id, status: q.status })),
      goals: state.goals.map(g => ({ id: g.id, status: g.status, p: g.progress })),
      projects: state.projects.map(p => ({ id: p.id, status: p.status, pr: p.progress })),
      skills: state.skills.map(s => ({ id: s.id, lvl: s.level, xp: s.xp })),
      xpHistoryLength: state.xpHistory?.length || 0
    });

    if (prevItemsRef.current && prevItemsRef.current !== currentStateSummary) {
      // Find what modified
      const newModLog = {
        id: `mod-${Date.now()}`,
        type: 'quest' as NodeType,
        title: 'Component Modification Sync',
        timestamp: new Date().toLocaleTimeString(),
        action: 'Web relationships re-calculated'
      };
      setRecentModifications(prev => [newModLog, ...prev.slice(0, 4)]);
    }

    prevItemsRef.current = currentStateSummary;
  }, [state]);

  // Compute connected nodes for hovered/selected node
  const activeFocusId = selectedNodeId || hoveredNodeId;

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const connected = new Set<string>();
    connected.add(activeFocusId);

    links.forEach(l => {
      if (l.source === activeFocusId) connected.add(l.target);
      if (l.target === activeFocusId) connected.add(l.source);
    });

    return connected;
  }, [activeFocusId, links]);

  // FILTER & SEARCH NODES
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (showModifiedOnly && !node.isModifiedRecently && node.type !== 'core') return false;
      
      if (activeFilter !== 'all' && node.type !== 'core') {
        if (activeFilter === 'primary_skill') {
          if (node.type !== 'skill' || node.skillTier !== 'Primary') return false;
        } else if (activeFilter === 'secondary_skill') {
          if (node.type !== 'skill' || node.skillTier !== 'Secondary') return false;
        } else if (node.type !== activeFilter) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        return node.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [nodes, activeFilter, searchQuery, showModifiedOnly]);

  const filteredNodeIdSet = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'core': return <ShieldCheck className="h-4 w-4 text-cyan-400" />;
      case 'goal': return <Target className="h-3.5 w-3.5 text-amber-400" />;
      case 'project': return <Award className="h-3.5 w-3.5 text-purple-400" />;
      case 'quest': return <Compass className="h-3.5 w-3.5 text-rose-400" />;
      case 'skill': return <Zap className="h-3.5 w-3.5 text-sky-400" />;
      case 'attribute': return <Flame className="h-3.5 w-3.5 text-emerald-400" />;
      case 'milestone': return <CheckCircle className="h-3.5 w-3.5 text-pink-400" />;
      default: return <Network className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const getNodeBadgeClass = (type: NodeType) => {
    switch (type) {
      case 'core': return 'bg-cyan-950 border-cyan-500/40 text-cyan-300';
      case 'goal': return 'bg-amber-950 border-amber-500/40 text-amber-300';
      case 'project': return 'bg-purple-950 border-purple-500/40 text-purple-300';
      case 'quest': return 'bg-rose-950 border-rose-500/40 text-rose-300';
      case 'skill': return 'bg-sky-950 border-sky-500/40 text-sky-300';
      case 'attribute': return 'bg-emerald-950 border-emerald-500/40 text-emerald-300';
      case 'milestone': return 'bg-pink-950 border-pink-500/40 text-pink-300';
      default: return 'bg-zinc-900 border-zinc-700 text-zinc-300';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 md:p-6 space-y-5 relative overflow-hidden" id="spiderweb-graph-root">
      
      {/* HEADER BAR & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/30 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Network className="h-6 w-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                System Component Spiderweb Graph
              </h3>
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full">
                {nodes.length} NODES • {links.length} RELATIONS
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
              Live relational map linking Goals, Projects, Quests, Skills, Attributes & Milestones
            </p>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search component..."
              className="bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono w-36 sm:w-48"
            />
          </div>

          {/* TOGGLE MODIFIED ONLY */}
          <button
            onClick={() => setShowModifiedOnly(!showModifiedOnly)}
            className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 uppercase ${
              showModifiedOnly 
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            {showModifiedOnly ? 'SHOWING MODIFIED' : 'HIGHLIGHT MODIFIED'}
          </button>

          {/* ZOOM CONTROLS */}
          <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg p-0.5">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-mono text-zinc-400 px-1.5">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.15))}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => setZoomLevel(1)}
              className="p-1 text-zinc-500 hover:text-cyan-400 rounded hover:bg-white/5 transition-colors border-l border-white/5"
              title="Reset Zoom"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/5 pb-3">
        <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1 flex items-center gap-1">
          <Filter className="h-3 w-3" /> FILTER WEBS:
        </span>

        {[
          { id: 'all', label: 'ALL COMPONENTS' },
          { id: 'goal', label: 'GOALS' },
          { id: 'project', label: 'PROJECTS' },
          { id: 'quest', label: 'QUESTS' },
          { id: 'skill', label: 'ALL SKILLS' },
          { id: 'primary_skill', label: 'PRIMARY SKILLS' },
          { id: 'secondary_skill', label: 'SECONDARY SKILLS' },
          { id: 'attribute', label: 'ATTRIBUTES' },
          { id: 'milestone', label: 'MILESTONES' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-all uppercase ${
              activeFilter === tab.id 
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold' 
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN SPIDERWEB CANVAS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* SPIDERWEB SVG DISPLAY (3 COLS) */}
        <div className="lg:col-span-3 bg-zinc-950/80 border border-white/10 rounded-xl p-2 relative overflow-hidden flex items-center justify-center min-h-[480px] md:min-h-[580px]">
          
          {/* SPIDERWEB BACKGROUND GRID DECORATION */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-zinc-950/90 to-zinc-950 pointer-events-none" />

          {/* DYNAMIC SVG SPIDERWEB GRAPH */}
          <div 
            className="transition-transform duration-300 ease-out origin-center w-full max-w-[650px]"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                {/* Glow Filter for Spiderweb Nodes */}
                <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Linear Gradients for Link Lines */}
                <linearGradient id="grad-cyan-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* 1. DRAW SPIDERWEB RINGS (CONCENTRIC POLYGONS & RADIATING SPOKES) */}
              <g className="spiderweb-mesh opacity-30">
                {/* Radiating Web Spokes from Center */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
                  const outerR = ringRadii[ringRadii.length - 1];
                  const x2 = cx + outerR * Math.cos(angle);
                  const y2 = cy + outerR * Math.sin(angle);
                  return (
                    <line 
                      key={`spoke-${i}`}
                      x1={cx}
                      y1={cy}
                      x2={x2}
                      y2={y2}
                      stroke="#06b6d4"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Concentric Spiderweb Ring Polygons */}
                {ringRadii.slice(1).map((r, ringIndex) => {
                  const sides = 12;
                  const points = Array.from({ length: sides }).map((_, i) => {
                    const angle = (i / sides) * 2 * Math.PI - Math.PI / 2;
                    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                  }).join(' ');

                  return (
                    <polygon 
                      key={`ring-poly-${ringIndex}`}
                      points={points}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeOpacity={0.25 - ringIndex * 0.04}
                    />
                  );
                })}
              </g>

              {/* 2. DRAW RELATIONSHIP CONNECTIONS (LINKS) */}
              <g className="links-layer">
                {links.map(link => {
                  const sourceNode = nodeMap.get(link.source);
                  const targetNode = nodeMap.get(link.target);

                  if (!sourceNode || !targetNode) return null;

                  // Check visibility filters
                  const isSourceVisible = filteredNodeIdSet.has(sourceNode.id);
                  const isTargetVisible = filteredNodeIdSet.has(targetNode.id);
                  if (!isSourceVisible && !isTargetVisible) return null;

                  // Highlight logic
                  const isConnectedToFocus = activeFocusId && (connectedNodeIds.has(sourceNode.id) && connectedNodeIds.has(targetNode.id));
                  const isDimmed = activeFocusId && !isConnectedToFocus;
                  const isLinkModified = link.isModifiedRecently || sourceNode.isModifiedRecently || targetNode.isModifiedRecently;

                  return (
                    <line 
                      key={link.id}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={
                        isConnectedToFocus 
                          ? '#38bdf8' 
                          : link.sourceType === 'skill' && link.targetType === 'skill'
                          ? '#818cf8'
                          : isLinkModified 
                          ? '#f59e0b' 
                          : '#475569'
                      }
                      strokeWidth={
                        isConnectedToFocus ? 2.5 : isLinkModified ? 2 : link.sourceType === 'skill' && link.targetType === 'skill' ? 1.5 : 1
                      }
                      strokeOpacity={
                        isDimmed ? 0.08 : isConnectedToFocus ? 0.9 : isLinkModified ? 0.75 : link.sourceType === 'skill' && link.targetType === 'skill' ? 0.7 : 0.35
                      }
                      strokeDasharray={
                        link.sourceType === 'skill' && link.targetType === 'skill' ? '3 3' : link.targetType === 'skill' ? '2 2' : undefined
                      }
                      className="transition-all duration-300"
                    />
                  );
                })}
              </g>

              {/* 3. DRAW NODES */}
              <g className="nodes-layer">
                {nodes.map(node => {
                  const isVisible = filteredNodeIdSet.has(node.id);
                  if (!isVisible) return null;

                  const isSelected = selectedNodeId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isFocused = activeFocusId === node.id;
                  const isConnected = connectedNodeIds.has(node.id);
                  const isDimmed = activeFocusId && !isConnected;

                  return (
                    <g 
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => {
                        setSelectedNodeId(isSelected ? null : node.id);
                        if (onSelectEntity) onSelectEntity(node.type, node.id);
                      }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className="cursor-pointer transition-all duration-300"
                      style={{ opacity: isDimmed ? 0.2 : 1 }}
                    >
                      {/* Pulse Ring for Modified Nodes */}
                      {node.isModifiedRecently && (
                        <circle 
                          r={node.radius + 10} 
                          fill="none" 
                          stroke="#f59e0b" 
                          strokeWidth="1.5" 
                          strokeDasharray="2 2"
                          className="animate-spin"
                          style={{ animationDuration: '8s' }}
                        />
                      )}

                      {/* Selected / Hovered Aura Glow */}
                      {(isSelected || isHovered || isFocused) && (
                        <circle 
                          r={node.radius + 8} 
                          fill={node.color} 
                          fillOpacity="0.25" 
                          filter="url(#glow-cyan)"
                        />
                      )}

                      {/* Primary / Secondary Skill Distinctive Halos */}
                      {node.type === 'skill' && node.skillTier === 'Primary' && (
                        <circle 
                          r={node.radius + 3.5} 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="1.5" 
                          strokeOpacity="0.8" 
                        />
                      )}
                      {node.type === 'skill' && node.skillTier === 'Secondary' && (
                        <circle 
                          r={node.radius + 2.5} 
                          fill="none" 
                          stroke="#818cf8" 
                          strokeWidth="1" 
                          strokeDasharray="2 2" 
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle 
                        r={node.radius} 
                        fill={node.color}
                        stroke={isSelected ? '#ffffff' : '#09090b'}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-all duration-200 hover:scale-125"
                      />

                      {/* Node Label */}
                      <text
                        y={node.radius + 14}
                        textAnchor="middle"
                        fill={isSelected || isHovered ? '#ffffff' : node.isModifiedRecently ? '#fcd34d' : '#a1a1aa'}
                        fontSize={node.type === 'core' ? '11' : '9'}
                        fontFamily="monospace"
                        fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                        className="pointer-events-none drop-shadow-md uppercase tracking-tighter"
                      >
                        {node.name.length > 14 ? `${node.name.substring(0, 12)}..` : node.name}
                      </text>

                      {/* Small Type Identifier Badge */}
                      {node.type !== 'core' && (
                        <text
                          y={node.radius + 23}
                          textAnchor="middle"
                          fill={
                            node.type === 'skill' && node.skillTier === 'Primary'
                              ? '#60a5fa'
                              : node.type === 'skill' && node.skillTier === 'Secondary'
                              ? '#a78bfa'
                              : '#71717a'
                          }
                          fontSize="7"
                          fontFamily="monospace"
                          fontWeight={node.type === 'skill' ? 'bold' : 'normal'}
                          className="pointer-events-none uppercase"
                        >
                          {node.type === 'skill' 
                            ? `[${node.skillTier === 'Primary' ? 'PRI' : 'SEC'}-SKILL]` 
                            : `[${node.type}]`}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* SPIDERWEB WATERMARK LEGEND (BOTTOM LEFT) */}
          <div className="absolute bottom-3 left-3 bg-zinc-950/90 border border-white/10 p-2.5 rounded-lg text-[9px] font-mono text-zinc-400 space-y-1 backdrop-blur-md hidden sm:block">
            <div className="font-bold text-white uppercase border-b border-white/5 pb-1 mb-1">SPIDERWEB WEBS</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-400" /> CENTER: OPERATOR CORE</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /> RING 1: GOALS TRACKS</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-400" /> RING 2: PROJECTS & MILESTONES</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-400" /> RING 3: QUEST DIRECTIVES</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" /> RING 4: PRIMARY SKILLS</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-400" /> SATELLITE: SECONDARY SKILLS</div>
          </div>
        </div>

        {/* RIGHT PANEL: SELECTED COMPONENT INSPECTOR & MODIFICATION STREAM (1 COL) */}
        <div className="space-y-4">
          
          {/* INSPECTOR PANEL */}
          <div className="glass-panel rounded-xl p-4 space-y-3.5 border border-white/10">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" /> COMPONENT INSPECTOR
              </span>
              {selectedNode && (
                <button 
                  onClick={() => setSelectedNodeId(null)}
                  className="text-[10px] font-mono text-zinc-500 hover:text-white"
                >
                  CLEAR
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded border ${getNodeBadgeClass(selectedNode.type)}`}>
                    {getNodeIcon(selectedNode.type)}
                  </span>
                  <div>
                    <h4 className="font-display text-sm font-bold text-white uppercase leading-tight">
                      {selectedNode.name}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                      TYPE: {selectedNode.type} {selectedNode.status ? `• ${selectedNode.status}` : ''}
                    </span>
                  </div>
                </div>

                {/* SKILL TIER SPECIFIC BADGE */}
                {selectedNode.type === 'skill' && (
                  <div className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${
                    selectedNode.skillTier === 'Primary' 
                      ? 'bg-blue-950/60 border-blue-500/40 text-blue-300' 
                      : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      {selectedNode.skillTier === 'Primary' ? (
                        <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                      ) : (
                        <Layers className="h-3.5 w-3.5 text-indigo-400" />
                      )}
                      <span>{selectedNode.skillTier === 'Primary' ? 'PRIMARY SKILL TRACK' : 'SECONDARY SKILL TRACK'}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 uppercase">
                      {selectedNode.skillTier}
                    </span>
                  </div>
                )}

                {/* SECONDARY SKILL -> PARENT PRIMARY SKILL LINK */}
                {selectedNode.type === 'skill' && selectedNode.skillTier === 'Secondary' && selectedNode.parentId && (
                  (() => {
                    const parentNode = nodeMap.get(selectedNode.parentId);
                    if (!parentNode) return null;
                    return (
                      <div className="bg-zinc-900/90 p-2 rounded-lg border border-indigo-500/30 space-y-1">
                        <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block">
                          PARENT PRIMARY SKILL:
                        </span>
                        <div 
                          onClick={() => setSelectedNodeId(parentNode.id)}
                          className="flex items-center justify-between p-1.5 bg-zinc-950 hover:bg-zinc-800 rounded border border-white/5 cursor-pointer text-xs font-mono text-white transition-colors"
                        >
                          <span className="truncate">{parentNode.name}</span>
                          <ArrowRight className="h-3 w-3 text-indigo-400" />
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* PRIMARY SKILL -> CHILD SECONDARY SKILLS BREAKDOWN */}
                {selectedNode.type === 'skill' && selectedNode.skillTier === 'Primary' && (
                  (() => {
                    const childSkills = (Array.from(nodeMap.values()) as GraphNode[]).filter(
                      n => n.type === 'skill' && n.skillTier === 'Secondary' && n.parentId === selectedNode.id
                    );
                    if (childSkills.length === 0) return null;
                    return (
                      <div className="bg-zinc-900/90 p-2 rounded-lg border border-blue-500/30 space-y-1.5">
                        <span className="text-[9px] font-mono text-blue-400 uppercase font-bold block">
                          CHILD SECONDARY SKILLS ({childSkills.length}):
                        </span>
                        <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1">
                          {childSkills.map(child => (
                            <div 
                              key={child.id}
                              onClick={() => setSelectedNodeId(child.id)}
                              className="flex items-center justify-between p-1.5 bg-zinc-950 hover:bg-zinc-800 rounded border border-white/5 cursor-pointer text-xs font-mono text-indigo-300 transition-colors"
                            >
                              <span className="truncate">{child.name}</span>
                              <span className="text-[9px] text-zinc-500">LVL {child.level}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* ATTRIBUTES / STATS OF SELECTED NODE */}
                <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-white/5 space-y-1.5 text-xs font-mono">
                  {selectedNode.level !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">LEVEL:</span>
                      <span className="text-cyan-400 font-bold">LVL {selectedNode.level}</span>
                    </div>
                  )}
                  {selectedNode.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-zinc-500">PROGRESS:</span>
                        <span className="text-emerald-400 font-bold">{selectedNode.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${selectedNode.progress}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">RELATIONS:</span>
                    <span className="text-white font-bold">{connectedNodeIds.size - 1} linked</span>
                  </div>
                </div>

                {/* CONNECTED ENTITIES BREAKDOWN */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">
                    CONNECTED SPIDERWEB LINKS:
                  </span>
                  <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                    {Array.from(connectedNodeIds)
                      .filter(id => id !== selectedNode.id)
                      .map(id => {
                        const target = nodeMap.get(id);
                        if (!target) return null;
                        return (
                          <div 
                            key={id}
                            onClick={() => setSelectedNodeId(id)}
                            className="p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-white/5 rounded text-xs flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <span className="text-zinc-300 font-sans truncate max-w-[120px]">
                              {target.name}
                            </span>
                            <span className="text-[9px] font-mono text-cyan-400 uppercase">
                              [{target.type}]
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center space-y-1 text-zinc-500 font-mono text-xs">
                <Compass className="h-6 w-6 text-zinc-600 mx-auto" />
                <p>Click any spiderweb node to inspect its exact component relationships & metrics.</p>
              </div>
            )}
          </div>

          {/* REAL-TIME MODIFICATION AUDIT LOG */}
          <div className="glass-panel rounded-xl p-4 space-y-3 border border-white/10">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> MODIFICATION STREAM
              </span>
              <span className="text-[9px] font-mono text-zinc-500">LIVE SYNC</span>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {modifiedNodeIds.size > 0 ? (
                Array.from(modifiedNodeIds).slice(0, 5).map(id => {
                  const node = nodeMap.get(id);
                  if (!node) return null;
                  return (
                    <div 
                      key={id}
                      onClick={() => setSelectedNodeId(id)}
                      className="p-2 bg-amber-950/20 border border-amber-500/20 rounded text-[11px] flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span className="font-sans font-medium text-amber-200 truncate">{node.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-amber-400 shrink-0 uppercase">
                        [{node.type}]
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] font-mono text-zinc-500 italic py-3 text-center">
                  No active modification triggers detected in current session frame.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
