/* Octopus monitoring bootstrap (Sentry).
   Drop this script into any UI kit's index.html with:
     <script>window.RS_SENTRY_DSN = "https://...@sentry.io/...";</script>
     <script src="../../lib/monitoring.js"></script>
   Or in production: pass DSN via env (NEXT_PUBLIC_SENTRY_DSN) and init in app.tsx.

   Loads the Sentry browser SDK (lazy, off the critical path), starts session
   replay + performance tracing, and exposes RS.captureError / RS.captureMessage
   for the UI kits to call. No-ops if no DSN is configured. */
(function () {
  const DSN = window.RS_SENTRY_DSN || null;
  const ENV = window.RS_ENV || 'development';
  const RELEASE = window.RS_RELEASE || 'octopus@dev';

  window.RS = window.RS || {};
  window.RS.monitoring = {
    enabled: !!DSN,
    dsn: DSN,
    env: ENV,
    release: RELEASE,
  };

  // Stub API so UI kits can always call it.
  window.RS.captureError = function (err, ctx) {
    if (window.Sentry) window.Sentry.captureException(err, { extra: ctx });
    else console.error('[RS]', err, ctx);
  };
  window.RS.captureMessage = function (msg, level, ctx) {
    if (window.Sentry) window.Sentry.captureMessage(msg, { level: level || 'info', extra: ctx });
    else console.log('[RS:' + (level || 'info') + ']', msg, ctx || '');
  };
  window.RS.setUser = function (user) {
    if (window.Sentry) window.Sentry.setUser(user);
  };

  if (!DSN) return; // no-op in unconfigured environments

  const s = document.createElement('script');
  s.src = 'https://browser.sentry-cdn.com/8.7.0/bundle.tracing.replay.min.js';
  s.crossOrigin = 'anonymous';
  s.onload = function () {
    if (!window.Sentry) return;
    window.Sentry.init({
      dsn: DSN,
      environment: ENV,
      release: RELEASE,
      tracesSampleRate: ENV === 'production' ? 0.2 : 1.0,
      replaysSessionSampleRate: ENV === 'production' ? 0.1 : 0.5,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        window.Sentry.browserTracingIntegration(),
        window.Sentry.replayIntegration({
          maskAllText: true,        // PHI safety: never record patient text
          maskAllInputs: true,
          blockAllMedia: true,      // never record fundus images in replays
        }),
      ],
      // Strip likely-PHI from event payloads before they leave the browser.
      beforeSend(event) {
        try {
          const blocked = /(mrn|patient|dob|birthdate|nom|email|phone)/i;
          if (event.request && event.request.data) {
            const data = event.request.data;
            for (const k of Object.keys(data)) {
              if (blocked.test(k)) data[k] = '[scrubbed]';
            }
          }
        } catch (_) {}
        return event;
      },
    });
    console.info('[RS] Sentry initialized · ' + ENV + ' · ' + RELEASE);
  };
  document.head.appendChild(s);
})();
