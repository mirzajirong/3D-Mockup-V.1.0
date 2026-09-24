import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import {
  XMarkIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200 font-geist">
      <div className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#DB0B2B] flex items-center justify-center text-white">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white font-sora">
              {mode === 'login' ? 'Masuk ke Studio' : 'Daftar Akun Baru'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="p-1 rounded-lg text-[#777777] hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs text-[#aaaaaa]">Nama Lengkap</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1b1b1b] border border-[#2d2d2d] focus:border-[#DB0B2B] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none"
                  placeholder="Nama Lengkap"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-[#aaaaaa]">Email Address</label>
            <div className="relative">
              <EnvelopeIcon className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#2d2d2d] focus:border-[#DB0B2B] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none"
                placeholder="nama@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#aaaaaa]">Password</label>
            <div className="relative">
              <LockClosedIcon className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#2d2d2d] focus:border-[#DB0B2B] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full py-3 rounded-xl bg-[#DB0B2B] hover:bg-[#f01436] active:bg-[#b00820] text-white text-xs font-bold transition-all shadow-lg shadow-[#DB0B2B]/20 flex items-center justify-center gap-2 cursor-pointer mt-2 font-sora"
          >
            <span>{mode === 'login' ? 'Masuk Sekarang' : 'Buat Akun'}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>

          {/* Quick Demo Login Hint */}
          <div className="p-2.5 rounded-lg bg-[#191919] border border-[#252525] flex items-center justify-between text-[11px] text-[#888888]">
            <span className="flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
              <span>Demo Account:</span>
            </span>
            <span className="text-[#cccccc] font-mono">editorsuite.id@gmail.com</span>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs text-[#888888] hover:text-white transition-colors cursor-pointer"
            >
              {mode === 'login'
                ? 'Belum punya akun? Daftar gratis'
                : 'Sudah punya akun? Masuk di sini'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
