import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEditorStore } from '../store/editorStore';
import { TextureCompositor } from '../lib/textureCompositor';
import { ONeckModel } from './ONeckModel';
import { JerseyMesh } from './JerseyMesh';
import { StudioLighting } from './StudioLighting';
import { GroundShadow } from './GroundShadow';
import { CameraController } from './CameraController';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// High-tech dark mode loading indicator inside R3F
const ModelLoadingFallback: React.FC = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-2 bg-[#141414]/90 backdrop-blur-md px-4 py-3 rounded-[4px] border border-[#292929] shadow-2xl pointer-events-none select-none font-geist">
        <ArrowPathIcon className="w-5 h-5 text-[#DB0B2B] animate-spin" />
        <span className="text-xs font-semibold tracking-wider text-white">
          Loading 3D Model...
        </span>
        <span className="text-[10px] text-[#777777]">
          01.O-Neck.glb
        </span>
      </div>
    </Html>
  );
};

// Scene internals
const SceneContent: React.FC<{
  colorTexture: THREE.CanvasTexture | null;
  bumpTexture: THREE.CanvasTexture | null;
}> = ({ colorTexture, bumpTexture }) => {
  const controlsRef = useRef<any>(null);
  const currentModel = useEditorStore((s) => s.currentModel);
  const material = useEditorStore((s) => s.material);
  const scene = useEditorStore((s) => s.scene);
  const cameraPreset = useEditorStore((s) => s.cameraPreset);
  const isPlayingTurntable = useEditorStore((s) => s.isPlayingTurntable);
  const updateScene = useEditorStore((s) => s.updateScene);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.06}
        minDistance={1.8}
        maxDistance={7.5}
        maxPolarAngle={Math.PI / 2 + 0.18}
        target={[0, -0.1, 0]}
        onEnd={() => {
          if (controlsRef.current?.object) {
            const cam = controlsRef.current.object as THREE.Camera;
            updateScene({
              cameraX: parseFloat(cam.position.x.toFixed(3)),
              cameraY: parseFloat(cam.position.y.toFixed(3)),
              cameraZ: parseFloat(cam.position.z.toFixed(3)),
            });
          }
        }}
      />

      <CameraController preset={cameraPreset} controlsRef={controlsRef} />

      <StudioLighting
        preset={scene.lightingPreset}
        intensity={scene.lightIntensity}
        lightAngle={scene.lightAngle}
        showShadow={scene.showShadow}
        shadowType={scene.shadowType}
        shadowBlur={scene.shadowBlur}
      />

      {/* 3D Scene Wall Backdrop */}
      {scene.showWall && (
        <mesh position={[0, 0.5, -2.8]} receiveShadow>
          <planeGeometry args={[14, 10]} />
          <meshStandardMaterial
            color={scene.wallColor || '#121212'}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
      )}

      {/* 3D Scene Ground Floor */}
      {scene.showFloor && (
        <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial
            color={scene.floorColor || '#0c0c0c'}
            roughness={0.45}
            metalness={0.15}
          />
        </mesh>
      )}

      <Suspense fallback={<ModelLoadingFallback />}>
        {currentModel === 'o-neck' ? (
          <ONeckModel
            colorTexture={colorTexture}
            bumpTexture={bumpTexture}
            materialSettings={material}
            isRotating={isPlayingTurntable}
            modelX={scene.modelX}
            modelY={scene.modelY}
            modelZ={scene.modelZ}
            modelRotation={scene.modelRotation}
            modelScale={scene.modelScale}
          />
        ) : (
          <JerseyMesh
            modelType={currentModel}
            materialSettings={material}
            colorTexture={colorTexture}
            bumpTexture={bumpTexture}
            isRotating={isPlayingTurntable}
            modelX={scene.modelX}
            modelY={scene.modelY}
            modelZ={scene.modelZ}
            modelRotation={scene.modelRotation}
            modelScale={scene.modelScale}
          />
        )}
      </Suspense>

      {scene.showShadow && (
        <GroundShadow
          type={scene.shadowType}
          opacity={scene.shadowOpacity}
          yPosition={-1.58}
          xPosition={scene.modelX}
        />
      )}
    </>
  );
};

export const Viewer3DCanvas: React.FC = () => {
  const material = useEditorStore((s) => s.material);
  const layers = useEditorStore((s) => s.layers);
  const showUVGuide = useEditorStore((s) => s.showUVGuide);
  const scene = useEditorStore((s) => s.scene);
  const setRendererCanvas = useEditorStore((s) => s.setRendererCanvas);

  const compositor = useMemo(() => new TextureCompositor(2048, 2048), []);
  const [colorTexture, setColorTexture] = useState<THREE.CanvasTexture | null>(null);
  const [bumpTexture, setBumpTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let isMounted = true;
    setColorTexture(compositor.getTexture());
    setBumpTexture(compositor.getBumpTexture());

    compositor.compose(material, layers, showUVGuide).then(() => {
      if (isMounted) {
        setColorTexture(compositor.getTexture());
        setBumpTexture(compositor.getBumpTexture());
      }
    });

    return () => {
      isMounted = false;
    };
  }, [compositor, material, layers, showUVGuide]);

  // Dark checkerboard default ("papan catur gelap"), or solid, gradient, image
  const backgroundStyle = useMemo<React.CSSProperties>(() => {
    if (scene.backgroundType === 'checkerboard') {
      return {
        backgroundColor: '#0c0c0c',
        backgroundImage: `
          linear-gradient(45deg, #181818 25%, transparent 25%),
          linear-gradient(-45deg, #181818 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #181818 75%),
          linear-gradient(-45deg, transparent 75%, #181818 75%)
        `,
        backgroundSize: '28px 28px',
        backgroundPosition: '0 0, 0 14px, 14px -14px, -14px 0px',
      };
    }
    if (scene.backgroundType === 'solid') {
      return { backgroundColor: scene.backgroundColor };
    }
    if (scene.backgroundType === 'gradient') {
      return { background: scene.backgroundGradient };
    }
    if (scene.backgroundType === 'image') {
      return {
        backgroundImage: scene.backgroundImageUrl ? `url(${scene.backgroundImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0c0c0c',
      };
    }
    return { backgroundColor: '#000000' };
  }, [scene.backgroundType, scene.backgroundColor, scene.backgroundGradient, scene.backgroundImageUrl]);

  return (
    <div
      id="3d-viewer-canvas-container"
      style={backgroundStyle}
      className="relative w-full h-full select-none overflow-hidden transition-all duration-300"
    >
      <Canvas
        camera={{ position: [0, 0.1, 3.8], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          setRendererCanvas(gl.domElement);
        }}
      >
        <SceneContent
          colorTexture={colorTexture}
          bumpTexture={bumpTexture}
        />
      </Canvas>
    </div>
  );
};

// Also export as Canvas3D for backwards compatibility
export { Viewer3DCanvas as Canvas3D };
export default Viewer3DCanvas;
