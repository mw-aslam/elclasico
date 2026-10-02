'use client';

import { useState, useEffect, useMemo } from 'react';
import { generateScheduleMonths, saveStoredAttendance } from '../lib/data';

export default function AttendanceSection({
  attendance = {},
  players = [],
  isAdmin = false,
  onAttendanceSaved = null,
}) {
  const months = useMemo(() => generateScheduleMonths(), []);
  
  // Selected month index (starts with October 2026)
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0);
  const activeMonth = months[selectedMonthIdx] || months[0];

  // Local pending attendance state so user can freely click circles and save at the end ("ohrida saqlash qilaman")
  const [pendingAttendance, setPendingAttendance] = useState(attendance);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [teamFilter, setTeamFilter] = useState('ALL'); // 'ALL', 'Real', 'Liverpool'
  const [toastMsg, setToastMsg] = useState('');

  // Sync with incoming prop if no pending unsaved edits
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setPendingAttendance(attendance);
    }
  }, [attendance, hasUnsavedChanges]);

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const sessions = activeMonth?.sessions || [];

  // Elapsed / past or today sessions
  const elapsedSessions = useMemo(() => {
    return sessions.filter(s => s.date <= todayStr);
  }, [sessions, todayStr]);

  // Filter players by team if requested
  const filteredPlayers = useMemo(() => {
    if (teamFilter === 'Real') return players.filter(p => p.team === 'Real');
    if (teamFilter === 'Liverpool') return players.filter(p => p.team === 'Liverpool');
    return players;
  }, [players, teamFilter]);

  // Click circle: cycles null -> true (✓) -> false (✕) -> null (◯)
  const handleCellClick = (isoDate, playerId) => {
    if (!isAdmin) {
      showToast("🔒 Davomatni faqat admin tahrirlashi mumkin. Admin paneliga kiring.");
      return;
    }

    if (isoDate > todayStr) {
      showToast("🔒 Ushbu sana hali kelmagan! Davomat faqat o'yin kuni yoki undan keyin belgilanadi.");
      return;
    }

    setPendingAttendance(prev => {
      const next = { ...prev };
      const dayRec = { ...(next[isoDate] || {}) };
      const current = dayRec[playerId];

      if (!current || current.present === undefined) {
        // null -> ✓ Keldi
        dayRec[playerId] = { present: true, playedForTeam: null };
      } else if (current.present === true) {
        // ✓ Keldi -> ✕ Kelmadi
        dayRec[playerId] = { present: false, playedForTeam: null };
      } else {
        // ✕ Kelmadi -> ◯ Kutilmoqda (tozalash)
        delete dayRec[playerId];
      }

      next[isoDate] = dayRec;
      return next;
    });

    setHasUnsavedChanges(true);
  };

  // Quick Action: Mark all present only for sessions that have arrived
  const handleMarkAllMonthPresent = () => {
    if (!isAdmin) return;
    if (elapsedSessions.length === 0) {
      showToast("⚠️ Ushbu oyda hali o'tgan o'yin kuni yo'q.");
      return;
    }

    setPendingAttendance(prev => {
      const next = { ...prev };
      elapsedSessions.forEach(sess => {
        const dayRec = { ...(next[sess.date] || {}) };
        filteredPlayers.forEach(p => {
          dayRec[p.id] = { present: true, playedForTeam: null };
        });
        next[sess.date] = dayRec;
      });
      return next;
    });
    setHasUnsavedChanges(true);
    showToast("✓ O'tgan o'yin kunlari uchun barcha o'yinchilar 'Keldi' deb belgilandi. Saqlashni unutmang!");
  };

  // Quick Action: Revert unsaved edits
  const handleRevert = () => {
    setPendingAttendance(attendance);
    setHasUnsavedChanges(false);
    showToast("O'zgarishlar bekor qilindi.");
  };

  // Save changes to localStorage & trigger callback
  const handleSave = () => {
    saveStoredAttendance(pendingAttendance);
    setHasUnsavedChanges(false);
    if (onAttendanceSaved) {
      onAttendanceSaved(pendingAttendance);
    }
    showToast("💾 Davomat muvaffaqiyatli saqlandi!");
  };

  // Calculate per-session statistics
  const sessionStats = useMemo(() => {
    return sessions.map(sess => {
      const isFuture = sess.date > todayStr;
      const dayRec = pendingAttendance[sess.date] || {};
      const presentCount = players.filter(p => dayRec[p.id]?.present === true).length;
      const rate = players.length > 0 ? (presentCount / players.length) * 100 : 0;
      return {
        ...sess,
        isFuture,
        presentCount,
        rate: Math.round(rate * 10) / 10,
      };
    });
  }, [sessions, pendingAttendance, players, todayStr]);

  // Overall Month Average Attendance Rate (only considering sessions that have occurred)
  const overallMonthRate = useMemo(() => {
    if (elapsedSessions.length === 0 || players.length === 0) return null;
    let totalPresent = 0;
    let totalPossible = elapsedSessions.length * players.length;

    elapsedSessions.forEach(sess => {
      const dayRec = pendingAttendance[sess.date] || {};
      players.forEach(p => {
        if (dayRec[p.id]?.present === true) {
          totalPresent++;
        }
      });
    });

    const pct = (totalPresent / totalPossible) * 100;
    return Math.round(pct * 10) / 10;
  }, [elapsedSessions, pendingAttendance, players]);

  // Player month attendance stats & Activity Badge ('Aktiv', 'Passiv', 'Noaktiv')
  const getPlayerMonthStats = (playerId) => {
    if (elapsedSessions.length === 0) {
      return { attended: 0, rate: 0, badge: 'Kutilmoqda', badgeColor: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
    }

    let attended = 0;
    elapsedSessions.forEach(sess => {
      if (pendingAttendance[sess.date]?.[playerId]?.present === true) {
        attended++;
      }
    });

    const rate = Math.round((attended / elapsedSessions.length) * 100);
    let badge = 'Noaktiv';
    let badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';

    if (rate >= 75) {
      badge = 'Aktiv';
      badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    } else if (rate >= 40) {
      badge = 'Passiv';
      badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }

    return { attended, rate, badge, badgeColor };
  };

  return (
    <section id="attendance-section" className="rounded-2xl sm:rounded-3xl bg-[#0a0e1a] border border-white/10 p-4 sm:p-7 space-y-5 shadow-2xl">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 px-4 py-2.5 rounded-xl bg-black/90 border border-emerald-500/50 text-white font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Month Pills Tabs (Exact as reference image top row) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest">
            Davomat Matritsasi • 2026-2027
          </div>
          <div className="text-[11px] font-mono text-zinc-400">
            Faqat Seshanba va Payshanba
          </div>
        </div>

        {/* Scrollable Month Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          {months.map((m, idx) => {
            const isSelected = idx === selectedMonthIdx;
            return (
              <button
                key={m.monthKey}
                onClick={() => setSelectedMonthIdx(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-md shadow-cyan-500/20 scale-105'
                    : 'bg-black/50 text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20'
                }`}
              >
                {m.monthLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Controls: Left KPI Box & Right Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-1">
        
        {/* Left White KPI Card */}
        <div className="bg-white text-zinc-900 rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/20 min-w-[170px] sm:w-56 shrink-0 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-600 uppercase tracking-tight">O'rtacha faollik</div>
            <div className="text-[11px] text-zinc-600 font-semibold">(o'tgan o'yinlar)</div>
          </div>
          <div className={`text-3xl sm:text-4xl font-black my-2 font-mono tracking-tight ${
            overallMonthRate === null ? 'text-zinc-400' : overallMonthRate >= 75 ? 'text-emerald-600' : overallMonthRate >= 40 ? 'text-amber-500' : 'text-rose-500'
          }`}>
            {overallMonthRate === null ? '—' : `${overallMonthRate.toFixed(1)}%`}
          </div>
          <div className="text-xs font-bold text-zinc-600 font-mono">
            {elapsedSessions.length} / {sessions.length} ta o'yin o'tgan
          </div>
        </div>

        {/* Right Action & Filter Panel */}
        <div className="flex-1 flex flex-col justify-between gap-3 bg-[#0c101d] border border-white/10 p-4 rounded-2xl">
          
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Team Filter */}
            <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/10 text-xs font-bold">
              <button
                onClick={() => setTeamFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition ${teamFilter === 'ALL' ? 'bg-white text-black font-black' : 'text-zinc-400 hover:text-white'}`}
              >
                Barchasi ({players.length})
              </button>
              <button
                onClick={() => setTeamFilter('Real')}
                className={`px-3 py-1.5 rounded-lg transition ${teamFilter === 'Real' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'}`}
              >
                Real Madrid ({players.filter(p => p.team === 'Real').length})
              </button>
              <button
                onClick={() => setTeamFilter('Liverpool')}
                className={`px-3 py-1.5 rounded-lg transition ${teamFilter === 'Liverpool' ? 'bg-red-600 text-white font-black' : 'text-zinc-400 hover:text-white'}`}
              >
                Liverpool FC ({players.filter(p => p.team === 'Liverpool').length})
              </button>
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-black">✓</span>
                Keldi
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <span className="w-4 h-4 rounded-full bg-rose-500/20 border border-rose-500 text-rose-400 flex items-center justify-center text-[10px] font-black">✕</span>
                Kelmadi
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400 font-bold">
                <span className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[9px]">🔒</span>
                Kutilmoqda
              </span>
            </div>
          </div>

          {/* Action Buttons (Saqlash & Keldi Qilish) */}
          {isAdmin ? (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllMonthPresent}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold font-mono transition cursor-pointer"
                >
                  ✓ Barchasini keldi qilish
                </button>
                {hasUnsavedChanges && (
                  <button
                    onClick={handleRevert}
                    className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold font-mono transition cursor-pointer"
                  >
                    ↺ Bekor qilish
                  </button>
                )}
              </div>

              {/* Prominent Save Button ("va ohrida saqlash qilaman") */}
              <button
                onClick={handleSave}
                className={`px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  hasUnsavedChanges
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/40 scale-105 animate-pulse'
                    : 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/60'
                }`}
              >
                <span>💾 O'zgarishlarni Saqlash</span>
                {hasUnsavedChanges && (
                  <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                )}
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-white/[0.08] flex items-center justify-between">
              <span>Davomatni tahrirlash faqat admin uchun ochiq.</span>
              <a href="/login" className="text-amber-400 font-bold hover:underline">Admin Login →</a>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================
          THE MATRIX GRID (MATCHING media_1790956821082.png)
         ======================================================== */}
      <div className="rounded-2xl bg-[#0c101d] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[650px] relative scrollbar-thin scrollbar-thumb-white/20">
          <table className="w-full text-left border-collapse text-xs">
            
            {/* Header Row */}
            <thead className="bg-[#070a14] sticky top-0 z-30 border-b border-white/10 text-white">
              <tr>
                {/* Sticky Left Header: ISMLAR / GURUH % */}
                <th className="py-3.5 px-4 sticky left-0 z-40 bg-[#070a14] border-r border-white/10 min-w-[230px] sm:min-w-[270px]">
                  <div className="font-black text-sm uppercase tracking-wider text-white">
                    ISMLAR
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    GURUH % • {filteredPlayers.length} O'YINCHI
                  </div>
                </th>

                {/* Session Dates Columns */}
                {sessionStats.map((sess) => (
                  <th key={sess.date} className="py-3 px-3 text-center min-w-[70px] sm:min-w-[80px]">
                    <div className="font-mono font-bold text-zinc-300 text-xs">
                      {sess.shortDate}
                    </div>
                    {sess.isFuture ? (
                      <div className="font-mono text-[10px] font-bold text-zinc-500 mt-0.5 flex items-center justify-center gap-0.5" title="Kutilmoqda (sana hali kelmagan)">
                        <span className="text-[10px]">🔒</span>
                        <span>Kutilmoqda</span>
                      </div>
                    ) : (
                      <div className={`font-mono text-[11px] font-black mt-0.5 ${
                        sess.rate >= 75 ? 'text-emerald-400' : sess.rate >= 40 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {sess.rate.toFixed(1)}%
                      </div>
                    )}
                    <div className="text-[9px] font-mono text-zinc-500 uppercase">
                      {sess.dayName.slice(0, 3)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body Rows */}
            <tbody className="divide-y divide-white/[0.05]">
              {filteredPlayers.map((player) => {
                const isReal = player.team === 'Real';
                const { rate, badge, badgeColor } = getPlayerMonthStats(player.id);

                return (
                  <tr key={player.id} className="hover:bg-white/[0.02] transition">
                    
                    {/* Sticky Left Column: Player Info & Status Pill */}
                    <td className="py-3 px-4 sticky left-0 z-20 bg-[#0c101d] border-r border-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 truncate">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-white/15 shrink-0 shadow-sm">
                            <img
                              src={player.avatar || (isReal ? "/avatars/asliddin.jpg" : "/avatars/afzal_katta.png")}
                              alt={player.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/avatars/asliddin.jpg";
                              }}
                            />
                          </div>

                          {/* Player Name & Position */}
                          <div className="truncate">
                            <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                              <span>{player.name}</span>
                              {player.isCaptain && (
                                <span className="text-[9px] text-amber-400 font-bold">• 👑 Sardor</span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                isReal ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                {isReal ? 'Real' : 'Liverpool'}
                              </span>
                              <span>• #{player.number}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge ('Aktiv', 'Passiv', 'Noaktiv') */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono shrink-0 border ${badgeColor}`}>
                          {badge}
                        </span>
                      </div>
                    </td>

                    {/* Date Cells: Interactive Circles (Unlocked) or Locked Future Dates */}
                    {sessions.map((sess) => {
                      const isFuture = sess.date > todayStr;
                      const rec = pendingAttendance[sess.date]?.[player.id];
                      const isPresent = rec?.present === true;
                      const isAbsent = rec?.present === false;

                      if (isFuture) {
                        return (
                          <td key={sess.date} className="py-2.5 px-2 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => handleCellClick(sess.date, player.id)}
                              title={`${player.fullName || player.name} • ${sess.fullDisplay} • 🔒 Sana hali kelmagan`}
                              className="w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center bg-white/[0.01] border border-zinc-800/80 text-zinc-600 hover:border-amber-500/40 hover:text-amber-400 cursor-not-allowed transition select-none group"
                            >
                              <span className="text-[11px] opacity-40 group-hover:opacity-90 transition-opacity">🔒</span>
                            </button>
                          </td>
                        );
                      }

                      return (
                        <td key={sess.date} className="py-2.5 px-2 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleCellClick(sess.date, player.id)}
                            title={`${player.fullName || player.name} • ${sess.fullDisplay} • ${
                              isPresent ? 'Keldi' : isAbsent ? 'Kelmadi' : 'Kutilmoqda'
                            }`}
                            className={`w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer select-none ${
                              isPresent
                                ? 'bg-emerald-500 text-black font-black text-sm shadow-md shadow-emerald-500/30 scale-100 hover:scale-110 active:scale-95'
                                : isAbsent
                                ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-400 font-black text-sm hover:scale-110 active:scale-95'
                                : 'bg-white/[0.02] border-2 border-zinc-700/60 text-zinc-600 hover:border-zinc-400 hover:text-zinc-300 active:scale-95'
                            } ${!isAdmin ? 'cursor-default' : ''}`}
                          >
                            {isPresent ? (
                              <span>✓</span>
                            ) : isAbsent ? (
                              <span>✕</span>
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full border border-zinc-600/70" />
                            )}
                          </button>
                        </td>
                      );
                    })}

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 font-mono px-1">
        <div>
          💡 Katakcha ustiga bosib almashtiring: <strong>◯</strong> (kutilmoqda) → <strong className="text-emerald-400">✓</strong> (keldi) → <strong className="text-rose-400">✕</strong> (kelmadi).
        </div>
        <div className="font-bold text-zinc-400">
          O'zgarishlar faqat <strong>"💾 Saqlash"</strong> bosilganda saqlanadi.
        </div>
      </div>

    </section>
  );
}
