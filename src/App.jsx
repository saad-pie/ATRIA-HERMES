import React, { useState, useEffect } from 'react';

export default function HermesAgentUI() {
  const [prompt, setPrompt] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const triggerWorkflow = async (actionType) => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
    setLogs([]);
    setIsProcessing(true);

    await fetch('/api/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType, prompt, sessionId: newSessionId }),
    });
  };

  // Poll Vercel Endpoint for live logs streaming from GitHub Actions
  useEffect(() => {
    if (!sessionId || !isProcessing) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/stream?session_id=${sessionId}`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        const lastLog = data.logs[data.logs.length - 1];
        if (lastLog?.type === 'finish' || lastLog?.type === 'complete') {
          setIsProcessing(false);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, isProcessing]);

  return (
    <div style={{ background: '#0d1117', color: '#c9d1d9', minHeight: '100vh', padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Hermes Agent - Atria Dawn Preview Live Execution</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => triggerWorkflow('init')} style={{ marginRight: '10px', padding: '10px 15px' }}>
          Initialize Agent
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <textarea
          rows={3}
          cols={60}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter task for Hermes agent..."
          style={{ background: '#161b22', color: '#fff', border: '1px solid #30363d', padding: '10px' }}
        />
        <br />
        <button onClick={() => triggerWorkflow('ask')} disabled={isProcessing} style={{ padding: '10px 15px', marginTop: '5px' }}>
          {isProcessing ? 'Agent Executing...' : 'Run Ask Task'}
        </button>
      </div>

      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '1rem', minHeight: '300px' }}>
        <h3>Live Agent Trace</h3>
        {logs.map((log, idx) => (
          <div key={idx} style={{ marginBottom: '8px' }}>
            {log.status && <span style={{ color: '#58a6ff' }}>⚡ [STATUS]: {log.status}</span>}
            {log.output && (
              <pre style={{ background: '#0d1117', padding: '10px', borderRadius: '4px', color: '#7ee787' }}>
                {log.output}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
          }
