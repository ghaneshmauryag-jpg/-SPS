import React from 'react';
import {
  X,
  GraduationCap,
  Mail,
  BrainCircuit,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Student } from '../types';

interface StudentDetailsModalProps {
  student: Student | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onPredict: (student: Student) => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  student,
  onClose,
  onEdit,
  onDelete,
  onPredict,
}) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-base">{student.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{student.studentId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 font-semibold border border-blue-200 dark:border-blue-800">
              {student.course} — Semester {student.semester}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5" />
              {student.email}
            </span>
          </div>

          {/* Academic Indicators Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Attendance</span>
              <span className={`text-base font-bold ${student.attendancePct < 75 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                {student.attendancePct}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {student.attendancePct >= 75 ? 'Eligible for finals' : 'Attendance Shortage (<75%)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Semester Prev. Marks</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{student.prevExamMarks}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Out of 100</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Internal Assessment</span>
              <span className={`text-base font-bold ${student.internalMarks < 10 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                {student.internalMarks} / 20
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Continuous mid-term score</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Weekly Study</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{student.weeklyStudyHours} hrs</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Dedicated Revision</span>
            </div>
          </div>

          {/* Teacher Observations */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider mb-1">
              Faculty Remarks / Notes
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
              {student.notes ? `"${student.notes}"` : 'No specific qualitative remarks noted yet.'}
            </p>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Registered: {new Date(student.createdAt).toLocaleDateString()}</span>
            <span>Last Updated: {new Date(student.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(student)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 font-medium text-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(student.id)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors flex items-center gap-1 font-medium text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onPredict(student);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Predict Final Marks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
