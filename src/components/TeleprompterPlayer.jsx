import { useState, useRef, useEffect, useCallback } from "react";
import { Settings, X, RotateCcw } from "lucide-react";

const MAX_OFFSET = 0; // can't scroll before start

export default function TeleprompterPlayer({ script, onExit, onSave }) {
  const [scrolling, setScrolling] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [mirror, setMirror] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [text, setText] = useState(script?.content || "");

  const [fontSize, setFontSize] = useState(5);
  const [lineSpacing, setLineSpacing] = useState(1.4);
  const [alignCenter, setAlignCenter] = useState(false);

  const innerRef = useRef(null);
  const frameRef = useRef(null);
  const speedRef = useRef(speed);
  const scrollingRef = useRef(scrolling);
  const [offset, setOffset] = useState(0);

  // Keep refs in sync so the rAF loop always sees latest values without restarting
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { scrollingRef.current = scrolling; }, [scrolling]);

  // Compute the minimum offset (can't scroll past end of text)
  const getMinOffset = useCallback(() => {
    if (!innerRef.current) return -Infinity;
    // innerRef height minus the viewport height gives max scroll distance
    const viewportHeight = innerRef.current.parentElement?.clientHeight || window.innerHeight;
    return -(innerRef.current.scrollHeight - viewportHeight * 0.5);
  }, []);

  // Single stable rAF loop — only starts/stops when component mounts/unmounts
  useEffect(() => {
    const loop = () => {
      if (scrollingRef.current) {
        setOffset((prev) => {
          const next = prev - speedRef.current * 0.5;
          const min = getMinOffset();
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

  const handleReset = () => {
    setScrolling(false);
    setOffset(0);
  };

  const handleDone = () => {
    onSave({ ...script, content: text, updated: new Date().toISOString() });
    setEditing(false);
  };

  const handleStartStop = () => setScrolling((prev) => !prev);

  // Manual drag on touch devices (disabled while auto-scrolling)
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    if (scrolling) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (scrolling || touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    touchStartY.current = e.touches[0].clientY;
    setOffset((prev) => Math.min(MAX_OFFSET, prev + delta));
  };

  const handleTouchEnd = () => { touchStartY.current = null; };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50 select-none">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-900">
        <button
          onClick={onExit}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
        >
          ← My Scripts
        </button>

        <div className="text-xs text-gray-500">
          {editing ? "Editing Script" : script?.title || "Teleprompter"}
        </div>

        {editing ? (
          <button
            onClick={handleDone}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium rounded-full px-3 py-1 border border-blue-400 transition"
          >
            Done
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium rounded-full px-3 py-1 border border-blue-400 transition"
          >
            Edit
          </button>
        )}
      </div>

      {/* Main Text Area */}
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 w-full bg-black text-white text-2xl leading-relaxed focus:outline-none resize-none p-6"
          placeholder="Start typing your script..."
        />
      ) : (
        <div
          className={`relative flex-1 overflow-hidden px-10 py-8 ${mirror ? "scale-x-[-1]" : ""}`}
          style={{
            fontSize: `${fontSize}vw`,
            lineHeight: lineSpacing,
            textAlign: alignCenter ? "center" : "left",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={innerRef}
            className="whitespace-pre-wrap will-change-transform"
            style={{
              transform: `translateY(${offset}px)`,
              transition: scrolling ? "none" : "transform 0.15s ease-out",
            }}
          >
            {text}
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      {!editing && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#111]/90 backdrop-blur-md border-t border-gray-800 rounded-t-2xl">
          {/* Left: settings + mirror + reset */}
          <div className="flex items-center gap-3">
            <button
              className="text-gray-400 hover:text-white transition"
              onClick={() => setShowSettings(true)}
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setMirror(!mirror)}
              className={`text-sm font-bold transition ${mirror ? "text-blue-400" : "text-gray-400"} hover:text-white`}
              title="Mirror horizontally"
            >
              ⇔
            </button>
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-white transition"
              title="Reset to top"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Centre: Start / Stop */}
          <button
            onClick={handleStartStop}
            className={`px-6 py-2 rounded-full font-medium text-white transition ${
              scrolling ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {scrolling ? "STOP" : "START"}
          </button>

          {/* Right: speed slider */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-lg">🐢</span>
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-24 accent-blue-500"
            />
            <span className="text-gray-500 text-lg">🐇</span>
          </div>
        </div>
      )}

      {/* Settings Drawer */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowSettings(false)}
          />
          <div className="fixed bottom-0 left-0 w-full bg-[#1a1a1a] border-t border-gray-700 p-5 z-50 rounded-t-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex flex-col gap-5 text-gray-200">
              <label className="flex justify-between items-center gap-4">
                <span className="text-sm w-28">Font Size</span>
                <input
                  type="range" min="2" max="8" step="0.5"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-xs text-gray-400 w-8 text-right">{fontSize}vw</span>
              </label>

              <label className="flex justify-between items-center gap-4">
                <span className="text-sm w-28">Line Spacing</span>
                <input
                  type="range" min="1" max="2.5" step="0.1"
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-xs text-gray-400 w-8 text-right">{lineSpacing.toFixed(1)}</span>
              </label>

              <div className="flex justify-between items-center">
                <span className="text-sm">Text Alignment</span>
                <button
                  onClick={() => setAlignCenter(!alignCenter)}
                  className={`px-3 py-1 rounded-lg text-sm border transition ${
                    alignCenter
                      ? "border-blue-400 text-blue-400"
                      : "border-gray-600 text-gray-300"
                  }`}
                >
                  {alignCenter ? "Centre" : "Left"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
