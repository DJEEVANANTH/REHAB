import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  location: string;
  age: number;
  weight: number;
  height: number;
  bodyFat: number;
  fitnessGoal: string;
  bio: string;
  joinedDate: string;
  avatarUrl: string;
  stats: {
    caloriesBurned: number;
    workoutsDone: number;
    avgAccuracy: number;
    dayStreak: number;
  };
}

const defaultProfile: UserProfile = {
  fullName: 'Alex Mercer',
  username: '@alexmercer_fit',
  email: 'alex.mercer@example.com',
  phoneNumber: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  age: 28,
  weight: 78,
  height: 182,
  bodyFat: 14,
  fitnessGoal: 'Hypertrophy & Strength',
  bio: 'Dedicated athlete focusing on strength conditioning and explosive power. Training for regional decathlon qualifiers. Leveraging AI biomechanical analysis to perfect my snatch and clean & jerk forms. Always striving for 1% daily improvement.',
  joinedDate: 'Jan 2024',
  avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
  stats: {
    caloriesBurned: 12480,
    workoutsDone: 42,
    avgAccuracy: 88.4,
    dayStreak: 15,
  }
};

// Maps Supabase snake_case profiles to React camelCase UserProfile type
export function mapSupabaseToProfile(dbProfile: any, email: string): Partial<UserProfile> {
  if (!dbProfile) return {};
  return {
    fullName: dbProfile.full_name || '',
    username: dbProfile.username || `@${email.split('@')[0]}_fit`,
    email: dbProfile.email || email,
    phoneNumber: dbProfile.phone_number || '',
    location: dbProfile.location || '',
    age: Number(dbProfile.age) || 28,
    weight: Number(dbProfile.weight) || 78,
    height: Number(dbProfile.height) || 182,
    bodyFat: Number(dbProfile.body_fat) || 14,
    fitnessGoal: dbProfile.fitness_goal || 'Hypertrophy & Strength',
    bio: dbProfile.bio || '',
    joinedDate: dbProfile.joined_date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    avatarUrl: dbProfile.avatar_url || 'https://lh3.googleusercontent.com/a/default-user',
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('user_profile');
      return stored ? JSON.parse(stored) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    // 1. Update local state immediately for instant Optimistic UI
    let updated: UserProfile;
    setProfile(prev => {
      updated = { ...prev, ...newProfile };
      localStorage.setItem('user_profile', JSON.stringify(updated));
      try {
        window.dispatchEvent(new CustomEvent('user_profile_updated', { detail: updated }));
      } catch (e) {}
      return updated;
    });

    // 2. Async sync to Supabase if authenticated
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const supabaseData = {
          id: session.user.id,
          full_name: newProfile.fullName,
          username: newProfile.username,
          email: newProfile.email || session.user.email,
          phone_number: newProfile.phoneNumber,
          location: newProfile.location,
          age: newProfile.age,
          weight: newProfile.weight,
          height: newProfile.height,
          body_fat: newProfile.bodyFat,
          fitness_goal: newProfile.fitnessGoal,
          bio: newProfile.bio,
          avatar_url: newProfile.avatarUrl,
          joined_date: newProfile.joinedDate,
          updated_at: new Date().toISOString()
        };

        // Filter out undefined/null keys to prevent erasing existing database fields
        const filteredData = Object.fromEntries(
          Object.entries(supabaseData).filter(([_, v]) => v !== undefined && v !== null)
        );

        if (Object.keys(filteredData).length > 0) {
          // Use upsert so a profile row is created if it doesn't exist yet
          const { error } = await supabase
            .from('profiles')
            .upsert(filteredData, { onConflict: 'id' });
          
          if (error) {
            console.error('Supabase profile upsert sync failed:', error.message);
          }
        }
      }
    } catch (err) {
      console.error('Database connection profile update error:', err);
    }
  };

  useEffect(() => {
    const handler = (e: any) => {
      if (e && e.detail) {
        setProfile(e.detail);
      }
    };
    window.addEventListener('user_profile_updated', handler as EventListener);
    return () => window.removeEventListener('user_profile_updated', handler as EventListener);
  }, []);

  return { profile, updateProfile };
}
