import React from 'react';
import { Search, Moon, Sun, Bell, Menu, ArrowLeft, Settings } from 'lucide-react';

import { Tab } from '../types';
import { useUserProfile } from '../hooks/useUserProfile';
import { useDarkMode } from '../hooks/useDarkMode';

interface TopBarProps {
  title?: string;
  onTabChange?: (tab: Tab) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  currentTab?: Tab;
}

export function TopBar({ title, onTabChange, onBack, canGoBack, currentTab }: TopBarProps) {
  const { profile } = useUserProfile();
  const { isDark, toggleDark } = useDarkMode();
  const isAiDetection = currentTab === 'ai-detection';
  
  return (
    <header 
      className="fixed top-0 right-0 left-0 md:left-[280px] h-16 flex justify-between items-center px-container-margin-mobile md:px-container-margin-desktop z-40"
      style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--outline-variant)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.02), inset 0 -1px 0 var(--outline-variant)',
      }}
    >
      {/* Subtle top sheen */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          top:           0,
          left:          0,
          right:         0,
          height:        '1px',
          background:    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div className="flex items-center gap-4 flex-1">
        <button 
          className="md:hidden p-2 text-on-surface-variant rounded-full transition-colors"
          style={{ cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Menu className="w-5 h-5" />
        </button>
        {canGoBack && (
          <button 
            onClick={onBack}
            className="p-2 text-on-surface rounded-full transition-all flex items-center gap-2 md:mr-2"
            style={{ cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {isAiDetection && title ? (
          <h2 className="font-extrabold text-2xl tracking-tight text-on-surface mr-4">{title}</h2>
        ) : (
          title && <h1 className="md:hidden font-bold text-xl text-primary">{title}</h1>
        )}
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input 
            type="text" 
            placeholder={isAiDetection ? "Search exercises..." : "Search analysis, routines, or metrics..."} 
            className="w-full rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none transition-all"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--outline)',
              color: 'var(--on-surface)',
              boxShadow: 'inset 0 1px 0 rgba(0, 0, 0, 0.02)',
            }}
            onFocus={e => {
              e.currentTarget.style.border = '1px solid var(--focus-ring)';
              e.currentTarget.style.background = 'var(--input-bg)';
            }}
            onBlur={e => {
              e.currentTarget.style.border = '1px solid var(--outline)';
              e.currentTarget.style.background = 'var(--input-bg)';
            }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {isAiDetection ? (
          <>
            <button 
              className="p-2 text-on-surface-variant rounded-full transition-all relative active:scale-95"
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onTabChange && onTabChange('settings')} 
              className="p-2 text-on-surface-variant rounded-full transition-all active:scale-95"
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="h-8 w-[1px] bg-outline-variant/30 mx-1 hidden sm:block"></div>
            <button 
              onClick={() => onTabChange && onTabChange('profile')} 
              className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border border-outline-variant/30 hover:opacity-80 transition-opacity"
              style={{ cursor: 'pointer', background: 'var(--hover-bg)' }}
            >
              <img 
                src={profile.avatarUrl} 
                alt="User Avatar" 
                className="w-full h-full object-cover" 
              />
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={toggleDark} 
              className="p-2 rounded-full transition-all text-on-surface-variant"
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              className="p-2 rounded-full transition-all text-on-surface-variant relative"
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant/30 mx-1 hidden sm:block"></div>
            <button 
              onClick={() => onTabChange && onTabChange('profile')} 
              className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border border-outline-variant/30 md:hidden hover:opacity-80 transition-opacity"
              style={{ cursor: 'pointer', background: 'var(--hover-bg)' }}
            >
              <img 
                src={profile.avatarUrl} 
                alt="User Avatar" 
                className="w-full h-full object-cover" 
              />
            </button>
            <button onClick={() => onTabChange && onTabChange('profile')} className="hidden sm:block text-left hover:opacity-80 transition-opacity" style={{ cursor: 'pointer' }}>
               <span className="text-sm font-semibold text-on-surface">{profile.fullName}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
