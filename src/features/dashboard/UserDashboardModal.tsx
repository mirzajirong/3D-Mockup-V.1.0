import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { 
  XMarkIcon, 
  UserIcon, 
  SparklesIcon, 
  CircleStackIcon, 
  ClockIcon, 
  Square3Stack3DIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

export const UserDashboardModal: React.FC = () => {
  const userDashboardOpen = useEditorStore((s) => s.userDashboardOpen);
  const setUserDashboardOpen = useEditorStore((s) => s.setUserDashboardOpen);
  const setUpgradeModalOpen = useEditorStore((s) => s.setUpgradeModalOpen);
  const user = useEditorStore((s) => s.user);
  const setUserPlan = useEditorStore((s) => s.setUserPlan);
  const layers = useEditorStore((s) => s.layers);

  if (!userDashboardOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200 font-geist">
      <div className="w-full max-w-2xl bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1f1f1f] border border-[#333333] flex items-center justify-center text-white">
              <UserIcon className="w-4 h-4 text-[#DB0B2B]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sora">
                User Dashboard
              </h2>
              <p className="text-xs text-[#888888]">
                Informasi profil studio & status langganan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUserDashboardOpen(false)}
            className="p-1 rounded-lg text-[#777777] hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* User Profile Card */}
          <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full border-2 border-[#DB0B2B] overflow-hidden bg-[#222222] shrink-0">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sora">{user.name}</h3>
                <p className="text-xs text-[#888888] font-mono">{user.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      user.plan === 'pro'
                        ? 'bg-[#DB0B2B]/20 text-[#DB0B2B] border border-[#DB0B2B]/40'
                        : 'bg-[#252525] text-[#aaaaaa]'
                    }`}
                  >
                    {user.plan === 'pro' ? 'Pro Member' : 'Free Tier'}
                  </span>
                  <span className="text-[11px] text-[#666666]">
                    ID: {user.id}
                  </span>
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
                className="px-4 py-2.5 rounded-xl bg-[#DB0B2B] hover:bg-[#f01436] text-white text-xs font-bold transition-all shadow-lg shadow-[#DB0B2B]/20 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 font-sora"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Upgrade to Pro</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setUserPlan('free')}
                className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#282828] text-xs text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                Downgrade to Free
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#161616] border border-[#242424]">
              <div className="flex items-center justify-between text-[#888888] mb-1">
                <span className="text-xs">Active Project Layers</span>
                <Square3Stack3DIcon className="w-4 h-4 text-[#DB0B2B]" />
              </div>
              <div className="text-xl font-bold text-white font-sora">
                {layers.length} Layers
              </div>
              <div className="text-[11px] text-[#666666] mt-0.5">
                Real-time UV mapped
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#242424]">
              <div className="flex items-center justify-between text-[#888888] mb-1">
                <span className="text-xs">Storage Cloud</span>
                <CircleStackIcon className="w-4 h-4 text-[#DB0B2B]" />
              </div>
              <div className="text-xl font-bold text-white font-sora">
                128 MB <span className="text-xs text-[#666666]">/ 5 GB</span>
              </div>
              <div className="text-[11px] text-[#666666] mt-0.5">
                Cloudflare R2 Sync
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#242424]">
              <div className="flex items-center justify-between text-[#888888] mb-1">
                <span className="text-xs">Video Render Engine</span>
                <ClockIcon className="w-4 h-4 text-[#DB0B2B]" />
              </div>
              <div className="text-xl font-bold text-white font-sora">
                {user.plan === 'pro' ? 'Unlocked (HD)' : 'Locked'}
              </div>
              <div className="text-[11px] text-[#666666] mt-0.5">
                360° 60FPS WebAssembly
              </div>
            </div>
          </div>

          {/* Pro Benefits Checklist */}
          <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-sora">
              <SparklesIcon className="w-4 h-4 text-[#DB0B2B]" />
              <span>Editor Suite Studio Features</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#cccccc]">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-[#DB0B2B]" />
                <span>Realtime UV Mapping & Fabric Shaders</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-[#DB0B2B]" />
                <span>Multi-Layer Photoshop-Style Blend Modes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-[#DB0B2B]" />
                <span>Contact Shadows & Multi-Rig Studio Lighting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-[#DB0B2B]" />
                <span>Full Turntable 360° Looping Video Exporter</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
