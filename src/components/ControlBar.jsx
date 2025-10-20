import { useState } from "react";
import { Settings } from "lucide-react";

export default function ControlBar({
  isRunning,
  onToggle,
  speed,
  setSpeed,
  onOpenSettings,
}) {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-black/70 backdrop-blur-md border-t border-gray-800 py-3 flex items-center justify-center gap-6">
      <button
        onClick={onToggle}
        className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-2 rounded-lg"
      >
        {isRunning ? "Pause" : "Start"}
      </button>

      <div className="flex items-center gap-3">
        <label className="text-gray-300 text-sm">Speed</label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
        <span className="text-gray-400 text-sm">{speed}x</span>
      </div>

      <button
        onClick={onOpenSettings}
        className="text-gray-300 hover:text-white p-2"
      >
        <Settings size={22} />
      </button>
    </div>
  );
}
