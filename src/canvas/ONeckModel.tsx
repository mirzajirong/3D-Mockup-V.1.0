import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { APP_CONFIG } from '../config/constants';
import { MaterialSettings } from '../types';
import { JerseyMesh } from './JerseyMesh';
import { useEditorStore } from '../store/editorStore';

interface ONeckModelProps {
  colorTexture: THREE.CanvasTexture | null;
  bumpTexture: THREE.CanvasTexture | null;
  materialSettings: MaterialSettings;
  isRotating?: boolean;
  modelX?: number;
  modelY?: number;
  modelZ?: number;
  modelRotation?: number;
  modelScale?: number;
}

// Preload the local model (exact 01.O-Neck.glb)
try {
  useGLTF.preload(APP_CONFIG.assets.modelONeck);
} catch (e) {
  console.warn('Preload notice:', e);
}

const GLBViewer: React.FC<ONeckModelProps> = ({
  colorTexture,
  bumpTexture,
  materialSettings,
  isRotating = false,
  modelX = 0,
  modelY = 0,
  modelZ = 0,
  modelRotation = 0,
  modelScale = 1.0,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(APP_CONFIG.assets.modelONeck);

  // Clone scene so multiple instances don't collide
  const clonedScene = useMemo(() => {
    return gltf.scene.clone(true);
  }, [gltf.scene]);

  // Apply real-time dynamic texture, materials, and shadows to all meshes
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (
            Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
          ) as THREE.MeshStandardMaterial;

          if (mat) {
            mat.roughness = materialSettings.roughness;
            mat.metalness = materialSettings.metallic;

            if (colorTexture) {
              mat.map = colorTexture;
              colorTexture.flipY = false;
              mat.needsUpdate = true;
            }

            if (bumpTexture) {
              mat.bumpMap = bumpTexture;
              mat.bumpScale = materialSettings.normalIntensity * 0.04;
              mat.needsUpdate = true;
            }
          }
        }
      }
    });
  }, [clonedScene, colorTexture, bumpTexture, materialSettings]);

  const timelineTime = useEditorStore((s) => s.timelineTime);
  const animationEasing = useEditorStore((s) => s.animationEasing);

  // Turntable rotation driven by timelineTime and animationEasing
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

  const baseScale = 2.3 * modelScale;

  return (
    <group
      ref={groupRef}
      position={[modelX, modelY - 0.08, modelZ]}
      rotation={[0, (modelRotation * Math.PI) / 180, 0]}
      scale={[baseScale, baseScale, baseScale]}
    >
      <primitive object={clonedScene} />
    </group>
  );
};

// Error Boundary & Fallback to ensure 100% uptime
interface ErrorBoundaryState {
  hasError: boolean;
  error?: any;
}

class ModelErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any) {
    console.info('Using procedural jersey mesh fallback:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const ONeckModel: React.FC<ONeckModelProps> = (props) => {
  return (
    <ModelErrorBoundary
      fallback={
        <JerseyMesh
          modelType="o-neck"
          materialSettings={props.materialSettings}
          colorTexture={props.colorTexture}
          bumpTexture={props.bumpTexture}
          isRotating={props.isRotating ?? false}
          modelX={props.modelX}
          modelY={props.modelY}
          modelZ={props.modelZ}
          modelRotation={props.modelRotation}
          modelScale={props.modelScale}
        />
      }
    >
      <GLBViewer {...props} />
    </ModelErrorBoundary>
  );
};
