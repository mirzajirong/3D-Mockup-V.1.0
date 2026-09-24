import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { XMarkIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import confetti from 'canvas-confetti';
import { APP_CONFIG } from '../config/constants';

export const UpgradeModal: React.FC = () => {
  const upgradeModalOpen = useEditorStore((s) => s.upgradeModalOpen);
  const setUpgradeModalOpen = useEditorStore((s) => s.setUpgradeModalOpen);
  const user = useEditorStore((s) => s.user);
  const setUserPlan = useEditorStore((s) => s.setUserPlan);

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  if (!upgradeModalOpen) return null;

  const handleUpgradeToPro = () => {
    setUserPlan('pro');
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#DB0B2B', '#ffffff', '#FFD700', '#111111'],
    });
    setTimeout(() => {
      setUpgradeModalOpen(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0A0A0A] border border-white/15 rounded-[6px] shadow-2xl overflow-hidden flex flex-col">
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
                  EDITOR SUITE PRO
                </span>
                <span className="text-[10px] text-[#DB0B2B] font-mono font-bold">
                  STUDIO SUITE
                </span>
              </div>
              <span className="text-[10px] text-[#888888] font-medium tracking-tight">
                {APP_CONFIG.tagline}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUpgradeModalOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-[4px] border border-white/10 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Subtitle & Billing Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <h2 className="text-base font-bold text-[#FFFFFF] font-sora">
                Buka Seluruh Kapabilitas Studio 3D
              </h2>
              <p className="text-xs text-[#888888] mt-0.5">
                Didesain khusus untuk creative editor, apparel designer, dan branding agency.
              </p>
            </div>

            {/* Segmented billing control */}
            <div className="flex items-center p-1 bg-[#141414] border border-white/10 rounded-[4px] self-start sm:self-auto shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 text-[11px] font-semibold rounded-[3px] transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                    : 'text-[#888888] hover:text-[#FFFFFF]'
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1 text-[11px] font-semibold rounded-[3px] transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-[#DB0B2B] text-[#FFFFFF]'
                    : 'text-[#888888] hover:text-[#FFFFFF]'
                }`}
              >
                <span>Tahunan</span>
                <span className="text-[9px] font-bold text-[#FFFFFF]/90">Hemat 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Tier */}
            <div className="p-5 rounded-[4px] bg-[#141414] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase text-[#888888] tracking-wider font-sora">
                  Starter Studio
                </div>
                <div className="text-2xl font-extrabold text-[#FFFFFF] mt-1 font-sora">
                  Free
                </div>
                <p className="text-xs text-[#888888] mt-1">
                  Untuk eksplorasi mockup & preview 3D real-time.
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5 text-xs text-[#CCCCCC]">
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                    <span>Real-time WebGL 3D Canvas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                    <span>Standar T-Shirt Models (O-Neck & V-Neck)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                    <span>Custom Fabric Colors & Specular Control</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#555555] line-through">
                    <XMarkIcon className="w-3.5 h-3.5 text-[#555555] shrink-0" />
                    <span>High-Resolution HD Image Export</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#555555] line-through">
                    <XMarkIcon className="w-3.5 h-3.5 text-[#555555] shrink-0" />
                    <span>360° Looping Video Render (WebCodecs)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#555555] line-through">
                    <XMarkIcon className="w-3.5 h-3.5 text-[#555555] shrink-0" />
                    <span>Hoodie & Premium Model Access</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#888888]">
                <span>Status Saat Ini</span>
                <span className="font-semibold text-[#FFFFFF]">
                  {user.plan === 'free' ? 'Aktif' : 'Free Tier'}
                </span>
              </div>
            </div>

            {/* Pro Tier (Accent) */}
            <div className="p-5 rounded-[4px] bg-[#181818] border-2 border-[#DB0B2B] flex flex-col justify-between relative">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase text-[#DB0B2B] tracking-wider flex items-center gap-1 font-sora">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Pro Studio</span>
                  </div>
                  <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-[2px] bg-[#DB0B2B] text-[#FFFFFF] font-sora tracking-wide">
                    RECOMMENDED
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-extrabold text-[#FFFFFF] font-sora">
                    {billingCycle === 'annual' ? 'Rp 119.000' : 'Rp 149.000'}
                  </span>
                  <span className="text-xs text-[#888888]">/ bulan</span>
                </div>

                <p className="text-xs text-[#CCCCCC] mt-1">
                  Akses tak terbatas untuk tim kreatif & professional studio.
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5 text-xs text-[#CCCCCC]">
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B] shrink-0" />
                    <span className="font-medium text-[#FFFFFF]">360° Looping Video Export (MP4 & WebM 60 FPS)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B] shrink-0" />
                    <span className="font-medium text-[#FFFFFF]">Ultra HD 2K & 4K Multi-Ratio Snapshot Export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B] shrink-0" />
                    <span>Buka Seluruh Model: Hoodie, Polo, Long Sleeve, Athletic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B] shrink-0" />
                    <span>Priority GPU WebCodecs Video Encoder Pipeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B] shrink-0" />
                    <span>Commercial Client Rights & Zero Watermarks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B] shrink-0" />
                    <span>Multi-Rig Studio Lighting & Contact Shadows</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/10">
                {user.plan === 'pro' ? (
                  <div className="w-full py-2.5 rounded-[4px] bg-[#141414] border border-[#10B981]/40 text-center text-xs font-semibold text-[#10B981] font-sora">
                    ✓ Status Akun: Pro Member Aktif
                  </div>
                ) : (
                  <button
                    id="upgrade-confirm-btn"
                    type="button"
                    onClick={handleUpgradeToPro}
                    className="w-full py-2.5 px-4 rounded-[4px] bg-[#DB0B2B] hover:bg-[#F01436] active:bg-[#B00820] text-[#FFFFFF] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sora"
                  >
                    <StarIcon className="w-3.5 h-3.5" />
                    <span>AKTIFKAN PRO STUDIO SEKARANG</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Guarantee */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#888888] pt-2 border-t border-white/10 gap-2 text-center sm:text-left">
            <div>
              Garansi kepuasan 14 hari · Batalkan langganan kapan saja tanpa penalti
            </div>
            <div className="text-[#888888] font-mono text-[10px]">
              Editor Suite Security · ISO 27001
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
