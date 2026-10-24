/**
 * Machine Learning Engine for College Student Performance Prediction System (SPS)
 * 
 * Features:
 * 1. Attendance Percentage (0 - 100%)
 * 2. Semester-wise Previous Marks (0 - 100)
 * 3. Internal Assessment Marks (0 - 20)
 * 4. Weekly Dedicated Study Hours (0 - 50 hrs)
 */

import { DatasetRecord, generateAcademicDataset, splitTrainTest } from './dataset';
import { ModelComparison, PerformanceCategory, PredictionInput, PredictionRecord, Recommendation } from '../types';

export const FEATURE_NAMES = [
  'attendancePct',
  'prevExamMarks',
  'internalMarks',
  'weeklyStudyHours',
] as const;

export type FeatureKey = typeof FEATURE_NAMES[number];

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  attendancePct: 'Attendance Percentage',
  prevExamMarks: 'Semester-wise Previous Marks',
  internalMarks: 'Internal Assessment (out of 20)',
  weeklyStudyHours: 'Weekly Study Hours',
};

// -------------------------------------------------------------
// 1. Matrix operations for Linear Regression OLS
// -------------------------------------------------------------

function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > maxVal) {
        maxVal = Math.abs(M[r][col]);
        maxRow = r;
      }
    }
    if (maxVal < 1e-9) continue;
    [M[col], M[maxRow]] = [M[maxRow], M[col]];

    for (let r = 0; r < n; r++) {
      if (r !== col) {
        const factor = M[r][col] / M[col][col];
        for (let c = col; c <= n; c++) {
          M[r][c] -= factor * M[col][c];
        }
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    x[i] = M[i][n] / (Math.abs(M[i][i]) < 1e-9 ? 1 : M[i][i]);
  }
  return x;
}

export class LinearRegressionModel {
  weights: number[] = [];
  intercept = 0;
  isTrained = false;

  fit(X: number[][], y: number[], lambda = 0.01) {
    const n = X.length;
    const d = X[0].length;

    const X_aug = X.map(row => [...row, 1]);
    const d_aug = d + 1;

    const A: number[][] = Array.from({ length: d_aug }, () => new Array(d_aug).fill(0));
    const b: number[] = new Array(d_aug).fill(0);

    for (let i = 0; i < n; i++) {
      const row = X_aug[i];
      const yi = y[i];
      for (let j = 0; j < d_aug; j++) {
        b[j] += row[j] * yi;
        for (let k = 0; k < d_aug; k++) {
          A[j][k] += row[j] * row[k];
        }
      }
    }

    for (let j = 0; j < d; j++) {
      A[j][j] += lambda;
    }

    const sol = solveLinearSystem(A, b);
    this.weights = sol.slice(0, d);
    this.intercept = sol[d];
    this.isTrained = true;
  }

  predictRow(row: number[]): number {
    let sum = this.intercept;
    for (let j = 0; j < this.weights.length; j++) {
      sum += this.weights[j] * row[j];
    }
    return Math.max(0, Math.min(100, sum));
  }

  predict(X: number[][]): number[] {
    return X.map(r => this.predictRow(r));
  }
}

// -------------------------------------------------------------
// 2. Decision Tree & Random Forest Regressor
// -------------------------------------------------------------

interface TreeNode {
  isLeaf: boolean;
  value?: number;
  featureIndex?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  samples: number;
  mse: number;
}

class DecisionTreeRegressor {
  root: TreeNode | null = null;
  maxDepth: number;
  minSamplesSplit: number;

  constructor(maxDepth = 5, minSamplesSplit = 6) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  fit(X: number[][], y: number[], featureSubsetSize?: number, featureImportancesAccumulator?: number[]) {
    this.root = this.buildTree(X, y, 0, featureSubsetSize, featureImportancesAccumulator);
  }

  private calculateVariance(y: number[]): { mean: number; variance: number } {
    if (y.length === 0) return { mean: 0, variance: 0 };
    let sum = 0;
    for (let i = 0; i < y.length; i++) sum += y[i];
    const mean = sum / y.length;
    let varSum = 0;
    for (let i = 0; i < y.length; i++) {
      const diff = y[i] - mean;
      varSum += diff * diff;
    }
    return { mean, variance: varSum / y.length };
  }

  private buildTree(
    X: number[][],
    y: number[],
    depth: number,
    featureSubsetSize?: number,
    featureImportancesAccumulator?: number[]
  ): TreeNode {
    const { mean, variance } = this.calculateVariance(y);

    if (depth >= this.maxDepth || y.length <= this.minSamplesSplit || variance < 1e-4) {
      return { isLeaf: true, value: mean, samples: y.length, mse: variance };
    }

    const nFeatures = X[0].length;
    let featureIndices = Array.from({ length: nFeatures }, (_, i) => i);

    if (featureSubsetSize && featureSubsetSize < nFeatures) {
      featureIndices.sort(() => Math.random() - 0.5);
      featureIndices = featureIndices.slice(0, featureSubsetSize);
    }

    let bestGain = -Infinity;
    let bestFeature = -1;
    let bestThreshold = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    const parentImpurity = variance * y.length;

    for (const feat of featureIndices) {
      const values = X.map(row => row[feat]).sort((a, b) => a - b);
      const step = Math.max(1, Math.floor(values.length / 10));

      for (let i = step; i < values.length - step; i += step) {
        const threshold = (values[i] + values[i + 1]) / 2;

        const leftIndices: number[] = [];
        const rightIndices: number[] = [];

        for (let rowIdx = 0; rowIdx < X.length; rowIdx++) {
          if (X[rowIdx][feat] <= threshold) {
            leftIndices.push(rowIdx);
          } else {
            rightIndices.push(rowIdx);
          }
        }

        if (leftIndices.length < 2 || rightIndices.length < 2) continue;

        const leftY = leftIndices.map(idx => y[idx]);
        const rightY = rightIndices.map(idx => y[idx]);

        const leftVar = this.calculateVariance(leftY).variance;
        const rightVar = this.calculateVariance(rightY).variance;

        const splitImpurity = leftVar * leftY.length + rightVar * rightY.length;
        const gain = parentImpurity - splitImpurity;

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feat;
          bestThreshold = threshold;
          bestLeftIndices = leftIndices;
          bestRightIndices = rightIndices;
        }
      }
    }

    if (bestGain <= 0 || bestFeature === -1) {
      return { isLeaf: true, value: mean, samples: y.length, mse: variance };
    }

    if (featureImportancesAccumulator && bestFeature >= 0) {
      featureImportancesAccumulator[bestFeature] += Math.max(0, bestGain);
    }

    const leftX = bestLeftIndices.map(idx => X[idx]);
    const leftY = bestLeftIndices.map(idx => y[idx]);
    const rightX = bestRightIndices.map(idx => X[idx]);
    const rightY = bestRightIndices.map(idx => y[idx]);

    return {
      isLeaf: false,
      featureIndex: bestFeature,
      threshold: bestThreshold,
      samples: y.length,
      mse: variance,
      left: this.buildTree(leftX, leftY, depth + 1, featureSubsetSize, featureImportancesAccumulator),
      right: this.buildTree(rightX, rightY, depth + 1, featureSubsetSize, featureImportancesAccumulator),
    };
  }

  predictRow(row: number[]): number {
    let curr = this.root;
    while (curr && !curr.isLeaf) {
      if (curr.featureIndex !== undefined && curr.threshold !== undefined) {
        if (row[curr.featureIndex] <= curr.threshold) {
          curr = curr.left || null;
        } else {
          curr = curr.right || null;
        }
      } else {
        break;
      }
    }
    return curr?.value ?? 50;
  }
}

export class RandomForestRegressorModel {
  trees: DecisionTreeRegressor[] = [];
  nEstimators: number;
  maxDepth: number;
  featureImportances: number[] = [];
  isTrained = false;

  constructor(nEstimators = 18, maxDepth = 6) {
    this.nEstimators = nEstimators;
    this.maxDepth = maxDepth;
  }

  fit(X: number[][], y: number[]) {
    this.trees = [];
    const n = X.length;
    const nFeatures = X[0].length;
    const featureSubsetSize = Math.max(2, Math.floor(Math.sqrt(nFeatures)) + 1);

    this.featureImportances = new Array(nFeatures).fill(0);

    for (let t = 0; t < this.nEstimators; t++) {
      const sampleIndices: number[] = [];
      for (let i = 0; i < n; i++) {
        sampleIndices.push(Math.floor(Math.random() * n));
      }

      const sampleX = sampleIndices.map(idx => X[idx]);
      const sampleY = sampleIndices.map(idx => y[idx]);

      const tree = new DecisionTreeRegressor(this.maxDepth, 4);
      tree.fit(sampleX, sampleY, featureSubsetSize, this.featureImportances);
      this.trees.push(tree);
    }

    const totalImp = this.featureImportances.reduce((a, b) => a + b, 0);
    if (totalImp > 0) {
      this.featureImportances = this.featureImportances.map(val => (val / totalImp) * 100);
    }

    this.isTrained = true;
  }

  predictRowWithConfidence(row: number[]): { prediction: number; stdDev: number; min: number; max: number } {
    if (this.trees.length === 0) return { prediction: 50, stdDev: 5, min: 45, max: 55 };

    const predictions = this.trees.map(t => t.predictRow(row));
    const mean = predictions.reduce((a, b) => a + b, 0) / predictions.length;

    const variance =
      predictions.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / (predictions.length - 1 || 1);
    const stdDev = Math.sqrt(variance);

    const boundedMean = Math.max(0, Math.min(100, Math.round(mean * 10) / 10));
    const minRange = Math.max(0, Math.round((boundedMean - 1.96 * stdDev) * 10) / 10);
    const maxRange = Math.min(100, Math.round((boundedMean + 1.96 * stdDev) * 10) / 10);

    return {
      prediction: boundedMean,
      stdDev: Math.round(stdDev * 10) / 10,
      min: minRange,
      max: maxRange,
    };
  }

  predict(X: number[][]): number[] {
    return X.map(row => this.predictRowWithConfidence(row).prediction);
  }
}

// -------------------------------------------------------------
// 3. Evaluation Metrics calculation
// -------------------------------------------------------------

export function calculateMetrics(yTrue: number[], yPred: number[]) {
  const n = yTrue.length;
  if (n === 0) return { mae: 0, rmse: 0, r2: 0 };

  let sumAbsErr = 0;
  let sumSqErr = 0;
  let sumY = 0;

  for (let i = 0; i < n; i++) {
    const diff = yTrue[i] - yPred[i];
    sumAbsErr += Math.abs(diff);
    sumSqErr += diff * diff;
    sumY += yTrue[i];
  }

  const meanY = sumY / n;
  let totalSumSquares = 0;
  for (let i = 0; i < n; i++) {
    const diff = yTrue[i] - meanY;
    totalSumSquares += diff * diff;
  }

  const mae = Math.round((sumAbsErr / n) * 100) / 100;
  const rmse = Math.round(Math.sqrt(sumSqErr / n) * 100) / 100;
  const r2 =
    totalSumSquares > 0
      ? Math.round((1 - sumSqErr / totalSumSquares) * 1000) / 1000
      : 0;

  return { mae, rmse, r2 };
}

// -------------------------------------------------------------
// 4. Recommendation Engine
// -------------------------------------------------------------

export function generateRecommendations(input: PredictionInput, predictedMarks: number): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Attendance Check
  if (input.attendancePct < 75) {
    recommendations.push({
      area: 'Attendance & Class Engagement',
      priority: input.attendancePct < 65 ? 'high' : 'medium',
      title: 'Improve Lecture Attendance to 75%+',
      description: `Current attendance is ${input.attendancePct}%, below the standard college requirement. Regular attendance is key to exam success.`,
      actionableStep: 'Target 90%+ attendance over the next 4 weeks. Request class lecture notes from faculty or peers for missed lectures.',
    });
  }

  // Study Hours Check
  if (input.weeklyStudyHours < 10) {
    recommendations.push({
      area: 'Self-Study & Revision Time',
      priority: input.weeklyStudyHours < 6 ? 'high' : 'medium',
      title: 'Increase Weekly Dedicated Study Hours',
      description: `Logging only ${input.weeklyStudyHours} hours/week limits conceptual retention and problem-solving practice.`,
      actionableStep: 'Implement a structured daily study timetable with 2 dedicated 90-minute blocks, aiming for 14-16 hours per week.',
    });
  }

  // Internal Assessment (out of 20)
  if (input.internalMarks < 12) {
    recommendations.push({
      area: 'Internal Assessment Evaluation',
      priority: 'high',
      title: 'Address Internal Marks Deficit',
      description: `Internal score is ${input.internalMarks}/20 (below 60%). Internal tests directly reflect syllabus mastery.`,
      actionableStep: 'Schedule doubt-clearing sessions with subject faculty and review mistakes in previous internal exam papers.',
    });
  }

  // Previous Semester Marks
  if (input.prevExamMarks < 55) {
    recommendations.push({
      area: 'Semester Foundation Concepts',
      priority: 'high',
      title: 'Remediate Core Subject Fundamentals',
      description: `Semester-wise previous marks baseline is ${input.prevExamMarks}/100. Core subjects build cumulatively upon earlier foundation courses.`,
      actionableStep: 'Revisit fundamental concepts and practice core question sets for 30 minutes daily.',
    });
  } else if (predictedMarks >= 80) {
    recommendations.push({
      area: 'College Academic Excellence',
      priority: 'low',
      title: 'Target Merit Recognition & Project Work',
      description: 'Your trajectory indicates strong academic momentum. Focus on advanced elective topics and competitive problem-solving.',
      actionableStep: 'Solve university past 5-year question papers under timed exam conditions and explore advanced project implementations.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      area: 'Consistency & Exam Strategy',
      priority: 'low',
      title: 'Maintain Study Cadence & Practice',
      description: 'Balanced performance across attendance, internal assessment, and study hours.',
      actionableStep: 'Practice previous semester question papers within 3-hour exam time bounds to master answer presentation.',
    });
  }

  return recommendations;
}

export function classifyPerformance(marks: number): PerformanceCategory {
  if (marks >= 85) return 'Excellent';
  if (marks >= 70) return 'Good';
  if (marks >= 50) return 'Satisfactory';
  return 'Needs Improvement';
}

// -------------------------------------------------------------
// 5. Singleton ML Manager Service
// -------------------------------------------------------------

class MLEngineService {
  private linearModel = new LinearRegressionModel();
  private rfModel = new RandomForestRegressorModel(16, 6);
  private dataset: DatasetRecord[] = [];
  private trainData: DatasetRecord[] = [];
  private testData: DatasetRecord[] = [];
  private modelComparison: ModelComparison | null = null;
  private isInitialized = false;

  initialize(seed = 42) {
    if (this.isInitialized) return;

    this.dataset = generateAcademicDataset(600, seed);
    const { train, test } = splitTrainTest(this.dataset, 0.8, seed);
    this.trainData = train;
    this.testData = test;

    const toFeatureRow = (r: DatasetRecord): number[] => [
      r.attendancePct,
      r.prevExamMarks,
      r.internalMarks,
      r.weeklyStudyHours,
    ];

    const X_train = this.trainData.map(toFeatureRow);
    const y_train = this.trainData.map(r => r.finalExamMarks);
    const X_test = this.testData.map(toFeatureRow);
    const y_test = this.testData.map(r => r.finalExamMarks);

    // 1. Fit Linear Regression
    this.linearModel.fit(X_train, y_train);
    const y_pred_linear = this.linearModel.predict(X_test);
    const linearMetrics = calculateMetrics(y_test, y_pred_linear);

    // 2. Fit Random Forest Regressor
    this.rfModel.fit(X_train, y_train);
    const y_pred_rf = this.rfModel.predict(X_test);
    const rfMetrics = calculateMetrics(y_test, y_pred_rf);

    const selectedModel =
      rfMetrics.rmse <= linearMetrics.rmse ? 'RandomForestRegressor' : 'LinearRegression';

    const featureImportances = FEATURE_NAMES.map((name, idx) => {
      const importancePct = Math.round((this.rfModel.featureImportances[idx] || 0) * 10) / 10;
      const weight = Math.round((this.linearModel.weights[idx] || 0) * 1000) / 1000;
      return {
        feature: FEATURE_LABELS[name],
        importancePct,
        weight,
      };
    }).sort((a, b) => b.importancePct - a.importancePct);

    this.modelComparison = {
      linearRegression: {
        name: 'Linear Regression (Baseline OLS)',
        mae: linearMetrics.mae,
        rmse: linearMetrics.rmse,
        r2: linearMetrics.r2,
        trainingSamples: this.trainData.length,
        testingSamples: this.testData.length,
        details: {
          intercept: Math.round(this.linearModel.intercept * 100) / 100,
          weights: this.linearModel.weights.map(w => Math.round(w * 1000) / 1000),
        },
      },
      randomForest: {
        name: 'Random Forest Regressor (Ensemble)',
        mae: rfMetrics.mae,
        rmse: rfMetrics.rmse,
        r2: rfMetrics.r2,
        trainingSamples: this.trainData.length,
        testingSamples: this.testData.length,
        details: {
          nEstimators: this.rfModel.nEstimators,
          maxDepth: this.rfModel.maxDepth,
        },
      },
      selectedModel,
      featureImportances,
      datasetInfo: {
        totalRecords: this.dataset.length,
        trainSplit: this.trainData.length,
        testSplit: this.testData.length,
        seed,
        isSynthetic: true,
        description:
          'Reproducible synthetic college academic dataset (seed=42) modeling semester-wise marks, attendance, and internal assessments (out of 20).',
      },
    };

    this.isInitialized = true;
  }

  predict(input: PredictionInput): PredictionRecord {
    if (!this.isInitialized) {
      this.initialize();
    }

    let effectivePrevMarks = Number(input.prevExamMarks) || 0;
    let semesterTrend: PredictionRecord['semesterTrend'] | undefined = undefined;

    // Multi-semester analysis if previousSemesters provided
    if (input.previousSemesters && input.previousSemesters.length > 0) {
      const sems = input.previousSemesters;
      const k = sems.length;
      const sumMarks = sems.reduce((acc, s) => acc + s.marks, 0);
      const avgMarks = sumMarks / k;

      if (k === 1) {
        effectivePrevMarks = sems[0].marks;
        semesterTrend = {
          average: Math.round(avgMarks * 10) / 10,
          trendSlope: 0,
          trendLabel: 'steady',
        };
      } else {
        // Weighted Recency: later semesters have higher weight
        let sumWeights = 0;
        let weightedMarks = 0;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;

        for (let i = 0; i < k; i++) {
          const x = i + 1; // Semester index order
          const y = sems[i].marks;
          const weight = i + 1;

          weightedMarks += y * weight;
          sumWeights += weight;

          sumX += x;
          sumY += y;
          sumXY += x * y;
          sumX2 += x * x;
        }

        const recencyAvg = weightedMarks / sumWeights;
        // Slope = (k*sumXY - sumX*sumY) / (k*sumX2 - sumX*sumX)
        const denom = k * sumX2 - sumX * sumX;
        const slope = denom !== 0 ? (k * sumXY - sumX * sumY) / denom : 0;

        let trendLabel: 'improving' | 'declining' | 'steady' = 'steady';
        if (slope >= 1.0) trendLabel = 'improving';
        else if (slope <= -1.0) trendLabel = 'declining';

        // Incorporate momentum: 80% recency weighted + momentum trajectory
        effectivePrevMarks = Math.max(0, Math.min(100, recencyAvg + slope * 0.4));

        semesterTrend = {
          average: Math.round(avgMarks * 10) / 10,
          trendSlope: Math.round(slope * 10) / 10,
          trendLabel,
        };
      }
    }

    // Input sanitization & boundary clamping:
    const sanitizedInput: PredictionInput = {
      attendancePct: Math.min(100, Math.max(0, Number(input.attendancePct) || 0)),
      prevExamMarks: Math.min(100, Math.max(0, Math.round(effectivePrevMarks * 10) / 10)),
      previousSemesters: input.previousSemesters,
      internalMarks: Math.min(20, Math.max(0, Number(input.internalMarks) || 0)),
      weeklyStudyHours: Math.min(50, Math.max(0, Number(input.weeklyStudyHours) || 0)),
      studentId: input.studentId,
      studentName: input.studentName,
      course: input.course,
      semester: input.semester,
    };

    const row = [
      sanitizedInput.attendancePct,
      sanitizedInput.prevExamMarks,
      sanitizedInput.internalMarks,
      sanitizedInput.weeklyStudyHours,
    ];

    const { prediction, min, max } = this.rfModel.predictRowWithConfidence(row);
    const category = classifyPerformance(prediction);
    const recommendations = generateRecommendations(sanitizedInput, prediction);

    // If trajectory shows a decline, add specific semester trend recommendation
    if (semesterTrend && semesterTrend.trendLabel === 'declining') {
      recommendations.unshift({
        area: 'Semester Trajectory Alert',
        priority: 'high',
        title: 'Downward Semester Performance Trajectory',
        description: `Previous semester marks have trended downward by an average of ${Math.abs(semesterTrend.trendSlope)} marks per semester. Immediate intervention needed to stabilize grades.`,
        actionableStep: 'Audit weak subjects from preceding semesters with your academic advisor before finals.',
      });
    } else if (semesterTrend && semesterTrend.trendLabel === 'improving') {
      recommendations.push({
        area: 'Semester Trajectory Momentum',
        priority: 'low',
        title: 'Positive Upward Semester Momentum',
        description: `Candidate demonstrates consistent upward progress (+${semesterTrend.trendSlope} marks/semester) across previous terms.`,
        actionableStep: 'Keep up current revision cadence and practice higher-difficulty problem sets.',
      });
    }

    return {
      id: `pred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId: sanitizedInput.studentId,
      studentName: sanitizedInput.studentName,
      course: sanitizedInput.course,
      semester: sanitizedInput.semester,
      input: sanitizedInput,
      predictedMarks: prediction,
      category,
      confidenceRange: [min, max],
      modelUsed: this.modelComparison?.selectedModel || 'RandomForestRegressor',
      recommendations,
      timestamp: new Date().toISOString(),
      semesterTrend,
    };
  }

  getModelInsights(): ModelComparison {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.modelComparison!;
  }

  getDataset(): DatasetRecord[] {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.dataset;
  }

  retrain(newSeed?: number): ModelComparison {
    this.isInitialized = false;
    this.initialize(newSeed ?? Math.floor(Math.random() * 1000));
    return this.modelComparison!;
  }
}

export const mlEngine = new MLEngineService();
mlEngine.initialize(42);
