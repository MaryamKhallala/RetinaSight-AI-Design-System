# Lancer Octopus dans GitHub Codespaces

> Idéal si la **virtualisation est bloquée** sur ton PC (Docker ne démarre pas).
> Avec Codespaces, **tout tourne dans le cloud GitHub** — rien à installer sur ton Omen.
> Gratuit jusqu'à 60 h/mois (compte perso GitHub).

---

## Étape 1 — Mettre le projet sur GitHub

Si ce n'est pas déjà fait :
1. Va sur https://github.com/new → crée un dépôt (ex. `octopus`), **Private**, sans rien cocher.
2. Sur la page du dépôt vide → bouton **« uploading an existing file »**.
3. **Glisse-dépose tout le contenu** du dossier `RetinaSight AI Design System` (pas le dossier lui-même, son *contenu*).
4. **Commit changes**.

> Ou, si tu connais Git :
> ```bash
> git init && git add . && git commit -m "init"
> git branch -M main
> git remote add origin https://github.com/<toi>/octopus.git
> git push -u origin main
> ```

---

## Étape 2 — Ouvrir un Codespace

1. Sur la page du dépôt → bouton vert **`<> Code`**.
2. Onglet **Codespaces** → **« Create codespace on main »**.
3. Patiente ~1 min : un VS Code s'ouvre **dans ton navigateur**. La config (`.devcontainer/`) est déjà incluse.

---

## Étape 3 — Démarrer le front

Dans le **terminal** de ce VS Code (menu **Terminal → New Terminal** si besoin), tape :

```bash
python serve.py
```

Un message **« Opening in your browser »** apparaît, puis une fenêtre **« Ouvrir dans le navigateur »** / **Open in Browser** : clique dessus.

➜ La page d'accueil Octopus s'ouvre sur le **port 8000** (onglet *Ports* → 🌐 sur la ligne 8000).

Choisis un profil (Docteur / Étudiant / Admin) → connecte-toi → tu es dans l'app. 🎉

---

## (Optionnel) Le backend complet avec Docker

**Docker fonctionne dans Codespaces** (pas de souci de virtualisation, c'est le cloud) :

```bash
docker compose up --build
```
➜ Front sur le **port 8080**, API sur le **8000** (onglet *Ports*).

---

## Arrêter / reprendre

- **Arrêter le serveur** : `Ctrl + C` dans le terminal.
- **Fermer le Codespace** : il se met en pause tout seul après 30 min d'inactivité.
- **Reprendre** : github.com/codespaces → reclique sur ton Codespace.
- **Supprimer** (pour ne plus consommer d'heures) : github.com/codespaces → ⋯ → Delete.

---

## Rappel : sur ton PC sans Codespaces

Tu n'as **pas besoin de Docker** pour voir l'app. Dans le dossier du projet :

```powershell
python serve.py
```
…et ouvre http://localhost:8000. Docker ne sert que pour le backend FastAPI.
