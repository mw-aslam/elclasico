'use client';

import { useState, useMemo, useRef } from 'react';
import { calculateMatchAnalysis } from '../lib/data';

export default function RatingAnalytics({ matches = [], players = [] }) {
  // Interactive Hover Point
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const svgRef = useRef(null);

  // Find player helper
  const getPlayer = (pId) => players.find((p) => p.id === pId);

  // =========================================================================
  // REAL TIME-SERIES TIMELINE STARTING FROM 0 (POLNIY 0 GA TUSHIRILGAN)
  // Both teams start at 0. Points grow dynamically as real matches are added.
  // =========================================================================
  const timelineData = useMemo(() => {
    // Starting baseline point: both teams at 0
    const points = [
      {
        index: 0,
        label: "Start",
        shortDate: "0-nuqta",
        realRating: 0,
        liverpoolRating: 0,
        realScore: 0,
        livScore: 0,
        scoreText: "0 - 0",
        match: null,
        note: "Mavsum boshlang'ich nuqtasi (0 ball)",
      }
    ];

    if (!matches || matches.length === 0) {
      // If 0 matches, add a placeholder target so the chart draws an elegant starting axis
      points.push({
        index: 1,
        label: "1-o'yin",
        shortDate: "Kutilmoqda",
        realRating: 0,
        liverpoolRating: 0,
        realScore: 0,
        livScore: 0,
        scoreText: "— : —",
        match: null,
        isFuture: true,
        note: "Birinchi o'yin kutilmoqda",
      });
      return points;
    }

    // Chronological order (oldest to newest)
    const sorted = [...matches].reverse();
    let cumReal = 0;
    let cumLiv = 0;

    sorted.forEach((m, i) => {
      const isRealHome = m.homeTeam === 'Real';
      const realScore = isRealHome ? Number(m.homeScore) || 0 : Number(m.awayScore) || 0;
      const livScore = isRealHome ? Number(m.awayScore) || 0 : Number(m.homeScore) || 0;

      // Calculate match rating contribution
      let realDelta = 0;
      let livDelta = 0;
      if (m.details && m.details.length > 0) {
        m.details.forEach(d => {
          const g = d.goalsInMatch || 0;
          const a = d.assistsInMatch || 0;
          const s = d.savesInMatch || 0;
          const c = d.concededInMatch || 0;
          const delta = (g * 2.0) + (a * 1.5) + (s * 0.5) - (c * 0.5);
          if (d.team === 'Real') realDelta += delta;
          else if (d.team === 'Liverpool') livDelta += delta;
        });
      } else {
        realDelta = (realScore * 2.0) - (livScore * 0.5);
        livDelta = (livScore * 2.0) - (realScore * 0.5);
      }

      cumReal += realDelta;
      cumLiv += livDelta;

      const dateStr = m.date ? new Date(m.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' }) : `${i + 1}-tur`;

      points.push({
        index: i + 1,
        label: `${i + 1}-o'yin`,
        shortDate: dateStr,
        realRating: Math.round(cumReal * 10) / 10,
        liverpoolRating: Math.round(cumLiv * 10) / 10,
        realScore,
        livScore,
        scoreText: `${m.homeScore} - ${m.awayScore}`,
        match: m,
        isFuture: false,
        note: `${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam} (${dateStr})`,
      });
    });

    return points;
  }, [matches]);

  // Active point index (defaults to latest actual match if exists, otherwise 0)
  const activeIdx = selectedIdx !== null 
    ? selectedIdx 
    : (matches.length > 0 ? timelineData.length - 1 : 0);
  const activePoint = timelineData[activeIdx] || timelineData[0];

  // If active point is a real match, compute attribution via calculateMatchAnalysis
  const activeMatchRecord = activePoint?.match || (matches.length > 0 ? matches[0] : null);
  const analysis = activeMatchRecord ? calculateMatchAnalysis(activeMatchRecord) : null;

  // =========================================================================
  // DYNAMIC Y-SCALE (CALCULATED TO HAVE CLEAN GRIDLINES LIKE THE REFERENCE IMAGE)
  // =========================================================================
  const { maxVal, yLevels } = useMemo(() => {
    let maxR = 0;
    timelineData.forEach(p => {
      maxR = Math.max(maxR, p.realRating || 0, p.liverpoolRating || 0);
    });

    if (maxR <= 10) {
      return { maxVal: 10, yLevels: [10, 8, 6, 4, 2, 0] };
    } else if (maxR <= 25) {
      return { maxVal: 25, yLevels: [25, 20, 15, 10, 5, 0] };
    } else if (maxR <= 50) {
      return { maxVal: 50, yLevels: [50, 40, 30, 20, 10, 0] };
    } else if (maxR <= 100) {
      return { maxVal: 100, yLevels: [100, 80, 60, 40, 20, 0] };
    } else if (maxR <= 200) {
      return { maxVal: 200, yLevels: [200, 160, 120, 80, 40, 0] };
    } else {
      return { maxVal: 300, yLevels: [300, 250, 200, 150, 100, 50, 0] };
    }
  }, [timelineData]);

  // =========================================================================
  // SVG GEOMETRY (MATCHING THE STRUCTURE OF media_1790962667219.png)
  // =========================================================================
  const svgWidth = 850;
  const svgHeight = 330;
  const margin = { top: 25, right: 30, bottom: 45, left: 55 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const getY = (val) => {
    const clamped = Math.max(0, Math.min(maxVal, val));
    return margin.top + (1 - clamped / maxVal) * plotHeight;
  };

  const getX = (index) => {
    if (timelineData.length <= 1) return margin.left + plotWidth / 2;
    return margin.left + (index / (timelineData.length - 1)) * plotWidth;
  };

  // Build SVG Path strings for Red and Gold lines
  const redPolyline = useMemo(() => {
    return timelineData.map((d, i) => `${getX(i).toFixed(1)},${getY(d.liverpoolRating).toFixed(1)}`).join(' ');
  }, [timelineData, maxVal]);

  const realPolyline = useMemo(() => {
    return timelineData.map((d, i) => `${getX(i).toFixed(1)},${getY(d.realRating).toFixed(1)}`).join(' ');
  }, [timelineData, maxVal]);

  // Handle Mouse/Touch Move over SVG to find nearest point
  const handleSvgMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const svgX = ((clientX - rect.left) / rect.width) * svgWidth;
    
    // Find closest index
    let closestIdx = 0;
    let minDiff = Infinity;
    timelineData.forEach((d, i) => {
      const px = getX(i);
      const diff = Math.abs(px - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });

    const pt = timelineData[closestIdx];
    setHoveredPoint({
      index: closestIdx,
      data: pt,
      x: getX(closestIdx),
      redY: getY(pt.liverpoolRating),
      realY: getY(pt.realRating),
    });
  };

  const handleSvgMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <section className="rounded-2xl sm:rounded-3xl bg-[#0c101d] border border-white/10 p-4 sm:p-7 space-y-6 shadow-2xl">
      
      {/* ========================================================
          HEADER: CLEAN TITLE & TEAM LEGEND (PERMANENT DARK THEME)
         ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
            Jamoalar Reyting Dinamikasi
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span>Komanda Grafigi</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white/10 text-zinc-300">
              Real Madrid vs Liverpool FC
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            O'yinlar bo'yicha jamoalar ochkolarining o'sish va pasayish dinamikasi (barcha ko'rsatkichlar 0 dan boshlanadi)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-black/60 border border-white/10 text-[11px] sm:text-xs font-mono self-start sm:self-auto">
          <span className="flex items-center gap-1.5 font-black text-red-400">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444]" />
            Liverpool FC
          </span>
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            Real Madrid
          </span>
        </div>
      </div>

      {/* ========================================================
          DARK NIGHT CHART CONTAINER (FORMAT MATCHING REFERENCE IMAGE)
         ======================================================== */}
      <div className="rounded-2xl sm:rounded-3xl p-2.5 sm:p-6 bg-[#070a14] border border-white/10 transition-all select-none shadow-2xl">
        
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2 pb-2 border-b border-white/[0.08] text-[11px] sm:text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-zinc-300">
            <span className="font-bold uppercase tracking-wider text-zinc-400">
              Tanlangan: <strong className="text-white">{activePoint.label} ({activePoint.shortDate})</strong>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="font-bold text-red-400">
              Liverpool: {activePoint.liverpoolRating}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="font-bold text-amber-400">
              Real: {activePoint.realRating}
            </span>
          </div>

          <div className="text-[10px] sm:text-[11px] text-zinc-500 font-semibold">
            {matches.length === 0 ? "Boshlang'ich holat (0 ball)" : "💡 Nuqtani bosib tahlilni ko'ring"}
          </div>
        </div>

        {/* SVG Graph Plot */}
        <div className="relative overflow-x-auto scrollbar-none w-full">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto min-w-[320px] overflow-visible cursor-crosshair"
            onMouseMove={handleSvgMouseMove}
            onTouchMove={handleSvgMouseMove}
            onMouseLeave={handleSvgMouseLeave}
            onClick={() => {
              if (hoveredPoint && !hoveredPoint.data.isFuture) {
                setSelectedIdx(hoveredPoint.index);
              }
            }}
          >
            <defs>
              <linearGradient id="chartRealGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="chartLivGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* ========================================================
                1. HORIZONTAL GRID LINES & Y-AXIS (MATCHING REFERENCE IMAGE)
               ======================================================== */}
            {yLevels.map((val) => {
              const y = getY(val);
              return (
                <g key={`y-grid-${val}`}>
                  {/* Horizontal Rule across entire plot */}
                  <line
                    x1={margin.left}
                    y1={y}
                    x2={svgWidth - margin.right}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                  />
                  {/* Left Axis Tick Mark */}
                  <line
                    x1={margin.left - 5}
                    y1={y}
                    x2={margin.left}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1.2"
                  />
                  {/* Left Axis Number */}
                  <text
                    x={margin.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#9ca3af"
                    className="text-[11px] font-mono font-bold select-none"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Vertical Y-Axis Baseline on the Left */}
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={margin.top + plotHeight}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1.2"
            />

            {/* ========================================================
                2. BOTTOM X-AXIS BASELINE & TICKS
               ======================================================== */}
            <line
              x1={margin.left}
              y1={margin.top + plotHeight}
              x2={svgWidth - margin.right}
              y2={margin.top + plotHeight}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1.2"
            />

            {timelineData.map((d, i) => {
              const x = getX(i);
              const yBottom = margin.top + plotHeight;

              return (
                <g key={`x-tick-${i}`}>
                  {/* Tick Mark */}
                  <line
                    x1={x}
                    y1={yBottom}
                    x2={x}
                    y2={yBottom + 5}
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1"
                  />
                  {/* Label under tick */}
                  <text
                    x={x}
                    y={yBottom + 18}
                    textAnchor="middle"
                    fill={d.isFuture ? "#6b7280" : "#9ca3af"}
                    className="text-[11px] font-mono font-bold select-none"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}

            {/* ========================================================
                3. DUAL CONTINUOUS LINES (REAL MADRID & LIVERPOOL FC)
               ======================================================== */}
            
            {/* Real Madrid Polyline (Gold) */}
            <polyline
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={realPolyline}
              className="transition-all duration-300"
            />

            {/* Liverpool FC Polyline (Red) */}
            <polyline
              fill="none"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={redPolyline}
              className="transition-all duration-300"
            />

            {/* Data Points Nodes */}
            {timelineData.map((d, i) => {
              const x = getX(i);
              const redY = getY(d.liverpoolRating);
              const realY = getY(d.realRating);
              const isSelected = i === activeIdx;

              if (d.isFuture) return null;

              return (
                <g key={`node-${i}`}>
                  {/* Liverpool Node */}
                  <circle
                    cx={x}
                    cy={redY}
                    r={isSelected ? "6.5" : "4.5"}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    className="transition-all"
                  />
                  {/* Real Node */}
                  <circle
                    cx={x}
                    cy={realY}
                    r={isSelected ? "5.5" : "4"}
                    fill="#fbbf24"
                    stroke="#ffffff"
                    strokeWidth={isSelected ? "2" : "1.5"}
                    className="transition-all"
                  />
                </g>
              );
            })}

            {/* Hovered Point Indicator */}
            {hoveredPoint && (
              <g pointerEvents="none">
                <line
                  x1={hoveredPoint.x}
                  y1={margin.top}
                  x2={hoveredPoint.x}
                  y2={margin.top + plotHeight}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeDasharray="2 2"
                  strokeWidth="1.2"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.redY}
                  r="7"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.realY}
                  r="6"
                  fill="#fbbf24"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Interactive Floating Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3.5 py-2.5 rounded-xl bg-black/95 text-white border border-white/20 shadow-2xl backdrop-blur-md text-xs font-mono"
              style={{
                left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                top: `${(Math.min(hoveredPoint.redY, hoveredPoint.realY) / svgHeight) * 100}%`,
                marginTop: '-12px',
              }}
            >
              <div className="font-bold text-zinc-300 text-[10px] uppercase border-b border-white/10 pb-1 mb-1.5 flex items-center justify-between gap-4">
                <span>{hoveredPoint.data.label}</span>
                <span className="text-zinc-400">{hoveredPoint.data.shortDate}</span>
              </div>
              <div className="flex items-center justify-between gap-4 font-bold text-red-400 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  Liverpool FC:
                </span>
                <span className="font-black text-sm">{hoveredPoint.data.liverpoolRating} ball</span>
              </div>
              <div className="flex items-center justify-between gap-4 font-bold text-amber-300 text-xs mt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Real Madrid:
                </span>
                <span className="font-black text-sm">{hoveredPoint.data.realRating} ball</span>
              </div>
              {hoveredPoint.data.match && (
                <div className="mt-2 pt-1 border-t border-white/10 text-[10px] text-zinc-400 flex items-center justify-between gap-2">
                  <span>Hisob:</span>
                  <span className="font-bold text-white">{hoveredPoint.data.scoreText}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Status text */}
        <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-zinc-400">
          <div>
            Holat: <strong className="text-white">{matches.length} ta rasmiy o'yin</strong> qayd etilgan.
          </div>
          <div>
            Barcha ochkolar: Real Madrid ({activePoint.realRating} ball) • Liverpool FC ({activePoint.liverpoolRating} ball)
          </div>
        </div>

      </div>


      {/* ========================================================
          DEEP-DIVE ATTRIBUTION ANALYSIS (BELOW CHART)
         ======================================================== */}
      {matches.length === 0 ? (
        <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.08] text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-amber-400 text-lg">
            ⚡
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Barcha Ko'rsatkichlar 0 ga Tushirilgan
          </h3>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto">
            Admin panel orqali birinchi El Clásico natijasi kiritilgach, ushbu bo'limda qaysi jamoa qancha reyting olgani, kim sababli reyting pasaygani yoki oshgani to'liq tahlil qilinadi.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          
          {/* Active Match Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/60 border border-white/10 shadow-lg">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">{activePoint.label}</span>
                <span>Uchrashuv Tahlili • {activePoint.shortDate}</span>
              </div>
              <div className="text-lg sm:text-xl font-black uppercase text-white mt-1">
                {activePoint.match?.homeTeam === 'Real' ? 'Real Madrid' : 'Liverpool FC'} {activePoint.scoreText} {activePoint.match?.awayTeam === 'Real' ? 'Real Madrid' : 'Liverpool FC'}
              </div>
            </div>

            {/* Team Net Balance */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-black text-center">
                <div className="text-[10px] uppercase font-normal text-zinc-400">Liverpool</div>
                <div>{activePoint.liverpoolRating} ball</div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-black text-center">
                <div className="text-[10px] uppercase font-normal text-zinc-400">Real Madrid</div>
                <div>{activePoint.realRating} ball</div>
              </div>
            </div>
          </div>

          {/* TWO CORE ATTRIBUTION CARDS: WHO DROPPED vs WHO GAINED */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 🔻 REYTINGNI ENG KO'P TUSHIRGAN FUTBOLCHI (SABABCHI) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/20 via-[#100d14] to-black border border-red-500/30 space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span>🔻</span> Reytingni Eng Ko'p Tushirdi
                  </span>
                  <span className="font-mono text-xs font-bold text-red-400">
                    {analysis.topLoser ? `${analysis.topLoser.delta} ball` : '0 ball'}
                  </span>
                </div>

                {analysis.topLoser ? (
                  (() => {
                    const p = getPlayer(analysis.topLoser.playerId);
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-red-500/30 shrink-0">
                            <img
                              src={p?.avatar || "/avatars/arslan.png"}
                              alt={analysis.topLoser.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.src = "/avatars/arslan.png"; }}
                            />
                          </div>
                          <div>
                            <div className="text-base font-black text-white uppercase">
                              {analysis.topLoser.name}
                            </div>
                            <div className="text-xs font-mono text-zinc-400">
                              {analysis.topLoser.team === 'Real' ? 'Real Madrid' : 'Liverpool FC'} • {p?.position || (analysis.topLoser.isGk ? 'GK' : 'O\'yinchi')}
                            </div>
                          </div>
                        </div>

                        {/* NIMA UCHUN REYTING TUSHDI? (EXPLANATION) */}
                        <div className="p-3 rounded-xl bg-black/40 border border-red-500/15 space-y-1 text-xs">
                          <div className="text-[10px] font-mono uppercase text-red-400/90 font-bold">
                            ⚠️ Nima uchun reyting tushdi va sababi:
                          </div>
                          <p className="text-zinc-300 leading-relaxed font-sans text-xs">
                            {analysis.topLoser.reason}
                          </p>
                          {analysis.topLoser.conceded > 0 && (
                            <div className="text-[11px] font-mono text-zinc-400 pt-1">
                              Hisob-kitob: {analysis.topLoser.conceded} o'tkazilgan gol × (-0.5) = -{(analysis.topLoser.conceded * 0.5).toFixed(1)} ball
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-xs text-zinc-400">Pasayish qayd etilmadi.</div>
                )}
              </div>

              {/* 🔺 MATCH QAHRAMONI / ENG KO'P REYTING KO'TARGAN FUTBOLCHI (MVP) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-[#0c1410] to-black border border-emerald-500/30 space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span>🔺</span> Match Qahramoni (MVP)
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {analysis.topGainer ? `+${analysis.topGainer.delta} ball` : '0 ball'}
                  </span>
                </div>

                {analysis.topGainer ? (
                  (() => {
                    const p = getPlayer(analysis.topGainer.playerId);
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-emerald-500/30 shrink-0">
                            <img
                              src={p?.avatar || "/avatars/asliddin.jpg"}
                              alt={analysis.topGainer.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.src = "/avatars/asliddin.jpg"; }}
                            />
                          </div>
                          <div>
                            <div className="text-base font-black text-white uppercase">
                              {analysis.topGainer.name}
                            </div>
                            <div className="text-xs font-mono text-zinc-400">
                              {analysis.topGainer.team === 'Real' ? 'Real Madrid' : 'Liverpool FC'} • {p?.position || 'O\'yinchi'}
                            </div>
                          </div>
                        </div>

                        {/* NIMA UCHUN REYTING KO'TARILDI? (EXPLANATION) */}
                        <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/15 space-y-1 text-xs">
                          <div className="text-[10px] font-mono uppercase text-emerald-400/90 font-bold">
                            ⭐ Reyting oshish sababi:
                          </div>
                          <p className="text-zinc-300 leading-relaxed font-sans text-xs">
                            {analysis.topGainer.reason}
                          </p>
                          <div className="text-[11px] font-mono text-zinc-400 pt-1">
                            Kiritilgan hissa: {analysis.topGainer.goals || 0} gol, {analysis.topGainer.assists || 0} assist
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-xs text-zinc-400">Qayd etilmadi.</div>
                )}
              </div>

            </div>
          )}

          {/* O'YINNING TO'LIQ ISHTIROKCHILARI KO'RSATGICHLARI */}
          {analysis?.playerDeltas && analysis.playerDeltas.length > 0 && (
            <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06] space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase text-zinc-400">
                Uchrashuvdagi Barcha Ishtirokchilar Balansi
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                {analysis.playerDeltas.map((d) => (
                  <div
                    key={d.playerId}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      d.delta < 0
                        ? 'bg-red-950/15 border-red-500/20 text-red-200'
                        : d.delta > 2
                        ? 'bg-emerald-950/15 border-emerald-500/20 text-emerald-200'
                        : 'bg-white/[0.02] border-white/[0.05] text-zinc-300'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <span className="font-bold text-white block truncate">{d.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {d.goals > 0 ? `${d.goals}G ` : ''}
                        {d.assists > 0 ? `${d.assists}A ` : ''}
                        {d.saves > 0 ? `${d.saves}S ` : ''}
                        {d.conceded > 0 ? `-${d.conceded}C` : ''}
                      </span>
                    </div>
                    <span className={`font-mono font-bold text-xs shrink-0 ${
                      d.delta < 0 ? 'text-red-400' : d.delta > 0 ? 'text-emerald-400' : 'text-zinc-400'
                    }`}>
                      {d.delta >= 0 ? `+${d.delta}` : d.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </section>
  );
}
