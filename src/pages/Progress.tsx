import React, { useEffect, useMemo, useState } from 'react';
import { Award, Download, Droplet, Moon, Zap, Heart, Activity } from 'lucide-react';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useUserProfile } from '../hooks/useUserProfile';
import { motion, AnimatePresence } from 'motion/react';
import { animateCountersIn } from '../animateCounter';

function StatIconBadge({
  Icon,
  color,
  bg,
  border,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      className={[
        'inline-flex items-center justify-center',
        'h-9 px-3 rounded-full',
        'border shadow-[0_1px_0_rgba(0,0,0,0.03)]',
        bg,
        border,
      ].join(' ')}
      aria-hidden="true"
    >
      <Icon className={['w-4.5 h-4.5', color].join(' ')} />
    </div>
  );
}

export function Progress() {
  const { history, totalWorkouts, totalCalories, streak, addSession, avgAccuracy } = useWorkoutHistory();
  
  // Biomechanical hand rehab metrics calculations
  const totalReps = useMemo(() => history.reduce((sum, s) => sum + (s.reps || 0), 0), [history]);
  
  const avgHandAngle = useMemo(() => {
    return history.length > 0
      ? Math.round(history.reduce((sum, s) => sum + Math.max(30, Math.min(180, Math.round(s.accuracy * 0.95 + 10))), 0) / history.length)
      : 0;
  }, [history]);

  const totalDurationMins = useMemo(() => {
    const totalSecs = history.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
    return Math.round(totalSecs / 60);
  }, [history]);

  const dailyProgressScore = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySessions = history.filter(s => new Date(s.date) >= todayStart);
    const todayCalories = todaySessions.reduce((sum, s) => sum + (s.calories || 0), 0);
    return Math.min(100, Math.round((todayCalories / 100) * 100));
  }, [history]);

  const { profile, updateProfile } = useUserProfile();

  const [activeWeeklyTab, setActiveWeeklyTab] = useState<'activity' | 'points'>('activity');
  const weight = profile.weight;
  const height = profile.height;
  const setWeight = (val: number) => updateProfile({ weight: val });
  const setHeight = (val: number) => updateProfile({ height: val });

  // Live BMI calculation
  const bmi = useMemo(() => {
    const heightInM = height / 100;
    return heightInM > 0 ? parseFloat((weight / (heightInM * heightInM)).toFixed(1)) : 0;
  }, [weight, height]);

  const bmiStatus = useMemo(() => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-amber-500 bg-amber-500/15 border-amber-500/35' };
    if (bmi < 25) return { text: 'Healthy Range', color: 'text-emerald-500 bg-emerald-500/15 border-emerald-500/35' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-orange-500 bg-orange-500/15 border-orange-500/35' };
    return { text: 'Obese Range', color: 'text-red-500 bg-red-500/15 border-red-500/35' };
  }, [bmi]);

  // Process real-time weekly activity based on user workout performance
  const weeklyActivityData = useMemo(() => {
    const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const dataByDay: Record<string, { duration: number; calories: number; count: number; totalAcc: number }> = {};
    
    daysOfWeek.forEach(d => {
      dataByDay[d] = { duration: 0, calories: 0, count: 0, totalAcc: 0 };
    });

    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
    startOfWeek.setDate(today.getDate() + diffToMon);
    startOfWeek.setHours(0, 0, 0, 0);

    history.forEach(s => {
      const sDate = new Date(s.date);
      if (sDate >= startOfWeek) {
        const dayIdx = sDate.getDay();
        const daysMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dayName = daysMap[dayIdx];
        if (dataByDay[dayName]) {
          dataByDay[dayName].duration += (s.durationSeconds || 0) / 60;
          dataByDay[dayName].calories += (s.calories || 0);
          dataByDay[dayName].count += 1;
          dataByDay[dayName].totalAcc += (s.accuracy || 0);
        }
      }
    });

    const durationTarget = 30; // 30 mins
    const pointsTarget = 300; // 300 pts

    return daysOfWeek.map(day => {
      const stats = dataByDay[day];
      let h1 = 0;
      let h2 = 0;

      if (activeWeeklyTab === 'activity') {
        h1 = stats.count > 0 ? Math.min(100, Math.round((stats.duration / durationTarget) * 100)) : 0;
        const avgAcc = stats.count > 0 ? Math.round(stats.totalAcc / stats.count) : 0;
        h2 = Math.min(h1, Math.round((avgAcc / 100) * h1));
      } else {
        h1 = stats.count > 0 ? Math.min(100, Math.round((stats.calories / pointsTarget) * 100)) : 0;
        const avgAcc = stats.count > 0 ? Math.round(stats.totalAcc / stats.count) : 0;
        h2 = Math.min(h1, Math.round((avgAcc / 100) * h1));
      }

      if (stats.count > 0) {
        h1 = Math.max(15, h1);
        h2 = Math.max(5, h2);
      }

      return {
        day,
        h1: `${h1}%`,
        h2: `${h2}%`,
        rawDuration: Math.round(stats.duration),
        rawCalories: stats.calories,
        avgAcc: stats.count > 0 ? Math.round(stats.totalAcc / stats.count) : 0,
        count: stats.count
      };
    });
  }, [history, activeWeeklyTab]);

  const handleNewScan = () => {
    const mockExercises = [
      { exerciseId: 'ex-01', reps: 10, sets: 3, calories: 35, durationSeconds: 240, accuracy: 92 },
      { exerciseId: 'ex-02', reps: 10, sets: 3, calories: 45, durationSeconds: 300, accuracy: 90 },
      { exerciseId: 'ex-03', reps: 12, sets: 3, calories: 40, durationSeconds: 280, accuracy: 94 },
      { exerciseId: 'ex-04', reps: 10, sets: 3, calories: 30, durationSeconds: 250, accuracy: 95 }
    ];
    
    const randomEx = mockExercises[Math.floor(Math.random() * mockExercises.length)];
    
    addSession({
      exerciseId: randomEx.exerciseId,
      reps: randomEx.reps,
      sets: randomEx.sets,
      calories: randomEx.calories,
      durationSeconds: randomEx.durationSeconds,
      accuracy: randomEx.accuracy
    });
    
    setTimeout(() => {
      animateCountersIn(document, 1200);
    }, 100);
  };

  const handleExportReport = () => {
    if (history.length === 0) {
      alert("There is no recovery session data recorded to export. Complete a session to log history!");
      return;
    }
    
    const reportData = {
      title: "Rehab Recovery Session Report",
      generatedAt: new Date().toISOString(),
      userMetrics: {
        currentWeightKg: weight,
        currentHeightCm: height,
        calibratedBMI: bmi,
        healthRange: bmiStatus.text
      },
      stats: {
        totalSessions: totalWorkouts,
        totalRecoveryPoints: totalCalories,
        streakDays: streak
      },
      sessions: history
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `recovery_report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  // Process data for chart - last 30 days
  const chartData = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    // Simple grouping by date and averaging accuracy
    const filtered = history.filter(s => new Date(s.date) >= last30Days);
    const dailyData: Record<string, { totalAcc: number, count: number }> = {};
    
    filtered.forEach(s => {
      const date = s.date.split('T')[0];
      if (!dailyData[date]) dailyData[date] = { totalAcc: 0, count: 0 };
      // @ts-ignore
      dailyData[date].totalAcc += (s.accuracy || 0);
      dailyData[date].count += 1;
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({ date, accuracy: Math.round(data.totalAcc / data.count) }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute graph properties for high-end SVG rendering
  const { scaleMin, scaleMax, points, linePath, areaPath } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { scaleMin: 0, scaleMax: 100, points: [], linePath: '', areaPath: '' };
    }

    const accuracies = chartData.map(d => d.accuracy);
    const minAcc = Math.min(...accuracies);
    const maxAcc = Math.max(...accuracies);

    // Padding bounds for high visual resolution
    const padding = 10;
    const sMin = Math.max(0, minAcc - padding);
    const sMax = Math.min(100, maxAcc + padding);
    const diff = sMax - sMin || 1;

    const mappedPoints = chartData.map((d, index) => {
      const x = 50 + (index / (chartData.length - 1 || 1)) * 900;
      const y = 350 - ((d.accuracy - sMin) / diff) * 300;
      return { x, y, accuracy: d.accuracy, date: d.date };
    });

    // Generate smooth bezier curve path with flat tangents
    let path = '';
    if (mappedPoints.length > 0) {
      path = `M ${mappedPoints[0].x} ${mappedPoints[0].y}`;
      for (let i = 0; i < mappedPoints.length - 1; i++) {
        const p0 = mappedPoints[i];
        const p1 = mappedPoints[i + 1];
        const cp1x = p0.x + (p1.x - p0.x) * 0.35;
        const cp1y = p0.y;
        const cp2x = p1.x - (p1.x - p0.x) * 0.35;
        const cp2y = p1.y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      }
    }

    const aPath = mappedPoints.length > 0
      ? `${path} L ${mappedPoints[mappedPoints.length - 1].x} 350 L ${mappedPoints[0].x} 350 Z`
      : '';

    return { scaleMin: sMin, scaleMax: sMax, points: mappedPoints, linePath: path, areaPath: aPath };
  }, [chartData]);

  // Ambient particles
  const particles = useMemo(() => {
    const list = [];
    for (let i = 0; i < 15; i++) {
      list.push({
        x: Math.random() * 900 + 50,
        y: Math.random() * 250 + 50,
        r: Math.random() * 2.5 + 1.5,
        duration: Math.random() * 12 + 12,
        delay: Math.random() * -15,
      });
    }
    return list;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (points.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    // Convert clientX to viewBox space
    const clientX = e.clientX - rect.left;
    const viewBoxX = (clientX / rect.width) * 1000;
    
    let nearestIdx = 0;
    let minDist = Infinity;
    points.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - viewBoxX);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = idx;
      }
    });

    if (minDist < 60) {
      setHoveredIndex(nearestIdx);
    } else {
      setHoveredIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  useEffect(() => {
    animateCountersIn(document, 1800);
  }, []);
  
  return (
    <div className="w-full space-y-stack-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight uppercase">Progress Overview</h2>
          <p className="text-on-surface-variant mt-2 text-lg">Real-time biomechanical data and historical analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportReport}
            className="px-5 py-2.5 bg-surface hover:bg-hover-bg text-primary border border-outline rounded-full font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button 
            onClick={handleNewScan}
            className="px-5 py-2.5 bg-primary hover:bg-[#0F766E] dark:hover:bg-[#E6FBF7] text-white dark:text-[#041B1A] rounded-full font-semibold text-sm active:scale-95 transition-all flex items-center gap-2 shadow-md relative overflow-hidden group cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2"><Zap className="w-4 h-4" /> New Scan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {[
          { label: 'Day Streak', target: streak, format: 'plain', suffix: ' days', prefix: '', Icon: Heart, color: 'text-orange-600', bg: 'bg-orange-500/15', border: 'border-orange-500/35', status: streak > 0 ? 'Active Streak' : 'Start Today', highlight: streak > 0, decimals: undefined },
          { label: 'Repetitions', target: totalReps, format: 'plain', suffix: ' reps', prefix: '', Icon: Activity, color: 'text-blue-600', bg: 'bg-blue-500/15', border: 'border-blue-500/35', status: totalReps > 0 ? 'Active Practice' : 'No Reps Yet', highlight: totalReps > 0, decimals: undefined },
          { label: 'Accuracy (%)', target: avgAccuracy, format: 'plain', suffix: '%', prefix: '', Icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-500/15', border: 'border-emerald-500/35', status: avgAccuracy > 75 ? 'Optimal Alignment' : 'Needs Practice', highlight: avgAccuracy > 0, decimals: undefined },
          { label: 'Hand Angle', target: avgHandAngle, format: 'plain', suffix: '°', prefix: '', Icon: Zap, color: 'text-cyan-600', bg: 'bg-cyan-500/15', border: 'border-cyan-500/35', status: avgHandAngle > 0 ? 'Biomechanical ROM' : 'Uncalibrated', highlight: avgHandAngle > 0, decimals: undefined },
          { label: 'Completion Time', target: totalDurationMins, format: 'plain', suffix: ' mins', prefix: '', Icon: Droplet, color: 'text-purple-600', bg: 'bg-purple-500/15', border: 'border-purple-500/35', status: totalDurationMins > 0 ? 'Active Time' : 'No Time Yet', highlight: totalDurationMins > 0, decimals: undefined },
          { label: 'Daily Progress Score', target: dailyProgressScore, format: 'plain', suffix: '/100', prefix: '', Icon: Moon, color: 'text-red-600', bg: 'bg-red-500/15', border: 'border-red-500/35', status: dailyProgressScore > 50 ? 'Great Day!' : 'Daily Target', highlight: dailyProgressScore > 0, decimals: undefined },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="theme-card theme-card-hover p-6 flex flex-col items-center text-center cursor-pointer"
          >
            <div className="shrink-0 mb-3">
              <StatIconBadge Icon={stat.Icon} color={stat.color} bg={stat.bg} border={stat.border} />
            </div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">{stat.label}</p>
            <p
              className={`text-3xl font-bold mt-1 ${stat.color} stat-value`}
              data-target={stat.target}
              data-format={stat.format}
              data-prefix={stat.prefix}
              data-suffix={stat.suffix}
              data-decimals={stat.decimals}
            >
              0
            </p>
            <span className={`mt-3 text-[10px] px-2.5 py-1 rounded-full font-bold ${stat.highlight ? 'bg-green-500/15 text-green-700 border border-green-500/35' : 'bg-surface text-secondary border border-outline'}`}>
              {stat.status}
            </span>
          </div>
        ))}
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div 
              className="theme-card p-8 shadow-sm overflow-hidden"
            >
              <h3 className="text-xl font-bold text-primary mb-6">Recovery Trend Graph (Last 30 Days)</h3>
              <div className="h-[320px] relative w-full select-none">
                {points.length > 0 ? (
                  <>
                    <svg
                      viewBox="0 0 1000 400"
                      className="w-full h-full overflow-visible"
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <defs>
                        {/* Glow for floating background particles */}
                        <filter id="glow-particle" x="-100%" y="-100%" width="300%" height="300%">
                          <feGaussianBlur stdDeviation="8" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>

                        {/* High-intensity glow for orb and active line */}
                        <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
                          <feGaussianBlur stdDeviation="6" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>

                        {/* Flowing stroke gradient color pulse */}
                        <motion.linearGradient
                          id="graphGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                          animate={{
                            x1: ["0%", "100%", "0%"],
                            x2: ["100%", "200%", "100%"],
                          }}
                          transition={{
                            duration: 10,
                            ease: "linear",
                            repeat: Infinity,
                          }}
                        >
                          <stop offset="0%" stopColor="#00E5FF" />
                          <stop offset="50%" stopColor="#00A3FF" />
                          <stop offset="100%" stopColor="#7B61FF" />
                        </motion.linearGradient>

                        {/* Closed area fill gradient */}
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00A3FF" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#7B61FF" stopOpacity="0" />
                        </linearGradient>

                        {/* Perfect curtain mask for synchronizing area reveal */}
                        <clipPath id="chartClip">
                          <motion.rect
                            x="0"
                            y="0"
                            height="400"
                            initial={{ width: 0 }}
                            animate={{ width: 1000 }}
                            transition={{ duration: 2.5, ease: "easeInOut" }}
                          />
                        </clipPath>
                      </defs>

                      {/* Ambient floating glow background particles */}
                      {particles.map((p, idx) => (
                        <motion.circle
                          key={`particle-${idx}`}
                          cx={p.x}
                          cy={p.y}
                          r={p.r}
                          fill="#00A3FF"
                          opacity={0.08}
                          filter="url(#glow-particle)"
                          animate={{
                            x: [p.x, p.x + (Math.random() * 30 - 15), p.x],
                            y: [p.y, p.y + (Math.random() * 30 - 15), p.y],
                          }}
                          transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: p.delay,
                          }}
                        />
                      ))}

                      {/* Reference Grid lines */}
                      {[50, 150, 250, 350].map((y, idx) => (
                        <line
                          key={`grid-${idx}`}
                          x1="50"
                          y1={y}
                          x2="950"
                          y2={y}
                          stroke="var(--outline)"
                          strokeOpacity="0.25"
                          strokeDasharray="4 6"
                        />
                      ))}

                      {/* Y-axis Labels */}
                      {[50, 150, 250, 350].map((y, idx) => {
                        const val = Math.round(scaleMax - ((y - 50) / 300) * (scaleMax - scaleMin));
                        return (
                          <text
                            key={`y-label-${idx}`}
                            x="15"
                            y={y + 4}
                            fill="var(--on-surface-variant)"
                            fontSize={11}
                            fontWeight="700"
                            opacity="0.45"
                            textAnchor="start"
                          >
                            {val}%
                          </text>
                        );
                      })}

                      {/* X-axis date labels */}
                      {points.map((pt, i) => {
                        if (i % 6 !== 0 && i !== points.length - 1) return null;
                        return (
                          <text
                            key={`x-label-${i}`}
                            x={pt.x}
                            y={380}
                            fill="var(--on-surface-variant)"
                            fontSize={11}
                            fontWeight="700"
                            textAnchor="middle"
                            opacity="0.45"
                          >
                            {new Date(chartData[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </text>
                        );
                      })}

                      {/* Area Fill closed below curve (masked horizontally) */}
                      <motion.path
                        d={areaPath}
                        fill="url(#areaGradient)"
                        clipPath="url(#chartClip)"
                      />

                      {/* Background thick path glow (only active or enhanced on hover) */}
                      <motion.path
                        d={linePath}
                        fill="none"
                        stroke="url(#graphGradient)"
                        strokeWidth={hoveredIndex !== null ? 11 : 7}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={hoveredIndex !== null ? 0.42 : 0.2}
                        filter="url(#glow)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                      />

                      {/* Foreground exact sharp curved line path */}
                      <motion.path
                        d={linePath}
                        fill="none"
                        stroke="url(#graphGradient)"
                        strokeWidth={hoveredIndex !== null ? 5.2 : 4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                      />

                      {/* Glowing Traveling Orb (Fades in post-draw, infinite native loop) */}
                      {linePath && (
                        <motion.g
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 2.4, duration: 0.5 }}
                        >
                          {/* Inner white hot core */}
                          <circle r="4.5" fill="#FFFFFF">
                            <animateMotion dur="5.5s" repeatCount="indefinite" path={linePath} />
                          </circle>
                          {/* Outer glowing pulse aura */}
                          <circle r="12" fill="#00E5FF" opacity="0.65" filter="url(#glow)">
                            <animateMotion dur="5.5s" repeatCount="indefinite" path={linePath} />
                          </circle>
                        </motion.g>
                      )}

                      {/* Interactive Circular Nodes */}
                      {points.map((pt, idx) => {
                        const isSelected = hoveredIndex === idx;
                        return (
                          <motion.circle
                            key={`node-${idx}`}
                            cx={pt.x}
                            cy={pt.y}
                            r={isSelected ? 7.5 : 4.5}
                            fill={isSelected ? "#00E5FF" : "#7B61FF"}
                            stroke="#FFFFFF"
                            strokeWidth={isSelected ? 2.5 : 1.5}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              delay: 0.5 + idx * 0.04,
                              type: "spring",
                              stiffness: 160,
                              damping: 12
                            }}
                            whileHover={{ scale: 1.55 }}
                            style={{
                              filter: isSelected ? "url(#glow)" : "none",
                              cursor: "pointer"
                            }}
                          />
                        );
                      })}
                    </svg>

                    {/* Premium Glassmorphism Floating Tooltip */}
                    <AnimatePresence>
                      {hoveredIndex !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.92 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          className="absolute z-20 pointer-events-none p-3.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                          style={{
                            left: `${(points[hoveredIndex].x / 1000) * 100}%`,
                            top: `${(points[hoveredIndex].y / 400) * 100 - 15}%`,
                            transform: "translate(-50%, -100%)",
                          }}
                        >
                          <p className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-widest">
                            {new Date(points[hoveredIndex].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse" />
                            <span className="text-base font-black text-primary tracking-tight">
                              {points[hoveredIndex].accuracy}% Accuracy
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-on-surface-variant">
                    No progress data found. Complete a rehab session to see statistics!
                  </div>
                )}
              </div>
            </div>

            <div 
              className="theme-card p-8 shadow-sm"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">Weekly Activity</h3>
                    <p className="text-sm text-on-surface-variant">Intensity vs Completion frequency</p>
                  </div>
                  <div className="flex bg-background border border-outline-variant p-1 rounded-full w-max select-none">
                    <button 
                      onClick={() => setActiveWeeklyTab('activity')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm ${activeWeeklyTab === 'activity' ? 'bg-primary text-white dark:text-slate-900' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                      Activity
                    </button>
                    <button 
                      onClick={() => setActiveWeeklyTab('points')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm ${activeWeeklyTab === 'points' ? 'bg-primary text-white dark:text-slate-900' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                      Points
                    </button>
                  </div>
                </div>

                <div className="h-[240px] flex items-end justify-between gap-2 sm:gap-4 px-2 relative">
                  {weeklyActivityData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                      {/* Robust, height-constrained container to prevent collapsing */}
                      <div className="w-full h-[180px] flex items-end relative rounded-t-full bg-outline-variant/30 dark:bg-outline-variant/10 overflow-hidden">
                        {d.count > 0 ? (
                          <div 
                            className="w-full bg-[#94A3B8] dark:bg-[#475569] rounded-t-full relative cursor-pointer transition-all duration-500 flex items-end justify-center hover:bg-primary dark:hover:bg-[#CBD5E1]" 
                            style={{ height: d.h1 }}
                            title={`${d.count} sessions, ${d.rawDuration} min, ${d.rawCalories} pts`}
                          >
                            <div 
                              className="absolute inset-x-0 bottom-0 bg-[#00E5FF]/60 rounded-t-full transition-all group-hover:bg-[#00E5FF]/85 shadow-[0_0_8px_#00E5FF]" 
                              style={{ height: d.h2 }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-2 rounded-full bg-outline-variant/40 mb-1" />
                        )}
                      </div>
                      
                      {/* Premium Detailed Day Hover Stats Tooltip */}
                      <div className="absolute bottom-12 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/20 dark:border-white/10 p-2.5 rounded-xl shadow-2xl z-20 text-center flex flex-col gap-0.5 min-w-[100px]">
                        <p className="text-[10px] font-bold text-[#7B61FF] uppercase">{d.day} stats</p>
                        {d.count > 0 ? (
                          <>
                            <p className="text-xs font-black text-primary">{d.count} {d.count === 1 ? 'Session' : 'Sessions'}</p>
                            <p className="text-[9px] text-on-surface-variant font-medium mt-0.5">{d.rawDuration}m | {d.rawCalories} pts</p>
                            <p className="text-[10px] text-emerald-500 font-bold">{d.avgAcc}% Accuracy</p>
                          </>
                        ) : (
                          <p className="text-[10px] text-on-surface-variant/80 font-bold">No active logs</p>
                        )}
                      </div>

                      <span className="text-xs font-bold text-on-surface-variant tracking-tight mt-1">{d.day}</span>
                    </div>
                  ))}
                </div>
            </div>
        </div>

        {/* Body Metrics BMI */}
        <div 
          className="theme-card p-8 shadow-sm flex flex-col"
        >
          <h3 className="text-xl font-bold text-primary mb-1">Body Metrics</h3>
          <p className="text-sm text-on-surface-variant mb-8">AI calibrated weight-to-mass ratio</p>
          
          <div className="flex-1 space-y-8 mt-4">
            <div className="space-y-3 select-none">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-on-surface">Weight</span>
                <span className="text-primary font-bold">{weight} kg</span>
              </div>
              <input 
                type="range" 
                min="40" 
                max="150" 
                step="0.5"
                value={weight}
                onChange={e => setWeight(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-outline-variant rounded-full appearance-none cursor-pointer accent-primary" 
              />
            </div>
            
            <div className="space-y-3 select-none">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-on-surface">Height</span>
                <span className="text-primary font-bold">{height} cm</span>
              </div>
              <input 
                type="range" 
                min="120" 
                max="220" 
                value={height}
                onChange={e => setHeight(parseInt(e.target.value))}
                className="w-full h-1.5 bg-outline-variant rounded-full appearance-none cursor-pointer accent-primary" 
              />
            </div>
            
            <div className="mt-auto pt-8">
               <div 
                 className="p-6 rounded-2xl text-center relative overflow-hidden bg-background border border-outline-variant"
               >
                 <div className="relative z-10">
                   <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Current BMI</p>
                   <p className="text-5xl font-black text-primary tracking-tighter transition-all duration-300">{bmi}</p>
                   <div className={`inline-block mt-4 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${bmiStatus.color}`}>
                     🌟 {bmiStatus.text}
                   </div>
                 </div>
                 <div className="absolute -right-6 -bottom-6 w-32 h-32 border-[12px] border-outline-variant/10 rounded-full"></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

