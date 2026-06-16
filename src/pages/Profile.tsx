import React, { useState } from 'react';
import { User, Mail, Award, MapPin, Calendar, Edit3, Shield, Info, Save, X, Phone, Target, Flame, Dumbbell, Activity, Camera, Zap, Heart } from 'lucide-react';
import { useUserProfile, UserProfile } from '../hooks/useUserProfile';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';

export function Profile() {
  const { profile, updateProfile } = useUserProfile();
  const { totalWorkouts, totalCalories, streak, avgAccuracy } = useWorkoutHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);

  // Dynamic stats calculated from active history, falling back to default stats if no workouts recorded
  const activeWorkouts = totalWorkouts > 0 ? totalWorkouts : profile.stats.workoutsDone;
  const activeCalories = totalCalories > 0 ? totalCalories : profile.stats.caloriesBurned;
  const activeStreak = streak > 0 ? streak : profile.stats.dayStreak;
  const activeAccuracy = avgAccuracy > 0 ? avgAccuracy : profile.stats.avgAccuracy;

  const rankText = activeAccuracy > 90 ? 'Top 3%' : activeAccuracy > 80 ? 'Top 8%' : activeAccuracy > 70 ? 'Top 15%' : 'Top 25%';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, avatarUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateProfile({
      ...formData,
      age: parseInt(formData.age as unknown as string) || profile.age,
      weight: parseFloat(formData.weight as unknown as string) || profile.weight,
      height: parseInt(formData.height as unknown as string) || profile.height,
      bodyFat: parseFloat(formData.bodyFat as unknown as string) || profile.bodyFat,
    });
    setIsEditing(false);
  };

  const heightInMeters = profile.height / 100;
  const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);

  const editingHeightInMeters = (formData.height as unknown as number) / 100;
  let editingBmi = "0.0";
  if (editingHeightInMeters > 0) {
     editingBmi = ((formData.weight as unknown as number) / (editingHeightInMeters * editingHeightInMeters)).toFixed(1);
  }

  const containerClass = "theme-card p-6 md:p-8 flex flex-col gap-6";

  return (
    <div className="w-full space-y-8 max-w-4xl mx-auto pb-12">
      {/* Cover & Profile Header */}
      <div 
        className="relative rounded-2xl overflow-hidden shadow-sm mb-12"
        style={{
          background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="h-48 md:h-64 bg-black relative">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
            alt="Cover" 
            className="w-full h-full object-cover opacity-30 mix-blend-multiply"
          />
        </div>
        
        <div className="px-6 md:px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 md:-mt-20 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black overflow-hidden shadow-lg bg-black relative">
                  <img 
                    src={isEditing ? formData.avatarUrl : profile.avatarUrl} 
                    alt={profile.fullName} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                {isEditing && (
                  <>
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute bottom-1 right-1 p-2 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-all text-slate-900 dark:text-white cursor-pointer shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-105 active:scale-95 z-20"
                      title="Upload custom photo"
                    >
                      <Camera className="w-4 h-4 md:w-5 h-5 text-slate-700 dark:text-slate-200" />
                    </label>
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      accept="image/*" 
                      onChange={handleAvatarFileChange} 
                      className="hidden" 
                    />
                  </>
                )}
              </div>
              <div className="mb-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                      className="border rounded-xl px-4 py-2 font-bold text-xl text-white w-full bg-black/40" 
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      placeholder="Full Name" 
                    />
                    <input 
                      type="text" 
                      name="username" 
                      value={formData.username} 
                      onChange={handleInputChange} 
                      className="border rounded-xl px-4 py-2 text-white w-full bg-black/40 text-sm" 
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                      placeholder="Username" 
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase">{profile.fullName}</h2>
                    <p className="text-slate-300 font-medium mt-1">{profile.username}</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-center md:justify-end pb-2">
              {isEditing ? (
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setFormData(profile); setIsEditing(false); }} 
                    className="px-6 py-2.5 font-bold rounded-xl hover:bg-white/5 transition-all shadow-sm cursor-pointer"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: '#fff',
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setFormData(profile); setIsEditing(true); }} 
                  className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: About & Info */}
        <div className="md:col-span-1 space-y-8">
          <div className={containerClass}>
            <h3 className="text-xl font-bold text-primary border-b border-outline-variant pb-4 uppercase tracking-wide">Personal Info</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Mail className="w-5 h-5 text-on-surface-variant/70 shrink-0" />
                {isEditing ? (
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-outline bg-background rounded-lg px-3 py-1.5 text-sm text-primary" placeholder="Email" />
                ) : (
                  <span className="text-sm font-medium truncate">{profile.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Phone className="w-5 h-5 text-on-surface-variant/70 shrink-0" />
                {isEditing ? (
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleInputChange} className="w-full border border-outline bg-background rounded-lg px-3 py-1.5 text-sm text-primary" placeholder="Phone Number" />
                ) : (
                  <span className="text-sm font-medium truncate">{profile.phoneNumber}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <MapPin className="w-5 h-5 text-on-surface-variant/70 shrink-0" />
                {isEditing ? (
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border border-outline bg-background rounded-lg px-3 py-1.5 text-sm text-primary" placeholder="Location" />
                ) : (
                  <span className="text-sm font-medium truncate">{profile.location}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Target className="w-5 h-5 text-on-surface-variant/70 shrink-0" />
                {isEditing ? (
                  <input type="text" name="fitnessGoal" value={formData.fitnessGoal || ''} onChange={handleInputChange} className="w-full border border-outline bg-background rounded-lg px-3 py-1.5 text-sm text-primary" placeholder="Rehab Goal" />
                ) : (
                  <span className="text-sm font-medium truncate">{profile.fitnessGoal}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Calendar className="w-5 h-5 text-on-surface-variant/70 shrink-0" />
                <span className="text-sm font-medium">Joined {profile.joinedDate}</span>
              </div>
            </div>
          </div>

          <div className={containerClass}>
            <h3 className="text-xl font-bold text-primary border-b border-outline-variant pb-4 uppercase tracking-wide">Achievements</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/35 flex items-center justify-center text-orange-650 shrink-0 shadow-[0_0_8px_rgba(234,88,12,0.06)]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-primary text-xs">Elite Rank</p>
                  <p className="font-bold text-orange-600 text-lg">{rankText}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/35 flex items-center justify-center text-purple-650 shrink-0 shadow-[0_0_8px_rgba(147,51,234,0.06)]">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-primary text-xs">Consistency</p>
                  <p className="font-bold text-purple-600 text-lg">{activeStreak}-Day Streak</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/35 flex items-center justify-center text-red-650 shrink-0 shadow-[0_0_8px_rgba(220,38,38,0.06)]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-primary text-xs">Recovery Points</p>
                  <p className="font-bold text-red-600 text-lg">{activeCalories.toLocaleString()} <span className="text-xs text-red-600/70">pts</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-650 shrink-0 shadow-[0_0_8px_rgba(5,150,105,0.06)]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-primary text-xs">Completed</p>
                  <p className="font-bold text-emerald-600 text-lg">{activeWorkouts} <span className="text-xs text-emerald-600/70">Sessions</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Stats & Bio */}
        <div className="md:col-span-2 space-y-8">
          <div className={containerClass}>
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <h3 className="text-xl font-bold text-primary uppercase tracking-wide">Biometrics</h3>
              <Info className="w-5 h-5 text-on-surface-variant" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Age */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-2 select-none">
                  <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/35 flex items-center justify-center text-purple-600 shrink-0 shadow-[0_0_6px_rgba(147,51,234,0.05)]">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Age</span>
                </div>
                {isEditing ? (
                  <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-16 text-center border border-outline rounded-lg px-2 py-1 font-bold text-primary bg-background" />
                ) : (
                  <p className="text-2xl font-bold text-purple-700">{profile.age}</p>
                )}
              </div>

              {/* Weight */}
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/25 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-2 select-none">
                  <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/35 flex items-center justify-center text-orange-650 shrink-0 shadow-[0_0_6px_rgba(234,88,12,0.05)]">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Weight</span>
                </div>
                {isEditing ? (
                  <div className="flex items-center"><input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-16 text-center border border-outline rounded-lg px-2 py-1 font-bold text-primary bg-background" /><span className="text-xs font-medium text-on-surface-variant ml-1">kg</span></div>
                ) : (
                  <p className="text-2xl font-bold text-orange-700">{profile.weight}<span className="text-sm font-bold text-orange-700/70 ml-1">kg</span></p>
                )}
              </div>

              {/* Height */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/25 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-2 select-none">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/35 flex items-center justify-center text-blue-600 shrink-0 shadow-[0_0_6px_rgba(37,99,235,0.05)]">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Height</span>
                </div>
                {isEditing ? (
                  <div className="flex items-center"><input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-16 text-center border border-outline rounded-lg px-2 py-1 font-bold text-primary bg-background" /><span className="text-xs font-medium text-on-surface-variant ml-1">cm</span></div>
                ) : (
                  <p className="text-2xl font-bold text-blue-700">{profile.height}<span className="text-sm font-bold text-blue-700/70 ml-1">cm</span></p>
                )}
              </div>

              {/* BMI */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-2 select-none">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-600 shrink-0 shadow-[0_0_6px_rgba(5,150,105,0.05)]">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">BMI</span>
                </div>
                {isEditing ? (
                  <p className="text-2xl font-bold text-emerald-700">{editingBmi}</p>
                ) : (
                  <p className="text-2xl font-bold text-emerald-700">{bmi}</p>
                )}
              </div>

              {/* Body Fat */}
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-2 select-none">
                  <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/35 flex items-center justify-center text-red-600 shrink-0 shadow-[0_0_6px_rgba(220,38,38,0.05)]">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-red-650 uppercase tracking-wider">Body Fat</span>
                </div>
                {isEditing ? (
                  <div className="flex items-center"><input type="number" name="bodyFat" value={formData.bodyFat} onChange={handleInputChange} className="w-16 text-center border border-outline rounded-lg px-2 py-1 font-bold text-primary bg-background" /><span className="text-xs font-medium text-on-surface-variant ml-1">%</span></div>
                ) : (
                  <p className="text-2xl font-bold text-red-700">{profile.bodyFat}<span className="text-sm font-bold text-red-700/70 ml-1">%</span></p>
                )}
              </div>
            </div>
          </div>

          <div className={containerClass}>
            <h3 className="text-xl font-bold text-primary border-b border-outline-variant pb-4 uppercase tracking-wide">Bio</h3>
            {isEditing ? (
               <textarea 
                 name="bio" 
                 value={formData.bio} 
                 onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                 className="w-full border border-outline bg-background rounded-xl px-4 py-3 text-sm min-h-[120px] resize-y text-primary outline-none" 
                 placeholder="Write a short bio about your rehabilitation journey..."
               />
            ) : (
               <p className="text-on-surface-variant leading-relaxed">
                 {profile.bio}
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
