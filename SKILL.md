---
name: octopus-design
description: Use this skill to generate well-branded interfaces and assets for Octopus AI — an intelligent retinal disease diagnosis platform — either for production code or for throwaway prototypes, mocks, and slides. Contains essential design guidelines, colors, type, fonts, brand assets, severity-grading semantics, iconography rules, copy voice, and three full UI kits (Doctor / Student / Admin) for prototyping.
user-invocable: true
---

# Octopus AI — Design Skill

Octopus AI is a multi-role clinical intelligence platform for the detection, diagnosis, and grading of diabetic retinopathy and other retinal pathologies. Three user surfaces: **Doctor** (clinical diagnosis), **Student** (case-based learning), **Admin** (platform management).

## Start here

1. **Read `README.md`** in this skill folder. It is the canonical source for product context, content fundamentals (voice, tone, casing, vibe), visual foundations (color, type, spacing, motion, hover/press, borders, shadows, radii, density), and iconography rules.
2. **Read `colors_and_type.css`.** All design tokens live there as CSS custom properties: brand teal ramp, warm graphite ink neutrals, the 5-step **severity ramp** (Grade 0 → Proliferative DR), AI overlay colors, dark-canvas family, type stack, spacing scale, radii, shadows, motion durations, focus ring.
3. **Browse the web app** in `web/{doctor,student,admin,settings}/` (entry point: `web/index.html`). Each has its own README, an `index.html` with a working interactive prototype, an `app.jsx`, and an `app.css`. Shared chrome (rail, top bar, brand mark, icons, pills, severity bars) is in `web/_shared.jsx` and `web/_shell.css`.

## Working modes

### Visual artifacts (slides, mocks, throwaway prototypes, marketing pages)

- Copy what you need from `assets/` (logos, fundus placeholders, icons) into your output folder rather than referencing across project boundaries.
- Link `colors_and_type.css` once at the top of any HTML file you produce; use the CSS vars directly. Don't invent new colors — reach for the brand teal ramp, the ink ramp, or the severity ramp first.
- For full-product mocks, lift components from a UI kit's `app.jsx` rather than authoring from scratch — they already encode spacing, type, hover/press, severity semantics, and the rail/topbar shell.
- Output static HTML files the user can open in a browser.

### Production code

- The reference frontend stack is **Next.js 14 + React 18 + TypeScript + Tailwind + Hero UI + Radix UI**. Use the CSS vars from `colors_and_type.css` as Tailwind's color theme via `tailwind.config.ts` `theme.extend.colors`.
- Become an expert in the rules in `README.md` — voice/tone, severity-as-first-class-semantic-dimension, dark-canvas convention for image rooms, no-emoji policy, density-over-whitespace, borders-as-primary-container-language.
- Re-implement the UI-kit components properly (the kits use inline JSX for editability; in production they should be Hero UI / Radix primitives styled with the same tokens).

## If invoked without specific guidance

Ask the user:

1. What surface is this for? (Doctor / Student / Admin / Marketing / Other)
2. Is this production code, or a throwaway artifact (slides, mock, prototype)?
3. Do they want strict-system fidelity, or are some rules negotiable?
4. Are there any existing screens or specs to anchor against?

Then act as an expert designer who produces HTML artifacts or production code, depending on the need.

## Critical do's and don'ts

- **DO** treat severity as the most semantically loaded dimension. Use the Grade 0–4 palette consistently and never substitute raw red.
- **DO** switch to the dark `--rs-canvas-*` family inside fundus image viewers. It is a deliberate context shift, not a theme toggle.
- **DO** use IBM Plex Mono for any number, ID, or measurement, with `font-feature-settings: "tnum","zero"`.
- **DO** keep density high — clinical tools are scanned, not browsed.
- **DON'T** use emoji anywhere — not in product, not in marketing, not in error states.
- **DON'T** use first-person plural ("we / our") in product UI. That's marketing voice.
- **DON'T** invent gradients, hand-drawn illustrations, isometric scenes, or rainbow data viz. The platform's visual restraint is a clinical-trust signal.
- **DON'T** use bouncy, springy, or scale-up motion. Short cross-fades and color shifts only.
