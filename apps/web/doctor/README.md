# Doctor — Clinical Diagnosis surface

The reading-room surface for **Dr. Amina** and other ophthalmologists. Mirrors a clinical PACS workstation: queue on the left, dark-canvas image viewer in the middle, AI analysis + report draft on the right.

## What this kit demonstrates

- **Reading queue** with thumbnails, severity pills, AI confidence per case
- **Dark-canvas image viewer** — fundus photograph with togglable overlays:
  - Grad-CAM lesion heatmap (magenta)
  - Vessel segmentation (cyan)
  - Optic disc / cup contour
  - Lesion bounding boxes
- **Floating tool palette** (zoom, overlay toggles, measurement) — semi-transparent + backdrop blur, only used in the dark canvas
- **AI analysis panel** — full ETDRS probability distribution, model version pin
- **Vessel morphology card** — A:V ratio, tortuosity, fractal dimension, mask Dice
- **Lesion detection breakdown** by lesion type with counts
- **Report builder** — pre-populated narrative based on grade + counts; sign-and-export action; second-opinion request
- **Live click-thru** between cases (click a case in the left list to load it)

## Components

| File | What's in it |
|---|---|
| `index.html` | Page shell, loads React + tokens |
| `app.jsx` | All views — DoctorRail, CaseList, StudyViewer, root App |
| `app.css` | Doctor-only layout (study split, dark canvas, panels) |
| `../_shared.jsx` | Logo, Icon, RailItem, RailUser, TopBar, Pill, SeverityBar |
| `../_shell.css` | App shell chrome shared with Student & Admin |
