export type Tab = 'home' | 'workouts' | 'ai-detection' | 'favorites' | 'schedule' | 'progress' | 'settings' | 'profile' | 'how-it-works';

export interface ExerciseData {
  id: string;
  title: string;
  muscle: string;
  image: string;
  steps: { title: string, desc: string }[];
  mistakes: string[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO string
  exerciseId: string;
  reps: number;
  sets: number;
  calories: number;
  durationSeconds: number;
  accuracy: number;
}
