import { describe, it, expect } from 'vitest';
import {
  calculateReportPoints,
  getLevel,
  evaluateBadges,
  SCORING_RULES,
  LEVELS,
  BADGES,
} from '../build/src/services/gamification';

describe('Gamification Service', () => {
  describe('calculateReportPoints', () => {
    it('awards base 100 points for a simple report', () => {
      const res = calculateReportPoints({ hasLocation: false, keptAIType: false });
      expect(res.total).toBe(100);
      expect(res.breakdown.base).toBe(100);
      expect(res.breakdown.locationBonus).toBe(0);
      expect(res.breakdown.aiBonus).toBe(0);
    });

    it('awards 125 points when location is confirmed', () => {
      const res = calculateReportPoints({ hasLocation: true, keptAIType: false });
      expect(res.total).toBe(125);
      expect(res.breakdown.locationBonus).toBe(25);
    });

    it('awards 115 points when AI type is confirmed', () => {
      const res = calculateReportPoints({ hasLocation: false, keptAIType: true });
      expect(res.total).toBe(115);
      expect(res.breakdown.aiBonus).toBe(15);
    });

    it('awards maximum 140 points when both location and AI type are confirmed', () => {
      const res = calculateReportPoints({ hasLocation: true, keptAIType: true });
      expect(res.total).toBe(140);
      expect(res.breakdown.base).toBe(100);
      expect(res.breakdown.locationBonus).toBe(25);
      expect(res.breakdown.aiBonus).toBe(15);
    });
  });

  describe('getLevel', () => {
    it('places 0 points at Level 1 (Civic Scout)', () => {
      const lvl = getLevel(0);
      expect(lvl.level).toBe(1);
      expect(lvl.title).toBe('Civic Scout');
      expect(lvl.progressPercent).toBe(0);
      expect(lvl.pointsNeeded).toBe(200);
    });

    it('places 250 points at Level 2 (Neighborhood Watcher)', () => {
      const lvl = getLevel(250);
      expect(lvl.level).toBe(2);
      expect(lvl.title).toBe('Neighborhood Watcher');
      expect(lvl.progressPercent).toBeGreaterThan(0);
      expect(lvl.pointsNeeded).toBe(250);
    });

    it('places 550 points at Level 3 (City Guardian)', () => {
      const lvl = getLevel(550);
      expect(lvl.level).toBe(3);
      expect(lvl.title).toBe('City Guardian');
    });

    it('places 1200 points at Level 4 (Civic Champion)', () => {
      const lvl = getLevel(1200);
      expect(lvl.level).toBe(4);
      expect(lvl.title).toBe('Civic Champion');
    });

    it('places 2500 points at Level 5 (Urban Legend)', () => {
      const lvl = getLevel(2500);
      expect(lvl.level).toBe(5);
      expect(lvl.title).toBe('Urban Legend');
      expect(lvl.progressPercent).toBe(100);
      expect(lvl.pointsNeeded).toBe(0);
    });
  });

  describe('evaluateBadges', () => {
    it('unlocks first_report badge after 1 submission', () => {
      const newBadges = evaluateBadges({ totalReports: 1 }, []);
      expect(newBadges.map((b) => b.id)).toContain('first_report');
    });

    it('does not re-unlock already earned badges', () => {
      const newBadges = evaluateBadges({ totalReports: 1 }, ['first_report']);
      expect(newBadges.map((b) => b.id)).not.toContain('first_report');
    });

    it('unlocks reporter_3 when 3 reports are filed', () => {
      const newBadges = evaluateBadges({ totalReports: 3 }, ['first_report']);
      expect(newBadges.map((b) => b.id)).toContain('reporter_3');
    });

    it('unlocks geo_scout when location is pinned', () => {
      const newBadges = evaluateBadges({ reportsWithLocation: 1 }, []);
      expect(newBadges.map((b) => b.id)).toContain('geo_scout');
    });

    it('unlocks ai_partner when AI category is accepted', () => {
      const newBadges = evaluateBadges({ reportsWithAI: 1 }, []);
      expect(newBadges.map((b) => b.id)).toContain('ai_partner');
    });

    it('unlocks problem_solver when an issue is resolved', () => {
      const newBadges = evaluateBadges({ resolvedReports: 1 }, []);
      expect(newBadges.map((b) => b.id)).toContain('problem_solver');
    });

    it('unlocks city_guardian when points reach 500', () => {
      const newBadges = evaluateBadges({ currentPoints: 500 }, []);
      expect(newBadges.map((b) => b.id)).toContain('city_guardian');
    });
  });
});

