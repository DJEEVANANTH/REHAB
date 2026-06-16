import { useState, useEffect, useRef } from 'react';
import { WorkoutSession } from '../types';
import { supabase } from '../lib/supabaseClient';

export function useWorkoutHistory() {
  const [history, setHistory] = useState<WorkoutSession[]>(() => {
    try {
      const stored = localStorage.getItem('workout_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track whether we have loaded from Supabase for this session
  const loadedFromDB = useRef(false);

  // ── On mount: load history from Supabase if the user is logged in ──
  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return; // Not logged in — keep localStorage data

        const { data, error } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) {
          console.warn('Supabase workout_sessions load failed, using localStorage:', error.message);
          return;
        }

        if (data && data.length > 0) {
          // Map Supabase snake_case → frontend camelCase WorkoutSession shape
          const mapped: WorkoutSession[] = data.map((row: any) => ({
            id: row.id,
            exerciseId: row.exercise_id,
            reps: row.reps ?? 0,
            sets: row.sets ?? 0,
            calories: row.calories ?? 0,
            durationSeconds: row.duration_seconds ?? 0,
            accuracy: row.accuracy ?? 0,
            date: row.created_at,
          }));
          setHistory(mapped);
          localStorage.setItem('workout_history', JSON.stringify(mapped));
        }
        loadedFromDB.current = true;
      } catch (err) {
        console.warn('Supabase workout history load error (offline?):', err);
      }
    };

    loadFromSupabase();
  }, []);

  // ── Persist to localStorage whenever history changes ──
  useEffect(() => {
    localStorage.setItem('workout_history', JSON.stringify(history));
  }, [history]);

  // ── Add a new session: optimistic local update + async Supabase write ──
  const addSession = async (session: Omit<WorkoutSession, 'id' | 'date'>) => {
    const newSession: WorkoutSession = {
      ...session,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
    };

    // 1. Optimistic local update
    setHistory(prev => {
      const next = [newSession, ...prev];
      try {
        window.dispatchEvent(new CustomEvent('workout_history_updated', { detail: next }));
      } catch (e) {}
      return next;
    });

    // 2. Async persist to Supabase
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (authSession?.user) {
        const { error } = await supabase.from('workout_sessions').insert({
          user_id: authSession.user.id,
          exercise_id: session.exerciseId,
          reps: session.reps,
          sets: session.sets,
          calories: session.calories,
          duration_seconds: session.durationSeconds,
          accuracy: session.accuracy,
        });

        if (error) {
          console.warn('Supabase workout session save failed:', error.message);
        }
      }
    } catch (err) {
      console.warn('Supabase workout session write error (offline?):', err);
    }
  };

  // ── Listen for cross-component updates ──
  useEffect(() => {
    const handler = (e: any) => {
      if (e && e.detail) {
        setHistory(e.detail);
      }
    };
    window.addEventListener('workout_history_updated', handler as EventListener);
    return () => window.removeEventListener('workout_history_updated', handler as EventListener);
  }, []);

  // ── Derived stats ──
  const totalWorkouts = history.length;
  const totalCalories = history.reduce((sum, s) => sum + s.calories, 0);
  const avgAccuracy =
    history.length > 0
      ? Math.round(history.reduce((sum, s) => sum + s.accuracy, 0) / history.length)
      : 0;

  // Day streak calculation
  const getStreak = () => {
    if (history.length === 0) return 0;

    const sorted = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let foundTodayOrYesterday = false;

    const uniqueDays = Array.from(
      new Set(
        sorted.map(s => {
          const d = new Date(s.date);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      )
    );

    for (let i = 0; i < uniqueDays.length; i++) {
      const d = new Date(uniqueDays[i]);
      d.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - d.getTime()) / (1000 * 3600 * 24)
      );

      if (i === 0 && diffDays <= 1) {
        streak++;
        foundTodayOrYesterday = true;
      } else if (i > 0 && foundTodayOrYesterday) {
        const prevD = new Date(uniqueDays[i - 1]);
        prevD.setHours(0, 0, 0, 0);
        const gap = Math.floor((prevD.getTime() - d.getTime()) / (1000 * 3600 * 24));
        if (gap === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  };

  const streak = getStreak();

  return { history, addSession, totalWorkouts, totalCalories, streak, avgAccuracy };
}
