"""
Pydantic Schemas for Request & Response Validation (SPS).
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class StudentBase(BaseModel):
    student_id: str = Field(..., min_length=2, max_length=50, description="Unique Student ID (e.g. CS2024-001)")
    name: str = Field(..., min_length=2, max_length=100, description="Full student name")
    email: str = Field(..., min_length=5, max_length=100, description="Student email address")
    course: str = Field(default="Computer Science", min_length=2, max_length=50)
    semester: int = Field(default=4, ge=1, le=8)
    attendance_pct: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage (0-100)")
    prev_exam_marks: float = Field(..., ge=0.0, le=100.0, description="Semester-wise previous marks (0-100)")
    internal_marks: float = Field(..., ge=0.0, le=20.0, description="Internal assessment marks (0-20)")
    weekly_study_hours: float = Field(..., ge=0.0, le=50.0, description="Weekly dedicated study hours (0-50)")
    notes: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    student_id: Optional[str] = Field(None, min_length=2, max_length=50)
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[str] = Field(None, min_length=5, max_length=100)
    course: Optional[str] = None
    semester: Optional[int] = Field(None, ge=1, le=8)
    attendance_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    prev_exam_marks: Optional[float] = Field(None, ge=0.0, le=100.0)
    internal_marks: Optional[float] = Field(None, ge=0.0, le=20.0)
    weekly_study_hours: Optional[float] = Field(None, ge=0.0, le=50.0)
    notes: Optional[str] = None

class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PredictionInput(BaseModel):
    attendance_pct: float = Field(..., ge=0.0, le=100.0)
    prev_exam_marks: float = Field(..., ge=0.0, le=100.0)
    internal_marks: float = Field(..., ge=0.0, le=20.0)
    weekly_study_hours: float = Field(..., ge=0.0, le=50.0)
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    course: Optional[str] = "Computer Science"
    semester: Optional[int] = 4

class RecommendationItem(BaseModel):
    area: str
    priority: str
    title: str
    description: str
    actionable_step: str

class PredictionResponse(BaseModel):
    id: int
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    predicted_marks: float
    category: str
    confidence_interval: List[float]
    model_used: str
    recommendations: List[RecommendationItem]
    created_at: datetime

class ModelMetricItem(BaseModel):
    name: str
    mae: float
    rmse: float
    r2: float
    samples_train: int
    samples_test: int

class FeatureImportanceItem(BaseModel):
    feature: str
    importance_pct: float

class ModelMetricsResponse(BaseModel):
    selected_model: str
    linear_regression: ModelMetricItem
    random_forest: ModelMetricItem
    feature_importances: List[FeatureImportanceItem]
    dataset_info: dict
