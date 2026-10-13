import React, { useState, useMemo } from 'react';

/**
 * Enhanced SessionList Component
 * Includes real-time search filtering, sorting, copyable session IDs, and active selection.
 */
function SessionList({
  sessions = [],
  selectedSessionId,
  onSelectSession,
  loading = false,
  error = null,
  onRetry
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'events' | 'oldest'

  const filteredAndSortedSessions = useMemo(() => {
    let result = sessions.filter((s) =>
      s.session_id.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.last_seen || 0) - new Date(a.last_seen || 0));
    } else if (sortBy === 'events') {
      result.sort((a, b) => (b.event_count || 0) - (a.event_count || 0));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.first_seen || 0) - new Date(b.first_seen || 0));
    }

    return result;
  }, [sessions, searchTerm, sortBy]);

  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return new Date(isoString).toLocaleDateString();
    } catch (_) {
      return isoString;
    }
  };

  const copyToClipboard = (text, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="panel session-list-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h3>Tracked Sessions</h3>
          <span className="badge badge-neutral">{sessions.length}</span>
        </div>
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          title="Sort sessions"
        >
          <option value="recent">Most Recent</option>
          <option value="events">Most Events</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Real-time search filter */}
      <div className="search-bar-wrapper">
        <input
          type="text"
          className="session-search-input"
          placeholder="Filter by Session ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
            ✕
          </button>
        )}
      </div>

      <div className="panel-body">
        {loading && (
          <div className="state-message">
            <div className="spinner"></div>
            <p>Loading sessions...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-message state-error">
            <p className="error-text">{error}</p>
            {onRetry && (
              <button className="btn btn-secondary btn-sm" onClick={onRetry}>
                Retry
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredAndSortedSessions.length === 0 && (
          <div className="state-message state-empty">
            <p>{searchTerm ? 'No matching sessions found.' : 'No sessions recorded yet.'}</p>
            <span className="text-muted text-xs">
              {searchTerm
                ? 'Try clearing the search query.'
                : 'Interact with the demo store in a separate tab to generate live analytics.'}
            </span>
          </div>
        )}

        {!loading && !error && filteredAndSortedSessions.length > 0 && (
          <div className="session-items">
            {filteredAndSortedSessions.map((session) => {
              const isSelected = session.session_id === selectedSessionId;
              return (
                <div
                  key={session.session_id}
                  className={`session-card ${isSelected ? 'session-card-active' : ''}`}
                  onClick={() => onSelectSession(session.session_id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectSession(session.session_id)}
                >
                  <div className="session-card-header">
                    <div className="session-id-row">
                      <span className="session-status-dot"></span>
                      <span className="session-id" title={session.session_id}>
                        {session.session_id.length > 20
                          ? `${session.session_id.substring(0, 18)}...`
                          : session.session_id}
                      </span>
                      <button
                        className="copy-icon-btn"
                        onClick={(e) => copyToClipboard(session.session_id, e)}
                        title="Copy Session ID"
                      >
                        📋
                      </button>
                    </div>
                    <span className="badge badge-primary">
                      {session.event_count} {session.event_count === 1 ? 'event' : 'events'}
                    </span>
                  </div>
                  <div className="session-card-footer">
                    <span className="text-muted text-xs">
                      Active {formatTimeAgo(session.last_seen)}
                    </span>
                    {isSelected && (
                      <span className="selected-tag">Selected</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionList;
