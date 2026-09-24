import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { XMarkIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolidIcon, StarIcon } from '@heroicons/react/24/solid';
import confetti from 'canvas-confetti';

export const UpgradeModal: React.FC = () => {
  const upgradeModalOpen = useEditorStore((s) => s.upgradeModalOpen);
  const setUpgradeModalOpen = useEditorStore((s) => s.setUpgradeModalOpen);
  const user = useEditorStore((s) => s.user);
  const setUserPlan = useEditorStore((s) => s.setUserPlan);

  if (!upgradeModalOpen) return null;

  const handleUpgradeToPro = () => {
    setUserPlan('pro');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#DB0B2B', '#ffffff', '#FFD700'],
    });
    setTimeout(() => {
      setUpgradeModalOpen(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200 font-geist">
      <div className="w-full max-w-xl bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DB0B2B] flex items-center justify-center text-white shadow-lg shadow-[#DB0B2B]/30">
              <SparklesSolidIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sora">
                Upgrade to Editor Suite Pro
              </h2>
              <p className="text-xs text-[#888888]">
                Buka seluruh kapabilitas studio 3D rendering & video export
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUpgradeModalOpen(false)}
            className="p-1 rounded-lg text-[#777777] hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards Comparison */}
        <div className="p-6 pt-4 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Tier */}
            <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase text-[#888888] tracking-wider font-sora">
                  Starter Plan
                </div>
                <div className="text-2xl font-bold text-white mt-1 font-sora">Free</div>
                <p className="text-xs text-[#666666] mt-0.5">
                  Untuk eksplorasi & mockup dasar
                </p>

                <ul className="mt-4 space-y-2 text-xs text-[#aaaaaa]">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#666666]" />
                    <span>Real-time 3D Canvas Editor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#666666]" />
                    <span>Standar T-Shirt Models</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#555555] line-through">
                    <XMarkIcon className="w-3.5 h-3.5 text-[#555555]" />
                    <span>Ekspor Resolusi Tinggi (HD)</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#555555] line-through">
                    <XMarkIcon className="w-3.5 h-3.5 text-[#555555]" />
                    <span>360° Looping Video Export</span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 pt-3 border-t border-[#222222]">
                <span className="text-xs text-[#666666]">
                  {user.plan === 'free' ? 'Plan Aktif' : 'Free Tier'}
                </span>
              </div>
            </div>

            {/* Pro Tier (Featured in #DB0B2B) */}
            <div className="p-4 rounded-xl bg-[#1a1213] border-2 border-[#DB0B2B] flex flex-col justify-between relative shadow-xl shadow-[#DB0B2B]/10">
              <div className="absolute -top-2.5 right-4 bg-[#DB0B2B] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider font-sora">
                POPULAR
              </div>

              <div>
                <div className="text-xs font-semibold uppercase text-[#DB0B2B] tracking-wider flex items-center gap-1 font-sora">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>Pro Studio</span>
                </div>
                <div className="text-2xl font-bold text-white mt-1 font-sora">
                  Rp 149.000
                  <span className="text-xs font-normal text-[#888888]">/bulan</span>
                </div>
                <p className="text-xs text-[#999999] mt-0.5">
                  Akses tanpa batas untuk designer & agensi
                </p>

                <ul className="mt-4 space-y-2 text-xs text-[#dddddd]">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                    <span>Ultra HD 4K Image Render (Semua rasio)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                    <span>Ekspor Video 360° MP4 & WebM 60 FPS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                    <span>Akses Seluruh Model (Jersey, Hoodie, Polo)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                    <span>Commercial Client Rights</span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 pt-3 border-t border-[#2e1d1f]">
                {user.plan === 'pro' ? (
                  <div className="w-full py-2 rounded-lg bg-[#252525] text-center text-xs font-semibold text-green-400 font-sora">
                    Aktif (Pro Member)
                  </div>
                ) : (
                  <button
                    id="upgrade-confirm-btn"
                    type="button"
                    onClick={handleUpgradeToPro}
                    className="w-full py-2.5 rounded-lg bg-[#DB0B2B] hover:bg-[#f01436] active:bg-[#b00820] text-white text-xs font-bold transition-all shadow-md shadow-[#DB0B2B]/25 cursor-pointer flex items-center justify-center gap-1.5 font-sora"
                  >
                    <StarIcon className="w-3.5 h-3.5" />
                    <span>Aktifkan Pro Sekarang</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-[#666666]">
            Garansi kepuasan 14 hari. Batalkan kapan saja tanpa komitmen.
          </div>
        </div>
      </div>
    </div>
  );
};
