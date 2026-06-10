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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 10px',
          height: 36,
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      >
        {/* Minimalist traffic lights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginRight: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        </div>

        {/* URL bar */}
        <div
          className="font-mono"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 8px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 4,
            fontSize: 10,
            color: 'var(--text-muted)',
            overflow: 'hidden',
          }}
        >
          {previewUrl ? (
            <>
              <span style={{ color: 'var(--green)', fontSize: 8, flexShrink: 0 }}>●</span>
              <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{previewUrl}</span>
            </>
          ) : (
            <span>about:blank</span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            id="preview-refresh-btn"
            onClick={refresh}
            disabled={!previewUrl}
            title="Refresh preview"
            style={{
              width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: 4,
              color: 'var(--text-muted)',
              cursor: previewUrl ? 'pointer' : 'not-allowed',
              opacity: previewUrl ? 1 : 0.3,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { if (previewUrl) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={isRefreshing ? 'animate-spin-slow' : ''}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
          <button
            id="preview-newtab-btn"
            onClick={openInNewTab}
            disabled={!previewUrl}
            title="Open in new tab"
            style={{
              width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: 4,
              color: 'var(--text-muted)',
              cursor: previewUrl ? 'pointer' : 'not-allowed',
              opacity: previewUrl ? 1 : 0.3,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { if (previewUrl) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              background: 'var(--bg-primary)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div
                className="animate-spin-slow"
                style={{
                  width: 20, height: 20,
                  border: '1.5px solid rgba(124,58,237,0.2)',
                  borderTopColor: 'var(--accent)',
                  borderRadius: '50%',
                }}
              />
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.06em' }}>Loading preview</span>
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
