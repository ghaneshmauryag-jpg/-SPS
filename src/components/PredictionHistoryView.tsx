import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Download,
  Eye,
  Printer,
  Trash2,
  BrainCircuit,
  Calendar,
} from 'lucide-react';
import { PredictionRecord } from '../types';
import { storageService } from '../services/storage';

interface PredictionHistoryViewProps {
  predictions: PredictionRecord[];
  onViewPrediction: (prediction: PredictionRecord) => void;
  onPrintPrediction: (prediction: PredictionRecord) => void;
  onDeletePrediction: (id: string) => void;
  onClearHistory: () => void;
  onOpenPredict: () => void;
}

const CATEGORY_PILLS = {
  Excellent: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  Good: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-sky-300 border-blue-200 dark:border-blue-800',
  Satisfactory: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'Needs Improvement': 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

export const PredictionHistoryView: React.FC<PredictionHistoryViewProps> = ({
  predictions,
  onViewPrediction,
  onPrintPrediction,
  onDeletePrediction,
  onClearHistory,
  onOpenPredict,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredPredictions = useMemo(() => {
    return predictions.filter(p => {
      const name = (p.studentName || '').toLowerCase();
      const id = (p.studentId || '').toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchSearch = name.includes(q) || id.includes(q) || p.id.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [predictions, searchQuery, selectedCategory]);

  const handleExportCSV = () => {
    const csv = storageService.exportPredictionsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `college_prediction_history_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pt-1">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600 dark:text-sky-400" />
            <span>Prediction History & Auditing</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log of all machine learning inference runs, internal marks (/20), confidence intervals, and recommendations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {predictions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all stored prediction history logs?')) {
                  onClearHistory();
                }
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors"
            >
              Clear Log
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={predictions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenPredict}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>New Prediction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search prediction history by student..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Performance Tier:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-blue-500 font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Categories</option>
            <option value="Excellent">Excellent (85–100)</option>
            <option value="Good">Good (70–84)</option>
            <option value="Satisfactory">Satisfactory (50–69)</option>
            <option value="Needs Improvement">Needs Improvement (&lt;50)</option>
          </select>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Evaluation Date</th>
                <th className="py-3 px-4 text-center">Attendance</th>
                <th className="py-3 px-4 text-center">Semester Prev. Marks</th>
                <th className="py-3 px-4 text-center">Internals (/20)</th>
                <th className="py-3 px-4 text-center">Predicted Final</th>
                <th className="py-3 px-4 text-center">Tier Category</th>
                <th className="py-3 px-4 text-center">Confidence (95%)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPredictions.length > 0 ? (
                filteredPredictions.map(pred => (
                  <tr
                    key={pred.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {pred.studentName || 'Direct Evaluation'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {pred.studentId || pred.id.slice(0, 10)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(pred.timestamp).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                      {pred.input.attendancePct}%
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                      <div>{pred.input.prevExamMarks}</div>
                      {pred.input.previousSemesters && pred.input.previousSemesters.length > 0 && (
                        <div className="text-[10px] text-blue-600 dark:text-sky-400 font-semibold">
                          {pred.input.previousSemesters.length} Sem{pred.input.previousSemesters.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                      {pred.input.internalMarks} / 20
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {pred.predictedMarks}
                      </span>
                      <span className="text-[10px] text-slate-400">/100</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${
                          CATEGORY_PILLS[pred.category] || 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        {pred.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      [{pred.confidenceRange[0]} – {pred.confidenceRange[1]}]
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewPrediction(pred)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md font-medium text-[11px] flex items-center gap-1 transition-colors"
                          title="View Result"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => onPrintPrediction(pred)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-300 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Print Student Report"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePrediction(pred.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No prediction history found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Execute a student performance forecast to create an audit record.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
