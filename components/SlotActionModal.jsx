'use client';

export default function SlotActionModal({
  slotKey,
  slotConfig,
  currentPlayer,
  allPlayers,
  slots,
  onAssignPlayer,
  onRemovePlayer,
  onOpenPlayerDetails,
  onClose,
  isAdmin = false,
}) {
  if (!slotKey) return null;

  // Find players currently on the bench or available
  const assignedPlayerIds = Object.values(slots).filter(Boolean);
  const benchPlayers = allPlayers.filter(p => !assignedPlayerIds.includes(p.id));
  const otherPitchPlayers = allPlayers.filter(
    p => assignedPlayerIds.includes(p.id) && p.id !== currentPlayer?.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0f121a] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[88vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 text-white flex items-center justify-center font-mono font-bold text-xs">
              {slotConfig?.label || 'POS'}
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-white">
                {slotConfig?.name || "Maydon Pozitsiyasi"}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {currentPlayer ? "O'yinchini almashtirish yoki zaxiraga olish" : "Maydonga futbolchi biriktirish"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Current Occupant Details (if any) */}
        {currentPlayer && (
          <div className="mb-4 p-3.5 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/10 bg-zinc-800 shrink-0">
                <img
                  src={currentPlayer.avatar || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&h=200&fit=crop&crop=faces&auto=format&q=80"}
                  alt={currentPlayer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{currentPlayer.name}</span>
                  <span className="text-xs font-mono text-zinc-400">#{currentPlayer.number}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.08] text-zinc-300 uppercase font-mono">
                    {currentPlayer.team}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                  <span className="font-mono text-white font-bold">{Number(currentPlayer.rating || 0).toFixed(1)} RTG</span>
                  <span>• {currentPlayer.position}</span>
                  {currentPlayer.isCaptain && (
                    <span className="text-[10px] text-amber-400 font-semibold">Sardor</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onRemovePlayer(slotKey)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-300 text-xs font-medium transition"
              >
                Zaxiraga
              </button>
              {onOpenPlayerDetails && (
                <button
                  onClick={() => onOpenPlayerDetails(currentPlayer)}
                  className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition"
                >
                  Profil
                </button>
              )}
            </div>
          </div>
        )}

        {/* Section 1: Bench Players */}
        <div className="space-y-2 mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Zaxiradagi O'yinchilar ({benchPlayers.length})
          </div>

          {benchPlayers.length === 0 ? (
            <div className="p-3 rounded-lg bg-black/20 border border-white/[0.06] text-xs text-zinc-500 text-center">
              Zaxirada bo'sh futbolchi yo'q.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {benchPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => onAssignPlayer(slotKey, player.id)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-black/40 hover:bg-white/[0.06] border border-white/[0.06] transition text-left group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
                    <img
                      src={player.avatar || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&h=200&fit=crop&crop=faces&auto=format&q=80"}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                      {player.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                      <span>#{player.number}</span>
                      <span>• {player.position}</span>
                      <span>• [{player.team}]</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    {Number(player.rating || 0).toFixed(1)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Swap with other pitch player */}
        {otherPitchPlayers.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Maydondagi Boshqa O'yinchi Bilan Almashtirish
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
              {otherPitchPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => onAssignPlayer(slotKey, player.id)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-black/40 hover:bg-white/[0.06] border border-white/[0.06] transition text-left group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
                    <img
                      src={player.avatar || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&h=200&fit=crop&crop=faces&auto=format&q=80"}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                      {player.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                      <span>#{player.number}</span>
                      <span>• {player.position}</span>
                      <span>• [{player.team}]</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    ⇄
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
