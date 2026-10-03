'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmModal from '../../components/ConfirmModal';
import AttendanceSection from '../../components/AttendanceSection';
import { getSupabaseData } from '../../lib/supabase';
import {
  getStoredPlayers,
  saveStoredPlayers,
  getStoredSlots,
  saveStoredSlots,
  getStoredMatches,
  saveStoredMatches,
  deleteStoredMatch,
  getStoredAttendance,
  saveStoredAttendance,
  saveStoredBatch,
  generateScheduleWeeks,
  getAdminAuth,
  setAdminAuth,
  calculatePlayerRating,
  swapPlayerPositions,
  resetAllData,
  compressImageFile,
  sanitizePlayers,
  safeLocalStorageSet,
  computeMatchStats,
  addNotification,
  getStoredSessions,
  recordCurrentSession,
  STORAGE_PLAYERS_KEY,
  STORAGE_SLOTS_KEY,
  STORAGE_MATCHES_KEY,
  STORAGE_ATTENDANCE_KEY,
} from '../../lib/data';

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

export default function AdminPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('match'); // 'match', 'history', 'attendance', 'players', 'swap'
  const [players, setPlayers] = useState([]);
  const [slots, setSlots] = useState({});
  const [matches, setMatches] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [sessions, setSessions] = useState([]);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  // Attendance tab state (2026-2027 Schedule)
  const scheduleWeeks = generateScheduleWeeks();
  const [attendanceWeekIdx, setAttendanceWeekIdx] = useState(0);
  const [attendanceSessionIdx, setAttendanceSessionIdx] = useState(0);

  // Custom Confirm Modal State (replaces all window.confirm)
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

  // Quick Swap State
  const [swapPlayerA, setSwapPlayerA] = useState('');
  const [swapPlayerB, setSwapPlayerB] = useState('');

  // Player Edit/Add Modal State
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerForm, setPlayerForm] = useState({
    name: '',
    displayName: '',
    number: '',
    position: 'ST',
    team: 'Real',
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    avatar: '/avatars/asliddin.jpg',
    isCaptain: false,
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  });

  // Match Form State
  const [matchForm, setMatchForm] = useState({
    homeTeam: 'Real',
    awayTeam: 'Liverpool',
    homeScore: 0,
    awayScore: 0,
    date: new Date().toISOString().slice(0, 16),
  });
  const [matchPlayerStats, setMatchPlayerStats] = useState([]);

  // Check Persistent Auth & Live Data Sync
  const syncFromRemote = async () => {
    // 1. Direct Supabase Query (Instant, no proxy / auth interference)
    try {
      const supa = await getSupabaseData();
      if (supa) {
        // ALWAYS trust Supabase data completely
        if (Array.isArray(supa.players) && supa.players.length > 0) {
          const cleanPlayers = sanitizePlayers(supa.players);
          setPlayers(cleanPlayers);
          safeLocalStorageSet(STORAGE_PLAYERS_KEY, cleanPlayers);
        }
        if (Array.isArray(supa.matches)) {
          setMatches(supa.matches);
          safeLocalStorageSet(STORAGE_MATCHES_KEY, supa.matches);
        }
        if (supa.attendance && typeof supa.attendance === 'object') {
          setAttendance(supa.attendance);
          safeLocalStorageSet(STORAGE_ATTENDANCE_KEY, supa.attendance);
        }
        if (supa.slots && typeof supa.slots === 'object' && Object.keys(supa.slots).length > 0) {
          setSlots(supa.slots);
          safeLocalStorageSet(STORAGE_SLOTS_KEY, supa.slots);
        }
        return; // success
      }
    } catch (e) {
      console.warn('[Admin Sync] Supabase error:', e?.message || e);
    }

    // 2. Fallback to /api/data
    try {
      const res = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json();
      if (d && !d.error) {
        if (Array.isArray(d.players) && d.players.length > 0) {
          const cleanPlayers = sanitizePlayers(d.players);
          setPlayers(cleanPlayers);
          safeLocalStorageSet(STORAGE_PLAYERS_KEY, cleanPlayers);
        }
        if (Array.isArray(d.matches)) {
          setMatches(d.matches);
          safeLocalStorageSet(STORAGE_MATCHES_KEY, d.matches);
        }
        if (d.attendance && typeof d.attendance === 'object') {
          setAttendance(d.attendance);
          safeLocalStorageSet(STORAGE_ATTENDANCE_KEY, d.attendance);
        }
        if (d.slots && typeof d.slots === 'object' && Object.keys(d.slots).length > 0) {
          setSlots(d.slots);
          safeLocalStorageSet(STORAGE_SLOTS_KEY, d.slots);
        }
      }
    } catch (e) {
      console.warn('[Admin Sync] API fallback error:', e?.message || e);
    }
  };

  useEffect(() => {
    const isAuth = getAdminAuth();
    if (!isAuth) {
      router.replace('/login');
      return;
    }
    setIsAuthorized(true);
    setIsCheckingAuth(false);

    // Clean up old v25 corrupted keys to free up space
    try {
      localStorage.removeItem('clasico_squad_v25');
      localStorage.removeItem('clasico_slots_v25');
      localStorage.removeItem('clasico_matches_v25');
      localStorage.removeItem('clasico_attendance_v25');
    } catch (e) {}

    // Load clean initial state from local, then sync fresh from Supabase
    setPlayers(getStoredPlayers());
    setSlots(getStoredSlots());
    setMatches(getStoredMatches());
    setAttendance(getStoredAttendance());
    setSessions(getStoredSessions());
    recordCurrentSession('arslan');

    syncFromRemote();

    // Re-sync on focus/visibility without polling flicker
    const handleFocus = () => syncFromRemote();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [router]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogout = () => {
    openConfirm({
      title: "Chiqishni tasdiqlang",
      message: "Admin boshqaruv panelidan chiqmoqchimisiz?",
      confirmText: "Ha, chiqish",
      cancelText: "Yo'q",
      isDestructive: true,
      onConfirm: () => {
        setAdminAuth(false);
        window.location.href = '/login';
      }
    });
  };

  const handleResetData = () => {
    openConfirm({
      title: "Tarkibni Qayta Tiklash",
      message: "DIQQAT: Barcha o'yinchilarning asl tarkibi va yangi pozitsiyalari tiklansinmi? Barcha ko'rsatkichlar 0 ga qaytadi.",
      confirmText: "Ha, tiklash",
      cancelText: "Yo'q",
      isDestructive: true,
      onConfirm: () => {
        resetAllData();
        setPlayers(getStoredPlayers());
        setSlots(getStoredSlots());
        setMatches(getStoredMatches());
        setAttendance(getStoredAttendance());
        showToast("Tizim boshlang'ich holatga qaytarildi.");
      }
    });
  };

  // Upload file from phone or PC with client-side compression (max 240px)
  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      showToast("Foto yuklanmoqda...");
      const compressedUrl = await compressImageFile(file, 240, 0.8);
      if (compressedUrl) {
        setPlayerForm(prev => ({ ...prev, avatar: compressedUrl }));
        showToast("Foto muvaffaqiyatli yuklandi! ✓");
      }
    } catch (err) {
      showToast("Foto yuklashda xatolik yuz berdi.");
    }
  };

  // ----------------------------------------------------
  // SWAP POSITIONS ENGINE
  // ----------------------------------------------------
  const handleExecuteSwap = () => {
    if (!swapPlayerA || !swapPlayerB) {
      showToast("Iltimos, almashtirish uchun ikkita o'yinchini tanlang.");
      return;
    }
    if (swapPlayerA === swapPlayerB) {
      showToast("Bitta o'yinchini o'zi bilan almashtirib bo'lmaydi.");
      return;
    }

    const updatedPlayers = swapPlayerPositions(players, swapPlayerA, swapPlayerB);
    setPlayers(updatedPlayers);
    saveStoredPlayers(updatedPlayers);

    // Also swap in slots
    const newSlots = { ...slots };
    let slotAKey = null;
    let slotBKey = null;
    Object.keys(newSlots).forEach(k => {
      if (newSlots[k] === swapPlayerA) slotAKey = k;
      if (newSlots[k] === swapPlayerB) slotBKey = k;
    });

    if (slotAKey && slotBKey) {
      newSlots[slotAKey] = swapPlayerB;
      newSlots[slotBKey] = swapPlayerA;
    } else if (slotAKey) {
      newSlots[slotAKey] = swapPlayerB;
    } else if (slotBKey) {
      newSlots[slotBKey] = swapPlayerA;
    }
    setSlots(newSlots);
    saveStoredSlots(newSlots);

    const pA = players.find(p => p.id === swapPlayerA);
    const pB = players.find(p => p.id === swapPlayerB);
    showToast(`${pA?.name || 'O\'yinchi'} va ${pB?.name || 'O\'yinchi'} joylari muvaffaqiyatli almashtirildi!`);
    setSwapPlayerA('');
    setSwapPlayerB('');
  };

  // Direct table field update
  const updatePlayerField = (id, field, value) => {
    const updated = players.map(p => {
      if (p.id !== id) return p;
      const updatedPlayer = { ...p, [field]: value };
      if (field === 'goals' || field === 'assists' || field === 'saves' || field === 'conceded') {
        const g = field === 'goals' ? parseInt(value, 10) || 0 : (p.goals || 0);
        const a = field === 'assists' ? parseFloat(value) || 0 : (p.assists || 0);
        const s = field === 'saves' ? parseInt(value, 10) || 0 : (p.saves || 0);
        const c = field === 'conceded' ? parseInt(value, 10) || 0 : (p.conceded || 0);
        updatedPlayer.rating = calculatePlayerRating(g, a, s, c);
      }
      return updatedPlayer;
    });
    setPlayers(updated);
    saveStoredPlayers(updated);
  };

  // ----------------------------------------------------
  // PLAYER MODAL
  // ----------------------------------------------------
  const openAddPlayer = () => {
    setEditingPlayer(null);
    setPlayerForm({
      name: '',
      displayName: '',
      number: '',
      position: 'ST',
      team: 'Real',
      goals: 0,
      assists: 0,
      saves: 0,
      conceded: 0,
      avatar: '/avatars/asliddin.jpg',
      isCaptain: false,
      stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
    });
    setIsPlayerModalOpen(true);
  };

  const openEditPlayer = (p) => {
    setEditingPlayer(p);
    setPlayerForm({
      name: p.name,
      displayName: p.displayName || p.name,
      number: p.number,
      position: p.position,
      team: p.team || 'Real',
      goals: p.goals || 0,
      assists: p.assists || 0,
      saves: p.saves || 0,
      conceded: p.conceded || 0,
      avatar: p.avatar || '/avatars/asliddin.jpg',
      isCaptain: Boolean(p.isCaptain),
      stats: {
        pac: p.stats?.pac ?? 0,
        sho: p.stats?.sho ?? 0,
        pas: p.stats?.pas ?? 0,
        dri: p.stats?.dri ?? 0,
        def: p.stats?.def ?? 0,
        phy: p.stats?.phy ?? 0,
      }
    });
    setIsPlayerModalOpen(true);
  };

  const updateModalStat = (statKey, val) => {
    const num = Math.min(99, Math.max(0, parseInt(val, 10) || 0));
    setPlayerForm(prev => ({
      ...prev,
      stats: { ...prev.stats, [statKey]: num }
    }));
  };

  const handleSavePlayer = (e) => {
    e.preventDefault();
    if (!playerForm.name.trim() || !playerForm.number) {
      showToast("Ism va raqam kiritilishi shart!");
      return;
    }

    const g = parseInt(playerForm.goals, 10) || 0;
    const a = parseFloat(playerForm.assists) || 0;
    const s = parseInt(playerForm.saves, 10) || 0;
    const c = parseInt(playerForm.conceded, 10) || 0;
    const rating = calculatePlayerRating(g, a, s, c);

    let updated;
    if (editingPlayer) {
      updated = players.map(p => {
        if (p.id === editingPlayer.id) {
          return {
            ...p,
            name: playerForm.name.trim(),
            displayName: playerForm.name.trim(),
            fullName: playerForm.name.trim(),
            number: parseInt(playerForm.number, 10),
            position: playerForm.position,
            team: playerForm.team,
            goals: g,
            assists: a,
            saves: s,
            conceded: c,
            rating,
            avatar: playerForm.avatar || p.avatar,
            isCaptain: playerForm.isCaptain,
            stats: playerForm.stats,
          };
        }
        // If this player is captain, remove captain from teammates
        if (playerForm.isCaptain && p.team === playerForm.team) {
          return { ...p, isCaptain: false };
        }
        return p;
      });
      showToast("O'yinchi ma'lumotlari yangilandi!");
    } else {
      const newPlayer = {
        id: 'p_' + Date.now(),
        name: playerForm.name.trim(),
        displayName: playerForm.name.trim(),
        fullName: playerForm.name.trim(),
        number: parseInt(playerForm.number, 10),
        position: playerForm.position,
        team: playerForm.team,
        goals: g,
        assists: a,
        saves: s,
        conceded: c,
        rating,
        fouls: 0,
        handballs: 0,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        avatar: playerForm.avatar,
        stats: playerForm.stats,
        isCaptain: playerForm.isCaptain,
      };
      let list = [...players, newPlayer];
      if (playerForm.isCaptain) {
        list = list.map(p => {
          if (p.id !== newPlayer.id && p.team === playerForm.team) {
            return { ...p, isCaptain: false };
          }
          return p;
        });
      }
      updated = list;
      showToast("Yangi o'yinchi qo'shildi!");
    }

    setPlayers(updated);
    saveStoredPlayers(updated);
    setIsPlayerModalOpen(false);
  };

  // 1-Click Captaincy Toggle for Admin Table
  const handleToggleCaptain = (playerId, team) => {
    const updated = players.map(p => {
      if (p.team === team) {
        return { ...p, isCaptain: p.id === playerId };
      }
      return p;
    });
    setPlayers(updated);
    saveStoredPlayers(updated);
    const targetPlayer = updated.find(p => p.id === playerId);
    showToast(`👑 ${targetPlayer?.name} (${team === 'Real' ? 'Real Madrid' : 'Liverpool FC'}) jamoasi sardori etib tayinlandi!`);
  };

  const handleDeletePlayer = (id, name) => {
    openConfirm({
      title: "O'yinchini O'chirish",
      message: `"${name}" o'yinchisini ro'yxatdan butunlay o'chirib tashlamoqchimisiz?`,
      confirmText: "Ha, o'chirish",
      cancelText: "Yo'q",
      isDestructive: true,
      onConfirm: () => {
        const updated = players.filter(p => p.id !== id);
        setPlayers(updated);
        saveStoredPlayers(updated);

        const newSlots = { ...slots };
        Object.keys(newSlots).forEach(k => {
          if (newSlots[k] === id) newSlots[k] = null;
        });
        setSlots(newSlots);
        saveStoredSlots(newSlots);
        showToast("O'yinchi o'chirildi.");
      }
    });
  };

  // ----------------------------------------------------
  // MATCH CREATION & RATING LOG (WITH GOALS, ASSISTS, SAVES, CONCEDED)
  // ----------------------------------------------------
  const addMatchStatRow = () => {
    if (players.length === 0) return;
    const firstP = players[0];
    const isGk = firstP.position === 'GK';
    setMatchPlayerStats([
      ...matchPlayerStats,
      { playerId: firstP.id, goals: 0, assists: 0, saves: 0, conceded: 0, isGk }
    ]);
  };

  const updateMatchStat = (idx, field, val) => {
    const list = [...matchPlayerStats];
    list[idx][field] = val;
    if (field === 'playerId') {
      const p = players.find(x => x.id === val);
      list[idx].isGk = p?.position === 'GK';
    }
    setMatchPlayerStats(list);
  };

  const removeMatchStat = (idx) => {
    setMatchPlayerStats(matchPlayerStats.filter((_, i) => i !== idx));
  };

  const submitMatch = (e) => {
    e.preventDefault();
    const homeScore = parseInt(matchForm.homeScore, 10) || 0;
    const awayScore = parseInt(matchForm.awayScore, 10) || 0;

    const currentPlayers = [...players];
    const matchDetails = [];

    matchPlayerStats.forEach(stat => {
      const pIdx = currentPlayers.findIndex(p => p.id === stat.playerId);
      if (pIdx === -1) return;

      const p = currentPlayers[pIdx];
      const g = parseInt(stat.goals, 10) || 0;
      const a = parseFloat(stat.assists) || 0;
      const s = parseInt(stat.saves, 10) || 0;
      const c = parseInt(stat.conceded, 10) || 0;

      const newGoals = (p.goals || 0) + g;
      const newAssists = (p.assists || 0) + a;
      const newSaves = (p.saves || 0) + s;
      const newConceded = (p.conceded || 0) + c;
      const newRating = calculatePlayerRating(newGoals, newAssists, newSaves, newConceded);

      p.goals = newGoals;
      p.assists = newAssists;
      p.saves = newSaves;
      p.conceded = newConceded;
      p.rating = newRating;
      p.matchesPlayed = (p.matchesPlayed || 0) + 1;

      matchDetails.push({
        playerId: p.id,
        name: p.name,
        team: p.team,
        isGk: p.position === 'GK',
        goalsInMatch: g,
        assistsInMatch: a,
        savesInMatch: s,
        concededInMatch: c,
        newRating,
      });
    });

    const newMatchRecord = {
      id: 'm_' + Date.now(),
      homeTeam: matchForm.homeTeam,
      awayTeam: matchForm.awayTeam,
      homeScore,
      awayScore,
      date: matchForm.date,
      details: matchDetails,
      stats: computeMatchStats({ homeScore, awayScore, details: matchDetails }),
    };

    const updatedMatches = [newMatchRecord, ...matches];
    setMatches(updatedMatches);
    setPlayers(currentPlayers);
    saveStoredBatch({
      matches: updatedMatches,
      players: currentPlayers,
    });

    addNotification(
      '⚡️ Yangi O\'yin Qayd Etildi',
      `${matchForm.homeTeam} ${homeScore} - ${awayScore} ${matchForm.awayTeam} hisobida yakunlandi va Sofascore statistikasi shakllantirildi.`,
      'match'
    );

    setMatchPlayerStats([]);
    showToast("Uchrashuv muvaffaqiyatli saqlandi va o'yinchilar reytingi yangilandi!");
    setActiveTab('history');
  };

  // ----------------------------------------------------
  // DELETE MATCH FROM HISTORY
  // ----------------------------------------------------
  const handleDeleteMatch = (matchId) => {
    openConfirm({
      title: "O'yinni O'chirish",
      message: "Ushbu o'yinni tarixdan o'chirib tashlamoqchimisiz?",
      confirmText: "Ha, o'chirish",
      cancelText: "Yo'q",
      isDestructive: true,
      onConfirm: () => {
        const updated = deleteStoredMatch(matchId);
        setMatches(updated);
        showToast("O'yin tarixdan o'chirildi.");
      }
    });
  };

  const handleClearAllMatches = () => {
    openConfirm({
      title: "Barcha O'yinlarni Tozalash",
      message: "Barcha o'yinlar tarixini butunlay tozalab tashlamoqchimisiz?",
      confirmText: "Ha, tozalash",
      cancelText: "Yo'q",
      isDestructive: true,
      onConfirm: () => {
        saveStoredMatches([]);
        setMatches([]);
        showToast("Barcha o'yinlar tarixi tozalandi.");
      }
    });
  };

  // ----------------------------------------------------
  // DAVOMAT (ATTENDANCE) MANAGEMENT HANDLERS
  // ----------------------------------------------------
  const handleToggleAttendance = (date, playerId, currentPresent) => {
    const dayRecords = { ...(attendance[date] || {}) };
    const playerRec = dayRecords[playerId] || { present: false, playedForTeam: null };
    dayRecords[playerId] = {
      ...playerRec,
      present: !currentPresent,
    };
    const updated = {
      ...attendance,
      [date]: dayRecords,
    };
    setAttendance(updated);
    saveStoredAttendance(updated);
  };

  const handleChangeAttendanceTeam = (date, playerId, team) => {
    const dayRecords = { ...(attendance[date] || {}) };
    const playerRec = dayRecords[playerId] || { present: true, playedForTeam: null };
    dayRecords[playerId] = {
      ...playerRec,
      playedForTeam: team === 'ORIGINAL' ? null : team,
    };
    const updated = {
      ...attendance,
      [date]: dayRecords,
    };
    setAttendance(updated);
    saveStoredAttendance(updated);
    showToast("Futbolchining o'yin jamoasi yangilandi!");
  };

  const handleMarkAllPresent = (date) => {
    const dayRecords = { ...(attendance[date] || {}) };
    players.forEach(p => {
      dayRecords[p.id] = {
        ...(dayRecords[p.id] || {}),
        present: true,
      };
    });
    const updated = {
      ...attendance,
      [date]: dayRecords,
    };
    setAttendance(updated);
    saveStoredAttendance(updated);
    showToast("Barcha futbolchilar 'Keldi' deb belgilandi!");
  };

  const handleSaveAttendance = () => {
    saveStoredAttendance(attendance);
    showToast("Davomat ma'lumotlari xotiraga saqlandi! ✓");
  };

  const filteredPlayers = players.filter(p => {
    if (selectedTeamFilter === 'ALL') return true;
    return p.team === selectedTeamFilter;
  });

  if (isCheckingAuth || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07090f] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest font-mono text-zinc-500">Tekshirilmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090f] text-zinc-100 selection:bg-amber-400 selection:text-black pb-12">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 border border-amber-400 text-white text-xs font-semibold shadow-2xl animate-fade-in flex items-center gap-2">
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Admin Top Header - Ultra-responsive */}
      <header className="sticky top-0 z-40 bg-[#0c101d]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-8 py-2.5 sm:py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Top Row on Mobile: Title, Status, and Mobile Chiqish */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div>
                <div className="text-xs sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-1.5 leading-tight">
                  <span>Boshqaruv Paneli</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">
                    ADMIN
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  Real Madrid vs Liverpool FC
                </div>
              </div>
            </div>

            {/* Chiqish button visible on mobile right side */}
            <button
              onClick={handleLogout}
              className="sm:hidden px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white text-xs font-bold transition"
            >
              Chiqish
            </button>
          </div>

          {/* Action Buttons: Clean full-width row on mobile, compact side on desktop */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/"
              className="flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 hover:bg-white/20 text-zinc-200 text-xs font-bold transition whitespace-nowrap"
            >
              <span className="hidden sm:inline">← Asosiy Portal</span>
              <span className="sm:hidden">← Portal</span>
            </Link>
            <button
              onClick={handleResetData}
              className="flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black text-xs font-bold transition whitespace-nowrap"
            >
              <span className="hidden sm:inline">Tarkibni Tiklash</span>
              <span className="sm:hidden">Tiklash</span>
            </button>
            <button
              onClick={handleLogout}
              className="hidden sm:inline-block px-3.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white text-xs font-bold transition whitespace-nowrap"
            >
              Chiqish
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-8 py-5 space-y-6">

        {/* Tab Buttons - Horizontal scrollable on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-xl bg-[#0c101d] border border-white/10 text-xs font-bold uppercase tracking-wider overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('match')}
            className={`px-3.5 sm:px-4 py-2 rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'match'
                ? 'bg-amber-400 text-black font-extrabold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            O'yin Qayd Etish
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 sm:px-4 py-2 rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'bg-amber-400 text-black font-extrabold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            O'yinlar Tarixi ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 sm:px-4 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'attendance'
                ? 'bg-emerald-500 text-black font-black shadow-md'
                : 'text-emerald-400 hover:text-white'
            }`}
          >
            <span>📋</span> Davomat (2026-2027)
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-3.5 sm:px-4 py-2 rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'players'
                ? 'bg-amber-400 text-black font-extrabold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            O'yinchilar ({players.length})
          </button>
          <button
            onClick={() => setActiveTab('swap')}
            className={`px-3.5 sm:px-4 py-2 rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'swap'
                ? 'bg-amber-400 text-black font-extrabold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Joy Almashtirish
          </button>
          <button
            onClick={() => {
              setSessions(getStoredSessions());
              setActiveTab('devices');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'devices'
                ? 'bg-cyan-500 text-black font-extrabold shadow-md'
                : 'text-cyan-400 hover:text-white'
            }`}
          >
            <span>📱</span> Qurilmalar & Xavfsizlik
          </button>
        </div>

        {/* ========================================================
            TAB 1: MATCH CREATOR WITH GOALS, ASSISTS, SAVES & CONCEDED
           ======================================================== */}
        {activeTab === 'match' && (
          <div className="max-w-3xl mx-auto">
            <form onSubmit={submitMatch} className="p-6 rounded-2xl bg-[#0c101d] border border-white/10 space-y-6 shadow-xl">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white">
                  O'yin Qayd Etish & Reyting Hisoboti
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Hisobni kiriting, futbolchilarning gol (+2), assist (+1.5), darvozabonning seyvlari (+0.5) va o'tkazgan gollarini (-0.5) belgilang.
                </p>
              </div>

              {/* Scoreboard Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-black/40 border border-white/10">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Mezbon</label>
                  <select
                    value={matchForm.homeTeam}
                    onChange={(e) => setMatchForm({ ...matchForm, homeTeam: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090f] border border-white/10 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="Real">Real Madrid</option>
                    <option value="Liverpool">Liverpool FC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Gollar (Hisob)</label>
                  <input
                    type="number"
                    min="0"
                    value={matchForm.homeScore}
                    onChange={(e) => setMatchForm({ ...matchForm, homeScore: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090f] border border-white/10 text-sm font-mono font-bold text-center text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Mehmon</label>
                  <select
                    value={matchForm.awayTeam}
                    onChange={(e) => setMatchForm({ ...matchForm, awayTeam: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090f] border border-white/10 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="Liverpool">Liverpool FC</option>
                    <option value="Real">Real Madrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Gollar (Hisob)</label>
                  <input
                    type="number"
                    min="0"
                    value={matchForm.awayScore}
                    onChange={(e) => setMatchForm({ ...matchForm, awayScore: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090f] border border-white/10 text-sm font-mono font-bold text-center text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Player Stats in Match */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white block">
                      Futbolchilar Ko'rsatkichlari
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Maydon o'yinchisi: Gol (+2), Asist (+1.5) | Darvozabon: Seyv (+0.5), O'tkazilgan (-0.5)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addMatchStatRow}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition"
                  >
                    + Qator Qo'shish
                  </button>
                </div>

                {matchPlayerStats.length === 0 ? (
                  <div className="p-4 rounded-xl bg-black/20 border border-dashed border-white/10 text-center text-xs text-zinc-400">
                    Hozircha o'yinchi qo'shilmadi. Yuqoridagi "+ Qator Qo'shish" tugmasini bosing.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {matchPlayerStats.map((row, idx) => {
                      const selectedP = players.find(p => p.id === row.playerId);
                      const isGk = selectedP?.position === 'GK';

                      return (
                        <div key={idx} className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={row.playerId}
                              onChange={(e) => updateMatchStat(idx, 'playerId', e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-[#07090f] border border-white/10 text-xs font-bold text-white focus:outline-none"
                            >
                              {players.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (#{p.number} - {p.position}) [{p.team}]
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => removeMatchStat(idx)}
                              className="px-2 py-1 text-zinc-400 hover:text-red-400 text-xs"
                            >
                              ✕ O'chirish
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Gol (+2)</label>
                              <input
                                type="number"
                                min="0"
                                value={row.goals}
                                onChange={(e) => updateMatchStat(idx, 'goals', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-[#07090f] border border-white/10 text-xs font-mono font-bold text-center text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Asist (+1.5)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={row.assists}
                                onChange={(e) => updateMatchStat(idx, 'assists', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-[#07090f] border border-white/10 text-xs font-mono font-bold text-center text-amber-300"
                              />
                            </div>

                            {/* GOALKEEPER FIELDS: SAVES & CONCEDED */}
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-0.5">
                                Seyv (+0.5)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={row.saves || 0}
                                onChange={(e) => updateMatchStat(idx, 'saves', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-[#07090f] border border-white/10 text-xs font-mono font-bold text-center text-emerald-300"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-bold text-red-400 mb-0.5">
                                O'tkazilgan (-0.5)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={row.conceded || 0}
                                onChange={(e) => updateMatchStat(idx, 'conceded', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-[#07090f] border border-white/10 text-xs font-mono font-bold text-center text-red-300"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:bg-amber-300 transition"
              >
                O'yin Natijasini Saqlash & Reytinglarni Yangilash
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            TAB 2: MATCH HISTORY WITH DELETE CAPABILITY
           ======================================================== */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white">
                  O'yinlar Tarixi ({matches.length})
                </h2>
                <p className="text-xs text-zinc-400">
                  Istalgan o'yinni tarixdan o'chirib tashlashingiz mumkin
                </p>
              </div>

              {matches.length > 0 && (
                <button
                  onClick={handleClearAllMatches}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition"
                >
                  Barcha Tarixni Tozalash
                </button>
              )}
            </div>

            {matches.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0c101d] border border-white/10 text-center space-y-2">
                <p className="text-xs text-zinc-400">Hozircha o'yinlar mavjud emas.</p>
                <button
                  onClick={() => setActiveTab('match')}
                  className="px-4 py-2 rounded-lg bg-amber-400 text-black text-xs font-bold uppercase"
                >
                  Yangi O'yin Qo'shish
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-[#0c101d] border border-white/10 space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase text-zinc-400">
                        {new Date(m.date).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleDeleteMatch(m.id)}
                        className="px-2.5 py-1 rounded bg-red-500/15 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-300 text-xs font-bold transition"
                      >
                        O'chirish ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-base font-extrabold text-white">
                      <span>{m.homeTeam}</span>
                      <span className="px-3 py-1 rounded-lg bg-white/10 font-mono text-lg">
                        {m.homeScore} : {m.awayScore}
                      </span>
                      <span>{m.awayTeam}</span>
                    </div>

                    {/* Performance Breakdown */}
                    {m.details && m.details.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.06] text-xs text-zinc-300 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-zinc-500">O'yin qahramonlari:</div>
                        <div className="flex flex-wrap gap-2">
                          {m.details.map((d, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[11px]">
                              <strong>{d.name}</strong>: {d.goalsInMatch > 0 ? `${d.goalsInMatch} gol ` : ''}{d.assistsInMatch > 0 ? `${d.assistsInMatch} asist ` : ''}{d.savesInMatch > 0 ? `${d.savesInMatch} seyv ` : ''}{d.concededInMatch > 0 ? `${d.concededInMatch} o'tkazdi ` : ''}(→ {d.newRating} RTG)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2.5: DAVOMAT MATRITSASI (SESHANBA VA PAYSHANBA, 2026-2027)
           ======================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <AttendanceSection
              attendance={attendance}
              players={players}
              isAdmin={true}
              onAttendanceSaved={(newAtt) => {
                setAttendance(newAtt);
                addNotification(
                  '📅 Davomat Yangilandi',
                  'Mavsumiy davomat ma\'lumotlariga o\'zgarishlar kiritildi va muvaffaqiyatli saqlandi.',
                  'attendance'
                );
                showToast("Davomat muvaffaqiyatli saqlandi!");
              }}
            />
          </div>
        )}

        {/* ========================================================
            TAB 3: PLAYERS & POSITIONS
           ======================================================== */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0c101d] border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-bold uppercase">Jamoa:</span>
                <div className="inline-flex rounded-lg bg-black/60 p-1 border border-white/10 text-xs font-bold">
                  <button
                    onClick={() => setSelectedTeamFilter('ALL')}
                    className={`px-3 py-1 rounded ${selectedTeamFilter === 'ALL' ? 'bg-white text-black' : 'text-zinc-400'}`}
                  >
                    Barchasi ({players.length})
                  </button>
                  <button
                    onClick={() => setSelectedTeamFilter('Real')}
                    className={`px-3 py-1 rounded ${selectedTeamFilter === 'Real' ? 'bg-amber-400 text-black' : 'text-zinc-400'}`}
                  >
                    Real ({players.filter(p => p.team === 'Real').length})
                  </button>
                  <button
                    onClick={() => setSelectedTeamFilter('Liverpool')}
                    className={`px-3 py-1 rounded ${selectedTeamFilter === 'Liverpool' ? 'bg-red-600 text-white' : 'text-zinc-400'}`}
                  >
                    Liverpool ({players.filter(p => p.team === 'Liverpool').length})
                  </button>
                </div>
              </div>

              <button
                onClick={openAddPlayer}
                className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition"
              >
                + Yangi O'yinchi
              </button>
            </div>

            {/* Players Table */}
            <div className="rounded-xl bg-[#0c101d] border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 border-b border-white/10 text-zinc-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">O'yinchi</th>
                      <th className="py-3 px-3">Jamoa</th>
                      <th className="py-3 px-3 text-center">Raqam</th>
                      <th className="py-3 px-3">Pozitsiya</th>
                      <th className="py-3 px-3 text-center">Gollar (+2)</th>
                      <th className="py-3 px-3 text-center">Asistlar (+1.5)</th>
                      <th className="py-3 px-3 text-center">Seyv (+0.5)</th>
                      <th className="py-3 px-3 text-center font-bold text-white">Reyting</th>
                      <th className="py-3 px-4 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredPlayers.map((player) => (
                      <tr key={player.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-white/15 shrink-0">
                              <img
                                src={player.avatar || "/avatars/asliddin.jpg"}
                                alt={player.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = "/avatars/asliddin.jpg"; }}
                              />
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {player.name}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleCaptain(player.id, player.team)}
                                title="Jamoa sardori etib belgilash"
                                className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono transition cursor-pointer ${
                                  player.isCaptain
                                    ? 'bg-amber-400 text-black font-black shadow-md'
                                    : 'bg-white/5 hover:bg-amber-400/20 text-zinc-400 hover:text-amber-300 border border-white/10'
                                }`}
                              >
                                <span>👑</span>
                                <span>{player.isCaptain ? 'Sardor' : 'Sardor qilish'}</span>
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={player.team || 'Real'}
                            onChange={(e) => updatePlayerField(player.id, 'team', e.target.value)}
                            className="px-2 py-1 rounded bg-[#07090f] border border-white/10 text-xs font-bold text-white focus:outline-none"
                          >
                            <option value="Real">Real Madrid</option>
                            <option value="Liverpool">Liverpool FC</option>
                          </select>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            value={player.number}
                            onChange={(e) => updatePlayerField(player.id, 'number', parseInt(e.target.value, 10) || 0)}
                            className="w-12 px-1 py-1 rounded bg-[#07090f] border border-white/10 text-xs text-center font-mono font-bold text-white focus:outline-none"
                          />
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={player.position}
                            onChange={(e) => updatePlayerField(player.id, 'position', e.target.value)}
                            className="px-2 py-1 rounded bg-[#07090f] border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none"
                          >
                            <option value="GK">GK - Darvozabon</option>
                            <option value="CB">CB - Markaziy Himoya</option>
                            <option value="LB">LB - Chap Himoya</option>
                            <option value="RB">RB - O'ng Himoya</option>
                            <option value="CM">CM - Markaziy Yarim</option>
                            <option value="CDM">CDM - Tayanch Yarim</option>
                            <option value="CAM">CAM - Hujumkor Yarim</option>
                            <option value="LW">LW - Chap Hujum</option>
                            <option value="RW">RW - O'ng Hujum</option>
                            <option value="ST">ST - Markaziy Hujum</option>
                          </select>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={player.goals || 0}
                            onChange={(e) => updatePlayerField(player.id, 'goals', e.target.value)}
                            className="w-12 px-1 py-1 rounded bg-[#07090f] border border-white/10 text-xs text-center font-mono font-bold text-white focus:outline-none"
                          />
                        </td>

                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={player.assists || 0}
                            onChange={(e) => updatePlayerField(player.id, 'assists', e.target.value)}
                            className="w-12 px-1 py-1 rounded bg-[#07090f] border border-white/10 text-xs text-center font-mono font-bold text-amber-300 focus:outline-none"
                          />
                        </td>

                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={player.saves || 0}
                            onChange={(e) => updatePlayerField(player.id, 'saves', e.target.value)}
                            className="w-12 px-1 py-1 rounded bg-[#07090f] border border-white/10 text-xs text-center font-mono font-bold text-emerald-300 focus:outline-none"
                          />
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-white/[0.08] font-mono font-bold text-xs text-white">
                            {Number(player.rating || 0).toFixed(1)}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditPlayer(player)}
                              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-semibold"
                            >
                              Tahrirlash
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(player.id, player.name)}
                              className="px-2 py-1 rounded bg-red-500/15 text-red-300 hover:bg-red-500 hover:text-white text-xs font-semibold"
                            >
                              O'chirish
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: QUICK SWAP
           ======================================================== */}
        {activeTab === 'swap' && (
          <div className="p-6 rounded-2xl bg-[#0c101d] border border-white/10 max-w-2xl mx-auto space-y-6 shadow-xl">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                O'rin va Pozitsiyalarni Almashtirish
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Ikkita o'yinchini tanlang va bir zumda ularning pozitsiyasi, maydondagi joyi va raqamlarini almashtiring.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <label className="block text-[11px] font-bold uppercase text-zinc-400">1-O'yinchi</label>
                <select
                  value={swapPlayerA}
                  onChange={(e) => setSwapPlayerA(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07090f] border border-white/10 text-sm font-bold text-white focus:outline-none"
                >
                  <option value="">Tanlang...</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (#{p.number} - {p.position}) [{p.team}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <label className="block text-[11px] font-bold uppercase text-zinc-400">2-O'yinchi</label>
                <select
                  value={swapPlayerB}
                  onChange={(e) => setSwapPlayerB(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07090f] border border-white/10 text-sm font-bold text-white focus:outline-none"
                >
                  <option value="">Tanlang...</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (#{p.number} - {p.position}) [{p.team}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExecuteSwap}
              disabled={!swapPlayerA || !swapPlayerB}
              className="w-full py-3 rounded-xl bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-amber-300 disabled:opacity-40 transition cursor-pointer"
            >
              Joylarini Almashtirish
            </button>
          </div>
        )}

        {/* ========================================================
            TAB 5: ACTIVE DEVICES & SESSIONS (TELEGRAM-STYLE)
           ======================================================== */}
        {activeTab === 'devices' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0c101d] border border-white/10 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-widest">
                    Xavfsizlik Nazorati
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white mt-1">
                    Faol Qurilmalar va Seanslar
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Tizimga ulangan barcha qurilmalar, operatsion tizim, IP va taxminiy lokatsiya monitoringi.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-emerald-400">Admin: arslan</span>
                </div>
              </div>

              {/* Sessions List */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Ulangan Qurilmalar ({sessions.length}):
                </div>

                {sessions.map((sess, idx) => (
                  <div
                    key={sess.id || idx}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      sess.isCurrent
                        ? 'bg-cyan-950/20 border-cyan-400/40 ring-1 ring-cyan-400/20'
                        : 'bg-black/40 border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/15 flex items-center justify-center text-lg shrink-0">
                        {sess.isMobile ? '📱' : '💻'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{sess.deviceName}</span>
                          {sess.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[9px] font-mono font-black uppercase">
                              Ushbu Qurilma
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-zinc-400 mt-1 flex flex-wrap items-center gap-2">
                          <span>📍 {sess.location || 'Toshkent, O\'zbekiston'}</span>
                          <span>•</span>
                          <span>IP: {sess.ip || '178.218.***.***'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Onlayn
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        {new Date(sess.lastActive).toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Hint */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-xs text-zinc-400 font-mono flex items-center gap-2.5">
                <span>🛡</span>
                <span>Barcha seanslar shifrlangan va Supabase xavfsiz ulanish orqali himoyalangan.</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* PLAYER MODAL WITH FILE UPLOAD */}
      {isPlayerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0e121d] border border-white/10 p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {editingPlayer ? "O'yinchini Tahrirlash" : "Yangi O'yinchi Qo'shish"}
              </h3>
              <button
                onClick={() => setIsPlayerModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-4">
              
              {/* PHOTO UPLOAD */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/20 bg-zinc-900 shrink-0">
                  <img
                    src={playerForm.avatar}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "/avatars/asliddin.jpg"; }}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs font-bold text-white uppercase">Fotosurat (Telefon / PC)</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-black uppercase shadow-sm"
                    >
                      📁 Rasm Yuklash
                    </button>
                    <input
                      type="text"
                      placeholder="yoki URL..."
                      value={playerForm.avatar.startsWith('data:') ? 'Yuklangan rasm' : playerForm.avatar}
                      onChange={(e) => setPlayerForm({ ...playerForm, avatar: e.target.value })}
                      className="flex-1 px-2.5 py-1 rounded bg-[#07090f] border border-white/10 text-[11px] text-zinc-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* PRESETS */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPlayerForm({ ...playerForm, avatar: preset.url })}
                    className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] text-zinc-300 font-bold shrink-0"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Ismi *</label>
                  <input
                    type="text"
                    required
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090f] border border-white/10 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">To'liq Ismi</label>
                  <input
                    type="text"
                    value={playerForm.displayName}
                    onChange={(e) => setPlayerForm({ ...playerForm, displayName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090f] border border-white/10 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Jamoa</label>
                  <select
                    value={playerForm.team}
                    onChange={(e) => setPlayerForm({ ...playerForm, team: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#07090f] border border-white/10 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="Real">Real Madrid</option>
                    <option value="Liverpool">Liverpool FC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Raqam</label>
                  <input
                    type="number"
                    required
                    value={playerForm.number}
                    onChange={(e) => setPlayerForm({ ...playerForm, number: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#07090f] border border-white/10 text-sm font-mono font-bold text-white text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Pozitsiya</label>
                  <select
                    value={playerForm.position}
                    onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#07090f] border border-white/10 text-xs font-bold text-white focus:outline-none"
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

              {/* STATS: GOALS, ASSISTS, SAVES, CONCEDED */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-0.5">Gol</label>
                  <input
                    type="number"
                    min="0"
                    value={playerForm.goals}
                    onChange={(e) => setPlayerForm({ ...playerForm, goals: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-[#07090f] border border-white/10 text-xs text-center font-mono font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-0.5">Asist</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={playerForm.assists}
                    onChange={(e) => setPlayerForm({ ...playerForm, assists: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-[#07090f] border border-white/10 text-xs text-center font-mono font-bold text-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-emerald-400 mb-0.5">Seyv</label>
                  <input
                    type="number"
                    min="0"
                    value={playerForm.saves}
                    onChange={(e) => setPlayerForm({ ...playerForm, saves: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-[#07090f] border border-white/10 text-xs text-center font-mono font-bold text-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-red-400 mb-0.5">O'tkazilgan</label>
                  <input
                    type="number"
                    min="0"
                    value={playerForm.conceded}
                    onChange={(e) => setPlayerForm({ ...playerForm, conceded: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-[#07090f] border border-white/10 text-xs text-center font-mono font-bold text-red-300"
                  />
                </div>
              </div>

              {/* FIFA ATTRIBUTES */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2">
                <span className="text-[11px] font-bold uppercase text-zinc-300 block">
                  FIFA Xususiyatlari
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['pac', 'sho', 'pas', 'dri', 'def', 'phy'].map((key) => (
                    <div key={key} className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900 border border-white/10">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">{key}</span>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={playerForm.stats[key] ?? 0}
                        onChange={(e) => updateModalStat(key, e.target.value)}
                        className="w-12 px-1 py-0.5 rounded bg-black border border-white/20 text-center font-mono font-bold text-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="adminIsCap"
                  checked={playerForm.isCaptain}
                  onChange={(e) => setPlayerForm({ ...playerForm, isCaptain: e.target.checked })}
                  className="w-4 h-4 rounded bg-black border-white/20 text-white"
                />
                <label htmlFor="adminIsCap" className="text-xs text-zinc-200 font-bold">
                  👑 Jamoa Sardori (Kapitan)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPlayerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-zinc-300 text-xs font-bold"
                >
                  Bekor Qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black font-extrabold text-xs uppercase"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
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
