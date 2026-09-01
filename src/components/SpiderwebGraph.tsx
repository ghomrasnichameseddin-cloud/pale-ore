import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePOS } from '../POSContext';
import { 
  Network, Target, Award, Zap, Sparkles, Activity, Search, 
  Filter, Eye, Layers, Compass, RefreshCw, ZoomIn, ZoomOut, 
  Maximize2, Share2, Info, ArrowRight, ShieldCheck, Flame, CheckCircle,
  HelpCircle, Clock, Check, FileText, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';

export type NodeType = 'core' | 'goal' | 'project' | 'quest' | 'skill' | 'attribute' | 'milestone' | 'plan';

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
  const { state, getGoalProgress, getProjectProgress, getSkillXpAndLevel } = usePOS();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<NodeType | 'all' | 'primary_skill' | 'secondary_skill'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);
  const [isolateCircuit, setIsolateCircuit] = useState<boolean>(false);
  const [recentModifications, setRecentModifications] = useState<Array<{ id: string; type: NodeType; title: string; timestamp: string; action: string }>>([]);

  const prevItemsRef = useRef<string>('');

  // Dimensions of SVG spiderweb canvas
  const svgWidth = 800;
  const svgHeight = 800;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;

  // Concentric spiderweb rings radii
  const ringRadii = [0, 110, 200, 290, 360];

  // 1. DYNAMICALLY COMPUTE ALL NODES & EXHAUSTIVE CONNECTIONS FROM POS STATE
  const { nodes, links, nodeMap, modifiedNodeIds } = useMemo(() => {
    const nodeList: GraphNode[] = [];
    const linkList: GraphLink[] = [];
    const nMap = new Map<string, GraphNode>();
    const modSet = new Set<string>();
    const addedEdges = new Set<string>();

    const addLink = (
      source: string,
      target: string,
      sourceType: NodeType,
      targetType: NodeType,
      label?: string,
      isModifiedRecently?: boolean
    ) => {
      if (!source || !target || source === target) return;
      const edgeKey = source < target ? `${source}___${target}` : `${target}___${source}`;
      if (addedEdges.has(edgeKey)) return;
      addedEdges.add(edgeKey);

      linkList.push({
        id: `link-${sourceType}-${targetType}-${source}-${target}`,
        source,
        target,
        sourceType,
        targetType,
        label,
        isModifiedRecently: isModifiedRecently || false
      });
    };

    // 1A. CORE PLAYER NODE (Center)
    const coreNode: GraphNode = {
      id: 'core-player',
      name: (state.profile as any).name || 'OPERATOR CORE',
      type: 'core',
      level: state.profile.level,
      status: 'Active',
      x: cx,
      y: cy,
      radius: 22,
      ring: 0,
      angle: 0,
      color: '#c5a059' // Antique Gold
    };
    nodeList.push(coreNode);
    nMap.set(coreNode.id, coreNode);

    // 1B. ATTRIBUTES (Ring 1 - Inner Radial Ring)
    const attrs = state.attributes || [];
    attrs.forEach((attr, idx) => {
      const angle = (idx / Math.max(attrs.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const r = ringRadii[1];
      const isRecentlyModified = ((attr as any).xp || 0) > 0 && attr.level > 1;
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
    });

    // 1C. GOALS (Ring 1 - Alternating Outer Angle)
    const goals = state.goals || [];
    goals.forEach((goal, idx) => {
      const angle = ((idx + 0.5) / Math.max(goals.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const r = ringRadii[1] + 25;
      const goalProg = getGoalProgress(goal.id);
      const isRecentlyModified = goal.status === 'Completed' || goalProg > 0;
      if (isRecentlyModified) modSet.add(goal.id);

      const node: GraphNode = {
        id: goal.id,
        name: goal.name,
        type: 'goal',
        status: goal.status,
        progress: goalProg,
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
    });

    // 1D. PROJECTS (Ring 2)
    const projects = state.projects || [];
    projects.forEach((proj, idx) => {
      const angle = (idx / Math.max(projects.length, 1)) * 2 * Math.PI - Math.PI / 3;
      const r = ringRadii[2];
      const projProg = getProjectProgress(proj.id);
      const isRecentlyModified = proj.status === 'Completed' || projProg > 0;
      if (isRecentlyModified) modSet.add(proj.id);

      const node: GraphNode = {
        id: proj.id,
        name: proj.name,
        type: 'project',
        status: proj.status,
        progress: projProg,
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
    });

    // 1E. MILESTONES (Ring 2 Sub-orbit)
    const milestones = state.milestones || [];
    milestones.forEach((ms, idx) => {
      let angle = (idx / Math.max(milestones.length, 1)) * 2 * Math.PI;
      const parentProjNode = ms.projectId ? nMap.get(ms.projectId) : null;
      if (parentProjNode) {
        angle = parentProjNode.angle + ((idx % 3 - 1) * 0.25);
      }

      const r = ringRadii[2] + 35;
      const isCompleted = ms.status === 'Completed' || (ms as any).completed;
      if (isCompleted) modSet.add(ms.id);

      const node: GraphNode = {
        id: ms.id,
        name: ms.name,
        type: 'milestone',
        status: isCompleted ? 'Completed' : 'Pending',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 9,
        ring: 2,
        angle,
        color: '#ec4899', // Pink
        isModifiedRecently: isCompleted
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // 1F. QUESTS (Ring 3)
    const quests = state.quests || [];
    quests.forEach((quest, idx) => {
      let angle = (idx / Math.max(quests.length, 1)) * 2 * Math.PI + 0.1;
      const parentGoal = quest.goalId ? nMap.get(quest.goalId) : null;
      const parentProj = quest.projectId ? nMap.get(quest.projectId) : null;

      if (parentProj) {
        angle = parentProj.angle + ((idx % 4 - 1.5) * 0.2);
      } else if (parentGoal) {
        angle = parentGoal.angle + ((idx % 4 - 1.5) * 0.2);
      }

      const r = ringRadii[3];
      const isRecentlyModified = quest.status === 'Completed' || ((quest as any).xpEarned && (quest as any).xpEarned > 0);
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
    });

    // 1G. SKILLS (Ring 4 Primary Skills & Satellite Secondary Skills)
    const skills = state.skills || [];
    const primarySkills = skills.filter(s => (s.tier || 'Primary') === 'Primary');
    const secondarySkills = skills.filter(s => s.tier === 'Secondary');

    primarySkills.forEach((skill, idx) => {
      let angle = (idx / Math.max(primarySkills.length, 1)) * 2 * Math.PI - 0.2;
      const parentAttrNode = (skill as any).attributeId ? nMap.get((skill as any).attributeId) : null;
      if (parentAttrNode) {
        angle = parentAttrNode.angle + ((idx % 4 - 1.5) * 0.22);
      }

      const r = ringRadii[4];
      const isRecentlyModified = skill.level > 1 || skill.xp > 0;
      if (isRecentlyModified) modSet.add(skill.id);

      const skillProg = getSkillXpAndLevel(skill.id).progress;
      const node: GraphNode = {
        id: skill.id,
        name: skill.name,
        type: 'skill',
        level: skill.level,
        progress: skillProg,
        skillTier: 'Primary',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 12,
        ring: 4,
        angle,
        color: '#2563eb', // Sapphire Blue
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    secondarySkills.forEach((secSkill, idx) => {
      const parentNode = secSkill.parentId ? nMap.get(secSkill.parentId) : null;
      let angle = (idx / Math.max(secondarySkills.length, 1)) * 2 * Math.PI + 0.15;
      let r = ringRadii[4] + 32;

      if (parentNode) {
        angle = parentNode.angle + ((idx % 3 - 1) * 0.2);
      }

      const isRecentlyModified = secSkill.level > 1 || secSkill.xp > 0;
      if (isRecentlyModified) modSet.add(secSkill.id);

      const secSkillProg = getSkillXpAndLevel(secSkill.id).progress;
      const node: GraphNode = {
        id: secSkill.id,
        name: secSkill.name,
        type: 'skill',
        level: secSkill.level,
        progress: secSkillProg,
        skillTier: 'Secondary',
        parentId: secSkill.parentId || null,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 8,
        ring: 4,
        angle,
        color: '#818cf8', // Indigo
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // 1H. PLANNING DOCUMENTS (Ring 4 Outer Sub-orbit)
    const planningDocs = state.planningDocuments || [];
    planningDocs.forEach((doc, idx) => {
      let angle = (idx / Math.max(planningDocs.length, 1)) * 2 * Math.PI + 0.4;
      const r = ringRadii[4] + 55;

      const node: GraphNode = {
        id: doc.id,
        name: doc.name,
        type: 'plan',
        status: 'Active',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 9,
        ring: 4,
        angle,
        color: '#14b8a6', // Teal
        isModifiedRecently: false
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // =========================================================================
    // 2. EXHAUSTIVE CROSS-RELATION LINK BUILDING (CONNECTING EVERY COMPONENT)
    // =========================================================================

    // 2A. Core Player Links
    attrs.forEach(a => addLink(a.id, coreNode.id, 'attribute', 'core'));
    goals.forEach(g => addLink(g.id, coreNode.id, 'goal', 'core'));
    if (state.profile.focusGoalId && nMap.has(state.profile.focusGoalId)) {
      addLink(coreNode.id, state.profile.focusGoalId, 'core', 'goal', 'Focus Goal');
    }
    if (state.profile.currentBossQuestId && nMap.has(state.profile.currentBossQuestId)) {
      addLink(coreNode.id, state.profile.currentBossQuestId, 'core', 'quest', 'Boss Quest');
    }

    // 2B. Goal Relations (Goal -> Project, Skill, Attribute, Plan)
    goals.forEach(goal => {
      // Goal <-> Skills (via goal.relatedSkills)
      if (goal.relatedSkills && Array.isArray(goal.relatedSkills)) {
        goal.relatedSkills.forEach(sId => addLink(goal.id, sId, 'goal', 'skill'));
      }
    });

    // 2C. Project Relations (Project -> Goal, Milestone, Skill)
    projects.forEach(proj => {
      if (proj.goalId && nMap.has(proj.goalId)) {
        addLink(proj.id, proj.goalId, 'project', 'goal');
      } else {
        addLink(proj.id, coreNode.id, 'project', 'core');
      }
    });

    // 2D. Milestone Relations (Milestone -> Project, Goal)
    milestones.forEach(ms => {
      if (ms.projectId && nMap.has(ms.projectId)) {
        addLink(ms.id, ms.projectId, 'milestone', 'project');
      }
      if (ms.goalId && nMap.has(ms.goalId)) {
        addLink(ms.id, ms.goalId, 'milestone', 'goal');
      }
    });

    // 2E. Quest Relations (Quest -> Goal, Project, Milestone, Skill)
    quests.forEach(quest => {
      if (quest.goalId && nMap.has(quest.goalId)) {
        addLink(quest.id, quest.goalId, 'quest', 'goal');
      }
      if (quest.projectId && nMap.has(quest.projectId)) {
        addLink(quest.id, quest.projectId, 'quest', 'project');
      }
      if (quest.milestoneId && nMap.has(quest.milestoneId)) {
        addLink(quest.id, quest.milestoneId, 'quest', 'milestone');
      }
      const qSkills = quest.relatedSkills || (quest as any).skillIds || [];
      if (Array.isArray(qSkills)) {
        qSkills.forEach(sId => addLink(quest.id, sId, 'quest', 'skill'));
      }
    });

    // 2F. Skill Relations (Primary/Secondary -> Attribute, Goals, Projects, Parent Skill)
    skills.forEach(skill => {
      // Skill -> Attribute
      if ((skill as any).attributeId && nMap.has((skill as any).attributeId)) {
        addLink(skill.id, (skill as any).attributeId, 'skill', 'attribute');
      }
      // Secondary Skill -> Parent Primary Skill
      if (skill.parentId && nMap.has(skill.parentId)) {
        addLink(skill.id, skill.parentId, 'skill', 'skill', 'Parent Skill');
      }
      // Skill -> Goals
      if (skill.relatedGoals && Array.isArray(skill.relatedGoals)) {
        skill.relatedGoals.forEach(gId => addLink(skill.id, gId, 'skill', 'goal'));
      }
      // Skill -> Projects
      if (skill.relatedProjects && Array.isArray(skill.relatedProjects)) {
        skill.relatedProjects.forEach(pId => addLink(skill.id, pId, 'skill', 'project'));
      }
    });

    // 2G. Planning Document Relations
    planningDocs.forEach(doc => {
      if (doc.linkedGoals && Array.isArray(doc.linkedGoals)) {
        doc.linkedGoals.forEach(gId => addLink(doc.id, gId, 'plan', 'goal'));
      }
      if (doc.linkedProjects && Array.isArray(doc.linkedProjects)) {
        doc.linkedProjects.forEach(pId => addLink(doc.id, pId, 'plan', 'project'));
      }
      if (doc.linkedQuests && Array.isArray(doc.linkedQuests)) {
        doc.linkedQuests.forEach(qId => addLink(doc.id, qId, 'plan', 'quest'));
      }
      if (doc.linkedSkills && Array.isArray(doc.linkedSkills)) {
        doc.linkedSkills.forEach(sId => addLink(doc.id, sId, 'plan', 'skill'));
      }
    });

    return { nodes: nodeList, links: linkList, nodeMap: nMap, modifiedNodeIds: modSet };
  }, [state]);

  // REAL-TIME MODIFICATION AUDIT LOG
  useEffect(() => {
    const currentStateSummary = JSON.stringify({
      quests: state.quests.map(q => ({ id: q.id, status: q.status })),
      goals: state.goals.map(g => ({ id: g.id, status: g.status, p: getGoalProgress(g.id) })),
      projects: state.projects.map(p => ({ id: p.id, status: p.status, pr: getProjectProgress(p.id) })),
      skills: state.skills.map(s => ({ id: s.id, lvl: s.level, xp: s.xp })),
      xpHistoryLength: state.xpHistory?.length || 0
    });

    if (prevItemsRef.current && prevItemsRef.current !== currentStateSummary) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setRecentModifications(prev => [
        {
          id: `mod-${Date.now()}`,
          type: 'quest',
          title: 'System Web Synchronization Updated',
          timestamp: nowStr,
          action: 'State Mutated'
        },
        ...prev.slice(0, 9)
      ]);
    }
    prevItemsRef.current = currentStateSummary;
  }, [state]);

  // ACTIVE FOCUS NODE
  const activeFocusId = selectedNodeId || hoveredNodeId;
  const activeFocusNode = activeFocusId ? nodeMap.get(activeFocusId) : null;

  // =========================================================================
  // MULTI-HOP CIRCUIT TRAVERSAL & CIRCUIT NETWORK CALCULATION
  // =========================================================================
  const { circuitNodeMap, circuitLinkIds, maxCircuitHop, circuitStats, circuitNodesList } = useMemo(() => {
    if (!activeFocusId || !nodeMap.has(activeFocusId)) {
      return {
        circuitNodeMap: new Map<string, number>(),
        circuitLinkIds: new Set<string>(),
        maxCircuitHop: 0,
        circuitStats: { goal: 0, project: 0, quest: 0, skill: 0, attribute: 0, milestone: 0, plan: 0, core: 0 },
        circuitNodesList: [] as GraphNode[]
      };
    }

    const nodeHops = new Map<string, number>();
    nodeHops.set(activeFocusId, 0);

    const queue: Array<{ id: string; hop: number }> = [{ id: activeFocusId, hop: 0 }];
    let maxHop = 0;

    // Build adjacency list across all links
    const adj = new Map<string, Array<{ targetId: string; linkId: string }>>();
    links.forEach(l => {
      if (!adj.has(l.source)) adj.set(l.source, []);
      if (!adj.has(l.target)) adj.set(l.target, []);
      adj.get(l.source)!.push({ targetId: l.target, linkId: l.id });
      adj.get(l.target)!.push({ targetId: l.source, linkId: l.id });
    });

    // BFS Multi-Hop Traversal to discover the full connected circuit
    while (queue.length > 0) {
      const { id, hop } = queue.shift()!;
      maxHop = Math.max(maxHop, hop);

      const neighbors = adj.get(id) || [];
      for (const edge of neighbors) {
        if (!nodeHops.has(edge.targetId)) {
          nodeHops.set(edge.targetId, hop + 1);
          queue.push({ id: edge.targetId, hop: hop + 1 });
        }
      }
    }

    // Circuit links are links where BOTH source and target are in the circuit
    const linkIds = new Set<string>();
    links.forEach(l => {
      if (nodeHops.has(l.source) && nodeHops.has(l.target)) {
        linkIds.add(l.id);
      }
    });

    const stats = { goal: 0, project: 0, quest: 0, skill: 0, attribute: 0, milestone: 0, plan: 0, core: 0 };
    const list: GraphNode[] = [];

    nodeHops.forEach((hop, id) => {
      const node = nodeMap.get(id);
      if (node) {
        list.push(node);
        if (node.type in stats) {
          stats[node.type as keyof typeof stats]++;
        }
      }
    });

    return {
      circuitNodeMap: nodeHops,
      circuitLinkIds: linkIds,
      maxCircuitHop: maxHop,
      circuitStats: stats,
      circuitNodesList: list
    };
  }, [activeFocusId, links, nodeMap]);

  // DIRECT 1-HOP CONNECTIONS FOR PRIMARY FOCUS HIGHLIGHTS
  const directConnectedIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const connected = new Set<string>();
    connected.add(activeFocusId);
    links.forEach(l => {
      if (l.source === activeFocusId) connected.add(l.target);
      if (l.target === activeFocusId) connected.add(l.source);
    });
    return connected;
  }, [activeFocusId, links]);

  // VISIBILITY FILTERING
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (isolateCircuit && activeFocusId) {
        if (!circuitNodeMap.has(node.id)) return false;
      }
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
  }, [nodes, showModifiedOnly, activeFilter, searchQuery, isolateCircuit, activeFocusId, circuitNodeMap]);

  const filteredNodeIdSet = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'core': return <Zap className="h-3.5 w-3.5 text-cyan-400" />;
      case 'goal': return <Target className="h-3.5 w-3.5 text-amber-400" />;
      case 'project': return <Layers className="h-3.5 w-3.5 text-purple-400" />;
      case 'quest': return <Sparkles className="h-3.5 w-3.5 text-rose-400" />;
      case 'skill': return <Award className="h-3.5 w-3.5 text-blue-400" />;
      case 'attribute': return <Activity className="h-3.5 w-3.5 text-emerald-400" />;
      case 'milestone': return <CheckCircle className="h-3.5 w-3.5 text-pink-400" />;
      case 'plan': return <FileText className="h-3.5 w-3.5 text-teal-400" />;
      default: return <Info className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const getNodeBadgeClass = (type: NodeType) => {
    switch (type) {
      case 'core': return 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a]';
      case 'goal': return 'bg-[#2a220a] border-[#e5c875]/60 text-[#fef08a]';
      case 'project': return 'bg-[#181329] border-[#a855f7]/50 text-purple-300';
      case 'quest': return 'bg-[#2a1318] border-rose-500/50 text-rose-300';
      case 'skill': return 'bg-[#0f1f38] border-blue-500/50 text-blue-300';
      case 'attribute': return 'bg-[#0c2419] border-emerald-500/50 text-emerald-300';
      case 'milestone': return 'bg-[#2b1022] border-pink-500/50 text-pink-300';
      case 'plan': return 'bg-[#0b2426] border-teal-500/50 text-teal-300';
      default: return 'bg-[#0b0d13] border-[#c5a059]/30 text-zinc-300';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0b0d13]/95 p-4 rounded-xl border border-[#c5a059]/30 glass-panel relative overflow-hidden shadow-lg">
        <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#141824] border border-[#c5a059]/50 rounded-xl text-[#e5c875] shadow-[0_0_15px_rgba(197,160,89,0.25)]">
            <RubElHizbIcon className="h-6 w-6 text-[#c5a059]" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              ASTROLABE OF DESTINIES // NEXUS GRAPH
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold">
                SOUL WEAVE ACTIVE
              </span>
            </h3>
            <p className="text-[11px] font-mono text-[#c5a059]/80 mt-0.5">
              Harmonic celestial web linking Destinies, Operations, Decrees, Disciplines, Attributes & Milestones
            </p>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-[#c5a059]/60 absolute left-2.5 top-2.5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search realm node..."
              className="bg-[#07080c] border border-[#c5a059]/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059] font-mono w-36 sm:w-48"
            />
          </div>

          {/* TOGGLE MODIFIED ONLY */}
          <button
            onClick={() => setShowModifiedOnly(!showModifiedOnly)}
            className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 uppercase cursor-pointer ${
              showModifiedOnly 
                ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] shadow-[0_0_15px_rgba(197,160,89,0.3)]' 
                : 'bg-[#07080c] border-white/10 text-zinc-400 hover:text-white hover:border-[#c5a059]/30'
            }`}
          >
            <Sparkles className="h-3 w-3 text-[#e5c875]" />
            {showModifiedOnly ? 'ATTUNED ONLY' : 'HIGHLIGHT ATTUNED'}
          </button>

          {/* ZOOM CONTROLS */}
          <div className="flex items-center bg-[#07080c] border border-[#c5a059]/30 rounded-lg p-0.5">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
              className="p-1 text-zinc-400 hover:text-[#e5c875] rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#c5a059] px-1.5 font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.15))}
              className="p-1 text-zinc-400 hover:text-[#e5c875] rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => setZoomLevel(1)}
              className="p-1 text-zinc-500 hover:text-[#e5c875] rounded hover:bg-white/5 transition-colors border-l border-white/5 cursor-pointer"
              title="Reset Zoom"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#c5a059]/20 pb-3">
        <span className="text-[10px] font-mono text-[#c5a059] uppercase mr-1 flex items-center gap-1 font-bold">
          <Filter className="h-3 w-3 text-[#c5a059]" /> FILTER SPHERE:
        </span>

        {[
          { id: 'all', label: 'ALL REALM NODES' },
          { id: 'goal', label: 'DESTINIES' },
          { id: 'project', label: 'OPERATIONS' },
          { id: 'quest', label: 'DECREES' },
          { id: 'skill', label: 'DISCIPLINES' },
          { id: 'primary_skill', label: 'PRIMARY DISCIPLINES' },
          { id: 'secondary_skill', label: 'SECONDARY BRANCHES' },
          { id: 'attribute', label: 'ATTRIBUTES' },
          { id: 'milestone', label: 'MILESTONES' },
          { id: 'plan', label: 'SCROLLS' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-all uppercase cursor-pointer ${
              activeFilter === tab.id 
                ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] font-bold shadow-sm' 
                : 'bg-[#07080c] hover:bg-[#141824] text-zinc-400 hover:text-zinc-200 border border-[#c5a059]/15'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ACTIVE CIRCUIT BANNER (RESERVED HEIGHT CONTAINER TO PREVENT LAYOUT SHIFT) */}
      <div className="min-h-[58px] flex items-center">
        {activeFocusNode ? (
          <div className="w-full bg-[#0b0d13] border border-[#c5a059]/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(197,160,89,0.18)] relative overflow-hidden">
            <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" color="#c5a059" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] shrink-0">
                <RubElHizbIcon className="h-4 w-4 text-[#e5c875]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#e5c875] font-bold uppercase tracking-wider">
                    ✦ RESONATING CIRCUIT: {activeFocusNode.name}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a] uppercase font-bold">
                    {activeFocusNode.type}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-300 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span className="text-zinc-400">{circuitNodesList.length - 1} Resonating Nodes:</span>
                  <span className="text-[#e5c875] font-bold">{circuitStats.goal} Destinies</span> •
                  <span className="text-purple-400 font-bold">{circuitStats.project} Operations</span> •
                  <span className="text-rose-400 font-bold">{circuitStats.quest} Decrees</span> •
                  <span className="text-blue-400 font-bold">{circuitStats.skill} Disciplines</span> •
                  <span className="text-emerald-400 font-bold">{circuitStats.attribute} Attributes</span>
                  {circuitStats.plan > 0 && <span className="text-teal-400 font-bold">• {circuitStats.plan} Scrolls</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsolateCircuit(!isolateCircuit)}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isolateCircuit 
                    ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] shadow-[0_0_15px_rgba(197,160,89,0.3)]' 
                    : 'bg-[#07080c] border-[#c5a059]/30 text-zinc-300 hover:text-white hover:border-[#c5a059]'
                }`}
              >
                <Compass className="h-3.5 w-3.5 text-[#e5c875]" />
                {isolateCircuit ? 'ISOLATED HARMONY VIEW' : 'ISOLATE HARMONY'}
              </button>

              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setHoveredNodeId(null);
                  setIsolateCircuit(false);
                }}
                className="text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1.5 rounded bg-[#07080c] border border-[#c5a059]/20 hover:border-[#c5a059]/40 transition-colors cursor-pointer"
              >
                CLEAR
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-[#0b0d13]/80 border border-[#c5a059]/20 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-2">
              <RubElHizbIcon className="h-4 w-4 text-[#c5a059] shrink-0" />
              HOVER OR ATTUNE TO ANY REALM NODE TO INSPECT ITS CELESTIAL CIRCUIT NETWORK
            </span>
            <span className="text-[10px] text-[#c5a059] uppercase font-mono hidden sm:inline font-bold">ASTROLABE ACTIVE</span>
          </div>
        )}
      </div>

      {/* MAIN SPIDERWEB CANVAS & INSPECTOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* SPIDERWEB SVG DISPLAY (3 COLS) */}
        <div className="lg:col-span-3 bg-[#0b0d13]/90 border border-[#c5a059]/30 rounded-xl p-2 relative overflow-hidden flex items-center justify-center min-h-[480px] md:min-h-[580px] shadow-xl">
          <ArabesqueCorner position="top-left" className="top-1.5 left-1.5 h-4 w-4" color="#c5a059" />
          <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-4 w-4" color="#c5a059" />
          <ArabesqueCorner position="bottom-left" className="bottom-1.5 left-1.5 h-4 w-4" color="#c5a059" />
          <ArabesqueCorner position="bottom-right" className="bottom-1.5 right-1.5 h-4 w-4" color="#c5a059" />
          
          {/* SPIDERWEB BACKGROUND GRID DECORATION */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c5a059]/10 via-[#0b0d13]/80 to-[#07080c] pointer-events-none" />

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
                <style>{`
                  @keyframes circuitFlow {
                    from { stroke-dashoffset: 24; }
                    to { stroke-dashoffset: 0; }
                  }
                  .circuit-active-line {
                    stroke-dasharray: 6 6;
                    animation: circuitFlow 1s linear infinite;
                  }
                  @keyframes circuitPulse {
                    0%, 100% { opacity: 0.3; stroke-width: 1px; }
                    50% { opacity: 1; stroke-width: 3px; }
                  }
                  .circuit-node-pulse {
                    animation: circuitPulse 1.6s ease-in-out infinite;
                  }
                `}</style>

                {/* Glow Filters for Spiderweb Nodes & Circuit Lines */}
                <filter id="glow-circuit" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
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
                      stroke="#c5a059"
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
                      stroke="#e5c875"
                      strokeWidth="1"
                      strokeOpacity={0.28 - ringIndex * 0.04}
                    />
                  );
                })}
              </g>

              {/* 2. DRAW RELATIONSHIP CONNECTIONS (EXHAUSTIVE LINKS & ANIMATED CIRCUIT LINES) */}
              <g className="links-layer">
                {links.map(link => {
                  const sourceNode = nodeMap.get(link.source);
                  const targetNode = nodeMap.get(link.target);

                  if (!sourceNode || !targetNode) return null;

                  // Visibility filters
                  const isSourceVisible = filteredNodeIdSet.has(sourceNode.id);
                  const isTargetVisible = filteredNodeIdSet.has(targetNode.id);
                  if (!isSourceVisible && !isTargetVisible) return null;

                  const isCircuitLink = circuitLinkIds.has(link.id);
                  const isDirectFocusLink = activeFocusId && (link.source === activeFocusId || link.target === activeFocusId);
                  const isDimmed = activeFocusId && !isCircuitLink;
                  const isLinkModified = link.isModifiedRecently || sourceNode.isModifiedRecently || targetNode.isModifiedRecently;

                  return (
                    <g key={link.id}>
                      <line 
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke={
                          isDirectFocusLink
                            ? '#e5c875' // Luminous gold for direct links
                            : isCircuitLink
                            ? '#c5a059' // Antique gold glow for active circuit
                            : isLinkModified 
                            ? '#f59e0b' 
                            : '#3a2e12'
                        }
                        strokeWidth={
                          isDirectFocusLink ? 3 : isCircuitLink ? 2 : isLinkModified ? 1.5 : 1
                        }
                        strokeOpacity={
                          isDimmed ? 0.05 : isDirectFocusLink ? 0.95 : isCircuitLink ? 0.85 : isLinkModified ? 0.7 : 0.3
                        }
                        strokeDasharray={
                          isCircuitLink ? undefined : link.targetType === 'skill' ? '3 3' : undefined
                        }
                        filter={isCircuitLink ? 'url(#glow-circuit)' : undefined}
                        className={isCircuitLink ? 'circuit-active-line transition-all duration-300' : 'transition-all duration-300'}
                      />
                    </g>
                  );
                })}
              </g>

              {/* 3. DRAW SPIDERWEB COMPONENT NODES */}
              <g className="nodes-layer">
                {filteredNodes.map(node => {
                  const isSelected = selectedNodeId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isInCircuit = activeFocusId && circuitNodeMap.has(node.id);
                  const hopLevel = activeFocusId ? circuitNodeMap.get(node.id) : undefined;
                  const isDimmed = activeFocusId && !isInCircuit;

                  return (
                    <g 
                      key={node.id}
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        if (onSelectEntity) onSelectEntity(node.type, node.id);
                      }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className="cursor-pointer transition-opacity duration-200"
                      style={{ opacity: isDimmed ? 0.12 : 1 }}
                    >
                      {/* ACTIVE CIRCUIT PULSE HALO */}
                      {isInCircuit && (
                        <circle 
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + (isSelected ? 9 : 6)} 
                          fill="none" 
                          stroke={isSelected ? '#e5c875' : '#c5a059'} 
                          strokeWidth="1.5" 
                          strokeOpacity="0.8" 
                          className="pointer-events-none circuit-node-pulse"
                        />
                      )}

                      {/* MODIFIED RECENTLY GLOW RING */}
                      {node.isModifiedRecently && (
                        <circle 
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + 6} 
                          fill="none" 
                          stroke="#f59e0b" 
                          strokeWidth="1.5" 
                          strokeDasharray="2 2"
                          filter="url(#glow-amber)"
                          className="pointer-events-none"
                        />
                      )}

                      {/* PRIMARY / SECONDARY SKILL DISTINCTIVE HALOS */}
                      {node.type === 'skill' && node.skillTier === 'Primary' && (
                        <circle 
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + 3.5} 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="1.5" 
                          strokeOpacity="0.8" 
                          className="pointer-events-none"
                        />
                      )}
                      {node.type === 'skill' && node.skillTier === 'Secondary' && (
                        <circle 
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + 2.5} 
                          fill="none" 
                          stroke="#818cf8" 
                          strokeWidth="1" 
                          strokeDasharray="2 2" 
                          className="pointer-events-none"
                        />
                      )}

                      {/* MAIN NODE CIRCLE */}
                      <circle 
                        cx={node.x}
                        cy={node.y}
                        r={node.radius} 
                        fill={node.color}
                        stroke={isSelected ? '#ffffff' : isHovered ? '#e5c875' : '#07080c'}
                        strokeWidth={isSelected ? 3 : isHovered ? 2 : 1.5}
                        filter={node.type === 'core' || isSelected ? 'url(#glow-amber)' : undefined}
                      />

                      {/* NODE LABEL & HOP LEVEL BADGE */}
                      <text
                        x={node.x}
                        y={node.y + node.radius + 13}
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : isHovered ? '#e5c875' : '#cbd5e1'}
                        fontSize="9"
                        fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                        className="pointer-events-none font-mono"
                      >
                        {node.name.length > 14 ? `${node.name.slice(0, 12)}..` : node.name}
                      </text>

                      {/* TYPE / HOP TYPE BADGE */}
                      {!compact && (
                        <text
                          x={node.x}
                          y={node.y + node.radius + 23}
                          textAnchor="middle"
                          fill={
                            isInCircuit && hopLevel === 0
                              ? '#e5c875'
                              : node.type === 'skill' && node.skillTier === 'Primary'
                              ? '#60a5fa'
                              : node.type === 'skill' && node.skillTier === 'Secondary'
                              ? '#a78bfa'
                              : '#71717a'
                          }
                          fontSize="7"
                          fontFamily="monospace"
                          fontWeight="bold"
                          className="pointer-events-none uppercase"
                        >
                          {isInCircuit && hopLevel !== undefined
                            ? hopLevel === 0 ? '[FOCUS]' : `[HOP-${hopLevel}]`
                            : node.type === 'skill' 
                            ? `[${node.skillTier === 'Primary' ? 'PRI' : 'SEC'}-DISCIPLINE]` 
                            : `[${node.type}]`}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* LEGEND overlay */}
          <div className="absolute bottom-3 left-3 bg-[#0b0d13]/95 border border-[#c5a059]/30 rounded-lg p-2.5 text-[9px] font-mono text-zinc-300 space-y-1 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#c5a059]" /> CENTER: SOUL CORE</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> RING 1: ATTRIBUTES</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e5c875]" /> RING 1: DESTINIES</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-400" /> RING 2: OPERATIONS & MILESTONES</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-400" /> RING 3: DECREES</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" /> RING 4: PRIMARY DISCIPLINES</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-400" /> SATELLITE: SECONDARY BRANCHES</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-400" /> OUTER: CODEX SCROLLS</div>
          </div>
        </div>

        {/* RIGHT PANEL: SELECTED COMPONENT INSPECTOR & CIRCUIT TRAVERSAL */}
        <div className="space-y-4">
          
          {/* INSPECTOR PANEL */}
          <div className="glass-panel rounded-xl p-4 space-y-3.5 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden shadow-lg">
            <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
            <div className="flex justify-between items-center border-b border-[#c5a059]/20 pb-2">
              <span className="text-xs font-mono text-[#e5c875] font-bold uppercase flex items-center gap-1.5">
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" /> REALM INSPECTOR
              </span>
              {selectedNode && (
                <button 
                  onClick={() => setSelectedNodeId(null)}
                  className="text-[10px] font-mono text-zinc-400 hover:text-white cursor-pointer"
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
                    <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">
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
                      <span>{selectedNode.skillTier === 'Primary' ? 'PRIMARY DISCIPLINE' : 'SECONDARY BRANCH'}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 uppercase font-bold">
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
                      <div className="bg-[#07080c] p-2 rounded-lg border border-indigo-500/30 space-y-1">
                        <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block">
                          PARENT DISCIPLINE:
                        </span>
                        <div 
                          onClick={() => setSelectedNodeId(parentNode.id)}
                          className="flex items-center justify-between p-1.5 bg-[#0b0d13] hover:bg-[#141824] rounded border border-white/5 cursor-pointer text-xs font-mono text-white transition-colors"
                        >
                          <span className="truncate">{parentNode.name}</span>
                          <ArrowRight className="h-3 w-3 text-indigo-400" />
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* STATS OF SELECTED NODE */}
                <div className="bg-[#07080c] p-2.5 rounded-lg border border-[#c5a059]/20 space-y-1.5 text-xs font-mono">
                  {selectedNode.level !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">RANK LEVEL:</span>
                      <span className="text-[#e5c875] font-bold">TIER {selectedNode.level}</span>
                    </div>
                  )}
                  {selectedNode.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-zinc-400">PROGRESSION:</span>
                        <span className="text-emerald-400 font-bold">{selectedNode.progress}%</span>
                      </div>
                      <div className="w-full bg-[#0b0d13] rounded-full h-1 overflow-hidden border border-white/5">
                        <div className="rpg-progress-gold h-full" style={{ width: `${selectedNode.progress}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-400">CIRCUIT HARMONY:</span>
                    <span className="text-[#e5c875] font-bold">{circuitNodesList.length - 1} resonated</span>
                  </div>
                </div>

                {/* ACTIVE CIRCUIT PIPELINE BREAKDOWN */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#e5c875] uppercase font-bold flex items-center gap-1">
                      <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" /> RESONANCE PIPELINE:
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400 font-bold">{circuitNodesList.length - 1} NODES</span>
                  </div>

                  <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                    {circuitNodesList
                      .filter(node => node.id !== selectedNode.id)
                      .sort((a, b) => (circuitNodeMap.get(a.id) || 0) - (circuitNodeMap.get(b.id) || 0))
                      .map(node => {
                        const hop = circuitNodeMap.get(node.id) || 1;
                        return (
                          <div 
                            key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            className="p-1.5 bg-[#07080c] hover:bg-[#141824] border border-[#c5a059]/15 hover:border-[#c5a059]/50 rounded text-xs flex items-center justify-between cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/30 shrink-0 font-bold">
                                H{hop}
                              </span>
                              <span className="text-zinc-300 font-sans truncate group-hover:text-[#e5c875]">
                                {node.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-[#c5a059] uppercase shrink-0 font-bold">
                              [{node.type}]
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center space-y-1 text-zinc-400 font-mono text-xs">
                <RubElHizbIcon className="h-6 w-6 text-[#c5a059]/60 mx-auto" />
                <p>Attune to any astrolabe node to isolate & inspect its celestial destiny pipeline.</p>
              </div>
            )}
          </div>

          {/* REAL-TIME MODIFICATION AUDIT LOG */}
          <div className="glass-panel rounded-xl p-4 space-y-3 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden shadow-lg">
            <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
            <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-2">
              <span className="text-xs font-mono text-[#e5c875] font-bold uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" /> ATTUNEMENT STREAM
              </span>
              <span className="text-[9px] font-mono text-[#c5a059] font-bold">CELESTIAL SYNC</span>
            </div>

            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {modifiedNodeIds.size > 0 ? (
                Array.from(modifiedNodeIds).slice(0, 5).map(id => {
                  const node = nodeMap.get(id);
                  if (!node) return null;
                  return (
                    <div 
                      key={id}
                      onClick={() => setSelectedNodeId(id)}
                      className="p-2 bg-[#2a220a]/40 border border-[#c5a059]/30 rounded text-[11px] flex items-center justify-between cursor-pointer hover:border-[#c5a059] transition-colors"
                    >
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#e5c875] shrink-0" />
                        <span className="font-sans font-medium text-[#fef08a] truncate">{node.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#c5a059] shrink-0 uppercase font-bold">
                        [{node.type}]
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] font-mono text-zinc-500 italic py-3 text-center">
                  No active celestial modification triggers detected in current session.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
