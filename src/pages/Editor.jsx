import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useScript } from "../context/ScriptContext";

export default function Editor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    scrollSpeed,
    setScrollSpeed,
    mirrorHorizontal,
    setMirrorHorizontal,
    mirrorVertical,
    setMirrorVertical,
    setScriptText,
    scriptText,
  } = useScript();

  const [title, setTitle] = useState("Untitled Script");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("scripts") || "[]");
    const current = saved.find((s) => s.id === Number(id));
    if (current) {
      setTitle(current.title);
      setScriptText(current.content);
    }
  }, [id]);

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem("scripts") || "[]");
    const updated = saved.map((s) =>
      s.id === Number(id)
        ? { ...s, title, content: scriptText, updated: new Date().toISOString() }
        : s
    );
    localStorage.setItem("scripts", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6 py-10 gap-6">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Script title"
        className="w-full max-w-3xl p-2 text-xl text-center bg-transparent border-b border-gray-700 focus:outline-none focus:border-pink-600"
      />

      <textarea
        value={scriptText}
        onChange={(e) => setScriptText(e.target.value)}
        onBlur={handleSave}
        className="w-full max-w-3xl h-80 p-4 bg-gray-900 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-600"
        placeholder="Type or paste your script here..."
      />

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div>
          <label className="block text-sm mb-1 text-gray-300">Scroll speed</label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={scrollSpeed}
            onChange={(e) => setScrollSpeed(Number(e.target.value))}
          />
          <span className="ml-2 text-gray-400">{scrollSpeed}x</span>
        </div>

        <div className="flex gap-4 text-gray-300">
          <label>
            <input
              type="checkbox"
              checked={mirrorHorizontal}
              onChange={() => setMirrorHorizontal(!mirrorHorizontal)}
              className="mr-2"
            />
            Mirror Horizontally
          </label>

          <label>
            <input
              type="checkbox"
              checked={mirrorVertical}
              onChange={() => setMirrorVertical(!mirrorVertical)}
              className="mr-2"
            />
            Mirror Vertically
          </label>
        </div>
      </div>

      <button
        onClick={() => navigate("/prompter")}
        className="bg-pink-600 hover:bg-pink-700 px-8 py-3 rounded-lg text-lg font-semibold mt-6"
      >
        Start Prompter
      </button>
    </div>
  );
}
