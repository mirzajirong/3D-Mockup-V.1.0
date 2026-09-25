import React, { useState, useMemo } from 'react';
import { useEditorStore } from './store/editorStore';
import { Header } from './components/Header';
import { Canvas3D } from './canvas/Canvas3D';
import { TimelineScrubber } from './components/TimelineScrubber';
import { DesignPanel } from './features/editor/DesignPanel';
import { MaterialPanel } from './features/editor/MaterialPanel';
import { PositionPanel } from './features/editor/PositionPanel';
import { CameraPanel } from './features/editor/CameraPanel';
import { LightingPanel } from './features/editor/LightingPanel';
import { BackgroundPanel } from './features/editor/BackgroundPanel';
import { ScenePanel } from './features/editor/ScenePanel';
import { ShadowPanel } from './features/editor/ShadowPanel';
import { ExportModal } from './components/ExportModal';
import { UpgradeModal } from './components/UpgradeModal';
import { AuthModal } from './features/auth/AuthModal';
import { UserDashboardModal } from './features/dashboard/UserDashboardModal';
import { AdminDashboardModal } from './features/admin/AdminDashboardModal';
import {
  Square3Stack3DIcon,
  AdjustmentsHorizontalIcon,
  ArrowsPointingOutIcon,
  VideoCameraIcon,
  SunIcon,
  SwatchIcon,
  Squares2X2Icon,
  MoonIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { LeftPanelTab, RightPanelTab } from './types';

export default function App() {
  const activeLeftTab = useEditorStore((s) => s.activeLeftTab);
  const setActiveLeftTab = useEditorStore((s) => s.setActiveLeftTab);
  const activeRightTab = useEditorStore((s) => s.activeRightTab);
  const setActiveRightTab = useEditorStore((s) => s.setActiveRightTab);
  const scene = useEditorStore((s) => s.scene);

  // Mobile active view switcher ('canvas' | 'left' | 'right')
  const [mobileView, setMobileView] = useState<'canvas' | 'left' | 'right'>('canvas');

  // Shared 3D viewport background applied to full app so panels/header mirror it with dark frosted blur
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
        backgroundRepeat: 'repeat',
      };
    }
    if (scene.backgroundType === 'solid') {
      return {
        backgroundColor: scene.backgroundColor,
        backgroundImage: 'none',
      };
    }
    if (scene.backgroundType === 'gradient') {
      return {
        backgroundColor: 'transparent',
        backgroundImage: scene.backgroundGradient,
        backgroundSize: 'auto',
        backgroundPosition: '0% 0%',
        backgroundRepeat: 'no-repeat',
      };
    }
    if (scene.backgroundType === 'image') {
      return {
        backgroundColor: '#0c0c0c',
        backgroundImage: scene.backgroundImageUrl ? `url(${scene.backgroundImageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return {
      backgroundColor: '#000000',
      backgroundImage: 'none',
    };
  }, [scene.backgroundType, scene.backgroundColor, scene.backgroundGradient, scene.backgroundImageUrl]);

  // Left panel tabs definition
  const leftTabs: { id: LeftPanelTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'design', label: 'Design', icon: Square3Stack3DIcon },
    { id: 'material', label: 'Material', icon: AdjustmentsHorizontalIcon },
    { id: 'position', label: 'Position', icon: ArrowsPointingOutIcon },
    { id: 'camera', label: 'Camera', icon: VideoCameraIcon },
  ];

  // Right panel tabs definition
  const rightTabs: { id: RightPanelTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'lighting', label: 'Lighting', icon: SunIcon },
    { id: 'background', label: 'Background', icon: SwatchIcon },
    { id: 'scene', label: 'Scene', icon: Squares2X2Icon },
    { id: 'shadow', label: 'Shadow', icon: MoonIcon },
  ];

  return (
    <div
      className="w-screen h-screen flex flex-col text-white overflow-hidden select-none font-sans font-geist relative transition-all duration-300"
      style={backgroundStyle}
    >
      {/* 1. Studio Top Navigation Header with Apple-Style Dark Blur */}
      <Header />

      {/* Mobile Top View Switcher (only visible on small screens < md) */}
      <div className="md:hidden flex items-center justify-around bg-[#0A0A0A] border-b border-white/10 px-2 py-1.5 shrink-0 z-20">
        <button
          type="button"
          onClick={() => setMobileView('left')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
            mobileView === 'left' ? 'bg-[#DB0B2B] text-[#FFFFFF]' : 'text-[#888888] hover:text-[#FFFFFF]'
          }`}
        >
          <Square3Stack3DIcon className="w-3.5 h-3.5" />
          <span>Left Panel</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView('canvas')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
            mobileView === 'canvas' ? 'bg-[#181818] text-[#FFFFFF] border border-white/15' : 'text-[#888888] hover:text-[#FFFFFF]'
          }`}
        >
          <CubeIcon className="w-3.5 h-3.5" />
          <span>3D Viewport</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView('right')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
            mobileView === 'right' ? 'bg-[#DB0B2B] text-[#FFFFFF]' : 'text-[#888888] hover:text-[#FFFFFF]'
          }`}
        >
          <SunIcon className="w-3.5 h-3.5" />
          <span>Right Panel</span>
        </button>
      </div>

      {/* 2. Main Studio Workspace: 2 Panels flanking Center 3D Viewport */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* PANEL SEBELAH KIRI (LEFT PANEL): Design, Material, Position, Camera */}
        <aside
          className={`w-full md:w-[300px] bg-[#0A0A0A] border-b md:border-b-0 md:border-r border-white/10 flex flex-col h-full shrink-0 z-20 shadow-2xl transition-all ${
            mobileView === 'left' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Left Panel Tabs */}
          <div className="grid grid-cols-4 border-b border-white/10 bg-[#0A0A0A] px-1 pt-1 gap-0.5">
            {leftTabs.map((tab) => {
              const isActive = activeLeftTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`left-tab-${tab.id}-btn`}
                  type="button"
                  onClick={() => setActiveLeftTab(tab.id)}
                  title={tab.label}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-t-[4px] transition-all relative cursor-pointer ${
                    isActive
                      ? 'text-[#FFFFFF] bg-[#141414]'
                      : 'text-[#888888] hover:text-[#CCCCCC] hover:bg-[#141414]/50'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 mb-1 transition-colors ${
                      isActive ? 'text-[#DB0B2B]' : 'text-current'
                    }`}
                  />
                  <span className="text-[10px] font-semibold tracking-tight uppercase truncate max-w-full">
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-[#DB0B2B] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 overflow-y-auto bg-transparent">
            {activeLeftTab === 'design' && <DesignPanel />}
            {activeLeftTab === 'material' && <MaterialPanel />}
            {activeLeftTab === 'position' && <PositionPanel />}
            {activeLeftTab === 'camera' && <CameraPanel />}
          </div>
        </aside>

        {/* CENTER / MAIN: 3D Canvas Stage */}
        <main
          className={`flex-1 relative h-full bg-transparent overflow-hidden flex items-center justify-center ${
            mobileView === 'canvas' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Three.js R3F Canvas Viewport with transparent canvas on top of mirrored backdrop */}
          <Canvas3D />

          {/* Bottom Timeline Scrubber */}
          <TimelineScrubber />
        </main>

        {/* PANEL SEBELAH KANAN (RIGHT PANEL): Lighting, Background, Scene, Shadow */}
        <aside
          className={`w-full md:w-[300px] bg-[#0A0A0A] border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-full shrink-0 z-20 shadow-2xl transition-all ${
            mobileView === 'right' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Right Panel Tabs */}
          <div className="grid grid-cols-4 border-b border-white/10 bg-[#0A0A0A] px-1 pt-1 gap-0.5">
            {rightTabs.map((tab) => {
              const isActive = activeRightTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`right-tab-${tab.id}-btn`}
                  type="button"
                  onClick={() => setActiveRightTab(tab.id)}
                  title={tab.label}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-t-[4px] transition-all relative cursor-pointer ${
                    isActive
                      ? 'text-[#FFFFFF] bg-[#141414]'
                      : 'text-[#888888] hover:text-[#CCCCCC] hover:bg-[#141414]/50'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 mb-1 transition-colors ${
                      isActive ? 'text-[#DB0B2B]' : 'text-current'
                    }`}
                  />
                  <span className="text-[10px] font-semibold tracking-tight uppercase truncate max-w-full">
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-[#DB0B2B] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Panel Content */}
          <div className="flex-1 overflow-y-auto bg-transparent">
            {activeRightTab === 'lighting' && <LightingPanel />}
            {activeRightTab === 'background' && <BackgroundPanel />}
            {activeRightTab === 'scene' && <ScenePanel />}
            {activeRightTab === 'shadow' && <ShadowPanel />}
          </div>
        </aside>
      </div>

      {/* 3. Global Dialog Modals */}
      <ExportModal />
      <UpgradeModal />
      <AuthModal />
      <UserDashboardModal />
      <AdminDashboardModal />
    </div>
  );
}
