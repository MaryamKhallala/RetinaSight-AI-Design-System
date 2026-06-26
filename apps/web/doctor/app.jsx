/* Doctor surface — RetinaSight clinical diagnosis app.
   Click-thru between case list and the active reading view.
   Uses _shared.jsx components and _shell.css chrome. */

const { useState, useMemo, useRef, useEffect } = React;
const DB = window.OctopusDB;

/* ---------- case data (from the local test DB) ---------- */

const GRADE_LABELS = [0,1,2,3,4].map(i => window.t ? window.t('grade.'+i) : ['No DR','Mild','Moderate','Severe','Proliferative'][i]);
const T = window.t || ((k) => k);

/* ---------- left rail ---------- */
function DoctorRail({ active, setActive, count }) {
  return (
    <aside className="rail">
      <RailBrand subtitle={T('brand.tag.clinical')} />

      <div className="rail-section">
        <div className="rail-section-label">{T('rail.section.diagnosis')}</div>
        <RailItem icon="upload" label={T('rail.upload')} on={active === 'upload'} onClick={() => setActive('upload')} />
        <RailItem icon="layers" label={T('rail.queue')} count={count} on={active === 'queue'} onClick={() => setActive('queue')} />
        <RailItem icon="grad"   label={T('rail.active')}   on={active === 'study'} onClick={() => setActive('study')} />
        <RailItem icon="users"  label={T('rail.patients')}  count={184} on={active === 'patients'} onClick={() => setActive('patients')} />
        <RailItem icon="file"   label={T('rail.reports')}   count={47}  on={active === 'reports'}  onClick={() => setActive('reports')} />
      </div>

      <div className="rail-section">
        <div className="rail-section-label">{T('rail.section.reference')}</div>
        <RailItem icon="book"   label={T('rail.atlas')}    on={active === 'atlas'}    onClick={() => setActive('atlas')} />
        <RailItem icon="chart"  label={T('rail.outcomes')} on={active === 'outcomes'} onClick={() => setActive('outcomes')} />
      </div>

      <div className="rail-foot">
        <RailItem icon="settings" label={T('rail.preferences')} />
        <RailUser initials="DA" name="Dr. Amina Saidi" role={T('role.ophth')} email="amina.saidi@chu-rabat.ma" profile="doctor" />
      </div>
    </aside>
  );
}

/* ---------- horizontal case strip (replaces left queue column) ---------- */
function CaseStrip({ cases, activeId, onPick }) {
  return (
    <div className="case-strip">
      <div className="case-strip-label">
        <span className="eyebrow">{T('rail.queue')}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>{cases.length} {T('queue.today')}</span>
      </div>
      {cases.map(c => (
        <button key={c.id} className={`case-chip ${c.id === activeId ? 'on' : ''}`} onClick={() => onPick(c.id)}>
          <div className="thumb"><img src="../../../assets/fundus-sample-1.svg" alt="" /></div>
          <div className="meta">
            <span className="id">{c.id} · {c.laterality}</span>
            <span className="nm">{c.patient}, {c.age}{c.sex}</span>
          </div>
          <Pill grade={c.grade}>{GRADE_LABELS[c.grade]}</Pill>
        </button>
      ))}
    </div>
  );
}

/* ---------- main reading view ---------- */
const FOCUS_SEG = new URLSearchParams(location.search).get('focus') === 'segmentation';
const INITIAL_VIEW = new URLSearchParams(location.search).get('view') === 'upload' ? 'upload' : 'study';

/* ---------- upload (DR) view ---------- */
function UploadView({ cases, onCreated, onOpen }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [drag, setDrag] = useState(false);
  const [form, setForm] = useState({ id: DB.nextCaseId(), laterality: 'OD', device: 'Topcon NW400', date: new Date().toISOString().slice(0,10) });
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const accept = (f) => {
    if (!f) return;
    setFile({ name: f.name, size: (f.size/1024/1024).toFixed(1) + ' Mo' });
    if (f.type && f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    else setPreview('../../../assets/fundus-sample-1.svg');
  };
  const onDrop = (e) => { e.preventDefault(); setDrag(false); accept(e.dataTransfer.files && e.dataTransfer.files[0]); };

  const run = () => {
    if (!file || busy) return;
    setBusy(true);
    // Simulate the AI inference latency, then persist the new case to the DB.
    setTimeout(() => {
      const created = DB.addCase({ id: form.id, laterality: form.laterality, device: form.device, date: form.date });
      setBusy(false);
      onCreated && onCreated(created.id);
    }, 900);
  };

  return (
    <div className="upload-view">
      <div className="upload-head">
        <div className="eyebrow">{T('up.eyebrow')}</div>
        <h1 style={{ fontSize: 26, letterSpacing: '-0.02em', margin: '4px 0 0' }}>{T('up.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--rs-ink-700)', margin: '6px 0 0' }}>{T('up.lead')}</p>
      </div>

      <div className="upload-grid">
        <div
          className={`dropzone ${drag ? 'drag' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          <input ref={inputRef} type="file" accept="image/*,.dcm,.dicom" style={{ display:'none' }} onChange={e => accept(e.target.files[0])}/>
          {!file ? (
            <>
              <div className="dz-icon"><Icon name="upload" size={28}/></div>
              <div className="dz-title">{T('up.drop')}</div>
              <div className="dz-sub">{T('up.browse')}</div>
              <div className="dz-formats mono">JPEG · PNG · DICOM · ≤ 40 Mo</div>
            </>
          ) : (
            <div className="dz-preview">
              <img src={preview} alt=""/>
              <div className="dz-file">
                <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{file.name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>{file.size} · {T('up.ready')}</div>
              </div>
              <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}><Icon name="cross" size={14}/> {T('up.remove')}</button>
            </div>
          )}
        </div>

        <div className="upload-form">
          <label className="up-field"><span>{T('up.patientId')}</span>
            <input className="up-input mono" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })}/>
          </label>
          <label className="up-field"><span>{T('up.laterality')}</span>
            <div className="seg">
              <button type="button" className={`seg-btn ${form.laterality==='OD'?'on':''}`} onClick={() => setForm({ ...form, laterality:'OD' })}>OD</button>
              <button type="button" className={`seg-btn ${form.laterality==='OS'?'on':''}`} onClick={() => setForm({ ...form, laterality:'OS' })}>OS</button>
            </div>
          </label>
          <label className="up-field"><span>{T('up.device')}</span>
            <input className="up-input" value={form.device} onChange={e => setForm({ ...form, device: e.target.value })}/>
          </label>
          <label className="up-field"><span>{T('up.date')}</span>
            <input className="up-input mono" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}/>
          </label>
          <button className="btn btn-primary up-run" disabled={!file || busy} onClick={run}>
            <Icon name={busy ? 'activity' : 'activity'} size={14}/> {busy ? T('up.running') : T('up.run')}
          </button>
        </div>
      </div>

      <div className="eyebrow" style={{ marginTop: 8 }}>{T('up.recent')}</div>
      <div className="upload-recent">
        {cases.slice(0, 4).map(c => (
          <div key={c.id} className="recent-row">
            <div className="recent-thumb"><img src="../../../assets/fundus-sample-1.svg" alt=""/></div>
            <div style={{ flex: 1 }}>
              <span className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>{c.id} · {c.laterality}</span>
              <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>{c.acquired.split(' ')[1]} · {c.device}</div>
            </div>
            <Pill grade={c.grade}>{GRADE_LABELS[c.grade]}</Pill>
            <button className="btn btn-ghost" onClick={() => onOpen(c.id)}>{T('up.open')} →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- main reading view ---------- */

/* Lesion marker pools (coords in the 400×400 fundus viewBox) */
const LESION_POOLS = {
  ma:  [{x:220,y:160},{x:270,y:180},{x:290,y:220},{x:180,y:270},{x:245,y:280},{x:305,y:155},{x:160,y:115},{x:320,y:280},{x:140,y:210},{x:265,y:300}],
  ex:  [{x:225,y:195},{x:265,y:225},{x:200,y:245},{x:285,y:195}],
  hem: [{x:150,y:230},{x:310,y:255},{x:175,y:305},{x:240,y:120},{x:300,y:300},{x:120,y:160}],
  cw:  [{x:115,y:185},{x:330,y:205}],
};

/* Seeded RNG so the generated vessel tree is stable across renders */
function makeRng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* Generate a branching 3D vessel tree once (segments with depth z) */
function genVesselTree(seed) {
  const rng = makeRng(seed);
  const segs = [];
  function branch(x, y, z, ang, pit, len, w, depth) {
    if (depth <= 0 || len < 5) return;
    const dx = Math.cos(ang) * len, dy = Math.sin(ang) * len, dz = Math.sin(pit) * len * 1.4;
    const nx = x + dx, ny = y + dy, nz = z + dz;
    segs.push({ x1:x, y1:y, z1:z, x2:nx, y2:ny, z2:nz, w });
    branch(nx, ny, nz, ang + (rng()*0.5 - 0.12), pit + (rng()*0.5 - 0.25), len*0.8, w*0.72, depth-1);
    if (rng() > 0.28) branch(nx, ny, nz, ang - (rng()*0.5 - 0.12), pit + (rng()*0.5 - 0.25), len*0.72, w*0.66, depth-1);
  }
  for (const a of [-0.7, -0.25, 0.25, 0.7]) {
    branch(-46, 0, 0, a, (rng()*0.7 - 0.35), 34, 6.5, 6);
  }
  return segs;
}

/* 3D blood-vessel structure viewer — canvas, draggable rotation + zoom */
function Vessel3D({ onClose }) {
  const canvasRef = React.useRef(null);
  const stateRef = React.useRef({ yaw: 0.5, pitch: -0.35, zoom: 1, drag: false, lx: 0, ly: 0, auto: true });
  const segs = React.useMemo(() => genVesselTree(20260607), []);
  const [auto, setAuto] = useState(true);

  React.useEffect(() => { stateRef.current.auto = auto; }, [auto]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const draw = () => {
      const st = stateRef.current;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.clientWidth, H = canvas.clientHeight;
      if (canvas.width !== W * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, focal = 320, baseScale = (Math.min(W, H) / 240) * st.zoom;
      const cosY = Math.cos(st.yaw), sinY = Math.sin(st.yaw);
      const cosX = Math.cos(st.pitch), sinX = Math.sin(st.pitch);
      const proj = (p) => {
        let x = p.x * cosY + p.z * sinY;
        let z = -p.x * sinY + p.z * cosY;
        let y = p.y * cosX - z * sinX;
        z = p.y * sinX + z * cosX;
        const s = focal / (focal + z) * baseScale;
        return { sx: cx + x * s, sy: cy + y * s, z, s };
      };
      const drawn = segs.map(sg => {
        const a = proj({ x: sg.x1, y: sg.y1, z: sg.z1 });
        const b = proj({ x: sg.x2, y: sg.y2, z: sg.z2 });
        return { a, b, w: sg.w, z: (a.z + b.z) / 2 };
      }).sort((p, q) => q.z - p.z);
      for (const d of drawn) {
        const t = Math.max(0, Math.min(1, (d.z + 120) / 240));
        const light = 1 - t;                  // closer = brighter
        const r = Math.round(40 + light * 30);
        const g = Math.round(150 + light * 70);
        const bl = Math.round(150 + light * 70);
        ctx.strokeStyle = `rgba(${r},${g},${bl},${0.35 + light * 0.6})`;
        ctx.lineWidth = Math.max(0.6, d.w * d.a.s * 0.5);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(d.a.sx, d.a.sy);
        ctx.lineTo(d.b.sx, d.b.sy);
        ctx.stroke();
      }
      // optic-disc node
      const o = proj({ x: -46, y: 0, z: 0 });
      ctx.fillStyle = '#BFE6E5';
      ctx.beginPath(); ctx.arc(o.sx, o.sy, 5 * o.s * 0.5 + 2, 0, Math.PI * 2); ctx.fill();

      if (st.auto && !st.drag) st.yaw += 0.004;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [segs]);

  const onDown = (e) => { const st = stateRef.current; st.drag = true; st.lx = e.clientX; st.ly = e.clientY; };
  const onMove = (e) => {
    const st = stateRef.current;
    if (!st.drag) return;
    st.yaw += (e.clientX - st.lx) * 0.01;
    st.pitch += (e.clientY - st.ly) * 0.01;
    st.pitch = Math.max(-1.4, Math.min(1.4, st.pitch));
    st.lx = e.clientX; st.ly = e.clientY;
  };
  const onUp = () => { stateRef.current.drag = false; };
  const onWheel = (e) => { e.preventDefault(); const st = stateRef.current; st.zoom = Math.max(0.5, Math.min(3.5, st.zoom - e.deltaY * 0.001)); };
  const reset = () => { Object.assign(stateRef.current, { yaw: 0.5, pitch: -0.35, zoom: 1 }); };

  return (
    <div className="v3d-overlay" onClick={onClose}>
      <div className="v3d-modal" onClick={e => e.stopPropagation()}>
        <div className="v3d-head">
          <div>
            <div className="eyebrow" style={{ color: 'var(--rs-canvas-fg-mute)' }}>{T('study.vesselMorph')}</div>
            <h3 style={{ margin: '4px 0 0', fontSize: 17, color: 'var(--rs-canvas-fg)' }}>{T('v3d.title')}</h3>
          </div>
          <button className="cv-btn" onClick={onClose} title={T('v3d.close')}><Icon name="cross" size={16} /></button>
        </div>
        <div className="v3d-stage">
          <canvas
            ref={canvasRef}
            className="v3d-canvas"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            onWheel={onWheel}
          />
          <div className="v3d-hint mono">{T('v3d.subtitle')}</div>
        </div>
        <div className="v3d-foot">
          <button className={`v3d-tg ${auto ? 'on' : ''}`} onClick={() => setAuto(a => !a)}>
            <Icon name="activity" size={14} /> {T('v3d.rotate')}
          </button>
          <button className="v3d-tg" onClick={reset}><Icon name="grad" size={14} /> {T('v3d.reset')}</button>
          <div className="v3d-legend mono">
            <span><i style={{ background:'#BFE6E5' }}/> {T('v3d.depth')} −</span>
            <span><i style={{ background:'#1F6E6E' }}/> {T('v3d.depth')} +</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudyViewer({ caseData, onStatus }) {
  const [overlays, setOverlays] = useState(
    FOCUS_SEG
      ? { heatmap: false, vessels: true, disc: true, boxes: false }   // eye-structure / segmentation focus
      : { heatmap: true, vessels: true, disc: false, boxes: false }
  );
  const [zoom, setZoom] = useState(1);
  const [spot, setSpot] = useState(null);    // which lesion type is located on the image
  const [show3D, setShow3D] = useState(false);
  const [toast, setToast] = useState(null);
  const reportRef = useRef(null);
  const c = caseData;
  const bd = c.lesionBreakdown || {};

  const lesionTypes = [
    { id:'ma',  label: T('study.microaneurysms'), color:'#F0683C', count: bd.ma != null ? bd.ma : Math.max(0, c.lesions - 2) },
    { id:'ex',  label: T('study.exudates'),        color:'#FFD25A', count: bd.ex != null ? bd.ex : Math.min(c.lesions, 2) },
    { id:'hem', label: T('study.hemorrhages'),     color:'#E8492E', count: bd.hem != null ? bd.hem : (c.grade >= 3 ? c.lesions - 4 : 0) },
    { id:'cw',  label: T('study.cottonWool'),      color:'#5CD6DE', count: bd.cw != null ? bd.cw : 0 },
  ];
  const spotType = lesionTypes.find(l => l.id === spot);
  const spotMarks = spotType ? LESION_POOLS[spotType.id].slice(0, spotType.count) : [];

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const onSign = () => {
    DB.saveReport(c.id, reportRef.current ? reportRef.current.value : '', 'Dr. Amina Saidi');
    flash(T('toast.signed', { id: c.id }));
    onStatus && onStatus();
  };
  const onPdf = () => {
    const win = window.open('', '_blank');
    const body = (reportRef.current ? reportRef.current.value : '').replace(/\n/g, '<br>');
    if (win) {
      win.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${c.id} — Rapport</title>
        <style>body{font:14px/1.6 -apple-system,Segoe UI,sans-serif;color:#15140F;max-width:720px;margin:40px auto;padding:0 24px}
        h1{font-size:20px;margin:0 0 4px} .meta{font-family:monospace;color:#6B6759;font-size:12px;margin-bottom:24px}
        .g{display:inline-block;padding:3px 10px;border-radius:999px;background:#FAE7D5;color:#D97A2B;font-size:12px;font-weight:600}</style></head>
        <body><h1>Octopus — Rapport de diagnostic</h1>
        <div class="meta">${c.id} · ${c.laterality} · ${c.patient}, ${c.age}${c.sex} · ${c.acquired} · ${c.device}</div>
        <p><span class="g">Grade ${c.grade} · ${GRADE_LABELS[c.grade]} · ${c.conf}%</span></p>
        <p>${body}</p>
        <hr><p class="meta">Signé — Dr. Amina Saidi · ${new Date().toLocaleString('fr-FR')}</p>
        </body></html>`);
      win.document.close();
      setTimeout(() => { try { win.print(); } catch (e) {} }, 300);
    }
    flash(T('toast.pdf', { id: c.id }));
  };
  const onSecond = () => flash(T('toast.second'));

  const probs = [0,1,2,3,4].map(i => ({
    label: `${i} · ${GRADE_LABELS[i]}`,
    value: i === c.grade ? Math.round(c.conf) : Math.round((100 - c.conf) / 4 + (Math.abs(i - c.grade) === 1 ? 6 : -1)),
  }));
  // Normalize to ~100
  const total = probs.reduce((s, p) => s + Math.max(p.value, 1), 0);
  probs.forEach(p => p.value = Math.max(1, Math.round(p.value * 100 / total)));

  return (
    <div className="study">
      {/* image canvas (dark room) */}
      <div className="canvas" data-theme="dark">
        <div className="canvas-head">
          <span className="mono pill" style={{ background: 'rgba(255,255,255,0.08)', color: '#FFF', fontSize: 11, letterSpacing: '0.1em' }}>
            {c.id} · {T('lat.' + c.laterality + '.long')}
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--rs-canvas-fg-mute)' }}>
            {c.acquired} · {c.device} · 512 × 512
          </span>
          <span style={{ marginLeft: 'auto' }} className={`pill pill-grade-${c.grade}`}>
            <span className="dot"></span>AI · {GRADE_LABELS[c.grade]} · {c.conf}%
          </span>
        </div>

        <div className="canvas-stage">
          <div className="canvas-img" style={{ transform: `scale(${zoom})` }}>
            <img src="../../../assets/fundus-sample-1.svg" alt="fundus" />
            {overlays.heatmap && <img className="ovl heatmap" src="../../../assets/fundus-sample-heatmap.svg" alt="" />}
            {overlays.vessels && <img className="ovl vessels" src="../../../assets/vessel-mask.svg" alt="" />}
            {overlays.boxes && (
              <svg className="ovl" viewBox="0 0 400 400">
                <rect x="210" y="150" width="40" height="30" fill="none" stroke="#FFD25A" strokeWidth="1.5" strokeDasharray="3 2"/>
                <rect x="260" y="200" width="36" height="30" fill="none" stroke="#FFD25A" strokeWidth="1.5" strokeDasharray="3 2"/>
                <rect x="180" y="250" width="42" height="28" fill="none" stroke="#FFD25A" strokeWidth="1.5" strokeDasharray="3 2"/>
              </svg>
            )}
            {overlays.disc && (
              <svg className="ovl" viewBox="0 0 400 400">
                <circle cx="135" cy="190" r="32" fill="none" stroke="#A6F0F1" strokeWidth="1.5" strokeDasharray="4 2"/>
                <circle cx="135" cy="190" r="14" fill="none" stroke="#A6F0F1" strokeWidth="1.5"/>
              </svg>
            )}
            {spotMarks.length > 0 && (
              <svg className="ovl spot-layer" viewBox="0 0 400 400">
                {spotMarks.map((m, i) => (
                  <g key={i} className="spot-mark">
                    <circle cx={m.x} cy={m.y} r="18" fill={spotType.color} opacity="0.16"/>
                    <circle cx={m.x} cy={m.y} r="15" fill="none" stroke={spotType.color} strokeWidth="2" opacity="0.95"/>
                    <circle cx={m.x} cy={m.y} r="15" fill="none" stroke={spotType.color} strokeWidth="2.5" className="spot-pulse"/>
                    <circle cx={m.x} cy={m.y} r="3" fill="#fff"/>
                    <circle cx={m.x} cy={m.y} r="3" fill={spotType.color} opacity="0.6"/>
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>

        <div className="canvas-toolbar">
          <button className="cv-btn" onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}><Icon name="plus" /></button>
          <button className="cv-btn" onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}><Icon name="cross" size={14} /></button>
          <span className="mono" style={{ fontSize: 11, padding: '0 8px', color: 'var(--rs-canvas-fg-mute)', alignSelf: 'center' }}>{Math.round(zoom*100)}%</span>
          <span className="cv-sep"></span>
          <button className={`cv-btn ${overlays.heatmap ? 'on' : ''}`} onClick={() => setOverlays({ ...overlays, heatmap: !overlays.heatmap })} title="Grad-CAM"><Icon name="heatmap" /></button>
          <button className={`cv-btn ${overlays.vessels ? 'on' : ''}`} onClick={() => setOverlays({ ...overlays, vessels: !overlays.vessels })} title="Vessels"><Icon name="activity" /></button>
          <button className={`cv-btn ${overlays.disc ? 'on' : ''}`} onClick={() => setOverlays({ ...overlays, disc: !overlays.disc })} title="Disc / cup"><Icon name="grad" /></button>
          <button className={`cv-btn ${overlays.boxes ? 'on' : ''}`} onClick={() => setOverlays({ ...overlays, boxes: !overlays.boxes })} title="Lesion boxes"><Icon name="layers" /></button>
        </div>
      </div>

      {/* right column — AI panel + report builder */}
      <div className="right">
        <div className="patient">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{c.patient}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--rs-fg-muted)' }}>
                {c.age}{c.sex} · MRN 8847{c.id.slice(-2)} · Diabetes T2
              </div>
            </div>
            <button className="btn btn-ghost"><Icon name="history" /> {T('study.history')}</button>
          </div>
          <div className="patient-note">{c.note}</div>
        </div>

        <div className="card panel">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div className="eyebrow">{T('study.aiAnalysis')}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{T('study.aiGrade')}</div>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--rs-overlay-violet)', letterSpacing: '0.08em' }}>
              {T('study.modelTag')}
            </span>
          </div>
          <div style={{ marginTop: 14 }}>
            <SeverityBar probs={probs} />
          </div>
        </div>

        <div className={`card panel ${FOCUS_SEG ? 'panel-focus' : ''}`}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow">{T('study.vesselMorph')}</div>
            <button className="btn btn-secondary btn-3d" onClick={() => setShow3D(true)}>
              <Icon name="cube" size={14} /> {T('study.view3d')}
            </button>
          </div>
          <div className="metrics">
            <div className="metric"><span className="k">{T('study.metric.av')}</span><span className="v">{c.av}</span><span className="trend">{T('study.metric.av.note')}</span></div>
            <div className="metric"><span className="k">{T('study.metric.tort')}</span><span className="v">1.18</span><span className="trend">{T('study.metric.tort.note')}</span></div>
            <div className="metric"><span className="k">{T('study.metric.fractal')}</span><span className="v">1.42</span><span className="trend">{T('study.metric.fractal.note')}</span></div>
            <div className="metric"><span className="k">{T('study.metric.dice')}</span><span className="v">0.87</span><span className="trend">{T('study.metric.dice.note')}</span></div>
          </div>
        </div>

        <div className="card panel">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div className="eyebrow">{T('study.lesion')}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{T('study.lesionsFound', { n: c.lesions })}</div>
            </div>
            {spot && <button className="btn btn-ghost btn-clear" onClick={() => setSpot(null)}><Icon name="cross" size={12} /></button>}
          </div>
          <div className="lesions">
            {lesionTypes.map(lt => {
              const disabled = lt.count === 0;
              const active = spot === lt.id;
              return (
                <button
                  key={lt.id}
                  className={`lesion lesion-btn ${active ? 'on' : ''} ${disabled ? 'is-empty' : ''}`}
                  onClick={() => !disabled && setSpot(active ? null : lt.id)}
                  disabled={disabled}
                  style={active ? { '--spot': lt.color } : undefined}
                >
                  <span className="dot" style={{ background: lt.color }}></span>
                  <span className="lesion-label">{lt.label}</span>
                  {!disabled && <span className="lesion-locate mono">{active ? '● ' + T('study.locate') : T('study.locate')}</span>}
                  <span className="mono lesion-count">{disabled ? T('study.noLesion') : lt.count}</span>
                </button>
              );
            })}
          </div>
          <div className="lesion-hint">{T('study.spotHint')}</div>
        </div>

        <div className="card panel">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow">{T('study.report')}</div>
            {c.status === 'signed' && <span className="status-signed mono"><Icon name="check" size={12} /> {T('study.signed')}</span>}
          </div>
          <textarea key={c.id} ref={reportRef} className="report-area" defaultValue={`Rétinopathie diabétique — ${GRADE_LABELS[c.grade].toLowerCase()} (grade ETDRS ${c.grade}). ${c.lesions} lésion(s) identifiée(s), à prédominance dans le quadrant temporal inférieur. Ratio A:V ${c.av} dans la plage de référence. Confiance IA ${c.conf}%.\n\nRecommandation : ${c.grade >= 3 ? 'Adresser à un spécialiste de la rétine sous 4 semaines.' : c.grade >= 1 ? 'Nouveau dépistage dans 6 mois.' : 'Dépistage annuel.'}`} />
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <button className="btn btn-secondary" onClick={onSecond}><Icon name="chat" /> {T('study.secondOpinion')}</button>
            <div className="row">
              <button className="btn btn-secondary" onClick={onPdf}><Icon name="download" /> PDF</button>
              <button className="btn btn-primary" onClick={onSign}><Icon name="check" /> {T('study.sign')}</button>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="rs-toast"><Icon name="check" size={14} /> {toast}</div>}
      {show3D && <Vessel3D onClose={() => setShow3D(false)} />}
    </div>
  );
}

/* ---------- root ---------- */
function App() {
  const [cases, setCases] = useState(() => DB.listCases());
  const [activeId, setActiveId] = useState(cases[0] ? cases[0].id : null);
  const [section, setSection] = useState(INITIAL_VIEW);

  // keep the view in sync with the local DB (upload, sign, etc.)
  useEffect(() => DB.onChange(() => setCases(DB.listCases())), []);

  const activeCase = cases.find(c => c.id === activeId) || cases[0];
  const pendingCount = cases.filter(c => c.status === 'pending' || c.status === 'flagged' || c.status === 'urgent').length;

  const openCase = (id) => { setActiveId(id); setSection('study'); };

  const SECTION_LABELS = {
    upload: T('rail.upload'), queue: T('crumbs.queue'), study: T('crumbs.activeStudy'),
    patients: T('rail.patients'), reports: T('rail.reports'), atlas: T('rail.atlas'), outcomes: T('rail.outcomes'),
  };

  let body;
  if (section === 'upload') {
    body = <UploadView cases={cases} onCreated={openCase} onOpen={openCase} />;
  } else if (section === 'queue') {
    body = <QueuePage cases={cases} onOpen={openCase} />;
  } else if (section === 'patients') {
    body = <PatientsPage cases={cases} onOpen={openCase} />;
  } else if (section === 'reports') {
    body = <ReportsPage onOpen={openCase} />;
  } else if (section === 'atlas') {
    body = <AtlasPage />;
  } else if (section === 'outcomes') {
    body = <OutcomesPage cases={cases} />;
  } else {
    body = (
      <div className="study-shell">
        <CaseStrip cases={cases} activeId={activeCase ? activeCase.id : null} onPick={setActiveId} />
        {activeCase && <StudyViewer key={activeCase.id} caseData={activeCase} onStatus={() => setCases(DB.listCases())} />}
      </div>
    );
  }

  return (
    <div className="app">
      <DoctorRail active={section} setActive={setSection} count={pendingCount} />
      <TopBar
        crumbs={[T('crumbs.clinical'), SECTION_LABELS[section] || '', section === 'study' && activeCase ? `${activeCase.id} · ${activeCase.patient}` : '']}
        searchPlaceholder={T('topbar.search.cases')}
      />
      <main className="main">{body}</main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
