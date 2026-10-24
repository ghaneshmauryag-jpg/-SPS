import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  Cell,
  Legend,
} from 'recharts';
import { Student, PredictionRecord } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AnalyticsViewProps {
  students: Student[];
  predictions: PredictionRecord[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  students,
  predictions,
}) => {
  const { isDarkMode } = useTheme();
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchCourse = selectedCourse === 'ALL' || s.course === selectedCourse;
      const matchSem = selectedSemester === 'ALL' || s.semester === Number(selectedSemester);
      return matchCourse && matchSem;
    });
  }, [students, selectedCourse, selectedSemester]);

  const scatterData = useMemo(() => {
    return filteredStudents.map(s => ({
      name: s.name,
      studentId: s.studentId,
      attendance: s.attendancePct,
      prevMarks: s.prevExamMarks,
      internal: s.internalMarks,
      studyHours: s.weeklyStudyHours,
    }));
  }, [filteredStudents]);

  const gradeDistribution = useMemo(() => {
    const bins = {
      'Needs Improvement (<50)': 0,
      'Satisfactory (50–69)': 0,
      'Good (70–84)': 0,
      'Excellent (85–100)': 0,
    };

    filteredStudents.forEach(s => {
      const m = s.prevExamMarks;
      if (m < 50) bins['Needs Improvement (<50)']++;
      else if (m < 70) bins['Satisfactory (50–69)']++;
      else if (m < 85) bins['Good (70–84)']++;
      else bins['Excellent (85–100)']++;
    });

    return [
      { band: 'Needs Improvement (<50)', count: bins['Needs Improvement (<50)'], color: '#ef4444' },
      { band: 'Satisfactory (50–69)', count: bins['Satisfactory (50–69)'], color: '#f59e0b' },
      { band: 'Good (70–84)', count: bins['Good (70–84)'], color: '#3b82f6' },
      { band: 'Excellent (85–100)', count: bins['Excellent (85–100)'], color: '#10b981' },
    ];
  }, [filteredStudents]);

  const comparisonData = useMemo(() => {
    return predictions.slice(0, 10).map(p => ({
      name: p.studentName ? p.studentName.split(' ')[0] : (p.studentId || 'Student'),
      prevMarks: p.input.prevExamMarks,
      predictedMarks: p.predictedMarks,
      delta: Math.round((p.predictedMarks - p.input.prevExamMarks) * 10) / 10,
    }));
  }, [predictions]);

  const studyHoursImpact = useMemo(() => {
    const buckets: Record<string, { totalMarks: number; count: number }> = {
      '< 8 hrs': { totalMarks: 0, count: 0 },
      '8 – 14 hrs': { totalMarks: 0, count: 0 },
      '15 – 20 hrs': { totalMarks: 0, count: 0 },
      '> 20 hrs': { totalMarks: 0, count: 0 },
    };

    filteredStudents.forEach(s => {
      let b = '< 8 hrs';
      if (s.weeklyStudyHours >= 20) b = '> 20 hrs';
      else if (s.weeklyStudyHours >= 15) b = '15 – 20 hrs';
      else if (s.weeklyStudyHours >= 8) b = '8 – 14 hrs';

      buckets[b].totalMarks += s.prevExamMarks;
      buckets[b].count++;
    });

    return Object.entries(buckets).map(([range, data]) => ({
      studyRange: range,
      avgMarks: data.count > 0 ? Math.round((data.totalMarks / data.count) * 10) / 10 : 0,
      studentCount: data.count,
    }));
  }, [filteredStudents]);

  const axisTickColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#f1f5f9';

  return (
    <div className="space-y-6 pt-1">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-sky-400" />
            <span>Academic Performance Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Empirical distributions and correlations computed from registered student records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-blue-500 font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Programs</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Computer Applications">Computer Applications</option>
          </select>

          <select
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value)}
            className="text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-blue-500 font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>
                Semester {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid 1: Attendance vs Marks Scatter & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Attendance vs Marks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Attendance (%) vs Semester-wise Previous Marks (0–100)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Observes positive correlation between classroom presence and test scores
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              Threshold 75%
            </span>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  type="number"
                  dataKey="attendance"
                  name="Attendance"
                  unit="%"
                  domain={[40, 100]}
                  tick={{ fontSize: 11, fill: axisTickColor }}
                />
                <YAxis
                  type="number"
                  dataKey="prevMarks"
                  name="Previous Marks"
                  domain={[20, 100]}
                  tick={{ fontSize: 11, fill: axisTickColor }}
                />
                <ReferenceLine
                  x={75}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: '75% Min', fill: '#ef4444', fontSize: 10, position: 'top' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-slate-900 text-white rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-bold text-sky-300">{data.name} ({data.studentId})</p>
                          <p className="text-slate-300">Attendance: {data.attendance}%</p>
                          <p className="text-slate-300">Semester Prev. Marks: {data.prevMarks}/100</p>
                          <p className="text-slate-300">Internals: {data.internal}/20</p>
                          <p className="text-slate-300">Study: {data.studyHours} hrs/wk</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Students" data={scatterData} fill="#2563eb" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 text-[11px] text-slate-400 text-center">
            Red dashed line denotes 75% college attendance eligibility benchmark
          </div>
        </div>

        {/* Chart 2: Grade Tier Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Cohort Academic Marks Distribution
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Number of registered students across formal performance tiers
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {filteredStudents.length} Students
            </span>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gradeDistribution}
                margin={{ top: 10, right: 10, bottom: 25, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="band"
                  tick={{ fontSize: 10, fill: axisTickColor }}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: axisTickColor }}
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
                  formatter={(val: any) => [`${val} students`, 'Count']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 text-[11px] text-slate-400 text-center">
            Standard college grading scale classifications
          </div>
        </div>
      </div>

      {/* Grid 2: Study Hours Impact & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Hours Impact */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Study Hours per Week vs Average Score
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Evaluating returns on self-directed study and practical coding
              </p>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
              Study Habit Analysis
            </span>
          </div>

          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={studyHoursImpact}
                margin={{ top: 10, right: 10, bottom: 20, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="studyRange" tick={{ fontSize: 11, fill: axisTickColor }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: axisTickColor }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-slate-900 text-white rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-bold text-sky-300">{d.studyRange}</p>
                          <p className="text-slate-300">Avg Exam Score: {d.avgMarks}/100</p>
                          <p className="text-slate-400">Sample Count: {d.studentCount} students</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="avgMarks"
                  name="Average Marks"
                  fill="#0284c7"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 text-[11px] text-slate-400 text-center">
            Consistent 15+ weekly hours is strongly associated with distinction marks
          </div>
        </div>

        {/* Previous vs Predicted Marks Comparison */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Semester Previous Marks vs Model Forecast
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Comparing prior semester baseline with model forecast on recent evaluations
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
              ML Output
            </span>
          </div>

          <div className="mt-4 h-60 w-full">
            {comparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{ top: 10, right: 10, bottom: 20, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisTickColor }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: axisTickColor }} />
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
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: 11,
                      color: isDarkMode ? '#e2e8f0' : '#475569',
                    }}
                  />
                  <Bar
                    dataKey="prevMarks"
                    name="Previous Exam"
                    fill={isDarkMode ? '#64748b' : '#94a3b8'}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="predictedMarks"
                    name="Predicted Final"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Run student predictions to view comparative delta charts.
              </div>
            )}
          </div>
          <div className="pt-2 text-[11px] text-slate-400 text-center">
            Tracks individual trajectory shift based on attendance and internal assessment
          </div>
        </div>
      </div>
    </div>
  );
};
