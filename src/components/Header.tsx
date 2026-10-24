import React, { useState } from 'react';
import {
  Menu,
  BrainCircuit,
  RotateCcw,
  Server,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { storageService } from '../services/storage';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenPredict: () => void;
  onResetData: () => void;
  title: string;
  subtitle?: string;
  onOpenDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenPredict,
  onResetData,
  title,
  subtitle,
  onOpenDocs,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [fastApiUrl, setFastApiUrl] = useState(storageService.getFastApiUrl());
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    storageService.setFastApiUrl(fastApiUrl);
    const result = await storageService.testFastApiConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 md:px-8 flex items-center justify-between transition-colors duration-200">
        {/* Left Title Area */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-hidden shrink-0"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate leading-snug">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dark / Normal Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={isDarkMode ? 'Switch to Normal (Light) Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Backend Status Pill */}
          <button
            onClick={() => setShowBackendModal(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Inspect Machine Learning Execution Mode"
          >
            <Server className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>ML Engine:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Active
            </span>
          </button>

          {/* Reset Demo Records Shortcut */}
          <button
            onClick={() => {
              if (window.confirm('Reset student records and predictions to default college demo data?')) {
                onResetData();
              }
            }}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset to College Demo Records"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Quick Docs Link */}
          <button
            onClick={onOpenDocs}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-sky-300 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="View College Viva Questions & Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Prominent Predict Button */}
          <button
            onClick={onOpenPredict}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-blue-500/20 active:scale-98 transition-all"
          >
            <BrainCircuit className="w-4 h-4" />
            <span className="hidden xs:inline">Predict Marks</span>
            <span className="xs:hidden">Predict</span>
          </button>
        </div>
      </header>

      {/* Backend & Environment Modal */}
      {showBackendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Backend & Model Engine</h3>
              </div>
              <button
                onClick={() => setShowBackendModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl">
                <p className="font-semibold text-blue-900 dark:text-sky-300 mb-1">
                  1. Built-in Machine Learning Engine (Currently Active)
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Runs full Random Forest Regressor & Linear Regression algorithms trained on 600 college records with seed=42 and 80/20 train/test split.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  2. Standalone Python FastAPI Backend
                </p>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Complete Python code located in <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">/backend</code> using FastAPI, scikit-learn, and SQLite.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fastApiUrl}
                    onChange={e => setFastApiUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-500 font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-medium rounded-lg disabled:opacity-50"
                  >
                    {isTesting ? 'Testing...' : 'Test'}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`mt-2 p-2 rounded-lg flex items-start gap-1.5 ${
                      testResult.ok
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {testResult.ok ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowBackendModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-xs hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
