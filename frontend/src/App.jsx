import React, { useState, useCallback } from 'react';
import LandingScreen from './components/LandingScreen';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import PreviewPanel from './components/PreviewPanel';
import TerminalPanel from './components/TerminalPanel';
import FileExplorer from './components/FileExplorer';
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

// Tab bar component
function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex items-center shrink-0"
      style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', height: '36px' }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          className="flex items-center gap-1.5 px-4 h-full text-xs font-medium transition-all relative"
          style={{
            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
            background: activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
            borderRight: '1px solid var(--border-subtle)',
          }}
        >
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: 'var(--accent-blue)' }} />
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

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('sandboxId');
    if (id) {
      setSandboxId(id);
      setPreviewUrl(`http://${id}.preview.localhost`);
      setStatus('ready');
    }
  }, []);

  const handleStartSandbox = useCallback(async () => {
    setStatus('creating');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/sandbox/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
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
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <Header sandboxId={sandboxId} status={status} />

      {/* Error Toast */}
      {errorMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-fade-in"
          style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
            backdropFilter: 'blur(12px)',
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {errorMsg}
          <button onClick={() => setErrorMsg(null)} className="ml-2" style={{ color: '#fca5a5' }}>✕</button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {status === 'idle' || status === 'creating' ? (
          <LandingScreen onStart={handleStartSandbox} isCreating={status === 'creating'} />
        ) : (
          /* IDE Layout */
          <div className="flex h-full overflow-hidden">
            {/* Left: Chat Panel */}
            <div className="flex flex-col h-full animate-fade-in-left"
              style={{ width: '320px', minWidth: '260px', flexShrink: 0, borderRight: '1px solid var(--border-subtle)' }}>
              <ChatPanel sandboxId={sandboxId} />
            </div>

            {/* Center: Preview + Terminal */}
            <div className="flex flex-col flex-1 overflow-hidden animate-fade-in">
              {/* Preview (top ~60%) */}
              <div style={{ flex: '3', minHeight: 0, borderBottom: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <PreviewPanel previewUrl={previewUrl} />
              </div>

              {/* Terminal (bottom ~40%) */}
              <div style={{ flex: '2', minHeight: 0, overflow: 'hidden' }}>
                <TabBar tabs={bottomTabs} activeTab={activeBottomTab} onTabChange={setActiveBottomTab} />
                <div style={{ height: 'calc(100% - 36px)', overflow: 'hidden' }}>
                  {activeBottomTab === 'terminal' && (
                    <TerminalPanel sandboxId={sandboxId} />
                  )}
                </div>
              </div>
            </div>

            {/* Right: File Explorer */}
            <div className="flex flex-col h-full animate-fade-in-right"
              style={{ width: '260px', minWidth: '200px', flexShrink: 0, borderLeft: '1px solid var(--border-subtle)' }}>
              <FileExplorer sandboxId={sandboxId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
