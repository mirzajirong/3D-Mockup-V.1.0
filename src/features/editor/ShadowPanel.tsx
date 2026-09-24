import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { ScrubSlider } from '../../components/ui/ScrubSlider';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { ShadowType } from '../../types';

export const ShadowPanel: React.FC = () => {
  const scene = useEditorStore((s) => s.scene);
  const updateScene = useEditorStore((s) => s.updateScene);

  return (
    <div className="flex flex-col gap-3 p-4 text-[#FFFFFF] overflow-y-auto max-h-full font-geist">
      {/* 1. Shadow Toggle */}
      <div className="bg-[#141414] rounded-[4px] border border-white/10 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#FFFFFF]">3D Model Shadow</span>

          <div className="flex items-center gap-2.5">
            <span
              className={`text-[11px] font-mono uppercase tracking-wider font-semibold transition-colors select-none ${
                scene.showShadow ? 'text-[#DB0B2B]' : 'text-[#888888]'
              }`}
            >
              {scene.showShadow ? 'ON' : 'OFF'}
            </span>
            <ToggleSwitch
              id="toggle-shadow"
              label="Toggle 3D Model Shadow"
              checked={scene.showShadow}
              onChange={(val) => updateScene({ showShadow: val })}
            />
          </div>
        </div>

        {/* Sliders: Shadow Opacity & Shadow Blur */}
        {scene.showShadow && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            {/* Opacity */}
            <ScrubSlider
              id="shadow-opacity-scrub-slider"
              label="Shadow Opacity"
              value={scene.shadowOpacity}
              min={0.0}
              max={1.0}
              step={0.02}
              decimals={2}
              unit="%"
              onChange={(val) => updateScene({ shadowOpacity: val })}
            />

            {/* Blur */}
            <ScrubSlider
              id="shadow-blur-scrub-slider"
              label="Shadow Blur"
              value={scene.shadowBlur ?? 3.5}
              min={0.0}
              max={12.0}
              step={0.1}
              decimals={1}
              unit="px"
              onChange={(val) => updateScene({ shadowBlur: val })}
            />
          </div>
        )}
      </div>

      {/* 2. Shadow Style Options */}
      {scene.showShadow && (
        <div className="bg-[#141414] rounded-[4px] border border-white/10 p-3 space-y-2">
          <label
            htmlFor="shadow-style-select"
            className="text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider block font-sora"
          >
            SHADOW STYLE
          </label>

          <div className="relative">
            <select
              id="shadow-style-select"
              value={scene.shadowType}
              onChange={(e) =>
                updateScene({ shadowType: e.target.value as ShadowType })
              }
              className="w-full bg-[#181818] hover:bg-[#1E1E1E] border border-white/15 focus:border-[#DB0B2B] text-[#FFFFFF] text-xs rounded-[4px] px-3 py-2 pr-8 focus:outline-hidden appearance-none cursor-pointer transition-colors"
            >
              <option value="contact" className="bg-[#181818] text-[#FFFFFF]">
                Contact Shadow
              </option>
              <option value="soft" className="bg-[#181818] text-[#FFFFFF]">
                Soft Floor Diffusion
              </option>
            </select>
            <ChevronDownIcon className="w-4 h-4 text-[#888888] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShadowPanel;
