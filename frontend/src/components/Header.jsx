import React from 'react';

export default function Header({ sandboxId, status }) {
  const statusConfig = {
    idle:     { label: 'Idle',     dot: 'idle',     bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', text: 'var(--text-muted)' },
    creating: { label: 'Creating', dot: 'creating', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  text: 'var(--amber)' },
    ready:    { label: 'Running',  dot: 'ready',    bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)', text: 'var(--green)' },
  };
  const s = statusConfig[status] || statusConfig.idle;

  return (
    <header
      className="flex items-center justify-between shrink-0 px-4"
      style={{
        height: '48px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5">
        {/* Logo icon */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 24, height: 24,
            background: 'linear-gradient(135deg, #7C3AED, #a78bfa)',
            borderRadius: 4,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.95" />
            <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.45" />
            <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.45" />
            <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.95" />
          </svg>
        </div>
        {/* Wordmark */}
        <div className="flex flex-col" style={{ lineHeight: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ForgeBox
          </span>
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.06em', marginTop: 1 }}>
            AI SANDBOX
          </span>
        </div>
      </div>

      {/* ── Center: Sandbox ID chip ── */}
      {sandboxId && (
        <div
          className="flex items-center gap-1.5 font-mono"
          style={{
            padding: '4px 10px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 4,
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.02em',
          }}
        >
          {/* Lock icon */}
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="truncate" style={{ maxWidth: 200, color: 'var(--text-secondary)' }}>
            {sandboxId.length > 20 ? sandboxId.slice(0, 20) + '…' : sandboxId}
          </span>
        </div>
      )}

      {/* ── Right: Status ── */}
      <div className="status-badge" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
        <span className={`status-dot ${s.dot}`} />
        {s.label}
      </div>
    </header>
  );
}
