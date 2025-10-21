import { useState, useRef, useEffect } from "react";
import { Settings } from "lucide-react";

export default function TeleprompterPlayer({ script, onExit, onSave }) {
  const [scrolling, setScrolling] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [mirror, setMirror] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(script?.content || "");
  const contentRef = useRef(null);

  // --- Smooth scrolling ---
  useEffect(() => {
    let frame;
    const loop = () => {
      if (scrolling && contentRef.current) {
        contentRef.current.scrollTop += speed * 0.8;
      }
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [scrolling, speed]);

  const handleDone = () => {
    onSave({ ...script, content: text, updated: new Date().toISOString() });
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50">
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

        {/* Toggle between Edit and Done buttons */}
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

      {/* --- Main Content --- */}
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
          ref={contentRef}
          className={`flex-1 overflow-hidden px-10 py-8 text-5xl leading-snug select-none transition-transform duration-500 ${
            mirror ? "scale-x-[-1]" : ""
          }`}
        >
          <div className="whitespace-pre-wrap">{text}</div>
        </div>
      )}

      {/* --- Bottom Control Bar (only show when not editing) --- */}
      {!editing && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#111]/90 backdrop-blur-md border-t border-gray-800 rounded-t-2xl text-white">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              className="text-gray-300 hover:text-white transition"
              onClick={() => alert("Settings menu coming soon")}
            >
              <Settings size={22} />
            </button>

            {/* Mirror toggle */}
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

          {/* Start / Stop button */}
          <button
            onClick={() => setScrolling(!scrolling)}
            className={`px-6 py-2 rounded-full font-medium text-white transition ${
              scrolling
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {scrolling ? "STOP" : "START"}
          </button>

          {/* Speed control */}
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
    </div>
  );
}
