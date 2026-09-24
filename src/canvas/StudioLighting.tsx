import React from 'react';
import { LightingPreset, ShadowType } from '../types';

interface StudioLightingProps {
  preset: LightingPreset;
  intensity: number;
  lightAngle?: number; // 0 to 360 degrees
  showShadow?: boolean;
  shadowType?: ShadowType;
  shadowBlur?: number;
}

export const StudioLighting: React.FC<StudioLightingProps> = ({
  preset,
  intensity,
  lightAngle = 45,
  showShadow = true,
  shadowType = 'soft',
  shadowBlur,
}) => {
  // Convert angle in degrees to X and Z coordinates on a circle around the model
  const rad = (lightAngle * Math.PI) / 180;
  const radius = 5.5;
  const keyX = Math.sin(rad) * radius;
  const keyZ = Math.cos(rad) * radius;
  const fillX = Math.sin(rad + Math.PI * 0.75) * 4.5;
  const fillZ = Math.cos(rad + Math.PI * 0.75) * 4.5;
  const rimX = Math.sin(rad + Math.PI) * 4.5;
  const rimZ = Math.cos(rad + Math.PI) * 4.5;

  const isShadowActive = showShadow && shadowType !== 'none';
  const shadowRadius = shadowBlur ?? (shadowType === 'soft' ? 3.5 : 1.0);

  switch (preset) {
    case 'dramatic':
      return (
        <>
          <ambientLight intensity={0.25 * intensity} />
          <directionalLight
            position={[keyX, 5, keyZ]}
            intensity={1.8 * intensity}
            castShadow={isShadowActive}
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0002}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
            shadow-camera-left={-2.4}
            shadow-camera-right={2.4}
            shadow-camera-top={2.4}
            shadow-camera-bottom={-2.4}
            shadow-radius={shadowRadius}
          />
          {/* Back edge rim light */}
          <directionalLight position={[rimX, 3, rimZ]} intensity={2.2 * intensity} color="#ff3355" />
          <directionalLight position={[0, -2, -2]} intensity={0.4 * intensity} />
        </>
      );

    case 'warm':
      return (
        <>
          <ambientLight intensity={0.45 * intensity} color="#fff1e6" />
          <directionalLight
            position={[keyX, 4, keyZ]}
            intensity={1.4 * intensity}
            color="#ffe4b5"
            castShadow={isShadowActive}
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0002}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
            shadow-camera-left={-2.4}
            shadow-camera-right={2.4}
            shadow-camera-top={2.4}
            shadow-camera-bottom={-2.4}
            shadow-radius={shadowRadius}
          />
          <directionalLight position={[fillX, 2, fillZ]} intensity={0.7 * intensity} color="#ffd1a4" />
        </>
      );

    case 'cyber':
      return (
        <>
          <ambientLight intensity={0.3 * intensity} color="#101020" />
          <directionalLight
            position={[keyX, 3, keyZ]}
            intensity={1.6 * intensity}
            color="#DB0B2B"
            castShadow={isShadowActive}
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0002}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
            shadow-camera-left={-2.4}
            shadow-camera-right={2.4}
            shadow-camera-top={2.4}
            shadow-camera-bottom={-2.4}
            shadow-radius={shadowRadius}
          />
          <directionalLight position={[rimX, 2, rimZ]} intensity={1.8 * intensity} color="#00e5ff" />
          <pointLight position={[0, -1, 3]} intensity={0.8 * intensity} color="#ffffff" />
        </>
      );

    case 'daylight':
      return (
        <>
          <ambientLight intensity={0.7 * intensity} color="#f4f8ff" />
          <directionalLight
            position={[keyX, 8, keyZ]}
            intensity={1.5 * intensity}
            color="#ffffff"
            castShadow={isShadowActive}
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0002}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
            shadow-camera-left={-2.4}
            shadow-camera-right={2.4}
            shadow-camera-top={2.4}
            shadow-camera-bottom={-2.4}
            shadow-radius={shadowRadius}
          />
          <directionalLight position={[fillX, 4, fillZ]} intensity={0.5 * intensity} color="#e0eeff" />
        </>
      );

    case 'studio':
    default:
      return (
        <>
          {/* Neutral commercial studio softbox setup */}
          <ambientLight intensity={0.6 * intensity} color="#ffffff" />
          {/* Main Key Light casting the 3D model shadow */}
          <directionalLight
            position={[keyX, 4.5, keyZ]}
            intensity={1.35 * intensity}
            color="#ffffff"
            castShadow={isShadowActive}
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0002}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
            shadow-camera-left={-2.4}
            shadow-camera-right={2.4}
            shadow-camera-top={2.4}
            shadow-camera-bottom={-2.4}
            shadow-radius={shadowRadius}
          />
          {/* Soft Fill Light */}
          <directionalLight
            position={[fillX, 2.5, fillZ]}
            intensity={0.65 * intensity}
            color="#f0f4f8"
          />
          {/* Rim / Backlight for separation */}
          <directionalLight
            position={[rimX, 4.0, rimZ]}
            intensity={0.9 * intensity}
            color="#ffffff"
          />
          {/* Subtle underfill */}
          <directionalLight
            position={[0, -3.0, 2.0]}
            intensity={0.25 * intensity}
            color="#d0d0d0"
          />
        </>
      );
  }
};

