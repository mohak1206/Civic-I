import { describe, it, expect, vi } from 'vitest';
import { analyzeIssuePhoto } from '../build/src/services/ai';

describe('AI Service', () => {
  it('returns graceful fallback when VITE_OLLAMA_MODEL is not set', async () => {
    // In vitest test environment, VITE_OLLAMA_MODEL is undefined
    const res = await analyzeIssuePhoto('data:image/jpeg;base64,1234');
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NO_MODEL_CONFIGURED');
    expect(res.error).toContain('VITE_OLLAMA_MODEL is not configured');
  });
});

