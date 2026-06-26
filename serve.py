#!/usr/bin/env python3
"""
Octopus — serveur de développement local (zéro dépendance).

Sert TOUT le projet sur http://localhost:8000 et ouvre la page d'accueil
(landing + authentification) dans le navigateur. Toutes les pages
(docteur / étudiant / admin / réglages / design system / survey / vidéo)
sont alors accessibles d'un seul coup depuis l'accueil.

Usage :
    python3 serve.py            # port 8000
    python3 serve.py 9000       # port personnalisé
"""
import http.server
import socketserver
import sys
import webbrowser
import os
from functools import partial

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".jsx": "text/babel; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".svg": "image/svg+xml",
    }

    def end_headers(self):
        # pas de cache pendant le dev → on voit les changements tout de suite
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # silencieux


def main():
    handler = partial(Handler, directory=ROOT)
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        url = f"http://localhost:{PORT}/web/index.html"
        print("\n  Octopus — serveur de développement")
        print(f"  ➜  Accueil   : {url}")
        print(f"  ➜  Docteur   : http://localhost:{PORT}/web/doctor/index.html")
        print(f"  ➜  Étudiant  : http://localhost:{PORT}/web/student/index.html")
        print(f"  ➜  Admin     : http://localhost:{PORT}/web/admin/index.html")
        print(f"  ➜  Réglages  : http://localhost:{PORT}/web/settings/index.html")
        print(f"  ➜  Survey    : http://localhost:{PORT}/docs_livrable/survey_slm_code_judges.html")
        print(f"  ➜  Vidéo 3D  : http://localhost:{PORT}/docs_livrable/video/index.html")
        print("\n  Ctrl+C pour arrêter.\n")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Arrêté.")


if __name__ == "__main__":
    main()
