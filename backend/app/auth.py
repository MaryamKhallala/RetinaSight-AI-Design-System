"""Authentification — hash de mot de passe + token signé (stdlib uniquement).

⚠️ Démo pédagogique. En PRODUCTION : remplacer par Keycloak / OIDC (OAuth2)
et un vrai stockage de secrets (Vault). Ici on reste sans dépendance externe
pour rester simple à lancer.
"""
import hashlib
import hmac
import json
import os
import time
import base64

SECRET = os.getenv("OCTOPUS_SECRET", "octopus-dev-secret-change-me").encode()
TOKEN_TTL = 60 * 60 * 12   # 12 h


def hash_password(password: str, *, salt: str | None = None) -> str:
    """PBKDF2-HMAC-SHA256 → 'salt$hash' (hex)."""
    salt = salt or os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 120_000)
    return f"{salt}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    if not stored or "$" not in stored:
        return False
    salt, _ = stored.split("$", 1)
    return hmac.compare_digest(hash_password(password, salt=salt), stored)


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _unb64(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def make_token(user_id: str, role: str) -> str:
    """Token signé (HMAC) : payload.signature — sans dépendance JWT."""
    payload = {"sub": user_id, "role": role, "exp": int(time.time()) + TOKEN_TTL}
    raw = _b64(json.dumps(payload, separators=(",", ":")).encode())
    sig = _b64(hmac.new(SECRET, raw.encode(), hashlib.sha256).digest())
    return f"{raw}.{sig}"


def read_token(token: str) -> dict | None:
    try:
        raw, sig = token.split(".", 1)
        expected = _b64(hmac.new(SECRET, raw.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(_unb64(raw))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None
