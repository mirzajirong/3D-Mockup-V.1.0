import React from 'react';
import { ShadowType } from '../types';

interface GroundShadowProps {
  type: ShadowType;
  opacity: number;
  yPosition?: number;
  xPosition?: number;
}

/**
 * Pure 3D model shadow receiver plane.
 * Directly receives real-time Three.js shadows cast from the 3D model's geometry and folds,
 * without adding artificial/fake radial gradient textures.
 */
export const GroundShadow: React.FC<GroundShadowProps> = ({
  type,
  opacity,
  yPosition = -1.58,
  xPosition = 0,
}) => {
  if (type === 'none' || opacity <= 0) return null;

  return (
    <group position={[xPosition, yPosition, 0]}>
      {/* Receiver plane for Three.js 3D model shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <shadowMaterial transparent opacity={opacity} depthWrite={false} />
      </mesh>
    </group>
  );
};

