import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraPreset } from '../types';
import { useEditorStore } from '../store/editorStore';

interface CameraControllerProps {
  preset: CameraPreset;
  controlsRef: React.RefObject<any>;
}

export const PRESET_COORDINATES: Record<CameraPreset, [number, number, number]> = {
  front: [0, 0.1, 3.8],
  back: [0, 0.1, -3.8],
  left: [-3.8, 0.1, 0],
  right: [3.8, 0.1, 0],
  top: [0, 4.2, 0.5],
  product: [2.5, 1.2, 3.2],
};

export const CameraController: React.FC<CameraControllerProps> = ({ preset, controlsRef }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...PRESET_COORDINATES.front));
  const isTransitioning = useRef(false);
  const scene = useEditorStore((s) => s.scene);
  const updateScene = useEditorStore((s) => s.updateScene);

  // Handle preset change
  useEffect(() => {
    const coords = PRESET_COORDINATES[preset] || PRESET_COORDINATES.front;
    targetPos.current.set(coords[0], coords[1], coords[2]);
    isTransitioning.current = true;
    updateScene({
      cameraX: coords[0],
      cameraY: coords[1],
      cameraZ: coords[2],
    });
  }, [preset, updateScene]);

  // Handle FOV changes
  useEffect(() => {
    if ('fov' in camera) {
      const persCamera = camera as THREE.PerspectiveCamera;
      if (persCamera.fov !== scene.cameraFov) {
        persCamera.fov = scene.cameraFov;
        persCamera.updateProjectionMatrix();
      }
    }
  }, [camera, scene.cameraFov]);

  useFrame((_, delta) => {
    if (!isTransitioning.current) return;

    // Smooth lerp to camera preset
    camera.position.lerp(targetPos.current, Math.min(1, delta * 6));

    if (controlsRef.current) {
      controlsRef.current.target.set(0, -0.1, 0);
      controlsRef.current.update();
    }

    if (camera.position.distanceTo(targetPos.current) < 0.02) {
      camera.position.copy(targetPos.current);
      isTransitioning.current = false;
    }
  });

  return null;
};
