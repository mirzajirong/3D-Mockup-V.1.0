import React from 'react';
import { useEditorStore } from '../store/editorStore';
import {
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

export const FloatingToolbar: React.FC = () => {
  const isPlayingTurntable = useEditorStore((s) => s.isPlayingTurntable);
  const setIsPlayingTurntable = useEditorStore((s) => s.setIsPlayingTurntable);
  const showUVGuide = useEditorStore((s) => s.showUVGuide);
  const setShowUVGuide = useEditorStore((s) => s.setShowUVGuide);

  return (
    <>
      {/* Left Vertical Floating Tool Strip */}
      <div className="absolute left-4 top-4 z-20 flex flex-col gap-1 bg-black/50 backdrop-blur-2xl p-1 rounded-[4px] border border-white/15 shadow-2xl">
        {/* Turntable 360 Spin */}
        <button
          type="button"
          onClick={() => setIsPlayingTurntable(!isPlayingTurntable)}
          className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
            isPlayingTurntable
              ? 'bg-[#DB0B2B] text-white animate-spin'
              : 'text-[#888888] hover:text-white hover:bg-white/10'
          }`}
          title={isPlayingTurntable ? 'Pause 360° Spin' : 'Start 360° Turntable'}
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>

        {/* UV Guide on 3D Toggle */}
        <button
          type="button"
          onClick={() => setShowUVGuide(!showUVGuide)}
          className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
            showUVGuide
              ? 'bg-[#DB0B2B] text-white'
              : 'text-[#888888] hover:text-white hover:bg-white/10'
          }`}
          title="Toggle UV Wireframe Guide on 3D Model"
        >
          {showUVGuide ? (
            <EyeIcon className="w-4 h-4" />
          ) : (
            <EyeSlashIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  );
};
