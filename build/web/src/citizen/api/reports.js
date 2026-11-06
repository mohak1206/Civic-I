/**
 * Citizen Reports API service.
 * Supports VITE_USE_MOCK mode (stores in localStorage for demo).
 * Follows PROJECT_RULES.md:
 * - AI output is a suggestion, human reviews it
 * - All demo data is marked demo: true
 * - Categories: pothole, garbage
 */

const STORAGE_KEY = 'civici_citizen_reports';

export function getStoredReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReportLocally(report) {
  try {
    const existing = getStoredReports();
    const updated = [report, ...existing.filter((r) => r.ref !== report.ref)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save report to localStorage:', err);
  }
}

export function findReportByRef(ref) {
  const reports = getStoredReports();
  return reports.find((r) => r.ref?.toLowerCase() === ref?.toLowerCase()) || null;
}

/**
 * Submits a new citizen report.
 */
export async function submitReport(reportData) {
  const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

  if (isMock) {
    // Simulate brief network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const refNumber = 'CIV-' + String(Math.floor(100000 + Math.random() * 900000));
    const newReport = {
      ...reportData,
      ref: refNumber,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      demo: true,
    };

    saveReportLocally(newReport);
    return newReport;
  }

  // Real backend submission fallback
  const response = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    throw new Error(`Report submission failed with status ${response.status}`);
  }

  return response.json();
}

