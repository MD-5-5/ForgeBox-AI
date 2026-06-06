import React from 'react';

export default function LandingScreen({ onStart, isCreating }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)', filter: 'blur(100px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #4f46e5, transparent)', filter: 'blur(120px)' }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-8 animate-fade-in">
        {/* Logo / Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center animate-float"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              boxShadow: '0 0 40px rgba(99,102,241,0.5)'
            }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="14" height="14" rx="3" fill="white" fillOpacity="0.9" />
              <rect x="28" y="6" width="14" height="14" rx="3" fill="white" fillOpacity="0.6" />
              <rect x="6" y="28" width="14" height="14" rx="3" fill="white" fillOpacity="0.6" />
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

        {/* Title */}
        <h1 className="text-6xl font-bold mb-4" style={{
          background: 'linear-gradient(135deg, #fff 30%, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1.5px'
        }}>
          ForgeBox
        </h1>
        <p className="text-lg mb-2" style={{ color: 'var(--text-accent)' }}>
          AI-Powered Sandbox IDE
        </p>
        <p className="text-base mb-10 max-w-md" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          Spin up an isolated sandbox environment, chat with AI to generate frontends, 
          and preview your changes instantly — all in one place.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {['AI Code Generation', 'Live Preview', 'Integrated Terminal', 'File Explorer'].map((f) => (
            <span key={f} className="px-4 py-1.5 rounded-full text-sm"
              style={{
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: 'var(--text-accent)'
              }}>
              {f}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          id="start-sandbox-btn"
          onClick={onStart}
          disabled={isCreating}
          className="relative group px-10 py-4 rounded-2xl text-lg font-semibold cursor-pointer disabled:cursor-not-allowed transition-all duration-300"
          style={{
            background: isCreating
              ? 'rgba(99,102,241,0.3)'
              : 'linear-gradient(135deg, #6366f1, #818cf8)',
            color: 'white',
            boxShadow: isCreating ? 'none' : '0 0 30px rgba(99,102,241,0.4)',
            transform: isCreating ? 'none' : undefined
          }}
          onMouseEnter={e => {
            if (!isCreating) {
              e.target.style.boxShadow = '0 0 50px rgba(99,102,241,0.7)';
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
            }
          }}
          onMouseLeave={e => {
            e.target.style.boxShadow = '0 0 30px rgba(99,102,241,0.4)';
            e.target.style.transform = 'none';
          }}
        >
          {isCreating ? (
            <span className="flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin-slow inline-block" />
              Creating Sandbox...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start Sandbox
            </span>
          )}
        </button>

        {/* Bottom note */}
        {isCreating && (
          <p className="mt-6 text-sm animate-fade-in" style={{ color: 'var(--text-muted)' }}>
            Provisioning your isolated environment...
          </p>
        )}
      </div>
    </div>
  );
}
