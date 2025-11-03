'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface DebugPanelProps {
  deviceIp: string;
}

export function DebugPanel({ deviceIp }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [command, setCommand] = useState('GETSWS');
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const testCommand = async () => {
    setLoading(true);
    setCopySuccess(false);
    try {
      const response = await fetch('/api/matrix/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceIp,
          command: { COMMAND: command }
        })
      });

      const data = await response.json();
      setResult(data);
      console.log('Debug response:', data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;

    try {
      const resultText = JSON.stringify(result, null, 2);
      await navigator.clipboard.writeText(resultText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.log('Copy failed:', error);
      // Fallback for iOS/older browsers
      const textArea = document.createElement('textarea');
      textArea.value = JSON.stringify(result, null, 2);
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.log('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-mono z-50 shadow-lg"
      >
        DEBUG
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 w-96 max-h-96 overflow-auto z-50 font-mono text-xs shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-foreground font-bold">Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-muted-foreground block mb-1">Device IP:</label>
          <div className="text-foreground">{deviceIp}</div>
        </div>

        <div>
          <label className="text-muted-foreground block mb-1">Command:</label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full bg-background border border-input rounded px-2 py-1 text-foreground"
            placeholder="GETSWS"
          />
        </div>

        <button
          onClick={testCommand}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground py-2 rounded"
        >
          {loading ? 'Testing...' : 'Test Command'}
        </button>

        {result && (
          <div className="mt-4 p-2 bg-muted rounded overflow-auto max-h-48">
            <div className="flex justify-between items-center mb-2">
              <div className="text-foreground">Response:</div>
              <button
                onClick={copyToClipboard}
                className="p-1 hover:bg-accent rounded transition-colors"
                title="Copy to clipboard"
              >
                {copySuccess ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>
            </div>
            <pre className="text-foreground text-xs whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-muted-foreground text-xs mt-4">
          <div>Check terminal for detailed logs</div>
          <div>Try commands: GETSWS, SW 1 2</div>
        </div>
      </div>
    </motion.div>
  );
}
