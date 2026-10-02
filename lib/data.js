/**
 * Real Madrid & Liverpool FC - Match, Tactics & Attendance Engine (v20)
 * 
 * JAMOALAR:
 * - Real Madrid (Logo: /logos/real.svg, Rangi: #f5c542)
 * - Liverpool FC (Logo: /logos/liverpool.svg, Rangi: #c8102e)
 * 
 * REAL MADRID TARKIBI (Boshlang'ich 0 ko'rsatkichlar):
 * - Asliddin - #7, LW (Sardor) -> /avatars/asliddin.jpg
 * - Said - #10, RW
 * - Arslan - #1, GK -> /avatars/arslan.png
 * - Azim - #4, CB
 * - Fayzi - #3, RB
 * - Ilhom - #5, LB
 * 
 * LIVERPOOL FC TARKIBI (Foydalanuvchi ko'rsatgan aniq tartib):
 * 1. Abdulaziz - #1, GK
 * 4. Azamat - #4, CB (Sardor)
 * 2. K.Afzal - #2, CB (Kichkina Afzal)
 * 11. Gʻ.Afzal - #11, LB (Kotta Afzal) -> /avatars/afzal_katta.png
 * 21. Abdullox - #21, RW
 * 10. Mardon - #10, LB -> /avatars/mardon.jpg
 * 9. Umid - #9, FW
 * 
 * O'YIN KUNLARI VA DAVOMAT:
 * - Faqat SESHANBA va PAYSHANBA kunlari o'yin bo'ladi
 * - 2027-yil dekabrigacha haftalik pagination
 */

export const TEAMS = [
  { id: 'Real', name: 'Real Madrid', shortName: 'Real', color: '#f5c542', logo: '/logos/real.svg' },
  { id: 'Liverpool', name: 'Liverpool FC', shortName: 'Liverpool', color: '#c8102e', logo: '/logos/liverpool.svg' },
];

export const INITIAL_ALL_PLAYERS = [
  // ==========================================
  // REAL MADRID FC (6 O'YINCHI) - BARCHASI 0 DA
  // ==========================================
  {
    id: "p_asliddin",
    name: "Asliddin",
    displayName: "Asliddin",
    fullName: "Asliddin",
    team: "Real",
    isCaptain: true,
    number: 7,
    position: "LW",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/asliddin.jpg",
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },
  {
    id: "p_said",
    name: "Said",
    displayName: "Said",
    fullName: "Said",
    team: "Real",
    isCaptain: false,
    number: 10,
    position: "RW",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/said.jpg", // 3-rasm
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },
  {
    id: "p_arslan",
    name: "Arslan",
    displayName: "Arslan",
    fullName: "Arslan",
    team: "Real",
    isCaptain: false,
    number: 1,
    position: "GK",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/arslan.png",
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },
  {
    id: "p_azim",
    name: "Azim",
    displayName: "Azim",
    fullName: "Azim",
    team: "Real",
    isCaptain: false,
    number: 4,
    position: "CB",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/azim.svg",
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },
  {
    id: "p_fayzi",
    name: "Fayzi",
    displayName: "Fayzi",
    fullName: "Fayzi",
    team: "Real",
    isCaptain: false,
    number: 3,
    position: "RB",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/fayzi.svg",
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },
  {
    id: "p_ilhom",
    name: "Ilhom",
    displayName: "Ilhom",
    fullName: "Ilhom",
    team: "Real",
    isCaptain: false,
    number: 5,
    position: "LB",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/ilhom.jpg", // 2-rasm
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },

  // ==========================================
  // LIVERPOOL FC (7 O'YINCHI) - BARCHASI 0 DA
  // ==========================================
  {
    id: "p_abdulaziz",
    name: "Abdulaziz",
    displayName: "Abdulaziz",
    fullName: "Abdulaziz",
    team: "Liverpool",
    isCaptain: false,
    number: 1,
    position: "GK",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/abdulaziz.svg",
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },
  {
    id: "p_azamat",
    name: "Azamat",
    displayName: "Azamat",
    fullName: "Azamat",
    team: "Liverpool",
    isCaptain: false,
    number: 4,
    position: "CB",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/azamat.svg",
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },
  {
    id: "p_afzal_kichik",
    name: "K.Afzal",
    displayName: "K.Afzal",
    fullName: "K.Afzal",
    team: "Liverpool",
    isCaptain: false,
    number: 2,
    position: "CB",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/afzal_kichik.svg",
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },
  {
    id: "p_afzal_katta",
    name: "Gʻ.Afzal",
    displayName: "Gʻ.Afzal",
    fullName: "Gʻ.Afzal",
    team: "Liverpool",
    isCaptain: false,
    number: 11,
    position: "LB",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/afzal_katta.png",
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },
  {
    id: "p_abdulloh",
    name: "Abdullox",
    displayName: "Abdullox",
    fullName: "Abdullox",
    team: "Liverpool",
    isCaptain: true, // Sardor!
    number: 21,
    position: "RW",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/abdulloh.svg",
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },
  {
    id: "p_mardon",
    name: "Mardon",
    displayName: "Mardon",
    fullName: "Mardon",
    team: "Liverpool",
    isCaptain: false,
    number: 10,
    position: "LB",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/mardon.jpg",
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  },
  {
    id: "p_umid",
    name: "Umid",
    displayName: "Umid",
    fullName: "Umid",
    team: "Liverpool",
    isCaptain: false,
    number: 9,
    position: "FW",
    rating: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    conceded: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avatar: "/avatars/umid.svg",
    stats: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }
  }
];

// Real Madrid: 1-3-2 (GK, LB, CB, RB, LW, RW)
export const FORMATION_REAL = [
  { key: 'slot-real-lw', label: 'LW', name: 'Asliddin (#7 LW)', defaultTop: '20%', defaultLeft: '30%' },
  { key: 'slot-real-rw', label: 'RW', name: "Said (#10 RW)", defaultTop: '20%', defaultLeft: '70%' },
  { key: 'slot-real-lb', label: 'LB', name: 'Ilhom (#5 LB)', defaultTop: '52%', defaultLeft: '18%' },
  { key: 'slot-real-cb', label: 'CB', name: 'Azim (#4 CB)', defaultTop: '58%', defaultLeft: '50%' },
  { key: 'slot-real-rb', label: 'RB', name: "Fayzi (#3 RB)", defaultTop: '52%', defaultLeft: '82%' },
  { key: 'slot-real-gk', label: 'GK', name: 'Arslan (#1 GK)', defaultTop: '86%', defaultLeft: '50%' },
];

// Liverpool FC: 1-2-2-2 (GK, CB, CM1, CM2, LW, RW, FW)
export const FORMATION_LIVERPOOL = [
  { key: 'slot-liv-fw', label: 'FW', name: 'Umid (#9 FW)', defaultTop: '15%', defaultLeft: '50%' },
  { key: 'slot-liv-mardon', label: 'LW', name: 'Mardon (#10 LW)', defaultTop: '28%', defaultLeft: '22%' },
  { key: 'slot-liv-rw', label: 'RW', name: 'Abdullox (#21 RW)', defaultTop: '28%', defaultLeft: '78%' },
  { key: 'slot-liv-afzal_katta', label: 'CM', name: 'Gʻ.Afzal (#11 CM)', defaultTop: '46%', defaultLeft: '32%' },
  { key: 'slot-liv-cb2', label: 'CM', name: 'K.Afzal (#2 CM)', defaultTop: '46%', defaultLeft: '68%' },
  { key: 'slot-liv-cb1', label: 'CB', name: 'Azamat (#4 CB)', defaultTop: '64%', defaultLeft: '50%' },
  { key: 'slot-liv-gk', label: 'GK', name: 'Abdulaziz (#1 GK)', defaultTop: '86%', defaultLeft: '50%' },
];

export const INITIAL_SLOT_ASSIGNMENTS = {
  // Real
  'slot-real-lw': 'p_asliddin',
  'slot-real-rw': 'p_said',
  'slot-real-gk': 'p_arslan',
  'slot-real-cb': 'p_azim',
  'slot-real-lb': 'p_ilhom',
  'slot-real-rb': 'p_fayzi',
  // Liverpool
  'slot-liv-fw': 'p_umid',
  'slot-liv-rw': 'p_abdulloh',
  'slot-liv-mardon': 'p_mardon',
  'slot-liv-afzal_katta': 'p_afzal_katta',
  'slot-liv-cb1': 'p_azamat',
  'slot-liv-cb2': 'p_afzal_kichik',
  'slot-liv-gk': 'p_abdulaziz',
};

export const INITIAL_MATCHES = [];

const STORAGE_PLAYERS_KEY = 'clasico_squad_v25';
const STORAGE_SLOTS_KEY = 'clasico_slots_v25';
const STORAGE_MATCHES_KEY = 'clasico_matches_v25';
const STORAGE_AUTH_KEY = 'clasico_auth_v25';
const STORAGE_ATTENDANCE_KEY = 'clasico_attendance_v25';

export const ADMIN_CREDENTIALS = {
  usernames: ['asliddincr7', 'admin_real_fc', 'admin'],
  passwords: ['asliddin2011', 'ElClasico2026!#']
};

export function getStoredPlayers() {
  if (typeof window === 'undefined') return INITIAL_ALL_PLAYERS;
  try {
    const stored = localStorage.getItem(STORAGE_PLAYERS_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(INITIAL_ALL_PLAYERS));
      return INITIAL_ALL_PLAYERS;
    }
    const parsed = JSON.parse(stored);
    return parsed;
  } catch (e) {
    return INITIAL_ALL_PLAYERS;
  }
}

export async function syncToServer(payload) {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {}
}

export function saveStoredPlayers(players, sync = true) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(players));
  if (sync) syncToServer({ players });
}

export function getStoredSlots() {
  if (typeof window === 'undefined') return INITIAL_SLOT_ASSIGNMENTS;
  try {
    const stored = localStorage.getItem(STORAGE_SLOTS_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_SLOTS_KEY, JSON.stringify(INITIAL_SLOT_ASSIGNMENTS));
      return INITIAL_SLOT_ASSIGNMENTS;
    }
    const parsed = JSON.parse(stored);
    if (!parsed['slot-liv-fw']) {
      localStorage.setItem(STORAGE_SLOTS_KEY, JSON.stringify(INITIAL_SLOT_ASSIGNMENTS));
      return INITIAL_SLOT_ASSIGNMENTS;
    }
    return parsed;
  } catch (e) {
    return INITIAL_SLOT_ASSIGNMENTS;
  }
}

export function saveStoredSlots(slots, sync = true) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_SLOTS_KEY, JSON.stringify(slots));
  if (sync) syncToServer({ slots });
}

export function getStoredMatches() {
  if (typeof window === 'undefined') return INITIAL_MATCHES;
  try {
    const stored = localStorage.getItem(STORAGE_MATCHES_KEY);
    if (!stored) return INITIAL_MATCHES;
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_MATCHES;
  }
}

export function saveStoredMatches(matches, sync = true) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_MATCHES_KEY, JSON.stringify(matches));
  if (sync) syncToServer({ matches });
}

export function deleteStoredMatch(matchId) {
  if (typeof window === 'undefined') return [];
  const current = getStoredMatches();
  const updated = current.filter(m => m.id !== matchId);
  saveStoredMatches(updated, true);
  return updated;
}

export function getStoredAttendance() {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_ATTENDANCE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

export function saveStoredAttendance(attendance, sync = true) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(attendance));
  if (sync) syncToServer({ attendance });
}

export function saveStoredBatch(payload, sync = true) {
  if (typeof window === 'undefined') return;
  if (payload.players) localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(payload.players));
  if (payload.matches) localStorage.setItem(STORAGE_MATCHES_KEY, JSON.stringify(payload.matches));
  if (payload.slots) localStorage.setItem(STORAGE_SLOTS_KEY, JSON.stringify(payload.slots));
  if (payload.attendance) localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(payload.attendance));
  if (sync) syncToServer(payload);
}


export function assignSlot(slots, slotKey, playerId) {
  const newSlots = { ...slots };
  Object.keys(newSlots).forEach(key => {
    if (newSlots[key] === playerId) newSlots[key] = null;
  });
  newSlots[slotKey] = playerId;
  return newSlots;
}

export function removeSlot(slots, slotKey) {
  const newSlots = { ...slots };
  newSlots[slotKey] = null;
  return newSlots;
}

export function swapPlayerPositions(players, player1Id, player2Id) {
  const p1 = players.find(p => p.id === player1Id);
  const p2 = players.find(p => p.id === player2Id);
  if (!p1 || !p2) return players;

  return players.map(p => {
    if (p.id === player1Id) return { ...p, position: p2.position, number: p2.number };
    if (p.id === player2Id) return { ...p, position: p1.position, number: p1.number };
    return p;
  });
}

export function resetAllData() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(INITIAL_ALL_PLAYERS));
  localStorage.setItem(STORAGE_SLOTS_KEY, JSON.stringify(INITIAL_SLOT_ASSIGNMENTS));
  localStorage.setItem(STORAGE_MATCHES_KEY, JSON.stringify(INITIAL_MATCHES));
  localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify({}));
  syncToServer({
    players: INITIAL_ALL_PLAYERS,
    slots: INITIAL_SLOT_ASSIGNMENTS,
    matches: [],
    attendance: {},
  });
}

/**
 * REYTING HISOBLASH FORMULASI:
 * - Gol: +2.0
 * - Asist: +1.5
 * - Seyv (GK): +0.5
 * - O'tkazilgan gol (GK): -0.5
 */
export function calculatePlayerRating(goals = 0, assists = 0, saves = 0, conceded = 0) {
  const g = Math.max(0, parseFloat(goals) || 0);
  const a = Math.max(0, parseFloat(assists) || 0);
  const s = Math.max(0, parseFloat(saves) || 0);
  const c = Math.max(0, parseFloat(conceded) || 0);
  const total = (g * 2.0) + (a * 1.5) + (s * 0.5) - (c * 0.5);
  return Math.max(0, Math.round(total * 10) / 10);
}

/**
 * O'YIN KUNLARI KALENDARI (Faqat Seshanba va Payshanba, 2026-Oktabrdan 2027-Dekabrgacha):
 */
export function generateScheduleWeeks() {
  const weeks = [];
  // Boshlanish: 2026-yil 28-sentabr (Dushanba)
  const current = new Date(2026, 8, 28);
  const endDate = new Date(2027, 11, 31); // 2027-yil 31-dekabr

  let weekIndex = 1;
  while (current <= endDate) {
    const monday = new Date(current);
    const tuesday = new Date(current);
    tuesday.setDate(monday.getDate() + 1);

    const thursday = new Date(current);
    thursday.setDate(monday.getDate() + 3);

    const sunday = new Date(current);
    sunday.setDate(monday.getDate() + 6);

    const toIsoDate = (d) => d.toISOString().split('T')[0];

    const formatUz = (d) => {
      const day = d.getDate();
      const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
      return `${day}-${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    weeks.push({
      weekIndex,
      label: `${formatUz(monday)} — ${formatUz(sunday)}`,
      sessions: [
        {
          date: toIsoDate(tuesday),
          dayOfWeek: 'Seshanba',
          formattedDate: `${tuesday.getDate()}-kun, Seshanba`,
          fullDisplay: `${formatUz(tuesday)}, Seshanba`,
        },
        {
          date: toIsoDate(thursday),
          dayOfWeek: 'Payshanba',
          formattedDate: `${thursday.getDate()}-kun, Payshanba`,
          fullDisplay: `${formatUz(thursday)}, Payshanba`,
        }
      ]
    });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return weeks;
}

/**
 * O'YIN KUNLARI KALENDARI (Oylik Matritsa - Faqat Seshanba va Payshanba, 2026-Oktabrdan 2027-Dekabrgacha):
 * Har bir oy uchun barcha Seshanba va Payshanba kunlarini DD.MM formatida chiqaradi.
 */
export function generateScheduleMonths() {
  const months = [];
  const monthNamesUz = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];

  // Boshlanish: 2026-yil Oktabr (oy index: 9), Tugash: 2027-yil Dekabr (oy index: 11)
  let y = 2026;
  let m = 9; // 9 = Oktabr

  while (y < 2027 || (y === 2027 && m <= 11)) {
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
    const monthLabel = `${monthNamesUz[m]} ${y}`;
    const shortLabel = monthNamesUz[m];

    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const sessions = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(y, m, d);
      const dayOfWeek = dt.getDay(); // 2: Seshanba, 4: Payshanba
      if (dayOfWeek === 2 || dayOfWeek === 4) {
        const ddStr = String(d).padStart(2, '0');
        const mmStr = String(m + 1).padStart(2, '0');
        const isoDate = `${y}-${mmStr}-${ddStr}`;
        const shortDate = `${ddStr}.${mmStr}`;
        const dayName = dayOfWeek === 2 ? 'Seshanba' : 'Payshanba';
        const fullDisplay = `${d}-${monthNamesUz[m]} ${y}, ${dayName}`;

        sessions.push({
          date: isoDate,
          shortDate,
          dayName,
          fullDisplay,
          dayNumber: d,
        });
      }
    }

    months.push({
      monthKey,
      monthLabel,
      shortLabel,
      year: y,
      monthIndex: m,
      sessions,
    });

    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }

  return months;
}

/**
 * O'YIN BO'YICHA REYTING PASAYISHI VA O'SISH TAHLILI:
 */
export function calculateMatchAnalysis(match) {
  if (!match || !match.details || match.details.length === 0) return null;

  const playerDeltas = match.details.map(d => {
    const g = d.goalsInMatch || 0;
    const a = d.assistsInMatch || 0;
    const s = d.savesInMatch || 0;
    const c = d.concededInMatch || 0;
    const delta = (g * 2.0) + (a * 1.5) + (s * 0.5) - (c * 0.5);
    return {
      ...d,
      delta: Math.round(delta * 10) / 10,
      goals: g,
      assists: a,
      saves: s,
      conceded: c,
    };
  });

  const realDeltas = playerDeltas.filter(d => d.team === 'Real');
  const liverpoolDeltas = playerDeltas.filter(d => d.team === 'Liverpool');

  const realTotalDelta = Math.round(realDeltas.reduce((acc, d) => acc + d.delta, 0) * 10) / 10;
  const liverpoolTotalDelta = Math.round(liverpoolDeltas.reduce((acc, d) => acc + d.delta, 0) * 10) / 10;

  const sortedAsc = [...playerDeltas].sort((a, b) => a.delta - b.delta);
  const topLoser = sortedAsc[0];

  const sortedDesc = [...playerDeltas].sort((a, b) => b.delta - a.delta);
  const topGainer = sortedDesc[0];

  let loserReason = "";
  if (topLoser) {
    if (topLoser.conceded > 0) {
      loserReason = `${topLoser.conceded} ta gol o'tkazib yubordi (-${(topLoser.conceded * 0.5).toFixed(1)} ball). Seyvlar bilan zararni qoplay olmadi.`;
    } else if (topLoser.delta <= 0) {
      loserReason = `Gol yoki assist qayd etmadi, faollik yetarli bo'lmadi.`;
    } else {
      loserReason = `Jamoa ichida eng past foydali ko'rsatkich.`;
    }
  }

  let gainerReason = "";
  if (topGainer) {
    const parts = [];
    if (topGainer.goals > 0) parts.push(`${topGainer.goals} ta gol (+${(topGainer.goals * 2.0).toFixed(1)})`);
    if (topGainer.assists > 0) parts.push(`${topGainer.assists} ta asist (+${(topGainer.assists * 1.5).toFixed(1)})`);
    if (topGainer.saves > 0) parts.push(`${topGainer.saves} ta seyv (+${(topGainer.saves * 0.5).toFixed(1)})`);
    gainerReason = parts.join(', ') || "O'yinda ajoyib faollik ko'rsatdi.";
  }

  return {
    realTotalDelta,
    liverpoolTotalDelta,
    playerDeltas,
    topLoser: topLoser ? { ...topLoser, reason: loserReason } : null,
    topGainer: topGainer ? { ...topGainer, reason: gainerReason } : null,
  };
}

/**
 * VAQT BO'YICHA REYTINGNI HISOBLASH (Haftalik, Oylik, Yillik, Barcha vaqt):
 */
export function getPlayerPeriodStats(player, matches, period = 'all') {
  if (period === 'all') {
    return {
      goals: player.goals || 0,
      assists: player.assists || 0,
      saves: player.saves || 0,
      conceded: player.conceded || 0,
      matchesPlayed: player.matchesPlayed || 0,
      rating: Number(player.rating || 0),
    };
  }

  const now = new Date();
  const filteredMatches = (matches || []).filter(m => {
    if (!m.date) return false;
    const matchDate = new Date(m.date);
    const diffDays = Math.ceil(Math.abs(now - matchDate) / (1000 * 60 * 60 * 24));
    if (period === 'weekly') return diffDays <= 7;
    if (period === 'monthly') return diffDays <= 30;
    if (period === 'yearly') return diffDays <= 365;
    return true;
  });

  let pGoals = 0;
  let pAssists = 0;
  let pSaves = 0;
  let pConceded = 0;
  let pMatches = 0;

  filteredMatches.forEach(m => {
    const detail = m.details?.find(d => d.playerId === player.id);
    if (detail) {
      pMatches++;
      pGoals += detail.goalsInMatch || 0;
      pAssists += detail.assistsInMatch || 0;
      pSaves += detail.savesInMatch || 0;
      pConceded += detail.concededInMatch || 0;
    }
  });

  const pRating = calculatePlayerRating(pGoals, pAssists, pSaves, pConceded);
  return {
    goals: pGoals,
    assists: pAssists,
    saves: pSaves,
    conceded: pConceded,
    matchesPlayed: pMatches,
    rating: pRating,
  };
}

/**
 * JAMOA REYTINGI VA DAVOMAT TAHLILI (Real Madrid vs Liverpool FC):
 * Kim 1-o'rinda, kim 2-o'rinda va nima sababdan ball o'zgarganligi
 */
export function calculateTeamsRanking(players = [], matches = [], attendance = {}) {
  const realPlayers = players.filter(p => p.team === 'Real');
  const liverpoolPlayers = players.filter(p => p.team === 'Liverpool');

  // Gollar va assistlar bo'yicha jami
  const realGoals = realPlayers.reduce((acc, p) => acc + (p.goals || 0), 0);
  const realAssists = realPlayers.reduce((acc, p) => acc + (p.assists || 0), 0);
  const realSaves = realPlayers.reduce((acc, p) => acc + (p.saves || 0), 0);
  const realConceded = realPlayers.reduce((acc, p) => acc + (p.conceded || 0), 0);
  const realPlayerRatingSum = realPlayers.reduce((acc, p) => acc + (p.rating || 0), 0);

  const livGoals = liverpoolPlayers.reduce((acc, p) => acc + (p.goals || 0), 0);
  const livAssists = liverpoolPlayers.reduce((acc, p) => acc + (p.assists || 0), 0);
  const livSaves = liverpoolPlayers.reduce((acc, p) => acc + (p.saves || 0), 0);
  const livConceded = liverpoolPlayers.reduce((acc, p) => acc + (p.conceded || 0), 0);
  const livPlayerRatingSum = liverpoolPlayers.reduce((acc, p) => acc + (p.rating || 0), 0);

  // Davomat bo'yicha ko'rsatkichlar
  const attendanceDates = Object.keys(attendance);
  let realAttendedCount = 0;
  let livAttendedCount = 0;

  attendanceDates.forEach(d => {
    const dayRecords = attendance[d] || {};
    realPlayers.forEach(p => {
      const rec = dayRecords[p.id];
      if (rec && rec.present) realAttendedCount++;
    });
    liverpoolPlayers.forEach(p => {
      const rec = dayRecords[p.id];
      if (rec && rec.present) livAttendedCount++;
    });
  });

  const realTotalPossible = Math.max(1, attendanceDates.length * realPlayers.length);
  const livTotalPossible = Math.max(1, attendanceDates.length * liverpoolPlayers.length);

  const realAttendanceRate = attendanceDates.length > 0
    ? Math.round((realAttendedCount / realTotalPossible) * 100)
    : 100;

  const livAttendanceRate = attendanceDates.length > 0
    ? Math.round((livAttendedCount / livTotalPossible) * 100)
    : 100;

  // Jamoa umumiy reytingi: Futbolchilar reytingi + Davomat bonusi
  const realAttendanceBonus = Math.round(realAttendedCount * 0.5 * 10) / 10;
  const livAttendanceBonus = Math.round(livAttendedCount * 0.5 * 10) / 10;

  const realTotalRating = Math.round((realPlayerRatingSum + realAttendanceBonus) * 10) / 10;
  const livTotalRating = Math.round((livPlayerRatingSum + livAttendanceBonus) * 10) / 10;

  const teams = [
    {
      id: 'Real',
      name: 'Real Madrid',
      logo: '/logos/real.svg',
      color: '#f5c542',
      rating: realTotalRating,
      playerRatingSum: realPlayerRatingSum,
      goals: realGoals,
      assists: realAssists,
      saves: realSaves,
      conceded: realConceded,
      attendanceRate: realAttendanceRate,
      attendedSessions: realAttendedCount,
      attendanceBonus: realAttendanceBonus,
      playerCount: realPlayers.length,
      reason: realConceded > realGoals
        ? `${realConceded} ta gol o'tkazilganligi sababli ball tushdi`
        : `${realGoals} ta gol va ${realAttendanceRate}% davomat natijasi`,
    },
    {
      id: 'Liverpool',
      name: 'Liverpool FC',
      logo: '/logos/liverpool.svg',
      color: '#c8102e',
      rating: livTotalRating,
      playerRatingSum: livPlayerRatingSum,
      goals: livGoals,
      assists: livAssists,
      saves: livSaves,
      conceded: livConceded,
      attendanceRate: livAttendanceRate,
      attendedSessions: livAttendedCount,
      attendanceBonus: livAttendanceBonus,
      playerCount: liverpoolPlayers.length,
      reason: livConceded > livGoals
        ? `${livConceded} ta gol o'tkazilganligi sababli ball tushdi`
        : `${livGoals} ta gol va ${livAttendanceRate}% davomat natijasi`,
    }
  ];

  // Saralash: 1-o'rin va 2-o'rin
  teams.sort((a, b) => b.rating - a.rating || b.goals - a.goals);
  teams[0].rank = 1;
  teams[1].rank = 2;

  return teams;
}

export function getAdminAuth() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_AUTH_KEY) === 'authenticated_forever';
}

export function setAdminAuth(val) {
  if (typeof window === 'undefined') return;
  if (val) {
    localStorage.setItem(STORAGE_AUTH_KEY, 'authenticated_forever');
  } else {
    // Completely wipe all auth keys across all versions so logout works 100%
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.toLowerCase().includes('auth') || k.toLowerCase().includes('clasico')) {
          if (!k.includes('players') && !k.includes('slots') && !k.includes('matches') && !k.includes('attendance')) {
            localStorage.removeItem(k);
          }
        }
      });
      localStorage.removeItem(STORAGE_AUTH_KEY);
      sessionStorage.clear();
    } catch (e) {}
  }
}

export function verifyAdminCredentials(user, pass) {
  const cleanUser = user.trim().toLowerCase();
  const cleanPass = pass.trim();
  const userMatches = ADMIN_CREDENTIALS.usernames.some(u => u.toLowerCase() === cleanUser);
  const passMatches = ADMIN_CREDENTIALS.passwords.includes(cleanPass);
  return userMatches && passMatches;
}

