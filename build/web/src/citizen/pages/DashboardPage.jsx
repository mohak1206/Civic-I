import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { SectionLabel, Card, Button, Badge } from '@shared-ui';
import { useAuth } from '../context/AuthContext';
import { getStoredReports } from '../api/reports';

export default function DashboardPage() {
  const { user } = useAuth();
  const reports = getStoredReports();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy/10 pb-6">
        <div>
          <SectionLabel>Citizen Dashboard</SectionLabel>
          <h1 className="font-heading text-3xl font-bold text-text-heading mt-2">
            Welcome back, {user?.username || 'Citizen'}
          </h1>
          <p className="font-body text-text-body text-sm">
            View your reported issues and monitor resolution progress in Palghar.
          </p>
        </div>

        <Link to="/report">
          <Button variant="primary">
            <PlusCircle className="w-4 h-4 mr-1" />
            Report Issue
          </Button>
        </Link>
      </div>

      {/* Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-text-heading">
            Your Reports ({reports.length})
          </h2>
          <Badge color="navy">DEMO DATA</Badge>
        </div>

        {reports.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Clock className="w-8 h-8 text-text-muted mx-auto" />
            <h3 className="font-heading text-base font-semibold text-text-heading">
              No reports filed yet
            </h3>
            <p className="font-body text-text-body text-sm max-w-sm mx-auto">
              Spot a pothole or garbage pile in Palghar? Take a photo and report it to get started.
            </p>
            <Link to="/report" className="inline-block pt-2">
              <Button variant="outline" showArrow={false}>
                File Your First Report
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.ref} className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-text-heading">
                      {report.ref}
                    </span>
                    <Badge color={report.category === 'pothole' ? 'orange' : 'blue'}>
                      {report.category?.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-text-body font-body line-clamp-2">
                    {report.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{report.location?.address || 'Palghar, MH'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-card-border flex items-center justify-between">
                  <span className="label-xs text-text-muted">
                    {report.status || 'SUBMITTED'}
                  </span>
                  <Link
                    to={`/track/${report.ref}`}
                    className="label-xs text-accent-orange font-bold hover:underline"
                  >
                    View Status &rarr;
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

