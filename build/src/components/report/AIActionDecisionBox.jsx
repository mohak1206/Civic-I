import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, AlertCircle, Info, Check, Edit3, Building2, AlertTriangle } from 'lucide-react';
import { ISSUE_PRIORITIES } from '../../utils/constants';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function AIActionDecisionBox({
  loading,
  decision,
  priority,
  onPriorityChange,
  department,
  onDepartmentChange,
  reason,
  onReasonChange,
  onRetry,
  error,
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            Llama 3 Evaluating Hazard Urgency...
            <span className="text-[10px] text-zinc-500 font-mono">Llama 3</span>
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Assessing safety risk, traffic exposure, and municipal department routing...
          </p>
        </div>
      </div>
    );
  }

  const priorityColors = {
    high: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  };

  return (
    <div className="space-y-3">
      {/* Required Disclaimer */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <p className="leading-relaxed">
          <strong className="font-semibold">AI suggestion:</strong> Llama 3 evaluates hazard facts for urgency.
          No work orders or teams have been dispatched. You may adjust the priority and department below.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-300">
          <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-medium text-zinc-200 block">{error}</span>
            <span className="text-zinc-500 text-[11px] mt-0.5 block">
              You can set the priority and municipal department manually below.
            </span>
          </div>
          {onRetry && (
            <Button size="sm" variant="ghost" onClick={onRetry} icon={RefreshCw}>
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Decision Card */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Triage Assessment
            </span>
          </div>
          <Badge variant="primary" size="xs">
            Llama 3
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
              Assigned Priority
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold capitalize mt-1 ${
                priorityColors[priority] || priorityColors.medium
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {priority} Priority
            </span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
              Suggested Department
            </span>
            <div className="flex items-center gap-1.5 text-zinc-200 font-medium mt-1">
              <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="capitalize">{department || 'General municipal works'}</span>
            </div>
          </div>
        </div>

        {reason && (
          <div className="pt-2 text-xs text-zinc-300 border-t border-zinc-800/60">
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold mb-0.5">
              Urgency Justification
            </span>
            <p className="italic text-zinc-300 leading-relaxed">"{reason}"</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <Button
            size="sm"
            variant={isEditing ? 'secondary' : 'ghost'}
            onClick={() => setIsEditing(!isEditing)}
            icon={Edit3}
          >
            {isEditing ? 'Hide Edit Fields' : 'Edit Priority & Routing'}
          </Button>

          {onRetry && (
            <Button size="sm" variant="ghost" onClick={onRetry} icon={RefreshCw}>
              Re-run Llama 3
            </Button>
          )}
        </div>
      </div>

      {/* Manual Editing Fields */}
      {isEditing && (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Select Urgency Priority:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPriorityChange(p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      isSelected
                        ? priorityColors[p] + ' shadow-md ring-1 ring-emerald-500'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Municipal Department:
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value)}
              placeholder="e.g. Roads Department, Sanitation, Electrical"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Urgency Reason:
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Describe safety risk or traffic exposure"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

