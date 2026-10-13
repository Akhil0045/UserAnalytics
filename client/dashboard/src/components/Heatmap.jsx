import React, { useState, useMemo } from 'react';

/**
 * Enhanced Heatmap Component
 * Features:
 * - View mode toggle: 'points' (precise glow rings) vs 'density' (thermal gradient blooms)
 * - Toggleable simulated page wireframe (NexusTech Store layout) for visual element context
 * - Interactive click list inspector with hover synchronization
 * - Coordinate breakdown statistics (quadrants, top vs bottom)
 */
function Heatmap({
  clicks = [],
  pageUrl = '',
  loading = false,
  error = null,
  onRetry
}) {
  const [hoveredClick, setHoveredClick] = useState(null);
  const [viewMode, setViewMode] = useState('points'); // 'points' | 'density'
  const [showWireframe, setShowWireframe] = useState(true);

  // Calculate click coordinates normalized (0-100%)
  const normalizedClicks = useMemo(() => {
    return clicks.map((c, index) => {
      const width = c.viewport_width || 1920;
      const height = c.viewport_height || 1080;
      const normX = Math.min(Math.max((c.x / width) * 100, 0), 100);
      const normY = Math.min(Math.max((c.y / height) * 100, 0), 100);
      return {
        ...c,
        id: index + 1,
        normX,
        normY
      };
    });
  }, [clicks]);

  // Click concentration breakdown stats
  const stats = useMemo(() => {
    if (normalizedClicks.length === 0) return null;
    let topHalf = 0;
    let leftHalf = 0;
    normalizedClicks.forEach((c) => {
      if (c.normY <= 50) topHalf++;
      if (c.normX <= 50) leftHalf++;
    });
    const total = normalizedClicks.length;
    return {
      topHalfPct: Math.round((topHalf / total) * 100),
      bottomHalfPct: Math.round(((total - topHalf) / total) * 100),
      leftHalfPct: Math.round((leftHalf / total) * 100),
      rightHalfPct: Math.round(((total - leftHalf) / total) * 100)
    };
  }, [normalizedClicks]);

  return (
    <div className="panel heatmap-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h3>Interactive Click Heatmap</h3>
          {pageUrl && !loading && !error && (
            <span className="badge badge-primary">{clicks.length} Recorded Clicks</span>
          )}
        </div>

        {pageUrl && clicks.length > 0 && (
          <div className="heatmap-toolbar">
            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button
                className={`mode-btn ${viewMode === 'points' ? 'mode-btn-active' : ''}`}
                onClick={() => setViewMode('points')}
                title="View precise click coordinates with glow rings"
              >
                🎯 Precision Points
              </button>
              <button
                className={`mode-btn ${viewMode === 'density' ? 'mode-btn-active' : ''}`}
                onClick={() => setViewMode('density')}
                title="View thermal density blooms"
              >
                🔥 Thermal Density
              </button>
            </div>

            {/* Wireframe Backdrop Toggle */}
            <label className="wireframe-toggle-label" title="Toggle simulated page layout background">
              <input
                type="checkbox"
                checked={showWireframe}
                onChange={(e) => setShowWireframe(e.target.checked)}
              />
              <span>Page Mockup</span>
            </label>
          </div>
        )}
      </div>

      <div className="panel-body">
        {!pageUrl && (
          <div className="state-message state-empty">
            <div className="empty-icon">🗺️</div>
            <p>No page selected for heatmap visualization.</p>
            <span className="text-muted text-sm">
              Select a page URL from the selector above to visualize client click patterns.
            </span>
          </div>
        )}

        {pageUrl && loading && (
          <div className="state-message">
            <div className="spinner"></div>
            <p>Aggregating click heatmap coordinates...</p>
          </div>
        )}

        {pageUrl && !loading && error && (
          <div className="state-message state-error">
            <p className="error-text">{error}</p>
            {onRetry && (
              <button className="btn btn-secondary btn-sm" onClick={onRetry}>
                Retry
              </button>
            )}
          </div>
        )}

        {pageUrl && !loading && !error && clicks.length === 0 && (
          <div className="state-message state-empty">
            <div className="empty-icon">🖱️</div>
            <p>No clicks recorded on this page yet.</p>
            <span className="text-muted text-sm">
              Browse and click elements on this page to visualize normalized coordinates here.
            </span>
          </div>
        )}

        {pageUrl && !loading && !error && clicks.length > 0 && (
          <div className="heatmap-content-grid">
            {/* Left Area: Viewport Canvas */}
            <div className="heatmap-viewport-wrapper">
              <div className="heatmap-canvas-container">
                {/* Browser Mockup Chrome Header */}
                <div className="viewport-mock-header">
                  <div className="mock-dots">
                    <span className="mock-dot dot-red"></span>
                    <span className="mock-dot dot-yellow"></span>
                    <span className="mock-dot dot-green"></span>
                  </div>
                  <div className="mock-url-bar">{pageUrl}</div>
                  <span className="badge badge-neutral text-xs">Normalized 16:9 Viewport</span>
                </div>

                {/* Simulated Viewport Canvas */}
                <div className="viewport-canvas">
                  {/* Subtle Grid Overlay */}
                  <div className="canvas-grid-overlay"></div>

                  {/* Simulated Webpage Wireframe Mockup */}
                  {showWireframe && (
                    <div className="wireframe-mockup-layer">
                      {/* Nav Bar */}
                      <div className="wireframe-nav">
                        <div className="wireframe-logo"></div>
                        <div className="wireframe-search"></div>
                        <div className="wireframe-cart"></div>
                      </div>
                      {/* Hero Banner */}
                      <div className="wireframe-hero">
                        <div className="wireframe-hero-title"></div>
                        <div className="wireframe-hero-btn"></div>
                      </div>
                      {/* Category Pills */}
                      <div className="wireframe-pills">
                        <div className="wireframe-pill"></div>
                        <div className="wireframe-pill"></div>
                        <div className="wireframe-pill"></div>
                        <div className="wireframe-pill"></div>
                      </div>
                      {/* Product Grid */}
                      <div className="wireframe-grid">
                        <div className="wireframe-card">
                          <div className="wireframe-img"></div>
                          <div className="wireframe-text"></div>
                          <div className="wireframe-btn"></div>
                        </div>
                        <div className="wireframe-card">
                          <div className="wireframe-img"></div>
                          <div className="wireframe-text"></div>
                          <div className="wireframe-btn"></div>
                        </div>
                        <div className="wireframe-card">
                          <div className="wireframe-img"></div>
                          <div className="wireframe-text"></div>
                          <div className="wireframe-btn"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Render Points Mode */}
                  {viewMode === 'points' &&
                    normalizedClicks.map((c) => {
                      const isHovered = hoveredClick && hoveredClick.id === c.id;
                      return (
                        <div
                          key={c.id}
                          className={`click-marker ${isHovered ? 'click-marker-active' : ''}`}
                          style={{
                            left: `${c.normX}%`,
                            top: `${c.normY}%`
                          }}
                          onMouseEnter={() => setHoveredClick(c)}
                          onMouseLeave={() => setHoveredClick(null)}
                        >
                          <span className="marker-dot"></span>
                          <span className="marker-ripple"></span>
                          <span className="marker-index">{c.id}</span>
                        </div>
                      );
                    })}

                  {/* Render Thermal Density Mode */}
                  {viewMode === 'density' && (
                    <div className="thermal-density-layer">
                      {normalizedClicks.map((c) => (
                        <div
                          key={c.id}
                          className="density-bloom"
                          style={{
                            left: `${c.normX}%`,
                            top: `${c.normY}%`
                          }}
                          onMouseEnter={() => setHoveredClick(c)}
                          onMouseLeave={() => setHoveredClick(null)}
                        ></div>
                      ))}
                    </div>
                  )}

                  {/* Floating Inspection Tooltip */}
                  {hoveredClick && (
                    <div
                      className="click-tooltip"
                      style={{
                        left: `${hoveredClick.normX}%`,
                        top: `${hoveredClick.normY}%`
                      }}
                    >
                      <div className="tooltip-title">Click #{hoveredClick.id} Details</div>
                      <div className="tooltip-row">
                        <span>Original Position:</span>
                        <strong>({hoveredClick.x}px, {hoveredClick.y}px)</strong>
                      </div>
                      <div className="tooltip-row">
                        <span>Viewport Dim:</span>
                        <strong>{hoveredClick.viewport_width} × {hoveredClick.viewport_height}</strong>
                      </div>
                      <div className="tooltip-row">
                        <span>Normalized (%):</span>
                        <strong className="text-accent">{hoveredClick.normX.toFixed(1)}%, {hoveredClick.normY.toFixed(1)}%</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="heatmap-legend">
                <span className="legend-item">
                  <span className="marker-dot inline-block mr-1"></span>
                  Normalized viewports (0% - 100% proportional coordinates)
                </span>
                <span className="legend-item text-muted">
                  Hover points to inspect viewport coordinates
                </span>
              </div>
            </div>

            {/* Right Area: Click Inspector Breakdown Panel */}
            <div className="heatmap-inspector-sidebar">
              <div className="inspector-card">
                <h4 className="inspector-title">Click Distribution</h4>
                {stats && (
                  <div className="stats-bars">
                    <div className="stat-bar-group">
                      <div className="stat-bar-label">
                        <span>Upper vs Lower Half</span>
                        <span>{stats.topHalfPct}% / {stats.bottomHalfPct}%</span>
                      </div>
                      <div className="stat-progress-track">
                        <div className="stat-progress-fill" style={{ width: `${stats.topHalfPct}%` }}></div>
                      </div>
                    </div>

                    <div className="stat-bar-group">
                      <div className="stat-bar-label">
                        <span>Left vs Right Half</span>
                        <span>{stats.leftHalfPct}% / {stats.rightHalfPct}%</span>
                      </div>
                      <div className="stat-progress-track">
                        <div className="stat-progress-fill stat-fill-purple" style={{ width: `${stats.leftHalfPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="inspector-card clicks-log-card">
                <h4 className="inspector-title">All Click Points ({normalizedClicks.length})</h4>
                <div className="clicks-scroll-list">
                  {normalizedClicks.map((c) => {
                    const isHovered = hoveredClick && hoveredClick.id === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`click-log-item ${isHovered ? 'click-log-item-active' : ''}`}
                        onMouseEnter={() => setHoveredClick(c)}
                        onMouseLeave={() => setHoveredClick(null)}
                      >
                        <span className="log-idx">#{c.id}</span>
                        <div className="log-coords">
                          <span>X: {c.x}px</span>
                          <span>Y: {c.y}px</span>
                        </div>
                        <span className="log-pct">{c.normX.toFixed(0)}%, {c.normY.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Heatmap;
