import React from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  GraduationCap,
  BarChart3,
  History,
  Cpu,
  BookOpen,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type ActiveTab =
  | 'dashboard'
  | 'predict'
  | 'students'
  | 'analytics'
  | 'history'
  | 'models'
  | 'docs';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  totalStudents: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  totalStudents,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'predict' as ActiveTab,
      label: 'Predict Performance',
      icon: BrainCircuit,
      badge: 'ML',
      highlight: true,
    },
    {
      id: 'students' as ActiveTab,
      label: 'Student Records',
      icon: GraduationCap,
      badge: totalStudents.toString(),
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics & Trends',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Prediction History',
      icon: History,
      badge: null,
    },
    {
      id: 'models' as ActiveTab,
      label: 'Model Insights',
      icon: Cpu,
      badge: 'R²',
    },
    {
      id: 'docs' as ActiveTab,
      label: 'Viva Guide & Docs',
      icon: BookOpen,
      badge: 'Guide',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                SPS
              </h1>
              <p className="text-[11px] text-slate-400">Student Performance System</p>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Switch to Normal (Light) Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-300" />}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Navigation Modules
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${item.highlight && !isActive ? 'ring-1 ring-sky-500/30 bg-sky-950/20' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : item.highlight ? 'text-sky-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                      isActive
                        ? 'bg-blue-500/40 text-white'
                        : item.highlight
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Academic Project Info Card */}
        <div className="p-3.5 m-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 text-sky-400 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>College ML Pipeline</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Random Forest Ensemble vs Linear Regression baseline with 80/20 train-test validation.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
            <span>Status:</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Trained (R² ~ 0.89)
            </span>
          </div>
        </div>

        {/* User / College Tag */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/30 text-xs flex items-center justify-between text-slate-400">
          <div className="truncate">
            <p className="text-slate-200 font-medium truncate">Department of Computer Science</p>
            <p className="text-[10px] text-slate-400">College Academic Project</p>
          </div>
        </div>
      </aside>
    </>
  );
};
