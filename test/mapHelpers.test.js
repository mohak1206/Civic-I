import { describe, it, expect } from 'vitest';
import {
  getIssueTypeColor,
  formatCoordinates,
  isValidCoordinate,
  getSafeCenter,
} from '../build/src/utils/mapHelpers';
import { PALGHAR_DEFAULT_CENTER, normalizeIssueType } from '../build/src/utils/constants';

describe('Map Helpers & Marker Colors', () => {
  describe('getIssueTypeColor', () => {
    it('returns orange for pothole', () => {
      expect(getIssueTypeColor('pothole')).toBe('#f97316');
    });

    it('returns yellow for street_light and legacy broken_street_light', () => {
      expect(getIssueTypeColor('street_light')).toBe('#eab308');
      expect(getIssueTypeColor('broken_street_light')).toBe('#eab308');
    });

    it('returns red for garbage', () => {
      expect(getIssueTypeColor('garbage')).toBe('#ef4444');
    });

    it('returns purple for bridge and legacy damaged_bridge', () => {
      expect(getIssueTypeColor('bridge')).toBe('#a855f7');
      expect(getIssueTypeColor('damaged_bridge')).toBe('#a855f7');
    });

    it('returns blue for other or unknown category', () => {
      expect(getIssueTypeColor('other')).toBe('#3b82f6');
      expect(getIssueTypeColor('unknown_category')).toBe('#3b82f6');
      expect(getIssueTypeColor(null)).toBe('#3b82f6');
    });
  });

  describe('normalizeIssueType', () => {
    it('normalizes legacy aliases cleanly', () => {
      expect(normalizeIssueType('broken_street_light')).toBe('street_light');
      expect(normalizeIssueType('damaged_bridge')).toBe('bridge');
      expect(normalizeIssueType('pothole')).toBe('pothole');
      expect(normalizeIssueType('garbage')).toBe('garbage');
      expect(normalizeIssueType('other')).toBe('other');
      expect(normalizeIssueType('xyz_unknown')).toBe('other');
    });
  });

  describe('formatCoordinates', () => {
    it('formats northern and eastern coordinates cleanly', () => {
      const formatted = formatCoordinates(19.6967, 72.7699);
      expect(formatted).toBe('19.6967° N, 72.7699° E');
    });

    it('formats southern and western coordinates cleanly', () => {
      const formatted = formatCoordinates(-33.8688, -151.2093);
      expect(formatted).toBe('33.8688° S, 151.2093° W');
    });

    it('handles invalid or non-numeric inputs gracefully', () => {
      expect(formatCoordinates(null, undefined)).toBe('Coordinates unavailable');
      expect(formatCoordinates('abc', 10)).toBe('Coordinates unavailable');
    });
  });

  describe('isValidCoordinate', () => {
    it('validates proper lat/lng objects', () => {
      expect(isValidCoordinate({ lat: 19.6967, lng: 72.7699 })).toBe(true);
      expect(isValidCoordinate({ lat: 0, lng: 0 })).toBe(true);
    });

    it('rejects coordinates out of bounds', () => {
      expect(isValidCoordinate({ lat: 95, lng: 50 })).toBe(false);
      expect(isValidCoordinate({ lat: 20, lng: 190 })).toBe(false);
    });

    it('rejects null or incomplete objects', () => {
      expect(isValidCoordinate(null)).toBe(false);
      expect(isValidCoordinate({ lat: 10 })).toBe(false);
    });
  });

  describe('getSafeCenter', () => {
    it('returns the input coordinate if valid', () => {
      const coord = { lat: 18.5204, lng: 73.8567 };
      expect(getSafeCenter(coord)).toEqual(coord);
    });

    it('returns Palghar default center if invalid', () => {
      expect(getSafeCenter(null)).toEqual(PALGHAR_DEFAULT_CENTER);
      expect(getSafeCenter({ lat: 999, lng: 999 })).toEqual(PALGHAR_DEFAULT_CENTER);
    });
  });
});
