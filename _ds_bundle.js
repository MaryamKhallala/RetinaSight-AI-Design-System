/* @ds-bundle: {"format":3,"namespace":"RetinaSightAIDesignSystem_019e04","components":[],"sourceHashes":{"docs_livrable/animations.jsx":"ebe6809a6cbe","docs_livrable/video/scenes.jsx":"0713a9561c23","lib/db.js":"90f6710a6832","lib/i18n.js":"47c8787b08b2","lib/monitoring.js":"526ab6f4d202","web/admin/app.jsx":"ecadb3d38c05","web/doctor/app.jsx":"317e595b16d6","web/doctor/pages.jsx":"28316d996e74","web/settings/app.jsx":"7bf400289e13","web/student/app.jsx":"38819f3b751f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RetinaSightAIDesignSystem_019e04 = window.RetinaSightAIDesignSystem_019e04 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// docs_livrable/animations.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// animations.jsx
// Reusable animation starter: Stage, Timeline, Sprite, easing helpers.
// Exports (to window): Stage, Sprite, PlaybackBar, TextSprite, ImageSprite, RectSprite,
//   useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp.
//
// Usage (in an HTML file that loads React + Babel):
//
//   <Stage width={1280} height={720} duration={10} background="#f6f4ef">
//     <MyScene />
//   </Stage>
//
// <Stage> auto-scales to the viewport and provides the scrubber, play/pause,
// ←/→ seek, space, and 0-to-reset controls, and persists the playhead.
// Inside <Stage>, any child can call useTime() to read the current
// playhead (seconds). Or wrap content in <Sprite start={1} end={4}>...</Sprite>
// to only render during that window -- children receive a `localTime` and
// `progress` via the useSprite() hook. Use Easing + interpolate()/animate()
// for tweens; TextSprite / ImageSprite / RectSprite have built-in entry/exit.
// Build YOUR scenes by composing Sprites inside a Stage.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing functions (hand-rolled, Popmotion-style) ─────────────────────────
// All easings take t ∈ [0,1] and return eased t ∈ [0,1] (may overshoot for back/elastic).
const Easing = {
  linear: t => t,
  // Quad
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  // Cubic
  easeInCubic: t => t * t * t,
  easeOutCubic: t => --t * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // Quart
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - --t * t * t * t,
  easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  // Expo
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: t => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },
  // Sine
  easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: t => Math.sin(t * Math.PI / 2),
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  // Back (overshoot)
  easeOutBack: t => {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: t => {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: t => {
    const c1 = 1.70158,
      c2 = c1 * 1.525;
    return t < 0.5 ? Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  // Elastic
  easeOutElastic: t => {
    const c4 = 2 * Math.PI / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};

// ── Core interpolation helpers ──────────────────────────────────────────────

// Clamp a value to [min, max]
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// interpolate([0, 0.5, 1], [0, 100, 50], ease?) -> fn(t)
// Popmotion-style: linearly maps t across input keyframes to output values,
// with optional easing per segment (single fn or array of fns).
function interpolate(input, output, ease = Easing.linear) {
  return t => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? ease[i] || Easing.linear : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// animate({from, to, start, end, ease})(t) — simpler single-segment tween.
// Returns `from` before `start`, `to` after `end`.
function animate({
  from = 0,
  to = 1,
  start = 0,
  end = 1,
  ease = Easing.easeInOutCubic
}) {
  return t => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// ── Timeline context ────────────────────────────────────────────────────────

const TimelineContext = React.createContext({
  time: 0,
  duration: 10,
  playing: false
});
const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

// ── Sprite ──────────────────────────────────────────────────────────────────
// Renders children only when the playhead is inside [start, end]. Provides
// a sub-context with `localTime` (seconds since start) and `progress` (0..1).
//
//   <Sprite start={2} end={5}>
//     {({ localTime, progress }) => <Thing x={progress * 100} />}
//   </Sprite>
//
// Or as a plain wrapper — children can call useSprite() themselves.

const SpriteContext = React.createContext({
  localTime: 0,
  progress: 0,
  duration: 0
});
const useSprite = () => React.useContext(SpriteContext);
function Sprite({
  start = 0,
  end = Infinity,
  children,
  keepMounted = false
}) {
  const {
    time
  } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;
  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration) ? clamp(localTime / duration, 0, 1) : 0;
  const value = {
    localTime,
    progress,
    duration,
    visible
  };
  return /*#__PURE__*/React.createElement(SpriteContext.Provider, {
    value: value
  }, typeof children === 'function' ? children(value) : children);
}

// ── Sample sprite components ────────────────────────────────────────────────

// TextSprite: fades/slides text in on entry, holds, then fades out on exit.
// Props: text, x, y, size, color, font, entryDur, exitDur, align
function TextSprite({
  text,
  x = 0,
  y = 0,
  size = 48,
  color = '#111',
  font = 'Inter, system-ui, sans-serif',
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = 'left',
  letterSpacing = '-0.01em'
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let ty = 0;
  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }
  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(${translateX}, ${ty}px)`,
      opacity,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing,
      whiteSpace: 'pre',
      lineHeight: 1.1,
      willChange: 'transform, opacity'
    }
  }, text);
}

// ImageSprite: scales + fades in; optional Ken Burns drift during hold.
function ImageSprite({
  src,
  x = 0,
  y = 0,
  width = 400,
  height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = 'cover',
  placeholder = null // {label: string} for striped placeholder
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let scale = 1;
  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }
  const content = placeholder ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)',
      color: '#6b6458',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 13,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, placeholder.label || 'image') : /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: fit,
      display: 'block'
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: radius,
      overflow: 'hidden',
      willChange: 'transform, opacity'
    }
  }, content);
}

// RectSprite: simple rectangle that animates position/size/color via props.
// Useful demo primitive — takes a `render` fn for per-frame customization.
function RectSprite({
  x = 0,
  y = 0,
  width = 100,
  height = 100,
  color = '#111',
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const {
    localTime,
    duration
  } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let scale = 1;
  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }
  const overrides = render ? render(spriteCtx) : {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      background: color,
      borderRadius: radius,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      ...overrides
    }
  });
}
function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  fps = 60,
  loop = true,
  autoplay = true,
  persistKey = 'animstage',
  children
}) {
  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch {
      return 0;
    }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);
  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Persist playhead
  React.useEffect(() => {
    try {
      localStorage.setItem(persistKey + ':t', String(time));
    } catch {}
  }, [time, persistKey]);

  // Auto-scale to fit viewport
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44; // playback bar height
      const s = Math.min(el.clientWidth / width, (el.clientHeight - barH) / height);
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, height]);

  // Animation loop
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = ts => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime(t => {
        let next = t + dt;
        if (next >= duration) {
          if (loop) next = next % duration;else {
            next = duration;
            setPlaying(false);
          }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loop]);

  // Keyboard: space = play/pause, ← → = seek
  React.useEffect(() => {
    const onKey = e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(p => !p);
      } else if (e.code === 'ArrowLeft') {
        setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === 'ArrowRight') {
        setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === '0' || e.code === 'Home') {
        setTime(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);
  const displayTime = hoverTime != null ? hoverTime : time;
  const ctxValue = React.useMemo(() => ({
    time: displayTime,
    duration,
    playing,
    setTime,
    setPlaying
  }), [displayTime, duration, playing]);
  return /*#__PURE__*/React.createElement("div", {
    ref: stageRef,
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#0a0a0a',
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: canvasRef,
    style: {
      width,
      height,
      background,
      position: 'relative',
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      flexShrink: 0,
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(TimelineContext.Provider, {
    value: ctxValue
  }, children))), /*#__PURE__*/React.createElement(PlaybackBar, {
    time: displayTime,
    actualTime: time,
    duration: duration,
    playing: playing,
    onPlayPause: () => setPlaying(p => !p),
    onReset: () => {
      setTime(0);
    },
    onSeek: t => setTime(t),
    onHover: t => setHoverTime(t)
  }));
}

// ── Playback bar ────────────────────────────────────────────────────────────
// Play/pause, return-to-begin, scrub track, time display.
// Uses fixed-width time fields so layout doesn't thrash.

function PlaybackBar({
  time,
  duration,
  playing,
  onPlayPause,
  onReset,
  onSeek,
  onHover
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const timeFromEvent = React.useCallback(e => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);
  const onTrackMove = e => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };
  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };
  const onTrackDown = e => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };
  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = e => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);
  const pct = duration > 0 ? time / duration * 100 : 0;
  const fmt = t => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor(total * 100 % 100);
    return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };
  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px',
      background: 'rgba(20,20,20,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',
      borderRadius: 8,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    onClick: onReset,
    title: "Return to start (0)"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 2v10M12 2L5 7l7 5V2z",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement(IconButton, {
    onClick: onPlayPause,
    title: "Play/pause (space)"
  }, playing ? /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "2",
    width: "3",
    height: "10",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "2",
    width: "3",
    height: "10",
    fill: "currentColor"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 2l9 5-9 5V2z",
    fill: "currentColor"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: mono,
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      width: 64,
      textAlign: 'right',
      color: '#f6f4ef'
    }
  }, fmt(time)), /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    onMouseMove: onTrackMove,
    onMouseLeave: onTrackLeave,
    onMouseDown: onTrackDown,
    style: {
      flex: 1,
      height: 22,
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 4,
      background: 'rgba(255,255,255,0.12)',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      width: `${pct}%`,
      height: 4,
      background: 'oklch(72% 0.12 250)',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${pct}%`,
      top: '50%',
      width: 12,
      height: 12,
      marginLeft: -6,
      marginTop: -6,
      background: '#fff',
      borderRadius: 6,
      boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: mono,
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      width: 64,
      textAlign: 'left',
      color: 'rgba(246,244,239,0.55)'
    }
  }, fmt(duration)));
}
function IconButton({
  children,
  onClick,
  title
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    title: title,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 6,
      color: '#f6f4ef',
      cursor: 'pointer',
      padding: 0,
      transition: 'background 120ms'
    }
  }, children);
}
Object.assign(window, {
  Easing,
  interpolate,
  animate,
  clamp,
  TimelineContext,
  useTime,
  useTimeline,
  Sprite,
  SpriteContext,
  useSprite,
  TextSprite,
  ImageSprite,
  RectSprite,
  Stage,
  PlaybackBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "docs_livrable/animations.jsx", error: String((e && e.message) || e) }); }

// docs_livrable/video/scenes.jsx
try { (() => {
/* 3D explainer — scenes for "Collaborative SLMs as Reliable Code Judges".
   Composes Sprites from animations.jsx inside a Stage (see video.html).
   Visual language: dark space, perspective depth, teal generator / violet judge /
   red gaps. All 3D via CSS perspective + preserve-3d. */

const {
  useSprite,
  useTime,
  useTimeline,
  Sprite,
  TextSprite,
  interpolate,
  animate,
  clamp,
  Easing
} = window;
const C = {
  bg: '#080C11',
  ink: '#E8ECEF',
  mute: '#8A95A0',
  faint: '#5A6570',
  teal: '#2DD4BF',
  tealDeep: '#0F5751',
  tealGlow: 'rgba(45,212,191,.55)',
  violet: '#A78BFA',
  violetDeep: '#4F3A8C',
  violetGlow: 'rgba(167,139,250,.5)',
  red: '#F0683C',
  redDeep: '#7A2A18',
  amber: '#E8B73A',
  green: '#34D399',
  sans: '"IBM Plex Sans",system-ui,sans-serif',
  mono: '"IBM Plex Mono",monospace'
};
const W = 1920,
  H = 1080;

/* ---------- helpers ---------- */
const ease = t => Easing.easeInOutCubic(clamp(t, 0, 1));
// entry/exit envelope: ramps 0→1 over `inDur`, holds, 1→0 over `outDur`
function env(local, dur, inDur = 0.5, outDur = 0.5) {
  const a = clamp(local / inDur, 0, 1);
  const b = 1 - clamp((local - (dur - outDur)) / outDur, 0, 1);
  return Math.min(Easing.easeOutCubic(a), Easing.easeInCubic ? b < 1 ? b : 1 : b);
}

/* ---------- 3D primitives ---------- */
function Cube({
  size = 160,
  color = C.teal,
  deep = C.tealDeep,
  glow = C.tealGlow,
  label,
  sub,
  spin = 0,
  lift = 0,
  opacity = 1
}) {
  const h = size / 2;
  const faces = [{
    t: `rotateY(0deg) translateZ(${h}px)`,
    b: color
  }, {
    t: `rotateY(90deg) translateZ(${h}px)`,
    b: deep
  }, {
    t: `rotateY(180deg) translateZ(${h}px)`,
    b: deep
  }, {
    t: `rotateY(-90deg) translateZ(${h}px)`,
    b: color
  }, {
    t: `rotateX(90deg) translateZ(${h}px)`,
    b: '#fff'
  }, {
    t: `rotateX(-90deg) translateZ(${h}px)`,
    b: deep
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: size,
      height: size,
      transformStyle: 'preserve-3d',
      transform: `translateY(${lift}px) rotateX(-18deg) rotateY(${spin}deg)`,
      opacity
    }
  }, faces.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      width: size,
      height: size,
      transform: f.t,
      background: i === 4 ? `linear-gradient(135deg, ${color}, #fff)` : f.b,
      opacity: i === 4 ? 0.92 : i === 1 || i === 2 || i === 5 ? 0.62 : 0.95,
      border: `1px solid rgba(255,255,255,.18)`,
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -size * 0.5,
      transform: 'translateZ(-2px)',
      background: `radial-gradient(circle, ${glow}, transparent 68%)`,
      filter: 'blur(8px)'
    }
  }), label && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: size,
      height: size,
      transform: `translateZ(${h + 1}px)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#06140F',
      fontFamily: C.mono,
      fontWeight: 600,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: size * 0.2,
      letterSpacing: '.02em'
    }
  }, label), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: size * 0.085,
      opacity: .75,
      marginTop: 4
    }
  }, sub)));
}
function Grid3D() {
  const t = useTime();
  const shift = t * 40 % 80;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      perspective: '700px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '-30%',
      right: '-30%',
      bottom: '-10%',
      height: '85%',
      transform: 'rotateX(74deg)',
      transformOrigin: 'center bottom',
      backgroundImage: `linear-gradient(${C.teal}22 1px, transparent 1px), linear-gradient(90deg, ${C.teal}22 1px, transparent 1px)`,
      backgroundSize: '80px 80px',
      backgroundPosition: `0 ${shift}px`,
      maskImage: 'linear-gradient(to top, #000 0%, transparent 75%)',
      WebkitMaskImage: 'linear-gradient(to top, #000 0%, transparent 75%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(120% 80% at 50% 18%, ${C.tealDeep}33, transparent 60%)`
    }
  }));
}
function Vignette() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      boxShadow: 'inset 0 0 280px rgba(0,0,0,.85)',
      background: 'radial-gradient(130% 120% at 50% 50%, transparent 55%, rgba(0,0,0,.55))'
    }
  });
}

/* floating code glyphs */
function CodeBits({
  n = 14,
  color = C.teal
}) {
  const t = useTime();
  const bits = ['{ }', '( )', 'if', '==', '>=', 'return', 'for', '=>', '[ ]', '0xF', 'def', '&&', '!=', '++'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden'
    }
  }, Array.from({
    length: n
  }).map((_, i) => {
    const seed = i * 97 % 100 / 100;
    const x = seed * 100;
    const y = (seed * 53 + t * (6 + seed * 10)) % 120 - 10;
    const op = 0.10 + 0.22 * (i * 31 % 100 / 100);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        color,
        opacity: op,
        fontFamily: C.mono,
        fontSize: 13 + i % 4 * 5,
        transform: `translateZ(0)`
      }
    }, bits[i % bits.length]);
  }));
}

/* heading shown top-center */
function Heading({
  text,
  color = C.ink,
  sub
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const o = env(localTime, duration, 0.5, 0.5);
  const ty = (1 - clamp(localTime / 0.5, 0, 1)) * -20;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 70,
      left: 0,
      right: 0,
      textAlign: 'center',
      opacity: o,
      transform: `translateY(${ty}px)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: C.mono,
      fontSize: 15,
      letterSpacing: '.34em',
      textTransform: 'uppercase',
      color,
      fontWeight: 500
    }
  }, text), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: C.sans,
      fontSize: 19,
      color: C.mute,
      marginTop: 10
    }
  }, sub));
}

/* a 3D info card with depth + parallax */
function Card3D({
  x,
  y,
  w = 420,
  h = 300,
  accent = C.teal,
  icon,
  title,
  body,
  delay = 0,
  rotY = 0,
  z = 0
}) {
  const {
    localTime
  } = useSprite();
  const lt = localTime - delay;
  const a = clamp(lt / 0.6, 0, 1);
  const e = Easing.easeOutCubic(a);
  const enter = 1 - e;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      transformStyle: 'preserve-3d',
      transform: `translateZ(${z}px) rotateY(${rotY}deg) translateY(${enter * 60}px) scale(${0.85 + 0.15 * e})`,
      opacity: a
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(150deg, rgba(26,34,43,.96), rgba(12,18,24,.96))',
      border: `1px solid ${accent}55`,
      borderRadius: 20,
      boxShadow: `0 30px 60px rgba(0,0,0,.5), 0 0 40px ${accent}22`,
      padding: '30px 32px',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 58,
      height: 58,
      borderRadius: 14,
      background: `${accent}1f`,
      border: `1px solid ${accent}66`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
      marginBottom: 18
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: C.sans,
      fontWeight: 600,
      fontSize: 25,
      color: C.ink,
      lineHeight: 1.2
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: C.sans,
      fontSize: 17,
      color: C.mute,
      marginTop: 12,
      lineHeight: 1.5
    }
  }, body), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      bottom: 0,
      height: 4,
      width: '100%',
      background: accent,
      borderRadius: '0 0 20px 20px',
      opacity: .8
    }
  })));
}

/* big centered statement with per-line depth pop */
function BigStatement({
  lines
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const o = env(localTime, duration, 0.6, 0.6);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: o,
      perspective: '900px'
    }
  }, lines.map((ln, i) => {
    const lt = localTime - 0.25 - i * 0.28;
    const a = clamp(lt / 0.5, 0, 1);
    const e = Easing.easeOutBack(a);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontFamily: C.sans,
        fontWeight: 700,
        fontSize: ln.size || 64,
        color: ln.color || C.ink,
        letterSpacing: '-0.02em',
        lineHeight: 1.15,
        textAlign: 'center',
        transform: `translateZ(${(1 - e) * -160}px) translateY(${(1 - clamp(lt / 0.5, 0, 1)) * 20}px)`,
        opacity: a
      }
    }, ln.t);
  }));
}

/* ===================================================================== */
/* SCENES                                                                */
/* ===================================================================== */

/* camera wrapper: gives perspective + an animated 3D world transform */
function World({
  children,
  camTransform
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      perspective: '1400px',
      perspectiveOrigin: '50% 45%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      transformStyle: 'preserve-3d',
      transform: camTransform
    }
  }, children));
}

/* Scene 1 — Hook */
function SceneHook() {
  return /*#__PURE__*/React.createElement(Sprite, {
    start: 0,
    end: 7
  }, ({
    localTime
  }) => {
    const push = animate({
      from: -260,
      to: 40,
      start: 0,
      end: 6.5,
      ease: Easing.easeOutCubic
    })(localTime);
    const spin = localTime * 42;
    const cam = `translateZ(${push}px) rotateY(${animate({
      from: -12,
      to: 8,
      start: 0,
      end: 7,
      ease: Easing.linear
    })(localTime)}deg)`;
    const titleO = env(localTime, 7, 0.6, 0.5);
    return /*#__PURE__*/React.createElement(World, {
      camTransform: cam
    }, /*#__PURE__*/React.createElement(CodeBits, {
      n: 16,
      color: C.teal
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: W / 2 - 80,
        top: H / 2 - 150,
        transformStyle: 'preserve-3d'
      }
    }, /*#__PURE__*/React.createElement(Cube, {
      size: 260,
      label: "LLM",
      sub: "70B+ PARAMS",
      spin: spin
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 120,
        opacity: titleO
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: C.sans,
        fontWeight: 700,
        fontSize: 62,
        color: C.ink,
        letterSpacing: '-0.02em'
      }
    }, "Code generation in 2026"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: C.sans,
        fontSize: 24,
        color: C.teal,
        marginTop: 14
      }
    }, "When bigger isn't always better.")));
  });
}

/* Scene 2 — The barriers */
function SceneNeed() {
  return /*#__PURE__*/React.createElement(Sprite, {
    start: 7,
    end: 18
  }, ({
    localTime
  }) => {
    const pan = animate({
      from: 120,
      to: -120,
      start: 0.4,
      end: 10.6,
      ease: Easing.easeInOutSine
    })(localTime);
    const cam = `translateX(${pan}px) rotateY(${pan * -0.02}deg) translateZ(60px)`;
    return /*#__PURE__*/React.createElement(World, {
      camTransform: cam
    }, /*#__PURE__*/React.createElement(CodeBits, {
      n: 8,
      color: C.red
    }), /*#__PURE__*/React.createElement(Heading, {
      text: "The barriers to adoption",
      sub: "Why scaling the generator hits a wall"
    }), /*#__PURE__*/React.createElement(Card3D, {
      x: 170,
      y: 360,
      accent: C.amber,
      icon: "\uD83D\uDCB8",
      rotY: 10,
      z: -40,
      delay: 0.2,
      title: "Cost of trust",
      body: "A 70B model needs an 8\xD7 A100 cluster \u2014 on the order of $50,000."
    }), /*#__PURE__*/React.createElement(Card3D, {
      x: 750,
      y: 380,
      accent: C.red,
      icon: "\u26A0\uFE0F",
      rotY: 0,
      z: 20,
      delay: 0.5,
      title: "Plausible, but wrong",
      body: "LLMs emit syntactically valid yet logically flawed code \u2014 silent hallucinations."
    }), /*#__PURE__*/React.createElement(Card3D, {
      x: 1330,
      y: 360,
      accent: C.violet,
      icon: "\uD83D\uDD12",
      rotY: -10,
      z: -40,
      delay: 0.8,
      title: "Privacy & sovereignty",
      body: "Cloud APIs send proprietary code off-premise, raising compliance risk."
    }));
  });
}

/* Scene 3 — The shift */
function SceneShift() {
  return /*#__PURE__*/React.createElement(Sprite, {
    start: 18,
    end: 25
  }, ({
    localTime
  }) => {
    const cam = `translateZ(${animate({
      from: -120,
      to: 30,
      start: 0,
      end: 7,
      ease: Easing.easeOutCubic
    })(localTime)}px)`;
    return /*#__PURE__*/React.createElement(World, {
      camTransform: cam
    }, /*#__PURE__*/React.createElement(CodeBits, {
      n: 10,
      color: C.teal
    }), /*#__PURE__*/React.createElement(BigStatement, {
      lines: [{
        t: "Don't scale the generator.",
        size: 60,
        color: C.mute
      }, {
        t: 'Judge the output.',
        size: 78,
        color: C.teal
      }]
    }));
  });
}

/* Scene 4 — SLM Judge pipeline */
function SceneJudge() {
  return /*#__PURE__*/React.createElement(Sprite, {
    start: 25,
    end: 35
  }, ({
    localTime
  }) => {
    const cam = `rotateY(${animate({
      from: 14,
      to: -6,
      start: 0,
      end: 10,
      ease: Easing.easeInOutSine
    })(localTime)}deg) translateZ(80px)`;
    const showJudge = clamp((localTime - 2.2) / 0.6, 0, 1);
    const showOut = clamp((localTime - 4.2) / 0.6, 0, 1);
    const cardsA = clamp((localTime - 1) / 0.6, 0, 1);
    return /*#__PURE__*/React.createElement(World, {
      camTransform: cam
    }, /*#__PURE__*/React.createElement(Heading, {
      text: "The Generator\u2013Judge pipeline"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 210,
        top: 430,
        transformStyle: 'preserve-3d',
        opacity: clamp(localTime / 0.6, 0, 1)
      }
    }, /*#__PURE__*/React.createElement(Cube, {
      size: 150,
      label: "GEN",
      sub: "SLM",
      spin: localTime * 34
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 175,
        width: 150,
        textAlign: 'center',
        fontFamily: C.mono,
        fontSize: 13,
        color: C.mute
      }
    }, "generator")), [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'absolute',
        left: 540,
        top: 360 + i * 90,
        width: 230,
        height: 64,
        borderRadius: 12,
        background: 'rgba(26,34,43,.9)',
        border: `1px solid ${C.teal}44`,
        transform: `translateZ(${i * 8}px) translateX(${(1 - Easing.easeOutCubic(cardsA)) * -40}px)`,
        opacity: cardsA,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 10,
        fontFamily: C.mono,
        fontSize: 13,
        color: C.mute
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.teal
      }
    }, "candidate ", i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        opacity: .6
      }
    }, ['{...}', 'if(x>=0)', 'return r'][i]))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 1010,
        top: 430,
        transformStyle: 'preserve-3d',
        opacity: showJudge,
        transform: `scale(${0.8 + 0.2 * Easing.easeOutBack(showJudge)})`
      }
    }, /*#__PURE__*/React.createElement(Cube, {
      size: 170,
      color: C.violet,
      deep: C.violetDeep,
      glow: C.violetGlow,
      label: "JUDGE",
      sub: "\u2264 5B",
      spin: localTime * 30
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 195,
        width: 170,
        textAlign: 'center',
        fontFamily: C.mono,
        fontSize: 13,
        color: C.violet
      }
    }, "binary verdict")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 1380,
        top: 455,
        opacity: showOut,
        transform: `translateX(${(1 - Easing.easeOutCubic(showOut)) * -30}px)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 120,
        height: 120,
        borderRadius: 24,
        background: `${C.green}22`,
        border: `2px solid ${C.green}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 60,
        color: C.green
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 120,
        textAlign: 'center',
        fontFamily: C.mono,
        fontSize: 13,
        color: C.green,
        marginTop: 10
      }
    }, "best\xA0solution")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 90,
        textAlign: 'center',
        fontFamily: C.sans,
        fontSize: 22,
        color: C.ink,
        opacity: clamp((localTime - 1.5) / 0.8, 0, 1)
      }
    }, "A specialized ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: C.violet
      }
    }, "SLM judge"), " \u2014 single consumer GPU, ~$600, fully local."));
  });
}

/* Scene 5 — Collaborative team */
function SceneTeam() {
  return /*#__PURE__*/React.createElement(Sprite, {
    start: 35,
    end: 44
  }, ({
    localTime
  }) => {
    const cam = `rotateX(6deg) rotateY(${animate({
      from: -10,
      to: 10,
      start: 0,
      end: 9,
      ease: Easing.easeInOutSine
    })(localTime)}deg) translateZ(60px)`;
    const consensus = clamp((localTime - 3.5) / 0.8, 0, 1);
    return /*#__PURE__*/React.createElement(World, {
      camTransform: cam
    }, /*#__PURE__*/React.createElement(Heading, {
      text: "A team of judges",
      sub: "Specialized SLMs vote \u2014 consensus over a single oracle"
    }), [0, 1, 2].map(i => {
      const a = clamp((localTime - 0.3 - i * 0.35) / 0.6, 0, 1);
      const voted = clamp((localTime - 2.0 - i * 0.3) / 0.4, 0, 1);
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          position: 'absolute',
          left: 560 + i * 330,
          top: 430,
          transformStyle: 'preserve-3d',
          opacity: a,
          transform: `translateY(${(1 - Easing.easeOutBack(a)) * 70}px)`
        }
      }, /*#__PURE__*/React.createElement(Cube, {
        size: 150,
        color: C.violet,
        deep: C.violetDeep,
        glow: C.violetGlow,
        label: `J${i + 1}`,
        spin: localTime * 26 + i * 40
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: -46,
          left: 45,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `${C.green}22`,
          border: `2px solid ${C.green}`,
          color: C.green,
          fontSize: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: voted,
          transform: `scale(${0.5 + 0.5 * Easing.easeOutBack(voted)})`
        }
      }, "\u2713"));
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 96,
        textAlign: 'center',
        opacity: consensus,
        transform: `translateY(${(1 - consensus) * 20}px)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: C.sans,
        fontSize: 30,
        fontWeight: 600,
        color: C.ink
      }
    }, "Reliability rivaling a 70B model"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: C.mono,
        fontSize: 18,
        color: C.teal,
        marginTop: 10
      }
    }, "\u2248 97% lower hardware cost \xB7 ~70% smaller carbon footprint")));
  });
}

/* Scene 6 — The gaps */
function SceneGaps() {
  return /*#__PURE__*/React.createElement(Sprite, {
    start: 44,
    end: 54
  }, ({
    localTime
  }) => {
    const cam = `translateX(${animate({
      from: -90,
      to: 90,
      start: 0.4,
      end: 9.6,
      ease: Easing.easeInOutSine
    })(localTime)}px) translateZ(50px)`;
    return /*#__PURE__*/React.createElement(World, {
      camTransform: cam
    }, /*#__PURE__*/React.createElement(CodeBits, {
      n: 6,
      color: C.red
    }), /*#__PURE__*/React.createElement(Heading, {
      text: "The research gaps",
      color: C.red,
      sub: "What the literature still leaves open"
    }), /*#__PURE__*/React.createElement(Card3D, {
      x: 170,
      y: 360,
      accent: C.red,
      icon: "\u2460",
      rotY: 9,
      z: -30,
      delay: 0.2,
      title: "No systematic eval",
      body: "Modern decoder-only SLMs as autonomous binary code judges remain largely unmeasured."
    }), /*#__PURE__*/React.createElement(Card3D, {
      x: 750,
      y: 380,
      accent: C.amber,
      icon: "\u2461",
      rotY: 0,
      z: 20,
      delay: 0.5,
      title: "Ranking \u2260 classification",
      body: "Rerankers order candidates; few report \u03BA or False Discovery Rate for a strict verdict."
    }), /*#__PURE__*/React.createElement(Card3D, {
      x: 1330,
      y: 360,
      accent: C.violet,
      icon: "\u2462",
      rotY: -9,
      z: -30,
      delay: 0.8,
      title: "Collaboration unexplored",
      body: "Teams of fine-tuned SLM judges, with principled aggregation, are barely studied."
    }));
  });
}

/* Scene 7 — Closing lockup */
function SceneClose() {
  return /*#__PURE__*/React.createElement(Sprite, {
    start: 54,
    end: 61
  }, ({
    localTime
  }) => {
    const cam = `translateZ(${animate({
      from: -60,
      to: 30,
      start: 0,
      end: 7,
      ease: Easing.easeOutCubic
    })(localTime)}px)`;
    const o = clamp(localTime / 0.8, 0, 1);
    const chips = clamp((localTime - 1.2) / 0.7, 0, 1);
    return /*#__PURE__*/React.createElement(World, {
      camTransform: cam
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: W / 2 - 130,
        top: 150,
        transformStyle: 'preserve-3d',
        opacity: o
      }
    }, /*#__PURE__*/React.createElement(Cube, {
      size: 150,
      color: C.violet,
      deep: C.violetDeep,
      glow: C.violetGlow,
      label: "SLM",
      sub: "JUDGE \xD7N",
      spin: localTime * 28
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 120,
        opacity: o
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: C.sans,
        fontWeight: 700,
        fontSize: 54,
        color: C.ink,
        letterSpacing: '-0.02em',
        textAlign: 'center',
        maxWidth: 1200,
        lineHeight: 1.15
      }
    }, "Collaborative Small Language Models", /*#__PURE__*/React.createElement("br", null), "as Reliable Code Judges"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16,
        marginTop: 34,
        opacity: chips,
        transform: `translateY(${(1 - chips) * 16}px)`
      }
    }, ['Efficient', 'Sovereign', 'Sustainable'].map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontFamily: C.mono,
        fontSize: 18,
        color: C.teal,
        border: `1px solid ${C.teal}66`,
        background: `${C.teal}14`,
        borderRadius: 999,
        padding: '9px 22px'
      }
    }, c))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: C.mono,
        fontSize: 14,
        color: C.faint,
        marginTop: 30
      }
    }, "PhD research \xB7 M. Khallala \xB7 2026")));
  });
}

/* timestamp label for commenting */
function TimeLabel() {
  const t = useTime();
  React.useEffect(() => {
    const root = document.getElementById('vid-root');
    if (root) root.setAttribute('data-screen-label', `t=${t.toFixed(0)}s`);
  }, [Math.floor(t)]);
  return null;
}
function Movie() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Grid3D, null), /*#__PURE__*/React.createElement(SceneHook, null), /*#__PURE__*/React.createElement(SceneNeed, null), /*#__PURE__*/React.createElement(SceneShift, null), /*#__PURE__*/React.createElement(SceneJudge, null), /*#__PURE__*/React.createElement(SceneTeam, null), /*#__PURE__*/React.createElement(SceneGaps, null), /*#__PURE__*/React.createElement(SceneClose, null), /*#__PURE__*/React.createElement(Vignette, null), /*#__PURE__*/React.createElement(TimeLabel, null));
}
window.Movie = Movie;
})(); } catch (e) { __ds_ns.__errors.push({ path: "docs_livrable/video/scenes.jsx", error: String((e && e.message) || e) }); }

// lib/db.js
try { (() => {
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
    meta: {
      version: 1,
      seededAt: '2026-06-09'
    },
    cases: [{
      id: 'RS-02384',
      patient: 'A. Benali',
      age: 58,
      sex: 'F',
      laterality: 'OD',
      acquired: '2026-05-04 09:12',
      device: 'Topcon NW400',
      grade: 2,
      conf: 92.4,
      av: 1.42,
      lesions: 3,
      status: 'pending',
      note: 'Dépistage annuel de routine',
      lesionBreakdown: {
        ma: 1,
        ex: 2,
        hem: 0,
        cw: 0
      }
    }, {
      id: 'RS-02385',
      patient: 'M. Idrissi',
      age: 64,
      sex: 'M',
      laterality: 'OS',
      acquired: '2026-05-04 09:34',
      device: 'Canon CR-2',
      grade: 3,
      conf: 88.1,
      av: 1.21,
      lesions: 9,
      status: 'flagged',
      note: 'Baisse de vision OS — 3 semaines',
      lesionBreakdown: {
        ma: 5,
        ex: 2,
        hem: 2,
        cw: 0
      }
    }, {
      id: 'RS-02386',
      patient: 'S. El Amrani',
      age: 72,
      sex: 'F',
      laterality: 'OD',
      acquired: '2026-05-04 10:01',
      device: 'Topcon NW400',
      grade: 4,
      conf: 81.6,
      av: 0.98,
      lesions: 14,
      status: 'urgent',
      note: 'Corps flottants, début il y a 2 jours',
      lesionBreakdown: {
        ma: 6,
        ex: 2,
        hem: 6,
        cw: 0
      }
    }, {
      id: 'RS-02387',
      patient: 'Y. Ouazzani',
      age: 49,
      sex: 'M',
      laterality: 'OD',
      acquired: '2026-05-04 10:22',
      device: 'Topcon NW400',
      grade: 0,
      conf: 96.3,
      av: 1.71,
      lesions: 0,
      status: 'cleared',
      note: 'Diabète T2, examen de référence',
      lesionBreakdown: {
        ma: 0,
        ex: 0,
        hem: 0,
        cw: 0
      }
    }, {
      id: 'RS-02388',
      patient: 'L. Tazi',
      age: 55,
      sex: 'F',
      laterality: 'OS',
      acquired: '2026-05-04 10:48',
      device: 'Canon CR-2',
      grade: 1,
      conf: 90.7,
      av: 1.55,
      lesions: 1,
      status: 'pending',
      note: 'Suivi à 6 mois',
      lesionBreakdown: {
        ma: 1,
        ex: 0,
        hem: 0,
        cw: 0
      }
    }, {
      id: 'RS-02389',
      patient: 'A. Cherkaoui',
      age: 67,
      sex: 'M',
      laterality: 'OD',
      acquired: '2026-05-04 11:10',
      device: 'Topcon NW400',
      grade: 2,
      conf: 89.2,
      av: 1.38,
      lesions: 4,
      status: 'pending',
      note: 'Dépistage annuel',
      lesionBreakdown: {
        ma: 2,
        ex: 2,
        hem: 0,
        cw: 0
      }
    }],
    reports: [],
    users: [{
      id: 'u_8821',
      name: 'Dr. Amina Saidi',
      email: 'amina.saidi@chu-rabat.ma',
      role: 'doctor',
      dept: 'Ophtalmologie',
      status: 'active',
      last: 'il y a 2 min',
      cases: 482
    }, {
      id: 'u_8822',
      name: 'Dr. Karim Hajji',
      email: 'k.hajji@chu-rabat.ma',
      role: 'doctor',
      dept: 'Ophtalmologie',
      status: 'active',
      last: 'il y a 14 min',
      cases: 318
    }, {
      id: 'u_8823',
      name: 'Omar Kabbaj',
      email: 'omar.k@um6p-edu.ma',
      role: 'student',
      dept: 'Médecine M5',
      status: 'active',
      last: 'il y a 1 h',
      cases: 128
    }, {
      id: 'u_8824',
      name: 'Sara Benkirane',
      email: 's.benkirane@um6p-edu.ma',
      role: 'student',
      dept: 'Médecine M5',
      status: 'active',
      last: 'il y a 3 h',
      cases: 94
    }, {
      id: 'u_8825',
      name: 'Yassine Idrissi',
      email: 'y.idrissi@um6p-edu.ma',
      role: 'student',
      dept: 'Médecine M4',
      status: 'pending',
      last: '—',
      cases: 0
    }, {
      id: 'u_8826',
      name: 'Dr. Layla Tazi',
      email: 'l.tazi@chu-rabat.ma',
      role: 'doctor',
      dept: 'Spécialiste rétine',
      status: 'active',
      last: 'hier',
      cases: 712
    }, {
      id: 'u_8827',
      name: 'Mehdi El Otmani',
      email: 'm.otmani@octopus.ai',
      role: 'admin',
      dept: 'Plateforme',
      status: 'active',
      last: 'à l’instant',
      cases: '—'
    }],
    datasets: [{
      id: 'ds_messidor2',
      name: 'Messidor-2',
      type: 'fundus',
      n: 1748,
      gradeDist: [810, 270, 347, 75, 246],
      status: 'ready',
      ingested: '2026-04-12',
      license: 'Adcis open'
    }, {
      id: 'ds_eyepacs',
      name: 'EyePACS-train',
      type: 'fundus',
      n: 35126,
      gradeDist: [25810, 2443, 5292, 873, 708],
      status: 'ready',
      ingested: '2026-04-19',
      license: 'Kaggle'
    }, {
      id: 'ds_aptos',
      name: 'APTOS 2019',
      type: 'fundus',
      n: 3662,
      gradeDist: [1805, 370, 999, 193, 295],
      status: 'ready',
      ingested: '2026-04-21',
      license: 'CC BY-NC'
    }, {
      id: 'ds_idrid',
      name: 'IDRID localisation',
      type: 'fundus + bbox',
      n: 516,
      gradeDist: [134, 25, 168, 79, 110],
      status: 'ready',
      ingested: '2026-04-23',
      license: 'CC BY 4.0'
    }, {
      id: 'ds_chu_q1',
      name: 'CHU Rabat — T1 2026',
      type: 'fundus + DICOM',
      n: 884,
      gradeDist: [402, 138, 187, 89, 68],
      status: 'review',
      ingested: '2026-05-01',
      license: 'Interne · CER'
    }, {
      id: 'ds_chu_q2',
      name: 'CHU Rabat — T2 2026',
      type: 'fundus + DICOM',
      n: 312,
      gradeDist: [142, 51, 68, 28, 23],
      status: 'ingest',
      ingested: '2026-05-04',
      license: 'Interne · CER'
    }],
    models: [{
      id: 'm_v4_2_1',
      name: 'fundus-grade-v4.2.1',
      framework: 'PyTorch',
      task: 'Grading RD',
      params: '24M',
      metric: 'AUC 0.987',
      status: 'production',
      deployed: '2026-04-29'
    }, {
      id: 'm_v4_3_0',
      name: 'fundus-grade-v4.3.0-rc',
      framework: 'PyTorch',
      task: 'Grading RD',
      params: '38M',
      metric: 'AUC 0.991',
      status: 'staging',
      deployed: '2026-05-02'
    }, {
      id: 'm_vs_2_1',
      name: 'vessel-seg-v2.1',
      framework: 'PyTorch',
      task: 'Segmentation vaisseaux',
      params: '11M',
      metric: 'Dice 0.872',
      status: 'production',
      deployed: '2026-03-14'
    }, {
      id: 'm_les_18',
      name: 'lesion-detect-v1.8',
      framework: 'PyTorch',
      task: 'Détection lésions',
      params: '46M',
      metric: 'mAP 0.71',
      status: 'production',
      deployed: '2026-03-30'
    }],
    audit: [],
    attempts: [],
    seq: 2390
  };

  /* ---------- change subscription (so React views refresh) ---------- */
  const listeners = new Set();
  function emit() {
    listeners.forEach(fn => {
      try {
        fn();
      } catch (e) {}
    });
  }

  /* ---------- persistence ---------- */
  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }
  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
      return null;
    }
  }
  let DB = load() || clone(SEED);
  function commit() {
    try {
      localStorage.setItem(KEY, JSON.stringify(DB));
    } catch (e) {}
    emit();
  }
  if (!load()) commit();

  /* ---------- helpers ---------- */
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  }
  function rngFrom(seed) {
    let s = seed >>> 0;
    return () => {
      s = s * 1664525 + 1013904223 >>> 0;
      return s / 4294967296;
    };
  }
  function audit(action, meta) {
    DB.audit.unshift({
      ts: new Date().toISOString(),
      action,
      meta: meta || {}
    });
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
  const API = function () {
    try {
      return localStorage.getItem('octopus.api_url');
    } catch (e) {
      return null;
    }
  }();
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
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    }).then(r => r.ok ? hydrate() : null).catch(() => {});
  }
  async function hydrate() {
    if (!API) return;
    try {
      const [cases, reports, users, datasets, models, audit, attempts] = await Promise.all([apiGet('/cases'), apiGet('/reports'), apiGet('/users'), apiGet('/datasets'), apiGet('/models'), apiGet('/audit'), apiGet('/attempts')]);
      DB = {
        ...DB,
        cases,
        reports,
        users,
        datasets,
        models,
        audit,
        attempts
      };
      emit();
    } catch (e) {
      console.warn('[Octopus] backend injoignable, mode local conservé :', e.message);
    }
  }
  if (API) hydrate();
  function infer(seedStr) {
    const r = rngFrom(hash(seedStr));
    const roll = r();
    const grade = roll < 0.34 ? 0 : roll < 0.55 ? 1 : roll < 0.78 ? 2 : roll < 0.93 ? 3 : 4;
    const conf = Math.round((78 + r() * 19) * 10) / 10;
    const av = Math.round((0.95 + r() * 0.85) * 100) / 100;
    const ma = grade === 0 ? 0 : Math.round(r() * grade * 2);
    const ex = grade <= 1 ? grade === 0 ? 0 : Math.round(r()) : Math.round(r() * 2);
    const hem = grade >= 3 ? Math.round(2 + r() * 4) : 0;
    const cw = grade >= 3 && r() > 0.6 ? Math.round(r() * 2) : 0;
    const lesionBreakdown = {
      ma,
      ex,
      hem,
      cw
    };
    const lesions = ma + ex + hem + cw;
    return {
      grade,
      conf,
      av,
      lesions,
      lesionBreakdown
    };
  }

  /* ---------- public API ---------- */
  const api = {
    /* cases */
    listCases() {
      return clone(DB.cases);
    },
    getCase(id) {
      const c = DB.cases.find(x => x.id === id);
      return c ? clone(c) : null;
    },
    nextCaseId() {
      return 'RS-' + String(DB.seq + 1).padStart(5, '0');
    },
    addCase(payload) {
      DB.seq += 1;
      const id = payload.id || 'RS-' + String(DB.seq).padStart(5, '0');
      const ai = api.infer(payload.id || id);
      const now = new Date();
      const acquired = (payload.date || now.toISOString().slice(0, 10)) + ' ' + now.toTimeString().slice(0, 5);
      const c = {
        id,
        patient: payload.patient || 'Patient ' + id.slice(-3),
        age: payload.age || 40 + Math.round(rngFrom(hash(id))() * 40),
        sex: payload.sex || (rngFrom(hash(id + 's'))() > 0.5 ? 'F' : 'M'),
        laterality: payload.laterality || 'OD',
        acquired,
        device: payload.device || 'Topcon NW400',
        note: payload.note || 'Nouvel examen — téléversé',
        ...ai,
        status: 'pending'
      };
      DB.cases.unshift(c);
      audit('case.create', {
        id
      });
      audit('inference.run', {
        id,
        grade: c.grade,
        conf: c.conf
      });
      commit();
      if (API) apiSend('POST', '/cases', {
        id: payload.id || id,
        laterality: c.laterality,
        device: c.device,
        date: payload.date
      });
      return clone(c);
    },
    updateCase(id, patch) {
      const c = DB.cases.find(x => x.id === id);
      if (!c) return null;
      Object.assign(c, patch);
      audit('case.update', {
        id,
        patch
      });
      commit();
      return clone(c);
    },
    infer(seedStr) {
      return infer(seedStr);
    },
    runInference(id) {
      const c = DB.cases.find(x => x.id === id);
      if (!c) return null;
      Object.assign(c, api.infer(id));
      audit('inference.run', {
        id,
        grade: c.grade
      });
      commit();
      return clone(c);
    },
    /* reports */
    listReports() {
      return clone(DB.reports);
    },
    getReportFor(caseId) {
      const r = DB.reports.find(x => x.caseId === caseId);
      return r ? clone(r) : null;
    },
    saveReport(caseId, text, author) {
      const existing = DB.reports.find(r => r.caseId === caseId);
      const rec = {
        id: existing ? existing.id : 'rep_' + (DB.reports.length + 1),
        caseId,
        text,
        author: author || 'Dr. Amina Saidi',
        signedAt: new Date().toISOString()
      };
      if (existing) Object.assign(existing, rec);else DB.reports.unshift(rec);
      const c = DB.cases.find(x => x.id === caseId);
      if (c) c.status = 'signed';
      audit('report.sign', {
        caseId,
        author: rec.author
      });
      commit();
      if (API) apiSend('POST', '/cases/' + caseId + '/report', {
        text,
        author: rec.author
      });
      return clone(rec);
    },
    /* directory data */
    listUsers() {
      return clone(DB.users);
    },
    listDatasets() {
      return clone(DB.datasets);
    },
    listModels() {
      return clone(DB.models);
    },
    listAudit() {
      return clone(DB.audit);
    },
    /* learning attempts (student) */
    listAttempts() {
      return clone(DB.attempts || []);
    },
    addAttempt(rec) {
      DB.attempts = DB.attempts || [];
      DB.attempts.unshift({
        ts: new Date().toISOString(),
        ...rec
      });
      DB.attempts = DB.attempts.slice(0, 200);
      audit('attempt.submit', {
        caseId: rec.caseId,
        grade: rec.grade,
        ok: rec.gradeOk
      });
      commit();
      if (API) apiSend('POST', '/attempts', {
        caseId: rec.caseId,
        grade: rec.grade,
        gradeOk: rec.gradeOk,
        findingScore: rec.findingScore
      });
      return clone(DB.attempts[0]);
    },
    /* invite a user (admin) */
    addUser(u) {
      const id = 'u_' + (9000 + DB.users.length);
      const rec = {
        id,
        name: u.name,
        email: u.email,
        role: u.role || 'student',
        dept: u.dept || '—',
        status: 'pending',
        last: '—',
        cases: 0
      };
      DB.users.push(rec);
      audit('user.invite', {
        id,
        email: u.email
      });
      commit();
      if (API) apiSend('POST', '/users', {
        name: u.name,
        email: u.email,
        role: rec.role,
        dept: rec.dept
      });
      return clone(rec);
    },
    /* ---------- session / auth (banc d'essai) ----------
       ⚠️ Auth de DÉMO : aucun mot de passe vérifié côté serveur.
       En production → POST /api/auth/login (Keycloak / OIDC, voir docs).
       Le rôle choisi à la connexion détermine l'espace ouvert. */
    login({
      email,
      role,
      name
    }) {
      const known = DB.users.find(u => u.email && email && u.email.toLowerCase() === email.toLowerCase());
      const session = {
        email: email || known && known.email || role + '@octopus.ai',
        role: role || known && known.role || 'doctor',
        name: name || known && known.name || (role === 'doctor' ? 'Dr. Amina Saidi' : role === 'admin' ? 'Mehdi El Otmani' : 'Omar Kabbaj'),
        at: new Date().toISOString()
      };
      try {
        localStorage.setItem('octopus.session', JSON.stringify(session));
      } catch (e) {}
      audit('auth.login', {
        email: session.email,
        role: session.role
      });
      commit();
      return clone(session);
    },
    session() {
      try {
        return JSON.parse(localStorage.getItem('octopus.session') || 'null');
      } catch (e) {
        return null;
      }
    },
    logout() {
      try {
        localStorage.removeItem('octopus.session');
      } catch (e) {}
      audit('auth.logout', {});
      commit();
    },
    /* lifecycle */
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    reset() {
      DB = clone(SEED);
      commit();
    },
    refresh() {
      return hydrate();
    },
    backendMode() {
      return !!API;
    },
    raw() {
      return clone(DB);
    }
  };
  window.OctopusDB = api;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "lib/db.js", error: String((e && e.message) || e) }); }

// lib/i18n.js
try { (() => {
/* Octopus AI — internationalisation helper.
   Default language: FR. Toggleable from Settings → Préférences.
   Loaded BEFORE React + the app script in every UI kit's index.html. */
(function () {
  const KEY = 'octopus.lang';
  const DEFAULT = 'fr';
  let lang = typeof localStorage !== 'undefined' && localStorage.getItem(KEY) || DEFAULT;
  const DICT = {
    fr: {
      /* brand & global */
      'brand.name': 'Octopus',
      'brand.tag.clinical': 'CLINIQUE · IA',
      'brand.tag.learning': 'APPRENTISSAGE · ACADÉMIE',
      'brand.tag.admin': 'ADMIN · PLATEFORME',
      'brand.tag.settings': 'RÉGLAGES',
      /* topbar */
      'topbar.search.cases': 'Rechercher cas, patients, MRN…',
      'topbar.search.learning': 'Rechercher cas par pathologie, grade, difficulté…',
      'topbar.search.admin': 'Rechercher utilisateurs, jeux de données, modèles, audit…',
      'topbar.search.settings': 'Rechercher un réglage…',
      /* doctor rail */
      'rail.section.diagnosis': 'Diagnostic',
      'rail.section.reference': 'Référence',
      'rail.section.learn': 'Apprendre',
      'rail.section.progress': 'Ma progression',
      'rail.section.manage': 'Gérer',
      'rail.section.oversight': 'Supervision',
      'rail.queue': 'File de lecture',
      'rail.upload': 'Téléverser',
      'rail.active': 'Étude active',
      'up.eyebrow': 'DR · Rétinopathie diabétique',
      'up.title': 'Téléverser une image de fond d’œil',
      'up.lead': 'Formats acceptés : JPEG, PNG, DICOM. L’analyse IA démarre après le téléversement.',
      'up.drop': 'Glissez une image ici',
      'up.browse': 'ou cliquez pour parcourir',
      'up.ready': 'prêt',
      'up.remove': 'Retirer',
      'up.patientId': 'ID patient',
      'up.laterality': 'Latéralité',
      'up.device': 'Appareil',
      'up.date': 'Date d’acquisition',
      'up.run': 'Lancer l’analyse IA',
      'up.running': 'Analyse en cours…',
      'up.recent': 'Téléversements récents',
      'up.open': 'Ouvrir',
      'study.signed': 'Signé',
      'toast.signed': 'Rapport signé et exporté · {id}',
      'toast.pdf': 'PDF généré · {id}',
      'toast.second': 'Demande de 2ᵉ avis envoyée',
      'rail.patients': 'Patients',
      'rail.reports': 'Rapports',
      'rail.atlas': 'Atlas des pathologies',
      'rail.outcomes': 'Analyse des résultats',
      'rail.simulator': 'Simulateur de cas',
      'rail.library': 'Bibliothèque de cas',
      'rail.atlas.reading': 'Atlas & lectures',
      'rail.quizzes': 'Quiz',
      'rail.performance': 'Performance',
      'rail.goals': 'Objectifs',
      'rail.history': 'Historique',
      'rail.users': 'Utilisateurs & accès',
      'rail.datasets': 'Jeux de données',
      'rail.models': 'Registre des modèles',
      'rail.annotation': 'File d\u2019annotation',
      'rail.audit': 'Journal d\u2019audit',
      'rail.analytics': 'Analyse plateforme',
      'rail.policies': 'Défauts & politiques',
      'rail.preferences': 'Préférences',
      'role.ophth': 'OPHTALMOLOGISTE',
      'role.student': 'ÉTUDIANT · M5',
      'role.admin': 'ADMIN',
      /* user menu (popover from the user chip in the rail) */
      'usermenu.settings': 'Réglages',
      'usermenu.settings.kbd': '⇧Ctrl,',
      'usermenu.language': 'Langue',
      'usermenu.help': 'Centre d’aide',
      'usermenu.profile': 'Mon profil',
      'usermenu.apps': 'Applications & extensions',
      'usermenu.invite': 'Inviter un collègue',
      'usermenu.learn': 'En savoir plus',
      'usermenu.signout': 'Déconnexion',
      'usermenu.plan.doctor': 'Plan clinique',
      'usermenu.plan.student': 'Plan académique',
      'usermenu.plan.admin': 'Plan plateforme',
      'usermenu.lang.fr': 'Français',
      'usermenu.lang.en': 'English',
      'usermenu.lang.label': 'Choisir la langue',
      /* doctor crumbs */
      'crumbs.clinical': 'Diagnostic clinique',
      'crumbs.activeStudy': 'Étude active',
      'crumbs.queue': 'File de lecture',
      'crumbs.learning': 'Apprentissage',
      'crumbs.simulator': 'Simulateur de cas',
      'crumbs.performance': 'Performance',
      'crumbs.quizzes': 'Quiz',
      'crumbs.library': 'Bibliothèque',
      'crumbs.admin': 'Administration',
      'crumbs.usersAccess': 'Utilisateurs & accès',
      'crumbs.datasets': 'Jeux de données',
      'crumbs.models': 'Modèles',
      'crumbs.settings': 'Réglages',
      /* doctor queue & study */
      'queue.eyebrow': 'File de lecture · aujourd\u2019hui',
      'queue.today': 'aujourd\u2019hui',
      'queue.count': '{n} cas',
      'study.aiAnalysis': 'Analyse IA',
      'study.aiGrade': 'Grade RD · échelle ETDRS',
      'study.modelTag': '● MODÈLE v4.2.1',
      'study.vesselMorph': 'Morphologie vasculaire',
      'study.lesion': 'Détection des lésions',
      'study.lesionsFound': '{n} lésions identifiées',
      'study.microaneurysms': 'Microanévrismes',
      'study.exudates': 'Exsudats durs',
      'study.hemorrhages': 'Hémorragies',
      'study.cottonWool': 'Nodules cotonneux',
      'study.spotHint': 'Cliquez un critère pour le localiser sur l’image.',
      'study.locate': 'localiser',
      'study.noLesion': 'aucune',
      'study.view3d': 'Vue 3D',
      'v3d.title': 'Structure vasculaire 3D',
      'v3d.subtitle': 'Glissez pour pivoter · molette pour zoomer',
      'v3d.reset': 'Réinitialiser',
      'v3d.close': 'Fermer',
      'v3d.rotate': 'Rotation auto',
      'v3d.depth': 'Profondeur',
      'study.report': 'Rapport clinique',
      'study.history': 'Historique',
      'study.secondOpinion': '2ᵉ avis',
      'study.sign': 'Signer & exporter',
      'study.metric.av': 'Ratio A:V',
      'study.metric.tort': 'Tortuosité',
      'study.metric.fractal': 'Dim. fractale',
      'study.metric.dice': 'Dice (masque)',
      'study.metric.av.note': '±0,04 plage normale 0,66–1,5',
      'study.metric.tort.note': 'élevée',
      'study.metric.fractal.note': 'dans la référence',
      'study.metric.dice.note': 'haute qualité',
      'study.mrn': 'MRN',
      'study.diabetes': 'Diabète T2',
      'study.tooltip.heatmap': 'Grad-CAM',
      'study.tooltip.vessels': 'Vaisseaux',
      'study.tooltip.disc': 'Disque / cup',
      'study.tooltip.boxes': 'Boîtes lésions',
      'grade.0': 'Pas de RD',
      'grade.1': 'Légère',
      'grade.2': 'Modérée',
      'grade.3': 'Sévère',
      'grade.4': 'Proliférante',
      'grade.0.long': 'Pas de rétinopathie',
      'grade.1.long': 'RDNP légère',
      'grade.2.long': 'RDNP modérée',
      'grade.3.long': 'RDNP sévère',
      'grade.4.long': 'RD proliférante',
      'lat.OD.long': 'OD · ŒIL DROIT',
      'lat.OS.long': 'OS · ŒIL GAUCHE',
      /* student */
      'sim.eyebrow': 'Simulation · Module-RD',
      'sim.step': 'Étape {n} sur 4',
      'sim.step.1': 'Briefing',
      'sim.step.2': 'Constatations',
      'sim.step.3': 'Grade',
      'sim.step.4': 'Débriefing',
      'sim.heading.1': 'Lire le briefing du cas',
      'sim.heading.2': 'Sélectionner toutes les constatations cliniques présentes',
      'sim.heading.3': 'Attribuer un grade ETDRS',
      'sim.heading.4': 'Débriefing & raisonnement expert',
      'sim.history': 'Historique clinique',
      'sim.selected': '{n} sélectionnée(s)',
      'sim.briefIntro': 'Examinez le fond d\u2019œil à gauche. Notez le calibre des vaisseaux, les lésions et tout signe de maladie proliférante. Quand vous êtes prêt, cliquez "Démarrer l\u2019examen" pour cocher les constatations observées.',
      'sim.brief.li1': 'Vous pouvez revenir au briefing à tout moment.',
      'sim.brief.li2': 'Le temps n\u2019est pas limité — privilégiez l\u2019exhaustivité.',
      'sim.brief.li3': 'Survolez une constatation pour voir sa définition.',
      'sim.findings.missed': 'manqué',
      'sim.findings.over': 'sur-coté',
      'sim.your': 'Votre grade',
      'sim.matchExpert': '✓ correspond à l\u2019expert',
      'sim.expert': 'expert : grade {n}',
      'sim.accuracy': 'Justesse des constatations',
      'sim.correct': '{a}/{b} correctes',
      'sim.expertReasoning': 'Raisonnement expert',
      'sim.back': 'Retour',
      'sim.continue': 'Continuer →',
      'sim.submit': 'Soumettre',
      'sim.next': 'Cas suivant →',
      'progress.eyebrow': 'Performance',
      'progress.title': 'Progression, 30 derniers jours',
      'progress.kpi.cases': 'Cas révisés',
      'progress.kpi.acc': 'Justesse de grading',
      'progress.kpi.time': 'Temps moyen / cas',
      'progress.kpi.streak': 'Série de quiz',
      'progress.kpi.bestEver': 'record personnel',
      'progress.kpi.casesDelta': '+24 vs 30j préc.',
      'progress.kpi.accDelta': '+6 pts',
      'progress.kpi.timeDelta': '−18 sec',
      'progress.kpi.streakVal': '7 jours',
      'progress.byGrade': 'Justesse par grade',
      'progress.confusion': 'Matrice de confusion',
      'progress.confusion.sub': 'Votre grade (lignes) vs grade expert (colonnes).',
      /* admin */
      'admin.users.h1': 'Utilisateurs & accès',
      'admin.users.lead': '7 comptes actifs sur 3 profils. Les invitations en attente requièrent une approbation manuelle.',
      'admin.users.exportCsv': 'Exporter CSV',
      'admin.users.invite': 'Inviter un utilisateur',
      'admin.stat.all': 'Tous les utilisateurs',
      'admin.stat.doctors': 'Docteurs',
      'admin.stat.doctorsSub': '3 actifs ces 24 h',
      'admin.stat.students': 'Étudiants',
      'admin.stat.studentsSub': '7 cohortes',
      'admin.stat.pending': 'Invitations en attente',
      'admin.stat.pendingSub': 'en attente d\u2019approbation',
      'admin.tab.all': 'Tous',
      'admin.tab.doctors': 'Docteurs',
      'admin.tab.students': 'Étudiants',
      'admin.tab.admins': 'Admins',
      'admin.col.user': 'Utilisateur',
      'admin.col.role': 'Rôle',
      'admin.col.dept': 'Service',
      'admin.col.cases': 'Cas',
      'admin.col.last': 'Dernière activité',
      'admin.col.status': 'Statut',
      'admin.status.active': 'actif',
      'admin.status.pending': 'en attente',
      'admin.status.ingest': 'ingestion',
      'admin.status.review': 'en revue',
      'admin.role.doctor': 'docteur',
      'admin.role.student': 'étudiant',
      'admin.role.admin': 'admin',
      'admin.ds.h1': 'Jeux de données',
      'admin.ds.lead': 'Collections de fonds d\u2019œil utilisées pour la référence clinique, la simulation étudiant et l\u2019entraînement des modèles.',
      'admin.ds.lineage': 'Graphe de lignage',
      'admin.ds.newIngest': 'Nouvelle ingestion',
      'admin.ds.dist': 'Distribution des grades',
      'admin.ds.ingested': 'Ingéré le {d}',
      'admin.ds.open': 'Ouvrir →',
      'admin.models.h1': 'Registre des modèles',
      'admin.models.lead': 'Modèles ML versionnés servis au pipeline de diagnostic. Les nouvelles versions sont promues de staging à production après validation.',
      'admin.models.history': 'Historique des déploiements',
      'admin.models.register': 'Enregistrer un modèle',
      'admin.models.col.model': 'Modèle',
      'admin.models.col.task': 'Tâche',
      'admin.models.col.framework': 'Framework',
      'admin.models.col.params': 'Params',
      'admin.models.col.metric': 'Métrique test',
      'admin.models.col.deployed': 'Déployé',
      'admin.models.inf24h': 'Volume d\u2019inférences · 24 dern. h',
      'admin.models.latency': 'Latence moyenne',
      'admin.models.drift': 'Alertes de dérive',
      'admin.models.allClear': '● tout va bien',
      'admin.models.status.prod': 'production',
      'admin.models.status.staging': 'staging',
      /* settings */
      'set.eyebrow': 'Réglages',
      'set.title': 'Préférences',
      'set.lead': 'Personnalisez la plateforme Octopus pour votre profil.',
      'set.sec.account': 'Compte',
      'set.sec.models': 'Modèles IA',
      'set.sec.viz3d': '3D & visualisation',
      'set.sec.datasets': 'Jeux de données',
      'set.sec.themes': 'Thèmes & affichage',
      'set.sec.notifs': 'Notifications',
      'set.sec.monitoring': 'Monitoring',
      'set.sec.integrations': 'Intégrations',
      'set.sec.prefs': 'Préférences',
      'set.lang': 'Langue',
      'set.lang.help': 'Affecte tous les menus, libellés et contenus produit.',
      'set.lang.fr': 'Français',
      'set.lang.en': 'English',
      'set.save': 'Enregistrer',
      'set.saved': 'Enregistré',
      'set.cancel': 'Annuler',
      'set.password.cur': 'Mot de passe actuel',
      'set.password.new': 'Nouveau mot de passe',
      'set.password.conf': 'Confirmer le nouveau mot de passe',
      'set.password.change': 'Changer le mot de passe',
      'set.theme': 'Thème',
      'set.theme.light': 'Clair',
      'set.theme.dark': 'Sombre',
      'set.theme.auto': 'Système',
      'set.density': 'Densité',
      'set.density.cozy': 'Confortable',
      'set.density.compact': 'Compact',
      'set.monitoring.enable': 'Activer Sentry',
      'set.monitoring.help': 'Rapports d\u2019erreur anonymisés. Aucune donnée patient (PHI) n\u2019est jamais envoyée.'
    },
    en: {
      'brand.name': 'Octopus',
      'brand.tag.clinical': 'CLINICAL · AI',
      'brand.tag.learning': 'LEARNING · ACADEMY',
      'brand.tag.admin': 'ADMIN · PLATFORM',
      'brand.tag.settings': 'SETTINGS',
      'topbar.search.cases': 'Search cases, patients, MRN…',
      'topbar.search.learning': 'Search cases by pathology, grade, difficulty…',
      'topbar.search.admin': 'Search users, datasets, models, audit events…',
      'topbar.search.settings': 'Search a setting…',
      'rail.section.diagnosis': 'Diagnosis',
      'rail.section.reference': 'Reference',
      'rail.section.learn': 'Learn',
      'rail.section.progress': 'My progress',
      'rail.section.manage': 'Manage',
      'rail.section.oversight': 'Oversight',
      'rail.queue': 'Reading queue',
      'rail.upload': 'Upload image',
      'rail.active': 'Active study',
      'up.eyebrow': 'DR · Diabetic retinopathy',
      'up.title': 'Upload a fundus image',
      'up.lead': 'Accepted formats: JPEG, PNG, DICOM. AI analysis starts after upload.',
      'up.drop': 'Drag an image here',
      'up.browse': 'or click to browse',
      'up.ready': 'ready',
      'up.remove': 'Remove',
      'up.patientId': 'Patient ID',
      'up.laterality': 'Laterality',
      'up.device': 'Device',
      'up.date': 'Acquisition date',
      'up.run': 'Run AI analysis',
      'up.running': 'Analyzing…',
      'up.recent': 'Recent uploads',
      'up.open': 'Open',
      'study.signed': 'Signed',
      'toast.signed': 'Report signed and exported · {id}',
      'toast.pdf': 'PDF generated · {id}',
      'toast.second': 'Second-opinion request sent',
      'rail.patients': 'Patients',
      'rail.reports': 'Reports',
      'rail.atlas': 'Atlas of pathologies',
      'rail.outcomes': 'Outcome analytics',
      'rail.simulator': 'Case simulator',
      'rail.library': 'Case library',
      'rail.atlas.reading': 'Atlas & reading',
      'rail.quizzes': 'Quizzes',
      'rail.performance': 'Performance',
      'rail.goals': 'Goals',
      'rail.history': 'History',
      'rail.users': 'Users & access',
      'rail.datasets': 'Case datasets',
      'rail.models': 'Model registry',
      'rail.annotation': 'Annotation queue',
      'rail.audit': 'Audit log',
      'rail.analytics': 'Platform analytics',
      'rail.policies': 'Defaults & policies',
      'rail.preferences': 'Preferences',
      'role.ophth': 'OPHTHALMOLOGIST',
      'role.student': 'STUDENT · M5',
      'usermenu.settings': 'Settings',
      'usermenu.settings.kbd': '⇧Ctrl,',
      'usermenu.language': 'Language',
      'usermenu.help': 'Get help',
      'usermenu.profile': 'My profile',
      'usermenu.apps': 'Apps & extensions',
      'usermenu.invite': 'Invite a colleague',
      'usermenu.learn': 'Learn more',
      'usermenu.signout': 'Log out',
      'usermenu.plan.doctor': 'Clinical plan',
      'usermenu.plan.student': 'Academic plan',
      'usermenu.plan.admin': 'Platform plan',
      'usermenu.lang.fr': 'Français',
      'usermenu.lang.en': 'English',
      'usermenu.lang.label': 'Choose language',
      'role.admin': 'ADMIN',
      'crumbs.clinical': 'Clinical diagnosis',
      'crumbs.activeStudy': 'Active study',
      'crumbs.queue': 'Reading queue',
      'crumbs.learning': 'Learning',
      'crumbs.simulator': 'Case simulator',
      'crumbs.performance': 'Performance',
      'crumbs.quizzes': 'Quizzes',
      'crumbs.library': 'Library',
      'crumbs.admin': 'Administration',
      'crumbs.usersAccess': 'Users & access',
      'crumbs.datasets': 'Datasets',
      'crumbs.models': 'Models',
      'crumbs.settings': 'Settings',
      'queue.eyebrow': 'Reading queue · today',
      'queue.today': 'today',
      'queue.count': '{n} cases',
      'study.aiAnalysis': 'AI Analysis',
      'study.aiGrade': 'DR grade · ETDRS scale',
      'study.modelTag': '● MODEL v4.2.1',
      'study.vesselMorph': 'Vessel morphology',
      'study.lesion': 'Lesion detection',
      'study.lesionsFound': '{n} lesions identified',
      'study.microaneurysms': 'Microaneurysms',
      'study.exudates': 'Hard exudates',
      'study.hemorrhages': 'Haemorrhages',
      'study.cottonWool': 'Cotton-wool spots',
      'study.spotHint': 'Click a criterion to locate it on the image.',
      'study.locate': 'locate',
      'study.noLesion': 'none',
      'study.view3d': '3D view',
      'v3d.title': '3D vessel structure',
      'v3d.subtitle': 'Drag to rotate · scroll to zoom',
      'v3d.reset': 'Reset',
      'v3d.close': 'Close',
      'v3d.rotate': 'Auto-rotate',
      'v3d.depth': 'Depth',
      'study.report': 'Clinical report',
      'study.history': 'History',
      'study.secondOpinion': '2nd opinion',
      'study.sign': 'Sign & export',
      'study.metric.av': 'A:V ratio',
      'study.metric.tort': 'Tortuosity',
      'study.metric.fractal': 'Fractal dim',
      'study.metric.dice': 'Dice (mask)',
      'study.metric.av.note': '±0.04 normal range 0.66–1.5',
      'study.metric.tort.note': 'elevated',
      'study.metric.fractal.note': 'within reference',
      'study.metric.dice.note': 'high-quality',
      'study.mrn': 'MRN',
      'study.diabetes': 'Diabetes T2',
      'study.tooltip.heatmap': 'Grad-CAM',
      'study.tooltip.vessels': 'Vessels',
      'study.tooltip.disc': 'Disc / cup',
      'study.tooltip.boxes': 'Lesion boxes',
      'grade.0': 'No DR',
      'grade.1': 'Mild',
      'grade.2': 'Moderate',
      'grade.3': 'Severe',
      'grade.4': 'Proliferative',
      'grade.0.long': 'No DR',
      'grade.1.long': 'Mild NPDR',
      'grade.2.long': 'Moderate NPDR',
      'grade.3.long': 'Severe NPDR',
      'grade.4.long': 'Proliferative DR',
      'lat.OD.long': 'OD · RIGHT EYE',
      'lat.OS.long': 'OS · LEFT EYE',
      'sim.eyebrow': 'Simulation · DR-Module',
      'sim.step': 'Step {n} of 4',
      'sim.step.1': 'Brief',
      'sim.step.2': 'Findings',
      'sim.step.3': 'Grade',
      'sim.step.4': 'Debrief',
      'sim.heading.1': 'Read the case brief',
      'sim.heading.2': 'Select all clinical findings present',
      'sim.heading.3': 'Assign an ETDRS grade',
      'sim.heading.4': 'Debrief & expert reasoning',
      'sim.history': 'Clinical history',
      'sim.selected': '{n} selected',
      'sim.briefIntro': 'Examine the fundus image to the left. Note vessel calibre, lesions, and any signs of proliferative disease. When ready, click "Start examination" to mark the findings you observe.',
      'sim.brief.li1': 'You can return to the brief at any time.',
      'sim.brief.li2': 'Time is not limited — focus on completeness.',
      'sim.brief.li3': 'Hover any finding to see its definition.',
      'sim.findings.missed': 'missed',
      'sim.findings.over': 'over-call',
      'sim.your': 'Your grade',
      'sim.matchExpert': '✓ matches expert',
      'sim.expert': 'expert: grade {n}',
      'sim.accuracy': 'Findings accuracy',
      'sim.correct': '{a}/{b} correct',
      'sim.expertReasoning': 'Expert reasoning',
      'sim.back': 'Back',
      'sim.continue': 'Continue →',
      'sim.submit': 'Submit',
      'sim.next': 'Next case →',
      'progress.eyebrow': 'Performance',
      'progress.title': 'Progress, last 30 days',
      'progress.kpi.cases': 'Cases reviewed',
      'progress.kpi.acc': 'Grading accuracy',
      'progress.kpi.time': 'Avg. time / case',
      'progress.kpi.streak': 'Quiz streak',
      'progress.kpi.bestEver': 'personal best',
      'progress.kpi.casesDelta': '+24 vs prev. 30d',
      'progress.kpi.accDelta': '+6 pts',
      'progress.kpi.timeDelta': '−18 sec',
      'progress.kpi.streakVal': '7 days',
      'progress.byGrade': 'Accuracy by grade',
      'progress.confusion': 'Confusion matrix',
      'progress.confusion.sub': 'Your grade (rows) vs expert grade (columns).',
      'admin.users.h1': 'Users & access',
      'admin.users.lead': '7 active accounts across 3 profiles. Pending invitations require manual approval.',
      'admin.users.exportCsv': 'Export CSV',
      'admin.users.invite': 'Invite user',
      'admin.stat.all': 'All users',
      'admin.stat.doctors': 'Doctors',
      'admin.stat.doctorsSub': '3 active in last 24h',
      'admin.stat.students': 'Students',
      'admin.stat.studentsSub': '7 cohorts',
      'admin.stat.pending': 'Pending invites',
      'admin.stat.pendingSub': 'awaits approval',
      'admin.tab.all': 'All',
      'admin.tab.doctors': 'Doctors',
      'admin.tab.students': 'Students',
      'admin.tab.admins': 'Admins',
      'admin.col.user': 'User',
      'admin.col.role': 'Role',
      'admin.col.dept': 'Department',
      'admin.col.cases': 'Cases',
      'admin.col.last': 'Last active',
      'admin.col.status': 'Status',
      'admin.status.active': 'active',
      'admin.status.pending': 'pending',
      'admin.status.ingest': 'ingest',
      'admin.status.review': 'review',
      'admin.role.doctor': 'doctor',
      'admin.role.student': 'student',
      'admin.role.admin': 'admin',
      'admin.ds.h1': 'Case datasets',
      'admin.ds.lead': 'Curated fundus collections used for clinician reference, student simulation, and model training.',
      'admin.ds.lineage': 'Lineage graph',
      'admin.ds.newIngest': 'New ingest',
      'admin.ds.dist': 'Grade distribution',
      'admin.ds.ingested': 'Ingested {d}',
      'admin.ds.open': 'Open →',
      'admin.models.h1': 'Model registry',
      'admin.models.lead': 'Versioned ML models served to the diagnosis pipeline. New releases are promoted from staging to production after sign-off.',
      'admin.models.history': 'Deployment history',
      'admin.models.register': 'Register model',
      'admin.models.col.model': 'Model',
      'admin.models.col.task': 'Task',
      'admin.models.col.framework': 'Framework',
      'admin.models.col.params': 'Params',
      'admin.models.col.metric': 'Test metric',
      'admin.models.col.deployed': 'Deployed',
      'admin.models.inf24h': 'Inference volume · last 24h',
      'admin.models.latency': 'Avg inference latency',
      'admin.models.drift': 'Drift alerts',
      'admin.models.allClear': '● all clear',
      'admin.models.status.prod': 'production',
      'admin.models.status.staging': 'staging',
      'set.eyebrow': 'Settings',
      'set.title': 'Preferences',
      'set.lead': 'Customize the Octopus platform for your profile.',
      'set.sec.account': 'Account',
      'set.sec.models': 'AI models',
      'set.sec.viz3d': '3D & visualization',
      'set.sec.datasets': 'Datasets',
      'set.sec.themes': 'Themes & display',
      'set.sec.notifs': 'Notifications',
      'set.sec.monitoring': 'Monitoring',
      'set.sec.integrations': 'Integrations',
      'set.sec.prefs': 'Preferences',
      'set.lang': 'Language',
      'set.lang.help': 'Affects every menu, label, and product copy string.',
      'set.lang.fr': 'Français',
      'set.lang.en': 'English',
      'set.save': 'Save',
      'set.saved': 'Saved',
      'set.cancel': 'Cancel',
      'set.password.cur': 'Current password',
      'set.password.new': 'New password',
      'set.password.conf': 'Confirm new password',
      'set.password.change': 'Change password',
      'set.theme': 'Theme',
      'set.theme.light': 'Light',
      'set.theme.dark': 'Dark',
      'set.theme.auto': 'System',
      'set.density': 'Density',
      'set.density.cozy': 'Cozy',
      'set.density.compact': 'Compact',
      'set.monitoring.enable': 'Enable Sentry',
      'set.monitoring.help': 'Anonymised error reports. No patient data (PHI) is ever sent.'
    }
  };
  function t(key, vars) {
    let s = DICT[lang] && DICT[lang][key] || DICT.en && DICT.en[key] || key;
    if (vars) Object.keys(vars).forEach(k => {
      s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
    });
    return s;
  }
  function setLang(next) {
    if (!DICT[next]) return;
    lang = next;
    try {
      localStorage.setItem(KEY, next);
    } catch (e) {}
    document.documentElement.lang = next;
    window.location.reload();
  }
  function getLang() {
    return lang;
  }
  document.documentElement.lang = lang;
  /* Sidebar collapsed state — applied to <html> before React mounts so
     the rail renders in the right width on first paint (no flash). */
  try {
    if (localStorage.getItem('octopus.rail.collapsed') === '1') {
      document.documentElement.classList.add('rail-collapsed');
    }
  } catch (e) {}
  window.t = t;
  window.octopusI18n = {
    t,
    setLang,
    getLang
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "lib/i18n.js", error: String((e && e.message) || e) }); }

// lib/monitoring.js
try { (() => {
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
    release: RELEASE
  };

  // Stub API so UI kits can always call it.
  window.RS.captureError = function (err, ctx) {
    if (window.Sentry) window.Sentry.captureException(err, {
      extra: ctx
    });else console.error('[RS]', err, ctx);
  };
  window.RS.captureMessage = function (msg, level, ctx) {
    if (window.Sentry) window.Sentry.captureMessage(msg, {
      level: level || 'info',
      extra: ctx
    });else console.log('[RS:' + (level || 'info') + ']', msg, ctx || '');
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
      integrations: [window.Sentry.browserTracingIntegration(), window.Sentry.replayIntegration({
        maskAllText: true,
        // PHI safety: never record patient text
        maskAllInputs: true,
        blockAllMedia: true // never record fundus images in replays
      })],
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
      }
    });
    console.info('[RS] Sentry initialized · ' + ENV + ' · ' + RELEASE);
  };
  document.head.appendChild(s);
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "lib/monitoring.js", error: String((e && e.message) || e) }); }

// web/admin/app.jsx
try { (() => {
/* Admin surface — gestion utilisateurs, jeux de données, modèles, audit.
   Toutes les données proviennent de window.OctopusDB (base de test partagée). */

const {
  useState,
  useEffect
} = React;
const DB = window.OctopusDB;
const T = window.t || (k => k);
const L = (fr, en) => window.octopusI18n && window.octopusI18n.getLang() === 'en' ? en : fr;
const ROLE_LABEL = {
  doctor: L('docteur', 'doctor'),
  student: L('étudiant', 'student'),
  admin: 'admin'
};
const STATUS_LABEL = {
  active: L('actif', 'active'),
  pending: L('en attente', 'pending'),
  ready: L('prêt', 'ready'),
  review: L('en revue', 'review'),
  ingest: L('ingestion', 'ingest'),
  production: 'production',
  staging: 'staging'
};
function useDB() {
  const [, setTick] = useState(0);
  useEffect(() => DB.onChange(() => setTick(t => t + 1)), []);
}

/* ---------- left rail ---------- */
function AdminRail({
  active,
  setActive,
  counts
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "rail"
  }, /*#__PURE__*/React.createElement(RailBrand, {
    subtitle: T('brand.tag.admin')
  }), /*#__PURE__*/React.createElement("div", {
    className: "rail-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rail-section-label"
  }, T('rail.section.manage')), /*#__PURE__*/React.createElement(RailItem, {
    icon: "users",
    label: T('rail.users'),
    count: counts.users,
    on: active === 'users',
    onClick: () => setActive('users')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "database",
    label: T('rail.datasets'),
    count: counts.datasets,
    on: active === 'datasets',
    onClick: () => setActive('datasets')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "cpu",
    label: T('rail.models'),
    count: counts.models,
    on: active === 'models',
    onClick: () => setActive('models')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "flask",
    label: T('rail.annotation'),
    count: counts.cases,
    on: active === 'cases',
    onClick: () => setActive('cases')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rail-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rail-section-label"
  }, T('rail.section.oversight')), /*#__PURE__*/React.createElement(RailItem, {
    icon: "shield",
    label: T('rail.audit'),
    on: active === 'audit',
    onClick: () => setActive('audit')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "chart",
    label: T('rail.analytics'),
    on: active === 'analytics',
    onClick: () => setActive('analytics')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "sliders",
    label: T('rail.policies')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rail-foot"
  }, /*#__PURE__*/React.createElement(RailItem, {
    icon: "settings",
    label: T('rail.preferences'),
    onClick: () => {
      location.href = '../settings/index.html?profile=admin';
    }
  }), /*#__PURE__*/React.createElement(RailUser, {
    initials: "ME",
    name: "Mehdi El Otmani",
    role: T('role.admin'),
    email: "m.otmani@octopus.ai",
    profile: "admin"
  })));
}
function PageHead({
  title,
  lead,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Administration', 'Administration')), /*#__PURE__*/React.createElement("h1", null, title), lead ? /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, lead) : null), actions ? /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, actions) : null);
}

/* ---------- utilisateurs ---------- */
function UsersView() {
  const [filter, setFilter] = useState('all');
  const [invite, setInvite] = useState(null); // null | {name,email,role,dept}
  const [toast, setToast] = useState(null);
  const users = DB.listUsers();
  const filtered = users.filter(u => filter === 'all' || u.role === filter);
  const stats = {
    all: users.length,
    doctor: users.filter(u => u.role === 'doctor').length,
    student: users.filter(u => u.role === 'student').length,
    pending: users.filter(u => u.status === 'pending').length
  };
  const flash = m => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };
  const exportCsv = () => {
    const head = ['id', 'name', 'email', 'role', 'dept', 'status', 'cases'];
    const rows = users.map(u => head.map(k => `"${String(u[k] != null ? u[k] : '').replace(/"/g, '""')}"`).join(','));
    const csv = head.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'octopus-utilisateurs.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    flash(L('CSV exporté', 'CSV exported'));
  };
  const submitInvite = () => {
    if (!invite.name || !invite.email) return;
    DB.addUser(invite);
    setInvite(null);
    flash(L('Invitation envoyée', 'Invitation sent'));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: L('Utilisateurs & accès', 'Users & access'),
    lead: L('Comptes répartis sur 3 profils. Les invitations en attente requièrent une approbation manuelle.', 'Accounts across 3 profiles. Pending invitations require manual approval.'),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary",
      onClick: exportCsv
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "download"
    }), " ", L('Exporter CSV', 'Export CSV')), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary",
      onClick: () => setInvite({
        name: '',
        email: '',
        role: 'student',
        dept: 'Médecine M5'
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus"
    }), " ", L('Inviter', 'Invite')))
  }), invite && /*#__PURE__*/React.createElement("div", {
    className: "invite-bar"
  }, /*#__PURE__*/React.createElement("input", {
    className: "set-input",
    placeholder: L('Nom complet', 'Full name'),
    value: invite.name,
    onChange: e => setInvite({
      ...invite,
      name: e.target.value
    })
  }), /*#__PURE__*/React.createElement("input", {
    className: "set-input",
    placeholder: "email@etab.ma",
    value: invite.email,
    onChange: e => setInvite({
      ...invite,
      email: e.target.value
    })
  }), /*#__PURE__*/React.createElement("select", {
    className: "set-input",
    value: invite.role,
    onChange: e => setInvite({
      ...invite,
      role: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: "student"
  }, L('Étudiant', 'Student')), /*#__PURE__*/React.createElement("option", {
    value: "doctor"
  }, L('Docteur', 'Doctor')), /*#__PURE__*/React.createElement("option", {
    value: "admin"
  }, "Admin")), /*#__PURE__*/React.createElement("input", {
    className: "set-input",
    placeholder: L('Service', 'Department'),
    value: invite.dept,
    onChange: e => setInvite({
      ...invite,
      dept: e.target.value
    })
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: submitInvite,
    disabled: !invite.name || !invite.email
  }, L('Envoyer', 'Send')), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setInvite(null)
  }, L('Annuler', 'Cancel'))), /*#__PURE__*/React.createElement("div", {
    className: "stat-cards"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Tous', 'All')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, stats.all)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Docteurs', 'Doctors')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, stats.doctor)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Étudiants', 'Students')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, stats.student)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card pending"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('En attente', 'Pending')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, stats.pending), /*#__PURE__*/React.createElement("span", {
    className: "trend"
  }, L('à approuver', 'awaits approval')))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-tabs"
  }, [{
    k: 'all',
    l: L('Tous', 'All')
  }, {
    k: 'doctor',
    l: L('Docteurs', 'Doctors')
  }, {
    k: 'student',
    l: L('Étudiants', 'Students')
  }, {
    k: 'admin',
    l: 'Admins'
  }].map(t => /*#__PURE__*/React.createElement("button", {
    key: t.k,
    className: `tt ${filter === t.k ? 'on' : ''}`,
    onClick: () => setFilter(t.k)
  }, t.l))), /*#__PURE__*/React.createElement("table", {
    className: "rs-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: 28
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  })), /*#__PURE__*/React.createElement("th", null, L('Utilisateur', 'User')), /*#__PURE__*/React.createElement("th", null, L('Rôle', 'Role')), /*#__PURE__*/React.createElement("th", null, L('Service', 'Department')), /*#__PURE__*/React.createElement("th", null, L('Cas', 'Cases')), /*#__PURE__*/React.createElement("th", null, L('Dernière activité', 'Last active')), /*#__PURE__*/React.createElement("th", null, L('Statut', 'Status')), /*#__PURE__*/React.createElement("th", {
    style: {
      width: 40
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, filtered.map(u => /*#__PURE__*/React.createElement("tr", {
    key: u.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "avatar sm"
  }, u.name.split(' ').map(p => p[0]).slice(0, 2).join('')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 500
    }
  }, u.name), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)'
    }
  }, u.email)))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `role-pill role-${u.role}`
  }, ROLE_LABEL[u.role])), /*#__PURE__*/React.createElement("td", null, u.dept), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, u.cases), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      color: 'var(--rs-fg-muted)'
    }
  }, u.last), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `status status-${u.status}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), STATUS_LABEL[u.status] || u.status)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn"
  }, "\u22EF"))))))));
}

/* ---------- jeux de données ---------- */
function DatasetsView() {
  const datasets = DB.listDatasets();
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: L('Jeux de données', 'Case datasets'),
    lead: L('Collections de fonds d’œil pour la référence clinique, la simulation étudiant et l’entraînement des modèles.', 'Curated fundus collections for clinician reference, student simulation, and model training.'),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "layers"
    }), " ", L('Lignage', 'Lineage')), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "upload"
    }), " ", L('Nouvelle ingestion', 'New ingest')))
  }), /*#__PURE__*/React.createElement("div", {
    className: "ds-grid"
  }, datasets.map(d => {
    const total = d.gradeDist.reduce((s, x) => s + x, 0);
    return /*#__PURE__*/React.createElement("div", {
      key: d.id,
      className: "ds-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 11,
        color: 'var(--rs-fg-muted)'
      }
    }, d.id), /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: '4px 0 0',
        fontSize: 16
      }
    }, d.name), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 11,
        color: 'var(--rs-fg-muted)',
        marginTop: 4
      }
    }, d.type, " \xB7 ", d.license)), /*#__PURE__*/React.createElement("span", {
      className: `status status-${d.status === 'ready' ? 'active' : d.status === 'review' ? 'pending' : 'ingest'}`
    }, /*#__PURE__*/React.createElement("span", {
      className: "dot"
    }), STATUS_LABEL[d.status] || d.status)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        justifyContent: 'space-between',
        alignItems: 'baseline'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "eyebrow"
    }, L('Distribution des grades', 'Grade distribution')), /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 11,
        color: 'var(--rs-fg-muted)'
      }
    }, "n = ", total.toLocaleString(L('fr-FR', 'en-US')))), /*#__PURE__*/React.createElement("div", {
      className: "ds-bar",
      style: {
        marginTop: 8
      }
    }, d.gradeDist.map((v, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: v,
        background: `var(--rs-grade-${i})`
      },
      title: `Grade ${i}: ${v}`
    }))), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        marginTop: 6,
        gap: 12
      }
    }, d.gradeDist.map((v, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "mono",
      style: {
        fontSize: 10,
        color: 'var(--rs-fg-muted)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        width: 6,
        height: 6,
        background: `var(--rs-grade-${i})`,
        borderRadius: '50%',
        marginRight: 4
      }
    }), Math.round(v / total * 100), "%")))), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        marginTop: 14,
        paddingTop: 12,
        borderTop: '1px solid var(--rs-hairline)',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 11,
        color: 'var(--rs-fg-muted)'
      }
    }, L('Ingéré le', 'Ingested'), " ", d.ingested), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost"
    }, L('Ouvrir', 'Open'), " \u2192")));
  })));
}

/* ---------- registre des modèles ---------- */
function ModelsView() {
  const models = DB.listModels();
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: L('Registre des modèles', 'Model registry'),
    lead: L('Modèles ML versionnés servis au pipeline de diagnostic. Promus de staging à production après validation.', 'Versioned ML models served to the diagnosis pipeline. Promoted from staging to production after sign-off.'),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "history"
    }), " ", L('Historique', 'History')), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "upload"
    }), " ", L('Enregistrer un modèle', 'Register model')))
  }), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "rs-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, L('Modèle', 'Model')), /*#__PURE__*/React.createElement("th", null, L('Tâche', 'Task')), /*#__PURE__*/React.createElement("th", null, "Framework"), /*#__PURE__*/React.createElement("th", null, L('Params', 'Params')), /*#__PURE__*/React.createElement("th", null, L('Métrique test', 'Test metric')), /*#__PURE__*/React.createElement("th", null, L('Statut', 'Status')), /*#__PURE__*/React.createElement("th", null, L('Déployé', 'Deployed')), /*#__PURE__*/React.createElement("th", {
    style: {
      width: 40
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, models.map(m => /*#__PURE__*/React.createElement("tr", {
    key: m.id
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      fontWeight: 500
    }
  }, m.name), /*#__PURE__*/React.createElement("td", null, m.task), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)'
    }
  }, m.framework)), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, m.params), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, m.metric), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `status status-${m.status === 'production' ? 'active' : 'pending'}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), m.status)), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      color: 'var(--rs-fg-muted)',
      fontSize: 12
    }
  }, m.deployed), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn"
  }, "\u22EF"))))))));
}

/* ---------- cas (file d'annotation / corpus live) ---------- */
function CasesView() {
  const cases = DB.listCases();
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: L('Cas de la plateforme', 'Platform cases'),
    lead: L('Tous les cas présents dans la base de test, partagés avec l’interface docteur.', 'All cases in the test database, shared with the doctor interface.')
  }), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "rs-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, L('Cas', 'Case')), /*#__PURE__*/React.createElement("th", null, L('Patient', 'Patient')), /*#__PURE__*/React.createElement("th", null, L('Grade', 'Grade')), /*#__PURE__*/React.createElement("th", null, L('Confiance', 'Confidence')), /*#__PURE__*/React.createElement("th", null, L('Statut', 'Status')), /*#__PURE__*/React.createElement("th", null, L('Acquis', 'Acquired')))), /*#__PURE__*/React.createElement("tbody", null, cases.map(c => /*#__PURE__*/React.createElement("tr", {
    key: c.id
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      fontWeight: 500
    }
  }, c.id, " \xB7 ", c.laterality), /*#__PURE__*/React.createElement("td", null, c.patient, ", ", c.age, c.sex), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Pill, {
    grade: c.grade
  }, window.t ? window.t('grade.' + c.grade) : c.grade)), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, c.conf, "%"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "status status-active"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), c.status)), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      color: 'var(--rs-fg-muted)',
      fontSize: 12
    }
  }, c.acquired)))))));
}

/* ---------- journal d'audit (live) ---------- */
const AUDIT_LABEL = {
  'case.create': L('Cas créé', 'Case created'),
  'inference.run': L('Inférence IA exécutée', 'AI inference run'),
  'report.sign': L('Rapport signé', 'Report signed'),
  'case.update': L('Cas mis à jour', 'Case updated'),
  'attempt.submit': L('Tentative étudiant', 'Student attempt')
};
function AuditView() {
  const entries = DB.listAudit();
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: L('Journal d’audit', 'Audit log'),
    lead: L('Trace immuable de toutes les actions : créations de cas, inférences, signatures, tentatives. Mise à jour en direct.', 'Immutable trace of all actions: case creations, inferences, signatures, attempts. Live.')
  }), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 0
    }
  }, entries.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      textAlign: 'center',
      color: 'var(--rs-fg-muted)'
    }
  }, L('Aucune entrée. Téléversez ou signez un cas dans l’interface docteur pour générer des événements.', 'No entries yet. Upload or sign a case in the doctor interface to generate events.')) : /*#__PURE__*/React.createElement("table", {
    className: "rs-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, L('Horodatage', 'Timestamp')), /*#__PURE__*/React.createElement("th", null, L('Action', 'Action')), /*#__PURE__*/React.createElement("th", null, L('Référence', 'Reference')))), /*#__PURE__*/React.createElement("tbody", null, entries.map((e, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      color: 'var(--rs-fg-muted)',
      fontSize: 12
    }
  }, new Date(e.ts).toLocaleString(L('fr-FR', 'en-GB'))), /*#__PURE__*/React.createElement("td", null, AUDIT_LABEL[e.action] || e.action), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      color: 'var(--rs-teal-700)',
      fontSize: 12
    }
  }, e.meta && (e.meta.id || e.meta.caseId) || '—')))))));
}

/* ---------- analytics plateforme (live) ---------- */
function AnalyticsView() {
  const cases = DB.listCases();
  const reports = DB.listReports();
  const n = cases.length;
  const byGrade = [0, 1, 2, 3, 4].map(g => cases.filter(c => c.grade === g).length);
  const maxG = Math.max(1, ...byGrade);
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: L('Analyse plateforme', 'Platform analytics'),
    lead: L('Indicateurs calculés en direct sur la base de test.', 'Indicators computed live from the test database.')
  }), /*#__PURE__*/React.createElement("div", {
    className: "stat-cards"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Cas total', 'Total cases')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, n)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Rapports signés', 'Signed reports')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, reports.length)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Utilisateurs', 'Users')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, DB.listUsers().length)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Modèles', 'Models')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, DB.listModels().length))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Distribution des cas par grade', 'Case distribution by grade')), /*#__PURE__*/React.createElement("div", {
    className: "amx",
    style: {
      marginTop: 14
    }
  }, byGrade.map((v, g) => /*#__PURE__*/React.createElement("div", {
    key: g,
    className: "amx-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "amx-lbl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: `var(--rs-grade-${g})`
    }
  }), "Grade ", g), /*#__PURE__*/React.createElement("div", {
    className: "amx-bar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${v / maxG * 100}%`,
      background: `var(--rs-grade-${g})`
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, v))))));
}

/* ---------- root ---------- */
function App() {
  useDB();
  const [section, setSection] = useState('users');
  const counts = {
    users: DB.listUsers().length,
    datasets: DB.listDatasets().length,
    models: DB.listModels().length,
    cases: DB.listCases().length
  };
  const CRUMB = {
    users: L('Utilisateurs & accès', 'Users & access'),
    datasets: L('Jeux de données', 'Datasets'),
    models: L('Modèles', 'Models'),
    cases: L('Cas', 'Cases'),
    audit: L('Journal d’audit', 'Audit log'),
    analytics: L('Analyse', 'Analytics')
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(AdminRail, {
    active: section,
    setActive: setSection,
    counts: counts
  }), /*#__PURE__*/React.createElement(TopBar, {
    crumbs: [L('Administration', 'Administration'), CRUMB[section] || ''],
    searchPlaceholder: T('topbar.search.admin')
  }), /*#__PURE__*/React.createElement("main", {
    className: "main"
  }, section === 'users' && /*#__PURE__*/React.createElement(UsersView, null), section === 'datasets' && /*#__PURE__*/React.createElement(DatasetsView, null), section === 'models' && /*#__PURE__*/React.createElement(ModelsView, null), section === 'cases' && /*#__PURE__*/React.createElement(CasesView, null), section === 'audit' && /*#__PURE__*/React.createElement(AuditView, null), section === 'analytics' && /*#__PURE__*/React.createElement(AnalyticsView, null)));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "web/admin/app.jsx", error: String((e && e.message) || e) }); }

// web/doctor/app.jsx
try { (() => {
/* Doctor surface — RetinaSight clinical diagnosis app.
   Click-thru between case list and the active reading view.
   Uses _shared.jsx components and _shell.css chrome. */

const {
  useState,
  useMemo,
  useRef,
  useEffect
} = React;
const DB = window.OctopusDB;

/* ---------- case data (from the local test DB) ---------- */

const GRADE_LABELS = [0, 1, 2, 3, 4].map(i => window.t ? window.t('grade.' + i) : ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative'][i]);
const T = window.t || (k => k);

/* ---------- left rail ---------- */
function DoctorRail({
  active,
  setActive,
  count
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "rail"
  }, /*#__PURE__*/React.createElement(RailBrand, {
    subtitle: T('brand.tag.clinical')
  }), /*#__PURE__*/React.createElement("div", {
    className: "rail-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rail-section-label"
  }, T('rail.section.diagnosis')), /*#__PURE__*/React.createElement(RailItem, {
    icon: "upload",
    label: T('rail.upload'),
    on: active === 'upload',
    onClick: () => setActive('upload')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "layers",
    label: T('rail.queue'),
    count: count,
    on: active === 'queue',
    onClick: () => setActive('queue')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "grad",
    label: T('rail.active'),
    on: active === 'study',
    onClick: () => setActive('study')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "users",
    label: T('rail.patients'),
    count: 184,
    on: active === 'patients',
    onClick: () => setActive('patients')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "file",
    label: T('rail.reports'),
    count: 47,
    on: active === 'reports',
    onClick: () => setActive('reports')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rail-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rail-section-label"
  }, T('rail.section.reference')), /*#__PURE__*/React.createElement(RailItem, {
    icon: "book",
    label: T('rail.atlas'),
    on: active === 'atlas',
    onClick: () => setActive('atlas')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "chart",
    label: T('rail.outcomes'),
    on: active === 'outcomes',
    onClick: () => setActive('outcomes')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rail-foot"
  }, /*#__PURE__*/React.createElement(RailItem, {
    icon: "settings",
    label: T('rail.preferences'),
    onClick: () => {
      location.href = '../settings/index.html?profile=doctor';
    }
  }), /*#__PURE__*/React.createElement(RailUser, {
    initials: "DA",
    name: "Dr. Amina Saidi",
    role: T('role.ophth'),
    email: "amina.saidi@chu-rabat.ma",
    profile: "doctor"
  })));
}

/* ---------- horizontal case strip (replaces left queue column) ---------- */
function CaseStrip({
  cases,
  activeId,
  onPick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "case-strip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "case-strip-label"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, T('rail.queue')), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)'
    }
  }, cases.length, " ", T('queue.today'))), cases.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    className: `case-chip ${c.id === activeId ? 'on' : ''}`,
    onClick: () => onPick(c.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "thumb"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/fundus-sample-1.svg",
    alt: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "id"
  }, c.id, " \xB7 ", c.laterality), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, c.patient, ", ", c.age, c.sex)), /*#__PURE__*/React.createElement(Pill, {
    grade: c.grade
  }, GRADE_LABELS[c.grade]))));
}

/* ---------- main reading view ---------- */
const FOCUS_SEG = new URLSearchParams(location.search).get('focus') === 'segmentation';
const INITIAL_VIEW = new URLSearchParams(location.search).get('view') === 'upload' ? 'upload' : 'study';

/* ---------- upload (DR) view ---------- */
function UploadView({
  cases,
  onCreated,
  onOpen
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [drag, setDrag] = useState(false);
  const [form, setForm] = useState({
    id: DB.nextCaseId(),
    laterality: 'OD',
    device: 'Topcon NW400',
    date: new Date().toISOString().slice(0, 10)
  });
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const accept = f => {
    if (!f) return;
    setFile({
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(1) + ' Mo'
    });
    if (f.type && f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));else setPreview('../../assets/fundus-sample-1.svg');
  };
  const onDrop = e => {
    e.preventDefault();
    setDrag(false);
    accept(e.dataTransfer.files && e.dataTransfer.files[0]);
  };
  const run = () => {
    if (!file || busy) return;
    setBusy(true);
    // Simulate the AI inference latency, then persist the new case to the DB.
    setTimeout(() => {
      const created = DB.addCase({
        id: form.id,
        laterality: form.laterality,
        device: form.device,
        date: form.date
      });
      setBusy(false);
      onCreated && onCreated(created.id);
    }, 900);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "upload-view"
  }, /*#__PURE__*/React.createElement("div", {
    className: "upload-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, T('up.eyebrow')), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 26,
      letterSpacing: '-0.02em',
      margin: '4px 0 0'
    }
  }, T('up.title')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--rs-ink-700)',
      margin: '6px 0 0'
    }
  }, T('up.lead'))), /*#__PURE__*/React.createElement("div", {
    className: "upload-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: `dropzone ${drag ? 'drag' : ''} ${file ? 'has-file' : ''}`,
    onDragOver: e => {
      e.preventDefault();
      setDrag(true);
    },
    onDragLeave: () => setDrag(false),
    onDrop: onDrop,
    onClick: () => inputRef.current && inputRef.current.click()
  }, /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    type: "file",
    accept: "image/*,.dcm,.dicom",
    style: {
      display: 'none'
    },
    onChange: e => accept(e.target.files[0])
  }), !file ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "dz-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "upload",
    size: 28
  })), /*#__PURE__*/React.createElement("div", {
    className: "dz-title"
  }, T('up.drop')), /*#__PURE__*/React.createElement("div", {
    className: "dz-sub"
  }, T('up.browse')), /*#__PURE__*/React.createElement("div", {
    className: "dz-formats mono"
  }, "JPEG \xB7 PNG \xB7 DICOM \xB7 \u2264 40 Mo")) : /*#__PURE__*/React.createElement("div", {
    className: "dz-preview"
  }, /*#__PURE__*/React.createElement("img", {
    src: preview,
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "dz-file"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, file.name), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)'
    }
  }, file.size, " \xB7 ", T('up.ready'))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: e => {
      e.stopPropagation();
      setFile(null);
      setPreview(null);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cross",
    size: 14
  }), " ", T('up.remove')))), /*#__PURE__*/React.createElement("div", {
    className: "upload-form"
  }, /*#__PURE__*/React.createElement("label", {
    className: "up-field"
  }, /*#__PURE__*/React.createElement("span", null, T('up.patientId')), /*#__PURE__*/React.createElement("input", {
    className: "up-input mono",
    value: form.id,
    onChange: e => setForm({
      ...form,
      id: e.target.value
    })
  })), /*#__PURE__*/React.createElement("label", {
    className: "up-field"
  }, /*#__PURE__*/React.createElement("span", null, T('up.laterality')), /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `seg-btn ${form.laterality === 'OD' ? 'on' : ''}`,
    onClick: () => setForm({
      ...form,
      laterality: 'OD'
    })
  }, "OD"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `seg-btn ${form.laterality === 'OS' ? 'on' : ''}`,
    onClick: () => setForm({
      ...form,
      laterality: 'OS'
    })
  }, "OS"))), /*#__PURE__*/React.createElement("label", {
    className: "up-field"
  }, /*#__PURE__*/React.createElement("span", null, T('up.device')), /*#__PURE__*/React.createElement("input", {
    className: "up-input",
    value: form.device,
    onChange: e => setForm({
      ...form,
      device: e.target.value
    })
  })), /*#__PURE__*/React.createElement("label", {
    className: "up-field"
  }, /*#__PURE__*/React.createElement("span", null, T('up.date')), /*#__PURE__*/React.createElement("input", {
    className: "up-input mono",
    type: "date",
    value: form.date,
    onChange: e => setForm({
      ...form,
      date: e.target.value
    })
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary up-run",
    disabled: !file || busy,
    onClick: run
  }, /*#__PURE__*/React.createElement(Icon, {
    name: busy ? 'activity' : 'activity',
    size: 14
  }), " ", busy ? T('up.running') : T('up.run')))), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginTop: 8
    }
  }, T('up.recent')), /*#__PURE__*/React.createElement("div", {
    className: "upload-recent"
  }, cases.slice(0, 4).map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    className: "recent-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "recent-thumb"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/fundus-sample-1.svg",
    alt: ""
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12.5,
      fontWeight: 500
    }
  }, c.id, " \xB7 ", c.laterality), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)'
    }
  }, c.acquired.split(' ')[1], " \xB7 ", c.device)), /*#__PURE__*/React.createElement(Pill, {
    grade: c.grade
  }, GRADE_LABELS[c.grade]), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => onOpen(c.id)
  }, T('up.open'), " \u2192")))));
}

/* ---------- main reading view ---------- */

/* Lesion marker pools (coords in the 400×400 fundus viewBox) */
const LESION_POOLS = {
  ma: [{
    x: 220,
    y: 160
  }, {
    x: 270,
    y: 180
  }, {
    x: 290,
    y: 220
  }, {
    x: 180,
    y: 270
  }, {
    x: 245,
    y: 280
  }, {
    x: 305,
    y: 155
  }, {
    x: 160,
    y: 115
  }, {
    x: 320,
    y: 280
  }, {
    x: 140,
    y: 210
  }, {
    x: 265,
    y: 300
  }],
  ex: [{
    x: 225,
    y: 195
  }, {
    x: 265,
    y: 225
  }, {
    x: 200,
    y: 245
  }, {
    x: 285,
    y: 195
  }],
  hem: [{
    x: 150,
    y: 230
  }, {
    x: 310,
    y: 255
  }, {
    x: 175,
    y: 305
  }, {
    x: 240,
    y: 120
  }, {
    x: 300,
    y: 300
  }, {
    x: 120,
    y: 160
  }],
  cw: [{
    x: 115,
    y: 185
  }, {
    x: 330,
    y: 205
  }]
};

/* Seeded RNG so the generated vessel tree is stable across renders */
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = s * 1664525 + 1013904223 >>> 0;
    return s / 4294967296;
  };
}

/* Generate a branching 3D vessel tree once (segments with depth z) */
function genVesselTree(seed) {
  const rng = makeRng(seed);
  const segs = [];
  function branch(x, y, z, ang, pit, len, w, depth) {
    if (depth <= 0 || len < 5) return;
    const dx = Math.cos(ang) * len,
      dy = Math.sin(ang) * len,
      dz = Math.sin(pit) * len * 1.4;
    const nx = x + dx,
      ny = y + dy,
      nz = z + dz;
    segs.push({
      x1: x,
      y1: y,
      z1: z,
      x2: nx,
      y2: ny,
      z2: nz,
      w
    });
    branch(nx, ny, nz, ang + (rng() * 0.5 - 0.12), pit + (rng() * 0.5 - 0.25), len * 0.8, w * 0.72, depth - 1);
    if (rng() > 0.28) branch(nx, ny, nz, ang - (rng() * 0.5 - 0.12), pit + (rng() * 0.5 - 0.25), len * 0.72, w * 0.66, depth - 1);
  }
  for (const a of [-0.7, -0.25, 0.25, 0.7]) {
    branch(-46, 0, 0, a, rng() * 0.7 - 0.35, 34, 6.5, 6);
  }
  return segs;
}

/* 3D blood-vessel structure viewer — canvas, draggable rotation + zoom */
function Vessel3D({
  onClose
}) {
  const canvasRef = React.useRef(null);
  const stateRef = React.useRef({
    yaw: 0.5,
    pitch: -0.35,
    zoom: 1,
    drag: false,
    lx: 0,
    ly: 0,
    auto: true
  });
  const segs = React.useMemo(() => genVesselTree(20260607), []);
  const [auto, setAuto] = useState(true);
  React.useEffect(() => {
    stateRef.current.auto = auto;
  }, [auto]);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const draw = () => {
      const st = stateRef.current;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.clientWidth,
        H = canvas.clientHeight;
      if (canvas.width !== W * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2,
        cy = H / 2,
        focal = 320,
        baseScale = Math.min(W, H) / 240 * st.zoom;
      const cosY = Math.cos(st.yaw),
        sinY = Math.sin(st.yaw);
      const cosX = Math.cos(st.pitch),
        sinX = Math.sin(st.pitch);
      const proj = p => {
        let x = p.x * cosY + p.z * sinY;
        let z = -p.x * sinY + p.z * cosY;
        let y = p.y * cosX - z * sinX;
        z = p.y * sinX + z * cosX;
        const s = focal / (focal + z) * baseScale;
        return {
          sx: cx + x * s,
          sy: cy + y * s,
          z,
          s
        };
      };
      const drawn = segs.map(sg => {
        const a = proj({
          x: sg.x1,
          y: sg.y1,
          z: sg.z1
        });
        const b = proj({
          x: sg.x2,
          y: sg.y2,
          z: sg.z2
        });
        return {
          a,
          b,
          w: sg.w,
          z: (a.z + b.z) / 2
        };
      }).sort((p, q) => q.z - p.z);
      for (const d of drawn) {
        const t = Math.max(0, Math.min(1, (d.z + 120) / 240));
        const light = 1 - t; // closer = brighter
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
      const o = proj({
        x: -46,
        y: 0,
        z: 0
      });
      ctx.fillStyle = '#BFE6E5';
      ctx.beginPath();
      ctx.arc(o.sx, o.sy, 5 * o.s * 0.5 + 2, 0, Math.PI * 2);
      ctx.fill();
      if (st.auto && !st.drag) st.yaw += 0.004;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [segs]);
  const onDown = e => {
    const st = stateRef.current;
    st.drag = true;
    st.lx = e.clientX;
    st.ly = e.clientY;
  };
  const onMove = e => {
    const st = stateRef.current;
    if (!st.drag) return;
    st.yaw += (e.clientX - st.lx) * 0.01;
    st.pitch += (e.clientY - st.ly) * 0.01;
    st.pitch = Math.max(-1.4, Math.min(1.4, st.pitch));
    st.lx = e.clientX;
    st.ly = e.clientY;
  };
  const onUp = () => {
    stateRef.current.drag = false;
  };
  const onWheel = e => {
    e.preventDefault();
    const st = stateRef.current;
    st.zoom = Math.max(0.5, Math.min(3.5, st.zoom - e.deltaY * 0.001));
  };
  const reset = () => {
    Object.assign(stateRef.current, {
      yaw: 0.5,
      pitch: -0.35,
      zoom: 1
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "v3d-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "v3d-modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "v3d-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--rs-canvas-fg-mute)'
    }
  }, T('study.vesselMorph')), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '4px 0 0',
      fontSize: 17,
      color: 'var(--rs-canvas-fg)'
    }
  }, T('v3d.title'))), /*#__PURE__*/React.createElement("button", {
    className: "cv-btn",
    onClick: onClose,
    title: T('v3d.close')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cross",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "v3d-stage"
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    className: "v3d-canvas",
    onPointerDown: onDown,
    onPointerMove: onMove,
    onPointerUp: onUp,
    onPointerLeave: onUp,
    onWheel: onWheel
  }), /*#__PURE__*/React.createElement("div", {
    className: "v3d-hint mono"
  }, T('v3d.subtitle'))), /*#__PURE__*/React.createElement("div", {
    className: "v3d-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: `v3d-tg ${auto ? 'on' : ''}`,
    onClick: () => setAuto(a => !a)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "activity",
    size: 14
  }), " ", T('v3d.rotate')), /*#__PURE__*/React.createElement("button", {
    className: "v3d-tg",
    onClick: reset
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "grad",
    size: 14
  }), " ", T('v3d.reset')), /*#__PURE__*/React.createElement("div", {
    className: "v3d-legend mono"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    style: {
      background: '#BFE6E5'
    }
  }), " ", T('v3d.depth'), " \u2212"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    style: {
      background: '#1F6E6E'
    }
  }), " ", T('v3d.depth'), " +")))));
}
function StudyViewer({
  caseData,
  onStatus
}) {
  const [overlays, setOverlays] = useState(FOCUS_SEG ? {
    heatmap: false,
    vessels: true,
    disc: true,
    boxes: false
  } // eye-structure / segmentation focus
  : {
    heatmap: true,
    vessels: true,
    disc: false,
    boxes: false
  });
  const [zoom, setZoom] = useState(1);
  const [spot, setSpot] = useState(null); // which lesion type is located on the image
  const [show3D, setShow3D] = useState(false);
  const [toast, setToast] = useState(null);
  const reportRef = useRef(null);
  const c = caseData;
  const bd = c.lesionBreakdown || {};
  const lesionTypes = [{
    id: 'ma',
    label: T('study.microaneurysms'),
    color: '#F0683C',
    count: bd.ma != null ? bd.ma : Math.max(0, c.lesions - 2)
  }, {
    id: 'ex',
    label: T('study.exudates'),
    color: '#FFD25A',
    count: bd.ex != null ? bd.ex : Math.min(c.lesions, 2)
  }, {
    id: 'hem',
    label: T('study.hemorrhages'),
    color: '#E8492E',
    count: bd.hem != null ? bd.hem : c.grade >= 3 ? c.lesions - 4 : 0
  }, {
    id: 'cw',
    label: T('study.cottonWool'),
    color: '#5CD6DE',
    count: bd.cw != null ? bd.cw : 0
  }];
  const spotType = lesionTypes.find(l => l.id === spot);
  const spotMarks = spotType ? LESION_POOLS[spotType.id].slice(0, spotType.count) : [];
  const flash = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };
  const onSign = () => {
    DB.saveReport(c.id, reportRef.current ? reportRef.current.value : '', 'Dr. Amina Saidi');
    flash(T('toast.signed', {
      id: c.id
    }));
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
      setTimeout(() => {
        try {
          win.print();
        } catch (e) {}
      }, 300);
    }
    flash(T('toast.pdf', {
      id: c.id
    }));
  };
  const onSecond = () => flash(T('toast.second'));
  const probs = [0, 1, 2, 3, 4].map(i => ({
    label: `${i} · ${GRADE_LABELS[i]}`,
    value: i === c.grade ? Math.round(c.conf) : Math.round((100 - c.conf) / 4 + (Math.abs(i - c.grade) === 1 ? 6 : -1))
  }));
  // Normalize to ~100
  const total = probs.reduce((s, p) => s + Math.max(p.value, 1), 0);
  probs.forEach(p => p.value = Math.max(1, Math.round(p.value * 100 / total)));
  return /*#__PURE__*/React.createElement("div", {
    className: "study"
  }, /*#__PURE__*/React.createElement("div", {
    className: "canvas",
    "data-theme": "dark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "canvas-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono pill",
    style: {
      background: 'rgba(255,255,255,0.08)',
      color: '#FFF',
      fontSize: 11,
      letterSpacing: '0.1em'
    }
  }, c.id, " \xB7 ", T('lat.' + c.laterality + '.long')), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-canvas-fg-mute)'
    }
  }, c.acquired, " \xB7 ", c.device, " \xB7 512 \xD7 512"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto'
    },
    className: `pill pill-grade-${c.grade}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "AI \xB7 ", GRADE_LABELS[c.grade], " \xB7 ", c.conf, "%")), /*#__PURE__*/React.createElement("div", {
    className: "canvas-stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "canvas-img",
    style: {
      transform: `scale(${zoom})`
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/fundus-sample-1.svg",
    alt: "fundus"
  }), overlays.heatmap && /*#__PURE__*/React.createElement("img", {
    className: "ovl heatmap",
    src: "../../assets/fundus-sample-heatmap.svg",
    alt: ""
  }), overlays.vessels && /*#__PURE__*/React.createElement("img", {
    className: "ovl vessels",
    src: "../../assets/vessel-mask.svg",
    alt: ""
  }), overlays.boxes && /*#__PURE__*/React.createElement("svg", {
    className: "ovl",
    viewBox: "0 0 400 400"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "210",
    y: "150",
    width: "40",
    height: "30",
    fill: "none",
    stroke: "#FFD25A",
    strokeWidth: "1.5",
    strokeDasharray: "3 2"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "260",
    y: "200",
    width: "36",
    height: "30",
    fill: "none",
    stroke: "#FFD25A",
    strokeWidth: "1.5",
    strokeDasharray: "3 2"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "180",
    y: "250",
    width: "42",
    height: "28",
    fill: "none",
    stroke: "#FFD25A",
    strokeWidth: "1.5",
    strokeDasharray: "3 2"
  })), overlays.disc && /*#__PURE__*/React.createElement("svg", {
    className: "ovl",
    viewBox: "0 0 400 400"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "135",
    cy: "190",
    r: "32",
    fill: "none",
    stroke: "#A6F0F1",
    strokeWidth: "1.5",
    strokeDasharray: "4 2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "135",
    cy: "190",
    r: "14",
    fill: "none",
    stroke: "#A6F0F1",
    strokeWidth: "1.5"
  })), spotMarks.length > 0 && /*#__PURE__*/React.createElement("svg", {
    className: "ovl spot-layer",
    viewBox: "0 0 400 400"
  }, spotMarks.map((m, i) => /*#__PURE__*/React.createElement("g", {
    key: i,
    className: "spot-mark"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: m.x,
    cy: m.y,
    r: "18",
    fill: spotType.color,
    opacity: "0.16"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: m.x,
    cy: m.y,
    r: "15",
    fill: "none",
    stroke: spotType.color,
    strokeWidth: "2",
    opacity: "0.95"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: m.x,
    cy: m.y,
    r: "15",
    fill: "none",
    stroke: spotType.color,
    strokeWidth: "2.5",
    className: "spot-pulse"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: m.x,
    cy: m.y,
    r: "3",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: m.x,
    cy: m.y,
    r: "3",
    fill: spotType.color,
    opacity: "0.6"
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "canvas-toolbar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "cv-btn",
    onClick: () => setZoom(z => Math.min(2.5, z + 0.2))
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus"
  })), /*#__PURE__*/React.createElement("button", {
    className: "cv-btn",
    onClick: () => setZoom(z => Math.max(0.6, z - 0.2))
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cross",
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      padding: '0 8px',
      color: 'var(--rs-canvas-fg-mute)',
      alignSelf: 'center'
    }
  }, Math.round(zoom * 100), "%"), /*#__PURE__*/React.createElement("span", {
    className: "cv-sep"
  }), /*#__PURE__*/React.createElement("button", {
    className: `cv-btn ${overlays.heatmap ? 'on' : ''}`,
    onClick: () => setOverlays({
      ...overlays,
      heatmap: !overlays.heatmap
    }),
    title: "Grad-CAM"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heatmap"
  })), /*#__PURE__*/React.createElement("button", {
    className: `cv-btn ${overlays.vessels ? 'on' : ''}`,
    onClick: () => setOverlays({
      ...overlays,
      vessels: !overlays.vessels
    }),
    title: "Vessels"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "activity"
  })), /*#__PURE__*/React.createElement("button", {
    className: `cv-btn ${overlays.disc ? 'on' : ''}`,
    onClick: () => setOverlays({
      ...overlays,
      disc: !overlays.disc
    }),
    title: "Disc / cup"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "grad"
  })), /*#__PURE__*/React.createElement("button", {
    className: `cv-btn ${overlays.boxes ? 'on' : ''}`,
    onClick: () => setOverlays({
      ...overlays,
      boxes: !overlays.boxes
    }),
    title: "Lesion boxes"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "layers"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "patient"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 600
    }
  }, c.patient), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)'
    }
  }, c.age, c.sex, " \xB7 MRN 8847", c.id.slice(-2), " \xB7 Diabetes T2")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "history"
  }), " ", T('study.history'))), /*#__PURE__*/React.createElement("div", {
    className: "patient-note"
  }, c.note)), /*#__PURE__*/React.createElement("div", {
    className: "card panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, T('study.aiAnalysis')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      marginTop: 4
    }
  }, T('study.aiGrade'))), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-overlay-violet)',
      letterSpacing: '0.08em'
    }
  }, T('study.modelTag'))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(SeverityBar, {
    probs: probs
  }))), /*#__PURE__*/React.createElement("div", {
    className: `card panel ${FOCUS_SEG ? 'panel-focus' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, T('study.vesselMorph')), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-3d",
    onClick: () => setShow3D(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cube",
    size: 14
  }), " ", T('study.view3d'))), /*#__PURE__*/React.createElement("div", {
    className: "metrics"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, T('study.metric.av')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, c.av), /*#__PURE__*/React.createElement("span", {
    className: "trend"
  }, T('study.metric.av.note'))), /*#__PURE__*/React.createElement("div", {
    className: "metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, T('study.metric.tort')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "1.18"), /*#__PURE__*/React.createElement("span", {
    className: "trend"
  }, T('study.metric.tort.note'))), /*#__PURE__*/React.createElement("div", {
    className: "metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, T('study.metric.fractal')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "1.42"), /*#__PURE__*/React.createElement("span", {
    className: "trend"
  }, T('study.metric.fractal.note'))), /*#__PURE__*/React.createElement("div", {
    className: "metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, T('study.metric.dice')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "0.87"), /*#__PURE__*/React.createElement("span", {
    className: "trend"
  }, T('study.metric.dice.note'))))), /*#__PURE__*/React.createElement("div", {
    className: "card panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, T('study.lesion')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      marginTop: 4
    }
  }, T('study.lesionsFound', {
    n: c.lesions
  }))), spot && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-clear",
    onClick: () => setSpot(null)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cross",
    size: 12
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lesions"
  }, lesionTypes.map(lt => {
    const disabled = lt.count === 0;
    const active = spot === lt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: lt.id,
      className: `lesion lesion-btn ${active ? 'on' : ''} ${disabled ? 'is-empty' : ''}`,
      onClick: () => !disabled && setSpot(active ? null : lt.id),
      disabled: disabled,
      style: active ? {
        '--spot': lt.color
      } : undefined
    }, /*#__PURE__*/React.createElement("span", {
      className: "dot",
      style: {
        background: lt.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "lesion-label"
    }, lt.label), !disabled && /*#__PURE__*/React.createElement("span", {
      className: "lesion-locate mono"
    }, active ? '● ' + T('study.locate') : T('study.locate')), /*#__PURE__*/React.createElement("span", {
      className: "mono lesion-count"
    }, disabled ? T('study.noLesion') : lt.count));
  })), /*#__PURE__*/React.createElement("div", {
    className: "lesion-hint"
  }, T('study.spotHint'))), /*#__PURE__*/React.createElement("div", {
    className: "card panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, T('study.report')), c.status === 'signed' && /*#__PURE__*/React.createElement("span", {
    className: "status-signed mono"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12
  }), " ", T('study.signed'))), /*#__PURE__*/React.createElement("textarea", {
    key: c.id,
    ref: reportRef,
    className: "report-area",
    defaultValue: `Rétinopathie diabétique — ${GRADE_LABELS[c.grade].toLowerCase()} (grade ETDRS ${c.grade}). ${c.lesions} lésion(s) identifiée(s), à prédominance dans le quadrant temporal inférieur. Ratio A:V ${c.av} dans la plage de référence. Confiance IA ${c.conf}%.\n\nRecommandation : ${c.grade >= 3 ? 'Adresser à un spécialiste de la rétine sous 4 semaines.' : c.grade >= 1 ? 'Nouveau dépistage dans 6 mois.' : 'Dépistage annuel.'}`
  }), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onSecond
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chat"
  }), " ", T('study.secondOpinion')), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onPdf
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download"
  }), " PDF"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: onSign
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check"
  }), " ", T('study.sign')))))), toast && /*#__PURE__*/React.createElement("div", {
    className: "rs-toast"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14
  }), " ", toast), show3D && /*#__PURE__*/React.createElement(Vessel3D, {
    onClose: () => setShow3D(false)
  }));
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
  const openCase = id => {
    setActiveId(id);
    setSection('study');
  };
  const SECTION_LABELS = {
    upload: T('rail.upload'),
    queue: T('crumbs.queue'),
    study: T('crumbs.activeStudy'),
    patients: T('rail.patients'),
    reports: T('rail.reports'),
    atlas: T('rail.atlas'),
    outcomes: T('rail.outcomes')
  };
  let body;
  if (section === 'upload') {
    body = /*#__PURE__*/React.createElement(UploadView, {
      cases: cases,
      onCreated: openCase,
      onOpen: openCase
    });
  } else if (section === 'queue') {
    body = /*#__PURE__*/React.createElement(QueuePage, {
      cases: cases,
      onOpen: openCase
    });
  } else if (section === 'patients') {
    body = /*#__PURE__*/React.createElement(PatientsPage, {
      cases: cases,
      onOpen: openCase
    });
  } else if (section === 'reports') {
    body = /*#__PURE__*/React.createElement(ReportsPage, {
      onOpen: openCase
    });
  } else if (section === 'atlas') {
    body = /*#__PURE__*/React.createElement(AtlasPage, null);
  } else if (section === 'outcomes') {
    body = /*#__PURE__*/React.createElement(OutcomesPage, {
      cases: cases
    });
  } else {
    body = /*#__PURE__*/React.createElement("div", {
      className: "study-shell"
    }, /*#__PURE__*/React.createElement(CaseStrip, {
      cases: cases,
      activeId: activeCase ? activeCase.id : null,
      onPick: setActiveId
    }), activeCase && /*#__PURE__*/React.createElement(StudyViewer, {
      key: activeCase.id,
      caseData: activeCase,
      onStatus: () => setCases(DB.listCases())
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(DoctorRail, {
    active: section,
    setActive: setSection,
    count: pendingCount
  }), /*#__PURE__*/React.createElement(TopBar, {
    crumbs: [T('crumbs.clinical'), SECTION_LABELS[section] || '', section === 'study' && activeCase ? `${activeCase.id} · ${activeCase.patient}` : ''],
    searchPlaceholder: T('topbar.search.cases')
  }), /*#__PURE__*/React.createElement("main", {
    className: "main"
  }, body));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "web/doctor/app.jsx", error: String((e && e.message) || e) }); }

// web/doctor/pages.jsx
try { (() => {
/* Doctor surface — secondary pages (queue, patients, reports, atlas, outcomes).
   Each is backed by window.OctopusDB and exported to window for app.jsx.
   Loaded AFTER _shared.jsx and BEFORE app.jsx. */

const {
  useState: useStateP
} = React;
const DBP = window.OctopusDB;
const TP = window.t || (k => k);
const L = (fr, en) => window.octopusI18n && window.octopusI18n.getLang() === 'en' ? en : fr;
const GRADES_P = [0, 1, 2, 3, 4].map(i => window.t ? window.t('grade.' + i) : ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative'][i]);
const STATUS = {
  pending: {
    fr: 'En attente',
    en: 'Pending',
    cls: 'st-pending'
  },
  flagged: {
    fr: 'Signalé',
    en: 'Flagged',
    cls: 'st-flagged'
  },
  urgent: {
    fr: 'Urgent',
    en: 'Urgent',
    cls: 'st-urgent'
  },
  cleared: {
    fr: 'Validé',
    en: 'Cleared',
    cls: 'st-cleared'
  },
  signed: {
    fr: 'Signé',
    en: 'Signed',
    cls: 'st-signed'
  }
};
function StatusBadge({
  s
}) {
  const m = STATUS[s] || STATUS.pending;
  return /*#__PURE__*/React.createElement("span", {
    className: `dstatus ${m.cls}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), L(m.fr, m.en));
}
function PageHead({
  eyebrow,
  title,
  lead,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "dpage-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, eyebrow), /*#__PURE__*/React.createElement("h1", null, title), lead ? /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, lead) : null), actions ? /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, actions) : null);
}

/* ---------- File de lecture ---------- */
function QueuePage({
  cases,
  onOpen
}) {
  const [filter, setFilter] = useStateP('all');
  const tabs = [{
    k: 'all',
    l: L('Tous', 'All')
  }, {
    k: 'pending',
    l: L('En attente', 'Pending')
  }, {
    k: 'urgent',
    l: L('Urgents', 'Urgent')
  }, {
    k: 'signed',
    l: L('Signés', 'Signed')
  }];
  const match = c => filter === 'all' ? true : filter === 'urgent' ? c.status === 'urgent' || c.status === 'flagged' : c.status === filter;
  const rows = cases.filter(match);
  return /*#__PURE__*/React.createElement("div", {
    className: "dpage"
  }, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: L('Diagnostic', 'Diagnosis'),
    title: L('File de lecture', 'Reading queue'),
    lead: L('Tous les examens téléversés. Cliquez un cas pour ouvrir l’étude.', 'All uploaded studies. Click a case to open the study.')
  }), /*#__PURE__*/React.createElement("div", {
    className: "dfilters"
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.k,
    className: `dfilter ${filter === t.k ? 'on' : ''}`,
    onClick: () => setFilter(t.k)
  }, t.l, /*#__PURE__*/React.createElement("span", {
    className: "mono cnt"
  }, t.k === 'all' ? cases.length : cases.filter(c => t.k === 'urgent' ? c.status === 'urgent' || c.status === 'flagged' : c.status === t.k).length)))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "dtable"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, L('Cas', 'Case')), /*#__PURE__*/React.createElement("th", null, L('Patient', 'Patient')), /*#__PURE__*/React.createElement("th", null, L('Grade', 'Grade')), /*#__PURE__*/React.createElement("th", null, L('Confiance', 'Confidence')), /*#__PURE__*/React.createElement("th", null, L('Statut', 'Status')), /*#__PURE__*/React.createElement("th", null, L('Acquis', 'Acquired')), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, rows.map(c => /*#__PURE__*/React.createElement("tr", {
    key: c.id,
    onClick: () => onOpen(c.id)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dthumb"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/fundus-sample-1.svg",
    alt: ""
  })), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontWeight: 500
    }
  }, c.id, " \xB7 ", c.laterality))), /*#__PURE__*/React.createElement("td", null, c.patient, ", ", c.age, c.sex), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Pill, {
    grade: c.grade
  }, GRADES_P[c.grade])), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, c.conf, "%"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(StatusBadge, {
    s: c.status
  })), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      color: 'var(--rs-fg-muted)',
      fontSize: 12
    }
  }, c.acquired), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "dopen"
  }, L('Ouvrir', 'Open'), " \u2192"))))))));
}

/* ---------- Patients ---------- */
function PatientsPage({
  cases,
  onOpen
}) {
  const groups = {};
  cases.forEach(c => {
    (groups[c.patient] = groups[c.patient] || []).push(c);
  });
  const patients = Object.entries(groups).map(([name, list]) => ({
    name,
    list
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "dpage"
  }, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: L('Diagnostic', 'Diagnosis'),
    title: L('Patients', 'Patients'),
    lead: L('Patients regroupés à partir des examens. Cliquez un examen pour l’ouvrir.', 'Patients grouped from studies. Click a study to open it.')
  }), /*#__PURE__*/React.createElement("div", {
    className: "patient-grid"
  }, patients.map(p => {
    const c0 = p.list[0];
    const worst = Math.max(...p.list.map(c => c.grade));
    return /*#__PURE__*/React.createElement("div", {
      key: p.name,
      className: "patient-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "pavatar"
    }, p.name.split(' ').map(s => s[0]).slice(0, 2).join('')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 11,
        color: 'var(--rs-fg-muted)'
      }
    }, c0.age, c0.sex, " \xB7 MRN 8847", c0.id.slice(-2), " \xB7 ", L('Diabète T2', 'Diabetes T2')))), /*#__PURE__*/React.createElement(Pill, {
      grade: worst
    }, GRADES_P[worst])), /*#__PURE__*/React.createElement("div", {
      className: "pstudies"
    }, p.list.map(c => /*#__PURE__*/React.createElement("button", {
      key: c.id,
      className: "pstudy",
      onClick: () => onOpen(c.id)
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, c.id, " \xB7 ", c.laterality), /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        color: 'var(--rs-fg-muted)'
      }
    }, c.acquired.split(' ')[0]), /*#__PURE__*/React.createElement(StatusBadge, {
      s: c.status
    }), /*#__PURE__*/React.createElement("span", {
      className: "dopen"
    }, "\u2192")))));
  })));
}

/* ---------- Rapports ---------- */
function ReportsPage({
  onOpen
}) {
  const reports = DBP.listReports();
  return /*#__PURE__*/React.createElement("div", {
    className: "dpage"
  }, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: L('Diagnostic', 'Diagnosis'),
    title: L('Rapports', 'Reports'),
    lead: L('Rapports cliniques signés. Générés depuis l’étude active.', 'Signed clinical reports. Generated from the active study.')
  }), reports.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "dempty"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file",
    size: 28
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      marginTop: 10
    }
  }, L('Aucun rapport signé', 'No signed report')), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: '40ch'
    }
  }, L('Ouvrez un cas dans « Étude active », puis cliquez « Signer & exporter » pour créer un rapport.', 'Open a case in “Active study”, then click “Sign & export” to create a report.'))) : /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "dtable"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, L('Cas', 'Case')), /*#__PURE__*/React.createElement("th", null, L('Patient', 'Patient')), /*#__PURE__*/React.createElement("th", null, L('Grade', 'Grade')), /*#__PURE__*/React.createElement("th", null, L('Auteur', 'Author')), /*#__PURE__*/React.createElement("th", null, L('Signé le', 'Signed at')), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, reports.map(r => {
    const c = DBP.getCase(r.caseId) || {};
    return /*#__PURE__*/React.createElement("tr", {
      key: r.id,
      onClick: () => onOpen(r.caseId)
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        fontWeight: 500
      }
    }, r.caseId), /*#__PURE__*/React.createElement("td", null, c.patient || '—'), /*#__PURE__*/React.createElement("td", null, c.grade != null ? /*#__PURE__*/React.createElement(Pill, {
      grade: c.grade
    }, GRADES_P[c.grade]) : '—'), /*#__PURE__*/React.createElement("td", null, r.author), /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        color: 'var(--rs-fg-muted)',
        fontSize: 12
      }
    }, new Date(r.signedAt).toLocaleString(L('fr-FR', 'en-GB'))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "dopen"
    }, L('Ouvrir', 'Open'), " \u2192")));
  })))));
}

/* ---------- Atlas des pathologies ---------- */
const ATLAS = [{
  key: 'dr',
  fr: 'Rétinopathie diabétique',
  en: 'Diabetic retinopathy',
  color: 'var(--rs-grade-2)',
  descFr: 'Atteinte microvasculaire de la rétine liée au diabète. Graduée sur l’échelle ETDRS en 5 niveaux.',
  descEn: 'Diabetes-related retinal microvascular disease. Graded on the 5-level ETDRS scale.',
  signsFr: ['Microanévrismes', 'Exsudats durs', 'Hémorragies', 'IRMA, néovaisseaux (stade proliférant)'],
  signsEn: ['Microaneurysms', 'Hard exudates', 'Haemorrhages', 'IRMA, neovessels (proliferative)']
}, {
  key: 'amd',
  fr: 'DMLA',
  en: 'AMD',
  color: 'var(--rs-grade-3)',
  descFr: 'Dégénérescence maculaire liée à l’âge — atteinte de la macula, vision centrale.',
  descEn: 'Age-related macular degeneration — macular damage, central vision.',
  signsFr: ['Drusen', 'Altérations de l’EPR', 'Néovascularisation choroïdienne (forme humide)'],
  signsEn: ['Drusen', 'RPE changes', 'Choroidal neovascularisation (wet form)']
}, {
  key: 'glauc',
  fr: 'Glaucome',
  en: 'Glaucoma',
  color: 'var(--rs-info)',
  descFr: 'Neuropathie optique progressive. Évaluée par le ratio cup/disque (CDR).',
  descEn: 'Progressive optic neuropathy. Assessed via cup-to-disc ratio (CDR).',
  signsFr: ['CDR augmenté', 'Excavation papillaire', 'Asymétrie inter-yeux'],
  signsEn: ['Increased CDR', 'Disc cupping', 'Inter-eye asymmetry']
}, {
  key: 'rvo',
  fr: 'OVR',
  en: 'RVO',
  color: 'var(--rs-grade-4)',
  descFr: 'Occlusion veineuse rétinienne — blocage du retour veineux.',
  descEn: 'Retinal vein occlusion — blockage of venous return.',
  signsFr: ['Hémorragies en flammèches', 'Veines dilatées/tortueuses', 'Œdème'],
  signsEn: ['Flame haemorrhages', 'Dilated/tortuous veins', 'Oedema']
}, {
  key: 'edema',
  fr: 'Œdème maculaire',
  en: 'Macular oedema',
  color: 'var(--rs-grade-1)',
  descFr: 'Accumulation de liquide dans la macula, souvent associée à la RD.',
  descEn: 'Fluid accumulation in the macula, often associated with DR.',
  signsFr: ['Épaississement rétinien', 'Logettes cystoïdes', 'Exsudats péri-fovéaux'],
  signsEn: ['Retinal thickening', 'Cystoid spaces', 'Perifoveal exudates']
}];
function AtlasPage() {
  return /*#__PURE__*/React.createElement("div", {
    className: "dpage"
  }, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: L('Référence', 'Reference'),
    title: L('Atlas des pathologies', 'Atlas of pathologies'),
    lead: L('Fiches de référence des pathologies détectées par la plateforme.', 'Reference cards for the pathologies the platform detects.')
  }), /*#__PURE__*/React.createElement("div", {
    className: "atlas-grid"
  }, ATLAS.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.key,
    className: "atlas-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atlas-fig",
    style: {
      borderColor: a.color
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/fundus-sample-1.svg",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    className: "atlas-tag",
    style: {
      background: a.color
    }
  }, L(a.fr, a.en))), /*#__PURE__*/React.createElement("div", {
    className: "atlas-body"
  }, /*#__PURE__*/React.createElement("h3", null, L(a.fr, a.en)), /*#__PURE__*/React.createElement("p", null, L(a.descFr, a.descEn)), /*#__PURE__*/React.createElement("div", {
    className: "atlas-signs"
  }, L(a.signsFr, a.signsEn).map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "sign-chip"
  }, s))))))));
}

/* ---------- Analyse des résultats ---------- */
function OutcomesPage({
  cases
}) {
  const n = cases.length;
  const signed = cases.filter(c => c.status === 'signed').length;
  const urgent = cases.filter(c => c.status === 'urgent' || c.status === 'flagged').length;
  const avgConf = n ? Math.round(cases.reduce((s, c) => s + c.conf, 0) / n * 10) / 10 : 0;
  const byGrade = [0, 1, 2, 3, 4].map(g => cases.filter(c => c.grade === g).length);
  const maxG = Math.max(1, ...byGrade);
  const audit = (DBP.listAudit ? DBP.listAudit() : []).slice(0, 6);
  const auditLabel = a => ({
    'case.create': L('Cas créé', 'Case created'),
    'inference.run': L('Inférence IA', 'AI inference'),
    'report.sign': L('Rapport signé', 'Report signed'),
    'case.update': L('Cas mis à jour', 'Case updated')
  })[a.action] || a.action;
  return /*#__PURE__*/React.createElement("div", {
    className: "dpage"
  }, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: L('Référence', 'Reference'),
    title: L('Analyse des résultats', 'Outcome analytics'),
    lead: L('Indicateurs calculés sur la base de test en direct.', 'Indicators computed live from the test database.')
  }), /*#__PURE__*/React.createElement("div", {
    className: "dkpis"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dkpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Cas total', 'Total cases')), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, n)), /*#__PURE__*/React.createElement("div", {
    className: "dkpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Signés', 'Signed')), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, signed), /*#__PURE__*/React.createElement("span", {
    className: "t mono"
  }, n ? Math.round(signed / n * 100) : 0, "%")), /*#__PURE__*/React.createElement("div", {
    className: "dkpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Urgents', 'Urgent')), /*#__PURE__*/React.createElement("span", {
    className: "v mono",
    style: {
      color: 'var(--rs-grade-4)'
    }
  }, urgent)), /*#__PURE__*/React.createElement("div", {
    className: "dkpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Confiance moy.', 'Avg confidence')), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, avgConf, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Distribution par grade (ETDRS)', 'Distribution by grade (ETDRS)')), /*#__PURE__*/React.createElement("div", {
    className: "ochart"
  }, byGrade.map((v, g) => /*#__PURE__*/React.createElement("div", {
    key: g,
    className: "ocol"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ocol-bar-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ocol-bar",
    style: {
      height: `${v / maxG * 100}%`,
      background: `var(--rs-grade-${g})`
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ocol-v mono"
  }, v))), /*#__PURE__*/React.createElement("span", {
    className: "ocol-lbl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: `var(--rs-grade-${g})`
    }
  }), g), /*#__PURE__*/React.createElement("span", {
    className: "ocol-sub"
  }, GRADES_P[g]))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Activité récente (journal d’audit)', 'Recent activity (audit log)')), /*#__PURE__*/React.createElement("div", {
    className: "oaudit"
  }, audit.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--rs-fg-muted)',
      fontSize: 13
    }
  }, L('Aucune activité pour l’instant.', 'No activity yet.')) : audit.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "oaudit-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "oaudit-act"
  }, auditLabel(a)), /*#__PURE__*/React.createElement("span", {
    className: "mono oaudit-meta"
  }, a.meta && a.meta.id ? a.meta.id : a.meta && a.meta.caseId || ''), /*#__PURE__*/React.createElement("span", {
    className: "mono oaudit-ts"
  }, new Date(a.ts).toLocaleTimeString(L('fr-FR', 'en-GB'))))))));
}
Object.assign(window, {
  QueuePage,
  PatientsPage,
  ReportsPage,
  AtlasPage,
  OutcomesPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "web/doctor/pages.jsx", error: String((e && e.message) || e) }); }

// web/settings/app.jsx
try { (() => {
/* Settings surface — shared by Doctor, Student, Admin profiles.
   Collapsible sidebar (open/close), user chip pinned to the bottom.
   Nav: Réglages (accordion hub) · RD (upload) · Segmentation (eye + report).
   Open with ?profile=doctor|student|admin to scope visible items. */

const {
  useState,
  useEffect
} = React;
const PROFILES = {
  doctor: {
    name: 'Dr. Amina Saidi',
    email: 'amina.saidi@chu-rabat.ma',
    role: 'doctor',
    initials: 'DA',
    dept: 'Ophtalmologie'
  },
  student: {
    name: 'Omar Kabbaj',
    email: 'omar.k@um6p-edu.ma',
    role: 'student',
    initials: 'OK',
    dept: 'Médecine M5'
  },
  admin: {
    name: 'Mehdi El Otmani',
    email: 'm.otmani@octopus.ai',
    role: 'admin',
    initials: 'ME',
    dept: 'Plateforme'
  }
};
const params = new URLSearchParams(location.search);
const PROFILE_KEY = params.get('profile') || 'doctor';
const PROFILE = PROFILES[PROFILE_KEY] || PROFILES.doctor;
const LANG = window.octopusI18n && window.octopusI18n.getLang() || 'fr';
const L = (fr, en) => LANG === 'en' ? en : fr;
const ROLE_LABEL = {
  doctor: L('Ophtalmologiste', 'Ophthalmologist'),
  student: L('Étudiant · M5', 'Student · M5'),
  admin: L('Administrateur', 'Administrator')
};

/* When rendered inside an accordion panel, Section drops its own header
   (the accordion button already supplies the title + subtitle). */
const BareCtx = React.createContext(false);

/* ---------- shared primitives ---------- */
const Row = ({
  label,
  hint,
  children
}) => /*#__PURE__*/React.createElement("div", {
  className: "set-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "set-row-label"
}, /*#__PURE__*/React.createElement("div", {
  className: "lbl"
}, label), hint ? /*#__PURE__*/React.createElement("div", {
  className: "hint"
}, hint) : null), /*#__PURE__*/React.createElement("div", {
  className: "set-row-control"
}, children));
const Section = ({
  eyebrow,
  title,
  lead,
  children
}) => {
  const bare = React.useContext(BareCtx);
  if (bare) return /*#__PURE__*/React.createElement("div", {
    className: "set-card bare"
  }, children);
  return /*#__PURE__*/React.createElement("section", {
    className: "set-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-section-head"
  }, eyebrow ? /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, eyebrow) : null, title ? /*#__PURE__*/React.createElement("h2", null, title) : null, lead ? /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, lead) : null), /*#__PURE__*/React.createElement("div", {
    className: "set-card"
  }, children));
};
const Toggle = ({
  on,
  onChange
}) => /*#__PURE__*/React.createElement("button", {
  className: `toggle ${on ? 'on' : ''}`,
  onClick: () => onChange(!on),
  "aria-pressed": on
}, /*#__PURE__*/React.createElement("span", {
  className: "thumb"
}));

/* ---------- ACCORDION ---------- */
function Accordion({
  items
}) {
  const [open, setOpen] = useState(() => items.length ? [items[0].id] : []);
  const toggle = id => setOpen(o => o.includes(id) ? o.filter(x => x !== id) : [...o, id]);
  return /*#__PURE__*/React.createElement("div", {
    className: "acc-list"
  }, items.map(it => {
    const isOpen = open.includes(it.id);
    return /*#__PURE__*/React.createElement("div", {
      key: it.id,
      className: `acc-item ${isOpen ? 'open' : ''}`
    }, /*#__PURE__*/React.createElement("button", {
      className: "acc-head",
      onClick: () => toggle(it.id),
      "aria-expanded": isOpen
    }, /*#__PURE__*/React.createElement("span", {
      className: "acc-ico"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon
    })), /*#__PURE__*/React.createElement("span", {
      className: "acc-text"
    }, /*#__PURE__*/React.createElement("span", {
      className: "acc-title"
    }, it.title), /*#__PURE__*/React.createElement("span", {
      className: "acc-sub"
    }, it.subtitle)), it.badge ? /*#__PURE__*/React.createElement("span", {
      className: "acc-badge mono"
    }, it.badge) : null, /*#__PURE__*/React.createElement("span", {
      className: "acc-chevron",
      "aria-hidden": "true"
    }, isOpen ? '–' : '+')), isOpen && /*#__PURE__*/React.createElement("div", {
      className: "acc-body"
    }, /*#__PURE__*/React.createElement(BareCtx.Provider, {
      value: true
    }, it.render())));
  }));
}

/* ---------- LANGUE ---------- */
function LangSection() {
  const cur = window.octopusI18n && window.octopusI18n.getLang() || 'fr';
  const setLang = l => window.octopusI18n && window.octopusI18n.setLang(l);
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(Row, {
    label: L('Langue de l\u2019interface', 'Interface language'),
    hint: L('Affecte tous les menus, libellés et contenus produit.', 'Affects every menu, label and product copy string.')
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: `btn ${cur === 'fr' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => setLang('fr')
  }, "\uD83C\uDDEB\uD83C\uDDF7 Fran\xE7ais"), /*#__PURE__*/React.createElement("button", {
    className: `btn ${cur === 'en' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => setLang('en')
  }, "\uD83C\uDDEC\uD83C\uDDE7 English"))));
}

/* ---------- COMPTE ---------- */
function AccountSection() {
  const [pwd, setPwd] = useState({
    cur: '',
    n1: '',
    n2: ''
  });
  const ok = pwd.n1.length >= 12 && pwd.n1 === pwd.n2 && pwd.cur.length > 0;
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(Row, {
    label: L('Adresse e-mail', 'Email'),
    hint: L('Utilisée pour la connexion. Contactez votre administrateur pour la modifier.', 'Used for sign-in. Contact your administrator to change.')
  }, /*#__PURE__*/React.createElement("input", {
    className: "set-input",
    defaultValue: PROFILE.email,
    disabled: true
  })), /*#__PURE__*/React.createElement(Row, {
    label: L('Nom affiché', 'Display name')
  }, /*#__PURE__*/React.createElement("input", {
    className: "set-input",
    defaultValue: PROFILE.name
  })), /*#__PURE__*/React.createElement("div", {
    className: "set-divider"
  }), /*#__PURE__*/React.createElement(Row, {
    label: L('Mot de passe actuel', 'Current password'),
    hint: L('Requis pour confirmer tout changement.', 'Required to confirm any change.')
  }, /*#__PURE__*/React.createElement("input", {
    className: "set-input",
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    value: pwd.cur,
    onChange: e => setPwd({
      ...pwd,
      cur: e.target.value
    })
  })), /*#__PURE__*/React.createElement(Row, {
    label: L('Nouveau mot de passe', 'New password'),
    hint: L('Minimum 12 caractères, avec un chiffre et un symbole.', 'Minimum 12 characters, with a number and a symbol.')
  }, /*#__PURE__*/React.createElement("input", {
    className: "set-input",
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    value: pwd.n1,
    onChange: e => setPwd({
      ...pwd,
      n1: e.target.value
    })
  })), /*#__PURE__*/React.createElement(Row, {
    label: L('Confirmer le mot de passe', 'Confirm new password')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "set-input",
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    value: pwd.n2,
    onChange: e => setPwd({
      ...pwd,
      n2: e.target.value
    })
  }), pwd.n1 && pwd.n2 && /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: pwd.n1 === pwd.n2 ? 'var(--rs-grade-0)' : 'var(--rs-grade-4)'
    }
  }, pwd.n1 === pwd.n2 ? L('● correspond', '● matches') : L('● ne correspond pas', '● mismatch')))), /*#__PURE__*/React.createElement("div", {
    className: "set-row"
  }, /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    disabled: !ok
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "key"
  }), " ", L('Changer le mot de passe', 'Update password'))), /*#__PURE__*/React.createElement("div", {
    className: "set-divider"
  }), /*#__PURE__*/React.createElement(Row, {
    label: L('Double authentification (2FA)', 'Two-factor authentication'),
    hint: L('Obligatoire pour les profils docteur et admin (politique CEI).', 'Required for doctor and admin profiles by IRB policy.')
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "status status-active"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), L('activée · application', 'enabled · authenticator app')), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary"
  }, L('Reconfigurer', 'Reconfigure')))), /*#__PURE__*/React.createElement(Row, {
    label: L('Sessions actives', 'Active sessions'),
    hint: L('Déconnexion automatique après 30 min d\u2019inactivité.', 'Auto sign-out after 30 min of inactivity.')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "session-row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 500,
      fontSize: 13
    }
  }, "Chrome 138 \xB7 macOS \xB7 Rabat, MA"), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)'
    }
  }, L('cet appareil', 'this device'), " \xB7 192.168.10.42")), /*#__PURE__*/React.createElement("span", {
    className: "status status-active"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), L('maintenant', 'now'))), /*#__PURE__*/React.createElement("div", {
    className: "session-row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 500,
      fontSize: 13
    }
  }, "Safari iOS \xB7 iPhone"), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)'
    }
  }, L('il y a 4 heures', '4 hours ago'))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost"
  }, L('Révoquer', 'Revoke'))))));
}

/* ---------- MODÈLES ---------- */
const MODELS = [{
  id: 'fundus-grade-v4.2.1',
  name: 'fundus-grade-v4.2.1',
  task: 'DR grading',
  metric: 'AUC 0.987',
  latency: '240 ms',
  size: '24M',
  status: 'production',
  recommended: true
}, {
  id: 'fundus-grade-v4.3.0-rc',
  name: 'fundus-grade-v4.3.0-rc',
  task: 'DR grading',
  metric: 'AUC 0.991',
  latency: '380 ms',
  size: '38M',
  status: 'staging'
}, {
  id: 'vessel-seg-v2.1',
  name: 'vessel-seg-v2.1',
  task: 'Vessel segmentation',
  metric: 'Dice 0.872',
  latency: '180 ms',
  size: '11M',
  status: 'production'
}, {
  id: 'lesion-detect-v1.8',
  name: 'lesion-detect-v1.8',
  task: 'Lesion detection',
  metric: 'mAP 0.71',
  latency: '320 ms',
  size: '46M',
  status: 'production'
}];
function ModelsSection() {
  const [primary, setPrimary] = useState('fundus-grade-v4.2.1');
  const [thresh, setThresh] = useState(0.75);
  const [autorun, setAutorun] = useState(true);
  const [ensemble, setEnsemble] = useState(false);
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(Row, {
    label: L('Modèle de grading principal', 'Primary grading model'),
    hint: L('Utilisé pour le grade ETDRS et le score de confiance.', 'Used for the ETDRS grade and confidence score.')
  }, /*#__PURE__*/React.createElement("div", {
    className: "model-list"
  }, MODELS.filter(m => m.task === 'DR grading').map(m => /*#__PURE__*/React.createElement("button", {
    key: m.id,
    className: `model-card ${primary === m.id ? 'on' : ''}`,
    onClick: () => setPrimary(m.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, m.name), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)',
      marginTop: 2
    }
  }, m.metric, " \xB7 ", m.size, " params \xB7 ", m.latency)), /*#__PURE__*/React.createElement("span", {
    className: `status status-${m.status === 'production' ? 'active' : 'pending'}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), m.status)), m.recommended && /*#__PURE__*/React.createElement("span", {
    className: "reco-badge mono"
  }, L('Recommandé', 'Recommended')))))), /*#__PURE__*/React.createElement("div", {
    className: "set-divider"
  }), /*#__PURE__*/React.createElement(Row, {
    label: L('Modèles auxiliaires', 'Auxiliary models'),
    hint: L('Invoqués sur chaque image. Désactivez pour réduire le coût.', 'Run on every image. Disable to reduce cost.')
  }, /*#__PURE__*/React.createElement("div", {
    className: "aux-list"
  }, MODELS.filter(m => m.task !== 'DR grading').map(m => /*#__PURE__*/React.createElement("label", {
    key: m.id,
    className: "aux-row"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 12,
      fontWeight: 500
    }
  }, m.name), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)'
    }
  }, m.task, " \xB7 ", m.metric)))))), /*#__PURE__*/React.createElement("div", {
    className: "set-divider"
  }), /*#__PURE__*/React.createElement(Row, {
    label: L('Seuil de confiance (auto-signalement)', 'Auto-flag confidence threshold'),
    hint: L(`Les cas grade ≥ 2 et confiance ≥ ${Math.round(thresh * 100)}% sont routés en urgence.`, `Cases grade ≥ 2 and confidence ≥ ${Math.round(thresh * 100)}% are routed as urgent.`)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0.5",
    max: "0.99",
    step: "0.01",
    value: thresh,
    onChange: e => setThresh(parseFloat(e.target.value)),
    style: {
      flex: 1,
      accentColor: 'var(--rs-teal-700)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      width: 56,
      textAlign: 'right',
      fontSize: 14,
      fontWeight: 500
    }
  }, (thresh * 100).toFixed(0), "%"))), /*#__PURE__*/React.createElement(Row, {
    label: L('Analyse auto au téléversement', 'Auto-run on upload')
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: autorun,
    onChange: setAutorun
  })), /*#__PURE__*/React.createElement(Row, {
    label: L('Vote d\u2019ensemble (3 modèles)', 'Ensemble vote (3 models)'),
    hint: L('Plus lent (~3×) mais réduit le risque sur les cas limites.', 'Slower (~3×) but reduces tail-risk on borderline cases.')
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: ensemble,
    onChange: setEnsemble
  })));
}

/* ---------- 3D & VISUALISATION ---------- */
function VizSection() {
  const [enable3D, setEnable3D] = useState(true);
  const [renderer, setRenderer] = useState('webgl');
  const [overlays, setOverlays] = useState({
    heatmap: true,
    vessels: true,
    disc: false,
    boxes: false
  });
  const [colormap, setColormap] = useState('magma');
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(Row, {
    label: L('Exploration OCT 3D', '3D OCT exploration'),
    hint: L('Visualiseur volumétrique des piles B-scan OCT. Nécessite WebGL.', 'Volumetric viewer for OCT B-scan stacks. Requires WebGL.')
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: enable3D,
    onChange: setEnable3D
  })), /*#__PURE__*/React.createElement(Row, {
    label: L('Moteur de rendu', 'Renderer'),
    hint: L('WebGPU est plus rapide mais expérimental.', 'WebGPU is faster but experimental.')
  }, /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, ['webgl', 'webgpu'].map(r => /*#__PURE__*/React.createElement("button", {
    key: r,
    className: `seg-btn ${renderer === r ? 'on' : ''}`,
    disabled: !enable3D,
    onClick: () => setRenderer(r)
  }, r === 'webgl' ? 'WebGL 2.0' : 'WebGPU', r === 'webgpu' && /*#__PURE__*/React.createElement("span", {
    className: "mono badge"
  }, "beta"))))), /*#__PURE__*/React.createElement(Row, {
    label: L('Colormap du volume', 'Volume colormap')
  }, /*#__PURE__*/React.createElement("div", {
    className: "cm-grid"
  }, [{
    k: 'magma',
    s: ['#000', '#3D1B5A', '#9F2A63', '#E45A4F', '#FFA873', '#FFE89A']
  }, {
    k: 'viridis',
    s: ['#440154', '#3F4788', '#287D8E', '#1F9E89', '#5BC962', '#FDE725']
  }, {
    k: 'gray',
    s: ['#000', '#333', '#666', '#999', '#CCC', '#FFF']
  }, {
    k: 'plasma',
    s: ['#0D0887', '#5302A3', '#8B0AA5', '#B83289', '#DB5C68', '#F0F921']
  }].map(cm => /*#__PURE__*/React.createElement("button", {
    key: cm.k,
    className: `cm-btn ${colormap === cm.k ? 'on' : ''}`,
    onClick: () => setColormap(cm.k)
  }, /*#__PURE__*/React.createElement("div", {
    className: "cm-strip"
  }, cm.s.map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      background: c
    }
  }))), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, cm.k))))), /*#__PURE__*/React.createElement("div", {
    className: "set-divider"
  }), /*#__PURE__*/React.createElement(Row, {
    label: L('Overlays par défaut', 'Default overlays'),
    hint: L('Overlays IA visibles à l\u2019ouverture d\u2019un cas.', 'AI overlays visible when opening a case.')
  }, /*#__PURE__*/React.createElement("div", {
    className: "ovl-grid"
  }, [{
    k: 'heatmap',
    l: L('Carte de chaleur Grad-CAM', 'Grad-CAM heatmap'),
    c: 'magenta'
  }, {
    k: 'vessels',
    l: L('Segmentation vasculaire', 'Vessel segmentation'),
    c: 'cyan'
  }, {
    k: 'disc',
    l: L('Disque / cup optique', 'Optic disc / cup'),
    c: 'cyan'
  }, {
    k: 'boxes',
    l: L('Boîtes de lésions', 'Lesion bounding boxes'),
    c: 'amber'
  }].map(o => /*#__PURE__*/React.createElement("label", {
    key: o.k,
    className: `ovl-row ${overlays[o.k] ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: overlays[o.k],
    onChange: () => setOverlays({
      ...overlays,
      [o.k]: !overlays[o.k]
    })
  }), /*#__PURE__*/React.createElement("span", {
    className: `ovl-swatch ovl-${o.c}`
  }), /*#__PURE__*/React.createElement("span", null, o.l))))));
}

/* ---------- JEUX DE DONNÉES ---------- */
function DatasetsSection() {
  const [paths, setPaths] = useState({
    primary: '/mnt/octopus/datasets/chu-rabat-q2-2026',
    cache: '/var/cache/octopus/inference',
    models: '/opt/octopus/models',
    annotations: 's3://octopus-anno/2026/'
  });
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(Row, {
    label: L('Racine des données', 'Primary dataset root'),
    hint: L('Où sont écrits les nouveaux téléversements de fond d\u2019œil.', 'Where new fundus uploads are written.')
  }, /*#__PURE__*/React.createElement("div", {
    className: "path-input"
  }, /*#__PURE__*/React.createElement("input", {
    className: "set-input mono",
    value: paths.primary,
    onChange: e => setPaths({
      ...paths,
      primary: e.target.value
    })
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "folder",
    size: 14
  }), " ", L('Parcourir', 'Browse'))), /*#__PURE__*/React.createElement("div", {
    className: "path-meta mono"
  }, /*#__PURE__*/React.createElement("span", {
    className: "status status-active"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), L('monté', 'mounted')), /*#__PURE__*/React.createElement("span", null, "\xB7 2.4 To / 8.0 To"), /*#__PURE__*/React.createElement("span", null, "\xB7 ", L('dernière écriture il y a 4 min', 'last write 4 min ago')))), /*#__PURE__*/React.createElement(Row, {
    label: L('Jeux de données use-case', 'Use-case datasets'),
    hint: L('Sous-ensembles pour la bibliothèque étudiant et l\u2019assurance qualité.', 'Subsets powering the student library and QA.')
  }, /*#__PURE__*/React.createElement("div", {
    className: "uc-list"
  }, [{
    id: 'uc-screening',
    label: L('Dépistage annuel (Grade 0-2)', 'Annual screening (Grade 0-2)'),
    path: '/mnt/octopus/uc/screening',
    n: L('1 284 cas', '1,284 cases')
  }, {
    id: 'uc-referral',
    label: L('Formation au référencement urgent', 'Urgent referral training'),
    path: '/mnt/octopus/uc/referral',
    n: L('342 cas', '342 cases')
  }, {
    id: 'uc-followup',
    label: L('Suivi post-laser', 'Post-laser follow-up'),
    path: '/mnt/octopus/uc/followup',
    n: L('587 cas', '587 cases')
  }, {
    id: 'uc-rare',
    label: L('Atlas des présentations rares', 'Rare presentations atlas'),
    path: 's3://octopus-rare/2026/',
    n: L('118 cas', '118 cases')
  }].map(uc => /*#__PURE__*/React.createElement("div", {
    key: uc.id,
    className: "uc-row"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 500,
      fontSize: 13
    }
  }, uc.label), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)'
    }
  }, uc.path, " \xB7 ", uc.n)), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost"
  }, L('Modifier', 'Edit path')))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    style: {
      alignSelf: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus"
  }), " ", L('Ajouter un jeu de données', 'Add use-case dataset')))), /*#__PURE__*/React.createElement("div", {
    className: "set-divider"
  }), /*#__PURE__*/React.createElement(Row, {
    label: L('Cache d\u2019inférence', 'Inference cache root')
  }, /*#__PURE__*/React.createElement("input", {
    className: "set-input mono",
    value: paths.cache,
    onChange: e => setPaths({
      ...paths,
      cache: e.target.value
    })
  })), /*#__PURE__*/React.createElement(Row, {
    label: L('Poids des modèles', 'Model weights root')
  }, /*#__PURE__*/React.createElement("input", {
    className: "set-input mono",
    value: paths.models,
    onChange: e => setPaths({
      ...paths,
      models: e.target.value
    })
  })), /*#__PURE__*/React.createElement(Row, {
    label: L('Bucket d\u2019annotations (S3)', 'Annotation bucket (S3)')
  }, /*#__PURE__*/React.createElement("input", {
    className: "set-input mono",
    value: paths.annotations,
    onChange: e => setPaths({
      ...paths,
      annotations: e.target.value
    })
  })));
}

/* ---------- THÈME ---------- */
function ThemeSection() {
  const [mode, setMode] = useState('light');
  const [accent, setAccent] = useState('teal');
  const [density, setDensity] = useState('comfortable');
  const [reduced, setReduced] = useState(false);
  const [fontScale, setFontScale] = useState(100);
  const themes = [{
    k: 'light',
    l: L('Plein jour', 'Daylight'),
    desc: L('Par défaut — papier blanc chaud.', 'Default — warm off-white paper.'),
    sw: ['#F8F5F1', '#FFFFFF', '#1F8A8A']
  }, {
    k: 'reading',
    l: L('Salle de lecture', 'Reading room'),
    desc: L('Surfaces plus sombres pour les longues sessions.', 'Dimmer surfaces for long sessions.'),
    sw: ['#EAE6DF', '#F5F1EA', '#1F8A8A']
  }, {
    k: 'dark',
    l: L('Canvas sombre', 'Dark canvas'),
    desc: L('Interface sombre pour les salles d\u2019images.', 'Dark UI for image rooms.'),
    sw: ['#10171D', '#1A2228', '#7BC9C9']
  }, {
    k: 'system',
    l: L('Système', 'Match system'),
    desc: L('Suit la préférence de l\u2019OS.', 'Follows OS preference.'),
    sw: ['#F8F5F1', '#10171D', '#1F8A8A']
  }];
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(Row, {
    label: L('Thème', 'Theme')
  }, /*#__PURE__*/React.createElement("div", {
    className: "theme-grid"
  }, themes.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.k,
    className: `theme-card ${mode === t.k ? 'on' : ''}`,
    onClick: () => setMode(t.k)
  }, /*#__PURE__*/React.createElement("div", {
    className: "theme-preview"
  }, t.sw.map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      background: c
    }
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 500,
      fontSize: 13
    }
  }, t.l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)',
      marginTop: 2
    }
  }, t.desc)))))), /*#__PURE__*/React.createElement(Row, {
    label: L('Couleur d\u2019accent', 'Accent color'),
    hint: L('Les couleurs de grade ne sont pas affectées.', 'Severity-grade colors are not affected.')
  }, /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, [{
    k: 'teal',
    c: 'var(--rs-teal-700)'
  }, {
    k: 'indigo',
    c: '#3D5FB8'
  }, {
    k: 'plum',
    c: '#7E3F8C'
  }, {
    k: 'forest',
    c: '#2E7C5C'
  }].map(a => /*#__PURE__*/React.createElement("button", {
    key: a.k,
    className: `accent-btn ${accent === a.k ? 'on' : ''}`,
    onClick: () => setAccent(a.k)
  }, /*#__PURE__*/React.createElement("span", {
    className: "accent-sw",
    style: {
      background: a.c
    }
  }), /*#__PURE__*/React.createElement("span", null, a.k))))), /*#__PURE__*/React.createElement("div", {
    className: "set-divider"
  }), /*#__PURE__*/React.createElement(Row, {
    label: L('Densité', 'Density')
  }, /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, [['compact', L('compact', 'compact')], ['comfortable', L('confortable', 'comfortable')], ['spacious', L('spacieux', 'spacious')]].map(([k, lbl]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: `seg-btn ${density === k ? 'on' : ''}`,
    onClick: () => setDensity(k)
  }, lbl)))), /*#__PURE__*/React.createElement(Row, {
    label: L('Échelle de police', 'Font scale')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "90",
    max: "120",
    step: "5",
    value: fontScale,
    onChange: e => setFontScale(parseInt(e.target.value)),
    style: {
      flex: 1,
      accentColor: 'var(--rs-teal-700)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      width: 56,
      textAlign: 'right',
      fontSize: 14,
      fontWeight: 500
    }
  }, fontScale, "%"))), /*#__PURE__*/React.createElement(Row, {
    label: L('Réduire les animations', 'Reduce motion')
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: reduced,
    onChange: setReduced
  })));
}

/* ---------- NOTIFICATIONS ---------- */
function NotifySection() {
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(Row, {
    label: L('Cas urgent qui m\u2019est attribué', 'Urgent case routed to me'),
    hint: L('Grade 3+ ou RD proliférante à contresigner.', 'Grade 3+ or proliferative DR awaiting countersign.')
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " ", L('in-app', 'in-app')), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " e-mail"), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  }), " SMS"))), /*#__PURE__*/React.createElement(Row, {
    label: L('Demande de 2ᵉ avis', 'Second-opinion request')
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " ", L('in-app', 'in-app')), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " e-mail"))), /*#__PURE__*/React.createElement(Row, {
    label: L('Résumé hebdomadaire de performance', 'Weekly performance summary'),
    hint: L('Chaque lundi à 08:00.', 'Every Monday at 08:00.')
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: true,
    onChange: () => {}
  })), /*#__PURE__*/React.createElement(Row, {
    label: L('Mise à jour de modèle disponible', 'Model update available')
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: true,
    onChange: () => {}
  })));
}

/* ---------- MONITORING ---------- */
function MonitorSection() {
  const [enabled, setEnabled] = useState(true);
  const [dsn, setDsn] = useState('https://abc123@o123456.ingest.sentry.io/4506789012');
  const [env, setEnv] = useState('staging');
  const [perf, setPerf] = useState(true);
  const [replay, setReplay] = useState(true);
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(Row, {
    label: L('Activer Sentry', 'Enable Sentry'),
    hint: L('Sinon, les erreurs ne vont qu\u2019à la console.', 'Otherwise errors are only logged to the console.')
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: enabled,
    onChange: setEnabled
  })), /*#__PURE__*/React.createElement(Row, {
    label: "DSN",
    hint: /*#__PURE__*/React.createElement(React.Fragment, null, L('Depuis votre projet Sentry —', 'From your Sentry project —'), " ", /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, "Settings \u2192 Client Keys (DSN)"), ".")
  }, /*#__PURE__*/React.createElement("input", {
    className: "set-input mono",
    value: dsn,
    onChange: e => setDsn(e.target.value),
    disabled: !enabled
  })), /*#__PURE__*/React.createElement(Row, {
    label: L('Environnement', 'Environment')
  }, /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, ['development', 'staging', 'production'].map(e => /*#__PURE__*/React.createElement("button", {
    key: e,
    className: `seg-btn ${env === e ? 'on' : ''}`,
    onClick: () => setEnv(e),
    disabled: !enabled
  }, e)))), /*#__PURE__*/React.createElement(Row, {
    label: L('Traçage de performance', 'Performance tracing'),
    hint: L('Capture les latences p99 (inférence, upload, export).', 'Captures p99 latencies (inference, upload, export).')
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: perf,
    onChange: setPerf
  })), /*#__PURE__*/React.createElement(Row, {
    label: L('Replay de session sur erreur', 'Session replay on error'),
    hint: L('Texte patient et images masqués automatiquement.', 'Patient text and images are always masked.')
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: replay,
    onChange: setReplay
  })), /*#__PURE__*/React.createElement("div", {
    className: "set-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "monitor-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('État en direct · 24 dernières h', 'Live status · last 24h')), /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '6px 0 0',
      fontSize: 16
    }
  }, L('Tous les systèmes opérationnels', 'All systems operational'))), /*#__PURE__*/React.createElement("span", {
    className: "status status-active"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), L('sain', 'healthy'))), /*#__PURE__*/React.createElement("div", {
    className: "monitor-stats"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Erreurs', 'Errors')), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, "3"), /*#__PURE__*/React.createElement("span", {
    className: "trend mono"
  }, "\u221242% / 24h")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Sessions sans crash', 'Crash-free sessions')), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, "99.97%"), /*#__PURE__*/React.createElement("span", {
    className: "trend mono"
  }, "\u2265 99.9%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Inférence p99', 'p99 inference')), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, "412 ms"), /*#__PURE__*/React.createElement("span", {
    className: "trend mono"
  }, "budget 800 ms")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Replays', 'Replays captured')), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, "17"), /*#__PURE__*/React.createElement("span", {
    className: "trend mono"
  }, L('PHI masqué', 'PHI scrubbed'))))), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bug",
    size: 14
  }), " ", L('Envoyer un test', 'Send test event')), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "globe",
    size: 14
  }), " ", L('Ouvrir Sentry', 'Open Sentry'))));
}

/* ---------- INTÉGRATIONS ---------- */
function IntegrationsSection() {
  const items = [{
    id: 'fhir',
    name: 'EHR · FHIR R5',
    desc: L('Renvoie les rapports vers le DPI de l\u2019hôpital.', 'Push reports back to the hospital EHR.'),
    status: 'connected',
    meta: L('CHU Rabat · sync il y a 4 min', 'CHU Rabat · last sync 4 min ago')
  }, {
    id: 'dicom',
    name: 'DICOM worklist',
    desc: L('Récupère les examens planifiés du PACS.', 'Pull scheduled exams from the PACS.'),
    status: 'connected',
    meta: 'rabat-pacs.local:104'
  }, {
    id: 'okta',
    name: 'Okta SSO',
    desc: L('Authentification unique du personnel.', 'Single sign-on for staff.'),
    status: 'connected',
    meta: 'um6p-edu.ma · SAML'
  }, {
    id: 'slack',
    name: 'Alertes Slack',
    desc: L('Notifications de cas urgents vers un canal.', 'Urgent-case notifications to a channel.'),
    status: 'disconnected',
    meta: '—'
  }, {
    id: 'twilio',
    name: 'Twilio SMS',
    desc: L('Rappels de rendez-vous par SMS.', 'Appointment reminders by SMS.'),
    status: 'pending',
    meta: L('en attente d\u2019autorisation', 'awaiting approval')
  }];
  const statusLabel = {
    connected: L('connecté', 'connected'),
    disconnected: L('déconnecté', 'disconnected'),
    pending: L('en attente', 'pending')
  };
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    className: "integ-list"
  }, items.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.id,
    className: "integ-row"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 500,
      fontSize: 14
    }
  }, i.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--rs-ink-700)',
      marginTop: 2
    }
  }, i.desc), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)',
      marginTop: 4
    }
  }, i.meta)), /*#__PURE__*/React.createElement("span", {
    className: `status status-${i.status === 'connected' ? 'active' : i.status === 'pending' ? 'pending' : 'ingest'}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), statusLabel[i.status]), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary"
  }, i.status === 'connected' ? L('Configurer', 'Configure') : L('Connecter', 'Connect'))))));
}

/* ============================================================
   RÉGLAGES — hub: accordion of clickable buttons
   ============================================================ */
function SettingsHub() {
  const all = [{
    id: 'account',
    icon: 'user',
    title: L('Compte & sécurité', 'Account & security'),
    subtitle: L('E-mail, mot de passe, 2FA, sessions', 'Email, password, 2FA, sessions'),
    render: () => /*#__PURE__*/React.createElement(AccountSection, null),
    roles: ['doctor', 'student', 'admin']
  }, {
    id: 'models',
    icon: 'cpu',
    title: L('Modèles IA', 'AI models'),
    subtitle: L('Modèle principal, auxiliaires, seuils', 'Primary, auxiliary, thresholds'),
    render: () => /*#__PURE__*/React.createElement(ModelsSection, null),
    roles: ['doctor', 'admin']
  }, {
    id: 'viz',
    icon: 'cube',
    title: L('3D & visualisation', '3D & visualization'),
    subtitle: L('OCT 3D, moteur, overlays', 'OCT 3D, renderer, overlays'),
    render: () => /*#__PURE__*/React.createElement(VizSection, null),
    roles: ['doctor', 'student', 'admin']
  }, {
    id: 'datasets',
    icon: 'database',
    title: L('Jeux de données', 'Datasets'),
    subtitle: L('Chemins, use-cases, cache', 'Paths, use-cases, cache'),
    render: () => /*#__PURE__*/React.createElement(DatasetsSection, null),
    roles: ['doctor', 'student', 'admin']
  }, {
    id: 'theme',
    icon: 'palette',
    title: L('Thème & affichage', 'Theme & display'),
    subtitle: L('Thème, accent, densité, police', 'Theme, accent, density, font'),
    render: () => /*#__PURE__*/React.createElement(ThemeSection, null),
    roles: ['doctor', 'student', 'admin']
  }, {
    id: 'notify',
    icon: 'bell2',
    title: 'Notifications',
    subtitle: L('Canaux in-app, e-mail, SMS', 'In-app, email, SMS channels'),
    render: () => /*#__PURE__*/React.createElement(NotifySection, null),
    roles: ['doctor', 'student', 'admin']
  }, {
    id: 'monitor',
    icon: 'bug',
    title: 'Monitoring',
    subtitle: L('Sentry, traçage, replay', 'Sentry, tracing, replay'),
    render: () => /*#__PURE__*/React.createElement(MonitorSection, null),
    roles: ['doctor', 'student', 'admin']
  }, {
    id: 'integrate',
    icon: 'link',
    title: L('Intégrations', 'Integrations'),
    subtitle: L('FHIR, DICOM, Okta, Slack', 'FHIR, DICOM, Okta, Slack'),
    render: () => /*#__PURE__*/React.createElement(IntegrationsSection, null),
    roles: ['doctor', 'admin']
  }, {
    id: 'lang',
    icon: 'globe',
    title: L('Langue', 'Language'),
    subtitle: L('Français / English', 'Français / English'),
    render: () => /*#__PURE__*/React.createElement(LangSection, null),
    roles: ['doctor', 'student', 'admin']
  }];
  const items = all.filter(i => i.roles.includes(PROFILE.role));
  return /*#__PURE__*/React.createElement("div", {
    className: "hub"
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-section-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Réglages', 'Settings'), " \xB7 ", ROLE_LABEL[PROFILE.role]), /*#__PURE__*/React.createElement("h2", null, L('Préférences', 'Preferences')), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, L('Cliquez sur une catégorie pour afficher son contenu en dessous.', 'Click a category to reveal its content below.'))), /*#__PURE__*/React.createElement(Accordion, {
    items: items
  }));
}

/* ============================================================
   SIDEBAR (collapsible, user at bottom)
   ============================================================ */
function SettingsRail({
  active,
  setActive,
  collapsed,
  onToggle
}) {
  const NAV = [{
    id: 'settings',
    icon: 'sliders',
    label: L('Réglages', 'Settings')
  }, {
    id: 'dr',
    icon: 'upload',
    label: 'DR',
    href: '../doctor/index.html?view=upload'
  }, {
    id: 'seg',
    icon: 'activity',
    label: 'Segmentation',
    href: '../doctor/index.html?focus=segmentation'
  }];
  return /*#__PURE__*/React.createElement("aside", {
    className: `set-rail ${collapsed ? 'collapsed' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-rail-top"
  }, /*#__PURE__*/React.createElement("button", {
    className: "set-collapse",
    onClick: onToggle,
    title: collapsed ? L('Ouvrir', 'Open') : L('Réduire', 'Collapse'),
    "aria-label": "toggle sidebar"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "18",
    height: "18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "16",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 4v16"
  }))), !collapsed && /*#__PURE__*/React.createElement("a", {
    href: `../${PROFILE.role}/index.html`,
    className: "set-back",
    title: L('Retour', 'Back')
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-dot"
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 20
  })), /*#__PURE__*/React.createElement("span", null, "Octopus"))), /*#__PURE__*/React.createElement("nav", {
    className: "set-nav"
  }, NAV.map(n => n.href ? /*#__PURE__*/React.createElement("a", {
    key: n.id,
    href: n.href,
    className: "set-nav-item",
    title: n.label
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n.icon
  }), /*#__PURE__*/React.createElement("span", {
    className: "set-nav-label"
  }, n.label), /*#__PURE__*/React.createElement("span", {
    className: "set-nav-ext",
    "aria-hidden": "true"
  }, "\u2192")) : /*#__PURE__*/React.createElement("button", {
    key: n.id,
    className: `set-nav-item ${active === n.id ? 'on' : ''}`,
    onClick: () => setActive(n.id),
    title: n.label
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n.icon
  }), /*#__PURE__*/React.createElement("span", {
    className: "set-nav-label"
  }, n.label)))), /*#__PURE__*/React.createElement("div", {
    className: "set-rail-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-user",
    title: `${PROFILE.name} · ${ROLE_LABEL[PROFILE.role]}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "avatar"
  }, PROFILE.initials), /*#__PURE__*/React.createElement("div", {
    className: "who"
  }, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, PROFILE.name), /*#__PURE__*/React.createElement("span", {
    className: "r mono"
  }, ROLE_LABEL[PROFILE.role])))));
}

/* ---------- root ---------- */
function App() {
  const [active, setActive] = useState('settings');
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('octopus.set.rail') === '1';
    } catch (e) {
      return false;
    }
  });
  const toggle = () => setCollapsed(c => {
    const n = !c;
    try {
      localStorage.setItem('octopus.set.rail', n ? '1' : '0');
    } catch (e) {}
    return n;
  });
  useEffect(() => {
    const sec = params.get('section');
    if (sec === 'settings') setActive(sec);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: `set-app ${collapsed ? 'rail-collapsed' : ''}`
  }, /*#__PURE__*/React.createElement(SettingsRail, {
    active: active,
    setActive: setActive,
    collapsed: collapsed,
    onToggle: toggle
  }), /*#__PURE__*/React.createElement("main", {
    className: "set-main"
  }, /*#__PURE__*/React.createElement("header", {
    className: "set-main-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "crumbs"
  }, /*#__PURE__*/React.createElement("span", null, "Octopus"), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.5
    }
  }, "\u203A"), /*#__PURE__*/React.createElement("span", {
    className: "now"
  }, L('Réglages', 'Settings'))), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost"
  }, L('Annuler', 'Cancel')), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check"
  }), " ", L('Enregistrer', 'Save')))), /*#__PURE__*/React.createElement("div", {
    className: "set-content"
  }, /*#__PURE__*/React.createElement(SettingsHub, null))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "web/settings/app.jsx", error: String((e && e.message) || e) }); }

// web/student/app.jsx
try { (() => {
/* Student surface — apprentissage par cas, simulation, progression.
   Le simulateur et la bibliothèque lisent les cas depuis window.OctopusDB
   (base de test partagée avec l'interface docteur). */

const {
  useState,
  useEffect
} = React;
const DB = window.OctopusDB;
const T = window.t || (k => k);
const L = (fr, en) => window.octopusI18n && window.octopusI18n.getLang() === 'en' ? en : fr;
const GRADE_FR = ['Pas de RD', 'RDNP légère', 'RDNP modérée', 'RDNP sévère', 'RD proliférante'];
const GRADE_EN = ['No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR'];
const GLAB = g => L(GRADE_FR[g], GRADE_EN[g]);

/* Construit la liste de constatations attendues à partir d'un cas réel
   (lesionBreakdown + grade) — c'est la "vérité terrain" du simulateur. */
function findingsForCase(c) {
  const bd = c.lesionBreakdown || {};
  return [{
    id: 'ma',
    label: L('Microanévrismes', 'Microaneurysms'),
    present: (bd.ma || 0) > 0
  }, {
    id: 'ex',
    label: L('Exsudats durs', 'Hard exudates'),
    present: (bd.ex || 0) > 0
  }, {
    id: 'hem',
    label: L('Hémorragies intrarétiniennes', 'Intraretinal haemorrhages'),
    present: (bd.hem || 0) > 0
  }, {
    id: 'cw',
    label: L('Nodules cotonneux', 'Cotton-wool spots'),
    present: (bd.cw || 0) > 0
  }, {
    id: 'iv',
    label: L('Dilatation veineuse', 'Venous beading'),
    present: c.grade >= 3
  }, {
    id: 'irma',
    label: L('AMIR (anomalies microvasculaires)', 'IRMA'),
    present: c.grade >= 3
  }, {
    id: 'nv',
    label: L('Néovaisseaux (NVD / NVE)', 'Neovascularisation'),
    present: c.grade >= 4
  }, {
    id: 'vh',
    label: L('Hémorragie pré-rétinienne / vitréenne', 'Vitreous haemorrhage'),
    present: c.grade >= 4
  }];
}

/* ---------- left rail ---------- */
function StudentRail({
  active,
  setActive
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "rail"
  }, /*#__PURE__*/React.createElement(RailBrand, {
    subtitle: T('brand.tag.learning')
  }), /*#__PURE__*/React.createElement("div", {
    className: "rail-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rail-section-label"
  }, T('rail.section.learn')), /*#__PURE__*/React.createElement(RailItem, {
    icon: "grad",
    label: T('rail.simulator'),
    on: active === 'sim',
    onClick: () => setActive('sim')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "folder",
    label: T('rail.library'),
    count: DB.listCases().length,
    on: active === 'lib',
    onClick: () => setActive('lib')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "book",
    label: T('rail.atlas.reading'),
    on: active === 'atlas',
    onClick: () => setActive('atlas')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "award",
    label: T('rail.quizzes'),
    count: 12,
    on: active === 'quiz',
    onClick: () => setActive('quiz')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rail-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rail-section-label"
  }, T('rail.section.progress')), /*#__PURE__*/React.createElement(RailItem, {
    icon: "chart",
    label: T('rail.performance'),
    on: active === 'progress',
    onClick: () => setActive('progress')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "flag",
    label: T('rail.goals')
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "history",
    label: T('rail.history'),
    on: active === 'history',
    onClick: () => setActive('history')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rail-foot"
  }, /*#__PURE__*/React.createElement(RailItem, {
    icon: "settings",
    label: T('rail.preferences'),
    onClick: () => {
      location.href = '../settings/index.html?profile=student';
    }
  }), /*#__PURE__*/React.createElement(RailUser, {
    initials: "OK",
    name: "Omar Kabbaj",
    role: T('role.student'),
    email: "omar.k@um6p-edu.ma",
    profile: "student"
  })));
}

/* ---------- simulateur (apprentissage par cas) ---------- */
function CaseSimulator({
  caseData,
  onNext
}) {
  const c = caseData;
  const FIND = findingsForCase(c);
  const [stage, setStage] = useState(1);
  const [picks, setPicks] = useState({});
  const [grade, setGrade] = useState(null);
  const [saved, setSaved] = useState(false);
  const togglePick = id => setPicks(p => ({
    ...p,
    [id]: !p[id]
  }));
  const userCorrect = FIND.filter(f => f.present === !!picks[f.id]).length;
  const findingScore = Math.round(userCorrect / FIND.length * 100);
  const gradeCorrect = grade === c.grade;

  // Enregistre la tentative dans la base au passage à l'étape débriefing
  useEffect(() => {
    if (stage === 4 && !saved) {
      DB.addAttempt({
        caseId: c.id,
        grade,
        gradeOk: gradeCorrect,
        findingScore
      });
      setSaved(true);
    }
  }, [stage]);
  const reset = () => {
    setStage(1);
    setPicks({});
    setGrade(null);
    setSaved(false);
  };
  const STEPS = [L('Briefing', 'Brief'), L('Constatations', 'Findings'), L('Grade', 'Grade'), L('Débriefing', 'Debrief')];
  return /*#__PURE__*/React.createElement("div", {
    className: "sim"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Simulation · Module-RD', 'Simulation · DR-Module')), /*#__PURE__*/React.createElement("h1", {
    className: "sim-title"
  }, c.id, " \xB7 ", GLAB(c.grade), " \xB7 ", c.patient, ", ", c.age, c.sex)), /*#__PURE__*/React.createElement("div", {
    className: "sim-progress"
  }, [1, 2, 3, 4].map(s => /*#__PURE__*/React.createElement("div", {
    key: s,
    className: `step ${stage >= s ? 'on' : ''} ${stage === s ? 'now' : ''}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot mono"
  }, s), /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, STEPS[s - 1]))))), /*#__PURE__*/React.createElement("div", {
    className: "sim-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-image"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/fundus-sample-1.svg",
    alt: ""
  }), stage >= 4 && /*#__PURE__*/React.createElement("img", {
    className: "ovl",
    src: "../../assets/fundus-sample-heatmap.svg",
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      mixBlendMode: 'screen',
      opacity: 0.55,
      borderRadius: 'inherit'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sim-image-meta mono"
  }, c.id, " \xB7 ", c.laterality)), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Contexte clinique', 'Clinical history')), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      fontSize: 13.5,
      lineHeight: 1.55
    }
  }, c.note, " \xB7 ", c.device, ". ", L('Confiance IA de référence', 'Reference AI confidence'), " ", c.conf, "%."))), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L(`Étape ${stage} sur 4`, `Step ${stage} of 4`)), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '4px 0 0',
      fontSize: 16
    }
  }, stage === 1 && L('Lire le briefing du cas', 'Read the case brief'), stage === 2 && L('Cocher toutes les constatations présentes', 'Select all findings present'), stage === 3 && L('Attribuer un grade ETDRS', 'Assign an ETDRS grade'), stage === 4 && L('Débriefing & correction', 'Debrief & correction'))), stage >= 2 && /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)'
    }
  }, Object.values(picks).filter(Boolean).length, " ", L('sélectionnée(s)', 'selected'))), stage === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontSize: 13.5,
      lineHeight: 1.55,
      color: 'var(--rs-ink-700)'
    }
  }, /*#__PURE__*/React.createElement("p", null, L('Examinez le fond d’œil à gauche. Notez le calibre des vaisseaux, les lésions et tout signe de maladie proliférante.', 'Examine the fundus on the left. Note vessel calibre, lesions, and any signs of proliferative disease.')), /*#__PURE__*/React.createElement("ul", {
    style: {
      paddingLeft: 18,
      color: 'var(--rs-fg-muted)'
    }
  }, /*#__PURE__*/React.createElement("li", null, L('Vous pouvez revenir au briefing à tout moment.', 'You can return to the brief anytime.')), /*#__PURE__*/React.createElement("li", null, L('Temps non limité — privilégiez l’exhaustivité.', 'No time limit — focus on completeness.')))), (stage === 2 || stage === 4) && /*#__PURE__*/React.createElement("div", {
    className: "findings"
  }, FIND.map(f => {
    const picked = !!picks[f.id];
    let cls = 'find';
    if (stage === 4) {
      if (f.present && picked) cls += ' ok';else if (f.present && !picked) cls += ' miss';else if (!f.present && picked) cls += ' wrong';else cls += ' skip';
    } else if (picked) cls += ' picked';
    return /*#__PURE__*/React.createElement("button", {
      key: f.id,
      className: cls,
      onClick: () => stage === 2 && togglePick(f.id),
      disabled: stage === 4
    }, /*#__PURE__*/React.createElement("span", {
      className: "ck"
    }, stage === 4 ? f.present ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 12
    }) : picked ? /*#__PURE__*/React.createElement(Icon, {
      name: "cross",
      size: 12
    }) : null : picked ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 12
    }) : null), /*#__PURE__*/React.createElement("span", null, f.label), stage === 4 && f.present && !picked && /*#__PURE__*/React.createElement("span", {
      className: "mono badge"
    }, L('manqué', 'missed')), stage === 4 && !f.present && picked && /*#__PURE__*/React.createElement("span", {
      className: "mono badge"
    }, L('sur-coté', 'over-call')));
  })), stage === 3 && /*#__PURE__*/React.createElement("div", {
    className: "grade-picker"
  }, [0, 1, 2, 3, 4].map(g => /*#__PURE__*/React.createElement("button", {
    key: g,
    className: `gp ${grade === g ? 'on' : ''}`,
    onClick: () => setGrade(g)
  }, /*#__PURE__*/React.createElement("span", {
    className: `pill pill-grade-${g}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "Grade ", g), /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, GLAB(g))))), stage === 4 && /*#__PURE__*/React.createElement("div", {
    className: "debrief"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 14,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric",
    style: {
      flex: 1,
      background: gradeCorrect ? 'var(--rs-grade-0-bg)' : 'var(--rs-grade-3-bg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, L('Votre grade', 'Your grade')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, grade != null ? grade : '—'), /*#__PURE__*/React.createElement("span", {
    className: "trend"
  }, gradeCorrect ? L('✓ correspond à l’IA experte', '✓ matches expert AI') : L(`attendu : grade ${c.grade}`, `expected: grade ${c.grade}`))), /*#__PURE__*/React.createElement("div", {
    className: "metric",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, L('Justesse constatations', 'Findings accuracy')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, findingScore, "%"), /*#__PURE__*/React.createElement("span", {
    className: "trend"
  }, userCorrect, "/", FIND.length, " ", L('correctes', 'correct')))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginTop: 14,
      background: 'var(--rs-bg-sunken)',
      border: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Raisonnement expert', 'Expert reasoning')), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 13,
      lineHeight: 1.55
    }
  }, L('Selon la règle 4:2:1, une RDNP sévère est retenue si : hémorragies/microanévrismes sévères dans 4 quadrants, dilatation veineuse dans 2+ quadrants, ou AMIR dans 1+ quadrant. Le grade de référence de ce cas est', 'Per the 4:2:1 rule, severe NPDR is diagnosed with severe haemorrhages/microaneurysms in 4 quadrants, venous beading in 2+, or IRMA in 1+. The reference grade for this case is'), " ", /*#__PURE__*/React.createElement("strong", null, c.grade, " \u2014 ", GLAB(c.grade)), "."))), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      marginTop: 16,
      paddingTop: 14,
      borderTop: '1px solid var(--rs-hairline)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    disabled: stage === 1,
    onClick: () => setStage(s => Math.max(1, s - 1))
  }, L('Retour', 'Back')), stage < 4 ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    disabled: stage === 3 && grade == null,
    onClick: () => setStage(s => s + 1)
  }, stage === 3 ? L('Soumettre', 'Submit') : L('Continuer', 'Continue'), " \u2192") : /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => {
      reset();
      onNext && onNext();
    }
  }, L('Cas suivant', 'Next case'), " \u2192"))))));
}

/* ---------- bibliothèque de cas (depuis la base) ---------- */
function LibraryView({
  cases,
  onPick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "dpage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dpage-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Apprendre', 'Learn')), /*#__PURE__*/React.createElement("h1", null, L('Bibliothèque de cas', 'Case library')), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, L('Cas partagés avec l’interface clinique. Choisissez-en un pour vous entraîner dans le simulateur.', 'Cases shared with the clinical interface. Pick one to practise in the simulator.')))), /*#__PURE__*/React.createElement("div", {
    className: "lib-grid"
  }, cases.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    className: "lib-card",
    onClick: () => onPick(c.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "lib-thumb"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/fundus-sample-1.svg",
    alt: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "lib-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      fontWeight: 500
    }
  }, c.id, " \xB7 ", c.laterality), /*#__PURE__*/React.createElement(Pill, {
    grade: c.grade
  }, GLAB(c.grade))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      marginTop: 4
    }
  }, c.patient, ", ", c.age, c.sex), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: 'var(--rs-fg-muted)',
      marginTop: 2
    }
  }, c.lesions, " ", L('lésion(s)', 'lesion(s)'), " \xB7 ", c.conf, "%"), /*#__PURE__*/React.createElement("span", {
    className: "lib-cta"
  }, L('S’entraîner', 'Practise'), " \u2192"))))));
}

/* ---------- progression (depuis les tentatives enregistrées) ---------- */
function ProgressDash() {
  const attempts = DB.listAttempts();
  const n = attempts.length;
  const gradeOk = attempts.filter(a => a.gradeOk).length;
  const acc = n ? Math.round(gradeOk / n * 100) : 0;
  const avgFind = n ? Math.round(attempts.reduce((s, a) => s + (a.findingScore || 0), 0) / n) : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "dpage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dpage-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Performance', 'Performance')), /*#__PURE__*/React.createElement("h1", null, L('Ma progression', 'My progress')), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, L('Calculée à partir de vos tentatives réelles dans le simulateur.', 'Computed from your real attempts in the simulator.')))), /*#__PURE__*/React.createElement("div", {
    className: "kpis"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Cas traités', 'Cases done')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, n)), /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Justesse de grade', 'Grading accuracy')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, acc, "%"), /*#__PURE__*/React.createElement("span", {
    className: "trend up"
  }, gradeOk, "/", n || 0)), /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Constatations moy.', 'Avg. findings')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, avgFind, "%")), /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, L('Tentatives', 'Attempts')), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, n))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Tentatives récentes', 'Recent attempts')), n === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--rs-fg-muted)',
      fontSize: 13,
      marginTop: 10
    }
  }, L('Aucune tentative. Lancez un cas dans le simulateur pour démarrer votre suivi.', 'No attempts yet. Run a case in the simulator to start tracking.')) : /*#__PURE__*/React.createElement("div", {
    className: "att-list",
    style: {
      marginTop: 10
    }
  }, attempts.slice(0, 10).map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "att-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, a.caseId || '—'), /*#__PURE__*/React.createElement("span", {
    className: `pill pill-grade-${a.grade != null ? a.grade : 0}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "Grade ", a.grade != null ? a.grade : '—'), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      color: a.gradeOk ? 'var(--rs-grade-0)' : 'var(--rs-grade-4)'
    }
  }, a.gradeOk ? L('✓ juste', '✓ correct') : L('✗ erroné', '✗ wrong')), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      color: 'var(--rs-fg-muted)'
    }
  }, a.findingScore, "%"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      color: 'var(--rs-fg-muted)',
      fontSize: 11
    }
  }, new Date(a.ts).toLocaleTimeString(L('fr-FR', 'en-GB'))))))));
}

/* ---------- placeholder léger ---------- */
function Soon({
  title
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "dpage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dpage-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, L('Bientôt', 'Coming up')), /*#__PURE__*/React.createElement("h1", null, title), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, L('Cette section utilisera la même base de cas. Le simulateur, la bibliothèque et la progression sont fonctionnels.', 'This section will use the same case base. The simulator, library and progress are functional.')))));
}

/* ---------- root ---------- */
function App() {
  const [cases, setCases] = useState(() => DB.listCases());
  const [section, setSection] = useState('sim');
  const [simId, setSimId] = useState(cases[0] ? cases[0].id : null);
  useEffect(() => DB.onChange(() => setCases(DB.listCases())), []);
  const simCase = cases.find(c => c.id === simId) || cases[0];
  const pickForSim = id => {
    setSimId(id);
    setSection('sim');
  };
  const nextCase = () => {
    const idx = cases.findIndex(c => c.id === simId);
    const next = cases[(idx + 1) % cases.length];
    if (next) setSimId(next.id);
  };
  const CRUMB = {
    sim: L('Simulateur de cas', 'Case simulator'),
    lib: L('Bibliothèque', 'Library'),
    progress: L('Performance', 'Performance'),
    atlas: L('Atlas & lectures', 'Atlas & reading'),
    quiz: L('Quiz', 'Quizzes'),
    history: L('Historique', 'History')
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(StudentRail, {
    active: section,
    setActive: setSection
  }), /*#__PURE__*/React.createElement(TopBar, {
    crumbs: [L('Apprentissage', 'Learning'), CRUMB[section] || '', section === 'sim' && simCase ? simCase.id : ''],
    searchPlaceholder: T('topbar.search.learning')
  }), /*#__PURE__*/React.createElement("main", {
    className: "main"
  }, section === 'sim' && simCase && /*#__PURE__*/React.createElement(CaseSimulator, {
    key: simCase.id,
    caseData: simCase,
    onNext: nextCase
  }), section === 'lib' && /*#__PURE__*/React.createElement(LibraryView, {
    cases: cases,
    onPick: pickForSim
  }), section === 'progress' && /*#__PURE__*/React.createElement(ProgressDash, null), (section === 'atlas' || section === 'quiz' || section === 'history') && /*#__PURE__*/React.createElement(Soon, {
    title: CRUMB[section]
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "web/student/app.jsx", error: String((e && e.message) || e) }); }

})();
