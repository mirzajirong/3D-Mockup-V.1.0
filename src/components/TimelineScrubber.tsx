import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { AnimationEasing, AnimationFps } from '../types';

export const TimelineScrubber: React.FC = () => {
  const isPlayingTurntable = useEditorStore((s) => s.isPlayingTurntable);
  const setIsPlayingTurntable = useEditorStore((s) => s.setIsPlayingTurntable);
  const timelineTime = useEditorStore((s) => s.timelineTime);
  const setTimelineTime = useEditorStore((s) => s.setTimelineTime);
  const animationEasing = useEditorStore((s) => s.animationEasing);
  const setAnimationEasing = useEditorStore((s) => s.setAnimationEasing);
  const animationFps = useEditorStore((s) => s.animationFps);
  const setAnimationFps = useEditorStore((s) => s.setAnimationFps);
  const resetModelToFront = useEditorStore((s) => s.resetModelToFront);

  const [resetClicked, setResetClicked] = useState(false);

  // Turntable animation loop updater driven by animationFps
  useEffect(() => {
    let animId: number;
    if (isPlayingTurntable) {
      let last = performance.now();
      const interval = 1000 / animationFps;
      let accumulated = 0;

      const loop = (now: number) => {
        const delta = now - last;
        last = now;
        accumulated += delta;

        if (accumulated >= interval) {
          const stepSeconds = accumulated / 1000;
          accumulated = 0;
          setTimelineTime((useEditorStore.getState().timelineTime + stepSeconds) % 10);
        }
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlayingTurntable, animationFps, setTimelineTime]);

  const handleResetClick = () => {
    resetModelToFront();
    setResetClicked(true);
    setTimeout(() => setResetClicked(false), 900);
  };

  const easingOptions: { id: AnimationEasing; label: string }[] = [
    { id: 'in', label: 'in' },
    { id: 'out', label: 'out' },
    { id: 'in-out', label: 'in out' },
    { id: 'linear', label: 'linear' },
  ];

  const fpsOptions: AnimationFps[] = [60, 30, 25];

  return (
    <div className="absolute bottom-3 left-4 right-4 z-20 select-none font-geist">
      <div className="bg-black/50 backdrop-blur-2xl rounded-[4px] border border-white/15 px-3 py-1.5 flex items-center justify-between gap-3 shadow-2xl">
        {/* Left: Play/Pause, Easing Presets, FPS Controls */}
        <div className="flex items-center gap-2">
          {/* Play / Pause Toggle */}
          <button
            id="timeline-play-btn"
            type="button"
            onClick={() => setIsPlayingTurntable(!isPlayingTurntable)}
            className="w-7 h-7 rounded-[4px] bg-white/5 hover:bg-white/10 active:bg-white/5 text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer backdrop-blur-md"
            title={isPlayingTurntable ? 'Pause' : 'Play Turntable'}
          >
            {isPlayingTurntable ? (
              <PauseIcon className="w-3.5 h-3.5" />
            ) : (
              <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          {/* Easing Presets: in, out, in out, linear */}
          <div className="flex items-center bg-black/40 backdrop-blur-md p-0.5 rounded-[4px] border border-white/10">
            {easingOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAnimationEasing(opt.id)}
                className={`px-2 py-0.5 text-[11px] rounded-[3px] font-medium transition-all cursor-pointer ${
                  animationEasing === opt.id
                    ? 'bg-[#DB0B2B] text-white font-semibold shadow-xs'
                    : 'text-[#888888] hover:text-white hover:bg-white/10'
                }`}
                title={`Easing preset: ${opt.label}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* FPS selector: 60 fps, 30 fps, 25 fps */}
          <div className="flex items-center bg-black/40 backdrop-blur-md p-0.5 rounded-[4px] border border-white/10">
            {fpsOptions.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setAnimationFps(rate)}
                className={`px-1.5 py-0.5 text-[11px] font-mono rounded-[3px] font-medium transition-all cursor-pointer ${
                  animationFps === rate
                    ? 'bg-white/20 text-white font-semibold border border-white/20 shadow-xs'
                    : 'text-[#888888] hover:text-white hover:bg-white/10'
                }`}
                title={`Frame rate: ${rate} FPS`}
              >
                {rate} fps
              </button>
            ))}
          </div>
        </div>

        {/* Center: Simplified Clean Scrubber Slider */}
        <div className="flex-1 min-w-[120px] max-w-lg flex items-center px-2">
          <input
            id="timeline-scrubber-slider"
            type="range"
            min="0"
            max="10"
            step="0.05"
            value={timelineTime}
            onChange={(e) => setTimelineTime(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full accent-[#DB0B2B] cursor-pointer appearance-none"
          />
        </div>

        {/* Right: RESET Button (Replacing Capture button) */}
        <div className="flex items-center">
          <button
            id="timeline-reset-btn"
            type="button"
            onClick={handleResetClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold font-sora border transition-all cursor-pointer select-none backdrop-blur-md ${
              resetClicked
                ? 'bg-[#DB0B2B] text-white border-[#DB0B2B] scale-105 shadow-md shadow-[#DB0B2B]/30'
                : 'bg-white/5 hover:bg-white/10 active:bg-white/5 text-[#e0e0e0] hover:text-white border-white/10'
            }`}
            title="Reset 3D Model position to Front"
          >
            {resetClicked ? (
              <CheckIcon className="w-3.5 h-3.5 text-white animate-pulse" />
            ) : (
              <ArrowPathIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
            )}
            <span>{resetClicked ? 'Front Reset!' : 'Reset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineScrubber;
