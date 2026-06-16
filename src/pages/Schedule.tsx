import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { EXERCISES } from '../data/exercises';
import { ExerciseData } from '../types';

export function Schedule({ onLaunchActivity }: { onLaunchActivity?: (ex?: ExerciseData) => void }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const [schedule, setSchedule] = useState<Record<string, ExerciseData[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('Mon');

  const handleAddWorkout = (day: string) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleSelectExercise = (ex: ExerciseData) => {
    setSchedule(prev => {
      const dayWorkouts = prev[selectedDay] || [];
      return {
        ...prev,
        [selectedDay]: [...dayWorkouts, ex]
      };
    });
    setIsModalOpen(false);
  };

  const handleRemoveExercise = (day: string, idx: number) => {
    setSchedule(prev => {
      const dayWorkouts = prev[day] || [];
      return {
        ...prev,
        [day]: dayWorkouts.filter((_, i) => i !== idx)
      };
    });
  };

  return (
    <div className="w-full relative overflow-hidden h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Workout Schedule</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Plan your week for maximum consistency</p>
        </div>
        <button 
          onClick={() => handleAddWorkout('Mon')}
          className="bg-primary dark:bg-white text-white dark:text-primary font-bold text-sm px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-2 w-max shadow-md cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Add Workout
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 min-h-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-6">
          {days.map((day) => {
            const dayWorkouts = schedule[day] || [];
            return (
              <div 
                key={day} 
                className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 shadow-md dark:shadow-2xl rounded-[32px] p-6 flex flex-col min-h-[350px] transition-all duration-300 hover:shadow-lg dark:hover:border-slate-700"
              >
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">{day}</h3>
                    <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 text-xs font-bold px-2.5 py-0.5 rounded-full">{dayWorkouts.length}</span>
                 </div>
                 
                 {dayWorkouts.length === 0 ? (
                   <button 
                     onClick={() => handleAddWorkout(day)}
                     className="flex-1 w-full border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl flex flex-col items-center justify-center bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all group cursor-pointer p-4"
                   >
                      <Plus className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2 group-hover:text-primary dark:group-hover:text-white transition-colors" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-white transition-colors">Add Workout</span>
                   </button>
                 ) : (
                   <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                     {dayWorkouts.map((ex, idx) => (
                        <div 
                          key={`${ex.id}-${idx}`} 
                          className="relative rounded-2xl p-4 flex gap-4 overflow-hidden group border border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/20 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all duration-300 cursor-pointer" 
                          onClick={() => onLaunchActivity && onLaunchActivity(ex)}
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/5 border border-slate-200 dark:border-slate-800">
                            <img src={ex.image} alt={ex.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{ex.title}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate mb-2">{ex.muscle}</p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onLaunchActivity && onLaunchActivity(ex); }}
                              className="text-xs font-extrabold text-primary dark:text-white hover:opacity-85 transition-opacity w-max"
                              style={{ cursor: 'pointer' }}
                            >
                              START
                            </button>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRemoveExercise(day, idx); }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-800 dark:bg-black/60 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 dark:border-white/10 shadow-sm hover:bg-red-500 hover:text-white"
                            style={{ cursor: 'pointer' }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                     ))}
                     
                     <button 
                       onClick={() => handleAddWorkout(day)}
                       className="w-full mt-2 py-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                     >
                        <Plus className="w-4 h-4" /> Add Another
                     </button>
                   </div>
                 )}
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh] shadow-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-900">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Select Workout</h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Adding to {selectedDay}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-800 dark:text-white transition-colors"
                style={{ cursor: 'pointer' }}
               >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXERCISES.map((ex) => (
                   <button 
                     key={ex.id}
                     onClick={() => handleSelectExercise(ex)}
                     className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/10 hover:bg-slate-100 dark:hover:bg-slate-800/30 text-left transition-all active:scale-[0.98]"
                     style={{ cursor: 'pointer' }}
                   >
                     <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                       <img src={ex.image} alt={ex.title} className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ex.title}</h4>
                       <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-2 py-1 rounded inline-block mt-1">{ex.muscle}</span>
                     </div>
                   </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
