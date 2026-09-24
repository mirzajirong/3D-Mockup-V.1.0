import React, { useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface StudioSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  unit?: string;
}

export const StudioSlider: React.FC<StudioSliderProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  unit = '',
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="flex items-center gap-2 w-full select-none">
      {/* Slider Track with integrated label and white capsule thumb */}
      <div className="relative flex-1 h-8 bg-[#141414] hover:bg-[#181818] border border-white/10 rounded-[4px] flex items-center px-3 overflow-hidden transition-colors cursor-pointer group">
        {/* Label inside track on the left */}
        <span className="text-xs text-[#888888] group-hover:text-[#CCCCCC] font-medium tracking-tight pointer-events-none z-10 truncate max-w-[65%]">
          {label}
        </span>

        {/* Capsule thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-[#FFFFFF] rounded-full pointer-events-none transition-all duration-75"
          style={{
            left: `calc(${percentage}% * 0.92 + 4px)`,
          }}
        />

        {/* Native range input overlay for seamless drag/touch */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
        />
      </div>

      {/* Numeric value readout box on right */}
      <div className="w-11 h-8 bg-[#141414] border border-white/10 rounded-[4px] flex items-center justify-center text-xs font-mono font-medium text-[#FFFFFF] shrink-0 select-none">
        {value}
        {unit}
      </div>
    </div>
  );
};

interface StudioSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}

export const StudioSelect: React.FC<StudioSelectProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full select-none">
      <label className="text-[11px] font-bold text-[#888888] tracking-wider uppercase font-sora">
        {label}
      </label>
      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-8 bg-[#141414] hover:bg-[#181818] border border-white/10 hover:border-white/15 focus:border-[#DB0B2B] rounded-[4px] px-3 pr-8 text-xs text-[#FFFFFF] appearance-none outline-none cursor-pointer transition-colors font-medium"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#181818] text-[#FFFFFF]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888] pointer-events-none" />
      </div>
    </div>
  );
};
