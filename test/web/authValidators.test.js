import { describe, it, expect } from 'vitest';
import { validateUsername, validatePassword } from '../../build/web/src/citizen/api/auth';

describe('Auth Validators', () => {
  describe('validateUsername', () => {
    it('accepts valid 3-character username', () => {
      const res = validateUsername('raj');
      expect(res.valid).toBe(true);
      expect(res.error).toBeNull();
    });

    it('accepts valid 30-character username', () => {
      const res = validateUsername('a'.repeat(30));
      expect(res.valid).toBe(true);
      expect(res.error).toBeNull();
    });

    it('accepts letters, numbers, and underscores', () => {
      const res = validateUsername('palghar_user_99');
      expect(res.valid).toBe(true);
      expect(res.error).toBeNull();
    });

    it('rejects username shorter than 3 characters', () => {
      const res = validateUsername('ab');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('3 and 30 characters');
    });

    it('rejects username longer than 30 characters', () => {
      const res = validateUsername('a'.repeat(31));
      expect(res.valid).toBe(false);
      expect(res.error).toContain('3 and 30 characters');
    });

    it('rejects usernames with spaces or special characters', () => {
      expect(validateUsername('palghar user').valid).toBe(false);
      expect(validateUsername('user@domain').valid).toBe(false);
      expect(validateUsername('user-name!').valid).toBe(false);
    });

    it('rejects empty or null username', () => {
      expect(validateUsername('').valid).toBe(false);
      expect(validateUsername(null).valid).toBe(false);
      expect(validateUsername(undefined).valid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('accepts valid password of 8 characters', () => {
      const res = validatePassword('secret12');
      expect(res.valid).toBe(true);
      expect(res.error).toBeNull();
    });

    it('accepts longer password', () => {
      const res = validatePassword('SuperSecretPassword_2026!');
      expect(res.valid).toBe(true);
      expect(res.error).toBeNull();
    });

    it('rejects password shorter than 8 characters', () => {
      const res = validatePassword('short1');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('at least 8 characters');
    });

    it('rejects empty or null password', () => {
      expect(validatePassword('').valid).toBe(false);
      expect(validatePassword(null).valid).toBe(false);
    });
  });
});

