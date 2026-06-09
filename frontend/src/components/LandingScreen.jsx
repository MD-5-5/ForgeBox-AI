import React, { useState, useEffect, useCallback } from 'react';
import { fetchProjects, createProject } from '../api/sandbox';

// ── tiny helpers ─────────────────────────────────────────────────────────────

function Spinner({ size = 18 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '2px solid rgba(255,255,255,0.25)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin-slow 0.75s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

function ProjectCard({ project, onOpen, isOpening }) {
  const initials = project.title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className="group relative flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-200"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
        e.currentTarget.style.background = 'var(--bg-hover)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
        style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: 'white' }}
      >
        {initials || '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {project.title}
        </p>
        <p className="text-xs font-mono mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
          {project._id}
        </p>
      </div>

      {/* Open button */}
      <button
        id={`open-project-${project._id}`}
        disabled={isOpening}
        onClick={() => onOpen(project)}
        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
        style={{
          background: isOpening ? 'rgba(99,102,241,0.2)' : 'linear-gradient(135deg,#6366f1,#818cf8)',
          color: 'white',
          opacity: isOpening ? 0.7 : 1,
          cursor: isOpening ? 'not-allowed' : 'pointer',
        }}
      >
        {isOpening ? <Spinner size={14} /> : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
        {isOpening ? 'Launching…' : 'Open'}
      </button>
    </div>
  );
}

// ── New-project modal ─────────────────────────────────────────────────────────

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
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(8,12,23,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md mx-4 rounded-3xl p-8 animate-fade-in"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              New Project
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Give your sandbox project a name
            </p>
          </div>
          <button
            id="close-new-project-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="project-title-input"
              className="block text-xs font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Project Title
            </label>
            <input
              id="project-title-input"
              type="text"
              autoFocus
              placeholder="e.g. My Awesome App"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
            />
          </div>

          {error && (
            <p
              className="text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              id="create-project-btn"
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: loading || !title.trim()
                  ? 'rgba(99,102,241,0.3)'
                  : 'linear-gradient(135deg,#6366f1,#818cf8)',
                color: 'white',
                cursor: loading || !title.trim() ? 'not-allowed' : 'pointer',
                boxShadow: loading || !title.trim() ? 'none' : '0 0 20px rgba(99,102,241,0.35)',
              }}
            >
              {loading && <Spinner size={15} />}
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
  const [openingId, setOpeningId] = useState(null); // which project is being launched

  // Fetch projects on mount
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

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Called when a new project is created via the modal
  const handleProjectCreated = (project) => {
    setShowModal(false);
    setProjects((prev) => [project, ...prev]);
  };

  // Called when user clicks "Open" on a project card
  const handleOpen = async (project) => {
    setOpeningId(project._id);
    await onLaunch(project._id); // parent handles startSandbox + state
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

      <div className="flex h-full w-full overflow-hidden">
        {/* ── Left pane: hero ── */}
        <div
          className="hidden md:flex flex-col items-center justify-center flex-1 px-12 relative overflow-hidden"
          style={{ borderRight: '1px solid var(--border-subtle)' }}
        >
          {/* Blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle,#6366f1,transparent)', filter: 'blur(80px)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
              style={{ background: 'radial-gradient(circle,#818cf8,transparent)', filter: 'blur(100px)' }} />
            {/* Grid */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'linear-gradient(var(--border-subtle) 1px,transparent 1px),linear-gradient(90deg,var(--border-subtle) 1px,transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-lg animate-fade-in">
            {/* Icon */}
            <div className="mb-8 relative">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center animate-float"
                style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="6"  y="6"  width="14" height="14" rx="3" fill="white" fillOpacity="0.9" />
                  <rect x="28" y="6"  width="14" height="14" rx="3" fill="white" fillOpacity="0.6" />
                  <rect x="6"  y="28" width="14" height="14" rx="3" fill="white" fillOpacity="0.6" />
                  <rect x="28" y="28" width="14" height="14" rx="3" fill="white" fillOpacity="0.9" />
                  <line x1="20" y1="13" x2="28" y2="13" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
                  <line x1="13" y1="20" x2="13" y2="28" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
                  <line x1="35" y1="20" x2="35" y2="28" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
                  <line x1="20" y1="35" x2="28" y2="35" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse-glow"
                style={{ background: 'var(--accent-green)', boxShadow: '0 0 12px var(--accent-green)' }} />
            </div>

            <h1
              className="text-6xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg,#fff 30%,#818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1.5px',
              }}
            >
              ForgeBox
            </h1>
            <p className="text-lg mb-2" style={{ color: 'var(--text-accent)' }}>AI-Powered Sandbox IDE</p>
            <p className="text-base mb-10 max-w-md" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              Spin up isolated sandbox environments, chat with AI to generate frontends,
              and preview your changes instantly — all in one place.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 justify-center">
              {['AI Code Generation', 'Live Preview', 'Integrated Terminal', 'File Explorer'].map((f) => (
                <span key={f} className="px-4 py-1.5 rounded-full text-sm"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--text-accent)' }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right pane: projects ── */}
        <div
          className="flex flex-col w-full md:w-96 shrink-0"
          style={{ background: 'var(--bg-secondary)' }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                My Projects
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </p>
            </div>

            <button
              id="new-project-btn"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg,#6366f1,#818cf8)',
                color: 'white',
                boxShadow: '0 0 18px rgba(99,102,241,0.35)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,0.55)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 18px rgba(99,102,241,0.35)')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Project
            </button>
          </div>

          {/* Project list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {loadingProjects ? (
              /* Skeleton */
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-2xl" />
              ))
            ) : fetchError ? (
              <div
                className="flex flex-col items-center justify-center gap-3 py-12 text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm">{fetchError}</p>
                <button
                  onClick={loadProjects}
                  className="text-xs px-4 py-2 rounded-lg transition-colors"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-accent)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                >
                  Retry
                </button>
              </div>
            ) : projects.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-4 py-16 text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px dashed rgba(99,102,241,0.3)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>No projects yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Create your first project to get started</p>
                </div>
                <button
                  id="create-first-project-btn"
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(135deg,#6366f1,#818cf8)',
                    color: 'white',
                    boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
