import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  SectionLabel,
  CornerFrame,
  Card,
  Badge,
} from '@shared-ui';
import {
  Camera,
  Eye,
  Cpu,
  Map,
  Database,
  Zap,
  Code,
  Shield,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Landing Page — "/" route for the Civic-I citizen web app.
   Seven sections: Hero, Stats, Impact, How It Works,
   Open Tools, Privacy, and CTA.
   ───────────────────────────────────────────────────────────── */

/* ── Reusable container wrapper ──────────────────────────── */
const Container = ({ children, className = '' }) => (
  <div className={`max-w-6xl mx-auto px-4 ${className}`}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════
   SECTION 1 — HERO
   Two columns on desktop, stacked on mobile.
   Left: headline + CTA buttons. Right: decorative app window.
   ═══════════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left column ─────────────────────────────── */}
          <div className="space-y-6">
            {/* Tag */}
            <Badge color="navy">AI-ASSISTED · HUMAN-REVIEWED</Badge>

            {/* Headline */}
            <h1 className="font-heading text-4xl lg:text-5xl font-bold leading-tight">
              <span className="text-navy">Report City Issues.</span>
              <br />
              <span className="text-accent-orange">Reviewed. Mapped. Tracked.</span>
            </h1>

            {/* Body copy */}
            <p className="font-body text-navy/70 max-w-lg leading-relaxed">
              Palghar residents can photograph potholes and garbage dumps. A
              local AI suggests the issue type — then a human reviews it before
              the report is mapped and tracked.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Link to="/report">
                <Button variant="primary">Report an Issue</Button>
              </Link>
              <Link to="/track">
                <Button variant="outline" showArrow={false}>
                  Track a Report
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Right column — decorative app window ──── */}
          <div className="flex justify-center lg:justify-end">
            <CornerFrame color="orange" size={24} className="p-3">
              <div className="w-full max-w-sm border border-navy/15 rounded-card shadow-md overflow-hidden bg-white relative">
                {/* Mock browser header */}
                <div className="bg-navy px-4 py-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <span className="ml-3 label-xs text-white/60">
                    Civic-I Reporter
                  </span>
                </div>

                {/* Placeholder capture area */}
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-canvas">
                  <Camera className="w-10 h-10 text-navy/30 mb-3" />
                  <span className="text-sm text-navy/40 font-body text-center">
                    Upload or capture a photo
                  </span>
                </div>

                {/* Floating demo badge */}
                <div className="absolute bottom-3 right-3">
                  <Badge color="orange">AI SUGGESTION · DEMO</Badge>
                </div>
              </div>
            </CornerFrame>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 2 — STATS BAR
   Three compact labels separated by dividers.
   ═══════════════════════════════════════════════════════════ */
function StatsBar() {
  const stats = ['2 Issue Types', 'Human Reviewed', 'Free for Residents'];

  return (
    <section className="border-y border-navy/10 py-6">
      <Container>
        <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
          {stats.map((stat, i) => (
            <React.Fragment key={stat}>
              {i > 0 && (
                <span
                  className="hidden sm:block w-px h-5 bg-navy/15"
                  aria-hidden="true"
                />
              )}
              <span className="label-xs text-navy/60">{stat}</span>
            </React.Fragment>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 3 — PLATFORM IMPACT BAND (dark navy background)
   Counters all show 0 — labelled DEMO DATA per project rules.
   ═══════════════════════════════════════════════════════════ */
function PlatformImpact() {
  const counters = [
    { value: '0', label: 'Reports Filed' },
    { value: '0', label: 'Issues Resolved' },
    { value: '0', label: 'Active Reporters' },
    { value: '0%', label: 'Resolution Rate' },
  ];

  return (
    <section className="bg-navy py-16 lg:py-24">
      <Container>
        {/* Header row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          <SectionLabel>Platform Impact</SectionLabel>
          <Badge color="orange">DEMO DATA</Badge>
        </div>

        <p className="text-center text-white/60 font-body mb-12">
          Tracking civic issues across Palghar city
        </p>

        {/* Counter grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {counters.map((c) => (
            <div key={c.label}>
              <span className="block font-heading text-4xl lg:text-5xl font-bold text-accent-orange">
                {c.value}
              </span>
              <span className="block mt-2 label-xs text-white/70">
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 4 — HOW IT WORKS
   4 numbered step cards with connecting lines on desktop.
   ═══════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: 'Capture',
      desc: 'Photograph the civic issue — a pothole, garbage, or anything else.',
    },
    {
      num: 2,
      title: 'AI Analysis',
      desc: 'Local AI suggests the issue type. This is a suggestion — you review and confirm it.',
    },
    {
      num: 3,
      title: 'Locate',
      desc: 'Pin the location on the map or use GPS. Fully offline-capable.',
    },
    {
      num: 4,
      title: 'Track',
      desc: 'Follow the issue through review to resolution on the public map.',
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <SectionLabel className="justify-center mb-12">
          How It Works
        </SectionLabel>

        {/* Steps grid with connecting lines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
          {steps.map((step, i) => (
            <React.Fragment key={step.num}>
              {/* Connecting line (desktop only, between cards) */}
              {i > 0 && (
                <div className="hidden lg:flex items-center -mx-3">
                  <span className="w-full h-px bg-accent-orange" aria-hidden="true" />
                </div>
              )}

              <Card className="p-6">
                {/* Number circle */}
                <div className="w-10 h-10 rounded-full bg-accent-orange text-white flex items-center justify-center font-heading font-bold text-sm mb-4">
                  {step.num}
                </div>
                <h3 className="font-heading font-semibold text-navy text-lg mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-navy/70 leading-relaxed">
                  {step.desc}
                </p>
              </Card>
            </React.Fragment>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 5 — BUILT WITH OPEN TOOLS
   6-item grid showcasing the open-source stack.
   ═══════════════════════════════════════════════════════════ */
function OpenTools() {
  const tools = [
    { icon: Eye, name: 'YOLO', desc: 'Object detection for issue classification' },
    { icon: Cpu, name: 'Ollama', desc: 'Local LLM, no cloud, no data leaves your machine' },
    { icon: Map, name: 'OpenStreetMap', desc: 'Free and open map data with Leaflet' },
    { icon: Database, name: 'PostGIS', desc: 'Spatial queries for deduplication and routing' },
    { icon: Zap, name: 'FastAPI', desc: 'Python backend for the API layer' },
    { icon: Code, name: 'React', desc: 'Component-based citizen UI with Vite' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-canvas">
      <Container>
        <SectionLabel className="justify-center mb-12">
          Built With Open Tools
        </SectionLabel>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Card key={tool.name} className="p-4 flex flex-col items-start gap-3">
              <tool.icon className="w-6 h-6 text-accent-orange" />
              <h4 className="font-heading font-semibold text-navy text-sm">
                {tool.name}
              </h4>
              <p className="font-body text-xs text-navy/60 leading-relaxed">
                {tool.desc}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 6 — PRIVACY & HONESTY NOTE
   Bordered callout with Shield icon.
   ═══════════════════════════════════════════════════════════ */
function PrivacyNote() {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="border border-navy/10 rounded-card p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start">
          <Shield className="w-8 h-8 text-navy shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading font-semibold text-navy text-lg mb-2">
              Privacy &amp; Honesty
            </h3>
            <p className="font-body text-sm text-navy/70 leading-relaxed">
              Your photos are processed by a local AI model — they never leave
              your device. AI output is a suggestion; a human always reviews it.
              All demo and placeholder data is clearly labelled. This is a
              student project and is not affiliated with any municipal body.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 7 — CTA (Get Started)
   CornerFrame-wrapped call to action.
   ═══════════════════════════════════════════════════════════ */
function CtaSection() {
  return (
    <section className="py-16 lg:py-24 bg-canvas">
      <Container>
        <CornerFrame color="orange" size={24} className="p-8 sm:p-12">
          <div className="text-center space-y-5">
            <SectionLabel className="justify-center">
              Get Started
            </SectionLabel>

            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
              Ready to report a civic issue?
            </h2>

            <p className="font-body text-navy/60 max-w-md mx-auto">
              It takes under a minute. Capture, confirm, submit.
            </p>

            <Link to="/report">
              <Button variant="primary" className="mt-2">
                Start Reporting
              </Button>
            </Link>
          </div>
        </CornerFrame>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <StatsBar />
      <PlatformImpact />
      <HowItWorks />
      <OpenTools />
      <PrivacyNote />
      <CtaSection />
    </main>
  );
}
