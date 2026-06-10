"""Schémas Pydantic (validation entrée/sortie de l'API)."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CaseIn(BaseModel):
    id: Optional[str] = None
    patient: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    laterality: str = "OD"
    device: str = "Topcon NW400"
    date: Optional[str] = None
    note: Optional[str] = None


class CaseOut(BaseModel):
    id: str
    patient: str
    age: int
    sex: str
    laterality: str
    acquired: str
    device: str
    grade: int
    conf: float
    av: float
    lesions: int
    lesionBreakdown: dict
    status: str
    note: str

    class Config:
        from_attributes = True


class ReportIn(BaseModel):
    text: str
    author: str = "Dr. Amina Saidi"


class ReportOut(BaseModel):
    id: str
    caseId: str
    text: str
    author: str
    signedAt: datetime


class UserIn(BaseModel):
    name: str
    email: str
    role: str = "student"
    dept: str = "—"


class AttemptIn(BaseModel):
    caseId: str
    grade: Optional[int] = None
    gradeOk: bool = False
    findingScore: int = 0
