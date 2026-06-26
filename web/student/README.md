# Student — Learning surface

Case-based learning environment for medical students and residents.

## What this kit demonstrates

- **Case simulator** — 4-step flow (Brief → Findings → Grade → Debrief) on a single fundus case
  - Step 2: students tick clinical findings present in the image
  - Step 3: students assign an ETDRS grade (0–4)
  - Step 4: ground-truth reveal — over-calls / misses highlighted, expert reasoning shown, AI heatmap appears as visual scaffold
- **Performance dashboard** with KPIs, accuracy-by-grade, and a confusion matrix
- **Library / quiz** placeholders — only the simulator and dashboard are full-fidelity in this kit (per the brief: replicate, don't invent)

## Components

| File | What's in it |
|---|---|
| `index.html` | Shell, loads React + tokens |
| `app.jsx` | StudentRail, CaseSimulator, ProgressDash, root App |
| `app.css` | Student-only layout (sim flow, findings list, confusion matrix) |
| `../_shared.jsx` | Logo, Icon, RailItem, RailUser, TopBar, Pill, SeverityBar |
