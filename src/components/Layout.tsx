import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Tab } from '../types';
import { Home as HomeIcon, Activity, Heart, LineChart } from 'lucide-react';

interface LayoutProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onLogout: () => void;
  children: React.ReactNode;
  title?: string;
  hideSidebarAndTopbar?: boolean;
}

export function Layout({ currentTab, onTabChange, onBack, canGoBack, onLogout, children, title, hideSidebarAndTopbar }: LayoutProps) {
  if (hideSidebarAndTopbar) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-dvh h-dvh flex overflow-hidden bg-background">
      <Sidebar currentTab={currentTab} onTabChange={onTabChange} onLogout={onLogout} />
      <div className="flex-1 min-h-0 h-full overflow-hidden flex flex-col md:ml-[280px]">
        <TopBar title={title} onTabChange={onTabChange} onBack={onBack} canGoBack={canGoBack} currentTab={currentTab} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-20 pb-20 md:pb-6 px-4 md:px-8 w-full relative flex flex-col">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 px-6 py-3 flex justify-between items-center z-50">
        <button onClick={() => onTabChange('home')} className={`flex flex-col items-center gap-1 ${currentTab === 'home' ? 'text-primary' : 'text-on-surface-variant'}`}>
          <HomeIcon className={`w-6 h-6 ${currentTab === 'home' ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => onTabChange('workouts')} className={`flex flex-col items-center gap-1 ${currentTab === 'workouts' ? 'text-primary' : 'text-on-surface-variant'}`}>
          <Activity className={`w-6 h-6 ${currentTab === 'workouts' ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Exercises</span>
        </button>
        <button onClick={() => onTabChange('favorites')} className={`flex flex-col items-center gap-1 ${currentTab === 'favorites' ? 'text-primary' : 'text-on-surface-variant'}`}>
          <Heart className={`w-6 h-6 ${currentTab === 'favorites' ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Favorites</span>
        </button>
        <button onClick={() => onTabChange('progress')} className={`flex flex-col items-center gap-1 ${currentTab === 'progress' ? 'text-primary' : 'text-on-surface-variant'}`}>
          <LineChart className={`w-6 h-6 ${currentTab === 'progress' ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Progress</span>
        </button>
      </nav>
    </div>
  );
}
