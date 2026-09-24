import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { 
  XMarkIcon, 
  LockClosedIcon, 
  CheckIcon, 
  PhotoIcon, 
  VideoCameraIcon, 
  SparklesIcon,
  ArrowPathIcon,
  BoltIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import { AspectRatio } from '../types';
import { exportImage, exportTurntableVideo, cancelCurrentExport } from '../lib/exportEngine';
import { TextureCompositor } from '../lib/textureCompositor';

export const ExportModal: React.FC = () => {
  const exportModalOpen = useEditorStore((s) => s.exportModalOpen);
  const setExportModalOpen = useEditorStore((s) => s.setExportModalOpen);
  const setUpgradeModalOpen = useEditorStore((s) => s.setUpgradeModalOpen);
  const user = useEditorStore((s) => s.user);
  const rendererCanvas = useEditorStore((s) => s.rendererCanvas);
  const currentModel = useEditorStore((s) => s.currentModel);
  const material = useEditorStore((s) => s.material);
  const scene = useEditorStore((s) => s.scene);
  const cameraPreset = useEditorStore((s) => s.cameraPreset);
  const animationEasing = useEditorStore((s) => s.animationEasing);
  const layers = useEditorStore((s) => s.layers);
  const showUVGuide = useEditorStore((s) => s.showUVGuide);
  const exportProgress = useEditorStore((s) => s.exportProgress);
  const setExportProgress = useEditorStore((s) => s.setExportProgress);

  const [activeTab, setActiveTab] = useState<'IMAGES' | 'VIDEO'>('VIDEO');
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  const [videoFormat, setVideoFormat] = useState<'mp4' | 'webm'>('mp4');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('16:9');
  const [transparentBg, setTransparentBg] = useState(false);
  const [videoFps, setVideoFps] = useState<number>(60);
  const [videoDuration, setVideoDuration] = useState<number>(6);

  if (!exportModalOpen) return null;

  const ratios: { id: AspectRatio; name: string; iconW: string; iconH: string }[] = [
    { id: '16:9', name: 'Landscape', iconW: 'w-7', iconH: 'h-4' },
    { id: '1:1', name: 'Square', iconW: 'w-5', iconH: 'h-5' },
    { id: '9:16', name: 'Vertical', iconW: 'w-4', iconH: 'h-7' },
    { id: '4:5', name: 'Portrait', iconW: 'w-5', iconH: 'h-6' },
  ];

  const handleStartExport = async () => {
    if (user.plan === 'free') {
      setExportModalOpen(false);
      setUpgradeModalOpen(true);
      return;
    }

    if (activeTab === 'IMAGES') {
      if (!rendererCanvas) return;
      setExportProgress({
        isExporting: true,
        type: 'image',
        stage: 'rendering',
        percent: 50,
        message: 'Rendering high-resolution snapshot...',
      });

      try {
        await exportImage(rendererCanvas, imageFormat, selectedRatio, transparentBg);
        setExportProgress({
          isExporting: false,
          stage: 'complete',
          percent: 100,
          message: 'Image Saved!',
        });
        setTimeout(() => setExportModalOpen(false), 800);
      } catch (e) {
        console.error('Image export error:', e);
        setExportProgress({ isExporting: false, stage: 'idle' });
      }
    } else {
      // MODERN 3D 360° VIDEO EXPORT (OffscreenCanvas + Web Worker + WebCodecs)
      try {
        setExportProgress({
          isExporting: true,
          type: 'video',
          stage: 'preparing',
          percent: 2,
          message: 'Initializing GPU texture compositor...',
        });

        // Compose active jersey texture layers into canvas
        const compositor = new TextureCompositor(2048, 2048);
        await compositor.compose(material, layers, showUVGuide);

        await exportTurntableVideo({
          format: videoFormat,
          ratio: selectedRatio,
          fps: videoFps,
          durationSeconds: videoDuration,
          modelType: currentModel,
          material,
          sceneSettings: scene,
          cameraPreset,
          colorTextureCanvas: compositor.getCanvas(),
          bumpTextureCanvas: compositor.getBumpCanvas(),
          transparent: transparentBg,
          animationEasing,
          sourceCanvasFallback: rendererCanvas,
          onProgress: (progress) => {
            setExportProgress(progress);
          },
        });

        // Close modal on complete after a brief confirmation
        setTimeout(() => {
          setExportProgress({ isExporting: false, stage: 'idle', percent: 0, message: '' });
          setExportModalOpen(false);
        }, 1200);
      } catch (err: any) {
        console.error('Video export error:', err);
        // Error or cancelled state is already captured by onProgress
      }
    }
  };

  const handleCancelExport = () => {
    cancelCurrentExport();
    setExportProgress({
      isExporting: false,
      stage: 'cancelled',
      percent: 0,
      message: 'Export dibatalkan.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#121212]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl">
        {/* Top Header with Tabs & Close button */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-6">
            <button
              type="button"
              disabled={exportProgress.isExporting}
              onClick={() => setActiveTab('VIDEO')}
              className={`pb-2 text-xs font-bold tracking-wider transition-colors relative cursor-pointer disabled:opacity-50 ${
                activeTab === 'VIDEO'
                  ? 'text-white'
                  : 'text-[#666666] hover:text-[#999999]'
              }`}
            >
              VIDEO (360°)
              {activeTab === 'VIDEO' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DB0B2B]" />
              )}
            </button>

            <button
              type="button"
              disabled={exportProgress.isExporting}
              onClick={() => setActiveTab('IMAGES')}
              className={`pb-2 text-xs font-bold tracking-wider transition-colors relative cursor-pointer disabled:opacity-50 ${
                activeTab === 'IMAGES'
                  ? 'text-white'
                  : 'text-[#666666] hover:text-[#999999]'
              }`}
            >
              IMAGES
              {activeTab === 'IMAGES' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DB0B2B]" />
              )}
            </button>
          </div>

          <button
            type="button"
            disabled={exportProgress.isExporting}
            onClick={() => setExportModalOpen(false)}
            className="p-1 rounded-lg text-[#777777] hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Gatekeeping Banner for Free users */}
          {user.plan === 'free' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1c1415] border border-[#DB0B2B]/30 text-xs">
              <div className="flex items-center gap-2 text-[#cccccc]">
                <LockClosedIcon className="w-4 h-4 text-[#DB0B2B]" />
                <span className="font-medium">Fitur export dikunci</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExportModalOpen(false);
                  setUpgradeModalOpen(true);
                }}
                className="text-[11px] font-bold text-[#DB0B2B] hover:underline font-sora cursor-pointer"
              >
                Upgrade
              </button>
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">Format Kontainer</span>
              {activeTab === 'VIDEO' && videoFormat === 'mp4' && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-mono">
                  <BoltIcon className="w-3 h-3 text-emerald-400" />
                  Hardware H.264
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activeTab === 'IMAGES' ? (
                <>
                  <button
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setImageFormat('png')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      imageFormat === 'png'
                        ? 'bg-white/15 border-[#DB0B2B] text-white shadow-xs'
                        : 'bg-black/40 border-white/10 text-[#888888] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>PNG (Lossless)</span>
                    {imageFormat === 'png' && (
                      <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setImageFormat('jpeg')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      imageFormat === 'jpeg'
                        ? 'bg-white/15 border-[#DB0B2B] text-white shadow-xs'
                        : 'bg-black/40 border-white/10 text-[#888888] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>JPG (Compressed)</span>
                    {imageFormat === 'jpeg' && (
                      <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setVideoFormat('mp4')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      videoFormat === 'mp4'
                        ? 'bg-white/15 border-[#DB0B2B] text-white shadow-xs'
                        : 'bg-black/40 border-white/10 text-[#888888] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>MP4 (H.264 Universal)</span>
                    {videoFormat === 'mp4' && (
                      <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setVideoFormat('webm')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      videoFormat === 'webm'
                        ? 'bg-white/15 border-[#DB0B2B] text-white shadow-xs'
                        : 'bg-black/40 border-white/10 text-[#888888] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>WEBM (VP9 / Alpha)</span>
                    {videoFormat === 'webm' && (
                      <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <span className="text-xs text-[#888888]">Aspect Ratio</span>
            <div className="grid grid-cols-4 gap-2">
              {ratios.map((r) => {
                const isSelected = selectedRatio === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setSelectedRatio(r.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                      isSelected
                        ? 'bg-white/15 border-[#DB0B2B] text-white shadow-xs'
                        : 'bg-black/40 border-white/10 text-[#777777] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div
                      className={`${r.iconW} ${r.iconH} border rounded-xs ${
                        isSelected ? 'border-[#DB0B2B]' : 'border-[#555555]'
                      }`}
                    />
                    <div className="text-center">
                      <div className="text-[11px] font-bold">{r.id}</div>
                      <div className="text-[9px] text-[#666666]">{r.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Options: Frame Rate & Duration */}
          {activeTab === 'VIDEO' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <span className="text-xs text-[#888888]">Frame Rate</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setVideoFps(60)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      videoFps === 60
                        ? 'bg-[#DB0B2B] text-white border-[#DB0B2B]'
                        : 'bg-black/40 text-[#888888] border-white/10 hover:text-white'
                    }`}
                  >
                    60 FPS
                  </button>
                  <button
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setVideoFps(30)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      videoFps === 30
                        ? 'bg-[#DB0B2B] text-white border-[#DB0B2B]'
                        : 'bg-black/40 text-[#888888] border-white/10 hover:text-white'
                    }`}
                  >
                    30 FPS
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-[#888888]">Durasi Loop</span>
                <div className="grid grid-cols-3 gap-1">
                  {[5, 6, 8].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      disabled={exportProgress.isExporting}
                      onClick={() => setVideoDuration(sec)}
                      className={`py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer ${
                        videoDuration === sec
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-black/40 text-[#888888] border-white/10 hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transparent Background switch (only for PNG images or WebM video) */}
          {(activeTab === 'IMAGES' && imageFormat === 'png') || (activeTab === 'VIDEO' && videoFormat === 'webm') ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
              <div>
                <div className="text-xs font-medium text-white">
                  Transparent Background
                </div>
                <div className="text-[10px] text-[#777777]">
                  Hapus background canvas saat diekspor (Alpha Channel)
                </div>
              </div>
              <button
                type="button"
                disabled={exportProgress.isExporting}
                onClick={() => setTransparentBg(!transparentBg)}
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer disabled:opacity-50 ${
                  transparentBg ? 'bg-[#DB0B2B]' : 'bg-[#292929]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    transparentBg ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ) : null}

          {/* Video 360 degree loop notes & architecture info */}
          {activeTab === 'VIDEO' && !exportProgress.isExporting && (
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-[#888888] space-y-1.5">
              <div className="font-semibold text-white flex items-center gap-1.5 font-sora">
                <SparklesIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                <span>360° Seamless Turntable Loop</span>
              </div>
              <p className="text-[11px] text-[#aaaaaa] leading-relaxed">
                Merender frame-by-frame 3D jersey ke <span className="text-white font-mono">OffscreenCanvas</span> dan di-encode di background via <span className="text-white font-mono">WebCodecs VideoEncoder</span> di Web Worker tanpa memblokir UI editor.
              </p>
            </div>
          )}

          {/* Live Export Progress with Encoding Status & Cancel Button */}
          {exportProgress.isExporting && (
            <div className="p-3.5 rounded-xl bg-black/60 border border-white/15 space-y-3 backdrop-blur-md animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <div className="flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4 text-[#DB0B2B] animate-spin shrink-0" />
                  <span className="truncate max-w-[210px]">{exportProgress.message}</span>
                </div>
                <span className="font-mono text-[#DB0B2B] text-sm font-bold">
                  {exportProgress.percent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#DB0B2B] to-[#ff4767] transition-all duration-150 rounded-full"
                  style={{ width: `${exportProgress.percent}%` }}
                />
              </div>

              {/* Encoding metadata info */}
              <div className="flex items-center justify-between text-[11px] text-[#888888] pt-0.5">
                <span className="font-mono">
                  {exportProgress.frameCurrent && exportProgress.frameTotal
                    ? `Frame ${exportProgress.frameCurrent} / ${exportProgress.frameTotal}`
                    : 'Worker active'}
                </span>
                <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  {exportProgress.encoderType || 'WebCodecs GPU'}
                </span>
              </div>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleCancelExport}
                className="w-full py-2 px-3 rounded-lg bg-red-950/30 hover:bg-red-900/50 active:bg-red-950/60 border border-red-500/30 hover:border-red-500/50 text-red-200 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer font-sora mt-1"
              >
                <StopIcon className="w-3.5 h-3.5 text-red-400" />
                <span>Batalkan Export (Cancel)</span>
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          {!exportProgress.isExporting && (
            <button
              id="export-modal-cta-btn"
              type="button"
              onClick={handleStartExport}
              className="w-full py-3 px-4 rounded-xl bg-[#DB0B2B] hover:bg-[#f01436] active:bg-[#b00820] text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-[#DB0B2B]/25 cursor-pointer flex items-center justify-center gap-2 font-sora"
            >
              {user.plan === 'free' ? (
                <>
                  <StarIcon className="w-4 h-4 text-white" />
                  <span>Upgrade Sekarang</span>
                </>
              ) : activeTab === 'IMAGES' ? (
                <>
                  <PhotoIcon className="w-4 h-4" />
                  <span>Download HD Image ({selectedRatio})</span>
                </>
              ) : (
                <>
                  <VideoCameraIcon className="w-4 h-4" />
                  <span>Render 360° Looping Video ({videoFormat.toUpperCase()})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
