/* Shared chrome components for all Octopus UI kits.
   Exported globally to window so each kit's main script can use them. */

const { useState } = React;

const Logo = ({ size = 26 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none">
    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" />
    <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
    <path d="M32 4 C 18 18, 18 46, 32 60" stroke="currentColor" strokeWidth="1.25" opacity="0.55" strokeLinecap="round" />
    <path d="M32 4 C 46 18, 46 46, 32 60" stroke="currentColor" strokeWidth="1.25" opacity="0.55" strokeLinecap="round" />
    <circle cx="32" cy="32" r="3.5" fill="currentColor" />
  </svg>
);

/** Lightweight Lucide-style stroke icons. 24x24, 1.5 stroke. */
const Icon = ({ name, size = 16 }) => {
  const paths = {
    eye: <><circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7"/></>,
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
    layers: <><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></>,
    book: <path d="M4 4a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 1 2-2h13"/>,
    folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    users: <><circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 20a7 7 0 0 0-5-6.7"/></>,
    settings: <><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/><circle cx="12" cy="12" r="3"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    download: <><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
    upload: <><path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M5 3h14"/></>,
    play: <path d="M6 4l14 8-14 8z"/>,
    check: <path d="M5 12l5 5L20 7"/>,
    cross: <path d="M5 5l14 14M19 5L5 19"/>,
    grad: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6.5" opacity="0.6"/><circle cx="12" cy="12" r="3" opacity="0.4"/><circle cx="12" cy="12" r="1" fill="currentColor"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    database: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/></>,
    flask: <path d="M9 3h6M10 3v7l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/>,
    list: <><path d="M3 6h18M3 12h18M3 18h18"/></>,
    chart: <><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-7"/></>,
    chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    flag: <><path d="M5 21V4M5 4l11 4-3 3 3 3H5"/></>,
    award: <><circle cx="12" cy="9" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/></>,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="14" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/></>,
    cpu: <><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></>,
    history: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M3 12a9 9 0 0 1 9-9"/></>,
    lock: <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    key: <><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9 2 2-2 2 2 2-2 2-2-2-3 3"/></>,
    palette: <><path d="M12 22a10 10 0 1 1 10-10c0 3-3 4-5 4h-2a2 2 0 0 0-1 4 2 2 0 0 1-2 2"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor"/><circle cx="12" cy="7" r="1" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1" fill="currentColor"/></>,
    cube: <><path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></>,
    bug: <><rect x="8" y="6" width="8" height="14" rx="4"/><path d="M3 11h5M16 11h5M3 17h5M16 17h5M9 6V4a3 3 0 0 1 6 0v2"/></>,
    bell2: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></>,
    arrowR: <path d="M5 12h14M13 6l6 6-6 6"/>,
    link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/></>,
  };
  return (
    <svg className="ico" viewBox="0 0 24 24" width={size} height={size}
         fill={['heatmap','severityDot'].includes(name) ? 'currentColor' : 'none'}
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  );
};

const RailBrand = ({ subtitle = "CLINICAL · AI" }) => {
  const T = (k) => (window.t ? window.t(k) : k);
  const [collapsed, setCollapsedState] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('rail-collapsed')
  );
  const toggle = () => {
    const next = !collapsed;
    setCollapsedState(next);
    document.documentElement.classList.toggle('rail-collapsed', next);
    try { localStorage.setItem('octopus.rail.collapsed', next ? '1' : '0'); } catch (e) {}
  };
  return (
    <div className="rail-brand">
      <button
        className="rail-collapse-btn"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        type="button"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <path d="M9 4v16"/>
        </svg>
      </button>
      <div className="rail-brand-logo"><Logo /></div>
      <div className="rail-brand-text">
        <div className="name">{T('brand.name') || 'Octopus'}</div>
        <div className="tag">{subtitle}</div>
      </div>
    </div>
  );
};

const RailItem = ({ icon, label, count, on, onClick }) => (
  <button className={`rail-item ${on ? 'on' : ''}`} onClick={onClick} title={label} aria-label={label}>
    <Icon name={icon} />
    <span className="rail-item-label">{label}</span>
    {count != null ? <span className="count mono">{count}</span> : null}
  </button>
);

/* User chip in the rail foot — clicking it opens a popover menu modelled on
   the screenshot the team shared (Settings · Language · Help · Profile · Apps ·
   Invite · Learn more · Log out, with email at the top and plan at the bottom).
   Same component used in all three perspectives (doctor / student / admin). */
const RailUser = ({ initials, name, role, email, profile = 'doctor' }) => {
  const T = (k, fb) => (window.t ? window.t(k) : (fb || k));
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const planKey = profile === 'student' ? 'usermenu.plan.student'
                : profile === 'admin'   ? 'usermenu.plan.admin'
                : 'usermenu.plan.doctor';

  const setLang = (next) => {
    if (window.octopusI18n) window.octopusI18n.setLang(next);
    setLangOpen(false);
    setOpen(false);
  };
  const currentLang = window.octopusI18n ? window.octopusI18n.getLang() : 'fr';

  return (
    <div className="rail-user-wrap" ref={ref}>
      {open && (
        <div className="usermenu" role="menu">
          <div className="um-email mono" title={email}>{email}</div>

          <button className="um-item" role="menuitem" onClick={() => { setOpen(false); location.href = `../settings/index.html?profile=${profile}`; }}>
            <Icon name="settings" />
            <span className="um-lbl">{T('usermenu.settings')}</span>
            <span className="um-kbd mono">{T('usermenu.settings.kbd')}</span>
          </button>

          <div className="um-sub-wrap" onMouseLeave={() => setLangOpen(false)}>
            <button className="um-item" role="menuitem" onClick={() => setLangOpen(v => !v)} onMouseEnter={() => setLangOpen(true)}>
              <Icon name="globe" />
              <span className="um-lbl">{T('usermenu.language')}</span>
              <span className="um-caret">›</span>
            </button>
            {langOpen && (
              <div className="usermenu um-submenu" role="menu" aria-label={T('usermenu.lang.label')}>
                <button className={`um-item ${currentLang === 'fr' ? 'on' : ''}`} role="menuitemradio" aria-checked={currentLang === 'fr'} onClick={() => setLang('fr')}>
                  <span className="um-flag" aria-hidden="true">🇫🇷</span>
                  <span className="um-lbl">{T('usermenu.lang.fr')}</span>
                  {currentLang === 'fr' && <Icon name="check" />}
                </button>
                <button className={`um-item ${currentLang === 'en' ? 'on' : ''}`} role="menuitemradio" aria-checked={currentLang === 'en'} onClick={() => setLang('en')}>
                  <span className="um-flag" aria-hidden="true">🇬🇧</span>
                  <span className="um-lbl">{T('usermenu.lang.en')}</span>
                  {currentLang === 'en' && <Icon name="check" />}
                </button>
              </div>
            )}
          </div>

          <button className="um-item" role="menuitem">
            <Icon name="chat" />
            <span className="um-lbl">{T('usermenu.help')}</span>
          </button>

          <div className="um-sep"/>

          <button className="um-item" role="menuitem">
            <Icon name="user" />
            <span className="um-lbl">{T('usermenu.profile')}</span>
          </button>
          <button className="um-item" role="menuitem">
            <Icon name="download" />
            <span className="um-lbl">{T('usermenu.apps')}</span>
          </button>
          <button className="um-item" role="menuitem">
            <Icon name="users" />
            <span className="um-lbl">{T('usermenu.invite')}</span>
          </button>
          <button className="um-item" role="menuitem">
            <Icon name="book" />
            <span className="um-lbl">{T('usermenu.learn')}</span>
            <span className="um-caret">›</span>
          </button>

          <div className="um-sep"/>

          <button className="um-item um-danger" role="menuitem" onClick={() => { try { window.OctopusDB && window.OctopusDB.logout(); } catch(e){} location.href = '../index.html'; }}>
            <Icon name="arrowR" />
            <span className="um-lbl">{T('usermenu.signout')}</span>
          </button>
        </div>
      )}

      <button
        className={`rail-user ${open ? 'on' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        type="button"
      >
        <div className="avatar">{initials}</div>
        <div className="who">
          <span className="n">{name}</span>
          <span className="r mono">{T(planKey)}</span>
        </div>
        <span className="um-trigger-caret" aria-hidden="true">⌃</span>
      </button>
    </div>
  );
};

const TopBar = ({ crumbs, searchPlaceholder = "Search cases, patients, datasets…", actions }) => (
  <div className="topbar">
    <div className="crumbs">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ opacity: 0.5 }}>›</span>}
          <span className={i === crumbs.length - 1 ? 'now' : ''}>{c}</span>
        </React.Fragment>
      ))}
    </div>
    <div className="search">
      <Icon name="search" size={14} />
      <span>{searchPlaceholder}</span>
      <span className="mono" style={{ marginLeft: 'auto', color: 'var(--rs-fg-subtle)', fontSize: 11 }}>⌘K</span>
    </div>
    <div className="actions">
      {actions || (
        <>
          <button className="icon-btn"><Icon name="bell" /></button>
          <button className="icon-btn"><Icon name="settings" /></button>
        </>
      )}
    </div>
  </div>
);

const Pill = ({ grade, children }) => (
  <span className={`pill pill-grade-${grade}`}>
    <span className="dot"></span>{children}
  </span>
);

const SeverityBar = ({ probs }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {probs.map((p, i) => (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 44px', gap: 10, alignItems: 'center', fontSize: 12 }}>
        <span>{p.label}</span>
        <div style={{ height: 8, background: 'var(--rs-ink-100)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${p.value}%`, background: `var(--rs-grade-${i})`, borderRadius: 'inherit' }} />
        </div>
        <span className="mono" style={{ textAlign: 'right', fontSize: 11, color: 'var(--rs-ink-700)', fontWeight: p.value > 50 ? 600 : 400 }}>{p.value}%</span>
      </div>
    ))}
  </div>
);

Object.assign(window, { Logo, Icon, RailBrand, RailItem, RailUser, TopBar, Pill, SeverityBar });
