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
  <section className="mb-12">
    <h2 className="font-heading text-2xl text-navy mb-4">{title}</h2>
    {children}
  </section>
);

/* ── Color swatch helper ──────────────────────────────────────────────── */
const COLOR_TOKENS = [
  { name: 'Canvas',       hex: '#F5F3EE' },
  { name: 'Navy',         hex: '#1B2536' },
  { name: 'Accent Orange', hex: '#E8501F' },
  { name: 'Accent Blue',  hex: '#3B7DD8' },
  { name: 'Accent Gold',  hex: '#D4960F' },
];

const STEPPER_STEPS = ['Capture', 'Analyze', 'Confirm', 'Submit'];

/* ── Page component ───────────────────────────────────────────────────── */
const DevComponentsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page title */}
      <h1 className="font-heading text-3xl md:text-4xl text-navy mb-2">
        Component Gallery
      </h1>
      <p className="font-body text-navy/60 mb-10">
        PLACEHOLDER — Every shared-ui component variant, in one place.
      </p>

      {/* ───────────────────────── 1. BUTTONS ──────────────────────────── */}
      <Section title="Buttons">
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary Action</Button>
          <Button variant="outline">Secondary Action</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="outline" showArrow={false}>No Arrow</Button>
        </div>
      </Section>

      {/* ───────────────────── 2. SECTION LABELS ───────────────────────── */}
      <Section title="Section Labels">
        <div className="space-y-6">
          <SectionLabel>Example Label</SectionLabel>
          <SectionLabel>How It Works</SectionLabel>
        </div>
      </Section>

      {/* ────────────────────────── 3. BADGES ──────────────────────────── */}
      <Section title="Badges">
        <div className="flex flex-wrap gap-3 items-center">
          <Badge color="gold">Gold Badge</Badge>
          <Badge color="orange">Orange</Badge>
          <Badge color="blue">Blue</Badge>
          <Badge color="navy">Navy</Badge>
        </div>
      </Section>

      {/* ──────────────────── 4. CORNER FRAMES ─────────────────────────── */}
      <Section title="Corner Frames">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Orange */}
          <CornerFrame color="orange" size={20}>
            <div className="p-8 text-center font-body text-navy">
              Orange frame
            </div>
          </CornerFrame>

          {/* Blue */}
          <CornerFrame color="blue" size={20}>
            <div className="p-8 text-center font-body text-navy">
              Blue frame
            </div>
          </CornerFrame>

          {/* Navy */}
          <CornerFrame color="navy" size={20}>
            <div className="p-8 text-center font-body text-navy">
              Navy frame
            </div>
          </CornerFrame>
        </div>
      </Section>

      {/* ─────────────────────────── 5. CARDS ──────────────────────────── */}
      <Section title="Cards">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card with heading + body */}
          <Card>
            <div className="p-6">
              <h3 className="font-heading text-lg text-navy mb-2">
                Card Heading
              </h3>
              <p className="font-body text-navy/70 text-sm leading-relaxed">
                DEMO — This is placeholder body text inside a Card component.
                Cards use 1 px borders and 2 px rounded corners per the design
                system.
              </p>
            </div>
          </Card>

          {/* Card with a Badge inside */}
          <Card>
            <div className="p-4 flex items-start gap-3">
              <Badge color="orange">Pothole</Badge>
              <p className="font-body text-navy/70 text-sm">
                DEMO — A card with a badge component nested inside.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* ──────────────────────── 6. STEPPER ───────────────────────────── */}
      <Section title="Stepper">
        <div className="space-y-8">
          {/* Step 0 — just started */}
          <div>
            <p className="label-xs mb-2 text-navy/50">STEP 1 OF 4</p>
            <Stepper current={0} steps={STEPPER_STEPS} />
          </div>

          {/* Step 2 — mid-way */}
          <div>
            <p className="label-xs mb-2 text-navy/50">STEP 3 OF 4</p>
            <Stepper current={2} steps={STEPPER_STEPS} />
          </div>

          {/* Step 3 — all done */}
          <div>
            <p className="label-xs mb-2 text-navy/50">ALL STEPS COMPLETE</p>
            <Stepper current={3} steps={STEPPER_STEPS} />
          </div>
        </div>
      </Section>

      {/* ──────────────────────── 7. TYPOGRAPHY ────────────────────────── */}
      <Section title="Typography">
        <div className="space-y-4">
          <h1 className="font-heading text-4xl text-navy">
            Heading 1 — Space Grotesk
          </h1>
          <h2 className="font-heading text-2xl text-navy">
            Heading 2
          </h2>
          <h3 className="font-heading text-xl text-navy">
            Heading 3
          </h3>
          <p className="font-body text-navy leading-relaxed">
            Body text in Source Serif 4. This is placeholder copy demonstrating
            the default body typeface used throughout the Civic-I citizen app.
            Legibility and readability are key for civic interfaces.
          </p>
          <span className="label-xs text-navy/60">SMALL LABEL TEXT</span>
        </div>
      </Section>

      {/* ──────────────────── 8. COLOR SWATCHES ────────────────────────── */}
      <Section title="Color Swatches">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {COLOR_TOKENS.map(({ name, hex }) => (
            <div key={hex} className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 border border-navy/20 shadow-sm"
                style={{ backgroundColor: hex, borderRadius: '2px' }}
                aria-label={`${name} color swatch`}
              />
              <span className="label-xs text-navy/70">{name}</span>
              <span className="font-mono text-xs text-navy/50">{hex}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Footer disclaimer ─────────────────────────────────────────── */}
      <p className="text-center font-body text-xs text-navy/40 mt-8 mb-4">
        PLACEHOLDER — Student project component gallery. Not affiliated with any
        municipal body.
      </p>
    </div>
  );
};

export default DevComponentsPage;
