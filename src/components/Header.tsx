import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import {
  ArrowDownTrayIcon,
  UserIcon,
  Squares2X2Icon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, StarIcon } from '@heroicons/react/20/solid';
import { ModelType } from '../types';
import { APP_CONFIG } from '../config/constants';

export const Header: React.FC = () => {
  const currentModel = useEditorStore((s) => s.currentModel);
  const setModel = useEditorStore((s) => s.setModel);
  const setExportModalOpen = useEditorStore((s) => s.setExportModalOpen);
  const setUpgradeModalOpen = useEditorStore((s) => s.setUpgradeModalOpen);
  const setUserDashboardOpen = useEditorStore((s) => s.setUserDashboardOpen);
  const setAdminDashboardOpen = useEditorStore((s) => s.setAdminDashboardOpen);
  const setAuthModalOpen = useEditorStore((s) => s.setAuthModalOpen);
  const user = useEditorStore((s) => s.user);
  const setUserPlan = useEditorStore((s) => s.setUserPlan);
  const logout = useEditorStore((s) => s.logout);

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const models: { id: ModelType; name: string; tag?: string }[] = [
    { id: 'o-neck', name: '01. O-Neck Jersey' },
    { id: 'v-neck', name: '02. V-Neck Jersey' },
    { id: 'polo', name: '03. Polo Jersey' },
    { id: 'long-sleeve', name: '04. Long Sleeve Jersey' },
    { id: 'hoodie', name: '05. Streetwear Hoodie', tag: 'PRO' },
  ];

  return (
    <header className="h-14 bg-black/45 backdrop-blur-2xl border-b border-white/10 px-4 flex items-center justify-between z-30 select-none font-geist shadow-sm">
      {/* LEFT: Logo emblem, STUDIO V. 1.0, by EDITOR SUITE, Divider, 3D Model button */}
      <div className="flex items-center gap-3">
        {/* Red Owl Logo Emblem */}
        <div className="flex items-center gap-2.5">
          <img
            src={APP_CONFIG.assets.logo}
            alt="Editor Suite Logo"
            className="w-8 h-8 rounded-[4px] object-contain shadow-sm shrink-0"
          />

          {/* STUDIO V. 1.0 & by EDITOR SUITE */}
          <div className="flex flex-col justify-center leading-none">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white tracking-wider font-sora">
                STUDIO
              </span>
              <span className="px-1.5 py-0.5 rounded-full border border-[#DB0B2B] text-[9.5px] font-bold text-[#DB0B2B] leading-none tracking-tight">
                V. 1.0
              </span>
            </div>
            <span className="text-[9.5px] text-[#888888] uppercase tracking-wider font-medium mt-0.5">
              by EDITOR SUITE
            </span>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-white/10 mx-1" />

        {/* 3D Model dropdown trigger */}
        <div className="relative">
          <button
            id="model-selector-btn"
            type="button"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 active:bg-white/5 px-3.5 py-1.5 rounded-[4px] border border-white/10 text-xs font-medium text-white transition-all cursor-pointer backdrop-blur-md"
          >
            <CubeIcon className="w-4 h-4 text-[#DB0B2B]" />
            <span>3D Model</span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-[#888888]" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-48 bg-black/85 backdrop-blur-2xl border border-white/15 rounded-[4px] shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-wider font-sora border-b border-white/5">
                Select 3D Garment
              </div>
              {models.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    if (m.tag === 'PRO' && user.plan !== 'pro') {
                      setUpgradeModalOpen(true);
                    } else {
                      setModel(m.id);
                    }
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                    currentModel === m.id
                      ? 'bg-white/15 text-white font-semibold text-[#DB0B2B]'
                      : 'text-[#cccccc] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{m.name}</span>
                  {m.tag && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#DB0B2B]/20 text-[#DB0B2B] border border-[#DB0B2B]/40 font-sora">
                      {m.tag}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: EXPORT, ★ PRO, User Avatar */}
      <div className="flex items-center gap-2.5">
        {/* EXPORT BUTTON */}
        <button
          id="header-export-btn"
          type="button"
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 active:bg-white/5 px-3.5 py-1.5 rounded-[4px] border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer font-sora backdrop-blur-md"
        >
          <ArrowDownTrayIcon className="w-3.5 h-3.5 text-white" />
          <span>EXPORT</span>
        </button>

        {/* PRO BUTTON */}
        <button
          id="header-upgrade-btn"
          type="button"
          onClick={() => setUpgradeModalOpen(true)}
          className="flex items-center gap-1.5 bg-black/40 hover:bg-[#DB0B2B]/15 active:bg-black/60 border border-[#DB0B2B]/70 px-3 py-1.5 rounded-[4px] text-xs font-bold text-[#DB0B2B] transition-all cursor-pointer font-sora shadow-xs backdrop-blur-md"
        >
          <StarIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
          <span>PRO</span>
        </button>

        {/* User Avatar Menu Dropdown */}
        <div className="relative">
          <button
            id="user-profile-btn"
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-8 h-8 rounded-[4px] border border-white/15 hover:border-white/30 overflow-hidden flex items-center justify-center bg-white/5 backdrop-blur-md transition-all cursor-pointer"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-[#888888]" />
            )}
          </button>

          {profileDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-black/85 backdrop-blur-2xl border border-white/15 rounded-[4px] shadow-2xl py-2 z-50 divide-y divide-white/10">
              {/* User Info */}
              <div className="px-3.5 py-2.5">
                <div className="text-xs font-semibold text-white truncate font-sora">
                  {user.name}
                </div>
                <div className="text-[11px] text-[#888888] truncate">
                  {user.email}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider font-sora ${
                      user.plan === 'pro'
                        ? 'bg-[#DB0B2B]/20 text-[#DB0B2B] border border-[#DB0B2B]/40'
                        : 'bg-[#252525] text-[#aaaaaa]'
                    }`}
                  >
                    {user.plan === 'pro' ? 'Pro Member' : 'Free Tier'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setUserPlan(user.plan === 'free' ? 'pro' : 'free')
                    }
                    className="text-[11px] text-[#DB0B2B] hover:underline cursor-pointer"
                  >
                    Switch to {user.plan === 'free' ? 'Pro' : 'Free'}
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserDashboardOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#cccccc] hover:bg-[#1c1c1c] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <Squares2X2Icon className="w-4 h-4 text-[#888888]" />
                  <span>User Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdminDashboardOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#cccccc] hover:bg-[#1c1c1c] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <ShieldCheckIcon className="w-4 h-4 text-[#888888]" />
                  <span>Admin Panel</span>
                </button>
              </div>

              {/* Auth / Account Switch */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#cccccc] hover:bg-[#1c1c1c] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <SparklesIcon className="w-4 h-4 text-[#888888]" />
                  <span>Sign In / Register</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#ff5555] hover:bg-[#1c1c1c] transition-colors text-left cursor-pointer"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
