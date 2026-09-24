import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';

export const ScenePanel: React.FC = () => {
  const scene = useEditorStore((s) => s.scene);
  const updateScene = useEditorStore((s) => s.updateScene);

  const wallColorPresets = [
    { name: 'Dark Studio', color: '#101010' },
    { name: 'Charcoal', color: '#1c1c1c' },
    { name: 'Deep Navy', color: '#0f172a' },
    { name: 'Warm Cream', color: '#d6cfc7' },
    { name: 'Pure White', color: '#f5f5f5' },
  ];

  const floorColorPresets = [
    { name: 'Pitch Floor', color: '#0a0a0a' },
    { name: 'Dark Slate', color: '#141414' },
    { name: 'Polished Concrete', color: '#222222' },
    { name: 'Studio Grey', color: '#303030' },
    { name: 'Bright Floor', color: '#e5e5e5' },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 text-white overflow-y-auto max-h-full font-geist">
      {/* 1. Wall Setting (On / Off) */}
      <div className="bg-black/35 backdrop-blur-md rounded-[4px] border border-white/10 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">Backdrop Wall</span>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2.5">
            <span
              className={`text-[11px] font-mono uppercase tracking-wider font-semibold transition-colors select-none ${
                scene.showWall ? 'text-[#DB0B2B]' : 'text-[#666666]'
              }`}
            >
              {scene.showWall ? 'ON' : 'OFF'}
            </span>
            <ToggleSwitch
              id="toggle-wall"
              label="Toggle Backdrop Wall"
              checked={scene.showWall}
              onChange={(val) => updateScene({ showWall: val })}
            />
          </div>
        </div>

        {scene.showWall && (
          <div className="space-y-2.5 pt-1 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#aaaaaa]">Wall Surface Color</span>
              <label className="relative flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-[4px] border border-white/10 cursor-pointer transition-colors">
                <span
                  className="w-3.5 h-3.5 rounded-[2px] border border-white/20 shrink-0"
                  style={{ backgroundColor: scene.wallColor || '#101010' }}
                />
                <span className="font-mono text-xs text-white uppercase tracking-wider">
                  {scene.wallColor || '#101010'}
                </span>
                <input
                  type="color"
                  value={scene.wallColor || '#101010'}
                  onChange={(e) => updateScene({ wallColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-1.5 pt-0.5">
              {wallColorPresets.map((p) => (
                <button
                  key={p.color}
                  type="button"
                  title={p.name}
                  onClick={() => updateScene({ wallColor: p.color })}
                  className={`h-6 rounded-[3px] border transition-all cursor-pointer ${
                    (scene.wallColor || '#101010').toLowerCase() === p.color.toLowerCase()
                      ? 'border-[#DB0B2B] scale-105 shadow-xs'
                      : 'border-[#2d2d2d] hover:border-[#555555]'
                  }`}
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Floor Setting (On / Off) */}
      <div className="bg-black/35 backdrop-blur-md rounded-[4px] border border-white/10 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">Studio Floor</span>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2.5">
            <span
              className={`text-[11px] font-mono uppercase tracking-wider font-semibold transition-colors select-none ${
                scene.showFloor ? 'text-[#DB0B2B]' : 'text-[#666666]'
              }`}
            >
              {scene.showFloor ? 'ON' : 'OFF'}
            </span>
            <ToggleSwitch
              id="toggle-floor"
              label="Toggle Studio Floor"
              checked={scene.showFloor}
              onChange={(val) => updateScene({ showFloor: val })}
            />
          </div>
        </div>

        {scene.showFloor && (
          <div className="space-y-2.5 pt-1 border-t border-[#1e1e1e]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#aaaaaa]">Floor Surface Color</span>
              <label className="relative flex items-center gap-2 bg-[#181818] hover:bg-[#202020] px-2.5 py-1 rounded-[4px] border border-[#2e2e2e] cursor-pointer transition-colors">
                <span
                  className="w-3.5 h-3.5 rounded-[2px] border border-[#444444] shrink-0"
                  style={{ backgroundColor: scene.floorColor || '#0a0a0a' }}
                />
                <span className="font-mono text-xs text-white uppercase tracking-wider">
                  {scene.floorColor || '#0a0a0a'}
                </span>
                <input
                  type="color"
                  value={scene.floorColor || '#0a0a0a'}
                  onChange={(e) => updateScene({ floorColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-1.5 pt-0.5">
              {floorColorPresets.map((p) => (
                <button
                  key={p.color}
                  type="button"
                  title={p.name}
                  onClick={() => updateScene({ floorColor: p.color })}
                  className={`h-6 rounded-[3px] border transition-all cursor-pointer ${
                    (scene.floorColor || '#0a0a0a').toLowerCase() === p.color.toLowerCase()
                      ? 'border-[#DB0B2B] scale-105 shadow-xs'
                      : 'border-[#2d2d2d] hover:border-[#555555]'
                  }`}
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenePanel;
