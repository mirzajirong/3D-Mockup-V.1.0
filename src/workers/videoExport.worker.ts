import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4ArrayBufferTarget } from 'mp4-muxer';
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmArrayBufferTarget } from 'webm-muxer';

export interface InitExportMessage {
  type: 'init';
  format: 'mp4' | 'webm';
  width: number;
  height: number;
  fps: number;
  bitrate?: number;
  totalFrames: number;
}

export interface EncodeFrameMessage {
  type: 'encode_frame';
  bitmap: ImageBitmap;
  frameIndex: number;
  timestampMicros: number;
  durationMicros: number;
  isKeyFrame: boolean;
}

export interface FinishExportMessage {
  type: 'finish';
}

export interface CancelExportMessage {
  type: 'cancel';
}

export type WorkerInMessage =
  | InitExportMessage
  | EncodeFrameMessage
  | FinishExportMessage
  | CancelExportMessage;

let encoder: VideoEncoder | null = null;
let mp4Muxer: Mp4Muxer<Mp4ArrayBufferTarget> | null = null;
let webmMuxer: WebmMuxer<WebmArrayBufferTarget> | null = null;
let currentFormat: 'mp4' | 'webm' = 'mp4';
let totalFramesCount = 0;
let isCancelled = false;

self.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  const data = e.data;

  try {
    if (data.type === 'init') {
      isCancelled = false;
      currentFormat = data.format;
      totalFramesCount = data.totalFrames;

      const width = data.width % 2 === 0 ? data.width : data.width - 1;
      const height = data.height % 2 === 0 ? data.height : data.height - 1;
      const fps = data.fps;
      const bitrate = data.bitrate || 10_000_000; // 10 Mbps for crisp 1080p

      if (typeof VideoEncoder === 'undefined') {
        throw new Error('WebCodecs VideoEncoder is not supported in this environment');
      }

      if (currentFormat === 'mp4') {
        // Try H.264 profiles with prefer-hardware
        const candidateCodecs = [
          'avc1.4d002a', // Main Profile, Level 4.2
          'avc1.64002a', // High Profile, Level 4.2
          'avc1.42001f', // Baseline Profile, Level 3.1
        ];

        let selectedCodec = candidateCodecs[0];
        let isHardware = false;

        for (const codec of candidateCodecs) {
          try {
            const support = await VideoEncoder.isConfigSupported({
              codec,
              width,
              height,
              bitrate,
              framerate: fps,
              hardwareAcceleration: 'prefer-hardware',
            });
            if (support.supported) {
              selectedCodec = codec;
              isHardware = support.config?.hardwareAcceleration === 'prefer-hardware';
              break;
            }
          } catch {
            // try next candidate
          }
        }

        mp4Muxer = new Mp4Muxer({
          target: new Mp4ArrayBufferTarget(),
          video: {
            codec: 'avc',
            width,
            height,
          },
          fastStart: 'in-memory',
          firstTimestampBehavior: 'offset',
        });

        encoder = new VideoEncoder({
          output: (chunk, meta) => {
            if (!isCancelled && mp4Muxer) {
              mp4Muxer.addVideoChunk(chunk, meta);
            }
          },
          error: (err) => {
            self.postMessage({ type: 'error', error: err.message || String(err) });
          },
        });

        encoder.configure({
          codec: selectedCodec,
          width,
          height,
          bitrate,
          framerate: fps,
          hardwareAcceleration: 'prefer-hardware',
        });

        self.postMessage({
          type: 'ready',
          codec: selectedCodec,
          hardwareAccelerated: isHardware,
          encoderName: `Hardware H.264 (${selectedCodec})`,
        });
      } else {
        // WEBM Format (VP9 or VP8)
        const candidateCodecs = ['vp09.00.10.08', 'vp8'];
        let selectedCodec = candidateCodecs[0];
        let webmVideoCodec: 'V_VP9' | 'V_VP8' = 'V_VP9';

        for (const codec of candidateCodecs) {
          try {
            const support = await VideoEncoder.isConfigSupported({
              codec,
              width,
              height,
              bitrate,
              framerate: fps,
              hardwareAcceleration: 'prefer-hardware',
            });
            if (support.supported) {
              selectedCodec = codec;
              webmVideoCodec = codec.startsWith('vp09') ? 'V_VP9' : 'V_VP8';
              break;
            }
          } catch {
            // next
          }
        }

        webmMuxer = new WebmMuxer({
          target: new WebmArrayBufferTarget(),
          video: {
            codec: webmVideoCodec,
            width,
            height,
            frameRate: fps,
          },
        });

        encoder = new VideoEncoder({
          output: (chunk, meta) => {
            if (!isCancelled && webmMuxer) {
              webmMuxer.addVideoChunk(chunk, meta);
            }
          },
          error: (err) => {
            self.postMessage({ type: 'error', error: err.message || String(err) });
          },
        });

        encoder.configure({
          codec: selectedCodec,
          width,
          height,
          bitrate,
          framerate: fps,
          hardwareAcceleration: 'prefer-hardware',
        });

        self.postMessage({
          type: 'ready',
          codec: selectedCodec,
          hardwareAccelerated: true,
          encoderName: `WebCodecs ${webmVideoCodec === 'V_VP9' ? 'VP9' : 'VP8'}`,
        });
      }
    } else if (data.type === 'encode_frame') {
      if (isCancelled || !encoder) {
        data.bitmap.close();
        return;
      }

      const { bitmap, frameIndex, timestampMicros, durationMicros, isKeyFrame } = data;
      const videoFrame = new VideoFrame(bitmap, {
        timestamp: timestampMicros,
        duration: durationMicros,
      });

      // Free ImageBitmap from memory immediately
      bitmap.close();

      encoder.encode(videoFrame, { keyFrame: isKeyFrame });

      // Free VideoFrame from memory immediately
      videoFrame.close();

      self.postMessage({
        type: 'frame_encoded',
        frameIndex,
        totalFrames: totalFramesCount,
        queueSize: encoder.encodeQueueSize,
      });
    } else if (data.type === 'finish') {
      if (isCancelled || !encoder) return;

      await encoder.flush();
      encoder.close();
      encoder = null;

      let buffer: ArrayBuffer;
      if (currentFormat === 'mp4' && mp4Muxer) {
        mp4Muxer.finalize();
        buffer = mp4Muxer.target.buffer;
        mp4Muxer = null;
      } else if (webmMuxer) {
        webmMuxer.finalize();
        buffer = webmMuxer.target.buffer;
        webmMuxer = null;
      } else {
        throw new Error('Muxer not initialized');
      }

      (self as any).postMessage({ type: 'complete', buffer }, [buffer]);
    } else if (data.type === 'cancel') {
      isCancelled = true;
      if (encoder) {
        try {
          encoder.close();
        } catch {}
        encoder = null;
      }
      mp4Muxer = null;
      webmMuxer = null;
      self.postMessage({ type: 'cancelled' });
    }
  } catch (err: any) {
    self.postMessage({
      type: 'error',
      error: err?.message || String(err),
    });
  }
};
