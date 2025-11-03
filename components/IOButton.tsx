'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface IOButtonProps {
  number: number;
  label: string;
  type: 'input' | 'output';
  isSelected: boolean;
  isActive: boolean;
  isHighlighted?: boolean; // Highlighted as part of a connection
  onSelect: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrop?: () => void;
  currentInput?: number; // For outputs: which input is currently routed here
  currentInputLabel?: string; // Custom label for the current input
  connectedOutputs?: number[]; // For inputs: array of output numbers (1-8) that are connected
  allInputLabels?: string[]; // All 8 input labels for display
  allOutputLabels?: string[]; // All 8 output labels for display
  justConnectedSlots?: number[]; // Slot numbers that were just connected (for animation)
}

export function IOButton({
  number,
  label,
  type,
  isSelected,
  isActive,
  isHighlighted,
  onSelect,
  onDragStart,
  onDragEnd,
  onDrop,
  currentInput,
  currentInputLabel,
  connectedOutputs,
  allInputLabels,
  allOutputLabels,
  justConnectedSlots = [],
}: IOButtonProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'link';
    e.dataTransfer.setData('text/plain', `${type}-${number}`);
    onDragStart?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'link';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    onDrop?.();
  };

  const hasConnection = type === 'output' ? !!currentInputLabel : (connectedOutputs && connectedOutputs.length > 0);

  const bgColor = isSelected
    ? type === 'input'
      ? 'bg-blue-500/30'
      : 'bg-green-500/30'
    : isHighlighted
    ? type === 'input'
      ? 'bg-blue-500/20'
      : 'bg-green-500/20'
    : 'bg-gray-800/50';

  const borderColor = isDraggingOver
    ? 'border-yellow-400 border-2'
    : isSelected
    ? type === 'input'
      ? 'border-blue-400 border-2'
      : 'border-green-400 border-2'
    : isHighlighted
    ? type === 'input'
      ? 'border-blue-400/70 border-2'
      : 'border-green-400/70 border-2'
    : hasConnection
    ? 'border-gray-600'
    : 'border-gray-700/50';

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onSelect}
      className={`${bgColor} ${borderColor} backdrop-blur-sm border rounded-lg transition-all touch-manipulation select-none flex flex-row cursor-pointer relative overflow-hidden h-full`}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      animate={{
        scale: isSelected ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Pulse ring effect when selected */}
      {isSelected && (
        <motion.div
          className={`absolute inset-0 rounded-lg pointer-events-none ${
            type === 'input' ? 'border-[3px] border-blue-400' : 'border-[3px] border-green-400'
          }`}
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [1, 0.4, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      {/* Vertical label on the left side (bottom to top) */}
      <div className="flex items-center justify-center py-1 px-1 min-w-[24px] border-r border-gray-700/50">
        <div
          className="text-xs font-semibold whitespace-nowrap"
          style={{ writingMode: 'vertical-lr', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
        >
          {label}
        </div>
      </div>

      {/* Right side: fixed badge grid (2 rows x 4 columns) */}
      <div className="flex-1 p-1 flex flex-col gap-1 justify-center">
        {/* Row 1: Slots 1-4 */}
        <div className="grid grid-cols-4 gap-1 flex-1">
          {[1, 2, 3, 4].map((slotNum) => {
            const isActive = type === 'output'
              ? currentInput === slotNum
              : connectedOutputs?.includes(slotNum);

            // Get the label for this slot
            const slotLabel = type === 'output'
              ? (allInputLabels && allInputLabels[slotNum - 1])
              : (allOutputLabels && allOutputLabels[slotNum - 1]);

            const wasJustConnected = justConnectedSlots.includes(slotNum);

            return (
              <motion.div
                key={slotNum}
                className={`px-1 py-1 rounded text-[10px] font-bold text-center transition-all truncate flex items-center justify-center ${
                  isActive
                    ? type === 'input'
                      ? 'bg-green-500/40 border border-green-400/70 text-green-100'
                      : 'bg-blue-500/40 border border-blue-400/70 text-blue-100'
                    : 'bg-gray-700/30 border border-gray-600/40 text-gray-600'
                }`}
                title={slotLabel || `${slotNum}`}
                animate={wasJustConnected ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, -5, 5, 0],
                } : {}}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                }}
              >
                {slotLabel || slotNum}
              </motion.div>
            );
          })}
        </div>

        {/* Row 2: Slots 5-8 */}
        <div className="grid grid-cols-4 gap-1 flex-1">
          {[5, 6, 7, 8].map((slotNum) => {
            const isActive = type === 'output'
              ? currentInput === slotNum
              : connectedOutputs?.includes(slotNum);

            // Get the label for this slot
            const slotLabel = type === 'output'
              ? (allInputLabels && allInputLabels[slotNum - 1])
              : (allOutputLabels && allOutputLabels[slotNum - 1]);

            const wasJustConnected = justConnectedSlots.includes(slotNum);

            return (
              <motion.div
                key={slotNum}
                className={`px-1 py-1 rounded text-[10px] font-bold text-center transition-all truncate flex items-center justify-center ${
                  isActive
                    ? type === 'input'
                      ? 'bg-green-500/40 border border-green-400/70 text-green-100'
                      : 'bg-blue-500/40 border border-blue-400/70 text-blue-100'
                    : 'bg-gray-700/30 border border-gray-600/40 text-gray-600'
                }`}
                title={slotLabel || `${slotNum}`}
                animate={wasJustConnected ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, -5, 5, 0],
                } : {}}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                }}
              >
                {slotLabel || slotNum}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
