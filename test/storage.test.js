import { describe, it, expect, beforeEach } from 'vitest';
import {
  getIssues,
  saveIssue,
  updateIssue,
  deleteIssue,
  getCurrentUser,
  saveCurrentUser,
  clearCurrentUser,
  getLeaderboardUsers,
  safeSetItem,
  getNotifications,
  addNotification,
  markNotificationsRead,
} from '../build/src/services/storage';

describe('Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Issue CRUD', () => {
    it('starts with an empty issues array', () => {
      expect(getIssues()).toEqual([]);
    });

    it('saves a new issue with generated defaults', () => {
      const issue = saveIssue({
        title: 'Broken streetlight',
        type: 'broken_street_light',
      });

      expect(issue.id).toBeDefined();
      expect(issue.status).toBe('reported');
      expect(issue.createdAt).toBeDefined();

      const all = getIssues();
      expect(all.length).toBe(1);
      expect(all[0].title).toBe('Broken streetlight');
    });

    it('updates an existing issue status', () => {
      const issue = saveIssue({ title: 'Pothole', type: 'pothole' });
      const updated = updateIssue(issue.id, { status: 'in_progress' });

      expect(updated.status).toBe('in_progress');
      expect(getIssues()[0].status).toBe('in_progress');
    });

    it('throws error when updating non-existent issue', () => {
      expect(() => updateIssue('non_existent_id', { status: 'resolved' })).toThrow();
    });

    it('deletes an issue successfully', () => {
      const issue = saveIssue({ title: 'Garbage dump', type: 'garbage' });
      expect(getIssues().length).toBe(1);

      deleteIssue(issue.id);
      expect(getIssues().length).toBe(0);
    });
  });

  describe('User and Leaderboard Storage', () => {
    it('saves and clears current user session', () => {
      expect(getCurrentUser()).toBeNull();

      const user = { id: 'usr_1', name: 'Citizen A', points: 150 };
      saveCurrentUser(user);
      expect(getCurrentUser().name).toBe('Citizen A');

      clearCurrentUser();
      expect(getCurrentUser()).toBeNull();
    });

    it('syncs authenticated user to local leaderboard', () => {
      saveCurrentUser({ id: 'usr_1', name: 'Citizen A', points: 200 });
      saveCurrentUser({ id: 'usr_2', name: 'Citizen B', points: 400 });

      const leaderboard = getLeaderboardUsers();
      expect(leaderboard.length).toBe(2);
      expect(leaderboard[0].name).toBe('Citizen B'); // Sorted descending by points
      expect(leaderboard[1].name).toBe('Citizen A');
    });

    it('excludes official users from the citizen gamification leaderboard', () => {
      saveCurrentUser({ id: 'usr_cit_1', name: 'Citizen Active', points: 300, role: 'citizen' });
      saveCurrentUser({ id: 'usr_off_1', name: 'Officer Municipal', points: 900, role: 'official' });

      const leaderboard = getLeaderboardUsers();
      expect(leaderboard.some((u) => u.id === 'usr_off_1')).toBe(false);
      expect(leaderboard.some((u) => u.id === 'usr_cit_1')).toBe(true);
    });
  });

  describe('Notifications Storage', () => {
    it('adds and marks notifications as read', () => {
      expect(getNotifications()).toEqual([]);

      addNotification({ title: 'Report Filed', message: 'Success' });
      expect(getNotifications().length).toBe(1);
      expect(getNotifications()[0].read).toBe(false);

      markNotificationsRead();
      expect(getNotifications()[0].read).toBe(true);
    });
  });

  describe('Quota Handling', () => {
    it('handles QuotaExceededError with clear message', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        const err = new Error('Quota exceeded');
        err.name = 'QuotaExceededError';
        err.code = 22;
        throw err;
      };

      const result = safeSetItem('test_key', 'large_value');
      expect(result.success).toBe(false);
      expect(result.isQuotaExceeded).toBe(true);
      expect(result.error).toContain('Storage quota exceeded');

      localStorage.setItem = originalSetItem;
    });
  });

  describe('Backward Compatibility for Priority Field', () => {
    it('handles legacy issues without priority safely returning undefined', () => {
      const legacyIssue = {
        id: 'legacy_1',
        title: 'Old Pothole',
        type: 'pothole',
        status: 'reported',
      };
      localStorage.setItem('civic_issues', JSON.stringify([legacyIssue]));

      const issues = getIssues();
      expect(issues.length).toBe(1);
      expect(issues[0].priority).toBeUndefined();
    });
  });
});

