'use client';

import { SimpleIOButton } from './SimpleIOButton';
import { MatrixStatus } from '@/lib/matrixApi';
import { useState } from 'react';

interface SimpleViewProps {
  inputLabels: string[];
  outputLabels: string[];
  inputColors: string[];
  matrixStatus: MatrixStatus;
  onSwitch: (inputNum: number, outputNum: number) => void;
  selectedInput: number | null;
  selectedOutput: number | null;
  highlightedInput: number | null;
  highlightedOutputs: number[];
  onInputSelect: (inputNum: number) => void;
  onOutputSelect: (outputNum: number) => void;
  onDrag: (type: 'input' | 'output', num: number) => void;
  onDrop: (type: 'input' | 'output', num: number) => void;
}

export function SimpleView({
  inputLabels,
  outputLabels,
  inputColors,
  matrixStatus,
  onSwitch,
  selectedInput,
  selectedOutput,
  highlightedInput,
  highlightedOutputs,
  onInputSelect,
  onOutputSelect,
  onDrag,
  onDrop,
}: SimpleViewProps) {
  // Track which input is currently being dragged (to show preview on outputs)
  const [draggedInputNum, setDraggedInputNum] = useState<number | null>(null);

  const getInputColor = (index: number) => inputColors[index];

  // Outputs get their color from the connected input, or gray if not connected
  const getOutputColor = (outputIndex: number) => {
    const connectedInputNum = matrixStatus.outputs[outputIndex];
    if (connectedInputNum) {
      return inputColors[connectedInputNum - 1];
    }
    return 'hsl(0, 0%, 50%)'; // Gray for unconnected outputs
  };

  const isOutputActive = (outputNum: number) => {
    return matrixStatus.outputs[outputNum - 1] === selectedInput;
  };

  const isInputActive = (inputNum: number) => {
    return matrixStatus.outputs[selectedOutput ? selectedOutput - 1 : -1] === inputNum;
  };

  // Get the color of the input being dragged (for drag-over preview)
  const getDragOverColor = () => {
    if (draggedInputNum) {
      return inputColors[draggedInputNum - 1];
    }
    return undefined;
  };

  return (
    <div className="flex flex-col gap-8 w-full h-full p-4 [@media(max-height:768px)]:gap-6 [@media(max-height:768px)]:p-3 [@media(max-height:600px)]:gap-3 [@media(max-height:600px)]:p-2">
      {/* Sources Section */}
      <div className="flex-1 flex flex-col gap-3 min-h-0 [@media(max-height:600px)]:gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <svg className="w-5 h-5 [@media(max-height:768px)]:w-4 [@media(max-height:768px)]:h-4 [@media(max-height:600px)]:w-3.5 [@media(max-height:600px)]:h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          <span className="text-lg font-semibold text-ui-text-primary uppercase tracking-wide [@media(max-height:768px)]:text-base [@media(max-height:600px)]:text-sm">Sources</span>
        </div>

        {/* Responsive grid: 8 columns on large screens, 4 columns on compact or small height */}
        <div className="grid gap-3 flex-1 auto-rows-fr [@media(max-width:1024px)]:grid-cols-4 [@media(min-width:1025px)]:grid-cols-8 [@media(max-height:768px)]:gap-2 [@media(max-height:600px)]:gap-1.5 [@media(max-height:600px)]:grid-cols-4">
          {inputLabels.map((label, index) => {
            const inputNum = index + 1;
            // Find all outputs connected to this input
            const connectedOutputs = matrixStatus.outputs
              .map((input, outIdx) => (input === inputNum ? outIdx + 1 : null))
              .filter((num): num is number => num !== null);

            return (
              <SimpleIOButton
                key={`input-${inputNum}`}
                number={inputNum}
                label={label}
                type="input"
                color={getInputColor(index)}
                isSelected={selectedInput === inputNum}
                isActive={isInputActive(inputNum)}
                isHighlighted={highlightedInput === inputNum}
                connectedTo={connectedOutputs}
                connectedLabels={connectedOutputs.map(outNum => outputLabels[outNum - 1])}
                onSelect={() => onInputSelect(inputNum)}
                onDragStart={() => {
                  setDraggedInputNum(inputNum);
                  onDrag('input', inputNum);
                }}
                onDragEnd={() => {
                  setDraggedInputNum(null);
                }}
                onDrop={() => onDrop('input', inputNum)}
              />
            );
          })}
        </div>
      </div>

      {/* Displays Section */}
      <div className="flex-1 flex flex-col gap-3 min-h-0 [@media(max-height:600px)]:gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <svg className="w-5 h-5 [@media(max-height:768px)]:w-4 [@media(max-height:768px)]:h-4 [@media(max-height:600px)]:w-3.5 [@media(max-height:600px)]:h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
          <span className="text-lg font-semibold text-ui-text-primary uppercase tracking-wide [@media(max-height:768px)]:text-base [@media(max-height:600px)]:text-sm">Displays</span>
        </div>

        {/* Responsive grid: 8 columns on large screens, 4 columns on compact or small height */}
        <div className="grid gap-3 flex-1 auto-rows-fr [@media(max-width:1024px)]:grid-cols-4 [@media(min-width:1025px)]:grid-cols-8 [@media(max-height:768px)]:gap-2 [@media(max-height:600px)]:gap-1.5 [@media(max-height:600px)]:grid-cols-4">
          {outputLabels.map((label, index) => {
            const outputNum = index + 1;
            const connectedInput = matrixStatus.outputs[index];
            const connectedInputLabel = connectedInput ? inputLabels[connectedInput - 1] : undefined;

            return (
              <SimpleIOButton
                key={`output-${outputNum}`}
                number={outputNum}
                label={label}
                type="output"
                color={getOutputColor(index)}
                isSelected={selectedOutput === outputNum}
                isActive={isOutputActive(outputNum)}
                isHighlighted={highlightedOutputs.includes(outputNum)}
                connectedTo={connectedInput ? [connectedInput] : []}
                connectedLabels={connectedInputLabel ? [connectedInputLabel] : []}
                dragOverColor={getDragOverColor()}
                onSelect={() => onOutputSelect(outputNum)}
                onDragStart={() => onDrag('output', outputNum)}
                onDragEnd={() => {}}
                onDrop={() => onDrop('output', outputNum)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
