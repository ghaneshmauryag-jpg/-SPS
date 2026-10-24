import React, { useState, useMemo } from 'react';
import {
  BrainCircuit,
  UserCheck,
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Activity,
  Trash2,
} from 'lucide-react';
import { Student, PredictionInput, PredictionRecord, SemesterMark } from '../types';

interface PredictionViewProps {
  students: Student[];
  initialStudent?: Student | null;
  onPredict: (input: PredictionInput) => PredictionRecord;
  onPredictionComplete: (result: PredictionRecord) => void;
}

export const PredictionView: React.FC<PredictionViewProps> = ({
  students,
  initialStudent,
  onPredict,
  onPredictionComplete,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent?.studentId || ''
  );
  const [studentName, setStudentName] = useState<string>(initialStudent?.name || '');
  const [course, setCourse] = useState<string>(initialStudent?.course || 'Computer Science');
  const [semester, setSemester] = useState<number>(initialStudent?.semester || 4);

  const [attendancePct, setAttendancePct] = useState<number>(
    initialStudent?.attendancePct ?? 82
  );

  // Dynamic Previous Semesters List (e.g. Sem 1, Sem 2, Sem 3)
  const [previousSemesters, setPreviousSemesters] = useState<SemesterMark[]>(() => {
    if (initialStudent?.previousSemesters && initialStudent.previousSemesters.length > 0) {
      return initialStudent.previousSemesters;
    }
    const baseMark = initialStudent?.prevExamMarks ?? 74;
    return [
      { semester: 1, marks: Math.max(30, baseMark - 4) },
      { semester: 2, marks: Math.max(30, baseMark - 2) },
      { semester: 3, marks: baseMark },
    ];
  });

  const [internalMarks, setInternalMarks] = useState<number>(
    initialStudent?.internalMarks ?? 15
  );
  const [weeklyStudyHours, setWeeklyStudyHours] = useState<number>(
    initialStudent?.weeklyStudyHours ?? 14
  );

  const [isComputing, setIsComputing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculate live cumulative average and trend across previous semesters
  const semesterStats = useMemo(() => {
    if (previousSemesters.length === 0) {
      return { average: 0, slope: 0, trend: 'steady' as const };
    }
    const sum = previousSemesters.reduce((acc, s) => acc + s.marks, 0);
    const avg = Math.round((sum / previousSemesters.length) * 10) / 10;

    if (previousSemesters.length === 1) {
      return { average: avg, slope: 0, trend: 'steady' as const };
    }

    const k = previousSemesters.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < k; i++) {
      const x = i + 1;
      const y = previousSemesters[i].marks;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    const denom = k * sumX2 - sumX * sumX;
    const slope = denom !== 0 ? (k * sumXY - sumX * sumY) / denom : 0;
    const roundedSlope = Math.round(slope * 10) / 10;

    let trend: 'improving' | 'declining' | 'steady' = 'steady';
    if (roundedSlope >= 1.0) trend = 'improving';
    else if (roundedSlope <= -1.0) trend = 'declining';

    return { average: avg, slope: roundedSlope, trend };
  }, [previousSemesters]);

  // Handlers for Add Semester and Remove Semester
  const handleAddSemester = () => {
    if (previousSemesters.length >= 8) return;
    const nextSemNumber = previousSemesters.length + 1;
    // Default to last semester's score or 70
    const lastMarks = previousSemesters.length > 0
      ? previousSemesters[previousSemesters.length - 1].marks
      : 70;

    setPreviousSemesters(prev => [
      ...prev,
      { semester: nextSemNumber, marks: lastMarks },
    ]);
  };

  const handleRemoveLastSemester = () => {
    if (previousSemesters.length <= 1) return;
    setPreviousSemesters(prev => prev.slice(0, prev.length - 1));
  };

  const handleRemoveSpecificSemester = (indexToRemove: number) => {
    if (previousSemesters.length <= 1) return;
    setPreviousSemesters(prev => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      // Re-index semester numbers consecutively
      return filtered.map((item, idx) => ({
        ...item,
        semester: idx + 1,
      }));
    });
  };

  const handleSemesterMarkChange = (index: number, newMarks: number) => {
    const clamped = Math.min(100, Math.max(0, Number(newMarks) || 0));
    setPreviousSemesters(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], marks: clamped };
      return updated;
    });
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    if (!id) {
      setStudentName('');
      return;
    }
    const found = students.find(s => s.studentId === id || s.id === id);
    if (found) {
      setStudentName(found.name);
      setCourse(found.course);
      setSemester(found.semester);
      setAttendancePct(found.attendancePct);
      setInternalMarks(found.internalMarks);
      setWeeklyStudyHours(found.weeklyStudyHours);

      if (found.previousSemesters && found.previousSemesters.length > 0) {
        setPreviousSemesters(found.previousSemesters);
      } else {
        const base = found.prevExamMarks;
        setPreviousSemesters([
          { semester: 1, marks: Math.max(30, base - 3) },
          { semester: 2, marks: Math.max(30, base - 1) },
          { semester: 3, marks: base },
        ]);
      }
    }
  };

  const loadPreset = (type: 'high' | 'average' | 'atRisk') => {
    setSelectedStudentId('');
    if (type === 'high') {
      setStudentName('Sample Candidate (Distinction)');
      setAttendancePct(95);
      setPreviousSemesters([
        { semester: 1, marks: 88 },
        { semester: 2, marks: 91 },
        { semester: 3, marks: 94 },
      ]);
      setInternalMarks(19);
      setWeeklyStudyHours(22);
    } else if (type === 'average') {
      setStudentName('Sample Candidate (Consistent)');
      setAttendancePct(82);
      setPreviousSemesters([
        { semester: 1, marks: 72 },
        { semester: 2, marks: 74 },
        { semester: 3, marks: 75 },
      ]);
      setInternalMarks(15);
      setWeeklyStudyHours(14);
    } else {
      setStudentName('Sample Candidate (Remedial Alert)');
      setAttendancePct(58);
      setPreviousSemesters([
        { semester: 1, marks: 62 },
        { semester: 2, marks: 52 },
        { semester: 3, marks: 44 },
      ]);
      setInternalMarks(9);
      setWeeklyStudyHours(5);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (attendancePct < 0 || attendancePct > 100) {
      setValidationError('Attendance must be between 0% and 100%.');
      return;
    }
    if (previousSemesters.length === 0) {
      setValidationError('Please record at least one previous semester score.');
      return;
    }
    for (const sem of previousSemesters) {
      if (sem.marks < 0 || sem.marks > 100) {
        setValidationError(`Semester ${sem.semester} marks must be between 0 and 100.`);
        return;
      }
    }
    if (internalMarks < 0 || internalMarks > 20) {
      setValidationError('Internal Assessment Marks must be between 0 and 20.');
      return;
    }
    if (weeklyStudyHours < 0 || weeklyStudyHours > 50) {
      setValidationError('Weekly study hours must be between 0 and 50 hours.');
      return;
    }

    setIsComputing(true);

    setTimeout(() => {
      const input: PredictionInput = {
        studentId: selectedStudentId || undefined,
        studentName: studentName.trim() || undefined,
        course,
        semester,
        attendancePct: Number(attendancePct),
        prevExamMarks: semesterStats.average,
        previousSemesters,
        internalMarks: Number(internalMarks),
        weeklyStudyHours: Number(weeklyStudyHours),
      };

      const result = onPredict(input);
      setIsComputing(false);
      onPredictionComplete(result);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-1">
      {/* Module Title Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 text-xs font-semibold mb-1">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Inference Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Predict Student Final Examination Marks
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Supply previous semester scores, attendance, and internal marks to forecast expected performance.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Presets:
            </span>
            <button
              type="button"
              onClick={() => loadPreset('high')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              High Performer
            </button>
            <button
              type="button"
              onClick={() => loadPreset('average')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-sky-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-colors"
            >
              Consistent
            </button>
            <button
              type="button"
              onClick={() => loadPreset('atRisk')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 transition-colors"
            >
              At-Risk
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {validationError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Student Profile (Optional) */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>Student Profile (Optional)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Registered Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={e => handleSelectStudent(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-500 text-slate-900 dark:text-white"
                >
                  <option value="">-- Manual Entry / Unregistered --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.studentId}>
                      {s.studentId} - {s.name} ({s.course} Sem {s.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Program</label>
                  <select
                    value={course}
                    onChange={e => setCourse(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-500 text-slate-900 dark:text-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Computer Applications">Computer Applications</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Semester</label>
                  <select
                    value={semester}
                    onChange={e => setSemester(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-500 text-slate-900 dark:text-white"
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>
                        Sem {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Features */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Input Features for Model Inference</span>
            </h3>

            {/* Feature 1: Dynamic Previous Semesters Marks */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    1. Previous Semesters Performance History
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Add previous semesters for higher multi-term forecasting accuracy
                  </p>
                </div>

                {/* Controls: Add Sem and Remove Sem Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveLastSemester}
                    disabled={previousSemesters.length <= 1}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                    title="Remove last semester"
                  >
                    <Minus className="w-3.5 h-3.5 text-red-500" />
                    <span>Remove Sem</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddSemester}
                    disabled={previousSemesters.length >= 8}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800 disabled:opacity-40 transition-colors shadow-xs"
                    title="Add previous semester"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Sem</span>
                  </button>
                </div>
              </div>

              {/* Trajectory & Multi-Semester Summary Banner */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Semesters Included</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {previousSemesters.length} {previousSemesters.length === 1 ? 'Semester' : 'Semesters'}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Cumulative Avg</span>
                    <span className="font-black text-blue-600 dark:text-sky-400 text-sm">
                      {semesterStats.average} / 100
                    </span>
                  </div>
                </div>

                {/* Trend Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-white dark:bg-slate-900">
                  {semesterStats.trend === 'improving' ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-700 dark:text-emerald-400">
                        Upward Momentum (+{semesterStats.slope}/sem)
                      </span>
                    </>
                  ) : semesterStats.trend === 'declining' ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-red-700 dark:text-red-400">
                        Declining Momentum ({semesterStats.slope}/sem)
                      </span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Steady Consistency
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Semester Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {previousSemesters.map((sem, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        Semester {sem.semester} Examination Marks
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={sem.marks}
                          onChange={e => handleSemesterMarkChange(idx, Number(e.target.value))}
                          className="w-16 px-2 py-0.5 text-right text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-md focus:outline-blue-500"
                        />
                        <span className="text-xs text-slate-400">/100</span>

                        {previousSemesters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecificSemester(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title={`Remove Semester ${sem.semester}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={0.5}
                      value={sem.marks}
                      onChange={e => handleSemesterMarkChange(idx, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Feature 2: Attendance Percentage */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    2. Attendance Percentage (0 – 100%)
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Class attendance across lectures and practicals
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      attendancePct >= 75
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {attendancePct >= 75 ? 'Meets 75% Requirement' : 'Shortage (<75%)'}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={attendancePct}
                    onChange={e => setAttendancePct(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-20 px-2.5 py-1 text-right text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={attendancePct}
                onChange={e => setAttendancePct(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Feature 3: Internal Assessment Marks (0 – 20) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    3. Internal Assessment Marks (0 – 20)
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mid-term tests, class quizzes, and continuous evaluation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      internalMarks >= 12
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {internalMarks >= 12 ? 'Good Score (≥12)' : 'Needs Work (<12)'}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={internalMarks}
                    onChange={e => setInternalMarks(Math.min(20, Math.max(0, Number(e.target.value))))}
                    className="w-20 px-2.5 py-1 text-right text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
                  />
                  <span className="text-xs text-slate-500">/20</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={0.5}
                value={internalMarks}
                onChange={e => setInternalMarks(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Feature 4: Weekly Dedicated Study Hours */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    4. Weekly Dedicated Study Hours (0 – 50 Hours)
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Self-directed revision, problem solving, and syllabus practice
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={weeklyStudyHours}
                    onChange={e => setWeeklyStudyHours(Math.min(50, Math.max(0, Number(e.target.value))))}
                    className="w-20 px-2.5 py-1 text-right text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
                  />
                  <span className="text-xs text-slate-500">hrs</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={0.5}
                value={weeklyStudyHours}
                onChange={e => setWeeklyStudyHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Multi-Semester Weighting &amp; Random Forest Regressor</span>
            </div>

            <button
              type="submit"
              disabled={isComputing}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isComputing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing Prediction...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>Execute Prediction Model</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
