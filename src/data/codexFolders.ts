export interface CodexFolderDefinition {
  id: string;
  folderNumber: string;
  canonicalPath: string;
  displayName: string;
  shortLabel: string;
  icon: string;
  description: string;
  aliases: string[];
}

export const FIXED_CODEX_FOLDERS: CodexFolderDefinition[] = [
  {
    id: '00-vision',
    folderNumber: '00',
    canonicalPath: '00 Vision',
    displayName: '00 Vision & High-Level Principles',
    shortLabel: '00 Vision',
    icon: '🌌',
    description: 'Core life mission, spiritual baseline, identity archetypes, and non-negotiable standards.',
    aliases: ['00 Vision', '00 Vision & High-Level Principles', '00 Vision & Principles', 'Vision']
  },
  {
    id: '01-strategies',
    folderNumber: '01',
    canonicalPath: '01 Strategies',
    displayName: '01 Strategies & Grand Outcomes',
    shortLabel: '01 Strategies',
    icon: '🎯',
    description: 'Multi-horizon grand destinies, quarterly outcome targets, and strategic weighting.',
    aliases: ['01 Strategies', '01 Strategies & Grand Outcomes', 'Strategies']
  },
  {
    id: '02-master-plans',
    folderNumber: '02',
    canonicalPath: '02 Master Plans',
    displayName: '02 Master Plans & Architecture',
    shortLabel: '02 Master Plans',
    icon: '🏛️',
    description: 'Amazon-style PR/FAQ documents, system architectures, and structural design blueprints.',
    aliases: ['02 Master Plans', '02 Master Plans & Architecture', 'Master Plans']
  },
  {
    id: '03-tactical-playbooks',
    folderNumber: '03',
    canonicalPath: '03 Tactical Playbooks',
    displayName: '03 Tactical Playbooks',
    shortLabel: '03 Playbooks',
    icon: '⚔️',
    description: 'High-intensity deployment playbooks, sprint battle plans, and tactical execution guides.',
    aliases: ['03 Tactical Playbooks', '03 Playbooks', 'Tactical Playbooks']
  },
  {
    id: '04-operations',
    folderNumber: '04',
    canonicalPath: '04 Operations',
    displayName: '04 Operations & Daily Directives',
    shortLabel: '04 Operations',
    icon: '⚙️',
    description: 'Day-to-day cadence, sprint cadences, daily standup routines, and operational queues.',
    aliases: ['04 Operations', '04 Operations & Daily Directives', 'Operations']
  },
  {
    id: '05-sops',
    folderNumber: '05',
    canonicalPath: '05 SOPs',
    displayName: '05 Standard Operating Procedures (SOPs)',
    shortLabel: '05 SOPs',
    icon: '📜',
    description: 'Codified checklists, release protocols, reproducible workflows, and immutable standards.',
    aliases: ['05 SOPs', '05 Standard Operating Procedures (SOPs)', '05 Standard Operating Procedures', 'SOPs']
  },
  {
    id: '06-frameworks',
    folderNumber: '06',
    canonicalPath: '06 Frameworks',
    displayName: '06 Mental Models & Frameworks',
    shortLabel: '06 Frameworks',
    icon: '🧠',
    description: 'First principles, cognitive models, Pareto 80/20 analysis, and decision trees.',
    aliases: ['06 Frameworks', '06 Mental Models & Frameworks', 'Frameworks']
  },
  {
    id: '07-experiments',
    folderNumber: '07',
    canonicalPath: '07 Experiments',
    displayName: '07 Experiments & Hypotheses',
    shortLabel: '07 Experiments',
    icon: '🧪',
    description: 'Validated trial-and-error logs, empirical hypotheses, bets, and test outcomes.',
    aliases: ['07 Experiments', '07 Experiments & Hypotheses', 'Experiments']
  },
  {
    id: '08-lessons-learned',
    folderNumber: '08',
    canonicalPath: '08 Lessons Learned',
    displayName: '08 Lessons Learned & Postmortems',
    shortLabel: '08 Lessons',
    icon: '💡',
    description: 'Blameless postmortems, root cause analysis, friction reviews, and reality checks.',
    aliases: ['08 Lessons Learned', '08 Lessons Learned & Postmortems', '08 Lessons', 'Lessons Learned']
  },
  {
    id: '09-reviews-archive',
    folderNumber: '09',
    canonicalPath: '09 Reviews & Archive',
    displayName: '09 Reviews & Archive',
    shortLabel: '09 Reviews',
    icon: '📦',
    description: 'Friday weekly reviews, milestone retrospectives, quarter-end summaries, and legacy archives.',
    aliases: ['09 Reviews & Archive', '09 Reviews', '09 Archive', 'Reviews & Archive', 'Archive']
  }
];

/**
 * Resolves a document path to its canonical fixed Codex folder.
 * If not matching any known folder, defaults to '00-vision'.
 */
export function getCodexFolderForPath(docPath: string): CodexFolderDefinition {
  if (!docPath) return FIXED_CODEX_FOLDERS[0];
  const trimmed = docPath.trim();
  const topPart = trimmed.split('/')[0]?.trim() || trimmed;

  for (const folder of FIXED_CODEX_FOLDERS) {
    // Exact match or folder number prefix match (e.g. '00', '01')
    if (folder.aliases.some(alias => topPart.toLowerCase() === alias.toLowerCase())) {
      return folder;
    }
    if (topPart.startsWith(folder.folderNumber)) {
      return folder;
    }
  }

  // Fallback: search anywhere in the path
  for (const folder of FIXED_CODEX_FOLDERS) {
    if (folder.aliases.some(alias => trimmed.toLowerCase().includes(alias.toLowerCase()))) {
      return folder;
    }
  }

  return FIXED_CODEX_FOLDERS[0];
}

/**
 * Determines whether a document belongs to a specific fixed folder.
 */
export function isDocInCodexFolder(docPath: string, folderIdOrCanonical: string): boolean {
  const folder = getCodexFolderForPath(docPath);
  return folder.id === folderIdOrCanonical || 
         folder.canonicalPath.toLowerCase() === folderIdOrCanonical.toLowerCase() ||
         folder.displayName.toLowerCase() === folderIdOrCanonical.toLowerCase() ||
         folder.folderNumber === folderIdOrCanonical;
}
