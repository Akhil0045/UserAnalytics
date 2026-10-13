import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getSessions, getSessionEvents, getHeatmap, getPages } from '../services/api';
import SessionList from '../components/SessionList';
import SessionDetails from '../components/SessionDetails';
import EventTimeline from '../components/EventTimeline';
import PageSelector from '../components/PageSelector';
import Heatmap from '../components/Heatmap';
import PagesTable from '../components/PagesTable';

/**
 * Main Dashboard Page
 * Orchestrates session list, user journey timeline, multi-page flows, and click heatmaps.
 * Features:
 * - High-level KPI metric cards (Total Sessions, Total Events, Avg Events/Session, Unique Pages)
 * - Multi-page flow analytics table with conversion metrics and 1-click heatmap jump
 * - Auto-refresh polling toggle (5-second intervals with live pulse indicator)
 * - 1-click launcher for the Demo Store in a new tab
 * - Seamless jump between user journey events and the Click Heatmap view
 * - Strict race condition prevention with AbortController
 */
function Dashboard() {
  // Navigation / View Tabs: 'journey' | 'pages' | 'heatmap'
  const [activeTab, setActiveTab] = useState('journey');

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(false);

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

  // 1. Fetch Sessions List
  const loadSessions = useCallback(async (isBackground = false) => {
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
  }, [selectedSessionId]);

  // 2. Fetch Tracked Pages Aggregates
  const loadPages = useCallback(async (isBackground = false) => {
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
  }, [selectedPage]);

  // Combined Refresh Handler
  const refreshAllData = useCallback((isBackground = false) => {
    loadSessions(isBackground);
    loadPages(isBackground);
  }, [loadSessions, loadPages]);

  useEffect(() => {
    refreshAllData(false);
  }, [refreshAllData]);

  // Auto-Refresh Polling Effect (every 5 seconds when enabled)
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      refreshAllData(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshAllData]);

  // 3. Fetch Events when Selected Session Changes (with Race Condition Guard)
  useEffect(() => {
    if (!selectedSessionId) {
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
  }, [selectedSessionId]);

  // 4. Fetch Heatmap when Selected Page Changes (with Race Condition Guard)
  useEffect(() => {
    if (!selectedPage) {
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
  }, [selectedPage]);

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

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="brand-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="header-title">CausalFunnel Analytics</h1>
            <span className="text-muted text-xs">Real-Time Interaction & Multi-Page Intelligence</span>
          </div>
        </div>

        <div className="header-nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'journey' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('journey')}
          >
            👥 Sessions & Journey
          </button>
          <button
            className={`tab-btn ${activeTab === 'pages' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('pages')}
          >
            🌐 Multi-Page Flow ({pagesList.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'heatmap' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
          >
            🔥 Click Heatmap
          </button>
        </div>

        <div className="header-actions">
          {/* Live Auto-Refresh Polling Switch */}
          <button
            className={`btn-auto-refresh ${autoRefresh ? 'auto-refresh-on' : ''}`}
            onClick={() => setAutoRefresh((prev) => !prev)}
            title="Toggle automatic 5-second live data refresh"
          >
            <span className={`pulse-dot ${autoRefresh ? 'pulse-dot-active' : ''}`}></span>
            {autoRefresh ? 'Live (5s)' : 'Auto-Refresh'}
          </button>

          {/* Manual Refresh Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => refreshAllData(false)}
            title="Refresh analytics data"
          >
            🔄 Refresh
          </button>

          {/* Launch Demo Store Button */}
          <button
            className="btn btn-primary-accent btn-sm"
            onClick={handleLaunchDemo}
            title="Open interactive Demo Store in new tab to test shopping flow"
          >
            🚀 Open Demo Store
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {/* KPI Metrics Summary Bar */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrap icon-blue">👥</div>
            <div className="kpi-info">
              <span className="kpi-label">Total Sessions</span>
              <strong className="kpi-value">{kpiMetrics.totalSessions}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap icon-green">⚡</div>
            <div className="kpi-info">
              <span className="kpi-label">Total Events Ingested</span>
              <strong className="kpi-value">{kpiMetrics.totalEvents}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap icon-purple">📊</div>
            <div className="kpi-info">
              <span className="kpi-label">Avg Events / Session</span>
              <strong className="kpi-value">{kpiMetrics.avgPerSession}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap icon-amber">🌐</div>
            <div className="kpi-info">
              <span className="kpi-label">Discovered Pages</span>
              <strong className="kpi-value">{kpiMetrics.totalPages}</strong>
            </div>
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
