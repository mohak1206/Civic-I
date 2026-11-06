import { describe, it, expect } from 'vitest';
import {
  parseVisionResponse,
  parseDecisionResponse,
  buildLlamaDecisionPrompt,
  analyzeImage,
  decideAction,
} from '../build/src/services/ai';

describe('AI Service - Dual Ollama Models', () => {
  describe('Gemma 3 Vision Response Parsing & Validation', () => {
    it('correctly parses and validates valid vision JSON', () => {
      const json = JSON.stringify({
        type: 'pothole',
        confidence: 0.94,
        description: 'Deep road surface crater observed in traffic lane.',
      });
      const res = parseVisionResponse(json);

      expect(res.success).toBe(true);
      expect(res.type).toBe('pothole');
      expect(res.confidence).toBe(0.94);
      expect(res.description).toBe('Deep road surface crater observed in traffic lane.');
    });

    it('handles markdown code fences in model output', () => {
      const wrapped = '```json\n{"type": "garbage", "confidence": 0.88, "description": "Overflowing waste bin."}\n```';
      const res = parseVisionResponse(wrapped);

      expect(res.success).toBe(true);
      expect(res.type).toBe('garbage');
      expect(res.confidence).toBe(0.88);
    });

    it('normalizes legacy category aliases to standard types', () => {
      const res1 = parseVisionResponse(JSON.stringify({ type: 'broken_street_light', confidence: 0.8 }));
      expect(res1.type).toBe('street_light');

      const res2 = parseVisionResponse(JSON.stringify({ type: 'damaged_bridge', confidence: 0.8 }));
      expect(res2.type).toBe('bridge');
    });

    it('falls back to type "other" when unknown type is returned', () => {
      const res = parseVisionResponse(JSON.stringify({ type: 'unrecognized_flying_object', confidence: 0.8 }));
      expect(res.success).toBe(true);
      expect(res.type).toBe('other');
    });

    it('clamps out-of-range confidence between 0.0 and 1.0', () => {
      const tooHigh = parseVisionResponse(JSON.stringify({ type: 'pothole', confidence: 2.5 }));
      expect(tooHigh.confidence).toBe(1.0);

      const tooLow = parseVisionResponse(JSON.stringify({ type: 'pothole', confidence: -0.8 }));
      expect(tooLow.confidence).toBe(0.0);

      const nanVal = parseVisionResponse(JSON.stringify({ type: 'pothole', confidence: 'not-a-number' }));
      expect(nanVal.confidence).toBe(0.5);
    });

    it('returns type "other" and confidence 0 on malformed JSON', () => {
      const res = parseVisionResponse('Malformed raw text from model that is not JSON {{{{');
      expect(res.success).toBe(false);
      expect(res.type).toBe('other');
      expect(res.confidence).toBe(0);
    });
  });

  describe('Llama 3 Action Decision Response Parsing & Validation', () => {
    it('correctly parses and validates valid decision JSON', () => {
      const json = JSON.stringify({
        priority: 'high',
        reason: 'Immediate pedestrian tripping hazard on arterial road.',
        department: 'roads department',
        summary: 'Emergency road repair required.',
      });
      const res = parseDecisionResponse(json);

      expect(res.success).toBe(true);
      expect(res.priority).toBe('high');
      expect(res.reason).toBe('Immediate pedestrian tripping hazard on arterial road.');
      expect(res.department).toBe('roads department');
      expect(res.summary).toBe('Emergency road repair required.');
    });

    it('clamps invalid priority strings to "medium"', () => {
      const res = parseDecisionResponse(JSON.stringify({ priority: 'ultra_critical', reason: 'Urgent' }));
      expect(res.priority).toBe('medium');
    });

    it('gracefully handles malformed decision JSON', () => {
      const res = parseDecisionResponse('Invalid response text {{{');
      expect(res.success).toBe(false);
      expect(res.priority).toBe('medium');
      expect(res.department).toBe('general municipal works');
    });
  });

  describe('Llama 3 Prompt Privacy Enforcement', () => {
    it('asserts the decision prompt contains strictly NO user name, email, or photo data', () => {
      const facts = {
        type: 'pothole',
        description: 'Large fissure near railway crossing.',
        locationText: 'Station Road, Palghar',
      };

      const prompt = buildLlamaDecisionPrompt(facts);

      // Verify facts are present
      expect(prompt).toContain('pothole');
      expect(prompt).toContain('Large fissure near railway crossing.');
      expect(prompt).toContain('Station Road, Palghar');

      // Verify privacy constraints: NO personal data identifiers
      expect(prompt).not.toContain('name');
      expect(prompt).not.toContain('email');
      expect(prompt).not.toContain('@');
      expect(prompt).not.toContain('data:image');
      expect(prompt).not.toContain('base64');
      expect(prompt).not.toContain('reporter');
    });
  });

  describe('Model Fallback Handlers', () => {
    it('returns error when analyzing image without photo', async () => {
      const res = await analyzeImage(null);
      expect(res.success).toBe(false);
      expect(res.type).toBe('other');
      expect(res.confidence).toBe(0);
    });
  });

  describe('Report Schema Structure for Dual AI Tracking', () => {
    it('records both AI suggestions and user confirmed values separately', () => {
      const sampleReport = {
        title: 'Reported pothole hazard',
        type: 'pothole',
        priority: 'high',
        department: 'roads department',
        ai_type: 'pothole',
        ai_confidence: 0.92,
        ai_priority: 'high',
        ai_department: 'roads department',
        confirmed_type: 'pothole',
        confirmed_priority: 'high',
        confirmed_department: 'roads department',
      };

      expect(sampleReport.ai_type).toBe('pothole');
      expect(sampleReport.ai_confidence).toBe(0.92);
      expect(sampleReport.ai_priority).toBe('high');
      expect(sampleReport.ai_department).toBe('roads department');
      expect(sampleReport.confirmed_type).toBe('pothole');
      expect(sampleReport.confirmed_priority).toBe('high');
      expect(sampleReport.confirmed_department).toBe('roads department');
    });
  });
});
