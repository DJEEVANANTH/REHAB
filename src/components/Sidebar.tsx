import React from 'react';
import { Home, Activity, Camera, Heart, Calendar, LineChart, Settings, LogOut, Zap } from 'lucide-react';
import { Tab } from '../types';

interface SidebarProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  onLogout: () => void;
}

export function Sidebar({ currentTab, onTabChange, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'home',         icon: Home,      label: 'Home'             },
    { id: 'workouts',     icon: Activity,  label: 'Rehab Exercises'  },
    { id: 'ai-detection', icon: Camera,    label: 'Motion Tracking'  },
    { id: 'favorites',    icon: Heart,     label: 'Favorites'        },
    { id: 'schedule',     icon: Calendar,  label: 'Schedule'         },
    { id: 'progress',     icon: LineChart, label: 'Progress'         },
  ] as const;

  const onNavEnter = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
    if (isActive) return;
    const el = e.currentTarget;
    el.style.background = 'rgba(255,255,255,0.08)';
    el.style.color       = '#FFFFFF';
    el.style.border      = '1px solid rgba(255,255,255,0.12)';
  };
  const onNavLeave = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
    if (isActive) return;
    const el = e.currentTarget;
    el.style.background = 'transparent';
    el.style.color       = '#CBD5E1';
    el.style.border      = '1px solid transparent';
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 w-[280px] hidden md:flex flex-col min-h-dvh h-dvh z-50 overflow-hidden"
      style={{
        background: '#062E2D',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '6px 0 48px rgba(0,0,0,0.15), inset -1px 0 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Barely-there white sheen at top — cinematic luxury finish */}
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
          zIndex:        0,
          }}
      />

      {/* Subtle depth vignette at bottom */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          bottom:        0,
          left:          0,
          right:         0,
          height:        '160px',
          background:    'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

      {/* ══════ CONTENT ══════ */}
      <div className="relative flex flex-col flex-1 min-h-0 p-stack-md" style={{ zIndex: 1 }}>

        {/* ── Logo ── */}
        <div className="mb-10 px-4 pt-2">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #ffffff18 0%, #ffffff08 100%)',
                border:     '1px solid rgba(255,255,255,0.12)',
                boxShadow:  '0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <Zap className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.9)' }} fill="rgba(255,255,255,0.9)" />
            </div>
            <h1
              className="text-[1.1rem] font-black tracking-tight"
              style={{ color: '#ffffff', letterSpacing: '-0.02em' }}
            >
              Rehab
            </h1>
          </div>
          <p
            className="text-[8.5px] font-bold uppercase tracking-[0.2em] pl-[42px]"
            style={{ color: 'rgba(255,255,255,0.28)' }}
          >
            AI Physiotherapy & Rehab
          </p>
        </div>

        {/* ── Section label ── */}
        <p
          className="text-[9px] font-semibold uppercase tracking-[0.18em] px-4 mb-2"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Navigation
        </p>

        {/* ── Nav items ── */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as Tab)}
                onMouseEnter={e => onNavEnter(e, isActive)}
                onMouseLeave={e => onNavLeave(e, isActive)}
                className="w-full flex items-center justify-between px-4 py-3.5 relative"
                style={{
                  borderRadius:   '14px',
                  background:     isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  border:         isActive
                    ? '1px solid rgba(255,255,255,0.16)'
                    : '1px solid transparent',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  boxShadow:      isActive
                    ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.15)'
                    : 'none',
                  color:      isActive ? '#FFFFFF' : '#CBD5E1',
                  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                  cursor:     'pointer',
                }}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon
                    className="w-[17px] h-[17px] flex-shrink-0"
                    style={{
                      color:      isActive ? '#FFFFFF' : '#CBD5E1',
                      transition: 'all 0.2s ease',
                    }}
                  />
                  <span
                    className="text-[13px] tracking-tight"
                    style={{ fontWeight: isActive ? 600 : 400 }}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Active right-edge indicator — soft white glow */}
                {isActive && (
                  <span
                    className="absolute right-0 top-[18%] bottom-[18%] w-[2px] rounded-l-full"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 100%)',
                      boxShadow:  '0 0 8px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.15)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Bottom: Settings + Logout ── */}
        <div
          className="mt-auto pt-4 pb-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Settings */}
          <button
            onClick={() => onTabChange('settings')}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 mb-1"
            style={{
              borderRadius: '14px',
              color:        '#CBD5E1',
              border:       '1px solid transparent',
              transition:   'all 0.2s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.background = 'rgba(255,255,255,0.08)';
              el.style.color      = '#FFFFFF';
              el.style.border     = '1px solid rgba(255,255,255,0.12)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.background = 'transparent';
              el.style.color      = '#CBD5E1';
              el.style.border     = '1px solid transparent';
            }}
          >
            <Settings className="w-[17px] h-[17px] flex-shrink-0" />
            <span className="text-[13px] tracking-tight">Settings</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3.5"
            style={{
              borderRadius: '14px',
              color:        'rgba(248,113,113,0.7)',
              border:       '1px solid transparent',
              transition:   'all 0.2s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.background = 'rgba(239,68,68,0.1)';
              el.style.color      = 'rgba(252,165,165,0.95)';
              el.style.border     = '1px solid rgba(239,68,68,0.18)';
              el.style.boxShadow  = 'inset 0 1px 0 rgba(255,255,255,0.03)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.background = 'transparent';
              el.style.color      = 'rgba(248,113,113,0.7)';
              el.style.border     = '1px solid transparent';
              el.style.boxShadow  = 'none';
            }}
          >
            <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
            <span className="text-[13px] font-semibold tracking-tight">Logout</span>
          </button>
        </div>

      </div>
    </aside>
  );
}
