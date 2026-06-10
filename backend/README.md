# Octopus AI — Backend (FastAPI)

API réelle de la plateforme de diagnostic rétinien. Reproduit **1-pour-1**
l'API de la base de test front-end (`lib/db.js`), donc le passage du prototype
au serveur ne change aucune interface côté interface utilisateur.

## Démarrer petit (SQLite — pour tester)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- L'API démarre sur **http://localhost:8000**
- Documentation interactive (Swagger) : **http://localhost:8000/docs**
- Une base **SQLite** `octopus.db` est créée et **amorcée automatiquement** (6 cas, 7 utilisateurs, 6 datasets, 4 modèles).

## Passer à PostgreSQL (production locale)

```bash
docker compose up --build
```
Démarre PostgreSQL 16 + l'API connectée dessus. Ou bien, sans Docker :
```bash
export DATABASE_URL=postgresql+psycopg2://octopus:octopus@localhost:5432/octopus
uvicorn app.main:app --port 8000
```

## Brancher l'interface (prototype) sur ce backend

Dans le navigateur, sur n'importe quelle page de l'app, ouvrez la console et :

```js
localStorage.setItem('octopus.api_url', 'http://localhost:8000/api');
location.reload();
```

L'app **hydrate** alors ses données depuis l'API et **écrit** (téléversement,
signature, tentative) vers le serveur. Pour revenir au mode local :

```js
localStorage.removeItem('octopus.api_url'); location.reload();
```

## Endpoints

| Méthode · URL | Rôle |
|---|---|
| `GET  /api/cases` | Liste des cas |
| `GET  /api/cases/{id}` | Détail d'un cas |
| `POST /api/cases` | Créer un cas (+ inférence auto) |
| `POST /api/cases/{id}/infer` | Relancer l'inférence |
| `POST /api/cases/{id}/report` | Signer / enregistrer le rapport |
| `GET  /api/reports` | Liste des rapports signés |
| `GET  /api/users` · `POST /api/users` | Utilisateurs / inviter |
| `GET  /api/datasets` · `GET /api/models` | Jeux de données / modèles |
| `GET  /api/audit` | Journal d'audit |
| `GET  /api/attempts` · `POST /api/attempts` | Tentatives étudiant |
| `GET  /health` | Sonde de disponibilité |

## Structure

```
backend/
  app/
    main.py        point d'entrée FastAPI (CORS, startup, seed)
    database.py    moteur SQLAlchemy (SQLite par défaut, Postgres via env)
    models.py      tables : cases, reports, users, datasets, models, audit, attempts
    schemas.py     validation Pydantic
    routes.py      tous les endpoints /api
    inference.py   IA simulée (miroir de lib/db.js) — à remplacer par PyTorch/ONNX
    seed.py        données initiales (identiques au seed front-end)
  requirements.txt · Dockerfile · docker-compose.yml · .env.example
```

## Brancher le vrai modèle IA

Remplacer le corps de `app/inference.py::infer()` par un appel au service
GPU (PyTorch + ONNX Runtime), puis renvoyer `{grade, conf, av, lesions,
lesionBreakdown}`. Aucune autre couche n'a besoin de changer.
