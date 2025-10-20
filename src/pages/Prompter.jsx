import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useScript } from "../context/ScriptContext";
import ControlBar from "../components/ControlBar";
import SettingsPanel from "../components/SettingsPanel";

export default function Prompter() {
  const navigate = useNavigate();
  const {
    scriptText,
    scrollSpeed,
    setScrollSpeed,
    mirrorHorizontal,
    setMirrorHorizontal,
    mirrorVertical,
    setMirrorVertical,
  } = useScript();

  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(56);
  const [background, setBackground] = useState("black");
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef(null);

  // smooth scrolling
  useEffect(() => {
    let frameId;
    const step = () => {
      if (isRunning && containerRef.current) {
        containerRef.current.scrollTop += scrollSpeed;
      }
      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, scrollSpeed]);

  const transform = `scaleX(${mirrorHorizontal ? -1 : 1}) scaleY(${mirrorVertical ? -1 : 1})`;

  return (
    <div
      className={`min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden`}
      style={{ backgroundColor: background }}
    >
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md text-sm z-10"
      >
        ← Back
      </button>

      <div
        ref={containerRef}
        className="w-full h-screen px-8 py-16 overflow-hidden select-none"
        style={{
          transform,
          fontSize: `${fontSize}px`,
          lineHeight: "1.8em",
          textAlign: "center",
          fontWeight: 500,
          wordBreak: "break-word",
        }}
      >
        {scriptText || "Your script will appear here..."}
      </div>

      {/* Bottom control bar */}
      <ControlBar
        isRunning={isRunning}
        onToggle={() => setIsRunning(!isRunning)}
        speed={scrollSpeed}
        setSpeed={setScrollSpeed}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Settings overlay */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        mirrorHorizontal={mirrorHorizontal}
        setMirrorHorizontal={setMirrorHorizontal}
        mirrorVertical={mirrorVertical}
        setMirrorVertical={setMirrorVertical}
        fontSize={fontSize}
        setFontSize={setFontSize}
        background={background}
        setBackground={setBackground}
      />
    </div>
  );
}
