import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getIssues, updateIssue } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { evaluateBadges } from '../services/gamification';
import { normalizePriority, normalizeIssueType } from '../utils/constants';
import { PageContainer } from '../components/layout/PageContainer';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { IssueFilters } from '../components/dashboard/IssueFilters';
import { IssueCard } from '../components/dashboard/IssueCard';
import { IssueDetailModal } from '../components/dashboard/IssueDetailModal';
import { Button } from '../components/ui/Button';

// Lazy-load Leaflet map component to keep initial bundle light
const IssuesDashboardMap = lazy(() =>
  import('../components/map/IssuesDashboardMap').then((m) => ({ default: m.IssuesDashboardMap }))
);

export function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [activePriority, setActivePriority] = useState('all');
  const [myReportsOnly, setMyReportsOnly] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const { user, awardPoints, addBadges } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();

  const loadIssues = () => {
    setIssues(getIssues());
  };

  useEffect(() => {
    loadIssues();
    const handleUpdate = () => loadIssues();
    window.addEventListener('civic-issues-updated', handleUpdate);
    return () => window.removeEventListener('civic-issues-updated', handleUpdate);
  }, []);

  const handleAdvanceStatus = (issueId, newStatus) => {
    try {
      const updated = updateIssue(issueId, { status: newStatus });
      loadIssues();

      // Check if current user is the reporter and status reached resolved
      if (newStatus === 'resolved') {
        const bonusPoints = 50;
        awardPoints(bonusPoints);
        notify({
          title: 'Issue Resolved! (+50 XP)',
          message: `Issue "${updated.title}" was marked as resolved. You received 50 bonus points!`,
          type: 'status',
        });

        // Evaluate problem_solver badge
        const allUserIssues = issues.filter((i) => i.reporterId === user?.id || updated.reporterId === user?.id);
        const resolvedCount = allUserIssues.filter((i) => i.status === 'resolved' || i.id === issueId).length;
        const newBadges = evaluateBadges(
          {
            totalReports: allUserIssues.length,
            resolvedReports: resolvedCount,
            currentPoints: (user?.points || 0) + bonusPoints,
          },
          user?.badges || []
        );

        if (newBadges.length > 0) {
          addBadges(newBadges.map((b) => b.id));
          newBadges.forEach((b) => {
            notify({
              title: `Badge Unlocked: ${b.title}!`,
              message: b.description,
              type: 'badge',
            });
          });
        }
      } else {
        notify({
          title: `Status Advanced: ${newStatus.replace(/_/g, ' ')}`,
          message: `Issue "${updated.title}" progressed to ${newStatus.replace(/_/g, ' ')}.`,
          type: 'info',
        });
      }

      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(updated);
      }
    } catch (err) {
      alert(`Could not update issue: ${err.message}`);
    }
  };

  // Filter issues across status, category, and priority
  const filteredIssues = issues.filter((iss) => {
    if (activeStatus !== 'all' && iss.status !== activeStatus) return false;
    if (activeType !== 'all' && normalizeIssueType(iss.type) !== activeType) return false;
    if (activePriority !== 'all' && normalizePriority(iss.priority) !== activePriority) return false;
    if (myReportsOnly && iss.reporterId !== user?.id) return false;
    return true;
  });

  return (
    <PageContainer className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Civic Issue Ledger</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time urban hazard tracking, dual Ollama triage, and OpenStreetMap dispatch across Palghar City.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/report')}
          icon={PlusCircle}
          className="self-start sm:self-auto"
        >
          Report New Issue
        </Button>
      </div>

      {/* Stats Counters */}
      <StatsGrid issues={issues} />

      {/* Filters & View Switcher */}
      <IssueFilters
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        activeType={activeType}
        onTypeChange={setActiveType}
        activePriority={activePriority}
        onPriorityChange={setActivePriority}
        myReportsOnly={myReportsOnly}
        onMyReportsChange={setMyReportsOnly}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={issues.length}
      />

      {/* Content View: Map vs List */}
      {viewMode === 'map' ? (
        <Suspense
          fallback={
            <div className="h-[400px] rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-zinc-500">
              Loading OpenStreetMap...
            </div>
          }
        >
          <IssuesDashboardMap issues={filteredIssues} />
        </Suspense>
      ) : filteredIssues.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-500 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">No issues found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {issues.length === 0
              ? 'No civic issues have been reported in this browser session yet. Be the first to report one!'
              : 'No issues match the active filter criteria. Try adjusting your status, type, or priority filters.'}
          </p>
          {issues.length === 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/report')}
              icon={PlusCircle}
              className="mt-2"
            >
              Report Issue Now
            </Button>
          )}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredIssues.map((issue) => (
              <motion.div
                key={issue.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <IssueCard
                  issue={issue}
                  onSelect={() => setSelectedIssue(issue)}
                  onAdvanceStatus={handleAdvanceStatus}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onAdvanceStatus={handleAdvanceStatus}
      />
    </PageContainer>
  );
}
