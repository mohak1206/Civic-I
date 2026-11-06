import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Sparkles,
  MapPin,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { saveIssue, getIssues } from '../services/storage';
import { analyzeIssuePhoto } from '../services/ai';
import { calculateReportPoints, evaluateBadges } from '../services/gamification';
import { PALGHAR_DEFAULT_CENTER } from '../utils/constants';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PhotoCapture } from '../components/report/PhotoCapture';
import { AISuggestionBox } from '../components/report/AISuggestionBox';
import { LocationPickerMap } from '../components/map/LocationPickerMap';

const STEPS = [
  { id: 1, title: 'Photo', icon: Camera },
  { id: 2, title: 'Classification', icon: Sparkles },
  { id: 3, title: 'Location', icon: MapPin },
  { id: 4, title: 'Submit', icon: FileText },
];

export function Report() {
  const [currentStep, setCurrentStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [selectedType, setSelectedType] = useState('pothole');
  const [keptAIType, setKeptAIType] = useState(false);

  const [location, setLocation] = useState({
    lat: PALGHAR_DEFAULT_CENTER.lat,
    lng: PALGHAR_DEFAULT_CENTER.lng,
    address: 'Station Rd, Palghar, Maharashtra 401404',
    hasGPS: false,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { user, awardPoints, addBadges } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();

  // Run AI analysis whenever photo is chosen
  const handlePhotoSelect = async (compressedDataUrl) => {
    setPhoto(compressedDataUrl);
    if (!compressedDataUrl) {
      setAiSuggestion(null);
      setAiError(null);
      return;
    }

    setAnalyzingAI(true);
    setAiError(null);
    try {
      const result = await analyzeIssuePhoto(compressedDataUrl);
      if (result.success) {
        setAiSuggestion(result);
        setSelectedType(result.type);
        setKeptAIType(true);
        if (!title) {
          setTitle(`Reported ${result.type.replace(/_/g, ' ')} hazard`);
        }
      } else {
        setAiError(result.error);
        setAiSuggestion(null);
      }
    } catch (e) {
      setAiError('Unexpected failure during visual analysis.');
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleTypeSelect = (type, isAiMatch) => {
    setSelectedType(type);
    setKeptAIType(isAiMatch);
    if (!title || title.startsWith('Reported ')) {
      setTitle(`Reported ${type.replace(/_/g, ' ')} hazard`);
    }
  };

  const pointsCalc = calculateReportPoints({
    hasLocation: !!location?.address || !!location?.hasGPS,
    keptAIType,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!photo) {
      alert('Please provide a photo before submitting.');
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const finalTitle = title.trim() || `Reported ${selectedType.replace(/_/g, ' ')}`;
      const issuePayload = {
        title: finalTitle,
        description: description.trim(),
        type: selectedType,
        photo,
        location,
        aiSuggestion: aiSuggestion
          ? {
              ...aiSuggestion,
              confirmedByUser: keptAIType,
            }
          : null,
        reporterId: user?.id || 'usr_anonymous',
        reporterName: user?.name || 'Palghar Citizen',
        status: 'reported',
        pointsAwarded: pointsCalc.total,
      };

      const saved = saveIssue(issuePayload);
      const newPointsTotal = awardPoints(pointsCalc.total);

      // Trigger gamification badge evaluation
      const existingIssues = getIssues();
      const userIssues = existingIssues.filter((i) => i.reporterId === user?.id || i.id === saved.id);

      const newlyUnlockedBadges = evaluateBadges(
        {
          totalReports: userIssues.length,
          reportsWithLocation: userIssues.filter((i) => i.location?.lat && i.location?.lng).length,
          reportsWithAI: userIssues.filter((i) => i.aiSuggestion?.confirmedByUser).length,
          currentPoints: newPointsTotal || pointsCalc.total,
        },
        user?.badges || []
      );

      if (newlyUnlockedBadges.length > 0) {
        addBadges(newlyUnlockedBadges.map((b) => b.id));
        newlyUnlockedBadges.forEach((badge) => {
          notify({
            title: `Badge Unlocked: ${badge.title}!`,
            message: badge.description,
            type: 'badge',
          });
        });
      }

      notify({
        title: `Report Submitted (+${pointsCalc.total} XP)`,
        message: `Issue "${finalTitle}" successfully recorded. Municipal review queued.`,
        type: 'status',
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1800);
    } catch (err) {
      alert(err.message || 'Storage error. Please check storage limits.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer className="max-w-3xl">
      {/* Wizard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white tracking-tight">Report Civic Issue</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Capture hazards in Palghar City. Step through photo capture, AI inspection, and geotagging.
        </p>

        {/* Stepper Bar */}
        <div className="flex items-center justify-between mt-6 max-w-xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    // Only allow clicking steps if photo is uploaded
                    if (step.id === 1 || photo) setCurrentStep(step.id);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-zinc-950 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/30'
                      : isCompleted
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </button>
                <span
                  className={`text-[10px] font-medium mt-1.5 ${
                    isCurrent ? 'text-emerald-400 font-bold' : isCompleted ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Content Card */}
      <Card className="p-5 sm:p-7 relative overflow-hidden">
        {submitSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white">Report Logged Successfully!</h2>
            <p className="text-xs text-zinc-400">
              Awarded <strong className="text-emerald-400 font-mono">+{pointsCalc.total} XP</strong> to your profile. Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Step 1: Photo */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">Step 1: Capture or Upload Photo</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Provide a clear photo of the street problem.
                  </p>
                </div>

                <PhotoCapture
                  photo={photo}
                  onPhotoChange={handlePhotoSelect}
                />

                <div className="flex justify-end pt-3">
                  <Button
                    variant="primary"
                    disabled={!photo || analyzingAI}
                    onClick={() => setCurrentStep(2)}
                    icon={ArrowRight}
                  >
                    {analyzingAI ? 'AI Inspecting...' : 'Proceed to Classification'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: AI Inspection & Confirmation */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">Step 2: AI Review & Confirmation</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Our local Ollama vision model evaluated the image. Verify or modify the category.
                  </p>
                </div>

                <AISuggestionBox
                  analyzing={analyzingAI}
                  suggestion={aiSuggestion}
                  selectedType={selectedType}
                  onTypeSelect={handleTypeSelect}
                  aiError={aiError}
                  onReanalyze={() => handlePhotoSelect(photo)}
                />

                <div className="flex justify-between pt-3">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} icon={ArrowLeft}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={() => setCurrentStep(3)} icon={ArrowRight}>
                    Confirm & Pin Location
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Location Pinning */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">Step 3: Geotag Hazard Location</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Confirm coordinates on Google Maps via GPS button, address search, or draggable pin.
                  </p>
                </div>

                <LocationPickerMap
                  value={location}
                  onChange={(newLoc) => setLocation(newLoc)}
                />

                <div className="flex justify-between pt-3">
                  <Button variant="outline" onClick={() => setCurrentStep(2)} icon={ArrowLeft}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={() => setCurrentStep(4)} icon={ArrowRight}>
                    Proceed to Details
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Final Details & Submit */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">Step 4: Finalize & Send Report</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Add optional details to assist municipal field responders.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Issue Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Deep pothole right before railway crossing"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Additional Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Water logged, approximately 2 feet wide, causes bike skidding."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Points Breakdown Banner */}
                <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 border-b border-zinc-800 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Gamified Civic Points Earned
                    </span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">
                      +{pointsCalc.total} XP
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400 pt-1 text-center">
                    <div>
                      <span className="text-zinc-200 block font-bold">100 XP</span>
                      <span>Verified Report</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block font-bold">
                        {pointsCalc.breakdown.locationBonus > 0 ? '+25 XP' : '0 XP'}
                      </span>
                      <span>Location Pin</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block font-bold">
                        {pointsCalc.breakdown.aiBonus > 0 ? '+15 XP' : '0 XP'}
                      </span>
                      <span>AI Confirmed</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-3">
                  <Button variant="outline" onClick={() => setCurrentStep(3)} icon={ArrowLeft}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    disabled={submitting || !title.trim()}
                    onClick={handleSubmit}
                    icon={CheckCircle2}
                  >
                    {submitting ? 'Submitting Report...' : 'Transmit Report to Ledger'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Card>
    </PageContainer>
  );
}

