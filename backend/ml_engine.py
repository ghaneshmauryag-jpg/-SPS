"""
Machine Learning Pipeline for Student Performance Prediction System (SPS).
Features:
- attendance_pct (0 - 100)
- prev_exam_marks (Semester-wise Previous Marks 0 - 100)
- internal_marks (Internal Assessment Marks 0 - 20)
- weekly_study_hours (0 - 50)
"""

import os
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "student_performance_dataset.csv")

FEATURE_COLUMNS = [
    "attendance_pct",
    "prev_exam_marks",
    "internal_marks",
    "weekly_study_hours"
]

FEATURE_LABELS = {
    "attendance_pct": "Attendance Percentage",
    "prev_exam_marks": "Semester-wise Previous Marks",
    "internal_marks": "Internal Assessment Marks (0-20)",
    "weekly_study_hours": "Weekly Dedicated Study Hours"
}

def generate_synthetic_data(n_samples: int = 600, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    base_aptitude = np.clip(np.random.normal(loc=65, scale=12, size=n_samples), 35, 95)
    
    attendance = np.clip(base_aptitude * 0.4 + np.random.uniform(15, 60, size=n_samples), 42, 99)
    prev_marks = np.clip(base_aptitude * 0.75 + np.random.normal(15, 7, size=n_samples), 30, 98)
    internal = np.clip((base_aptitude / 100.0) * 14 + (attendance / 100.0) * 4 + np.random.normal(1.5, 1.2, size=n_samples), 4.0, 20.0)
    study_hours = np.clip((prev_marks / 100.0) * 14 + np.random.uniform(2, 14, size=n_samples), 3, 35)
    
    study_effect = np.clip(np.log10(study_hours + 1.0) * 7.2, 0, 10)
    attendance_penalty = np.where(attendance < 65, (65 - attendance) * 0.35, 0.0)
    internal_normalized = internal * 5.0
    
    noise = np.random.normal(0, 4.0, size=n_samples)
    final_marks = (
        prev_marks * 0.45 +
        internal_normalized * 0.25 +
        (attendance / 100.0) * 15 +
        study_effect -
        attendance_penalty +
        noise
    )
    final_marks = np.clip(final_marks, 20, 99.5)
    
    df = pd.DataFrame({
        "attendance_pct": np.round(attendance, 1),
        "prev_exam_marks": np.round(prev_marks, 1),
        "internal_marks": np.round(internal, 1),
        "weekly_study_hours": np.round(study_hours, 1),
        "final_exam_marks": np.round(final_marks, 1)
    })
    return df

class AcademicMLService:
    def __init__(self):
        self.rf_model: RandomForestRegressor = None
        self.lr_model: LinearRegression = None
        self.metrics: Dict[str, Any] = {}
        self.is_trained = False
        self._ensure_model()

    def _ensure_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                bundle = joblib.load(MODEL_PATH)
                self.rf_model = bundle["rf_model"]
                self.lr_model = bundle["lr_model"]
                self.metrics = bundle["metrics"]
                self.is_trained = True
                return
            except Exception as e:
                print(f"Error loading bundle: {e}, retraining...")
        self.train_and_evaluate()

    def train_and_evaluate(self, seed: int = 42) -> Dict[str, Any]:
        os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
        if not os.path.exists(DATA_PATH):
            df = generate_synthetic_data(n_samples=600, seed=seed)
            df.to_csv(DATA_PATH, index=False)
        else:
            df = pd.read_csv(DATA_PATH)

        X = df[FEATURE_COLUMNS]
        y = df["final_exam_marks"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=seed
        )

        lr = LinearRegression()
        lr.fit(X_train, y_train)
        lr_pred = lr.predict(X_test)
        lr_mae = float(mean_absolute_error(y_test, lr_pred))
        lr_rmse = float(np.sqrt(mean_squared_error(y_test, lr_pred)))
        lr_r2 = float(r2_score(y_test, lr_pred))

        rf = RandomForestRegressor(
            n_estimators=100,
            max_depth=6,
            min_samples_split=4,
            random_state=seed,
            n_jobs=-1
        )
        rf.fit(X_train, y_train)
        rf_pred = rf.predict(X_test)
        rf_mae = float(mean_absolute_error(y_test, rf_pred))
        rf_rmse = float(np.sqrt(mean_squared_error(y_test, rf_pred)))
        rf_r2 = float(r2_score(y_test, rf_pred))

        importances = rf.feature_importances_ * 100.0
        feature_importances = [
            {"feature": FEATURE_LABELS[col], "importance_pct": round(float(imp), 1)}
            for col, imp in zip(FEATURE_COLUMNS, importances)
        ]
        feature_importances.sort(key=lambda x: x["importance_pct"], reverse=True)

        selected_model = "RandomForestRegressor" if rf_rmse <= lr_rmse else "LinearRegression"

        self.lr_model = lr
        self.rf_model = rf
        self.metrics = {
            "selected_model": selected_model,
            "linear_regression": {
                "name": "Linear Regression (Baseline)",
                "mae": round(lr_mae, 2),
                "rmse": round(lr_rmse, 2),
                "r2": round(lr_r2, 3),
                "samples_train": len(X_train),
                "samples_test": len(X_test)
            },
            "random_forest": {
                "name": "Random Forest Regressor (Ensemble)",
                "mae": round(rf_mae, 2),
                "rmse": round(rf_rmse, 2),
                "r2": round(rf_r2, 3),
                "samples_train": len(X_train),
                "samples_test": len(X_test)
            },
            "feature_importances": feature_importances,
            "dataset_info": {
                "total_records": len(df),
                "seed": seed,
                "is_synthetic": True,
                "description": "Reproducible synthetic college academic performance dataset."
            }
        }

        bundle = {
            "rf_model": self.rf_model,
            "lr_model": self.lr_model,
            "metrics": self.metrics
        }
        joblib.dump(bundle, MODEL_PATH)
        self.is_trained = True
        return self.metrics

    def predict(self, features: Dict[str, float]) -> Tuple[float, str, List[float], List[Dict[str, str]]]:
        row = np.array([[
            features["attendance_pct"],
            features["prev_exam_marks"],
            features["internal_marks"],
            features["weekly_study_hours"]
        ]])
        
        tree_preds = [tree.predict(row)[0] for tree in self.rf_model.estimators_]
        mean_pred = float(np.mean(tree_preds))
        std_pred = float(np.std(tree_preds))

        pred_marks = round(float(np.clip(mean_pred, 0.0, 100.0)), 1)
        conf_low = round(float(max(0.0, pred_marks - 1.96 * std_pred)), 1)
        conf_high = round(float(min(100.0, pred_marks + 1.96 * std_pred)), 1)

        if pred_marks >= 85:
            cat = "Excellent"
        elif pred_marks >= 70:
            cat = "Good"
        elif pred_marks >= 50:
            cat = "Satisfactory"
        else:
            cat = "Needs Improvement"

        recommendations = self._generate_recommendations(features, pred_marks)
        return pred_marks, cat, [conf_low, conf_high], recommendations

    def _generate_recommendations(self, f: Dict[str, float], pred: float) -> List[Dict[str, str]]:
        recs = []
        if f["attendance_pct"] < 75:
            recs.append({
                "area": "Attendance & Engagement",
                "priority": "high" if f["attendance_pct"] < 65 else "medium",
                "title": "Attain Minimum 75% Attendance Threshold",
                "description": f"Attendance is {f['attendance_pct']}%. Below college requirements.",
                "actionable_step": "Attend all upcoming lecture hours and clarify doubts in tutorial hours."
            })
        if f["weekly_study_hours"] < 10:
            recs.append({
                "area": "Study Habits",
                "priority": "high" if f["weekly_study_hours"] < 6 else "medium",
                "title": "Increase Weekly Independent Study Time",
                "description": f"Only {f['weekly_study_hours']} hours/week logged.",
                "actionable_step": "Dedicate at least 2 hours daily to coding drills and syllabus revision."
            })
        if f["internal_marks"] < 12:
            recs.append({
                "area": "Internal Assessment",
                "priority": "high",
                "title": "Remediate Low Internal Exam Scores",
                "description": f"Internal score is {f['internal_marks']}/20.",
                "actionable_step": "Review past mid-term question papers and seek faculty guidance."
            })
        if not recs:
            recs.append({
                "area": "Exam Preparation",
                "priority": "low",
                "title": "Maintain Consistent Study Cadence",
                "description": "Student is on a strong academic trajectory.",
                "actionable_step": "Solve previous 5-year university exam question papers under timed conditions."
            })
        return recs

ml_service = AcademicMLService()
