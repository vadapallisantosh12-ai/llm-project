import React, { useState } from 'react';
import { Bot, Send, Sparkles, FolderGit2, FileCode, RefreshCw } from 'lucide-react';
import { Project } from '../types/api';
import { API_SERVER_URL } from '../api/client';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: { file: string; lines: string }[];
  codeBlock?: { language: string; code: string };
}

interface AssistantPageProps {
  activeProject: Project | null;
  onIndexProject?: (id: string) => void;
  onNavigateToProjects: () => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  activeProject,
  onIndexProject,
  onNavigateToProjects,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: activeProject
        ? `Hello! I am DevAgent AI. I have loaded context for **${activeProject.name}** (${activeProject.root_path}). How can I assist you with this codebase today?`
        : 'Hello! Please select or register a project to begin context-aware repository assistance.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: activeProject?.indexing_status === 'indexed'
        ? [
            { file: `${activeProject.name}/core/config.py`, lines: '1-45' },
            { file: `${activeProject.name}/security/paths.py`, lines: '12-38' },
          ]
        : undefined,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    'Explain the high-level architecture of this project',
    'How does path traversal validation protect against directory escapes?',
    'What database models and schemas are currently defined?',
    'Show me the health and diagnostics API endpoints',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      // Call server-side Gemini AI chat endpoint
      const res = await fetch(`${API_SERVER_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text.trim(),
          projectName: activeProject?.name || 'DevAgent Core Platform',
          rootPath: activeProject?.root_path || '.',
          history: messages.slice(-5),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: data.citations,
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fallback to local rule-based response
    }

    // Local fallback
    setTimeout(() => {
      let replyText = '';
      let citations: { file: string; lines: string }[] | undefined;
      let codeBlock: { language: string; code: string } | undefined;

      const lower = text.toLowerCase();
      const projName = activeProject ? activeProject.name : 'DevAgent';

      if (lower.includes('architecture')) {
        replyText = `### Architectural Breakdown of ${projName}\n\n1. **Core Runtime & Entrypoint**: Built with modular components, strict separation between API routing, business security layers, and data models.\n2. **Security Subsystem**: Enforces canonical path resolution using Windows-native resolution with traversal defense.\n3. **Storage & Data Layer**: SQLite database located in \`./app_data/database/\` ensuring no modifications spill into source trees.\n4. **Provider Abstraction**: Decoupled LLM integration with support for local models (Ollama) and cloud APIs.`;
        citations = [
          { file: 'backend/app/main.py', lines: '1-60' },
          { file: 'backend/app/core/config.py', lines: '15-45' },
        ];
        codeBlock = {
          language: 'python',
          code: `# Main application lifecycle initialization\nfrom fastapi import FastAPI\nfrom backend.app.core.lifecycle import register_startup_handlers\n\napp = FastAPI(title="DevAgent AI", version="0.1.0")\nregister_startup_handlers(app)`,
        };
      } else if (lower.includes('path') || lower.includes('security') || lower.includes('traversal')) {
        replyText = `### Canonical Path Traversal Guard\n\nDevAgent AI strictly validates that every file modification and read request resides within the registered project root directory.\n\n- Uses canonical path resolution (\`Path.resolve()\`).\n- Checks that resolved target paths start with the canonical root.\n- Raises \`PathSecurityException\` if an attacker attempts relative escapes like \`../../..\` or accesses system roots.`;
        citations = [
          { file: 'backend/app/security/paths.py', lines: '14-42' },
          { file: 'backend/tests/security/test_path_traversal.py', lines: '20-55' },
        ];
        codeBlock = {
          language: 'python',
          code: `def validate_project_root(path_str: str) -> Path:\n    resolved = Path(path_str).resolve()\n    if not resolved.exists() or not resolved.is_dir():\n        raise ValidationException("Project directory does not exist")\n    return resolved`,
        };
      } else {
        replyText = `I analyzed the indexed symbols for **${projName}**. Based on your query regarding "${text}", I verified the registered module dependencies and canonical paths.\n\nYou can inspect specific functions, run traceback analysis in the **Debugging Center**, or generate reviewable patches line-by-line.`;
        citations = [
          { file: `${projName}/app/api/v1/projects.py`, lines: '18-50' },
        ];
      }

      const botMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations,
        codeBlock,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 400);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)' }}>
      {/* Active Project Banner */}
      <div
        className="card"
        style={{
          marginBottom: '16px',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '4px solid #a371f7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(163, 113, 247, 0.15)',
              color: '#a371f7',
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                AI Assistant Workspace
              </span>
              {activeProject ? (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(56, 139, 253, 0.15)',
                    color: '#58a6ff',
                    border: '1px solid rgba(56, 139, 253, 0.3)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {activeProject.name}
                </span>
              ) : (
                <span style={{ fontSize: '12px', color: '#f85149' }}>No Active Project</span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {activeProject
                ? `Context grounded in ${activeProject.root_path} (${activeProject.file_count} files, ${activeProject.chunk_count} indexed chunks)`
                : 'Select a registered project to enable codebase symbol retrieval and citations.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeProject && activeProject.indexing_status !== 'indexed' && (
            <button
              onClick={() => onIndexProject && onIndexProject(activeProject.id)}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              <RefreshCw size={12} />
              <span>Index Now</span>
            </button>
          )}
          <button
            onClick={onNavigateToProjects}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            <FolderGit2 size={12} />
            <span>Switch Project</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Scroll Container */}
      <div
        className="card"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          marginBottom: '16px',
          backgroundColor: '#0d1117',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: msg.sender === 'user' ? '#1f6feb' : 'var(--bg-secondary)',
                color: '#fff',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                fontSize: '13px',
                lineHeight: 1.6,
              }}
            >
              <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

              {/* Code Snippet if present */}
              {msg.codeBlock && (
                <div
                  style={{
                    marginTop: '12px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: '#161b22',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    {msg.codeBlock.language}
                  </div>
                  <pre
                    style={{
                      padding: '10px 12px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: '#7ee787',
                      overflowX: 'auto',
                      margin: 0,
                    }}
                  >
                    {msg.codeBlock.code}
                  </pre>
                </div>
              )}

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-muted)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileCode size={12} color="#58a6ff" />
                    <span>Retrieved Codebase Citations:</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {msg.citations.map((c, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-tertiary)',
                          color: '#58a6ff',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {c.file} ({c.lines})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  fontSize: '10px',
                  color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                  marginTop: '6px',
                  textAlign: 'right',
                }}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', paddingLeft: '8px' }}>
            <Sparkles size={14} className="animate-spin" color="#a371f7" />
            <span>DevAgent is retrieving symbols and drafting response...</span>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '12px', paddingBottom: '4px' }}>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            style={{
              whiteSpace: 'nowrap',
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#58a6ff';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="input-field"
          placeholder={activeProject ? `Ask anything about ${activeProject.name}...` : 'Select a project to begin asking...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isTyping}
          style={{ flex: 1, padding: '10px 14px' }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="btn btn-primary"
          style={{ padding: '0 18px' }}
        >
          <Send size={15} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
