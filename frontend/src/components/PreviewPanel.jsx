import React, { useState, useRef, useEffect } from 'react';

export default function PreviewPanel({ previewUrl }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef(null);

  const refresh = () => {
    if (!iframeRef.current || !previewUrl) return;
    setIsLoaded(false);
    setIsRefreshing(true);
    iframeRef.current.src = iframeRef.current.src;
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const openInNewTab = () => {
    if (previewUrl) window.open(previewUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', height: '40px' }}>
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 mr-1">
          <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono truncate"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
          {previewUrl ? (
            <>
              <span style={{ color: 'var(--accent-green)', fontSize: '9px' }}>●</span>
              <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{previewUrl}</span>
            </>
          ) : (
            <span>about:blank</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button id="preview-refresh-btn" onClick={refresh} disabled={!previewUrl}
            title="Refresh preview"
            className="w-7 h-7 rounded-md flex items-center justify-center transition-all disabled:opacity-30"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={isRefreshing ? 'animate-spin-slow' : ''}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
          <button id="preview-newtab-btn" onClick={openInNewTab} disabled={!previewUrl}
            title="Open in new tab"
            className="w-7 h-7 rounded-md flex items-center justify-center transition-all disabled:opacity-30"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 relative">
        {!previewUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{ color: 'var(--text-muted)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No Preview</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Start a sandbox to see the preview</p>
            </div>
          </div>
        ) : (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10"
                style={{ background: 'var(--bg-primary)' }}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin-slow" />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading preview...</span>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              id="sandbox-preview-iframe"
              src={previewUrl}
              title="Sandbox Preview"
              onLoad={() => setIsLoaded(true)}
              className="w-full h-full border-0"
              style={{ display: 'block', background: 'white' }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
            />
          </>
        )}
      </div>
    </div>
  );
}
