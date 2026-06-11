/* ============================================================
   Octopus AI — authentification locale (test)
   ------------------------------------------------------------
   But : permettre de TESTER les profils (docteur / étudiant /
   admin) sans serveur. Session persistée dans localStorage
   (clé "octopus.session.v1").

   ⚠️  Ceci n'est PAS l'authentification de production. C'est un
   banc d'essai côté navigateur dont l'API reproduit les futurs
   endpoints FastAPI (voir docs/backend.html) :

       OctopusAuth.login(profile)   → POST /api/auth/login
       OctopusAuth.logout()         → POST /api/auth/logout
       OctopusAuth.getSession()     → GET  /api/auth/me

   `OctopusAuth.require(role)` se place en tête de chaque page
   protégée : sans session (ou avec un rôle différent), elle
   redirige vers la page d'accueil ../landing/index.html.
   ============================================================ */
(function () {
  const KEY = 'octopus.session.v1';

  /* Comptes de démonstration — alignés sur lib/db.js (users). */
  const PROFILES = {
    doctor:  { role: 'doctor',  name: 'Dr. Amina Saidi', email: 'amina.saidi@chu-rabat.ma', initials: 'DA', dept: 'Ophtalmologie' },
    student: { role: 'student', name: 'Omar Kabbaj',      email: 'omar.k@um6p-edu.ma',       initials: 'OK', dept: 'Médecine M5' },
    admin:   { role: 'admin',   name: 'Mehdi El Otmani',  email: 'm.otmani@octopus.ai',      initials: 'ME', dept: 'Plateforme' },
  };

  function getSession() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function login(profileKey, overrides) {
    const base = PROFILES[profileKey];
    if (!base) throw new Error('Profil inconnu : ' + profileKey);
    const session = Object.assign({}, base, overrides || {}, { signedInAt: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(session));
    return session;
  }

  function logout() {
    localStorage.removeItem(KEY);
  }

  /* À appeler avant le rendu d'une page protégée.
     - require()          → exige une session, quel que soit le rôle
     - require('doctor')  → exige une session avec ce rôle précis
     Redirige vers la landing avec ?required=<role> pour présélectionner
     la bonne carte de profil. Retourne la session si elle est valide. */
  function require(role) {
    const session = getSession();
    if (session && (!role || session.role === role)) return session;
    const q = role ? '?required=' + encodeURIComponent(role) : '';
    location.replace('../landing/index.html' + q);
    return null;
  }

  window.OctopusAuth = { PROFILES, getSession, login, logout, require };
})();
