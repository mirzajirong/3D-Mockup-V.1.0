import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { ScrubSlider } from '../../components/ui/ScrubSlider';

export const MaterialPanel: React.FC = () => {
  const material = useEditorStore((s) => s.material);
  const updateMaterial = useEditorStore((s) => s.updateMaterial);

  const fabricColorPresets = [
    { name: 'Pitch Black', color: '#0A0A0A' },
    { name: 'Athletic Charcoal', color: '#1A1A1A' },
    { name: 'Deep Navy', color: '#0B132B' },
    { name: 'Crimson Wine', color: '#321016' },
    { name: 'Forest Green', color: '#0B2516' },
    { name: 'Clean White', color: '#F8F9FA' },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 text-white overflow-y-auto max-h-full font-geist">
      {/* 1. Base Fabric Color */}
      <div className="bg-black/35 backdrop-blur-md rounded-[4px] border border-white/10 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white">Fabric Base Color</span>
          <label className="relative flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-[4px] border border-white/10 cursor-pointer transition-colors">
            <span
              className="w-3.5 h-3.5 rounded-[2px] border border-white/20 shrink-0"
              style={{ backgroundColor: material.fabricColor }}
            />
            <span className="font-mono text-xs text-white uppercase tracking-wider">
              {material.fabricColor}
            </span>
            <input
              type="color"
              value={material.fabricColor}
              onChange={(e) => updateMaterial({ fabricColor: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>

        {/* Color presets swatches */}
        <div className="grid grid-cols-6 gap-1.5 pt-0.5">
          {fabricColorPresets.map((preset) => (
            <button
              key={preset.color}
              type="button"
              title={preset.name}
              onClick={() => updateMaterial({ fabricColor: preset.color })}
              className={`h-6 rounded-[3px] border transition-all cursor-pointer ${
                material.fabricColor.toLowerCase() === preset.color.toLowerCase()
                  ? 'border-[#DB0B2B] scale-105 shadow-xs'
                  : 'border-[#2d2d2d] hover:border-[#555555]'
              }`}
              style={{ backgroundColor: preset.color }}
            />
          ))}
        </div>
      </div>

      {/* 2. Surface Properties using custom ScrubSliders */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-[#cccccc] uppercase tracking-wider pt-0.5 font-sora">
          SURFACE PROPERTIES
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ScrubSlider
            id="mat-roughness-slider"
            label="Roughness"
            value={material.roughness}
            min={0.0}
            max={1.0}
            step={0.01}
            decimals={2}
            onChange={(val) => updateMaterial({ roughness: val })}
          />
          <ScrubSlider
            id="mat-sheen-slider"
            label="Sheen"
            value={material.sheen}
            min={0.0}
            max={1.0}
            step={0.01}
            decimals={2}
            onChange={(val) => updateMaterial({ sheen: val })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ScrubSlider
            id="mat-bump-slider"
            label="Bump Weave"
            value={material.normalIntensity}
            min={0.0}
            max={1.0}
            step={0.02}
            decimals={2}
            onChange={(val) => updateMaterial({ normalIntensity: val })}
          />
          <ScrubSlider
            id="mat-metallic-slider"
            label="Metallic"
            value={material.metallic}
            min={0.0}
            max={0.5}
            step={0.01}
            decimals={2}
            onChange={(val) => updateMaterial({ metallic: val })}
          />
        </div>
      </div>
    </div>
  );
};
