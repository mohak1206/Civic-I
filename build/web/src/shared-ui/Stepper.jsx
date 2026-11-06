import React from 'react';
import { Check } from 'lucide-react';

/**
 * Wizard stepper – shows 4 steps with active / done / pending states.
 *
 * @param {number} current – 0-based index of the active step
 * @param {string[]} steps – array of step labels
 */
export default function Stepper({ current = 0, steps = [] }) {
  return (
    <div className="w-full">
      {/* "STEP n OF total" label */}
      <p className="label-xs text-accent-orange mb-3">
        Step {current + 1} of {steps.length}
      </p>

      <div className="flex items-center gap-0">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;

          return (
            <React.Fragment key={i}>
              {/* Step circle + label */}
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`w-8 h-8 rounded-card flex items-center justify-center text-sm font-heading font-semibold transition-colors
                    ${done ? 'bg-accent-orange text-white' : ''}
                    ${active ? 'border-2 border-accent-orange text-accent-orange bg-white' : ''}
                    ${!done && !active ? 'border border-navy/20 text-navy/40 bg-white' : ''}
                  `}
                >
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`mt-1.5 text-[10px] uppercase tracking-label font-heading font-medium text-center hidden sm:block
                    ${active ? 'text-accent-orange font-semibold' : 'text-navy/40'}
                  `}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px mx-1 ${
                    i < current ? 'bg-accent-orange' : 'bg-navy/15'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

