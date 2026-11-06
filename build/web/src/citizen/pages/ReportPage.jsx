import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  AlertTriangle,
  Info,
  MapPin,
  CheckCircle,
  Clipboard,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { Stepper, Card, Button, Badge, CornerFrame } from '@shared-ui';
import LocationPicker from '@map/LocationPicker';
import { saveReportLocally } from '../api/reports';

/* ─── ENV flag: when true, use mock data instead of a real AI backend ──── */
const useMock = import.meta.env.VITE_USE_MOCK === 'true';

/* ─── Constants ────────────────────────────────────────────────────────── */
const WIZARD_STEPS = ['Capture', 'Analyze', 'Confirm', 'Submit'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const CATEGORIES = ['pothole', 'garbage']; // Only two classes per project rules
const MOCK_ANALYSIS = {
  category: 'pothole',
  confidence: 0.82,
  summary: 'Possible pothole detected on road surface',
  boundingBox: { x: 20, y: 15, w: 60, h: 55 },
};

/**
 * ReportPage — 4-step wizard for citizens to report civic issues.
 * Route: /report
 */
export default function ReportPage() {
  const navigate = useNavigate();

  /* ── Wizard state ────────────────────────────────────────────────────── */
  const [step, setStep] = useState(0);

  /* Step 0 – Capture */
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  /* Step 1 – Analyze */
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  /* Step 2 – Confirm & Locate */
  const [userCategory, setUserCategory] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' });
  const [description, setDescription] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  /* Step 3 – Review & Submit */
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [copied, setCopied] = useState(false);

  /* ── Handlers ────────────────────────────────────────────────────────── */

  /** Validate & set the selected image file */
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type check
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Only JPG and PNG images are accepted.');
      return;
    }
    // Size check
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Image must be 5 MB or smaller.');
      return;
    }

    setFileError('');
    setImageFile(file);

    // Generate data-URL preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  /** Reset file selection so user can re-take */
  const handleRetake = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setAnalysis(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  /** Run AI analysis (mock or real) when entering Step 1 */
  useEffect(() => {
    if (step !== 1 || analysis || analyzing) return;

    setAnalyzing(true);

    if (useMock) {
      // Simulate a 2-second analysis delay
      const timer = setTimeout(() => {
        setAnalysis(MOCK_ANALYSIS);
        setUserCategory(MOCK_ANALYSIS.category);
        setAnalyzing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Non-mock: for now fall back to mock behaviour
    const timer = setTimeout(() => {
      setAnalysis(MOCK_ANALYSIS);
      setUserCategory(MOCK_ANALYSIS.category);
      setAnalyzing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [step, analysis, analyzing]);

  /** Request GPS position */
  const handleUseGPS = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({
          lat: latitude,
          lng: longitude,
          address: `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        });
        setGpsLoading(false);
      },
      () => {
        alert('Unable to retrieve location. Please enter your address manually.');
        setGpsLoading(false);
      },
    );
  }, []);

  /** Submit the report (mock) */
  const handleSubmit = useCallback(() => {
    setSubmitting(true);

    // Mock submission — generate reference number after 1.5 s
    const timer = setTimeout(() => {
      const ref = 'CIV-' + String(Math.floor(100000 + Math.random() * 900000));
      setRefNumber(ref);
      saveReportLocally({
        ref,
        category: userCategory || 'pothole',
        currentStatus: 'ANALYZED',
        address: location.address || 'Palghar, Maharashtra',
        lat: location.lat || 19.6967,
        lng: location.lng || 72.7651,
        description,
        createdAt: new Date().toISOString(),
        confidence: analysis?.confidence || 0.82,
        demo: true,
      });
      setSubmitted(true);
      setSubmitting(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [userCategory, location, description, analysis]);

  /** Copy ref number to clipboard */
  const handleCopyRef = useCallback(() => {
    navigator.clipboard.writeText(refNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [refNumber]);

  /** Reset the entire wizard to report another issue */
  const handleReportAnother = useCallback(() => {
    setStep(0);
    setImageFile(null);
    setImagePreview(null);
    setFileError('');
    setAnalysis(null);
    setAnalyzing(false);
    setUserCategory('');
    setLocation({ lat: null, lng: null, address: '' });
    setDescription('');
    setSubmitting(false);
    setSubmitted(false);
    setRefNumber('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  /* ── Step validators (for "Next" button) ─────────────────────────────── */
  const canAdvanceStep0 = !!imageFile;
  const canAdvanceStep1 = !!analysis;
  const canAdvanceStep2 =
    !!userCategory && (!!location.address || (location.lat !== null && location.lng !== null));

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      {/* ── Stepper ─────────────────────────────────────────────────── */}
      <Stepper current={step} steps={WIZARD_STEPS} />

      <div className="mt-8">
        {/* ────────────────────────────────────────────────────────────
            STEP 0 — CAPTURE
        ──────────────────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-navy">
              Capture the Issue
            </h2>

            {/* Upload zone */}
            {!imagePreview ? (
              <Card
                className="border-dashed border-2 border-navy/25 bg-canvas cursor-pointer hover:border-accent-orange/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <Camera className="w-10 h-10 text-navy/30 mb-3" />
                  <p className="font-heading text-sm sm:text-base font-medium text-navy/70">
                    Upload or capture a photo of the issue
                  </p>
                  <p className="text-xs text-navy/40 mt-1">JPG or PNG, max 5 MB</p>
                </div>
              </Card>
            ) : (
              /* Image preview */
              <CornerFrame color="orange" size={24} className="p-1">
                <img
                  src={imagePreview}
                  alt="Captured issue"
                  className="w-full object-cover rounded-card"
                />
              </CornerFrame>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* File error */}
            {fileError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Re-take button */}
            {imagePreview && (
              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 text-sm text-navy/60 hover:text-accent-orange transition-colors font-heading"
              >
                <RotateCcw className="w-4 h-4" />
                Re-take photo
              </button>
            )}

            {/* Next */}
            <div className="flex justify-end pt-2">
              <Button disabled={!canAdvanceStep0} onClick={() => setStep(1)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────
            STEP 1 — ANALYZE
        ──────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-navy">
              AI Analysis
            </h2>

            {/* Image with optional bounding box overlay */}
            <div className="relative">
              <CornerFrame color="blue" size={24} className="p-1">
                <img
                  src={imagePreview}
                  alt="Issue under analysis"
                  className="w-full object-cover rounded-card"
                />

                {/* Bounding-box overlay (shown after analysis completes) */}
                {analysis?.boundingBox && (
                  <div
                    className="absolute border-2 border-dashed border-accent-orange pointer-events-none"
                    style={{
                      left: `${analysis.boundingBox.x}%`,
                      top: `${analysis.boundingBox.y}%`,
                      width: `${analysis.boundingBox.w}%`,
                      height: `${analysis.boundingBox.h}%`,
                    }}
                    aria-label="Detected region"
                  />
                )}
              </CornerFrame>
            </div>

            {/* Loading spinner */}
            {analyzing && (
              <div className="flex items-center gap-3 justify-center py-6">
                <Loader2 className="w-6 h-6 text-accent-orange animate-spin" />
                <span className="font-heading text-sm text-navy/70">Analyzing image…</span>
              </div>
            )}

            {/* Non-mock info (currently still mocked) */}
            {!useMock && !analysis && !analyzing && (
              <Card className="p-4">
                <p className="text-sm text-navy/70">
                  Connect to local{' '}
                  <a
                    href="https://ollama.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-accent-blue"
                  >
                    Ollama
                  </a>{' '}
                  for AI analysis. See docs for setup instructions.
                </p>
              </Card>
            )}

            {/* Analysis results */}
            {analysis && (
              <>
                <Card className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge color="orange">{analysis.category.toUpperCase()}</Badge>
                    <span className="font-heading text-sm text-navy/70">
                      Confidence:{' '}
                      <span className="font-semibold text-navy">
                        {Math.round(analysis.confidence * 100)}%
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-navy/80 font-body leading-relaxed">
                    {analysis.summary}
                  </p>
                </Card>

                {/* Advisory notice — AI output is a suggestion */}
                <div className="flex items-start gap-2.5 bg-accent-blue/10 border border-accent-blue/20 rounded-card p-4">
                  <Info className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-navy/80 leading-snug">
                    AI output is a suggestion. You will review and confirm it in the next step.
                  </p>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <Button variant="outline" showArrow={false} onClick={() => setStep(0)}>
                Back
              </Button>
              <Button disabled={!canAdvanceStep1} onClick={() => setStep(2)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────
            STEP 2 — CONFIRM & LOCATE
        ──────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-8">
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-navy">
              Confirm &amp; Locate
            </h2>

            {/* A) Confirm Category */}
            <div className="space-y-3">
              <label className="label-xs text-navy/60">Category</label>
              <div className="flex items-center gap-4">
                <select
                  value={userCategory}
                  onChange={(e) => setUserCategory(e.target.value)}
                  className="w-full sm:w-auto border border-navy/20 rounded-card px-3 py-2 text-sm font-heading text-navy bg-white focus:outline-none focus:ring-2 focus:ring-accent-orange"
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                {userCategory && (
                  <Badge color="orange">{userCategory.toUpperCase()}</Badge>
                )}
              </div>
            </div>

            {/* B) Location */}
            <div className="space-y-3">
              <label className="label-xs text-navy/60">Location</label>

              {/* Address input */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter address"
                  value={location.address}
                  onChange={(e) =>
                    setLocation((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="flex-1 border border-navy/20 rounded-card px-3 py-2 text-sm font-body text-navy bg-white focus:outline-none focus:ring-2 focus:ring-accent-orange"
                />
                <Button
                  variant="outline"
                  showArrow={false}
                  onClick={handleUseGPS}
                  disabled={gpsLoading}
                  className="flex-shrink-0"
                >
                  {gpsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  Use GPS
                </Button>
              </div>

              <p className="text-xs text-navy/40">Palghar, Maharashtra</p>

              {/* GPS coordinates */}
              {location.lat !== null && location.lng !== null && (
                <p className="text-xs text-navy/50 font-mono">
                  Lat: {location.lat.toFixed(5)} &nbsp;|&nbsp; Lng: {location.lng.toFixed(5)}
                </p>
              )}

              {/* Interactive Leaflet Map Picker */}
              <LocationPicker value={location} onChange={setLocation} />
            </div>

            {/* C) Details */}
            <div className="space-y-3">
              <label className="label-xs text-navy/60">Additional Details</label>
              <textarea
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setDescription(e.target.value);
                }}
                placeholder="Describe the issue (optional)"
                rows={4}
                className="w-full border border-navy/20 rounded-card px-3 py-2 text-sm font-body text-navy bg-white resize-none focus:outline-none focus:ring-2 focus:ring-accent-orange"
              />
              <p className="text-xs text-navy/40 text-right">
                {description.length}/500
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <Button variant="outline" showArrow={false} onClick={() => setStep(1)}>
                Back
              </Button>
              <Button disabled={!canAdvanceStep2} onClick={() => setStep(3)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────
            STEP 3 — REVIEW & SUBMIT
        ──────────────────────────────────────────────────────────── */}
        {step === 3 && !submitted && (
          <div className="space-y-6">
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-navy">
              Review &amp; Submit
            </h2>

            {/* Summary card */}
            <Card className="p-5 space-y-5">
              {/* Image thumbnail + category */}
              <div className="flex gap-4">
                <CornerFrame color="orange" size={14} className="w-24 h-24 flex-shrink-0">
                  <img
                    src={imagePreview}
                    alt="Issue preview"
                    className="w-full h-full object-cover rounded-card"
                  />
                </CornerFrame>

                <div className="space-y-2 min-w-0">
                  <Badge color="orange">{userCategory.toUpperCase()}</Badge>
                  <p className="text-sm text-navy/80 font-body truncate">
                    {location.address || 'No address provided'}
                  </p>
                </div>
              </div>

              {/* Description preview */}
              {description && (
                <p className="text-sm text-navy/70 font-body leading-relaxed border-t border-navy/10 pt-3">
                  {description}
                </p>
              )}

              {/* AI confidence & human-reviewed note */}
              <div className="flex flex-wrap items-center gap-3 border-t border-navy/10 pt-3">
                <span className="text-xs text-navy/50 font-heading">
                  AI Confidence:{' '}
                  <span className="font-semibold text-navy">
                    {analysis ? Math.round(analysis.confidence * 100) + '%' : '—'}
                  </span>
                </span>
                <span className="text-xs text-navy/40">•</span>
                <span className="text-xs text-accent-blue font-heading">
                  Human-reviewed
                </span>
              </div>
            </Card>

            {/* Submit */}
            <div className="flex justify-between pt-2">
              <Button variant="outline" showArrow={false} onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── Success screen (after submission) ────────────────────── */}
        {step === 3 && submitted && (
          <div className="flex flex-col items-center text-center space-y-6 py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-navy">
              Your report has been submitted
            </h2>

            {/* Reference number */}
            <Card className="inline-flex items-center gap-3 px-5 py-3">
              <span className="font-heading text-lg font-bold text-navy tracking-wide">
                {refNumber}
              </span>
              <button
                onClick={handleCopyRef}
                className="text-navy/40 hover:text-accent-orange transition-colors"
                title="Copy reference number"
              >
                <Clipboard className="w-5 h-5" />
              </button>
              {copied && (
                <span className="text-xs text-green-600 font-heading">Copied!</span>
              )}
            </Card>

            {/* Demo disclaimer */}
            <Badge color="navy">DEMO — no actual report was filed</Badge>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => navigate(`/track/${refNumber}`)}>
                Track This Report
              </Button>
              <Button variant="outline" showArrow={false} onClick={handleReportAnother}>
                Report Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
