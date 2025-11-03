'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

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
  isActive: _isActive,
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
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchMoved = useRef(false);
  const dragThreshold = 10; // pixels to move before considering it a drag

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

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set isDraggingOver to false if we're actually leaving the button,
    // not just entering a child element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    onDrop?.();
  };

  // Touch event handlers for iOS/iPad support
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchMoved.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

    // If moved more than threshold, consider it a drag
    if (deltaX > dragThreshold || deltaY > dragThreshold) {
      touchMoved.current = true;

      // Prevent scrolling during drag
      e.preventDefault();

      // Start drag if not already dragging
      if (!isTouchDragging) {
        setIsTouchDragging(true);
        onDragStart?.();
      }

      // Check if we're over another button
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element) {
        const dropTarget = element.closest('[data-io-button]');
        if (dropTarget && dropTarget !== e.currentTarget) {
          // We're over a valid drop target
          const targetType = dropTarget.getAttribute('data-io-type');
          const targetNumber = dropTarget.getAttribute('data-io-number');

          // Only allow dropping on opposite type
          if (targetType !== type) {
            setIsDraggingOver(false);
            // Trigger visual feedback on the target
            dropTarget.setAttribute('data-drag-over', 'true');
          }
        } else {
          // Clear any existing drag-over states
          document.querySelectorAll('[data-drag-over="true"]').forEach(el => {
            el.removeAttribute('data-drag-over');
          });
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchMoved.current && isTouchDragging) {
      // This was a drag, not a tap
      const touch = e.changedTouches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);

      if (element) {
        const dropTarget = element.closest('[data-io-button]');
        if (dropTarget && dropTarget !== e.currentTarget) {
          const targetType = dropTarget.getAttribute('data-io-type');

          // Only allow dropping on opposite type
          if (targetType !== type) {
            // Trigger drop on the target element
            const event = new Event('drop-touch', { bubbles: true });
            dropTarget.dispatchEvent(event);
            onDrop?.();
          }
        }
      }

      onDragEnd?.();
      setIsTouchDragging(false);

      // Clean up drag-over states
      document.querySelectorAll('[data-drag-over="true"]').forEach(el => {
        el.removeAttribute('data-drag-over');
      });
    } else if (!touchMoved.current) {
      // This was a tap, not a drag
      onSelect();
    }

    touchStartPos.current = null;
    touchMoved.current = false;
  };

  const handleTouchCancel = () => {
    if (isTouchDragging) {
      onDragEnd?.();
      setIsTouchDragging(false);
    }
    touchStartPos.current = null;
    touchMoved.current = false;

    // Clean up drag-over states
    document.querySelectorAll('[data-drag-over="true"]').forEach(el => {
      el.removeAttribute('data-drag-over');
    });
  };

  const hasConnection = type === 'output' ? !!currentInputLabel : (connectedOutputs && connectedOutputs.length > 0);

  const bgColor = isSelected
    ? type === 'input'
      ? 'bg-input-bg-selected'
      : 'bg-output-bg-selected'
    : isHighlighted
    ? type === 'input'
      ? 'bg-input-bg-highlighted'
      : 'bg-output-bg-highlighted'
    : 'bg-ui-card-bg';

  const borderColor = isDraggingOver
    ? 'border-yellow-400 border-[3px] shadow-lg shadow-yellow-400/50'
    : isSelected
    ? type === 'input'
      ? 'border-input-border-selected border-2'
      : 'border-output-border-selected border-2'
    : isHighlighted
    ? type === 'input'
      ? 'border-input-border-highlighted border-2'
      : 'border-output-border-highlighted border-2'
    : hasConnection
    ? 'border-ui-input-border'
    : 'border-ui-card-border';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      data-io-button
      data-io-type={type}
      data-io-number={number}
      className="h-full"
    >
      <motion.div
        className={`${bgColor} ${borderColor} backdrop-blur-sm border rounded-lg shadow-sm transition-all touch-manipulation select-none flex flex-row cursor-pointer relative overflow-hidden h-full ${
          isTouchDragging ? 'opacity-50' : ''
        }`}
        whileTap={touchMoved.current ? {} : { scale: 0.97 }}
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
            type === 'input' ? 'border-[3px] border-input-primary-light' : 'border-[3px] border-output-primary-light'
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
      <div className="flex items-center justify-center py-1 px-2 min-w-[32px] border-r border-ui-card-border bg-accent">
        <div
          className="text-xs font-semibold whitespace-nowrap text-accent-foreground"
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
                className={`px-1 py-1 rounded-md font-bold text-center transition-all truncate flex items-center justify-center ${
                  isActive
                    ? type === 'input'
                      ? 'bg-output-bg-active border border-output-border-highlighted text-output-text-active'
                      : 'bg-input-bg-active border border-input-border-highlighted text-input-text-active'
                    : 'bg-ui-badge-bg-inactive border border-ui-badge-border-inactive text-ui-badge-text-inactive'
                }`}
                style={{ fontSize: '14px' }}
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
                className={`px-1 py-1 rounded-md font-bold text-center transition-all truncate flex items-center justify-center ${
                  isActive
                    ? type === 'input'
                      ? 'bg-output-bg-active border border-output-border-highlighted text-output-text-active'
                      : 'bg-input-bg-active border border-input-border-highlighted text-input-text-active'
                    : 'bg-ui-badge-bg-inactive border border-ui-badge-border-inactive text-ui-badge-text-inactive'
                }`}
                style={{ fontSize: '14px' }}
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
    </div>
  );
}
