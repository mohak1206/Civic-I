/**
 * TrackDetailPage.jsx — "/track/:ref" route
 *
 * Displays a report's detail summary and a vertical 13-step status timeline.
 * All data shown is DEMO / PLACEHOLDER — no real municipal integration.
 */

import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Check,
  Info,
  RotateCcw,
  Clock,
} from 'lucide-react';
import SectionLabel from '@shared-ui/SectionLabel';
import Card from '@shared-ui/Card';
import Button from '@shared-ui/Button';
import Badge from '@shared-ui/Badge';
import { findReportByRef } from '../api/reports';

/* ──────────────────────────────────────────────
 * 13-step status lifecycle
 * ────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */
function TrackDetailPage() {
  const { ref } = useParams();

  /* ── Check stored reports or fall back to default mock data ── */
  const stored = findReportByRef(ref);

  const report = stored || {
    ref,
    category: 'pothole',
    currentStatus: 'ANALYZED',
    address: 'Near Palghar Station, Palghar',
    lat: 19.6967,
    lng: 72.7651,
    description: 'Large pothole near the bus stop',
    createdAt: '2024-01-15T10:30:00Z',
    confidence: 0.82,
  };

  /** Index of the report's current status in the lifecycle */
  const currentIndex = STATUSES.findIndex((s) => s.key === report.currentStatus);

  /** Handle reopen demo action */
  const handleReopen = () => {
    // eslint-disable-next-line no-alert
    alert(
      'In a real system, this would reopen the issue. This is a demo.',
    );
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/track"
          className="flex items-center gap-1 text-sm font-heading text-navy/60 hover:text-accent-orange transition-colors"
          aria-label="Back to track search"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-navy">
          {report.ref}
        </h1>
        <Badge color="navy">DEMO REPORT</Badge>
      </div>

      {/* ── Report summary card ── */}
      <Card className="mb-10">
        <div className="p-5 space-y-4">
          {/* Category */}
          <Badge color="orange">
            {report.category.toUpperCase()}
          </Badge>

          {/* Address */}
          <div className="flex items-start gap-2 text-navy/80">
            <MapPin size={16} className="mt-0.5 shrink-0 text-accent-orange" />
            <span className="font-body text-sm">{report.address}</span>
          </div>

          {/* Description */}
          <p className="font-body text-navy text-base leading-relaxed">
            {report.description}
          </p>

          {/* Date */}
          <div className="flex items-center gap-2 text-navy/60">
            <Clock size={14} className="shrink-0" />
            <span className="font-body text-sm">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-navy/70">
              Confidence:{' '}
              <span className="font-semibold text-navy">
                {Math.round(report.confidence * 100)}%
              </span>
            </span>
            <span className="font-body text-xs text-navy/50 italic">
              AI suggestion — human reviewed
            </span>
          </div>
        </div>
      </Card>

      {/* ── Section label ── */}
      <SectionLabel>Status Timeline</SectionLabel>

      {/* ── Vertical timeline ── */}
      <div className="mt-6 mb-10">
        {STATUSES.map((status, index) => {
          const isDone = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const hasDemo = status.desc.includes('DEMO');

          return (
            <div key={status.key} className="relative flex gap-4">
              {/* ── Left: line + circle ── */}
              <div className="flex flex-col items-center">
                {/* Status circle */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center
                    w-7 h-7 rounded-full shrink-0 transition-colors
                    ${isDone && !isCurrent
                      ? 'bg-accent-orange text-white'
                      : ''}
                    ${isCurrent
                      ? 'border-2 border-accent-orange bg-white'
                      : ''}
                    ${isPending
                      ? 'border border-navy/20 bg-white'
                      : ''}
                  `}
                >
                  {isDone && !isCurrent && <Check size={14} />}
                  {isCurrent && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-orange" />
                  )}
                </div>

                {/* Vertical connector line (skip after last item) */}
                {index < STATUSES.length - 1 && (
                  <div className="w-0.5 flex-1 bg-navy/15" />
                )}
              </div>

              {/* ── Right: label + description ── */}
              <div
                className={`
                  pb-6 flex-1 -mt-0.5
                  ${isCurrent
                    ? 'bg-accent-orange/5 p-3 rounded-card border border-accent-orange/20 mb-2'
                    : ''}
                `}
              >
                <p
                  className={`
                    font-heading font-semibold text-sm
                    ${isDone ? 'text-navy' : 'text-navy/40'}
                  `}
                >
                  {status.label}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <p
                    className={`
                      font-body text-sm
                      ${isDone ? 'text-navy/60' : 'text-navy/30'}
                    `}
                  >
                    {/* Strip "DEMO" from inline text when we show badge */}
                    {hasDemo
                      ? status.desc.replace(/\s*—\s*DEMO.*$/, '')
                      : status.desc}
                  </p>
                  {hasDemo && <Badge color="navy">DEMO</Badge>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Reopen button (only when RESOLVED or CLOSED) ── */}
      {(report.currentStatus === 'RESOLVED' ||
        report.currentStatus === 'CLOSED') && (
        <div className="mb-10">
          <Button variant="outline" onClick={handleReopen}>
            <RotateCcw size={16} className="mr-2" />
            Reopen This Issue
          </Button>
        </div>
      )}

      {/* ── Bottom advisory card ── */}
      <Card className="mb-8">
        <div className="flex items-start gap-3 p-4">
          <Info size={18} className="shrink-0 text-accent-blue mt-0.5" />
          <p className="font-body text-sm text-navy/70 leading-relaxed">
            This timeline shows a demonstration of the 13-step status lifecycle.
            In a production system, status changes would be made by verified
            municipal officials. No actual work orders have been issued.
          </p>
        </div>
      </Card>
    </main>
  );
}

export default TrackDetailPage;
