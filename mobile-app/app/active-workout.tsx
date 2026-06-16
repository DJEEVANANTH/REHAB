import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Play, Square, Activity, Dumbbell, Clock, Flame } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ActiveWorkout() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  
  const [isTracking, setIsTracking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentSets, setCurrentSets] = useState(0);
  const [calories, setCalories] = useState(0);
  const [formScore, setFormScore] = useState(94);
  
  const targetReps = 15;
  const targetSets = 3;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let repInterval: NodeJS.Timeout;

    if (isTracking) {
      // 1. Duration timer
      timer = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

      // 2. Rep and set simulation (fallback logic from web app)
      let localReps = currentReps;
      let localSets = currentSets;
      
      repInterval = setInterval(() => {
        localReps += 1;
        if (localReps > targetReps) {
          localReps = 1;
          localSets += 1;
          if (localSets >= targetSets) {
            setIsTracking(false);
            Alert.alert("Workout Complete!", "You have finished your rehabilitation session.");
            router.back();
            return;
          } else {
            setCurrentSets(localSets);
          }
        }
        
        setCurrentReps(localReps);
        setCalories(c => c + 3);
        setFormScore(prev => {
          const delta = Math.floor(Math.random() * 5) - 2;
          return Math.max(90, Math.min(98, prev + delta));
        });
      }, 3500);
    }

    return () => {
      clearInterval(timer);
      clearInterval(repInterval);
    };
  }, [isTracking]);

  if (!permission) {
    return <View className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#14b8a6" /></View>;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-white text-center mb-4">We need your permission to show the camera for AI Tracking</Text>
        <TouchableOpacity className="bg-primary px-6 py-3 rounded-xl" onPress={requestPermission}>
          <Text className="text-background font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 py-4 flex-row justify-between items-center z-10">
        <TouchableOpacity onPress={() => router.back()} className="bg-surface p-2 rounded-lg">
          <Text className="text-white font-bold">Back</Text>
        </TouchableOpacity>
        <Text className="text-white font-black text-lg">{title || 'Active Session'}</Text>
        <View className="bg-primary/20 px-3 py-1 rounded-full">
          <Text className="text-primary font-bold text-xs">AI MODE</Text>
        </View>
      </View>

      <View className="flex-1 px-4 pb-4">
        {/* Camera View */}
        <View className="w-full h-3/5 rounded-3xl overflow-hidden bg-black mb-4 border border-outline relative">
          <CameraView style={{ flex: 1 }} facing="front" />
          
          {/* Overlay scanning lines if tracking */}
          {isTracking && (
            <View className="absolute inset-0 border-4 border-primary/50 rounded-3xl" />
          )}
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
          <View className="w-[48%] bg-surface p-4 rounded-2xl items-center border border-outline">
            <Activity color="#14b8a6" size={24} className="mb-2" />
            <Text className="text-white font-black text-2xl">{formScore}%</Text>
            <Text className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Form Score</Text>
          </View>
          <View className="w-[48%] bg-surface p-4 rounded-2xl items-center border border-outline">
            <Flame color="#f97316" size={24} className="mb-2" />
            <Text className="text-white font-black text-2xl">{calories}</Text>
            <Text className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Calories</Text>
          </View>
          <View className="w-[48%] bg-surface p-4 rounded-2xl items-center border border-outline">
            <Dumbbell color="#3b82f6" size={24} className="mb-2" />
            <Text className="text-white font-black text-2xl">{currentSets} / {targetSets}</Text>
            <Text className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Sets</Text>
          </View>
          <View className="w-[48%] bg-surface p-4 rounded-2xl items-center border border-outline">
            <Clock color="#8b5cf6" size={24} className="mb-2" />
            <Text className="text-white font-black text-2xl">{formatTime(duration)}</Text>
            <Text className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Time</Text>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row gap-4 mt-auto">
          {!isTracking ? (
            <TouchableOpacity 
              className="flex-1 bg-primary flex-row items-center justify-center py-4 rounded-2xl"
              onPress={() => setIsTracking(true)}
            >
              <Play color="#041B1A" fill="#041B1A" size={20} className="mr-2" />
              <Text className="text-background font-black uppercase text-lg">Start Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              className="flex-1 bg-error flex-row items-center justify-center py-4 rounded-2xl"
              onPress={() => setIsTracking(false)}
            >
              <Square color="#fff" fill="#fff" size={20} className="mr-2" />
              <Text className="text-white font-black uppercase text-lg">Pause Session</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
