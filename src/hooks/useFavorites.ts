import { useState, useEffect } from 'react';
import { ExerciseData } from '../types';
import { EXERCISES } from '../data/exercises';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('workout_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('workout_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const favoriteExercises = EXERCISES.filter(ex => favorites.includes(ex.id));

  return { favorites, toggleFavorite, isFavorite, favoriteExercises };
}
