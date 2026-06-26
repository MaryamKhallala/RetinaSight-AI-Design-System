"""Inférence IA simulée — miroir EXACT de infer() dans lib/db.js.

Déterministe par identifiant (hash FNV-1a + LCG) pour des résultats stables.
En production, remplacer le corps par un appel au service GPU (PyTorch/ONNX) :
    grade, conf, heatmap = await infer_service.predict(image_bytes)
"""


def _hash(s: str) -> int:
    h = 2166136261
    for ch in str(s):
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def _rng(seed: int):
    s = seed & 0xFFFFFFFF

    def nxt():
        nonlocal s
        s = (s * 1664525 + 1013904223) & 0xFFFFFFFF
        return s / 4294967296

    return nxt


def infer(seed_str: str) -> dict:
    r = _rng(_hash(seed_str))
    roll = r()
    grade = 0 if roll < 0.34 else 1 if roll < 0.55 else 2 if roll < 0.78 else 3 if roll < 0.93 else 4
    conf = round((78 + r() * 19) * 10) / 10
    av = round((0.95 + r() * 0.85) * 100) / 100
    ma = 0 if grade == 0 else round(r() * grade * 2)
    ex = (0 if grade == 0 else round(r())) if grade <= 1 else round(r() * 2)
    hem = round(2 + r() * 4) if grade >= 3 else 0
    cw = round(r() * 2) if (grade >= 3 and r() > 0.6) else 0
    breakdown = {"ma": ma, "ex": ex, "hem": hem, "cw": cw}
    return {
        "grade": grade,
        "conf": conf,
        "av": av,
        "lesions": ma + ex + hem + cw,
        "lesionBreakdown": breakdown,
    }
