'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface SimpleIOButtonProps {
  number: number;
  label: string;
  type: 'input' | 'output';
  color: string;
  isSelected: boolean;
  isActive: boolean;
  isHighlighted: boolean;
  connectedTo: number[];
  connectedLabels: string[];
  dragOverColor?: string; // Color to show when being dragged over
  onSelect: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrop?: () => void;
}

export function SimpleIOButton({
  number,
  label,
  type,
  color,
  isSelected,
  isActive,
  isHighlighted,
  connectedTo,
  connectedLabels,
  dragOverColor,
  onSelect,
  onDragStart,
  onDragEnd,
  onDrop,
}: SimpleIOButtonProps) {
  const hasConnection = connectedTo.length > 0;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [buttonHeight, setButtonHeight] = useState<number>(0);

  // Track button height for stacked pills calculation
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const updateHeight = () => {
      setButtonHeight(button.offsetHeight);
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(button);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle desktop drag and drop
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (onDrop) {
        onDrop();
      }
    };

    const handleDragStartNative = (e: DragEvent) => {
      e.stopPropagation();
      if (onDragStart) {
        onDragStart();
      }
    };

    const handleDragEndNative = (e: DragEvent) => {
      e.stopPropagation();
      setIsDragOver(false);
      if (onDragEnd) {
        onDragEnd();
      }
    };

    button.addEventListener('dragstart', handleDragStartNative);
    button.addEventListener('dragend', handleDragEndNative);
    button.addEventListener('dragenter', handleDragEnter);
    button.addEventListener('dragover', handleDragOver);
    button.addEventListener('dragleave', handleDragLeave);
    button.addEventListener('drop', handleDrop);

    return () => {
      button.removeEventListener('dragstart', handleDragStartNative);
      button.removeEventListener('dragend', handleDragEndNative);
      button.removeEventListener('dragenter', handleDragEnter);
      button.removeEventListener('dragover', handleDragOver);
      button.removeEventListener('dragleave', handleDragLeave);
      button.removeEventListener('drop', handleDrop);
    };
  }, [onDrop, onDragStart, onDragEnd]);

  // Determine background color based on state
  const getBackgroundColor = () => {
    // When being dragged over, show the source color preview
    if (isDragOver && dragOverColor) {
      return `${dragOverColor}40`; // 40% opacity preview
    }

    // Selected state: full color
    if (isSelected) return color;

    // Active state: 60% opacity
    if (isActive) return `${color}60`;

    // Highlighted state: 40% opacity
    if (isHighlighted) return `${color}40`;

    // Connected state: Full fill for both inputs and outputs
    if (hasConnection) {
      return color; // Full fill when connected
    }

    return 'transparent'; // No fill when not connected
  };

  // Determine border color
  const getBorderColor = () => {
    // When being dragged over, show the source color
    if (isDragOver && dragOverColor) {
      return dragOverColor;
    }

    if (isSelected) return color;
    if (isActive) return color;
    if (isHighlighted) return `${color}80`;
    // Always show border with the color
    return color;
  };

  // Camera icon for inputs/sources
  const CameraIcon = () => (
    <svg className="w-3 h-3 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
    </svg>
  );

  // TV icon for outputs/displays
  const TVIcon = () => (
    <svg className="w-3 h-3 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
    </svg>
  );

  // Determine if we can stack individual pills for multiple connections
  const canStackPills = () => {
    if (type !== 'input' || connectedTo.length <= 1) return false;

    // Calculate available space from 60% mark to bottom
    const availableSpace = buttonHeight * 0.4;

    // Each pill needs roughly 24px (text + padding)
    const pillHeight = 24;
    const gapBetweenPills = 4;
    const totalNeeded = (pillHeight * connectedTo.length) + (gapBetweenPills * (connectedTo.length - 1));

    return availableSpace >= totalNeeded;
  };

  return (
    <motion.button
      ref={buttonRef}
      draggable
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="relative rounded-xl transition-all duration-200 overflow-hidden min-h-[80px] [@media(max-height:768px)]:min-h-[60px] [@media(max-height:600px)]:min-h-[45px]"
      style={{
        backgroundColor: getBackgroundColor(),
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: getBorderColor(),
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={
        isSelected
          ? {
              boxShadow: [
                `0 0 0 0 ${color}40`,
                `0 0 0 8px ${color}00`,
                `0 0 0 0 ${color}40`,
              ],
            }
          : {}
      }
      transition={
        isSelected
          ? {
              boxShadow: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }
          : { duration: 0.2 }
      }
    >
      {/* Main Label - top aligned */}
      <div
        className="absolute left-0 right-0 px-4 [@media(max-height:600px)]:px-1 [@media(max-width:480px)]:px-1"
        style={{ top: '15%' }}
      >
        <div
          className="text-xl font-bold leading-tight text-center [@media(max-height:768px)]:text-base [@media(max-height:600px)]:text-xs [@media(max-width:480px)]:text-xs"
          style={{
            color: isSelected || hasConnection ? 'white' : color
          }}
        >
          {label}
        </div>
      </div>

      {/* Connection indicator pill(s) - centered */}
      {hasConnection && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-x-0 flex justify-center"
          style={{
            top: '60%',
            transform: 'translateY(-50%)'
          }}
        >
          {/* Input with single connection - show single pill */}
          {type === 'input' && connectedTo.length === 1 && (
            <div
              className="px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm whitespace-nowrap [@media(max-height:768px)]:text-[10px] [@media(max-height:600px)]:px-1.5 [@media(max-height:600px)]:py-0.5 [@media(max-width:480px)]:text-[10px] [@media(max-width:480px)]:px-1.5 [@media(max-width:480px)]:py-0.5"
              style={{
                backgroundColor: isSelected
                  ? 'rgba(0, 0, 0, 0.3)'
                  : 'rgba(255, 255, 255, 0.9)',
                color: isSelected
                  ? 'rgba(255, 255, 255, 0.95)'
                  : color,
              }}
            >
              <TVIcon />
              {connectedLabels[0] || `Display ${connectedTo[0]}`}
            </div>
          )}

          {/* Input with multiple connections - show stacked pills if space allows */}
          {type === 'input' && connectedTo.length > 1 && canStackPills() && (
            <div className="flex flex-col gap-1 items-center">
              {connectedTo.map((outputNum, idx) => (
                <div
                  key={outputNum}
                  className="px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm whitespace-nowrap [@media(max-height:768px)]:text-[10px] [@media(max-height:600px)]:px-1.5 [@media(max-height:600px)]:py-0.5 [@media(max-width:480px)]:text-[10px] [@media(max-width:480px)]:px-1.5 [@media(max-width:480px)]:py-0.5"
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(0, 0, 0, 0.3)'
                      : 'rgba(255, 255, 255, 0.9)',
                    color: isSelected
                      ? 'rgba(255, 255, 255, 0.95)'
                      : color,
                  }}
                >
                  <TVIcon />
                  {connectedLabels[idx] || `Display ${outputNum}`}
                </div>
              ))}
            </div>
          )}

          {/* Input with multiple connections - show aggregated count if no space */}
          {type === 'input' && connectedTo.length > 1 && !canStackPills() && (
            <div
              className="px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm whitespace-nowrap [@media(max-height:768px)]:text-[10px] [@media(max-height:600px)]:px-1.5 [@media(max-height:600px)]:py-0.5 [@media(max-width:480px)]:text-[10px] [@media(max-width:480px)]:px-1.5 [@media(max-width:480px)]:py-0.5"
              style={{
                backgroundColor: isSelected
                  ? 'rgba(0, 0, 0, 0.3)'
                  : 'rgba(255, 255, 255, 0.9)',
                color: isSelected
                  ? 'rgba(255, 255, 255, 0.95)'
                  : color,
              }}
            >
              <TVIcon />
              {connectedTo.length} displays
            </div>
          )}

          {/* Output - show connected source */}
          {type === 'output' && (
            <div
              className="px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm whitespace-nowrap [@media(max-height:768px)]:text-[10px] [@media(max-height:600px)]:px-1.5 [@media(max-height:600px)]:py-0.5 [@media(max-width:480px)]:text-[10px] [@media(max-width:480px)]:px-1.5 [@media(max-width:480px)]:py-0.5"
              style={{
                backgroundColor: (isSelected || hasConnection)
                  ? 'rgba(0, 0, 0, 0.3)'
                  : 'rgba(255, 255, 255, 0.9)',
                color: (isSelected || hasConnection)
                  ? 'rgba(255, 255, 255, 0.95)'
                  : color,
              }}
            >
              <CameraIcon />
              {connectedLabels[0] || `Source ${connectedTo[0]}`}
            </div>
          )}
        </motion.div>
      )}
    </motion.button>
  );
}
