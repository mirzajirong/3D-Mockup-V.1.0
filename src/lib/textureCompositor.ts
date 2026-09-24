import * as THREE from 'three';
import { DesignLayer, MaterialSettings } from '../types';
import { createUVGuideOverlay } from '../assets/sampleTextures';

// Image element cache to avoid re-decoding SVGs and uploaded images every tick
const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete) return Promise.resolve(cached);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (err) => {
      console.warn('Failed to load layer image:', src, err);
      reject(err);
    };
    img.src = src;
  });
}

export class TextureCompositor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private bumpCanvas: HTMLCanvasElement;
  private bumpTexture: THREE.CanvasTexture;
  private uvGuideImg: HTMLImageElement | null = null;
  private isRendering = false;

  constructor(width = 2048, height = 2048) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.anisotropy = 8;

    // Separate normal / bump canvas for fabric texture
    this.bumpCanvas = document.createElement('canvas');
    this.bumpCanvas.width = 512;
    this.bumpCanvas.height = 512;
    this.generateFabricBump();
    this.bumpTexture = new THREE.CanvasTexture(this.bumpCanvas);
    this.bumpTexture.wrapS = THREE.RepeatWrapping;
    this.bumpTexture.wrapT = THREE.RepeatWrapping;
    this.bumpTexture.repeat.set(16, 16);

    // Preload official 01.O-Neck UV guide (local first, then remote CDN, then generated SVG)
    loadImage('/assets/01.O-Neck.svg')
      .catch(() => loadImage('https://cloud.editorsuite.id/resource-app/svg-uv-map/01.O-Neck.svg'))
      .catch(() => loadImage(createUVGuideOverlay()))
      .then((img) => {
        this.uvGuideImg = img;
      })
      .catch((err) => {
        console.warn('Could not initialize UV guide image:', err);
      });
  }

  private generateFabricBump() {
    const bCtx = this.bumpCanvas.getContext('2d');
    if (!bCtx) return;
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 512);

    // Render athletic polyester diamond-weave bump pattern
    bCtx.strokeStyle = '#999999';
    bCtx.lineWidth = 1;
    for (let x = 0; x < 512; x += 8) {
      for (let y = 0; y < 512; y += 8) {
        bCtx.beginPath();
        bCtx.arc(x + 4, y + 4, 1.8, 0, Math.PI * 2);
        bCtx.fillStyle = (x + y) % 16 === 0 ? '#606060' : '#b0b0b0';
        bCtx.fill();
      }
    }
  }

  public getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  public getBumpTexture(): THREE.CanvasTexture {
    return this.bumpTexture;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getBumpCanvas(): HTMLCanvasElement {
    return this.bumpCanvas;
  }

  public async compose(
    material: MaterialSettings,
    layers: DesignLayer[],
    showUVGuide: boolean
  ): Promise<void> {
    if (this.isRendering) return;
    this.isRendering = true;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    try {
      // 1. Fill base fabric color
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = material.fabricColor;
      ctx.fillRect(0, 0, w, h);

      // 2. Subtle micro polyester knit texture overlay on base color
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < w; i += 16) {
        ctx.fillRect(i, 0, 2, h);
      }
      ctx.fillStyle = '#000000';
      for (let j = 0; j < h; j += 16) {
        ctx.fillRect(0, j, w, 2);
      }
      ctx.globalAlpha = 1.0;

      // 3. Draw layers in reverse order (bottom to top)
      const visibleLayers = [...layers].reverse().filter((l) => l.visible);

      for (const layer of visibleLayers) {
        try {
          const img = await loadImage(layer.src);
          ctx.save();

          // Set blend mode
          const modeMap: Record<string, GlobalCompositeOperation> = {
            normal: 'source-over',
            multiply: 'multiply',
            screen: 'screen',
            overlay: 'overlay',
          };
          ctx.globalCompositeOperation = modeMap[layer.blendMode] || 'source-over';
          ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity));

          // Calculate center position
          const centerX = w * 0.5 + layer.x * (w * 0.5);
          const centerY = h * 0.5 + layer.y * (h * 0.5);

          ctx.translate(centerX, centerY);
          if (layer.rotation) {
            ctx.rotate((layer.rotation * Math.PI) / 180);
          }

          // Calculate dimensions
          const targetW = w * layer.scale;
          const aspectRatio = (img.width || 1) / (img.height || 1);
          const targetH = targetW / aspectRatio;

          ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
          ctx.restore();
        } catch (err) {
          console.warn('Could not draw layer', layer.name, err);
        }
      }

      // 4. Draw UV guide wireframe if toggled
      if (showUVGuide && this.uvGuideImg) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.85;
        ctx.drawImage(this.uvGuideImg, 0, 0, w, h);
        ctx.restore();
      }

      // Notify Three.js that texture pixels changed
      this.texture.needsUpdate = true;
    } finally {
      this.isRendering = false;
    }
  }
}
