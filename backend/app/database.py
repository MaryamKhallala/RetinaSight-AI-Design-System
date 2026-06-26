"""Connexion base de données.

Par défaut : SQLite (fichier local `octopus.db`) — idéal pour démarrer petit
et tester. En production : définir DATABASE_URL vers PostgreSQL, ex.
    postgresql+psycopg2://octopus:octopus@localhost:5432/octopus
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./octopus.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
