'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminAuth } from '../lib/data';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(getAdminAuth());
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-[#090c15]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand: Clean, mature, sports typography */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/15 flex items-center justify-center font-mono font-bold text-xs text-white tracking-tight">
            EC
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold tracking-tight text-white uppercase leading-none">
              EL CLÁSICO
            </div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mt-0.5">
              Real Madrid vs Liverpool FC
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links: Clean, mature, no childish emojis */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-zinc-300">
          <a href="#pitch-section" className="hover:text-white transition py-1">
            Taktika
          </a>
          <a href="#cards-section" className="hover:text-white transition py-1">
            Tarkib
          </a>
          {isAdmin && (
            <Link href="/admin" className="hover:text-emerald-400 text-emerald-300 transition py-1 font-bold">
              Davomat
            </Link>
          )}
          <a href="#leaderboard-section" className="hover:text-white transition py-1">
            Jamoalar
          </a>
          <a href="#analytics-section" className="hover:text-amber-400 text-amber-300 transition py-1">
            Grafik
          </a>
          <a href="#players-leaderboard" className="hover:text-white transition py-1">
            Reyting
          </a>
          <a href="#matches-section" className="hover:text-white transition py-1">
            O'yinlar
          </a>
        </div>

        {/* Right Action: Clean Admin Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-zinc-200 hover:text-white text-xs font-semibold uppercase tracking-wider transition"
          >
            {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            <span className="hidden xs:inline">{isAdmin ? 'Admin (Faol)' : 'Admin Kirish'}</span>
            <span className="xs:hidden">{isAdmin ? 'Admin' : 'Kirish'}</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-zinc-300 hover:text-white"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/[0.08] space-y-1 text-xs font-semibold uppercase">
          <a
            href="#pitch-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-white/[0.06] hover:text-white"
          >
            Taktika (Maydon)
          </a>
          <a
            href="#cards-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-white/[0.06] hover:text-white"
          >
            Tarkib (Kartochkalar)
          </a>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-emerald-300 font-bold hover:bg-white/[0.06]"
            >
              Davomat (Admin)
            </Link>
          )}
          <a
            href="#leaderboard-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-white/[0.06] hover:text-white"
          >
            Jamoalar Reytingi
          </a>
          <a
            href="#analytics-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-amber-300 hover:bg-white/[0.06]"
          >
            Grafik & Tahlil
          </a>
          <a
            href="#players-leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-white/[0.06] hover:text-white"
          >
            O'yinchilar Reytingi
          </a>
          <a
            href="#matches-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-white/[0.06] hover:text-white"
          >
            O'yinlar Tarixi
          </a>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-amber-400 hover:bg-white/[0.06]"
          >
            Admin Panel
          </Link>
        </div>
      )}
    </nav>
  );
}
