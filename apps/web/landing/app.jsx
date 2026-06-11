/* Landing & sign-in — entry point for the platform.
   Pick a profile (doctor / student / admin), sign in, and you are
   routed to the matching surface. Session is held by lib/auth.js
   (localStorage test bench; production swaps it for /api/auth).
   Open with ?required=doctor|student|admin to preselect a profile
   (that is what OctopusAuth.require() does when it bounces you here). */

const { useState } = React;

const LANG = (window.octopusI18n && window.octopusI18n.getLang()) || 'fr';
const L = (fr, en) => (LANG === 'en' ? en : fr);

const PROFILES = window.OctopusAuth.PROFILES;
const ROLE_META = {
  doctor: {
    icon: 'eye',
    label: L('Docteur', 'Doctor'),
    desc: L('Diagnostic clinique — file de lecture, viewer IA, rapports signés.',
            'Clinical diagnosis — reading queue, AI viewer, signed reports.'),
  },
  student: {
    icon: 'book',
    label: L('Étudiant', 'Student'),
    desc: L('Apprentissage par cas — simulateur, bibliothèque, progression.',
            'Case-based learning — simulator, library, progress.'),
  },
  admin: {
    icon: 'shield',
    label: L('Admin', 'Admin'),
    desc: L('Plateforme — utilisateurs, jeux de données, registre des modèles.',
            'Platform — users, datasets, model registry.'),
  },
};

const params = new URLSearchParams(location.search);
const REQUIRED = ROLE_META[params.get('required')] ? params.get('required') : null;

function App() {
  const existing = window.OctopusAuth.getSession();
  const [profile, setProfile] = useState(REQUIRED || (existing && existing.role) || 'doctor');
  const [email, setEmail] = useState(PROFILES[REQUIRED || (existing && existing.role) || 'doctor'].email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const pick = (key) => {
    setProfile(key);
    setEmail(PROFILES[key].email);
    setError(null);
  };

  const enter = (role) => { location.href = `../${role}/index.html`; };

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(L('Saisissez votre e-mail et votre mot de passe.', 'Enter your email and password.'));
      return;
    }
    setBusy(true);
    /* Banc d'essai : tout mot de passe non vide est accepté.
       Production : POST /api/auth/login { email, password }. */
    window.OctopusAuth.login(profile, { email: email.trim() });
    setTimeout(() => enter(profile), 350);
  };

  return (
    <div className="land">
      {/* ---- brand panel ---- */}
      <aside className="land-brand">
        <div className="land-brand-top">
          <span className="land-logo"><Logo size={34} /></span>
          <div>
            <div className="land-brand-name">Octopus</div>
            <div className="land-brand-tag mono">{L('CLINIQUE · IA', 'CLINICAL · AI')}</div>
          </div>
        </div>
        <div className="land-hero">
          <h1>{L('L’intelligence rétinienne, pour chaque rôle.', 'Retinal intelligence, for every role.')}</h1>
          <p>{L(
            'Détection, diagnostic et gradation de la rétinopathie diabétique — une plateforme, trois espaces : clinique, apprentissage, administration.',
            'Detection, diagnosis and grading of diabetic retinopathy — one platform, three surfaces: clinical, learning, administration.'
          )}</p>
        </div>
        <div className="land-fundus" aria-hidden="true">
          <img src="../../../assets/fundus-sample-1.svg" alt="" />
          <img className="ovl" src="../../../assets/fundus-sample-heatmap.svg" alt="" />
        </div>
        <div className="land-foot mono">CHU Rabat · UM6P · {L('Prototype de démonstration', 'Demo prototype')}</div>
      </aside>

      {/* ---- auth panel ---- */}
      <main className="land-auth">
        <form className="auth-card" onSubmit={submit}>
          <div className="eyebrow">{L('Connexion', 'Sign in')}</div>
          <h2>{L('Choisissez votre profil', 'Choose your profile')}</h2>

          {REQUIRED && !existing && (
            <div className="auth-notice">
              <Icon name="lock" size={14} />
              {L('Connexion requise pour accéder à cet espace.', 'Sign-in is required to access this surface.')}
            </div>
          )}

          {existing && (
            <div className="auth-resume">
              <div className="avatar">{existing.initials}</div>
              <div className="who">
                <span className="n">{existing.name}</span>
                <span className="r mono">{ROLE_META[existing.role] ? ROLE_META[existing.role].label : existing.role}</span>
              </div>
              <button type="button" className="btn-ghost" onClick={() => enter(existing.role)}>
                {L('Continuer', 'Continue')} <Icon name="arrowR" size={14} />
              </button>
            </div>
          )}

          <div className="profile-grid" role="radiogroup" aria-label={L('Profil', 'Profile')}>
            {Object.keys(ROLE_META).map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={profile === key}
                className={`profile-card ${profile === key ? 'on' : ''}`}
                onClick={() => pick(key)}
              >
                <span className="pc-icon"><Icon name={ROLE_META[key].icon} size={18} /></span>
                <span className="pc-label">{ROLE_META[key].label}</span>
                <span className="pc-desc">{ROLE_META[key].desc}</span>
              </button>
            ))}
          </div>

          <label className="auth-field">
            <span>{L('E-mail', 'Email')}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              autoComplete="username"
              spellCheck="false"
            />
          </label>
          <label className="auth-field">
            <span>{L('Mot de passe', 'Password')}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              autoComplete="current-password"
              placeholder={L('Prototype — tout mot de passe est accepté', 'Prototype — any password is accepted')}
            />
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button className="btn-primary" type="submit" disabled={busy}>
            {busy
              ? L('Connexion…', 'Signing in…')
              : `${L('Entrer comme', 'Enter as')} ${ROLE_META[profile].label}`}
            {!busy && <Icon name="arrowR" size={15} />}
          </button>

          <div className="auth-hint mono">
            {L('Compte de démo', 'Demo account')} : {PROFILES[profile].name} · {PROFILES[profile].dept}
          </div>
        </form>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
