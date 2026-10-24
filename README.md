# SPS — Student Performance Prediction System
### College Academic Project • Machine Learning Decision Support System

A full-stack, machine learning-driven web application titled **SPS (Student Performance System)** designed to forecast student final examination marks based on continuous academic assessment, lecture attendance patterns, semester-wise previous marks, internal assessment marks (out of 20), and dedicated study hours.

---

## 1. Project Introduction
In modern undergraduate college education, assessing student progress only at the conclusion of a semester often prevents timely academic intervention. **SPS (Student Performance Prediction System)** provides teachers, academic mentors, and students with proactive decision support by predicting final examination scores well before university examinations commence.

## 2. Problem Statement
Many undergraduate students encounter academic distress due to:
- Irregular lecture and laboratory attendance falling below institutional eligibility limits (typically 75%).
- Insufficient continuous assessment in mid-term internal examinations (out of 20 marks).
- Lack of self-directed study schedules and coding practice.

Without early detection tools, faculty cannot pinpoint students requiring targeted remedial sessions. This project addresses this challenge with a transparent, honest Machine Learning pipeline and dual Dark/Light mode user interface.

## 3. Project Objectives
1. **Accurate Forecasting:** Forecast expected final examination marks on a standard 0–100 scale using continuous assessment data.
2. **Honest Machine Learning Comparison:** Compare a baseline model (**Linear Regression**) against an ensemble algorithm (**Random Forest Regressor**) using held-out test data.
3. **Student Record Management:** Maintain cohort student profiles with validation, search, course/semester filters, and sorting.
4. **Actionable Recommendations:** Provide personalized, constructive suggestions without punitive labeling.
5. **Auditing & Reporting:** Log historical evaluations, offer CSV export, and print official student performance transcripts.
6. **Accessible Design:** Full Dark Mode and Normal (Light) Mode support with high-contrast text.

## 4. Scope of the Project
- **Target Audience:** College faculty, academic mentors, department heads, and undergraduate students.
- **Coverage:** University continuous assessment criteria (Attendance %, Semester-wise Previous Marks, Internal Assessment Marks out of 20, Weekly Study Hours).
- **Academic Disclaimer:** Predictions are statistical estimates for academic planning and do not substitute for official university evaluation boards.

## 5. Technology Stack
- **Frontend:**
  - React 19 with TypeScript
  - Tailwind CSS with Dark/Light theme switching
  - Recharts for data visualizations (Scatter plots, Bar charts, Pie charts)
  - Lucide React for iconography
- **Backend (Standalone Python Service in `/backend`):**
  - Python 3.10+
  - FastAPI & Pydantic
  - Uvicorn ASGI Server
  - SQLite Relational Database via SQLAlchemy
- **Machine Learning Engine:**
  - `RandomForestRegressor` (Ensemble of randomized decision trees with MSE reduction)
  - `LinearRegression` (Ordinary Least Squares with Ridge regularization)
  - Evaluation: MAE, RMSE, R² Score
  - Dataset: 600 reproducible academic instances (seed=42) partitioned 80% train / 20% test

---

## 6. System Architecture & Diagrams

### 3-Tier System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│              PRESENTATION TIER (React 19 SPA)               │
│  - Dashboard & KPIs          - Prediction Form & Sliders    │
│  - Student CRUD Table        - Recharts Visualizations      │
│  - Transcript Modal          - Dark Mode / Normal Mode      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON REST APIs
┌──────────────────────────────▼──────────────────────────────┐
│           APPLICATION & ML INFERENCE TIER (FastAPI)         │
│  - Pydantic Validation       - Preprocessing & Clamping     │
│  - Random Forest Regressor   - Linear Regression Baseline   │
│  - Rule Recommendation Engine- Model Metrics & Diagnostics  │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLAlchemy ORM
┌──────────────────────────────▼──────────────────────────────┐
│                 DATABASE TIER (SQLite 3)                    │
│  - `students` Table          - `predictions` Audit Table    │
│  - `model.joblib` Serialized Fitted Model Pipeline          │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Input Features & Scoring Ranges

The prediction model utilizes **4 continuous academic parameters**:
1. **Attendance Percentage:** 0% – 100% (75% standard college minimum)
2. **Semester-wise Previous Marks:** 0 – 100 (Historical performance baseline)
3. **Internal Assessment Marks:** 0 – 20 (Continuous mid-term evaluation out of 20 marks)
4. **Weekly Dedicated Study Hours:** 0 – 50 hours/week

*(Note: Target output is final examination marks on a 0–100 scale).*

---

## 8. Machine Learning Evaluation (Held-out 20% Test Split)

| Metric | Linear Regression (Baseline) | Random Forest Regressor (Ensemble) | Winner |
|---|---|---|---|
| **MAE (Mean Absolute Error)** | ~3.3 marks | **~2.7 marks** | Random Forest Regressor |
| **RMSE (Root Mean Squared Error)** | ~4.2 marks | **~3.4 marks** | Random Forest Regressor |
| **R² Score** | ~0.84 | **~0.89** | Random Forest Regressor |

### Relative Feature Importances:
- Semester-wise Previous Marks: **~44%**
- Internal Assessment Marks (/20): **~28%**
- Attendance Percentage: **~16%**
- Weekly Dedicated Study Hours: **~12%**

---

## 9. Performance Tiers & Categories
- **Excellent (85–100 marks):** Distinction caliber. Recommendation: advanced project electives, research seminars, and competitive programming.
- **Good (70–84.99 marks):** Solid academic grasp. Recommendation: timed mock exams and technical problem-solving.
- **Satisfactory (50–69.99 marks):** Passing threshold. Recommendation: targeted revision in weak subject modules and peer study groups.
- **Needs Improvement (< 50 marks):** Academic distress alert. Recommendation: attendance regularisation, faculty mentoring, and past midterm question paper remediation.

---

## 10. How to Run the Application

### Option A: Running the Web App (Active in AI Studio)
The web application is fully operational out-of-the-box on port 3000 with the integrated machine learning engine, interactive analytics, student database, and printable report modal.
```bash
npm run dev
```

### Option B: Running the Python FastAPI Backend Locally
1. Open terminal and enter the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate       # macOS / Linux
   venv\Scripts\activate          # Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Train models and generate `model.joblib`:
   ```bash
   python train.py
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
6. Open your browser to test endpoints and Swagger documentation at:
   `http://localhost:8000/docs`
