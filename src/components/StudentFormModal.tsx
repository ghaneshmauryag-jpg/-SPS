import React, { useState, useEffect } from 'react';
import { X, GraduationCap, AlertCircle } from 'lucide-react';
import { Student } from '../types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; error?: string };
  initialData?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('Computer Science');
  const [semester, setSemester] = useState(4);
  const [attendancePct, setAttendancePct] = useState(80);
  const [prevExamMarks, setPrevExamMarks] = useState(70);
  const [internalMarks, setInternalMarks] = useState(15);
  const [weeklyStudyHours, setWeeklyStudyHours] = useState(12);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setStudentId(initialData.studentId);
      setName(initialData.name);
      setEmail(initialData.email);
      setCourse(initialData.course);
      setSemester(initialData.semester);
      setAttendancePct(initialData.attendancePct);
      setPrevExamMarks(initialData.prevExamMarks);
      setInternalMarks(initialData.internalMarks);
      setWeeklyStudyHours(initialData.weeklyStudyHours);
      setNotes(initialData.notes || '');
    } else {
      const randomId = Math.floor(100 + Math.random() * 900);
      setStudentId(`CS2024-${randomId}`);
      setName('');
      setEmail('');
      setCourse('Computer Science');
      setSemester(4);
      setAttendancePct(82);
      setPrevExamMarks(74);
      setInternalMarks(15);
      setWeeklyStudyHours(14);
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentId.trim()) {
      setError('Student ID is required.');
      return;
    }
    if (!name.trim()) {
      setError('Student Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (attendancePct < 0 || attendancePct > 100) {
      setError('Attendance must be between 0% and 100%.');
      return;
    }
    if (prevExamMarks < 0 || prevExamMarks > 100) {
      setError('Semester-wise previous marks must be between 0 and 100.');
      return;
    }
    if (internalMarks < 0 || internalMarks > 20) {
      setError('Internal Assessment marks must be between 0 and 20.');
      return;
    }
    if (weeklyStudyHours < 0 || weeklyStudyHours > 50) {
      setError('Weekly study hours must be between 0 and 50 hours.');
      return;
    }

    const res = onSubmit({
      studentId: studentId.trim(),
      name: name.trim(),
      email: email.trim(),
      course,
      semester,
      attendancePct: Number(attendancePct),
      prevExamMarks: Number(prevExamMarks),
      internalMarks: Number(internalMarks),
      weeklyStudyHours: Number(weeklyStudyHours),
      notes: notes.trim(),
    });

    if (!res.success) {
      setError(res.error || 'Failed to save student record.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">
              {initialData ? 'Edit Student Record' : 'Register New Student'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student ID *
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                placeholder="e.g. CS2024-042"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Student full name"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="student@college.edu"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Program
              </label>
              <select
                value={course}
                onChange={e => setCourse(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Computer Applications">Computer Applications</option>
                <option value="Software Engineering">Software Engineering</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Semester
              </label>
              <select
                value={semester}
                onChange={e => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>
                    Semester {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Indicators */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 text-[11px]">
              Continuous Academic Assessment Data
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Attendance Percentage (0-100%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  required
                  value={attendancePct}
                  onChange={e => setAttendancePct(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Semester Prev. Marks (0-100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  required
                  value={prevExamMarks}
                  onChange={e => setPrevExamMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Internal Marks (0-20)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  required
                  value={internalMarks}
                  onChange={e => setInternalMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Weekly Study Hours (0-50 hrs)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  required
                  value={weeklyStudyHours}
                  onChange={e => setWeeklyStudyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Teacher Observations / Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Regular participation in laboratory sessions..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
            >
              {initialData ? 'Update Record' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
