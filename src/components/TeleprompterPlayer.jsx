import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, Settings, X, Pencil, Trash2 } from "lucide-react";

const MAX_OFFSET = 0;
const FONT_COLORS = ["#ffffff","#f5f5dc","#ffd700","#90ee90","#87ceeb","#ffb6c1","#000000"];
const BG_COLORS   = ["#000000","#1a1a2e","#0d1b2a","#1a2e1a","#1c1c1c","#2e1a1a","#ffffff"];
const SKIP_PX = 200;

export default function TeleprompterPlayer({ script, onExit, onSave, onDelete }) {
  const [title, setTitle]     = useState(script?.title || "Untitled Script");
  const [text, setText]       = useState(script?.content || "");
  const [editing, setEditing] = useState(!script?.content);

  const [scrolling, setScrolling] = useState(false);
  const [speed, setSpeed]         = useState(5);
  const [offset, setOffset]       = useState(0);

  const [showSettings, setShowSettings] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [countdown, setCountdown]       = useState(null);

  const [fontSize, setFontSize]           = useState(5);
  const [lineSpacing, setLineSpacing]     = useState(1.6);
  const [alignCenter, setAlignCenter]     = useState(false);
  const [fontColor, setFontColor]         = useState("#ffffff");
  const [bgColor, setBgColor]             = useState("#000000");
  const [textOpacity, setTextOpacity]     = useState(1);
  const [guideEnabled, setGuideEnabled]   = useState(false);
  const [guidePos, setGuidePos]           = useState(40);
  const [countdownSecs, setCountdownSecs] = useState(3);
  const [mirror, setMirror]               = useState(false);

  const [elapsed, setElapsed] = useState(0);
  const elapsedRef            = useRef(0);
  const elapsedFrameRef       = useRef(null);

  const innerRef     = useRef(null);
  const frameRef     = useRef(null);
  const speedRef     = useRef(speed);
  const scrollingRef = useRef(scrolling);
  const touchStartY  = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => { speedRef.current = speed; },         [speed]);
  useEffect(() => { scrollingRef.current = scrolling; }, [scrolling]);

  const getMinOffset = useCallback(() => {
    if (!innerRef.current) return -Infinity;
    const vh = innerRef.current.parentElement?.clientHeight || window.innerHeight;
    return -(innerRef.current.scrollHeight - vh * 0.5);
  }, []);

  useEffect(() => {
    const loop = () => {
      if (scrollingRef.current) {
        setOffset(prev => {
          const next = prev - speedRef.current * 0.3;
          const min  = getMinOffset();
          if (next <= min) { scrollingRef.current = false; setScrolling(false); return min; }
          return next;
        });
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [getMinOffset]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { setCountdown(null); setScrolling(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (scrolling) {
      const start = Date.now() - elapsedRef.current * 1000;
      const tick = () => {
        elapsedRef.current = (Date.now() - start) / 1000;
        setElapsed(Math.floor(elapsedRef.current));
        elapsedFrameRef.current = requestAnimationFrame(tick);
      };
      elapsedFrameRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(elapsedFrameRef.current);
    }
    return () => cancelAnimationFrame(elapsedFrameRef.current);
  }, [scrolling]);

  useEffect(() => { if (offset === 0) { elapsedRef.current = 0; setElapsed(0); } }, [offset]);

  const getRemaining = () => {
    if (!innerRef.current) return 0;
    const distLeft = Math.abs(getMinOffset() - offset);
    const pxPerSec = speedRef.current * 0.3 * 60;
    return Math.max(0, Math.round(distLeft / pxPerSec));
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const save = (overrides = {}) => onSave({
    ...script,
    title: overrides.title ?? title,
    content: overrides.text ?? text,
    updated: new Date().toISOString(),
  });

  const handleExitEditing  = () => { save(); setEditing(false); setEditingTitle(false); };
  const handleReset        = () => { setScrolling(false); setCountdown(null); setOffset(0); };
  const handleSkipBack     = () => { setScrolling(false); setOffset(p => Math.min(MAX_OFFSET, p + SKIP_PX)); };
  const handleSkipForward  = () => { setScrolling(false); setOffset(p => Math.max(getMinOffset(), p - SKIP_PX)); };
  const handleStartStop    = () => {
    if (scrolling) { setScrolling(false); return; }
    if (countdown !== null) { setCountdown(null); return; }
    setOffset(0);
    countdownSecs > 0 ? setCountdown(countdownSecs) : setScrolling(true);
  };
  const handlePromptTap = () => {
    if (editing) return;
    if (countdown !== null) { setCountdown(null); return; }
    setScrolling(p => !p);
  };
  const handleTouchStart = e => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove  = e => {
    if (scrolling || touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    touchStartY.current = e.touches[0].clientY;
    setOffset(p => Math.min(MAX_OFFSET, p + delta));
  };
  const handleTouchEnd = () => { touchStartY.current = null; };

  const isCountingDown = countdown !== null;

  return (
    <div className="fixed inset-0 flex flex-col z-50" style={{ background: editing ? "#0f0f0f" : bgColor }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 16px 8px", gap:10, flexShrink:0,
        borderBottom: editing ? "1px solid #2a2a2a" : "none",
      }}>
        <button onClick={() => { save(); onExit(); }} style={{ display:"flex", alignItems:"center", gap:2, background:"none", border:"none", color:"#2563eb", cursor:"pointer", fontSize:14, fontWeight:500, flexShrink:0, padding:"4px 8px 4px 2px" }}>
          <ChevronLeft size={18} style={{ marginLeft:-4 }} /> My Scripts
        </button>

        {editing ? (
          <div style={{ flex:1, textAlign:"center" }}>
            {editingTitle ? (
              <input ref={titleInputRef} value={title} onChange={e => setTitle(e.target.value)}
                onBlur={() => { save({ title }); setEditingTitle(false); }}
                onKeyDown={e => e.key==="Enter" && (save({ title }), setEditingTitle(false))}
                style={{ background:"none", border:"none", borderBottom:"1px solid #3a3a3c", color:"#fff", fontSize:15, fontWeight:600, textAlign:"center", outline:"none", width:"100%", padding:"2px 4px" }}
                autoFocus />
            ) : (
              <button onClick={() => { setEditingTitle(true); setTimeout(() => titleInputRef.current?.select(), 50); }}
                style={{ background:"none", border:"none", color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {title}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:700, color:"#ef4444", background:"rgba(239,68,68,0.15)", padding:"3px 8px", borderRadius:6, letterSpacing:0.5 }}>
              E:{fmt(elapsed)}
            </span>
            <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:700, color:"#22c55e", background:"rgba(34,197,94,0.15)", padding:"3px 8px", borderRadius:6, letterSpacing:0.5 }}>
              R:{fmt(getRemaining())}
            </span>
          </div>
        )}

        {editing ? (
          <button onClick={handleExitEditing} style={{ background:"none", border:"none", color:"#2563eb", cursor:"pointer", fontSize:14, fontWeight:600, flexShrink:0 }}>Done</button>
        ) : (
          <button onClick={() => { setScrolling(false); setCountdown(null); setEditing(true); }}
            style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", color:"#2563eb", cursor:"pointer", fontSize:13, fontWeight:500, flexShrink:0 }}>
            <Pencil size={13} /> Edit Script
          </button>
        )}
      </div>

      {/* ── MAIN AREA ── */}
      {editing ? (
        <textarea autoFocus value={text} onChange={e => setText(e.target.value)}
          placeholder="Start typing your script…"
          style={{ flex:1, width:"100%", background:"#0f0f0f", color:"#fff", fontSize:20, lineHeight:1.7, padding:"20px", border:"none", outline:"none", resize:"none", fontFamily:"inherit" }} />
      ) : (
        <div style={{ flex:1, overflow:"hidden", position:"relative", cursor:"pointer", transform: mirror ? "scaleX(-1)" : "none" }}
          onClick={handlePromptTap} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>

          <div ref={innerRef} style={{
            padding:"32px 28px 120px", fontSize:`${fontSize}vw`, lineHeight:lineSpacing,
            textAlign: alignCenter ? "center" : "left",
            color:fontColor, opacity:textOpacity,
            whiteSpace:"pre-wrap", willChange:"transform",
            transform:`translateY(${offset}px)`,
            transition: scrolling ? "none" : "transform 0.15s ease-out",
          }}>
            {text || <span style={{ color:"#555", fontStyle:"italic" }}>Tap Edit Script to add your script…</span>}
          </div>

          {guideEnabled && (
            <div style={{ position:"absolute", left:0, right:0, top:`${guidePos}%`, pointerEvents:"none" }}>
              <div style={{ width:"100%", height:2, background:"rgba(59,130,246,0.5)" }} />
              <div style={{ position:"absolute", left:16, top:-10, color:"rgba(59,130,246,0.8)", fontSize:18 }}>▶</div>
            </div>
          )}

          {isCountingDown && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.65)", pointerEvents:"none" }}>
              <span style={{ color:"#fff", fontWeight:800, fontSize:"22vw" }}>{countdown === 0 ? "GO" : countdown}</span>
            </div>
          )}

          {!scrolling && !isCountingDown && offset !== 0 && (
            <div style={{ position:"absolute", top:14, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.5)", color:"rgba(255,255,255,0.45)", fontSize:11, padding:"3px 12px", borderRadius:20, pointerEvents:"none" }}>
              Tap to resume
            </div>
          )}
        </div>
      )}

      {/* ── BOTTOM CONTROL BAR — always dark, always visible ── */}
      {!editing && (
        <div style={{ padding:"0 12px 16px", flexShrink:0 }} onClick={e => e.stopPropagation()}>
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            background:"#1a1a1a",
            borderRadius:20,
            padding:"10px 14px",
            gap:8,
            boxShadow:"0 4px 24px rgba(0,0,0,0.6)",
            border:"1px solid rgba(255,255,255,0.07)",
          }}>

            {/* Gear */}
            <button onClick={() => setShowSettings(true)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)", padding:6, flexShrink:0 }}>
              <Settings size={19} />
            </button>

            {/* Reset + skip back */}
            <div style={{ display:"flex", alignItems:"center", gap:2 }}>
              <Btn onClick={handleReset} title="Reset to top">↕</Btn>
              <Btn onClick={handleSkipBack} title="Skip back">⏮</Btn>
            </div>

            {/* START / STOP pill */}
            <button onClick={handleStartStop} style={{
              background: isCountingDown ? "#d97706" : scrolling ? "#dc2626" : "#2563eb",
              color:"#fff", border:"none", borderRadius:24,
              padding:"10px 26px", fontSize:14, fontWeight:700,
              cursor:"pointer", letterSpacing:1, transition:"background 0.2s", flexShrink:0,
            }}>
              {isCountingDown ? "CANCEL" : scrolling ? "STOP" : "START"}
            </button>

            {/* Skip forward */}
            <Btn onClick={handleSkipForward} title="Skip forward">⏭</Btn>

            {/* Speed slider + number */}
            <div style={{ display:"flex", alignItems:"center", gap:6, flex:1, minWidth:0 }}>
              <input type="range" min="1" max="30" step="1" value={speed}
                onChange={e => setSpeed(parseInt(e.target.value))}
                style={{ flex:1, accentColor:"#2563eb", minWidth:0 }} />
              <span style={{ color:"rgba(255,255,255,0.4)", fontSize:13, fontWeight:600, minWidth:22, textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{speed}</span>
            </div>

          </div>
        </div>
      )}

      {/* ── SETTINGS DRAWER ── */}
      {showSettings && (
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:40 }} onClick={() => setShowSettings(false)} />
          <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#1c1c1e", borderRadius:"20px 20px 0 0", zIndex:50, maxHeight:"82vh", overflowY:"auto", paddingBottom:44 }}>
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
              <div style={{ width:36, height:4, borderRadius:2, background:"#3a3a3c" }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 20px 16px" }}>
              <span style={{ color:"#fff", fontSize:17, fontWeight:600 }}>Settings</span>
              <button onClick={() => setShowSettings(false)} style={{ background:"none", border:"none", color:"#666", cursor:"pointer" }}><X size={20} /></button>
            </div>
            <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:24 }}>

              <SettingRow label="Font Size" value={`${fontSize}vw`}>
                <input type="range" min="2" max="10" step="0.5" value={fontSize} onChange={e => setFontSize(parseFloat(e.target.value))} style={{ flex:1, accentColor:"#2563eb" }} />
              </SettingRow>

              <SettingRow label="Line Spacing" value={lineSpacing.toFixed(1)}>
                <input type="range" min="1" max="2.5" step="0.1" value={lineSpacing} onChange={e => setLineSpacing(parseFloat(e.target.value))} style={{ flex:1, accentColor:"#2563eb" }} />
              </SettingRow>

              <SettingRow label="Text Opacity" value={`${Math.round(textOpacity*100)}%`}>
                <input type="range" min="0.2" max="1" step="0.05" value={textOpacity} onChange={e => setTextOpacity(parseFloat(e.target.value))} style={{ flex:1, accentColor:"#2563eb" }} />
              </SettingRow>

              <div>
                <SectionLabel>Text Alignment</SectionLabel>
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  {["Left","Centre"].map(a => <ToggleBtn key={a} active={(a==="Centre")===alignCenter} onClick={() => setAlignCenter(a==="Centre")}>{a}</ToggleBtn>)}
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <SectionLabel>Mirror Text</SectionLabel>
                <Toggle on={mirror} onToggle={() => setMirror(m => !m)} />
              </div>

              <div>
                <SectionLabel>Text Colour</SectionLabel>
                <div style={{ display:"flex", gap:10, marginTop:10, flexWrap:"wrap" }}>
                  {FONT_COLORS.map(c => <ColorSwatch key={c} color={c} selected={fontColor===c} onClick={() => setFontColor(c)} />)}
                </div>
              </div>

              <div>
                <SectionLabel>Background Colour</SectionLabel>
                <div style={{ display:"flex", gap:10, marginTop:10, flexWrap:"wrap" }}>
                  {BG_COLORS.map(c => <ColorSwatch key={c} color={c} selected={bgColor===c} onClick={() => setBgColor(c)} showBorder />)}
                </div>
              </div>

              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <SectionLabel>Reading Guide</SectionLabel>
                  <Toggle on={guideEnabled} onToggle={() => setGuideEnabled(g => !g)} />
                </div>
                {guideEnabled && (
                  <div style={{ marginTop:12 }}>
                    <SettingRow label="Position" value={`${guidePos}%`}>
                      <input type="range" min="10" max="80" step="1" value={guidePos} onChange={e => setGuidePos(parseInt(e.target.value))} style={{ flex:1, accentColor:"#2563eb" }} />
                    </SettingRow>
                  </div>
                )}
              </div>

              <div>
                <SectionLabel>Countdown Timer</SectionLabel>
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  {[0,3,5,10].map(s => <ToggleBtn key={s} active={countdownSecs===s} onClick={() => setCountdownSecs(s)}>{s===0?"Off":`${s}s`}</ToggleBtn>)}
                </div>
              </div>

              <div style={{ borderTop:"1px solid #2a2a2a", paddingTop:20 }}>
                <button onClick={() => { if (confirm(`Delete "${title}"?`)) onDelete(script.id); }}
                  style={{ width:"100%", padding:13, borderRadius:12, background:"#2a1a1a", border:"1px solid #3a1a1a", color:"#ff453a", fontSize:15, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <Trash2 size={16} /> Delete Script
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Helpers ──

function Btn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)", padding:"6px 8px", fontSize:17, lineHeight:1, borderRadius:8 }}>
      {children}
    </button>
  );
}
function SectionLabel({ children }) {
  return <p style={{ color:"#888", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:1, margin:0 }}>{children}</p>;
}
function SettingRow({ label, value, children }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <SectionLabel>{label}</SectionLabel>
        <span style={{ color:"#888", fontSize:12 }}>{value}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>{children}</div>
    </div>
  );
}
function ToggleBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:"7px 16px", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", background: active ? "#2563eb22" : "transparent", border:`1px solid ${active ? "#2563eb" : "#3a3a3c"}`, color: active ? "#2563eb" : "#888" }}>
      {children}
    </button>
  );
}
function ColorSwatch({ color, selected, onClick, showBorder }) {
  return (
    <button onClick={onClick} style={{ width:32, height:32, borderRadius:"50%", background:color, border: selected ? "2px solid #2563eb" : showBorder ? "1px solid #3a3a3c" : "2px solid transparent", cursor:"pointer", outline: selected ? "2px solid #2563eb" : "none", outlineOffset:2 }} />
  );
}
function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ width:44, height:26, borderRadius:13, border:"none", background: on ? "#2563eb" : "#3a3a3c", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <span style={{ position:"absolute", top:3, width:20, height:20, borderRadius:"50%", background:"#fff", left: on ? 21 : 3, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.3)" }} />
    </button>
  );
}
