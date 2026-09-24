import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  id,
  label,
  disabled = false,
  size = 'md',
}) => {
  const isSm = size === 'sm';

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group relative inline-flex shrink-0 items-center cursor-pointer rounded-full transition-all duration-200 ease-in-out focus:outline-hidden select-none ${
        isSm ? 'h-5 w-9' : 'h-6 w-11'
      } ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${
        checked
          ? 'bg-[#DB0B2B] hover:bg-[#F01436] active:bg-[#B00820]'
          : 'bg-[#181818] border border-white/15 hover:border-white/20'
      }`}
      title={label || (checked ? 'Turn OFF' : 'Turn ON')}
    >
      <span className="sr-only">{label || 'Toggle switch'}</span>

      {/* Sliding Knob */}
      <span
        className={`pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
          isSm ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'
        } ${
          checked
            ? isSm
              ? 'translate-x-4.5'
              : 'translate-x-5.5'
            : 'translate-x-0.5'
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;
