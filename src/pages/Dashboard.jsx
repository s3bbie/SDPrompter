import { useEffect, useState } from "react";
import { Plus, Wifi } from "lucide-react";
import ScriptEditor from "../components/ScriptEditor";
import TeleprompterPlayer from "../components/TeleprompterPlayer";

export default function Dashboard() {
  const [scripts, setScripts] = useState([]);
  const [activeScript, setActiveScript] = useState(null);
  const [mode, setMode] = useState("dashboard"); // "dashboard" | "editor" | "player"

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("scripts") || "[]");
    setScripts(saved);
  }, []);

  const saveScripts = (updated) => {
    setScripts(updated);
    localStorage.setItem("scripts", JSON.stringify(updated));
  };

  const handleSave = (updatedScript) => {
    const updated = scripts.map((s) =>
      s.id === updatedScript.id ? updatedScript : s
    );
    saveScripts(updated);
  };

  const handleNew = () => {
    const newScript = {
      id: Date.now(),
      title: "Untitled Script",
      content: "",
      updated: new Date().toISOString(),
    };
    const updated = [...scripts, newScript];
    saveScripts(updated);
    setActiveScript(newScript);
    setMode("editor");
  };

  const handleEdit = (script) => {
    setActiveScript(script);
    setMode("editor");
  };

  const handleDoneEditing = () => setMode("player");
  const handleExitPlayer = () => setMode("dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {mode === "dashboard" && (
        <>
          <header className="flex justify-between items-center px-10 pt-8">
            <h1 className="text-4xl font-semibold tracking-tight">My Scripts</h1>
            <div className="flex gap-3">
              <button className="bg-gray-800 hover:bg-gray-700 rounded-full p-2">
                <Wifi size={20} />
              </button>
              <button
                onClick={handleNew}
                className="bg-pink-600 hover:bg-pink-700 rounded-full p-2"
              >
                <Plus size={20} />
              </button>
            </div>
          </header>

          <main className="flex-1 px-10 py-8">
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {scripts.map((script) => (
                <div
                  key={script.id}
                  onClick={() => handleEdit(script)}
                  className="bg-[#1a1a1a] hover:bg-[#242424] transition rounded-2xl p-4 flex flex-col justify-between cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                >
                  <div>
                    <h2 className="text-lg font-medium truncate mb-1">
                      {script.title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {script.content || "No content yet"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      )}

      {mode === "editor" && activeScript && (
        <ScriptEditor
          script={activeScript}
          onSave={handleSave}
          onDone={handleDoneEditing}
        />
      )}

      {mode === "player" && activeScript && (
        <TeleprompterPlayer  script={activeScript}  onExit={handleExitPlayer}  onSave={handleSave} />

      )}
    </div>
  );
}
