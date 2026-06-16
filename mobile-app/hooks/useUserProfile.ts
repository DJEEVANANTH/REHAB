import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  bio: 'Dedicated athlete focusing on strength conditioning and explosive power.',
  joinedDate: 'Jan 2024',
  avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
  stats: {
    caloriesBurned: 12480,
    workoutsDone: 42,
    avgAccuracy: 88.4,
    dayStreak: 15,
  }
};

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

// Simple event system for React Native since window.dispatchEvent isn't available
type Listener = (profile: UserProfile) => void;
const listeners = new Set<Listener>();

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    // Initial load from storage
    AsyncStorage.getItem('user_profile').then(stored => {
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch (e) {}
      }
    });

    // Subscribe to global updates
    const listener: Listener = (newProfile) => setProfile(newProfile);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    let updated: UserProfile;
    setProfile(prev => {
      updated = { ...prev, ...newProfile };
      AsyncStorage.setItem('user_profile', JSON.stringify(updated));
      listeners.forEach(l => l(updated));
      return updated;
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && updated!) {
        const supabaseData = {
          id: session.user.id,
          full_name: updated.fullName,
          username: updated.username,
          email: updated.email || session.user.email,
          phone_number: updated.phoneNumber,
          location: updated.location,
          age: updated.age,
          weight: updated.weight,
          height: updated.height,
          body_fat: updated.bodyFat,
          fitness_goal: updated.fitnessGoal,
          bio: updated.bio,
          avatar_url: updated.avatarUrl,
          joined_date: updated.joinedDate,
          updated_at: new Date().toISOString()
        };

        const filteredData = Object.fromEntries(
          Object.entries(supabaseData).filter(([_, v]) => v !== undefined && v !== null)
        );

        if (Object.keys(filteredData).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .upsert(filteredData, { onConflict: 'id' });
          if (error) console.error('Supabase profile upsert sync failed:', error.message);
        }
      }
    } catch (err) {
      console.error('Database connection profile update error:', err);
    }
  };

  return { profile, updateProfile };
}
