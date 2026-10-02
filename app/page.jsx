'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Pitch from '../components/Pitch';
import PlayerCard from '../components/PlayerCard';
import PlayerModal from '../components/PlayerModal';
import MatchModal from '../components/MatchModal';
import SlotActionModal from '../components/SlotActionModal';
import PlayerEditModal from '../components/PlayerEditModal';
import RatingAnalytics from '../components/RatingAnalytics';
import TeamLeaderboard from '../components/TeamLeaderboard';
import ConfirmModal from '../components/ConfirmModal';
import { getSupabaseData } from '../lib/supabase';
import {
  INITIAL_ALL_PLAYERS,
  INITIAL_SLOT_ASSIGNMENTS,
  INITIAL_MATCHES,
  getStoredPlayers,
  saveStoredPlayers,
  getStoredSlots,
  saveStoredSlots,
  getStoredMatches,
  deleteStoredMatch,
  getStoredAttendance,
  saveStoredAttendance,
  assignSlot,
  removeSlot,
  FORMATION_REAL,
  FORMATION_LIVERPOOL,
  getAdminAuth,
  getPlayerPeriodStats,
} from '../lib/data';

export default function HomePage() {
  // Always initialize with default squads so it NEVER flashes "0 o'yinchi"
  const [players, setPlayers] = useState(INITIAL_ALL_PLAYERS);
  const [slots, setSlots] = useState(INITIAL_SLOT_ASSIGNMENTS);
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [attendance, setAttendance] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Selected team: 'Real' or 'Liverpool' or 'ALL'
  const [activeTeam, setActiveTeam] = useState('Real'); 

  // Modals state
  const [activeSlotKey, setActiveSlotKey] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isPlayerEditOpen, setIsPlayerEditOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState(null);

  // Custom Confirm Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Ha',
    cancelText: "Yo'q",
    isDestructive: true,
    onConfirm: null,
  });

  const openConfirm = ({ title, message, confirmText = "Ha", cancelText = "Yo'q", isDestructive = true, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      isDestructive,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      },
    });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Filters & UI
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('all'); // 'weekly', 'monthly', 'yearly', 'all'
  const [toastMessage, setToastMessage] = useState('');

  // Continuous Live Auto-Sync: Queries Supabase directly (zero proxy lag) and polls every 3.5s
  const syncFromRemote = async () => {
    // 1. Direct Supabase Query (Instant, no Vercel proxy / auth interference)
    try {
      const supa = await getSupabaseData();
      if (supa) {
        if (Array.isArray(supa.matches)) {
          setMatches(supa.matches);
          saveStoredMatches(supa.matches, false);
        }
        if (Array.isArray(supa.players) && supa.players.length > 0) {
          setPlayers(supa.players);
          saveStoredPlayers(supa.players, false);
        }
        if (supa.attendance && typeof supa.attendance === 'object') {
          setAttendance(supa.attendance);
          saveStoredAttendance(supa.attendance, false);
        }
        if (supa.slots && typeof supa.slots === 'object' && Object.keys(supa.slots).length > 0) {
          setSlots(supa.slots);
          saveStoredSlots(supa.slots, false);
        }
        return;
      }
    } catch (e) {}

    // 2. Fallback to /api/data
    try {
      const res = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json();
      if (d && !d.error) {
        if (Array.isArray(d.matches)) {
          setMatches(d.matches);
          saveStoredMatches(d.matches, false);
        }
        if (Array.isArray(d.players) && d.players.length > 0) {
          setPlayers(d.players);
          saveStoredPlayers(d.players, false);
        }
        if (d.attendance && typeof d.attendance === 'object') {
          setAttendance(d.attendance);
          saveStoredAttendance(d.attendance, false);
        }
        if (d.slots && typeof d.slots === 'object' && Object.keys(d.slots).length > 0) {
          setSlots(d.slots);
          saveStoredSlots(d.slots, false);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    setPlayers(getStoredPlayers());
    setSlots(getStoredSlots());
    setMatches(getStoredMatches());
    setAttendance(getStoredAttendance());
    setIsAdmin(getAdminAuth());

    // 1. Initial fetch immediately
    syncFromRemote();

    // 2. Poll every 3.5 seconds so all changes appear live without reloading
    const interval = setInterval(syncFromRemote, 3500);

    // 3. Re-fetch on focus / phone screen wake
    const handleFocus = () => {
      syncFromRemote();
      setIsAdmin(getAdminAuth());
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Active Formation Config for Pitch (Real or Liverpool)
  const pitchFormation = activeTeam === 'Liverpool' ? FORMATION_LIVERPOOL : FORMATION_REAL;
  const pitchSquadPlayers = players.filter((p) => p.team === (activeTeam === 'Liverpool' ? 'Liverpool' : 'Real'));

  // Build squad map (slotKey -> Player object)
  const squad = {};
  pitchFormation.forEach((slot) => {
    const pId = slots[slot.key];
    squad[slot.key] = players.find((p) => p.id === pId) || null;
  });

  const activeSlotKeys = pitchFormation.map((s) => s.key);

  // Slot Controls
  const handleSlotClick = (slotKey) => {
    const currentPId = slots[slotKey];
    const currentPlayer = players.find((p) => p.id === currentPId);
    if (!isAdmin && currentPlayer) {
      setSelectedPlayer(currentPlayer);
      return;
    }
    setActiveSlotKey(slotKey);
  };

  const handleAssignPlayerToSlot = (slotKey, playerId) => {
    const updated = assignSlot(slots, slotKey, playerId);
    setSlots(updated);
    saveStoredSlots(updated);
    setActiveSlotKey(null);
    const assignedPlayer = players.find((p) => p.id === playerId);
    showToast(`${assignedPlayer?.name || "O'yinchi"} maydonga qo'yildi.`);
  };

  const handleRemovePlayerFromSlot = (slotKey) => {
    const updated = removeSlot(slots, slotKey);
    setSlots(updated);
    saveStoredSlots(updated);
    setActiveSlotKey(null);
    showToast("O'yinchi maydondan olindi.");
  };

  const handleQuickAssignFromCard = (player) => {
    if (player.team !== activeTeam && activeTeam !== 'ALL') {
      setActiveTeam(player.team);
    }
    const targetFormation = player.team === 'Real' ? FORMATION_REAL : FORMATION_LIVERPOOL;
    const emptySlot = targetFormation.find((s) => !slots[s.key] && s.label === player.position) 
      || targetFormation.find((s) => !slots[s.key]);

    if (emptySlot) {
      handleAssignPlayerToSlot(emptySlot.key, player.id);
    } else {
      setActiveSlotKey(targetFormation[0].key);
      showToast("Barcha joylar to'lgan. Almashtirmoqchi bo'lgan o'yinchingizni tanlang.");
    }
  };

  const handleOpenEditPlayer = (player) => {
    if (!isAdmin) {
      showToast("Tahrirlash faqat admin uchun! Iltimos, admin loginidan kiring.");
      return;
    }
    setPlayerToEdit(player);
    setIsPlayerEditOpen(true);
  };

  const handleSavePlayer = (playerData) => {
    if (!isAdmin) {
      showToast("Faqat admin o'zgartirish kirita oladi.");
      return;
    }
    let updated;
    const exists = players.some((p) => p.id === playerData.id);
    if (exists) {
      updated = players.map((p) => {
        if (p.id === playerData.id) return { ...p, ...playerData };
        if (playerData.isCaptain && p.team === playerData.team) {
          return { ...p, isCaptain: false };
        }
        return p;
      });
      showToast(`"${playerData.name}" saqlandi.`);
    } else {
      let list = [...players, playerData];
      if (playerData.isCaptain) {
        list = list.map((p) => {
          if (p.id !== playerData.id && p.team === playerData.team) {
            return { ...p, isCaptain: false };
          }
          return p;
        });
      }
      updated = list;
      showToast(`"${playerData.name}" tarkibga qo'shildi.`);
    }
    setPlayers(updated);
    saveStoredPlayers(updated);
    setIsPlayerEditOpen(false);
  };

  const handleDeletePlayer = (playerId, playerName) => {
    if (!isAdmin) {
      showToast("Faqat admin o'chira oladi.");
      return;
    }
    openConfirm({
      title: "O'yinchini O'chirish",
      message: `"${playerName}" o'yinchisini tarkibdan o'chirmoqchimisiz?`,
      confirmText: "Ha, o'chirish",
      cancelText: "Yo'q",
      isDestructive: true,
      onConfirm: () => {
        const updatedPlayers = players.filter((p) => p.id !== playerId);
        setPlayers(updatedPlayers);
        saveStoredPlayers(updatedPlayers);

        const updatedSlots = { ...slots };
        Object.keys(updatedSlots).forEach((k) => {
          if (updatedSlots[k] === playerId) updatedSlots[k] = null;
        });
        setSlots(updatedSlots);
        saveStoredSlots(updatedSlots);

        setActiveSlotKey(null);
        if (selectedPlayer?.id === playerId) setSelectedPlayer(null);
        showToast(`"${playerName}" o'chirildi.`);
      }
    });
  };

  const handleDeleteMatch = (matchId) => {
    if (!isAdmin) {
      showToast("O'yinni o'chirish faqat admin uchun!");
      return;
    }
    const updated = deleteStoredMatch(matchId);
    setMatches(updated);
    if (selectedMatch?.id === matchId) setSelectedMatch(null);
    showToast("O'yin tarixdan o'chirildi.");
  };

  // KPIs
  const realPlayers = players.filter((p) => p.team === 'Real');
  const liverpoolPlayers = players.filter((p) => p.team === 'Liverpool');
  const totalGoals = players.reduce((acc, p) => acc + (p.goals || 0), 0);
  const totalAssists = players.reduce((acc, p) => acc + (p.assists || 0), 0);
  const topRated = [...players].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

  // Filtering for Cards
  const filteredPlayers = players.filter((p) => {
    const matchesTeam = activeTeam === 'ALL' || p.team === activeTeam;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.displayName && p.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPosition =
      positionFilter === 'ALL' ||
      (positionFilter === 'GK' && p.position === 'GK') ||
      (positionFilter === 'DEF' && ['CB', 'LB', 'RB'].includes(p.position)) ||
      (positionFilter === 'MID' && ['CM', 'CDM', 'CAM'].includes(p.position)) ||
      (positionFilter === 'FWD' && ['ST', 'LW', 'RW'].includes(p.position));

    return matchesTeam && matchesSearch && matchesPosition;
  });

  // Sorted for Leaderboard with Period Filtering (Haftalik, Oylik, Yillik, Barcha Vaqt)
  const leaderboardPlayers = players.map((p) => {
    const periodStats = getPlayerPeriodStats(p, matches, leaderboardPeriod);
    return {
      ...p,
      displayGoals: periodStats.goals,
      displayAssists: periodStats.assists,
      displaySaves: periodStats.saves,
      displayConceded: periodStats.conceded,
      displayMatches: periodStats.matchesPlayed,
      displayRating: periodStats.rating,
    };
  }).sort((a, b) => {
    if (b.displayRating !== a.displayRating) {
      return b.displayRating - a.displayRating;
    }
    return b.displayGoals - a.displayGoals;
  });

  return (
    <div className="min-h-screen bg-[#07090f] text-zinc-100 selection:bg-amber-400 selection:text-black pb-12">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-xs font-semibold shadow-2xl animate-fade-in flex items-center gap-2">
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-8 sm:space-y-12">

        {/* ========================================================
            HERO MATCHDAY HEADER & TEAM CONTROLLER
           ======================================================== */}
        <section className="rounded-2xl sm:rounded-3xl bg-[#0c101d] border border-white/10 p-4 sm:p-7 space-y-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-semibold mb-1">
                Rasmiy Tarkib & Taktika • 2026-2027
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
                Real Madrid <span className="text-zinc-500 font-normal">vs</span> Liverpool FC
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mt-1">
                Barcha o'yinchilarning boshlang'ich reytingi 0 bo'lib, har bir urilgan gol (+2), assist (+1.5), seyv (+0.5) va davomat orqali hisoblanadi.
              </p>
            </div>

            {/* TEAM SWITCHER SEGMENTED CONTROL (100% RESPONSIVE) */}
            <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center p-1 rounded-xl bg-black/60 border border-white/10 text-[11px] sm:text-xs font-bold shadow-inner gap-1">
              <button
                onClick={() => setActiveTeam('Real')}
                className={`py-2 px-2 sm:px-4 rounded-lg transition duration-200 text-center truncate whitespace-nowrap ${
                  activeTeam === 'Real'
                    ? 'bg-amber-400 text-black font-extrabold shadow-md'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <span className="sm:hidden">RMA ({realPlayers.length})</span>
                <span className="hidden sm:inline">Real Madrid ({realPlayers.length})</span>
              </button>
              <button
                onClick={() => setActiveTeam('Liverpool')}
                className={`py-2 px-2 sm:px-4 rounded-lg transition duration-200 text-center truncate whitespace-nowrap ${
                  activeTeam === 'Liverpool'
                    ? 'bg-red-600 text-white font-extrabold shadow-md'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <span className="sm:hidden">LIV ({liverpoolPlayers.length})</span>
                <span className="hidden sm:inline">Liverpool ({liverpoolPlayers.length})</span>
              </button>
              <button
                onClick={() => setActiveTeam('ALL')}
                className={`py-2 px-2 sm:px-3.5 rounded-lg transition duration-200 text-center truncate whitespace-nowrap ${
                  activeTeam === 'ALL'
                    ? 'bg-zinc-700 text-white font-extrabold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span className="sm:hidden">Barchasi</span>
                <span className="hidden sm:inline">Hammasi ({players.length})</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 border-t border-white/[0.08]">
            <div className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-[10px] uppercase font-mono text-zinc-400 truncate">Real Madrid</div>
              <div className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">{realPlayers.length} futbolchi</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-[10px] uppercase font-mono text-zinc-400 truncate">Liverpool FC</div>
              <div className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">{liverpoolPlayers.length} futbolchi</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-[10px] uppercase font-mono text-zinc-400 truncate">Jami Gollar</div>
              <div className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">{totalGoals} ta</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-[10px] uppercase font-mono text-zinc-400 truncate">Yetakchi</div>
              <div className="text-base sm:text-lg font-mono font-bold text-amber-400 mt-0.5 truncate">
                {topRated?.name || "Asliddin"} ({Number(topRated?.rating || 0).toFixed(1)})
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION: TEAM LEADERBOARD (REAL MADRID VS LIVERPOOL FC)
           ======================================================== */}
        <div id="leaderboard-section">
          <TeamLeaderboard players={players} matches={matches} attendance={attendance} />
        </div>

        {/* ========================================================
            SECTION 1: TACTICAL PITCH
           ======================================================== */}
        <section id="pitch-section" className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                Taktik Joylashuv — {activeTeam === 'Liverpool' ? 'Liverpool FC (1-2-2-2)' : 'Real Madrid (1-3-2)'}
              </h2>
              <p className="text-xs text-zinc-400">
                Maydondagi futbolchini bosib joyini almashtiring yoki zaxiraga o'tkazing
              </p>
            </div>

            {/* Quick Switch Button on Pitch */}
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTeam('Real')}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  activeTeam === 'Real'
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                Real (1-3-2)
              </button>
              <button
                onClick={() => setActiveTeam('Liverpool')}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  activeTeam === 'Liverpool'
                    ? 'bg-red-600/20 border-red-500 text-red-300 font-bold'
                    : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                Liverpool (1-2-2-2)
              </button>
            </div>
          </div>

          <Pitch
            squad={squad}
            slotsConfig={pitchFormation}
            onSlotClick={handleSlotClick}
            activeTeam={activeTeam === 'Liverpool' ? 'Liverpool' : 'Real'}
          />
        </section>


        {/* ========================================================
            SECTION 2: 3D PLAYER CARDS GALLERY
           ======================================================== */}
        <section id="cards-section" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                Futbolchilar Tarkibi ({filteredPlayers.length})
              </h2>
              <p className="text-xs text-zinc-400">
                3D interaktiv kartochkalar, fotosuratlar va ko'rsatkichlar
              </p>
            </div>

            {/* Search & Position Filters */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Qidiruv..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#0c101d] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none w-full xs:w-40 sm:w-48"
              />

              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#0c101d] border border-white/10 text-xs font-semibold text-zinc-300 focus:outline-none w-full xs:w-auto"
              >
                <option value="ALL">Barcha Pozitsiyalar</option>
                <option value="GK">GK - Darvozabon</option>
                <option value="DEF">DEF - Himoya</option>
                <option value="MID">MID - Yarim Himoya</option>
                <option value="FWD">FWD - Hujum</option>
              </select>
            </div>
          </div>

          {/* Fully Responsive Grid for Cards: 1 column on phones for pristine readability, 2 on tablets, 3-4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 justify-items-center w-full">
            {filteredPlayers.map((player) => {
              const currentSlot = activeSlotKeys.find((k) => slots[k] === player.id);
              const slotLabel = currentSlot ? pitchFormation.find(s => s.key === currentSlot)?.label : null;

              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onSelect={(p) => setSelectedPlayer(p)}
                  onEdit={isAdmin ? handleOpenEditPlayer : null}
                  onDelete={isAdmin ? handleDeletePlayer : null}
                  onAssignToPitch={isAdmin ? handleQuickAssignFromCard : null}
                  isOnPitch={Boolean(currentSlot)}
                  pitchSlotLabel={slotLabel}
                  isAdmin={isAdmin}
                />
              );
            })}
          </div>
        </section>


        {/* ========================================================
            SECTION 3: RATING DYNAMICS & DROP ATTRIBUTION ANALYTICS
           ======================================================== */}
        <div id="analytics-section">
          <RatingAnalytics matches={matches} players={players} />
        </div>


        {/* ========================================================
            SECTION 4: LEADERBOARD TABLE (WITH WEEKLY/MONTHLY/YEARLY)
           ======================================================== */}
        <section id="players-leaderboard" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                Reyting & To'purarlar Jadvali
              </h2>
              <p className="text-xs text-zinc-400">
                Reyting formulasi: <strong>(Gol × 2) + (Asist × 1.5) + (Seyv × 0.5) - (O'tkazilgan × 0.5)</strong>
              </p>
            </div>

            {/* VAQT BO'YICHA REYTING FILTRI (Haftalik, Oylik, Yillik, Barcha Vaqt) */}
            <div className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex items-center p-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono font-bold shadow-inner gap-1">
              <button
                onClick={() => setLeaderboardPeriod('weekly')}
                className={`py-2 px-1 sm:px-3 sm:py-1.5 rounded-lg text-center transition whitespace-nowrap ${
                  leaderboardPeriod === 'weekly'
                    ? 'bg-amber-400 text-black font-extrabold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span className="sm:hidden">Hafta</span>
                <span className="hidden sm:inline">Haftalik (7 kun)</span>
              </button>
              <button
                onClick={() => setLeaderboardPeriod('monthly')}
                className={`py-2 px-1 sm:px-3 sm:py-1.5 rounded-lg text-center transition whitespace-nowrap ${
                  leaderboardPeriod === 'monthly'
                    ? 'bg-amber-400 text-black font-extrabold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span className="sm:hidden">Oy</span>
                <span className="hidden sm:inline">Oylik (30 kun)</span>
              </button>
              <button
                onClick={() => setLeaderboardPeriod('yearly')}
                className={`py-2 px-1 sm:px-3 sm:py-1.5 rounded-lg text-center transition whitespace-nowrap ${
                  leaderboardPeriod === 'yearly'
                    ? 'bg-amber-400 text-black font-extrabold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span className="sm:hidden">Yil</span>
                <span className="hidden sm:inline">Yillik</span>
              </button>
              <button
                onClick={() => setLeaderboardPeriod('all')}
                className={`py-2 px-1 sm:px-3 sm:py-1.5 rounded-lg text-center transition whitespace-nowrap ${
                  leaderboardPeriod === 'all'
                    ? 'bg-amber-400 text-black font-extrabold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span className="sm:hidden">Barchasi</span>
                <span className="hidden sm:inline">Barcha Vaqt</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl bg-[#0c101d] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/50 border-b border-white/10 text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-2 sm:px-3 w-8 sm:w-10 text-center font-mono">#</th>
                    <th className="py-3 px-2 sm:px-3 whitespace-nowrap">O'yinchi</th>
                    <th className="py-3 px-2 sm:px-3 whitespace-nowrap">Jamoa</th>
                    <th className="py-3 px-2 sm:px-3 whitespace-nowrap">Poz</th>
                    <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">O'yin</th>
                    <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">Gol (+2)</th>
                    <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">Asist (+1.5)</th>
                    <th className="py-3 px-3 sm:px-4 text-right font-black text-white whitespace-nowrap">Reyting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {leaderboardPlayers.map((player, idx) => {
                    const isReal = player.team === 'Real';
                    return (
                      <tr
                        key={player.id}
                        onClick={() => setSelectedPlayer(player)}
                        className="hover:bg-white/[0.02] cursor-pointer transition"
                      >
                        <td className="py-3 px-2 sm:px-3 text-center font-mono font-bold text-zinc-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-2 sm:px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-white/15 shrink-0">
                              <img
                                src={player.avatar || "/avatars/arslan.png"}
                                alt={player.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = "/avatars/arslan.png"; }}
                              />
                            </div>
                            <div>
                              <span className="font-bold text-white text-xs sm:text-sm">{player.name}</span>
                              {player.isCaptain && (
                                <span className="ml-1 text-[9px] text-amber-400 font-bold">• 👑 Sardor</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono whitespace-nowrap inline-flex items-center ${
                            isReal ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30' : 'bg-red-600/10 text-red-300 border border-red-500/30'
                          }`}>
                            <span className="sm:hidden">{player.team === 'Real' ? 'RMA' : 'LIV'}</span>
                            <span className="hidden sm:inline">{player.team === 'Real' ? 'Real Madrid' : 'Liverpool FC'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-3 font-mono text-zinc-400 whitespace-nowrap">
                          {player.position}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center font-mono text-zinc-400 whitespace-nowrap">
                          {player.displayMatches || 0}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center font-mono font-bold text-white whitespace-nowrap">
                          {player.displayGoals || 0}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center font-mono text-zinc-300 whitespace-nowrap">
                          {player.displayAssists || 0}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-sm text-white whitespace-nowrap">
                          {Number(player.displayRating || 0).toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>


        {/* ========================================================
            SECTION 4: MATCHES
           ======================================================== */}
        <section id="matches-section" className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
            O'yinlar Tarixi ({matches.length})
          </h2>

          {matches.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#0c101d] border border-white/10 text-center space-y-1">
              <p className="text-xs text-zinc-300 font-semibold">
                Hozircha o'yinlar tarixi mavjud emas.
              </p>
              <p className="text-[11px] text-zinc-500 font-mono">
                Admin panelidan "O'yin Qayd Etish" orqali yangi o'yin natijalarini kiritishingiz mumkin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  className="p-3.5 rounded-xl bg-[#0c101d] hover:bg-white/[0.02] border border-white/10 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="text-[9px] font-mono text-zinc-500 uppercase">
                      {new Date(m.date).toLocaleDateString('uz-UZ')}
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {m.homeTeam} vs {m.awayTeam}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded bg-white/10 border border-white/15 font-mono font-bold text-sm text-white">
                    {m.homeScore} : {m.awayScore}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer (Desktop & Mobile) */}
      <footer className="mt-16 border-t border-white/[0.08] py-8 text-center text-xs text-zinc-400 font-mono">
        Created by Arslan
      </footer>

      {/* Modals */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onEdit={isAdmin ? handleOpenEditPlayer : null}
          isAdmin={isAdmin}
        />
      )}

      {isPlayerEditOpen && (
        <PlayerEditModal
          player={playerToEdit}
          onSave={handleSavePlayer}
          onClose={() => setIsPlayerEditOpen(false)}
        />
      )}

      {activeSlotKey && (
        <SlotActionModal
          slotKey={activeSlotKey}
          slotConfig={pitchFormation.find((s) => s.key === activeSlotKey)}
          currentPlayer={squad[activeSlotKey]}
          allPlayers={pitchSquadPlayers}
          slots={slots}
          onAssignPlayer={handleAssignPlayerToSlot}
          onRemovePlayer={handleRemovePlayerFromSlot}
          onOpenPlayerDetails={(p) => setSelectedPlayer(p)}
          onClose={() => setActiveSlotKey(null)}
          isAdmin={isAdmin}
        />
      )}

      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onDeleteMatch={isAdmin ? handleDeleteMatch : null}
          isAdmin={isAdmin}
        />
      )}

      {/* Custom Confirm Modal (replaces browser confirm) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

    </div>
  );
}
