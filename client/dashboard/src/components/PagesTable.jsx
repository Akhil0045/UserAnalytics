import React, { useState, useMemo } from 'react';

/**
 * PagesTable Component
 * Displays aggregate tracking metrics across all discovered pages (views, clicks, sessions).
 * Allows 1-click jump to inspect click heatmaps for any specific URL.
 */
function PagesTable({
  pages = [],
  loading = false,
  error = null,
  onRetry,
  onSelectPageForHeatmap
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPages = useMemo(() => {
    return pages.filter((p) =>
      (p.page_url || '').toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [pages, searchTerm]);

  const formatPath = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname + (parsed.search || '');
    } catch (_) {
      return url;
    }
  };

  return (
    <div className="panel pages-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h3>Tracked Pages & Flow Analytics</h3>
          <span className="badge badge-primary">{pages.length} Pages</span>
        </div>

        {/* Filter input */}
        <div className="pages-search-box">
          <input
            type="text"
            className="session-search-input"
            placeholder="Filter by page URL / path..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '260px' }}
          />
        </div>
      </div>

      <div className="panel-body">
        {loading && (
          <div className="state-message">
            <div className="spinner"></div>
            <p>Aggregating page-level analytics...</p>
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

        {!loading && !error && filteredPages.length === 0 && (
          <div className="state-message state-empty">
            <div className="empty-icon">🌐</div>
            <p>{searchTerm ? 'No matching pages found.' : 'No tracked pages recorded yet.'}</p>
            <span className="text-muted text-sm">
              Visit pages in the demo store to begin recording cross-page analytics.
            </span>
          </div>
        )}

        {!loading && !error && filteredPages.length > 0 && (
          <div className="pages-table-wrapper">
            <table className="pages-table">
              <thead>
                <tr>
                  <th>Page / Path</th>
                  <th>Page Views</th>
                  <th>Clicks</th>
                  <th>Total Events</th>
                  <th>Unique Sessions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((p, idx) => {
                  const clickRate = p.views_count > 0
                    ? ((p.clicks_count / p.views_count) * 100).toFixed(0) + '%'
                    : 'N/A';

                  return (
                    <tr key={p.page_url || idx}>
                      <td>
                        <div className="page-url-cell">
                          <span className="page-path-chip">{formatPath(p.page_url)}</span>
                          <span className="page-full-url text-muted text-xs truncate" title={p.page_url}>
                            {p.page_url}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-pageview">
                          👁️ {p.views_count}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-click">
                          🖱️ {p.clicks_count}
                        </span>
                      </td>
                      <td>
                        <strong>{p.total_events}</strong>
                      </td>
                      <td>
                        <span className="badge badge-neutral">
                          👤 {p.unique_sessions}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-jump-heatmap"
                          onClick={() => onSelectPageForHeatmap(p.page_url)}
                          title="Open Heatmap for this URL"
                        >
                          🔥 View Heatmap
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PagesTable;
