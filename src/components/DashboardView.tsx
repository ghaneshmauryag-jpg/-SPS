import React from 'react';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  BrainCircuit,
  AlertTriangle,
  Award,
  ArrowRight,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Student, PredictionRecord, DashboardStats, SubjectBenchmark } from '../types';
import { SUBJECT_BENCHMARKS } from '../services/storage';
import { useTheme } from '../context/ThemeContext';

interface DashboardViewProps {
  stats: DashboardStats;
  students: Student[];
  predictions: PredictionRecord[];
  onOpenPredict: () => void;
  onNavigateToStudents: () => void;
  onNavigateToAnalytics: () => void;
  onViewPrediction: (pred: PredictionRecord) => void;
  onSelectStudentToPredict: (student: Student) => void;
}

const CATEGORY_COLORS = {
  Excellent: '#10b981',
  Good: '#3b82f6',
  Satisfactory: '#f59e0b',
  'Needs Improvement': '#ef4444',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  students,
  predictions,
  onOpenPredict,
  onNavigateToStudents,
  onNavigateToAnalytics,
  onViewPrediction,
  onSelectStudentToPredict,
}) => {
  const { isDarkMode } = useTheme();

  const categoryCounts: Record<string, number> = {
    Excellent: 0,
    Good: 0,
    Satisfactory: 0,
    'Needs Improvement': 0,
  };

  predictions.forEach(p => {
    if (categoryCounts[p.category] !== undefined) {
      categoryCounts[p.category]++;
    }
  });

  const pieData = Object.keys(categoryCounts)
    .filter(cat => categoryCounts[cat] > 0 || predictions.length === 0)
    .map(category => ({
      name: category,
      value: categoryCounts[category] || 0,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
    }));

  const atRiskList = students
    .filter(s => s.attendancePct < 75 || s.prevExamMarks < 50 || s.internalMarks < 10)
    .slice(0, 4);

  return (
    <div className="space-y-6 pt-1">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white p-6 md:p-8 shadow-md border border-blue-900/40 dark:border-blue-500/30">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-semibold mb-3 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>College Academic Decision Support</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Student Performance Prediction System
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Machine Learning decision support system to forecast semester final marks using
            attendance patterns, internal assessment scores (out of 20), and dedicated study hours.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPredict}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 transition-all hover:scale-102 active:scale-98"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Predict Student Performance</span>
            </button>
            <button
              onClick={onNavigateToStudents}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-medium border border-white/10 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>View All Records ({stats.totalStudents})</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Enrolled
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalStudents}</span>
            <span className="text-xs text-slate-400 font-medium">Students</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active college cohort records</p>
        </div>

        {/* Card 2: Average Attendance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg. Attendance
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.avgAttendance}%</span>
            <span
              className={`text-xs font-semibold ${
                stats.avgAttendance >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {stats.avgAttendance >= 75 ? '✓ Meets 75% req.' : '⚠ Below 75%'}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                stats.avgAttendance >= 75 ? 'bg-sky-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, stats.avgAttendance)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Avg Previous Marks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Semester Prev. Marks
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.avgPrevMarks}</span>
            <span className="text-xs text-slate-400">/ 100 max</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Prior semester examination baseline</p>
        </div>

        {/* Card 4: Academic Support Alert */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Need Intervention
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.atRiskCount}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Students flagged</span>
          </div>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 font-medium">Low attendance or test scores</p>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subject Benchmarks */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  College Course Subject Benchmarks
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                College Syllabus
              </span>
            </div>

            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={SUBJECT_BENCHMARKS}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <XAxis
                    dataKey="code"
                    tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as SubjectBenchmark;
                        return (
                          <div className="p-2.5 bg-slate-900 text-white rounded-lg shadow-lg text-xs space-y-1">
                            <p className="font-bold text-sky-300">{data.subject}</p>
                            <p className="text-slate-300">Course Code: {data.code}</p>
                            <p className="text-slate-300">Cohort Avg: {data.avgMarks}/100</p>
                            <p className="text-emerald-400">Pass Rate: {data.passingPct}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="avgMarks"
                    name="Average Marks"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-500" /> Cohort Class Average
              </span>
            </div>
            <button
              onClick={onNavigateToAnalytics}
              className="text-blue-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
            >
              Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Predicted Performance Distribution */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  Predicted Performance Tiers
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {predictions.length} Evaluated
              </span>
            </div>

            <div className="mt-4 h-52 w-full flex items-center justify-center">
              {predictions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
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
                      formatter={(value: any, name: any) => [`${value} students`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  <BrainCircuit className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No predictions made yet. Click &quot;Predict Student Performance&quot; to start.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div
                  key={cat}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS],
                      }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 truncate">{cat}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={onOpenPredict}
              className="text-xs text-blue-600 dark:text-sky-400 font-semibold hover:underline"
            >
              + Evaluate New Student
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: At-Risk Students & Recent Prediction Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Students List */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Students Requiring Academic Support
              </h3>
            </div>
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              {atRiskList.length} Flagged
            </span>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {atRiskList.length > 0 ? (
              atRiskList.map(student => (
                <div
                  key={student.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{student.name}</p>
                      <span className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded-xs">
                        {student.studentId}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className={student.attendancePct < 75 ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
                        Attendance: {student.attendancePct}%
                      </span>
                      <span>•</span>
                      <span className={student.internalMarks < 10 ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                        Internals: {student.internalMarks}/20
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectStudentToPredict(student)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-sky-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Predict</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">
                All enrolled students currently meet baseline academic thresholds.
              </p>
            )}
          </div>
        </div>

        {/* Recent Prediction Activity */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Recent Prediction Activity
              </h3>
            </div>
            <button
              onClick={() => onNavigateToAnalytics()}
              className="text-xs text-blue-600 dark:text-sky-400 font-semibold hover:underline"
            >
              View Full History
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentPredictions.length > 0 ? (
              stats.recentPredictions.map(pred => (
                <div
                  key={pred.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors cursor-pointer"
                  onClick={() => onViewPrediction(pred)}
                >
                  <div className="truncate">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {pred.studentName || pred.studentId || 'Direct Evaluation'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Att: {pred.input.attendancePct}% | Internals: {pred.input.internalMarks}/20 | Study: {pred.input.weeklyStudyHours}h
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {pred.predictedMarks}
                      </span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[pred.category]}15`,
                        color: CATEGORY_COLORS[pred.category],
                      }}
                    >
                      {pred.category}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">
                No recent predictions logged.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
