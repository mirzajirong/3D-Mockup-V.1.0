import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { ScrubSlider } from '../../components/ui/ScrubSlider';
import { CameraPreset } from '../../types';
import {
  CameraIcon,
  ArrowPathIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

export const CameraPanel: React.FC = () => {
  const cameraPreset = useEditorStore((s) => s.cameraPreset);
  const setCameraPreset = useEditorStore((s) => s.setCameraPreset);
  const scene = useEditorStore((s) => s.scene);
  const updateScene = useEditorStore((s) => s.updateScene);

  const presets: { id: CameraPreset; label: string }[] = [
    { id: 'front', label: 'Front' },
    { id: 'back', label: 'Back' },
    { id: 'right', label: 'Right' },
    { id: 'left', label: 'Left' },
    { id: 'top', label: 'Top' },
    { id: 'product', label: 'Perspective' },
  ];

  const handleSelectPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
  };

  const handleResetCamera = () => {
    setCameraPreset('front');
    updateScene({
      cameraFov: 45,
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4 text-white overflow-y-auto max-h-full font-geist">
      {/* Header */}
      <div className="flex items-center justify-between bg-black/35 backdrop-blur-md rounded-[4px] border border-white/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <CameraIcon className="w-4 h-4 text-[#DB0B2B]" />
          <span className="text-xs font-semibold text-white">Camera Controls</span>
        </div>
        <button
          type="button"
          onClick={handleResetCamera}
          title="Reset Camera"
          className="flex items-center gap-1 text-[11px] text-[#999999] hover:text-white hover:bg-white/10 px-2 py-0.5 rounded-[4px] border border-white/10 transition-colors cursor-pointer"
        >
          <ArrowPathIcon className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Camera Presets (Front, Back, Right, Left, Top, Perspective) */}
      <div className="bg-black/35 backdrop-blur-md rounded-[4px] border border-white/10 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#cccccc] uppercase tracking-wider font-sora">
            ANGLE PRESETS
          </span>
          <span className="text-[10px] text-[#888888] font-mono capitalize">
            Current: {cameraPreset}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((p) => {
            const isActive = cameraPreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-[4px] border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#DB0B2B] text-white border-[#DB0B2B] shadow-xs'
                    : 'bg-white/5 text-[#cccccc] border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                <EyeIcon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Field of View (FOV) */}
      <div className="bg-black/35 backdrop-blur-md rounded-[4px] border border-white/10 p-3 space-y-2.5">
        <div className="text-[11px] font-bold text-[#cccccc] uppercase tracking-wider font-sora">
          OPTICS & LENS
        </div>

        <ScrubSlider
          id="camera-fov-slider"
          label="Field of View"
          value={scene.cameraFov ?? 45}
          min={20}
          max={90}
          step={1}
          unit="°"
          onChange={(val) => updateScene({ cameraFov: val })}
        />

        {/* Quick FOV focal length equivalents */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => updateScene({ cameraFov: 28 })}
            className={`py-1 rounded-[4px] border transition-colors cursor-pointer ${
              scene.cameraFov === 28
                ? 'bg-[#DB0B2B] text-white border-[#DB0B2B]'
                : 'bg-white/5 text-[#888888] border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            Tele (28°)
          </button>
          <button
            type="button"
            onClick={() => updateScene({ cameraFov: 45 })}
            className={`py-1 rounded-[4px] border transition-colors cursor-pointer ${
              scene.cameraFov === 45
                ? 'bg-[#DB0B2B] text-white border-[#DB0B2B]'
                : 'bg-white/5 text-[#888888] border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            Standard (45°)
          </button>
          <button
            type="button"
            onClick={() => updateScene({ cameraFov: 70 })}
            className={`py-1 rounded-[4px] border transition-colors cursor-pointer ${
              scene.cameraFov === 70
                ? 'bg-[#DB0B2B] text-white border-[#DB0B2B]'
                : 'bg-white/5 text-[#888888] border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            Wide (70°)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraPanel;
