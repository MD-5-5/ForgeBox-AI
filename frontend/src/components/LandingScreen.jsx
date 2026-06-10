import React, { useState, useEffect, useCallback } from 'react';
import { fetchProjects, createProject } from '../api/sandbox';

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return (
    <span
      className="animate-spin-slow"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '1.5px solid rgba(255,255,255,0.15)',
        borderTopColor: 'white',
        borderRadius: '50%',
        flexShrink: 0,
      }}
    />
  );
}

// ── Feature Tag ───────────────────────────────────────────────────────────────
function FeatureTag({ label }) {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: 10,
        fontWeight: 400,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 4,
        padding: '3px 8px',
      }}
    >
      {label}
    </span>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, onOpen, isOpening }) {
  const initials = project.title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';

  return (
    <div
      className="project-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-subtle)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-active)';
        e.currentTarget.style.background = 'var(--accent-dim)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7C3AED, #a78bfa)',
          fontSize: 11,
          fontWeight: 600,
          color: 'white',
          letterSpacing: '0.02em',
        }}
      >
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', truncate: true, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {project.title}
        </p>
        <p className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {project._id}
        </p>
      </div>

      {/* Open button */}
      <button
        id={`open-project-${project._id}`}
        disabled={isOpening}
        onClick={() => onOpen(project)}
        className="btn-ghost"
        style={{
          flexShrink: 0,
          background: isOpening ? 'var(--accent-dim)' : undefined,
          borderColor: isOpening ? 'var(--border-active)' : undefined,
          color: isOpening ? 'var(--text-secondary)' : undefined,
          cursor: isOpening ? 'not-allowed' : 'pointer',
          minWidth: 56,
          justifyContent: 'center',
        }}
      >
        {isOpening ? <Spinner size={12} /> : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
        {isOpening ? 'Opening' : 'Open'}
      </button>
    </div>
  );
}

// ── New Project Modal ─────────────────────────────────────────────────────────
function NewProjectModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const data = await createProject(trimmed);
      onCreate(data.project);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(8,8,15,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: 400,
          margin: '0 16px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              New Project
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              Give your sandbox project a name
            </p>
          </div>
          <button
            id="close-new-project-modal"
            onClick={onClose}
            style={{
              width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 12,
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label
              htmlFor="project-title-input"
              style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.02em' }}
            >
              Project Name
            </label>
            <input
              id="project-title-input"
              type="text"
              autoFocus
              placeholder="e.g. My Awesome App"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
            />
          </div>

          {error && (
            <p style={{
              fontSize: 12, padding: '8px 10px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 6, color: '#fca5a5',
            }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
            >
              Cancel
            </button>
            <button
              id="create-project-btn"
              type="submit"
              disabled={loading || !title.trim()}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
            >
              {loading && <Spinner size={13} />}
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main LandingScreen ────────────────────────────────────────────────────────
export default function LandingScreen({ onLaunch }) {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [openingId, setOpeningId] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    setFetchError(null);
    try {
      const data = await fetchProjects();
      setProjects(data.projects ?? []);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const handleProjectCreated = (project) => {
    setShowModal(false);
    setProjects((prev) => [project, ...prev]);
  };

  const handleOpen = async (project) => {
    setOpeningId(project._id);
    await onLaunch(project._id);
    setOpeningId(null);
  };

  return (
    <>
      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleProjectCreated}
        />
      )}

      <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>

        {/* ── LEFT: Hero ────────────────────────────────────────────────────── */}
        <div
          className="dot-grid"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 64px',
            position: 'relative',
            overflow: 'hidden',
            borderRight: '1px solid var(--border-subtle)',
          }}
        >
          {/* Ambient glow */}
          <div style={{
            position: 'absolute',
            top: '30%', left: '40%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(124,58,237,0.07), transparent 65%)',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
          }} />

          <div className="animate-fade-in" style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
            {/* Logo + brand mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
              <div style={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, #7C3AED, #a78bfa)',
                borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.95" />
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.45" />
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.45" />
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.95" />
                </svg>
              </div>
              <span className="font-mono" style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ForgeBox
              </span>
            </div>

            {/* Main headline */}
            <h1 style={{
              fontSize: 56,
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: 'var(--text-primary)',
              marginBottom: 16,
            }}>
              Build with AI.<br />
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Ship with confidence.</span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              marginBottom: 36,
              maxWidth: 380,
            }}>
              Spin up isolated sandbox environments, chat with AI to generate frontends,
              and preview your changes in real-time — all in one place.
            </p>

            {/* Feature tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Sandboxed', 'AI Code Gen', 'Live Preview', 'Terminal'].map((f) => (
                <FeatureTag key={f} label={f} />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Projects Panel ──────────────────────────────────────────── */}
        <div style={{
          width: 360,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
        }}>
          {/* Panel header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            height: 48,
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Projects</div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </div>
            </div>
            <button
              id="new-project-btn"
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New
            </button>
          </div>

          {/* Project list */}
          <div className="scroll-y" style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {loadingProjects ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />
              ))
            ) : fetchError ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 0', textAlign: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fetchError}</p>
                <button onClick={loadProjects} className="btn-ghost" style={{ fontSize: 11 }}>Retry</button>
              </div>
            ) : projects.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '48px 16px', textAlign: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: 'var(--accent-dim)',
                  border: '1px dashed rgba(124,58,237,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>No projects yet</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Create your first project to get started</p>
                </div>
                <button
                  id="create-first-project-btn"
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create Project
                </button>
              </div>
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onOpen={handleOpen}
                  isOpening={openingId === project._id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
