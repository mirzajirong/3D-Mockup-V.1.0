import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import {
  XMarkIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ArrowRightIcon,
  SparklesIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { APP_CONFIG } from '../../config/constants';

export const AuthModal: React.FC = () => {
  const authModalOpen = useEditorStore((s) => s.authModalOpen);
  const setAuthModalOpen = useEditorStore((s) => s.setAuthModalOpen);
  const loginDemo = useEditorStore((s) => s.loginDemo);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('editorsuite.id@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Studio Editor');

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginDemo(email);
    setAuthModalOpen(false);
  };

  const handleQuickDemoLogin = () => {
    loginDemo('editorsuite.id@gmail.com');
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-white/15 rounded-[6px] shadow-2xl overflow-hidden flex flex-col">
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
                <span className="text-xs font-bold text-[#FFFFFF] tracking-wider font-sora">
                  EDITOR SUITE
                </span>
                <span className="text-[10px] text-[#DB0B2B] font-mono font-bold">
                  AUTH
                </span>
              </div>
              <span className="text-[10px] text-[#888888] font-medium tracking-tight">
                {APP_CONFIG.tagline}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-[4px] border border-white/10 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Segmented Control */}
        <div className="px-6 pt-4 pb-2 bg-[#0A0A0A]">
          <div className="grid grid-cols-2 p-1 bg-[#141414] rounded-[4px] border border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-1.5 px-3 rounded-[3px] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sora ${
                mode === 'login'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                  : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] border border-transparent'
              }`}
            >
              <KeyIcon className={`w-3.5 h-3.5 ${mode === 'login' ? 'text-[#DB0B2B]' : 'text-current'}`} />
              <span>MASUK</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-1.5 px-3 rounded-[3px] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sora ${
                mode === 'register'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                  : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] border border-transparent'
              }`}
            >
              <UserIcon className={`w-3.5 h-3.5 ${mode === 'register' ? 'text-[#DB0B2B]' : 'text-current'}`} />
              <span>DAFTAR AKUN</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-3.5">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium">Nama Lengkap</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#141414] border border-white/15 focus:border-[#DB0B2B] rounded-[4px] pl-9 pr-3 py-2 text-xs text-[#FFFFFF] placeholder-[#555555] outline-none transition-colors"
                  placeholder="Nama Lengkap"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-[#888888] font-medium">Email Address</label>
            <div className="relative">
              <EnvelopeIcon className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#141414] border border-white/15 focus:border-[#DB0B2B] rounded-[4px] pl-9 pr-3 py-2 text-xs text-[#FFFFFF] placeholder-[#555555] outline-none transition-colors"
                placeholder="nama@domain.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#888888] font-medium">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="text-[11px] text-[#DB0B2B] hover:underline cursor-pointer"
                >
                  Gunakan Password Demo
                </button>
              )}
            </div>
            <div className="relative">
              <LockClosedIcon className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#141414] border border-white/15 focus:border-[#DB0B2B] rounded-[4px] pl-9 pr-3 py-2 text-xs text-[#FFFFFF] placeholder-[#555555] outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* 1-Click Quick Demo Login Button */}
          <div className="p-3 rounded-[4px] bg-[#141414] border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-[#DB0B2B] shrink-0" />
              <div>
                <div className="font-semibold text-[#FFFFFF]">Akun Demo Editor Suite</div>
                <div className="text-[10px] text-[#888888] font-mono">editorsuite.id@gmail.com</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="px-2.5 py-1 rounded-[3px] bg-[#181818] hover:bg-[#1E1E1E] border border-white/15 text-[#FFFFFF] text-[11px] font-bold font-sora cursor-pointer transition-colors"
            >
              1-Klik Masuk
            </button>
          </div>

          {/* Submit Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full py-2.5 rounded-[4px] bg-[#DB0B2B] hover:bg-[#F01436] active:bg-[#B00820] text-[#FFFFFF] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-sora mt-2"
          >
            <span>{mode === 'login' ? 'MASUK KE STUDIO' : 'BUAT AKUN BARU'}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>

          {/* Switch Prompt */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs text-[#888888] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              {mode === 'login'
                ? 'Belum punya akun? Buat akun di sini'
                : 'Sudah terdaftar? Masuk ke studio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
