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

  const testCommand = async () => {
    setLoading(true);
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-debug-button hover:bg-debug-button-hover text-white px-4 py-2 rounded-lg text-sm font-mono z-50"
      >
        DEBUG
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-debug-bg border border-debug-border rounded-lg p-4 w-96 max-h-96 overflow-auto z-50 font-mono text-xs"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-debug-text font-bold">Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-settings-text-muted hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-settings-text-muted block mb-1">Device IP:</label>
          <div className="text-white">{deviceIp}</div>
        </div>

        <div>
          <label className="text-settings-text-muted block mb-1">Command:</label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full bg-debug-response-bg border border-ui-input-border rounded px-2 py-1 text-white"
            placeholder="GETSWS"
          />
        </div>

        <button
          onClick={testCommand}
          disabled={loading}
          className="w-full bg-debug-button hover:bg-debug-button-hover disabled:bg-ui-input-bg text-white py-2 rounded"
        >
          {loading ? 'Testing...' : 'Test Command'}
        </button>

        {result && (
          <div className="mt-4 p-2 bg-debug-response-bg rounded overflow-auto max-h-48">
            <div className="text-debug-response-text mb-2">Response:</div>
            <pre className="text-settings-label text-xs whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-ui-badge-text-inactive text-xs mt-4">
          <div>Check terminal for detailed logs</div>
          <div>Try commands: GETSWS, SW 1 2</div>
        </div>
      </div>
    </motion.div>
  );
}
