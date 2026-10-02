'use client';

import { useState, useEffect, useRef } from 'react';
import { calculatePlayerRating } from '../lib/data';

const PRESET_AVATARS = [
  { label: 'Asliddin', url: '/avatars/asliddin.jpg' },
  { label: 'Said', url: '/avatars/said.jpg' },
  { label: 'Arslan', url: '/avatars/arslan.png' },
  { label: 'Azim', url: '/avatars/azim.svg' },
  { label: 'Fayzi', url: '/avatars/fayzi.svg' },
  { label: 'Ilhom', url: '/avatars/ilhom.jpg' },
  { label: 'Gʻ.Afzal', url: '/avatars/afzal_katta.png' },
  { label: 'Mardon', url: '/avatars/mardon.jpg' },
  { label: 'Abdulaziz', url: '/avatars/abdulaziz.svg' },
  { label: 'Azamat', url: '/avatars/azamat.svg' },
  { label: 'K.Afzal', url: '/avatars/afzal_kichik.svg' },
  { label: 'Abdullox', url: '/avatars/abdulloh.svg' },
  { label: 'Umid', url: '/avatars/umid.svg' },
];

export default function PlayerEditModal({ player, initialPosition, onSave, onClose }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    number: '',
    position: initialPosition || 'ST',
    team: 'Real',
    goals: 0,
    assists: 0,
    avatar: PRESET_AVATARS[0].url,
    isCaptain: false,
    stats: {
      pac: 0,
      sho: 0,
      pas: 0,
      dri: 0,
      def: 0,
      phy: 0,
    }
  });

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name || '',
        displayName: player.displayName || player.name || '',
        number: player.number ?? '',
        position: player.position || 'ST',
        team: player.team || 'Real',
        goals: player.goals || 0,
        assists: player.assists || 0,
        avatar: player.avatar || PRESET_AVATARS[0].url,
        isCaptain: Boolean(player.isCaptain),
        stats: {
          pac: player.stats?.pac ?? 0,
          sho: player.stats?.sho ?? 0,
          pas: player.stats?.pas ?? 0,
          dri: player.stats?.dri ?? 0,
          def: player.stats?.def ?? 0,
          phy: player.stats?.phy ?? 0,
        }
      });
    } else if (initialPosition) {
      setFormData(prev => ({ ...prev, position: initialPosition }));
    }
  }, [player, initialPosition]);

  // Handle Photo Upload from Mobile or PC
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target.result;
      setFormData(prev => ({ ...prev, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const updateStat = (statKey, value) => {
    const num = Math.min(99, Math.max(0, parseInt(value, 10) || 0));
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statKey]: num,
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const g = parseInt(formData.goals, 10) || 0;
    const a = parseFloat(formData.assists) || 0;
    const rating = calculatePlayerRating(g, a);

    const savedPlayer = {
      id: player?.id || 'p_' + Date.now(),
      name: formData.name.trim(),
      displayName: formData.displayName.trim() || formData.name.trim(),
      number: parseInt(formData.number, 10) || 99,
      position: formData.position,
      team: formData.team,
      rating,
      avatar: formData.avatar,
      isCaptain: formData.isCaptain,
      goals: g,
      assists: a,
      fouls: player?.fouls || 0,
      handballs: player?.handballs || 0,
      matchesPlayed: player?.matchesPlayed || 0,
      wins: player?.wins || 0,
      draws: player?.draws || 0,
      losses: player?.losses || 0,
      stats: {
        pac: parseInt(formData.stats.pac, 10) || 0,
        sho: parseInt(formData.stats.sho, 10) || 0,
        pas: parseInt(formData.stats.pas, 10) || 0,
        dri: parseInt(formData.stats.dri, 10) || 0,
        def: parseInt(formData.stats.def, 10) || 0,
        phy: parseInt(formData.stats.phy, 10) || 0,
      },
    };

    onSave(savedPlayer);
  };

  const liveRating = calculatePlayerRating(formData.goals, formData.assists);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0e121d] border border-amber-400/30 rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm">
              ⚙️
            </span>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-white">
                {player ? "O'yinchini Tahrirlash" : "Yangi O'yinchi Qo'shish"}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Ma'lumotlar, rasm yuklash va FIFA ko'rsatkichlari
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* PHOTO UPLOAD SECTION (PHONE & PC) */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400/40 bg-zinc-900 shrink-0">
              <img
                src={formData.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/avatars/arslan.png";
                }}
              />
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Fotosurat (Telefon yoki PC)
              </div>
              <p className="text-[10px] text-zinc-400">
                Telefon galereyasidan yoki kompyuterdan rasm yuklang
              </p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition"
                >
                  📁 Rasm Yuklash
                </button>
                <input
                  type="text"
                  placeholder="yoki URL kiriting..."
                  value={formData.avatar.startsWith('data:') ? 'Yuklangan rasm' : formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="flex-1 px-2.5 py-1 rounded bg-[#090b11] border border-white/10 text-[11px] text-zinc-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Preset Avatars */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 shrink-0">Mavjud:</span>
            {PRESET_AVATARS.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setFormData({ ...formData, avatar: preset.url })}
                className="px-2 py-1 rounded-md bg-white/[0.05] hover:bg-white/10 border border-white/10 text-[10px] text-zinc-300 font-semibold shrink-0 transition"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* NAME & DISPLAY NAME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                Ism *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masalan: Arslan"
                className="w-full px-3 py-2 rounded-lg bg-[#090b11] border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                To'liq Ism / Laqab
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Arslan"
                className="w-full px-3 py-2 rounded-lg bg-[#090b11] border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* TEAM, NUMBER & POSITION */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                Jamoa
              </label>
              <select
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg bg-[#090b11] border border-white/10 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="Real">Real Madrid</option>
                <option value="Liverpool">Liverpool FC</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                Raqam (#)
              </label>
              <input
                type="number"
                required
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="1"
                className="w-full px-2.5 py-2 rounded-lg bg-[#090b11] border border-white/10 text-sm font-mono font-bold text-white text-center focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                Pozitsiya
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg bg-[#090b11] border border-white/10 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="GK">GK (Darvozabon)</option>
                <option value="CB">CB (Markaziy Himoya)</option>
                <option value="LB">LB (Chap Himoya)</option>
                <option value="RB">RB (O'ng Himoya)</option>
                <option value="CM">CM (Markaziy Yarim)</option>
                <option value="CDM">CDM (Tayanch Yarim)</option>
                <option value="CAM">CAM (Hujumkor Yarim)</option>
                <option value="LW">LW (Chap Hujum)</option>
                <option value="RW">RW (O'ng Hujum)</option>
                <option value="ST">ST (Markaziy Hujum)</option>
              </select>
            </div>
          </div>

          {/* GOALS, ASSISTS & RATING RECALCULATION */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-300">
              <span>Gollar & Asistlar</span>
              <span className="font-mono text-white text-sm">
                Reyting: <strong className="text-amber-400">{liveRating.toFixed(1)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">
                  Gollar (+2 reyting)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#090b11] border border-white/10 text-sm font-mono font-bold text-center text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">
                  Asistlar (+1.5 reyting)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.assists}
                  onChange={(e) => setFormData({ ...formData, assists: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#090b11] border border-white/10 text-sm font-mono font-bold text-center text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* FIFA ATTRIBUTES WITH DIRECT NUMBER INPUTS (IMAGE 1 REQUEST: YOZILADIGAN QILGIN) */}
          <div className="p-3.5 rounded-xl bg-[#090b11] border border-amber-400/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>📊</span> FIFA Xususiyatlari (Qo'lda Yoziladigan)
              </span>
              <span className="text-[10px] text-zinc-400">1 dan 99 gacha</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              
              {/* PAC */}
              <div className="p-2 rounded-lg bg-black/50 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-zinc-300">PAC (Tezlik)</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.stats.pac}
                    onChange={(e) => updateStat('pac', e.target.value)}
                    className="w-12 px-1 py-0.5 rounded bg-zinc-900 border border-amber-400/40 text-center font-mono font-black text-amber-400 text-xs focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="99"
                  value={formData.stats.pac}
                  onChange={(e) => updateStat('pac', e.target.value)}
                  className="w-full accent-amber-400 h-1.5 rounded-lg cursor-pointer bg-zinc-800"
                />
              </div>

              {/* SHO */}
              <div className="p-2 rounded-lg bg-black/50 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-zinc-300">SHO (Zarba)</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.stats.sho}
                    onChange={(e) => updateStat('sho', e.target.value)}
                    className="w-12 px-1 py-0.5 rounded bg-zinc-900 border border-amber-400/40 text-center font-mono font-black text-amber-400 text-xs focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="99"
                  value={formData.stats.sho}
                  onChange={(e) => updateStat('sho', e.target.value)}
                  className="w-full accent-amber-400 h-1.5 rounded-lg cursor-pointer bg-zinc-800"
                />
              </div>

              {/* PAS */}
              <div className="p-2 rounded-lg bg-black/50 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-zinc-300">PAS (Pas)</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.stats.pas}
                    onChange={(e) => updateStat('pas', e.target.value)}
                    className="w-12 px-1 py-0.5 rounded bg-zinc-900 border border-amber-400/40 text-center font-mono font-black text-amber-400 text-xs focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="99"
                  value={formData.stats.pas}
                  onChange={(e) => updateStat('pas', e.target.value)}
                  className="w-full accent-amber-400 h-1.5 rounded-lg cursor-pointer bg-zinc-800"
                />
              </div>

              {/* DRI */}
              <div className="p-2 rounded-lg bg-black/50 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-zinc-300">DRI (Dribling)</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.stats.dri}
                    onChange={(e) => updateStat('dri', e.target.value)}
                    className="w-12 px-1 py-0.5 rounded bg-zinc-900 border border-amber-400/40 text-center font-mono font-black text-amber-400 text-xs focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="99"
                  value={formData.stats.dri}
                  onChange={(e) => updateStat('dri', e.target.value)}
                  className="w-full accent-amber-400 h-1.5 rounded-lg cursor-pointer bg-zinc-800"
                />
              </div>

              {/* DEF */}
              <div className="p-2 rounded-lg bg-black/50 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-zinc-300">DEF (Himoya)</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.stats.def}
                    onChange={(e) => updateStat('def', e.target.value)}
                    className="w-12 px-1 py-0.5 rounded bg-zinc-900 border border-amber-400/40 text-center font-mono font-black text-amber-400 text-xs focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="99"
                  value={formData.stats.def}
                  onChange={(e) => updateStat('def', e.target.value)}
                  className="w-full accent-amber-400 h-1.5 rounded-lg cursor-pointer bg-zinc-800"
                />
              </div>

              {/* PHY */}
              <div className="p-2 rounded-lg bg-black/50 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-zinc-300">PHY (Jismoniy)</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.stats.phy}
                    onChange={(e) => updateStat('phy', e.target.value)}
                    className="w-12 px-1 py-0.5 rounded bg-zinc-900 border border-amber-400/40 text-center font-mono font-black text-amber-400 text-xs focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="99"
                  value={formData.stats.phy}
                  onChange={(e) => updateStat('phy', e.target.value)}
                  className="w-full accent-amber-400 h-1.5 rounded-lg cursor-pointer bg-zinc-800"
                />
              </div>

            </div>
          </div>

          {/* CAPTAIN CHECKBOX */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCapEdit"
              checked={formData.isCaptain}
              onChange={(e) => setFormData({ ...formData, isCaptain: e.target.checked })}
              className="w-4 h-4 rounded bg-black border-amber-400/40 text-amber-400 accent-amber-400 cursor-pointer"
            />
            <label htmlFor="isCapEdit" className="text-xs text-zinc-200 font-bold cursor-pointer">
              👑 Jamoa Sardori (Kapitan)
            </label>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 text-zinc-300 text-xs font-bold hover:bg-white/20 transition"
            >
              Bekor Qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              Saqlash
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
