# Admin — Platform surface

Operations console for platform owners. Three primary views, switchable from the rail.

## What this kit demonstrates

- **Users &amp; access** — invite/approve flow, role pills (doctor / student / admin), department, case-count, last-active, status. Tabs filter by role.
- **Case datasets** — card grid; each shows ID, type, license, grade distribution stacked-bar (uses the same Grade 0–4 palette as the doctor surface), ingest status (ready / review / ingest), and ingest date.
- **Model registry** — versioned table (production / staging), test metric, params, framework. Below: inference volume sparkline, latency, drift-alert count.

## Components

| File | What's in it |
|---|---|
| `index.html` | Shell |
| `app.jsx` | AdminRail, UsersView, DatasetsView, ModelsView, root App |
| `app.css` | Page header, stat cards, table, dataset grid, status pills |
| `../_shared.jsx` | Logo, Icon, RailItem, RailUser, TopBar, Pill |
