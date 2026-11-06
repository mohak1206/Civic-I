import { ISSUE_TYPES, PALGHAR_DEFAULT_CENTER, normalizeIssueType } from './constants';

/**
 * Returns the hex pin color for an issue type
 */
export function getIssueTypeColor(typeId) {
  const normalized = normalizeIssueType(typeId);
  const match = ISSUE_TYPES.find((t) => t.id === normalized);
  return match ? match.color : '#3b82f6';
}

/**
 * Formats latitude and longitude for display (e.g., "19.6967° N, 72.7699° E")
 */
export function formatCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return 'Coordinates unavailable';
  }
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Validates coordinate pair
 */
export function isValidCoordinate(coord) {
  if (!coord || typeof coord !== 'object') return false;
  const { lat, lng } = coord;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Returns safe fallback center if given coordinate is invalid
 */
export function getSafeCenter(coord) {
  return isValidCoordinate(coord) ? coord : PALGHAR_DEFAULT_CENTER;
}
