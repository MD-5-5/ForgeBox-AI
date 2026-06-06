import React from 'react';

export default function Header({ sandboxId, status }) {
  const statusConfig = {
    idle:     { label: 'Idle',     dot: 'idle',     bg: 'rgba(71,85,105,0.2)',   border: 'rgba(71,85,105,0.4)',   text: 'var(--text-muted)' },
    creating: { label: 'Creating', dot: 'creating', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)',  text: '#f59e0b' },
    ready:    { label: 'Running',  dot: 'ready',    bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
  };
  const s = statusConfig[status] || statusConfig.idle;

  return (
    <header className="flex items-center justify-between px-5 py-3 shrink-0"
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        height: '52px'
      }}>
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 0 14px rgba(99,102,241,0.4)' }}>
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="6" width="14" height="14" rx="2" fill="white" fillOpacity="0.9" />
            <rect x="28" y="6" width="14" height="14" rx="2" fill="white" fillOpacity="0.5" />
            <rect x="6" y="28" width="14" height="14" rx="2" fill="white" fillOpacity="0.5" />
            <rect x="28" y="28" width="14" height="14" rx="2" fill="white" fillOpacity="0.9" />
          </svg>
        </div>
        <div>
          <div className="font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>ForgeBox</div>
          <div className="text-xs font-mono" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            AI Sandbox IDE
          </div>
        </div>
      </div>

      {/* Center: Sandbox ID */}
      {sandboxId && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-xs"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{ color: 'var(--text-muted)' }}>ID:</span>
          <span className="truncate max-w-64">{sandboxId}</span>
        </div>
      )}

      {/* Right: Status */}
      <div className="flex items-center gap-3">
        <div className="status-badge"
          style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
          <div className={`status-dot ${s.dot}`} />
          {s.label}
        </div>
        <div className="text-xs font-mono px-2 py-1 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
          v1.0
        </div>
      </div>
    </header>
  );
}
