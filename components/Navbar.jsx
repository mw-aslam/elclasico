'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminAuth, getStoredNotifications, markNotificationsAsRead, recordCurrentSession } from '../lib/data';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    setIsAdmin(getAdminAuth());
    setNotifications(getStoredNotifications());
    recordCurrentSession(getAdminAuth() ? 'Admin' : 'Mehmon');
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggleNotif = () => {
    if (!isNotifOpen && unreadCount > 0) {
      const updated = markNotificationsAsRead();
      setNotifications(updated);
    }
    setIsNotifOpen(!isNotifOpen);
  };

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

        {/* Right Action: Clean Admin Button & Notification Center */}
        <div className="flex items-center gap-2 sm:gap-3 relative">
          
          {/* Notification Bell Button */}
          <button
            onClick={handleToggleNotif}
            className="relative p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
            aria-label="Bildirishnomalar"
            title="Bildirishnomalar"
          >
            <span className="text-sm">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-[#0c101d] border border-white/15 shadow-2xl p-4 z-50 space-y-3 backdrop-blur-xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔔</span>
                  <span className="font-black text-xs uppercase tracking-wider text-white">Bildirishnomalar</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  {notifications.length} ta xabar
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs transition ${
                        !n.isRead ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-black/30 border-white/5'
                      }`}
                    >
                      <div className="font-bold text-white text-[11px] flex items-center justify-between">
                        <span>{n.title}</span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          {new Date(n.time).toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-300 mt-1 leading-snug">
                        {n.message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-zinc-500">
                    Hozircha yangi bildirishnomalar yo'q.
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsNotifOpen(false)}
                className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-mono font-bold transition text-center cursor-pointer"
              >
                Yopish
              </button>
            </div>
          )}

          <Link
            href={isAdmin ? "/admin" : "/login"}
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
            href={isAdmin ? "/admin" : "/login"}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-amber-400 hover:bg-white/[0.06]"
          >
            {isAdmin ? 'Admin Panel' : 'Admin Kirish'}
          </Link>
        </div>
      )}
    </nav>
  );
}
