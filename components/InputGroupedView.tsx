'use client';

import { motion } from 'framer-motion';
import { MatrixStatus } from '@/lib/matrixApi';

interface InputGroupedViewProps {
  inputLabels: string[];
  outputLabels: string[];
  matrixStatus: MatrixStatus;
  onToggleOutput: (inputNum: number, outputNum: number) => void;
}

export function InputGroupedView({
  inputLabels,
  outputLabels,
  matrixStatus,
  onToggleOutput,
}: InputGroupedViewProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1.5 shrink-0 [@media(max-height:768px)]:mb-1">
        <svg className="w-4 h-4 text-input-primary-light" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 6v8a2 2 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
        <span className="text-sm font-semibold text-input-primary-light uppercase tracking-wide">Sources</span>
      </div>

      {/* Input Buttons Grid */}
      <div className="grid grid-cols-1 gap-2.5 flex-1 auto-rows-fr max-h-full [@media(max-height:768px)]:gap-1.5 [@media(max-height:600px)]:gap-1" style={{ gridAutoRows: 'minmax(0, 80px)' }}>
        {inputLabels.map((label, index) => {
          const inputNum = index + 1;
          // Find all output numbers connected to this input
          const connectedOutputNums = matrixStatus.outputs
            .map((inputForOutput, outputIndex) =>
              inputForOutput === inputNum ? outputIndex + 1 : null
            )
            .filter((num): num is number => num !== null);

          return (
            <motion.div
              key={`input-${inputNum}`}
              className="bg-ui-card-bg backdrop-blur-sm border border-ui-card-border rounded-lg shadow-md flex flex-row h-full overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Vertical label on the left side (bottom to top) */}
              <div className="flex items-center justify-center py-1 px-2 min-w-[32px] border-r border-ui-card-border bg-accent">
                <div
                  className="text-xs font-semibold whitespace-nowrap text-accent-foreground"
                  style={{ writingMode: 'vertical-lr', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
                >
                  {label}
                </div>
              </div>

              {/* Right side: clickable output toggles (2 rows x 4 columns) */}
              <div className="flex-1 p-1 flex flex-col gap-1 justify-center">
                {/* Row 1: Outputs 1-4 */}
                <div className="grid grid-cols-4 gap-1 flex-1">
                  {[1, 2, 3, 4].map((outputNum) => {
                    const isConnected = connectedOutputNums.includes(outputNum);
                    const outputLabel = outputLabels[outputNum - 1];

                    return (
                      <motion.button
                        key={outputNum}
                        onClick={() => onToggleOutput(inputNum, outputNum)}
                        className={`px-1 py-1 rounded font-bold text-center transition-all truncate flex items-center justify-center cursor-pointer ${
                          isConnected
                            ? 'bg-output-bg-active border border-output-border-highlighted text-output-text-active'
                            : 'bg-ui-badge-bg-inactive border border-ui-badge-border-inactive text-ui-badge-text-inactive hover:bg-ui-badge-hover-bg hover:text-ui-badge-hover-text'
                        }`}
                        style={{ fontSize: '14px' }}
                        title={`${outputLabel} - Click to ${isConnected ? 'disconnect' : 'connect'}`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {outputLabel || outputNum}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Row 2: Outputs 5-8 */}
                <div className="grid grid-cols-4 gap-1 flex-1">
                  {[5, 6, 7, 8].map((outputNum) => {
                    const isConnected = connectedOutputNums.includes(outputNum);
                    const outputLabel = outputLabels[outputNum - 1];

                    return (
                      <motion.button
                        key={outputNum}
                        onClick={() => onToggleOutput(inputNum, outputNum)}
                        className={`px-1 py-1 rounded font-bold text-center transition-all truncate flex items-center justify-center cursor-pointer ${
                          isConnected
                            ? 'bg-output-bg-active border border-output-border-highlighted text-output-text-active'
                            : 'bg-ui-badge-bg-inactive border border-ui-badge-border-inactive text-ui-badge-text-inactive hover:bg-ui-badge-hover-bg hover:text-ui-badge-hover-text'
                        }`}
                        style={{ fontSize: '14px' }}
                        title={`${outputLabel} - Click to ${isConnected ? 'disconnect' : 'connect'}`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {outputLabel || outputNum}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
