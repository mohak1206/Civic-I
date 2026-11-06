import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '@shared-ui/Navbar';
import Footer from '@shared-ui/Footer';

const LandingPage = lazy(() => import('@citizen/pages/LandingPage'));
const ReportPage = lazy(() => import('@citizen/pages/ReportPage'));
const TrackPage = lazy(() => import('@citizen/pages/TrackPage'));
const TrackDetailPage = lazy(() => import('@citizen/pages/TrackDetailPage'));
const DevComponentsPage = lazy(() => import('@citizen/pages/DevComponentsPage'));

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-accent-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/track/:ref" element={<TrackDetailPage />} />
            <Route path="/dev/components" element={<DevComponentsPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

