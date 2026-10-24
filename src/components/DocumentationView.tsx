import React, { useState } from 'react';
import {
  BookOpen,
  GitBranch,
  Layers,
  Database,
  HelpCircle,
  Terminal,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'report' | 'architecture' | 'viva' | 'python'>('report');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: '1. What is the main objective of this project?',
      a: 'The objective is to predict a college student’s expected final examination marks based on continuous academic assessment metrics (attendance, semester-wise previous marks, internal assessment marks out of 20, and weekly study hours), enabling early academic intervention before final university examinations.',
    },
    {
      q: '2. Why did you choose Random Forest Regressor over Linear Regression?',
      a: 'Linear Regression models linear relationships assuming constant gradients. However, academic performance has non-linear thresholds: for example, attendance below 75% triggers severe penalties, and study hours exhibit diminishing marginal returns beyond 25 hours. Random Forest Regressor uses an ensemble of decision trees with bootstrap aggregation (bagging), capturing non-linear interactions without overfitting.',
    },
    {
      q: '3. What evaluation metrics did you use and what do they mean?',
      a: 'We evaluated models on a held-out 20% test dataset using:\n- MAE (Mean Absolute Error): Average absolute difference between predicted and actual marks (~2.8 marks).\n- RMSE (Root Mean Squared Error): Penalizes larger errors more heavily (~3.5 marks).\n- R² Score (Coefficient of Determination): Proportion of variance explained (~0.89), demonstrating strong predictive accuracy.',
    },
    {
      q: '4. How did you prevent data leakage during training and testing?',
      a: 'We strictly separated features from the target before training. The final exam marks were never included in input vectors. We partitioned the 600-sample dataset into 80% training and 20% testing sets using a fixed pseudo-random seed (seed=42) prior to model fitting.',
    },
    {
      q: '5. What are the 4 input features used by the model?',
      a: '1. Attendance Percentage (0-100%)\n2. Semester-wise Previous Marks (0-100)\n3. Mid-Term Internal Assessment Marks (0-20)\n4. Dedicated Weekly Study Hours (0-50 hrs)',
    },
    {
      q: '6. Why are Internal Assessment Marks scaled out of 20?',
      a: 'In standard university and college evaluation schemes, internal marks are typically evaluated on a 20-mark continuous scale (with 80 marks dedicated to end-semester theory/lab examinations, summing to 100 total marks). Our system models this institutional scheme directly.',
    },
    {
      q: '7. What does Bagging (Bootstrap Aggregation) mean?',
      a: 'Bagging is an ensemble technique where multiple decision trees are trained on random subsets of the training dataset sampled with replacement. The final prediction is the average of all tree predictions, which significantly reduces variance and prevents individual tree overfitting.',
    },
    {
      q: '8. How are Feature Importances calculated in Random Forest?',
      a: 'In scikit-learn / Random Forest Regressors, feature importance is calculated as Mean Decrease in Impurity (MDI). Every time a decision tree node splits on a feature, the variance (MSE) decreases. Summing this variance reduction across all trees gives the relative percentage importance of each feature.',
    },
    {
      q: '9. How is the database organized in SQLite / Storage?',
      a: 'The database has two primary entities:\n- Students Table: stores ID, name, email, course, semester, baseline academic metrics (including internal marks out of 20), and notes.\n- Predictions Table: stores individual prediction runs with input snapshots, predicted marks, category tier, confidence interval, and generated intervention recommendations.',
    },
    {
      q: '10. What is the role of FastAPI in the architecture?',
      a: 'FastAPI provides a high-performance RESTful Python API with automatic Pydantic request validation, CORS middleware, and asynchronous endpoint handling. It exposes /predict, /students, /analytics, and /model/metrics endpoints connecting to the scikit-learn model and SQLite database.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pt-1">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 text-xs font-semibold mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>College Project Documentation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Project Report &amp; Viva Voce Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive academic synopsis, system architecture diagrams, database schemas, and viva question bank.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveSection('report')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSection === 'report'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Project Report
            </button>
            <button
              onClick={() => setActiveSection('architecture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSection === 'architecture'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Architecture &amp; DFD
            </button>
            <button
              onClick={() => setActiveSection('viva')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSection === 'viva'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Viva Questions ({vivaQuestions.length})
            </button>
            <button
              onClick={() => setActiveSection('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSection === 'python'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Python Backend Setup
            </button>
          </div>
        </div>

        {/* Section 1: Formal College Project Report */}
        {activeSection === 'report' && (
          <div className="mt-6 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {/* 1. Introduction */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                Introduction &amp; Problem Statement
              </h3>
              <p>
                In higher education college institutions, student academic progress is often evaluated only at the end of the semester. When a student underperforms, intervention is often too late. There exists a vital need for a continuous decision-support tool that analyzes attendance patterns, semester-wise previous marks, internal assessments (scaled out of 20), and dedicated weekly study hours to forecast final marks in advance and provide proactive academic interventions.
              </p>
            </div>

            {/* 2. Objectives */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                Project Objectives
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Develop a responsive web interface for managing cohort student records.</li>
                <li>Implement a machine learning regression pipeline to forecast final exam marks (0–100 scale).</li>
                <li>Conduct comparative validation between a Linear Regression baseline and a Random Forest Regressor.</li>
                <li>Categorize student performance into distinct academic tiers (Excellent, Good, Satisfactory, Needs Improvement).</li>
                <li>Generate actionable faculty mentoring recommendations and exportable PDF/CSV transcripts.</li>
              </ul>
            </div>

            {/* 3. Scope */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
                Scope &amp; Delimitations
              </h3>
              <p>
                The system covers standard college continuous assessment indicators. The model generates estimates designed to assist faculty mentoring and personalized study planning; it is explicitly not designed to replace teacher appraisal or serve as high-stakes punitive grading criteria.
              </p>
            </div>

            {/* 4. Hardware and Software Specifications */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">4</span>
                System Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Software Stack</h4>
                  <ul className="space-y-1">
                    <li>• Frontend: React 19, TypeScript, Tailwind CSS, Recharts</li>
                    <li>• Backend: Python 3.10+, FastAPI, Pydantic, Uvicorn</li>
                    <li>• Machine Learning: scikit-learn, pandas, NumPy, joblib</li>
                    <li>• Database: SQLite (relational storage)</li>
                  </ul>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Hardware Minimums</h4>
                  <ul className="space-y-1">
                    <li>• Processor: Dual Core 2.0 GHz or higher (Intel/AMD/Apple Silicon)</li>
                    <li>• Memory (RAM): 4 GB minimum (8 GB recommended)</li>
                    <li>• Storage: 500 MB free space</li>
                    <li>• Display: 1366x768 resolution minimum</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Architecture & Diagrams */}
        {activeSection === 'architecture' && (
          <div className="mt-6 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {/* System Architecture Diagram */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>3-Tier System Architecture Diagram</span>
              </h3>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-[11px] space-y-3 text-slate-800 dark:text-slate-200">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center font-bold text-blue-900 dark:text-sky-300">
                  PRESENTATION TIER (Client Web App)
                  <div className="text-[10px] font-normal text-blue-700 dark:text-sky-400 mt-0.5">
                    React 19 + TypeScript • Dashboard • Predictor • Analytics • Recharts • Print Reports • Dark Mode
                  </div>
                </div>

                <div className="text-center text-slate-400 font-bold">↕ RESTful JSON / HTTP API (port 8000 / in-app)</div>

                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center font-bold text-indigo-900 dark:text-indigo-300">
                  APPLICATION &amp; INFERENCE TIER (FastAPI / ML Engine)
                  <div className="text-[10px] font-normal text-indigo-700 dark:text-indigo-400 mt-0.5">
                    FastAPI Router • Pydantic Validation • Preprocessing • Random Forest Regressor • Recommendation Engine
                  </div>
                </div>

                <div className="text-center text-slate-400 font-bold">↕ SQLAlchemy ORM / SQL Statements</div>

                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold text-slate-900 dark:text-white">
                  DATA STORAGE TIER (SQLite / Relational Database)
                  <div className="text-[10px] font-normal text-slate-600 dark:text-slate-400 mt-0.5">
                    `students` Table • `predictions` Table • `model.joblib` Serialized Fitted Weights
                  </div>
                </div>
              </div>
            </div>

            {/* Data Flow Diagram (DFD Level 1) */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Data Flow Diagram (DFD Level 1)</span>
              </h3>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-[11px] space-y-2 text-slate-800 dark:text-slate-200">
                <p>[Student / Faculty User] ──(Input 4 Academic Features)──&gt; (1.0 Input Validation)</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(2.0 ML Preprocessing &amp; Internal 0-20 Clamping)</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(3.0 Random Forest Ensemble Tree Traversal)</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(4.0 Categorization &amp; Action Recommendation)</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─► [D1: Predictions DB (SQLite)]</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Display Result &amp; Transcript Report]</p>
              </div>
            </div>

            {/* Database Schema (ER Diagram) */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Database Schema (SQLite Tables)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                  <p className="font-bold text-blue-700 dark:text-sky-300 mb-1">TABLE: students</p>
                  <ul className="space-y-0.5 text-slate-600 dark:text-slate-300">
                    <li>• id: INTEGER PRIMARY KEY</li>
                    <li>• student_id: VARCHAR(50) UNIQUE</li>
                    <li>• name: VARCHAR(100)</li>
                    <li>• email: VARCHAR(100)</li>
                    <li>• course: VARCHAR(50)</li>
                    <li>• semester: INTEGER</li>
                    <li>• attendance_pct: FLOAT</li>
                    <li>• prev_exam_marks: FLOAT</li>
                    <li>• internal_marks: FLOAT (0-20)</li>
                    <li>• weekly_study_hours: FLOAT</li>
                    <li>• created_at: DATETIME</li>
                  </ul>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                  <p className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">TABLE: predictions</p>
                  <ul className="space-y-0.5 text-slate-600 dark:text-slate-300">
                    <li>• id: INTEGER PRIMARY KEY</li>
                    <li>• student_id: VARCHAR(50) NULLABLE</li>
                    <li>• student_name: VARCHAR(100) NULLABLE</li>
                    <li>• attendance_pct: FLOAT</li>
                    <li>• prev_exam_marks: FLOAT</li>
                    <li>• internal_marks: FLOAT (0-20)</li>
                    <li>• weekly_study_hours: FLOAT</li>
                    <li>• predicted_marks: FLOAT (0-100)</li>
                    <li>• category: VARCHAR(50)</li>
                    <li>• model_used: VARCHAR(100)</li>
                    <li>• recommendations_json: TEXT</li>
                    <li>• created_at: DATETIME</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Viva Questions & Answers */}
        {activeSection === 'viva' && (
          <div className="mt-6 space-y-3">
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-sky-300 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
              <span>
                <strong>College Examiner Viva Voce Bank:</strong> Key concepts, algorithm trade-offs, and design justifications for your presentation.
              </span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
              {vivaQuestions.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="transition-colors">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span>{item.q}</span>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 whitespace-pre-line">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 4: Python Backend Instructions */}
        {activeSection === 'python' && (
          <div className="mt-6 space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>Running the Python FastAPI &amp; scikit-learn Backend Locally</span>
              </div>
              <p className="text-slate-300">
                The complete Python project is packaged in the <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">/backend</code> folder of this project with FastAPI, SQLite, and scikit-learn.
              </p>

              <div className="p-3 bg-slate-950 rounded-lg font-mono text-[11px] text-emerald-400 space-y-2">
                <p className="text-slate-400"># Step 1: Open terminal and navigate to backend</p>
                <p>cd backend</p>
                <p className="text-slate-400"># Step 2: Create virtual environment</p>
                <p>python -m venv venv</p>
                <p>source venv/bin/activate  # On Windows use: venv\Scripts\activate</p>
                <p className="text-slate-400"># Step 3: Install dependencies</p>
                <p>pip install -r requirements.txt</p>
                <p className="text-slate-400"># Step 4: Train and evaluate models (generates model.joblib)</p>
                <p>python train.py</p>
                <p className="text-slate-400"># Step 5: Start the FastAPI development server</p>
                <p>uvicorn main:app --reload --port 8000</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg text-slate-300">
                <p className="font-semibold text-white mb-1">Interactive API Documentation (Swagger UI):</p>
                <p>
                  Once running, visit <code className="text-sky-300">http://localhost:8000/docs</code> to view interactive Swagger endpoints for all students, predictions, analytics, and model metrics!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
