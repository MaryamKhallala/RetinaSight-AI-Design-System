@echo off
REM Octopus — lanceur local (Windows).
REM Sert tout le projet et ouvre l'accueil dans le navigateur.
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
  python serve.py %*
  goto :eof
)
where npx >nul 2>nul
if %errorlevel%==0 (
  echo Python introuvable - utilisation de 'npx serve'.
  npx --yes serve@14 . -l 8000
  goto :eof
)
echo Ni Python ni npx trouves. Installez l'un des deux puis relancez.
pause
