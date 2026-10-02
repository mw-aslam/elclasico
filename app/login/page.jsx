'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setAdminAuth, getAdminAuth, verifyAdminCredentials } from '../../lib/data';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // If already authenticated on this device, redirect immediately to admin
  useEffect(() => {
    if (getAdminAuth()) {
      router.replace('/admin');
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verifyAdminCredentials(username, password)) {
      setAdminAuth(true); // Ushbu qurilma doimiy eslab qolinadi
      router.push('/admin');
    } else {
      setError("Login yoki maxfiy parol noto'g'ri.");
    }
  };

  return (
    <div className="min-h-screen bg-[#07090f] flex items-center justify-center p-4 selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-sm p-7 sm:p-8 rounded-3xl bg-[#0c101d] border border-white/10 shadow-2xl backdrop-blur-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/logos/real.svg" alt="Real Madrid" className="w-8 h-8 object-contain" />
            <span className="text-xs font-mono font-bold text-zinc-500">VS</span>
            <img src="/logos/liverpool.svg" alt="Liverpool" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            Admin Boshqaruvi
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real Madrid & Liverpool FC tizimiga kirish
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Login
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="Foydalanuvchi nomi"
              autoComplete="username"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090f] border border-white/10 text-white placeholder-zinc-600 text-sm focus:border-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Maxfiy Parol
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••••••"
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090f] border border-white/10 text-white placeholder-zinc-600 text-sm focus:border-amber-400 focus:outline-none transition tracking-widest"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider active:scale-[0.99] transition shadow-lg cursor-pointer"
            >
              Kirish
            </button>
          </div>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-white/[0.06]">
          <Link href="/" className="text-xs text-zinc-400 hover:text-white transition font-medium">
            ← Asosiy portalga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
