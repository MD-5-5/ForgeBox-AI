import React, { useState, useCallback } from 'react';
import LandingScreen from './components/LandingScreen';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import PreviewPanel from './components/PreviewPanel';
import TerminalPanel from './components/TerminalPanel';
import FileExplorer from './components/FileExplorer';
import { startSandbox } from './api/sandbox';
import './index.css';

// Resizable divider component
function Divider({ direction = 'horizontal' }) {
  return (
    <div
      className="resize-handle flex-shrink-0"
      style={{
        width: direction === 'vertical' ? '1px' : '100%',
        height: direction === 'horizontal' ? '1px' : '100%',
        background: 'var(--border-subtle)',
        cursor: direction === 'vertical' ? 'col-resize' : 'row-resize',
      }}
    />
  );
}

// Tab bar component — minimalist panel header style
function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div
      className="flex items-center shrink-0"
      style={{
        height: 34,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        paddingLeft: 4,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '0 12px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            borderRight: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
            transition: 'color 0.15s',
          }}
        >
          {activeTab === tab.id && (
            <div
              style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: 1,
                background: 'var(--accent)',
              }}
            />
          )}
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState('idle'); // idle | creating | ready
  const [sandboxId, setSandboxId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeBottomTab, setActiveBottomTab] = useState('terminal');
  const [errorMsg, setErrorMsg] = useState(null);

  // Restore session from URL (e.g. after a page refresh with ?sandboxId=…)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('sandboxId');
    if (id) {
      setSandboxId(id);
      setPreviewUrl(`http://${id}.preview.localhost`);
      setStatus('ready');
    }
  }, []);

  /**
   * Launch a sandbox for the given project.
   * Called by LandingScreen when the user clicks "Open" on a project card.
   * @param {string} projectId
   */
  const handleLaunch = useCallback(async (projectId) => {
    setStatus('creating');
    setErrorMsg(null);
    try {
      const data = await startSandbox(projectId);
      window.history.pushState({}, '', `/?sandboxId=${data.sandboxId}`);
      setSandboxId(data.sandboxId);
      setPreviewUrl(data.previewUrl);
      setStatus('ready');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('idle');
    }
  }, []);

  const bottomTabs = [
    {
      id: 'terminal',
      label: 'Terminal',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      )
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <Header sandboxId={sandboxId} status={status} />

      {/* Error Toast */}
      {errorMsg && (
        <div
          className="animate-fade-in font-mono"
          style={{
            position: 'absolute',
            top: 56, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8,
            color: '#fca5a5',
            fontSize: 12,
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {errorMsg}
          <button
            onClick={() => setErrorMsg(null)}
            style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', marginLeft: 4, fontSize: 12 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {status === 'idle' || status === 'creating' ? (
          <LandingScreen onLaunch={handleLaunch} isCreating={status === 'creating'} />
        ) : (
          /* IDE Layout */
          <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Left: Chat Panel */}
            <div
              className="animate-fade-in-left"
              style={{
                width: 300,
                minWidth: 240,
                flexShrink: 0,
                borderRight: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ChatPanel sandboxId={sandboxId} />
            </div>

            {/* Center: Preview + Terminal */}
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* Preview (top ~60%) */}
              <div style={{ flex: 3, minHeight: 0, borderBottom: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <PreviewPanel previewUrl={previewUrl} />
              </div>

              {/* Terminal (bottom ~40%) */}
              <div style={{ flex: 2, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <TabBar tabs={bottomTabs} activeTab={activeBottomTab} onTabChange={setActiveBottomTab} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  {activeBottomTab === 'terminal' && (
                    <TerminalPanel sandboxId={sandboxId} />
                  )}
                </div>
              </div>
            </div>

            {/* Right: File Explorer */}
            <div
              className="animate-fade-in-right"
              style={{
                width: 240,
                minWidth: 180,
                flexShrink: 0,
                borderLeft: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <FileExplorer sandboxId={sandboxId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
