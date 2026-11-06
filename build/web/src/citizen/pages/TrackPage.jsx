/**
 * TrackPage.jsx — "/track" route
 *
 * A simple search page where citizens can enter a reference number
 * (e.g., CIV-123456) to look up the status of a previously submitted report.
 * On valid submit the user is navigated to /track/{ref}.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import SectionLabel from '@shared-ui/SectionLabel';
import Card from '@shared-ui/Card';
import Button from '@shared-ui/Button';
import Badge from '@shared-ui/Badge';

function TrackPage() {
  const navigate = useNavigate();
  const [refValue, setRefValue] = useState('');
  const [error, setError] = useState('');

  /** Validate & navigate on form submit */
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = refValue.trim();

    if (!trimmed) {
      setError('Please enter a reference number.');
      return;
    }

    setError('');
    navigate(`/track/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      {/* ── Section label ── */}
      <SectionLabel>Track Your Report</SectionLabel>

      {/* ── Heading ── */}
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-navy mt-4">
        Enter your reference number
      </h1>

      {/* ── Description ── */}
      <p className="font-body text-navy/70 mt-3 text-base md:text-lg leading-relaxed">
        Look up the status of a previously submitted report using its reference
        number (e.g., CIV-123456).
      </p>

      {/* ── Search form ── */}
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
        {/* Text input with search icon */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40 pointer-events-none"
          />
          <input
            type="text"
            value={refValue}
            onChange={(e) => {
              setRefValue(e.target.value);
              if (error) setError('');
            }}
            placeholder="CIV-123456"
            aria-label="Report reference number"
            className={`
              w-full pl-10 pr-4 py-3
              font-body text-navy text-base
              bg-white border rounded-card
              outline-none transition-colors
              placeholder:text-navy/30
              focus:border-accent-orange focus:ring-1 focus:ring-accent-orange/30
              ${error ? 'border-accent-orange' : 'border-navy/20'}
            `}
          />
        </div>

        <Button variant="primary" type="submit" showArrow>
          Track
        </Button>
      </form>

      {/* ── Validation error ── */}
      {error && (
        <p className="mt-2 text-sm font-body text-accent-orange" role="alert">
          {error}
        </p>
      )}

      {/* ── Info card ── */}
      <Card className="mt-10">
        <div className="flex items-start gap-3 p-4">
          <Badge color="navy">DEMO</Badge>
          <p className="font-body text-sm text-navy/70 leading-relaxed">
            Reports submitted in demo mode are stored in your browser's
            localStorage and will not appear on other devices.
          </p>
        </div>
      </Card>
    </main>
  );
}

export default TrackPage;
