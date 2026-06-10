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
        background: '#08080f',
        foreground: '#e6e3f8',
        cursor: '#7C3AED',
        cursorAccent: '#08080f',
        selectionBackground: 'rgba(124,58,237,0.25)',
        black: '#141428',
        red: '#f87171',
        green: '#34d399',
        yellow: '#fbbf24',
        blue: '#818cf8',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#e6e3f8',
        brightBlack: '#3a3a5a',
        brightRed: '#fca5a5',
        brightGreen: '#6ee7b7',
        brightYellow: '#fde68a',
        brightBlue: '#a5b4fc',
        brightMagenta: '#d8b4fe',
        brightCyan: '#67e8f9',
        brightWhite: '#f1f0ff',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 12,
      lineHeight: 1.6,
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
      {/* Panel Header — hidden: shown by TabBar above */}
      <div
        style={{
          display: 'none',
        }}
      />

      {/* Terminal Container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#08080f' }}>
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
