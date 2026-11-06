export const SCORING_RULES = {
  BASE_REPORT: 100,
  LOCATION_BONUS: 25,
  AI_MATCH_BONUS: 15,
  RESOLUTION_BONUS: 50,
};

export const LEVELS = [
  { level: 1, title: 'Civic Scout', minPoints: 0, maxPoints: 199 },
  { level: 2, title: 'Neighborhood Watcher', minPoints: 200, maxPoints: 499 },
  { level: 3, title: 'City Guardian', minPoints: 500, maxPoints: 999 },
  { level: 4, title: 'Civic Champion', minPoints: 1000, maxPoints: 1999 },
  { level: 5, title: 'Urban Legend', minPoints: 2000, maxPoints: Infinity },
];

export const BADGES = [
  {
    id: 'first_report',
    title: 'First Step',
    description: 'Submitted your first civic issue report.',
    icon: 'Flag',
  },
  {
    id: 'reporter_3',
    title: 'Eagle Eye',
    description: 'Submitted 3 or more civic issue reports.',
    icon: 'Eye',
  },
  {
    id: 'geo_scout',
    title: 'Geo Scout',
    description: 'Reported an issue with verified GPS or exact map pin.',
    icon: 'MapPin',
  },
  {
    id: 'ai_partner',
    title: 'AI Partner',
    description: 'Accepted and verified an AI visual issue suggestion.',
    icon: 'Sparkles',
  },
  {
    id: 'problem_solver',
    title: 'Problem Solver',
    description: 'Had a reported civic issue marked as resolved.',
    icon: 'CheckCircle2',
  },
  {
    id: 'city_guardian',
    title: 'City Guardian',
    description: 'Reached Level 3 (City Guardian) rank.',
    icon: 'ShieldAlert',
  },
];

/**
 * Calculates total points awarded for an issue submission
 */
export function calculateReportPoints({ hasLocation = false, keptAIType = false } = {}) {
  let total = SCORING_RULES.BASE_REPORT;
  const breakdown = {
    base: SCORING_RULES.BASE_REPORT,
    locationBonus: 0,
    aiBonus: 0,
  };

  if (hasLocation) {
    total += SCORING_RULES.LOCATION_BONUS;
    breakdown.locationBonus = SCORING_RULES.LOCATION_BONUS;
  }

  if (keptAIType) {
    total += SCORING_RULES.AI_MATCH_BONUS;
    breakdown.aiBonus = SCORING_RULES.AI_MATCH_BONUS;
  }

  return { total, breakdown };
}

/**
 * Returns level progression details for a given point total
 */
export function getLevel(points = 0) {
  const safePoints = Math.max(0, points);
  let currentLevelObj = LEVELS[0];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (safePoints >= LEVELS[i].minPoints) {
      currentLevelObj = LEVELS[i];
      break;
    }
  }

  const { level, title, minPoints, maxPoints } = currentLevelObj;
  let progressPercent = 100;
  let pointsNeeded = 0;

  if (maxPoints !== Infinity) {
    const range = maxPoints - minPoints + 1;
    const progress = safePoints - minPoints;
    progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
    pointsNeeded = maxPoints + 1 - safePoints;
  }

  return {
    level,
    title,
    currentPoints: safePoints,
    minPoints,
    maxPoints,
    progressPercent,
    pointsNeeded,
  };
}

/**
 * Evaluates whether new badges are unlocked based on user activity stats
 */
export function evaluateBadges(stats = {}, currentBadgeIds = []) {
  const {
    totalReports = 0,
    reportsWithLocation = 0,
    reportsWithAI = 0,
    resolvedReports = 0,
    currentPoints = 0,
  } = stats;

  const currentSet = new Set(currentBadgeIds);
  const newlyUnlocked = [];

  const checkBadge = (badgeId, condition) => {
    if (!currentSet.has(badgeId) && condition) {
      const badge = BADGES.find((b) => b.id === badgeId);
      if (badge) newlyUnlocked.push(badge);
    }
  };

  checkBadge('first_report', totalReports >= 1);
  checkBadge('reporter_3', totalReports >= 3);
  checkBadge('geo_scout', reportsWithLocation >= 1);
  checkBadge('ai_partner', reportsWithAI >= 1);
  checkBadge('problem_solver', resolvedReports >= 1);
  checkBadge('city_guardian', currentPoints >= 500);

  return newlyUnlocked;
}

