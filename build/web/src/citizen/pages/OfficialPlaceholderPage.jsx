import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { SectionLabel, Card, Badge, CornerFrame, Button } from '@shared-ui';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function OfficialPlaceholderPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <SectionLabel>Official Portal</SectionLabel>

      <CornerFrame color="navy" size={24}>
        <div className="border border-card-border bg-card rounded-card shadow-sm p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-card bg-navy flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-text-heading">
                Municipal Official Portal
              </h1>
              <span className="label-xs text-text-muted">
                Signed in as: {user?.username}
              </span>
            </div>
            <Badge color="navy" className="ml-auto">OFFICIAL ROLE</Badge>
          </div>

          <p className="font-body text-text-body leading-relaxed pt-2">
            This official workspace is designated for Team Member <strong>A6 (Official Dashboard)</strong>.
            Authorized personnel will triage citizen reports, review AI confidence classifications,
            and manage issue lifecycle transitions here.
          </p>

          <div className="pt-4 border-t border-card-border flex items-center justify-between">
            <span className="label-xs text-text-muted">ROUTE: /official (A6 OWNED)</span>
            <Link to="/track">
              <Button variant="outline" showArrow={false}>
                View Public Issues
              </Button>
            </Link>
          </div>
        </div>
      </CornerFrame>
    </div>
  );
}
