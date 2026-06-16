import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, User, MapPin, Hash, Scale, Ruler, Activity, Phone, Target, ShieldCheck, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUserProfile, mapSupabaseToProfile } from '../hooks/useUserProfile';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabaseClient';



interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom Red Error State for Unregistered Logins
  const [accountError, setAccountError] = useState<{ message: string; subMessage: string } | null>(null);

  const { updateProfile } = useUserProfile();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    location: '',
    age: '',
    weight: '',
    height: '',
    bodyFat: '',
    fitnessGoal: ''
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear account warning when user begins editing their email
    if (e.target.name === 'email') {
      setAccountError(null);
    }
  };

  // Form Submit starts the unified authentication flow
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(null);

    if (!formData.email) {
      toast.error(isSignUp ? 'Email address is required' : 'Username or email is required');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }
    
    setIsLoading(true);
    try {
      let finalLoginEmail = formData.email;

      // 1. If signing in with a username, resolve it to an email securely via backend
      if (!isSignUp && !finalLoginEmail.includes('@')) {
        const searchUsername = finalLoginEmail.startsWith('@') ? finalLoginEmail : `@${finalLoginEmail}`;
        try {
          const res = await fetch('/api/auth/resolve-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: searchUsername })
          });
          
          if (res.ok) {
            const data = await res.json();
            finalLoginEmail = data.email;
          } else {
            setAccountError({
              message: "Username not found",
              subMessage: "We couldn't find an account with that username."
            });
            toast.error("Username not found");
            setIsLoading(false);
            return;
          }
        } catch (err) {
          toast.error("Error connecting to server");
          setIsLoading(false);
          return;
        }
      }

      // Note: We removed the frontend 'existingProfile' check because Row Level Security 
      // safely blocks querying profiles before the user is logged in. 
      // Supabase signInWithPassword and our backend signup handles existence errors safely!

      if (isSignUp) {
        // 2. Sign Up via backend (which uses admin SDK to auto-confirm the user)
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            username: formData.username,
            phoneNumber: formData.phoneNumber,
            location: formData.location,
            fitnessGoal: formData.fitnessGoal,
            age: formData.age,
            weight: formData.weight,
            height: formData.height,
            bodyFat: formData.bodyFat
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error || 'Registration failed');
        }
      }

      // 3. Direct Sign In with Password via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: finalLoginEmail,
        password: formData.password,
      });

      if (error) throw error;
      if (!data.session) throw new Error('Session could not be established');

      localStorage.setItem('auth_token', data.session.access_token);

      // 4. Fetch the profile details
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .maybeSingle();

      const mappedProfile = mapSupabaseToProfile(dbProfile, data.session.user.email || '');
      updateProfile(mappedProfile);

      toast.success(isSignUp ? 'Account created successfully!' : 'Welcome back! Login successful.');
      onLogin();
    } catch (err: any) {
      console.error('Authentication error:', err);
      toast.error(err.message || 'Authentication failed');
      setAccountError({
        message: err.message || 'Authentication failed',
        subMessage: isSignUp ? 'Please check your details and try again.' : 'Please verify your credentials.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface relative overflow-hidden transition-colors duration-300">
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              />
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-widest text-primary">Rehab AI Secure Authentication...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left side brand content */}
      <div 
        className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 border-r border-outline-variant/30"
        style={{
          background: 'linear-gradient(135deg, #0B2B2A 0%, #041B1A 100%)'
        }}
      >
        <div className="login-video-container">
          <img
            className="login-background-video"
            src="/images/physiotherapy_login_bg.png"
            alt="Physiotherapy Recovery"
          />
          <div className="login-video-overlay"></div>
        </div>
        
        <motion.div 
          className="relative z-10 flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
           <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg">
             <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                 <span className="w-1 h-3 bg-white rounded-full"></span>
             </div>
           </div>
           <div>
              <h2 className="text-white font-black text-xl leading-none uppercase tracking-wider">Rehab</h2>
              <p className="text-slate-350 text-[10px] tracking-widest uppercase mt-1">Precision Clinical Recovery.</p>
           </div>
        </motion.div>

        <motion.div 
          className="relative z-10 w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
            <h1 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight uppercase">Data-Driven<br/>Recovery.</h1>
            <p className="text-lg text-slate-300 max-w-md mb-12">
               Experience clinical-grade biomechanical tracking and personalized guidance to accelerate your recovery.
            </p>
            
            <div className="flex gap-12 border-t border-white/10 pt-6">
                <div>
                   <p className="text-white font-black text-2xl">12.5k</p>
                   <p className="text-slate-300 text-sm">Recovered Patients</p>
                </div>
                <div>
                   <p className="text-white font-black text-2xl">98%</p>
                   <p className="text-slate-300 text-sm">Recovery Success Rate</p>
                </div>
            </div>
        </motion.div>
      </div>

      {/* Right side interactive card area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background overflow-y-auto transition-colors duration-300">
        <div className="w-full max-w-[420px] py-12">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup-form" : "login-form"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <h2 className="text-4xl font-extrabold text-primary mb-2 tracking-tight uppercase">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-on-surface-variant font-medium mb-10">
                  {isSignUp ? "Join the elite performance journey." : "Login to continue your performance journey."}
                </p>
              </div>

              {/* RED Validation error message box for unregistered logins */}
              <AnimatePresence>
                {accountError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-950/40 border border-red-500/20 rounded-xl flex items-start gap-3 mb-6 text-red-400"
                  >
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
                    <div>
                      <p className="font-bold text-sm leading-none">{accountError.message}</p>
                      <p className="text-xs text-red-400/90 mt-1">{accountError.subMessage}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <form className="space-y-4" onSubmit={handleAuthSubmit}>
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                        <input 
                          type="text" 
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Alex Mercer"
                          className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Username</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                        <input 
                          type="text" 
                          name="username"
                          required
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="@alexmercer_fit"
                          className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">
                    {isSignUp ? "Email Address" : "Username or Email"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                    <input 
                      type={isSignUp ? "email" : "text"} 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={isSignUp ? "alex.mercer@example.com" : "username or name@company.com"}
                      className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Password</label>
                     {!isSignUp && <a href="#" className="text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:underline">Forgot Password?</a>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                    <input 
                      type={isPasswordVisible ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                    />
                    <button 
                      type="button" 
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface"
                    >
                       <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                        <input 
                          type="tel" 
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567"
                          className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                        <input 
                          type="text" 
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="San Francisco, CA"
                          className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Fitness Goal</label>
                      <div className="relative">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                        <input 
                          type="text" 
                          name="fitnessGoal"
                          value={formData.fitnessGoal}
                          onChange={handleInputChange}
                          placeholder="Hypertrophy & Strength"
                          className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Age</label>
                         <input 
                            type="number" 
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            placeholder="28"
                            className="w-full bg-surface border border-outline rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Weight (kg)</label>
                         <div className="relative">
                           <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                           <input 
                               type="number" 
                               name="weight"
                               value={formData.weight}
                               onChange={handleInputChange}
                               placeholder="78"
                               className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                            />
                         </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Height (cm)</label>
                         <div className="relative">
                           <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                           <input 
                               type="number" 
                               name="height"
                               value={formData.height}
                               onChange={handleInputChange}
                               placeholder="182"
                               className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                            />
                         </div>
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Body Fat %</label>
                         <div className="relative">
                           <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                           <input 
                               type="number" 
                               name="bodyFat"
                               value={formData.bodyFat}
                               onChange={handleInputChange}
                               placeholder="14"
                               className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                            />
                         </div>
                       </div>
                    </div>
                  </>
                )}

                {!isSignUp && (
                  <div className="flex items-center gap-2 pt-2">
                     <input type="checkbox" id="remember" className="rounded-sm border-outline bg-surface text-primary focus:ring-secondary cursor-pointer" />
                     <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer">Remember me for 30 days</label>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-[#0F766E] dark:hover:bg-[#E6FBF7] text-white dark:text-[#041B1A] font-extrabold py-4 rounded-xl transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>{isSignUp ? "Create Account & Sign In" : "Sign In"}</span>
                </button>
              </form>

              <p className="text-center mt-10 text-sm text-gray-400 font-medium">
                {isSignUp ? "Already have an account?" : "Don't have an account?"} 
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAccountError(null);
                  }} 
                  className="text-white font-extrabold hover:underline ml-1 cursor-pointer"
                >
                  {isSignUp ? "Login" : "Sign Up"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
