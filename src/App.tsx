import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { HowItWorks } from './pages/HowItWorks';
import { Login } from './pages/Login';
import { Workouts } from './pages/Workouts';
import { Progress } from './pages/Progress';
import { Favorites } from './pages/Favorites';
import { Schedule } from './pages/Schedule';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Layout } from './components/Layout';
import { Tab, ExerciseData } from './types';
import { useUserProfile, mapSupabaseToProfile } from './hooks/useUserProfile';
import { useDarkMode } from './hooks/useDarkMode';
import { supabase } from './lib/supabaseClient';
import { LogOut } from 'lucide-react';

export default function App() {
  useDarkMode(); // Initialize dark mode
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [history, setHistory] = useState<(Tab | 'active-workout')[]>(['home']);
  const [activeExercise, setActiveExercise] = useState<ExerciseData | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { updateProfile } = useUserProfile();

  useEffect(() => {
    // 1. Initial Session Check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          localStorage.setItem('auth_token', session.access_token);
          
          // Fetch corresponding public profile fields
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const mappedProfile = mapSupabaseToProfile(dbProfile, session.user.email || '');
          updateProfile(mappedProfile);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Supabase session recovery failed:', err);
      } finally {
        setIsCheckingSession(false);
      }
    };
    
    checkSession();

    // 2. Real-time Session listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        localStorage.setItem('auth_token', session.access_token);
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('auth_token');
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const currentTab = history[history.length - 1];

  const handleTabChange = (tab: Tab | 'active-workout') => {
    if (tab === currentTab) return;
    setHistory(prev => [...prev, tab]);
  };

  const handleBack = () => {
    setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await supabase.auth.signOut();
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const handleLaunchActivity = (ex?: ExerciseData) => {
    if (ex) {
      setActiveExercise(ex);
    }
    handleTabChange('active-workout');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home onNavigate={handleTabChange} />;
      case 'workouts':
        return <Workouts onLaunchActivity={handleLaunchActivity} />;
      case 'how-it-works':
        return <HowItWorks onNavigate={handleTabChange} />;
      case 'favorites':
        return <Favorites onLaunchActivity={handleLaunchActivity} />;
      case 'progress':
        return <Progress />;
      case 'schedule':
        return <Schedule onLaunchActivity={handleLaunchActivity} />;
      case 'active-workout':
      case 'ai-detection':
        return <ActiveWorkout exercise={activeExercise} onExerciseChange={setActiveExercise} />;
      case 'settings':
        return <Settings onNavigate={handleTabChange} />;
      case 'profile':
        return <Profile />;
      default:
        return <div className="text-center py-20 text-on-surface-variant">Selected: {currentTab}</div>;
    }
  };

  // When inside active workout, we highlight the AI Detection tab on the sidebar to match the mockup
  const activeTabForLayout = currentTab === 'active-workout' ? 'ai-detection' : currentTab;

  return (
    <>
      <Layout 
        currentTab={activeTabForLayout} 
        onTabChange={handleTabChange} 
        onBack={handleBack}
        canGoBack={history.length > 1}
        onLogout={handleLogout}
        hideSidebarAndTopbar={false}
        title={currentTab === 'active-workout' ? (activeExercise?.title || 'Rehab Session') : undefined}
      >
        <div className="h-full flex flex-col">
          {renderContent()}
        </div>
      </Layout>

      {/* Premium Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div 
            className="w-full max-w-md p-8 rounded-3xl text-center relative overflow-hidden"
            style={{
              background: '#062E2D',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Visual luxury sheen accent at top of modal */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />
            
            {/* Soft glowing background element */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-50px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
                filter: 'blur(10px)',
              }}
            />
            
            {/* Icon container */}
            <div 
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center relative z-10"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            >
              <LogOut className="w-7 h-7 text-red-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide relative z-10">
              Confirm Logout
            </h3>
            <p className="text-slate-300 text-sm mb-8 leading-relaxed relative z-10">
              Are you sure you want to log out? You will need to sign in again to access your rehabilitation session and tracking data.
            </p>

            <div className="flex gap-4 relative z-10">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-grow py-3 px-5 font-semibold rounded-xl hover:bg-white/5 transition-all text-white border border-white/10 hover:border-white/20 active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-grow py-3 px-5 font-semibold bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl active:scale-95 transition-all shadow-md shadow-red-900/20 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
