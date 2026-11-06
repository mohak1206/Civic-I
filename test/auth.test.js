import { describe, it, expect } from 'vitest';
import { createDemoUser } from '../build/src/services/firebase';
import { USER_ROLES, MUNICIPAL_DEPARTMENTS } from '../build/src/utils/constants';

describe('Dual Role Authentication (Citizen & Official)', () => {
  describe('Constants and Role Definitions', () => {
    it('defines distinct citizen and official roles', () => {
      expect(USER_ROLES.CITIZEN).toBe('citizen');
      expect(USER_ROLES.OFFICIAL).toBe('official');
    });

    it('defines valid Palghar municipal departments', () => {
      expect(MUNICIPAL_DEPARTMENTS.length).toBeGreaterThanOrEqual(4);
      const labels = MUNICIPAL_DEPARTMENTS.map((d) => d.label);
      expect(labels).toContain('Roads & Infrastructure');
      expect(labels).toContain('Sanitation & Solid Waste');
      expect(labels).toContain('Electrical & Street Lighting');
    });
  });

  describe('createDemoUser Factory', () => {
    it('creates a default citizen demo account', () => {
      const user = createDemoUser();
      expect(user.role).toBe('citizen');
      expect(user.name).toBe('Demo Citizen');
      expect(user.isDemo).toBe(true);
      expect(user.department).toBeNull();
    });

    it('creates a customized citizen demo account with string argument', () => {
      const user = createDemoUser('Aarav Deshmukh');
      expect(user.role).toBe('citizen');
      expect(user.name).toBe('Aarav Deshmukh');
      expect(user.isDemo).toBe(true);
    });

    it('creates a customized citizen demo account with object configuration', () => {
      const user = createDemoUser({
        name: 'Priya Shinde',
        role: 'citizen',
      });
      expect(user.role).toBe('citizen');
      expect(user.name).toBe('Priya Shinde');
      expect(user.department).toBeNull();
    });

    it('creates an official demo account with PMC department and designation', () => {
      const official = createDemoUser({
        role: 'official',
        name: 'Er. Rajesh Sharma',
        department: 'Roads & Infrastructure',
        officialTitle: 'Ward 4 Officer',
      });

      expect(official.role).toBe('official');
      expect(official.name).toBe('Er. Rajesh Sharma');
      expect(official.department).toBe('Roads & Infrastructure');
      expect(official.officialTitle).toBe('Ward 4 Officer');
      expect(official.email).toContain('@palghar-mc.gov.in');
      expect(official.isDemo).toBe(true);
    });
  });
});

