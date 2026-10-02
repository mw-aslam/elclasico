'use client';

import { useState } from 'react';
import ConfirmModal from './ConfirmModal';

export default function MatchModal({ match, onClose, onDeleteMatch, isAdmin = false }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!match) return null;

  const handleConfirmDelete = () => {
    if (!isAdmin) return;
    setIsConfirmOpen(false);
    if (onDeleteMatch) onDeleteMatch(match.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0e121d] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition"
        >
          ✕
        </button>

        {/* Match Header Scoreboard */}
        <div className="text-center pb-5 border-b border-white/10 mb-4">
          <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
            {new Date(match.date).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>

          <div className="flex items-center justify-between gap-3 mt-3">
            <span className="flex-1 text-right text-base sm:text-lg font-black text-white uppercase truncate">
              {match.homeTeam}
            </span>

            <span className="px-4 py-1 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-xl sm:text-2xl font-black">
              {match.homeScore} : {match.awayScore}
            </span>

            <span className="flex-1 text-left text-base sm:text-lg font-black text-white uppercase truncate">
              {match.awayTeam}
            </span>
          </div>

          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase font-bold">
            Yakunlangan
          </span>
        </div>

        {/* Player Stats Details */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            Futbolchilar Natijalari (Gol, Asist, Seyv)
          </h4>

          {match.details && match.details.length > 0 ? (
            <div className="overflow-x-auto max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase">
                    <th className="py-2 px-3">O'yinchi</th>
                    <th className="py-2 px-2 text-center">Gollar</th>
                    <th className="py-2 px-2 text-center">Asist</th>
                    <th className="py-2 px-2 text-center">Seyv / O'tkazdi</th>
                    <th className="py-2 px-3 text-right">Reyting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {match.details.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 font-bold text-white">
                        {item.name}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-white">
                        {item.goalsInMatch || 0}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-amber-300">
                        {item.assistsInMatch || 0}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-zinc-300">
                        {item.savesInMatch ? <span className="text-emerald-400 font-bold">{item.savesInMatch}S</span> : '-'}
                        {item.concededInMatch ? <span className="text-red-400 ml-1">({item.concededInMatch})</span> : ''}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-white">
                        {Number(item.newRating || 0).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 text-center py-4">
              O'yinchilarning individual statistikasi qayd etilmagan.
            </p>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          {isAdmin && onDeleteMatch && (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white text-xs font-bold transition"
            >
              O'yinni O'chirish (Admin) 🗑️
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-semibold ml-auto"
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
