"""
FastAPI Application Entry Point for Student Performance Prediction System (SPS).
"""

import json
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import engine, get_db, Base
import models
import schemas
from ml_engine import ml_service

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Performance Prediction System (SPS) API",
    description="College academic analytics and Machine Learning service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "SPS Student Performance Prediction API",
        "version": "1.0.0",
        "model_trained": ml_service.is_trained
    }

@app.get("/students", response_model=List[schemas.StudentResponse], tags=["Students"])
def get_students(
    course: Optional[str] = None,
    semester: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.StudentModel)
    if course:
        query = query.filter(models.StudentModel.course == course)
    if semester:
        query = query.filter(models.StudentModel.semester == semester)
    if search:
        search_filter = f"%{search.lower()}%"
        query = query.filter(
            (func.lower(models.StudentModel.name).like(search_filter)) |
            (func.lower(models.StudentModel.student_id).like(search_filter))
        )
    return query.order_by(models.StudentModel.id.desc()).all()

@app.post("/students", response_model=schemas.StudentResponse, status_code=status.HTTP_201_CREATED, tags=["Students"])
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(models.StudentModel).filter(models.StudentModel.student_id == student.student_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student ID '{student.student_id}' is already registered."
        )

    db_student = models.StudentModel(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.get("/students/{student_id}", response_model=schemas.StudentResponse, tags=["Students"])
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(models.StudentModel).filter(models.StudentModel.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")
    return student

@app.put("/students/{student_id}", response_model=schemas.StudentResponse, tags=["Students"])
def update_student(student_id: str, update_data: schemas.StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(models.StudentModel).filter(models.StudentModel.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    payload = update_data.model_dump(exclude_unset=True)
    if "student_id" in payload and payload["student_id"] != student_id:
        duplicate = db.query(models.StudentModel).filter(models.StudentModel.student_id == payload["student_id"]).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="New Student ID is already assigned to another student.")

    for key, value in payload.items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)
    return student

@app.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Students"])
def delete_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(models.StudentModel).filter(models.StudentModel.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")
    db.delete(student)
    db.commit()
    return None

@app.post("/predict", response_model=schemas.PredictionResponse, tags=["Machine Learning"])
def predict_performance(req: schemas.PredictionInput, db: Session = Depends(get_db)):
    features = {
        "attendance_pct": req.attendance_pct,
        "prev_exam_marks": req.prev_exam_marks,
        "internal_marks": req.internal_marks,
        "weekly_study_hours": req.weekly_study_hours
    }

    pred_marks, category, confidence_interval, recommendations = ml_service.predict(features)

    pred_record = models.PredictionModel(
        student_id=req.student_id,
        student_name=req.student_name,
        course=req.course,
        semester=req.semester,
        attendance_pct=req.attendance_pct,
        prev_exam_marks=req.prev_exam_marks,
        internal_marks=req.internal_marks,
        weekly_study_hours=req.weekly_study_hours,
        predicted_marks=pred_marks,
        category=category,
        model_used=ml_service.metrics.get("selected_model", "RandomForestRegressor"),
        recommendations_json=json.dumps(recommendations)
    )
    db.add(pred_record)
    db.commit()
    db.refresh(pred_record)

    return schemas.PredictionResponse(
        id=pred_record.id,
        student_id=pred_record.student_id,
        student_name=pred_record.student_name,
        predicted_marks=pred_marks,
        category=category,
        confidence_interval=confidence_interval,
        model_used=pred_record.model_used,
        recommendations=[schemas.RecommendationItem(**r) for r in recommendations],
        created_at=pred_record.created_at
    )

@app.get("/predictions", tags=["Predictions"])
def get_predictions(limit: int = 50, db: Session = Depends(get_db)):
    preds = db.query(models.PredictionModel).order_by(models.PredictionModel.id.desc()).limit(limit).all()
    results = []
    for p in preds:
        results.append({
            "id": p.id,
            "student_id": p.student_id,
            "student_name": p.student_name,
            "course": p.course,
            "semester": p.semester,
            "attendance_pct": p.attendance_pct,
            "prev_exam_marks": p.prev_exam_marks,
            "internal_marks": p.internal_marks,
            "weekly_study_hours": p.weekly_study_hours,
            "predicted_marks": p.predicted_marks,
            "category": p.category,
            "model_used": p.model_used,
            "recommendations": json.loads(p.recommendations_json),
            "created_at": p.created_at.isoformat()
        })
    return results

@app.get("/analytics", tags=["Analytics"])
def get_analytics(db: Session = Depends(get_db)):
    total = db.query(models.StudentModel).count()
    if total == 0:
        return {
            "total_students": 0,
            "avg_attendance": 0,
            "avg_prev_marks": 0,
            "at_risk_students": 0
        }
    avg_att = db.query(func.avg(models.StudentModel.attendance_pct)).scalar() or 0
    avg_prev = db.query(func.avg(models.StudentModel.prev_exam_marks)).scalar() or 0
    at_risk = db.query(models.StudentModel).filter(
        (models.StudentModel.attendance_pct < 75) | (models.StudentModel.prev_exam_marks < 50) | (models.StudentModel.internal_marks < 10)
    ).count()

    return {
        "total_students": total,
        "avg_attendance": round(float(avg_att), 1),
        "avg_prev_marks": round(float(avg_prev), 1),
        "at_risk_students": at_risk
    }

@app.get("/model/metrics", response_model=schemas.ModelMetricsResponse, tags=["Machine Learning"])
def get_model_metrics():
    return ml_service.metrics

@app.post("/model/retrain", tags=["Machine Learning"])
def retrain_model(seed: int = 42):
    metrics = ml_service.train_and_evaluate(seed=seed)
    return {"message": "Model retrained successfully", "metrics": metrics}
