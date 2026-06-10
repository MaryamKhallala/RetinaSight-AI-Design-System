/* Settings surface — shared by Doctor, Student, Admin profiles.
   Collapsible sidebar (open/close), user chip pinned to the bottom.
   Nav: Réglages (accordion hub) · RD (upload) · Segmentation (eye + report).
   Open with ?profile=doctor|student|admin to scope visible items. */

const { useState, useEffect } = React;

const PROFILES = {
  doctor:  { name: 'Dr. Amina Saidi',  email: 'amina.saidi@chu-rabat.ma', role: 'doctor',  initials: 'DA', dept: 'Ophtalmologie' },
  student: { name: 'Omar Kabbaj',       email: 'omar.k@um6p-edu.ma',       role: 'student', initials: 'OK', dept: 'Médecine M5' },
  admin:   { name: 'Mehdi El Otmani',   email: 'm.otmani@octopus.ai',      role: 'admin',   initials: 'ME', dept: 'Plateforme' },
};

const params = new URLSearchParams(location.search);
const PROFILE_KEY = params.get('profile') || 'doctor';
const PROFILE = PROFILES[PROFILE_KEY] || PROFILES.doctor;

const LANG = (window.octopusI18n && window.octopusI18n.getLang()) || 'fr';
const L = (fr, en) => (LANG === 'en' ? en : fr);
const ROLE_LABEL = {
  doctor:  L('Ophtalmologiste', 'Ophthalmologist'),
  student: L('Étudiant · M5', 'Student · M5'),
  admin:   L('Administrateur', 'Administrator'),
};

/* When rendered inside an accordion panel, Section drops its own header
   (the accordion button already supplies the title + subtitle). */
const BareCtx = React.createContext(false);

/* ---------- shared primitives ---------- */
const Row = ({ label, hint, children }) => (
  <div className="set-row">
    <div className="set-row-label">
      <div className="lbl">{label}</div>
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
    <div className="set-row-control">{children}</div>
  </div>
);

const Section = ({ eyebrow, title, lead, children }) => {
  const bare = React.useContext(BareCtx);
  if (bare) return <div className="set-card bare">{children}</div>;
  return (
    <section className="set-section">
      <div className="set-section-head">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        {title ? <h2>{title}</h2> : null}
        {lead ? <p className="lead">{lead}</p> : null}
      </div>
      <div className="set-card">{children}</div>
    </section>
  );
};

const Toggle = ({ on, onChange }) => (
  <button className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on}>
    <span className="thumb"/>
  </button>
);

/* ---------- ACCORDION ---------- */
function Accordion({ items }) {
  const [open, setOpen] = useState(() => items.length ? [items[0].id] : []);
  const toggle = (id) => setOpen(o => o.includes(id) ? o.filter(x => x !== id) : [...o, id]);
  return (
    <div className="acc-list">
      {items.map(it => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id} className={`acc-item ${isOpen ? 'open' : ''}`}>
            <button className="acc-head" onClick={() => toggle(it.id)} aria-expanded={isOpen}>
              <span className="acc-ico"><Icon name={it.icon} /></span>
              <span className="acc-text">
                <span className="acc-title">{it.title}</span>
                <span className="acc-sub">{it.subtitle}</span>
              </span>
              {it.badge ? <span className="acc-badge mono">{it.badge}</span> : null}
              <span className="acc-chevron" aria-hidden="true">{isOpen ? '–' : '+'}</span>
            </button>
            {isOpen && (
              <div className="acc-body">
                <BareCtx.Provider value={true}>{it.render()}</BareCtx.Provider>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- LANGUE ---------- */
function LangSection() {
  const cur = (window.octopusI18n && window.octopusI18n.getLang()) || 'fr';
  const setLang = (l) => window.octopusI18n && window.octopusI18n.setLang(l);
  return (
    <Section>
      <Row label={L('Langue de l\u2019interface', 'Interface language')} hint={L('Affecte tous les menus, libellés et contenus produit.', 'Affects every menu, label and product copy string.')}>
        <div className="row" style={{ gap: 8 }}>
          <button className={`btn ${cur === 'fr' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLang('fr')}>🇫🇷 Français</button>
          <button className={`btn ${cur === 'en' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLang('en')}>🇬🇧 English</button>
        </div>
      </Row>
    </Section>
  );
}

/* ---------- COMPTE ---------- */
function AccountSection() {
  const [pwd, setPwd] = useState({ cur: '', n1: '', n2: '' });
  const ok = pwd.n1.length >= 12 && pwd.n1 === pwd.n2 && pwd.cur.length > 0;
  return (
    <Section>
      <Row label={L('Adresse e-mail', 'Email')} hint={L('Utilisée pour la connexion. Contactez votre administrateur pour la modifier.', 'Used for sign-in. Contact your administrator to change.')}>
        <input className="set-input" defaultValue={PROFILE.email} disabled />
      </Row>
      <Row label={L('Nom affiché', 'Display name')}>
        <input className="set-input" defaultValue={PROFILE.name} />
      </Row>

      <div className="set-divider" />

      <Row label={L('Mot de passe actuel', 'Current password')} hint={L('Requis pour confirmer tout changement.', 'Required to confirm any change.')}>
        <input className="set-input" type="password" placeholder="••••••••" value={pwd.cur} onChange={e => setPwd({ ...pwd, cur: e.target.value })}/>
      </Row>
      <Row label={L('Nouveau mot de passe', 'New password')} hint={L('Minimum 12 caractères, avec un chiffre et un symbole.', 'Minimum 12 characters, with a number and a symbol.')}>
        <input className="set-input" type="password" placeholder="••••••••" value={pwd.n1} onChange={e => setPwd({ ...pwd, n1: e.target.value })}/>
      </Row>
      <Row label={L('Confirmer le mot de passe', 'Confirm new password')}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input className="set-input" type="password" placeholder="••••••••" value={pwd.n2} onChange={e => setPwd({ ...pwd, n2: e.target.value })}/>
          {pwd.n1 && pwd.n2 && (
            <span className="mono" style={{ fontSize: 11, color: pwd.n1 === pwd.n2 ? 'var(--rs-grade-0)' : 'var(--rs-grade-4)' }}>
              {pwd.n1 === pwd.n2 ? L('● correspond', '● matches') : L('● ne correspond pas', '● mismatch')}
            </span>
          )}
        </div>
      </Row>
      <div className="set-row">
        <div></div>
        <button className="btn btn-primary" disabled={!ok}><Icon name="key" /> {L('Changer le mot de passe', 'Update password')}</button>
      </div>

      <div className="set-divider" />

      <Row label={L('Double authentification (2FA)', 'Two-factor authentication')} hint={L('Obligatoire pour les profils docteur et admin (politique CEI).', 'Required for doctor and admin profiles by IRB policy.')}>
        <div className="row" style={{ gap: 12 }}>
          <span className="status status-active"><span className="dot"/>{L('activée · application', 'enabled · authenticator app')}</span>
          <button className="btn btn-secondary">{L('Reconfigurer', 'Reconfigure')}</button>
        </div>
      </Row>
      <Row label={L('Sessions actives', 'Active sessions')} hint={L('Déconnexion automatique après 30 min d\u2019inactivité.', 'Auto sign-out after 30 min of inactivity.')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="session-row">
            <div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>Chrome 138 · macOS · Rabat, MA</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>{L('cet appareil', 'this device')} · 192.168.10.42</div>
            </div>
            <span className="status status-active"><span className="dot"/>{L('maintenant', 'now')}</span>
          </div>
          <div className="session-row">
            <div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>Safari iOS · iPhone</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>{L('il y a 4 heures', '4 hours ago')}</div>
            </div>
            <button className="btn btn-ghost">{L('Révoquer', 'Revoke')}</button>
          </div>
        </div>
      </Row>
    </Section>
  );
}

/* ---------- MODÈLES ---------- */
const MODELS = [
  { id: 'fundus-grade-v4.2.1', name: 'fundus-grade-v4.2.1', task: 'DR grading',          metric: 'AUC 0.987', latency: '240 ms', size: '24M', status: 'production', recommended: true },
  { id: 'fundus-grade-v4.3.0-rc', name: 'fundus-grade-v4.3.0-rc', task: 'DR grading',    metric: 'AUC 0.991', latency: '380 ms', size: '38M', status: 'staging' },
  { id: 'vessel-seg-v2.1',    name: 'vessel-seg-v2.1',    task: 'Vessel segmentation', metric: 'Dice 0.872', latency: '180 ms', size: '11M', status: 'production' },
  { id: 'lesion-detect-v1.8', name: 'lesion-detect-v1.8', task: 'Lesion detection',    metric: 'mAP 0.71',   latency: '320 ms', size: '46M', status: 'production' },
];

function ModelsSection() {
  const [primary, setPrimary] = useState('fundus-grade-v4.2.1');
  const [thresh, setThresh] = useState(0.75);
  const [autorun, setAutorun] = useState(true);
  const [ensemble, setEnsemble] = useState(false);
  return (
    <Section>
      <Row label={L('Modèle de grading principal', 'Primary grading model')} hint={L('Utilisé pour le grade ETDRS et le score de confiance.', 'Used for the ETDRS grade and confidence score.')}>
        <div className="model-list">
          {MODELS.filter(m => m.task === 'DR grading').map(m => (
            <button key={m.id} className={`model-card ${primary === m.id ? 'on' : ''}`} onClick={() => setPrimary(m.id)}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)', marginTop: 2 }}>{m.metric} · {m.size} params · {m.latency}</div>
                </div>
                <span className={`status status-${m.status === 'production' ? 'active' : 'pending'}`}><span className="dot"/>{m.status}</span>
              </div>
              {m.recommended && <span className="reco-badge mono">{L('Recommandé', 'Recommended')}</span>}
            </button>
          ))}
        </div>
      </Row>
      <div className="set-divider" />
      <Row label={L('Modèles auxiliaires', 'Auxiliary models')} hint={L('Invoqués sur chaque image. Désactivez pour réduire le coût.', 'Run on every image. Disable to reduce cost.')}>
        <div className="aux-list">
          {MODELS.filter(m => m.task !== 'DR grading').map(m => (
            <label key={m.id} className="aux-row">
              <input type="checkbox" defaultChecked />
              <div>
                <div className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{m.name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>{m.task} · {m.metric}</div>
              </div>
            </label>
          ))}
        </div>
      </Row>
      <div className="set-divider" />
      <Row label={L('Seuil de confiance (auto-signalement)', 'Auto-flag confidence threshold')} hint={L(`Les cas grade ≥ 2 et confiance ≥ ${Math.round(thresh*100)}% sont routés en urgence.`, `Cases grade ≥ 2 and confidence ≥ ${Math.round(thresh*100)}% are routed as urgent.`)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
          <input type="range" min="0.5" max="0.99" step="0.01" value={thresh} onChange={e => setThresh(parseFloat(e.target.value))} style={{ flex: 1, accentColor: 'var(--rs-teal-700)' }}/>
          <span className="mono" style={{ width: 56, textAlign: 'right', fontSize: 14, fontWeight: 500 }}>{(thresh * 100).toFixed(0)}%</span>
        </div>
      </Row>
      <Row label={L('Analyse auto au téléversement', 'Auto-run on upload')}>
        <Toggle on={autorun} onChange={setAutorun}/>
      </Row>
      <Row label={L('Vote d\u2019ensemble (3 modèles)', 'Ensemble vote (3 models)')} hint={L('Plus lent (~3×) mais réduit le risque sur les cas limites.', 'Slower (~3×) but reduces tail-risk on borderline cases.')}>
        <Toggle on={ensemble} onChange={setEnsemble}/>
      </Row>
    </Section>
  );
}

/* ---------- 3D & VISUALISATION ---------- */
function VizSection() {
  const [enable3D, setEnable3D] = useState(true);
  const [renderer, setRenderer] = useState('webgl');
  const [overlays, setOverlays] = useState({ heatmap: true, vessels: true, disc: false, boxes: false });
  const [colormap, setColormap] = useState('magma');
  return (
    <Section>
      <Row label={L('Exploration OCT 3D', '3D OCT exploration')} hint={L('Visualiseur volumétrique des piles B-scan OCT. Nécessite WebGL.', 'Volumetric viewer for OCT B-scan stacks. Requires WebGL.')}>
        <Toggle on={enable3D} onChange={setEnable3D} />
      </Row>
      <Row label={L('Moteur de rendu', 'Renderer')} hint={L('WebGPU est plus rapide mais expérimental.', 'WebGPU is faster but experimental.')}>
        <div className="seg">
          {['webgl','webgpu'].map(r => (
            <button key={r} className={`seg-btn ${renderer === r ? 'on' : ''}`} disabled={!enable3D} onClick={() => setRenderer(r)}>
              {r === 'webgl' ? 'WebGL 2.0' : 'WebGPU'}
              {r === 'webgpu' && <span className="mono badge">beta</span>}
            </button>
          ))}
        </div>
      </Row>
      <Row label={L('Colormap du volume', 'Volume colormap')}>
        <div className="cm-grid">
          {[
            { k:'magma',  s:['#000','#3D1B5A','#9F2A63','#E45A4F','#FFA873','#FFE89A'] },
            { k:'viridis',s:['#440154','#3F4788','#287D8E','#1F9E89','#5BC962','#FDE725'] },
            { k:'gray',   s:['#000','#333','#666','#999','#CCC','#FFF'] },
            { k:'plasma', s:['#0D0887','#5302A3','#8B0AA5','#B83289','#DB5C68','#F0F921'] },
          ].map(cm => (
            <button key={cm.k} className={`cm-btn ${colormap === cm.k ? 'on' : ''}`} onClick={() => setColormap(cm.k)}>
              <div className="cm-strip">{cm.s.map((c, i) => <span key={i} style={{ background: c }}/>)}</div>
              <span className="mono">{cm.k}</span>
            </button>
          ))}
        </div>
      </Row>
      <div className="set-divider" />
      <Row label={L('Overlays par défaut', 'Default overlays')} hint={L('Overlays IA visibles à l\u2019ouverture d\u2019un cas.', 'AI overlays visible when opening a case.')}>
        <div className="ovl-grid">
          {[
            { k:'heatmap', l:L('Carte de chaleur Grad-CAM','Grad-CAM heatmap'),  c:'magenta' },
            { k:'vessels', l:L('Segmentation vasculaire','Vessel segmentation'), c:'cyan' },
            { k:'disc',    l:L('Disque / cup optique','Optic disc / cup'),  c:'cyan' },
            { k:'boxes',   l:L('Boîtes de lésions','Lesion bounding boxes'), c:'amber' },
          ].map(o => (
            <label key={o.k} className={`ovl-row ${overlays[o.k] ? 'on' : ''}`}>
              <input type="checkbox" checked={overlays[o.k]} onChange={() => setOverlays({ ...overlays, [o.k]: !overlays[o.k] })}/>
              <span className={`ovl-swatch ovl-${o.c}`}/>
              <span>{o.l}</span>
            </label>
          ))}
        </div>
      </Row>
    </Section>
  );
}

/* ---------- JEUX DE DONNÉES ---------- */
function DatasetsSection() {
  const [paths, setPaths] = useState({
    primary: '/mnt/octopus/datasets/chu-rabat-q2-2026',
    cache: '/var/cache/octopus/inference',
    models: '/opt/octopus/models',
    annotations: 's3://octopus-anno/2026/',
  });
  return (
    <Section>
      <Row label={L('Racine des données', 'Primary dataset root')} hint={L('Où sont écrits les nouveaux téléversements de fond d\u2019œil.', 'Where new fundus uploads are written.')}>
        <div className="path-input">
          <input className="set-input mono" value={paths.primary} onChange={e => setPaths({ ...paths, primary: e.target.value })}/>
          <button className="btn btn-secondary"><Icon name="folder" size={14}/> {L('Parcourir', 'Browse')}</button>
        </div>
        <div className="path-meta mono">
          <span className="status status-active"><span className="dot"/>{L('monté', 'mounted')}</span>
          <span>· 2.4 To / 8.0 To</span>
          <span>· {L('dernière écriture il y a 4 min', 'last write 4 min ago')}</span>
        </div>
      </Row>
      <Row label={L('Jeux de données use-case', 'Use-case datasets')} hint={L('Sous-ensembles pour la bibliothèque étudiant et l\u2019assurance qualité.', 'Subsets powering the student library and QA.')}>
        <div className="uc-list">
          {[
            { id:'uc-screening', label:L('Dépistage annuel (Grade 0-2)','Annual screening (Grade 0-2)'), path:'/mnt/octopus/uc/screening', n:L('1 284 cas','1,284 cases') },
            { id:'uc-referral',  label:L('Formation au référencement urgent','Urgent referral training'), path:'/mnt/octopus/uc/referral',  n:L('342 cas','342 cases') },
            { id:'uc-followup',  label:L('Suivi post-laser','Post-laser follow-up'), path:'/mnt/octopus/uc/followup',  n:L('587 cas','587 cases') },
            { id:'uc-rare',      label:L('Atlas des présentations rares','Rare presentations atlas'), path:'s3://octopus-rare/2026/', n:L('118 cas','118 cases') },
          ].map(uc => (
            <div key={uc.id} className="uc-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{uc.label}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>{uc.path} · {uc.n}</div>
              </div>
              <button className="btn btn-ghost">{L('Modifier', 'Edit path')}</button>
            </div>
          ))}
          <button className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}><Icon name="plus" /> {L('Ajouter un jeu de données', 'Add use-case dataset')}</button>
        </div>
      </Row>
      <div className="set-divider" />
      <Row label={L('Cache d\u2019inférence', 'Inference cache root')}>
        <input className="set-input mono" value={paths.cache} onChange={e => setPaths({ ...paths, cache: e.target.value })}/>
      </Row>
      <Row label={L('Poids des modèles', 'Model weights root')}>
        <input className="set-input mono" value={paths.models} onChange={e => setPaths({ ...paths, models: e.target.value })}/>
      </Row>
      <Row label={L('Bucket d\u2019annotations (S3)', 'Annotation bucket (S3)')}>
        <input className="set-input mono" value={paths.annotations} onChange={e => setPaths({ ...paths, annotations: e.target.value })}/>
      </Row>
    </Section>
  );
}

/* ---------- THÈME ---------- */
function ThemeSection() {
  const [mode, setMode] = useState('light');
  const [accent, setAccent] = useState('teal');
  const [density, setDensity] = useState('comfortable');
  const [reduced, setReduced] = useState(false);
  const [fontScale, setFontScale] = useState(100);
  const themes = [
    { k:'light',   l:L('Plein jour','Daylight'),       desc:L('Par défaut — papier blanc chaud.','Default — warm off-white paper.'), sw:['#F8F5F1','#FFFFFF','#1F8A8A'] },
    { k:'reading', l:L('Salle de lecture','Reading room'), desc:L('Surfaces plus sombres pour les longues sessions.','Dimmer surfaces for long sessions.'), sw:['#EAE6DF','#F5F1EA','#1F8A8A'] },
    { k:'dark',    l:L('Canvas sombre','Dark canvas'),  desc:L('Interface sombre pour les salles d\u2019images.','Dark UI for image rooms.'), sw:['#10171D','#1A2228','#7BC9C9'] },
    { k:'system',  l:L('Système','Match system'),       desc:L('Suit la préférence de l\u2019OS.','Follows OS preference.'), sw:['#F8F5F1','#10171D','#1F8A8A'] },
  ];
  return (
    <Section>
      <Row label={L('Thème', 'Theme')}>
        <div className="theme-grid">
          {themes.map(t => (
            <button key={t.k} className={`theme-card ${mode === t.k ? 'on' : ''}`} onClick={() => setMode(t.k)}>
              <div className="theme-preview">{t.sw.map((c, i) => <span key={i} style={{ background: c }}/>)}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{t.l}</div>
                <div style={{ fontSize: 11, color: 'var(--rs-fg-muted)', marginTop: 2 }}>{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </Row>
      <Row label={L('Couleur d\u2019accent', 'Accent color')} hint={L('Les couleurs de grade ne sont pas affectées.', 'Severity-grade colors are not affected.')}>
        <div className="seg">
          {[
            { k:'teal',   c:'var(--rs-teal-700)' },
            { k:'indigo', c:'#3D5FB8' },
            { k:'plum',   c:'#7E3F8C' },
            { k:'forest', c:'#2E7C5C' },
          ].map(a => (
            <button key={a.k} className={`accent-btn ${accent === a.k ? 'on' : ''}`} onClick={() => setAccent(a.k)}>
              <span className="accent-sw" style={{ background: a.c }}/>
              <span>{a.k}</span>
            </button>
          ))}
        </div>
      </Row>
      <div className="set-divider" />
      <Row label={L('Densité', 'Density')}>
        <div className="seg">
          {[['compact',L('compact','compact')], ['comfortable',L('confortable','comfortable')], ['spacious',L('spacieux','spacious')]].map(([k, lbl]) => (
            <button key={k} className={`seg-btn ${density === k ? 'on' : ''}`} onClick={() => setDensity(k)}>{lbl}</button>
          ))}
        </div>
      </Row>
      <Row label={L('Échelle de police', 'Font scale')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
          <input type="range" min="90" max="120" step="5" value={fontScale} onChange={e => setFontScale(parseInt(e.target.value))} style={{ flex: 1, accentColor: 'var(--rs-teal-700)' }}/>
          <span className="mono" style={{ width: 56, textAlign: 'right', fontSize: 14, fontWeight: 500 }}>{fontScale}%</span>
        </div>
      </Row>
      <Row label={L('Réduire les animations', 'Reduce motion')}>
        <Toggle on={reduced} onChange={setReduced}/>
      </Row>
    </Section>
  );
}

/* ---------- NOTIFICATIONS ---------- */
function NotifySection() {
  return (
    <Section>
      <Row label={L('Cas urgent qui m\u2019est attribué', 'Urgent case routed to me')} hint={L('Grade 3+ ou RD proliférante à contresigner.', 'Grade 3+ or proliferative DR awaiting countersign.')}>
        <div className="row" style={{ gap: 14 }}>
          <label><input type="checkbox" defaultChecked/> {L('in-app', 'in-app')}</label>
          <label><input type="checkbox" defaultChecked/> e-mail</label>
          <label><input type="checkbox"/> SMS</label>
        </div>
      </Row>
      <Row label={L('Demande de 2ᵉ avis', 'Second-opinion request')}>
        <div className="row" style={{ gap: 14 }}>
          <label><input type="checkbox" defaultChecked/> {L('in-app', 'in-app')}</label>
          <label><input type="checkbox" defaultChecked/> e-mail</label>
        </div>
      </Row>
      <Row label={L('Résumé hebdomadaire de performance', 'Weekly performance summary')} hint={L('Chaque lundi à 08:00.', 'Every Monday at 08:00.')}>
        <Toggle on={true} onChange={() => {}}/>
      </Row>
      <Row label={L('Mise à jour de modèle disponible', 'Model update available')}>
        <Toggle on={true} onChange={() => {}}/>
      </Row>
    </Section>
  );
}

/* ---------- MONITORING ---------- */
function MonitorSection() {
  const [enabled, setEnabled] = useState(true);
  const [dsn, setDsn] = useState('https://abc123@o123456.ingest.sentry.io/4506789012');
  const [env, setEnv] = useState('staging');
  const [perf, setPerf] = useState(true);
  const [replay, setReplay] = useState(true);
  return (
    <Section>
      <Row label={L('Activer Sentry', 'Enable Sentry')} hint={L('Sinon, les erreurs ne vont qu\u2019à la console.', 'Otherwise errors are only logged to the console.')}>
        <Toggle on={enabled} onChange={setEnabled}/>
      </Row>
      <Row label="DSN" hint={<>{L('Depuis votre projet Sentry —', 'From your Sentry project —')} <span className="mono">Settings → Client Keys (DSN)</span>.</>}>
        <input className="set-input mono" value={dsn} onChange={e => setDsn(e.target.value)} disabled={!enabled}/>
      </Row>
      <Row label={L('Environnement', 'Environment')}>
        <div className="seg">
          {['development','staging','production'].map(e => (
            <button key={e} className={`seg-btn ${env === e ? 'on' : ''}`} onClick={() => setEnv(e)} disabled={!enabled}>{e}</button>
          ))}
        </div>
      </Row>
      <Row label={L('Traçage de performance', 'Performance tracing')} hint={L('Capture les latences p99 (inférence, upload, export).', 'Captures p99 latencies (inference, upload, export).')}>
        <Toggle on={perf} onChange={setPerf}/>
      </Row>
      <Row label={L('Replay de session sur erreur', 'Session replay on error')} hint={L('Texte patient et images masqués automatiquement.', 'Patient text and images are always masked.')}>
        <Toggle on={replay} onChange={setReplay}/>
      </Row>
      <div className="set-divider" />
      <div className="monitor-card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="eyebrow">{L('État en direct · 24 dernières h', 'Live status · last 24h')}</div>
            <h4 style={{ margin: '6px 0 0', fontSize: 16 }}>{L('Tous les systèmes opérationnels', 'All systems operational')}</h4>
          </div>
          <span className="status status-active"><span className="dot"/>{L('sain', 'healthy')}</span>
        </div>
        <div className="monitor-stats">
          <div><span className="eyebrow">{L('Erreurs', 'Errors')}</span><span className="v mono">3</span><span className="trend mono">−42% / 24h</span></div>
          <div><span className="eyebrow">{L('Sessions sans crash', 'Crash-free sessions')}</span><span className="v mono">99.97%</span><span className="trend mono">≥ 99.9%</span></div>
          <div><span className="eyebrow">{L('Inférence p99', 'p99 inference')}</span><span className="v mono">412 ms</span><span className="trend mono">budget 800 ms</span></div>
          <div><span className="eyebrow">{L('Replays', 'Replays captured')}</span><span className="v mono">17</span><span className="trend mono">{L('PHI masqué', 'PHI scrubbed')}</span></div>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
        <button className="btn btn-secondary"><Icon name="bug" size={14}/> {L('Envoyer un test', 'Send test event')}</button>
        <button className="btn btn-secondary"><Icon name="globe" size={14}/> {L('Ouvrir Sentry', 'Open Sentry')}</button>
      </div>
    </Section>
  );
}

/* ---------- INTÉGRATIONS ---------- */
function IntegrationsSection() {
  const items = [
    { id:'fhir',  name:'EHR · FHIR R5',          desc:L('Renvoie les rapports vers le DPI de l\u2019hôpital.','Push reports back to the hospital EHR.'), status:'connected', meta:L('CHU Rabat · sync il y a 4 min','CHU Rabat · last sync 4 min ago') },
    { id:'dicom', name:'DICOM worklist',         desc:L('Récupère les examens planifiés du PACS.','Pull scheduled exams from the PACS.'), status:'connected', meta:'rabat-pacs.local:104' },
    { id:'okta',  name:'Okta SSO',               desc:L('Authentification unique du personnel.','Single sign-on for staff.'), status:'connected', meta:'um6p-edu.ma · SAML' },
    { id:'slack', name:'Alertes Slack',          desc:L('Notifications de cas urgents vers un canal.','Urgent-case notifications to a channel.'), status:'disconnected', meta:'—' },
    { id:'twilio',name:'Twilio SMS',             desc:L('Rappels de rendez-vous par SMS.','Appointment reminders by SMS.'), status:'pending', meta:L('en attente d\u2019autorisation','awaiting approval') },
  ];
  const statusLabel = { connected: L('connecté','connected'), disconnected: L('déconnecté','disconnected'), pending: L('en attente','pending') };
  return (
    <Section>
      <div className="integ-list">
        {items.map(i => (
          <div key={i.id} className="integ-row">
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{i.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--rs-ink-700)', marginTop: 2 }}>{i.desc}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)', marginTop: 4 }}>{i.meta}</div>
            </div>
            <span className={`status status-${i.status === 'connected' ? 'active' : i.status === 'pending' ? 'pending' : 'ingest'}`}>
              <span className="dot"/>{statusLabel[i.status]}
            </span>
            <button className="btn btn-secondary">{i.status === 'connected' ? L('Configurer','Configure') : L('Connecter','Connect')}</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ============================================================
   RÉGLAGES — hub: accordion of clickable buttons
   ============================================================ */
function SettingsHub() {
  const all = [
    { id:'account',  icon:'user',     title:L('Compte & sécurité','Account & security'), subtitle:L('E-mail, mot de passe, 2FA, sessions','Email, password, 2FA, sessions'), render:() => <AccountSection/>, roles:['doctor','student','admin'] },
    { id:'models',   icon:'cpu',      title:L('Modèles IA','AI models'),                 subtitle:L('Modèle principal, auxiliaires, seuils','Primary, auxiliary, thresholds'), render:() => <ModelsSection/>, roles:['doctor','admin'] },
    { id:'viz',      icon:'cube',     title:L('3D & visualisation','3D & visualization'),subtitle:L('OCT 3D, moteur, overlays','OCT 3D, renderer, overlays'), render:() => <VizSection/>, roles:['doctor','student','admin'] },
    { id:'datasets', icon:'database', title:L('Jeux de données','Datasets'),             subtitle:L('Chemins, use-cases, cache','Paths, use-cases, cache'), render:() => <DatasetsSection/>, roles:['doctor','student','admin'] },
    { id:'theme',    icon:'palette',  title:L('Thème & affichage','Theme & display'),    subtitle:L('Thème, accent, densité, police','Theme, accent, density, font'), render:() => <ThemeSection/>, roles:['doctor','student','admin'] },
    { id:'notify',   icon:'bell2',    title:'Notifications',                             subtitle:L('Canaux in-app, e-mail, SMS','In-app, email, SMS channels'), render:() => <NotifySection/>, roles:['doctor','student','admin'] },
    { id:'monitor',  icon:'bug',      title:'Monitoring',                                subtitle:L('Sentry, traçage, replay','Sentry, tracing, replay'), render:() => <MonitorSection/>, roles:['doctor','student','admin'] },
    { id:'integrate',icon:'link',     title:L('Intégrations','Integrations'),            subtitle:L('FHIR, DICOM, Okta, Slack','FHIR, DICOM, Okta, Slack'), render:() => <IntegrationsSection/>, roles:['doctor','admin'] },
    { id:'lang',     icon:'globe',    title:L('Langue','Language'),                      subtitle:L('Français / English','Français / English'), render:() => <LangSection/>, roles:['doctor','student','admin'] },
  ];
  const items = all.filter(i => i.roles.includes(PROFILE.role));
  return (
    <div className="hub">
      <div className="set-section-head">
        <div className="eyebrow">{L('Réglages', 'Settings')} · {ROLE_LABEL[PROFILE.role]}</div>
        <h2>{L('Préférences', 'Preferences')}</h2>
        <p className="lead">{L('Cliquez sur une catégorie pour afficher son contenu en dessous.', 'Click a category to reveal its content below.')}</p>
      </div>
      <Accordion items={items} />
    </div>
  );
}

/* ============================================================
   SIDEBAR (collapsible, user at bottom)
   ============================================================ */
function SettingsRail({ active, setActive, collapsed, onToggle }) {
  const NAV = [
    { id:'settings', icon:'sliders',  label:L('Réglages','Settings') },
    { id:'dr',       icon:'upload',   label:'DR', href:'../doctor/index.html?view=upload' },
    { id:'seg',      icon:'activity', label:'Segmentation', href:'../doctor/index.html?focus=segmentation' },
  ];
  return (
    <aside className={`set-rail ${collapsed ? 'collapsed' : ''}`}>
      <div className="set-rail-top">
        <button className="set-collapse" onClick={onToggle} title={collapsed ? L('Ouvrir','Open') : L('Réduire','Collapse')} aria-label="toggle sidebar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>
          </svg>
        </button>
        {!collapsed && (
          <a href={`../${PROFILE.role}/index.html`} className="set-back" title={L('Retour','Back')}>
            <span className="brand-dot"><Logo size={20}/></span>
            <span>Octopus</span>
          </a>
        )}
      </div>

      <nav className="set-nav">
        {NAV.map(n => n.href ? (
          <a key={n.id} href={n.href} className="set-nav-item" title={n.label}>
            <Icon name={n.icon} />
            <span className="set-nav-label">{n.label}</span>
            <span className="set-nav-ext" aria-hidden="true">→</span>
          </a>
        ) : (
          <button key={n.id} className={`set-nav-item ${active === n.id ? 'on' : ''}`} onClick={() => setActive(n.id)} title={n.label}>
            <Icon name={n.icon} />
            <span className="set-nav-label">{n.label}</span>
          </button>
        ))}
      </nav>

      <div className="set-rail-foot">
        <div className="set-user" title={`${PROFILE.name} · ${ROLE_LABEL[PROFILE.role]}`}>
          <div className="avatar">{PROFILE.initials}</div>
          <div className="who">
            <span className="n">{PROFILE.name}</span>
            <span className="r mono">{ROLE_LABEL[PROFILE.role]}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------- root ---------- */
function App() {
  const [active, setActive] = useState('settings');
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('octopus.set.rail') === '1'; } catch (e) { return false; }
  });
  const toggle = () => setCollapsed(c => {
    const n = !c;
    try { localStorage.setItem('octopus.set.rail', n ? '1' : '0'); } catch (e) {}
    return n;
  });

  useEffect(() => {
    const sec = params.get('section');
    if (sec === 'settings') setActive(sec);
  }, []);

  return (
    <div className={`set-app ${collapsed ? 'rail-collapsed' : ''}`}>
      <SettingsRail active={active} setActive={setActive} collapsed={collapsed} onToggle={toggle} />
      <main className="set-main">
        <header className="set-main-head">
          <div className="crumbs">
            <span>Octopus</span>
            <span style={{ opacity: 0.5 }}>›</span>
            <span className="now">{L('Réglages','Settings')}</span>
          </div>
          <div className="row">
            <button className="btn btn-ghost">{L('Annuler','Cancel')}</button>
            <button className="btn btn-primary"><Icon name="check"/> {L('Enregistrer','Save')}</button>
          </div>
        </header>
        <div className="set-content">
          <SettingsHub />
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
