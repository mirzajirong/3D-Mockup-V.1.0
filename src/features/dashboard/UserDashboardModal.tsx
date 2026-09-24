import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { 
  XMarkIcon, 
  UserIcon, 
  SparklesIcon, 
  CircleStackIcon, 
  ClockIcon, 
  Square3Stack3DIcon, 
  CheckCircleIcon,
  CubeIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import { APP_CONFIG } from '../../config/constants';
import { ModelType } from '../../types';

export const UserDashboardModal: React.FC = () => {
  const userDashboardOpen = useEditorStore((s) => s.userDashboardOpen);
  const setUserDashboardOpen = useEditorStore((s) => s.setUserDashboardOpen);
  const setUpgradeModalOpen = useEditorStore((s) => s.setUpgradeModalOpen);
  const user = useEditorStore((s) => s.user);
  const setUserPlan = useEditorStore((s) => s.setUserPlan);
  const layers = useEditorStore((s) => s.layers);
  const currentModel = useEditorStore((s) => s.currentModel);
  const setModel = useEditorStore((s) => s.setModel);

  const [activeTab, setActiveTab] = useState<'overview' | 'garments' | 'exports'>('overview');

  if (!userDashboardOpen) return null;

  const garmentList: { id: ModelType; name: string; category: string; tag?: string; desc: string }[] = [
    { id: 'o-neck', name: '01. O-Neck Classic Jersey', category: 'T-Shirt', desc: 'Standard crewneck athletic cut with front & back UV mapping' },
    { id: 'v-neck', name: '02. V-Neck Athletic Jersey', category: 'Jersey', desc: 'Performance taper with ribbed collar and shoulder seams' },
    { id: 'polo', name: '03. Polo Performance Jersey', category: 'Polo', desc: 'Fold-over collar with button placket and side vents' },
    { id: 'long-sleeve', name: '04. Long Sleeve Raglan Jersey', category: 'Long Sleeve', desc: 'Extended sleeve panels with wrist cuffs' },
    { id: 'hoodie', name: '05. Streetwear Heavyweight Hoodie', category: 'Hoodie', tag: 'PRO', desc: 'Oversized fleece fit with kangaroo pocket and double-layer hood' },
  ];

  const exportHistory = [
    { id: 'exp_01', title: '360° Turntable Loop (O-Neck)', format: 'MP4 (H.264)', ratio: '16:9', fps: '60 FPS', date: 'Hari ini, 12:40' },
    { id: 'exp_02', title: 'Studio Snapshot Decal', format: 'PNG (Lossless)', ratio: '1:1', fps: '2048px', date: 'Kemarin, 16:15' },
    { id: 'exp_03', title: 'Vertical Reel Turntable', format: 'MP4 (H.264)', ratio: '9:16', fps: '60 FPS', date: '22 Sep 2026' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0A0A0A] border border-white/15 rounded-[6px] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#000000]">
          <div className="flex items-center gap-3">
            <img
              src={APP_CONFIG.assets.logo}
              alt="Editor Suite"
              className="w-7 h-7 rounded-[3px] object-contain shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#FFFFFF] tracking-wider font-sora">
                  STUDIO DASHBOARD
                </span>
                <span className="text-[10px] text-[#DB0B2B] font-mono font-bold">
                  OVERVIEW
                </span>
              </div>
              <span className="text-[10px] text-[#888888] font-medium tracking-tight">
                {APP_CONFIG.tagline}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUserDashboardOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-[4px] border border-white/10 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Dashboard Tabs */}
        <div className="px-6 pt-3 pb-2 bg-[#0A0A0A] border-b border-white/5">
          <div className="flex items-center gap-1 p-1 bg-[#141414] rounded-[4px] border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-1.5 px-3 rounded-[3px] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sora ${
                activeTab === 'overview'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                  : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] border border-transparent'
              }`}
            >
              <UserIcon className={`w-3.5 h-3.5 ${activeTab === 'overview' ? 'text-[#DB0B2B]' : 'text-current'}`} />
              <span>RINGKASAN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('garments')}
              className={`flex-1 py-1.5 px-3 rounded-[3px] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sora ${
                activeTab === 'garments'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                  : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] border border-transparent'
              }`}
            >
              <CubeIcon className={`w-3.5 h-3.5 ${activeTab === 'garments' ? 'text-[#DB0B2B]' : 'text-current'}`} />
              <span>GARMENT 3D</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exports')}
              className={`flex-1 py-1.5 px-3 rounded-[3px] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sora ${
                activeTab === 'exports'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                  : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] border border-transparent'
              }`}
            >
              <ArrowDownTrayIcon className={`w-3.5 h-3.5 ${activeTab === 'exports' ? 'text-[#DB0B2B]' : 'text-current'}`} />
              <span>RIWAYAT EKSPOR</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {activeTab === 'overview' && (
            <>
              {/* User Profile Card */}
              <div className="p-4 rounded-[4px] bg-[#141414] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-[4px] border border-white/20 overflow-hidden bg-[#181818] shrink-0 flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-[#888888]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#FFFFFF] font-sora">{user.name}</h3>
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-[2px] uppercase tracking-wider font-sora ${
                          user.plan === 'pro'
                            ? 'bg-[#DB0B2B]/15 text-[#DB0B2B] border border-[#DB0B2B]/40'
                            : 'bg-[#181818] text-[#CCCCCC]'
                        }`}
                      >
                        {user.plan === 'pro' ? 'Pro Member' : 'Free Tier'}
                      </span>
                    </div>
                    <p className="text-xs text-[#888888] font-mono mt-0.5">{user.email}</p>
                    <div className="text-[11px] text-[#888888] mt-0.5">
                      Account ID: {user.id} · Server Asia-Southeast
                    </div>
                  </div>
                </div>

                {/* Plan Action CTA */}
                {user.plan === 'free' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUserDashboardOpen(false);
                      setUpgradeModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-[4px] bg-[#DB0B2B] hover:bg-[#F01436] active:bg-[#B00820] text-[#FFFFFF] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 font-sora"
                  >
                    <StarIcon className="w-3.5 h-3.5 text-[#FFFFFF]" />
                    <span>UPGRADE PRO</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setUserPlan('free')}
                    className="px-3 py-1.5 rounded-[4px] bg-[#181818] hover:bg-[#1E1E1E] border border-white/10 text-xs text-[#CCCCCC] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                  >
                    Switch to Free
                  </button>
                )}
              </div>

              {/* Studio Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-[4px] bg-[#141414] border border-white/10">
                  <div className="flex items-center justify-between text-[#888888] mb-1">
                    <span className="text-[11px] font-medium">Active Decal Layers</span>
                    <Square3Stack3DIcon className="w-4 h-4 text-[#DB0B2B]" />
                  </div>
                  <div className="text-lg font-bold text-[#FFFFFF] font-sora">
                    {layers.length} Layers
                  </div>
                  <div className="text-[10px] text-[#888888] mt-0.5">
                    Real-time UV Decals
                  </div>
                </div>

                <div className="p-3.5 rounded-[4px] bg-[#141414] border border-white/10">
                  <div className="flex items-center justify-between text-[#888888] mb-1">
                    <span className="text-[11px] font-medium">Canvas Resolution</span>
                    <CircleStackIcon className="w-4 h-4 text-[#DB0B2B]" />
                  </div>
                  <div className="text-lg font-bold text-[#FFFFFF] font-sora">
                    2048 x 2048
                  </div>
                  <div className="text-[10px] text-[#888888] mt-0.5">
                    GPU High-Resolution Buffer
                  </div>
                </div>

                <div className="p-3.5 rounded-[4px] bg-[#141414] border border-white/10">
                  <div className="flex items-center justify-between text-[#888888] mb-1">
                    <span className="text-[11px] font-medium">Video Render Engine</span>
                    <ClockIcon className="w-4 h-4 text-[#DB0B2B]" />
                  </div>
                  <div className="text-lg font-bold text-[#FFFFFF] font-sora">
                    {user.plan === 'pro' ? '60 FPS Hardware' : '30 FPS Limited'}
                  </div>
                  <div className="text-[10px] text-[#888888] mt-0.5">
                    WebCodecs VideoEncoder
                  </div>
                </div>
              </div>

              {/* Studio Features Checklist */}
              <div className="p-4 rounded-[4px] bg-[#141414] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5 font-sora">
                    <SparklesIcon className="w-4 h-4 text-[#DB0B2B]" />
                    <span>Fitur Studio Aktif</span>
                  </h4>
                  <span className="text-[10px] text-[#888888] font-mono">v1.0 Release</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#CCCCCC]">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#DB0B2B] shrink-0" />
                    <span>Multi-Angle Camera & Orbit Presets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#DB0B2B] shrink-0" />
                    <span>Photoshop Blend Modes (Multiply, Screen)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#DB0B2B] shrink-0" />
                    <span>Studio 3-Point Lighting & Underfill</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#DB0B2B] shrink-0" />
                    <span>360° Looping Video Exporter (MP4/WebM)</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'garments' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888888]">Pilih Model Garment untuk dibuka di 3D Viewport:</span>
                <span className="text-[11px] font-mono text-[#FFFFFF]">Model Aktif: <strong className="text-[#DB0B2B] font-sora">{currentModel}</strong></span>
              </div>

              <div className="space-y-2">
                {garmentList.map((m) => {
                  const isCurrent = currentModel === m.id;
                  const isLocked = m.tag === 'PRO' && user.plan !== 'pro';

                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-[4px] border flex items-center justify-between gap-3 transition-colors ${
                        isCurrent
                          ? 'bg-[#181818] border-[#DB0B2B]'
                          : 'bg-[#141414] border-white/10 hover:border-white/20 hover:bg-[#181818]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[3px] bg-[#0A0A0A] border border-white/10 flex items-center justify-center shrink-0">
                          <CubeIcon className={`w-5 h-5 ${isCurrent ? 'text-[#DB0B2B]' : 'text-[#888888]'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#FFFFFF] font-sora">{m.name}</span>
                            {m.tag && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#DB0B2B]/15 text-[#DB0B2B] border border-[#DB0B2B]/40 font-sora">
                                {m.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#888888]">{m.desc}</p>
                        </div>
                      </div>

                      <div>
                        {isCurrent ? (
                          <span className="px-3 py-1.5 rounded-[3px] bg-[#DB0B2B]/15 border border-[#DB0B2B]/40 text-[#DB0B2B] text-xs font-semibold flex items-center gap-1 font-sora">
                            <CheckIcon className="w-3.5 h-3.5" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (isLocked) {
                                setUserDashboardOpen(false);
                                setUpgradeModalOpen(true);
                              } else {
                                setModel(m.id);
                                setUserDashboardOpen(false);
                              }
                            }}
                            className="px-3 py-1.5 rounded-[3px] bg-[#181818] hover:bg-[#1E1E1E] border border-white/15 text-[#FFFFFF] text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 font-sora"
                          >
                            <span>{isLocked ? 'Upgrade' : 'Gunakan'}</span>
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'exports' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888888]">Riwayat Hasil Rendering & Ekspor:</span>
                <span className="text-[11px] font-mono text-[#888888]">3 File Terbaru</span>
              </div>

              <div className="space-y-2">
                {exportHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-[4px] bg-[#141414] border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[3px] bg-[#181818] border border-white/10 flex items-center justify-center shrink-0">
                        <ArrowDownTrayIcon className="w-4 h-4 text-[#DB0B2B]" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#FFFFFF] font-sora">{item.title}</div>
                        <div className="text-[10px] text-[#888888] flex items-center gap-2 mt-0.5">
                          <span>{item.format}</span>
                          <span>·</span>
                          <span>{item.ratio}</span>
                          <span>·</span>
                          <span>{item.fps}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-[#888888]">{item.date}</div>
                      <div className="text-[10px] text-[#10B981] font-mono mt-0.5">Disimpan</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardModal;
