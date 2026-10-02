'use client';

import { calculateTeamsRanking } from '../lib/data';

export default function TeamLeaderboard({ players = [], matches = [], attendance = {} }) {
  const rankedTeams = calculateTeamsRanking(players, matches, attendance);
  const leader = rankedTeams[0];
  const runnerUp = rankedTeams[1];

  const ratingDiff = Math.abs(leader.rating - runnerUp.rating).toFixed(1);

  return (
    <section className="rounded-2xl sm:rounded-3xl bg-[#0c101d] border border-white/10 p-5 sm:p-7 space-y-6 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5">
            Rasmiy Jamoalar Musobaqasi
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            Jamoa Reytingi: Real Madrid vs Liverpool FC
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gollar, assistlar, seyvlar, o'tkazilgan to'plar va davomat ishtiroki asosida hisoblangan umumiy jamoa balansi
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-zinc-300 font-bold shrink-0 self-start sm:self-auto">
          Farq: <span className="text-amber-400 font-black">+{ratingDiff} ball</span>
        </div>
      </div>

      {/* 2 Team Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {rankedTeams.map((team, idx) => {
          const isFirst = team.rank === 1;
          const isReal = team.id === 'Real';

          return (
            <div
              key={team.id}
              className={`relative rounded-2xl p-5 sm:p-6 border overflow-hidden shadow-2xl transition duration-300 ${
                isFirst
                  ? isReal
                    ? 'bg-gradient-to-br from-[#241a05] via-[#101424] to-[#070912] border-amber-400/70 shadow-[0_10px_35px_rgba(245,197,66,0.15)] ring-1 ring-amber-400/30'
                    : 'bg-gradient-to-br from-[#29080c] via-[#140b12] to-[#070912] border-red-500/70 shadow-[0_10px_35px_rgba(200,16,46,0.15)] ring-1 ring-red-500/30'
                  : 'bg-black/40 border-white/10'
              }`}
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                    isFirst
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-white/10 text-zinc-300 border border-white/10'
                  }`}>
                    {team.rank}-O'rin {isFirst ? '🥇' : '🥈'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {team.playerCount} ta futbolchi
                  </span>
                </div>

                <div className="text-right font-mono">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Jamoa Reytingi</div>
                  <div className={`text-2xl sm:text-3xl font-black ${
                    isReal ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {Number(team.rating || 0).toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Team Profile */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl p-2 bg-black/60 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-full h-full object-contain filter drop-shadow"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-white tracking-tight">
                    {team.name}
                  </h3>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5">
                    Futbolchilar bali: <strong className="text-zinc-200">{Number(team.playerRatingSum || 0).toFixed(1)}</strong> • Davomat bonusi: <strong className="text-emerald-400">+{team.attendanceBonus}</strong>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mb-4">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.05]">
                  <div className="text-[9px] uppercase font-mono text-zinc-400">Gollar</div>
                  <div className="text-sm font-mono font-black text-white mt-0.5">{team.goals}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.05]">
                  <div className="text-[9px] uppercase font-mono text-zinc-400">Asistlar</div>
                  <div className="text-sm font-mono font-black text-amber-300 mt-0.5">{team.assists}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.05]">
                  <div className="text-[9px] uppercase font-mono text-zinc-400">Seyv / O'tkazdi</div>
                  <div className="text-xs font-mono font-bold text-zinc-300 mt-0.5">
                    <span className="text-emerald-400">{team.saves}S</span> / <span className="text-red-400">{team.conceded}C</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.05]">
                  <div className="text-[9px] uppercase font-mono text-zinc-400">Davomat</div>
                  <div className="text-sm font-mono font-black text-emerald-400 mt-0.5">{team.attendanceRate}%</div>
                </div>
              </div>

              {/* TUSHISH YOKI KO'TARILISH SABABI */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/[0.06] text-xs space-y-1">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold">
                  📊 Reyting holati va sababi:
                </div>
                <p className="text-zinc-300 font-sans leading-relaxed text-[11px]">
                  {team.reason}
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* Visual Relative Rating Bar */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Real Madrid ({Number(rankedTeams.find(t=>t.id==='Real')?.rating || 0).toFixed(1)})
          </span>
          <span className="text-red-400 flex items-center gap-1.5">
            Liverpool FC ({Number(rankedTeams.find(t=>t.id==='Liverpool')?.rating || 0).toFixed(1)}) <span className="w-2 h-2 rounded-full bg-red-500" />
          </span>
        </div>

        {(() => {
          const realR = rankedTeams.find(t=>t.id==='Real')?.rating || 0;
          const livR = rankedTeams.find(t=>t.id==='Liverpool')?.rating || 0;
          const total = Math.max(1, realR + livR);
          const realPercent = total === 1 && realR === 0 && livR === 0 ? 50 : Math.round((realR / total) * 100);

          return (
            <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden flex border border-white/10">
              <div
                style={{ width: `${realPercent}%` }}
                className="h-full bg-amber-400 transition-all duration-500"
              />
              <div
                style={{ width: `${100 - realPercent}%` }}
                className="h-full bg-red-600 transition-all duration-500"
              />
            </div>
          );
        })()}
      </div>

    </section>
  );
}
