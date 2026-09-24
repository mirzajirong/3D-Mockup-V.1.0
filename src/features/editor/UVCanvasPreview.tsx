import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { APP_CONFIG } from '../../config/constants';

interface DragState {
  type: 'move' | 'scale' | 'rotate';
  startX: number;
  startY: number;
  initialLayerX: number;
  initialLayerY: number;
  initialScale: number;
  initialRotation: number;
  cornerIndex?: number;
}

export const UVCanvasPreview: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layers = useEditorStore((s) => s.layers);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const material = useEditorStore((s) => s.material);
  const showUVGuide = useEditorStore((s) => s.showUVGuide);
  const setShowUVGuide = useEditorStore((s) => s.setShowUVGuide);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [cursorStyle, setCursorStyle] = useState<string>('default');
  const [imagesCache, setImagesCache] = useState<Record<string, HTMLImageElement>>({});
  const [uvSvgImg, setUvSvgImg] = useState<HTMLImageElement | null>(null);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // Preload official UV map (local bundled asset to prevent CORS canvas tainting)
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setUvSvgImg(img);
    };
    img.onerror = () => {
      const fallback = new Image();
      fallback.crossOrigin = 'anonymous';
      fallback.src = 'https://cloud.editorsuite.id/resource-app/svg-uv-map/01.O-Neck.svg';
      fallback.onload = () => setUvSvgImg(fallback);
    };
    img.src = '/assets/01.O-Neck.svg';
  }, []);

  // Preload and cache layer images
  useEffect(() => {
    layers.forEach((layer) => {
      if (!imagesCache[layer.src]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = layer.src;
        img.onload = () => {
          setImagesCache((prev) => ({ ...prev, [layer.src]: img }));
        };
      }
    });
  }, [layers, imagesCache]);

  // Compute bounding box coordinates for a layer
  const getLayerTransform = useCallback(
    (layer: typeof layers[0], width: number, height: number) => {
      const cx = width * 0.5 + layer.x * (width * 0.5);
      const cy = height * 0.5 + layer.y * (height * 0.5);
      const drawW = width * layer.scale;
      const img = imagesCache[layer.src];
      const aspect = (img?.width || 1) / (img?.height || 1);
      const drawH = drawW / aspect;
      return { cx, cy, drawW, drawH, rotRad: ((layer.rotation || 0) * Math.PI) / 180 };
    },
    [imagesCache]
  );

  // Render 2D UV Preview
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Clear & Background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = material.fabricColor || '#141414';
    ctx.fillRect(0, 0, w, h);

    // 2. Draw Vector UV Guide Outlines (Front, Back, Collar, Sleeves)
    if (showUVGuide) {
      if (uvSvgImg) {
        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.drawImage(uvSvgImg, 0, 0, w, h);
        ctx.restore();
      } else {
        ctx.save();
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 1.2;
        ctx.lineJoin = 'round';

        // --- FRONT JERSEY BODY (Left) ---
        ctx.beginPath();
        ctx.moveTo(w * 0.28, h * 0.12);
        ctx.quadraticCurveTo(w * 0.35, h * 0.15, w * 0.42, h * 0.12);
        ctx.lineTo(w * 0.45, h * 0.13);
        ctx.quadraticCurveTo(w * 0.47, h * 0.22, w * 0.49, h * 0.28);
        ctx.lineTo(w * 0.49, h * 0.56);
        ctx.lineTo(w * 0.23, h * 0.56);
        ctx.lineTo(w * 0.23, h * 0.28);
        ctx.quadraticCurveTo(w * 0.25, h * 0.22, w * 0.27, h * 0.13);
        ctx.closePath();
        ctx.stroke();

        // Front collar rib
        ctx.beginPath();
        ctx.roundRect(w * 0.26, h * 0.08, w * 0.20, h * 0.02, 2);
        ctx.stroke();

        // --- BACK JERSEY BODY (Right) ---
        ctx.beginPath();
        ctx.moveTo(w * 0.56, h * 0.12);
        ctx.quadraticCurveTo(w * 0.63, h * 0.13, w * 0.70, h * 0.12);
        ctx.lineTo(w * 0.73, h * 0.13);
        ctx.quadraticCurveTo(w * 0.75, h * 0.22, w * 0.77, h * 0.28);
        ctx.lineTo(w * 0.77, h * 0.56);
        ctx.lineTo(w * 0.51, h * 0.56);
        ctx.lineTo(w * 0.51, h * 0.28);
        ctx.quadraticCurveTo(w * 0.53, h * 0.22, w * 0.55, h * 0.13);
        ctx.closePath();
        ctx.stroke();

        // Back collar rib
        ctx.beginPath();
        ctx.roundRect(w * 0.54, h * 0.08, w * 0.18, h * 0.02, 2);
        ctx.stroke();

        // --- LEFT SLEEVE (Bottom Left) ---
        ctx.beginPath();
        ctx.moveTo(w * 0.36, h * 0.62);
        ctx.lineTo(w * 0.42, h * 0.62);
        ctx.quadraticCurveTo(w * 0.48, h * 0.72, w * 0.49, h * 0.82);
        ctx.lineTo(w * 0.30, h * 0.82);
        ctx.quadraticCurveTo(w * 0.31, h * 0.72, w * 0.36, h * 0.62);
        ctx.closePath();
        ctx.stroke();

        // --- RIGHT SLEEVE (Bottom Right) ---
        ctx.beginPath();
        ctx.moveTo(w * 0.58, h * 0.62);
        ctx.lineTo(w * 0.64, h * 0.62);
        ctx.quadraticCurveTo(w * 0.69, h * 0.72, w * 0.70, h * 0.82);
        ctx.lineTo(w * 0.51, h * 0.82);
        ctx.quadraticCurveTo(w * 0.52, h * 0.72, w * 0.58, h * 0.62);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. Draw Design Layers (bottom to top)
    const visibleLayers = [...layers].reverse().filter((l) => l.visible);

    visibleLayers.forEach((layer) => {
      const img = imagesCache[layer.src];
      if (!img) return;

      const { cx, cy, drawW, drawH, rotRad } = getLayerTransform(layer, w, h);

      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.translate(cx, cy);
      if (rotRad) ctx.rotate(rotRad);

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      // 4. Draw Transform Handles if Active/Selected Layer
      if (layer.id === selectedLayerId) {
        // Thin white bounding box
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-drawW / 2, -drawH / 2, drawW, drawH);

        // 4 Corner Handles (small white squares with subtle shadow)
        const hs = 7; // handle size
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        const corners = [
          [-drawW / 2, -drawH / 2], // top-left
          [drawW / 2, -drawH / 2],  // top-right
          [drawW / 2, drawH / 2],   // bottom-right
          [-drawW / 2, drawH / 2],  // bottom-left
        ];

        corners.forEach(([x, y]) => {
          ctx.fillRect(x - hs / 2, y - hs / 2, hs, hs);
          ctx.strokeRect(x - hs / 2, y - hs / 2, hs, hs);
        });

        // Top stem to rotation handle (as seen in image.png)
        const stemLength = 22;
        ctx.beginPath();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.moveTo(0, -drawH / 2);
        ctx.lineTo(0, -drawH / 2 - stemLength);
        ctx.stroke();

        // Circular rotation handle ring
        const rotY = -drawH / 2 - stemLength;
        const rotRadius = 5.5;
        ctx.beginPath();
        ctx.arc(0, rotY, rotRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [layers, selectedLayerId, material.fabricColor, showUVGuide, imagesCache, getLayerTransform]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Transform coordinates from mouse event to canvas space
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Pointer Down: Hit test for Image, Corner Resize, or Top Rotation Handle
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectedLayer || selectedLayer.locked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoords(e);
    const { cx, cy, drawW, drawH, rotRad } = getLayerTransform(selectedLayer, canvas.width, canvas.height);

    // Convert click point to layer's local coordinate system (unrotated)
    const dx = x - cx;
    const dy = y - cy;
    const localX = dx * Math.cos(-rotRad) - dy * Math.sin(-rotRad);
    const localY = dx * Math.sin(-rotRad) + dy * Math.cos(-rotRad);

    const hs = 12; // hit tolerance
    const stemLength = 22;
    const rotHandleY = -drawH / 2 - stemLength;

    // 1. Check Rotation Handle (top circle)
    const distToRot = Math.hypot(localX, localY - rotHandleY);
    if (distToRot <= hs) {
      canvas.setPointerCapture(e.pointerId);
      setDragState({
        type: 'rotate',
        startX: e.clientX,
        startY: e.clientY,
        initialLayerX: selectedLayer.x,
        initialLayerY: selectedLayer.y,
        initialScale: selectedLayer.scale,
        initialRotation: selectedLayer.rotation,
      });
      return;
    }

    // 2. Check Corner Resize Handles
    const corners = [
      { x: -drawW / 2, y: -drawH / 2, idx: 0 },
      { x: drawW / 2, y: -drawH / 2, idx: 1 },
      { x: drawW / 2, y: drawH / 2, idx: 2 },
      { x: -drawW / 2, y: drawH / 2, idx: 3 },
    ];

    for (const c of corners) {
      if (Math.abs(localX - c.x) <= hs && Math.abs(localY - c.y) <= hs) {
        canvas.setPointerCapture(e.pointerId);
        setDragState({
          type: 'scale',
          startX: e.clientX,
          startY: e.clientY,
          initialLayerX: selectedLayer.x,
          initialLayerY: selectedLayer.y,
          initialScale: selectedLayer.scale,
          initialRotation: selectedLayer.rotation,
          cornerIndex: c.idx,
        });
        return;
      }
    }

    // 3. Check Inside Bounding Box (Move Drag)
    if (
      localX >= -drawW / 2 &&
      localX <= drawW / 2 &&
      localY >= -drawH / 2 &&
      localY <= drawH / 2
    ) {
      canvas.setPointerCapture(e.pointerId);
      setDragState({
        type: 'move',
        startX: e.clientX,
        startY: e.clientY,
        initialLayerX: selectedLayer.x,
        initialLayerY: selectedLayer.y,
        initialScale: selectedLayer.scale,
        initialRotation: selectedLayer.rotation,
      });
      return;
    }
  };

  // Pointer Move: Update transformation in real-time
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // If dragging active:
    if (dragState && selectedLayer && !selectedLayer.locked) {
      const rect = canvas.getBoundingClientRect();
      const deltaScreenX = e.clientX - dragState.startX;
      const deltaScreenY = e.clientY - dragState.startY;

      if (dragState.type === 'move') {
        // Delta in normalized [-1, 1] layer coordinates
        const deltaNormX = (deltaScreenX / rect.width) * 2;
        const deltaNormY = (deltaScreenY / rect.height) * 2;

        const newX = Math.max(-1, Math.min(1, dragState.initialLayerX + deltaNormX));
        const newY = Math.max(-1, Math.min(1, dragState.initialLayerY + deltaNormY));

        updateLayer(selectedLayer.id, { x: newX, y: newY });
      } else if (dragState.type === 'scale') {
        // Scale proportionally based on drag distance
        const distChange = Math.hypot(deltaScreenX, deltaScreenY);
        const sign = deltaScreenX + deltaScreenY > 0 ? 1 : -1;
        const scaleChange = (sign * distChange) / (rect.width * 0.7);
        const nextScale = Math.max(0.04, Math.min(1.5, dragState.initialScale + scaleChange));

        updateLayer(selectedLayer.id, { scale: parseFloat(nextScale.toFixed(3)) });
      } else if (dragState.type === 'rotate') {
        const { cx, cy } = getLayerTransform(selectedLayer, canvas.width, canvas.height);
        const { x, y } = getCanvasCoords(e);
        const rad = Math.atan2(y - cy, x - cx);
        let deg = (rad * 180) / Math.PI + 90; // offset so top handle is 0 deg
        if (deg < 0) deg += 360;
        deg = Math.round(deg % 360);

        updateLayer(selectedLayer.id, { rotation: deg });
      }
      return;
    }

    // Otherwise, hit test to update hover cursor
    if (!selectedLayer) {
      setCursorStyle('default');
      return;
    }

    const { x, y } = getCanvasCoords(e);
    const { cx, cy, drawW, drawH, rotRad } = getLayerTransform(selectedLayer, canvas.width, canvas.height);
    const dx = x - cx;
    const dy = y - cy;
    const localX = dx * Math.cos(-rotRad) - dy * Math.sin(-rotRad);
    const localY = dx * Math.sin(-rotRad) + dy * Math.cos(-rotRad);

    const hs = 12;
    const stemLength = 22;
    const rotHandleY = -drawH / 2 - stemLength;

    if (Math.hypot(localX, localY - rotHandleY) <= hs) {
      setCursorStyle('crosshair');
    } else if (
      (Math.abs(localX - -drawW / 2) <= hs && Math.abs(localY - -drawH / 2) <= hs) ||
      (Math.abs(localX - drawW / 2) <= hs && Math.abs(localY - drawH / 2) <= hs)
    ) {
      setCursorStyle('nwse-resize');
    } else if (
      (Math.abs(localX - drawW / 2) <= hs && Math.abs(localY - -drawH / 2) <= hs) ||
      (Math.abs(localX - -drawW / 2) <= hs && Math.abs(localY - drawH / 2) <= hs)
    ) {
      setCursorStyle('nesw-resize');
    } else if (
      localX >= -drawW / 2 &&
      localX <= drawW / 2 &&
      localY >= -drawH / 2 &&
      localY <= drawH / 2
    ) {
      setCursorStyle('move');
    } else {
      setCursorStyle('default');
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragState) {
      setDragState(null);
      try {
        canvasRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture released
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full bg-[#0c0c0c] rounded-[4px] border border-[#262626] overflow-hidden select-none"
    >
      {/* Top-Right: [ 👁 Guide ] button as shown in image.png */}
      <button
        id="uv-guide-toggle-btn"
        type="button"
        onClick={() => setShowUVGuide(!showUVGuide)}
        className={`absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2 py-1 rounded-[4px] border text-xs font-medium backdrop-blur-md transition-colors cursor-pointer ${
          showUVGuide
            ? 'bg-[#181818]/90 border-[#444444] text-white shadow-xs'
            : 'bg-[#121212]/80 border-[#262626] text-[#777777] hover:text-white'
        }`}
        title="Toggle UV Guide Wireframe"
      >
        {showUVGuide ? (
          <EyeIcon className="w-3.5 h-3.5 text-white" />
        ) : (
          <EyeSlashIcon className="w-3.5 h-3.5 text-[#777777]" />
        )}
        <span className="text-[11px] tracking-tight">Guide</span>
      </button>

      {/* Main Interactive UV Canvas */}
      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full object-contain block"
        style={{ cursor: cursorStyle }}
      />
    </div>
  );
};
