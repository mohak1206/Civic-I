/**
 * DevComponentsPage.jsx
 * ─────────────────────
 * Route: /dev/components
 *
 * A gallery page showcasing every shared-ui component variant on a single
 * page. Intended for development & design-review purposes only.
 *
 * PLACEHOLDER / DEMO DATA — not for production use.
 */

import React from 'react';
import {
  Button,
  SectionLabel,
  Badge,
  CornerFrame,
  Card,
  Stepper,
} from '@shared-ui';

/* ── Reusable section wrapper ─────────────────────────────────────────── */
const Section = ({ title, children }) => (
  <section className="mb-12 border-b border-navy/10 pb-8">
    <h2 className="font-heading text-2xl text-text-heading mb-4">{title}</h2>
    {children}
  </section>
);

/* ── Color swatch helper ──────────────────────────────────────────────── */
const COLOR_TOKENS = [
  { name: 'Page Background', hex: '#F5F3EE' },
  { name: 'Dark Panel', hex: '#1B2536' },
  { name: 'Card Border', hex: '#D9D5CC' },
  { name: 'Text Heading', hex: '#1B2536' },
  { name: 'Text Body', hex: '#5B6472' },
  { name: 'Text Muted', hex: '#8A919C' },
  { name: 'Primary Orange', hex: '#E8501F' },
  { name: 'Orange Hover', hex: '#CF4416' },
  { name: 'Accent Blue', hex: '#3B7DD8' },
  { name: 'Accent Gold', hex: '#D4960F' },
  { name: 'Accent Green', hex: '#2E9E5B' },
  { name: 'Disabled Button', hex: '#5B6879' },
];

const STEPPER_STEPS = ['Capture', 'Analyze', 'Confirm', 'Submit'];

export default function DevComponentsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page title */}
      <h1 className="font-heading text-3xl md:text-4xl text-text-heading mb-2">
        Component Gallery
      </h1>
      <p className="font-body text-text-muted mb-10">
        DEMO — Visual design system and shared UI components in Light Theme.
      </p>

      {/* ───────────────────────── 1. BUTTONS ──────────────────────────── */}
      <Section title="1. Buttons">
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary Action</Button>
          <Button variant="outline">Secondary Action</Button>
          <Button variant="gold-outline" showArrow={false}>Gold Demo Outline</Button>
          <Button variant="primary" disabled>Disabled Action</Button>
          <Button variant="outline" showArrow={false}>No Arrow</Button>
        </div>
      </Section>

      {/* ───────────────────────── 2. SECTION LABELS ───────────────────── */}
      <Section title="2. Section Labels">
        <div className="space-y-4 max-w-sm">
          <SectionLabel>Example Label</SectionLabel>
          <SectionLabel>How It Works</SectionLabel>
          <SectionLabel>Platform Impact</SectionLabel>
        </div>
      </Section>

      {/* ───────────────────────── 3. BADGES ───────────────────────────── */}
      <Section title="3. Badges">
        <div className="flex flex-wrap gap-3 items-center">
          <Badge color="gold">Gold Badge</Badge>
          <Badge color="orange">Orange Badge</Badge>
          <Badge color="blue">Blue Badge</Badge>
          <Badge color="green">Green Accent</Badge>
          <Badge color="navy">Navy Badge</Badge>
        </div>
      </Section>

      {/* ───────────────────────── 4. CORNER FRAMES ────────────────────── */}
      <Section title="4. Corner Frames">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CornerFrame color="orange" size={20}>
            <div className="p-8 text-center bg-white border border-card-border rounded-card">
              <span className="font-heading text-sm text-text-heading font-semibold">
                Orange Frame
              </span>
            </div>
          </CornerFrame>
          <CornerFrame color="blue" size={20}>
            <div className="p-8 text-center bg-white border border-card-border rounded-card">
              <span className="font-heading text-sm text-text-heading font-semibold">
                Blue Frame
              </span>
            </div>
          </CornerFrame>
          <CornerFrame color="navy" size={20}>
            <div className="p-8 text-center bg-white border border-card-border rounded-card">
              <span className="font-heading text-sm text-text-heading font-semibold">
                Navy Frame
              </span>
            </div>
          </CornerFrame>
        </div>
      </Section>

      {/* ───────────────────────── 5. CARDS ────────────────────────────── */}
      <Section title="5. Cards">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-heading text-base text-text-heading font-semibold mb-2">
              Card with Heading &amp; Body
            </h3>
            <p className="font-body text-sm text-text-body">
              Clean card with warm light background (#F5F3EE), 1px border (#D9D5CC), and subtle shadow.
            </p>
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <span className="font-body text-sm text-text-body">Card with Badge</span>
            <Badge color="orange">DEMO</Badge>
          </Card>
        </div>
      </Section>

      {/* ───────────────────────── 6. STEPPER ──────────────────────────── */}
      <Section title="6. Steppers (Square Icon Boxes)">
        <div className="space-y-8">
          <div>
            <p className="text-xs text-text-muted mb-2 font-mono">Step 1 active (current=0)</p>
            <Stepper current={0} steps={STEPPER_STEPS} />
          </div>
          <div>
            <p className="text-xs text-text-muted mb-2 font-mono">Step 3 active (current=2)</p>
            <Stepper current={2} steps={STEPPER_STEPS} />
          </div>
          <div>
            <p className="text-xs text-text-muted mb-2 font-mono">All steps completed (current=3)</p>
            <Stepper current={3} steps={STEPPER_STEPS} />
          </div>
        </div>
      </Section>

      {/* ───────────────────────── 7. TYPOGRAPHY ───────────────────────── */}
      <Section title="7. Typography">
        <div className="space-y-4">
          <h1 className="font-heading text-4xl text-text-heading">
            Heading 1 — Space Grotesk Bold
          </h1>
          <h2 className="font-heading text-3xl text-text-heading">
            Heading 2 — Space Grotesk Bold
          </h2>
          <h3 className="font-heading text-2xl text-text-heading">
            Heading 3 — Space Grotesk Bold
          </h3>
          <p className="font-body text-base text-text-body leading-relaxed max-w-2xl">
            Body text set in Source Serif 4 or Spectral serif font. Designed for high legibility
            across long paragraphs, incident descriptions, and citizen notices.
          </p>
          <p className="font-body text-sm text-text-muted">
            Muted secondary body text (#8A919C) for helper captions and timestamps.
          </p>
          <span className="label-xs text-accent-orange block">
            Small label uppercase tracking-label (10-11px Space Grotesk)
          </span>
        </div>
      </Section>

      {/* ───────────────────────── 8. COLOR TOKENS ─────────────────────── */}
      <Section title="8. Color Tokens">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {COLOR_TOKENS.map((token) => (
            <div
              key={token.name}
              className="border border-card-border rounded-card p-3 bg-white"
            >
              <div
                className="w-full h-12 rounded-card mb-2 border border-black/10"
                style={{ backgroundColor: token.hex }}
              />
              <p className="font-heading text-xs font-semibold text-text-heading">
                {token.name}
              </p>
              <p className="text-xs font-mono text-text-muted">{token.hex}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
