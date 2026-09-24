import React, { useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { UVCanvasPreview } from './UVCanvasPreview';
import { ScrubSlider } from '../../components/ui/ScrubSlider';
import {
  ArrowUpTrayIcon,
  ArrowsPointingOutIcon,
  LockClosedIcon,
  LockOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

export const DesignPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layers = useEditorStore((s) => s.layers);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const removeLayer = useEditorStore((s) => s.removeLayer);
  const addLayer = useEditorStore((s) => s.addLayer);
  const moveLayerUp = useEditorStore((s) => s.moveLayerUp);
  const moveLayerDown = useEditorStore((s) => s.moveLayerDown);
  const fitDesignToJersey = useEditorStore((s) => s.fitDesignToJersey);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // File Upload Handler (PNG / JPG / SVG)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (src) {
        addLayer({
          name: file.name.replace(/\.[^/.]+$/, ''),
          src,
          visible: true,
          locked: false,
          opacity: 1.0,
          scale: 0.25,
          x: 0,
          y: -0.15,
          rotation: 0,
          blendMode: 'normal',
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleFitDesign = () => {
    if (selectedLayerId) {
      fitDesignToJersey(selectedLayerId);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 text-[#FFFFFF] overflow-y-auto max-h-full font-geist">
      {/* 1. UV Map Preview Canvas with Interactive Handles & Guide Button */}
      <UVCanvasPreview />

      {/* 2. Action Row: [ ⤢ Fit Design ] & [ ↑ Upload Design ] */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="fit-design-btn"
          type="button"
          onClick={handleFitDesign}
          disabled={!selectedLayerId}
          className="h-9 px-3 flex items-center justify-center gap-2 rounded-[4px] bg-[#141414] hover:bg-[#181818] active:bg-[#141414] border border-white/10 hover:border-white/15 text-xs font-medium text-[#FFFFFF] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Fit Design into Upper Chest Area"
        >
          <ArrowsPointingOutIcon className="w-3.5 h-3.5 text-[#FFFFFF]" />
          <span>Fit</span>
        </button>

        <button
          id="upload-design-btn"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-9 px-3 flex items-center justify-center gap-2 rounded-[4px] bg-[#141414] hover:bg-[#181818] active:bg-[#141414] border border-white/10 hover:border-white/15 text-xs font-medium text-[#FFFFFF] transition-colors cursor-pointer"
        >
          <ArrowUpTrayIcon className="w-3.5 h-3.5 text-[#FFFFFF]" />
          <span>Design</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* 4. LAYERS (N) SECTION */}
      <div className="space-y-2 pt-1">
        <div className="text-[11px] font-bold text-[#FFFFFF] uppercase tracking-wider font-sora">
          LAYERS ({layers.length})
        </div>

        {/* Layer list */}
        {layers.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#888888] border border-dashed border-white/10 rounded-[4px] bg-[#141414]">
            No design layers added. Click Upload Design above.
          </div>
        ) : (
          <div className="space-y-1.5">
            {layers.map((layer) => {
              const isSelected = layer.id === selectedLayerId;
              return (
                <div
                  key={layer.id}
                  onClick={() => selectLayer(layer.id)}
                  className={`flex items-center justify-between p-2 rounded-[4px] border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E1E1E] border-[#DB0B2B]'
                      : 'bg-[#141414] hover:bg-[#181818] border-white/10'
                  }`}
                >
                  {/* Left: Thumbnail */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-[2px] bg-[#0A0A0A] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                      <img
                        src={layer.src}
                        alt={layer.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium text-[#FFFFFF] truncate max-w-[120px]">
                      {layer.name}
                    </span>
                  </div>

                  {/* Right Actions: Up, Down, Lock, Eye, Trash */}
                  <div
                    className="flex items-center gap-1 text-[#888888]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => moveLayerUp(layer.id)}
                      className="p-1 hover:text-[#FFFFFF] rounded-[2px] transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveLayerDown(layer.id)}
                      className="p-1 hover:text-[#FFFFFF] rounded-[2px] transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateLayer(layer.id, { locked: !layer.locked })
                      }
                      className="p-1 hover:text-[#FFFFFF] rounded-[2px] transition-colors cursor-pointer"
                      title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                    >
                      {layer.locked ? (
                        <LockClosedIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                      ) : (
                        <LockOpenIcon className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateLayer(layer.id, { visible: !layer.visible })
                      }
                      className="p-1 hover:text-[#FFFFFF] rounded-[2px] transition-colors cursor-pointer"
                      title={layer.visible ? 'Hide layer' : 'Show layer'}
                    >
                      {layer.visible ? (
                        <EyeIcon className="w-3.5 h-3.5" />
                      ) : (
                        <EyeSlashIcon className="w-3.5 h-3.5 text-[#555555]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeLayer(layer.id)}
                      className="p-1 hover:text-[#DB0B2B] rounded-[2px] transition-colors cursor-pointer"
                      title="Delete layer"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Compact Scrub Sliders (Exact 2x2 grid from image.png) */}
        {selectedLayer && (
          <div className="space-y-2 pt-1">
            {/* Row 1: Scale & Opacity */}
            <div className="grid grid-cols-2 gap-2">
              <ScrubSlider
                id="layer-scale-slider"
                label="Scale"
                value={selectedLayer.scale}
                min={0.02}
                max={1.5}
                step={0.01}
                decimals={2}
                onChange={(val) => updateLayer(selectedLayer.id, { scale: val })}
              />
              <ScrubSlider
                id="layer-opacity-slider"
                label="Opacity"
                value={selectedLayer.opacity}
                min={0.0}
                max={1.0}
                step={0.01}
                decimals={2}
                onChange={(val) => updateLayer(selectedLayer.id, { opacity: val })}
              />
            </div>

            {/* Row 2: Position X & Position Y */}
            <div className="grid grid-cols-2 gap-2">
              <ScrubSlider
                id="layer-pos-x-slider"
                label="Position X"
                value={parseFloat(((selectedLayer.x + 1) / 2).toFixed(2))}
                min={0.0}
                max={1.0}
                step={0.01}
                decimals={2}
                onChange={(normVal) => {
                  const x = parseFloat((normVal * 2 - 1).toFixed(3));
                  updateLayer(selectedLayer.id, { x });
                }}
              />
              <ScrubSlider
                id="layer-pos-y-slider"
                label="Position Y"
                value={parseFloat(((selectedLayer.y + 1) / 2).toFixed(2))}
                min={0.0}
                max={1.0}
                step={0.01}
                decimals={2}
                onChange={(normVal) => {
                  const y = parseFloat((normVal * 2 - 1).toFixed(3));
                  updateLayer(selectedLayer.id, { y });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
