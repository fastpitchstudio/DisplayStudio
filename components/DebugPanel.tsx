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
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-mono z-50"
      >
        DEBUG
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-gray-900 border border-purple-500 rounded-lg p-4 w-96 max-h-96 overflow-auto z-50 font-mono text-xs"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-purple-400 font-bold">Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-gray-400 block mb-1">Device IP:</label>
          <div className="text-white">{deviceIp}</div>
        </div>

        <div>
          <label className="text-gray-400 block mb-1">Command:</label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
            placeholder="GETSWS"
          />
        </div>

        <button
          onClick={testCommand}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded"
        >
          {loading ? 'Testing...' : 'Test Command'}
        </button>

        {result && (
          <div className="mt-4 p-2 bg-gray-800 rounded overflow-auto max-h-48">
            <div className="text-green-400 mb-2">Response:</div>
            <pre className="text-gray-300 text-xs whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-gray-500 text-xs mt-4">
          <div>Check terminal for detailed logs</div>
          <div>Try commands: GETSWS, SW 1 2</div>
        </div>
      </div>
    </motion.div>
  );
}
