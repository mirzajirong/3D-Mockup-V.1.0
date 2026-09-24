import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { ScrubSlider } from '../../components/ui/ScrubSlider';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { LightingPreset } from '../../types';

export const LightingPanel: React.FC = () => {
  const scene = useEditorStore((s) => s.scene);
  const updateScene = useEditorStore((s) => s.updateScene);

  const presets: { id: LightingPreset; label: string }[] = [
    { id: 'studio', label: 'Studio Softbox' },
    { id: 'dramatic', label: 'Dramatic Rim' },
    { id: 'warm', label: 'Golden Hour' },
    { id: 'cyber', label: 'Cyber Neon' },
    { id: 'daylight', label: 'Daylight Crisp' },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 text-[#FFFFFF] overflow-y-auto max-h-full font-geist">
      {/* 1. Lighting Parameters (Intensity and Light Angle) */}
      <div className="bg-[#141414] rounded-[4px] border border-white/10 p-3 space-y-3">
        <div className="text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider font-sora">
          LIGHT CONTROLS
        </div>

        <ScrubSlider
          id="light-intensity-scrub-slider"
          label="Intensity"
          value={scene.lightIntensity}
          min={0.1}
          max={3.0}
          step={0.05}
          decimals={2}
          unit="x"
          onChange={(val) => updateScene({ lightIntensity: val })}
        />

        <ScrubSlider
          id="light-angle-scrub-slider"
          label="Light Angle"
          value={scene.lightAngle ?? 45}
          min={0}
          max={360}
          step={1}
          unit="°"
          onChange={(val) => updateScene({ lightAngle: val })}
        />

        {/* Quick Angle Presets */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[0, 45, 90, 180].map((angle) => (
            <button
              key={angle}
              type="button"
              onClick={() => updateScene({ lightAngle: angle })}
              className={`py-1 text-[11px] font-mono rounded-[4px] border transition-colors cursor-pointer ${
                Math.round(scene.lightAngle ?? 45) === angle
                  ? 'bg-[#DB0B2B] text-[#FFFFFF] border-[#DB0B2B]'
                  : 'bg-[#181818] text-[#888888] border-white/10 hover:text-[#FFFFFF] hover:bg-[#1E1E1E]'
              }`}
            >
              {angle}°
            </button>
          ))}
        </div>
      </div>

      {/* 2. Lighting Rig Presets Dropdown */}
      <div className="bg-[#141414] rounded-[4px] border border-white/10 p-3 space-y-2">
        <label
          htmlFor="lighting-rig-select"
          className="text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider block font-sora"
        >
          LIGHTING RIG PRESET
        </label>

        <div className="relative">
          <select
            id="lighting-rig-select"
            value={scene.lightingPreset}
            onChange={(e) =>
              updateScene({ lightingPreset: e.target.value as LightingPreset })
            }
            className="w-full bg-[#181818] hover:bg-[#1E1E1E] border border-white/15 focus:border-[#DB0B2B] text-[#FFFFFF] text-xs rounded-[4px] px-3 py-2 pr-8 focus:outline-hidden appearance-none cursor-pointer transition-colors"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#181818] text-[#FFFFFF]">
                {p.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="w-4 h-4 text-[#888888] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default LightingPanel;
