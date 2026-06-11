# Settings — shared surface

A single Settings page used by all three profiles (Doctor / Student / Admin).
Open with `?profile=doctor`, `?profile=student`, or `?profile=admin` (default: doctor).
Sections shown depend on the profile's role.

## Sections

| Section | Doctor | Student | Admin | What it covers |
|---|:---:|:---:|:---:|---|
| **Account &amp; security** | ✓ | ✓ | ✓ | Email, display name, **change password** (with strength validation), 2FA, active sessions |
| **AI models** | ✓ |  | ✓ | Pick the **primary DR-grading model**, toggle auxiliary models, set the auto-flag confidence threshold, ensemble vote |
| **3D &amp; visualization** | ✓ | ✓ | ✓ | Enable **3D OCT explorer**, choose renderer (WebGL / WebGPU), volume colormap, default fundus overlays |
| **Dataset paths** | ✓ | ✓ | ✓ | Primary dataset root, **paths to use-case datasets** (screening, referral, follow-up, rare cases), inference cache, model weights, S3 annotation bucket |
| **Theme &amp; appearance** | ✓ | ✓ | ✓ | **Theme** (Daylight / Reading room / Dark canvas / Match system), accent color, density, font scale, reduce-motion |
| **Notifications** | ✓ | ✓ | ✓ | Per-channel (in-app / email / SMS) for urgent cases, second-opinion, weekly summary |
| **Monitoring &amp; logs** | ✓ | ✓ | ✓ | **Sentry** DSN + environment, performance tracing, session replay (with PHI masking), live status panel |
| **Integrations** | ✓ |  | ✓ | FHIR EHR, DICOM PACS, Okta SSO, Slack alerts, Twilio SMS |

## Files

| File | What |
|---|---|
| `index.html` | Shell — loads `lib/monitoring.js` then React |
| `app.jsx` | All sections (Account, Models, Viz, Datasets, Theme, Notify, Monitor, Integrations) |
| `app.css` | Settings-specific layout (rail, rows, toggles, segmented controls, theme/colormap pickers) |
| `../../../lib/monitoring.js` | Sentry bootstrap (no-op without DSN) |
