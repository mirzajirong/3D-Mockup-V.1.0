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
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import { AspectRatio } from '../types';
import { exportImage, exportTurntableVideo, cancelCurrentExport } from '../lib/exportEngine';
import { TextureCompositor } from '../lib/textureCompositor';
import { APP_CONFIG } from '../config/constants';

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
  const timelineTime = useEditorStore((s) => s.timelineTime);
  const layers = useEditorStore((s) => s.layers);
  const showUVGuide = useEditorStore((s) => s.showUVGuide);
  const exportProgress = useEditorStore((s) => s.exportProgress);
  const setExportProgress = useEditorStore((s) => s.setExportProgress);

  const [activeTab, setActiveTab] = useState<'VIDEO' | 'IMAGES'>('VIDEO');
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
        percent: 30,
        message: 'Rendering high-resolution 3D snapshot...',
      });

      try {
        const compositor = new TextureCompositor(2048, 2048);
        await compositor.compose(material, layers, showUVGuide);

        await exportImage({
          sourceCanvas: rendererCanvas,
          format: imageFormat,
          ratio: selectedRatio,
          transparent: transparentBg,
          sceneSettings: scene,
          modelType: currentModel,
          material,
          cameraPreset,
          colorTextureCanvas: compositor.getCanvas(),
          bumpTextureCanvas: compositor.getBumpCanvas(),
          timelineTime,
          animationEasing,
        });

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

        setTimeout(() => {
          setExportProgress({ isExporting: false, stage: 'idle', percent: 0, message: '' });
          setExportModalOpen(false);
        }, 1200);
      } catch (err: any) {
        console.error('Video export error:', err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/15 rounded-[6px] shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#000000]">
          <div className="flex items-center gap-2.5">
            <img
              src={APP_CONFIG.assets.logo}
              alt="Editor Suite"
              className="w-5 h-5 rounded-[2px] object-contain shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FFFFFF] tracking-wider font-sora">
                  EXPORT STUDIO
                </span>
                <span className="text-[10px] text-[#DB0B2B] font-mono font-semibold">
                  · 3D ASSETS
                </span>
              </div>
              <span className="text-[10px] text-[#888888] font-normal tracking-tight">
                {APP_CONFIG.tagline}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={exportProgress.isExporting}
            onClick={() => setExportModalOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-[4px] border border-white/10 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Segmented Control */}
        <div className="px-5 pt-3 pb-2 bg-[#0A0A0A] border-b border-white/5">
          <div className="grid grid-cols-2 p-1 bg-[#141414] rounded-[4px] border border-white/10 gap-1">
            <button
              type="button"
              disabled={exportProgress.isExporting}
              onClick={() => setActiveTab('VIDEO')}
              className={`py-1.5 px-3 rounded-[3px] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 font-sora ${
                activeTab === 'VIDEO'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                  : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] border border-transparent'
              }`}
            >
              <VideoCameraIcon className={`w-3.5 h-3.5 ${activeTab === 'VIDEO' ? 'text-[#DB0B2B]' : 'text-current'}`} />
              <span>360° VIDEO LOOP</span>
            </button>

            <button
              type="button"
              disabled={exportProgress.isExporting}
              onClick={() => setActiveTab('IMAGES')}
              className={`py-1.5 px-3 rounded-[3px] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 font-sora ${
                activeTab === 'IMAGES'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                  : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] border border-transparent'
              }`}
            >
              <PhotoIcon className={`w-3.5 h-3.5 ${activeTab === 'IMAGES' ? 'text-[#DB0B2B]' : 'text-current'}`} />
              <span>HD IMAGE SNAPSHOT</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Gatekeeping Banner for Free users */}
          {user.plan === 'free' && (
            <div className="flex items-center justify-between p-3 rounded-[4px] bg-[#181818] border border-[#DB0B2B]/40 text-xs">
              <div className="flex items-center gap-2.5 text-[#CCCCCC]">
                <LockClosedIcon className="w-4 h-4 text-[#DB0B2B] shrink-0" />
                <div>
                  <div className="font-semibold text-[#FFFFFF]">Fitur Studio Export Terkunci</div>
                  <div className="text-[11px] text-[#888888]">Upgrade ke Pro untuk ekspor render tanpa batas & video 360°</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExportModalOpen(false);
                  setUpgradeModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-[3px] bg-[#DB0B2B] hover:bg-[#F01436] active:bg-[#B00820] text-[#FFFFFF] text-[11px] font-bold font-sora cursor-pointer shrink-0 transition-colors"
              >
                Upgrade Pro
              </button>
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#888888] font-medium">Output Format</span>
              {activeTab === 'VIDEO' && videoFormat === 'mp4' && (
                <span className="text-[10px] text-[#10B981] font-mono flex items-center gap-1">
                  <BoltIcon className="w-3 h-3 text-[#10B981]" />
                  Hardware AVC/H.264
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
                    className={`py-2 px-3 rounded-[4px] border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      imageFormat === 'png'
                        ? 'bg-[#181818] border-[#DB0B2B] text-[#FFFFFF]'
                        : 'bg-[#141414] border-white/10 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818]'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-sora text-[#FFFFFF]">PNG</span>
                      <span className="text-[10px] text-[#888888] font-normal">Lossless · Alpha Transparency</span>
                    </div>
                    {imageFormat === 'png' && (
                      <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B] shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setImageFormat('jpeg')}
                    className={`py-2 px-3 rounded-[4px] border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      imageFormat === 'jpeg'
                        ? 'bg-[#181818] border-[#DB0B2B] text-[#FFFFFF]'
                        : 'bg-[#141414] border-white/10 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818]'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-sora text-[#FFFFFF]">JPG</span>
                      <span className="text-[10px] text-[#888888] font-normal">Compressed · Solid Background</span>
                    </div>
                    {imageFormat === 'jpeg' && (
                      <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B] shrink-0" />
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setVideoFormat('mp4')}
                    className={`py-2 px-3 rounded-[4px] border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      videoFormat === 'mp4'
                        ? 'bg-[#181818] border-[#DB0B2B] text-[#FFFFFF]'
                        : 'bg-[#141414] border-white/10 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818]'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-sora text-[#FFFFFF]">MP4 Video</span>
                      <span className="text-[10px] text-[#888888] font-normal">H.264 Universal · Web & Social</span>
                    </div>
                    {videoFormat === 'mp4' && (
                      <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B] shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setVideoFormat('webm')}
                    className={`py-2 px-3 rounded-[4px] border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      videoFormat === 'webm'
                        ? 'bg-[#181818] border-[#DB0B2B] text-[#FFFFFF]'
                        : 'bg-[#141414] border-white/10 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818]'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-sora text-[#FFFFFF]">WEBM Video</span>
                      <span className="text-[10px] text-[#888888] font-normal">VP9 · Alpha Transparent Video</span>
                    </div>
                    {videoFormat === 'webm' && (
                      <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B] shrink-0" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <span className="text-xs text-[#888888] font-medium">Aspect Ratio</span>
            <div className="grid grid-cols-4 gap-2">
              {ratios.map((r) => {
                const isSelected = selectedRatio === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setSelectedRatio(r.id)}
                    className={`p-2.5 rounded-[4px] border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                      isSelected
                        ? 'bg-[#181818] border-[#DB0B2B] text-[#FFFFFF]'
                        : 'bg-[#141414] border-white/10 text-[#888888] hover:border-white/20 hover:text-[#FFFFFF] hover:bg-[#181818]'
                    }`}
                  >
                    <div
                      className={`${r.iconW} ${r.iconH} border rounded-[2px] ${
                        isSelected ? 'border-[#DB0B2B] bg-[#DB0B2B]/15' : 'border-white/20'
                      }`}
                    />
                    <div className="text-center leading-tight">
                      <div className="text-[11px] font-bold font-sora">{r.id}</div>
                      <div className="text-[9px] text-[#888888]">{r.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Options: Frame Rate & Duration */}
          {activeTab === 'VIDEO' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-xs text-[#888888] font-medium">Frame Rate</span>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#141414] rounded-[4px] border border-white/10">
                  <button
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setVideoFps(60)}
                    className={`py-1 text-xs font-semibold rounded-[3px] transition-colors cursor-pointer ${
                      videoFps === 60
                        ? 'bg-[#DB0B2B] text-[#FFFFFF]'
                        : 'text-[#888888] hover:text-[#FFFFFF]'
                    }`}
                  >
                    60 FPS
                  </button>
                  <button
                    type="button"
                    disabled={exportProgress.isExporting}
                    onClick={() => setVideoFps(30)}
                    className={`py-1 text-xs font-semibold rounded-[3px] transition-colors cursor-pointer ${
                      videoFps === 30
                        ? 'bg-[#DB0B2B] text-[#FFFFFF]'
                        : 'text-[#888888] hover:text-[#FFFFFF]'
                    }`}
                  >
                    30 FPS
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-[#888888] font-medium">Turntable Loop</span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#141414] rounded-[4px] border border-white/10">
                  {[5, 6, 8].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      disabled={exportProgress.isExporting}
                      onClick={() => setVideoDuration(sec)}
                      className={`py-1 text-xs font-mono font-medium rounded-[3px] transition-colors cursor-pointer ${
                        videoDuration === sec
                          ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                          : 'text-[#888888] hover:text-[#FFFFFF]'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transparent Background switch */}
          {((activeTab === 'IMAGES' && imageFormat === 'png') || (activeTab === 'VIDEO' && videoFormat === 'webm')) && (
            <div className="flex items-center justify-between p-3 rounded-[4px] bg-[#141414] border border-white/10">
              <div>
                <div className="text-xs font-medium text-[#FFFFFF]">
                  Transparent Background
                </div>
                <div className="text-[10px] text-[#888888]">
                  Hapus background canvas saat diekspor (Alpha Channel)
                </div>
              </div>
              <button
                type="button"
                disabled={exportProgress.isExporting}
                onClick={() => setTransparentBg(!transparentBg)}
                className={`w-9 h-5 rounded-[3px] transition-colors relative flex items-center px-0.5 cursor-pointer disabled:opacity-50 ${
                  transparentBg ? 'bg-[#DB0B2B]' : 'bg-[#1E1E1E] border border-white/15'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-[2px] bg-[#FFFFFF] transition-transform ${
                    transparentBg ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Video architecture info */}
          {activeTab === 'VIDEO' && !exportProgress.isExporting && (
            <div className="p-3 rounded-[4px] bg-[#141414] border border-white/10 text-xs text-[#888888] space-y-1">
              <div className="font-semibold text-[#FFFFFF] flex items-center gap-1.5 font-sora">
                <SparklesIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                <span>Synchronized 3D Viewport Video</span>
              </div>
              <p className="text-[11px] text-[#CCCCCC] leading-relaxed">
                OffscreenCanvas rendering disinkronkan dengan posisi kamera viewport, lighting studio, dan materi kain aktif menggunakan WebCodecs GPU worker.
              </p>
            </div>
          )}

          {/* Live Export Progress with Encoding Status & Cancel Button */}
          {exportProgress.isExporting && (
            <div className="p-3.5 rounded-[4px] bg-[#0A0A0A] border border-white/15 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-[#FFFFFF]">
                <div className="flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4 text-[#DB0B2B] animate-spin shrink-0" />
                  <span className="truncate max-w-[240px] text-xs font-mono">{exportProgress.message}</span>
                </div>
                <span className="font-mono text-[#DB0B2B] text-sm font-bold">
                  {exportProgress.percent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-[2px] bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#DB0B2B] transition-all duration-150 rounded-[2px]"
                  style={{ width: `${exportProgress.percent}%` }}
                />
              </div>

              {/* Encoding metadata info */}
              <div className="flex items-center justify-between text-[11px] text-[#888888] pt-0.5">
                <span className="font-mono">
                  {exportProgress.frameCurrent && exportProgress.frameTotal
                    ? `Frame ${exportProgress.frameCurrent} / ${exportProgress.frameTotal}`
                    : 'Pipeline Active'}
                </span>
                <span className="text-[#10B981] font-mono text-[10px] bg-[#10B981]/10 px-1.5 py-0.5 rounded-[2px] border border-[#10B981]/20">
                  {exportProgress.encoderType || 'WebCodecs AVC'}
                </span>
              </div>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleCancelExport}
                className="w-full py-1.5 px-3 rounded-[3px] bg-[#181818] hover:bg-[#1E1E1E] border border-[#EF4444]/40 text-[#EF4444] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sora mt-1"
              >
                <StopIcon className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>Batalkan Export</span>
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          {!exportProgress.isExporting && (
            <button
              id="export-modal-cta-btn"
              type="button"
              onClick={handleStartExport}
              className="w-full py-2.5 px-4 rounded-[4px] bg-[#DB0B2B] hover:bg-[#F01436] active:bg-[#B00820] text-[#FFFFFF] text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 font-sora"
            >
              {user.plan === 'free' ? (
                <>
                  <StarIcon className="w-4 h-4 text-[#FFFFFF]" />
                  <span>UPGRADE TO PRO</span>
                </>
              ) : activeTab === 'IMAGES' ? (
                <>
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>EXPORT IMAGE ({imageFormat.toUpperCase()} · {selectedRatio})</span>
                </>
              ) : (
                <>
                  <VideoCameraIcon className="w-4 h-4" />
                  <span>RENDER 360° VIDEO ({videoFormat.toUpperCase()} · {videoFps} FPS)</span>
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
