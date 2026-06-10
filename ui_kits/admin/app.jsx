/* Admin surface — gestion utilisateurs, jeux de données, modèles, audit.
   Toutes les données proviennent de window.OctopusDB (base de test partagée). */

const { useState, useEffect } = React;
const DB = window.OctopusDB;
const T = window.t || ((k) => k);
const L = (fr, en) => (window.octopusI18n && window.octopusI18n.getLang() === 'en') ? en : fr;

const ROLE_LABEL = { doctor: L('docteur','doctor'), student: L('étudiant','student'), admin:'admin' };
const STATUS_LABEL = {
  active: L('actif','active'), pending: L('en attente','pending'),
  ready: L('prêt','ready'), review: L('en revue','review'), ingest: L('ingestion','ingest'),
  production:'production', staging:'staging',
};
function useDB() {
  const [, setTick] = useState(0);
  useEffect(() => DB.onChange(() => setTick(t => t + 1)), []);
}

/* ---------- left rail ---------- */
function AdminRail({ active, setActive, counts }) {
  return (
    <aside className="rail">
      <RailBrand subtitle={T('brand.tag.admin')} />

      <div className="rail-section">
        <div className="rail-section-label">{T('rail.section.manage')}</div>
        <RailItem icon="users"    label={T('rail.users')}    count={counts.users}    on={active === 'users'}    onClick={() => setActive('users')} />
        <RailItem icon="database" label={T('rail.datasets')} count={counts.datasets} on={active === 'datasets'} onClick={() => setActive('datasets')} />
        <RailItem icon="cpu"      label={T('rail.models')}   count={counts.models}   on={active === 'models'}   onClick={() => setActive('models')} />
        <RailItem icon="flask"    label={T('rail.annotation')} count={counts.cases} on={active === 'cases'} onClick={() => setActive('cases')} />
      </div>

      <div className="rail-section">
        <div className="rail-section-label">{T('rail.section.oversight')}</div>
        <RailItem icon="shield"   label={T('rail.audit')}     on={active === 'audit'}     onClick={() => setActive('audit')} />
        <RailItem icon="chart"    label={T('rail.analytics')} on={active === 'analytics'} onClick={() => setActive('analytics')} />
        <RailItem icon="sliders"  label={T('rail.policies')} />
      </div>

      <div className="rail-foot">
        <RailItem icon="settings" label={T('rail.preferences')} />
        <RailUser initials="ME" name="Mehdi El Otmani" role={T('role.admin')} email="m.otmani@octopus.ai" profile="admin" />
      </div>
    </aside>
  );
}

function PageHead({ title, lead, actions }) {
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">{L('Administration','Administration')}</div>
        <h1>{title}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
      </div>
      {actions ? <div className="row">{actions}</div> : null}
    </div>
  );
}

/* ---------- utilisateurs ---------- */
function UsersView() {
  const [filter, setFilter] = useState('all');
  const [invite, setInvite] = useState(null);   // null | {name,email,role,dept}
  const [toast, setToast] = useState(null);
  const users = DB.listUsers();
  const filtered = users.filter(u => filter === 'all' || u.role === filter);
  const stats = {
    all: users.length,
    doctor: users.filter(u => u.role === 'doctor').length,
    student: users.filter(u => u.role === 'student').length,
    pending: users.filter(u => u.status === 'pending').length,
  };

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2400); };

  const exportCsv = () => {
    const head = ['id','name','email','role','dept','status','cases'];
    const rows = users.map(u => head.map(k => `"${String(u[k] != null ? u[k] : '').replace(/"/g,'""')}"`).join(','));
    const csv = head.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'octopus-utilisateurs.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    flash(L('CSV exporté','CSV exported'));
  };

  const submitInvite = () => {
    if (!invite.name || !invite.email) return;
    DB.addUser(invite);
    setInvite(null);
    flash(L('Invitation envoyée','Invitation sent'));
  };

  return (
    <div className="page">
      <PageHead title={L('Utilisateurs & accès','Users & access')}
        lead={L('Comptes répartis sur 3 profils. Les invitations en attente requièrent une approbation manuelle.','Accounts across 3 profiles. Pending invitations require manual approval.')}
        actions={<>
          <button className="btn btn-secondary" onClick={exportCsv}><Icon name="download" /> {L('Exporter CSV','Export CSV')}</button>
          <button className="btn btn-primary" onClick={() => setInvite({ name:'', email:'', role:'student', dept:'Médecine M5' })}><Icon name="plus" /> {L('Inviter','Invite')}</button>
        </>} />

      {invite && (
        <div className="invite-bar">
          <input className="set-input" placeholder={L('Nom complet','Full name')} value={invite.name} onChange={e => setInvite({ ...invite, name: e.target.value })}/>
          <input className="set-input" placeholder="email@etab.ma" value={invite.email} onChange={e => setInvite({ ...invite, email: e.target.value })}/>
          <select className="set-input" value={invite.role} onChange={e => setInvite({ ...invite, role: e.target.value })}>
            <option value="student">{L('Étudiant','Student')}</option>
            <option value="doctor">{L('Docteur','Doctor')}</option>
            <option value="admin">Admin</option>
          </select>
          <input className="set-input" placeholder={L('Service','Department')} value={invite.dept} onChange={e => setInvite({ ...invite, dept: e.target.value })}/>
          <button className="btn btn-primary" onClick={submitInvite} disabled={!invite.name || !invite.email}>{L('Envoyer','Send')}</button>
          <button className="btn btn-ghost" onClick={() => setInvite(null)}>{L('Annuler','Cancel')}</button>
        </div>
      )}

      <div className="stat-cards">
        <div className="stat-card"><span className="eyebrow">{L('Tous','All')}</span><span className="v">{stats.all}</span></div>
        <div className="stat-card"><span className="eyebrow">{L('Docteurs','Doctors')}</span><span className="v">{stats.doctor}</span></div>
        <div className="stat-card"><span className="eyebrow">{L('Étudiants','Students')}</span><span className="v">{stats.student}</span></div>
        <div className="stat-card pending"><span className="eyebrow">{L('En attente','Pending')}</span><span className="v">{stats.pending}</span><span className="trend">{L('à approuver','awaits approval')}</span></div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-tabs">
          {[
            { k:'all', l:L('Tous','All') },
            { k:'doctor', l:L('Docteurs','Doctors') },
            { k:'student', l:L('Étudiants','Students') },
            { k:'admin', l:'Admins' },
          ].map(t => (
            <button key={t.k} className={`tt ${filter === t.k ? 'on' : ''}`} onClick={() => setFilter(t.k)}>{t.l}</button>
          ))}
        </div>
        <table className="rs-table">
          <thead>
            <tr>
              <th style={{ width: 28 }}><input type="checkbox" /></th>
              <th>{L('Utilisateur','User')}</th><th>{L('Rôle','Role')}</th><th>{L('Service','Department')}</th>
              <th>{L('Cas','Cases')}</th><th>{L('Dernière activité','Last active')}</th><th>{L('Statut','Status')}</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td><input type="checkbox" /></td>
                <td>
                  <div className="row" style={{ gap: 10 }}>
                    <div className="avatar sm">{u.name.split(' ').map(p => p[0]).slice(0,2).join('')}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{u.name}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`role-pill role-${u.role}`}>{ROLE_LABEL[u.role]}</span></td>
                <td>{u.dept}</td>
                <td className="mono">{u.cases}</td>
                <td className="mono" style={{ color: 'var(--rs-fg-muted)' }}>{u.last}</td>
                <td><span className={`status status-${u.status}`}><span className="dot"/>{STATUS_LABEL[u.status] || u.status}</span></td>
                <td><button className="icon-btn">⋯</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- jeux de données ---------- */
function DatasetsView() {
  const datasets = DB.listDatasets();
  return (
    <div className="page">
      <PageHead title={L('Jeux de données','Case datasets')}
        lead={L('Collections de fonds d’œil pour la référence clinique, la simulation étudiant et l’entraînement des modèles.','Curated fundus collections for clinician reference, student simulation, and model training.')}
        actions={<>
          <button className="btn btn-secondary"><Icon name="layers" /> {L('Lignage','Lineage')}</button>
          <button className="btn btn-primary"><Icon name="upload" /> {L('Nouvelle ingestion','New ingest')}</button>
        </>} />
      <div className="ds-grid">
        {datasets.map(d => {
          const total = d.gradeDist.reduce((s, x) => s + x, 0);
          return (
            <div key={d.id} className="ds-card">
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>{d.id}</div>
                  <h3 style={{ margin: '4px 0 0', fontSize: 16 }}>{d.name}</h3>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)', marginTop: 4 }}>{d.type} · {d.license}</div>
                </div>
                <span className={`status status-${d.status === 'ready' ? 'active' : d.status === 'review' ? 'pending' : 'ingest'}`}>
                  <span className="dot"/>{STATUS_LABEL[d.status] || d.status}
                </span>
              </div>
              <div style={{ marginTop: 14 }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="eyebrow">{L('Distribution des grades','Grade distribution')}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>n = {total.toLocaleString(L('fr-FR','en-US'))}</span>
                </div>
                <div className="ds-bar" style={{ marginTop: 8 }}>
                  {d.gradeDist.map((v, i) => <div key={i} style={{ flex: v, background: `var(--rs-grade-${i})` }} title={`Grade ${i}: ${v}`}/>)}
                </div>
                <div className="row" style={{ marginTop: 6, gap: 12 }}>
                  {d.gradeDist.map((v, i) => (
                    <span key={i} className="mono" style={{ fontSize: 10, color: 'var(--rs-fg-muted)' }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, background: `var(--rs-grade-${i})`, borderRadius: '50%', marginRight: 4 }}/>
                      {Math.round(v / total * 100)}%
                    </span>
                  ))}
                </div>
              </div>
              <div className="row" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--rs-hairline)', justifyContent: 'space-between' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>{L('Ingéré le','Ingested')} {d.ingested}</span>
                <button className="btn btn-ghost">{L('Ouvrir','Open')} →</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- registre des modèles ---------- */
function ModelsView() {
  const models = DB.listModels();
  return (
    <div className="page">
      <PageHead title={L('Registre des modèles','Model registry')}
        lead={L('Modèles ML versionnés servis au pipeline de diagnostic. Promus de staging à production après validation.','Versioned ML models served to the diagnosis pipeline. Promoted from staging to production after sign-off.')}
        actions={<>
          <button className="btn btn-secondary"><Icon name="history" /> {L('Historique','History')}</button>
          <button className="btn btn-primary"><Icon name="upload" /> {L('Enregistrer un modèle','Register model')}</button>
        </>} />
      <div className="card" style={{ padding: 0 }}>
        <table className="rs-table">
          <thead>
            <tr>
              <th>{L('Modèle','Model')}</th><th>{L('Tâche','Task')}</th><th>Framework</th>
              <th>{L('Params','Params')}</th><th>{L('Métrique test','Test metric')}</th>
              <th>{L('Statut','Status')}</th><th>{L('Déployé','Deployed')}</th><th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {models.map(m => (
              <tr key={m.id}>
                <td className="mono" style={{ fontWeight: 500 }}>{m.name}</td>
                <td>{m.task}</td>
                <td><span className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>{m.framework}</span></td>
                <td className="mono">{m.params}</td>
                <td className="mono">{m.metric}</td>
                <td><span className={`status status-${m.status === 'production' ? 'active' : 'pending'}`}><span className="dot"/>{m.status}</span></td>
                <td className="mono" style={{ color: 'var(--rs-fg-muted)', fontSize: 12 }}>{m.deployed}</td>
                <td><button className="icon-btn">⋯</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- cas (file d'annotation / corpus live) ---------- */
function CasesView() {
  const cases = DB.listCases();
  return (
    <div className="page">
      <PageHead title={L('Cas de la plateforme','Platform cases')}
        lead={L('Tous les cas présents dans la base de test, partagés avec l’interface docteur.','All cases in the test database, shared with the doctor interface.')} />
      <div className="card" style={{ padding: 0 }}>
        <table className="rs-table">
          <thead><tr>
            <th>{L('Cas','Case')}</th><th>{L('Patient','Patient')}</th><th>{L('Grade','Grade')}</th>
            <th>{L('Confiance','Confidence')}</th><th>{L('Statut','Status')}</th><th>{L('Acquis','Acquired')}</th>
          </tr></thead>
          <tbody>
            {cases.map(c => (
              <tr key={c.id}>
                <td className="mono" style={{ fontWeight: 500 }}>{c.id} · {c.laterality}</td>
                <td>{c.patient}, {c.age}{c.sex}</td>
                <td><Pill grade={c.grade}>{(window.t ? window.t('grade.'+c.grade) : c.grade)}</Pill></td>
                <td className="mono">{c.conf}%</td>
                <td><span className="status status-active"><span className="dot"/>{c.status}</span></td>
                <td className="mono" style={{ color:'var(--rs-fg-muted)', fontSize: 12 }}>{c.acquired}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- journal d'audit (live) ---------- */
const AUDIT_LABEL = {
  'case.create': L('Cas créé','Case created'),
  'inference.run': L('Inférence IA exécutée','AI inference run'),
  'report.sign': L('Rapport signé','Report signed'),
  'case.update': L('Cas mis à jour','Case updated'),
  'attempt.submit': L('Tentative étudiant','Student attempt'),
};
function AuditView() {
  const entries = DB.listAudit();
  return (
    <div className="page">
      <PageHead title={L('Journal d’audit','Audit log')}
        lead={L('Trace immuable de toutes les actions : créations de cas, inférences, signatures, tentatives. Mise à jour en direct.','Immutable trace of all actions: case creations, inferences, signatures, attempts. Live.')} />
      <div className="card" style={{ padding: 0 }}>
        {entries.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--rs-fg-muted)' }}>
            {L('Aucune entrée. Téléversez ou signez un cas dans l’interface docteur pour générer des événements.','No entries yet. Upload or sign a case in the doctor interface to generate events.')}
          </div>
        ) : (
          <table className="rs-table">
            <thead><tr><th>{L('Horodatage','Timestamp')}</th><th>{L('Action','Action')}</th><th>{L('Référence','Reference')}</th></tr></thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i}>
                  <td className="mono" style={{ color: 'var(--rs-fg-muted)', fontSize: 12 }}>{new Date(e.ts).toLocaleString(L('fr-FR','en-GB'))}</td>
                  <td>{AUDIT_LABEL[e.action] || e.action}</td>
                  <td className="mono" style={{ color: 'var(--rs-teal-700)', fontSize: 12 }}>{e.meta && (e.meta.id || e.meta.caseId) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ---------- analytics plateforme (live) ---------- */
function AnalyticsView() {
  const cases = DB.listCases();
  const reports = DB.listReports();
  const n = cases.length;
  const byGrade = [0,1,2,3,4].map(g => cases.filter(c => c.grade === g).length);
  const maxG = Math.max(1, ...byGrade);
  return (
    <div className="page">
      <PageHead title={L('Analyse plateforme','Platform analytics')}
        lead={L('Indicateurs calculés en direct sur la base de test.','Indicators computed live from the test database.')} />
      <div className="stat-cards">
        <div className="stat-card"><span className="eyebrow">{L('Cas total','Total cases')}</span><span className="v">{n}</span></div>
        <div className="stat-card"><span className="eyebrow">{L('Rapports signés','Signed reports')}</span><span className="v">{reports.length}</span></div>
        <div className="stat-card"><span className="eyebrow">{L('Utilisateurs','Users')}</span><span className="v">{DB.listUsers().length}</span></div>
        <div className="stat-card"><span className="eyebrow">{L('Modèles','Models')}</span><span className="v">{DB.listModels().length}</span></div>
      </div>
      <div className="card">
        <div className="eyebrow">{L('Distribution des cas par grade','Case distribution by grade')}</div>
        <div className="amx" style={{ marginTop: 14 }}>
          {byGrade.map((v, g) => (
            <div key={g} className="amx-row">
              <span className="amx-lbl"><span className="dot" style={{ background:`var(--rs-grade-${g})` }}></span>Grade {g}</span>
              <div className="amx-bar"><div style={{ width: `${v/maxG*100}%`, background:`var(--rs-grade-${g})` }}/></div>
              <span className="mono">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- root ---------- */
function App() {
  useDB();
  const [section, setSection] = useState('users');
  const counts = { users: DB.listUsers().length, datasets: DB.listDatasets().length, models: DB.listModels().length, cases: DB.listCases().length };
  const CRUMB = {
    users: L('Utilisateurs & accès','Users & access'), datasets: L('Jeux de données','Datasets'),
    models: L('Modèles','Models'), cases: L('Cas','Cases'), audit: L('Journal d’audit','Audit log'), analytics: L('Analyse','Analytics'),
  };
  return (
    <div className="app">
      <AdminRail active={section} setActive={setSection} counts={counts} />
      <TopBar
        crumbs={[L('Administration','Administration'), CRUMB[section] || '']}
        searchPlaceholder={T('topbar.search.admin')}
      />
      <main className="main">
        {section === 'users' && <UsersView />}
        {section === 'datasets' && <DatasetsView />}
        {section === 'models' && <ModelsView />}
        {section === 'cases' && <CasesView />}
        {section === 'audit' && <AuditView />}
        {section === 'analytics' && <AnalyticsView />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
