import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { ScrubSlider } from '../../components/ui/ScrubSlider';
import {
  ArrowsPointingOutIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const PositionPanel: React.FC = () => {
  const scene = useEditorStore((s) => s.scene);
  const updateScene = useEditorStore((s) => s.updateScene);

  const resetPosition = () => {
    updateScene({
      modelX: 0,
      modelY: 0,
      modelZ: 0,
      modelRotation: 0,
      modelScale: 1.0,
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4 text-[#FFFFFF] overflow-y-auto max-h-full font-geist">
      {/* Header / Summary */}
      <div className="flex items-center justify-between bg-[#141414] rounded-[4px] border border-white/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <ArrowsPointingOutIcon className="w-4 h-4 text-[#DB0B2B]" />
          <span className="text-xs font-semibold text-[#FFFFFF]">Coordinates</span>
        </div>
        <button
          type="button"
          onClick={resetPosition}
          title="Reset to 0.00m origin"
          className="flex items-center gap-1 text-[11px] text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#181818] px-2 py-0.5 rounded-[4px] border border-white/10 hover:border-white/15 transition-colors cursor-pointer"
        >
          <ArrowPathIcon className="w-3 h-3 text-[#DB0B2B]" />
          <span>Reset</span>
        </button>
      </div>

      {/* Position X, Y, Z Sliders */}
      <div className="bg-[#141414] rounded-[4px] border border-white/10 p-3 space-y-3">
        <div className="text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider font-sora">
          POSITION
        </div>

        <div className="space-y-2">
          <ScrubSlider
            id="obj-pos-x"
            label="Position X"
            value={scene.modelX}
            min={-2.0}
            max={2.0}
            step={0.01}
            decimals={2}
            unit="m"
            onChange={(val) => updateScene({ modelX: val })}
          />

          <ScrubSlider
            id="obj-pos-y"
            label="Position Y"
            value={scene.modelY}
            min={-2.0}
            max={2.0}
            step={0.01}
            decimals={2}
            unit="m"
            onChange={(val) => updateScene({ modelY: val })}
          />

          <ScrubSlider
            id="obj-pos-z"
            label="Position Z"
            value={scene.modelZ ?? 0}
            min={-2.0}
            max={2.0}
            step={0.01}
            decimals={2}
            unit="m"
            onChange={(val) => updateScene({ modelZ: val })}
          />
        </div>
      </div>

      {/* Rotation & Scale */}
      <div className="bg-[#141414] rounded-[4px] border border-white/10 p-3 space-y-3">
        <div className="text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider font-sora">
          ORIENTATION
        </div>

        <div className="space-y-2">
          <ScrubSlider
            id="obj-rotation"
            label="Rotation Y"
            value={scene.modelRotation}
            min={0}
            max={360}
            step={1}
            unit="°"
            onChange={(val) => updateScene({ modelRotation: val })}
          />

          {/* Quick angles */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[0, 90, 180, 270].map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => updateScene({ modelRotation: deg })}
                className={`py-1 text-[11px] font-mono rounded-[4px] border transition-colors cursor-pointer ${
                  Math.round(scene.modelRotation) % 360 === deg
                    ? 'bg-[#DB0B2B] text-[#FFFFFF] border-[#DB0B2B]'
                    : 'bg-[#181818] text-[#888888] border-white/10 hover:text-[#FFFFFF] hover:bg-[#1E1E1E]'
                }`}
              >
                {deg}°
              </button>
            ))}
          </div>

          <ScrubSlider
            id="obj-scale"
            label="Scale"
            value={scene.modelScale}
            min={0.4}
            max={2.2}
            step={0.01}
            decimals={2}
            unit="x"
            onChange={(val) => updateScene({ modelScale: val })}
          />
        </div>
      </div>
    </div>
  );
};

export default PositionPanel;
