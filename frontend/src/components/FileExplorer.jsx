import React, { useState, useEffect, useCallback } from 'react';

const FILE_ICONS = {
  jsx: { color: '#61dafb', icon: '⚛' },
  tsx: { color: '#61dafb', icon: '⚛' },
  js:  { color: '#f7df1e', icon: 'JS' },
  ts:  { color: '#3178c6', icon: 'TS' },
  css: { color: '#264de4', icon: '🎨' },
  html:{ color: '#e34f26', icon: '🌐' },
  json:{ color: '#cbcb41', icon: '{}' },
  md:  { color: '#ffffff', icon: '📝' },
  svg: { color: '#ffb13b', icon: '🖼' },
  default: { color: '#94a3b8', icon: '📄' },
};

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

function buildTree(files) {
  const root = {};
  for (const f of files) {
    const parts = f.split('/');
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]]) cur[parts[i]] = { __isDir: true, __children: {} };
      cur = cur[parts[i]].__children;
    }
    const fname = parts[parts.length - 1];
    cur[fname] = { __isDir: false, __path: f };
  }
  return root;
}

function TreeNode({ name, node, depth, onFileClick, activeFile }) {
  const [open, setOpen] = useState(depth < 2);

  if (node.__isDir) {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-1.5 py-1 px-2 rounded-md text-left transition-all group"
          style={{
            paddingLeft: `${8 + depth * 14}px`,
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0, color: 'var(--text-muted)' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ color: '#fbbf24', flexShrink: 0 }}>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-xs font-medium truncate">{name}</span>
        </button>
        {open && (
          <div>
            {Object.entries(node.__children).sort(([, a], [, b]) => {
              if (a.__isDir && !b.__isDir) return -1;
              if (!a.__isDir && b.__isDir) return 1;
              return 0;
            }).map(([childName, childNode]) => (
              <TreeNode key={childName} name={childName} node={childNode} depth={depth + 1} onFileClick={onFileClick} activeFile={activeFile} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const icon = getFileIcon(name);
  const isActive = activeFile === node.__path;

  return (
    <button
      onClick={() => onFileClick(node.__path)}
      className="w-full flex items-center gap-2 py-1 px-2 rounded-md text-left transition-all text-xs"
      style={{
        paddingLeft: `${8 + depth * 14}px`,
        background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
        color: isActive ? 'var(--accent-blue-light)' : 'var(--text-secondary)',
        borderLeft: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      <span className="text-xs flex-shrink-0 font-mono" style={{ color: icon.color, fontSize: '10px', minWidth: '16px' }}>
        {icon.icon}
      </span>
      <span className="truncate">{name}</span>
    </button>
  );
}

export default function FileExplorer({ sandboxId }) {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!sandboxId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://${sandboxId}.agent.localhost/list-files`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Failed to list files:', err);
    } finally {
      setLoading(false);
    }
  }, [sandboxId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileClick = async (path) => {
    setActiveFile(path);
    setFileContent(null);
    setContentLoading(true);
    try {
      const res = await fetch(`http://${sandboxId}.agent.localhost/read-files?files=${encodeURIComponent(path)}`);
      const data = await res.json();
      const content = data.files?.[0]?.[`/${path}`] || data.files?.[0]?.[path] || '';
      setFileContent(content);
    } catch (err) {
      setFileContent(`Error reading file: ${err.message}`);
    } finally {
      setContentLoading(false);
    }
  };

  const tree = buildTree(files);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)' }}>
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', height: '40px' }}>
        <div className="w-2 h-2 rounded-full" style={{ background: '#fbbf24' }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Explorer</span>
        <button id="refresh-files-btn" onClick={fetchFiles} disabled={!sandboxId || loading}
          className="ml-auto w-6 h-6 rounded flex items-center justify-center transition-all disabled:opacity-40"
          title="Refresh file tree"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          style={{ color: 'var(--text-muted)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={loading ? 'animate-spin-slow' : ''}>
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2"
        style={{ maxHeight: activeFile ? '45%' : '100%' }}>
        {!sandboxId ? (
          <div className="flex items-center justify-center h-20 text-xs" style={{ color: 'var(--text-muted)' }}>
            No sandbox active
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-2 px-3 py-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-5" style={{ width: `${60 + Math.random() * 30}%` }} />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No files found</div>
        ) : (
          Object.entries(tree).sort(([, a], [, b]) => {
            if (a.__isDir && !b.__isDir) return -1;
            if (!a.__isDir && b.__isDir) return 1;
            return 0;
          }).map(([name, node]) => (
            <TreeNode key={name} name={name} node={node} depth={0} onFileClick={handleFileClick} activeFile={activeFile} />
          ))
        )}
      </div>

      {/* File content viewer */}
      {activeFile && (
        <div className="flex flex-col border-t" style={{ borderColor: 'var(--border-subtle)', flex: 1, minHeight: 0 }}>
          <div className="flex items-center gap-2 px-3 py-1.5 shrink-0"
            style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="text-xs font-mono truncate" style={{ color: 'var(--text-accent)' }}>
              {activeFile.split('/').pop()}
            </span>
            <button onClick={() => { setActiveFile(null); setFileContent(null); }}
              className="ml-auto w-4 h-4 flex items-center justify-center rounded text-xs"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {contentLoading ? (
              <div className="flex items-center justify-center h-16">
                <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin-slow" />
              </div>
            ) : (
              <pre className="text-xs font-mono whitespace-pre-wrap break-all"
                style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontFamily: "'JetBrains Mono', monospace" }}>
                {fileContent}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
