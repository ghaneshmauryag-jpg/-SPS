export type PerformanceCategory = 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement';

export interface SemesterMark {
  semester: number;
  marks: number;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  course: string;
  semester: number;
  attendancePct: number;       // 0 - 100
  prevExamMarks: number;       // Semester-wise Previous Marks (0 - 100) or cumulative average
  previousSemesters?: SemesterMark[]; // Optional list of previous semester breakdown
  internalMarks: number;       // Internal Assessment Marks (0 - 20)
  weeklyStudyHours: number;    // 0 - 50
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionInput {
  attendancePct: number;
  prevExamMarks: number;       // Computed weighted or direct previous semester marks (0 - 100)
  previousSemesters?: SemesterMark[]; // List of previous semesters (e.g. Sem 1: 75, Sem 2: 78, Sem 3: 82)
  internalMarks: number;       // Internal Assessment Marks (0 - 20)
  weeklyStudyHours: number;    // Weekly Dedicated Study Hours (0 - 50)
  studentId?: string;
  studentName?: string;
  course?: string;
  semester?: number;
  semesterTrend?: {
    average: number;
    trendSlope: number;
    trendLabel: string;
  };
}

export interface Recommendation {
  area: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionableStep: string;
}

export interface PredictionRecord {
  id: string;
  studentId?: string;
  studentName?: string;
  course?: string;
  semester?: number;
  input: PredictionInput;
  predictedMarks: number;
  category: PerformanceCategory;
  confidenceRange: [number, number];
  modelUsed: 'RandomForestRegressor' | 'LinearRegression';
  recommendations: Recommendation[];
  timestamp: string;
  semesterTrend?: {
    average: number;
    trendSlope: number; // e.g. +2.5 marks/sem
    trendLabel: 'improving' | 'declining' | 'steady';
  };
}

export interface EvaluationMetrics {
  name: string;
  mae: number;
  rmse: number;
  r2: number;
  trainingSamples: number;
  testingSamples: number;
  details?: Record<string, any>;
}

export interface ModelComparison {
  linearRegression: EvaluationMetrics;
  randomForest: EvaluationMetrics;
  selectedModel: 'RandomForestRegressor' | 'LinearRegression';
  featureImportances: { feature: string; importancePct: number; weight: number }[];
  datasetInfo: {
    totalRecords: number;
    trainSplit: number;
    testSplit: number;
    seed: number;
    isSynthetic: boolean;
    description: string;
  };
}

export interface SubjectBenchmark {
  subject: string;
  code: string;
  avgMarks: number;
  passingPct: number;
}

export interface DashboardStats {
  totalStudents: number;
  avgAttendance: number;
  avgPrevMarks: number;
  avgPredictedMarks: number;
  atRiskCount: number;
  highPerformersCount: number;
  recentPredictions: PredictionRecord[];
}
