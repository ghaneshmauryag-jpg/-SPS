/**
 * Database & Persistence Service
 * Simulates SQLite persistence with automatic schema seeding,
 * full CRUD capabilities, relational predictions table, and CSV export.
 * Also supports switching to local Python FastAPI backend (http://localhost:8000).
 */

import { Student, PredictionRecord, DashboardStats, SubjectBenchmark, PredictionInput } from '../types';
import { mlEngine } from '../ml/mlEngine';

const STORAGE_KEY_STUDENTS = 'college_student_records_v2';
const STORAGE_KEY_PREDICTIONS = 'college_prediction_history_v2';
const STORAGE_KEY_BACKEND_URL = 'college_custom_backend_url';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's_01',
    studentId: 'CS2024-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    course: 'Computer Science',
    semester: 4,
    attendancePct: 92.5,
    prevExamMarks: 86.0,
    internalMarks: 18.0, // out of 20
    weeklyStudyHours: 18.5,
    notes: 'Consistent student, strong in Java and DBMS.',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 's_02',
    studentId: 'CS2024-002',
    name: 'Diya Patel',
    email: 'diya.patel@college.edu',
    course: 'Computer Science',
    semester: 4,
    attendancePct: 88.0,
    prevExamMarks: 78.5,
    internalMarks: 16.5,
    weeklyStudyHours: 15.0,
    notes: 'Good lab performance, active participation.',
    createdAt: '2026-08-10T10:05:00Z',
    updatedAt: '2026-08-10T10:05:00Z',
  },
  {
    id: 's_03',
    studentId: 'CS2024-003',
    name: 'Rohan Verma',
    email: 'rohan.verma@college.edu',
    course: 'Computer Science',
    semester: 4,
    attendancePct: 62.0,
    prevExamMarks: 48.0,
    internalMarks: 9.5,
    weeklyStudyHours: 6.0,
    notes: 'Low attendance; needs academic mentor guidance.',
    createdAt: '2026-08-10T10:10:00Z',
    updatedAt: '2026-08-10T10:10:00Z',
  },
  {
    id: 's_04',
    studentId: 'CS2024-004',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@college.edu',
    course: 'Computer Science',
    semester: 4,
    attendancePct: 96.0,
    prevExamMarks: 94.0,
    internalMarks: 19.5,
    weeklyStudyHours: 24.0,
    notes: 'Top rank contender, excellent algorithm skills.',
    createdAt: '2026-08-10T10:15:00Z',
    updatedAt: '2026-08-10T10:15:00Z',
  },
  {
    id: 's_05',
    studentId: 'CS2024-005',
    name: 'Vikram Singh',
    email: 'vikram.singh@college.edu',
    course: 'Information Technology',
    semester: 3,
    attendancePct: 71.5,
    prevExamMarks: 59.0,
    internalMarks: 12.0,
    weeklyStudyHours: 9.0,
    notes: 'Average performance; potential to reach Good category.',
    createdAt: '2026-08-10T10:20:00Z',
    updatedAt: '2026-08-10T10:20:00Z',
  },
  {
    id: 's_06',
    studentId: 'CS2024-006',
    name: 'Pooja Nair',
    email: 'pooja.nair@college.edu',
    course: 'Computer Science',
    semester: 4,
    attendancePct: 84.0,
    prevExamMarks: 72.0,
    internalMarks: 15.0,
    weeklyStudyHours: 14.0,
    notes: 'Regular submission of coursework.',
    createdAt: '2026-08-10T10:25:00Z',
    updatedAt: '2026-08-10T10:25:00Z',
  },
  {
    id: 's_07',
    studentId: 'CS2024-007',
    name: 'Karthik Rao',
    email: 'karthik.rao@college.edu',
    course: 'Computer Science',
    semester: 4,
    attendancePct: 54.0,
    prevExamMarks: 41.0,
    internalMarks: 8.5,
    weeklyStudyHours: 4.5,
    notes: 'Critical attention required in Web Technologies and OS.',
    createdAt: '2026-08-10T10:30:00Z',
    updatedAt: '2026-08-10T10:30:00Z',
  },
  {
    id: 's_08',
    studentId: 'CS2024-008',
    name: 'Sneha Kulkarni',
    email: 'sneha.k@college.edu',
    course: 'Computer Science',
    semester: 4,
    attendancePct: 91.0,
    prevExamMarks: 83.0,
    internalMarks: 17.0,
    weeklyStudyHours: 19.0,
    notes: 'Strong analytical ability in SQL and Software Engineering.',
    createdAt: '2026-08-10T10:35:00Z',
    updatedAt: '2026-08-10T10:35:00Z',
  },
  {
    id: 's_09',
    studentId: 'CS2024-009',
    name: 'Mohit Deshmukh',
    email: 'mohit.d@college.edu',
    course: 'Information Technology',
    semester: 2,
    attendancePct: 77.0,
    prevExamMarks: 66.0,
    internalMarks: 14.0,
    weeklyStudyHours: 11.0,
    notes: 'Good conceptual knowledge, needs better exam time management.',
    createdAt: '2026-08-10T10:40:00Z',
    updatedAt: '2026-08-10T10:40:00Z',
  },
  {
    id: 's_10',
    studentId: 'CS2024-010',
    name: 'Kavya Menon',
    email: 'kavya.m@college.edu',
    course: 'Computer Science',
    semester: 4,
    attendancePct: 89.0,
    prevExamMarks: 81.0,
    internalMarks: 16.5,
    weeklyStudyHours: 16.0,
    notes: 'Active participant in tech coding club.',
    createdAt: '2026-08-10T10:45:00Z',
    updatedAt: '2026-08-10T10:45:00Z',
  },
  {
    id: 's_11',
    studentId: 'CS2024-011',
    name: 'Arjun Reddy',
    email: 'arjun.reddy@college.edu',
    course: 'Computer Applications',
    semester: 3,
    attendancePct: 68.0,
    prevExamMarks: 53.0,
    internalMarks: 11.5,
    weeklyStudyHours: 8.0,
    notes: 'Needs guidance on C++ object-oriented paradigms.',
    createdAt: '2026-08-11T09:00:00Z',
    updatedAt: '2026-08-11T09:00:00Z',
  },
  {
    id: 's_12',
    studentId: 'CS2024-012',
    name: 'Meera Sen',
    email: 'meera.sen@college.edu',
    course: 'Computer Science',
    semester: 4,
    attendancePct: 94.0,
    prevExamMarks: 91.0,
    internalMarks: 19.0,
    weeklyStudyHours: 21.0,
    notes: 'High performer with interest in Machine Learning.',
    createdAt: '2026-08-11T09:15:00Z',
    updatedAt: '2026-08-11T09:15:00Z',
  },
];

export const SUBJECT_BENCHMARKS: SubjectBenchmark[] = [
  { subject: 'Database Management Systems', code: 'CS-401', avgMarks: 74.2, passingPct: 91.5 },
  { subject: 'Java Programming & OOPs', code: 'CS-402', avgMarks: 71.8, passingPct: 88.0 },
  { subject: 'Software Engineering', code: 'CS-403', avgMarks: 78.4, passingPct: 94.2 },
  { subject: 'Computer Networks', code: 'CS-404', avgMarks: 69.5, passingPct: 85.3 },
  { subject: 'Web Technologies', code: 'CS-405', avgMarks: 76.1, passingPct: 92.0 },
];

class StorageService {
  private students: Student[] = [];
  private predictions: PredictionRecord[] = [];
  private isLoaded = false;
  private backendMode: 'integrated' | 'fastapi' = 'integrated';
  private fastApiUrl = 'http://localhost:8000';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (storedStudents) {
        this.students = JSON.parse(storedStudents);
      } else {
        this.students = [...INITIAL_STUDENTS];
        this.saveStudents();
      }

      const storedPredictions = localStorage.getItem(STORAGE_KEY_PREDICTIONS);
      if (storedPredictions) {
        this.predictions = JSON.parse(storedPredictions);
      } else {
        this.seedInitialPredictions();
      }

      const savedUrl = localStorage.getItem(STORAGE_KEY_BACKEND_URL);
      if (savedUrl) {
        this.fastApiUrl = savedUrl;
      }
    } catch (e) {
      console.warn('Storage initialization fallback to memory', e);
      this.students = [...INITIAL_STUDENTS];
      this.seedInitialPredictions();
    }
    this.isLoaded = true;
  }

  private seedInitialPredictions() {
    this.predictions = [];
    const sampleStudents = this.students.slice(0, 6);
    for (const student of sampleStudents) {
      const result = mlEngine.predict({
        studentId: student.studentId,
        studentName: student.name,
        course: student.course,
        semester: student.semester,
        attendancePct: student.attendancePct,
        prevExamMarks: student.prevExamMarks,
        internalMarks: student.internalMarks,
        weeklyStudyHours: student.weeklyStudyHours,
      });
      const daysAgo = Math.floor(Math.random() * 10) + 1;
      result.timestamp = new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString();
      this.predictions.push(result);
    }
    this.savePredictions();
  }

  private saveStudents() {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(this.students));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  }

  private savePredictions() {
    try {
      localStorage.setItem(STORAGE_KEY_PREDICTIONS, JSON.stringify(this.predictions));
    } catch (e) {
      console.error('Failed to save predictions to localStorage', e);
    }
  }

  getStudents(): Student[] {
    return [...this.students];
  }

  getStudentById(idOrStudentId: string): Student | undefined {
    return this.students.find(
      s => s.id === idOrStudentId || s.studentId.toLowerCase() === idOrStudentId.toLowerCase()
    );
  }

  addStudent(studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; student?: Student; error?: string } {
    const existing = this.students.find(
      s => s.studentId.trim().toLowerCase() === studentData.studentId.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, error: `Student ID "${studentData.studentId}" already exists.` };
    }

    const now = new Date().toISOString();
    const newStudent: Student = {
      ...studentData,
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };

    this.students.unshift(newStudent);
    this.saveStudents();
    return { success: true, student: newStudent };
  }

  updateStudent(
    id: string,
    studentData: Partial<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>
  ): { success: boolean; student?: Student; error?: string } {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false, error: 'Student record not found.' };
    }

    if (studentData.studentId) {
      const duplicate = this.students.find(
        s => s.id !== id && s.studentId.trim().toLowerCase() === studentData.studentId!.trim().toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: `Student ID "${studentData.studentId}" is already taken by another record.` };
      }
    }

    const updated: Student = {
      ...this.students[index],
      ...studentData,
      updatedAt: new Date().toISOString(),
    };

    this.students[index] = updated;
    this.saveStudents();
    return { success: true, student: updated };
  }

  deleteStudent(id: string): { success: boolean; error?: string } {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false, error: 'Student record not found.' };
    }
    this.students.splice(index, 1);
    this.saveStudents();
    return { success: true };
  }

  createPrediction(input: PredictionInput): PredictionRecord {
    const record = mlEngine.predict(input);
    this.predictions.unshift(record);
    this.savePredictions();
    return record;
  }

  getPredictions(): PredictionRecord[] {
    return [...this.predictions];
  }

  deletePrediction(id: string): boolean {
    const index = this.predictions.findIndex(p => p.id === id);
    if (index !== -1) {
      this.predictions.splice(index, 1);
      this.savePredictions();
      return true;
    }
    return false;
  }

  clearPredictions() {
    this.predictions = [];
    this.savePredictions();
  }

  resetDemoData() {
    this.students = [...INITIAL_STUDENTS];
    this.saveStudents();
    this.seedInitialPredictions();
  }

  getDashboardStats(): DashboardStats {
    const totalStudents = this.students.length;
    if (totalStudents === 0) {
      return {
        totalStudents: 0,
        avgAttendance: 0,
        avgPrevMarks: 0,
        avgPredictedMarks: 0,
        atRiskCount: 0,
        highPerformersCount: 0,
        recentPredictions: [],
      };
    }

    const sumAttendance = this.students.reduce((acc, s) => acc + s.attendancePct, 0);
    const sumPrevMarks = this.students.reduce((acc, s) => acc + s.prevExamMarks, 0);

    const avgPredictedMarks =
      this.predictions.length > 0
        ? Math.round(
            (this.predictions.reduce((acc, p) => acc + p.predictedMarks, 0) /
              this.predictions.length) *
              10
          ) / 10
        : Math.round((sumPrevMarks / totalStudents) * 10) / 10;

    const atRiskCount = this.students.filter(
      s => s.attendancePct < 75 || s.prevExamMarks < 50 || s.internalMarks < 10
    ).length;

    const highPerformersCount = this.students.filter(
      s => s.prevExamMarks >= 85
    ).length;

    return {
      totalStudents,
      avgAttendance: Math.round((sumAttendance / totalStudents) * 10) / 10,
      avgPrevMarks: Math.round((sumPrevMarks / totalStudents) * 10) / 10,
      avgPredictedMarks,
      atRiskCount,
      highPerformersCount,
      recentPredictions: this.predictions.slice(0, 6),
    };
  }

  exportStudentsCSV(): string {
    const headers = [
      'ID',
      'Student ID',
      'Name',
      'Email',
      'Course',
      'Semester',
      'Attendance %',
      'Semester Previous Marks (100)',
      'Internal Assessment (20)',
      'Weekly Study Hours',
      'Notes',
    ];

    const rows = this.students.map(s => [
      `"${s.id}"`,
      `"${s.studentId}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.course}"`,
      s.semester,
      s.attendancePct,
      s.prevExamMarks,
      s.internalMarks,
      s.weeklyStudyHours,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  exportPredictionsCSV(): string {
    const headers = [
      'Prediction ID',
      'Student ID',
      'Student Name',
      'Course',
      'Semester',
      'Attendance %',
      'Semester Previous Marks',
      'Internal Assessment (20)',
      'Study Hours/Week',
      'Predicted Final Marks',
      'Performance Category',
      'Confidence Low',
      'Confidence High',
      'Model Used',
      'Timestamp',
    ];

    const rows = this.predictions.map(p => [
      `"${p.id}"`,
      `"${p.studentId || 'N/A'}"`,
      `"${p.studentName || 'Unregistered'}"`,
      `"${p.course || 'N/A'}"`,
      p.semester || 'N/A',
      p.input.attendancePct,
      p.input.prevExamMarks,
      p.input.internalMarks,
      p.input.weeklyStudyHours,
      p.predictedMarks,
      `"${p.category}"`,
      p.confidenceRange[0],
      p.confidenceRange[1],
      `"${p.modelUsed}"`,
      `"${p.timestamp}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  getBackendMode(): 'integrated' | 'fastapi' {
    return this.backendMode;
  }

  setBackendMode(mode: 'integrated' | 'fastapi') {
    this.backendMode = mode;
  }

  getFastApiUrl(): string {
    return this.fastApiUrl;
  }

  setFastApiUrl(url: string) {
    this.fastApiUrl = url;
    localStorage.setItem(STORAGE_KEY_BACKEND_URL, url);
  }

  async testFastApiConnection(): Promise<{ ok: boolean; message: string; version?: string }> {
    try {
      const res = await fetch(`${this.fastApiUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        return { ok: true, message: 'FastAPI Backend Connected Successfully!', version: data.version || '1.0.0' };
      }
      return { ok: false, message: `Server responded with status HTTP ${res.status}` };
    } catch (e: any) {
      return {
        ok: false,
        message: 'Could not connect to FastAPI server. Make sure "uvicorn main:app --reload" is running locally.',
      };
    }
  }
}

export const storageService = new StorageService();
