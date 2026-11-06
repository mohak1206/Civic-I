/**
 * Local AI Visual Issue Classifier via Ollama
 * Calls /ollama/api/chat through Vite dev proxy
 */
export async function analyzeIssuePhoto(dataUrl) {
  const model = import.meta.env.VITE_OLLAMA_MODEL;

  if (!model || model.trim() === '') {
    return {
      success: false,
      reason: 'NO_MODEL_CONFIGURED',
      error: 'VITE_OLLAMA_MODEL is not configured in .env. Please select the category manually.',
    };
  }

  // Extract pure base64 representation without data URI prefix
  const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

  const prompt = `Analyze this civic issue photo for a municipal reporting system.
Classify the issue into exactly one of these types:
- pothole
- broken_street_light
- garbage
- damaged_bridge
- other

Respond ONLY with a valid JSON object matching this schema:
{
  "type": "pothole" | "broken_street_light" | "garbage" | "damaged_bridge" | "other",
  "confidence": 0.85,
  "summary": "One sentence summary describing the visual observation"
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

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
            images: [base64Data],
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
        reason: 'OLLAMA_HTTP_ERROR',
        status: response.status,
        error: `Ollama returned error (${response.status}): ${errorText || 'Check model availability'}. You can choose category manually.`,
      };
    }

    const data = await response.json();
    const content = data?.message?.content;
    if (!content) {
      throw new Error('Empty response payload from Ollama.');
    }

    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Clean possible markdown code fences
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    const validTypes = ['pothole', 'broken_street_light', 'garbage', 'damaged_bridge', 'other'];
    const issueType = validTypes.includes(parsed.type) ? parsed.type : 'other';
    const confidence = typeof parsed.confidence === 'number'
      ? Math.max(0.1, Math.min(0.99, parsed.confidence))
      : 0.85;

    return {
      success: true,
      type: issueType,
      confidence: Number(confidence.toFixed(2)),
      summary: parsed.summary || `Observed possible ${issueType.replace(/_/g, ' ')}.`,
      raw: parsed,
    };
  } catch (err) {
    console.warn('Ollama classification failed:', err);
    const isAbort = err.name === 'AbortError';
    return {
      success: false,
      reason: isAbort ? 'TIMEOUT' : 'CONNECTION_FAILED',
      error: isAbort
        ? 'Ollama analysis timed out. You can select the category manually.'
        : 'Could not connect to local Ollama (http://localhost:11434). Ensure Ollama is running or pick the category manually.',
    };
  }
}

