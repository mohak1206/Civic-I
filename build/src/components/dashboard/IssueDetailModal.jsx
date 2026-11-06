import React from 'react';
import { MapPin, Calendar, Building2, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';
import { ISSUE_TYPES, ISSUE_STATUSES, ISSUE_PRIORITIES, normalizeIssueType, normalizePriority } from '../../utils/constants';
import { formatCoordinates } from '../../utils/mapHelpers';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function IssueDetailModal({ issue, isOpen, onClose, onAdvanceStatus }) {
  if (!issue) return null;

  const normType = normalizeIssueType(issue.type);
  const typeObj = ISSUE_TYPES.find((t) => t.id === normType) || ISSUE_TYPES[ISSUE_TYPES.length - 1];
  const statusObj = ISSUE_STATUSES.find((s) => s.id === issue.status) || ISSUE_STATUSES[0];

  const priorityVal = normalizePriority(issue.priority);
  const priorityObj = ISSUE_PRIORITIES.find((p) => p.id === priorityVal) || ISSUE_PRIORITIES[3];

  const statuses = ['reported', 'in_review', 'in_progress', 'resolved'];
  const currentIndex = statuses.indexOf(issue.status);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={issue.title} maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Photo */}
        {issue.photo && (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
            <img src={issue.photo} alt={issue.title} className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-md"
                style={{ backgroundColor: typeObj.color }}
              >
                {typeObj.label}
              </span>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-md ${statusObj.color}`}>
                {statusObj.label}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-md ${priorityObj.color}`}>
                {priorityObj.label}
              </span>
            </div>
          </div>
        )}

        {/* Priority & Triage Summary Banner */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1">
              Triage Priority
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-bold ${priorityObj.color}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {priorityObj.label}
            </span>
          </div>

          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1">
              Assigned Department
            </span>
            <div className="flex items-center gap-1.5 text-zinc-200 font-semibold text-xs">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="capitalize">{issue.department || 'General municipal works'}</span>
            </div>
          </div>
        </div>

        {/* Urgency Justification */}
        {issue.reason && (
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">
              Urgency Justification (Llama 3 Text Analysis)
            </span>
            <p className="italic text-zinc-300">"{issue.reason}"</p>
          </div>
        )}

        {/* Status Progression Timeline */}
        <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
            Status Progression
          </span>
          <div className="grid grid-cols-4 gap-1 text-center">
            {statuses.map((st, idx) => {
              const isPast = idx <= currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={st} className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 border ${
                      isCurrent
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/30'
                        : isPast
                        ? 'bg-zinc-800 text-emerald-400 border-emerald-500/40'
                        : 'bg-zinc-900 text-zinc-600 border-zinc-800'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-[10px] capitalize leading-none ${
                      isCurrent ? 'text-emerald-400 font-bold' : isPast ? 'text-zinc-300' : 'text-zinc-600'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
            Description
          </span>
          <p className="text-sm text-zinc-200 bg-zinc-950/60 p-3 rounded-xl border border-zinc-850 leading-relaxed">
            {issue.description || 'No description provided.'}
          </p>
        </div>

        {/* AI Insight Box */}
        {(issue.aiClassification || issue.ai_type) && (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Suggestions vs Confirmed Values</span>
              </span>
              <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/20">
                AI Output is a Suggestion
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-zinc-950/60 rounded border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Gemma 3 Vision AI</span>
                <span className="text-zinc-200 capitalize font-medium">
                  {(issue.ai_type || issue.aiClassification?.type || 'N/A').replace(/_/g, ' ')}
                  {(issue.ai_confidence || issue.aiClassification?.confidence)
                    ? ` (${Math.round((issue.ai_confidence || issue.aiClassification?.confidence) * 100)}%)`
                    : ''}
                </span>
              </div>
              <div className="p-2 bg-zinc-950/60 rounded border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Confirmed Type</span>
                <span className="text-emerald-400 capitalize font-medium">
                  {(issue.confirmed_type || issue.type).replace(/_/g, ' ')}
                </span>
              </div>
              <div className="p-2 bg-zinc-950/60 rounded border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Llama 3 Priority AI</span>
                <span className="text-zinc-200 capitalize font-medium">
                  {issue.ai_priority || issue.aiActionDecision?.priority || 'Not set'}
                </span>
              </div>
              <div className="p-2 bg-zinc-950/60 rounded border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Confirmed Priority</span>
                <span className="text-emerald-400 capitalize font-medium">
                  {issue.confirmed_priority || issue.priority || 'Not set'}
                </span>
              </div>
            </div>
            {issue.aiClassification?.description && (
              <p className="text-xs text-zinc-400 italic">"{issue.aiClassification.description}"</p>
            )}
          </div>
        )}

        {/* Location & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Location</span>
              <p className="text-zinc-200">{issue.location?.address || 'Palghar, Maharashtra'}</p>
              {issue.location?.lat && (
                <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                  {formatCoordinates(issue.location.lat, issue.location.lng)}
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800 flex items-start gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Date Reported</span>
              <p className="text-zinc-200">{new Date(issue.createdAt).toLocaleString()}</p>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Reporter: {issue.reporterName || 'Anonymous Citizen'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onAdvanceStatus && issue.status !== 'resolved' && (
            <Button
              variant="demo"
              onClick={() => {
                const next = statuses[currentIndex + 1] || 'resolved';
                onAdvanceStatus(issue.id, next);
              }}
            >
              <Badge variant="demo" size="xs">
                DEMO
              </Badge>
              <span>Advance Status</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
