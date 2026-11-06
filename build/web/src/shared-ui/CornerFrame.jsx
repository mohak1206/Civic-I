import React from 'react';

/**
 * Wrapper that draws L-shaped corner brackets around its children.
 *
 * @param {'orange'|'blue'|'navy'} color
 * @param {number} size – bracket arm length in px (default 20)
 */
export default function CornerFrame({
  children,
  color = 'orange',
  size = 20,
  className = '',
}) {
  const colorMap = {
    orange: '#E8501F',
    blue: '#3B7DD8',
    navy: '#1B2536',
  };
  const c = colorMap[color] || colorMap.orange;
  const s = `${size}px`;

  const corner = (pos) => {
    const styles = { position: 'absolute', width: s, height: s };
    if (pos === 'tl') {
      styles.top = 0;
      styles.left = 0;
      styles.borderTop = `2px solid ${c}`;
      styles.borderLeft = `2px solid ${c}`;
    } else if (pos === 'tr') {
      styles.top = 0;
      styles.right = 0;
      styles.borderTop = `2px solid ${c}`;
      styles.borderRight = `2px solid ${c}`;
    } else if (pos === 'bl') {
      styles.bottom = 0;
      styles.left = 0;
      styles.borderBottom = `2px solid ${c}`;
      styles.borderLeft = `2px solid ${c}`;
    } else {
      styles.bottom = 0;
      styles.right = 0;
      styles.borderBottom = `2px solid ${c}`;
      styles.borderRight = `2px solid ${c}`;
    }
    return <span style={styles} aria-hidden="true" />;
  };

  return (
    <div className={`relative ${className}`}>
      {corner('tl')}
      {corner('tr')}
      {corner('bl')}
      {corner('br')}
      {children}
    </div>
  );
}

