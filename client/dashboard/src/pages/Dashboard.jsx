import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  getSessions,
  getSessionEvents,
  getHeatmap,
  getPages,
  verifyAdmin,
  clearAuthToken,
  getAuthToken
} from '../services/api';
import SessionList from '../components/SessionList';
import SessionDetails from '../components/SessionDetails';
import EventTimeline from '../components/EventTimeline';
import PageSelector from '../components/PageSelector';
import Heatmap from '../components/Heatmap';
import PagesTable from '../components/PagesTable';
import Login from '../components/Login';

/**
 * Main Dashboard Page
 * Orchestrates session list, user journey timeline, multi-page flows, and click heatmaps.
 * Protected by Administrator Authentication.
 */
function Dashboard() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAuthToken()));
  const [adminUser, setAdminUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Navigation / View Tabs: 'journey' | 'pages' | 'heatmap'
  const [activeTab, setActiveTab] = useState('journey');

  // Sessions State
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Session Events State
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);

  // Tracked Pages List & Aggregate Metrics State
  const [pagesList, setPagesList] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesError, setPagesError] = useState(null);

  // Selected Page & Heatmap State
  const [selectedPage, setSelectedPage] = useState('');
  const [heatmapClicks, setHeatmapClicks] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState(null);

  // Refs for tracking active requests and preventing race conditions
  const activeSessionIdRef = useRef(selectedSessionId);
  const activePageRef = useRef(selectedPage);
  const eventsAbortRef = useRef(null);
  const heatmapAbortRef = useRef(null);

  activeSessionIdRef.current = selectedSessionId;
  activePageRef.current = selectedPage;

  // Verify Admin Session on mount & listen for 401 events
  useEffect(() => {
    let isMounted = true;

    verifyAdmin().then((res) => {
      if (isMounted) {
        setIsAuthenticated(res.authenticated);
        if (res.authenticated) {
          setAdminUser(res.user);
        }
        setCheckingAuth(false);
      }
    });

    const handleUnauthorized = () => {
      if (isMounted) {
        setIsAuthenticated(false);
        setAdminUser(null);
      }
    };

    window.addEventListener('cf_auth_unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('cf_auth_unauthorized', handleUnauthorized);
    };
  }, []);

  // 1. Fetch Sessions List
  const loadSessions = useCallback(async (isBackground = false) => {
    if (!isAuthenticated) return;

    if (!isBackground) {
      setSessionsLoading(true);
    }
    setSessionsError(null);

    try {
      const res = await getSessions({ page: 1, limit: 50 });
      setSessions(res.sessions || []);

      // Auto-select first session if none currently selected
      if (res.sessions && res.sessions.length > 0 && !selectedSessionId) {
        setSelectedSessionId(res.sessions[0].session_id);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setSessionsError(err.message || 'Failed to load sessions');
      }
    } finally {
      if (!isBackground) {
        setSessionsLoading(false);
      }
    }
  }, [isAuthenticated, selectedSessionId]);

  // 2. Fetch Tracked Pages Aggregates
  const loadPages = useCallback(async (isBackground = false) => {
    if (!isAuthenticated) return;

    if (!isBackground) {
      setPagesLoading(true);
    }
    setPagesError(null);

    try {
      const res = await getPages({ page: 1, limit: 50 });
      const pages = res.pages || [];
      setPagesList(pages);

      // Auto-select first discovered page if none selected yet
      if (pages.length > 0 && !selectedPage) {
        setSelectedPage(pages[0].page_url);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setPagesError(err.message || 'Failed to load tracked pages');
      }
    } finally {
      if (!isBackground) {
        setPagesLoading(false);
      }
    }
  }, [isAuthenticated, selectedPage]);

  // Combined Refresh Handler
  const refreshAllData = useCallback((isBackground = false) => {
    loadSessions(isBackground);
    loadPages(isBackground);
  }, [loadSessions, loadPages]);

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData(false);
    }
  }, [isAuthenticated, refreshAllData]);

  // 3. Fetch Events when Selected Session Changes (with Race Condition Guard)
  useEffect(() => {
    if (!isAuthenticated || !selectedSessionId) {
      setEvents([]);
      return;
    }

    // Cancel previous inflight request
    if (eventsAbortRef.current) {
      eventsAbortRef.current.abort();
    }
    const controller = new AbortController();
    eventsAbortRef.current = controller;

    setEventsLoading(true);
    setEventsError(null);

    getSessionEvents(selectedSessionId, { signal: controller.signal })
      .then((res) => {
        // Race condition prevention: ensure current active session still matches
        if (activeSessionIdRef.current === res.sessionId) {
          setEvents(res.events || []);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          if (activeSessionIdRef.current === selectedSessionId) {
            setEventsError(err.message || 'Failed to load events');
          }
        }
      })
      .finally(() => {
        if (activeSessionIdRef.current === selectedSessionId) {
          setEventsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, selectedSessionId]);

  // 4. Fetch Heatmap when Selected Page Changes (with Race Condition Guard)
  useEffect(() => {
    if (!isAuthenticated || !selectedPage) {
      setHeatmapClicks([]);
      return;
    }

    if (heatmapAbortRef.current) {
      heatmapAbortRef.current.abort();
    }
    const controller = new AbortController();
    heatmapAbortRef.current = controller;

    setHeatmapLoading(true);
    setHeatmapError(null);

    getHeatmap(selectedPage, { signal: controller.signal })
      .then((res) => {
        // Race condition guard
        if (activePageRef.current === res.pageUrl) {
          setHeatmapClicks(res.clicks || []);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          if (activePageRef.current === selectedPage) {
            setHeatmapError(err.message || 'Failed to load heatmap data');
          }
        }
      })
      .finally(() => {
        if (activePageRef.current === selectedPage) {
          setHeatmapLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, selectedPage]);

  // Handle Logout
  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  // Active session metadata object
  const activeSession = sessions.find((s) => s.session_id === selectedSessionId);

  // Harvest all unique tracked URLs for selector
  const allTrackedUrls = useMemo(() => {
    const set = new Set(pagesList.map((p) => p.page_url));
    events.forEach((e) => {
      if (e.page_url) set.add(e.page_url);
    });
    return Array.from(set);
  }, [pagesList, events]);

  // KPI Metrics Calculation
  const kpiMetrics = useMemo(() => {
    const totalSessions = sessions.length;
    const totalEvents = sessions.reduce((acc, s) => acc + (s.event_count || 0), 0);
    const avgPerSession = totalSessions > 0 ? (totalEvents / totalSessions).toFixed(1) : '0';
    return {
      totalSessions,
      totalEvents,
      avgPerSession,
      totalPages: allTrackedUrls.length
    };
  }, [sessions, allTrackedUrls]);

  // Handler to jump directly from Timeline or Pages Table to Heatmap
  const handleViewOnHeatmap = (url) => {
    setSelectedPage(url);
    setActiveTab('heatmap');
  };

  // Launch Demo Store URL
  const handleLaunchDemo = () => {
    window.open('http://localhost:5000/demo/', '_blank');
  };

  // Auth checking loading state
  if (checkingAuth) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner"></div>
        <p>Verifying administrator session...</p>
      </div>
    );
  }

  // If unauthenticated, show Administrator Login Screen
  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          setAdminUser(user);
        }}
      />
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar - Simple & Clean */}
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="brand-logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M18 9l-5 5-4-4-3 3" />
            </svg>
          </div>
          <div className="brand-titles">
            <span className="brand-name">CausalFunnel</span>
            <span className="brand-divider">/</span>
            <span className="brand-app-name">Analytics</span>
          </div>
        </div>

        <nav className="header-nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'journey' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('journey')}
          >
            Sessions & Journey
          </button>
          <button
            className={`tab-btn ${activeTab === 'pages' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('pages')}
          >
            Multi-Page Flow
            <span className="tab-count-pill">{pagesList.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'heatmap' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
          >
            Click Heatmap
          </button>
        </nav>

        <div className="header-actions">
          {/* Admin Profile Pill */}
          <div className="admin-status-pill" title="Logged in as Administrator">
            <span className="live-status-dot" />
            <span className="admin-name">{adminUser?.username || 'admin'}</span>
          </div>

          {/* Manual Refresh Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => refreshAllData(false)}
            title="Refresh analytics data"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>

          {/* Launch Demo Store Button */}
          <button
            className="btn btn-primary-accent btn-sm"
            onClick={handleLaunchDemo}
            title="Open interactive Demo Store in new tab to test shopping flow"
          >
            Demo Store
            <span style={{ marginLeft: '4px', opacity: 0.85 }}>↗</span>
          </button>

          {/* Logout Button */}
          <button
            className="btn btn-ghost btn-sm btn-logout"
            onClick={handleLogout}
            title="Log out of administrator session"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {/* KPI Metrics Summary Bar - Clean & Minimalist */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Total Sessions</span>
              <span className="kpi-tag kpi-tag-blue">Sessions</span>
            </div>
            <strong className="kpi-value">{kpiMetrics.totalSessions}</strong>
            <span className="kpi-subtext">Active & historical journeys</span>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Total Events</span>
              <span className="kpi-tag kpi-tag-green">Ingested</span>
            </div>
            <strong className="kpi-value">{kpiMetrics.totalEvents}</strong>
            <span className="kpi-subtext">Page views and clicks recorded</span>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Avg Events / Session</span>
              <span className="kpi-tag kpi-tag-purple">Depth</span>
            </div>
            <strong className="kpi-value">{kpiMetrics.avgPerSession}</strong>
            <span className="kpi-subtext">Mean interactions per visitor</span>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Discovered Pages</span>
              <span className="kpi-tag kpi-tag-amber">Paths</span>
            </div>
            <strong className="kpi-value">{kpiMetrics.totalPages}</strong>
            <span className="kpi-subtext">Unique URLs tracked across store</span>
          </div>
        </div>

        {/* Tab 1: Sessions & User Journey */}
        {activeTab === 'journey' && (
          <div className="journey-layout-grid">
            {/* Left Column: Session List */}
            <aside className="journey-sidebar">
              <SessionList
                sessions={sessions}
                selectedSessionId={selectedSessionId}
                onSelectSession={setSelectedSessionId}
                loading={sessionsLoading}
                error={sessionsError}
                onRetry={() => loadSessions(false)}
              />
            </aside>

            {/* Right Column: Session Details & Timeline */}
            <section className="journey-main">
              {activeSession && <SessionDetails session={activeSession} />}
              <EventTimeline
                events={events}
                loading={eventsLoading}
                error={eventsError}
                hasSelectedSession={Boolean(selectedSessionId)}
                onRetry={() => setSelectedSessionId(selectedSessionId)}
                onViewOnHeatmap={handleViewOnHeatmap}
              />
            </section>
          </div>
        )}

        {/* Tab 2: Multi-Page Flow Analytics */}
        {activeTab === 'pages' && (
          <div className="pages-layout-wrapper">
            <PagesTable
              pages={pagesList}
              loading={pagesLoading}
              error={pagesError}
              onRetry={() => loadPages(false)}
              onSelectPageForHeatmap={handleViewOnHeatmap}
            />
          </div>
        )}

        {/* Tab 3: Click Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="heatmap-layout-wrapper">
            <div className="heatmap-controls-card">
              <PageSelector
                pages={allTrackedUrls}
                selectedPage={selectedPage}
                onSelectPage={setSelectedPage}
                disabled={heatmapLoading}
              />
            </div>

            <Heatmap
              clicks={heatmapClicks}
              pageUrl={selectedPage}
              loading={heatmapLoading}
              error={heatmapError}
              onRetry={() => setSelectedPage(selectedPage)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
