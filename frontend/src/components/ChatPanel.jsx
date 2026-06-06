import React, { useState, useRef, useEffect } from 'react';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

function StreamMessage({ lines }) {
  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, i) => (
        <div key={i} className="stream-line flex items-start gap-2 text-xs py-0.5" style={{ color: 'var(--text-secondary)', animationDelay: `${i * 50}ms` }}>
          <span className="mt-1 flex-shrink-0" style={{ color: 'var(--accent-green)' }}>›</span>
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
}

export default function ChatPanel({ sandboxId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      type: 'text',
      content: 'Hey! I\'m your AI coding assistant. Describe what frontend you want me to build and I\'ll generate it for you in real-time.',
    }
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
    setMessages(prev => [...prev, userMsg]);
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
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const text = line.replace(/^data: /, '').trim();
          if (text) {
            accumulated.push(text);
            setStreamLines([...accumulated]);
          }
        }
      }

      // Summarise the final result
      const lastLine = accumulated[accumulated.length - 1] || 'Done!';
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        type: 'stream',
        lines: accumulated,
        summary: lastLine,
      }]);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'ai',
          type: 'error',
          content: `Error: ${err.message}`,
        }]);
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

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)' }}>
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-blue)', boxShadow: '0 0 8px var(--accent-blue)' }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>AI Assistant</span>
        {isStreaming && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full animate-pulse"
            style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--accent-blue-light)', border: '1px solid rgba(99,102,241,0.3)' }}>
            Generating...
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 scroll-y px-4 py-4 flex flex-col gap-4" style={{ overflowY: 'auto' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'ai' && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 0 10px rgba(99,102,241,0.4)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </div>
            )}
            <div className={`max-w-[85%] px-3.5 py-2.5 text-sm ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}`}
              style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {msg.type === 'text' && <p>{msg.content}</p>}
              {msg.type === 'error' && <p style={{ color: 'var(--accent-red)' }}>{msg.content}</p>}
              {msg.type === 'stream' && (
                <div>
                  <StreamMessage lines={msg.lines} />
                  <div className="mt-2 pt-2 text-xs font-medium" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--accent-green)' }}>
                    ✓ Completed
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live streaming area */}
        {isStreaming && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 0 10px rgba(99,102,241,0.4)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            </div>
            <div className="chat-msg-ai px-3.5 py-2.5 text-sm max-w-[85%]">
              {streamLines.length > 0 ? (
                <StreamMessage lines={streamLines} />
              ) : (
                <TypingIndicator />
              )}
            </div>
          </div>
        )}

        {!sandboxId && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-center px-4" style={{ color: 'var(--text-muted)' }}>
              Start a sandbox to begin chatting with the AI.
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex gap-2 rounded-xl p-2"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!sandboxId || isStreaming}
            placeholder={!sandboxId ? 'Start a sandbox to begin...' : 'Describe the frontend you want to build...'}
            rows={2}
            className="flex-1 bg-transparent resize-none text-sm outline-none"
            style={{
              color: 'var(--text-primary)',
              caretColor: 'var(--accent-blue)',
              lineHeight: '1.5'
            }}
          />
          <div className="flex flex-col gap-1.5 justify-end">
            {isStreaming ? (
              <button id="stop-stream-btn" onClick={stopStream}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              </button>
            ) : (
              <button id="send-chat-btn" onClick={sendMessage} disabled={!input.trim() || !sandboxId}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                style={{
                  background: input.trim() && sandboxId ? 'linear-gradient(135deg, #6366f1, #818cf8)' : 'var(--bg-hover)',
                  color: 'white'
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="text-xs mt-1.5 text-center" style={{ color: 'var(--text-muted)' }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
