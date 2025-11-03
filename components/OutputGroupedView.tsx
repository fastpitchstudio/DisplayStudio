'use client';

import { motion } from 'framer-motion';
import { MatrixStatus } from '@/lib/matrixApi';

interface OutputGroupedViewProps {
  inputLabels: string[];
  outputLabels: string[];
  matrixStatus: MatrixStatus;
  onSelectInput: (inputNum: number, outputNum: number) => void;
}

export function OutputGroupedView({
  inputLabels,
  outputLabels,
  matrixStatus,
  onSelectInput,
}: OutputGroupedViewProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1.5 shrink-0 [@media(max-height:768px)]:mb-1">
        <svg className="w-4 h-4 text-output-primary-light" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-semibold text-output-primary-light uppercase tracking-wide">Displays</span>
      </div>

      {/* Output Buttons Grid */}
      <div className="grid grid-cols-1 gap-2.5 flex-1 auto-rows-fr max-h-full [@media(max-height:768px)]:gap-1.5 [@media(max-height:600px)]:gap-1" style={{ gridAutoRows: 'minmax(0, 80px)' }}>
        {outputLabels.map((label, index) => {
          const outputNum = index + 1;
          const currentInputNum = matrixStatus.outputs[index];

          return (
            <motion.div
              key={`output-${outputNum}`}
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

              {/* Right side: selectable input options (2 rows x 4 columns) */}
              <div className="flex-1 p-1 flex flex-col gap-1 justify-center">
                {/* Row 1: Inputs 1-4 */}
                <div className="grid grid-cols-4 gap-1 flex-1">
                  {[1, 2, 3, 4].map((inputNum) => {
                    const isSelected = currentInputNum === inputNum;
                    const inputLabel = inputLabels[inputNum - 1];

                    return (
                      <motion.button
                        key={inputNum}
                        onClick={() => onSelectInput(inputNum, outputNum)}
                        className={`px-1 py-1 rounded font-bold text-center transition-all truncate flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-input-bg-active border border-input-border-highlighted text-input-text-active'
                            : 'bg-ui-badge-bg-inactive border border-ui-badge-border-inactive text-ui-badge-text-inactive hover:bg-ui-badge-hover-bg hover:text-ui-badge-hover-text'
                        }`}
                        style={{ fontSize: '14px' }}
                        title={`${inputLabel} - Click to route to this output`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {inputLabel || inputNum}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Row 2: Inputs 5-8 */}
                <div className="grid grid-cols-4 gap-1 flex-1">
                  {[5, 6, 7, 8].map((inputNum) => {
                    const isSelected = currentInputNum === inputNum;
                    const inputLabel = inputLabels[inputNum - 1];

                    return (
                      <motion.button
                        key={inputNum}
                        onClick={() => onSelectInput(inputNum, outputNum)}
                        className={`px-1 py-1 rounded font-bold text-center transition-all truncate flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-input-bg-active border border-input-border-highlighted text-input-text-active'
                            : 'bg-ui-badge-bg-inactive border border-ui-badge-border-inactive text-ui-badge-text-inactive hover:bg-ui-badge-hover-bg hover:text-ui-badge-hover-text'
                        }`}
                        style={{ fontSize: '14px' }}
                        title={`${inputLabel} - Click to route to this output`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {inputLabel || inputNum}
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
