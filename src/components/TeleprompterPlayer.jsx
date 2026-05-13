import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, Settings, X, RotateCcw, Pencil, Trash2, SkipBack, SkipForward } from "lucide-react";

const MAX_OFFSET = 0;
const FONT_COLORS = ["#ffffff","#f5f5dc","#ffd700","#90ee90","#87ceeb","#ffb6c1","#000000"];
const BG_COLORS   = ["#000000","#1a1a2e","#0d1b2a","#1a2e1a","#1c1c1c","#2e1a1a","#ffffff"];
const SKIP_PX = 200;

export default function TeleprompterPlayer({ script, onExit, onSave, onDelete }) {
  const [title, setTitle]     = useState(script?.title || "Untitled Script");
  const [text, setText]       = useState(script?.content || "");
  const [editing, setEditing] = useState(!script?.content);

  const [scrolling, setScrolling] = useState(false);
  const [speed, setSpeed]         = useState(2);
  const [offset, setOffset]       = useState(0);

  const [showSettings, setShowSettings] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [countdown, setCountdown]       = useState(null);

  // Settings
  const [fontSize, setFontSize]         = useState(5);
  const [lineSpacing, setLineSpacing]   = useState(1.6);
  const [alignCenter, setAlignCenter]   = useState(false);
  const [fontColor, setFontColor]       = useState("#ffffff");
  const [bgColor, setBgColor]           = useState("#000000");
  const [textOpacity, setTextOpacity]   = useState(1);
  const [guideEnabled, setGuideEnabled] = useState(false);
  const [guidePos, setGuidePos]         = useState(40);
  const [countdownSecs, setCountdownSecs] = useState(3);
  const [mirror, setMirror]             = useState(false);

  const innerRef      = useRef(null);
  const frameRef      = useRef(null);
  const speedRef      = useRef(speed);
  const scrollingRef  = useRef(scrolling);
  const touchStartY   = useRef(null);
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
        setOffset((prev) => {
          const next = prev - speedRef.current * 0.5;
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

  const save = (overrides = {}) => {
    onSave({
      ...script,
      title: overrides.title ?? title,
      content: overrides.text ?? text,
      updated: new Date().toISOString(),
    });
  };

  const handleExitEditing = () => { save(); setEditing(false); setEditingTitle(false); };

  const handleStartStop = () => {
    if (scrolling) { setScrolling(false); return; }
    if (countdown !== null) { setCountdown(null); return; }
    setOffset(0);
    if (countdownSecs > 0) setCountdown(countdownSecs);
    else setScrolling(true);
  };

  const handleReset = () => { setScrolling(false); setCountdown(null); setOffset(0); };

  const handleSkipBack = () => {
    setScrolling(false);
    setOffset(prev => Math.min(MAX_OFFSET, prev + SKIP_PX));
  };

  const handleSkipForward = () => {
    setScrolling(false);
    setOffset(prev => Math.max(getMinOffset(), prev - SKIP_PX));
  };

  const handlePromptTap = () => {
    if (editing) return;
    if (countdown !== null) { setCountdown(null); return; }
    setScrolling(prev => !prev);
  };

  const handleTouchStart = e => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove  = e => {
    if (scrolling || touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    touchStartY.current = e.touches[0].clientY;
    setOffset(prev => Math.min(MAX_OFFSET, prev + delta));
  };
  const handleTouchEnd = () => { touchStartY.current = null; };

  const isCountingDown = countdown !== null;

  // Elapsed time display based on offset + speed
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const elapsedFrameRef = useRef(null);
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

  useEffect(() => {
    if (offset === 0) { elapsedRef.current = 0; setElapsed(0); }
  }, [offset]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  return (
    <div className="fixed inset-0 flex flex-col z-50" style={{ background: editing ? "#0f0f0f" : bgColor }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px 10px",
        borderBottom: `1px solid ${editing ? "#2a2a2a" : "rgba(255,255,255,0.07)"}`,
        gap: 10,
      }}>
        <button
          onClick={() => { save(); onExit(); }}
          style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", color:"#2563eb", cursor:"pointer", fontSize:15, fontWeight:500, flexShrink:0 }}
        >
          <ChevronLeft size={20} style={{ marginLeft:-4 }} /> Scripts
        </button>

        <div style={{ flex:1, textAlign:"center" }}>
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => { save({ title }); setEditingTitle(false); }}
              onKeyDown={e => { if (e.key==="Enter") { save({ title }); setEditingTitle(false); } }}
              style={{ background:"none", border:"none", borderBottom:"1px solid #3a3a3c", color:"#fff", fontSize:15, fontWeight:600, textAlign:"center", outline:"none", width:"100%", padding:"2px 4px" }}
              autoFocus
            />
          ) : (
            <button
              onClick={() => { setEditingTitle(true); setTimeout(() => titleInputRef.current?.select(), 50); }}
              style={{ background:"none", border:"none", color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
            >{title}</button>
          )}
        </div>

        {editing ? (
          <button onClick={handleExitEditing} style={{ background:"none", border:"none", color:"#2563eb", cursor:"pointer", fontSize:15, fontWeight:600, flexShrink:0 }}>Done</button>
        ) : (
          <button onClick={() => { setScrolling(false); setCountdown(null); setEditing(true); }} style={{ background:"none", border:"none", color:"#2563eb", cursor:"pointer", flexShrink:0 }} title="Edit">
            <Pencil size={18} />
          </button>
        )}
      </div>

      {/* ── MAIN AREA ── */}
      {editing ? (
        <textarea
          autoFocus value={text} onChange={e => setText(e.target.value)}
          placeholder="Start typing your script…"
          style={{ flex:1, width:"100%", background:"#0f0f0f", color:"#fff", fontSize:20, lineHeight:1.7, padding:"20px", border:"none", outline:"none", resize:"none", fontFamily:"inherit" }}
        />
      ) : (
        <div
          style={{ flex:1, overflow:"hidden", position:"relative", cursor:"pointer", transform: mirror ? "scaleX(-1)" : "none" }}
          onClick={handlePromptTap}
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        >
          <div
            ref={innerRef}
            style={{
              padding:"40px 28px", fontSize:`${fontSize}vw`, lineHeight:lineSpacing,
              textAlign: alignCenter ? "center" : "left",
              color: fontColor, opacity: textOpacity,
              whiteSpace:"pre-wrap", willChange:"transform",
              transform:`translateY(${offset}px)`,
              transition: scrolling ? "none" : "transform 0.15s ease-out",
            }}
          >
            {text || <span style={{ color:"#444", fontStyle:"italic" }}>Tap the pencil to add your script…</span>}
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
            <div style={{ position:"absolute", top:16, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.5)", color:"rgba(255,255,255,0.45)", fontSize:12, padding:"4px 14px", borderRadius:20, pointerEvents:"none" }}>
              Tap to resume
            </div>
          )}
        </div>
      )}

      {/* ── BOTTOM BAR ── */}
      {!editing && (
        <div
          style={{
            display:"flex", alignItems:"center",
            padding:"10px 16px 18px", gap:10,
            background:`color-mix(in srgb, ${bgColor} 80%, #000 20%)`,
            borderTop:"1px solid rgba(255,255,255,0.07)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Timer */}
          <div style={{ minWidth:44, flexShrink:0 }}>
            <span style={{ color: scrolling ? "#2563eb" : "#444", fontSize:12, fontWeight:600, fontVariantNumeric:"tabular-nums", letterSpacing:0.5 }}>
              {formatTime(elapsed)}
            </span>
          </div>

          {/* Reset */}
          <button onClick={handleReset} style={{ background:"none", border:"none", cursor:"pointer", color:"#555", padding:4 }} title="Reset to top">
            <RotateCcw size={17} />
          </button>

          {/* Skip back */}
          <button onClick={handleSkipBack} style={{ background:"none", border:"none", cursor:"pointer", color:"#555", padding:4 }} title="Skip back">
            <SkipBack size={20} />
          </button>

          {/* START / STOP — centred, dominant */}
          <button
            onClick={handleStartStop}
            style={{
              flex:1, maxWidth:110,
              margin:"0 auto",
              background: isCountingDown ? "#d97706" : scrolling ? "#dc2626" : "#2563eb",
              color:"#fff", border:"none", borderRadius:28,
              padding:"11px 0", fontSize:14, fontWeight:700,
              cursor:"pointer", letterSpacing:0.8, transition:"background 0.2s",
            }}
          >
            {isCountingDown ? "CANCEL" : scrolling ? "STOP" : "START"}
          </button>

          {/* Skip forward */}
          <button onClick={handleSkipForward} style={{ background:"none", border:"none", cursor:"pointer", color:"#555", padding:4 }} title="Skip forward">
            <SkipForward size={20} />
          </button>

          {/* Speed slider */}
          <div style={{ display:"flex", alignItems:"center", gap:5, flex:1 }}>
            <span style={{ color:"#444", fontSize:13 }}>🐢</span>
            <input
              type="range" min="1" max="10" step="1" value={speed}
              onChange={e => setSpeed(parseInt(e.target.value))}
              style={{ flex:1, accentColor:"#2563eb", minWidth:0 }}
            />
            <span style={{ color:"#444", fontSize:13 }}>🐇</span>
          </div>

          {/* Gear */}
          <button onClick={() => setShowSettings(true)} style={{ background:"none", border:"none", cursor:"pointer", color:"#555", padding:4, flexShrink:0 }} title="Settings">
            <Settings size={19} />
          </button>
        </div>
      )}

      {/* ── SETTINGS DRAWER ── */}
      {showSettings && (
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:40 }} onClick={() => setShowSettings(false)} />
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

              <SettingRow label="Text Opacity" value={`${Math.round(textOpacity * 100)}%`}>
                <input type="range" min="0.2" max="1" step="0.05" value={textOpacity} onChange={e => setTextOpacity(parseFloat(e.target.value))} style={{ flex:1, accentColor:"#2563eb" }} />
              </SettingRow>

              <div>
                <SectionLabel>Text Alignment</SectionLabel>
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  {["Left","Centre"].map(a => <ToggleBtn key={a} active={(a==="Centre")===alignCenter} onClick={() => setAlignCenter(a==="Centre")}>{a}</ToggleBtn>)}
                </div>
              </div>

              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <SectionLabel>Mirror Text</SectionLabel>
                  <Toggle on={mirror} onToggle={() => setMirror(m => !m)} />
                </div>
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

              <div style={{ borderTop:"1px solid #2a2a2a", paddingTop:20, marginTop:4 }}>
                <button
                  onClick={() => { if (confirm(`Delete "${title}"?`)) { onDelete(script.id); } }}
                  style={{ width:"100%", padding:13, borderRadius:12, background:"#2a1a1a", border:"1px solid #3a1a1a", color:"#ff453a", fontSize:15, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
                >
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
    <button onClick={onClick} style={{ padding:"7px 16px", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", transition:"all 0.15s", background: active ? "#2563eb22" : "transparent", border:`1px solid ${active ? "#2563eb" : "#3a3a3c"}`, color: active ? "#2563eb" : "#888" }}>
      {children}
    </button>
  );
}

function ColorSwatch({ color, selected, onClick, showBorder }) {
  return (
    <button onClick={onClick} style={{ width:32, height:32, borderRadius:"50%", background:color, border: selected ? "2px solid #2563eb" : showBorder ? "1px solid #3a3a3c" : "2px solid transparent", cursor:"pointer", outline: selected ? "2px solid #2563eb" : "none", outlineOffset:2, transition:"outline 0.15s" }} />
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ width:44, height:26, borderRadius:13, border:"none", background: on ? "#2563eb" : "#3a3a3c", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <span style={{ position:"absolute", top:3, width:20, height:20, borderRadius:"50%", background:"#fff", left: on ? 21 : 3, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.3)" }} />
    </button>
  );
}
