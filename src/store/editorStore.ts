import { create } from 'zustand';
import { 
  ModelType, 
  DesignLayer, 
  MaterialSettings, 
  SceneSettings, 
  CameraPreset, 
  UserProfile,
  ExportProgress,
  LeftPanelTab,
  RightPanelTab,
  PanelTab,
  ViewportInteractionMode,
  AnimationEasing,
  AnimationFps,
  ViewportCameraState,
} from '../types';
import { sampleDesigns } from '../assets/sampleTextures';

interface EditorState {
  // Model
  currentModel: ModelType;
  setModel: (model: ModelType) => void;

  // Two Panels (Left and Right)
  activeLeftTab: LeftPanelTab;
  setActiveLeftTab: (tab: LeftPanelTab) => void;
  activeRightTab: RightPanelTab;
  setActiveRightTab: (tab: RightPanelTab) => void;

  // Legacy tab alias
  activeTab: PanelTab;
  setActiveTab: (tab: PanelTab) => void;

  // Layers
  layers: DesignLayer[];
  selectedLayerId: string | null;
  addLayer: (layer: Omit<DesignLayer, 'id'>) => string;
  updateLayer: (id: string, updates: Partial<DesignLayer>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  selectLayer: (id: string | null) => void;
  fitDesignToJersey: (id: string) => void;

  // Viewport mode
  viewportInteractionMode: ViewportInteractionMode;
  setViewportInteractionMode: (mode: ViewportInteractionMode) => void;

  // Material
  material: MaterialSettings;
  updateMaterial: (updates: Partial<MaterialSettings>) => void;

  // Scene & Lighting
  scene: SceneSettings;
  updateScene: (updates: Partial<SceneSettings>) => void;

  // Camera & Guides
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  showUVGuide: boolean;
  setShowUVGuide: (show: boolean) => void;

  // Turntable, Timeline & Easing
  isPlayingTurntable: boolean;
  setIsPlayingTurntable: (playing: boolean) => void;
  timelineTime: number; // 0 to 10 seconds
  setTimelineTime: (time: number) => void;
  turntableSpeed: number; // multiplier
  animationEasing: AnimationEasing;
  setAnimationEasing: (easing: AnimationEasing) => void;
  animationFps: AnimationFps;
  setAnimationFps: (fps: AnimationFps) => void;
  resetModelToFront: () => void;

  // User & Auth
  user: UserProfile;
  setUserPlan: (plan: 'free' | 'pro') => void;
  loginDemo: (email: string) => void;
  logout: () => void;

  // Modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  userDashboardOpen: boolean;
  setUserDashboardOpen: (open: boolean) => void;
  adminDashboardOpen: boolean;
  setAdminDashboardOpen: (open: boolean) => void;
  upgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;

  // Export progress
  exportProgress: ExportProgress;
  setExportProgress: (progress: Partial<ExportProgress>) => void;

  // 3D Canvas Reference hook trigger
  rendererCanvas: HTMLCanvasElement | null;
  setRendererCanvas: (canvas: HTMLCanvasElement | null) => void;

  // Active Viewport Camera state tracking for exact export parity
  viewportCameraState: ViewportCameraState | null;
  setViewportCameraState: (cam: ViewportCameraState | null) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  currentModel: 'o-neck',
  setModel: (model) => set({ currentModel: model }),

  activeLeftTab: 'design',
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  activeRightTab: 'lighting',
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),

  activeTab: 'design',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Initial layer starts with signature Red Owl Logo (seen in video frame 00:00)
  layers: [
    {
      id: 'layer-owl-default',
      name: 'Red Owl Mascot',
      src: sampleDesigns[0].src,
      visible: true,
      locked: false,
      opacity: 1.0,
      scale: 0.38,
      x: 0,
      y: 0.08,
      rotation: 0,
      blendMode: 'normal',
    }
  ],
  selectedLayerId: 'layer-owl-default',

  addLayer: (layerData) => {
    const id = `layer-${Date.now()}`;
    const newLayer: DesignLayer = {
      ...layerData,
      id,
    };
    set((state) => ({
      layers: [newLayer, ...state.layers],
      selectedLayerId: id,
    }));
    return id;
  },

  updateLayer: (id, updates) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  },

  removeLayer: (id) => {
    set((state) => {
      const filtered = state.layers.filter((l) => l.id !== id);
      return {
        layers: filtered,
        selectedLayerId: state.selectedLayerId === id ? (filtered[0]?.id ?? null) : state.selectedLayerId,
      };
    });
  },

  reorderLayers: (startIndex, endIndex) => {
    set((state) => {
      const result = Array.from(state.layers);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { layers: result };
    });
  },

  moveLayerUp: (id) => {
    set((state) => {
      const idx = state.layers.findIndex((l) => l.id === id);
      if (idx <= 0) return state;
      const result = Array.from(state.layers);
      const [item] = result.splice(idx, 1);
      result.splice(idx - 1, 0, item);
      return { layers: result };
    });
  },

  moveLayerDown: (id) => {
    set((state) => {
      const idx = state.layers.findIndex((l) => l.id === id);
      if (idx === -1 || idx >= state.layers.length - 1) return state;
      const result = Array.from(state.layers);
      const [item] = result.splice(idx, 1);
      result.splice(idx + 1, 0, item);
      return { layers: result };
    });
  },

  selectLayer: (id) => set({ selectedLayerId: id }),

  viewportInteractionMode: 'orbit',
  setViewportInteractionMode: (mode) => set({ viewportInteractionMode: mode }),

  fitDesignToJersey: (id) => {
    // Fits full wrap design (like Dortmund pattern at 00:13)
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, scale: 1.0, x: 0, y: 0, rotation: 0 } : l
      ),
    }));
  },

  // Material defaults (Dark fabric, realistic sheen)
  material: {
    fabricColor: '#1A1A1A',
    roughness: 0.65,
    sheen: 0.22,
    normalIntensity: 0.45,
    metallic: 0.04,
  },
  updateMaterial: (updates) => {
    set((state) => ({
      material: { ...state.material, ...updates },
    }));
  },

  // Scene defaults (Dark checkerboard backdrop default, wall and floor initially OFF, position 0,00m)
  scene: {
    backgroundType: 'checkerboard',
    backgroundColor: '#0a0a0a',
    backgroundGradient: 'linear-gradient(135deg, #2a2a2a 0%, #080808 100%)',
    backgroundImageUrl: '',
    gradientColor1: '#2a2a2a',
    gradientColor2: '#080808',
    gradientAngle: 135,
    lightingPreset: 'studio',
    lightIntensity: 1.15,
    lightAngle: 45,
    showWall: false,
    wallColor: '#101010',
    showFloor: false,
    floorColor: '#0a0a0a',
    showShadow: true,
    shadowType: 'contact',
    shadowOpacity: 0.65,
    shadowBlur: 3.5,
    modelX: 0,
    modelY: 0,
    modelZ: 0,
    modelRotation: 0,
    modelScale: 1.0,
    cameraFov: 45,
    cameraX: 0,
    cameraY: 0.1,
    cameraZ: 3.8,
  },
  updateScene: (updates) => {
    set((state) => ({
      scene: { ...state.scene, ...updates },
    }));
  },

  cameraPreset: 'front',
  setCameraPreset: (preset) => set({ cameraPreset: preset }),

  showUVGuide: false,
  setShowUVGuide: (show) => set({ showUVGuide: show }),

  isPlayingTurntable: false,
  setIsPlayingTurntable: (playing) => set({ isPlayingTurntable: playing }),
  timelineTime: 0,
  setTimelineTime: (time) => set({ timelineTime: time }),
  turntableSpeed: 1,

  animationEasing: 'linear',
  setAnimationEasing: (easing) => set({ animationEasing: easing }),
  animationFps: 60,
  setAnimationFps: (fps) => set({ animationFps: fps }),
  resetModelToFront: () => {
    set((state) => ({
      cameraPreset: 'front',
      timelineTime: 0,
      isPlayingTurntable: false,
      scene: {
        ...state.scene,
        modelRotation: 0,
        modelX: 0,
        modelY: 0,
        modelZ: 0,
      },
    }));
  },

  // User state
  user: {
    id: 'user_es_01',
    name: 'Editor Suite Studio',
    email: 'editorsuite.id@gmail.com',
    plan: 'pro',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  setUserPlan: (plan) =>
    set((state) => ({
      user: { ...state.user, plan },
    })),
  loginDemo: (email) =>
    set((state) => ({
      user: {
        ...state.user,
        email: email || 'editorsuite.id@gmail.com',
        name: email.split('@')[0] || 'Studio Editor',
      },
      authModalOpen: false,
    })),
  logout: () =>
    set((state) => ({
      user: {
        id: 'anon',
        name: 'Guest Designer',
        email: 'guest@editorsuite.id',
        plan: 'free',
        avatarUrl: '',
      },
    })),

  // Modals
  authModalOpen: false,
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  userDashboardOpen: false,
  setUserDashboardOpen: (open) => set({ userDashboardOpen: open }),
  adminDashboardOpen: false,
  setAdminDashboardOpen: (open) => set({ adminDashboardOpen: open }),
  upgradeModalOpen: false,
  setUpgradeModalOpen: (open) => set({ upgradeModalOpen: open }),
  exportModalOpen: false,
  setExportModalOpen: (open) => set({ exportModalOpen: open }),

  exportProgress: {
    isExporting: false,
    type: 'image',
    stage: 'idle',
    percent: 0,
    message: '',
  },
  setExportProgress: (progress) =>
    set((state) => ({
      exportProgress: { ...state.exportProgress, ...progress },
    })),

  rendererCanvas: null,
  setRendererCanvas: (canvas) => set({ rendererCanvas: canvas }),

  viewportCameraState: null,
  setViewportCameraState: (cam) => set({ viewportCameraState: cam }),
}));
