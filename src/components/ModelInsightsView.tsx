import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Info,
  Scale,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { mlEngine } from '../ml/mlEngine';
import { ModelComparison } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ModelInsightsViewProps {
  onModelRetrained?: () => void;
}

export const ModelInsightsView: React.FC<ModelInsightsViewProps> = ({
  onModelRetrained,
}) => {
  const { isDarkMode } = useTheme();
  const [insights, setInsights] = useState<ModelComparison>(() => mlEngine.getModelInsights());
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainLogs, setRetrainLogs] = useState<string[]>([]);

  const handleRetrain = () => {
    setIsRetraining(true);
    setRetrainLogs([
      'Generating reproducible college academic dataset with new pseudo-random seed...',
      'Features: Attendance, Semester-wise Previous Marks, Internal Assessment (/20), Weekly Study Hours...',
      'Partitioning into 80% Training (480 records) and 20% Testing (120 records)...',
      'Fitting Linear Regression via Normal Equations with Ridge regularizer...',
      'Fitting Random Forest Regressor (16 Decision Trees with MSE impurity splits)...',
      'Evaluating MAE, RMSE, and R² on held-out test split...',
    ]);

    setTimeout(() => {
      const newInsights = mlEngine.retrain();
      setInsights(newInsights);
      setIsRetraining(false);
      setRetrainLogs(prev => [
        ...prev,
        `✓ Training Complete! Best Model: ${newInsights.selectedModel}`,
      ]);
      if (onModelRetrained) onModelRetrained();
    }, 550);
  };

  const { linearRegression: lr, randomForest: rf, featureImportances, datasetInfo } = insights;
  const axisTickColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-6 pt-1">
      {/* Title & Retrain Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-sky-400" />
            <span>Machine Learning Model Insights & Evaluation</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Comparative evaluation between Linear Regression (Baseline) and Random Forest Regressor
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? 'Training Model...' : 'Simulate Model Retraining'}</span>
        </button>
      </div>

      {/* Retrain Logs */}
      {retrainLogs.length > 0 && (
        <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] space-y-1 shadow-inner">
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            Execution Console Output:
          </p>
          {retrainLogs.map((log, i) => (
            <p key={i} className="leading-tight">
              &gt; {log}
            </p>
          ))}
        </div>
      )}

      {/* Side-by-Side Model Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline: Linear Regression */}
        <div
          className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between ${
            insights.selectedModel === 'LinearRegression'
              ? 'border-blue-500 ring-2 ring-blue-500/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Baseline Model
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Linear Regression</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                OLS + Ridge
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Computes continuous examination score as a weighted linear combination of input features. Simple, interpretable baseline.
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  MAE
                </span>
                <span className="text-lg font-black text-slate-800 dark:text-white">{lr.mae}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">marks error</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  RMSE
                </span>
                <span className="text-lg font-black text-slate-800 dark:text-white">{lr.rmse}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">root mean sq</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  R² Score
                </span>
                <span className="text-lg font-black text-blue-700 dark:text-sky-400">{lr.r2}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">variance explained</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Evaluated on {lr.testingSamples} held-out test samples</span>
            <span>Weights: 4 features + bias</span>
          </div>
        </div>

        {/* Selected Model: Random Forest Regressor */}
        <div
          className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between ${
            insights.selectedModel === 'RandomForestRegressor'
              ? 'border-blue-600 ring-2 ring-blue-600/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Primary Selected Model</span>
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Random Forest Regressor</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                Ensemble Winner
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Ensemble of randomized Decision Trees trained with bootstrap aggregation and MSE reduction. Captures non-linear thresholds and academic interactions.
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase block">
                  MAE
                </span>
                <span className="text-lg font-black text-emerald-900 dark:text-emerald-200">{rf.mae}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">marks error</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase block">
                  RMSE
                </span>
                <span className="text-lg font-black text-emerald-900 dark:text-emerald-200">{rf.rmse}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">root mean sq</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase block">
                  R² Score
                </span>
                <span className="text-lg font-black text-emerald-900 dark:text-emerald-200">{rf.r2}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">variance explained</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Evaluated on {rf.testingSamples} held-out test samples</span>
            <span>16 Estimators (Trees)</span>
          </div>
        </div>
      </div>

      {/* Feature Importance & Model Interpretation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Input Feature Importances (% Variance Reduction)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mean decrease in impurity across all decision trees in the Random Forest
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              MDI Metric
            </span>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureImportances}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <XAxis type="number" unit="%" domain={[0, 60]} tick={{ fontSize: 11, fill: axisTickColor }} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tick={{ fontSize: 11, fill: isDarkMode ? '#e2e8f0' : '#1e293b' }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                  }}
                  itemStyle={{ color: isDarkMode ? '#38bdf8' : '#2563eb' }}
                  formatter={(val: any) => [`${val}%`, 'Relative Importance']}
                />
                <Bar dataKey="importancePct" fill="#2563eb" radius={[0, 6, 6, 0]}>
                  {featureImportances.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#1d4ed8' : index === 1 ? '#2563eb' : '#38bdf8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 text-[11px] text-slate-400 text-center">
            Semester-wise previous marks and internal assessment (/20) demonstrate highest predictive power
          </div>
        </div>

        {/* Evaluation Methodology & Dataset Info */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Training Dataset & Validation Methodology
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Machine learning standards applied for college academic validity
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <Info className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    Dataset Structure ({datasetInfo.totalRecords} Samples)
                  </strong>
                  <span>
                    80% Training ({datasetInfo.trainSplit} records) and 20% Testing ({datasetInfo.testSplit} records) partitioned with fixed seed ({datasetInfo.seed}) to eliminate data leakage.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    Evaluation Metrics Formulae
                  </strong>
                  <span className="font-mono text-[11px]">
                    MAE = (1/N) * Σ |y - ŷ| <br />
                    RMSE = √((1/N) * Σ (y - ŷ)²) <br />
                    R² = 1 - (SS_res / SS_tot)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5">College Project Integrity Notice</strong>
                  <span className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                    This model is trained on synthetic college academic data modeling realistic university patterns. It serves as an educational decision-support demonstration, not a guarantee of individual student results.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Model Seed: {datasetInfo.seed}</span>
            <span>Target: Final Examination Marks (0-100)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
