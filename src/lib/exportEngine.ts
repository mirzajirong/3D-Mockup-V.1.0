import * as THREE from 'three';
import { 
  AspectRatio, 
  ExportProgress, 
  ModelType, 
  MaterialSettings, 
  SceneSettings, 
  CameraPreset, 
  AnimationEasing 
} from '../types';
import { createOffscreenScene, computeExportDimensions } from './offscreenScene';

let currentAbortController: AbortController | null = null;

export function cancelCurrentExport(): void {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

export interface ImageExportOptions {
  sourceCanvas?: HTMLCanvasElement | null;
  format: 'png' | 'jpeg';
  ratio: AspectRatio;
  transparent: boolean;
  sceneSettings?: SceneSettings;
  modelType?: ModelType;
  material?: MaterialSettings;
  cameraPreset?: CameraPreset;
  colorTextureCanvas?: HTMLCanvasElement | null;
  bumpTextureCanvas?: HTMLCanvasElement | null;
  timelineTime?: number;
  animationEasing?: AnimationEasing;
  quality?: number;
}

/**
 * Captures high-resolution image with desired aspect ratio and pristine quality,
 * matching 3D viewport lighting, materials, camera, and background.
 */
export async function exportImage(
  optionsOrCanvas: ImageExportOptions | HTMLCanvasElement,
  formatParam?: 'png' | 'jpeg',
  ratioParam?: AspectRatio,
  transparentParam?: boolean,
  sceneSettingsParam?: SceneSettings,
  qualityParam = 0.95
): Promise<void> {
  const isOptionsObj = !(optionsOrCanvas instanceof HTMLCanvasElement);
  const opts: ImageExportOptions = isOptionsObj
    ? (optionsOrCanvas as ImageExportOptions)
    : {
        sourceCanvas: optionsOrCanvas as HTMLCanvasElement,
        format: formatParam || 'png',
        ratio: ratioParam || '16:9',
        transparent: transparentParam || false,
        sceneSettings: sceneSettingsParam,
        quality: qualityParam,
      };

  const { format, ratio, transparent, sceneSettings, quality = 0.95 } = opts;
  const { width: targetW, height: targetH } = computeExportDimensions(ratio, 2048, false);

  // 1. Primary High-Fidelity Path: Native 3D Offscreen WebGL Render
  if (opts.modelType && opts.material && sceneSettings) {
    try {
      const offscreen = await createOffscreenScene({
        width: targetW,
        height: targetH,
        modelType: opts.modelType,
        material: opts.material,
        sceneSettings,
        cameraPreset: opts.cameraPreset || 'front',
        colorTextureImage: opts.colorTextureCanvas,
        bumpTextureImage: opts.bumpTextureCanvas,
        transparent,
      });

      // Calculate turntable offset matching current viewport timeline
      const t = ((opts.timelineTime ?? 0) % 10) / 10;
      let eased = t;
      if (opts.animationEasing === 'in') eased = t * t;
      else if (opts.animationEasing === 'out') eased = t * (2 - t);
      else if (opts.animationEasing === 'in-out') eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const rotationRad = eased * Math.PI * 2;

      offscreen.renderFrame(rotationRad);

      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      let dataUrl: string;
      if ('toDataURL' in offscreen.canvas) {
        dataUrl = (offscreen.canvas as HTMLCanvasElement).toDataURL(mime, quality);
      } else {
        const bmp = await createImageBitmap(offscreen.canvas as OffscreenCanvas);
        const tempC = document.createElement('canvas');
        tempC.width = targetW;
        tempC.height = targetH;
        const tempCtx = tempC.getContext('2d')!;
        tempCtx.drawImage(bmp, 0, 0);
        dataUrl = tempC.toDataURL(mime, quality);
      }

      const link = document.createElement('a');
      link.download = `EditorSuite_${ratio.replace(':', 'x')}_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
      link.href = dataUrl;
      link.click();
      offscreen.dispose();
      return;
    } catch (err) {
      console.warn('Native 3D offscreen image render failed, using fallback:', err);
    }
  }

  // 2. Fallback Path: Precise 2D Compositing of sourceCanvas with exact viewport background
  const sourceCanvas = opts.sourceCanvas;
  if (!sourceCanvas) {
    throw new Error('No canvas available for snapshot export.');
  }

  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = targetW;
  exportCanvas.height = targetH;
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  // Fill background if not transparent or if JPEG
  if (!transparent || format === 'jpeg') {
    if (sceneSettings) {
      if (sceneSettings.backgroundType === 'solid') {
        ctx.fillStyle = sceneSettings.backgroundColor || '#0c0c0c';
        ctx.fillRect(0, 0, targetW, targetH);
      } else if (sceneSettings.backgroundType === 'gradient') {
        const rad = ((sceneSettings.gradientAngle ?? 135) * Math.PI) / 180;
        const dx = Math.sin(rad);
        const dy = -Math.cos(rad);
        const length = Math.sqrt(targetW * targetW + targetH * targetH) / 2;
        const cx = targetW / 2;
        const cy = targetH / 2;
        const grad = ctx.createLinearGradient(
          cx - dx * length,
          cy - dy * length,
          cx + dx * length,
          cy + dy * length
        );
        grad.addColorStop(0, sceneSettings.gradientColor1 || '#2a2a2a');
        grad.addColorStop(1, sceneSettings.gradientColor2 || '#080808');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetW, targetH);
      } else if (sceneSettings.backgroundType === 'checkerboard') {
        const squareSize = 32;
        ctx.fillStyle = '#0c0c0c';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.fillStyle = '#181818';
        for (let y = 0; y < targetH; y += squareSize) {
          for (let x = 0; x < targetW; x += squareSize) {
            if ((Math.floor(x / squareSize) + Math.floor(y / squareSize)) % 2 === 0) {
              ctx.fillRect(x, y, squareSize, squareSize);
            }
          }
        }
      } else if (sceneSettings.backgroundType === 'image' && sceneSettings.backgroundImageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = sceneSettings.backgroundImageUrl;
          await new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          });
          const imgAspect = (img.width || 1) / (img.height || 1);
          const targetAspect = targetW / targetH;
          let dw = targetW;
          let dh = targetH;
          let ox = 0;
          let oy = 0;
          if (imgAspect > targetAspect) {
            dh = targetH;
            dw = targetH * imgAspect;
            ox = (targetW - dw) / 2;
          } else {
            dw = targetW;
            dh = targetW / imgAspect;
            oy = (targetH - dh) / 2;
          }
          ctx.drawImage(img, ox, oy, dw, dh);
        } catch {
          ctx.fillStyle = '#0c0c0c';
          ctx.fillRect(0, 0, targetW, targetH);
        }
      } else {
        ctx.fillStyle = '#0c0c0c';
        ctx.fillRect(0, 0, targetW, targetH);
      }
    } else {
      ctx.fillStyle = '#0c0c0c';
      ctx.fillRect(0, 0, targetW, targetH);
    }
  }

  // Draw scaled & centered snapshot
  const scale = Math.min(targetW / srcW, targetH / srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const offsetX = (targetW - drawW) / 2;
  const offsetY = (targetH - drawH) / 2;

  ctx.drawImage(sourceCanvas, offsetX, offsetY, drawW, drawH);

  // Trigger download
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const dataUrl = exportCanvas.toDataURL(mime, quality);
  const link = document.createElement('a');
  link.download = `EditorSuite_${ratio.replace(':', 'x')}_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
  link.href = dataUrl;
  link.click();
}

export interface VideoExportOptions {
  format: 'mp4' | 'webm';
  ratio: AspectRatio;
  fps: number;
  durationSeconds: number;
  modelType: ModelType;
  material: MaterialSettings;
  sceneSettings: SceneSettings;
  cameraPreset: CameraPreset;
  colorTextureCanvas?: HTMLCanvasElement | null;
  bumpTextureCanvas?: HTMLCanvasElement | null;
  transparent?: boolean;
  animationEasing?: AnimationEasing;
  sourceCanvasFallback?: HTMLCanvasElement | null;
  onProgress: (progress: Partial<ExportProgress>) => void;
}

/**
 * Modern Browser-based 3D 360° Turntable Video Export.
 * - OffscreenCanvas for isolated frame rendering
 * - Web Worker for background video encoding
 * - WebCodecs (Hardware H.264 / VP9) with MP4/WebM Muxer
 * - Non-blocking main thread with live progress and cancel support
 */
export async function exportTurntableVideo(options: VideoExportOptions): Promise<void> {
  const {
    format,
    ratio,
    fps = 60,
    durationSeconds = 6,
    modelType,
    material,
    sceneSettings,
    cameraPreset,
    colorTextureCanvas,
    bumpTextureCanvas,
    transparent = false,
    animationEasing = 'linear',
    sourceCanvasFallback,
    onProgress,
  } = options;

  cancelCurrentExport();
  const abortController = new AbortController();
  currentAbortController = abortController;
  const signal = abortController.signal;

  const { width, height } = computeExportDimensions(ratio, 1920, true);
  const totalFrames = Math.max(30, Math.round(durationSeconds * fps));

  onProgress({
    isExporting: true,
    type: 'video',
    stage: 'preparing',
    percent: 2,
    message: 'Preparing 3D offscreen renderer...',
    frameCurrent: 0,
    frameTotal: totalFrames,
    encoderType: 'Checking WebCodecs...',
  });

  const isWebCodecsSupported =
    typeof VideoEncoder !== 'undefined' &&
    typeof VideoFrame !== 'undefined' &&
    typeof Worker !== 'undefined';

  if (!isWebCodecsSupported) {
    console.info('WebCodecs not available in this browser. Using MediaRecorder fallback.');
    return fallbackMediaRecorderExport(options, signal);
  }

  let offscreenScene: Awaited<ReturnType<typeof createOffscreenScene>> | null = null;
  let worker: Worker | null = null;

  try {
    // 1. Build Offscreen Three.js Scene
    offscreenScene = await createOffscreenScene({
      width,
      height,
      modelType,
      material,
      sceneSettings,
      cameraPreset,
      colorTextureImage: colorTextureCanvas,
      bumpTextureImage: bumpTextureCanvas,
      transparent: format === 'webm' && transparent,
    });

    if (signal.aborted) throw new Error('Export cancelled');

    // 2. Spawn Web Worker for WebCodecs encoding & muxing
    worker = new Worker(
      new URL('../workers/videoExport.worker.ts', import.meta.url),
      { type: 'module' }
    );

    let isWorkerReady = false;
    let workerError: string | null = null;
    let encoderName = format === 'mp4' ? 'Hardware H.264' : 'WebCodecs VP9';
    let outputBuffer: ArrayBuffer | null = null;

    const workerCompletionPromise = new Promise<ArrayBuffer>((resolve, reject) => {
      if (!worker) return reject(new Error('Worker not created'));

      worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'ready') {
          isWorkerReady = true;
          encoderName = msg.encoderName || encoderName;
          onProgress({
            stage: 'rendering',
            percent: 5,
            message: `Encoder ready (${encoderName})`,
            encoderType: encoderName,
          });
        } else if (msg.type === 'complete') {
          outputBuffer = msg.buffer;
          resolve(msg.buffer);
        } else if (msg.type === 'error') {
          workerError = msg.error;
          reject(new Error(msg.error));
        } else if (msg.type === 'cancelled') {
          reject(new Error('Export cancelled'));
        }
      };

      worker.onerror = (err) => {
        workerError = err.message;
        reject(err);
      };
    });

    // 3. Initialize Worker
    worker.postMessage({
      type: 'init',
      format,
      width,
      height,
      fps,
      bitrate: 12_000_000, // 12 Mbps HD
      totalFrames,
    });

    // Wait briefly for worker ready
    let waitCount = 0;
    while (!isWorkerReady && !workerError && waitCount < 30) {
      if (signal.aborted) throw new Error('Export cancelled');
      await new Promise((r) => setTimeout(r, 50));
      waitCount++;
    }

    if (workerError) {
      throw new Error(`Worker initialization failed: ${workerError}`);
    }

    // 4. Render Frame-by-Frame Loop with Mathematical Seamless Turntable
    const frameDurationMicros = Math.round((1 / fps) * 1_000_000);

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (signal.aborted) {
        throw new Error('Export cancelled');
      }

      // Exact 360-degree rotation: Frame 0 = 0 rad (Front), Frame totalFrames - 1 advances seamlessly to next loop
      const t = frameIndex / totalFrames;
      let eased = t;
      if (animationEasing === 'in') {
        eased = t * t;
      } else if (animationEasing === 'out') {
        eased = t * (2 - t);
      } else if (animationEasing === 'in-out') {
        eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }

      const rotationRad = eased * Math.PI * 2;

      // Render 3D frame to OffscreenCanvas
      offscreenScene.renderFrame(rotationRad);

      // Extract frame as zero-copy ImageBitmap
      const bitmap = await createImageBitmap(offscreenScene.canvas);

      const timestampMicros = frameIndex * frameDurationMicros;
      const isKeyFrame = frameIndex % fps === 0;

      // Transfer bitmap to Web Worker (transfers ownership, 0 CPU copy)
      worker.postMessage(
        {
          type: 'encode_frame',
          bitmap,
          frameIndex: frameIndex + 1,
          timestampMicros,
          durationMicros: frameDurationMicros,
          isKeyFrame,
        },
        [bitmap]
      );

      // Main-thread cooperative multitasking: yields execution so UI never freezes
      await new Promise((r) => setTimeout(r, 0));

      const renderPercent = Math.round(5 + (frameIndex / totalFrames) * 85);
      onProgress({
        isExporting: true,
        type: 'video',
        stage: 'rendering',
        percent: renderPercent,
        message: `Rendering 360° frame ${frameIndex + 1}/${totalFrames}`,
        frameCurrent: frameIndex + 1,
        frameTotal: totalFrames,
        encoderType: encoderName,
      });
    }

    // 5. Finalize Encoding and Muxing in Worker
    onProgress({
      stage: 'finalizing',
      percent: 94,
      message: `Finalizing ${format.toUpperCase()} container...`,
      encoderType: encoderName,
    });

    worker.postMessage({ type: 'finish' });
    const finalBuffer = await workerCompletionPromise;

    // 6. Download Resulting File
    const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm';
    const blob = new Blob([finalBuffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EditorSuite_360_Turntable_${Date.now()}.${format}`;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 60_000);

    onProgress({
      isExporting: false,
      stage: 'complete',
      percent: 100,
      message: 'Video export completed successfully!',
    });
  } catch (err: any) {
    if (signal.aborted || err?.message === 'Export cancelled') {
      onProgress({
        isExporting: false,
        stage: 'cancelled',
        percent: 0,
        message: 'Export was cancelled.',
      });
    } else {
      console.warn('WebCodecs export encountered an issue, trying fallback:', err);
      // Fallback
      if (sourceCanvasFallback) {
        return fallbackMediaRecorderExport(options, signal);
      }
      onProgress({
        isExporting: false,
        stage: 'error',
        percent: 0,
        message: `Export error: ${err.message || 'Unknown error'}`,
      });
      throw err;
    }
  } finally {
    // 7. Cleanup Worker, Offscreen Canvas, and Memory
    if (worker) {
      if (signal.aborted) {
        try {
          worker.postMessage({ type: 'cancel' });
        } catch {}
      }
      worker.terminate();
      worker = null;
    }

    if (offscreenScene) {
      offscreenScene.dispose();
      offscreenScene = null;
    }

    currentAbortController = null;
  }
}

/**
 * Graceful Fallback: MediaRecorder when WebCodecs is unavailable.
 */
async function fallbackMediaRecorderExport(
  options: VideoExportOptions,
  signal: AbortSignal
): Promise<void> {
  const {
    sourceCanvasFallback,
    durationSeconds = 6,
    onProgress,
  } = options;

  if (!sourceCanvasFallback) {
    throw new Error('Canvas not available for fallback export');
  }

  return new Promise((resolve, reject) => {
    try {
      const getStream =
        (sourceCanvasFallback as any).captureStream ||
        (sourceCanvasFallback as any).mozCaptureStream;

      if (!getStream || typeof MediaRecorder === 'undefined') {
        throw new Error('Video recording not supported in this browser.');
      }

      const stream = getStream.call(sourceCanvasFallback, 60);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 10_000_000,
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        if (signal.aborted) {
          onProgress({ isExporting: false, stage: 'cancelled', message: 'Export cancelled' });
          return resolve();
        }

        onProgress({ stage: 'finalizing', percent: 96, message: 'Saving WebM video...' });
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `EditorSuite_360_Turntable_${Date.now()}.webm`;
        link.click();

        onProgress({ isExporting: false, stage: 'complete', percent: 100, message: 'Complete!' });
        resolve();
      };

      const interval = setInterval(() => {
        if (signal.aborted) {
          clearInterval(interval);
          try { recorder.stop(); } catch {}
          return resolve();
        }
      }, 200);

      recorder.start(100);

      const startTime = performance.now();
      const tick = setInterval(() => {
        if (signal.aborted) {
          clearInterval(tick);
          return;
        }
        const elapsed = (performance.now() - startTime) / 1000;
        const progress = Math.min(92, Math.round((elapsed / durationSeconds) * 92));
        onProgress({
          isExporting: true,
          type: 'video',
          stage: 'rendering',
          percent: progress,
          message: `Recording 360° frames... (${progress}%)`,
          encoderType: 'MediaRecorder (Fallback)',
        });

        if (elapsed >= durationSeconds) {
          clearInterval(tick);
          recorder.stop();
        }
      }, 100);
    } catch (e) {
      reject(e);
    }
  });
}

// Backwards-compatible alias
export const recordTurntableVideo = async (
  sourceCanvas: HTMLCanvasElement,
  format: 'webm' | 'mp4',
  durationSeconds = 6,
  onProgress: (progress: Partial<ExportProgress>) => void
): Promise<void> => {
  return fallbackMediaRecorderExport({
    format,
    ratio: '16:9',
    fps: 60,
    durationSeconds,
    modelType: 'o-neck',
    material: {
      fabricColor: '#ffffff',
      roughness: 0.6,
      sheen: 0.2,
      normalIntensity: 0.5,
      metallic: 0.05,
    },
    sceneSettings: {} as any,
    cameraPreset: 'front',
    sourceCanvasFallback: sourceCanvas,
    onProgress,
  }, new AbortController().signal);
};
