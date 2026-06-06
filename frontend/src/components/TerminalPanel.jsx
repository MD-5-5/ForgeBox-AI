import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { io } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';

export default function TerminalPanel({ sandboxId }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sandboxId || !containerRef.current) return;

    // Create terminal
    const term = new Terminal({
      theme: {
        background: '#080c17',
        foreground: '#e2e8f0',
        cursor: '#818cf8',
        cursorAccent: '#080c17',
        selectionBackground: 'rgba(99,102,241,0.3)',
        black: '#1e293b',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#fbbf24',
        blue: '#818cf8',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#e2e8f0',
        brightBlack: '#475569',
        brightRed: '#fca5a5',
        brightGreen: '#86efac',
        brightYellow: '#fde68a',
        brightBlue: '#a5b4fc',
        brightMagenta: '#d8b4fe',
        brightCyan: '#67e8f9',
        brightWhite: '#f8fafc',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 5000,
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);
    fitAddon.fit();
    termRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;34m┌─────────────────────────────────────────┐\x1b[0m');
    term.writeln('\x1b[1;34m│      ForgeBox Sandbox Terminal           │\x1b[0m');
    term.writeln('\x1b[1;34m└─────────────────────────────────────────┘\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[33mConnecting to sandbox...\x1b[0m');

    // Connect Socket.io
    const socketUrl = `http://${sandboxId}.agent.localhost`;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      term.writeln('\x1b[32m✓ Connected to sandbox terminal\x1b[0m');
      term.writeln('');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      term.writeln('');
      term.writeln('\x1b[33m⚠ Disconnected from terminal\x1b[0m');
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      term.writeln(`\x1b[31m✗ Connection error: ${err.message}\x1b[0m`);
    });

    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    // Send user input to socket
    term.onData((data) => {
      socket.emit('terminal-input', data);
    });

    // Resize handler
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch (_) {}
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      socket.disconnect();
      term.dispose();
      socketRef.current = null;
      termRef.current = null;
    };
  }, [sandboxId]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', height: '40px' }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: connected ? 'var(--accent-green)' : error ? 'var(--accent-red)' : 'var(--accent-amber)',
            boxShadow: connected ? '0 0 6px var(--accent-green)' : 'none',
          }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Terminal</span>
        {connected && (
          <span className="ml-2 text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>
            {sandboxId?.substring(0, 8)}...agent.localhost
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {error && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </span>
          )}
          <div className="text-xs px-2 py-0.5 rounded font-mono"
            style={{
              background: connected ? 'rgba(16,185,129,0.1)' : 'rgba(71,85,105,0.2)',
              color: connected ? 'var(--accent-green)' : 'var(--text-muted)',
              border: `1px solid ${connected ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)'}`,
            }}>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Terminal Container */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#080c17' }}>
        {!sandboxId ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{ color: 'var(--text-muted)' }}>
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Start a sandbox to open terminal</p>
          </div>
        ) : (
          <div ref={containerRef} className="absolute inset-0" style={{ padding: '8px' }} />
        )}
      </div>
    </div>
  );
}
