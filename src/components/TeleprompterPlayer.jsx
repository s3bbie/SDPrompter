import { useState, useRef, useEffect, useCallback } from "react";
import { Settings, X, RotateCcw } from "lucide-react";

const MAX_OFFSET = 0;

const FONT_COLORS = ["#ffffff","#f5f5dc","#ffd700","#90ee90","#87ceeb","#ffb6c1","#000000"];
const BG_COLORS   = ["#000000","#1a1a2e","#0d1b2a","#1a2e1a","#1c1c1c","#2e1a1a","#ffffff"];

export default function TeleprompterPlayer({ script, onExit, onSave }) {
  const [scrolling, setScrolling]       = useState(false);
  const [speed, setSpeed]               = useState(2);
  const [mirror, setMirror]             = useState(false);
  const [editing, setEditing]           = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [text, setText]                 = useState(script?.content || "");
  const [offset, setOffset]             = useState(0);

  // Appearance
  const [fontSize, setFontSize]         = useState(5);
  const [lineSpacing, setLineSpacing]   = useState(1.5);
  const [alignCenter, setAlignCenter]   = useState(false);
  const [fontColor, setFontColor]       = useState("#ffffff");
  const [bgColor, setBgColor]           = useState("#000000");
  const [textOpacity, setTextOpacity]   = useState(1);

  // Reading guide
  const [guideEnabled, setGuideEnabled] = useState(false);
  const [guidePos, setGuidePos]         = useState(40); // % from top

  // Countdown
  const [countdownSecs, setCountdownSecs] = useState(3);
  const [countdown, setCountdown]         = useState(null); // null = inactive

  const innerRef      = useRef(null);
  const frameRef      = useRef(null);
  const speedRef      = useRef(speed);
  const scrollingRef  = useRef(scrolling);
  const touchStartY   = useRef(null);

  useEffect(() => { speedRef.current = speed; },       [speed]);
  useEffect(() => { scrollingRef.current = scrolling; }, [scrolling]);

  const getMinOffset = useCallback(() => {
    if (!innerRef.current) return -Infinity;
    const viewportHeight = innerRef.current.parentElement?.clientHeight || window.innerHeight;
    return -(innerRef.current.scrollHeight - viewportHeight * 0.5);
  }, []);

  // rAF scroll loop
  useEffect(() => {
    const loop = () => {
      if (scrollingRef.current) {
        setOffset((prev) => {
          const next = prev - speedRef.current * 0.5;
          const min  = getMinOffset();
          if (next <= min) {
            scrollingRef.current = false;
            setScrolling(false);
            return min;
          }
          return next;
        });
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [getMinOffset]);

  // Countdown ticker
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      setScrolling(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleStartStop = () => {
    if (scrolling) {
      setScrolling(false);
    } else if (countdown !== null) {
      // cancel countdown
      setCountdown(null);
    } else {
      if (countdownSecs > 0) {
        setCountdown(countdownSecs);
      } else {
        setScrolling(true);
      }
    }
  };

  const handleReset = () => {
    setScrolling(false);
    setCountdown(null);
    setOffset(0);
  };

  const handleDone = () => {
    onSave({ ...script, content: text, updated: new Date().toISOString() });
    setEditing(false);
  };

  // Tap anywhere on prompter to pause/resume (not on bottom bar)
  const handlePromptTap = (e) => {
    if (countdown !== null) { setCountdown(null); return; }
    setScrolling((prev) => !prev);
  };

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove  = (e) => {
    if (scrolling || touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    touchStartY.current = e.touches[0].clientY;
    setOffset((prev) => Math.min(MAX_OFFSET, prev + delta));
  };
  const handleTouchEnd = () => { touchStartY.current = null; };

  const isCountingDown = countdown !== null;
  const buttonLabel = isCountingDown ? "CANCEL" : scrolling ? "PAUSE" : "START";
  const buttonColor = isCountingDown
    ? "bg-yellow-600 hover:bg-yellow-700"
    : scrolling
    ? "bg-red-600 hover:bg-red-700"
    : "bg-blue-600 hover:bg-blue-700";

  return (
    <div
      className="fixed inset-0 flex flex-col z-50 select-none"
      style={{ background: bgColor }}
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
        <button onClick={onExit} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition">
          ← My Scripts
        </button>
        <div className="text-xs text-white/40">{editing ? "Editing" : script?.title || "Teleprompter"}</div>
        {editing ? (
          <button onClick={handleDone} className="text-blue-400 hover:text-blue-300 text-sm font-medium rounded-full px-3 py-1 border border-blue-400 transition">
            Done
          </button>
        ) : (
          <button onClick={() => setEditing(true)} className="text-blue-400 hover:text-blue-300 text-sm font-medium rounded-full px-3 py-1 border border-blue-400 transition">
            Edit
          </button>
        )}
      </div>

      {/* Main area */}
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 w-full text-white text-2xl leading-relaxed focus:outline-none resize-none p-6"
          style={{ background: bgColor }}
          placeholder="Start typing your script..."
        />
      ) : (
        <div
          className="relative flex-1 overflow-hidden cursor-pointer"
          style={{ transform: mirror ? "scaleX(-1)" : "none" }}
          onClick={handlePromptTap}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Scrolling text */}
          <div
            className="px-10 py-8 whitespace-pre-wrap will-change-transform"
            ref={innerRef}
            style={{
              fontSize: `${fontSize}vw`,
              lineHeight: lineSpacing,
              textAlign: alignCenter ? "center" : "left",
              color: fontColor,
              opacity: textOpacity,
              transform: `translateY(${offset}px)`,
              transition: scrolling ? "none" : "transform 0.15s ease-out",
            }}
          >
            {text}
          </div>

          {/* Reading guide line */}
          {guideEnabled && (
            <div
              className="absolute left-0 right-0 pointer-events-none flex items-center"
              style={{ top: `${guidePos}%` }}
            >
              <div className="w-full h-[2px] bg-blue-400/60" />
              <div
                className="absolute left-4 text-blue-400/80 text-xl leading-none"
                style={{ marginTop: "-2px" }}
              >▶</div>
            </div>
          )}

          {/* Countdown overlay */}
          {isCountingDown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
              <span className="text-white font-bold" style={{ fontSize: "20vw" }}>
                {countdown === 0 ? "GO" : countdown}
              </span>
            </div>
          )}

          {/* Paused hint */}
          {!scrolling && !isCountingDown && offset !== 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white/60 text-xs px-3 py-1 rounded-full pointer-events-none">
              Tap to resume
            </div>
          )}
        </div>
      )}

      {/* Bottom Bar */}
      {!editing && (
        <div
          className="flex items-center justify-between px-4 py-3 border-t border-white/10 rounded-t-2xl"
          style={{ background: `color-mix(in srgb, ${bgColor} 80%, #111 20%)` }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left controls */}
          <div className="flex items-center gap-3">
            <button
              className="text-white/50 hover:text-white transition"
              onClick={() => setShowSettings(true)}
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setMirror(!mirror)}
              className={`text-sm font-bold transition ${mirror ? "text-blue-400" : "text-white/40"} hover:text-white`}
              title="Mirror"
            >⇔</button>
            <button
              onClick={handleReset}
              className="text-white/50 hover:text-white transition"
              title="Reset to top"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Centre: Start/Pause/Cancel */}
          <button
            onClick={handleStartStop}
            className={`px-6 py-2 rounded-full font-medium text-white transition ${buttonColor}`}
          >
            {buttonLabel}
          </button>

          {/* Right: speed */}
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-base">🐢</span>
            <input
              type="range" min="1" max="10" step="1" value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-20 accent-blue-500"
            />
            <span className="text-white/30 text-base">🐇</span>
          </div>
        </div>
      )}

      {/* Settings Drawer */}
      {showSettings && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowSettings(false)} />
          <div className="fixed bottom-0 left-0 w-full bg-[#1c1c1e] border-t border-white/10 z-50 rounded-t-2xl overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center px-5 pt-5 pb-3">
              <h2 className="text-white text-lg font-semibold">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white transition">
                <X size={22} />
              </button>
            </div>

            <div className="px-5 pb-8 flex flex-col gap-6 text-white/80">

              {/* Font size */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Font Size</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="2" max="10" step="0.5" value={fontSize}
                    onChange={(e) => setFontSize(parseFloat(e.target.value))}
                    className="flex-1 accent-blue-500" />
                  <span className="text-sm w-12 text-right">{fontSize}vw</span>
                </div>
              </div>

              {/* Line spacing */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Line Spacing</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="1" max="2.5" step="0.1" value={lineSpacing}
                    onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                    className="flex-1 accent-blue-500" />
                  <span className="text-sm w-12 text-right">{lineSpacing.toFixed(1)}</span>
                </div>
              </div>

              {/* Text opacity */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Text Opacity</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="0.2" max="1" step="0.05" value={textOpacity}
                    onChange={(e) => setTextOpacity(parseFloat(e.target.value))}
                    className="flex-1 accent-blue-500" />
                  <span className="text-sm w-12 text-right">{Math.round(textOpacity * 100)}%</span>
                </div>
              </div>

              {/* Alignment */}
              <div className="flex justify-between items-center">
                <label className="text-xs text-white/40 uppercase tracking-widest">Text Alignment</label>
                <div className="flex gap-2">
                  {["Left","Centre"].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlignCenter(a === "Centre")}
                      className={`px-3 py-1 rounded-lg text-sm border transition ${
                        (a === "Centre") === alignCenter
                          ? "border-blue-400 text-blue-400"
                          : "border-white/20 text-white/40"
                      }`}
                    >{a}</button>
                  ))}
                </div>
              </div>

              {/* Font colour */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Text Colour</label>
                <div className="flex gap-2 flex-wrap">
                  {FONT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFontColor(c)}
                      className="w-8 h-8 rounded-full border-2 transition"
                      style={{
                        background: c,
                        borderColor: fontColor === c ? "#3b82f6" : "transparent",
                        boxShadow: fontColor === c ? "0 0 0 2px #3b82f6" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Background colour */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Background Colour</label>
                <div className="flex gap-2 flex-wrap">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setBgColor(c)}
                      className="w-8 h-8 rounded-full border-2 transition"
                      style={{
                        background: c,
                        borderColor: bgColor === c ? "#3b82f6" : "rgba(255,255,255,0.2)",
                        boxShadow: bgColor === c ? "0 0 0 2px #3b82f6" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Reading guide */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-white/40 uppercase tracking-widest">Reading Guide</label>
                  <button
                    onClick={() => setGuideEnabled(!guideEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${guideEnabled ? "bg-blue-500" : "bg-white/20"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${guideEnabled ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
                {guideEnabled && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-white/40">Position</span>
                    <input type="range" min="10" max="80" step="1" value={guidePos}
                      onChange={(e) => setGuidePos(parseInt(e.target.value))}
                      className="flex-1 accent-blue-500" />
                    <span className="text-sm w-10 text-right">{guidePos}%</span>
                  </div>
                )}
              </div>

              {/* Countdown */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Countdown Timer</label>
                <div className="flex gap-2">
                  {[0, 3, 5, 10].map((s) => (
                    <button
                      key={s}
                      onClick={() => setCountdownSecs(s)}
                      className={`px-3 py-1 rounded-lg text-sm border transition ${
                        countdownSecs === s
                          ? "border-blue-400 text-blue-400"
                          : "border-white/20 text-white/40"
                      }`}
                    >{s === 0 ? "Off" : `${s}s`}</button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
