import React from 'react';
import {
  BrainCircuit,
  Printer,
  X,
  CheckCircle2,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import { PredictionRecord } from '../types';

interface PredictionResultModalProps {
  prediction: PredictionRecord | null;
  onClose: () => void;
  onPrint: (prediction: PredictionRecord) => void;
}

const CATEGORY_CONFIG = {
  Excellent: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-800 dark:text-emerald-300',
    badge: 'bg-emerald-600 text-white',
    barColor: 'bg-emerald-500',
    description: 'Outstanding mastery of coursework; projected for college distinction recognition.',
  },
  Good: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-sky-300',
    badge: 'bg-blue-600 text-white',
    barColor: 'bg-blue-500',
    description: 'Strong academic performance with sound grasp of theory and lab practicals.',
  },
  Satisfactory: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-300',
    badge: 'bg-amber-600 text-white',
    barColor: 'bg-amber-500',
    description: 'Meets passing benchmarks; targeted revision will elevate score to Good tier.',
  },
  'Needs Improvement': {
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-300',
    badge: 'bg-red-600 text-white',
    barColor: 'bg-red-500',
    description: 'At risk of academic distress. Requires targeted faculty mentoring and remedial support.',
  },
};

export const PredictionResultModal: React.FC<PredictionResultModalProps> = ({
  prediction,
  onClose,
  onPrint,
}) => {
  if (!prediction) return null;

  const config = CATEGORY_CONFIG[prediction.category] || CATEGORY_CONFIG['Satisfactory'];
  const { input, predictedMarks, confidenceRange, recommendations } = prediction;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-base text-white">Machine Learning Prediction Result</h3>
              <p className="text-xs text-slate-400">
                Evaluation Model: {prediction.modelUsed}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Score & Classification Card */}
          <div className={`p-6 rounded-2xl border ${config.bg} ${config.border} flex flex-col sm:flex-row items-center justify-between gap-6`}>
            <div className="space-y-2 text-center sm:text-left">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${config.badge}`}>
                {prediction.category} Tier
              </span>
              <p className={`text-xs ${config.text} max-w-md font-medium leading-relaxed`}>
                {config.description}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                95% Confidence Interval: {confidenceRange[0]} – {confidenceRange[1]} marks
              </p>
            </div>

            {/* Score Display */}
            <div className="text-center shrink-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {predictedMarks}
                </span>
                <span className="text-sm font-bold text-slate-400">/100</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                Predicted Marks
              </p>
            </div>
          </div>

          {/* Progress Bar Meter */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-1.5 font-medium">
              <span>Overall Predicted Score</span>
              <span className="font-bold text-slate-900 dark:text-white">{predictedMarks}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-700 ${config.barColor}`}
                style={{ width: `${Math.min(100, Math.max(0, predictedMarks))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0 (Fail)</span>
              <span>50 (Pass Threshold)</span>
              <span>70 (Good)</span>
              <span>85+ (Distinction)</span>
            </div>
          </div>

          {/* Student & Input Summary Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
              Submitted Academic Profile
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Candidate</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate block">
                  {prediction.studentName || prediction.studentId || 'Direct Evaluation'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Attendance</span>
                <span className={`font-semibold ${input.attendancePct < 75 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {input.attendancePct}% {input.attendancePct < 75 ? '⚠' : '✓'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Semester Prev. Marks</span>
                <span className="font-semibold text-slate-900 dark:text-white">{input.prevExamMarks}/100</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Internal Assessment</span>
                <span className={`font-semibold ${input.internalMarks < 10 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {input.internalMarks}/20
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-4">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Weekly Study Hours</span>
                <span className="font-semibold text-slate-900 dark:text-white">{input.weeklyStudyHours} hrs/week</span>
              </div>
            </div>

            {/* Dynamic Multi-Semester Breakdown if provided */}
            {input.previousSemesters && input.previousSemesters.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Evaluated Semester History ({input.previousSemesters.length} Semesters)
                  </span>
                  {(prediction.semesterTrend || input.semesterTrend) && (
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-sky-300">
                      Trajectory: {(prediction.semesterTrend || input.semesterTrend)?.trendLabel}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {input.previousSemesters.map((s) => (
                    <span
                      key={s.semester}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs"
                    >
                      <strong className="text-blue-600 dark:text-sky-400">Sem {s.semester}:</strong> {s.marks}/100
                    </span>
                  ))}
                  {(prediction.semesterTrend || input.semesterTrend) && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-800 dark:text-sky-300">
                      Weighted Baseline: {input.prevExamMarks}/100
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Personalized Academic Recommendations</span>
            </h4>
            <div className="space-y-2.5">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{rec.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        rec.priority === 'high'
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : rec.priority === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">{rec.description}</p>
                  <div className="flex items-start gap-1.5 p-2 bg-blue-50/60 dark:bg-blue-950/40 rounded-lg text-blue-900 dark:text-sky-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-sky-400 mt-0.5" />
                    <span>
                      <strong className="font-semibold">Action Plan: </strong>
                      {rec.actionableStep}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <p>
              <strong>Academic Disclaimer:</strong> This prediction is a decision-support estimate generated by machine learning algorithms for college presentation and mentoring. It should not be used as the sole basis for official university grading.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Audit ID: {prediction.id.slice(0, 10)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(prediction)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Performance Report</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
