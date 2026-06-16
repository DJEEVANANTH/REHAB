import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ShieldCheck, Zap, Video, LineChart, User, CalendarDays, Sparkles, Lock, Heart, Activity } from 'lucide-react';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { EXERCISES } from '../data/exercises';
import { animateCountersIn } from '../animateCounter';

function EmojiStyleIconBadge({
  Icon,
  size = 'md',
  bg = '#FFF5F5',
  border = '#FFD6D6',
  color = '#FF3131',
}: {
  Icon: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md';
  bg?: string;
  border?: string;
  color?: string;
}) {
  const container =
    size === 'sm'
      ? 'h-9 w-9 rounded-2xl'
      : 'h-12 w-12 rounded-2xl';
  const icon = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div
      className={`${container} flex items-center justify-center shrink-0 border`}
      style={{ backgroundColor: bg, borderColor: border, color }}
    >
      <Icon className={icon} />
    </div>
  );
}


export function Home({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { totalWorkouts, totalCalories, streak, avgAccuracy, history } = useWorkoutHistory();
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 25, 
      scale: shouldReduceMotion ? 1 : 0.96 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: shouldReduceMotion ? 0.3 : 0.65, 
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const heroTextContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: 0.1
      }
    }
  };

  const heroTextChildVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 15 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: shouldReduceMotion ? 0.3 : 0.6, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  const heroCardVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 30, 
      scale: shouldReduceMotion ? 1 : 0.95 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: shouldReduceMotion ? 0.4 : 0.75, 
        ease: [0.16, 1, 0.3, 1], 
        delay: shouldReduceMotion ? 0 : 0.3 
      }
    }
  };

  const ctaVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 35, 
      scale: shouldReduceMotion ? 1 : 0.98 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.4 : 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  useEffect(() => {
    // Reset animated flag so counters can re-animate to correct values when history loads or updates
    const elements = document.querySelectorAll('[data-target]');
    elements.forEach(el => {
      if (el instanceof HTMLElement) {
        delete el.dataset.animated;
      }
    });
    animateCountersIn(document, 1800);
  }, [totalCalories, totalWorkouts, avgAccuracy, streak]);
  
  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Hero Section */}
      <div className="hero-video-banner mb-stack-lg mx-auto">
        <img
          className="hero-background-video"
          src="/images/home_hero.png"
          alt="Precision Rehab Hero"
        />

        <div className="hero-overlay"></div>

        <div className="hero-content">
          <motion.div 
            className="max-w-2xl text-left"
            variants={heroTextContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={heroTextChildVariants} className="inline-block px-3 py-1 bg-white/10 dark:bg-white/5 border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4 backdrop-blur-md">
              POWERED BY REHAB
            </motion.span>
            <motion.h2 variants={heroTextChildVariants} className="text-5xl font-bold text-white leading-tight mb-4 uppercase tracking-tight">
              Precision Rehab.<br/>Accelerated Recovery.
            </motion.h2>
            <motion.p variants={heroTextChildVariants} className="text-lg text-slate-200 max-w-lg mb-8 leading-relaxed">
              Our proprietary computer vision technology analyzes joint angles in real-time to provide clinical-grade feedback on your range of motion and alignment.
            </motion.p>
            <motion.div variants={heroTextChildVariants} className="flex gap-4">
              <button
                onClick={() => onNavigate && onNavigate('workouts')}
                className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-white/10 duration-200 cursor-pointer"
              >
                Begin Rehab Session
              </button>
              <button
                onClick={() => onNavigate && onNavigate('how-it-works')}
                className="px-8 py-4 bg-transparent border border-white/35 hover:border-white text-white font-bold rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Clinical Protocol
              </button>
            </motion.div>
          </motion.div>

          {/* Live Feedback Overlay Card */}
          <motion.div 
            className="absolute bottom-6 right-6 z-20 hidden md:block"
            variants={heroCardVariants}
            initial="hidden"
            animate="visible"
            whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.01, transition: { duration: 0.3 } }}
          >
            <div 
              className="backdrop-blur-md p-6 rounded-2xl shadow-2xl w-80"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Live Feedback</span>
                <div className="h-2 w-2 rounded-full bg-error animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {history && history.length > 0 ? (
                  (() => {
                    const last = history[0];
                    const ex = EXERCISES.find(e => e.id === last.exerciseId);
                    return (
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">REHAB MOVEMENT</p>
                          <p className="text-lg font-bold text-white">{ex ? ex.title : last.exerciseId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">REPS</p>
                          <p className="text-lg font-bold text-white">{last.reps}</p>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">REHAB MOVEMENT</p>
                      <p className="text-lg font-bold text-white">Shoulder Pendulum</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">REPS</p>
                      <p className="text-lg font-bold text-white">10</p>
                    </div>
                  </div>
                )}
                <div className="h-px bg-white/5"></div>
                {history && history.length > 0 ? (
                  (() => {
                    const last = history[0];
                    return (
                      <>
                        <div className="flex justify-between">
                          <div>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">RECOVERY POINTS</p>
                            <p className="font-bold text-white">{last.calories} pts</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">ACCURACY</p>
                            <p className="text-lg font-bold text-white style={{ color: '#84A98C' }}">{last.accuracy}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full">
                          <div className="bg-[#84A98C] h-full rounded-full" style={{ width: `${Math.min(100, last.accuracy)}%` }}></div>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">RECOVERY POINTS</p>
                        <p className="font-bold text-white">35 pts</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">ACCURACY</p>
                        <p className="font-bold text-[#84A98C]">92%</p>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full">
                      <div className="bg-[#84A98C] h-full rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Statistics Row */}
      <motion.section 
        className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="theme-card theme-card-hover p-6 flex flex-col justify-center cursor-pointer border-2 border-red-100 hover:border-red-300 transition-all duration-300"
          variants={cardVariants}
          whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
        >
          <div className="flex items-center gap-2 mb-3">
            <EmojiStyleIconBadge Icon={Heart} size="sm" bg="rgba(255,49,49,0.15)" border="rgba(255,49,49,0.35)" color="#DC2626" />
            <p className="text-xs font-bold text-primary uppercase tracking-widest truncate">Recovery Points</p>
          </div>
          <h3
            className="text-3xl font-bold text-red-600 stat-value"
            data-target={totalCalories}
            data-format="locale"
          >
            0
          </h3>
        </motion.div>
        <motion.div 
          className="theme-card theme-card-hover p-6 flex flex-col justify-center cursor-pointer border-2 border-blue-100 hover:border-blue-300 transition-all duration-300"
          variants={cardVariants}
          whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
        >
          <div className="flex items-center gap-2 mb-3">
            <EmojiStyleIconBadge Icon={Activity} size="sm" bg="rgba(47,107,255,0.15)" border="rgba(47,107,255,0.35)" color="#2563EB" />
            <p className="text-xs font-bold text-primary uppercase tracking-widest truncate">Sessions Completed</p>
          </div>
          <h3 className="text-3xl font-bold text-blue-600 stat-value" data-target={totalWorkouts}>
            0
          </h3>
        </motion.div>
        <motion.div 
          className="theme-card theme-card-hover p-6 flex flex-col justify-center cursor-pointer border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300"
          variants={cardVariants}
          whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
        >
          <div className="flex items-center gap-2 mb-3">
            <EmojiStyleIconBadge Icon={Sparkles} size="sm" bg="rgba(18,185,129,0.15)" border="rgba(18,185,129,0.35)" color="#059669" />
            <p className="text-xs font-bold text-primary uppercase tracking-widest truncate">Avg Accuracy</p>
          </div>
          <h3 className="text-3xl font-bold text-emerald-600 stat-value" data-target={avgAccuracy} data-suffix="%">
            0%
          </h3>
        </motion.div>
        <motion.div 
          className="theme-card theme-card-hover p-6 flex flex-col justify-center cursor-pointer border-2 border-purple-100 hover:border-purple-300 transition-all duration-300"
          variants={cardVariants}
          whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
        >
          <div className="flex items-center gap-2 mb-3">
            <EmojiStyleIconBadge Icon={Zap} size="sm" bg="rgba(124,59,255,0.15)" border="rgba(124,59,255,0.35)" color="#7C3AED" />
            <p className="text-xs font-bold text-primary uppercase tracking-widest truncate">Day Streak</p>
          </div>
          <h3 className="text-3xl font-bold text-purple-600 stat-value" data-target={streak}>
            0
          </h3>
        </motion.div>
      </motion.section>

      {/* Feature Cards */}
      <section className="mb-stack-lg">
        <motion.h3 
          className="text-2xl font-bold text-primary mb-6"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Cutting-Edge Features
        </motion.h3>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          <motion.div 
            className="theme-card theme-card-hover p-8 flex flex-col justify-start cursor-pointer border-2 border-red-100 hover:border-red-300 transition-all duration-300"
            variants={cardVariants}
            whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
          >
            <div className="mb-6">
              <EmojiStyleIconBadge Icon={Video} bg="rgba(220,38,38,0.12)" border="rgba(220,38,38,0.30)" color="#DC2626" />
            </div>
            <h4 className="text-lg font-extrabold text-primary mb-3">Real-time Joint Angle Tracking</h4>
            <p className="text-secondary leading-relaxed text-sm">High-frequency joint tracking ensures your movements are monitored with sub-degree precision during every rehabilitation session.</p>
          </motion.div>
          <motion.div 
            className="theme-card theme-card-hover p-8 flex flex-col justify-start cursor-pointer border-2 border-blue-100 hover:border-blue-300 transition-all duration-300"
            variants={cardVariants}
            whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
          >
            <div className="mb-6">
              <EmojiStyleIconBadge Icon={LineChart} bg="rgba(37,99,235,0.12)" border="rgba(37,99,235,0.30)" color="#2563EB" />
            </div>
            <h4 className="text-lg font-extrabold text-primary mb-3">Recovery Diagnostics</h4>
            <p className="text-secondary leading-relaxed text-sm">Automatically log every repetition, range of motion, and hold duration. Visualize your recovery progression with detailed charts.</p>
          </motion.div>
          <motion.div 
            className="theme-card theme-card-hover p-8 flex flex-col justify-start cursor-pointer border-2 border-purple-100 hover:border-purple-300 transition-all duration-300"
            variants={cardVariants}
            whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
          >
            <div className="mb-6">
              <EmojiStyleIconBadge Icon={User} bg="rgba(124,58,237,0.12)" border="rgba(124,58,237,0.30)" color="#7C3AED" />
            </div>
            <h4 className="text-lg font-extrabold text-primary mb-3">Postural Alignment Guides</h4>
            <p className="text-secondary leading-relaxed text-sm">Receive instant visual or audio alerts when your alignment deviates from clinical safety ranges to prevent compensation injuries.</p>
          </motion.div>
          <motion.div 
            className="theme-card theme-card-hover p-8 flex flex-col justify-start cursor-pointer border-2 border-amber-100 hover:border-amber-300 transition-all duration-300"
            variants={cardVariants}
            whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
          >
            <div className="mb-6">
              <EmojiStyleIconBadge Icon={CalendarDays} bg="rgba(217,119,6,0.12)" border="rgba(217,119,6,0.30)" color="#D97706" />
            </div>
            <h4 className="text-lg font-extrabold text-primary mb-3">Clinical Rehab Protocols</h4>
            <p className="text-secondary leading-relaxed text-sm">Adaptive programming tailored to your specific injury recovery stage, designed by clinical experts and updated dynamically.</p>
          </motion.div>
          <motion.div 
            className="theme-card theme-card-hover p-8 flex flex-col justify-start cursor-pointer border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300"
            variants={cardVariants}
            whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
          >
            <div className="mb-6">
              <EmojiStyleIconBadge Icon={Sparkles} bg="rgba(5,150,105,0.12)" border="rgba(5,150,105,0.30)" color="#059669" />
            </div>
            <h4 className="text-lg font-extrabold text-primary mb-3">Mobility & ROM Metrics</h4>
            <p className="text-secondary leading-relaxed text-sm">Analyze joint flexion and extension, movement velocity, and range of motion (ROM) improvement trends over time.</p>
          </motion.div>
          <motion.div 
            className="theme-card theme-card-hover p-8 flex flex-col justify-start cursor-pointer border-2 border-cyan-100 hover:border-cyan-300 transition-all duration-300"
            variants={cardVariants}
            whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
          >
            <div className="mb-6">
              <EmojiStyleIconBadge Icon={Lock} bg="rgba(8,145,178,0.12)" border="rgba(8,145,178,0.30)" color="#0891B2" />
            </div>
            <h4 className="text-lg font-extrabold text-primary mb-3">Secure & Private</h4>
            <p className="text-secondary leading-relaxed text-sm">On-device edge processing ensures your video data never leaves your device, maintaining absolute privacy for your medical recovery.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <motion.section 
        className="rounded-3xl p-12 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 12px 40px rgba(13, 148, 136, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
        variants={ctaVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.005, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to accelerate your recovery journey?</h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto opacity-90">Join thousands of patients using precision tracking to safely restore mobility and rebuild strength.</p>
          <div className="flex justify-center">
            <button 
              onClick={() => onNavigate && onNavigate('workouts')}
              className="px-10 py-4 bg-white hover:bg-slate-100 text-slate-900 font-extrabold rounded-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-md"
            >
              Begin Rehab Now
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
