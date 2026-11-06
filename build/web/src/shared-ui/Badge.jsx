import React from 'react';

/**
 * Compact label badge.
 *
 * @param {'gold'|'orange'|'blue'|'navy'} color
 */
export default function Badge({ children, color = 'gold', className = '' }) {
  const styles = {
    gold: 'bg-accent-gold/15 text-accent-gold border-accent-gold/30',
    orange: 'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
    blue: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
    green: 'bg-accent-green/15 text-accent-green border-accent-green/30',
    navy: 'bg-navy/10 text-navy border-navy/20',
  };

  return (
    <span
      className={`inline-flex items-center label-xs px-2.5 py-1 border rounded-card ${styles[color] || styles.gold} ${className}`}
    >
      {children}
    </span>
  );
}

