#!/usr/bin/env bash
# Octopus — lanceur local (macOS / Linux).
# Sert tout le projet et ouvre l'accueil dans le navigateur.
set -e
cd "$(dirname "$0")"

if command -v python3 >/dev/null 2>&1; then
  exec python3 serve.py "$@"
elif command -v npx >/dev/null 2>&1; then
  echo "Python introuvable — utilisation de 'npx serve'."
  npx --yes serve@14 . -l 8000
else
  echo "Ni python3 ni npx trouvés. Installez l'un des deux puis relancez."
  exit 1
fi
