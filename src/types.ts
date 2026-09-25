export type ModelType = 'o-neck' | 'v-neck' | 'polo' | 'hoodie' | 'long-sleeve';

export type CameraPreset = 'front' | 'back' | 'left' | 'right' | 'top' | 'product';

export type AspectRatio = '16:9' | '1:1' | '9:16' | '4:5';

export type BackgroundType = 'checkerboard' | 'solid' | 'gradient' | 'image';

export type ShadowType = 'none' | 'soft' | 'contact';

export type LightingPreset = 'studio' | 'dramatic' | 'warm' | 'cyber' | 'daylight';

export interface DesignLayer {
  id: string;
  name: string;
  src: string;
  thumbnail?: string;
  visible: boolean;
  locked: boolean;
  opacity: number;      // 0 to 1
  scale: number;        // 0.1 to 2.5
  x: number;            // -1 to 1 (offset from center)
  y: number;            // -1 to 1 (offset from center)
  rotation: number;     // degrees 0 to 360
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
}

export interface MaterialSettings {
  fabricColor: string;
  roughness: number;    // 0 to 1
  sheen: number;        // 0 to 1
  normalIntensity: number; // 0 to 1
  metallic: number;
}

export type LeftPanelTab = 'design' | 'material' | 'position' | 'camera';
export type RightPanelTab = 'lighting' | 'background' | 'scene' | 'shadow';

// Legacy alias for backwards compatibility
export type PanelTab = LeftPanelTab | RightPanelTab;

export type ViewportInteractionMode = 'orbit' | 'move-decal';

export type AnimationEasing = 'linear' | 'in' | 'out' | 'in-out';
export type AnimationFps = 60 | 30 | 25;

export interface SceneSettings {
  // Background
  backgroundType: BackgroundType;
  backgroundColor: string;
  backgroundGradient: string;
  backgroundImageUrl: string;
  gradientColor1?: string;
  gradientColor2?: string;
  gradientAngle?: number;

  // Lighting
  lightingPreset: LightingPreset;
  lightIntensity: number;
  lightAngle: number; // 0 to 360 degrees

  // Scene Wall & Floor
  showWall: boolean;
  wallColor: string;
  showFloor: boolean;
  floorColor: string;

  // Shadow
  showShadow: boolean;
  shadowType: ShadowType;
  shadowOpacity: number;
  shadowBlur: number;

  // Object Position
  modelX: number;
  modelY: number;
  modelZ: number;
  modelRotation: number;
  modelScale: number;

  // Camera Settings
  cameraFov: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
}

export interface ViewportCameraState {
  position: [number, number, number];
  quaternion: [number, number, number, number];
  target: [number, number, number];
  fov: number;
  zoom: number;
  aspect: number;
}

export type SubscriptionPlan = 'free' | 'pro';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: SubscriptionPlan;
  avatarUrl: string;
}

export interface ExportProgress {
  isExporting: boolean;
  type: 'image' | 'video';
  stage: 'idle' | 'preparing' | 'rendering' | 'encoding' | 'finalizing' | 'complete' | 'cancelled' | 'error';
  percent: number;
  message: string;
  frameCurrent?: number;
  frameTotal?: number;
  encoderType?: string;
}
