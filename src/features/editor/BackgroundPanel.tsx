import React, { useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { ArrowUpTrayIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ScrubSlider } from '../../components/ui/ScrubSlider';

export const BackgroundPanel: React.FC = () => {
  const scene = useEditorStore((s) => s.scene);
  const updateScene = useEditorStore((s) => s.updateScene);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const color1 = scene.gradientColor1 || '#2a2a2a';
  const color2 = scene.gradientColor2 || '#080808';
  const angle = scene.gradientAngle ?? 135;

  const bgPresets = [
    { name: 'Dark Studio', color: '#000000' },
    { name: 'Pitch Black', color: '#0a0a0a' },
    { name: 'Deep Burgundy', color: '#321016' },
    { name: 'Midnight Navy', color: '#0B132B' },
    { name: 'Slate Gray', color: '#242A45' },
    { name: 'Pure White', color: '#FFFFFF' },
    { name: 'Cyber Violet', color: '#1B0E2B' },
    { name: 'Charcoal Mist', color: '#1E1E1E' },
  ];

  const updateCustomGradient = (newC1: string, newC2: string, newAngle: number) => {
    updateScene({
      backgroundType: 'gradient',
      gradientColor1: newC1,
      gradientColor2: newC2,
      gradientAngle: newAngle,
      backgroundGradient: `linear-gradient(${newAngle}deg, ${newC1} 0%, ${newC2} 100%)`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (url) {
        updateScene({
          backgroundType: 'image',
          backgroundImageUrl: url,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3 p-4 text-[#FFFFFF] overflow-y-auto max-h-full font-geist">
      {/* Mode Switch Tabs */}
      <div className="bg-[#141414] rounded-[4px] border border-white/10 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#FFFFFF]">Backdrop Mode</span>
          {scene.backgroundType === 'checkerboard' ? (
            <span className="text-[10px] text-[#DB0B2B] font-mono bg-[#DB0B2B]/15 border border-[#DB0B2B]/40 px-2 py-0.5 rounded-[2px]">
              Default Papan Catur
            </span>
          ) : (
            <button
              type="button"
              onClick={() => updateScene({ backgroundType: 'checkerboard' })}
              className="flex items-center gap-1 text-[10px] text-[#888888] hover:text-[#FFFFFF] transition-colors cursor-pointer"
              title="Reset ke Papan Catur Default"
            >
              <ArrowPathIcon className="w-3 h-3 text-[#DB0B2B]" />
              <span>Reset Catur</span>
            </button>
          )}
        </div>

        {/* 3 visible tabs: Solid | Gradient | Upload */}
        <div className="grid grid-cols-3 gap-1 bg-[#181818] p-1 rounded-[4px] border border-white/10">
          <button
            type="button"
            onClick={() => updateScene({ backgroundType: 'solid' })}
            className={`py-1.5 px-1 text-[11px] font-medium rounded-[3px] transition-colors cursor-pointer text-center ${
              scene.backgroundType === 'solid'
                ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15 font-semibold'
                : 'text-[#888888] hover:text-[#FFFFFF]'
            }`}
          >
            Solid
          </button>
          <button
            type="button"
            onClick={() => {
              updateCustomGradient(color1, color2, angle);
            }}
            className={`py-1.5 px-1 text-[11px] font-medium rounded-[3px] transition-colors cursor-pointer text-center ${
              scene.backgroundType === 'gradient'
                ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15 font-semibold'
                : 'text-[#888888] hover:text-[#FFFFFF]'
            }`}
          >
            Gradient
          </button>
          <button
            type="button"
            onClick={() => updateScene({ backgroundType: 'image' })}
            className={`py-1.5 px-1 text-[11px] font-medium rounded-[3px] transition-colors cursor-pointer text-center ${
              scene.backgroundType === 'image'
                ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15 font-semibold'
                : 'text-[#888888] hover:text-[#FFFFFF]'
            }`}
          >
            Upload
          </button>
        </div>

        {/* Active: Checkerboard default view banner */}
        {scene.backgroundType === 'checkerboard' && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2.5 p-2.5 bg-[#181818] rounded-[4px] border border-white/10">
              <div
                className="w-8 h-8 rounded-[3px] border border-white/20 shrink-0"
                style={{
                  backgroundColor: '#0c0c0c',
                  backgroundImage: `
                    linear-gradient(45deg, #222222 25%, transparent 25%),
                    linear-gradient(-45deg, #222222 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #222222 75%),
                    linear-gradient(-45deg, transparent 75%, #222222 75%)
                  `,
                  backgroundSize: '12px 12px',
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#FFFFFF]">Default Papan Catur Gelap</div>
                <div className="text-[10px] text-[#888888]">
                  Papan catur transparan kontras gelap aktif sebagai latar belakang default.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. Solid Color Settings */}
        {scene.backgroundType === 'solid' && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#CCCCCC]">Color Value</span>
              <label className="relative flex items-center gap-2 bg-[#181818] hover:bg-[#1E1E1E] px-2.5 py-1 rounded-[4px] border border-white/10 hover:border-white/15 cursor-pointer transition-colors">
                <span
                  className="w-3.5 h-3.5 rounded-[2px] border border-white/20 shrink-0"
                  style={{ backgroundColor: scene.backgroundColor }}
                />
                <span className="font-mono text-xs text-[#FFFFFF] uppercase tracking-wider">
                  {scene.backgroundColor}
                </span>
                <input
                  type="color"
                  value={scene.backgroundColor}
                  onChange={(e) => updateScene({ backgroundColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>

            {/* Color Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#888888]">Studio Color Presets</span>
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {bgPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    title={preset.name}
                    onClick={() =>
                      updateScene({
                        backgroundColor: preset.color,
                        backgroundType: 'solid',
                      })
                    }
                    className={`h-7 rounded-[3px] border transition-all cursor-pointer ${
                      scene.backgroundColor.toLowerCase() === preset.color.toLowerCase()
                        ? 'border-[#DB0B2B] scale-105'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ backgroundColor: preset.color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Custom Gradient with Angle & Custom Colors */}
        {scene.backgroundType === 'gradient' && (
          <div className="space-y-3 pt-1">
            {/* Live Gradient Preview swatch */}
            <div
              className="w-full h-14 rounded-[4px] border border-white/15"
              style={{
                background: `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`,
              }}
            />

            {/* Color 1 and Color 2 pickers */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#888888] font-medium block">Color 1 (Start)</span>
                <label className="relative flex items-center gap-2 bg-[#181818] hover:bg-[#1E1E1E] px-2.5 py-1.5 rounded-[4px] border border-white/10 hover:border-white/15 cursor-pointer transition-colors">
                  <span
                    className="w-4 h-4 rounded-[2px] border border-white/20 shrink-0"
                    style={{ backgroundColor: color1 }}
                  />
                  <span className="font-mono text-xs text-[#FFFFFF] uppercase tracking-wider truncate">
                    {color1}
                  </span>
                  <input
                    type="color"
                    value={color1}
                    onChange={(e) => updateCustomGradient(e.target.value, color2, angle)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-[#888888] font-medium block">Color 2 (End)</span>
                <label className="relative flex items-center gap-2 bg-[#181818] hover:bg-[#1E1E1E] px-2.5 py-1.5 rounded-[4px] border border-white/10 hover:border-white/15 cursor-pointer transition-colors">
                  <span
                    className="w-4 h-4 rounded-[2px] border border-white/20 shrink-0"
                    style={{ backgroundColor: color2 }}
                  />
                  <span className="font-mono text-xs text-[#FFFFFF] uppercase tracking-wider truncate">
                    {color2}
                  </span>
                  <input
                    type="color"
                    value={color2}
                    onChange={(e) => updateCustomGradient(color1, e.target.value, angle)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>
            </div>

            {/* Gradient Angle Slider */}
            <div className="pt-1">
              <ScrubSlider
                id="gradient-angle-slider"
                label="Gradient Angle"
                value={angle}
                min={0}
                max={360}
                step={1}
                unit="°"
                onChange={(val) => updateCustomGradient(color1, color2, val)}
              />

              {/* Angle shortcuts */}
              <div className="grid grid-cols-4 gap-1.5 pt-2">
                {[0, 90, 135, 180].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => updateCustomGradient(color1, color2, deg)}
                    className={`py-1 text-[11px] font-mono rounded-[3px] border transition-colors cursor-pointer ${
                      angle === deg
                        ? 'bg-[#DB0B2B] text-[#FFFFFF] border-[#DB0B2B]'
                        : 'bg-[#181818] text-[#888888] border-white/10 hover:text-[#FFFFFF] hover:bg-[#1E1E1E]'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Upload Background */}
        {scene.backgroundType === 'image' && (
          <div className="space-y-3 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {scene.backgroundImageUrl ? (
              <div className="space-y-2">
                <div className="relative w-full h-28 rounded-[4px] border border-white/15 overflow-hidden bg-[#0A0A0A]">
                  <img
                    src={scene.backgroundImageUrl}
                    alt="Custom backdrop"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => updateScene({ backgroundImageUrl: '' })}
                    className="absolute top-2 right-2 p-1.5 bg-[#0A0A0A] hover:bg-[#DB0B2B] text-[#FFFFFF] rounded-[3px] border border-white/15 transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-[#181818] hover:bg-[#1E1E1E] border border-white/15 rounded-[4px] text-xs font-medium text-[#FFFFFF] transition-colors cursor-pointer"
                >
                  <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                  <span>Change Background Image</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-white/15 hover:border-[#DB0B2B] hover:bg-[#181818] rounded-[4px] py-6 flex flex-col items-center justify-center gap-2 text-[#888888] hover:text-[#FFFFFF] transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-[4px] bg-[#181818] flex items-center justify-center">
                  <ArrowUpTrayIcon className="w-4 h-4 text-[#DB0B2B]" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-[#FFFFFF]">Upload Background Image</div>
                  <div className="text-[10px] text-[#888888]">PNG, JPG, WebP up to 10MB</div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundPanel;
