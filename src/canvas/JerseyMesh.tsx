import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ModelType, MaterialSettings } from '../types';
import { useEditorStore } from '../store/editorStore';

interface JerseyMeshProps {
  modelType: ModelType;
  materialSettings: MaterialSettings;
  colorTexture: THREE.CanvasTexture | null;
  bumpTexture: THREE.CanvasTexture | null;
  isRotating: boolean;
  modelX?: number;
  modelY?: number;
  modelZ?: number;
  modelRotation?: number;
  modelScale?: number;
}

/**
 * Creates an athletic T-Shirt / Jersey geometry with realistic fabric curvature,
 * sleeves, collar styles (O-Neck, V-Neck, Polo), and clean UV mapping.
 */
export function createJerseyGeometry(modelType: ModelType): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Resolution parameters
  const radialSegments = 48; // around the body
  const heightSegments = 36; // from hem to shoulder
  const radiusBottom = 1.05;
  const radiusWaist = 0.98;
  const radiusChest = 1.12;
  const height = 2.4;

  // 1. Generate Main Torso Body
  const grid: number[][] = [];

  for (let yIdx = 0; yIdx <= heightSegments; yIdx++) {
    const row: number[] = [];
    const v = yIdx / heightSegments; // 0 at bottom, 1 at shoulder
    const y = -1.2 + v * height;

    // Radius interpolation (waist taper + chest volume + natural drape)
    let r = radiusBottom;
    if (v < 0.4) {
      // Hem to waist
      const t = v / 0.4;
      r = THREE.MathUtils.lerp(radiusBottom, radiusWaist, t);
    } else {
      // Waist to chest/shoulders
      const t = (v - 0.4) / 0.6;
      r = THREE.MathUtils.lerp(radiusWaist, radiusChest, t);
    }

    // Flatten slightly on front/back depth for natural torso cross-section (elliptical)
    for (let xIdx = 0; xIdx <= radialSegments; xIdx++) {
      const u = xIdx / radialSegments;
      const angle = u * Math.PI * 2 - Math.PI / 2; // angle around torso

      // Elliptical cross-section: wider left-right (X), narrower front-back (Z)
      const xRadius = r * 1.08;
      const zRadius = r * 0.62;

      let px = Math.cos(angle) * xRadius;
      let pz = Math.sin(angle) * zRadius;

      // Subtle fabric drape wave folds
      const foldIntensity = 0.025 * Math.sin(y * 8 + angle * 2);
      px += Math.cos(angle) * foldIntensity;
      pz += Math.sin(angle) * foldIntensity;

      // Collar cut-down on chest for neck opening near top
      let py = y;
      const isChestFront = Math.abs(angle + Math.PI / 2) < 0.65;
      if (v > 0.82 && isChestFront) {
        const neckDist = 1 - Math.abs(angle + Math.PI / 2) / 0.65;
        if (modelType === 'v-neck') {
          py -= neckDist * 0.35; // Deeper V cutout
        } else if (modelType === 'polo') {
          py -= neckDist * 0.22;
        } else {
          py -= neckDist * 0.18; // O-neck curve
        }
      }

      vertices.push(px, py, pz);

      // UV Coordinates: Map chest front directly to center of UV space
      // Front is around angle = -PI/2 (u = 0.5)
      uvs.push(u, v);
      normals.push(0, 1, 0); // Placeholder, computed later

      row.push(vertices.length / 3 - 1);
    }
    grid.push(row);
  }

  // Create torso quad faces
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = grid[y][x];
      const b = grid[y + 1][x];
      const c = grid[y + 1][x + 1];
      const d = grid[y][x + 1];
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // 2. Generate Left and Right Sleeves
  const generateSleeve = (isLeft: boolean) => {
    const sleeveLength = modelType === 'long-sleeve' ? 1.7 : 0.82;
    const sleeveSegmentsL = 16;
    const sleeveSegmentsR = 24;
    const side = isLeft ? 1 : -1;
    const startX = side * 1.15;
    const startY = 0.72;
    const startZ = 0;

    const sleeveGrid: number[][] = [];

    for (let s = 0; s <= sleeveSegmentsL; s++) {
      const row: number[] = [];
      const t = s / sleeveSegmentsL;
      // Angle down and outwards
      const sx = startX + side * t * sleeveLength * 0.85;
      const sy = startY - t * sleeveLength * 0.6;
      const sz = startZ - t * 0.08;
      const sleeveRadius = THREE.MathUtils.lerp(0.42, 0.34, t);

      for (let r = 0; r <= sleeveSegmentsR; r++) {
        const u = r / sleeveSegmentsR;
        const angle = u * Math.PI * 2;

        const vx = sx + Math.cos(angle) * (sleeveRadius * 0.35) * side;
        const vy = sy + Math.sin(angle) * sleeveRadius;
        const vz = sz + Math.cos(angle) * sleeveRadius;

        vertices.push(vx, vy, vz);

        // UV mapping for sleeves placed in top quadrants
        const uvX = isLeft ? 0.05 + u * 0.25 : 0.7 + u * 0.25;
        const uvY = 0.75 + t * 0.22;
        uvs.push(uvX, uvY);
        normals.push(0, 1, 0);

        row.push(vertices.length / 3 - 1);
      }
      sleeveGrid.push(row);
    }

    for (let s = 0; s < sleeveSegmentsL; s++) {
      for (let r = 0; r < sleeveSegmentsR; r++) {
        const a = sleeveGrid[s][r];
        const b = sleeveGrid[s + 1][r];
        const c = sleeveGrid[s + 1][r + 1];
        const d = sleeveGrid[s][r + 1];
        if (isLeft) {
          indices.push(a, b, d);
          indices.push(b, c, d);
        } else {
          indices.push(a, d, b);
          indices.push(b, d, c);
        }
      }
    }
  };

  generateSleeve(true);  // Left sleeve
  generateSleeve(false); // Right sleeve

  // 3. Collar Ribbing Ring
  const collarSegments = 32;
  const collarR = 0.52;
  const collarY = 1.08;
  const collarThickness = 0.06;

  const collarGrid: number[][] = [];
  for (let c = 0; c <= 4; c++) {
    const row: number[] = [];
    const t = c / 4;
    const cy = collarY - (1 - t) * 0.12;
    const currentR = collarR + t * collarThickness;

    for (let s = 0; s <= collarSegments; s++) {
      const u = s / collarSegments;
      const angle = u * Math.PI * 2;
      const cx = Math.cos(angle) * currentR * 0.9;
      const cz = Math.sin(angle) * currentR * 0.65;

      vertices.push(cx, cy, cz);
      uvs.push(u, 0.9 + t * 0.1);
      normals.push(0, 1, 0);
      row.push(vertices.length / 3 - 1);
    }
    collarGrid.push(row);
  }

  for (let c = 0; c < 4; c++) {
    for (let s = 0; s < collarSegments; s++) {
      const a = collarGrid[c][s];
      const b = collarGrid[c + 1][s];
      const c1 = collarGrid[c + 1][s + 1];
      const d = collarGrid[c][s + 1];
      indices.push(a, b, d);
      indices.push(b, c1, d);
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

export const JerseyMesh: React.FC<JerseyMeshProps> = ({
  modelType,
  materialSettings,
  colorTexture,
  bumpTexture,
  isRotating,
  modelX = 0,
  modelY = -0.1,
  modelZ = 0,
  modelRotation = 0,
  modelScale = 1.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Generate procedural mesh whenever model style changes
  const geometry = useMemo(() => {
    return createJerseyGeometry(modelType);
  }, [modelType]);

  // Three.js MeshStandardMaterial with fabric properties
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: materialSettings.roughness,
      metalness: materialSettings.metallic,
      bumpScale: materialSettings.normalIntensity * 0.04,
      side: THREE.DoubleSide,
    });
    return mat;
  }, []);

  // Update material properties dynamically
  useEffect(() => {
    if (!material) return;
    material.roughness = materialSettings.roughness;
    material.metalness = materialSettings.metallic;
    material.bumpScale = materialSettings.normalIntensity * 0.05;
    if (colorTexture) {
      material.map = colorTexture;
      material.needsUpdate = true;
    }
    if (bumpTexture) {
      material.bumpMap = bumpTexture;
      material.needsUpdate = true;
    }
  }, [material, materialSettings, colorTexture, bumpTexture]);

  const timelineTime = useEditorStore((s) => s.timelineTime);
  const animationEasing = useEditorStore((s) => s.animationEasing);

  // Smooth Turntable rotation driven by timelineTime and animationEasing
  useFrame(() => {
    if (groupRef.current) {
      const baseRot = (modelRotation * Math.PI) / 180;
      const t = (timelineTime % 10) / 10;
      let eased = t;
      if (animationEasing === 'in') {
        eased = t * t;
      } else if (animationEasing === 'out') {
        eased = t * (2 - t);
      } else if (animationEasing === 'in-out') {
        eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }
      groupRef.current.rotation.y = baseRot + eased * Math.PI * 2;
    }
  });

  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const layers = useEditorStore((s) => s.layers);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const viewportInteractionMode = useEditorStore((s) => s.viewportInteractionMode);

  const handlePointerDown = (e: any) => {
    if (viewportInteractionMode === 'move-decal' || e.shiftKey) {
      e.stopPropagation();
      if (e.uv && selectedLayerId) {
        const selected = layers.find((l) => l.id === selectedLayerId);
        if (selected && !selected.locked) {
          const nextX = parseFloat((2 * e.uv.x - 1).toFixed(3));
          const nextY = parseFloat((2 * (1.0 - e.uv.y) - 1).toFixed(3));
          updateLayer(selected.id, { x: nextX, y: nextY });
        }
      }
    }
  };

  const handlePointerMove = (e: any) => {
    if ((viewportInteractionMode === 'move-decal' || e.shiftKey) && e.buttons > 0) {
      e.stopPropagation();
      if (e.uv && selectedLayerId) {
        const selected = layers.find((l) => l.id === selectedLayerId);
        if (selected && !selected.locked) {
          const nextX = parseFloat((2 * e.uv.x - 1).toFixed(3));
          const nextY = parseFloat((2 * (1.0 - e.uv.y) - 1).toFixed(3));
          updateLayer(selected.id, { x: nextX, y: nextY });
        }
      }
    }
  };

  return (
    <group 
      ref={groupRef}
      position={[modelX ?? 0, modelY ?? 0, modelZ ?? 0]}
      rotation={[0, (modelRotation * Math.PI) / 180, 0]}
      scale={[modelScale, modelScale, modelScale]}
    >
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      />
    </group>
  );
};
