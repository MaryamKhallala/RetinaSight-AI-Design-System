"""Données de seed — identiques au seed de lib/db.js (base v2).
Exécuté au démarrage si la base est vide, ou via `python -m app.seed`.
"""
from .database import SessionLocal, engine, Base
from . import models

CASES = [
    dict(id="RS-02384", patient="A. Benali",    age=58, sex="F", laterality="OD", acquired="2026-05-04 09:12", device="Topcon NW400", grade=2, conf=92.4, av=1.42, lesions=3,  status="pending", note="Dépistage annuel de routine",      lesion_breakdown={"ma":1,"ex":2,"hem":0,"cw":0}),
    dict(id="RS-02385", patient="M. Idrissi",   age=64, sex="M", laterality="OS", acquired="2026-05-04 09:34", device="Canon CR-2",   grade=3, conf=88.1, av=1.21, lesions=9,  status="flagged", note="Baisse de vision OS — 3 semaines",    lesion_breakdown={"ma":5,"ex":2,"hem":2,"cw":0}),
    dict(id="RS-02386", patient="S. El Amrani", age=72, sex="F", laterality="OD", acquired="2026-05-04 10:01", device="Topcon NW400", grade=4, conf=81.6, av=0.98, lesions=14, status="urgent",  note="Corps flottants, début il y a 2 jours", lesion_breakdown={"ma":6,"ex":2,"hem":6,"cw":0}),
    dict(id="RS-02387", patient="Y. Ouazzani",  age=49, sex="M", laterality="OD", acquired="2026-05-04 10:22", device="Topcon NW400", grade=0, conf=96.3, av=1.71, lesions=0,  status="cleared", note="Diabète T2, examen de référence",    lesion_breakdown={"ma":0,"ex":0,"hem":0,"cw":0}),
    dict(id="RS-02388", patient="L. Tazi",      age=55, sex="F", laterality="OS", acquired="2026-05-04 10:48", device="Canon CR-2",   grade=1, conf=90.7, av=1.55, lesions=1,  status="pending", note="Suivi à 6 mois",                     lesion_breakdown={"ma":1,"ex":0,"hem":0,"cw":0}),
    dict(id="RS-02389", patient="A. Cherkaoui", age=67, sex="M", laterality="OD", acquired="2026-05-04 11:10", device="Topcon NW400", grade=2, conf=89.2, av=1.38, lesions=4,  status="pending", note="Dépistage annuel",                   lesion_breakdown={"ma":2,"ex":2,"hem":0,"cw":0}),
]

USERS = [
    dict(id="u_8821", name="Dr. Amina Saidi", email="amina.saidi@chu-rabat.ma", role="doctor",  dept="Ophtalmologie",      status="active",  last="il y a 2 min",  cases="482"),
    dict(id="u_8822", name="Dr. Karim Hajji", email="k.hajji@chu-rabat.ma",     role="doctor",  dept="Ophtalmologie",      status="active",  last="il y a 14 min", cases="318"),
    dict(id="u_8823", name="Omar Kabbaj",      email="omar.k@um6p-edu.ma",       role="student", dept="Médecine M5",        status="active",  last="il y a 1 h",    cases="128"),
    dict(id="u_8824", name="Sara Benkirane",   email="s.benkirane@um6p-edu.ma",  role="student", dept="Médecine M5",        status="active",  last="il y a 3 h",    cases="94"),
    dict(id="u_8825", name="Yassine Idrissi",  email="y.idrissi@um6p-edu.ma",    role="student", dept="Médecine M4",        status="pending", last="—",             cases="0"),
    dict(id="u_8826", name="Dr. Layla Tazi",   email="l.tazi@chu-rabat.ma",      role="doctor",  dept="Spécialiste rétine", status="active",  last="hier",          cases="712"),
    dict(id="u_8827", name="Mehdi El Otmani",  email="m.otmani@octopus.ai",      role="admin",   dept="Plateforme",         status="active",  last="à l'instant",   cases="—"),
]

DATASETS = [
    dict(id="ds_messidor2", name="Messidor-2",          type="fundus",         n=1748,  grade_dist=[810,270,347,75,246],      status="ready",  ingested="2026-04-12", license="Adcis open"),
    dict(id="ds_eyepacs",   name="EyePACS-train",       type="fundus",         n=35126, grade_dist=[25810,2443,5292,873,708], status="ready",  ingested="2026-04-19", license="Kaggle"),
    dict(id="ds_aptos",     name="APTOS 2019",          type="fundus",         n=3662,  grade_dist=[1805,370,999,193,295],    status="ready",  ingested="2026-04-21", license="CC BY-NC"),
    dict(id="ds_idrid",     name="IDRID localisation",  type="fundus + bbox",  n=516,   grade_dist=[134,25,168,79,110],       status="ready",  ingested="2026-04-23", license="CC BY 4.0"),
    dict(id="ds_chu_q1",    name="CHU Rabat — T1 2026", type="fundus + DICOM", n=884,   grade_dist=[402,138,187,89,68],       status="review", ingested="2026-05-01", license="Interne · CER"),
    dict(id="ds_chu_q2",    name="CHU Rabat — T2 2026", type="fundus + DICOM", n=312,   grade_dist=[142,51,68,28,23],         status="ingest", ingested="2026-05-04", license="Interne · CER"),
]

MODELS = [
    dict(id="m_v4_2_1", name="fundus-grade-v4.2.1",    framework="PyTorch", task="Grading RD",             params="24M", metric="AUC 0.987",  status="production", deployed="2026-04-29"),
    dict(id="m_v4_3_0", name="fundus-grade-v4.3.0-rc", framework="PyTorch", task="Grading RD",             params="38M", metric="AUC 0.991",  status="staging",    deployed="2026-05-02"),
    dict(id="m_vs_2_1", name="vessel-seg-v2.1",        framework="PyTorch", task="Segmentation vaisseaux", params="11M", metric="Dice 0.872", status="production", deployed="2026-03-14"),
    dict(id="m_les_18", name="lesion-detect-v1.8",     framework="PyTorch", task="Détection lésions",      params="46M", metric="mAP 0.71",   status="production", deployed="2026-03-30"),
]


def seed():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        if db.query(models.Case).count() > 0:
            return  # déjà amorcé
        db.add_all([models.Case(**c) for c in CASES])
        db.add_all([models.User(**u) for u in USERS])
        db.add_all([models.Dataset(**d) for d in DATASETS])
        db.add_all([models.Model(**m) for m in MODELS])
        db.commit()
        print(f"Seed OK : {len(CASES)} cas, {len(USERS)} utilisateurs, {len(DATASETS)} datasets, {len(MODELS)} modèles.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
