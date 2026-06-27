"""Inférence IA — point d'intégration du vrai modèle.

Deux modes :
  • PRODUCTION : si un modèle ONNX est présent (variable OCTOPUS_MODEL pointant
    vers un .onnx) ET onnxruntime installé, on l'utilise sur l'image fournie.
  • DÉMO (défaut) : simulation déterministe par identifiant (FNV-1a + LCG),
    miroir exact de infer() dans lib/db.js → résultats stables sans GPU.

Pour brancher PyTorch à la place d'ONNX : remplacer _predict_real() par un
appel au service GPU et renvoyer le même dict {grade, conf, av, lesions,
lesionBreakdown}. Aucune autre couche n'a besoin de changer.
"""
import os

MODEL_PATH = os.getenv("OCTOPUS_MODEL")   # ex. /opt/octopus/models/fundus-grade-v4.2.1.onnx
_session = None


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


def _breakdown(grade, r):
    ma = 0 if grade == 0 else round(r() * grade * 2)
    ex = (0 if grade == 0 else round(r())) if grade <= 1 else round(r() * 2)
    hem = round(2 + r() * 4) if grade >= 3 else 0
    cw = round(r() * 2) if (grade >= 3 and r() > 0.6) else 0
    return {"ma": ma, "ex": ex, "hem": hem, "cw": cw}


def _predict_sim(seed_str: str) -> dict:
    """Simulation déterministe (défaut, sans GPU)."""
    r = _rng(_hash(seed_str))
    roll = r()
    grade = 0 if roll < 0.34 else 1 if roll < 0.55 else 2 if roll < 0.78 else 3 if roll < 0.93 else 4
    conf = round((78 + r() * 19) * 10) / 10
    av = round((0.95 + r() * 0.85) * 100) / 100
    bd = _breakdown(grade, r)
    return {"grade": grade, "conf": conf, "av": av,
            "lesions": sum(bd.values()), "lesionBreakdown": bd}


def _load_session():
    """Charge le modèle ONNX une seule fois (lazy)."""
    global _session
    if _session is not None:
        return _session
    if not MODEL_PATH or not os.path.exists(MODEL_PATH):
        return None
    try:
        import onnxruntime as ort  # dépendance optionnelle
        _session = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])
        return _session
    except Exception as e:  # pragma: no cover
        print(f"[inference] modèle ONNX indisponible ({e}); bascule en simulation.")
        return None


def _predict_real(image_bytes: bytes, seed_str: str) -> dict:
    """Inférence réelle sur l'image (ONNX). Pré-traitement CLAHE/resize à
    implémenter selon le modèle ; ici on illustre le flux complet."""
    sess = _load_session()
    if sess is None or not image_bytes:
        return _predict_sim(seed_str)
    try:
        import numpy as np
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((512, 512))
        x = (np.asarray(img, dtype="float32") / 255.0).transpose(2, 0, 1)[None]
        out = sess.run(None, {sess.get_inputs()[0].name: x})[0][0]
        probs = _softmax(out)
        grade = int(probs.argmax())
        conf = round(float(probs[grade]) * 100, 1)
        r = _rng(_hash(seed_str))
        av = round((0.95 + r() * 0.85) * 100) / 100
        bd = _breakdown(grade, r)
        return {"grade": grade, "conf": conf, "av": av,
                "lesions": sum(bd.values()), "lesionBreakdown": bd}
    except Exception as e:  # pragma: no cover
        print(f"[inference] échec inférence réelle ({e}); bascule en simulation.")
        return _predict_sim(seed_str)


def _softmax(v):
    import numpy as np
    e = np.exp(v - np.max(v))
    return e / e.sum()


def infer(seed_str: str, image_bytes: bytes | None = None) -> dict:
    """Façade unique appelée par les routes.
    image_bytes fourni → tente le vrai modèle ; sinon simulation déterministe."""
    if image_bytes and MODEL_PATH:
        return _predict_real(image_bytes, seed_str)
    return _predict_sim(seed_str)
