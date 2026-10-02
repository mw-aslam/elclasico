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

  // View mode: 'daily' (ultra-comfortable mobile touch list) or 'table' (full desktop matrix)
  const [viewMode, setViewMode] = useState('daily');

  // Local pending attendance state so user can freely edit and save at the end ("va ohrida saqlash qilaman")
  const [pendingAttendance, setPendingAttendance] = useState(attendance);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [teamFilter, setTeamFilter] = useState('ALL'); // 'ALL', 'Real', 'Liverpool'
  const [toastMsg, setToastMsg] = useState('');

  // Selected date for daily touch view
  const [selectedSessionDate, setSelectedSessionDate] = useState('');

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

  // Keep selectedSessionDate in sync with current month
  useEffect(() => {
    if (sessions.length > 0) {
      const exists = sessions.some(s => s.date === selectedSessionDate);
      if (!exists) {
        // Default to latest elapsed session if available, else first session
        const latestElapsed = [...sessions].filter(s => s.date <= todayStr).pop();
        setSelectedSessionDate(latestElapsed ? latestElapsed.date : sessions[0].date);
      }
    }
  }, [sessions, selectedMonthIdx, todayStr]);

  // Active session object
  const activeSession = useMemo(() => {
    return sessions.find(s => s.date === selectedSessionDate) || sessions[0] || null;
  }, [sessions, selectedSessionDate]);

  const isSelectedDateFuture = activeSession ? activeSession.date > todayStr : false;
  const isSelectedDateToday = activeSession ? activeSession.date === todayStr : false;

  // Filter players by team if requested
  const filteredPlayers = useMemo(() => {
    if (teamFilter === 'Real') return players.filter(p => p.team === 'Real');
    if (teamFilter === 'Liverpool') return players.filter(p => p.team === 'Liverpool');
    return players;
  }, [players, teamFilter]);

  // Matrix cell click: cycles null -> true (✓) -> false (✕) -> null (◯)
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

  // Dedicated button click for Daily Touch view:
  // targetStatus = true (Keldi) or false (Kelmadi)
  const handleSetPlayerStatus = (isoDate, playerId, targetStatus) => {
    if (!isAdmin) {
      showToast("🔒 Davomatni faqat admin tahrirlashi mumkin.");
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

      if (current?.present === targetStatus) {
        // Clicking same button again deselects it (back to pending)
        delete dayRec[playerId];
      } else {
        dayRec[playerId] = { present: targetStatus, playedForTeam: null };
      }

      next[isoDate] = dayRec;
      return next;
    });

    setHasUnsavedChanges(true);
  };

  // Batch actions for currently selected day in Daily View
  const handleMarkSelectedDayAll = (isoDate, status) => {
    if (!isAdmin) return;
    if (isoDate > todayStr) {
      showToast("🔒 Ushbu sana hali kelmagan!");
      return;
    }

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
    showToast(status ? "✓ Barchasi 'Keldi' deb belgilandi." : "✕ Barchasi 'Kelmadi' deb belgilandi.");
  };

  const handleClearSelectedDay = (isoDate) => {
    if (!isAdmin) return;
    setPendingAttendance(prev => {
      const next = { ...prev };
      const dayRec = { ...(next[isoDate] || {}) };
      filteredPlayers.forEach(p => {
        delete dayRec[p.id];
      });
      next[isoDate] = dayRec;
      return next;
    });
    setHasUnsavedChanges(true);
    showToast("◯ Ushbu kun ma'lumotlari tozalandi.");
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

  // Selected Day Stats for Daily View
  const selectedDayStats = useMemo(() => {
    if (!activeSession) return { presentCount: 0, absentCount: 0, rate: 0 };
    const dayRec = pendingAttendance[activeSession.date] || {};
    const presentCount = filteredPlayers.filter(p => dayRec[p.id]?.present === true).length;
    const absentCount = filteredPlayers.filter(p => dayRec[p.id]?.present === false).length;
    const rate = filteredPlayers.length > 0 ? Math.round((presentCount / filteredPlayers.length) * 100) : 0;
    return { presentCount, absentCount, rate };
  }, [activeSession, pendingAttendance, filteredPlayers]);

  return (
    <section id="attendance-section" className="rounded-2xl sm:rounded-3xl bg-[#0a0e1a] border border-white/10 p-3.5 sm:p-7 space-y-5 shadow-2xl relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 px-4 py-2.5 rounded-xl bg-black/95 border border-emerald-500/60 text-white font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Floating Bottom Bar for Mobile Quick Save */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 left-3 right-3 sm:hidden z-50 p-2.5 rounded-2xl bg-zinc-950/95 border-2 border-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.4)] backdrop-blur-lg flex items-center justify-between gap-3 animate-pulse">
          <div className="text-xs font-mono font-bold text-emerald-300 pl-2">
            O'zgarishlar kiritildi!
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-mono text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>💾 Saqlash</span>
          </button>
        </div>
      )}

      {/* Header & Mode Switcher: 📱 Kunlik Ro'yxat vs 📊 To'liq Jadval */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
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

        {/* View Switcher Segmented Control */}
        <div className="inline-flex items-center p-1 rounded-xl bg-black/60 border border-white/10 text-xs font-bold font-mono self-start sm:self-auto">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-emerald-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>📱</span>
            <span>Kunlik (Telefon uchun)</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-emerald-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>📊</span>
            <span>Katta Jadval</span>
          </button>
        </div>
      </div>

      {/* Month Pills Tabs */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
          Oyni tanlang:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {months.map((m, idx) => {
            const isSelected = idx === selectedMonthIdx;
            return (
              <button
                key={m.monthKey}
                onClick={() => setSelectedMonthIdx(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-mono whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-md shadow-cyan-500/20 scale-105'
                    : 'bg-black/50 text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20'
                }`}
              >
                {m.monthLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          VIEW MODE 1: DAILY TOUCH CARDS (MOBILE-OPTIMIZED)
         ======================================================== */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          
          {/* Session Dates Carousel */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              <span>O'yin Kunini Tanlang ({sessions.length} ta):</span>
              <span className="text-zinc-500">Gorizontal suring →</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {sessions.map((sess) => {
                const isSelected = sess.date === selectedSessionDate;
                const isFuture = sess.date > todayStr;
                const isToday = sess.date === todayStr;
                const dayRec = pendingAttendance[sess.date] || {};
                const presentCount = players.filter(p => dayRec[p.id]?.present === true).length;
                const hasMarks = Object.keys(dayRec).length > 0;

                return (
                  <button
                    key={sess.date}
                    onClick={() => setSelectedSessionDate(sess.date)}
                    className={`p-2.5 rounded-xl border text-left min-w-[105px] shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 scale-105 ring-1 ring-emerald-400'
                        : isFuture
                        ? 'bg-black/30 border-white/[0.06] text-zinc-500 hover:border-white/20'
                        : 'bg-black/50 border-white/10 text-zinc-300 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold">{sess.shortDate}</span>
                      {isFuture ? (
                        <span className="text-[10px]">🔒</span>
                      ) : isToday ? (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      ) : hasMarks ? (
                        <span className="text-[10px] text-emerald-400 font-black">✓</span>
                      ) : null}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                      {sess.dayName}
                    </div>
                    <div className="text-[9px] font-mono mt-1 font-bold">
                      {isFuture ? (
                        <span className="text-zinc-600">Kutilmoqda</span>
                      ) : (
                        <span className="text-emerald-400">{presentCount}/{players.length} keldi</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Session Control Panel */}
          {activeSession && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0c101d] border border-white/10 space-y-3.5 shadow-xl">
              
              {/* Session Header & KPI Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight">
                      {activeSession.fullDisplay}
                    </h3>
                    {isSelectedDateToday && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-mono font-bold animate-pulse">
                        BUGUN
                      </span>
                    )}
                    {isSelectedDateFuture && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-mono font-bold">
                        🔒 Kutilmoqda
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5">
                    {isSelectedDateFuture
                      ? "Ushbu sana hali kelmagan. O'yin kuni ochiladi."
                      : `${selectedDayStats.presentCount} / ${filteredPlayers.length} ta futbolchi keldi (${selectedDayStats.rate}%)`}
                  </div>
                </div>

                {/* Save Button for Desktop */}
                {isAdmin && (
                  <button
                    onClick={handleSave}
                    className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      hasUnsavedChanges
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/40 scale-105 animate-pulse'
                        : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/50'
                    }`}
                  >
                    <span>💾 Saqlash</span>
                    {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-black animate-ping" />}
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {!isSelectedDateFuture && (
                <div className="w-full bg-zinc-800/80 rounded-full h-2.5 overflow-hidden border border-white/5 flex">
                  <div
                    style={{ width: `${selectedDayStats.rate}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  />
                </div>
              )}

              {/* Quick Batch Controls for Active Day */}
              {isAdmin && !isSelectedDateFuture && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => handleMarkSelectedDayAll(activeSession.date, true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-black text-xs font-mono font-bold transition cursor-pointer"
                  >
                    ✓ Barchani Keldi qilish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkSelectedDayAll(activeSession.date, false)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white text-xs font-mono font-bold transition cursor-pointer"
                  >
                    ✕ Barchani Kelmadi qilish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearSelectedDay(activeSession.date)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-zinc-400 hover:text-white text-xs font-mono font-bold transition cursor-pointer"
                  >
                    ◯ Tozalash
                  </button>
                </div>
              )}

              {/* Team Filter Pills */}
              <div className="flex items-center gap-1.5 pt-2">
                <button
                  onClick={() => setTeamFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    teamFilter === 'ALL'
                      ? 'bg-white text-black font-black'
                      : 'bg-black/40 text-zinc-400 border border-white/10 hover:text-white'
                  }`}
                >
                  Barchasi ({players.length})
                </button>
                <button
                  onClick={() => setTeamFilter('Real')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    teamFilter === 'Real'
                      ? 'bg-amber-400 text-black font-black'
                      : 'bg-black/40 text-zinc-400 border border-white/10 hover:text-white'
                  }`}
                >
                  Real ({players.filter(p => p.team === 'Real').length})
                </button>
                <button
                  onClick={() => setTeamFilter('Liverpool')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    teamFilter === 'Liverpool'
                      ? 'bg-red-600 text-white font-black'
                      : 'bg-black/40 text-zinc-400 border border-white/10 hover:text-white'
                  }`}
                >
                  Liverpool ({players.filter(p => p.team === 'Liverpool').length})
                </button>
              </div>

            </div>
          )}

          {/* Player Cards (Touch-Optimized) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredPlayers.map((player) => {
              const isReal = player.team === 'Real';
              const rec = activeSession ? pendingAttendance[activeSession.date]?.[player.id] : null;
              const isPresent = rec?.present === true;
              const isAbsent = rec?.present === false;
              const { badge, badgeColor, rate: playerMonthRate } = getPlayerMonthStats(player.id);

              return (
                <div
                  key={player.id}
                  className={`p-3.5 rounded-2xl bg-[#0c101d] border transition-all flex items-center justify-between gap-3 shadow-md ${
                    isPresent
                      ? 'border-emerald-500/40 bg-emerald-950/15'
                      : isAbsent
                      ? 'border-rose-500/40 bg-rose-950/15'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Player Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-white/15 shrink-0 shadow">
                      <img
                        src={player.avatar || "/avatars/asliddin.jpg"}
                        alt={player.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/avatars/asliddin.jpg"; }}
                      />
                    </div>
                    <div className="truncate">
                      <div className="font-extrabold text-sm text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{player.name}</span>
                        {player.isCaptain && (
                          <span className="text-[10px] text-amber-400 font-bold shrink-0">• 👑</span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <span className={`px-1.5 py-0.2 rounded font-bold ${
                          isReal ? 'text-amber-400 bg-amber-400/10' : 'text-red-400 bg-red-600/10'
                        }`}>
                          {isReal ? 'RMA' : 'LIV'}
                        </span>
                        <span>#{player.number} • {player.position}</span>
                        <span className={`px-1.5 py-0.2 rounded font-bold border ${badgeColor}`}>
                          {badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thumb-friendly Big Touch Controls */}
                  {isSelectedDateFuture ? (
                    <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-zinc-800 text-zinc-600 font-mono text-[11px] font-bold shrink-0">
                      🔒 Kutilmoqda
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSetPlayerStatus(activeSession.date, player.id, true)}
                        className={`h-11 px-3.5 sm:px-4 rounded-xl font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                          isPresent
                            ? 'bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-300 scale-105'
                            : 'bg-zinc-800/90 border border-zinc-700/80 text-zinc-300 hover:text-emerald-300 hover:border-emerald-500/50'
                        } ${!isAdmin ? 'opacity-70 cursor-default' : ''}`}
                      >
                        <span className="text-sm font-black">✓</span>
                        <span>Keldi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetPlayerStatus(activeSession.date, player.id, false)}
                        className={`h-11 px-3.5 sm:px-4 rounded-xl font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                          isAbsent
                            ? 'bg-rose-500 text-white font-black shadow-lg shadow-rose-500/40 ring-2 ring-rose-300 scale-105'
                            : 'bg-zinc-800/90 border border-zinc-700/80 text-zinc-300 hover:text-rose-300 hover:border-rose-500/50'
                        } ${!isAdmin ? 'opacity-70 cursor-default' : ''}`}
                      >
                        <span className="text-sm font-black">✕</span>
                        <span>Kelmadi</span>
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================
          VIEW MODE 2: FULL MATRIX TABLE (DESKTOP / LAPTOPS)
         ======================================================== */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          
          {/* Top KPI & Controls Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* KPI Card */}
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

            {/* Actions Panel */}
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
                    Real ({players.filter(p => p.team === 'Real').length})
                  </button>
                  <button
                    onClick={() => setTeamFilter('Liverpool')}
                    className={`px-3 py-1.5 rounded-lg transition ${teamFilter === 'Liverpool' ? 'bg-red-600 text-white font-black' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Liverpool ({players.filter(p => p.team === 'Liverpool').length})
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

              {/* Action Buttons */}
              {isAdmin && (
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

                  <button
                    onClick={handleSave}
                    className={`px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                      hasUnsavedChanges
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/40 scale-105 animate-pulse'
                        : 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/60'
                    }`}
                  >
                    <span>💾 O'zgarishlarni Saqlash</span>
                    {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-black animate-ping" />}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Matrix Grid Table */}
          <div className="rounded-2xl bg-[#0c101d] border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto max-h-[650px] relative scrollbar-thin scrollbar-thumb-white/20">
              <table className="w-full text-left border-collapse text-xs">
                
                {/* Header Row */}
                <thead className="bg-[#070a14] sticky top-0 z-30 border-b border-white/10 text-white">
                  <tr>
                    <th className="py-3.5 px-3 sm:px-4 sticky left-0 z-40 bg-[#070a14] border-r border-white/10 min-w-[160px] sm:min-w-[250px]">
                      <div className="font-black text-xs sm:text-sm uppercase tracking-wider text-white">
                        ISMLAR
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        GURUH % • {filteredPlayers.length} O'YINCHI
                      </div>
                    </th>

                    {sessionStats.map((sess) => (
                      <th key={sess.date} className="py-3 px-2 sm:px-3 text-center min-w-[65px] sm:min-w-[80px]">
                        <div className="font-mono font-bold text-zinc-300 text-xs">
                          {sess.shortDate}
                        </div>
                        {sess.isFuture ? (
                          <div className="font-mono text-[9px] font-bold text-zinc-500 mt-0.5 flex items-center justify-center gap-0.5">
                            <span className="text-[9px]">🔒</span>
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
                    const { badge, badgeColor } = getPlayerMonthStats(player.id);

                    return (
                      <tr key={player.id} className="hover:bg-white/[0.02] transition">
                        
                        {/* Sticky Left Column: Player Info */}
                        <td className="py-3 px-3 sm:px-4 sticky left-0 z-20 bg-[#0c101d] border-r border-white/10">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-white/15 shrink-0 shadow-sm">
                                <img
                                  src={player.avatar || "/avatars/asliddin.jpg"}
                                  alt={player.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.src = "/avatars/asliddin.jpg"; }}
                                />
                              </div>

                              <div className="truncate">
                                <div className="font-bold text-white text-xs truncate flex items-center gap-1">
                                  <span>{player.name}</span>
                                  {player.isCaptain && <span className="text-[9px] text-amber-400 font-bold">• 👑</span>}
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                                  <span className={`px-1 rounded text-[9px] font-bold ${
                                    isReal ? 'text-amber-400' : 'text-red-400'
                                  }`}>
                                    {isReal ? 'RMA' : 'LIV'}
                                  </span>
                                  <span>• #{player.number}</span>
                                </div>
                              </div>
                            </div>

                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono shrink-0 border ${badgeColor}`}>
                              {badge}
                            </span>
                          </div>
                        </td>

                        {/* Date Cells */}
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
                                  className="w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center bg-white/[0.01] border border-zinc-800/80 text-zinc-600 cursor-not-allowed select-none"
                                >
                                  <span className="text-[11px] opacity-40">🔒</span>
                                </button>
                              </td>
                            );
                          }

                          return (
                            <td key={sess.date} className="py-2.5 px-2 text-center align-middle">
                              <button
                                type="button"
                                onClick={() => handleCellClick(sess.date, player.id)}
                                className={`w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                                  isPresent
                                    ? 'bg-emerald-500 text-black font-black text-sm shadow-md shadow-emerald-500/30 scale-100 hover:scale-110'
                                    : isAbsent
                                    ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-400 font-black text-sm hover:scale-110'
                                    : 'bg-white/[0.02] border-2 border-zinc-700/60 text-zinc-600 hover:border-zinc-400'
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

        </div>
      )}

      {/* Helpful Hint */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 font-mono px-1">
        <div>
          💡 O'zgarishlar kiritilgach, <strong>"💾 Saqlash"</strong> tugmasini bosishni unutmang.
        </div>
        <div className="font-bold text-emerald-400/80">
          Rejim: {viewMode === 'daily' ? "📱 Kunlik Tezkor Ro'yxat" : "📊 To'liq Matritsa"}
        </div>
      </div>

    </section>
  );
}
