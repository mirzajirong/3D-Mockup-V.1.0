import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  ModelType, 
  MaterialSettings, 
  SceneSettings, 
  CameraPreset, 
  AspectRatio 
} from '../types';
import { createJerseyGeometry } from '../canvas/JerseyMesh';
import { PRESET_COORDINATES } from '../canvas/CameraController';
import { APP_CONFIG } from '../config/constants';

let cachedGLTFBuffer: ArrayBuffer | null = null;

async function getGLTFBuffer(): Promise<ArrayBuffer | null> {
  if (cachedGLTFBuffer) return cachedGLTFBuffer.slice(0);
  try {
    const res = await fetch(APP_CONFIG.assets.modelONeck);
    if (!res.ok) return null;
    cachedGLTFBuffer = await res.arrayBuffer();
    return cachedGLTFBuffer.slice(0);
  } catch {
    return null;
  }
}

export function computeExportDimensions(
  ratio: AspectRatio,
  maxDimension = 1920
): { width: number; height: number } {
  let targetRatio = 16 / 9;
  if (ratio === '1:1') targetRatio = 1.0;
  if (ratio === '9:16') targetRatio = 9 / 16;
  if (ratio === '4:5') targetRatio = 4 / 5;

  let width = maxDimension;
  let height = Math.round(maxDimension / targetRatio);

  if (targetRatio < 1) {
    height = maxDimension;
    width = Math.round(maxDimension * targetRatio);
  }

  // Ensure even dimensions for video codecs (H.264 requires even width & height)
  if (width % 2 !== 0) width -= 1;
  if (height % 2 !== 0) height -= 1;

  return { width, height };
}

export interface OffscreenSceneInstance {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  modelGroup: THREE.Group;
  renderFrame: (rotationOffsetRad: number) => void;
  dispose: () => void;
}

export async function createOffscreenScene(params: {
  width: number;
  height: number;
  modelType: ModelType;
  material: MaterialSettings;
  sceneSettings: SceneSettings;
  cameraPreset: CameraPreset;
  colorTextureImage?: HTMLCanvasElement | ImageBitmap | null;
  bumpTextureImage?: HTMLCanvasElement | ImageBitmap | null;
  transparent?: boolean;
}): Promise<OffscreenSceneInstance> {
  const {
    width,
    height,
    modelType,
    material,
    sceneSettings,
    cameraPreset,
    colorTextureImage,
    bumpTextureImage,
    transparent = false,
  } = params;

  // 1. Create Canvas
  const canvas: OffscreenCanvas | HTMLCanvasElement =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement('canvas'), { width, height });

  // 2. Create WebGLRenderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas as any,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const threeScene = new THREE.Scene();

  // 3. Background Setup
  if (transparent) {
    threeScene.background = null;
    renderer.setClearColor(0x000000, 0);
  } else if (sceneSettings.backgroundType === 'solid') {
    threeScene.background = new THREE.Color(sceneSettings.backgroundColor || '#0c0c0c');
  } else if (sceneSettings.backgroundType === 'checkerboard') {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 56;
    bgCanvas.height = 56;
    const ctx = bgCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0c0c0c';
      ctx.fillRect(0, 0, 56, 56);
      ctx.fillStyle = '#181818';
      ctx.fillRect(0, 0, 28, 28);
      ctx.fillRect(28, 28, 28, 28);
      const bgTex = new THREE.CanvasTexture(bgCanvas);
      bgTex.wrapS = THREE.RepeatWrapping;
      bgTex.wrapT = THREE.RepeatWrapping;
      bgTex.repeat.set(width / 56, height / 56);
      threeScene.background = bgTex;
    }
  } else if (sceneSettings.backgroundType === 'gradient') {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 512;
    bgCanvas.height = 512;
    const ctx = bgCanvas.getContext('2d');
    if (ctx) {
      const angle = ((sceneSettings.gradientAngle ?? 135) * Math.PI) / 180;
      const x1 = Math.round(256 - Math.cos(angle) * 256);
      const y1 = Math.round(256 - Math.sin(angle) * 256);
      const x2 = Math.round(256 + Math.cos(angle) * 256);
      const y2 = Math.round(256 + Math.sin(angle) * 256);
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, sceneSettings.gradientColor1 || '#202020');
      grad.addColorStop(1, sceneSettings.gradientColor2 || '#090909');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      threeScene.background = new THREE.CanvasTexture(bgCanvas);
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
      threeScene.background = new THREE.Texture(img);
      (threeScene.background as THREE.Texture).needsUpdate = true;
    } catch {
      threeScene.background = new THREE.Color('#0c0c0c');
    }
  } else {
    threeScene.background = new THREE.Color('#0c0c0c');
  }

  // 4. Camera Setup
  const camera = new THREE.PerspectiveCamera(
    sceneSettings.cameraFov || 45,
    width / height,
    0.1,
    100
  );
  const coords = PRESET_COORDINATES[cameraPreset] || PRESET_COORDINATES.front;
  camera.position.set(coords[0], coords[1], coords[2]);
  camera.lookAt(0, -0.1, 0);

  // 5. Studio Lighting
  const { lightingPreset, lightIntensity, lightAngle, showShadow, shadowType, shadowBlur } = sceneSettings;
  const rad = ((lightAngle ?? 45) * Math.PI) / 180;
  const radius = 5.5;
  const keyX = Math.sin(rad) * radius;
  const keyZ = Math.cos(rad) * radius;
  const fillX = Math.sin(rad + Math.PI * 0.75) * 4.5;
  const fillZ = Math.cos(rad + Math.PI * 0.75) * 4.5;
  const rimX = Math.sin(rad + Math.PI) * 4.5;
  const rimZ = Math.cos(rad + Math.PI) * 4.5;

  const isShadowActive = showShadow && shadowType !== 'none';
  const shadowRadius = shadowBlur ?? (shadowType === 'soft' ? 3.5 : 1.0);

  let ambColor = '#ffffff';
  let ambIntensity = 0.5 * lightIntensity;
  if (lightingPreset === 'warm') { ambColor = '#fff1e6'; ambIntensity = 0.45 * lightIntensity; }
  else if (lightingPreset === 'cyber') { ambColor = '#101020'; ambIntensity = 0.3 * lightIntensity; }
  else if (lightingPreset === 'dramatic') { ambIntensity = 0.25 * lightIntensity; }
  else if (lightingPreset === 'daylight') { ambIntensity = 0.6 * lightIntensity; }

  const ambient = new THREE.AmbientLight(ambColor, ambIntensity);
  threeScene.add(ambient);

  let keyColor = '#ffffff';
  let keyIntensity = 1.3 * lightIntensity;
  if (lightingPreset === 'dramatic') keyIntensity = 1.8 * lightIntensity;
  if (lightingPreset === 'warm') { keyColor = '#ffe4b5'; keyIntensity = 1.4 * lightIntensity; }
  if (lightingPreset === 'cyber') { keyColor = '#DB0B2B'; keyIntensity = 1.6 * lightIntensity; }
  if (lightingPreset === 'daylight') { keyColor = '#f5f8ff'; keyIntensity = 1.5 * lightIntensity; }

  const keyLight = new THREE.DirectionalLight(keyColor, keyIntensity);
  keyLight.position.set(keyX, 4, keyZ);
  if (isShadowActive) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0002;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -2.4;
    keyLight.shadow.camera.right = 2.4;
    keyLight.shadow.camera.top = 2.4;
    keyLight.shadow.camera.bottom = -2.4;
    keyLight.shadow.radius = shadowRadius;
  }
  threeScene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(
    lightingPreset === 'cyber' ? '#1e90ff' : '#ffffff',
    0.6 * lightIntensity
  );
  fillLight.position.set(fillX, 2, fillZ);
  threeScene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(
    lightingPreset === 'cyber' ? '#ff0055' : '#ffffff',
    0.8 * lightIntensity
  );
  rimLight.position.set(rimX, 3, rimZ);
  threeScene.add(rimLight);

  // 6. Wall & Floor
  if (sceneSettings.showWall) {
    const wallGeo = new THREE.PlaneGeometry(14, 10);
    const wallMat = new THREE.MeshStandardMaterial({
      color: sceneSettings.wallColor || '#121212',
      roughness: 0.9,
      metalness: 0.05,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 0.5, -2.8);
    wall.receiveShadow = true;
    threeScene.add(wall);
  }

  if (sceneSettings.showFloor) {
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: sceneSettings.floorColor || '#0c0c0c',
      roughness: 0.45,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, -1.6, 0);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    threeScene.add(floor);
  }

  // 7. Ground Shadow receiver plane
  if (sceneSettings.showShadow && sceneSettings.shadowType !== 'none') {
    const shadowGeo = new THREE.PlaneGeometry(25, 25);
    const shadowMat = new THREE.ShadowMaterial({
      opacity: sceneSettings.shadowOpacity ?? 0.6,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(sceneSettings.modelX || 0, -1.58, 0);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.receiveShadow = true;
    threeScene.add(shadowMesh);
  }

  // 8. Textures from Canvas / ImageBitmap
  let colorTexture: THREE.Texture | null = null;
  if (colorTextureImage) {
    colorTexture = new THREE.Texture(colorTextureImage);
    colorTexture.needsUpdate = true;
    colorTexture.flipY = false;
  }

  let bumpTexture: THREE.Texture | null = null;
  if (bumpTextureImage) {
    bumpTexture = new THREE.Texture(bumpTextureImage);
    bumpTexture.needsUpdate = true;
    bumpTexture.flipY = false;
  }

  // 9. Model Construction
  const modelGroup = new THREE.Group();
  const baseScale = 2.3 * (sceneSettings.modelScale || 1.0);
  modelGroup.scale.set(baseScale, baseScale, baseScale);
  modelGroup.position.set(
    sceneSettings.modelX || 0,
    (sceneSettings.modelY || 0) - 0.08,
    sceneSettings.modelZ || 0
  );

  let modelLoaded = false;
  if (modelType === 'o-neck') {
    const buffer = await getGLTFBuffer();
    if (buffer) {
      try {
        const loader = new GLTFLoader();
        const gltf = await loader.parseAsync(buffer, '');
        const cloned = gltf.scene.clone(true);
        cloned.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            const mat = new THREE.MeshStandardMaterial({
              roughness: material.roughness,
              metalness: material.metallic,
              map: colorTexture || null,
              bumpMap: bumpTexture || null,
              bumpScale: material.normalIntensity * 0.04,
            });
            mesh.material = mat;
          }
        });
        modelGroup.add(cloned);
        modelLoaded = true;
      } catch (err) {
        console.warn('Offscreen GLTF parse error, falling back to geometry:', err);
      }
    }
  }

  if (!modelLoaded) {
    // Procedural athletic jersey geometry fallback
    const geom = createJerseyGeometry(modelType);
    const mat = new THREE.MeshStandardMaterial({
      roughness: material.roughness,
      metalness: material.metallic,
      map: colorTexture || null,
      bumpMap: bumpTexture || null,
      bumpScale: material.normalIntensity * 0.04,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    modelGroup.add(mesh);
  }

  threeScene.add(modelGroup);

  const baseRot = ((sceneSettings.modelRotation || 0) * Math.PI) / 180;

  const renderFrame = (rotationOffsetRad: number) => {
    modelGroup.rotation.y = baseRot + rotationOffsetRad;
    renderer.render(threeScene, camera);
  };

  const dispose = () => {
    renderer.dispose();
    renderer.forceContextLoss();
    threeScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
    });
    if (colorTexture) colorTexture.dispose();
    if (bumpTexture) bumpTexture.dispose();
  };

  return {
    canvas,
    renderer,
    scene: threeScene,
    camera,
    modelGroup,
    renderFrame,
    dispose,
  };
}
