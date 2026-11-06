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
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Landing Page — "/" route for Civic-I Palghar Citizen App.
   Follows PROJECT_RULES.md:
   - Two categories only: pothole, garbage
   - AI output is a suggestion; a human reviews it
   - DEMO data clearly labelled everywhere
   - Zero paid SDKs (OpenStreetMap + Leaflet)
   ───────────────────────────────────────────────────────────── */

const Container = ({ children, className = '' }) => (
  <div className={`max-w-6xl mx-auto px-4 ${className}`}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════
   SECTION 1 — HERO
   ═══════════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-page">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge color="navy">AI-ASSISTED · HUMAN-REVIEWED</Badge>
              <Badge color="orange">PALGHAR CITY</Badge>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              <span className="text-text-heading">Report City Issues.</span>
              <br />
              <span className="text-accent-orange">Reviewed. Mapped. Tracked.</span>
            </h1>

            <p className="font-body text-text-body text-base sm:text-lg max-w-xl leading-relaxed">
              Palghar residents can photograph potholes and garbage dumps.
              A local AI model suggests the issue type — then a human verifies
              it before the report is mapped and tracked to resolution.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/report">
                <Button variant="primary">
                  Report an Issue
                </Button>
              </Link>
              <Link to="/track">
                <Button variant="outline" showArrow={false}>
                  Track a Report
                </Button>
              </Link>
            </div>

            <p className="text-xs text-text-muted font-body">
              Free for all residents · No mobile app install required · Local privacy
            </p>
          </div>

          {/* Right Column — Realistic App Window with AI Detection Preview */}
          <div className="flex justify-center lg:justify-end">
            <CornerFrame color="orange" size={26} className="w-full max-w-md">
              <div className="border border-card-border rounded-card shadow-md overflow-hidden bg-white">
                {/* Mock Window Top Bar */}
                <div className="bg-panel px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <span className="ml-3 label-xs text-white/70">
                      Civic-I AI Vision Triage
                    </span>
                  </div>
                  <Badge color="orange">DEMO</Badge>
                </div>

                {/* Simulated Street / Road Scene */}
                <div className="relative bg-slate-100 p-6 flex flex-col items-center justify-center min-h-[260px] overflow-hidden border-b border-card-border">
                  {/* Decorative road illustration background */}
                  <div className="w-full h-36 bg-slate-300 rounded-card relative overflow-hidden flex items-center justify-center border border-slate-400/30">
                    <div className="absolute inset-x-0 h-1 border-t-2 border-dashed border-yellow-300/80 top-1/2 -translate-y-1/2"></div>
                    
                    {/* Simulated pothole spot */}
                    <div className="w-20 h-12 bg-slate-700/60 rounded-full blur-[1px] transform rotate-12 relative flex items-center justify-center">
                      <div className="w-14 h-8 bg-slate-900/80 rounded-full"></div>
                    </div>

                    {/* Detected bounding box overlay */}
                    <div className="absolute inset-y-4 inset-x-12 border-2 border-dashed border-accent-orange bg-accent-orange/10 rounded-card flex flex-col justify-between p-1.5">
                      <div className="flex items-center justify-between">
                        <span className="label-xs bg-accent-orange text-white px-1.5 py-0.5 rounded-card">
                          POTHOLE · 82%
                        </span>
                        <span className="label-xs text-accent-orange font-bold font-mono">
                          [#road_defect]
                        </span>
                      </div>
                      <span className="label-xs text-navy/70 text-right">
                        LOC: Palghar Station Rd
                      </span>
                    </div>
                  </div>

                  {/* Summary callout under image */}
                  <div className="mt-4 w-full bg-white p-3 rounded-card border border-card-border flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-heading font-semibold text-text-heading">
                        AI Suggestion: Road Pothole (Confidence 82%)
                      </p>
                      <p className="font-body text-text-muted mt-0.5">
                        Human review required before municipal routing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action footer */}
                <div className="p-3 bg-page flex items-center justify-between">
                  <span className="label-xs text-text-muted">
                    MODEL: YOLO / LOCAL VISION
                  </span>
                  <Link
                    to="/report"
                    className="label-xs text-accent-orange font-bold hover:underline flex items-center gap-1"
                  >
                    Test Flow &rarr;
                  </Link>
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
   ═══════════════════════════════════════════════════════════ */
function StatsBar() {
  const stats = [
    { label: '2 Supported Categories', desc: 'Pothole & Garbage Dump' },
    { label: 'Human-in-the-Loop', desc: 'Every AI suggestion reviewed' },
    { label: 'Zero Cost for Citizens', desc: 'OpenStreetMap · No paywalls' },
  ];

  return (
    <section className="border-y border-card-border bg-white py-6">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-card-border text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="pt-3 sm:pt-0 sm:px-4">
              <span className="label-xs text-accent-orange block font-bold">
                {stat.label}
              </span>
              <span className="font-body text-xs text-text-body mt-0.5 block">
                {stat.desc}
              </span>
            </div>
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
    <section className="bg-panel py-16 lg:py-20 text-white">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
          <SectionLabel className="justify-center">Platform Impact</SectionLabel>
          <Badge color="orange">DEMO DATA</Badge>
        </div>

        <p className="text-center text-white/60 font-body text-sm mb-12 max-w-md mx-auto">
          Tracking civic issues across Palghar city. Real metrics will display
          after municipal deployment.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {counters.map((c) => (
            <div key={c.label} className="space-y-1">
              <span className="block font-heading text-4xl lg:text-5xl font-bold text-accent-orange">
                {c.value}
              </span>
              <span className="block label-xs text-white/70">
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
   ═══════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: 'Capture',
      desc: 'Snap a clear photo of the civic problem — a pothole on the asphalt or overflowing garbage.',
    },
    {
      num: 2,
      title: 'AI Suggestion',
      desc: 'Local vision model highlights the issue with a bounding box and suggests the classification.',
    },
    {
      num: 3,
      title: 'Confirm & Locate',
      desc: 'Confirm the category, drag the pin on OpenStreetMap or tap GPS to capture the exact coordinates.',
    },
    {
      num: 4,
      title: 'Track to Resolution',
      desc: 'Receive a reference code to monitor the 13-stage lifecycle from human review to closure.',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-page">
      <Container>
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <SectionLabel className="justify-center">How It Works</SectionLabel>
          <h2 className="font-heading text-3xl font-bold text-text-heading">
            Four Steps from Street to Solved
          </h2>
          <p className="font-body text-sm text-text-body">
            Designed for quick reporting on mobile browsers with zero clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <CornerFrame key={step.num} color="orange" size={18}>
              <Card className="p-6 h-full flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-9 h-9 rounded-card bg-accent-orange text-white flex items-center justify-center font-heading font-bold text-sm mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-heading font-semibold text-text-heading text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm text-text-body leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-card-border">
                  <span className="label-xs text-text-muted">STEP 0{step.num}</span>
                </div>
              </Card>
            </CornerFrame>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 5 — SAMPLE ISSUES IN PALGHAR (Demonstration Strip)
   ═══════════════════════════════════════════════════════════ */
function SampleIssues() {
  const samples = [
    {
      ref: 'CIV-841920',
      category: 'pothole',
      title: 'Deep crater depression on Station Road',
      location: 'Near Palghar Railway Station West',
      status: 'NEEDS_VERIFICATION',
      confidence: '84%',
    },
    {
      ref: 'CIV-390114',
      category: 'garbage',
      title: 'Overflowing roadside collection dumpster',
      location: 'Old Market Area, Mahim Road',
      status: 'INSPECTION_SCHEDULED',
      confidence: '91%',
    },
    {
      ref: 'CIV-551029',
      category: 'pothole',
      title: 'Asphalt crumbling near bus depot exit',
      location: 'MSRTC Palghar Central Depot',
      status: 'IN_PROGRESS',
      confidence: '78%',
    },
  ];

  return (
    <section className="py-16 bg-white border-y border-card-border">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <SectionLabel>Issue Catalog</SectionLabel>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-heading mt-2">
              Recently Reported in Palghar
            </h2>
            <p className="font-body text-sm text-text-body mt-1">
              Sample issues illustrating the public tracking workflow.
            </p>
          </div>
          <Badge color="navy">DEMO DATA</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {samples.map((item) => (
            <Card key={item.ref} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge color={item.category === 'pothole' ? 'orange' : 'blue'}>
                    {item.category.toUpperCase()}
                  </Badge>
                  <span className="label-xs text-text-muted font-mono">{item.ref}</span>
                </div>

                <h4 className="font-heading font-semibold text-text-heading text-base leading-snug">
                  {item.title}
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-text-muted font-body">
                  <MapPin className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-card-border flex items-center justify-between">
                <span className="label-xs text-accent-orange font-semibold">
                  STATUS: {item.status}
                </span>
                <Link
                  to={`/track/${item.ref}`}
                  className="label-xs text-navy hover:text-accent-orange font-bold transition-colors"
                >
                  Track &rarr;
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 6 — BUILT WITH OPEN TOOLS
   ═══════════════════════════════════════════════════════════ */
function OpenTools() {
  const tools = [
    { icon: Eye, name: 'YOLO Vision', desc: 'Object detection for two civic classes: pothole & garbage.' },
    { icon: Cpu, name: 'Local Ollama', desc: 'On-device LLM inference; photos and personal data never leave local nodes.' },
    { icon: Map, name: 'OpenStreetMap', desc: 'Free, community-driven geospatial mapping via Leaflet.js with zero API keys.' },
    { icon: Database, name: 'PostGIS', desc: 'Geospatial spatial queries for incident clustering and duplicate prevention.' },
    { icon: Zap, name: 'FastAPI', desc: 'Lightweight, asynchronous Python API backend engine.' },
    { icon: Code, name: 'React + Vite', desc: 'Fast, responsive citizen interface with Tailwind CSS design tokens.' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-page">
      <Container>
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <SectionLabel className="justify-center">Technology Stack</SectionLabel>
          <h2 className="font-heading text-3xl font-bold text-text-heading">
            Built with Open Tools
          </h2>
          <p className="font-body text-sm text-text-body">
            100% open-source software stack with no proprietary cloud vendor lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <Card key={tool.name} className="p-5 flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-card bg-navy/5 flex items-center justify-center text-accent-orange">
                <tool.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-text-heading text-base">
                  {tool.name}
                </h4>
                <p className="font-body text-xs text-text-body leading-relaxed mt-1">
                  {tool.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 7 — PRIVACY & HONESTY NOTE
   ═══════════════════════════════════════════════════════════ */
function PrivacyNote() {
  return (
    <section className="py-12 bg-white border-y border-card-border">
      <Container>
        <div className="border border-card-border rounded-card p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start bg-page">
          <div className="w-12 h-12 rounded-card bg-panel text-white flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-text-heading text-lg">
              Privacy &amp; Engineering Ethics Statement
            </h3>
            <p className="font-body text-sm text-text-body leading-relaxed">
              Civic-I is an academic student project for Palghar, Maharashtra.
              Images are analyzed locally — personal details, faces, and vehicle
              number plates are never published or sent to third-party cloud LLMs.
              All displayed metrics and municipal workflows represent simulated
              demonstration data. No work orders have been dispatched.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 8 — CALL TO ACTION (CTA)
   ═══════════════════════════════════════════════════════════ */
function CtaSection() {
  return (
    <section className="py-16 lg:py-24 bg-page">
      <Container>
        <CornerFrame color="orange" size={26}>
          <div className="border border-card-border bg-white rounded-card shadow-sm p-8 sm:p-14 text-center space-y-6">
            <SectionLabel className="justify-center">Get Started</SectionLabel>

            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-heading max-w-xl mx-auto">
              Ready to report a civic issue in Palghar?
            </h2>

            <p className="font-body text-text-body text-base max-w-md mx-auto">
              Take a photo, verify the AI suggestion, and pin the location.
              The entire process takes under one minute.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/report">
                <Button variant="primary">
                  Start Reporting
                </Button>
              </Link>
              <Link to="/track">
                <Button variant="outline" showArrow={false}>
                  Track an Existing Report
                </Button>
              </Link>
            </div>
          </div>
        </CornerFrame>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <StatsBar />
      <PlatformImpact />
      <HowItWorks />
      <SampleIssues />
      <OpenTools />
      <PrivacyNote />
      <CtaSection />
    </div>
  );
}
