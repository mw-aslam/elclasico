'use client';

export default function PlayerModal({ player, onClose, onEdit, isAdmin = false }) {
  if (!player) return null;

  const isReal = player.team === 'Real';
  const isCaptain = Boolean(player.isCaptain);
  const ratingValue = Number(player.rating || 0).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0f121a] border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white flex items-center justify-center transition z-20"
        >
          ✕
        </button>

        {/* Minimalist Profile Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 mb-3">
            <img
              src={player.avatar || (isReal ? "/avatars/asliddin.jpg" : "/avatars/afzal_katta.png")}
              alt={player.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = isReal ? "/avatars/asliddin.jpg" : "/avatars/afzal_katta.png";
              }}
            />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">
              {player.name}
            </h2>
            {isCaptain && (
              <span className="text-xs font-semibold text-amber-400">👑 Sardor</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className={`px-2 py-0.5 rounded font-bold uppercase ${
              isReal ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'
            }`}>
              {isReal ? 'REAL MADRID' : 'LIVERPOOL FC'}
            </span>
            <span>• #{player.number}</span>
            <span>• {player.position}</span>
          </div>
        </div>

        {/* Rating & Formula Explainer */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">Hozirgi Reyting</span>
            <span className="text-2xl font-mono font-bold text-white">{ratingValue}</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Formula: ({player.goals || 0} Gol × 2) + ({player.assists || 0} Asist × 1.5)
            {player.saves > 0 ? ` + (${player.saves} Seyv × 0.5)` : ''}
            {player.conceded > 0 ? ` - (${player.conceded} Gol o'tkazish × 0.5)` : ''} = {ratingValue}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06]">
            <div className="text-[10px] uppercase font-mono text-zinc-400">Jami Gollar</div>
            <div className="text-base font-mono font-bold text-white mt-1">{player.goals || 0}</div>
          </div>
          <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06]">
            <div className="text-[10px] uppercase font-mono text-zinc-400">Jami Asistlar</div>
            <div className="text-base font-mono font-bold text-white mt-1">{player.assists || 0}</div>
          </div>
          <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06]">
            <div className="text-[10px] uppercase font-mono text-zinc-400">O'yinlar</div>
            <div className="text-base font-mono font-bold text-white mt-1">{player.matchesPlayed || 0}</div>
          </div>
        </div>

        {/* 6 FIFA Attributes */}
        <div className="grid grid-cols-6 gap-1 p-2 rounded-xl bg-black/40 border border-white/[0.06] text-center mb-5">
          <div>
            <div className="text-[8px] uppercase font-bold text-zinc-500">PAC</div>
            <div className="text-xs font-mono font-bold text-zinc-400 mt-0.5">{player.stats?.pac ?? 0}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase font-bold text-zinc-500">SHO</div>
            <div className="text-xs font-mono font-bold text-zinc-400 mt-0.5">{player.stats?.sho ?? 0}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase font-bold text-zinc-500">PAS</div>
            <div className="text-xs font-mono font-bold text-zinc-400 mt-0.5">{player.stats?.pas ?? 0}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase font-bold text-zinc-500">DRI</div>
            <div className="text-xs font-mono font-bold text-zinc-400 mt-0.5">{player.stats?.dri ?? 0}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase font-bold text-zinc-500">DEF</div>
            <div className="text-xs font-mono font-bold text-zinc-400 mt-0.5">{player.stats?.def ?? 0}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase font-bold text-zinc-500">PHY</div>
            <div className="text-xs font-mono font-bold text-zinc-400 mt-0.5">{player.stats?.phy ?? 0}</div>
          </div>
        </div>

        {/* Non-admin notice */}
        {!isAdmin && (
          <div className="mb-4 text-center text-[10px] text-zinc-500 font-mono flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <span>🔒</span> Tahrirlash va gol qo'shish faqat admin uchun
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAdmin && onEdit && (
            <button
              onClick={() => { onClose(); onEdit(player); }}
              className="flex-1 py-2.5 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition"
            >
              Tahrirlash (Admin)
            </button>
          )}
          <button
            onClick={onClose}
            className={`py-2.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 text-xs font-semibold transition ${
              isAdmin && onEdit ? 'flex-1' : 'w-full'
            }`}
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  );
}
