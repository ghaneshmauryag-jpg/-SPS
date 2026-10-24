/**
 * Synthetic College Academic Dataset Generator with Fixed Seed (seed=42)
 *
 * Models realistic College academic patterns:
 * - High correlation between regular attendance, semester-wise previous marks, internal assessments (out of 20), and final score
 * - Non-linear diminishing returns for weekly study hours beyond ~25 hours
 * - Controlled variance and noise representing final examination room conditions
 */

export interface DatasetRecord {
  id: number;
  attendancePct: number;
  prevExamMarks: number;    // Semester-wise Previous Marks (0 - 100)
  internalMarks: number;    // Internal Assessment Marks (0 - 20)
  weeklyStudyHours: number; // Weekly Study Hours (0 - 50)
  finalExamMarks: number;   // Final Examination Score (0 - 100)
}

// Seeded pseudorandom number generator (Mulberry32)
function createPRNG(seed: number) {
  let s = Math.floor(seed);
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform for normal distribution
function randomGaussian(rand: () => number, mean = 0, stdev = 1): number {
  const u1 = Math.max(1e-7, rand());
  const u2 = rand();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdev + mean;
}

export function generateAcademicDataset(totalRecords = 600, seed = 42): DatasetRecord[] {
  const rand = createPRNG(seed);
  const records: DatasetRecord[] = [];

  for (let i = 1; i <= totalRecords; i++) {
    // Generate realistic correlated academic indicators
    // Base ability factor (latent student aptitude ~ 35 to 95)
    const baseAptitude = Math.min(95, Math.max(35, randomGaussian(rand, 65, 12)));

    // Attendance (42% to 99%)
    let attendance = baseAptitude * 0.4 + rand() * 45 + 15;
    attendance = Math.min(99, Math.max(42, Math.round(attendance * 10) / 10));

    // Semester-wise previous exam marks (30 to 98)
    let prevExam = baseAptitude * 0.75 + randomGaussian(rand, 15, 7);
    prevExam = Math.min(98, Math.max(30, Math.round(prevExam * 10) / 10));

    // Internal assessment marks out of 20 (e.g., 5.0 to 19.8)
    let internal20 = (baseAptitude / 100) * 14 + (attendance / 100) * 4 + randomGaussian(rand, 1.5, 1.2);
    internal20 = Math.min(20, Math.max(4, Math.round(internal20 * 10) / 10));

    // Weekly study hours (3 to 35 hours)
    let studyHours = (prevExam / 100) * 14 + rand() * 12 + 2;
    studyHours = Math.min(35, Math.max(3, Math.round(studyHours * 10) / 10));

    // Target Final Exam Marks (Ground Truth out of 100)
    // College continuous evaluation scheme:
    // - 45% Semester-wise previous examination baseline
    // - 25% Internal assessment (normalized from 20 marks to 100% scale: internal20 * 5)
    // - 15% Attendance factor
    // - Study hours effect (logarithmic diminishing returns)
    // - Attendance shortage penalty (<65%)
    // - Stochastic exam fluctuation (-4 to +4)
    const studyHoursEffect = Math.min(10, Math.log10(studyHours + 1) * 7.2);
    const attendancePenalty = attendance < 65 ? (65 - attendance) * 0.35 : 0;
    const internalNormalized100 = internal20 * 5;

    let target =
      prevExam * 0.45 +
      internalNormalized100 * 0.25 +
      (attendance / 100) * 15 +
      studyHoursEffect -
      attendancePenalty +
      randomGaussian(rand, 0, 4.0);

    target = Math.min(99.5, Math.max(20, Math.round(target * 10) / 10));

    records.push({
      id: i,
      attendancePct: attendance,
      prevExamMarks: prevExam,
      internalMarks: internal20,
      weeklyStudyHours: studyHours,
      finalExamMarks: target,
    });
  }

  return records;
}

export function splitTrainTest<T>(
  data: T[],
  trainRatio = 0.8,
  seed = 42
): { train: T[]; test: T[] } {
  const rand = createPRNG(seed);
  const shuffled = [...data];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const trainCount = Math.floor(shuffled.length * trainRatio);
  return {
    train: shuffled.slice(0, trainCount),
    test: shuffled.slice(trainCount),
  };
}
