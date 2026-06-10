import React, { useState, useRef, useEffect } from 'react';

// ── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 0' }}>
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

// ── Stream lines ─────────────────────────────────────────────────────────────
function StreamMessage({ lines }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {lines.map((line, i) => (
        <div
          key={i}
          className="stream-line font-mono"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            fontSize: 11,
            color: 'var(--text-secondary)',
            animationDelay: `${i * 30}ms`,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }}>›</span>
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main ChatPanel ────────────────────────────────────────────────────────────
export default function ChatPanel({ sandboxId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      type: 'text',
      content: "Hey! I'm your AI coding assistant. Describe what frontend you want me to build and I'll generate it for you in real-time.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamLines, setStreamLines] = useState([]);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamLines, isStreaming]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming || !sandboxId) return;

    const userMsg = { id: Date.now(), role: 'user', type: 'text', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setStreamLines([]);

    try {
      abortRef.current = new AbortController();
      const resp = await fetch('/api/ai/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim(), projectId: sandboxId }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
        for (const line of lines) {
          const text = line.replace(/^data: /, '').trim();
          if (text) {
            accumulated.push(text);
            setStreamLines([...accumulated]);
          }
        }
      }

      const lastLine = accumulated[accumulated.length - 1] || 'Done!';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          type: 'stream',
          lines: accumulated,
          summary: lastLine,
        },
      ]);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'ai',
            type: 'error',
            content: `Error: ${err.message}`,
          },
        ]);
      }
    } finally {
      setIsStreaming(false);
      setStreamLines([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopStream = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStreamLines([]);
  };

  const canSend = input.trim() && sandboxId && !isStreaming;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>

      {/* ── Panel header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 14px',
        height: 36,
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <span className={`glow-dot ${isStreaming ? '' : ''}`} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: isStreaming ? 'var(--green)' : 'var(--accent)',
          boxShadow: isStreaming
            ? '0 0 6px rgba(16,185,129,0.5)'
            : '0 0 6px rgba(124,58,237,0.5)',
          flexShrink: 0,
          animation: isStreaming ? 'liveDot 1s ease-in-out infinite' : undefined,
        }} />
        <span className="panel-label">AI Assistant</span>
        {isStreaming && (
          <span
            className="font-mono"
            style={{
              marginLeft: 'auto',
              fontSize: 9,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--green)',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 3,
              padding: '2px 6px',
            }}
          >
            Generating
          </span>
        )}
      </div>

      {/* ── Messages ── */}
      <div
        className="scroll-y"
        style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="animate-fade-in"
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}
              style={{
                maxWidth: '88%',
                padding: '8px 12px',
                fontSize: 13,
                lineHeight: 1.55,
                color: 'var(--text-primary)',
              }}
            >
              {msg.type === 'text' && <p>{msg.content}</p>}
              {msg.type === 'error' && <p style={{ color: 'var(--red)' }}>{msg.content}</p>}
              {msg.type === 'stream' && (
                <div>
                  <StreamMessage lines={msg.lines} />
                  <div
                    className="font-mono"
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: 10,
                      color: 'var(--green)',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Completed
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live streaming message */}
        {isStreaming && (
          <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div className="chat-msg-ai" style={{ padding: '8px 12px', maxWidth: '88%' }}>
              {streamLines.length > 0 ? (
                <StreamMessage lines={streamLines} />
              ) : (
                <TypingIndicator />
              )}
            </div>
          </div>
        )}

        {/* No sandbox message */}
        {!sandboxId && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <p className="font-mono" style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', letterSpacing: '0.02em' }}>
              Open a project to start chatting
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            padding: '8px 10px',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-end',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-active)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
        >
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!sandboxId || isStreaming}
            placeholder={!sandboxId ? 'Open a project first…' : 'Describe what you want to build…'}
            rows={2}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: 13,
              color: 'var(--text-primary)',
              caretColor: 'var(--accent)',
              lineHeight: 1.5,
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
            {isStreaming ? (
              <button
                id="stop-stream-btn"
                onClick={stopStream}
                style={{
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 6,
                  color: 'var(--red)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                id="send-chat-btn"
                onClick={sendMessage}
                disabled={!canSend}
                style={{
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: canSend ? 'var(--accent)' : 'var(--bg-hover)',
                  border: 'none',
                  borderRadius: 6,
                  color: 'white',
                  cursor: canSend ? 'pointer' : 'not-allowed',
                  opacity: canSend ? 1 : 0.35,
                  flexShrink: 0,
                  transition: 'background 0.15s, opacity 0.15s, filter 0.15s',
                }}
                onMouseEnter={(e) => { if (canSend) e.currentTarget.style.filter = 'brightness(1.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="font-mono" style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 5, textAlign: 'center', letterSpacing: '0.04em' }}>
          ENTER to send · SHIFT+ENTER for new line
        </p>
      </div>
    </div>
  );
}
