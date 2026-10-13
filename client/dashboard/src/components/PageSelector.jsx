import React from 'react';

/**
 * Enhanced PageSelector Component
 * Provides clean dropdown and quick-pill selectors for tracked URLs.
 */
function PageSelector({
  pages = [],
  selectedPage = '',
  onSelectPage,
  disabled = false
}) {
  return (
    <div className="page-selector-container">
      <div className="selector-header-row">
        <label htmlFor="heatmap-page-select" className="selector-label">
          Tracked Target Page URL
        </label>
        <span className="badge badge-neutral text-xs">
          {pages.length} {pages.length === 1 ? 'Page Tracked' : 'Pages Tracked'}
        </span>
      </div>

      <div className="selector-input-wrapper">
        <select
          id="heatmap-page-select"
          className="selector-select"
          value={selectedPage}
          onChange={(e) => onSelectPage(e.target.value)}
          disabled={disabled || pages.length === 0}
        >
          {pages.length === 0 ? (
            <option value="">No tracked pages available yet</option>
          ) : (
            <>
              <option value="">-- Select a Tracked Page URL --</option>
              {pages.map((url) => (
                <option key={url} value={url}>
                  {url}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      {/* Quick Select Page Pills */}
      {pages.length > 0 && (
        <div className="quick-page-pills">
          <span className="text-muted text-xs">Quick Select:</span>
          {pages.map((url) => {
            const isSelected = url === selectedPage;
            // Short display path
            let displayPath = url;
            try {
              const parsed = new URL(url);
              displayPath = parsed.pathname || url;
            } catch (_) {}

            return (
              <button
                key={url}
                type="button"
                className={`quick-pill ${isSelected ? 'quick-pill-active' : ''}`}
                onClick={() => onSelectPage(url)}
                title={url}
              >
                {displayPath}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PageSelector;
