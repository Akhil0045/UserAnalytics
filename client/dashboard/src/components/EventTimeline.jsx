import React, { useState, useMemo } from 'react';

/**
 * Enhanced EventTimeline Component
 * Displays user journey events in reverse chronological order (latest interaction first)
 * with an interactive order toggle (Newest First vs. Chronological), event type filters,
 * and direct 'View Heatmap' jump triggers.
 */
function EventTimeline({
  events = [],
  loading = false,
  error = null,
  hasSelectedSession = false,
  onRetry,
  onViewOnHeatmap
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'page_view' | 'click'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (reverse order, newest first) | 'asc' (chronological)

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
    } catch (_) {
      return isoString;
    }
  };

  const calculateDelta = (currentIso, prevIso) => {
    if (!prevIso || !currentIso) return null;
    try {
      const deltaMs = Math.max(0, new Date(currentIso).getTime() - new Date(prevIso).getTime());
      if (deltaMs < 1000) return `+${deltaMs}ms`;
      return `+${(deltaMs / 1000).toFixed(1)}s`;
    } catch (_) {
      return null;
    }
  };

  // Annotate chronological steps and elapsed deltas first
  const annotatedEvents = useMemo(() => {
    return events.map((event, idx) => {
      const prev = idx > 0 ? events[idx - 1] : null;
      const delta = prev ? calculateDelta(event.timestamp, prev.timestamp) : null;
      return {
        ...event,
        stepNumber: idx + 1,
        delta
      };
    });
  }, [events]);

  // Filter and apply sort order
  const displayedEvents = useMemo(() => {
    let result = annotatedEvents;
    if (filterType !== 'all') {
      result = result.filter((e) => e.event_type === filterType);
    }

    if (sortOrder === 'desc') {
      // Reverse order: latest / newest interaction at the top
      return [...result].reverse();
    }
    return result;
  }, [annotatedEvents, filterType, sortOrder]);

  return (
    <div className="panel timeline-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h3>User Journey Timeline</h3>
          {hasSelectedSession && (
            <span className="badge badge-neutral">{displayedEvents.length} Steps</span>
          )}
        </div>

        {/* Header Controls: Filters & Reverse Order Toggle */}
        {hasSelectedSession && events.length > 0 && (
          <div className="timeline-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Filter controls */}
            <div className="timeline-filter-group">
              <button
                className={`filter-chip ${filterType === 'all' ? 'filter-chip-active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All ({events.length})
              </button>
              <button
                className={`filter-chip ${filterType === 'page_view' ? 'filter-chip-active' : ''}`}
                onClick={() => setFilterType('page_view')}
              >
                👁️ Views ({events.filter((e) => e.event_type === 'page_view').length})
              </button>
              <button
                className={`filter-chip ${filterType === 'click' ? 'filter-chip-active' : ''}`}
                onClick={() => setFilterType('click')}
              >
                🖱️ Clicks ({events.filter((e) => e.event_type === 'click').length})
              </button>
            </div>

            {/* Sort Order Toggle */}
            <button
              className="action-icon-btn"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              title="Toggle timeline order"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', height: 'fit-content' }}
            >
              {sortOrder === 'desc' ? '⬇️ Reverse (Newest First)' : '⬆️ Chronological (Oldest First)'}
            </button>
          </div>
        )}
      </div>

      <div className="panel-body">
        {!hasSelectedSession && (
          <div className="state-message state-empty">
            <div className="empty-icon">🧭</div>
            <p>No session selected.</p>
            <span className="text-muted text-sm">
              Select a session from the list to explore its event journey.
            </span>
          </div>
        )}

        {hasSelectedSession && loading && (
          <div className="state-message">
            <div className="spinner"></div>
            <p>Loading journey events...</p>
          </div>
        )}

        {hasSelectedSession && !loading && error && (
          <div className="state-message state-error">
            <p className="error-text">{error}</p>
            {onRetry && (
              <button className="btn btn-secondary btn-sm" onClick={onRetry}>
                Retry
              </button>
            )}
          </div>
        )}

        {hasSelectedSession && !loading && !error && displayedEvents.length === 0 && (
          <div className="state-message state-empty">
            <p>{filterType === 'all' ? 'No events recorded for this session.' : `No ${filterType} events in this session.`}</p>
          </div>
        )}

        {hasSelectedSession && !loading && !error && displayedEvents.length > 0 && (
          <div className="timeline-flow">
            {displayedEvents.map((event, index) => {
              const isPageView = event.event_type === 'page_view';
              const isClick = event.event_type === 'click';
              const isLatest = sortOrder === 'desc' && index === 0;
              const isInitial = (sortOrder === 'desc' && index === displayedEvents.length - 1) || (sortOrder === 'asc' && index === 0);

              return (
                <div key={event.event_id || index} className="timeline-item">
                  <div className="timeline-marker">
                    <span className={`marker-icon ${isPageView ? 'marker-view' : 'marker-click'}`}>
                      {isPageView ? '👁️' : '🖱️'}
                    </span>
                    {index < displayedEvents.length - 1 && <div className="timeline-connector"></div>}
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-top">
                      <div className="timeline-type-row">
                        <span className={`badge ${isPageView ? 'badge-pageview' : 'badge-click'}`}>
                          {isPageView ? 'PAGE VIEW' : 'CLICK'}
                        </span>
                        <span className="step-num text-muted text-xs">
                          Step #{event.stepNumber}
                          {isLatest && <span style={{ color: '#34d399', marginLeft: '4px', fontWeight: 600 }}>• Latest</span>}
                          {isInitial && <span style={{ color: '#60a5fa', marginLeft: '4px', fontWeight: 600 }}>• Initial</span>}
                        </span>
                      </div>
                      <div className="timeline-time-row">
                        {event.delta && <span className="delta-badge">{event.delta}</span>}
                        <span className="text-muted text-xs font-mono">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="timeline-url-row">
                      <span className="url-text" title={event.page_url}>
                        {event.page_url}
                      </span>
                      {onViewOnHeatmap && (
                        <button
                          className="btn-jump-heatmap"
                          onClick={() => onViewOnHeatmap(event.page_url)}
                          title="Open this URL in Heatmap view"
                        >
                          🔥 View Heatmap
                        </button>
                      )}
                    </div>

                    {isClick && event.click && (
                      <div className="timeline-click-data">
                        <span className="coord-chip">
                          📍 Coordinates: <strong>({event.click.x}, {event.click.y})</strong>
                        </span>
                        {event.click.viewport_width && (
                          <span className="viewport-chip">
                            🖥️ Viewport: {event.click.viewport_width} × {event.click.viewport_height}
                          </span>
                        )}
                      </div>
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

export default EventTimeline;
