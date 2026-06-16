import React, { useState, useMemo } from 'react';
import { Camera, Volume2, Moon, Bell, Database, Shield, MonitorDown, Sliders, Check, Smartphone, Activity } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { Tab } from '../types';

function EmojiStyleIcon({
  Icon,
  bg,
  border,
  color,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  bg: string;
  border: string;
  color: string;
}) {
  return (
    <div
      className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border"
      style={{ backgroundColor: bg, borderColor: border, color }}
    >
      <Icon className="w-6 h-6" />
    </div>
  );
}

export function Settings({ onNavigate }: { onNavigate?: (tab: Tab | 'active-workout') => void }) {
  const { profile } = useUserProfile();
  const { totalWorkouts } = useWorkoutHistory();
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  const [aiSensitivity, setAiSensitivity] = useState('High');

  const containerClass = "theme-card p-6 flex flex-col gap-6";

  // Calibrate Athlete Tier category based on the user's actual workout performance
  const userTier = useMemo(() => {
    if (totalWorkouts === 0) return 'Beginner Athlete';
    if (totalWorkouts < 5) return 'Active Athlete';
    if (totalWorkouts < 15) return 'Advanced Athlete';
    return 'Elite Tier Athlete';
  }, [totalWorkouts]);

  return (
    <div className="w-full space-y-stack-lg max-w-4xl mx-auto pb-12">
      <div className="mb-stack-lg">
        <h2 className="text-3xl font-bold text-primary tracking-tight uppercase">Settings</h2>
        <p className="text-on-surface-variant mt-2 text-lg">Manage your Precision Coach application preferences.</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* Profile */}
        <div className={containerClass}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={profile.avatarUrl}
                alt="User avatar"
                className="w-12 h-12 rounded-full border border-outline object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-lg font-black text-primary leading-tight truncate">{profile.fullName}</p>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest truncate">
                  {userTier}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('profile')}
              className="px-4 py-2 rounded-xl border border-outline text-primary font-bold text-sm bg-surface hover:bg-hover-bg transition-all whitespace-nowrap cursor-pointer shadow-sm active:scale-95"
            >
              Edit Profile
            </button>
          </div>
        </div>
        
        {/* Hardware & Detection */}
        <div className={containerClass}>
          <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
            <EmojiStyleIcon Icon={Camera} bg="rgba(255,49,49,0.07)" border="rgba(255,49,49,0.18)" color="#FF5252" />
            <div>
              <h3 className="text-xl font-bold text-primary">Hardware & AI Detection</h3>
              <p className="text-sm font-medium text-on-surface-variant">Configure camera permissions and analysis accuracy.</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-primary">Enable Camera Access</p>
              <p className="text-sm text-on-surface-variant">Allow the app to use your computer's camera for form tracking.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={cameraEnabled} onChange={() => setCameraEnabled(!cameraEnabled)} />
              <div className="w-11 h-6 bg-outline rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-outline after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-outline-variant">
            <div>
              <p className="font-bold text-primary">AI Detection Sensitivity</p>
              <p className="text-sm text-on-surface-variant">Adjust how strict the AI is with form corrections.</p>
            </div>
            <div className="flex p-1 bg-background border border-outline rounded-lg select-none">
              {['Low', 'Medium', 'High'].map((level) => (
                <button 
                  key={level}
                  onClick={() => setAiSensitivity(level)}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors cursor-pointer ${aiSensitivity === level ? 'bg-primary text-surface dark:text-slate-900 shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Workout Preferences */}
        <div className={containerClass}>
          <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
            <EmojiStyleIcon Icon={Activity} bg="rgba(47,107,255,0.07)" border="rgba(47,107,255,0.18)" color="#5282FF" />
            <div>
              <h3 className="text-xl font-bold text-primary">Workout Preferences</h3>
              <p className="text-sm font-medium text-on-surface-variant">Manage coaching feedback and routine settings.</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-primary">Audio Coaching Feedback</p>
              <p className="text-sm text-on-surface-variant">Voice cues, count reps, and form correction announcements.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={audioFeedback} onChange={() => setAudioFeedback(!audioFeedback)} />
              <div className="w-11 h-6 bg-outline rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-outline after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Display & Notifications */}
        <div className={containerClass}>
          <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
            <EmojiStyleIcon Icon={MonitorDown} bg="rgba(6,182,212,0.07)" border="rgba(6,182,212,0.18)" color="#22D3EE" />
            <div>
              <h3 className="text-xl font-bold text-primary">Display & Notifications</h3>
              <p className="text-sm font-medium text-on-surface-variant">Appearance and communication settings.</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-primary">Dark Mode (Preview)</p>
              <p className="text-sm text-on-surface-variant">Switch application interface to darker tones.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <div className="w-11 h-6 bg-outline rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-outline after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-outline-variant">
            <div>
              <p className="font-bold text-primary">Push Notifications</p>
              <p className="text-sm text-on-surface-variant">Receive reminders for scheduled workouts and milestones.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notifications} onChange={() => setNotifications(!notifications)} />
              <div className="w-11 h-6 bg-outline rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-outline after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className={containerClass}>
          <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
            <EmojiStyleIcon Icon={Shield} bg="rgba(124,59,255,0.07)" border="rgba(124,59,255,0.18)" color="#A78BFA" />
            <div>
              <h3 className="text-xl font-bold text-primary">Data & Privacy</h3>
              <p className="text-sm font-medium text-on-surface-variant">Manage your tracking data and backups.</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-primary">Cloud Sync</p>
              <p className="text-sm text-on-surface-variant">Sync workout history across devices securely.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={dataSync} onChange={() => setDataSync(!dataSync)} />
              <div className="w-11 h-6 bg-outline rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-outline after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex justify-end pt-4 mt-2 border-t border-outline-variant">
            <button className="px-5 py-2.5 bg-error/10 hover:bg-error/20 border border-error/20 text-error font-bold rounded-xl transition-all cursor-pointer active:scale-95">
              Clear Workout Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
