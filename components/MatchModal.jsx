'use client';

import { useState, useMemo } from 'react';
import ConfirmModal from './ConfirmModal';
import { computeMatchStats, computePlayerMatchRating } from '../lib/data';

export default function MatchModal({ match, onClose, onDeleteMatch, isAdmin = false, allPlayers = [] }) {
  const [activeTab, setActiveTab] = useState('stats'); // 'lineups', 'stats', 'ratings'
  const [periodFilter, setPeriodFilter] = useState('ALL'); // 'ALL', '1ST', '2ND'
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!match) return null;

  const stats = useMemo(() => {
    return computeMatchStats(match);
  }, [match]);

  // Compute player ratings for this match
  const playerRatings = useMemo(() => {
    if (!match.details || match.details.length === 0) return [];
    const evaluated = match.details.map(item => {
      const matchRating = computePlayerMatchRating(item);
      return {
        ...item,
        matchRating,
      };
    });

    // Determine MOTM (highest match rating)
    let bestRating = -1;
    let motmId = null;
    evaluated.forEach(p => {
      if (p.matchRating > bestRating && (p.goalsInMatch > 0 || p.assistsInMatch > 0 || p.savesInMatch > 0)) {
        bestRating = p.matchRating;
        motmId = p.playerId;
      }
    });

    return evaluated.map(p => ({
      ...p,
      isMotm: p.playerId === motmId,
    }));
  }, [match]);

  const handleConfirmDelete = () => {
    if (!isAdmin) return;
    setIsConfirmOpen(false);
    if (onDeleteMatch) onDeleteMatch(match.id);
    onClose();
  };

  const isRealHome = match.homeTeam?.includes('Real');
  const homeColor = isRealHome ? '#f5c542' : '#dc2626';
  const awayColor = isRealHome ? '#dc2626' : '#f5c542';

  // Stats rows to render (Sofascore style)
  const statRows = [
    {
      label: 'Topga egalik qilish',
      home: `${stats.possession[0]}%`,
      away: `${stats.possession[1]}%`,
      homeVal: stats.possession[0],
      awayVal: stats.possession[1],
      isPct: true,
    },
    {
      label: "Bosib o'tilgan masofa",
      home: stats.distance[0],
      away: stats.distance[1],
      homeVal: parseFloat(stats.distance[0]) || 116,
      awayVal: parseFloat(stats.distance[1]) || 114,
    },
    {
      label: 'Kutilgan gollar (xG)',
      home: stats.xg[0],
      away: stats.xg[1],
      homeVal: parseFloat(stats.xg[0]) || 0,
      awayVal: parseFloat(stats.xg[1]) || 0,
    },
    {
      label: 'Katta imkoniyatlar',
      home: stats.bigChances[0],
      away: stats.bigChances[1],
      homeVal: stats.bigChances[0],
      awayVal: stats.bigChances[1],
    },
    {
      label: 'Umumiy zarbalar',
      home: stats.totalShots[0],
      away: stats.totalShots[1],
      homeVal: stats.totalShots[0],
      awayVal: stats.totalShots[1],
    },
    {
      label: 'Aniq zarbalar',
      home: stats.shotsOnTarget[0],
      away: stats.shotsOnTarget[1],
      homeVal: stats.shotsOnTarget[0],
      awayVal: stats.shotsOnTarget[1],
    },
    {
      label: 'Darvozabon seyvlari',
      home: stats.saves[0],
      away: stats.saves[1],
      homeVal: stats.saves[0],
      awayVal: stats.saves[1],
    },
    {
      label: 'Sprintlar soni',
      home: stats.sprints[0],
      away: stats.sprints[1],
      homeVal: stats.sprints[0],
      awayVal: stats.sprints[1],
    },
    {
      label: "Burchak to'plari",
      home: stats.corners[0],
      away: stats.corners[1],
      homeVal: stats.corners[0],
      awayVal: stats.corners[1],
    },
    {
      label: "Qo'pol ishlashlar",
      home: stats.fouls[0],
      away: stats.fouls[1],
      homeVal: stats.fouls[0],
      awayVal: stats.fouls[1],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0c101d] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">

        {/* Top Header & Scoreboard (Sofascore style) */}
        <div className="bg-gradient-to-b from-[#14192d] to-[#0c101d] p-4 sm:p-5 border-b border-white/10 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition text-sm cursor-pointer"
          >
            ✕
          </button>

          <div className="text-center text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
            {new Date(match.date).toLocaleDateString('uz-UZ', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>

          <div className="flex items-center justify-between gap-3 px-2">
            {/* Home Team */}
            <div className="flex-1 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center font-black text-base sm:text-lg text-amber-400 shadow-md">
                {isRealHome ? 'RMA' : 'LIV'}
              </div>
              <div className="mt-1.5 font-black text-xs sm:text-sm text-white uppercase truncate">
                {match.homeTeam}
              </div>
            </div>

            {/* Score */}
            <div className="text-center px-3">
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-2">
                <span>{match.homeScore}</span>
                <span className="text-zinc-600">-</span>
                <span>{match.awayScore}</span>
              </div>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                Tugallandi
              </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center font-black text-base sm:text-lg text-red-500 shadow-md">
                {isRealHome ? 'LIV' : 'RMA'}
              </div>
              <div className="mt-1.5 font-black text-xs sm:text-sm text-white uppercase truncate">
                {match.awayTeam}
              </div>
            </div>
          </div>

          {/* 3 Main Tabs: Tarkiblar | Statistika | Reytinglar */}
          <div className="flex items-center justify-center gap-1 mt-4 border-t border-white/[0.08] pt-3">
            {[
              { key: 'stats', label: '📊 Statistika' },
              { key: 'ratings', label: '⭐ Reytinglar' },
              { key: 'lineups', label: '🏟 Tarkiblar' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold font-mono transition text-center cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-white text-black shadow-lg font-black'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">

          {/* ========================================================
              TAB 1: STATISTIKA (Sofascore Head-to-Head Comparison)
             ======================================================== */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              
              {/* Period Filter (BARCHA / 1CHI / 2CHI) */}
              <div className="flex items-center justify-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10 max-w-xs mx-auto">
                {[
                  { key: 'ALL', label: 'BARCHA' },
                  { key: '1ST', label: '1-BO\'LIM' },
                  { key: '2ND', label: '2-BO\'LIM' },
                ].map(p => (
                  <button
                    key={p.key}
                    onClick={() => setPeriodFilter(p.key)}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                      periodFilter === p.key
                        ? 'bg-zinc-200 text-black font-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Comparison Bars (Sofascore Style) */}
              <div className="space-y-3 pt-1">
                {statRows.map((row, idx) => {
                  const total = (Number(row.homeVal) || 0) + (Number(row.awayVal) || 0);
                  const homePercent = total > 0 ? Math.round((Number(row.homeVal) / total) * 100) : 50;
                  const awayPercent = 100 - homePercent;

                  return (
                    <div key={idx} className="space-y-1">
                      {/* Metric Numbers and Label */}
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className={`min-w-[45px] text-left ${isRealHome ? 'text-amber-300' : 'text-red-400'}`}>
                          {row.home}
                        </span>
                        <span className="text-[11px] text-zinc-300 font-semibold uppercase tracking-wider text-center flex-1 px-2 truncate">
                          {row.label}
                        </span>
                        <span className={`min-w-[45px] text-right ${isRealHome ? 'text-red-400' : 'text-amber-300'}`}>
                          {row.away}
                        </span>
                      </div>

                      {/* Dual Progress Bar */}
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-white/5">
                        <div
                          style={{ width: `${homePercent}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            isRealHome ? 'bg-gradient-to-r from-amber-500 to-amber-300' : 'bg-gradient-to-r from-red-600 to-red-400'
                          }`}
                        />
                        <div
                          style={{ width: `${awayPercent}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            isRealHome ? 'bg-gradient-to-l from-red-600 to-red-400' : 'bg-gradient-to-l from-amber-500 to-amber-300'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 2: REYTINGLAR (Sofascore Match Ratings)
             ======================================================== */}
          {activeTab === 'ratings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-white/10 pb-2">
                <span>Futbolchi</span>
                <span>Ko'rsatkichlar & Reyting</span>
              </div>

              {playerRatings.length > 0 ? (
                <div className="space-y-2">
                  {playerRatings.map((item, idx) => {
                    const isReal = item.team === 'Real';
                    const rating = item.matchRating || 6.5;
                    const ratingColor =
                      rating >= 8.5
                        ? 'bg-emerald-500 text-black'
                        : rating >= 7.5
                        ? 'bg-emerald-600 text-white'
                        : rating >= 6.5
                        ? 'bg-amber-500 text-black'
                        : 'bg-rose-500 text-white';

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                          item.isMotm
                            ? 'bg-amber-500/10 border-amber-400/40 ring-1 ring-amber-400/30'
                            : 'bg-black/30 border-white/5 hover:border-white/15'
                        }`}
                      >
                        {/* Player Info */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isReal ? 'bg-amber-400/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {isReal ? 'RMA' : 'LIV'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                              <span className="truncate">{item.name}</span>
                              {item.isMotm && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black uppercase shrink-0">
                                  👑 MOTM
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                              {item.goalsInMatch > 0 && <span className="text-emerald-400 font-bold">⚽️ {item.goalsInMatch} gol</span>}
                              {item.assistsInMatch > 0 && <span className="text-amber-300 font-bold">🎯 {item.assistsInMatch} asist</span>}
                              {item.savesInMatch > 0 && <span className="text-cyan-300 font-bold">🧤 {item.savesInMatch} seyv</span>}
                              {item.concededInMatch > 0 && <span className="text-rose-400 font-bold">({item.concededInMatch})</span>}
                            </div>
                          </div>
                        </div>

                        {/* Sofascore Rating Badge */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          <div className={`w-10 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center shadow-md ${ratingColor}`}>
                            {rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-zinc-500 font-mono">
                  Ushbu o'yin uchun o'yinchilar individual ko'rsatkichlari saqlanmagan.
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 3: TARKIBLAR (Lineups)
             ======================================================== */}
          {activeTab === 'lineups' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Home Squad */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="font-black text-xs uppercase text-amber-300 pb-1 border-b border-white/10 flex items-center justify-between">
                    <span>{match.homeTeam}</span>
                    <span className="text-[10px] font-mono font-normal text-zinc-400">Tarkib</span>
                  </div>
                  <div className="space-y-1.5">
                    {playerRatings.filter(p => p.team === match.homeTeam || p.team === 'Real').map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-mono py-1 border-b border-white/[0.04]">
                        <span className="text-white font-semibold truncate">{p.name}</span>
                        <span className="text-zinc-400 text-[10px]">
                          {p.isGk ? 'GK' : 'Asosiy'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Away Squad */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="font-black text-xs uppercase text-red-400 pb-1 border-b border-white/10 flex items-center justify-between">
                    <span>{match.awayTeam}</span>
                    <span className="text-[10px] font-mono font-normal text-zinc-400">Tarkib</span>
                  </div>
                  <div className="space-y-1.5">
                    {playerRatings.filter(p => p.team === match.awayTeam || p.team === 'Liverpool').map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-mono py-1 border-b border-white/[0.04]">
                        <span className="text-white font-semibold truncate">{p.name}</span>
                        <span className="text-zinc-400 text-[10px]">
                          {p.isGk ? 'GK' : 'Asosiy'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-[#0a0e1a] border-t border-white/10 flex items-center justify-between shrink-0">
          {isAdmin && onDeleteMatch && (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white text-xs font-bold transition cursor-pointer"
            >
              🗑️ O'chirish
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs font-mono ml-auto transition cursor-pointer"
          >
            Yopish
          </button>
        </div>

        <ConfirmModal
          isOpen={isConfirmOpen}
          title="O'yinni O'chirish"
          message="Haqiqatan ham ushbu o'yinni tarixdan o'chirib tashlamoqchimisiz?"
          confirmText="Ha, o'chirish"
          cancelText="Yo'q"
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </div>
  );
}
