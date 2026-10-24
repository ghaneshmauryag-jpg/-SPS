import React from 'react';
import { X, Printer } from 'lucide-react';
import { PredictionRecord } from '../types';

interface PrintReportModalProps {
  prediction: PredictionRecord | null;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  prediction,
  onClose,
}) => {
  if (!prediction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Actions bar */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold">Printable College Performance Transcript</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-8 sm:p-10 space-y-6 print:p-0 print:m-0 bg-white text-slate-900" id="printable-report">
          {/* Institution Header */}
          <div className="text-center pb-5 border-b-2 border-slate-900 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900">
              Department of Computer Science
            </h1>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
              College Academic Assessment &amp; Performance Prediction System
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Audit ID: {prediction.id} • Issued: {new Date(prediction.timestamp).toLocaleDateString()}
            </p>
          </div>

          {/* Student Profile Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Candidate Name</span>
              <span className="text-sm font-bold text-slate-900">
                {prediction.studentName || 'Unregistered Candidate'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Roll / ID</span>
              <span className="text-sm font-mono font-bold text-slate-900">
                {prediction.studentId || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Program / Semester</span>
              <span className="font-semibold text-slate-800">
                {prediction.course || 'Computer Science'} — Semester {prediction.semester || 4}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Evaluation Model</span>
              <span className="font-semibold text-slate-800 font-mono">
                {prediction.modelUsed}
              </span>
            </div>
          </div>

          {/* Continuous Assessment Input Metrics */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              Continuous Assessment Indicators
            </h3>
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border-b border-r border-slate-300">Parameter</th>
                  <th className="p-2 border-b border-r border-slate-300 text-center">Score / Metric</th>
                  <th className="p-2 border-b border-slate-300">Institutional Benchmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr>
                  <td className="p-2 border-r border-slate-200">Class Lecture &amp; Lab Attendance</td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold font-mono">
                    {prediction.input.attendancePct}%
                  </td>
                  <td className="p-2 text-slate-500">75% minimum mandatory requirement</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">
                    Semester-wise Previous Examination Marks
                    {prediction.input.previousSemesters && prediction.input.previousSemesters.length > 0 && (
                      <span className="block text-[10px] text-slate-500 font-normal">
                        ({prediction.input.previousSemesters.map(s => `Sem ${s.semester}: ${s.marks}`).join(' | ')}
                        {(prediction.semesterTrend || prediction.input.semesterTrend) ? ` • Trend: ${(prediction.semesterTrend || prediction.input.semesterTrend)?.trendLabel}` : ''})
                      </span>
                    )}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold font-mono">
                    {prediction.input.prevExamMarks} / 100
                  </td>
                  <td className="p-2 text-slate-500">
                    {prediction.input.previousSemesters && prediction.input.previousSemesters.length > 1
                      ? 'Recency-weighted trajectory across semesters'
                      : 'Historical performance baseline'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">Mid-term Internal Assessment Marks</td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold font-mono">
                    {prediction.input.internalMarks} / 20
                  </td>
                  <td className="p-2 text-slate-500">Continuous internal college evaluation</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">Dedicated Weekly Study Hours</td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold font-mono">
                    {prediction.input.weeklyStudyHours} hrs/week
                  </td>
                  <td className="p-2 text-slate-500">Independent revision and coding lab practice</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Machine Learning Prediction Result */}
          <div className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/50 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
                Forecasted Final Examination Marks
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-blue-950 font-mono">
                  {prediction.predictedMarks}
                </span>
                <span className="text-xs font-bold text-slate-500">/ 100</span>
                <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                  {prediction.category} Tier
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                95% Confidence Interval: [{prediction.confidenceRange[0]} – {prediction.confidenceRange[1]}] marks
              </p>
            </div>
          </div>

          {/* Academic Recommendations */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              Faculty Mentoring &amp; Recommendations
            </h3>
            <div className="space-y-2 text-xs">
              {prediction.recommendations.map((rec, i) => (
                <div key={i} className="p-2.5 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-900">
                    {i + 1}. {rec.title} ({rec.priority.toUpperCase()} Priority)
                  </div>
                  <p className="text-slate-600 mt-0.5">{rec.actionableStep}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures & Disclaimers */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-600 border-t border-slate-300">
            <div>
              <div className="w-48 mx-auto border-b border-slate-400 mb-1 h-10"></div>
              <p className="font-semibold text-slate-800">Faculty Guide / Mentor</p>
              <p className="text-[10px] text-slate-400">Department of Computer Science</p>
            </div>
            <div>
              <div className="w-48 mx-auto border-b border-slate-400 mb-1 h-10"></div>
              <p className="font-semibold text-slate-800">Head of Department</p>
              <p className="text-[10px] text-slate-400">Institutional Seal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
