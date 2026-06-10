/* Doctor surface — secondary pages (queue, patients, reports, atlas, outcomes).
   Each is backed by window.OctopusDB and exported to window for app.jsx.
   Loaded AFTER _shared.jsx and BEFORE app.jsx. */

const { useState: useStateP } = React;
const DBP = window.OctopusDB;
const TP = window.t || ((k) => k);
const L = (fr, en) => (window.octopusI18n && window.octopusI18n.getLang() === 'en') ? en : fr;
const GRADES_P = [0,1,2,3,4].map(i => (window.t ? window.t('grade.' + i) : ['No DR','Mild','Moderate','Severe','Proliferative'][i]));

const STATUS = {
  pending: { fr:'En attente', en:'Pending',  cls:'st-pending' },
  flagged: { fr:'Signalé',    en:'Flagged',  cls:'st-flagged' },
  urgent:  { fr:'Urgent',     en:'Urgent',   cls:'st-urgent' },
  cleared: { fr:'Validé',     en:'Cleared',  cls:'st-cleared' },
  signed:  { fr:'Signé',      en:'Signed',   cls:'st-signed' },
};
function StatusBadge({ s }) {
  const m = STATUS[s] || STATUS.pending;
  return <span className={`dstatus ${m.cls}`}><span className="dot"></span>{L(m.fr, m.en)}</span>;
}

function PageHead({ eyebrow, title, lead, actions }) {
  return (
    <div className="dpage-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
      </div>
      {actions ? <div className="row">{actions}</div> : null}
    </div>
  );
}

/* ---------- File de lecture ---------- */
function QueuePage({ cases, onOpen }) {
  const [filter, setFilter] = useStateP('all');
  const tabs = [
    { k:'all',     l:L('Tous','All') },
    { k:'pending', l:L('En attente','Pending') },
    { k:'urgent',  l:L('Urgents','Urgent') },
    { k:'signed',  l:L('Signés','Signed') },
  ];
  const match = (c) => filter === 'all' ? true
    : filter === 'urgent' ? (c.status === 'urgent' || c.status === 'flagged')
    : c.status === filter;
  const rows = cases.filter(match);
  return (
    <div className="dpage">
      <PageHead eyebrow={L('Diagnostic','Diagnosis')} title={L('File de lecture','Reading queue')}
        lead={L('Tous les examens téléversés. Cliquez un cas pour ouvrir l’étude.','All uploaded studies. Click a case to open the study.')} />
      <div className="dfilters">
        {tabs.map(t => (
          <button key={t.k} className={`dfilter ${filter === t.k ? 'on' : ''}`} onClick={() => setFilter(t.k)}>
            {t.l}<span className="mono cnt">{t.k === 'all' ? cases.length : cases.filter(c => t.k === 'urgent' ? (c.status==='urgent'||c.status==='flagged') : c.status===t.k).length}</span>
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="dtable">
          <thead><tr>
            <th>{L('Cas','Case')}</th><th>{L('Patient','Patient')}</th>
            <th>{L('Grade','Grade')}</th><th>{L('Confiance','Confidence')}</th>
            <th>{L('Statut','Status')}</th><th>{L('Acquis','Acquired')}</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.id} onClick={() => onOpen(c.id)}>
                <td><div className="row" style={{ gap: 10 }}>
                  <div className="dthumb"><img src="../../assets/fundus-sample-1.svg" alt=""/></div>
                  <span className="mono" style={{ fontWeight: 500 }}>{c.id} · {c.laterality}</span>
                </div></td>
                <td>{c.patient}, {c.age}{c.sex}</td>
                <td><Pill grade={c.grade}>{GRADES_P[c.grade]}</Pill></td>
                <td className="mono">{c.conf}%</td>
                <td><StatusBadge s={c.status}/></td>
                <td className="mono" style={{ color:'var(--rs-fg-muted)', fontSize: 12 }}>{c.acquired}</td>
                <td><span className="dopen">{L('Ouvrir','Open')} →</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Patients ---------- */
function PatientsPage({ cases, onOpen }) {
  const groups = {};
  cases.forEach(c => { (groups[c.patient] = groups[c.patient] || []).push(c); });
  const patients = Object.entries(groups).map(([name, list]) => ({ name, list }));
  return (
    <div className="dpage">
      <PageHead eyebrow={L('Diagnostic','Diagnosis')} title={L('Patients','Patients')}
        lead={L('Patients regroupés à partir des examens. Cliquez un examen pour l’ouvrir.','Patients grouped from studies. Click a study to open it.')} />
      <div className="patient-grid">
        {patients.map(p => {
          const c0 = p.list[0];
          const worst = Math.max(...p.list.map(c => c.grade));
          return (
            <div key={p.name} className="patient-card">
              <div className="row" style={{ justifyContent:'space-between', alignItems:'flex-start' }}>
                <div className="row" style={{ gap: 10 }}>
                  <div className="pavatar">{p.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="mono" style={{ fontSize: 11, color:'var(--rs-fg-muted)' }}>{c0.age}{c0.sex} · MRN 8847{c0.id.slice(-2)} · {L('Diabète T2','Diabetes T2')}</div>
                  </div>
                </div>
                <Pill grade={worst}>{GRADES_P[worst]}</Pill>
              </div>
              <div className="pstudies">
                {p.list.map(c => (
                  <button key={c.id} className="pstudy" onClick={() => onOpen(c.id)}>
                    <span className="mono">{c.id} · {c.laterality}</span>
                    <span className="mono" style={{ color:'var(--rs-fg-muted)' }}>{c.acquired.split(' ')[0]}</span>
                    <StatusBadge s={c.status}/>
                    <span className="dopen">→</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Rapports ---------- */
function ReportsPage({ onOpen }) {
  const reports = DBP.listReports();
  return (
    <div className="dpage">
      <PageHead eyebrow={L('Diagnostic','Diagnosis')} title={L('Rapports','Reports')}
        lead={L('Rapports cliniques signés. Générés depuis l’étude active.','Signed clinical reports. Generated from the active study.')} />
      {reports.length === 0 ? (
        <div className="dempty">
          <Icon name="file" size={28}/>
          <div style={{ fontWeight: 600, marginTop: 10 }}>{L('Aucun rapport signé','No signed report')}</div>
          <p style={{ maxWidth: '40ch' }}>{L('Ouvrez un cas dans « Étude active », puis cliquez « Signer & exporter » pour créer un rapport.','Open a case in “Active study”, then click “Sign & export” to create a report.')}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="dtable">
            <thead><tr>
              <th>{L('Cas','Case')}</th><th>{L('Patient','Patient')}</th>
              <th>{L('Grade','Grade')}</th><th>{L('Auteur','Author')}</th>
              <th>{L('Signé le','Signed at')}</th><th></th>
            </tr></thead>
            <tbody>
              {reports.map(r => {
                const c = DBP.getCase(r.caseId) || {};
                return (
                  <tr key={r.id} onClick={() => onOpen(r.caseId)}>
                    <td className="mono" style={{ fontWeight: 500 }}>{r.caseId}</td>
                    <td>{c.patient || '—'}</td>
                    <td>{c.grade != null ? <Pill grade={c.grade}>{GRADES_P[c.grade]}</Pill> : '—'}</td>
                    <td>{r.author}</td>
                    <td className="mono" style={{ color:'var(--rs-fg-muted)', fontSize: 12 }}>{new Date(r.signedAt).toLocaleString(L('fr-FR','en-GB'))}</td>
                    <td><span className="dopen">{L('Ouvrir','Open')} →</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- Atlas des pathologies ---------- */
const ATLAS = [
  { key:'dr',   fr:'Rétinopathie diabétique', en:'Diabetic retinopathy', color:'var(--rs-grade-2)',
    descFr:'Atteinte microvasculaire de la rétine liée au diabète. Graduée sur l’échelle ETDRS en 5 niveaux.',
    descEn:'Diabetes-related retinal microvascular disease. Graded on the 5-level ETDRS scale.',
    signsFr:['Microanévrismes','Exsudats durs','Hémorragies','IRMA, néovaisseaux (stade proliférant)'],
    signsEn:['Microaneurysms','Hard exudates','Haemorrhages','IRMA, neovessels (proliferative)'] },
  { key:'amd',  fr:'DMLA', en:'AMD', color:'var(--rs-grade-3)',
    descFr:'Dégénérescence maculaire liée à l’âge — atteinte de la macula, vision centrale.',
    descEn:'Age-related macular degeneration — macular damage, central vision.',
    signsFr:['Drusen','Altérations de l’EPR','Néovascularisation choroïdienne (forme humide)'],
    signsEn:['Drusen','RPE changes','Choroidal neovascularisation (wet form)'] },
  { key:'glauc', fr:'Glaucome', en:'Glaucoma', color:'var(--rs-info)',
    descFr:'Neuropathie optique progressive. Évaluée par le ratio cup/disque (CDR).',
    descEn:'Progressive optic neuropathy. Assessed via cup-to-disc ratio (CDR).',
    signsFr:['CDR augmenté','Excavation papillaire','Asymétrie inter-yeux'],
    signsEn:['Increased CDR','Disc cupping','Inter-eye asymmetry'] },
  { key:'rvo',  fr:'OVR', en:'RVO', color:'var(--rs-grade-4)',
    descFr:'Occlusion veineuse rétinienne — blocage du retour veineux.',
    descEn:'Retinal vein occlusion — blockage of venous return.',
    signsFr:['Hémorragies en flammèches','Veines dilatées/tortueuses','Œdème'],
    signsEn:['Flame haemorrhages','Dilated/tortuous veins','Oedema'] },
  { key:'edema', fr:'Œdème maculaire', en:'Macular oedema', color:'var(--rs-grade-1)',
    descFr:'Accumulation de liquide dans la macula, souvent associée à la RD.',
    descEn:'Fluid accumulation in the macula, often associated with DR.',
    signsFr:['Épaississement rétinien','Logettes cystoïdes','Exsudats péri-fovéaux'],
    signsEn:['Retinal thickening','Cystoid spaces','Perifoveal exudates'] },
];
function AtlasPage() {
  return (
    <div className="dpage">
      <PageHead eyebrow={L('Référence','Reference')} title={L('Atlas des pathologies','Atlas of pathologies')}
        lead={L('Fiches de référence des pathologies détectées par la plateforme.','Reference cards for the pathologies the platform detects.')} />
      <div className="atlas-grid">
        {ATLAS.map(a => (
          <div key={a.key} className="atlas-card">
            <div className="atlas-fig" style={{ borderColor: a.color }}>
              <img src="../../assets/fundus-sample-1.svg" alt=""/>
              <span className="atlas-tag" style={{ background: a.color }}>{L(a.fr, a.en)}</span>
            </div>
            <div className="atlas-body">
              <h3>{L(a.fr, a.en)}</h3>
              <p>{L(a.descFr, a.descEn)}</p>
              <div className="atlas-signs">
                {L(a.signsFr, a.signsEn).map((s, i) => <span key={i} className="sign-chip">{s}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Analyse des résultats ---------- */
function OutcomesPage({ cases }) {
  const n = cases.length;
  const signed = cases.filter(c => c.status === 'signed').length;
  const urgent = cases.filter(c => c.status === 'urgent' || c.status === 'flagged').length;
  const avgConf = n ? Math.round(cases.reduce((s,c) => s + c.conf, 0) / n * 10) / 10 : 0;
  const byGrade = [0,1,2,3,4].map(g => cases.filter(c => c.grade === g).length);
  const maxG = Math.max(1, ...byGrade);
  const audit = (DBP.listAudit ? DBP.listAudit() : []).slice(0, 6);
  const auditLabel = (a) => ({
    'case.create': L('Cas créé','Case created'),
    'inference.run': L('Inférence IA','AI inference'),
    'report.sign': L('Rapport signé','Report signed'),
    'case.update': L('Cas mis à jour','Case updated'),
  }[a.action] || a.action);

  return (
    <div className="dpage">
      <PageHead eyebrow={L('Référence','Reference')} title={L('Analyse des résultats','Outcome analytics')}
        lead={L('Indicateurs calculés sur la base de test en direct.','Indicators computed live from the test database.')} />
      <div className="dkpis">
        <div className="dkpi"><span className="eyebrow">{L('Cas total','Total cases')}</span><span className="v mono">{n}</span></div>
        <div className="dkpi"><span className="eyebrow">{L('Signés','Signed')}</span><span className="v mono">{signed}</span><span className="t mono">{n ? Math.round(signed/n*100) : 0}%</span></div>
        <div className="dkpi"><span className="eyebrow">{L('Urgents','Urgent')}</span><span className="v mono" style={{ color:'var(--rs-grade-4)' }}>{urgent}</span></div>
        <div className="dkpi"><span className="eyebrow">{L('Confiance moy.','Avg confidence')}</span><span className="v mono">{avgConf}%</span></div>
      </div>

      <div className="card">
        <div className="eyebrow">{L('Distribution par grade (ETDRS)','Distribution by grade (ETDRS)')}</div>
        <div className="ochart">
          {byGrade.map((v, g) => (
            <div key={g} className="ocol">
              <div className="ocol-bar-wrap">
                <div className="ocol-bar" style={{ height: `${v/maxG*100}%`, background: `var(--rs-grade-${g})` }}>
                  <span className="ocol-v mono">{v}</span>
                </div>
              </div>
              <span className="ocol-lbl"><span className="dot" style={{ background:`var(--rs-grade-${g})` }}></span>{g}</span>
              <span className="ocol-sub">{GRADES_P[g]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">{L('Activité récente (journal d’audit)','Recent activity (audit log)')}</div>
        <div className="oaudit">
          {audit.length === 0 ? <p style={{ color:'var(--rs-fg-muted)', fontSize: 13 }}>{L('Aucune activité pour l’instant.','No activity yet.')}</p>
            : audit.map((a, i) => (
            <div key={i} className="oaudit-row">
              <span className="oaudit-act">{auditLabel(a)}</span>
              <span className="mono oaudit-meta">{a.meta && a.meta.id ? a.meta.id : (a.meta && a.meta.caseId) || ''}</span>
              <span className="mono oaudit-ts">{new Date(a.ts).toLocaleTimeString(L('fr-FR','en-GB'))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { QueuePage, PatientsPage, ReportsPage, AtlasPage, OutcomesPage });
