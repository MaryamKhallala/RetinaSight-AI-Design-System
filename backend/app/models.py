"""Modèles SQLAlchemy — miroir du schéma de la base de test (lib/db.js)."""
from datetime import datetime
from sqlalchemy import String, Integer, Float, JSON, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base


class Case(Base):
    __tablename__ = "cases"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient: Mapped[str] = mapped_column(String)
    age: Mapped[int] = mapped_column(Integer)
    sex: Mapped[str] = mapped_column(String(1))
    laterality: Mapped[str] = mapped_column(String(2))
    acquired: Mapped[str] = mapped_column(String)
    device: Mapped[str] = mapped_column(String)
    grade: Mapped[int] = mapped_column(Integer)
    conf: Mapped[float] = mapped_column(Float)
    av: Mapped[float] = mapped_column(Float)
    lesions: Mapped[int] = mapped_column(Integer)
    lesion_breakdown: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String, default="pending")
    note: Mapped[str] = mapped_column(Text, default="")
    image_ref: Mapped[str] = mapped_column(String, default="")


class Report(Base):
    __tablename__ = "reports"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    case_id: Mapped[str] = mapped_column(String, index=True)
    text: Mapped[str] = mapped_column(Text)
    author: Mapped[str] = mapped_column(String)
    signed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True)
    role: Mapped[str] = mapped_column(String)
    dept: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="active")
    last: Mapped[str] = mapped_column(String, default="—")
    cases: Mapped[str] = mapped_column(String, default="0")
    password_hash: Mapped[str] = mapped_column(String, default="")


class Dataset(Base):
    __tablename__ = "datasets"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String)
    n: Mapped[int] = mapped_column(Integer)
    grade_dist: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String)
    ingested: Mapped[str] = mapped_column(String)
    license: Mapped[str] = mapped_column(String)


class Model(Base):
    __tablename__ = "models"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    framework: Mapped[str] = mapped_column(String)
    task: Mapped[str] = mapped_column(String)
    params: Mapped[str] = mapped_column(String)
    metric: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    deployed: Mapped[str] = mapped_column(String)


class AuditEntry(Base):
    __tablename__ = "audit"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ts: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    action: Mapped[str] = mapped_column(String)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)


class Attempt(Base):
    __tablename__ = "attempts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ts: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    case_id: Mapped[str] = mapped_column(String)
    grade: Mapped[int] = mapped_column(Integer, nullable=True)
    grade_ok: Mapped[bool] = mapped_column(default=False)
    finding_score: Mapped[int] = mapped_column(Integer, default=0)
