"""Stockage des images de fond d'œil.

Démo : stockage sur disque local (dossier `storage/`). En production →
objet (MinIO / S3) ; il suffit de remplacer save_image() / image_path().
"""
import os
import uuid
import pathlib

STORAGE_DIR = pathlib.Path(os.getenv("OCTOPUS_STORAGE", "./storage")).resolve()
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED = {"image/jpeg", "image/png", "application/dicom", "application/octet-stream"}
MAX_BYTES = 40 * 1024 * 1024   # 40 Mo


def save_image(case_id: str, filename: str, data: bytes) -> str:
    """Écrit l'image et renvoie le nom de fichier stocké (référence MinIO-like)."""
    ext = pathlib.Path(filename or "").suffix.lower() or ".bin"
    stored = f"{case_id}_{uuid.uuid4().hex[:8]}{ext}"
    (STORAGE_DIR / stored).write_bytes(data)
    return stored


def image_path(stored: str) -> pathlib.Path | None:
    p = (STORAGE_DIR / stored).resolve()
    # protection traversal : doit rester sous STORAGE_DIR
    if STORAGE_DIR not in p.parents:
        return None
    return p if p.exists() else None
