import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  ModelType, 
  MaterialSettings, 
  SceneSettings, 
  CameraPreset, 
  AspectRatio,
  ViewportCameraState
} from '../types';
import { createJerseyGeometry } from '../canvas/JerseyMesh';
import { PRESET_COORDINATES } from '../canvas/CameraController';
import { getCachedGLTFScene } from '../canvas/ONeckModel';
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
  maxDimension = 1920,
  forVideo = false
): { width: number; height: number } {
  if (forVideo) {
    // Professional standard HD video exports (capped to 1080p standard dimensions)
    // Avoids exceeding AVC Level 4.2 maximum coded area (2,228,224 pixels)
    if (ratio === '16:9') return { width: 1920, height: 1080 };
    if (ratio === '9:16') return { width: 1080, height: 1920 };
    if (ratio === '1:1') return { width: 1080, height: 1080 };
    if (ratio === '4:5') return { width: 1080, height: 1350 };
  }

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
  viewportCamera?: ViewportCameraState | null;
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
    viewportCamera,
  } = params;

  // 1. Create Canvas
  const canvas: OffscreenCanvas | HTMLCanvasElement =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement('canvas'), { width, height });

  // 2. Create WebGLRenderer with exact viewport color management and tone mapping
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
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

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
      bgTex.colorSpace = THREE.SRGBColorSpace;
      bgTex.wrapS = THREE.RepeatWrapping;
      bgTex.wrapT = THREE.RepeatWrapping;
      bgTex.repeat.set(width / 56, height / 56);
      threeScene.background = bgTex;
    }
  } else if (sceneSettings.backgroundType === 'gradient') {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = width;
    bgCanvas.height = height;
    const ctx = bgCanvas.getContext('2d');
    if (ctx) {
      const rad = ((sceneSettings.gradientAngle ?? 135) * Math.PI) / 180;
      const dx = Math.sin(rad);
      const dy = -Math.cos(rad);
      const length = Math.sqrt(width * width + height * height) / 2;
      const cx = width / 2;
      const cy = height / 2;
      const grad = ctx.createLinearGradient(
        cx - dx * length,
        cy - dy * length,
        cx + dx * length,
        cy + dy * length
      );
      grad.addColorStop(0, sceneSettings.gradientColor1 || '#2a2a2a');
      grad.addColorStop(1, sceneSettings.gradientColor2 || '#080808');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      const bgTex = new THREE.CanvasTexture(bgCanvas);
      bgTex.colorSpace = THREE.SRGBColorSpace;
      threeScene.background = bgTex;
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
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = width;
      bgCanvas.height = height;
      const ctx = bgCanvas.getContext('2d');
      if (ctx) {
        const imgAspect = (img.width || 1) / (img.height || 1);
        const targetAspect = width / height;
        let dw = width;
        let dh = height;
        let ox = 0;
        let oy = 0;
        if (imgAspect > targetAspect) {
          dh = height;
          dw = height * imgAspect;
          ox = (width - dw) / 2;
        } else {
          dw = width;
          dh = width / imgAspect;
          oy = (height - dh) / 2;
        }
        ctx.drawImage(img, ox, oy, dw, dh);
        const bgTex = new THREE.CanvasTexture(bgCanvas);
        bgTex.colorSpace = THREE.SRGBColorSpace;
        threeScene.background = bgTex;
      }
    } catch {
      threeScene.background = new THREE.Color('#0c0c0c');
    }
  } else {
    threeScene.background = new THREE.Color('#0c0c0c');
  }

  // 4. Camera Setup with Live Viewport Synchronization
  const targetAspect = width / height;
  const camera = new THREE.PerspectiveCamera(
    viewportCamera?.fov || sceneSettings.cameraFov || 45,
    targetAspect,
    0.1,
    100
  );

  if (viewportCamera) {
    // Copy the exact 3D orientation and position from the active 3D viewport
    camera.position.set(...viewportCamera.position);
    camera.quaternion.set(...viewportCamera.quaternion);
    camera.fov = viewportCamera.fov || sceneSettings.cameraFov || 45;
    camera.zoom = viewportCamera.zoom || 1;

    // Aspect ratio framing compensation:
    // If exporting in vertical or square aspect ratio (e.g. 9:16, 4:5, 1:1),
    // zoom out slightly along line of sight so the garment and sleeves are not horizontally clipped
    if (targetAspect < 1.0) {
      const fitFactor = Math.min(1.4, Math.max(1.05, 0.95 / Math.sqrt(targetAspect)));
      const targetVec = viewportCamera.target
        ? new THREE.Vector3(...viewportCamera.target)
        : new THREE.Vector3(0, -0.1, 0);
      const dir = new THREE.Vector3().subVectors(camera.position, targetVec);
      camera.position.copy(targetVec).addScaledVector(dir, fitFactor);
    }
    camera.updateProjectionMatrix();
  } else {
    const coords = PRESET_COORDINATES[cameraPreset] || PRESET_COORDINATES.front;
    const camX = sceneSettings.cameraX ?? coords[0];
    const camY = sceneSettings.cameraY ?? coords[1];
    const camZ = sceneSettings.cameraZ ?? coords[2];
    camera.position.set(camX, camY, camZ);
    camera.lookAt(0, -0.1, 0);
  }

  // 5. Studio Lighting exactly matching StudioLighting.tsx in 3D viewport
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

  const applyShadowProps = (light: THREE.DirectionalLight) => {
    if (isShadowActive) {
      light.castShadow = true;
      light.shadow.mapSize.set(2048, 2048);
      light.shadow.bias = -0.0002;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 20;
      light.shadow.camera.left = -2.4;
      light.shadow.camera.right = 2.4;
      light.shadow.camera.top = 2.4;
      light.shadow.camera.bottom = -2.4;
      light.shadow.radius = shadowRadius;
    }
  };

  switch (lightingPreset) {
    case 'dramatic': {
      threeScene.add(new THREE.AmbientLight(0xffffff, 0.25 * lightIntensity));
      const key = new THREE.DirectionalLight(0xffffff, 1.8 * lightIntensity);
      key.position.set(keyX, 5, keyZ);
      applyShadowProps(key);
      threeScene.add(key);

      const rim = new THREE.DirectionalLight('#ff3355', 2.2 * lightIntensity);
      rim.position.set(rimX, 3, rimZ);
      threeScene.add(rim);

      const underfill = new THREE.DirectionalLight(0xffffff, 0.4 * lightIntensity);
      underfill.position.set(0, -2, -2);
      threeScene.add(underfill);
      break;
    }
    case 'warm': {
      threeScene.add(new THREE.AmbientLight('#fff1e6', 0.45 * lightIntensity));
      const key = new THREE.DirectionalLight('#ffe4b5', 1.4 * lightIntensity);
      key.position.set(keyX, 4, keyZ);
      applyShadowProps(key);
      threeScene.add(key);

      const fill = new THREE.DirectionalLight('#ffd1a4', 0.7 * lightIntensity);
      fill.position.set(fillX, 2, fillZ);
      threeScene.add(fill);
      break;
    }
    case 'cyber': {
      threeScene.add(new THREE.AmbientLight('#101020', 0.3 * lightIntensity));
      const key = new THREE.DirectionalLight('#DB0B2B', 1.6 * lightIntensity);
      key.position.set(keyX, 3, keyZ);
      applyShadowProps(key);
      threeScene.add(key);

      const rim = new THREE.DirectionalLight('#00e5ff', 1.8 * lightIntensity);
      rim.position.set(rimX, 2, rimZ);
      threeScene.add(rim);

      const pt = new THREE.PointLight('#ffffff', 0.8 * lightIntensity);
      pt.position.set(0, -1, 3);
      threeScene.add(pt);
      break;
    }
    case 'daylight': {
      threeScene.add(new THREE.AmbientLight('#f4f8ff', 0.7 * lightIntensity));
      const key = new THREE.DirectionalLight('#ffffff', 1.5 * lightIntensity);
      key.position.set(keyX, 8, keyZ);
      applyShadowProps(key);
      threeScene.add(key);

      const fill = new THREE.DirectionalLight('#e0eeff', 0.5 * lightIntensity);
      fill.position.set(fillX, 4, fillZ);
      threeScene.add(fill);
      break;
    }
    case 'studio':
    default: {
      threeScene.add(new THREE.AmbientLight('#ffffff', 0.6 * lightIntensity));
      const key = new THREE.DirectionalLight('#ffffff', 1.35 * lightIntensity);
      key.position.set(keyX, 4.5, keyZ);
      applyShadowProps(key);
      threeScene.add(key);

      const fill = new THREE.DirectionalLight('#f0f4f8', 0.65 * lightIntensity);
      fill.position.set(fillX, 2.5, fillZ);
      threeScene.add(fill);

      const rim = new THREE.DirectionalLight('#ffffff', 0.9 * lightIntensity);
      rim.position.set(rimX, 4.0, rimZ);
      threeScene.add(rim);

      const underfill = new THREE.DirectionalLight('#d0d0d0', 0.25 * lightIntensity);
      underfill.position.set(0, -3.0, 2.0);
      threeScene.add(underfill);
      break;
    }
  }

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

  // 8. Textures from Canvas / ImageBitmap with correct colorSpace and wrapping
  let colorTexture: THREE.Texture | null = null;
  if (colorTextureImage) {
    colorTexture = new THREE.Texture(colorTextureImage);
    colorTexture.colorSpace = THREE.SRGBColorSpace;
    colorTexture.wrapS = THREE.RepeatWrapping;
    colorTexture.wrapT = THREE.RepeatWrapping;
    colorTexture.anisotropy = 8;
    colorTexture.flipY = false;
    colorTexture.needsUpdate = true;
  }

  let bumpTexture: THREE.Texture | null = null;
  if (bumpTextureImage) {
    bumpTexture = new THREE.Texture(bumpTextureImage);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;
    bumpTexture.repeat.set(16, 16);
    bumpTexture.flipY = false;
    bumpTexture.needsUpdate = true;
  }

  // 9. Model Construction
  const modelGroup = new THREE.Group();
  const isONeck = modelType === 'o-neck';
  const baseScale = (isONeck ? 2.3 : 1.0) * (sceneSettings.modelScale || 1.0);
  modelGroup.scale.set(baseScale, baseScale, baseScale);
  modelGroup.position.set(
    sceneSettings.modelX || 0,
    (sceneSettings.modelY || 0) + (isONeck ? -0.08 : 0),
    sceneSettings.modelZ || 0
  );

  let modelLoaded = false;
  if (modelType === 'o-neck') {
    // 1. Try to use the already-parsed 3D scene from the live 3D viewport (instant & 100% parity)
    const liveCachedScene = getCachedGLTFScene();
    let sourceScene: THREE.Group | null = null;

    if (liveCachedScene) {
      sourceScene = liveCachedScene;
    } else {
      const buffer = await getGLTFBuffer();
      if (buffer) {
        try {
          const loader = new GLTFLoader();
          const gltf = await loader.parseAsync(buffer, '');
          sourceScene = gltf.scene;
        } catch (err) {
          console.warn('Offscreen GLTF parse error, falling back to geometry:', err);
        }
      }
    }

    if (sourceScene) {
      const cloned = sourceScene.clone(true);
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial || new THREE.MeshStandardMaterial();
          mat.roughness = material.roughness;
          mat.metalness = material.metallic;
          mat.side = THREE.DoubleSide; // Prevents backfaces, collar & cuffs from becoming transparent/black
          if (colorTexture) {
            mat.map = colorTexture;
          }
          if (bumpTexture) {
            mat.bumpMap = bumpTexture;
            mat.bumpScale = material.normalIntensity * 0.04;
          }
          mat.needsUpdate = true;
          mesh.material = mat;
        }
      });
      modelGroup.add(cloned);
      modelLoaded = true;
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
