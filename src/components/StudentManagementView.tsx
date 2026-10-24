import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Download,
  Eye,
  Edit2,
  Trash2,
  BrainCircuit,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Student } from '../types';
import { storageService } from '../services/storage';

interface StudentManagementViewProps {
  students: Student[];
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onViewStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onPredictStudent: (student: Student) => void;
  onResetData: () => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  onAddStudent,
  onEditStudent,
  onViewStudent,
  onDeleteStudent,
  onPredictStudent,
  onResetData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'studentId' | 'attendance' | 'marks'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students
      .filter(student => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCourse = selectedCourse === 'ALL' || student.course === selectedCourse;
        const matchesSemester =
          selectedSemester === 'ALL' || student.semester === Number(selectedSemester);

        return matchesSearch && matchesCourse && matchesSemester;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') {
          diff = a.name.localeCompare(b.name);
        } else if (sortBy === 'studentId') {
          diff = a.studentId.localeCompare(b.studentId);
        } else if (sortBy === 'attendance') {
          diff = a.attendancePct - b.attendancePct;
        } else if (sortBy === 'marks') {
          diff = a.prevExamMarks - b.prevExamMarks;
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [students, searchQuery, selectedCourse, selectedSemester, sortBy, sortOrder]);

  const handleExportCSV = () => {
    const csvContent = storageService.exportStudentsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `college_students_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pt-1">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-sky-400" />
            <span>Student Record Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage cohort profiles, attendance, semester-wise previous marks, and internal assessment (out of 20)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onAddStudent}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, student ID, or email..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
            />
          </div>

          {/* Course Filter */}
          <div>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-blue-500 text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All Programs</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Computer Applications">Computer Applications</option>
              <option value="Software Engineering">Software Engineering</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-blue-500 text-slate-700 dark:text-slate-200 font-medium"
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

        {/* Quick Sort Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Sort By:</span>
            <button
              onClick={() => {
                if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else {
                  setSortBy('name');
                  setSortOrder('asc');
                }
              }}
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                sortBy === 'name' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Name</span>
              {sortBy === 'name' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'attendance') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else {
                  setSortBy('attendance');
                  setSortOrder('desc');
                }
              }}
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                sortBy === 'attendance' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Attendance</span>
              {sortBy === 'attendance' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'marks') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else {
                  setSortBy('marks');
                  setSortOrder('desc');
                }
              }}
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                sortBy === 'marks' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Previous Marks</span>
              {sortBy === 'marks' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredStudents.length}</strong> of{' '}
            {students.length} students
          </span>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4 text-center">Attendance %</th>
                <th className="py-3 px-4 text-center">Semester Prev. Marks</th>
                <th className="py-3 px-4 text-center">Internals (/20)</th>
                <th className="py-3 px-4 text-center">Study Hrs/Wk</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {student.studentId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{student.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{student.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {student.course} S{student.semester}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-semibold ${
                          student.attendancePct >= 75
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold'
                        }`}
                      >
                        {student.attendancePct}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {student.prevExamMarks}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {student.internalMarks} / 20
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700 dark:text-slate-300">
                      {student.weeklyStudyHours} hrs
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPredictStudent(student)}
                          className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-sky-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          title="Predict Exam Performance for Student"
                        >
                          <BrainCircuit className="w-3.5 h-3.5" />
                          <span>Predict</span>
                        </button>
                        <button
                          onClick={() => onViewStudent(student)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-300 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No student records found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search terms or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <span>
            ℹ College sample records can be modified, deleted, or reset anytime.
          </span>
          <button
            onClick={onResetData}
            className="text-blue-600 dark:text-sky-400 font-medium hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Records</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Student Record?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{studentToDelete.name}</strong> (ID: {studentToDelete.studentId})? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
