import { useState, useRef, useEffect } from "react";
import { Settings, X } from "lucide-react";

export default function TeleprompterPlayer({ script, onExit, onSave }) {
  const [scrolling, setScrolling] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [mirror, setMirror] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [text, setText] = useState(script?.content || "");

  // appearance settings
  const [fontSize, setFontSize] = useState(5);
  const [lineSpacing, setLineSpacing] = useState(1.4);
  const [alignCenter, setAlignCenter] = useState(false);

  const innerRef = useRef(null);
  const frameRef = useRef(null);
  const [offset, setOffset] = useState(0);

  // --- smooth transform-based scroll loop ---
  useEffect(() => {
    const loop = () => {
      if (scrolling) {
        setOffset((prev) => prev - speed * 0.5);
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [scrolling, speed]);

  const handleDone = () => {
    onSave({ ...script, content: text, updated: new Date().toISOString() });
    setEditing(false);
  };

  const handleStartStop = () => {
    // toggle scrolling; never reset offset
    setScrolling((prev) => !prev);
  };

  // --- manual drag on touch devices ---
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    if (scrolling) return; // disable drag when auto-scrolling
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (scrolling || touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStartY.current;
    touchStartY.current = currentY;
    setOffset((prev) => prev + delta);
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50 select-none">
      {/* --- Top Bar --- */}
      <div className="flex justify-between items-center px-4 py-3">
        <button
          onClick={onExit}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          ← My Scripts
        </button>

        <div className="text-xs text-gray-400">
          {editing ? "Editing Script" : "Teleprompter Mode"}
        </div>

        {editing ? (
          <button
            onClick={handleDone}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium rounded-full px-3 py-1 border border-blue-400"
          >
            Done
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium rounded-full px-3 py-1 border border-blue-400"
          >
            Edit Script
          </button>
        )}
      </div>

      {/* --- Main Text Area --- */}
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 w-full bg-black text-white text-3xl leading-relaxed focus:outline-none resize-none p-6"
          placeholder="Start typing your script..."
        />
      ) : (
        <div
          className={`relative flex-1 overflow-hidden px-10 py-8 ${
            mirror ? "scale-x-[-1]" : ""
          }`}
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
              transition: scrolling ? "none" : "transform 0.2s ease-out",
            }}
          >
            {text}
          </div>
        </div>
      )}

      {/* --- Bottom Bar --- */}
      {!editing && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#111]/90 backdrop-blur-md border-t border-gray-800 rounded-t-2xl text-white">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              className="text-gray-300 hover:text-white transition"
              onClick={() => setShowSettings(true)}
            >
              <Settings size={22} />
            </button>

            <button
              onClick={() => setMirror(!mirror)}
              className={`text-xl ${
                mirror ? "text-blue-400" : "text-gray-300"
              } hover:text-white transition`}
              title="Toggle mirror mode"
            >
              ⇅
            </button>
          </div>

          {/* Center Start / Stop */}
          <button
            onClick={handleStartStop}
            className={`px-6 py-2 rounded-full font-medium text-white transition ${
              scrolling
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {scrolling ? "STOP" : "START"}
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xl">🐢</span>
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-28 accent-blue-500"
            />
            <span className="text-gray-400 text-xl">🐇</span>
          </div>
        </div>
      )}

      {/* --- Settings Drawer --- */}
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

            <div className="flex flex-col gap-4 text-gray-200">
              <label className="flex justify-between items-center">
                <span>Font Size</span>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.5"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseFloat(e.target.value))}
                  className="w-40 accent-blue-500"
                />
              </label>

              <label className="flex justify-between items-center">
                <span>Line Spacing</span>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                  className="w-40 accent-blue-500"
                />
              </label>

              <label className="flex justify-between items-center">
                <span>Text Alignment</span>
                <button
                  onClick={() => setAlignCenter(!alignCenter)}
                  className={`px-3 py-1 rounded-lg text-sm border ${
                    alignCenter
                      ? "border-blue-400 text-blue-400"
                      : "border-gray-500 text-gray-300"
                  }`}
                >
                  {alignCenter ? "Center" : "Left"}
                </button>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
