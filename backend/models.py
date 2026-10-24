"""
SQLAlchemy ORM Models for Student Performance Prediction System (SPS).
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from database import Base

class StudentModel(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    course = Column(String(50), default="Computer Science")
    semester = Column(Integer, default=4)
    attendance_pct = Column(Float, nullable=False)
    prev_exam_marks = Column(Float, nullable=False)
    internal_marks = Column(Float, nullable=False)  # 0 to 20
    weekly_study_hours = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PredictionModel(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(50), nullable=True, index=True)
    student_name = Column(String(100), nullable=True)
    course = Column(String(50), nullable=True)
    semester = Column(Integer, nullable=True)
    attendance_pct = Column(Float, nullable=False)
    prev_exam_marks = Column(Float, nullable=False)
    internal_marks = Column(Float, nullable=False)  # 0 to 20
    weekly_study_hours = Column(Float, nullable=False)
    predicted_marks = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    model_used = Column(String(100), default="RandomForestRegressor")
    recommendations_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
