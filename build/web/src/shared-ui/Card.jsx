import React from 'react';

/**
 * Simple card with square corners, 1px border, subtle shadow.
 */
export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`border border-navy/15 bg-white rounded-card shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

