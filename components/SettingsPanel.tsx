'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    deviceIp: string;
    inputLabels: string[];
    outputLabels: string[];
    selectionTimeoutSeconds?: number;
    connectionView?: string;
    themeMode?: string;
    themeName?: string;
  };
  onUpdateConfig: (updates: Partial<SettingsPanelProps['config']>) => void;
  showDebug: boolean;
  onToggleDebug: (show: boolean) => void;
}

export function SettingsPanel({ isOpen, onClose, config, onUpdateConfig, showDebug, onToggleDebug }: SettingsPanelProps) {
  const [deviceIp, setDeviceIp] = useState(config.deviceIp);
  const [inputLabels, setInputLabels] = useState(config.inputLabels);
  const [outputLabels, setOutputLabels] = useState(config.outputLabels);
  const [selectionTimeout, setSelectionTimeout] = useState(config.selectionTimeoutSeconds || 5);
  const [connectionView, setConnectionView] = useState(config.connectionView || 'both');
  const [themeMode, setThemeMode] = useState(config.themeMode || 'system');
  const [themeName, setThemeName] = useState(config.themeName || 'vercel');

  const handleSave = () => {
    onUpdateConfig({
      deviceIp,
      inputLabels,
      outputLabels,
      selectionTimeoutSeconds: selectionTimeout,
      connectionView,
      themeMode,
      themeName,
    });
    onClose();
  };

  const updateInputLabel = (index: number, value: string) => {
    const newLabels = [...inputLabels];
    newLabels[index] = value;
    setInputLabels(newLabels);
  };

  const updateOutputLabel = (index: number, value: string) => {
    const newLabels = [...outputLabels];
    newLabels[index] = value;
    setOutputLabels(newLabels);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Settings</h2>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="px-4 py-2 bg-settings-button-primary hover:bg-settings-button-primary-hover rounded-lg font-semibold transition-colors"
                  >
                    Save
                  </motion.button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    aria-label="Close settings"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Device IP */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-settings-label">
                  Device IP Address
                </label>
                <input
                  type="text"
                  value={deviceIp}
                  onChange={(e) => setDeviceIp(e.target.value)}
                  className="w-full px-3 py-2 bg-ui-input-bg rounded-lg border border-ui-input-border focus:border-settings-button-primary focus:outline-none"
                  placeholder="192.168.1.222"
                />
              </div>

              {/* Connection View */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-settings-label">
                  Connection View
                </label>
                <select
                  value={connectionView}
                  onChange={(e) => setConnectionView(e.target.value)}
                  className="w-full px-3 py-2 bg-ui-input-bg rounded-lg border border-ui-input-border focus:border-settings-button-primary focus:outline-none text-foreground"
                >
                  <option value="both">Sources and Displays</option>
                  <option value="input">Sources</option>
                  <option value="output">Displays</option>
                </select>
                <p className="text-xs text-settings-text-muted mt-2">
                  <strong>Sources and Displays:</strong> Show both side-by-side with drag-and-drop<br />
                  <strong>Sources:</strong> Show only sources with display toggles<br />
                  <strong>Displays:</strong> Show only displays with source selection
                </p>
              </div>

              {/* Theme Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-settings-label">
                  Theme
                </label>
                <select
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className="w-full px-3 py-2 bg-card rounded-lg border border-border focus:border-primary focus:outline-none text-foreground"
                >
                  <option value="vercel">Vercel</option>
                  <option value="tangerine">Tangerine</option>
                  <option value="claymorphism">Claymorphism</option>
                  <option value="midnight-bloom">Midnight Bloom</option>
                  <option value="fastpitch">Fastpitch Studio</option>
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  Choose a color theme for the interface
                </p>
              </div>

              {/* Theme Mode */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-settings-label">
                  Mode
                </label>
                <select
                  value={themeMode}
                  onChange={(e) => setThemeMode(e.target.value)}
                  className="w-full px-3 py-2 bg-card rounded-lg border border-border focus:border-primary focus:outline-none text-foreground"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>System:</strong> Follow system preference<br />
                  <strong>Light:</strong> Always use light mode<br />
                  <strong>Dark:</strong> Always use dark mode
                </p>
              </div>

              {/* Input Labels */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-settings-label">Input Labels</h3>
                <div className="space-y-2">
                  {inputLabels.map((label, index) => (
                    <div key={`input-label-${index}`} className="flex items-center gap-2">
                      <span className="text-sm text-settings-text-muted w-16">IN {index + 1}</span>
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => updateInputLabel(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-ui-input-bg rounded-lg border border-ui-input-border focus:border-settings-button-primary focus:outline-none text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Output Labels */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-settings-label">Output Labels</h3>
                <div className="space-y-2">
                  {outputLabels.map((label, index) => (
                    <div key={`output-label-${index}`} className="flex items-center gap-2">
                      <span className="text-sm text-settings-text-muted w-16">OUT {index + 1}</span>
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => updateOutputLabel(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-ui-input-bg rounded-lg border border-ui-input-border focus:border-output-primary-light focus:outline-none text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Selection Timeout */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-settings-label">
                  Selection Timeout (seconds)
                </label>
                <p className="text-xs text-settings-text-muted mb-2">
                  Keep selection active after routing to enable multiple connections
                </p>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={selectionTimeout}
                  onChange={(e) => setSelectionTimeout(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 bg-ui-input-bg rounded-lg border border-ui-input-border focus:border-settings-button-primary focus:outline-none"
                />
              </div>

              {/* Debug Toggle */}
              <div className="mb-6">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-settings-label">Show Debug Panel</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showDebug}
                      onChange={(e) => onToggleDebug(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        showDebug ? 'bg-settings-button-primary' : 'bg-ui-input-border'
                      }`}
                    >
                      <div
                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          showDebug ? 'transform translate-x-5' : ''
                        }`}
                      />
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
