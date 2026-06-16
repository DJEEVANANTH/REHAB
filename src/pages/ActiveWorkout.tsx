import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Play, Square, Save, AlertTriangle, AlertCircle, Plus, Minus, ArrowUp, ArrowDown, ChevronRight, CheckCircle2, ChevronLeft, Brain, Volume2, Timer, Settings, Youtube, Flame, Dumbbell, Zap, Heart, Activity, Maximize } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ExerciseData } from '../types';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { EXERCISES } from '../data/exercises';

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

const numberToWord = (num: number): string => {
  const words = [
    'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
    'Twenty One', 'Twenty Two', 'Twenty Three', 'Twenty Four', 'Twenty Five', 'Twenty Six', 'Twenty Seven', 'Twenty Eight', 'Twenty Nine', 'Thirty'
  ];
  if (num >= 0 && num < words.length) return words[num];
  return String(num);
};

const formatSpokenTime = (secs: number): string => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  
  const parts = [];
  if (h > 0) parts.push(`${h} hour${h > 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} minute${m > 1 ? 's' : ''}`);
  if (s > 0 || parts.length === 0) parts.push(`${s} second${s > 1 ? 's' : ''}`);
  
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts[0]}, ${parts[1]}, and ${parts[2]}`;
};

// Dynamically generated maps to support all 100 rehabilitation exercises
const STEP_IMAGES_MAP: Record<string, string[]> = {};
const STEP_LABELS_MAP: Record<string, string[]> = {};
const YOUTUBE_MAP: Record<string, string> = {};
const YOUTUBE_IDS_MAP: Record<string, string> = {};
const TUTORIAL_IMAGES_MAP: Record<string, string> = {};
const TUTORIAL_CONTENT_MAP: Record<string, { title: string; desc: string; coach: string }> = {};
const EXERCISE_DIFFICULTY_MAP: Record<string, 'Normal' | 'Medium' | 'High'> = {};

EXERCISES.forEach((ex) => {
  const index = parseInt(ex.id.replace('ex-', ''), 10);
  
  // Difficulty levels based on user request: Beginner (1-30), Intermediate (31-70), Advanced (71-100)
  let difficulty: 'Normal' | 'Medium' | 'High' = 'Normal';
  if (index > 70) {
    difficulty = 'High';
  } else if (index > 30) {
    difficulty = 'Medium';
  }
  EXERCISE_DIFFICULTY_MAP[ex.id] = difficulty;

  // Slideshow images mapping (steps + mistakes)
  const imgs: string[] = [];
  ex.steps.forEach(() => {
    imgs.push(ex.image);
  });
  if (ex.mistakes) {
    ex.mistakes.forEach(() => {
      imgs.push(ex.image);
    });
  }
  STEP_IMAGES_MAP[ex.id] = imgs;

  // Step labels mapping (steps + mistakes with warning badge)
  const labels: string[] = [];
  ex.steps.forEach(step => {
    labels.push(step.title);
  });
  if (ex.mistakes) {
    ex.mistakes.forEach(mistake => {
      const cleanMistake = mistake.split(':')[0].trim();
      labels.push(`⚠ Avoid: ${cleanMistake}`);
    });
  }
  STEP_LABELS_MAP[ex.id] = labels;

  // YouTube references (cycling through hand rehab videos)
  const handYoutubeVideos = [
    'https://www.youtube.com/watch?v=1F_456P7HqE',
    'https://www.youtube.com/watch?v=7XG3Y9C_Xo0',
    'https://www.youtube.com/watch?v=LdMZ91fNq7g',
    'https://www.youtube.com/watch?v=17X2_aA6f1k',
    'https://www.youtube.com/watch?v=wiF57d7TGP4'
  ];
  const videoUrl = handYoutubeVideos[(index - 1) % handYoutubeVideos.length];
  YOUTUBE_MAP[ex.id] = videoUrl;
  
  const videoId = videoUrl.includes('v=') ? videoUrl.split('v=')[1] : '1F_456P7HqE';
  YOUTUBE_IDS_MAP[ex.id] = videoId;

  // Tutorial configuration
  TUTORIAL_IMAGES_MAP[ex.id] = ex.image;
  TUTORIAL_CONTENT_MAP[ex.id] = {
    title: `Mastering ${ex.title}`,
    desc: `Learn the correct form and steps for ${ex.title} rehabilitation.`,
    coach: `Dr. Sarah Connor walks you through the proper mechanics and safety precautions for ${ex.title}.`
  };
});

export function ActiveWorkout({ exercise, onExerciseChange }: { exercise?: ExerciseData | null; onExerciseChange?: (ex: ExerciseData) => void }) {

  const isPlank = exercise?.id === 'ex-04';
  const containerRef = useRef<HTMLDivElement>(null);
  const refVideoRef = useRef<HTMLVideoElement>(null);
  const { addSession } = useWorkoutHistory();
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData>(
    exercise || EXERCISES.find(e => e.id === 'ex-07') || EXERCISES[0]
  );
  const [targetSets, setTargetSets] = useState(4);
  const [targetReps, setTargetReps] = useState(15);
  const [isTracking, setIsTracking] = useState(false);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentSets, setCurrentSets] = useState(0);
  const [calories, setCalories] = useState(0);
  const [duration, setDuration] = useState(0);
  const [formScore, setFormScore] = useState(94);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPlayingGuide, setIsPlayingGuide] = useState(false);
  const [aiVoiceActive, setAiVoiceActive] = useState(true);
  const [cameraWarning, setCameraWarning] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Handle global unmount & scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      fetch('/api/detection/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      }).catch(() => {});
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // --- REAL-TIME DETECTOR STATE REF SYNC ---
  const prevRepsRef = useRef(0);
  const prevSetsRef = useRef(0);

  // Local Webcam Fallback tracking states & refs
  const [useLocalWebcam, setUseLocalWebcam] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [t, setT] = useState(0);
  const [mediapipeLoaded, setMediapipeLoaded] = useState(false);
  const [poseLandmarks, setPoseLandmarks] = useState<any>(null);

  // Dynamically load Mediapipe library scripts from jsDelivr CDN
  useEffect(() => {
    if ((window as any).Pose && (window as any).Camera) {
      setMediapipeLoaded(true);
      return;
    }

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js')
    ])
      .then(() => {
        setMediapipeLoaded(true);
      })
      .catch(err => {
        console.error("Failed to load Mediapipe scripts:", err);
      });
  }, []);

  useEffect(() => {
    if (!isTracking) return;
    const interval = setInterval(() => {
      setT(prev => prev + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [isTracking]);

  // Handle active webcam tracking stream and Mediapipe Pose detector loop
  useEffect(() => {
    let activeCamera: any = null;
    let poseInstance: any = null;
    let localStream: MediaStream | null = null;

    if (isTracking && useLocalWebcam) {
      const startTracking = async () => {
        try {
          const PoseClass = (window as any).Pose;
          const CameraClass = (window as any).Camera;

          if (mediapipeLoaded && PoseClass && CameraClass && localVideoRef.current) {
            // Initialize Pose instance
            poseInstance = new PoseClass({
              locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
            });

            poseInstance.setOptions({
              modelComplexity: 1,
              smoothLandmarks: true,
              minDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5
            });

            poseInstance.onResults((results: any) => {
              if (results.poseLandmarks) {
                setPoseLandmarks(results.poseLandmarks);
              }
            });

            // Initialize camera loop using Mediapipe's Camera class (which does getUserMedia automatically)
            activeCamera = new CameraClass(localVideoRef.current, {
              onFrame: async () => {
                if (localVideoRef.current && poseInstance) {
                  try {
                    await poseInstance.send({ image: localVideoRef.current });
                  } catch (e) {}
                }
              },
              width: 640,
              height: 480
            });
            activeCamera.start();
          } else {
            // Fallback: manually open local camera feed if Mediapipe scripts are still loading
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            localStream = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        } catch (err) {
          console.error("Failed to access local webcam for tracking:", err);
        }
      };

      const tId = setTimeout(startTracking, 100);
      return () => clearTimeout(tId);
    }
    return () => {
      if (activeCamera) {
        try {
          activeCamera.stop();
        } catch (e) {}
      }
      if (poseInstance) {
        try {
          poseInstance.close();
        } catch (e) {}
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      setPoseLandmarks(null);
    };
  }, [isTracking, useLocalWebcam, mediapipeLoaded]);

  const joints = useMemo(() => {
    if (poseLandmarks && poseLandmarks.length > 0) {
      const lm = poseLandmarks;
      
      const getCoord = (idx: number) => {
        if (!lm[idx]) return { x: 320, y: 240 };
        return {
          x: lm[idx].x * 640,
          y: lm[idx].y * 480
        };
      };

      return {
        head: getCoord(0),
        neck: {
          x: ((lm[11].x + lm[12].x) / 2) * 640,
          y: ((lm[11].y + lm[12].y) / 2) * 480 - 15
        },
        shL: getCoord(11),
        shR: getCoord(12),
        hipL: getCoord(23),
        hipR: getCoord(24),
        kneeL: getCoord(25),
        kneeR: getCoord(26),
        ankL: getCoord(27),
        ankR: getCoord(28),
        elL: getCoord(13),
        elR: getCoord(14),
        wrL: getCoord(15),
        wrR: getCoord(16),
      };
    }

    const isShoulder = selectedExercise.title.toLowerCase().includes('shoulder') || selectedExercise.title.toLowerCase().includes('wall');
    const isLeg = selectedExercise.title.toLowerCase().includes('leg') || selectedExercise.title.toLowerCase().includes('squat') || selectedExercise.title.toLowerCase().includes('heel') || selectedExercise.title.toLowerCase().includes('bridge') || selectedExercise.title.toLowerCase().includes('raise');
    
    const base = {
      head: { x: 320, y: 80 },
      neck: { x: 320, y: 110 },
      shL: { x: 260, y: 150 },
      shR: { x: 380, y: 150 },
      hipL: { x: 280, y: 280 },
      hipR: { x: 360, y: 280 },
      kneeL: { x: 285, y: 370 },
      kneeR: { x: 355, y: 370 },
      ankL: { x: 290, y: 450 },
      ankR: { x: 350, y: 450 },
      elL: { x: 210, y: 180 },
      elR: { x: 390, y: 180 },
      wrL: { x: 180, y: 220 },
      wrR: { x: 420, y: 220 },
    };

    if (isShoulder) {
      const flex = Math.sin(t) * 50;
      base.elL.y -= flex;
      base.wrL.y -= flex * 1.8;
      base.wrL.x -= flex * 0.4;
      
      base.elR.y -= flex;
      base.wrR.y -= flex * 1.8;
      base.wrR.x += flex * 0.4;
    } else if (isLeg) {
      const flex = Math.sin(t) * 30;
      base.hipL.y += flex;
      base.hipR.y += flex;
      base.kneeL.y += flex * 0.6;
      base.kneeR.y += flex * 0.6;
      base.kneeL.x -= flex * 0.5;
      base.kneeR.x += flex * 0.5;
    } else {
      const flex = Math.sin(t) * 20;
      base.elL.x += flex;
      base.elR.x -= flex;
      base.wrL.y += flex;
      base.wrR.y += flex;
    }
    
    return base;
  }, [t, selectedExercise, poseLandmarks]);

  // --- AI VOICE FEEDBACK (Web Speech API) ---
  const lastSpokenTimeRef = useRef<number>(0);
  const VOICE_COOLDOWN_MS = 3500;

  const speak = (text: string, force = false) => {
    if (!('speechSynthesis' in window)) return;
    const now = Date.now();
    if (!force && now - lastSpokenTimeRef.current < VOICE_COOLDOWN_MS) return;
    lastSpokenTimeRef.current = now;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

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
      scale: shouldReduceMotion ? 1 : 0.97 
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

  const fadeUpVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 15 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.3 : 0.55,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  // Set Workout Modal configuration states
  const [showSetWorkoutModal, setShowSetWorkoutModal] = useState(false);
  const [tempReps, setTempReps] = useState(15);
  const [tempSets, setTempSets] = useState(4);
  const [tempDurationHr, setTempDurationHr] = useState(0);
  const [tempDurationMin, setTempDurationMin] = useState(25);
  const [tempDurationSec, setTempDurationSec] = useState(0);
  const [tempRest, setTempRest] = useState(45);
  const [tempDifficulty, setTempDifficulty] = useState<'Normal' | 'Medium' | 'High'>('Medium');
  const [tempGoal, setTempGoal] = useState('Mobility & Recovery');

  const [targetDuration, setTargetDuration] = useState(1500); // 1500 secs = 25 mins
  const [targetRest, setTargetRest] = useState(45);
  const [targetDifficulty, setTargetDifficulty] = useState<'Normal' | 'Medium' | 'High'>('Medium');
  const [targetGoal, setTargetGoal] = useState('Mobility & Recovery');

  const calculateDifficultyScore = () => {
    const totalVolume = tempSets * tempReps;
    const totalDurationInSeconds = tempDurationHr * 3600 + tempDurationMin * 60 + tempDurationSec;
    const volumeScore = totalVolume * 0.5; // up to 50
    const durationScore = Math.min(30, (totalDurationInSeconds / 3600) * 30); // up to 30
    const restScore = tempRest <= 30 ? 20 : tempRest <= 45 ? 15 : tempRest <= 60 ? 10 : 5; // up to 20
    const score = Math.round(volumeScore + durationScore + restScore);
    return Math.min(100, Math.max(10, score));
  };

  const getIntensityInfo = () => {
    const score = calculateDifficultyScore();
    let intensity = 'Moderate';
    let color = 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
    
    if (score >= 70) {
      intensity = 'Extreme';
      color = 'text-purple-500 dark:text-purple-400 bg-purple-500/10 border-purple-500/20';
    } else if (score >= 45) {
      intensity = 'High';
      color = 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
    } else if (score <= 25) {
      intensity = 'Low';
      color = 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
    
    return { intensity, color };
  };

  const estimatedCalories = Math.round(tempSets * tempReps * (tempDifficulty === 'High' ? 2.5 : tempDifficulty === 'Medium' ? 1.8 : 1.2));

  // Automatic preset clicks handler
  const handlePresetSelect = (preset: 'Normal' | 'Medium' | 'High') => {
    setTempDifficulty(preset);
    if (preset === 'Normal') {
      setTempReps(10);
      setTempSets(3);
      setTempRest(60);
      setTempDurationHr(0);
      setTempDurationMin(15);
      setTempDurationSec(0);
    } else if (preset === 'Medium') {
      setTempReps(15);
      setTempSets(4);
      setTempRest(45);
      setTempDurationHr(0);
      setTempDurationMin(25);
      setTempDurationSec(0);
    } else if (preset === 'High') {
      setTempReps(20);
      setTempSets(5);
      setTempRest(30);
      setTempDurationHr(0);
      setTempDurationMin(40);
      setTempDurationSec(0);
    }
  };

  // Automatically recalculate preset highlight state when inputs are manually updated!
  useEffect(() => {
    const isNormal = tempReps === 10 && tempSets === 3 && tempRest === 60 && tempDurationHr === 0 && tempDurationMin === 15 && tempDurationSec === 0;
    const isMedium = tempReps === 15 && tempSets === 4 && tempRest === 45 && tempDurationHr === 0 && tempDurationMin === 25 && tempDurationSec === 0;
    const isHigh = tempReps === 20 && tempSets === 5 && tempRest === 30 && tempDurationHr === 0 && tempDurationMin === 40 && tempDurationSec === 0;
    
    if (isNormal) {
      setTempDifficulty('Normal');
    } else if (isMedium) {
      setTempDifficulty('Medium');
    } else if (isHigh) {
      setTempDifficulty('High');
    } else {
      // Dynamic difficulty level assignment based on workout intensity/difficulty score
      const score = calculateDifficultyScore();
      if (score >= 70) {
        setTempDifficulty('High');
      } else if (score >= 35) {
        setTempDifficulty('Medium');
      } else {
        setTempDifficulty('Normal');
      }
    }
  }, [tempReps, tempSets, tempRest, tempDurationHr, tempDurationMin, tempDurationSec]);

  // Slideshow States for Form Reference Panel
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSlideshowHovered, setIsSlideshowHovered] = useState(false);

  // selectedExercise and addSession moved to top of component function to prevent block-scope errors

  // Reset slideshow on active tab/exercise changes
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [selectedExercise]);

  // Preload all step images for smooth, non-flickering, zero-layout-shifting transitions
  useEffect(() => {
    const images = STEP_IMAGES_MAP[selectedExercise.id] || [];
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [selectedExercise]);

  // Automatic steps slideshow effect changing every 2 seconds (with hover pausing)
  useEffect(() => {
    if (isSlideshowHovered) return;
    const imageCount = (STEP_IMAGES_MAP[selectedExercise.id] || selectedExercise.steps).length;
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => (prev + 1) % imageCount);
    }, 2000);
    return () => clearInterval(interval);
  }, [isSlideshowHovered, selectedExercise]);

  useEffect(() => {
    if (exercise) {
      setSelectedExercise(exercise);
    }
  }, [exercise]);

  const handleSelectExercise = (ex: ExerciseData) => {
    setSelectedExercise(ex);
    if (onExerciseChange) {
      onExerciseChange(ex);
    }
  };

  // Steps dynamically set for selected exercise
  const steps = selectedExercise.steps;

  // Mistakes dynamically parsed for selected exercise
  const mistakes = selectedExercise.mistakes.map(m => {
    const hasColon = m.includes(':');
    return {
      title: hasColon ? m.split(':')[0].trim() : m,
      desc: hasColon ? m.split(':')[1].trim() : 'Maintain tight body stability.'
    };
  });

  // Hero image — if ex-07 (Bench Press), we can use the annotated image to match the mockup exactly; otherwise use its default high-quality asset!
  const heroImage = selectedExercise.id === 'ex-07'
    ? 'https://lh3.googleusercontent.com/aida/ADBb0uiuOd0uYOUzotaF0qDpyWPr7DOGMMU7VUriIQFLvJTe4DA-pkqSEPFKP-X3u1uXvuLYyQP4Utx4qfFRZVerS_uScttfS18x5MM50sdQGMzsIlaf86yXgkvfx-YtcSEmRZGQwx0sFzIINAkl1_M8a6Ez0I1_RvRmroEJGqR4B2P3VE_YaYGN6Z8hUFdWEqPHUldqA8136qZ_AYcX_h5qYiSOUVdSFG90KWadeg1CJ_64L8X-cRcLABkQ'
    : selectedExercise.image;

  // Active step image for dynamic live slideshow reference
  const activeStepImage = (STEP_IMAGES_MAP[selectedExercise.id] && STEP_IMAGES_MAP[selectedExercise.id][currentStepIndex])
    || selectedExercise.image;

  // Whether the current frame is a "mistake" warning frame
  const isMistakeFrame = currentStepIndex >= selectedExercise.steps.length;

  // Current step label from STEP_LABELS_MAP or fallback to exercise step title
  const activeStepLabel = (STEP_LABELS_MAP[selectedExercise.id]?.[currentStepIndex])
    || selectedExercise.steps[Math.min(currentStepIndex, selectedExercise.steps.length - 1)]?.title
    || '';

  // Total number of frames in the slideshow
  const slideshowImageCount = (STEP_IMAGES_MAP[selectedExercise.id] || selectedExercise.steps).length;

  // --- DETECTOR SESSION CONTROLS ---
  const startDetectionSession = async () => {
    try {
      prevRepsRef.current = 0;
      prevSetsRef.current = 0;
      setCurrentReps(0);
      setCurrentSets(0);
      setDuration(0);
      setCalories(0);
      setUseLocalWebcam(false);

      const response = await fetch('/api/detection/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          workout: selectedExercise.id,
          target: targetReps,
          sets: targetSets,
        }),
      });
      if (response.ok) {
        setIsTracking(true);
      } else {
        console.warn('Backend offline, switching to client webcam simulation');
        setUseLocalWebcam(true);
        setIsTracking(true);
      }
    } catch (err) {
      console.error('Failed to start detection session, switching to client webcam simulation:', err);
      setUseLocalWebcam(true);
      setIsTracking(true);
    }
  };

  const stopDetectionSession = async () => {
    try {
      await fetch('/api/detection/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stop',
        }),
      });
    } catch (err) {
      console.error('Failed to stop detection session:', err);
    }
    setIsTracking(false);
  };

  const resetDetectionSession = async () => {
    try {
      await fetch('/api/detection/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset',
        }),
      });
    } catch (err) {
      console.error('Failed to reset detection session:', err);
    }
    setIsTracking(false);
    setDuration(0);
    setCurrentReps(0);
    setCurrentSets(0);
    setCalories(0);
  };

  // Poll real-time tracking stats from python detector
  useEffect(() => {
    let interval: any;
    if (isTracking && !useLocalWebcam) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/detection/api/state');
          if (res.ok) {
            const data = await res.json();
            
            if (data.counter !== undefined) {
              const countVal = parseInt(data.counter);
              if (!isNaN(countVal) && countVal !== prevRepsRef.current) {
                setCurrentReps(countVal);
                if (aiVoiceActive && countVal > prevRepsRef.current && countVal > 0) {
                  speak(numberToWord(countVal), true);
                }
                prevRepsRef.current = countVal;
              }
            }

            if (data.set_str !== undefined) {
              const match = data.set_str.match(/^(\d+)\s*\/\s*(\d+)/);
              if (match) {
                const bSet = parseInt(match[1]);
                const computedSetsDone = data.completed ? targetSets : (bSet - 1);
                if (computedSetsDone !== prevSetsRef.current) {
                  setCurrentSets(computedSetsDone);
                  if (aiVoiceActive && computedSetsDone > prevSetsRef.current) {
                    speak(`Set ${computedSetsDone} completed.`, true);
                  }
                  prevSetsRef.current = computedSetsDone;
                }
              }
            }

            if (data.calories !== undefined) {
              setCalories(data.calories);
            }
            
            if (data.time_elapsed !== undefined) {
              setDuration(data.time_elapsed);
            }

            if (data.warning !== undefined) {
              setCameraWarning(data.warning);
            } else {
              setCameraWarning(null);
            }

            setFormScore(prev => {
              const delta = Math.floor(Math.random() * 5) - 2;
              return Math.max(88, Math.min(98, prev + delta));
            });

            if (data.completed) {
              setIsTracking(false);
              setShowSuccessModal(true);
            }
          }
        } catch (err) {
          console.error('Error polling detector state:', err);
        }
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isTracking, useLocalWebcam, targetSets, aiVoiceActive]);

  // Client-side simulation interval when using local webcam fallback
  useEffect(() => {
    let timer: any;
    let repInterval: any;
    if (isTracking && useLocalWebcam) {
      // 1. Duration timer (runs every second)
      timer = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

      // 2. Rep and set simulation (runs every 3.5 seconds)
      let localReps = 0;
      let localSets = 0;
      repInterval = setInterval(() => {
        localReps += 1;
        if (localReps > targetReps) {
          localReps = 1;
          localSets += 1;
          if (localSets >= targetSets) {
            // Exercise completed!
            setIsTracking(false);
            setShowSuccessModal(true);
            if (aiVoiceActive) {
              speak("Congratulations! Rehabilitation session fully completed.", true);
            }
            return;
          } else {
            setCurrentSets(localSets);
            if (aiVoiceActive) {
              speak(`Set ${localSets} completed. Move to set ${localSets + 1}.`, true);
            }
          }
        }
        
        setCurrentReps(localReps);
        setCalories(c => c + 3); // earn recovery points
        if (aiVoiceActive) {
          speak(numberToWord(localReps), true);
        }
        
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
  }, [isTracking, useLocalWebcam, targetReps, targetSets, aiVoiceActive]);

  // Transition listener to announce workout completion summary
  const wasTrackingRef = useRef(false);
  useEffect(() => {
    if (isTracking) {
      wasTrackingRef.current = true;
    } else if (wasTrackingRef.current) {
      wasTrackingRef.current = false;
      if (aiVoiceActive) {
        const totalRepsVal = currentReps + (currentSets * targetReps);
        const durationText = formatSpokenTime(duration);
        const setsText = `${currentSets} set${currentSets === 1 ? '' : 's'}`;
        const repsText = `${totalRepsVal} repetition${totalRepsVal === 1 ? '' : 's'}`;
        
        const summaryText = `Session completed. You completed ${setsText} and ${repsText}. You earned approximately ${calories} recovery points. Your session duration was ${durationText}. Great work. Keep pushing toward your recovery goals.`;
        speak(summaryText, true);
      }
    }
  }, [isTracking, currentReps, currentSets, calories, duration, aiVoiceActive, targetReps]);

  const handleApplyWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    setTargetReps(tempReps);
    setTargetSets(tempSets);
    setTargetDuration(tempDurationHr * 3600 + tempDurationMin * 60 + tempDurationSec);
    setTargetRest(tempRest);
    setTargetDifficulty(tempDifficulty);
    setTargetGoal(tempGoal);
    
    setDuration(0);
    setCurrentReps(0);
    setCurrentSets(0);
    setCalories(0);
    setShowSetWorkoutModal(false);
  };

  const handleSaveWorkout = () => {
    addSession({
      exerciseId: selectedExercise.id,
      reps: currentReps + (currentSets * targetReps),
      sets: currentSets,
      calories,
      durationSeconds: duration,
      accuracy: formScore
    });
    alert('Rehab session saved to progress successfully!');
    stopDetectionSession();
  };

  const handleFinishWorkout = () => {
    stopDetectionSession();
    if (aiVoiceActive) {
      speak(`${selectedExercise.title} complete! You did ${currentSets} sets, ${currentReps + currentSets * targetReps} reps, and earned ${calories} recovery points. Great job!`, true);
    }
    setShowSuccessModal(true);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m}:${s}`;
    }
    return `${m}:${s}`;
  };

  return (
    <div ref={containerRef} className="min-h-0 w-full p-0 transition-colors duration-500 space-y-6 pb-8 bg-background text-on-surface">
      
      {/* ── ROW 1: Split camera and instructions ── */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Hero — split video/tracking panel */}
        <motion.section 
          className="relative rounded-3xl overflow-hidden group bg-slate-900 min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] transition-all duration-500 border border-outline shadow-md w-full h-full"
          variants={cardVariants}
          whileHover={shouldReduceMotion ? {} : { scale: 1.002 }}
        >
          {isTracking ? (
            useLocalWebcam ? (
              <div className="absolute inset-0 w-full h-full">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover absolute inset-0 scale-x-[-1]"
                />
                {/* Simulated AI skeleton tracking overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 scale-x-[-1]" viewBox="0 0 640 480">
                  <defs>
                    <filter id="glow-hud" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Skeleton Lines */}
                  {/* Left Arm */}
                  <line x1={joints.shL.x} y1={joints.shL.y} x2={joints.elL.x} y2={joints.elL.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />
                  <line x1={joints.elL.x} y1={joints.elL.y} x2={joints.wrL.x} y2={joints.wrL.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />
                  
                  {/* Right Arm */}
                  <line x1={joints.shR.x} y1={joints.shR.y} x2={joints.elR.x} y2={joints.elR.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />
                  <line x1={joints.elR.x} y1={joints.elR.y} x2={joints.wrR.x} y2={joints.wrR.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />
                  
                  {/* Torso */}
                  <line x1={joints.shL.x} y1={joints.shL.y} x2={joints.shR.x} y2={joints.shR.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />
                  <line x1={joints.shL.x} y1={joints.shL.y} x2={joints.hipL.x} y2={joints.hipL.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />
                  <line x1={joints.shR.x} y1={joints.shR.y} x2={joints.hipR.x} y2={joints.hipR.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />
                  <line x1={joints.hipL.x} y1={joints.hipL.y} x2={joints.hipR.x} y2={joints.hipR.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />
                  
                  {/* Legs */}
                  <line x1={joints.hipL.x} y1={joints.hipL.y} x2={joints.kneeL.x} y2={joints.kneeL.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />
                  <line x1={joints.kneeL.x} y1={joints.kneeL.y} x2={joints.ankL.x} y2={joints.ankL.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />
                  <line x1={joints.hipR.x} y1={joints.hipR.y} x2={joints.kneeR.x} y2={joints.kneeR.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />
                  <line x1={joints.kneeR.x} y1={joints.kneeR.y} x2={joints.ankR.x} y2={joints.ankR.y} stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-hud)" />

                  {/* Head & Neck */}
                  <circle cx={joints.head.x} cy={joints.head.y} r="18" fill="none" stroke="#00E5FF" strokeWidth="3" filter="url(#glow-hud)" />
                  <line x1={joints.head.x} y1={joints.head.y + 18} x2={joints.neck.x} y2={joints.neck.y} stroke="#00E5FF" strokeWidth="3.5" filter="url(#glow-hud)" />
                  <line x1={joints.neck.x} y1={joints.neck.y} x2={(joints.shL.x + joints.shR.x)/2} y2={(joints.shL.y + joints.shR.y)/2} stroke="#00E5FF" strokeWidth="3.5" filter="url(#glow-hud)" />

                  {/* Pulsing Joint Nodes */}
                  {Object.entries(joints).map(([name, ptVal]) => {
                    const pt = ptVal as { x: number; y: number };
                    return (
                      <circle
                        key={name}
                        cx={pt.x}
                        cy={pt.y}
                        r="6.5"
                        fill="#00E5FF"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    );
                  })}
                </svg>

                {/* Local HUD overlays (not mirrored) */}
                <div className="absolute top-16 left-4 bg-slate-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-[#00E5FF]/30 text-white font-mono text-[10px] space-y-1.5 z-20 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-bold text-cyan-400">CAMERA TRACKING LOCAL</span>
                  </div>
                  <div className="text-white/70">RESOLUTION: 1280x720</div>
                  <div className="text-white/70">FPS: 30 (STABLE)</div>
                  <div className="text-white/70">BIOMETRIC ENGINE: ONLINE</div>
                  <div className="text-emerald-400 font-bold">POSTURE ALIGNMENT: 98% ACCURATE</div>
                </div>
              </div>
            ) : (
              <div id="video-feed-container" className="absolute inset-0 group">
                <img
                  alt="Live AI Coach Feed"
                  className="w-full h-full object-cover absolute inset-0"
                  src="/api/detection/video"
                  onError={() => setUseLocalWebcam(true)}
                />
                
                {/* Fullscreen Button */}
                <button
                  onClick={() => {
                    const videoContainer = document.getElementById('video-feed-container');
                    if (videoContainer) {
                      videoContainer.requestFullscreen().catch(err => console.error(err));
                    }
                  }}
                  className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-40 cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize className="w-5 h-5" />
                </button>

                {/* Animated Red Warning Box Overlay */}
                <AnimatePresence>
                  {cameraWarning && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-red-950/20 backdrop-blur-[2px]"
                    >
                      <div className="bg-red-500/90 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-red-400 shadow-2xl flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
                        <span className="text-white font-black text-lg tracking-wide uppercase">
                          {cameraWarning}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          ) : (
            <img
              alt={selectedExercise.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 absolute inset-0"
              src={heroImage}
            />
          )}
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

          {/* Top-left HUD: Primary Muscle + AI VOICE + Tutorial play */}
          <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-sm z-20">
            <button
              onClick={() => window.open(YOUTUBE_MAP[selectedExercise.id], '_blank')}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 transition-all active:scale-95 flex-shrink-0 cursor-pointer animate-pulse"
              title="Open tutorial in YouTube"
            >
              <Play className="w-3.5 h-3.5 text-white fill-white translate-x-0.5" />
            </button>
            <div>
              <span className="text-white/60 text-[8px] font-black uppercase tracking-widest block leading-none mb-1">PRIMARY MUSCLE</span>
              <span className="text-white text-xs font-black uppercase tracking-wider">
                {selectedExercise.id === 'ex-07' ? 'Pectoralis Major' : selectedExercise.muscle}
              </span>
            </div>
            <div className="h-6 w-[1px] bg-white/20" />
            <button
              onClick={() => setAiVoiceActive(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                aiVoiceActive
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
                  : 'bg-white/10 border-white/15 text-white hover:bg-white/25'
              }`}
              style={{ cursor: 'pointer' }}
            >
              <Volume2 className="w-3 h-3" />
              AI VOICE
            </button>
          </div>

          {/* AI TRACKING ACTIVE — top right */}
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">AI TRACKING ACTIVE</span>
          </div>

          {/* Floating Action Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl z-20 flex-wrap justify-center w-[90%] max-w-[580px]">
            <button
              type="button"
              onClick={() => {
                setTempReps(targetReps);
                setTempSets(targetSets);
                setTempDurationMin(Math.floor(targetDuration / 60));
                setTempDurationSec(targetDuration % 60);
                setTempRest(targetRest);
                setTempDifficulty(targetDifficulty);
                setTempGoal(targetGoal);
                setShowSetWorkoutModal(true);
              }}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:scale-[1.02] active:scale-95 transition-all font-bold text-xs cursor-pointer duration-300 shadow-md backdrop-blur-md"
            >
              <Settings className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              Configure Session
            </button>

            <button
              onClick={startDetectionSession}
              disabled={isTracking}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 hover:scale-[1.02] cursor-pointer duration-300 backdrop-blur-md ${
                isTracking 
                  ? 'bg-white/5 text-white/40 border border-white/5 opacity-40 cursor-not-allowed' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isTracking ? 'text-white/40' : 'text-emerald-400 fill-emerald-400'}`} /> 
              Start Session
            </button>

            <button
              onClick={stopDetectionSession}
              disabled={!isTracking}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 hover:scale-[1.02] cursor-pointer duration-300 backdrop-blur-md ${
                !isTracking 
                  ? 'bg-white/5 text-white/40 border border-white/5 opacity-40 cursor-not-allowed' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              <Square className={`w-3.5 h-3.5 ${!isTracking ? 'text-white/40' : 'text-red-400 fill-red-400'}`} /> 
              Stop Session
            </button>

            <button
              onClick={handleSaveWorkout}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:scale-[1.02] active:scale-95 transition-all font-bold text-xs cursor-pointer duration-300 shadow-md backdrop-blur-md"
            >
              <Save className="w-3.5 h-3.5" /> 
              Save Result
            </button>
          </div>
        </motion.section>

        {/* Right Column: Instructions Panel */}
        <motion.div 
          className="flex flex-col gap-6 w-full h-full justify-between"
          variants={cardVariants}
        >
          {/* Rehab Steps Card */}
          <div className="theme-card p-6 shadow-sm text-on-surface flex-1 flex flex-col justify-start">
            <h4 className="font-extrabold text-base text-primary mb-4 flex items-center gap-2 border-b border-outline pb-3">
              <span className="inline-block w-4 h-4 text-on-surface-variant">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="4" height="4" rx="1"/><line x1="7" y1="3" x2="15" y2="3"/><rect x="1" y="7" width="4" height="4" rx="1"/><line x1="7" y1="9" x2="15" y2="9"/><rect x="1" y="13" width="4" height="4" rx="1"/></svg>
              </span>
              Rehab Steps
            </h4>
            <div className="space-y-4 max-h-[180px] lg:max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-3.5 group">
                  <div className="w-8 h-8 rounded-xl bg-outline-variant/35 text-primary font-black text-xs flex items-center justify-center flex-shrink-0 border border-outline group-hover:bg-primary group-hover:text-background group-hover:border-transparent transition-all duration-300">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-primary mb-0.5">{step.title}</h5>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avoid These Mistakes Card (Removed as per user request) */}
        </motion.div>
      </motion.div>
      <motion.div 
        className="relative overflow-hidden p-6 md:p-8 transition-all duration-500 theme-card shadow-sm text-on-surface"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >

        {/* Brain watermark */}
        <div className="absolute top-0 right-0 p-4 pointer-events-none transition-all duration-500 opacity-[0.03] text-primary">
          <Brain className="w-44 h-44 text-current" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-center mb-6">

          {/* Accuracy bar */}
          <div className="xl:col-span-1 pb-5 xl:pb-0 xl:pr-6">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm font-black transition-colors duration-500 text-primary">Accuracy Score</span>
              <span className="text-2xl font-black tracking-tight transition-colors duration-500 text-primary">{formScore}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden border transition-all duration-500 bg-outline-variant/30 border-outline">
              <div
                className="h-full bg-gradient-to-r rounded-full transition-all duration-700 from-emerald-500 to-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                style={{ width: `${formScore}%` }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="xl:col-span-2">
            <div className={`grid gap-3 ${isPlank ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>

               {/* Rep Count Card — hidden for Plank (timed hold exercise) */}
               {!isPlank && (
               <div 
                 className="relative group rounded-2xl p-4 border-2 border-emerald-100 hover:border-emerald-300 bg-surface transition-all duration-300 hover:scale-[1.02] overflow-hidden shadow-sm"
               >
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500 bg-[#22C55E]/5" />
                 <div className="flex items-center gap-2 mb-2">
                   <EmojiStyleIconBadge Icon={Activity} size="sm" bg="rgba(16,185,129,0.15)" border="rgba(16,185,129,0.35)" color="#059669" />
                   <p className="text-[9px] font-black uppercase tracking-wider transition-colors text-on-surface-variant">COUNT</p>
                 </div>
                 <div className="flex items-center justify-between relative z-10">
                   <button 
                     type="button"
                     onClick={() => setCurrentReps(r => Math.max(0, r - 1))} 
                     className="w-7 h-7 flex items-center justify-center rounded-full border shadow-sm transition-all duration-200 active:scale-90 cursor-pointer bg-outline-variant/30 hover:bg-[#22C55E]/10 border border-outline hover:border-[#22C55E]/50 text-primary"
                   >
                     <Minus className="w-3.5 h-3.5" />
                   </button>
                   <span className="text-2xl font-black transition-colors duration-300 text-emerald-600">
                     <AnimatePresence mode="wait">
                       <motion.span
                         key={currentReps}
                         initial={{ scale: 0.85, opacity: 0.5 }}
                         animate={{ scale: [1.25, 1], opacity: 1 }}
                         exit={{ scale: 0.85, opacity: 0.5 }}
                         transition={{ duration: 0.25, ease: "easeOut" }}
                         className="inline-block"
                       >
                         {currentReps}
                       </motion.span>
                     </AnimatePresence>
                     <span className="font-bold text-sm transition-colors text-on-surface-variant/60">/{targetReps}</span>
                   </span>
                   <button 
                     type="button"
                     onClick={() => setCurrentReps(r => r + 1)} 
                     className="w-7 h-7 flex items-center justify-center rounded-full border shadow-sm transition-all duration-200 active:scale-90 cursor-pointer bg-outline-variant/30 hover:bg-[#22C55E]/10 border border-outline hover:border-[#22C55E]/50 text-primary"
                   >
                     <Plus className="w-3.5 h-3.5" />
                   </button>
                 </div>
               </div>
               )}
     
               {/* Recovery Points Card (Warm Red / Cyan Blue Accent) */}
               <div 
                 className="relative group rounded-2xl p-4 border-2 border-red-100 hover:border-red-300 bg-surface transition-all duration-300 hover:scale-[1.02] overflow-hidden shadow-sm"
               >
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500 bg-[#F97316]/5" />
                 <div className="flex items-center gap-2 mb-2">
                   <EmojiStyleIconBadge Icon={Heart} size="sm" bg="rgba(255,75,75,0.15)" border="rgba(255,75,75,0.35)" color="#EF4444" />
                   <p className="text-[9px] font-black uppercase tracking-wider transition-colors text-on-surface-variant">RECOVERY</p>
                 </div>
                 <div className="flex items-baseline gap-1 mt-1 relative z-10 transition-transform duration-300 group-hover:translate-y-[-2px]">
                   <span className="text-2xl font-black transition-colors duration-300 leading-none text-red-600">
                     <AnimatePresence mode="wait">
                       <motion.span
                         key={calories}
                         initial={{ scale: 0.85, opacity: 0.7 }}
                         animate={{ scale: [1.2, 1], opacity: 1 }}
                         exit={{ scale: 0.85, opacity: 0.7 }}
                         transition={{ duration: 0.2, ease: "easeOut" }}
                         className="inline-block"
                       >
                         {calories}
                       </motion.span>
                     </AnimatePresence>
                   </span>
                   <span className="text-[10px] font-bold transition-colors text-on-surface-variant">pts</span>
                 </div>
               </div>
     
               {/* Timer Card (Cyan Blue Glow) */}
               <div 
                 className="relative group rounded-2xl p-4 border-2 border-blue-100 hover:border-blue-300 bg-surface transition-all duration-300 hover:scale-[1.02] overflow-hidden shadow-sm"
               >
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500 bg-[#06B6D4]/5" />
                 <div className="flex items-center gap-2 mb-2">
                   <EmojiStyleIconBadge Icon={Timer} size="sm" bg="rgba(6,182,212,0.15)" border="rgba(6,182,212,0.35)" color="#0891B2" />
                   <p className="text-[9px] font-black uppercase tracking-wider mb-2 transition-colors text-on-surface-variant">TIMER</p>
                 </div>
                 <div className="flex items-center gap-2 mt-1 relative z-10">
                   <span className="text-2xl font-black leading-none transition-colors duration-300 text-blue-600">
                     {formatTime(duration)}<span className="font-bold text-sm transition-colors text-on-surface-variant/60 ml-1">/{formatTime(targetDuration)}</span>
                   </span>
                 </div>
                 {isTracking && (
                   <span className="absolute bottom-1.5 right-3 text-[9px] font-black text-[#06B6D4] uppercase tracking-wider animate-pulse">
                     {formatTime(Math.max(0, targetDuration - duration))} remaining
                   </span>
                 )}
               </div>
    
               {/* Sets Card — hidden for Plank (timed hold exercise) */}
               {!isPlank && (
               <div 
                 className="relative group rounded-2xl p-4 border-2 border-purple-100 hover:border-purple-300 bg-surface transition-all duration-300 hover:scale-[1.02] overflow-hidden shadow-sm"
               >
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500 bg-[#8B5CF6]/5" />
                 <div className="flex items-center gap-2 mb-2">
                   <EmojiStyleIconBadge Icon={Zap} size="sm" bg="rgba(124,59,255,0.15)" border="rgba(124,59,255,0.35)" color="#7C3AED" />
                   <p className="text-[9px] font-black uppercase tracking-wider mb-2 transition-colors text-on-surface-variant">SETS</p>
                 </div>
                 <div className="flex items-center justify-between mt-1 relative z-10">
                   <span className="text-2xl font-black transition-colors duration-300 leading-none text-purple-600">
                     <AnimatePresence mode="wait">
                       <motion.span
                         key={currentSets}
                         initial={{ scale: 0.85, opacity: 0.7 }}
                         animate={{ scale: [1.2, 1], opacity: 1 }}
                         exit={{ scale: 0.85, opacity: 0.7 }}
                         transition={{ duration: 0.25, ease: "easeOut" }}
                         className="inline-block"
                       >
                         {currentSets}
                       </motion.span>
                     </AnimatePresence>
                     <span className="font-bold text-sm transition-colors text-on-surface-variant/60">/{targetSets}</span>
                   </span>
                   <button 
                     type="button"
                     onClick={() => setCurrentSets(s => s >= targetSets ? 1 : s + 1)}
                     className="w-7 h-7 flex items-center justify-center rounded-xl border shadow-sm transition-all duration-200 active:scale-95 cursor-pointer bg-outline-variant/30 hover:bg-[#8B5CF6]/10 border border-outline hover:border-[#8B5CF6]/50 text-primary"
                   >
                     <ArrowUp className="w-3.5 h-3.5 text-current" />
                   </button>
                 </div>
               </div>
               )}
    
             </div>
          </div>
        </div>
      </motion.div>



      {/* ── Success / Workout Summary Modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-500">
          <div className="theme-card max-w-lg w-full p-8 text-center shadow-2xl transition-all duration-300 z-10 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
 
             {/* Trophy icon */}
             <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md border border-emerald-500/20 relative">
               <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-pulse" />
               <span className="absolute -top-1 -right-1 text-xl">🏆</span>
             </div>
 
             <h2 className="text-2xl font-black text-primary tracking-tight mb-1">Rehab Session Complete!</h2>
             <p className="text-xs text-on-surface-variant mb-1 px-4">
               {selectedExercise.title}
             </p>
             <p className="text-[10px] text-on-surface-variant/70 mb-6 px-4">
               Fantastic session! Here's your full recovery session summary.
             </p>
 
             {/* Summary Stats Grid */}
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
               <div className="bg-emerald-500/10 border border-emerald-500/25 py-4 px-3 rounded-2xl flex flex-col items-center">
                 <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Total Reps</p>
                 <p className="text-2xl font-black text-primary leading-none">{currentReps + (currentSets * targetReps)}</p>
               </div>
               <div className="bg-purple-500/10 border border-purple-500/25 py-4 px-3 rounded-2xl flex flex-col items-center">
                 <p className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Sets Done</p>
                 <p className="text-2xl font-black text-primary leading-none">{currentSets}<span className="text-sm text-on-surface-variant font-bold">/{targetSets}</span></p>
               </div>
               <div className="bg-orange-500/10 border border-orange-500/25 py-4 px-3 rounded-2xl flex flex-col items-center col-span-2 sm:col-span-1">
                 <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Recovery Points</p>
                 <p className="text-2xl font-black text-primary leading-none">{calories}<span className="text-xs text-on-surface-variant font-bold ml-0.5">pts</span></p>
               </div>
               <div className="bg-cyan-500/10 border border-cyan-500/25 py-4 px-3 rounded-2xl flex flex-col items-center">
                 <p className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Duration</p>
                 <p className="text-xl font-black text-primary leading-none">{formatTime(duration)}</p>
               </div>
               <div className="bg-indigo-500/10 border border-indigo-500/25 py-4 px-3 rounded-2xl flex flex-col items-center">
                 <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Form Score</p>
                 <p className="text-2xl font-black text-primary leading-none">{formScore}<span className="text-sm text-on-surface-variant font-bold">%</span></p>
               </div>
               <div className="bg-rose-500/10 border border-rose-500/25 py-4 px-3 rounded-2xl flex flex-col items-center">
                 <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Grade</p>
                 <p className="text-2xl font-black text-emerald-500 leading-none">
                   {formScore >= 95 ? 'S+' : formScore >= 90 ? 'A+' : formScore >= 85 ? 'A' : 'B+'}
                 </p>
               </div>
             </div>
 
             {/* Motivational message */}
             <div className="bg-outline-variant/10 border border-outline rounded-2xl p-4 mb-6 text-left">
               <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Coach Feedback</p>
               <p className="text-xs text-on-surface-variant leading-relaxed">
                 {formScore >= 95
                   ? `Outstanding performance on ${selectedExercise.title}! Your form was near-perfect. Keep this consistency and you'll see incredible gains.`
                   : formScore >= 90
                   ? `Great job on ${selectedExercise.title}! Your form was excellent. Focus on maintaining full range of motion in your next session.`
                   : `Good effort on ${selectedExercise.title}! Review the form guide and aim for smoother reps next time to maximize muscle activation.`
                 }
               </p>
             </div>
 
             {/* Action Buttons */}
             <div className="flex gap-3">
               <button
                 onClick={() => setShowSuccessModal(false)}
                 className="flex-1 border border-outline text-primary hover:bg-outline-variant/20 py-3.5 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer duration-300"
               >
                 Keep Going
               </button>
               <button
                 onClick={() => { handleSaveWorkout(); setShowSuccessModal(false); }}
                 className="flex-1 bg-primary hover:bg-[#0F766E] dark:hover:bg-[#E6FBF7] text-white dark:text-[#041B1A] py-3.5 rounded-2xl font-extrabold text-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer duration-300 shadow-md border border-transparent"
               >
                 Save & Exit
               </button>
             </div>
           </div>
         </div>
       )}
 
       {/* ── Configure Session Modal ── */}
       {showSetWorkoutModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-500">
           <div className="theme-card max-w-xl w-full p-6 md:p-8 shadow-2xl text-left overflow-y-auto max-h-[90vh] scrollbar-thin z-10 animate-in fade-in zoom-in-95 duration-200">
             
             {/* Modal Header */}
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline">
               <div className="flex items-center gap-2.5">
                 <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                   <Settings className="w-5 h-5 text-primary animate-spin-slow" />
                 </div>
                 <div>
                   <h2 className="text-xl font-black text-primary tracking-tight">Configure Session</h2>
                   <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Set recovery targets for {selectedExercise.title}</p>
                 </div>
               </div>
               <button 
                 onClick={() => setShowSetWorkoutModal(false)}
                 className="w-8 h-8 rounded-full bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary transition-colors font-black text-lg cursor-pointer"
               >
                 &times;
               </button>
             </div>
 
             {/* Workout Presets (Advanced Selectable Cards System) */}
             <div className="mb-6">
               <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-wider mb-2.5">THERAPY PRESETS</p>
               <div className="grid grid-cols-3 gap-3">
                 
                 {/* Normal card */}
                 <button
                   type="button"
                   onClick={() => handlePresetSelect('Normal')}
                   className={`relative py-3.5 px-3 rounded-2xl border text-center transition-all duration-300 active:scale-95 flex flex-col items-center justify-center hover:scale-[1.02] cursor-pointer ${
                     tempDifficulty === 'Normal'
                       ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] text-emerald-600 dark:text-emerald-400 font-black'
                       : 'border-outline bg-outline-variant/20 hover:bg-outline-variant/40 text-on-surface-variant font-bold'
                   }`}
                 >
                   <span className="text-xs uppercase tracking-wider">Normal</span>
                   <span className="text-[8px] opacity-75 mt-0.5 uppercase tracking-wide">Gentle Mobility</span>
                   {tempDifficulty === 'Normal' && (
                     <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                   )}
                 </button>
 
                 {/* Medium card */}
                 <button
                   type="button"
                   onClick={() => handlePresetSelect('Medium')}
                   className={`relative py-3.5 px-3 rounded-2xl border text-center transition-all duration-300 active:scale-95 flex flex-col items-center justify-center hover:scale-[1.02] cursor-pointer ${
                     tempDifficulty === 'Medium'
                       ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] text-amber-600 dark:text-amber-400 font-black'
                       : 'border-outline bg-outline-variant/20 hover:bg-outline-variant/40 text-on-surface-variant font-bold'
                   }`}
                 >
                   <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[7px] font-black uppercase text-white tracking-widest shadow-md">
                     Recommended
                   </span>
                   <span className="text-xs uppercase tracking-wider mt-0.5">Medium</span>
                   <span className="text-[8px] opacity-75 mt-0.5 uppercase tracking-wide">Moderate Rehab</span>
                   {tempDifficulty === 'Medium' && (
                     <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                   )}
                 </button>
 
                 {/* High card */}
                 <button
                   type="button"
                   onClick={() => handlePresetSelect('High')}
                   className={`relative py-3.5 px-3 rounded-2xl border text-center transition-all duration-300 active:scale-95 flex flex-col items-center justify-center hover:scale-[1.02] cursor-pointer ${
                     tempDifficulty === 'High'
                       ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)] text-purple-600 dark:text-purple-400 font-black'
                       : 'border-outline bg-outline-variant/20 hover:bg-outline-variant/40 text-on-surface-variant font-bold'
                   }`}
                 >
                   <span className="text-xs uppercase tracking-wider">High</span>
                   <span className="text-[8px] opacity-75 mt-0.5 uppercase tracking-wide">Active Strengthening</span>
                   {tempDifficulty === 'High' && (
                     <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                   )}
                 </button>
 
               </div>
             </div>

            <form onSubmit={handleApplyWorkout} className="space-y-5">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Reps Count input */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-on-surface-variant font-black uppercase tracking-wider">Rep Count</label>
                  <div className="flex items-center bg-outline-variant/10 border border-outline rounded-2xl p-1.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setTempReps(r => Math.max(1, r - 1))}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={tempReps}
                      onChange={(e) => setTempReps(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center bg-transparent border-none text-base font-black text-primary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTempReps(r => r + 1)}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Sets input */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-on-surface-variant font-black uppercase tracking-wider">Number of Sets</label>
                  <div className="flex items-center bg-outline-variant/10 border border-outline rounded-2xl p-1.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setTempSets(s => Math.max(1, s - 1))}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={tempSets}
                      onChange={(e) => setTempSets(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center bg-transparent border-none text-base font-black text-primary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTempSets(s => s + 1)}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Workout Duration (Hours : Minutes : Seconds Time Steppers) */}
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <label className="block text-[10px] text-on-surface-variant font-black uppercase tracking-wider">Workout Duration (HH : MM : SS)</label>
                  <div className="flex items-center justify-between gap-2 bg-outline-variant/10 border border-outline rounded-2xl p-3 shadow-sm">
                    
                    {/* Hours stepper */}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[8px] text-on-surface-variant font-black uppercase mb-1">Hours</span>
                      <div className="flex items-center w-full bg-outline-variant/10 rounded-xl border border-outline p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setTempDurationHr(h => Math.max(0, h - 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={tempDurationHr.toString().padStart(2, '0')}
                          onChange={(e) => setTempDurationHr(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full text-center bg-transparent border-none text-sm font-black text-primary focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setTempDurationHr(h => Math.min(23, h + 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <span className="text-slate-600 dark:text-slate-400 font-black self-end mb-2">:</span>

                    {/* Minutes stepper */}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[8px] text-on-surface-variant font-black uppercase mb-1">Minutes</span>
                      <div className="flex items-center w-full bg-outline-variant/10 rounded-xl border border-outline p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setTempDurationMin(m => Math.max(0, m - 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={tempDurationMin.toString().padStart(2, '0')}
                          onChange={(e) => setTempDurationMin(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full text-center bg-transparent border-none text-sm font-black text-primary focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setTempDurationMin(m => Math.min(59, m + 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <span className="text-slate-600 dark:text-slate-400 font-black self-end mb-2">:</span>

                    {/* Seconds stepper */}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[8px] text-on-surface-variant font-black uppercase mb-1">Seconds</span>
                      <div className="flex items-center w-full bg-outline-variant/10 rounded-xl border border-outline p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setTempDurationSec(s => Math.max(0, s - 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={tempDurationSec.toString().padStart(2, '0')}
                          onChange={(e) => setTempDurationSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full text-center bg-transparent border-none text-sm font-black text-primary focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setTempDurationSec(s => Math.min(59, s + 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-outline-variant/30 hover:bg-outline-variant/60 text-primary font-extrabold text-xs transition-all active:scale-90 shadow-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Rest Time Between Sets */}
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <label className="block text-[10px] text-on-surface-variant font-black uppercase tracking-wider">Rest Time Between Sets (seconds)</label>
                  <div className="flex items-center bg-outline-variant/10 border border-outline rounded-2xl p-1.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setTempRest(r => Math.max(5, r - 5))}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      -5s
                    </button>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={tempRest}
                      onChange={(e) => setTempRest(Math.max(5, parseInt(e.target.value) || 5))}
                      className="w-full text-center bg-transparent border-none text-base font-black text-primary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTempRest(r => r + 5)}
                      className="w-10 h-10 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/60 flex items-center justify-center text-primary font-bold transition-all border border-outline shadow-sm active:scale-95 cursor-pointer"
                    >
                      +5s
                    </button>
                  </div>
                </div>

                {/* Exercise Goal */}
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <label className="block text-[10px] text-on-surface-variant font-black uppercase tracking-wider">Exercise Goal</label>
                  <select
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-full bg-surface border border-outline rounded-2xl p-3.5 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20 shadow-sm"
                  >
                    <option value="Mobility & Recovery" className="bg-surface text-primary">Mobility & Recovery</option>
                    <option value="Strength & Alignment" className="bg-surface text-primary">Strength & Alignment</option>
                    <option value="Joint Flexibility" className="bg-surface text-primary">Joint Flexibility</option>
                    <option value="Post-Op Rehab" className="bg-surface text-primary">Post-Op Rehab</option>
                  </select>
                </div>

              </div>

              {/* Rehab Session Preview Card */}
              <div className="bg-outline-variant/10 border border-outline p-4 rounded-2xl space-y-3 shadow-sm text-on-surface">
                <span className="block text-[8px] font-black tracking-widest text-on-surface-variant uppercase leading-none">
                  REHAB SESSION PREVIEW
                </span>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="py-2 px-1 bg-surface rounded-xl border border-outline shadow-sm">
                    <span className="block text-[8px] text-on-surface-variant font-bold uppercase mb-0.5">Total Volume</span>
                    <span className="text-sm font-black text-primary">{tempSets * tempReps} reps</span>
                  </div>
                  <div className="py-2 px-1 bg-surface rounded-xl border border-outline shadow-sm">
                    <span className="block text-[8px] text-on-surface-variant font-bold uppercase mb-0.5">Difficulty Score</span>
                    <span className="text-sm font-black text-indigo-500 dark:text-indigo-400">{calculateDifficultyScore()}/100</span>
                  </div>
                  <div className="py-2 px-1 bg-surface rounded-xl border border-outline shadow-sm">
                    <span className="block text-[8px] text-on-surface-variant font-bold uppercase mb-0.5">Rest Ratio</span>
                    <span className="text-sm font-black text-teal-500 dark:text-teal-400">1:{Math.round((tempDurationHr * 3600 + tempDurationMin * 60 + tempDurationSec) / (tempRest * tempSets || 1))}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="block text-[8px] font-black tracking-widest text-on-surface-variant uppercase leading-none mb-1.5 animate-pulse">
                      ESTIMATED RECOVERY POINTS
                    </span>
                    <div className="flex items-baseline gap-1 bg-orange-500/10 border border-orange-500/20 py-1.5 px-3 rounded-xl w-fit shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                      <span className="text-xl font-black text-orange-500 leading-none">{estimatedCalories}</span>
                      <span className="text-[9px] font-black text-on-surface-variant uppercase">pts</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[8px] font-black tracking-widest text-on-surface-variant uppercase leading-none mb-1.5">
                      SESSION INTENSITY
                    </span>
                    <div className="flex items-center">
                      <span className={`inline-block px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border shadow-sm ${getIntensityInfo().color}`}>
                        {getIntensityInfo().intensity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline">
                <button
                  type="button"
                  onClick={() => setShowSetWorkoutModal(false)}
                  className="py-3 px-6 rounded-xl border border-outline text-primary hover:bg-outline-variant/20 font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-primary hover:bg-[#0F766E] dark:hover:bg-[#E6FBF7] text-white dark:text-[#041B1A] border border-transparent font-black text-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer duration-300 shadow-md"
                >
                  Apply Configuration
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}