"""Point d'entrée FastAPI.

Lancer :
    cd backend
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8000

Docs interactives : http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import router
from .seed import seed

app = FastAPI(title="Octopus AI API", version="1.0.0",
              description="Backend de la plateforme de diagnostic rétinien Octopus.")

# CORS — autorise le front (prototype HTML) à appeler l'API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # en prod : restreindre aux domaines connus
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(engine)
    seed()   # amorce la base si vide (idempotent)


@app.get("/health")
def health():
    return {"status": "ok"}
