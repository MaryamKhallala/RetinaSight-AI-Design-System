"""Routes de l'API — endpoints alignés 1-pour-1 sur l'API de lib/db.js."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from .database import get_db
from . import models, schemas
from .inference import infer
from .auth import verify_password, make_token, read_token, hash_password
from . import storage

router = APIRouter(prefix="/api")


# ---- dépendances d'autorisation ----
def current_user(authorization: str = Header(default=""), db: Session = Depends(get_db)):
    """Renvoie le payload du token, ou None si absent/invalide (mode démo permissif)."""
    token = authorization.replace("Bearer ", "").strip()
    return read_token(token) if token else None


def require_role(*roles):
    """Exige un token valide ET un rôle autorisé. À mettre en Depends()."""
    def dep(user=Depends(current_user)):
        if not user:
            raise HTTPException(401, "Authentification requise")
        if roles and user.get("role") not in roles:
            raise HTTPException(403, f"Rôle requis : {', '.join(roles)}")
        return user
    return dep


# ---- auth ----
@router.post("/auth/login")
def login(payload: schemas.LoginIn, db: Session = Depends(get_db)):
    """Connexion réelle. Vérifie email + mot de passe. Refuse si le compte
    n'existe pas (→ l'UI propose alors de créer un compte)."""
    user = db.query(models.User).filter(models.User.email.ilike(payload.email)).first()
    if not user:
        raise HTTPException(404, "Aucun compte avec cet e-mail. Créez un compte.")
    if not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "E-mail ou mot de passe incorrect")
    token = make_token(user.id, user.role)
    audit(db, "auth.login", {"email": user.email, "role": user.role})
    db.commit()
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}


@router.post("/auth/register", status_code=201)
def register(payload: schemas.RegisterIn, db: Session = Depends(get_db)):
    """Inscription : crée un compte si l'e-mail est libre, puis connecte."""
    if db.query(models.User).filter(models.User.email.ilike(payload.email)).first():
        raise HTTPException(409, "Un compte existe déjà avec cet e-mail. Connectez-vous.")
    if len(payload.password) < 6:
        raise HTTPException(422, "Mot de passe trop court (6 caractères minimum).")
    role = payload.role if payload.role in ("doctor", "student", "admin") else "student"
    uid = "u_" + str(9000 + db.query(models.User).count())
    user = models.User(
        id=uid, name=payload.name or payload.email.split("@")[0], email=payload.email,
        role=role, dept=payload.dept or "—", status="active", last="à l'instant", cases="0",
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    audit(db, "auth.register", {"email": user.email, "role": role})
    db.commit()
    token = make_token(user.id, user.role)
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}


@router.get("/auth/me")
def me(authorization: str = Header(default=""), db: Session = Depends(get_db)):
    """Valide le token Bearer et renvoie la session courante."""
    token = authorization.replace("Bearer ", "").strip()
    payload = read_token(token)
    if not payload:
        raise HTTPException(401, "Session invalide ou expirée")
    user = db.get(models.User, payload["sub"])
    return {
        "id": payload["sub"],
        "role": payload["role"],
        "name": user.name if user else payload["role"],
        "email": user.email if user else None,
    }


@router.post("/auth/logout")
def logout(db: Session = Depends(get_db)):
    audit(db, "auth.logout", {})
    db.commit()
    return {"ok": True}


# ---- sérialisation ----
def case_dict(c: models.Case) -> dict:
    return dict(
        id=c.id, patient=c.patient, age=c.age, sex=c.sex, laterality=c.laterality,
        acquired=c.acquired, device=c.device, grade=c.grade, conf=c.conf, av=c.av,
        lesions=c.lesions, lesionBreakdown=c.lesion_breakdown or {}, status=c.status, note=c.note,
        imageRef=c.image_ref or "",
    )


def audit(db: Session, action: str, meta: dict):
    db.add(models.AuditEntry(action=action, meta=meta))


# ---- cases ----
@router.get("/cases")
def list_cases(db: Session = Depends(get_db)):
    rows = db.query(models.Case).all()
    return [case_dict(c) for c in rows]


@router.get("/cases/{case_id}")
def get_case(case_id: str, db: Session = Depends(get_db)):
    c = db.get(models.Case, case_id)
    if not c:
        raise HTTPException(404, "Cas introuvable")
    return case_dict(c)


@router.post("/cases", status_code=201)
def add_case(payload: schemas.CaseIn, db: Session = Depends(get_db)):
    # génère un id si absent
    cid = payload.id
    if not cid:
        n = db.query(models.Case).count() + 2391
        cid = f"RS-{n:05d}"
    if db.get(models.Case, cid):
        raise HTTPException(409, "Identifiant de cas déjà existant")
    ai = infer(payload.id or cid)
    now = datetime.utcnow()
    acquired = (payload.date or now.strftime("%Y-%m-%d")) + " " + now.strftime("%H:%M")
    seed = _hash_short(cid)
    c = models.Case(
        id=cid,
        patient=payload.patient or f"Patient {cid[-3:]}",
        age=payload.age or (40 + seed % 40),
        sex=payload.sex or ("F" if seed % 2 else "M"),
        laterality=payload.laterality,
        acquired=acquired,
        device=payload.device,
        note=payload.note or "Nouvel examen — téléversé",
        status="pending",
        **ai,
    )
    # mappe lesionBreakdown -> colonne lesion_breakdown
    c.lesion_breakdown = ai["lesionBreakdown"]
    db.add(c)
    audit(db, "case.create", {"id": cid})
    audit(db, "inference.run", {"id": cid, "grade": ai["grade"], "conf": ai["conf"]})
    db.commit()
    return case_dict(c)


@router.post("/cases/{case_id}/infer")
def run_inference(case_id: str, db: Session = Depends(get_db)):
    c = db.get(models.Case, case_id)
    if not c:
        raise HTTPException(404, "Cas introuvable")
    ai = infer(case_id)
    for k in ("grade", "conf", "av", "lesions"):
        setattr(c, k, ai[k])
    c.lesion_breakdown = ai["lesionBreakdown"]
    audit(db, "inference.run", {"id": case_id, "grade": ai["grade"]})
    db.commit()
    return case_dict(c)


# ---- upload réel d'image (multipart) — réservé aux docteurs ----
@router.post("/cases/upload", status_code=201)
async def upload_case(
    file: UploadFile = File(...),
    laterality: str = Form("OD"),
    device: str = Form("Topcon NW400"),
    patient: str = Form(""),
    note: str = Form(""),
    db: Session = Depends(get_db),
    user=Depends(require_role("doctor", "admin")),
):
    """Téléverse une vraie image de fond d'œil → stocke le fichier, crée le cas,
    lance l'inférence et renvoie le cas complet."""
    data = await file.read()
    if len(data) > storage.MAX_BYTES:
        raise HTTPException(413, "Fichier trop volumineux (max 40 Mo)")
    if file.content_type and file.content_type not in storage.ALLOWED:
        raise HTTPException(415, f"Type non supporté : {file.content_type}")

    n = db.query(models.Case).count() + 2391
    cid = f"RS-{n:05d}"
    stored = storage.save_image(cid, file.filename, data)
    ai = infer(cid, image_bytes=data)
    now = datetime.utcnow()
    seed = _hash_short(cid)
    c = models.Case(
        id=cid,
        patient=patient or f"Patient {cid[-3:]}",
        age=40 + seed % 40,
        sex="F" if seed % 2 else "M",
        laterality=laterality,
        acquired=now.strftime("%Y-%m-%d %H:%M"),
        device=device,
        note=note or "Image téléversée",
        status="pending",
        image_ref=stored,
        **ai,
    )
    c.lesion_breakdown = ai["lesionBreakdown"]
    db.add(c)
    audit(db, "case.create", {"id": cid, "by": user.get("sub")})
    audit(db, "image.upload", {"id": cid, "file": file.filename, "bytes": len(data)})
    audit(db, "inference.run", {"id": cid, "grade": ai["grade"], "conf": ai["conf"]})
    db.commit()
    return case_dict(c)


@router.get("/cases/{case_id}/image")
def get_case_image(case_id: str, db: Session = Depends(get_db)):
    """Sert le fichier image stocké pour un cas."""
    c = db.get(models.Case, case_id)
    if not c or not c.image_ref:
        raise HTTPException(404, "Image introuvable")
    p = storage.image_path(c.image_ref)
    if not p:
        raise HTTPException(404, "Fichier introuvable")
    return FileResponse(p)


# ---- reports ----
@router.get("/reports")
def list_reports(db: Session = Depends(get_db)):
    rows = db.query(models.Report).order_by(desc(models.Report.signed_at)).all()
    return [dict(id=r.id, caseId=r.case_id, text=r.text, author=r.author, signedAt=r.signed_at) for r in rows]


@router.post("/cases/{case_id}/report")
def save_report(case_id: str, payload: schemas.ReportIn, db: Session = Depends(get_db),
                user=Depends(require_role("doctor", "admin"))):
    c = db.get(models.Case, case_id)
    if not c:
        raise HTTPException(404, "Cas introuvable")
    existing = db.query(models.Report).filter_by(case_id=case_id).first()
    if existing:
        existing.text = payload.text
        existing.author = payload.author
        existing.signed_at = datetime.utcnow()
        rec = existing
    else:
        rec = models.Report(id=f"rep_{db.query(models.Report).count() + 1}", case_id=case_id,
                             text=payload.text, author=payload.author)
        db.add(rec)
    c.status = "signed"
    audit(db, "report.sign", {"caseId": case_id, "author": payload.author})
    db.commit()
    return dict(id=rec.id, caseId=rec.case_id, text=rec.text, author=rec.author, signedAt=rec.signed_at)


# ---- users ----
@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    return [dict(id=u.id, name=u.name, email=u.email, role=u.role, dept=u.dept,
                 status=u.status, last=u.last, cases=u.cases) for u in db.query(models.User).all()]


@router.post("/users", status_code=201)
def add_user(payload: schemas.UserIn, db: Session = Depends(get_db)):
    uid = "u_" + str(9000 + db.query(models.User).count())
    u = models.User(id=uid, name=payload.name, email=payload.email, role=payload.role,
                    dept=payload.dept, status="pending", last="—", cases="0")
    db.add(u)
    audit(db, "user.invite", {"id": uid, "email": payload.email})
    db.commit()
    return dict(id=u.id, name=u.name, email=u.email, role=u.role, dept=u.dept, status=u.status, last=u.last, cases=u.cases)


# ---- datasets / models ----
@router.get("/datasets")
def list_datasets(db: Session = Depends(get_db)):
    return [dict(id=d.id, name=d.name, type=d.type, n=d.n, gradeDist=d.grade_dist,
                 status=d.status, ingested=d.ingested, license=d.license) for d in db.query(models.Dataset).all()]


@router.get("/models")
def list_models(db: Session = Depends(get_db)):
    return [dict(id=m.id, name=m.name, framework=m.framework, task=m.task, params=m.params,
                 metric=m.metric, status=m.status, deployed=m.deployed) for m in db.query(models.Model).all()]


# ---- stats (page « Analyse des résultats ») ----
@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    cases = db.query(models.Case).all()
    n = len(cases)
    by_grade = [0, 0, 0, 0, 0]
    for c in cases:
        if c.grade is not None and 0 <= c.grade <= 4:
            by_grade[c.grade] += 1
    signed = sum(1 for c in cases if c.status == "signed")
    urgent = sum(1 for c in cases if c.status in ("urgent", "flagged"))
    avg_conf = round(sum(c.conf for c in cases) / n, 1) if n else 0
    return {
        "total": n,
        "signed": signed,
        "urgent": urgent,
        "avgConf": avg_conf,
        "byGrade": by_grade,
        "reports": db.query(models.Report).count(),
    }


# ---- audit / attempts ----
@router.get("/audit")
def list_audit(db: Session = Depends(get_db)):
    rows = db.query(models.AuditEntry).order_by(desc(models.AuditEntry.ts)).limit(200).all()
    return [dict(ts=e.ts, action=e.action, meta=e.meta or {}) for e in rows]


@router.get("/attempts")
def list_attempts(db: Session = Depends(get_db)):
    rows = db.query(models.Attempt).order_by(desc(models.Attempt.ts)).limit(200).all()
    return [dict(ts=a.ts, caseId=a.case_id, grade=a.grade, gradeOk=a.grade_ok, findingScore=a.finding_score) for a in rows]


@router.post("/attempts", status_code=201)
def add_attempt(payload: schemas.AttemptIn, db: Session = Depends(get_db)):
    a = models.Attempt(case_id=payload.caseId, grade=payload.grade,
                        grade_ok=payload.gradeOk, finding_score=payload.findingScore)
    db.add(a)
    audit(db, "attempt.submit", {"caseId": payload.caseId, "grade": payload.grade, "ok": payload.gradeOk})
    db.commit()
    return dict(ts=a.ts, caseId=a.case_id, grade=a.grade, gradeOk=a.grade_ok, findingScore=a.finding_score)


def _hash_short(s: str) -> int:
    h = 2166136261
    for ch in str(s):
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h
