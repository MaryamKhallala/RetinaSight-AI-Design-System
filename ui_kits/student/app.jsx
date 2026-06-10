/* Student surface — apprentissage par cas, simulation, progression.
   Le simulateur et la bibliothèque lisent les cas depuis window.OctopusDB
   (base de test partagée avec l'interface docteur). */

const { useState, useEffect } = React;
const DB = window.OctopusDB;
const T = window.t || ((k) => k);
const L = (fr, en) => (window.octopusI18n && window.octopusI18n.getLang() === 'en') ? en : fr;
const GRADE_FR = ['Pas de RD','RDNP légère','RDNP modérée','RDNP sévère','RD proliférante'];
const GRADE_EN = ['No DR','Mild NPDR','Moderate NPDR','Severe NPDR','Proliferative DR'];
const GLAB = (g) => L(GRADE_FR[g], GRADE_EN[g]);

/* Construit la liste de constatations attendues à partir d'un cas réel
   (lesionBreakdown + grade) — c'est la "vérité terrain" du simulateur. */
function findingsForCase(c) {
  const bd = c.lesionBreakdown || {};
  return [
    { id:'ma',  label:L('Microanévrismes','Microaneurysms'),                 present: (bd.ma||0) > 0 },
    { id:'ex',  label:L('Exsudats durs','Hard exudates'),                    present: (bd.ex||0) > 0 },
    { id:'hem', label:L('Hémorragies intrarétiniennes','Intraretinal haemorrhages'), present: (bd.hem||0) > 0 },
    { id:'cw',  label:L('Nodules cotonneux','Cotton-wool spots'),            present: (bd.cw||0) > 0 },
    { id:'iv',  label:L('Dilatation veineuse','Venous beading'),             present: c.grade >= 3 },
    { id:'irma',label:L('AMIR (anomalies microvasculaires)','IRMA'),         present: c.grade >= 3 },
    { id:'nv',  label:L('Néovaisseaux (NVD / NVE)','Neovascularisation'),    present: c.grade >= 4 },
    { id:'vh',  label:L('Hémorragie pré-rétinienne / vitréenne','Vitreous haemorrhage'), present: c.grade >= 4 },
  ];
}

/* ---------- left rail ---------- */
function StudentRail({ active, setActive }) {
  return (
    <aside className="rail">
      <RailBrand subtitle={T('brand.tag.learning')} />
      <div className="rail-section">
        <div className="rail-section-label">{T('rail.section.learn')}</div>
        <RailItem icon="grad"   label={T('rail.simulator')} on={active === 'sim'} onClick={() => setActive('sim')} />
        <RailItem icon="folder" label={T('rail.library')}   count={DB.listCases().length} on={active === 'lib'} onClick={() => setActive('lib')} />
        <RailItem icon="book"   label={T('rail.atlas.reading')} on={active === 'atlas'} onClick={() => setActive('atlas')} />
        <RailItem icon="award"  label={T('rail.quizzes')}   count={12} on={active === 'quiz'} onClick={() => setActive('quiz')} />
      </div>
      <div className="rail-section">
        <div className="rail-section-label">{T('rail.section.progress')}</div>
        <RailItem icon="chart"  label={T('rail.performance')} on={active === 'progress'} onClick={() => setActive('progress')} />
        <RailItem icon="flag"   label={T('rail.goals')} />
        <RailItem icon="history" label={T('rail.history')} on={active === 'history'} onClick={() => setActive('history')} />
      </div>
      <div className="rail-foot">
        <RailItem icon="settings" label={T('rail.preferences')} />
        <RailUser initials="OK" name="Omar Kabbaj" role={T('role.student')} email="omar.k@um6p-edu.ma" profile="student" />
      </div>
    </aside>
  );
}

/* ---------- simulateur (apprentissage par cas) ---------- */
function CaseSimulator({ caseData, onNext }) {
  const c = caseData;
  const FIND = findingsForCase(c);
  const [stage, setStage] = useState(1);
  const [picks, setPicks] = useState({});
  const [grade, setGrade] = useState(null);
  const [saved, setSaved] = useState(false);

  const togglePick = (id) => setPicks(p => ({ ...p, [id]: !p[id] }));
  const userCorrect = FIND.filter(f => f.present === !!picks[f.id]).length;
  const findingScore = Math.round(userCorrect / FIND.length * 100);
  const gradeCorrect = grade === c.grade;

  // Enregistre la tentative dans la base au passage à l'étape débriefing
  useEffect(() => {
    if (stage === 4 && !saved) {
      DB.addAttempt({ caseId: c.id, grade, gradeOk: gradeCorrect, findingScore });
      setSaved(true);
    }
  }, [stage]);

  const reset = () => { setStage(1); setPicks({}); setGrade(null); setSaved(false); };

  const STEPS = [L('Briefing','Brief'), L('Constatations','Findings'), L('Grade','Grade'), L('Débriefing','Debrief')];

  return (
    <div className="sim">
      <div className="sim-head">
        <div>
          <div className="eyebrow">{L('Simulation · Module-RD','Simulation · DR-Module')}</div>
          <h1 className="sim-title">{c.id} · {GLAB(c.grade)} · {c.patient}, {c.age}{c.sex}</h1>
        </div>
        <div className="sim-progress">
          {[1,2,3,4].map(s => (
            <div key={s} className={`step ${stage >= s ? 'on' : ''} ${stage === s ? 'now' : ''}`}>
              <span className="dot mono">{s}</span><span className="lbl">{STEPS[s-1]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sim-body">
        <div className="col" style={{ gap: 14 }}>
          <div className="sim-image">
            <img src="../../assets/fundus-sample-1.svg" alt="" />
            {stage >= 4 && <img className="ovl" src="../../assets/fundus-sample-heatmap.svg" alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', mixBlendMode:'screen', opacity:0.55, borderRadius:'inherit' }}/>}
            <div className="sim-image-meta mono">{c.id} · {c.laterality}</div>
          </div>
          <div className="card">
            <div className="eyebrow">{L('Contexte clinique','Clinical history')}</div>
            <p style={{ margin:'8px 0 0', fontSize:13.5, lineHeight:1.55 }}>{c.note} · {c.device}. {L('Confiance IA de référence','Reference AI confidence')} {c.conf}%.</p>
          </div>
        </div>

        <div className="col" style={{ gap: 14 }}>
          <div className="card">
            <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline' }}>
              <div>
                <div className="eyebrow">{L(`Étape ${stage} sur 4`,`Step ${stage} of 4`)}</div>
                <h3 style={{ margin:'4px 0 0', fontSize:16 }}>
                  {stage === 1 && L('Lire le briefing du cas','Read the case brief')}
                  {stage === 2 && L('Cocher toutes les constatations présentes','Select all findings present')}
                  {stage === 3 && L('Attribuer un grade ETDRS','Assign an ETDRS grade')}
                  {stage === 4 && L('Débriefing & correction','Debrief & correction')}
                </h3>
              </div>
              {stage >= 2 && <span className="mono" style={{ fontSize:11, color:'var(--rs-fg-muted)' }}>{Object.values(picks).filter(Boolean).length} {L('sélectionnée(s)','selected')}</span>}
            </div>

            {stage === 1 && (
              <div style={{ marginTop:12, fontSize:13.5, lineHeight:1.55, color:'var(--rs-ink-700)' }}>
                <p>{L('Examinez le fond d’œil à gauche. Notez le calibre des vaisseaux, les lésions et tout signe de maladie proliférante.','Examine the fundus on the left. Note vessel calibre, lesions, and any signs of proliferative disease.')}</p>
                <ul style={{ paddingLeft:18, color:'var(--rs-fg-muted)' }}>
                  <li>{L('Vous pouvez revenir au briefing à tout moment.','You can return to the brief anytime.')}</li>
                  <li>{L('Temps non limité — privilégiez l’exhaustivité.','No time limit — focus on completeness.')}</li>
                </ul>
              </div>
            )}

            {(stage === 2 || stage === 4) && (
              <div className="findings">
                {FIND.map(f => {
                  const picked = !!picks[f.id];
                  let cls = 'find';
                  if (stage === 4) {
                    if (f.present && picked) cls += ' ok';
                    else if (f.present && !picked) cls += ' miss';
                    else if (!f.present && picked) cls += ' wrong';
                    else cls += ' skip';
                  } else if (picked) cls += ' picked';
                  return (
                    <button key={f.id} className={cls} onClick={() => stage === 2 && togglePick(f.id)} disabled={stage === 4}>
                      <span className="ck">{stage === 4 ? (f.present ? <Icon name="check" size={12}/> : (picked ? <Icon name="cross" size={12}/> : null)) : (picked ? <Icon name="check" size={12}/> : null)}</span>
                      <span>{f.label}</span>
                      {stage === 4 && f.present && !picked && <span className="mono badge">{L('manqué','missed')}</span>}
                      {stage === 4 && !f.present && picked && <span className="mono badge">{L('sur-coté','over-call')}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {stage === 3 && (
              <div className="grade-picker">
                {[0,1,2,3,4].map(g => (
                  <button key={g} className={`gp ${grade === g ? 'on' : ''}`} onClick={() => setGrade(g)}>
                    <span className={`pill pill-grade-${g}`}><span className="dot"/>Grade {g}</span>
                    <span className="lbl">{GLAB(g)}</span>
                  </button>
                ))}
              </div>
            )}

            {stage === 4 && (
              <div className="debrief">
                <div className="row" style={{ gap:14, marginTop:14 }}>
                  <div className="metric" style={{ flex:1, background: gradeCorrect ? 'var(--rs-grade-0-bg)' : 'var(--rs-grade-3-bg)' }}>
                    <span className="k">{L('Votre grade','Your grade')}</span>
                    <span className="v">{grade != null ? grade : '—'}</span>
                    <span className="trend">{gradeCorrect ? L('✓ correspond à l’IA experte','✓ matches expert AI') : L(`attendu : grade ${c.grade}`,`expected: grade ${c.grade}`)}</span>
                  </div>
                  <div className="metric" style={{ flex:1 }}>
                    <span className="k">{L('Justesse constatations','Findings accuracy')}</span>
                    <span className="v">{findingScore}%</span>
                    <span className="trend">{userCorrect}/{FIND.length} {L('correctes','correct')}</span>
                  </div>
                </div>
                <div className="card" style={{ marginTop:14, background:'var(--rs-bg-sunken)', border:'none' }}>
                  <div className="eyebrow">{L('Raisonnement expert','Expert reasoning')}</div>
                  <p style={{ margin:'6px 0 0', fontSize:13, lineHeight:1.55 }}>
                    {L('Selon la règle 4:2:1, une RDNP sévère est retenue si : hémorragies/microanévrismes sévères dans 4 quadrants, dilatation veineuse dans 2+ quadrants, ou AMIR dans 1+ quadrant. Le grade de référence de ce cas est',
                       'Per the 4:2:1 rule, severe NPDR is diagnosed with severe haemorrhages/microaneurysms in 4 quadrants, venous beading in 2+, or IRMA in 1+. The reference grade for this case is')} <strong>{c.grade} — {GLAB(c.grade)}</strong>.
                  </p>
                </div>
              </div>
            )}

            <div className="row" style={{ justifyContent:'space-between', marginTop:16, paddingTop:14, borderTop:'1px solid var(--rs-hairline)' }}>
              <button className="btn btn-secondary" disabled={stage === 1} onClick={() => setStage(s => Math.max(1, s-1))}>{L('Retour','Back')}</button>
              {stage < 4
                ? <button className="btn btn-primary" disabled={stage === 3 && grade == null} onClick={() => setStage(s => s+1)}>{stage === 3 ? L('Soumettre','Submit') : L('Continuer','Continue')} →</button>
                : <button className="btn btn-primary" onClick={() => { reset(); onNext && onNext(); }}>{L('Cas suivant','Next case')} →</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- bibliothèque de cas (depuis la base) ---------- */
function LibraryView({ cases, onPick }) {
  return (
    <div className="dpage">
      <div className="dpage-head"><div>
        <div className="eyebrow">{L('Apprendre','Learn')}</div>
        <h1>{L('Bibliothèque de cas','Case library')}</h1>
        <p className="lead">{L('Cas partagés avec l’interface clinique. Choisissez-en un pour vous entraîner dans le simulateur.','Cases shared with the clinical interface. Pick one to practise in the simulator.')}</p>
      </div></div>
      <div className="lib-grid">
        {cases.map(c => (
          <button key={c.id} className="lib-card" onClick={() => onPick(c.id)}>
            <div className="lib-thumb"><img src="../../assets/fundus-sample-1.svg" alt=""/></div>
            <div className="lib-body">
              <div className="row" style={{ justifyContent:'space-between' }}>
                <span className="mono" style={{ fontSize:12, fontWeight:500 }}>{c.id} · {c.laterality}</span>
                <Pill grade={c.grade}>{GLAB(c.grade)}</Pill>
              </div>
              <div style={{ fontSize:13, fontWeight:500, marginTop:4 }}>{c.patient}, {c.age}{c.sex}</div>
              <div className="mono" style={{ fontSize:11, color:'var(--rs-fg-muted)', marginTop:2 }}>{c.lesions} {L('lésion(s)','lesion(s)')} · {c.conf}%</div>
              <span className="lib-cta">{L('S’entraîner','Practise')} →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- progression (depuis les tentatives enregistrées) ---------- */
function ProgressDash() {
  const attempts = DB.listAttempts();
  const n = attempts.length;
  const gradeOk = attempts.filter(a => a.gradeOk).length;
  const acc = n ? Math.round(gradeOk / n * 100) : 0;
  const avgFind = n ? Math.round(attempts.reduce((s,a) => s + (a.findingScore||0), 0) / n) : 0;
  return (
    <div className="dpage">
      <div className="dpage-head"><div>
        <div className="eyebrow">{L('Performance','Performance')}</div>
        <h1>{L('Ma progression','My progress')}</h1>
        <p className="lead">{L('Calculée à partir de vos tentatives réelles dans le simulateur.','Computed from your real attempts in the simulator.')}</p>
      </div></div>
      <div className="kpis">
        <div className="kpi"><span className="eyebrow">{L('Cas traités','Cases done')}</span><span className="v">{n}</span></div>
        <div className="kpi"><span className="eyebrow">{L('Justesse de grade','Grading accuracy')}</span><span className="v">{acc}%</span><span className="trend up">{gradeOk}/{n || 0}</span></div>
        <div className="kpi"><span className="eyebrow">{L('Constatations moy.','Avg. findings')}</span><span className="v">{avgFind}%</span></div>
        <div className="kpi"><span className="eyebrow">{L('Tentatives','Attempts')}</span><span className="v">{n}</span></div>
      </div>
      <div className="card">
        <div className="eyebrow">{L('Tentatives récentes','Recent attempts')}</div>
        {n === 0 ? (
          <p style={{ color:'var(--rs-fg-muted)', fontSize:13, marginTop:10 }}>{L('Aucune tentative. Lancez un cas dans le simulateur pour démarrer votre suivi.','No attempts yet. Run a case in the simulator to start tracking.')}</p>
        ) : (
          <div className="att-list" style={{ marginTop:10 }}>
            {attempts.slice(0, 10).map((a, i) => (
              <div key={i} className="att-row">
                <span className="mono">{a.caseId || '—'}</span>
                <span className={`pill pill-grade-${a.grade != null ? a.grade : 0}`}><span className="dot"/>Grade {a.grade != null ? a.grade : '—'}</span>
                <span className="mono" style={{ color: a.gradeOk ? 'var(--rs-grade-0)' : 'var(--rs-grade-4)' }}>{a.gradeOk ? L('✓ juste','✓ correct') : L('✗ erroné','✗ wrong')}</span>
                <span className="mono" style={{ color:'var(--rs-fg-muted)' }}>{a.findingScore}%</span>
                <span className="mono" style={{ color:'var(--rs-fg-muted)', fontSize:11 }}>{new Date(a.ts).toLocaleTimeString(L('fr-FR','en-GB'))}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- placeholder léger ---------- */
function Soon({ title }) {
  return (
    <div className="dpage">
      <div className="dpage-head"><div>
        <div className="eyebrow">{L('Bientôt','Coming up')}</div>
        <h1>{title}</h1>
        <p className="lead">{L('Cette section utilisera la même base de cas. Le simulateur, la bibliothèque et la progression sont fonctionnels.','This section will use the same case base. The simulator, library and progress are functional.')}</p>
      </div></div>
    </div>
  );
}

/* ---------- root ---------- */
function App() {
  const [cases, setCases] = useState(() => DB.listCases());
  const [section, setSection] = useState('sim');
  const [simId, setSimId] = useState(cases[0] ? cases[0].id : null);
  useEffect(() => DB.onChange(() => setCases(DB.listCases())), []);

  const simCase = cases.find(c => c.id === simId) || cases[0];
  const pickForSim = (id) => { setSimId(id); setSection('sim'); };
  const nextCase = () => {
    const idx = cases.findIndex(c => c.id === simId);
    const next = cases[(idx + 1) % cases.length];
    if (next) setSimId(next.id);
  };

  const CRUMB = {
    sim: L('Simulateur de cas','Case simulator'), lib: L('Bibliothèque','Library'),
    progress: L('Performance','Performance'), atlas: L('Atlas & lectures','Atlas & reading'),
    quiz: L('Quiz','Quizzes'), history: L('Historique','History'),
  };

  return (
    <div className="app">
      <StudentRail active={section} setActive={setSection} />
      <TopBar
        crumbs={[L('Apprentissage','Learning'), CRUMB[section] || '', section === 'sim' && simCase ? simCase.id : '']}
        searchPlaceholder={T('topbar.search.learning')}
      />
      <main className="main">
        {section === 'sim' && simCase && <CaseSimulator key={simCase.id} caseData={simCase} onNext={nextCase} />}
        {section === 'lib' && <LibraryView cases={cases} onPick={pickForSim} />}
        {section === 'progress' && <ProgressDash />}
        {(section === 'atlas' || section === 'quiz' || section === 'history') && <Soon title={CRUMB[section]} />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
