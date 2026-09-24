import React, { useRef, useState, useCallback, useEffect } from 'react';

interface ScrubSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
  suffix?: string;
  unit?: string;
  useComma?: boolean;
  onChange: (value: number) => void;
  className?: string;
  id?: string;
}

export const ScrubSlider: React.FC<ScrubSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 0.01,
  decimals = 2,
  suffix = '',
  unit = '',
  useComma = true,
  onChange,
  className = '',
  id,
}) => {
  const displaySuffix = suffix || unit;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Clamp value between min and max
  const clampedValue = Math.min(max, Math.max(min, value));

  // Compute percentage (0 to 1)
  const range = max - min;
  const percentage = range > 0 ? (clampedValue - min) / range : 0;
  const clampedPct = Math.min(1, Math.max(0, percentage));

  // Format value display (e.g., 0,11 or 1,00 as shown in image.png)
  const formatValue = (val: number) => {
    const formatted = val.toFixed(decimals);
    return useComma ? formatted.replace('.', ',') : formatted;
  };

  const updateValueFromPointer = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const rawPct = Math.min(1, Math.max(0, clickX / rect.width));
      const rawValue = min + rawPct * (max - min);

      // Quantize to step
      const stepped = Math.round((rawValue - min) / step) * step + min;
      const finalVal = Math.min(max, Math.max(min, parseFloat(stepped.toFixed(decimals))));
      onChange(finalVal);
    },
    [min, max, step, decimals, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    containerRef.current?.setPointerCapture(e.pointerId);
    updateValueFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateValueFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        containerRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture already released
      }
    }
  };

  return (
    <div
      ref={containerRef}
      id={id}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative h-9 px-3 flex items-center justify-between rounded-[4px] bg-[#181818] hover:bg-[#1E1E1E] border transition-colors select-none cursor-ew-resize overflow-hidden touch-none group ${
        isDragging ? 'border-[#DB0B2B]' : 'border-white/10 hover:border-white/15'
      } ${className}`}
    >
      {/* Background progress track indicator */}
      <div
        className="absolute inset-y-0 left-0 bg-white/[0.05] pointer-events-none transition-all"
        style={{ width: `${clampedPct * 100}%` }}
      />

      {/* Vertical scrubber bar handle */}
      <div
        className={`absolute top-1.5 bottom-1.5 w-[3px] rounded-[1px] pointer-events-none transition-transform ${
          isDragging ? 'bg-[#DB0B2B]' : 'bg-[#FFFFFF]'
        }`}
        style={{
          left: `calc(${clampedPct * 100}% - 1.5px)`,
        }}
      />

      {/* Label on left */}
      <span className="text-[11px] font-medium text-[#CCCCCC] tracking-tight pointer-events-none relative z-10">
        {label}
      </span>

      {/* Value on right */}
      <span className="font-mono text-[11px] text-[#FFFFFF] tracking-wider pointer-events-none relative z-10">
        {formatValue(clampedValue)}
        {displaySuffix}
      </span>
    </div>
  );
};
