import React, { useState } from 'react';

/**
 * Enhanced SessionDetails Component
 * Displays metadata, session duration, and quick copy utilities for the active session.
 */
function SessionDetails({ session }) {
  const [copied, setCopied] = useState(false);

  if (!session) {
    return null;
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString();
    } catch (_) {
      return isoString;
    }
  };

  const calculateDuration = (first, last) => {
    if (!first || !last) return 'Instant';
    try {
      const diffMs = Math.max(0, new Date(last).getTime() - new Date(first).getTime());
      const sec = Math.floor(diffMs / 1000);
      if (sec < 60) return `${sec} seconds`;
      const min = Math.floor(sec / 60);
      const remSec = sec % 60;
      return `${min}m ${remSec}s`;
    } catch (_) {
      return 'N/A';
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(session.session_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="session-details-card">
      <div className="details-header">
        <div>
          <span className="text-muted text-xs uppercase tracking-wider">Active Session Inspection</span>
          <div className="details-id-container">
            <h4 className="details-session-id" title={session.session_id}>
              {session.session_id}
            </h4>
            <button className="btn btn-secondary btn-xs" onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Copy ID'}
            </button>
          </div>
        </div>
        <div className="details-badges">
          <span className="badge badge-success">
            {session.event_count} Events Recorded
          </span>
        </div>
      </div>

      <div className="details-meta-grid">
        <div className="meta-item">
          <span className="text-muted text-xs">First Interaction</span>
          <span className="meta-value">{formatDateTime(session.first_seen)}</span>
        </div>
        <div className="meta-item">
          <span className="text-muted text-xs">Last Activity</span>
          <span className="meta-value">{formatDateTime(session.last_seen)}</span>
        </div>
        <div className="meta-item">
          <span className="text-muted text-xs">Session Lifespan</span>
          <span className="meta-value duration-highlight">
            {calculateDuration(session.first_seen, session.last_seen)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SessionDetails;
