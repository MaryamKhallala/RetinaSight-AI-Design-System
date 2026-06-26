# Octopus — Démarrage rapide (local)

Plateforme de diagnostic rétinien assistée par IA — **3 profils** (Docteur · Étudiant · Admin),
un design system, et un backend FastAPI optionnel.

---

## 1. Cloner

```bash
git clone <URL_DU_DEPOT> octopus
cd octopus
```

## 2. Lancer toutes les pages d'un coup

Le projet est 100 % statique (HTML + React via CDN) — **aucune installation n'est nécessaire**.
Il faut juste un petit serveur local (les `<script type="text/babel">` ne se chargent pas en `file://`).

**Option A — Python (recommandé, zéro dépendance)**
```bash
python3 serve.py
```

**Option B — un clic**
- macOS / Linux : `./start.sh`
- Windows : double-cliquer `start.bat`

**Option C — Node**
```bash
npm start        # npx serve sur le port 8000
```

➜ L'accueil s'ouvre sur **http://localhost:8000/** (redirige vers `web/index.html`)

## 3. Se connecter

Sur la page d'accueil :
1. **Choisir un profil** (obligatoire) : Docteur, Étudiant ou Admin.
2. Saisir e-mail + mot de passe (n'importe quoi en démo) — ou cliquer un **accès démo rapide**.
3. La validation **redirige automatiquement** vers l'espace du profil choisi.

> Démo : aucun mot de passe n'est vérifié. En production → SSO Okta + 2FA (voir `docs/backend.html`).
> Se déconnecter via le menu utilisateur (en bas de la barre latérale) → retour à l'accueil.

---

## Carte du projet

```
index.html              ← Accueil + authentification (point d'entrée)
serve.py / start.*       ← lanceurs locaux
styles.css               ← design system (1 import : tokens + chrome)
colors_and_type.css      ← jetons de design (couleurs, type, espacement…)

lib/
  i18n.js                ← bilingue FR (défaut) / EN
  db.js                  ← base de test locale + session/auth (API = futur FastAPI)
  monitoring.js          ← Sentry (PHI-safe)

web/
  index.html               ← Accueil + authentification (point d'entrée réel)
  _shared.jsx, _shell.css  ← chrome commun (rail, top bar, menu user)
  doctor/                  ← Diagnostic clinique  (upload · file · étude · patients · rapports · atlas · analyse)
  student/                 ← Apprentissage        (simulateur de cas · progression)
  admin/                   ← Administration       (utilisateurs · datasets · modèles)
  settings/                ← Réglages (par profil) + liens DR / Segmentation

backend/                 ← API FastAPI + PostgreSQL (docker compose) — optionnel
docs/backend.html        ← contrat d'API (endpoints, schémas)

assets/                  ← logos, icônes, images de fond d'œil
docs_livrable/           ← survey + vidéo 3D explicative (recherche PhD)
```

## Backend (optionnel)

Le front fonctionne seul (base locale `lib/db.js`). Deux façons de brancher le vrai backend :

### A. Tout en une commande (front + API + base)

À la **racine** du projet :

```bash
docker compose up --build
```

- Front (accueil) : http://localhost:8080
- API (FastAPI)   : http://localhost:8000  (docs : `/docs`)
- Postgres        : localhost:5432

nginx sert le front **et** fait proxy de `/api` vers l'API (même origine, pas de CORS).
Pour activer le mode backend côté navigateur, une fois sur http://localhost:8080, console :

```js
localStorage.setItem('octopus.api_url', '/api'); location.reload();
```

### B. Backend seul (front lancé à part avec `serve.py`)

```bash
cd backend
cp .env.example .env
docker compose up --build      # API sur http://localhost:8000
```

Voir `backend/README.md` et `docs/backend.html`.

> **Faut-il Docker pour le front ?** Non. Le front est 100 % statique ; `python3 serve.py` suffit.
> Docker côté front sert uniquement à tout démarrer d'un seul `docker compose up` (option A).

---

## Bilingue

Toute l'interface est en **français par défaut**, basculable en **anglais** :
- depuis l'accueil (bouton 🇬🇧 EN / 🇫🇷 FR en haut),
- ou dans chaque espace via **menu utilisateur → Langue**.
