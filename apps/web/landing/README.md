# Landing & sign-in

Entry point for the Octopus platform. The user picks a **profile**
(doctor / student / admin), signs in, and is routed to the matching
surface (`../doctor/`, `../student/`, `../admin/`).

- Session lives in `localStorage` via `lib/auth.js` (`octopus.session.v1`)
  — a browser test bench whose API mirrors the future FastAPI
  `/api/auth/*` endpoints. Any non-empty password is accepted.
- The protected kits call `OctopusAuth.require('<role>')` at the top of
  their `index.html`; without a session (or with the wrong role) the user
  is bounced here with `?required=<role>`, which preselects the profile card.
- An existing session shows a "Continue as …" shortcut; "Log out" in any
  kit's user menu clears the session and returns here.

## Shared dependencies

| File | Provides |
| --- | --- |
| `../_shared.jsx` | Logo, Icon |
| `../../../lib/auth.js` | Session: login, logout, getSession, require |
| `../../../lib/i18n.js` | FR/EN strings |
