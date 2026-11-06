import { describe, it, expect } from 'vitest';

/**
 * The 13-step status lifecycle for Civic-I reports.
 * Mirrors the constants used in the tracking UI.
 */
const STATUSES = [
  { key: 'SUBMITTED', label: 'Submitted', desc: 'Report received by the system' },
  { key: 'PENDING_ANALYSIS', label: 'Pending Analysis', desc: 'Waiting for AI analysis' },
  { key: 'ANALYZED', label: 'Analyzed', desc: 'AI has suggested a category' },
  { key: 'NEEDS_VERIFICATION', label: 'Needs Verification', desc: 'Awaiting human review' },
  { key: 'VERIFIED_BY_OFFICIAL', label: 'Verified by Official', desc: 'An official has confirmed the issue' },
  { key: 'REJECTED', label: 'Rejected', desc: 'Report was reviewed and rejected' },
  { key: 'SUBMITTED_TO_AUTHORITY', label: 'Submitted to Authority', desc: 'Forwarded to the responsible department — DEMO, no actual submission' },
  { key: 'ACKNOWLEDGED', label: 'Acknowledged', desc: 'Authority has acknowledged the report — DEMO' },
  { key: 'INSPECTION_SCHEDULED', label: 'Inspection Scheduled', desc: 'Site inspection planned — DEMO' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Work is underway — DEMO' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Issue has been resolved — DEMO' },
  { key: 'CLOSED', label: 'Closed', desc: 'Report closed' },
  { key: 'REOPENED', label: 'Reopened', desc: 'Issue was reopened after resolution' },
];

describe('Status lifecycle', () => {
  it('has exactly 13 statuses', () => {
    expect(STATUSES).toHaveLength(13);
  });

  it('each status has a unique key', () => {
    const keys = STATUSES.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('each status has a non-empty label', () => {
    for (const s of STATUSES) {
      expect(s.label.length).toBeGreaterThan(0);
    }
  });

  it('each status has a non-empty description', () => {
    for (const s of STATUSES) {
      expect(s.desc.length).toBeGreaterThan(0);
    }
  });

  it('starts with SUBMITTED', () => {
    expect(STATUSES[0].key).toBe('SUBMITTED');
  });

  it('has RESOLVED before CLOSED', () => {
    const resolvedIdx = STATUSES.findIndex((s) => s.key === 'RESOLVED');
    const closedIdx = STATUSES.findIndex((s) => s.key === 'CLOSED');
    expect(resolvedIdx).toBeLessThan(closedIdx);
  });

  it('REOPENED is the last status', () => {
    expect(STATUSES[STATUSES.length - 1].key).toBe('REOPENED');
  });

  it('authority-related statuses are labelled DEMO', () => {
    const authorityStatuses = ['SUBMITTED_TO_AUTHORITY', 'ACKNOWLEDGED', 'INSPECTION_SCHEDULED', 'IN_PROGRESS', 'RESOLVED'];
    for (const key of authorityStatuses) {
      const status = STATUSES.find((s) => s.key === key);
      expect(status).toBeDefined();
      expect(status.desc).toContain('DEMO');
    }
  });

  it('all keys are uppercase with underscores', () => {
    for (const s of STATUSES) {
      expect(s.key).toMatch(/^[A-Z_]+$/);
    }
  });
});

