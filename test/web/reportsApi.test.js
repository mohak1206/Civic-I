import { describe, it, expect } from 'vitest';

/**
 * Tests for the mock reports API response structure.
 * Verifies the shape of data that the report wizard produces.
 */

/** Simulates the mock API response from a report submission */
function createMockReport({ category, lat, lng, address, description, confidence, boundingBox }) {
  const ref = 'CIV-' + String(Math.floor(100000 + Math.random() * 900000));
  return {
    ref,
    category,
    location: { lat, lng, address },
    description: description || '',
    analysis: {
      confidence,
      boundingBox: boundingBox || null,
    },
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    demo: true,
  };
}

describe('Mock report API', () => {
  it('generates a ref starting with CIV-', () => {
    const report = createMockReport({
      category: 'pothole',
      lat: 19.6967,
      lng: 72.7651,
      address: 'Near Palghar Station',
      confidence: 0.82,
    });
    expect(report.ref).toMatch(/^CIV-\d{6}$/);
  });

  it('has required fields', () => {
    const report = createMockReport({
      category: 'garbage',
      lat: 19.70,
      lng: 72.77,
      address: 'Market Road',
      description: 'Garbage pile near drain',
      confidence: 0.91,
      boundingBox: { x: 10, y: 20, w: 50, h: 40 },
    });

    expect(report).toHaveProperty('ref');
    expect(report).toHaveProperty('category', 'garbage');
    expect(report).toHaveProperty('location.lat', 19.70);
    expect(report).toHaveProperty('location.lng', 72.77);
    expect(report).toHaveProperty('location.address', 'Market Road');
    expect(report).toHaveProperty('description', 'Garbage pile near drain');
    expect(report).toHaveProperty('analysis.confidence', 0.91);
    expect(report).toHaveProperty('status', 'SUBMITTED');
    expect(report).toHaveProperty('demo', true);
    expect(report).toHaveProperty('createdAt');
  });

  it('bounding box has x, y, w, h percentage fields', () => {
    const bb = { x: 10, y: 20, w: 50, h: 40 };
    const report = createMockReport({
      category: 'pothole',
      lat: 0,
      lng: 0,
      address: '',
      confidence: 0.5,
      boundingBox: bb,
    });

    expect(report.analysis.boundingBox).toEqual(bb);
    expect(report.analysis.boundingBox.x).toBeGreaterThanOrEqual(0);
    expect(report.analysis.boundingBox.x).toBeLessThanOrEqual(100);
    expect(report.analysis.boundingBox.w).toBeGreaterThan(0);
    expect(report.analysis.boundingBox.h).toBeGreaterThan(0);
  });

  it('allows null bounding box', () => {
    const report = createMockReport({
      category: 'pothole',
      lat: 0,
      lng: 0,
      address: '',
      confidence: 0.5,
    });
    expect(report.analysis.boundingBox).toBeNull();
  });

  it('defaults status to SUBMITTED', () => {
    const report = createMockReport({
      category: 'garbage',
      lat: 19.69,
      lng: 72.76,
      address: 'Test',
      confidence: 0.8,
    });
    expect(report.status).toBe('SUBMITTED');
  });

  it('marks reports as demo', () => {
    const report = createMockReport({
      category: 'pothole',
      lat: 0,
      lng: 0,
      address: '',
      confidence: 0.5,
    });
    expect(report.demo).toBe(true);
  });
});

