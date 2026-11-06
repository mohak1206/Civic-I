export const PALGHAR_DEFAULT_CENTER = {
  lat: 19.6967,
  lng: 72.7699,
};

export const ISSUE_TYPES = [
  {
    id: 'pothole',
    label: 'Pothole',
    color: '#f97316', // Orange
    bgClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    dotClass: 'bg-orange-500',
    description: 'Road damage, cavities, asphalt deterioration',
  },
  {
    id: 'street_light',
    label: 'Street Light',
    aliases: ['broken_street_light'],
    color: '#eab308', // Yellow
    bgClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    dotClass: 'bg-yellow-500',
    description: 'Dark roadway, malfunctioning fixture, flickering light',
  },
  {
    id: 'garbage',
    label: 'Garbage Dump',
    color: '#ef4444', // Red
    bgClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    dotClass: 'bg-red-500',
    description: 'Overflowing bins, uncollected waste, illegal dumping',
  },
  {
    id: 'bridge',
    label: 'Damaged Bridge',
    aliases: ['damaged_bridge'],
    color: '#a855f7', // Purple
    bgClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    dotClass: 'bg-purple-500',
    description: 'Railing failure, structural cracks, expansion joint wear',
  },
  {
    id: 'other',
    label: 'Other Issue',
    color: '#3b82f6', // Blue
    bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dotClass: 'bg-blue-500',
    description: 'General municipal hazard or civic infrastructure issue',
  },
];

export const ISSUE_PRIORITIES = [
  { id: 'high', label: 'High Priority', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', dot: 'bg-rose-500' },
  { id: 'medium', label: 'Medium Priority', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', dot: 'bg-amber-500' },
  { id: 'low', label: 'Low Priority', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-500' },
  { id: 'not_set', label: 'Not Set', color: 'bg-zinc-800 text-zinc-400 border-zinc-700', dot: 'bg-zinc-500' },
];

export const ISSUE_STATUSES = [
  { id: 'reported', label: 'Reported', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-700' },
  { id: 'in_review', label: 'In Review', color: 'bg-amber-500/20 text-amber-300 border-amber-600/30' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500/20 text-blue-300 border-blue-600/30' },
  { id: 'resolved', label: 'Resolved', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-600/30' },
];

export function normalizeIssueType(type) {
  if (!type) return 'other';
  const clean = String(type).trim().toLowerCase();
  if (clean === 'broken_street_light') return 'street_light';
  if (clean === 'damaged_bridge') return 'bridge';
  const found = ISSUE_TYPES.find((t) => t.id === clean || t.aliases?.includes(clean));
  return found ? found.id : 'other';
}

export function normalizePriority(priority) {
  if (!priority) return 'not set';
  const clean = String(priority).trim().toLowerCase();
  if (['low', 'medium', 'high'].includes(clean)) return clean;
  return 'not set';
}
