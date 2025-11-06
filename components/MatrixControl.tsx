'use client';

import { useState, useEffect, useCallback } from 'react';
import { IOButton } from './IOButton';
import { SettingsPanel } from './SettingsPanel';
import { DebugPanel } from './DebugPanel';
import { InputGroupedView } from './InputGroupedView';
import { OutputGroupedView } from './OutputGroupedView';
import { SimpleView } from './SimpleView';
import { createMatrixClient, MatrixStatus } from '@/lib/matrixApi';
import { motion, AnimatePresence } from 'framer-motion';

interface MatrixControlProps {
  config: {
    deviceIp: string;
    proxyTunnelUrl?: string;
    inputLabels: string[];
    outputLabels: string[];
    inputColors: string[];
    outputColors: string[];
    connectionView?: string;
    themeMode?: string;
    themeName?: string;
  };
  onUpdateConfig: (updates: Partial<MatrixControlProps['config']>) => void;
}

type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'retry';

export function MatrixControl({ config, onUpdateConfig }: MatrixControlProps) {
  const [selectedInput, setSelectedInput] = useState<number | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<number | null>(null);
  const [highlightedInput, setHighlightedInput] = useState<number | null>(null);
  const [highlightedOutputs, setHighlightedOutputs] = useState<number[]>([]);
  const [matrixStatus, setMatrixStatus] = useState<MatrixStatus>({ outputs: new Array(8).fill(1) });
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [selectionTimeoutId, setSelectionTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [justConnectedSlots, setJustConnectedSlots] = useState<{ buttonNum: number; slots: number[] } | null>(null);

  // Connection management state
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [lastSuccessfulConnection, setLastSuccessfulConnection] = useState<number>(Date.now());
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  const [showConnectingToast, setShowConnectingToast] = useState(true); // Show on initial load

  // Timeout for connecting toast - hide after 15 seconds if still showing
  useEffect(() => {
    if (!showConnectingToast) return;

    const toastTimeout = setTimeout(() => {
      if (connectionState === 'connecting' || connectionState === 'retry') {
        console.log('⏱ Connection attempt taking longer than expected');
        setShowConnectingToast(false);
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(toastTimeout);
  }, [showConnectingToast, connectionState]);

  // Connection monitoring: Check if we've been disconnected for 60 seconds
  useEffect(() => {
    const checkConnectionTimeout = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSuccess = now - lastSuccessfulConnection;

      // If we've been disconnected for 60+ seconds, mark as disconnected
      if (timeSinceLastSuccess > 60000 && connectionState !== 'disconnected') {
        console.warn('⚠ Device unreachable for 60 seconds');
        setConnectionState('disconnected');
        setRetryAttempt(0);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkConnectionTimeout);
  }, [lastSuccessfulConnection, connectionState]);

  // Auto-retry logic: When disconnected, retry every 5 minutes (3 attempts max)
  useEffect(() => {
    if (connectionState !== 'disconnected') return;

    // Only auto-retry if we haven't exceeded 3 attempts
    if (retryAttempt >= 3) {
      console.log('⚠ Max auto-retry attempts reached, waiting for manual reconnection');
      return;
    }

    const retryTimer = setTimeout(() => {
      console.log(`🔄 Auto-retry attempt ${retryAttempt + 1}/3`);
      setConnectionState('retry');
      setRetryAttempt(prev => prev + 1);

      // Trigger a connection attempt by temporarily enabling polling
      attemptReconnection();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(retryTimer);
  }, [connectionState, retryAttempt]);

  // Function to manually reconnect
  const handleManualReconnect = useCallback(() => {
    console.log('🔄 Manual reconnection requested');
    setConnectionState('connecting');
    setShowConnectingToast(true); // Show connecting toast
    setRetryAttempt(0);
    attemptReconnection();
  }, []);

  // Attempt to reconnect to the device
  const attemptReconnection = useCallback(async () => {
    const matrixClient = createMatrixClient(config.deviceIp, config.proxyTunnelUrl);
    try {
      const status = await matrixClient.getStatus();
      if (status.outputs.length > 0) {
        console.log('✓ Reconnected successfully');
        setMatrixStatus(status);
        setConnectionState('connected');
        setLastSuccessfulConnection(Date.now());
        setShowConnectingToast(false); // Hide toast on success
        setRetryAttempt(0);
      } else {
        // Empty outputs means connection failed
        setShowConnectingToast(false);
      }
    } catch (err) {
      // Silently handle reconnection failure
      setShowConnectingToast(false); // Hide toast on failure
      // Don't show error in disconnected state - just stay disconnected
      if (connectionState !== 'disconnected') {
        setConnectionState('disconnected');
      }
    }
  }, [config.deviceIp, connectionState]);

  // Poll matrix status every 5 seconds (only when connected or connecting)
  useEffect(() => {
    // Don't poll when disconnected
    if (connectionState === 'disconnected') {
      return;
    }

    const matrixClient = createMatrixClient(config.deviceIp, config.proxyTunnelUrl);

    const pollStatus = async () => {
      try {
        const status = await matrixClient.getStatus();
        // Update if we got actual SWS data (non-empty array)
        if (status.outputs.length > 0) {
          console.log('✓ Status synced:', status.outputs.join(' '));
          setMatrixStatus(status);
          setConnectionState('connected');
          setLastSuccessfulConnection(Date.now());
          setShowConnectingToast(false); // Hide toast once connected
        } else {
          // Empty outputs means connection failed
          setShowConnectingToast(false);
        }
      } catch (err) {
        // Silently handle polling failure
        setShowConnectingToast(false);
        // Don't throw error - just silently fail and let connection monitoring handle it
      }
    };

    // Initial poll
    pollStatus();
    // Poll every 5 seconds
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [config.deviceIp, connectionState]);

  const clearSelectionTimeout = useCallback(() => {
    if (selectionTimeoutId) {
      clearTimeout(selectionTimeoutId);
      setSelectionTimeoutId(null);
    }
  }, [selectionTimeoutId]);

  const startSelectionTimeout = useCallback(() => {
    clearSelectionTimeout();
    const timeoutSeconds = (config as any).selectionTimeoutSeconds || 5;
    const timeoutId = setTimeout(() => {
      setSelectedInput(null);
      setSelectedOutput(null);
      setHighlightedInput(null);
      setHighlightedOutputs([]);
    }, timeoutSeconds * 1000);
    setSelectionTimeoutId(timeoutId);
  }, [config, clearSelectionTimeout]);

  const handleSwitch = useCallback(
    async (inputNum: number, outputNum: number) => {
      // If disconnected, trigger reconnection instead of attempting switch
      if (connectionState === 'disconnected') {
        handleManualReconnect();
        return;
      }

      setIsLoading(true);
      try {
        // Find all outputs currently mapped to this input
        const currentOutputs = matrixStatus.outputs
          .map((input, index) => (input === inputNum ? index + 1 : null))
          .filter((out): out is number => out !== null);

        // Add the new output if not already in the list
        const allOutputs = currentOutputs.includes(outputNum)
          ? currentOutputs
          : [...currentOutputs, outputNum].sort((a, b) => a - b);

        console.log(`Routing Input ${inputNum} to outputs: ${allOutputs.join(', ')}`);

        const matrixClient = createMatrixClient(config.deviceIp, config.proxyTunnelUrl);
        await matrixClient.switchInputToOutputs(inputNum, allOutputs);

        // Optimistic update
        const newStatus = { ...matrixStatus };
        newStatus.outputs[outputNum - 1] = inputNum;
        setMatrixStatus(newStatus);

        // Show brief success message
        setSuccessMessage(`IN${inputNum} → OUT${outputNum}`);

        // Trigger snap-lock animation on the connected slots
        // For the output button, animate the input slot that was just connected
        // For the input button, animate the output slot that was just connected
        setJustConnectedSlots({ buttonNum: outputNum, slots: [inputNum] });
        setTimeout(() => setJustConnectedSlots(null), 500);
        setTimeout(() => setSuccessMessage(null), 1500);

        // Start timeout to clear selection after configured seconds
        startSelectionTimeout();
      } catch (err) {
        // Silently handle switch failure - connection monitoring will handle the state
        // No error message needed - the reconnection button will appear if disconnected
      } finally {
        setIsLoading(false);
      }
    },
    [config.deviceIp, matrixStatus, startSelectionTimeout, connectionState, handleManualReconnect]
  );

  const handleInputSelect = (inputNum: number) => {
    clearSelectionTimeout();

    if (selectedInput === inputNum) {
      // Deselect and clear highlights
      setSelectedInput(null);
      setHighlightedInput(null);
      setHighlightedOutputs([]);
    } else {
      // If an output is already selected, perform the switch and keep OUTPUT selected
      if (selectedOutput !== null) {
        handleSwitch(inputNum, selectedOutput);
        // Keep the output selected for additional connections
        // Don't change selectedOutput - it stays selected
        setSelectedInput(null);

        // Highlight the input we just connected
        setHighlightedInput(inputNum);
        setHighlightedOutputs([]);
      } else {
        // Just selecting an input
        setSelectedInput(inputNum);
        setSelectedOutput(null);

        // Highlight connected outputs for this input
        const connectedOutputNums = matrixStatus.outputs
          .map((input, index) => (input === inputNum ? index + 1 : null))
          .filter((out): out is number => out !== null);
        setHighlightedInput(null);
        setHighlightedOutputs(connectedOutputNums);
      }
    }
  };

  const handleOutputSelect = (outputNum: number) => {
    clearSelectionTimeout();

    if (selectedOutput === outputNum) {
      // Deselect and clear highlights
      setSelectedOutput(null);
      setHighlightedInput(null);
      setHighlightedOutputs([]);
    } else {
      // If an input is already selected, perform the switch and keep INPUT selected
      if (selectedInput !== null) {
        handleSwitch(selectedInput, outputNum);
        // Keep the input selected for additional connections
        // Explicitly maintain selectedInput and clear selectedOutput
        // Don't change selectedInput - it stays selected
        setSelectedOutput(null);

        // Update highlights to show new connection state
        const connectedOutputNums = matrixStatus.outputs
          .map((input, index) => (input === selectedInput ? index + 1 : null))
          .filter((out): out is number => out !== null);
        // Add the output we just connected if not already in list
        if (!connectedOutputNums.includes(outputNum)) {
          connectedOutputNums.push(outputNum);
        }
        setHighlightedInput(null);
        setHighlightedOutputs(connectedOutputNums);
      } else {
        // Just selecting an output
        setSelectedOutput(outputNum);
        setSelectedInput(null);

        // Highlight the connected input for this output
        const connectedInputNum = matrixStatus.outputs[outputNum - 1];
        setHighlightedInput(connectedInputNum || null);
        setHighlightedOutputs([]);
      }
    }
  };

  const handleDrag = (type: 'input' | 'output', num: number) => {
    if (type === 'input') {
      setSelectedInput(num);
      setSelectedOutput(null);
    } else {
      setSelectedOutput(num);
      setSelectedInput(null);
    }
  };

  const handleDrop = (type: 'input' | 'output', num: number) => {
    if (type === 'input' && selectedOutput) {
      handleSwitch(num, selectedOutput);
      setSelectedInput(null);
      setSelectedOutput(null);
    } else if (type === 'output' && selectedInput) {
      handleSwitch(selectedInput, num);
      setSelectedInput(null);
      setSelectedOutput(null);
    }
  };

  const isOutputActive = (outputNum: number) => {
    return matrixStatus.outputs[outputNum - 1] === selectedInput;
  };

  const isInputActive = (inputNum: number) => {
    return matrixStatus.outputs[selectedOutput ? selectedOutput - 1 : -1] === inputNum;
  };

  const handleBackgroundClick = () => {
    setSelectedInput(null);
    setSelectedOutput(null);
    setHighlightedInput(null);
    setHighlightedOutputs([]);
    clearSelectionTimeout();
  };

  // Handler for Input Grouped View - toggle output on/off for an input
  const handleToggleOutput = useCallback(
    async (inputNum: number, outputNum: number) => {
      // Check if this output is already connected to this input
      const isConnected = matrixStatus.outputs[outputNum - 1] === inputNum;

      if (isConnected) {
        // Disconnect: route this output to input 1 (or keep it disconnected)
        // For now, we'll route to input 1 as a default
        await handleSwitch(1, outputNum);
      } else {
        // Connect: route this input to this output
        await handleSwitch(inputNum, outputNum);
      }
    },
    [matrixStatus, handleSwitch]
  );

  // Handler for Output Grouped View - select which input feeds this output
  const handleSelectInputForOutput = useCallback(
    async (inputNum: number, outputNum: number) => {
      // Simply route the selected input to this output
      await handleSwitch(inputNum, outputNum);
    },
    [handleSwitch]
  );

  const connectionView = config.connectionView || 'both';

  return (
    <div
      className="h-screen w-screen flex flex-col bg-gradient-to-br from-bg-gradient-from via-bg-gradient-via to-bg-gradient-to p-2 overflow-hidden text-base [@media(max-height:768px)]:text-sm [@media(max-height:768px)]:p-1.5 [@media(max-height:600px)]:text-xs"
      onClick={handleBackgroundClick}
    >
      {/* Fixed Header */}
      <div className="flex items-center justify-end gap-2 mb-1 shrink-0 [@media(max-height:768px)]:mb-0.5" onClick={(e) => e.stopPropagation()}>
        {/* Connection Status/Reconnect Button - only show when disconnected */}
        {connectionState === 'disconnected' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleManualReconnect();
            }}
            className="p-2 bg-status-error-bg/20 hover:bg-status-error-bg/30 rounded-lg transition-colors"
            aria-label="Reconnect to device"
            title="Device disconnected - Click to reconnect"
          >
            <svg
              className="w-5 h-5 text-status-error-bg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSettings(!showSettings);
          }}
          className="p-2 hover:bg-ui-text-secondary/10 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <svg
            className="w-5 h-5 text-ui-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Floating status messages - positioned absolute so they don't affect layout */}

      {/* Connecting Toast - Simple and friendly */}
      <AnimatePresence>
        {showConnectingToast && (
          <div className="fixed top-4 left-0 right-0 z-40 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-4 py-2 bg-ui-text-secondary/20 backdrop-blur rounded-lg text-sm flex items-center gap-2 shadow-lg pointer-events-auto"
            >
              <svg
                className="animate-spin h-4 w-4 text-ui-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-ui-text-secondary">Connecting to device...</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error toast removed - connection state is handled by reconnection button */}

      <AnimatePresence>
        {successMessage && (
          <div className="fixed top-6 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="px-4 py-2 bg-status-success-bg backdrop-blur rounded-lg text-sm font-mono pointer-events-auto"
            >
              ✓ {successMessage}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area - View switches based on connectionView setting */}
      <div
        className="flex-1 flex flex-row gap-3 min-h-0 max-w-6xl mx-auto w-full relative pb-2 [@media(max-height:768px)]:gap-2 [@media(max-height:768px)]:pb-1 [@media(max-height:600px)]:gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {connectionView === 'simple' && (
          <SimpleView
            inputLabels={config.inputLabels}
            outputLabels={config.outputLabels}
            inputColors={config.inputColors}
            matrixStatus={matrixStatus}
            onSwitch={handleSwitch}
            selectedInput={selectedInput}
            selectedOutput={selectedOutput}
            highlightedInput={highlightedInput}
            highlightedOutputs={highlightedOutputs}
            onInputSelect={handleInputSelect}
            onOutputSelect={handleOutputSelect}
            onDrag={handleDrag}
            onDrop={handleDrop}
          />
        )}

        {connectionView === 'input' && (
          <InputGroupedView
            inputLabels={config.inputLabels}
            outputLabels={config.outputLabels}
            matrixStatus={matrixStatus}
            onToggleOutput={handleToggleOutput}
          />
        )}

        {connectionView === 'output' && (
          <OutputGroupedView
            inputLabels={config.inputLabels}
            outputLabels={config.outputLabels}
            matrixStatus={matrixStatus}
            onSelectInput={handleSelectInputForOutput}
          />
        )}

        {connectionView === 'both' && (
          <>
        {/* Inputs Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header with icon */}
          <div className="flex items-center gap-2 mb-1.5 shrink-0 [@media(max-height:768px)]:mb-1">
            <svg className="w-4 h-4 text-input-primary-light" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <span className="text-sm font-semibold text-input-primary-light uppercase tracking-wide">Sources</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 flex-1 auto-rows-fr max-h-full [@media(max-height:768px)]:gap-1.5 [@media(max-height:600px)]:gap-1" style={{ gridAutoRows: 'minmax(0, 80px)' }}>
            {config.inputLabels.map((label, index) => {
              const inputNum = index + 1;
              // Find all output numbers connected to this input
              const connectedOutputNums = matrixStatus.outputs
                .map((inputForOutput, outputIndex) =>
                  inputForOutput === inputNum ? outputIndex + 1 : null
                )
                .filter((num): num is number => num !== null);

              return (
                <IOButton
                  key={`input-${inputNum}`}
                  number={inputNum}
                  label={label}
                  type="input"
                  isSelected={selectedInput === inputNum}
                  isActive={isInputActive(inputNum)}
                  isHighlighted={highlightedInput === inputNum}
                  connectedOutputs={connectedOutputNums}
                  allOutputLabels={config.outputLabels}
                  onSelect={() => handleInputSelect(inputNum)}
                  onDragStart={() => handleDrag('input', inputNum)}
                  onDragEnd={() => {
                    setSelectedInput(null);
                  }}
                  onDrop={() => handleDrop('input', inputNum)}
                />
              );
            })}
          </div>
        </div>

        {/* Outputs Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header with icon */}
          <div className="flex items-center gap-2 mb-1.5 shrink-0 [@media(max-height:768px)]:mb-1">
            <svg className="w-4 h-4 text-output-primary-light" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-output-primary-light uppercase tracking-wide">Displays</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 flex-1 auto-rows-fr max-h-full [@media(max-height:768px)]:gap-1.5 [@media(max-height:600px)]:gap-1" style={{ gridAutoRows: 'minmax(0, 80px)' }}>
            {config.outputLabels.map((label, index) => {
              const outputNum = index + 1;
              const currentInputNum = matrixStatus.outputs[index];
              const currentInputLabel = currentInputNum ? config.inputLabels[currentInputNum - 1] : undefined;

              return (
                <IOButton
                  key={`output-${outputNum}`}
                  number={outputNum}
                  label={label}
                  type="output"
                  isSelected={selectedOutput === outputNum}
                  isActive={isOutputActive(outputNum)}
                  isHighlighted={highlightedOutputs.includes(outputNum)}
                  currentInput={currentInputNum}
                  currentInputLabel={currentInputLabel}
                  allInputLabels={config.inputLabels}
                  justConnectedSlots={
                    justConnectedSlots?.buttonNum === outputNum ? justConnectedSlots.slots : []
                  }
                  onSelect={() => handleOutputSelect(outputNum)}
                  onDragStart={() => handleDrag('output', outputNum)}
                  onDragEnd={() => {
                    setSelectedOutput(null);
                  }}
                  onDrop={() => handleDrop('output', outputNum)}
                />
              );
            })}
          </div>
        </div>
          </>
        )}
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onUpdateConfig={onUpdateConfig}
        showDebug={showDebug}
        onToggleDebug={setShowDebug}
      />

      {/* Debug Panel */}
      {showDebug && <DebugPanel deviceIp={config.deviceIp} />}
    </div>
  );
}
