import React from 'react';

function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          CausalFunnel Analytics Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Phase 1 — Project Initialization
        </p>
      </header>
      <main style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Frontend Foundation Ready</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          React + Vite dashboard initialized. Analytics components, session explorers, and heatmaps will be implemented in subsequent phases according to the project roadmap.
        </p>
        <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: '#064e3b', color: '#6ee7b7', borderRadius: '9999px', fontSize: '0.875rem' }}>
          Status: Initialized
        </div>
      </main>
    </div>
  );
}

export default App;
