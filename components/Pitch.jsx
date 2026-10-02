'use client';

export default function Pitch({ squad, slotsConfig, onSlotClick, activeTeam = 'Real' }) {
  const isReal = activeTeam === 'Real';

  return (
    <div className="w-full flex justify-center p-1.5 sm:p-5 bg-[#090c15] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl">
      <div className="relative w-full max-w-4xl aspect-[1/1.24] sm:aspect-[1.25/1] md:aspect-[1.35/1] min-h-[380px] sm:min-h-[520px] md:min-h-[600px] rounded-xl sm:rounded-2xl overflow-hidden select-none border-2 border-white/30 shadow-inner">
        
        {/* Lush Green Turf Striping */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#0f3f1e,#0f3f1e_28px,#0c3419_28px,#0c3419_56px)]" />

        {/* Stadium Floodlight Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0.5)_85%)] pointer-events-none" />

        {/* Outer Touchline Chalk Border */}
        <div className="absolute inset-2 sm:inset-3.5 border-2 border-white/50 rounded-lg pointer-events-none" />

        {/* Top Goal Net */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-28 sm:w-40 md:w-48 h-4 border-2 border-white/60 bg-white/10 rounded-b-md" />
        
        {/* Bottom Goal Net */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-28 sm:w-40 md:w-48 h-4 border-2 border-white/60 bg-white/10 rounded-t-md" />

        {/* Penalty Areas */}
        <div className="absolute top-2 sm:top-3.5 left-1/2 -translate-x-1/2 w-[48%] sm:w-[44%] h-[15%] border-2 border-white/45 border-t-0" />
        <div className="absolute top-2 sm:top-3.5 left-1/2 -translate-x-1/2 w-[24%] sm:w-[22%] h-[6.5%] border-2 border-white/45 border-t-0" />

        <div className="absolute bottom-2 sm:bottom-3.5 left-1/2 -translate-x-1/2 w-[48%] sm:w-[44%] h-[15%] border-2 border-white/45 border-b-0" />
        <div className="absolute bottom-2 sm:bottom-3.5 left-1/2 -translate-x-1/2 w-[24%] sm:w-[22%] h-[6.5%] border-2 border-white/45 border-b-0" />
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-sm" />

        {/* Center Line and Center Circle */}
        <div className="absolute top-1/2 left-2 sm:left-3.5 right-2 sm:right-3.5 h-[2px] bg-white/50 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full border-2 border-white/50 flex items-center justify-center">
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-white/30 select-none">
            {isReal ? 'REAL MADRID' : 'LIVERPOOL FC'}
          </span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400" />

        {/* Corner Arcs */}
        <div className="absolute top-2 sm:top-3.5 left-2 sm:left-3.5 w-5 h-5 border-b-2 border-r-2 border-white/40 rounded-br-full" />
        <div className="absolute top-2 sm:top-3.5 right-2 sm:right-3.5 w-5 h-5 border-b-2 border-l-2 border-white/40 rounded-bl-full" />
        <div className="absolute bottom-2 sm:bottom-3.5 left-2 sm:left-3.5 w-5 h-5 border-t-2 border-r-2 border-white/40 rounded-tr-full" />
        <div className="absolute bottom-2 sm:bottom-3.5 right-2 sm:right-3.5 w-5 h-5 border-t-2 border-l-2 border-white/40 rounded-tl-full" />

        {/* Interactive Formation Nodes */}
        {slotsConfig.map((slot) => {
          const player = squad[slot.key];
          const isCaptain = Boolean(player?.isCaptain);

          return (
            <div
              key={slot.key}
              style={{ top: slot.defaultTop, left: slot.defaultLeft }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              {player ? (
                <button
                  type="button"
                  onClick={() => onSlotClick(slot.key, player)}
                  className={`group relative flex flex-col items-center justify-center w-[60px] xs:w-[72px] sm:w-[84px] md:w-[94px] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-[#0c101d]/95 border transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer shadow-xl backdrop-blur-md ${
                    isReal
                      ? isCaptain
                        ? 'border-amber-400 ring-1 ring-amber-400/40 shadow-[0_0_15px_rgba(245,197,66,0.4)]'
                        : 'border-amber-400/50 hover:border-amber-400'
                      : isCaptain
                      ? 'border-red-500 ring-1 ring-red-500/40 shadow-[0_0_15px_rgba(200,16,46,0.4)]'
                      : 'border-red-500/50 hover:border-red-400'
                  }`}
                  title={`${player.name} (${slot.name})`}
                >
                  {/* Rating & Position Pill */}
                  <div className="w-full flex items-center justify-between px-0.5 text-[8px] xs:text-[9px] sm:text-[10px] leading-none mb-1">
                    <span className="font-mono font-bold text-white">
                      {Number(player.rating || 0).toFixed(1)}
                    </span>
                    <span className={`px-1 py-0.2 rounded font-mono font-semibold text-[7px] xs:text-[8px] sm:text-[9px] uppercase ${
                      isReal ? 'bg-amber-400/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {slot.label}
                    </span>
                  </div>

                  {/* Player Avatar */}
                  <div className="relative w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl overflow-hidden bg-zinc-900 border border-white/15 mb-0.5 group-hover:scale-105 transition shadow-sm">
                    <img
                      src={player.avatar || "/avatars/arslan.png"}
                      alt={player.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = isReal ? "/avatars/asliddin.jpg" : "/avatars/afzal_katta.png";
                      }}
                    />
                  </div>

                  {/* Player Name */}
                  <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-tight truncate max-w-[54px] xs:max-w-[66px] sm:max-w-[78px] text-center">
                    {player.name}
                  </span>

                  {/* Shirt Number */}
                  <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-mono text-zinc-400">
                    #{player.number}
                  </span>

                  {/* Captain Indicator */}
                  {isCaptain && (
                    <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded bg-amber-400 text-black text-[7px] font-mono font-bold uppercase shadow-sm">
                      C
                    </span>
                  )}
                </button>
              ) : (
                /* Empty Slot Marker */
                <button
                  type="button"
                  onClick={() => onSlotClick(slot.key, null)}
                  className="flex flex-col items-center justify-center w-[54px] xs:w-[64px] sm:w-[74px] h-[54px] xs:h-[64px] sm:h-[74px] rounded-xl sm:rounded-2xl border border-dashed border-white/40 bg-black/40 hover:bg-black/60 hover:border-amber-400 transition cursor-pointer backdrop-blur-sm"
                  title={`${slot.name} - O'yinchi tanlash`}
                >
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {slot.label}
                  </span>
                  <span className="text-[7px] xs:text-[8px] text-zinc-400 uppercase mt-0.5">
                    + Qo'yish
                  </span>
                </button>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
