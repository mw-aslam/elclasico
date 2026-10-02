'use client';

import { useState, useRef } from 'react';

export default function PlayerCard({
  player,
  onSelect,
  onEdit,
  onDelete,
  onAssignToPitch,
  isOnPitch = false,
  pitchSlotLabel = null,
  isAdmin = false,
}) {
  const cardRef = useRef(null);

  const [style, setStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    glare: 'none',
    transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
  });

  const computeTilt = (clientX, clientY) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`,
      glare: `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.06) 40%, transparent 75%)`,
      transition: 'transform 0.08s ease-out',
    });
  };

  const handleMouseMove = (e) => computeTilt(e.clientX, e.clientY);
  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      computeTilt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      glare: 'none',
      transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
  };

  const isReal = player.team === 'Real';
  const isCaptain = Boolean(player.isCaptain);
  const ratingValue = Number(player.rating || 0).toFixed(1);

  // Stat color helper (0 is cleanly styled)
  const getStatColor = (val) => {
    if (!val || val === 0) return 'text-zinc-500 font-semibold';
    if (val >= 90) return 'text-amber-300 font-black';
    if (val >= 80) return 'text-emerald-400 font-bold';
    if (val >= 70) return 'text-cyan-400 font-bold';
    return 'text-zinc-400 font-medium';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: style.transform,
        transition: style.transition,
        transformStyle: 'preserve-3d',
      }}
      className={`relative w-full max-w-[320px] rounded-3xl p-4 sm:p-5 select-none overflow-hidden transition-all duration-300 border shadow-2xl ${
        isReal
          ? isCaptain
            ? 'bg-gradient-to-b from-[#1f1807] via-[#101524] to-[#070a12] border-amber-400/80 shadow-[0_15px_40px_rgba(245,197,66,0.3)] ring-1 ring-amber-400/40'
            : 'bg-gradient-to-b from-[#181d2c] via-[#0f1422] to-[#080b12] border-amber-400/35 shadow-[0_12px_35px_rgba(0,0,0,0.6)]'
          : isCaptain
          ? 'bg-gradient-to-b from-[#25080c] via-[#140b12] to-[#070a12] border-red-500/80 shadow-[0_15px_40px_rgba(200,16,46,0.35)] ring-1 ring-red-500/40'
          : 'bg-gradient-to-b from-[#1e080b] via-[#120b12] to-[#080b12] border-red-500/40 shadow-[0_12px_35px_rgba(0,0,0,0.6)]'
      }`}
    >
      {/* Dynamic Cursor Glare / Hologram Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-150"
        style={{ background: style.glare }}
      />

      {/* Ambient Top Light Beam */}
      <div
        className={`absolute -top-14 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full blur-3xl pointer-events-none opacity-40 ${
          isReal ? 'bg-amber-400' : 'bg-red-500'
        }`}
      />

      {/* Card Header: Rating, Position, Number & Club Badge */}
      <div className="relative z-10 flex items-start justify-between mb-2.5">
        <div className="leading-none">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-3xl sm:text-4xl font-mono font-black tracking-tight ${
                isReal ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,197,66,0.6)]' : 'text-red-400 drop-shadow-[0_0_12px_rgba(200,16,46,0.6)]'
              }`}
            >
              {ratingValue}
            </span>
            <span className="text-[10px] font-mono font-extrabold uppercase text-zinc-400">
              RTG
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
              isReal
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}>
              {player.position}
            </span>
            <span className="text-xs font-mono font-black text-white">
              #{player.number}
            </span>
          </div>
        </div>

        {/* Club Tag & Captain Crest */}
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
            isReal
              ? 'bg-gradient-to-r from-amber-500/20 to-amber-400/30 text-amber-300 border border-amber-400/50'
              : 'bg-gradient-to-r from-red-600/30 to-red-800/30 text-red-200 border border-red-500/50'
          }`}>
            {isReal ? '👑 REAL FC' : '🔴 LIVERPOOL FC'}
          </span>

          {isCaptain && (
            <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(245,197,66,0.5)]">
              SARDOR
            </span>
          )}
        </div>
      </div>

      {/* Player Photo Showcase */}
      <div
        onClick={() => onSelect && onSelect(player)}
        className="relative w-full aspect-[1/1.05] rounded-2xl overflow-hidden bg-zinc-950 border border-white/15 mb-3 group cursor-pointer shadow-inner"
      >
        <img
          src={player.avatar || "/avatars/arslan.png"}
          alt={player.name}
          className="w-full h-full object-cover object-center filter contrast-105 group-hover:scale-105 transition duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = isReal ? "/avatars/asliddin.jpg" : "/avatars/afzal_katta.png";
          }}
        />

        {/* Watermark Shirt Number */}
        <div className="absolute bottom-0 right-2 font-mono text-5xl font-black text-white/15 pointer-events-none select-none">
          {player.number}
        </div>

        {/* Pitch Status Pill */}
        {isOnPitch && (
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-black text-[9px] font-black uppercase shadow-lg backdrop-blur-md">
            ⚽ {pitchSlotLabel || "Maydonda"}
          </div>
        )}
      </div>

      {/* Player Name & Sardor Badge */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between gap-1.5">
          <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight truncate">
            {player.name}
          </h3>
          {player.isCaptain && (
            <span className="px-2 py-0.5 rounded bg-amber-400 text-black text-[9px] font-mono font-black uppercase shrink-0 shadow-sm">
              👑 Sardor
            </span>
          )}
        </div>
        <p className="text-[11px] text-zinc-400 font-mono font-medium truncate mt-0.5">
          {isReal ? 'Real Madrid' : 'Liverpool FC'} • #{player.number} ({player.position})
        </p>
      </div>

      {/* Primary Match Stats: Goals & Assists */}
      <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-black/60 border border-white/10 text-center mb-2.5">
        <div>
          <div className="text-[9px] uppercase font-bold text-zinc-400">Gol (+2)</div>
          <div className="text-sm font-mono font-black text-white mt-0.5">{player.goals || 0}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase font-bold text-amber-300">Asist (+1.5)</div>
          <div className="text-sm font-mono font-black text-amber-400 mt-0.5">{player.assists || 0}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase font-bold text-zinc-400">O'yin</div>
          <div className="text-sm font-mono font-bold text-zinc-300 mt-0.5">{player.matchesPlayed || 0}</div>
        </div>
      </div>

      {/* 6 FIFA Attributes Grid (PAC, SHO, PAS, DRI, DEF, PHY) */}
      <div className="grid grid-cols-6 gap-1 p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-center mb-3">
        <div>
          <div className="text-[8px] uppercase font-bold text-zinc-500">PAC</div>
          <div className={`text-[11px] font-mono ${getStatColor(player.stats?.pac ?? 0)}`}>{player.stats?.pac ?? 0}</div>
        </div>
        <div>
          <div className="text-[8px] uppercase font-bold text-zinc-500">SHO</div>
          <div className={`text-[11px] font-mono ${getStatColor(player.stats?.sho ?? 0)}`}>{player.stats?.sho ?? 0}</div>
        </div>
        <div>
          <div className="text-[8px] uppercase font-bold text-zinc-500">PAS</div>
          <div className={`text-[11px] font-mono ${getStatColor(player.stats?.pas ?? 0)}`}>{player.stats?.pas ?? 0}</div>
        </div>
        <div>
          <div className="text-[8px] uppercase font-bold text-zinc-500">DRI</div>
          <div className={`text-[11px] font-mono ${getStatColor(player.stats?.dri ?? 0)}`}>{player.stats?.dri ?? 0}</div>
        </div>
        <div>
          <div className="text-[8px] uppercase font-bold text-zinc-500">DEF</div>
          <div className={`text-[11px] font-mono ${getStatColor(player.stats?.def ?? 0)}`}>{player.stats?.def ?? 0}</div>
        </div>
        <div>
          <div className="text-[8px] uppercase font-bold text-zinc-500">PHY</div>
          <div className={`text-[11px] font-mono ${getStatColor(player.stats?.phy ?? 0)}`}>{player.stats?.phy ?? 0}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 pt-0.5">
        {onAssignToPitch && (
          <button
            type="button"
            onClick={() => onAssignToPitch(player)}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition transform hover:scale-[1.02] active:scale-[0.98] ${
              isOnPitch
                ? 'bg-white/10 hover:bg-white/20 text-zinc-200 border border-white/15'
                : isReal
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_15px_rgba(245,197,66,0.35)]'
                : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(200,16,46,0.35)]'
            }`}
          >
            {isOnPitch ? "Almashtirish" : "Maydonga"}
          </button>
        )}

        {isAdmin && onEdit && (
          <button
            type="button"
            onClick={() => onEdit(player)}
            className="px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 text-zinc-300 hover:text-white text-xs font-bold transition"
            title="Tahrirlash va Rasm Yuklash (Admin)"
          >
            ✏️
          </button>
        )}
      </div>

    </div>
  );
}
