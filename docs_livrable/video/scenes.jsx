/* 3D explainer — scenes for "Collaborative SLMs as Reliable Code Judges".
   Composes Sprites from animations.jsx inside a Stage (see video.html).
   Visual language: dark space, perspective depth, teal generator / violet judge /
   red gaps. All 3D via CSS perspective + preserve-3d. */

const { useSprite, useTime, useTimeline, Sprite, TextSprite, interpolate, animate, clamp, Easing } = window;

const C = {
  bg:'#080C11', ink:'#E8ECEF', mute:'#8A95A0', faint:'#5A6570',
  teal:'#2DD4BF', tealDeep:'#0F5751', tealGlow:'rgba(45,212,191,.55)',
  violet:'#A78BFA', violetDeep:'#4F3A8C', violetGlow:'rgba(167,139,250,.5)',
  red:'#F0683C', redDeep:'#7A2A18', amber:'#E8B73A', green:'#34D399',
  sans:'"IBM Plex Sans",system-ui,sans-serif', mono:'"IBM Plex Mono",monospace',
};
const W = 1920, H = 1080;

/* ---------- helpers ---------- */
const ease = (t)=>Easing.easeInOutCubic(clamp(t,0,1));
// entry/exit envelope: ramps 0→1 over `inDur`, holds, 1→0 over `outDur`
function env(local, dur, inDur=0.5, outDur=0.5){
  const a = clamp(local/inDur,0,1);
  const b = 1 - clamp((local-(dur-outDur))/outDur,0,1);
  return Math.min(Easing.easeOutCubic(a), Easing.easeInCubic? (b<1?b:1):b);
}

/* ---------- 3D primitives ---------- */
function Cube({ size=160, color=C.teal, deep=C.tealDeep, glow=C.tealGlow, label, sub, spin=0, lift=0, opacity=1 }) {
  const h = size/2;
  const faces = [
    { t:`rotateY(0deg) translateZ(${h}px)`,   b:color },
    { t:`rotateY(90deg) translateZ(${h}px)`,  b:deep },
    { t:`rotateY(180deg) translateZ(${h}px)`, b:deep },
    { t:`rotateY(-90deg) translateZ(${h}px)`, b:color },
    { t:`rotateX(90deg) translateZ(${h}px)`,  b:'#fff' },
    { t:`rotateX(-90deg) translateZ(${h}px)`, b:deep },
  ];
  return (
    <div style={{ position:'absolute', width:size, height:size, transformStyle:'preserve-3d',
      transform:`translateY(${lift}px) rotateX(-18deg) rotateY(${spin}deg)`, opacity }}>
      {faces.map((f,i)=>(
        <div key={i} style={{ position:'absolute', width:size, height:size, transform:f.t,
          background: i===4 ? `linear-gradient(135deg, ${color}, #fff)` : f.b,
          opacity: i===4?0.92:(i===1||i===2||i===5?0.62:0.95),
          border:`1px solid rgba(255,255,255,.18)`, boxSizing:'border-box' }}/>
      ))}
      {/* glow */}
      <div style={{ position:'absolute', inset:-size*0.5, transform:'translateZ(-2px)',
        background:`radial-gradient(circle, ${glow}, transparent 68%)`, filter:'blur(8px)' }}/>
      {/* face label */}
      {label && (
        <div style={{ position:'absolute', width:size, height:size, transform:`translateZ(${h+1}px)`,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          color:'#06140F', fontFamily:C.mono, fontWeight:600, pointerEvents:'none' }}>
          <div style={{ fontSize:size*0.2, letterSpacing:'.02em' }}>{label}</div>
          {sub && <div style={{ fontSize:size*0.085, opacity:.75, marginTop:4 }}>{sub}</div>}
        </div>
      )}
    </div>
  );
}

function Grid3D(){
  const t = useTime();
  const shift = (t*40)%80;
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', perspective:'700px' }}>
      <div style={{ position:'absolute', left:'-30%', right:'-30%', bottom:'-10%', height:'85%',
        transform:'rotateX(74deg)', transformOrigin:'center bottom',
        backgroundImage:`linear-gradient(${C.teal}22 1px, transparent 1px), linear-gradient(90deg, ${C.teal}22 1px, transparent 1px)`,
        backgroundSize:'80px 80px', backgroundPosition:`0 ${shift}px`,
        maskImage:'linear-gradient(to top, #000 0%, transparent 75%)',
        WebkitMaskImage:'linear-gradient(to top, #000 0%, transparent 75%)' }}/>
      <div style={{ position:'absolute', inset:0,
        background:`radial-gradient(120% 80% at 50% 18%, ${C.tealDeep}33, transparent 60%)` }}/>
    </div>
  );
}

function Vignette(){
  return <div style={{ position:'absolute', inset:0, pointerEvents:'none',
    boxShadow:'inset 0 0 280px rgba(0,0,0,.85)', background:'radial-gradient(130% 120% at 50% 50%, transparent 55%, rgba(0,0,0,.55))' }}/>;
}

/* floating code glyphs */
function CodeBits({ n=14, color=C.teal }){
  const t = useTime();
  const bits = ['{ }','( )','if','==','>=','return','for','=>','[ ]','0xF','def','&&','!=','++'];
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
      {Array.from({length:n}).map((_,i)=>{
        const seed = (i*97)%100/100;
        const x = (seed*100);
        const y = ((seed*53+ (t*(6+seed*10)))%120)-10;
        const op = 0.10+0.22*((i*31)%100/100);
        return <div key={i} style={{ position:'absolute', left:`${x}%`, top:`${y}%`,
          color, opacity:op, fontFamily:C.mono, fontSize:13+ (i%4)*5, transform:`translateZ(0)` }}>{bits[i%bits.length]}</div>;
      })}
    </div>
  );
}

/* heading shown top-center */
function Heading({ text, color=C.ink, sub }){
  const { localTime, duration } = useSprite();
  const o = env(localTime, duration, 0.5, 0.5);
  const ty = (1-clamp(localTime/0.5,0,1))*-20;
  return (
    <div style={{ position:'absolute', top:70, left:0, right:0, textAlign:'center', opacity:o, transform:`translateY(${ty}px)` }}>
      <div style={{ fontFamily:C.mono, fontSize:15, letterSpacing:'.34em', textTransform:'uppercase', color, fontWeight:500 }}>{text}</div>
      {sub && <div style={{ fontFamily:C.sans, fontSize:19, color:C.mute, marginTop:10 }}>{sub}</div>}
    </div>
  );
}

/* a 3D info card with depth + parallax */
function Card3D({ x, y, w=420, h=300, accent=C.teal, icon, title, body, delay=0, rotY=0, z=0 }){
  const { localTime } = useSprite();
  const lt = localTime - delay;
  const a = clamp(lt/0.6,0,1);
  const e = Easing.easeOutCubic(a);
  const enter = (1-e);
  return (
    <div style={{ position:'absolute', left:x, top:y, width:w, height:h, transformStyle:'preserve-3d',
      transform:`translateZ(${z}px) rotateY(${rotY}deg) translateY(${enter*60}px) scale(${0.85+0.15*e})`,
      opacity:a }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(150deg, rgba(26,34,43,.96), rgba(12,18,24,.96))',
        border:`1px solid ${accent}55`, borderRadius:20, boxShadow:`0 30px 60px rgba(0,0,0,.5), 0 0 40px ${accent}22`,
        padding:'30px 32px', boxSizing:'border-box' }}>
        <div style={{ width:58, height:58, borderRadius:14, background:`${accent}1f`, border:`1px solid ${accent}66`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:18 }}>{icon}</div>
        <div style={{ fontFamily:C.sans, fontWeight:600, fontSize:25, color:C.ink, lineHeight:1.2 }}>{title}</div>
        <div style={{ fontFamily:C.sans, fontSize:17, color:C.mute, marginTop:12, lineHeight:1.5 }}>{body}</div>
        <div style={{ position:'absolute', left:0, bottom:0, height:4, width:'100%', background:accent, borderRadius:'0 0 20px 20px', opacity:.8 }}/>
      </div>
    </div>
  );
}

/* big centered statement with per-line depth pop */
function BigStatement({ lines }){
  const { localTime, duration } = useSprite();
  const o = env(localTime, duration, 0.6, 0.6);
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', opacity:o, perspective:'900px' }}>
      {lines.map((ln,i)=>{
        const lt = localTime - 0.25 - i*0.28;
        const a = clamp(lt/0.5,0,1); const e = Easing.easeOutBack(a);
        return <div key={i} style={{ fontFamily:C.sans, fontWeight:700, fontSize:ln.size||64,
          color:ln.color||C.ink, letterSpacing:'-0.02em', lineHeight:1.15, textAlign:'center',
          transform:`translateZ(${(1-e)*-160}px) translateY(${(1-clamp(lt/0.5,0,1))*20}px)`, opacity:a }}>{ln.t}</div>;
      })}
    </div>
  );
}

/* ===================================================================== */
/* SCENES                                                                */
/* ===================================================================== */

/* camera wrapper: gives perspective + an animated 3D world transform */
function World({ children, camTransform }){
  return (
    <div style={{ position:'absolute', inset:0, perspective:'1400px', perspectiveOrigin:'50% 45%' }}>
      <div style={{ position:'absolute', inset:0, transformStyle:'preserve-3d', transform:camTransform }}>
        {children}
      </div>
    </div>
  );
}

/* Scene 1 — Hook */
function SceneHook(){
  return (
    <Sprite start={0} end={7}>
      {({localTime})=>{
        const push = animate({from:-260, to:40, start:0, end:6.5, ease:Easing.easeOutCubic})(localTime);
        const spin = localTime*42;
        const cam = `translateZ(${push}px) rotateY(${animate({from:-12,to:8,start:0,end:7,ease:Easing.linear})(localTime)}deg)`;
        const titleO = env(localTime,7,0.6,0.5);
        return (
          <World camTransform={cam}>
            <CodeBits n={16} color={C.teal}/>
            <div style={{ position:'absolute', left:W/2-80, top:H/2-150, transformStyle:'preserve-3d' }}>
              <Cube size={260} label="LLM" sub="70B+ PARAMS" spin={spin} />
            </div>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'flex-end', paddingBottom:120, opacity:titleO }}>
              <div style={{ fontFamily:C.sans, fontWeight:700, fontSize:62, color:C.ink, letterSpacing:'-0.02em' }}>Code generation in 2026</div>
              <div style={{ fontFamily:C.sans, fontSize:24, color:C.teal, marginTop:14 }}>When bigger isn't always better.</div>
            </div>
          </World>
        );
      }}
    </Sprite>
  );
}

/* Scene 2 — The barriers */
function SceneNeed(){
  return (
    <Sprite start={7} end={18}>
      {({localTime})=>{
        const pan = animate({from:120, to:-120, start:0.4, end:10.6, ease:Easing.easeInOutSine})(localTime);
        const cam = `translateX(${pan}px) rotateY(${pan*-0.02}deg) translateZ(60px)`;
        return (
          <World camTransform={cam}>
            <CodeBits n={8} color={C.red}/>
            <Heading text="The barriers to adoption" sub="Why scaling the generator hits a wall"/>
            <Card3D x={170} y={360} accent={C.amber} icon="💸" rotY={10} z={-40} delay={0.2}
              title="Cost of trust" body="A 70B model needs an 8× A100 cluster — on the order of $50,000."/>
            <Card3D x={750} y={380} accent={C.red} icon="⚠️" rotY={0} z={20} delay={0.5}
              title="Plausible, but wrong" body="LLMs emit syntactically valid yet logically flawed code — silent hallucinations."/>
            <Card3D x={1330} y={360} accent={C.violet} icon="🔒" rotY={-10} z={-40} delay={0.8}
              title="Privacy & sovereignty" body="Cloud APIs send proprietary code off-premise, raising compliance risk."/>
          </World>
        );
      }}
    </Sprite>
  );
}

/* Scene 3 — The shift */
function SceneShift(){
  return (
    <Sprite start={18} end={25}>
      {({localTime})=>{
        const cam = `translateZ(${animate({from:-120,to:30,start:0,end:7,ease:Easing.easeOutCubic})(localTime)}px)`;
        return (
          <World camTransform={cam}>
            <CodeBits n={10} color={C.teal}/>
            <BigStatement lines={[
              { t:"Don't scale the generator.", size:60, color:C.mute },
              { t:'Judge the output.', size:78, color:C.teal },
            ]}/>
          </World>
        );
      }}
    </Sprite>
  );
}

/* Scene 4 — SLM Judge pipeline */
function SceneJudge(){
  return (
    <Sprite start={25} end={35}>
      {({localTime})=>{
        const cam = `rotateY(${animate({from:14,to:-6,start:0,end:10,ease:Easing.easeInOutSine})(localTime)}deg) translateZ(80px)`;
        const showJudge = clamp((localTime-2.2)/0.6,0,1);
        const showOut = clamp((localTime-4.2)/0.6,0,1);
        const cardsA = clamp((localTime-1)/0.6,0,1);
        return (
          <World camTransform={cam}>
            <Heading text="The Generator–Judge pipeline" />
            {/* generator */}
            <div style={{ position:'absolute', left:210, top:430, transformStyle:'preserve-3d', opacity:clamp(localTime/0.6,0,1) }}>
              <Cube size={150} label="GEN" sub="SLM" spin={localTime*34}/>
              <div style={{ position:'absolute', top:175, width:150, textAlign:'center', fontFamily:C.mono, fontSize:13, color:C.mute }}>generator</div>
            </div>
            {/* candidates */}
            {[0,1,2].map(i=>(
              <div key={i} style={{ position:'absolute', left:540, top:360+i*90, width:230, height:64,
                borderRadius:12, background:'rgba(26,34,43,.9)', border:`1px solid ${C.teal}44`,
                transform:`translateZ(${i*8}px) translateX(${(1-Easing.easeOutCubic(cardsA))*-40}px)`, opacity:cardsA,
                display:'flex', alignItems:'center', padding:'0 16px', gap:10, fontFamily:C.mono, fontSize:13, color:C.mute }}>
                <span style={{ color:C.teal }}>candidate {i+1}</span>
                <span style={{ marginLeft:'auto', opacity:.6 }}>{['{...}','if(x>=0)','return r'][i]}</span>
              </div>
            ))}
            {/* judge */}
            <div style={{ position:'absolute', left:1010, top:430, transformStyle:'preserve-3d', opacity:showJudge,
              transform:`scale(${0.8+0.2*Easing.easeOutBack(showJudge)})` }}>
              <Cube size={170} color={C.violet} deep={C.violetDeep} glow={C.violetGlow} label="JUDGE" sub="≤ 5B" spin={localTime*30}/>
              <div style={{ position:'absolute', top:195, width:170, textAlign:'center', fontFamily:C.mono, fontSize:13, color:C.violet }}>binary verdict</div>
            </div>
            {/* output */}
            <div style={{ position:'absolute', left:1380, top:455, opacity:showOut,
              transform:`translateX(${(1-Easing.easeOutCubic(showOut))*-30}px)` }}>
              <div style={{ width:120, height:120, borderRadius:24, background:`${C.green}22`, border:`2px solid ${C.green}`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:60, color:C.green }}>✓</div>
              <div style={{ width:120, textAlign:'center', fontFamily:C.mono, fontSize:13, color:C.green, marginTop:10 }}>best&nbsp;solution</div>
            </div>
            {/* caption */}
            <div style={{ position:'absolute', left:0, right:0, bottom:90, textAlign:'center',
              fontFamily:C.sans, fontSize:22, color:C.ink, opacity:clamp((localTime-1.5)/0.8,0,1) }}>
              A specialized <b style={{color:C.violet}}>SLM judge</b> — single consumer GPU, ~$600, fully local.
            </div>
          </World>
        );
      }}
    </Sprite>
  );
}

/* Scene 5 — Collaborative team */
function SceneTeam(){
  return (
    <Sprite start={35} end={44}>
      {({localTime})=>{
        const cam = `rotateX(6deg) rotateY(${animate({from:-10,to:10,start:0,end:9,ease:Easing.easeInOutSine})(localTime)}deg) translateZ(60px)`;
        const consensus = clamp((localTime-3.5)/0.8,0,1);
        return (
          <World camTransform={cam}>
            <Heading text="A team of judges" sub="Specialized SLMs vote — consensus over a single oracle"/>
            {[0,1,2].map(i=>{
              const a = clamp((localTime-0.3-i*0.35)/0.6,0,1);
              const voted = clamp((localTime-2.0-i*0.3)/0.4,0,1);
              return (
                <div key={i} style={{ position:'absolute', left:560+i*330, top:430, transformStyle:'preserve-3d',
                  opacity:a, transform:`translateY(${(1-Easing.easeOutBack(a))*70}px)` }}>
                  <Cube size={150} color={C.violet} deep={C.violetDeep} glow={C.violetGlow} label={`J${i+1}`} spin={localTime*26+i*40}/>
                  <div style={{ position:'absolute', top:-46, left:45, width:60, height:60, borderRadius:'50%',
                    background:`${C.green}22`, border:`2px solid ${C.green}`, color:C.green, fontSize:30,
                    display:'flex', alignItems:'center', justifyContent:'center', opacity:voted,
                    transform:`scale(${0.5+0.5*Easing.easeOutBack(voted)})` }}>✓</div>
                </div>
              );
            })}
            <div style={{ position:'absolute', left:0, right:0, bottom:96, textAlign:'center', opacity:consensus,
              transform:`translateY(${(1-consensus)*20}px)` }}>
              <div style={{ fontFamily:C.sans, fontSize:30, fontWeight:600, color:C.ink }}>Reliability rivaling a 70B model</div>
              <div style={{ fontFamily:C.mono, fontSize:18, color:C.teal, marginTop:10 }}>≈ 97% lower hardware cost · ~70% smaller carbon footprint</div>
            </div>
          </World>
        );
      }}
    </Sprite>
  );
}

/* Scene 6 — The gaps */
function SceneGaps(){
  return (
    <Sprite start={44} end={54}>
      {({localTime})=>{
        const cam = `translateX(${animate({from:-90,to:90,start:0.4,end:9.6,ease:Easing.easeInOutSine})(localTime)}px) translateZ(50px)`;
        return (
          <World camTransform={cam}>
            <CodeBits n={6} color={C.red}/>
            <Heading text="The research gaps" color={C.red} sub="What the literature still leaves open"/>
            <Card3D x={170} y={360} accent={C.red} icon="①" rotY={9} z={-30} delay={0.2}
              title="No systematic eval" body="Modern decoder-only SLMs as autonomous binary code judges remain largely unmeasured."/>
            <Card3D x={750} y={380} accent={C.amber} icon="②" rotY={0} z={20} delay={0.5}
              title="Ranking ≠ classification" body="Rerankers order candidates; few report κ or False Discovery Rate for a strict verdict."/>
            <Card3D x={1330} y={360} accent={C.violet} icon="③" rotY={-9} z={-30} delay={0.8}
              title="Collaboration unexplored" body="Teams of fine-tuned SLM judges, with principled aggregation, are barely studied."/>
          </World>
        );
      }}
    </Sprite>
  );
}

/* Scene 7 — Closing lockup */
function SceneClose(){
  return (
    <Sprite start={54} end={61}>
      {({localTime})=>{
        const cam = `translateZ(${animate({from:-60,to:30,start:0,end:7,ease:Easing.easeOutCubic})(localTime)}px)`;
        const o = clamp(localTime/0.8,0,1);
        const chips = clamp((localTime-1.2)/0.7,0,1);
        return (
          <World camTransform={cam}>
            <div style={{ position:'absolute', left:W/2-130, top:150, transformStyle:'preserve-3d', opacity:o }}>
              <Cube size={150} color={C.violet} deep={C.violetDeep} glow={C.violetGlow} label="SLM" sub="JUDGE ×N" spin={localTime*28}/>
            </div>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', marginTop:120, opacity:o }}>
              <div style={{ fontFamily:C.sans, fontWeight:700, fontSize:54, color:C.ink, letterSpacing:'-0.02em', textAlign:'center', maxWidth:1200, lineHeight:1.15 }}>
                Collaborative Small Language Models<br/>as Reliable Code Judges
              </div>
              <div style={{ display:'flex', gap:16, marginTop:34, opacity:chips, transform:`translateY(${(1-chips)*16}px)` }}>
                {['Efficient','Sovereign','Sustainable'].map((c,i)=>(
                  <div key={i} style={{ fontFamily:C.mono, fontSize:18, color:C.teal, border:`1px solid ${C.teal}66`,
                    background:`${C.teal}14`, borderRadius:999, padding:'9px 22px' }}>{c}</div>
                ))}
              </div>
              <div style={{ fontFamily:C.mono, fontSize:14, color:C.faint, marginTop:30 }}>PhD research · M. Khallala · 2026</div>
            </div>
          </World>
        );
      }}
    </Sprite>
  );
}

/* timestamp label for commenting */
function TimeLabel(){
  const t = useTime();
  React.useEffect(()=>{
    const root = document.getElementById('vid-root');
    if(root) root.setAttribute('data-screen-label', `t=${t.toFixed(0)}s`);
  }, [Math.floor(t)]);
  return null;
}

function Movie(){
  return (
    <>
      <Grid3D/>
      <SceneHook/>
      <SceneNeed/>
      <SceneShift/>
      <SceneJudge/>
      <SceneTeam/>
      <SceneGaps/>
      <SceneClose/>
      <Vignette/>
      <TimeLabel/>
    </>
  );
}

window.Movie = Movie;
