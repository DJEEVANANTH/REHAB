import React from 'react';
import { Heart } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { ExerciseData } from '../types';
import { EXERCISES } from '../data/exercises';
import { useFavorites } from '../hooks/useFavorites';

export function Workouts({ onLaunchActivity }: { onLaunchActivity?: (ex: ExerciseData) => void }) {
  const exercises: ExerciseData[] = EXERCISES;
  const { toggleFavorite, isFavorite } = useFavorites();
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

  return (
    <div className="w-full">
      <div className="mb-stack-lg text-center">
        <motion.h2 
          className="text-3xl font-bold text-primary tracking-tight uppercase"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Rehab Exercises
        </motion.h2>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {exercises.map((ex, idx) => {
          const isFav = isFavorite(ex.id);
          const indexNum = idx + 1;
          let levelText = 'Beginner';
          let levelStyle = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
          
          if (indexNum > 70) {
            levelText = 'Advanced';
            levelStyle = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
          } else if (indexNum > 30) {
            levelText = 'Intermediate';
            levelStyle = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
          }

          return (
            <motion.div 
              key={ex.id} 
              className="theme-card theme-card-hover p-4 flex flex-col transition-all duration-300 group cursor-pointer"
              variants={cardVariants}
              whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.015, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className={`border text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${levelStyle}`}>{levelText}</span>
                <span className="text-on-surface-variant text-xs font-bold bg-surface px-2 py-1 rounded-md border border-outline">#{String(indexNum).padStart(2, '0')}</span>
              </div>
              
              <div className="h-40 mb-5 rounded-xl overflow-hidden relative hover-shine-effect bg-slate-900 border border-outline">
                <img 
                  src={ex.image} 
                  alt={ex.title} 
                  loading="lazy"
                  onError={(e) => { 
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop'; 
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
                {/* Subtle dark gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(ex.id); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black transition-colors"
                  title={isFav ? "Remove from favorites" : "Add to favorites"}
                  style={{ cursor: 'pointer' }}
                >
                  <motion.div
                    initial={false}
                    animate={{ scale: isFav ? [1, 1.4, 1] : 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-error text-error' : 'text-white'}`} />
                  </motion.div>
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-primary">{ex.title}</h3>
              <p className="text-on-surface-variant text-xs font-semibold mb-6 uppercase tracking-wider">{ex.muscle}</p>
              
              <button
                onClick={() => onLaunchActivity && onLaunchActivity(ex)}
                className="mt-auto w-full py-3 bg-primary hover:bg-[#0F766E] dark:hover:bg-[#E6FBF7] text-white dark:text-[#041B1A] text-sm active:scale-[0.98] font-bold tracking-wide transition-all shadow-sm rounded-xl cursor-pointer"
              >
                Start
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
