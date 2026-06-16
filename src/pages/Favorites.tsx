import React from 'react';
import { Heart, Clock, Flame, Download, Trash2 } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { ExerciseData } from '../types';

export function Favorites({ onLaunchActivity }: { onLaunchActivity?: (ex?: ExerciseData) => void }) {
  const { favoriteExercises, toggleFavorite } = useFavorites();

  return (
    <div className="w-full flex flex-col lg:flex-row gap-gutter">
      <div className="flex-1 space-y-stack-lg">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight uppercase">Favorite Workouts</h2>
          <p className="text-on-surface-variant mt-2 text-lg">Refine your peak performance with curated routines.</p>
        </div>

        {favoriteExercises.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-outline rounded-3xl pb-12">
            <Heart className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary mb-2">No Favorites Yet</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto">Explore workouts and tap the heart icon to build your custom collection of routines.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {favoriteExercises.map((w) => (
              <div 
                key={w.id} 
                className="theme-card theme-card-hover overflow-hidden flex flex-col group transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-44 overflow-hidden bg-slate-900 border-b border-outline">
                  <img 
                    src={w.image} 
                    alt={w.title} 
                    loading="lazy"
                    onError={(e) => { 
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop'; 
                    }}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/60 border border-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white shadow-sm uppercase tracking-wider">{w.muscle}</span>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(w.id)}
                    className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                    style={{ cursor: 'pointer' }}
                  >
                    <Heart className="w-4 h-4 fill-error text-error" />
                  </button>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-primary mb-3">{w.title}</h3>
                  <div className="flex mb-6">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                      <Clock className="w-4 h-4" /> Recommended Form
                    </span>
                  </div>
                  <div className="mt-auto flex justify-between gap-3">
                    <button
                      onClick={() => onLaunchActivity && onLaunchActivity(w)}
                      className="w-max px-4 py-2.5 bg-primary hover:bg-[#0F766E] dark:hover:bg-[#E6FBF7] text-white dark:text-[#041B1A] rounded-xl text-sm font-bold active:scale-95 transition-all cursor-pointer"
                    >
                      Start
                    </button>
                    <button 
                      onClick={() => toggleFavorite(w.id)} 
                      className="w-10 h-10 shrink-0 border border-outline text-on-surface-variant rounded-xl flex items-center justify-center hover:bg-error/10 hover:text-error hover:border-error/30 transition-colors"
                      style={{ cursor: 'pointer' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Panel */}
      <aside className="w-full lg:w-[320px] space-y-gutter">
        <div 
          className="theme-card p-8 shadow-sm flex flex-col"
        >
          <h3 className="text-xl font-bold text-primary mb-6">Favorite Statistics</h3>
          
          <div className="space-y-4 mb-8">
            <div 
              className="p-5 bg-background rounded-2xl border border-outline-variant shadow-sm"
            >
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Total Workouts Saved</span>
              <span className="text-5xl font-bold text-primary">{favoriteExercises.length}</span>
            </div>
          </div>

          <div>
             <h4 className="text-sm font-bold text-primary mb-4">Muscle Focus Distribution</h4>
             <div className="space-y-4">
                {[ { label: 'Chest & Arms', val: '45%' }, { label: 'Lower Body', val: '30%' }, { label: 'Core', val: '25%' } ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-on-surface-variant">{m.label}</span>
                      <span className="text-xs font-bold text-primary">{m.val}</span>
                    </div>
                    <div className="h-1.5 w-full bg-outline-variant rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: m.val }}></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
          
          <button 
            className="w-full mt-8 py-3.5 border border-outline bg-surface text-primary rounded-xl font-bold text-sm hover:bg-hover-bg transition-colors flex items-center justify-center gap-2"
            style={{ cursor: 'pointer' }}
          >
             <Download className="w-4 h-4" /> Export Routine Data
          </button>
        </div>

        {/* AI Advice Card */}
        <div 
          className="p-8 rounded-3xl text-white shadow-lg relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(13, 148, 136, 0.15)',
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <h3 className="text-xl font-bold mb-3 relative z-10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Coach AI Advice
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed mb-6 font-medium relative z-10">
            "Your favorite workouts lean heavily on upper body pushing. To maintain skeletal balance, I recommend adding more posterior chain exercises to your saved list."
          </p>
          <button 
            className="px-5 py-2.5 rounded-full text-xs font-bold transition-all relative z-10 border border-white/20 bg-white/10 hover:bg-white/20 text-white"
            style={{ cursor: 'pointer' }}
          >
            View Suggestions
          </button>
        </div>
      </aside>
    </div>
  );
}
