import { normalizeIssueType } from '../utils/constants';

/**
 * Builds the text-only prompt for Llama 3 decision model.
 * STRICT PRIVACY GUARANTEE: Never includes user's name, email, or photo data.
 */
export function buildLlamaDecisionPrompt({ type, description, locationText }) {
  const safeType = type || 'other';
  const safeDesc = description || 'No detailed description provided.';
  const safeLoc = locationText || 'Location details pending.';

  return `You are an advisory civic infrastructure triage assistant for Palghar City.
Analyze the following factual civic hazard report.

FACTS:
- Hazard Type: ${safeType}
- Description: ${safeDesc}
- General Location: ${safeLoc}

RULES:
1. Determine priority strictly as one of: "low", "medium", or "high".
2. Justify priority based strictly on safety risk and traffic exposure described above.
3. Explicitly state when crucial information is missing.
4. Recommend a generic municipal department (e.g. "roads department", "sanitation department", "electrical department", "bridges & structures department", "general municipal works").
5. NEVER claim that a team was dispatched, a work order was issued, or any department was notified. This is an advisory suggestion only.

Respond ONLY with valid JSON in this exact structure:
{
  "priority": "low" | "medium" | "high",
  "reason": "Brief justification based on safety risk and traffic exposure",
  "department": "generic municipal department",
  "summary": "One line summary of recommended civic action"
}`;
}

/**
 * Downscale image data URL to approximately 640px max dimension
 */
export async function resizeImageForVision(dataUrl, maxDim = 640) {
  if (typeof document === 'undefined' || !dataUrl.startsWith('data:image')) {
    return dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl);
      }
      ctx.drawImage(img, 0, 0, width, height);
      const resized = canvas.toDataURL('image/jpeg', 0.75);
      resolve(resized.includes(',') ? resized.split(',')[1] : resized);
    };
    img.onerror = () => {
      resolve(dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl);
    };
    img.src = dataUrl;
  });
}

/**
 * 1. analyzeImage(dataUrl) -> Gemma 3 Vision Model (4B or larger)
 * Sends photo as base64. Returns { type, confidence, description }.
 * Type is one of: pothole, street_light, garbage, bridge, other.
 * Timeout: ~60 seconds.
 */
export async function analyzeImage(dataUrl) {
  const model = import.meta.env.VITE_OLLAMA_VISION_MODEL || 'gemma3:4b';

  if (!dataUrl) {
    return {
      success: false,
      type: 'other',
      confidence: 0,
      description: 'No image provided for visual inspection.',
      error: 'Please capture or upload a photo first.',
    };
  }

  const base64Image = await resizeImageForVision(dataUrl, 640);

  const prompt = `You are a municipal infrastructure inspector for Palghar City.
Inspect the attached photo and describe ONLY what is directly visible.
Classify the issue into exactly one of these five types:
- pothole
- street_light
- garbage
- bridge
- other

Respond ONLY with valid JSON in this schema:
{
  "type": "pothole" | "street_light" | "garbage" | "bridge" | "other",
  "confidence": 0.85,
  "description": "Concise factual description of what is visually observed"
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const response = await fetch('/ollama/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model.trim(),
        messages: [
          {
            role: 'user',
            content: prompt,
            images: [base64Image],
          },
        ],
        format: 'json',
        stream: false,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        type: 'other',
        confidence: 0,
        description: 'Visual analysis unavailable.',
        fixCommand: `ollama pull ${model}`,
        error: `Ollama returned error (${response.status}): ${errorText || 'Model missing or offline'}. Run '${model ? `ollama pull ${model}` : 'ollama pull gemma3:4b'}' or choose category manually.`,
      };
    }

    const data = await response.json();
    const content = data?.message?.content;
    if (!content) {
      return {
        success: false,
        type: 'other',
        confidence: 0,
        description: 'Empty response payload from vision model.',
      };
    }

    return parseVisionResponse(content);
  } catch (err) {
    const isAbort = err.name === 'AbortError';
    return {
      success: false,
      type: 'other',
      confidence: 0,
      description: isAbort
        ? 'Vision analysis timed out after 60s.'
        : 'Could not connect to Ollama service.',
      fixCommand: `ollama pull ${model}`,
      error: isAbort
        ? 'Gemma 3 vision analysis timed out (60s limit reached). You can choose category manually.'
        : `Could not connect to local Ollama. Ensure Ollama is running and execute: 'ollama pull ${model}'.`,
    };
  }
}

/**
 * Validates and clamps Gemma 3 vision response JSON
 */
export function parseVisionResponse(content) {
  try {
    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    const rawType = parsed?.type;
    const normalizedType = normalizeIssueType(rawType);

    // Validate confidence and clamp between 0 and 1
    let rawConf = parseFloat(parsed?.confidence);
    if (isNaN(rawConf)) {
      rawConf = 0.5;
    }
    const clampedConfidence = Math.max(0, Math.min(1, rawConf));

    const description = parsed?.description || parsed?.summary || `Observed ${normalizedType.replace(/_/g, ' ')}.`;

    return {
      success: true,
      type: normalizedType,
      confidence: Number(clampedConfidence.toFixed(2)),
      description: String(description).trim(),
    };
  } catch (e) {
    // On parse failure return type "other", confidence 0
    return {
      success: false,
      type: 'other',
      confidence: 0,
      description: 'Failed to parse visual inspection output.',
      error: 'Malformed JSON from vision model.',
    };
  }
}

/**
 * 2. decideAction({ type, description, locationText }) -> Llama 3 Decision Model
 * Receives only text facts. Returns { priority: "low"|"medium"|"high", reason, department, summary }.
 * Timeout: ~30 seconds.
 */
export async function decideAction({ type, description, locationText }) {
  const model = import.meta.env.VITE_OLLAMA_TEXT_MODEL || 'llama3';

  const prompt = buildLlamaDecisionPrompt({ type, description, locationText });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch('/ollama/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model.trim(),
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        format: 'json',
        stream: false,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        priority: 'medium',
        reason: 'Action triage model unavailable. Defaulting to medium priority.',
        department: 'general municipal works',
        summary: 'Review hazard and assign municipal responder.',
        fixCommand: `ollama pull ${model}`,
        error: `Ollama error (${response.status}): ${errorText || 'Model missing or offline'}. Run 'ollama pull ${model}'.`,
      };
    }

    const data = await response.json();
    const content = data?.message?.content;
    if (!content) {
      return {
        success: false,
        priority: 'medium',
        reason: 'Empty response payload from decision model.',
        department: 'general municipal works',
        summary: 'Manual review suggested.',
      };
    }

    return parseDecisionResponse(content);
  } catch (err) {
    const isAbort = err.name === 'AbortError';
    return {
      success: false,
      priority: 'medium',
      reason: isAbort
        ? 'Llama 3 decision triage timed out (30s limit).'
        : 'Could not connect to Ollama decision service.',
      department: 'general municipal works',
      summary: 'Action triage pending municipal verification.',
      fixCommand: `ollama pull ${model}`,
      error: isAbort
        ? 'Decision triage timed out after 30s. You can set priority manually.'
        : `Could not connect to Ollama for decision triage. Run: 'ollama pull ${model}'.`,
    };
  }
}

/**
 * Validates and clamps Llama 3 decision response JSON
 */
export function parseDecisionResponse(content) {
  try {
    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    let priority = String(parsed?.priority || 'medium').toLowerCase().trim();
    if (!['low', 'medium', 'high'].includes(priority)) {
      priority = 'medium';
    }

    const reason = parsed?.reason || 'Priority suggested based on general hazard exposure.';
    const department = parsed?.department || 'general municipal works';
    const summary = parsed?.summary || `Assign to ${department} with ${priority} priority.`;

    return {
      success: true,
      priority,
      reason: String(reason).trim(),
      department: String(department).trim(),
      summary: String(summary).trim(),
    };
  } catch (e) {
    return {
      success: false,
      priority: 'medium',
      reason: 'Could not parse structured triage decision from model.',
      department: 'general municipal works',
      summary: 'Manual inspection required.',
      error: 'Malformed JSON from decision model.',
    };
  }
}
