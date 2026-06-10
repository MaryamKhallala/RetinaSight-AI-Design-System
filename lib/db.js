/* ============================================================
   Octopus AI — petite base de données locale (test)
   ------------------------------------------------------------
   But : permettre de TESTER l'application sans serveur.
   Persistée dans localStorage (clé "octopus.db.v1").

   ⚠️  Ceci n'est PAS le backend de production. C'est un banc
   d'essai côté navigateur dont l'API reproduit 1-pour-1 les
   futurs endpoints FastAPI (voir docs/backend.html). Pour passer
   au vrai backend, il suffit de remplacer le corps de chaque
   méthode par un fetch() vers l'API — la signature ne change pas.

       OctopusDB.listCases()              → GET  /api/cases
       OctopusDB.getCase(id)              → GET  /api/cases/:id
       OctopusDB.addCase(payload)         → POST /api/cases
       OctopusDB.runInference(id)         → POST /api/cases/:id/infer
       OctopusDB.saveReport(id, text)     → POST /api/cases/:id/report
       OctopusDB.listReports()            → GET  /api/reports
       OctopusDB.listUsers()              → GET  /api/users
       OctopusDB.listDatasets()           → GET  /api/datasets
       OctopusDB.listModels()             → GET  /api/models
       OctopusDB.listAudit()              → GET  /api/audit
   ============================================================ */
(function () {
  const KEY = 'octopus.db.v2';

  /* ---------- seed (petite base de test) ---------- */
  const SEED = {
    meta: { version: 1, seededAt: '2026-06-09' },
    cases: [
      { id:'RS-02384', patient:'A. Benali',     age:58, sex:'F', laterality:'OD', acquired:'2026-05-04 09:12', device:'Topcon NW400', grade:2, conf:92.4, av:1.42, lesions:3,  status:'pending', note:'Dépistage annuel de routine', lesionBreakdown:{ ma:1, ex:2, hem:0, cw:0 } },
      { id:'RS-02385', patient:'M. Idrissi',    age:64, sex:'M', laterality:'OS', acquired:'2026-05-04 09:34', device:'Canon CR-2',   grade:3, conf:88.1, av:1.21, lesions:9,  status:'flagged', note:'Baisse de vision OS — 3 semaines', lesionBreakdown:{ ma:5, ex:2, hem:2, cw:0 } },
      { id:'RS-02386', patient:'S. El Amrani',  age:72, sex:'F', laterality:'OD', acquired:'2026-05-04 10:01', device:'Topcon NW400', grade:4, conf:81.6, av:0.98, lesions:14, status:'urgent',  note:'Corps flottants, début il y a 2 jours', lesionBreakdown:{ ma:6, ex:2, hem:6, cw:0 } },
      { id:'RS-02387', patient:'Y. Ouazzani',   age:49, sex:'M', laterality:'OD', acquired:'2026-05-04 10:22', device:'Topcon NW400', grade:0, conf:96.3, av:1.71, lesions:0,  status:'cleared', note:'Diabète T2, examen de référence', lesionBreakdown:{ ma:0, ex:0, hem:0, cw:0 } },
      { id:'RS-02388', patient:'L. Tazi',       age:55, sex:'F', laterality:'OS', acquired:'2026-05-04 10:48', device:'Canon CR-2',   grade:1, conf:90.7, av:1.55, lesions:1,  status:'pending', note:'Suivi à 6 mois', lesionBreakdown:{ ma:1, ex:0, hem:0, cw:0 } },
      { id:'RS-02389', patient:'A. Cherkaoui',  age:67, sex:'M', laterality:'OD', acquired:'2026-05-04 11:10', device:'Topcon NW400', grade:2, conf:89.2, av:1.38, lesions:4,  status:'pending', note:'Dépistage annuel', lesionBreakdown:{ ma:2, ex:2, hem:0, cw:0 } },
    ],
    reports: [],
    users: [
      { id:'u_8821', name:'Dr. Amina Saidi',  email:'amina.saidi@chu-rabat.ma', role:'doctor',  dept:'Ophtalmologie',      status:'active',  last:'il y a 2 min',  cases:482 },
      { id:'u_8822', name:'Dr. Karim Hajji',  email:'k.hajji@chu-rabat.ma',     role:'doctor',  dept:'Ophtalmologie',      status:'active',  last:'il y a 14 min', cases:318 },
      { id:'u_8823', name:'Omar Kabbaj',       email:'omar.k@um6p-edu.ma',       role:'student', dept:'Médecine M5',        status:'active',  last:'il y a 1 h',    cases:128 },
      { id:'u_8824', name:'Sara Benkirane',    email:'s.benkirane@um6p-edu.ma',  role:'student', dept:'Médecine M5',        status:'active',  last:'il y a 3 h',    cases:94 },
      { id:'u_8825', name:'Yassine Idrissi',   email:'y.idrissi@um6p-edu.ma',    role:'student', dept:'Médecine M4',        status:'pending', last:'—',             cases:0 },
      { id:'u_8826', name:'Dr. Layla Tazi',    email:'l.tazi@chu-rabat.ma',      role:'doctor',  dept:'Spécialiste rétine', status:'active',  last:'hier',          cases:712 },
      { id:'u_8827', name:'Mehdi El Otmani',   email:'m.otmani@octopus.ai',      role:'admin',   dept:'Plateforme',         status:'active',  last:'à l’instant',   cases:'—' },
    ],
    datasets: [
      { id:'ds_messidor2', name:'Messidor-2',          type:'fundus',          n:1748,  gradeDist:[810,270,347,75,246],       status:'ready',  ingested:'2026-04-12', license:'Adcis open' },
      { id:'ds_eyepacs',   name:'EyePACS-train',       type:'fundus',          n:35126, gradeDist:[25810,2443,5292,873,708],  status:'ready',  ingested:'2026-04-19', license:'Kaggle' },
      { id:'ds_aptos',     name:'APTOS 2019',          type:'fundus',          n:3662,  gradeDist:[1805,370,999,193,295],     status:'ready',  ingested:'2026-04-21', license:'CC BY-NC' },
      { id:'ds_idrid',     name:'IDRID localisation',  type:'fundus + bbox',   n:516,   gradeDist:[134,25,168,79,110],        status:'ready',  ingested:'2026-04-23', license:'CC BY 4.0' },
      { id:'ds_chu_q1',    name:'CHU Rabat — T1 2026', type:'fundus + DICOM',  n:884,   gradeDist:[402,138,187,89,68],        status:'review', ingested:'2026-05-01', license:'Interne · CER' },
      { id:'ds_chu_q2',    name:'CHU Rabat — T2 2026', type:'fundus + DICOM',  n:312,   gradeDist:[142,51,68,28,23],          status:'ingest', ingested:'2026-05-04', license:'Interne · CER' },
    ],
    models: [
      { id:'m_v4_2_1', name:'fundus-grade-v4.2.1',    framework:'PyTorch', task:'Grading RD',             params:'24M', metric:'AUC 0.987',  status:'production', deployed:'2026-04-29' },
      { id:'m_v4_3_0', name:'fundus-grade-v4.3.0-rc', framework:'PyTorch', task:'Grading RD',             params:'38M', metric:'AUC 0.991',  status:'staging',    deployed:'2026-05-02' },
      { id:'m_vs_2_1', name:'vessel-seg-v2.1',        framework:'PyTorch', task:'Segmentation vaisseaux', params:'11M', metric:'Dice 0.872', status:'production', deployed:'2026-03-14' },
      { id:'m_les_18', name:'lesion-detect-v1.8',     framework:'PyTorch', task:'Détection lésions',      params:'46M', metric:'mAP 0.71',   status:'production', deployed:'2026-03-30' },
    ],
    audit: [],
    attempts: [],
    seq: 2390,
  };

  /* ---------- change subscription (so React views refresh) ---------- */
  const listeners = new Set();
  function emit() { listeners.forEach(fn => { try { fn(); } catch (e) {} }); }

  /* ---------- persistence ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  let DB = load() || clone(SEED);
  function commit() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} emit(); }
  if (!load()) commit();

  /* ---------- helpers ---------- */
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < String(str).length; i++) { h ^= String(str).charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h;
  }
  function rngFrom(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function audit(action, meta) {
    DB.audit.unshift({ ts: new Date().toISOString(), action, meta: meta || {} });
    DB.audit = DB.audit.slice(0, 200);
  }

  /* ---------- simulated AI inference ----------
     Reproduit le pipeline : grade ETDRS + confiance + morphologie
     vasculaire + comptage de lésions. Déterministe par patientId. */
  /* ---------- optional backend mode ----------
     If localStorage['octopus.api_url'] is set (e.g. "http://localhost:8000/api"),
     hydrate the in-memory cache from the real FastAPI backend at startup and
     write-through on mutations. The synchronous read API below is unchanged —
     it serves the cache, which the backend keeps fresh. Falls back to pure
     local mode if no URL is set or the server is unreachable. */
  const API = (function () { try { return localStorage.getItem('octopus.api_url'); } catch (e) { return null; } })();
  window.OCTOPUS_BACKEND = !!API;

  async function apiGet(path) {
    const r = await fetch(API + path);
    if (!r.ok) throw new Error('GET ' + path + ' → ' + r.status);
    return r.json();
  }
  function apiSend(method, path, body) {
    // fire-and-forget write-through; re-hydrate on success
    fetch(API + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => r.ok ? hydrate() : null).catch(() => {});
  }
  async function hydrate() {
    if (!API) return;
    try {
      const [cases, reports, users, datasets, models, audit, attempts] = await Promise.all([
        apiGet('/cases'), apiGet('/reports'), apiGet('/users'),
        apiGet('/datasets'), apiGet('/models'), apiGet('/audit'), apiGet('/attempts'),
      ]);
      DB = { ...DB, cases, reports, users, datasets, models, audit, attempts };
      emit();
    } catch (e) { console.warn('[Octopus] backend injoignable, mode local conservé :', e.message); }
  }
  if (API) hydrate();

  function infer(seedStr) {
    const r = rngFrom(hash(seedStr));
    const roll = r();
    const grade = roll < 0.34 ? 0 : roll < 0.55 ? 1 : roll < 0.78 ? 2 : roll < 0.93 ? 3 : 4;
    const conf = Math.round((78 + r() * 19) * 10) / 10;
    const av = Math.round((0.95 + r() * 0.85) * 100) / 100;
    const ma  = grade === 0 ? 0 : Math.round(r() * grade * 2);
    const ex  = grade <= 1 ? (grade === 0 ? 0 : Math.round(r())) : Math.round(r() * 2);
    const hem = grade >= 3 ? Math.round(2 + r() * 4) : 0;
    const cw  = grade >= 3 && r() > 0.6 ? Math.round(r() * 2) : 0;
    const lesionBreakdown = { ma, ex, hem, cw };
    const lesions = ma + ex + hem + cw;
    return { grade, conf, av, lesions, lesionBreakdown };
  }

  /* ---------- public API ---------- */
  const api = {
    /* cases */
    listCases() { return clone(DB.cases); },
    getCase(id) { const c = DB.cases.find(x => x.id === id); return c ? clone(c) : null; },
    nextCaseId() { return 'RS-' + String(DB.seq + 1).padStart(5, '0'); },
    addCase(payload) {
      DB.seq += 1;
      const id = payload.id || ('RS-' + String(DB.seq).padStart(5, '0'));
      const ai = api.infer(payload.id || id);
      const now = new Date();
      const acquired = (payload.date || now.toISOString().slice(0, 10)) + ' ' +
        now.toTimeString().slice(0, 5);
      const c = {
        id,
        patient: payload.patient || 'Patient ' + id.slice(-3),
        age: payload.age || (40 + Math.round(rngFrom(hash(id))() * 40)),
        sex: payload.sex || (rngFrom(hash(id + 's'))() > 0.5 ? 'F' : 'M'),
        laterality: payload.laterality || 'OD',
        acquired,
        device: payload.device || 'Topcon NW400',
        note: payload.note || 'Nouvel examen — téléversé',
        ...ai,
        status: 'pending',
      };
      DB.cases.unshift(c);
      audit('case.create', { id });
      audit('inference.run', { id, grade: c.grade, conf: c.conf });
      commit();
      if (API) apiSend('POST', '/cases', { id: payload.id || id, laterality: c.laterality, device: c.device, date: payload.date });
      return clone(c);
    },
    updateCase(id, patch) {
      const c = DB.cases.find(x => x.id === id);
      if (!c) return null;
      Object.assign(c, patch);
      audit('case.update', { id, patch });
      commit();
      return clone(c);
    },
    infer(seedStr) { return infer(seedStr); },
    runInference(id) {
      const c = DB.cases.find(x => x.id === id);
      if (!c) return null;
      Object.assign(c, api.infer(id));
      audit('inference.run', { id, grade: c.grade });
      commit();
      return clone(c);
    },

    /* reports */
    listReports() { return clone(DB.reports); },
    getReportFor(caseId) { const r = DB.reports.find(x => x.caseId === caseId); return r ? clone(r) : null; },
    saveReport(caseId, text, author) {
      const existing = DB.reports.find(r => r.caseId === caseId);
      const rec = {
        id: existing ? existing.id : 'rep_' + (DB.reports.length + 1),
        caseId, text,
        author: author || 'Dr. Amina Saidi',
        signedAt: new Date().toISOString(),
      };
      if (existing) Object.assign(existing, rec); else DB.reports.unshift(rec);
      const c = DB.cases.find(x => x.id === caseId);
      if (c) c.status = 'signed';
      audit('report.sign', { caseId, author: rec.author });
      commit();
      if (API) apiSend('POST', '/cases/' + caseId + '/report', { text, author: rec.author });
      return clone(rec);
    },

    /* directory data */
    listUsers() { return clone(DB.users); },
    listDatasets() { return clone(DB.datasets); },
    listModels() { return clone(DB.models); },
    listAudit() { return clone(DB.audit); },

    /* learning attempts (student) */
    listAttempts() { return clone(DB.attempts || []); },
    addAttempt(rec) {
      DB.attempts = DB.attempts || [];
      DB.attempts.unshift({ ts: new Date().toISOString(), ...rec });
      DB.attempts = DB.attempts.slice(0, 200);
      audit('attempt.submit', { caseId: rec.caseId, grade: rec.grade, ok: rec.gradeOk });
      commit();
      if (API) apiSend('POST', '/attempts', { caseId: rec.caseId, grade: rec.grade, gradeOk: rec.gradeOk, findingScore: rec.findingScore });
      return clone(DB.attempts[0]);
    },

    /* invite a user (admin) */
    addUser(u) {
      const id = 'u_' + (9000 + DB.users.length);
      const rec = { id, name: u.name, email: u.email, role: u.role || 'student', dept: u.dept || '—', status: 'pending', last: '—', cases: 0 };
      DB.users.push(rec);
      audit('user.invite', { id, email: u.email });
      commit();
      if (API) apiSend('POST', '/users', { name: u.name, email: u.email, role: rec.role, dept: rec.dept });
      return clone(rec);
    },

    /* lifecycle */
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    reset() { DB = clone(SEED); commit(); },
    refresh() { return hydrate(); },
    backendMode() { return !!API; },
    raw() { return clone(DB); },
  };

  window.OctopusDB = api;
})();
