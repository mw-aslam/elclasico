'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { generateScheduleMonths, saveStoredAttendance } from '../lib/data';

export default function AttendanceSection({
  attendance = {},
  players = [],
  isAdmin = false,
  onAttendanceSaved = null,
}) {
  const months = useMemo(() => generateScheduleMonths(), []);
  
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0);
  const activeMonth = months[selectedMonthIdx] || months[0];

  const [pendingAttendance, setPendingAttendance] = useState(attendance);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState('');

  // Track if user is editing to prevent external attendance prop overwriting edits
  const isEditingRef = useRef(false);

  // Sync with incoming prop ONLY if no pending unsaved edits
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

  const elapsedSessions = useMemo(() => {
    return sessions.filter(s => s.date <= todayStr);
  }, [sessions, todayStr]);

  const filteredPlayers = useMemo(() => {
    if (teamFilter === 'Real') return players.filter(p => p.team === 'Real');
    if (teamFilter === 'Liverpool') return players.filter(p => p.team === 'Liverpool');
    return players;
  }, [players, teamFilter]);

  // Click cell: cycles null → true → false → null
  const handleCellClick = (isoDate, playerId) => {
    if (!isAdmin) {
      showToast("🔒 Davomatni faqat admin tahrirlashi mumkin.");
      return;
    }
    if (isoDate > todayStr) {
      showToast("🔒 Ushbu sana hali kelmagan!");
      return;
    }

    isEditingRef.current = true;
    setPendingAttendance(prev => {
      const next = { ...prev };
      const dayRec = { ...(next[isoDate] || {}) };
      const current = dayRec[playerId];
      if (!current || current.present === undefined) {
        dayRec[playerId] = { present: true, playedForTeam: null };
      } else if (current.present === true) {
        dayRec[playerId] = { present: false, playedForTeam: null };
      } else {
        delete dayRec[playerId];
      }
      next[isoDate] = dayRec;
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleMarkAllDay = (isoDate, status) => {
    if (!isAdmin || isoDate > todayStr) return;
    setPendingAttendance(prev => {
      const next = { ...prev };
      const dayRec = { ...(next[isoDate] || {}) };
      filteredPlayers.forEach(p => {
        dayRec[p.id] = { present: status, playedForTeam: null };
      });
      next[isoDate] = dayRec;
      return next;
    });
    setHasUnsavedChanges(true);
    showToast(status ? "✓ Barchasi Keldi deb belgilandi" : "✕ Barchasi Kelmadi deb belgilandi");
  };

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
    showToast("✓ O'tgan barcha o'yin kunlari belgilandi. Saqlashni unutmang!");
  };

  const handleRevert = () => {
    setPendingAttendance(attendance);
    setHasUnsavedChanges(false);
    isEditingRef.current = false;
    showToast("O'zgarishlar bekor qilindi.");
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      saveStoredAttendance(pendingAttendance);
      setHasUnsavedChanges(false);
      isEditingRef.current = false;
      if (onAttendanceSaved) {
        onAttendanceSaved(pendingAttendance);
      }
      showToast("💾 Davomat muvaffaqiyatli saqlandi!");
    } finally {
      setIsSaving(false);
    }
  };

  // Per-session stats
  const sessionStats = useMemo(() => {
    return sessions.map(sess => {
      const isFuture = sess.date > todayStr;
      const dayRec = pendingAttendance[sess.date] || {};
      const presentCount = players.filter(p => dayRec[p.id]?.present === true).length;
      const rate = players.length > 0 ? (presentCount / players.length) * 100 : 0;
      return { ...sess, isFuture, presentCount, rate: Math.round(rate * 10) / 10 };
    });
  }, [sessions, pendingAttendance, players, todayStr]);

  const overallMonthRate = useMemo(() => {
    if (elapsedSessions.length === 0 || players.length === 0) return null;
    let totalPresent = 0;
    elapsedSessions.forEach(sess => {
      const dayRec = pendingAttendance[sess.date] || {};
      players.forEach(p => {
        if (dayRec[p.id]?.present === true) totalPresent++;
      });
    });
    return Math.round((totalPresent / (elapsedSessions.length * players.length)) * 1000) / 10;
  }, [elapsedSessions, pendingAttendance, players]);

  const getPlayerMonthStats = (playerId) => {
    if (elapsedSessions.length === 0) {
      return { attended: 0, rate: 0, badge: '—', badgeColor: 'bg-zinc-700/30 text-zinc-500 border-zinc-600/30' };
    }
    let attended = 0;
    elapsedSessions.forEach(sess => {
      if (pendingAttendance[sess.date]?.[playerId]?.present === true) attended++;
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
    <section id="attendance-section" className="rounded-2xl bg-[#0a0e1a] border border-white/10 p-3.5 sm:p-6 space-y-4 shadow-2xl relative">

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-xl bg-black/95 border border-emerald-500/60 text-white font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mobile floating save bar — only when unsaved changes */}
      {hasUnsavedChanges && isAdmin && (
        <div className="fixed bottom-4 left-3 right-3 sm:hidden z-50 p-2.5 rounded-2xl bg-zinc-950/98 border-2 border-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.4)] backdrop-blur-lg flex items-center justify-between gap-3">
          <div className="text-xs font-mono font-bold text-emerald-300 pl-2">
            Saqlanmagan o'zgarishlar!
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-mono text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-60"
          >
            {isSaving ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest">
            Davomat Nazorati • 2026-2027
          </div>
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-1">
            Mavsumiy Davomat
          </h2>
          <div className="text-[11px] font-mono text-zinc-400">
            Faqat Seshanba va Payshanba kunlari
          </div>
        </div>

        {/* Overall month stat */}
        {overallMonthRate !== null && (
          <div className="shrink-0 text-right">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Oylik o'rtacha</div>
            <div className={`text-3xl font-black font-mono tracking-tight ${
              overallMonthRate >= 75 ? 'text-emerald-400' : overallMonthRate >= 40 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {overallMonthRate.toFixed(1)}%
            </div>
            <div className="text-[10px] font-mono text-zinc-500">{elapsedSessions.length}/{sessions.length} ta o'yin</div>
          </div>
        )}
      </div>

      {/* Month tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {months.map((m, idx) => (
          <button
            key={m.monthKey}
            onClick={() => setSelectedMonthIdx(idx)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-mono whitespace-nowrap transition cursor-pointer shrink-0 ${
              idx === selectedMonthIdx
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-md shadow-cyan-500/20'
                : 'bg-black/50 text-zinc-400 border border-white/[0.08] hover:text-white hover:border-white/20'
            }`}
          >
            {m.monthLabel}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Team filter */}
        <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/10 text-xs font-bold font-mono">
          {[
            { key: 'ALL', label: `Barchasi (${players.length})`, active: 'bg-white text-black' },
            { key: 'Real', label: `RMA (${players.filter(p => p.team === 'Real').length})`, active: 'bg-amber-400 text-black' },
            { key: 'Liverpool', label: `LIV (${players.filter(p => p.team === 'Liverpool').length})`, active: 'bg-red-600 text-white' },
          ].map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => setTeamFilter(key)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                teamFilter === key ? active + ' font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Admin action buttons */}
        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleMarkAllMonthPresent}
              className="px-3 py-1.5 rounded-xl bg-white/8 border border-white/15 text-white text-xs font-bold font-mono transition cursor-pointer hover:bg-white/15 active:scale-95"
            >
              ✓ Barchasini keldi
            </button>
            {hasUnsavedChanges && (
              <button
                onClick={handleRevert}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold font-mono transition cursor-pointer hover:bg-red-500/20 active:scale-95"
              >
                ↺ Bekor
              </button>
            )}
            {/* Desktop save button — NO animate-pulse to prevent flickering */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`hidden sm:flex items-center gap-2 px-5 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-60 ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/30'
                  : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/50'
              }`}
            >
              {isSaving ? '⏳' : '💾'} {isSaving ? 'Saqlanmoqda...' : hasUnsavedChanges ? 'Saqlash *' : 'Saqlash'}
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-black">✓</span>
          Keldi
        </span>
        <span className="flex items-center gap-1.5 text-rose-400 font-bold">
          <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500 text-rose-400 flex items-center justify-center text-[10px] font-black">✕</span>
          Kelmadi
        </span>
        <span className="flex items-center gap-1.5 text-zinc-500 font-bold">
          <span className="w-5 h-5 rounded-full border-2 border-zinc-600 flex items-center justify-center text-[9px]">◯</span>
          Belgilanmagan
        </span>
      </div>

      {/* SINGLE UNIVERSAL ATTENDANCE TABLE — works on all devices */}
      <div className="rounded-xl bg-[#0c101d] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
          <table className="text-left border-collapse text-xs w-full" style={{ minWidth: `${Math.max(360, 180 + sessions.length * 52)}px` }}>

            {/* Sticky header */}
            <thead className="bg-[#070a14] sticky top-0 z-30 border-b border-white/10">
              <tr>
                {/* Name column */}
                <th className="py-3 px-3 sticky left-0 z-40 bg-[#070a14] border-r border-white/10" style={{ minWidth: '150px' }}>
                  <div className="font-black text-[11px] uppercase tracking-wider text-white">O'yinchi</div>
                  <div className="text-[9px] font-mono text-zinc-500">{filteredPlayers.length} ta</div>
                </th>

                {/* % column */}
                <th className="py-3 px-2 text-center sticky left-[150px] z-40 bg-[#070a14] border-r border-white/[0.08]" style={{ minWidth: '42px' }}>
                  <div className="font-black text-[10px] text-zinc-400">%</div>
                </th>

                {/* Date columns */}
                {sessionStats.map(sess => (
                  <th key={sess.date} className="py-2.5 px-1 text-center" style={{ minWidth: '48px' }}>
                    <div className="font-mono font-bold text-[11px] text-zinc-300">{sess.shortDate}</div>
                    <div className="text-[9px] font-mono text-zinc-500">{sess.dayName?.slice(0, 2)}</div>
                    {sess.isFuture ? (
                      <div className="text-[9px] text-zinc-600">🔒</div>
                    ) : (
                      <div className={`font-mono text-[10px] font-black mt-0.5 ${
                        sess.rate >= 75 ? 'text-emerald-400' : sess.rate >= 40 ? 'text-amber-400' : sess.presentCount === 0 ? 'text-zinc-600' : 'text-rose-400'
                      }`}>
                        {sess.presentCount}/{players.length}
                      </div>
                    )}
                  </th>
                ))}

                {/* Quick mark header — only if admin */}
                {isAdmin && sessions.length > 0 && (
                  <th className="py-2 px-2 text-center" style={{ minWidth: '80px' }}>
                    <div className="text-[9px] font-mono text-zinc-600">Tezkor</div>
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {filteredPlayers.map(player => {
                const isReal = player.team === 'Real';
                const { attended, rate, badge, badgeColor } = getPlayerMonthStats(player.id);

                return (
                  <tr key={player.id} className="hover:bg-white/[0.02] transition group">

                    {/* Sticky player name */}
                    <td className="py-2.5 px-3 sticky left-0 z-20 bg-[#0c101d] border-r border-white/10 group-hover:bg-[#0e1220]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
                          <img
                            src={player.avatar || '/avatars/asliddin.jpg'}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.src = '/avatars/asliddin.jpg'; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-[11px] truncate flex items-center gap-1">
                            <span className="truncate">{player.name}</span>
                            {player.isCaptain && <span className="text-[9px] text-amber-400 shrink-0">👑</span>}
                          </div>
                          <div className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                            <span className={isReal ? 'text-amber-400' : 'text-red-400'}>
                              {isReal ? 'RMA' : 'LIV'}
                            </span>
                            <span>#{player.number}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* % sticky col */}
                    <td className="py-2.5 px-1.5 text-center sticky z-20 bg-[#0c101d] border-r border-white/[0.05] group-hover:bg-[#0e1220]" style={{ left: '150px' }}>
                      <div className={`text-[11px] font-black font-mono ${
                        rate >= 75 ? 'text-emerald-400' : rate >= 40 ? 'text-amber-400' : elapsedSessions.length === 0 ? 'text-zinc-600' : 'text-rose-400'
                      }`}>
                        {elapsedSessions.length === 0 ? '—' : `${rate}%`}
                      </div>
                      <div className={`text-[8px] font-bold font-mono px-1 py-0.5 rounded border ${badgeColor} mt-0.5 whitespace-nowrap`}>
                        {badge}
                      </div>
                    </td>

                    {/* Date cells */}
                    {sessions.map(sess => {
                      const isFuture = sess.date > todayStr;
                      const rec = pendingAttendance[sess.date]?.[player.id];
                      const isPresent = rec?.present === true;
                      const isAbsent = rec?.present === false;

                      return (
                        <td key={sess.date} className="py-2 px-1 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleCellClick(sess.date, player.id)}
                            disabled={isFuture || !isAdmin}
                            className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center transition-all select-none font-black text-sm ${
                              isFuture
                                ? 'bg-transparent text-zinc-700 cursor-default'
                                : isPresent
                                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30 cursor-pointer active:scale-90 hover:scale-105'
                                : isAbsent
                                ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-400 cursor-pointer active:scale-90 hover:scale-105'
                                : isAdmin
                                ? 'bg-white/[0.02] border-2 border-zinc-700/60 text-zinc-600 hover:border-zinc-400 cursor-pointer'
                                : 'bg-transparent border border-zinc-800 text-zinc-700 cursor-default'
                            }`}
                          >
                            {isFuture ? (
                              <span className="text-[10px] opacity-40">🔒</span>
                            ) : isPresent ? (
                              <span>✓</span>
                            ) : isAbsent ? (
                              <span>✕</span>
                            ) : (
                              <span className="w-2 h-2 rounded-full border border-zinc-600/70 block mx-auto" />
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Quick mark column — only admin */}
                    {isAdmin && sessions.length > 0 && (
                      <td className="py-2 px-2 text-center">
                        {/* No per-player quick mark needed; handled via batch buttons */}
                      </td>
                    )}

                  </tr>
                );
              })}
            </tbody>

            {/* Footer: quick mark per session */}
            {isAdmin && (
              <tfoot className="bg-[#070a14] sticky bottom-0 z-30 border-t border-white/10">
                <tr>
                  <td className="py-2 px-3 sticky left-0 z-40 bg-[#070a14] text-[10px] font-mono font-bold text-zinc-400">
                    Tezkor belgilash:
                  </td>
                  <td className="sticky z-40 bg-[#070a14]" style={{ left: '150px' }}></td>
                  {sessionStats.map(sess => (
                    <td key={sess.date} className="py-2 px-1 text-center">
                      {!sess.isFuture && (
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            title="Barchasini Keldi"
                            onClick={() => handleMarkAllDay(sess.date, true)}
                            className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] hover:bg-emerald-500 hover:text-black cursor-pointer active:scale-90 transition font-black flex items-center justify-center"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            title="Barchasini Kelmadi"
                            onClick={() => handleMarkAllDay(sess.date, false)}
                            className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] hover:bg-rose-500 hover:text-white cursor-pointer active:scale-90 transition font-black flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </td>
                  ))}
                  {sessions.length > 0 && <td></td>}
                </tr>
              </tfoot>
            )}

          </table>
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500 font-mono">
        <div>💡 O'zgarishlar kiritilgach <strong className="text-emerald-400">💾 Saqlash</strong> ni bosing</div>
        <div className="text-zinc-600">←→ Suring</div>
      </div>

    </section>
  );
}
