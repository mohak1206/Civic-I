import React from 'react';
import { motion } from 'framer-motion';

export function ProgressBar({ value = 0, max = 100, label, sublabel, color = 'emerald', className = '' }) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorClasses = {
    emerald: 'bg-emerald-500 shadow-emerald-500/30',
    amber: 'bg-amber-500 shadow-amber-500/30',
    blue: 'bg-blue-500 shadow-blue-500/30',
    purple: 'bg-purple-500 shadow-purple-500/30',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || sublabel) && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          {label && <span className="text-zinc-300">{label}</span>}
          {sublabel && <span className="text-zinc-400">{sublabel}</span>}
        </div>
      )}
      <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
        <motion.div
          className={`h-full rounded-full shadow-md ${colorClasses[color] || colorClasses.emerald}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

