import React from 'react';
import { MapPin, Calendar, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import { ISSUE_TYPES, ISSUE_STATUSES, ISSUE_PRIORITIES, normalizeIssueType, normalizePriority } from '../../utils/constants';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function IssueCard({ issue, onAdvanceStatus, onSelect }) {
  const normType = normalizeIssueType(issue.type);
  const typeObj = ISSUE_TYPES.find((t) => t.id === normType) || ISSUE_TYPES[ISSUE_TYPES.length - 1];
  const statusObj = ISSUE_STATUSES.find((s) => s.id === issue.status) || ISSUE_STATUSES[0];

  const priorityVal = normalizePriority(issue.priority);
  const priorityObj = ISSUE_PRIORITIES.find((p) => p.id === priorityVal) || ISSUE_PRIORITIES[3];

  const getNextStatus = (current) => {
    switch (current) {
      case 'reported':
        return 'in_review';
      case 'in_review':
        return 'in_progress';
      case 'in_progress':
        return 'resolved';
      default:
        return 'reported';
    }
  };

  const handleAdvance = (e) => {
    e.stopPropagation();
    const next = getNextStatus(issue.status);
    onAdvanceStatus(issue.id, next);
  };

  return (
    <Card hover onClick={onSelect} className="flex flex-col h-full group p-4 sm:p-5">
      {/* Photo */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-950 mb-3 border border-zinc-800">
        {issue.photo ? (
          <img
            src={issue.photo}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
            No image attached
          </div>
        )}

        <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-md flex items-center gap-1"
            style={{ backgroundColor: typeObj.color }}
          >
            {typeObj.label}
          </span>
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-md ${statusObj.color}`}>
            {statusObj.label}
          </span>
        </div>

        {/* Priority Badge on Image Footer */}
        <div className="absolute bottom-2 left-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-md shadow-md flex items-center gap-1 ${priorityObj.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priorityObj.dot}`} />
            {priorityObj.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h4 className="text-sm font-semibold text-zinc-100 line-clamp-1 group-hover:text-emerald-400 transition-colors">
            {issue.title}
          </h4>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {issue.description || 'No additional details provided.'}
          </p>
        </div>

        {/* Location & Metadata */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
          {issue.location?.address && (
            <div className="flex items-center gap-1.5 text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{issue.location.address}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-zinc-500 text-[10px]">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
            {issue.aiClassification?.confirmedByUser && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Sparkles className="w-2.5 h-2.5" /> AI Confirmed
              </span>
            )}
          </div>
        </div>

        {/* Simulated Advance Status Button */}
        <div className="pt-2">
          <Button
            size="sm"
            variant="demo"
            className="w-full text-xs justify-between"
            onClick={handleAdvance}
          >
            <span className="flex items-center gap-1">
              <Badge variant="demo" size="xs">
                DEMO
              </Badge>
              <span>Advance Status</span>
            </span>
            <span className="text-[10px] font-normal opacity-80 flex items-center gap-0.5">
              to {getNextStatus(issue.status).replace(/_/g, ' ')}
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
